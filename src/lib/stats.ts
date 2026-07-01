import type { Character, DerivedStats, Item, ItemStatEffect, Rarity, StatKey } from '../types';
import { CLASSES } from '../data/classes';

// ============================================================================
// Sistema de sources — rastreia DE ONDE cada stat derivado vem
// ============================================================================

/**
 * Tone define a cor da label da fonte. Específico o suficiente pra cada caso:
 * - 'class' = neutro/ink (base da classe)
 * - 'attr-forca' / 'attr-agi' / 'attr-int' = cor do atributo (vermelho/verde/azul)
 * - 'item-{rarity}' = cor da raridade do item (cinza/azul/khaki/laranja/lavanda)
 * - 'base' = base universal (ink-muted italic)
 */
export type StatSourceTone =
  | 'class'
  | 'attr-forca' | 'attr-agi' | 'attr-int'
  | 'item-comum' | 'item-magico' | 'item-raro' | 'item-unico' | 'item-lendario'
  | 'base';

export interface StatSource {
  label: string;
  value: number;
  /** Pra fontes com range (ex: arma "1 a 2 de Dano Físico"). Se ausente, valor é flat. */
  max?: number;
  tone?: StatSourceTone;
  /** Quando true, a fonte NÃO é removida do breakdown mesmo se value=max=0.
   *  Usar pra mostrar contribuições que existem mas arredondaram pra 0
   *  (ex: "Força (+8% mult.)" em um dano base 1–2 onde 1.08→1 elimina o delta). */
  keepZero?: boolean;
}

export type StatBreakdown = Partial<Record<keyof DerivedStats, StatSource[]>>;

/** Cap compartilhado de redução % (eficiência de mana, tempo de conjuração). */
export const PCT_REDUCTION_CAP = 95;

/** Custo de mana após Eficiência de Mana (% de redução, cap 95%). Mínimo 1. */
export function effectiveManaCost(baseCost: number, eficienciaPct: number): number {
  const reduction = Math.min(eficienciaPct, PCT_REDUCTION_CAP) / 100;
  return Math.max(1, Math.round(baseCost * (1 - reduction)));
}

/** Tempo de conjuração após Redução do Tempo de Conjuração (cap 95% → mín. 5% do base). */
export function effectiveCastTime(baseSeconds: number, reducaoPct: number): number {
  const reduction = Math.min(reducaoPct, PCT_REDUCTION_CAP) / 100;
  return baseSeconds * Math.max(0.05, 1 - reduction);
}

export interface DerivedStatsResult {
  stats: DerivedStats;
  sources: StatBreakdown;
}

// ============================================================================
// Helpers internos
// ============================================================================

function classLabel(cls: Character['classKey']): string {
  return cls === 'guerreiro' ? 'Guerreiro' : cls === 'ladino' ? 'Ladino' : 'Mago';
}

interface ItemContribution {
  itemName: string;
  itemRarity: Rarity;
  /** 'base' = stat inerente da base do item; 'prefix'/'suffix' = afixo rolado */
  kind: 'base' | 'prefix' | 'suffix';
  effect: ItemStatEffect;
}

function collectContribs(equipped: Record<string, Item | null>): ItemContribution[] {
  const out: ItemContribution[] = [];
  for (const item of Object.values(equipped)) {
    if (!item?.stats) continue;
    for (const stat of item.stats) {
      if (!stat.effect) continue;
      out.push({
        itemName: item.name,
        itemRarity: item.rarity,
        kind: stat.kind ?? 'base',
        effect: stat.effect,
      });
    }
  }
  return out;
}

const rarityTone = (r: Rarity): StatSourceTone => `item-${r}` as StatSourceTone;

/** Constrói sources pra todos os itens que contribuem com `key`. Inclui `max`
 *  quando o effect carrega range (ex: arma "1 a 2 Dano Físico"). */
function itemSources(contribs: ItemContribution[], key: StatKey): StatSource[] {
  return contribs
    .filter((c) => c.effect.key === key)
    .map((c) => ({
      label: c.itemName + (c.kind === 'prefix' ? ' (prefixo)' : c.kind === 'suffix' ? ' (sufixo)' : ''),
      value: c.effect.value,
      max: c.effect.max,
      tone: rarityTone(c.itemRarity),
    }));
}

/** Soma `value` de uma lista de sources — usado pra fechar o total. */
const sumSources = (s: StatSource[]) => s.reduce((acc, x) => acc + x.value, 0);

// ============================================================================
// Compute principal — retorna stats + sources
// ============================================================================

export function computeDerivedStatsWithSources(c: Character): DerivedStatsResult {
  const cls = c.classKey;
  const contribs = collectContribs(c.equipped);
  const sources: StatBreakdown = {};

  // ────────────────────────────────────────────────────────────────
  // Atributos finais (base + flat-* de itens)
  // ────────────────────────────────────────────────────────────────
  // "Todos os Atributos" (ex: Amuleto de Ônix) soma em Força, Agilidade e Intelecto.
  const todosAtributos = itemSources(contribs, 'flat-todos-atributos');

  sources.forca = [
    { label: 'Base', value: c.forca, tone: 'attr-forca' },
    ...itemSources(contribs, 'flat-forca'),
    ...todosAtributos,
  ];
  const f = sumSources(sources.forca);

  sources.agilidade = [
    { label: 'Base', value: c.agilidade, tone: 'attr-agi' },
    ...itemSources(contribs, 'flat-agilidade'),
    ...todosAtributos,
  ];
  const a = sumSources(sources.agilidade);

  sources.intelecto = [
    { label: 'Base', value: c.intelecto, tone: 'attr-int' },
    ...itemSources(contribs, 'flat-intelecto'),
    ...todosAtributos,
  ];
  const i = sumSources(sources.intelecto);

  // ────────────────────────────────────────────────────────────────
  // Vida e Mana Máximas — class base + atributo + itens
  // ────────────────────────────────────────────────────────────────
  const classDef = CLASSES[cls];
  sources.vidaMax = [
    { label: `Classe (${classLabel(cls)})`, value: classDef.vida, tone: 'class' },
    ...itemSources(contribs, 'flat-vida'),
  ];
  const vidaMax = sumSources(sources.vidaMax);

  // Intelecto contribui +5 de Mana Máxima por ponto (+ itens com flat-mana).
  sources.manaMax = [
    { label: `Intelecto (${i} × 5)`, value: i * 5, tone: 'attr-int', keepZero: true },
    ...itemSources(contribs, 'flat-mana'),
  ];
  const manaMax = sumSources(sources.manaMax);

  // ────────────────────────────────────────────────────────────────
  // Defesa — todas as bases agora começam em 0; ganhos vêm de itens/atributos
  // ────────────────────────────────────────────────────────────────
  sources.armadura = [
    ...itemSources(contribs, 'flat-armadura'),
  ];
  const armadura = sumSources(sources.armadura);

  sources.evasao = [
    { label: `Agilidade (${a} × 2)`, value: a * 2, tone: 'attr-agi' },
    ...itemSources(contribs, 'flat-evasao'),
  ];
  const evasao = sumSources(sources.evasao);

  // Escudo de Energia — buffer arcano; por ora vem só de itens.
  sources.escudoEnergia = [
    ...itemSources(contribs, 'flat-escudo-energia'),
  ];
  const escudoEnergia = sumSources(sources.escudoEnergia);

  const hasShield = c.equipped.escudo != null;
  const blockMax = 75;
  if (hasShield) {
    sources.bloqueio = itemSources(contribs, 'pct-bloqueio');
  } else {
    sources.bloqueio = [{ label: 'Sem escudo equipado', value: 0, tone: 'base', keepZero: true }];
  }
  const bloqueio = hasShield ? Math.min(blockMax, sumSources(sources.bloqueio)) : 0;

  // ────────────────────────────────────────────────────────────────
  // Resistências (cap 75)
  // ────────────────────────────────────────────────────────────────
  const resistMax = 75;
  sources.resFogo = itemSources(contribs, 'pct-res-fogo');
  const resFogo = Math.min(resistMax, sumSources(sources.resFogo));
  sources.resGelo = itemSources(contribs, 'pct-res-gelo');
  const resGelo = Math.min(resistMax, sumSources(sources.resGelo));
  sources.resRaio = itemSources(contribs, 'pct-res-raio');
  const resRaio = Math.min(resistMax, sumSources(sources.resRaio));
  sources.resCaos = itemSources(contribs, 'pct-res-caos');
  const resCaos = Math.min(resistMax, sumSources(sources.resCaos));
  sources.resSagrado = itemSources(contribs, 'pct-res-sagrado');
  const resSagrado = Math.min(resistMax, sumSources(sources.resSagrado));

  sources.resFisico = itemSources(contribs, 'pct-res-fisica');
  const resFisico = Math.min(resistMax, sumSources(sources.resFisico));

  // ────────────────────────────────────────────────────────────────
  // Dano Físico (arma equipada substitui defaults de unarmed)
  // ────────────────────────────────────────────────────────────────
  const hasWeapon = c.equipped.arma != null;
  const dmgFisContribs = contribs.filter((c) => c.effect.key === 'flat-dmg-fis');

  let baseFisMin: number;
  let baseFisMax: number;
  const dmgFisSourcesMin: StatSource[] = [];

  if (hasWeapon) {
    for (const cc of dmgFisContribs) {
      const min = cc.effect.value;
      const max = cc.effect.max ?? cc.effect.value;
      const label = cc.itemName + (cc.kind === 'prefix' ? ' (prefixo)' : cc.kind === 'suffix' ? ' (sufixo)' : '');
      dmgFisSourcesMin.push({
        label,
        value: min,
        max,
        tone: rarityTone(cc.itemRarity),
      });
    }
    baseFisMin = dmgFisContribs.reduce((s, cc) => s + cc.effect.value, 0);
    baseFisMax = dmgFisContribs.reduce((s, cc) => s + (cc.effect.max ?? cc.effect.value), 0);
  } else {
    // Desarmado: 1 a 1 uniformemente — ganho real vem de equipar uma arma
    const base: [number, number] = [1, 1];
    dmgFisSourcesMin.push({
      label: `Desarmado`,
      value: base[0],
      max: base[1],
      tone: 'class',
    });
    baseFisMin = base[0];
    baseFisMax = base[1];
  }
  // Força aplica multiplicador percentual MULTIPLICATIVO no Dano Físico:
  // cada ponto de Força = +1% no min E no max do dano. Mostrado como
  // delta absoluto no breakdown (diferença entre base e final). A linha é
  // SEMPRE renderizada quando f > 0 — mesmo que o delta arredonde pra 0
  // (ex: 1×1.08 ≈ 1), pra deixar visível que o multiplicador está sendo
  // aplicado. O Total fica coerente com o range exibido fora do tooltip.
  const forcaMult = 1 + f / 100;
  const danoFisicoMin = Math.round(baseFisMin * forcaMult);
  const danoFisicoMax = Math.round(baseFisMax * forcaMult);
  const deltaForcaMin = danoFisicoMin - baseFisMin;
  const deltaForcaMax = danoFisicoMax - baseFisMax;
  if (f > 0) {
    dmgFisSourcesMin.push({
      label: `Força (+${f}% mult.)`,
      value: deltaForcaMin,
      max: deltaForcaMax,
      tone: 'attr-forca',
      keepZero: true, // sempre visível, mesmo quando arredonda pra 0
    });
  }
  sources.danoFisicoMin = dmgFisSourcesMin;
  sources.danoFisicoMax = dmgFisSourcesMin;

  // ────────────────────────────────────────────────────────────────
  // Velocidade de Ataque (base × (1 + pct/100) + modAgi)
  // ────────────────────────────────────────────────────────────────
  const baseAtkSpeed = hasWeapon
    ? (dmgFisContribs.length > 0 ? contribs.find((c) => c.effect.key === 'weapon-speed')?.effect.value ?? 0 : 0)
    : (cls === 'ladino' ? 1.6 : cls === 'guerreiro' ? 1.0 : 0.8);
  const weaponSpeedContribs = contribs.filter((c) => c.effect.key === 'weapon-speed');

  const pctAtkSpeedSources = itemSources(contribs, 'pct-vel-ataque');
  const pctAtkSpeed = sumSources(pctAtkSpeedSources);
  const agiAtkMod = (a - 10) * 0.02;

  const weaponSpeedItem = weaponSpeedContribs[0];
  sources.velAtaque = [
    hasWeapon && weaponSpeedItem
      ? { label: weaponSpeedItem.itemName, value: weaponSpeedItem.effect.value, tone: rarityTone(weaponSpeedItem.itemRarity) }
      : { label: `Desarmado (${classLabel(cls)})`, value: baseAtkSpeed, tone: 'class' as StatSourceTone },
    // Cada bônus % vira contribuição efetiva: base × (% / 100) — preserva tone do item
    ...pctAtkSpeedSources.map((s) => ({
      label: s.label + ` (+${s.value}%)`,
      value: baseAtkSpeed * (s.value / 100),
      tone: s.tone,
    })),
    ...(agiAtkMod !== 0 ? [{ label: `Agilidade ((${a} - 10) × 0.02)`, value: agiAtkMod, tone: 'attr-agi' as StatSourceTone }] : []),
  ];
  const velAtaque = baseAtkSpeed * (1 + pctAtkSpeed / 100) + agiAtkMod;

  // ────────────────────────────────────────────────────────────────
  // Crítico
  // ────────────────────────────────────────────────────────────────
  const weaponCritContribs = contribs.filter((c) => c.effect.key === 'weapon-crit-base');
  const agiCritMod = Math.max(0, a - 10) * 0.4;
  const pctCritSources = itemSources(contribs, 'pct-crit-chance');

  const weaponCritItem = weaponCritContribs[0];
  sources.chanceCritico = [
    hasWeapon && weaponCritItem
      ? { label: weaponCritItem.itemName, value: weaponCritItem.effect.value, tone: rarityTone(weaponCritItem.itemRarity) }
      : { label: `Base universal`, value: hasWeapon ? 0 : 5, tone: 'base' as StatSourceTone },
    ...(agiCritMod > 0 ? [{ label: `Agilidade ((${a} - 10) × 0.4)`, value: agiCritMod, tone: 'attr-agi' as StatSourceTone }] : []),
    ...pctCritSources,
  ];
  const chanceCritico = Math.min(100, sumSources(sources.chanceCritico));

  const multBaseLadino = cls === 'ladino' ? 0.2 : 0;
  const pctMultCritSources = itemSources(contribs, 'pct-crit-mult');
  sources.multCritico = [
    { label: 'Base universal', value: 1.5, tone: 'base' },
    ...(multBaseLadino > 0 ? [{ label: `Classe (Ladino)`, value: multBaseLadino, tone: 'class' as StatSourceTone }] : []),
    ...pctMultCritSources.map((s) => ({ label: s.label + ` (+${s.value}%)`, value: s.value / 100, tone: s.tone })),
  ];
  const multCritico = sumSources(sources.multCritico);

  // ────────────────────────────────────────────────────────────────
  // Dano elemental adicional (flat) — ataques não-magia; soma por golpe que conecta
  // ────────────────────────────────────────────────────────────────
  sources.danoFogo = itemSources(contribs, 'flat-dmg-fogo');
  const danoFogo = sumSources(sources.danoFogo);

  sources.danoGelo = itemSources(contribs, 'flat-dmg-gelo');
  const danoGelo = sumSources(sources.danoGelo);

  sources.danoRaio = itemSources(contribs, 'flat-dmg-raio');
  const danoRaio = sumSources(sources.danoRaio);

  sources.danoCaos = itemSources(contribs, 'flat-dmg-caos');
  const danoCaos = sumSources(sources.danoCaos);

  sources.danoSagrado = itemSources(contribs, 'flat-dmg-sagrado');
  const danoSagrado = sumSources(sources.danoSagrado);

  // ────────────────────────────────────────────────────────────────
  // Penetrações
  // ────────────────────────────────────────────────────────────────
  sources.penFogo = itemSources(contribs, 'pct-pen-fogo');
  const penFogo = sumSources(sources.penFogo);
  sources.penGelo = itemSources(contribs, 'pct-pen-gelo');
  const penGelo = sumSources(sources.penGelo);
  sources.penRaio = itemSources(contribs, 'pct-pen-raio');
  const penRaio = sumSources(sources.penRaio);
  sources.penCaos = itemSources(contribs, 'pct-pen-caos');
  const penCaos = sumSources(sources.penCaos);
  sources.penSagrado = itemSources(contribs, 'pct-pen-sagrado');
  const penSagrado = sumSources(sources.penSagrado);

  // ────────────────────────────────────────────────────────────────
  // Dano Total + DPS (compõe os de cima)
  // ────────────────────────────────────────────────────────────────
  const elementalSum = danoFogo + danoGelo + danoRaio + danoCaos + danoSagrado;
  const danoTotalMin = danoFisicoMin + elementalSum;
  const danoTotalMax = danoFisicoMax + elementalSum;
  // Sources de total mostram só físico + cada elemental como entrada.
  // Físico é range (min–max) — passa value+max pra UI renderizar "+a–b"
  // e o Total da breakdown também ficar em range automaticamente.
  sources.danoTotalMin = [
    { label: 'Físico', value: danoFisicoMin, max: danoFisicoMax, tone: 'base' },
    ...(danoFogo > 0 ? [{ label: 'Fogo', value: danoFogo, tone: 'base' as StatSourceTone }] : []),
    ...(danoGelo > 0 ? [{ label: 'Gelo', value: danoGelo, tone: 'base' as StatSourceTone }] : []),
    ...(danoRaio > 0 ? [{ label: 'Raio', value: danoRaio, tone: 'base' as StatSourceTone }] : []),
    ...(danoCaos > 0 ? [{ label: 'Caos', value: danoCaos, tone: 'base' as StatSourceTone }] : []),
    ...(danoSagrado > 0 ? [{ label: 'Sagrado', value: danoSagrado, tone: 'base' as StatSourceTone }] : []),
  ];
  sources.danoTotalMax = sources.danoTotalMin;

  const danoMedio = (danoTotalMin + danoTotalMax) / 2;
  const dps = danoMedio * velAtaque * (1 + (chanceCritico / 100) * (multCritico - 1));
  sources.dps = [
    { label: `Dano médio × Vel × (1 + Crit × (Mult-1))`, value: dps, tone: 'base' },
  ];

  // ────────────────────────────────────────────────────────────────
  // Magia — % a magias (não soma em ataques físicos)
  // ────────────────────────────────────────────────────────────────
  sources.pctDmgMagia = itemSources(contribs, 'pct-dmg-magia');
  const pctDmgMagia = sumSources(sources.pctDmgMagia);
  sources.pctDmgFogoMagia = itemSources(contribs, 'pct-dmg-fogo-magia');
  const pctDmgFogoMagia = sumSources(sources.pctDmgFogoMagia);
  sources.pctDmgGeloMagia = itemSources(contribs, 'pct-dmg-gelo-magia');
  const pctDmgGeloMagia = sumSources(sources.pctDmgGeloMagia);
  sources.pctDmgRaioMagia = itemSources(contribs, 'pct-dmg-raio-magia');
  const pctDmgRaioMagia = sumSources(sources.pctDmgRaioMagia);
  sources.pctDmgCaosMagia = itemSources(contribs, 'pct-dmg-caos-magia');
  const pctDmgCaosMagia = sumSources(sources.pctDmgCaosMagia);
  sources.pctDmgSagradoMagia = itemSources(contribs, 'pct-dmg-sagrado-magia');
  const pctDmgSagradoMagia = sumSources(sources.pctDmgSagradoMagia);

  sources.reducaoTempoConjuracao = itemSources(contribs, 'pct-red-tempo-conjuracao');
  const reducaoTempoConjuracao = Math.min(
    PCT_REDUCTION_CAP,
    sumSources(sources.reducaoTempoConjuracao),
  );

  sources.eficienciaMana = itemSources(contribs, 'pct-eficiencia-mana');
  const eficienciaMana = Math.min(PCT_REDUCTION_CAP, sumSources(sources.eficienciaMana));

  // ────────────────────────────────────────────────────────────────
  // Regeneração — zero base, só itens. Por segundo (tick 1s fora do combate;
  // no combate por turnos cada round = 1s até migrarmos para tempo real).
  // ────────────────────────────────────────────────────────────────
  sources.regenVida = itemSources(contribs, 'flat-regen-vida');
  const regenVida = sumSources(sources.regenVida);

  sources.regenMana = itemSources(contribs, 'flat-regen-mana');
  const regenMana = sumSources(sources.regenMana);

  sources.rouboVida = itemSources(contribs, 'pct-roubo-vida');
  const rouboVida = sumSources(sources.rouboVida);
  sources.rouboMana = itemSources(contribs, 'pct-roubo-mana');
  const rouboMana = sumSources(sources.rouboMana);

  // ────────────────────────────────────────────────────────────────
  // Precisão
  // ────────────────────────────────────────────────────────────────
  const acertoBase = cls === 'ladino' ? 12 : cls === 'guerreiro' ? 8 : 6;
  sources.acerto = [
    { label: `Classe (${classLabel(cls)})`, value: acertoBase, tone: 'class' },
    { label: `Agilidade (${a} × 1.5)`, value: Math.floor(a * 1.5), tone: 'attr-agi' },
    ...itemSources(contribs, 'flat-acerto'),
  ];
  const acerto = sumSources(sources.acerto);

  // ────────────────────────────────────────────────────────────────
  // Empacota
  // ────────────────────────────────────────────────────────────────
  const stats: DerivedStats = {
    forca: f,
    agilidade: a,
    intelecto: i,
    vidaMax,
    manaMax,
    armadura,
    evasao,
    escudoEnergia,
    bloqueio,
    blockMax,
    resistMax,
    resFogo,
    resGelo,
    resRaio,
    resCaos,
    resFisico,
    danoFisicoMin,
    danoFisicoMax,
    danoTotalMin,
    danoTotalMax,
    velAtaque,
    chanceCritico,
    multCritico,
    dps,
    danoFogo,
    danoGelo,
    danoRaio,
    penFogo,
    penGelo,
    penRaio,
    danoCaos,
    penCaos,
    danoSagrado,
    resSagrado,
    penSagrado,
    pctDmgMagia,
    pctDmgFogoMagia,
    pctDmgGeloMagia,
    pctDmgRaioMagia,
    pctDmgCaosMagia,
    pctDmgSagradoMagia,
    reducaoTempoConjuracao,
    eficienciaMana,
    regenVida,
    regenMana,
    rouboVida,
    rouboMana,
    acerto,
  };

  // Filtra fontes que contribuem com 0 (sem range também) — evita "+0" como ruído.
  // Mantém entries com range mesmo se min=0 (ex: "+0 a 3" ainda é informativo).
  for (const k of Object.keys(sources) as (keyof StatBreakdown)[]) {
    const arr = sources[k];
    if (arr) {
      sources[k] = arr.filter((s) => s.keepZero || s.value !== 0 || (s.max !== undefined && s.max !== 0));
    }
  }

  return { stats, sources };
}

/** Wrapper retrocompatível — descarta sources, retorna só os valores derivados. */
export function computeDerivedStats(c: Character): DerivedStats {
  return computeDerivedStatsWithSources(c).stats;
}

/** Aplica 1 segundo de regeneração (vida/mana dos derivados). */
export function applyRegenTick(c: Character): Character {
  const d = computeDerivedStats(c);
  if (d.regenVida === 0 && d.regenMana === 0) return c;
  if (c.vidaAtual >= d.vidaMax && c.manaAtual >= d.manaMax) return c;
  return {
    ...c,
    vidaAtual: Math.min(c.vidaAtual + d.regenVida, d.vidaMax),
    manaAtual: Math.min(c.manaAtual + d.regenMana, d.manaMax),
  };
}
