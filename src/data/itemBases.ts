import type { Item, ItemSlot, ItemStat, StatKey, ModColor } from '../types';
import type { ElementKey } from './spells';

/**
 * "Base" de item — define a categoria do equipamento e os stats inerentes
 * que aparecem em qualquer tier (Comum, Mágico, Raro). Esses stats não são
 * afixos rolados — são parte do que o item *é*.
 *
 * Cada baseStats traz `effect` numérico (alimenta `computeDerivedStats`) e
 * `text` (display no tooltip). Quando o item é equipado, os efeitos viram
 * bônus reais na ficha.
 */
/**
 * Tipo de arma — usado pra agrupar bases por classe (estilo Path of Exile).
 * Cada classe tem sua própria progressão de bases ao longo dos níveis.
 */
export type WeaponType =
  | 'espada-uma-mao'
  | 'espada-duas-maos'
  | 'machado-uma-mao'
  | 'machado-duas-maos'
  | 'maca-uma-mao'
  | 'maca-duas-maos'
  | 'adaga-uma-mao'
  | 'lanca'
  | 'alabarda'
  | 'foice'
  | 'arco'
  | 'besta'
  | 'cajado'
  | 'varinha'
  | 'cetro';

export const WEAPON_TYPE_LABEL: Record<WeaponType, string> = {
  'espada-uma-mao': 'Espadas de Uma Mão',
  'espada-duas-maos': 'Espadas de Duas Mãos',
  'machado-uma-mao': 'Machados de Uma Mão',
  'machado-duas-maos': 'Machados de Duas Mãos',
  'maca-uma-mao': 'Maças de Uma Mão',
  'maca-duas-maos': 'Maças de Duas Mãos',
  'adaga-uma-mao': 'Adagas',
  'lanca': 'Lanças',
  'alabarda': 'Alabardas',
  'foice': 'Foices',
  'arco': 'Arcos',
  'besta': 'Bestas',
  'cajado': 'Cajados',
  'varinha': 'Varinhas',
  'cetro': 'Cetros',
};

/** Tipo de aljava (off-hand de arqueiro) — cada base tem um implícito próprio. */
export type AljavaType =
  | 'dano-fisico'
  | 'critico'
  | 'vida'
  | 'vel-ataque';

export const ALJAVA_TYPE_LABEL: Record<AljavaType, string> = {
  'dano-fisico': 'Dano Físico',
  'critico': 'Chance de Crítico',
  'vida': 'Vida',
  'vel-ataque': 'Velocidade de Ataque',
};

/**
 * Tipo defensivo de uma peça de armadura (inspirado no Path of Exile):
 * 3 puros (Armadura, Evasão, Escudo de Energia) + 3 híbridos.
 */
export type ArmorType =
  | 'armadura'
  | 'evasao'
  | 'escudo-energia'
  | 'armadura-evasao'
  | 'armadura-energia'
  | 'evasao-energia';

export const ARMOR_TYPE_LABEL: Record<ArmorType, string> = {
  'armadura': 'Armadura',
  'evasao': 'Evasão',
  'escudo-energia': 'Escudo de Energia',
  'armadura-evasao': 'Armadura / Evasão',
  'armadura-energia': 'Armadura / Escudo de Energia',
  'evasao-energia': 'Evasão / Escudo de Energia',
};

/**
 * Tipo de cinto (inspirado no PoE): diferente das armaduras, cada base de cinto
 * concede um IMPLÍCITO próprio (Vida, Força, Armadura, etc.) em vez de defesa
 * armadura/evasão/ES. Agrupa e define o stat da base.
 */
export type BeltType =
  | 'vida'
  | 'mana'
  | 'forca'
  | 'armadura'
  | 'escudo-energia'
  | 'dano-fisico';

export const BELT_TYPE_LABEL: Record<BeltType, string> = {
  'vida': 'Vida',
  'mana': 'Mana',
  'forca': 'Força',
  'armadura': 'Armadura',
  'escudo-energia': 'Escudo de Energia',
  'dano-fisico': 'Dano Físico',
};

/** Tipo de anel (estilo PoE) — cada base tem um implícito próprio. */
export type RingType =
  | 'vida'
  | 'mana'
  | 'res-fogo'
  | 'res-gelo'
  | 'res-raio'
  | 'res-caos'
  | 'dano-fisico';

export const RING_TYPE_LABEL: Record<RingType, string> = {
  'vida': 'Vida',
  'mana': 'Mana',
  'res-fogo': 'Resistência ao Fogo',
  'res-gelo': 'Resistência ao Gelo',
  'res-raio': 'Resistência ao Raio',
  'res-caos': 'Resistência ao Caos',
  'dano-fisico': 'Dano Físico',
};

/** Tipo de amuleto (estilo PoE) — foco em atributos, vida/mana e ES. */
export type AmuletType =
  | 'vida'
  | 'mana'
  | 'forca'
  | 'agilidade'
  | 'intelecto'
  | 'todos-atributos'
  | 'escudo-energia';

export const AMULET_TYPE_LABEL: Record<AmuletType, string> = {
  'vida': 'Vida',
  'mana': 'Mana',
  'forca': 'Força',
  'agilidade': 'Agilidade',
  'intelecto': 'Intelecto',
  'todos-atributos': 'Todos os Atributos',
  'escudo-energia': 'Escudo de Energia',
};

export interface ItemBase {
  id: string;
  name: string;
  slot: ItemSlot;
  /** Classe da arma (só pra slot 'arma') — define agrupamento e progressão. */
  weaponType?: WeaponType;
  /** Tipo defensivo (só pra armaduras) — define agrupamento e stats. */
  armorType?: ArmorType;
  /** Tipo de cinto — define o implícito e o agrupamento. */
  beltType?: BeltType;
  /** Tipo de anel — define o implícito e o agrupamento. */
  ringType?: RingType;
  /** Tipo de amuleto — define o implícito e o agrupamento. */
  amuletType?: AmuletType;
  /** Tipo de aljava — define o implícito e o agrupamento. */
  aljavaType?: AljavaType;
  /** Nível requerido para usar a base. Bases não têm um por nível — há lacunas. */
  reqLevel?: number;
  /** Magia do ataque básico (Mago) — ex: cajado concede Bola de Fogo */
  grantedSpellId?: string;
  /** Magia de invocação concedida (cetros) — ver data/summons.ts. Não é ataque básico. */
  grantedSummonId?: string;
  /** Stats inerentes — sempre visíveis no tooltip, independente do tier */
  baseStats: ItemStat[];
  /** Descrição opcional (flavor) — itálico no rodapé do tooltip */
  description?: string;
}

type DpsClass = '1h' | '2h';

/**
 * Curva de DPS-alvo por nível requerido (~4.6%/nível). Bases de duas mãos têm
 * DPS maior, pois não dividem espaço com escudo/segunda arma.
 *
 * O dano por golpe é derivado do DPS e da velocidade: pro mesmo DPS, armas mais
 * lentas (machados) batem mais forte por golpe — identidade orgânica entre
 * classes sem precisar ajustar número a número. O crítico base é sempre 5%.
 */
function rolledDamage(
  reqLevel: number | undefined,
  aps: number,
  cls: DpsClass,
): { min: number; max: number } {
  const L = reqLevel ?? 1;
  const dps1h = 5.5 * Math.pow(1.046, L);
  const dps = cls === '2h' ? dps1h * 1.28 : dps1h;
  const avg = dps / aps;
  const spread = cls === '2h' ? 0.3 : 0.25;
  const min = Math.max(1, Math.round(avg * (1 - spread)));
  const max = Math.max(min + 1, Math.round(avg * (1 + spread)));
  return { min, max };
}

/**
 * Monta uma base de arma corpo-a-corpo. O dano é calculado da curva de DPS
 * (ver `rolledDamage`); só declaramos velocidade, nível requerido e classe.
 */
function weapon(spec: {
  id: string;
  name: string;
  weaponType: WeaponType;
  cls: DpsClass;
  aps: number;
  /** Omitido na base inicial de cada classe — sem requisito de nível. */
  reqLevel?: number;
  description?: string;
}): ItemBase {
  const { min, max } = rolledDamage(spec.reqLevel, spec.aps, spec.cls);
  return {
    id: spec.id,
    name: spec.name,
    slot: 'arma',
    weaponType: spec.weaponType,
    reqLevel: spec.reqLevel,
    baseStats: [
      {
        text: `${min} a ${max} de Dano Físico`,
        color: 'fisico',
        effect: { key: 'flat-dmg-fis', value: min, max },
      },
      { text: `${spec.aps}/s de Velocidade de Ataque`, color: 'agilidade', effect: { key: 'weapon-speed', value: spec.aps } },
      { text: '5% de Chance de Crítico', color: 'critico', effect: { key: 'weapon-crit-base', value: 5 } },
    ],
    description: spec.description,
  };
}

/**
 * Monta uma base de arma mágica (cajado). Armas mágicas NÃO têm dano físico
 * base — elas concedem uma magia (skill), que é o ataque básico do conjurador.
 * O dano real vem da magia (ver `data/spells.ts`).
 */
function magicWeapon(spec: {
  id: string;
  name: string;
  weaponType: WeaponType;
  /** id da magia concedida (registro em SPELLS). */
  grantedSpellId: string;
  /** Nome da magia exibido no tooltip/card. */
  spellName: string;
  /** Elemento da magia — define a cor do texto "Concede:". */
  element: ElementKey;
  reqLevel?: number;
  description?: string;
}): ItemBase {
  // Sem Velocidade de Ataque: o que rege a cadência de um cajado é o Tempo de Conjuração
  // da magia concedida (ver tooltip da skill), não a velocidade de ataque física.
  return {
    id: spec.id,
    name: spec.name,
    slot: 'arma',
    weaponType: spec.weaponType,
    reqLevel: spec.reqLevel,
    grantedSpellId: spec.grantedSpellId,
    baseStats: [
      { text: `Concede: ${spec.spellName}`, color: spec.element, kind: 'base' },
      { text: '5% de Chance de Crítico', color: 'critico', effect: { key: 'weapon-crit-base', value: 5 } },
    ],
    description: spec.description,
  };
}

/**
 * Monta uma base de cetro (arma de invocação, uma mão). Sem dano físico; concede
 * uma magia de invocação (ver data/summons.ts). A magia NÃO é ataque básico —
 * é habilidade ativa que custa mana. (Integração com combate vem depois.)
 */
function summonWeapon(spec: {
  id: string;
  name: string;
  grantedSummonId: string;
  /** Nome da magia de invocação exibido no card. */
  summonName: string;
  reqLevel?: number;
  description?: string;
}): ItemBase {
  return {
    id: spec.id,
    name: spec.name,
    slot: 'arma',
    weaponType: 'cetro',
    reqLevel: spec.reqLevel,
    grantedSummonId: spec.grantedSummonId,
    baseStats: [
      { text: `Invoca: ${spec.summonName}`, color: 'caos', kind: 'base' },
      { text: '5% de Chance de Crítico', color: 'critico', effect: { key: 'weapon-crit-base', value: 5 } },
    ],
    description: spec.description,
  };
}

/**
 * Orçamento de defesa por nível/slot. Cresce ~4.5%/nível. `slotMult` ajusta a
 * magnitude por peça (peito é o mais forte; luvas/cinto os menores).
 */
function defenseBudget(reqLevel: number | undefined, slotMult: number): number {
  const L = reqLevel ?? 1;
  return Math.round(15 * slotMult * Math.pow(1.045, L));
}

/**
 * Monta uma base de armadura no esquema PoE. O `armorType` define quais stats
 * defensivos a peça tem; híbridos dividem o orçamento (60% em cada). Cores
 * idênticas às da ficha: Armadura (físico), Evasão (agilidade), Escudo de
 * Energia (energia).
 */
function armorPiece(spec: {
  id: string;
  name: string;
  slot: ItemSlot;
  armorType: ArmorType;
  slotMult: number;
  reqLevel?: number;
  /** Chance de Bloqueio implícita (escudos). */
  block?: number;
  description?: string;
}): ItemBase {
  const budget = defenseBudget(spec.reqLevel, spec.slotMult);
  const hybrid = Math.round(budget * 0.6);
  const stats: ItemStat[] = [];
  const arm = (v: number) => stats.push({ text: `+${v} de Armadura`, color: 'fisico', effect: { key: 'flat-armadura', value: v } });
  const eva = (v: number) => stats.push({ text: `+${v} de Evasão`, color: 'agilidade', effect: { key: 'flat-evasao', value: v } });
  const es = (v: number) => stats.push({ text: `+${v} de Escudo de Energia`, color: 'energia', effect: { key: 'flat-escudo-energia', value: v } });

  switch (spec.armorType) {
    case 'armadura': arm(budget); break;
    case 'evasao': eva(budget); break;
    case 'escudo-energia': es(budget); break;
    case 'armadura-evasao': arm(hybrid); eva(hybrid); break;
    case 'armadura-energia': arm(hybrid); es(hybrid); break;
    case 'evasao-energia': eva(hybrid); es(hybrid); break;
  }

  if (spec.block != null) {
    stats.push({ text: `+${spec.block}% de Chance de Bloqueio`, color: 'fisico', effect: { key: 'pct-bloqueio', value: spec.block } });
  }

  return {
    id: spec.id,
    name: spec.name,
    slot: spec.slot,
    armorType: spec.armorType,
    reqLevel: spec.reqLevel,
    baseStats: stats,
    description: spec.description,
  };
}

/** Chance de Bloqueio base por tipo de escudo (implícito). */
const SHIELD_BLOCK: Record<ArmorType, number> = {
  'armadura': 22,
  'evasao': 15,
  'escudo-energia': 18,
  'armadura-evasao': 20,
  'armadura-energia': 20,
  'evasao-energia': 16,
};

/** Atalho pra montar um escudo (slotMult 0.5 + bloqueio por tipo). */
function shieldPiece(spec: { id: string; name: string; armorType: ArmorType; reqLevel?: number }): ItemBase {
  return armorPiece({ ...spec, slot: 'escudo', slotMult: 0.5, block: SHIELD_BLOCK[spec.armorType] });
}

/** Stat implícito de cada tipo de cinto: chave de efeito, rótulo (= ficha), cor e base de escala. */
const BELT_STATS: Record<BeltType, { key: StatKey; label: string; color: ModColor; base: number }> = {
  'vida': { key: 'flat-vida', label: 'Vida Máxima', color: 'vida', base: 8 },
  'mana': { key: 'flat-mana', label: 'Mana Máxima', color: 'mana', base: 5 },
  'forca': { key: 'flat-forca', label: 'Força', color: 'forca', base: 0.8 },
  'armadura': { key: 'flat-armadura', label: 'Armadura', color: 'fisico', base: 5 },
  'escudo-energia': { key: 'flat-escudo-energia', label: 'Escudo de Energia', color: 'energia', base: 4 },
  'dano-fisico': { key: 'flat-dmg-fis', label: 'Dano Físico', color: 'fisico', base: 0.7 },
};

/**
 * Monta uma base de cinto. O implícito escala com o nível (~4.5%/nível) conforme
 * o tipo. Cinto não tem defesa própria de armadura/evasão/ES — é o implícito que define.
 */
function beltPiece(spec: {
  id: string;
  name: string;
  beltType: BeltType;
  reqLevel?: number;
  description?: string;
}): ItemBase {
  const def = BELT_STATS[spec.beltType];
  const L = spec.reqLevel ?? 1;
  const value = Math.max(1, Math.round(def.base * Math.pow(1.045, L)));
  return {
    id: spec.id,
    name: spec.name,
    slot: 'cinto',
    beltType: spec.beltType,
    reqLevel: spec.reqLevel,
    baseStats: [
      { text: `+${value} de ${def.label}`, color: def.color, effect: { key: def.key, value } },
    ],
    description: spec.description,
  };
}

/**
 * Implícito de cada tipo de anel. `kind: 'flat'` escala geometricamente (Vida,
 * Mana, Dano). `kind: 'pct'` (resistências) escala de forma linear e modesta,
 * já que porcentagens têm teto — não devem explodir com o nível.
 */
const RING_STATS: Record<RingType, { key: StatKey; label: string; color: ModColor; kind: 'flat' | 'pct'; base: number; perLvl?: number; suffix?: string }> = {
  'vida': { key: 'flat-vida', label: 'Vida Máxima', color: 'vida', kind: 'flat', base: 5 },
  'mana': { key: 'flat-mana', label: 'Mana Máxima', color: 'mana', kind: 'flat', base: 4 },
  'dano-fisico': { key: 'flat-dmg-fis', label: 'Dano Físico', color: 'fisico', kind: 'flat', base: 0.5 },
  'res-fogo': { key: 'pct-res-fogo', label: 'Resistência ao Fogo', color: 'fogo', kind: 'pct', base: 6, perLvl: 0.28, suffix: '%' },
  'res-gelo': { key: 'pct-res-gelo', label: 'Resistência ao Gelo', color: 'gelo', kind: 'pct', base: 6, perLvl: 0.28, suffix: '%' },
  'res-raio': { key: 'pct-res-raio', label: 'Resistência ao Raio', color: 'raio', kind: 'pct', base: 6, perLvl: 0.28, suffix: '%' },
  'res-caos': { key: 'pct-res-caos', label: 'Resistência ao Caos', color: 'caos', kind: 'pct', base: 6, perLvl: 0.28, suffix: '%' },
};

/** Monta uma base de anel — implícito conforme o tipo (ver RING_STATS). */
function ringPiece(spec: {
  id: string;
  name: string;
  ringType: RingType;
  reqLevel?: number;
  description?: string;
}): ItemBase {
  const def = RING_STATS[spec.ringType];
  const L = spec.reqLevel ?? 1;
  const value =
    def.kind === 'flat'
      ? Math.max(1, Math.round(def.base * Math.pow(1.045, L)))
      : Math.round(def.base + L * (def.perLvl ?? 0));
  return {
    id: spec.id,
    name: spec.name,
    slot: 'anel',
    ringType: spec.ringType,
    reqLevel: spec.reqLevel,
    baseStats: [
      { text: `+${value}${def.suffix ?? ''} de ${def.label}`, color: def.color, effect: { key: def.key, value } },
    ],
    description: spec.description,
  };
}

/** Implícito de cada tipo de amuleto de stat único (flat, escala geométrica). */
const AMULET_STATS: Record<Exclude<AmuletType, 'todos-atributos'>, { key: StatKey; label: string; color: ModColor; base: number }> = {
  'vida': { key: 'flat-vida', label: 'Vida Máxima', color: 'vida', base: 6 },
  'mana': { key: 'flat-mana', label: 'Mana Máxima', color: 'mana', base: 5 },
  'forca': { key: 'flat-forca', label: 'Força', color: 'forca', base: 1.0 },
  'agilidade': { key: 'flat-agilidade', label: 'Agilidade', color: 'agilidade', base: 1.0 },
  'intelecto': { key: 'flat-intelecto', label: 'Intelecto', color: 'intelecto', base: 1.0 },
  'escudo-energia': { key: 'flat-escudo-energia', label: 'Escudo de Energia', color: 'energia', base: 4 },
};

/** Monta uma base de amuleto — implícito conforme o tipo (ver AMULET_STATS). */
function amuletPiece(spec: {
  id: string;
  name: string;
  amuletType: AmuletType;
  reqLevel?: number;
  description?: string;
}): ItemBase {
  const L = spec.reqLevel ?? 1;

  // Todos os Atributos (tipo Ônix): um único mod que soma em Força, Agilidade e Intelecto.
  if (spec.amuletType === 'todos-atributos') {
    const v = Math.max(1, Math.round(0.6 * Math.pow(1.045, L)));
    return {
      id: spec.id,
      name: spec.name,
      slot: 'amuleto',
      amuletType: spec.amuletType,
      reqLevel: spec.reqLevel,
      baseStats: [
        { text: `+${v} de Todos os Atributos`, color: 'comum', effect: { key: 'flat-todos-atributos', value: v } },
      ],
      description: spec.description,
    };
  }

  const def = AMULET_STATS[spec.amuletType];
  const value = Math.max(1, Math.round(def.base * Math.pow(1.045, L)));
  return {
    id: spec.id,
    name: spec.name,
    slot: 'amuleto',
    amuletType: spec.amuletType,
    reqLevel: spec.reqLevel,
    baseStats: [
      { text: `+${value} de ${def.label}`, color: def.color, effect: { key: def.key, value } },
    ],
    description: spec.description,
  };
}

/** Implícito de cada tipo de aljava. `flat` escala geométrico; `pct` escala modesto. */
const ALJAVA_STATS: Record<AljavaType, { key: StatKey; label: string; color: ModColor; kind: 'flat' | 'pct'; base: number; perLvl?: number; suffix?: string }> = {
  'dano-fisico': { key: 'flat-dmg-fis', label: 'Dano Físico', color: 'fisico', kind: 'flat', base: 0.6 },
  'vida': { key: 'flat-vida', label: 'Vida Máxima', color: 'vida', kind: 'flat', base: 4 },
  'critico': { key: 'pct-crit-chance', label: 'Chance de Crítico', color: 'critico', kind: 'pct', base: 4, perLvl: 0.06, suffix: '%' },
  'vel-ataque': { key: 'pct-vel-ataque', label: 'Velocidade de Ataque', color: 'agilidade', kind: 'pct', base: 3, perLvl: 0.05, suffix: '%' },
};

/** Monta uma base de aljava (off-hand de arco) — implícito conforme o tipo. */
function aljavaPiece(spec: {
  id: string;
  name: string;
  aljavaType: AljavaType;
  reqLevel?: number;
  description?: string;
}): ItemBase {
  const def = ALJAVA_STATS[spec.aljavaType];
  const L = spec.reqLevel ?? 1;
  const value =
    def.kind === 'flat'
      ? Math.max(1, Math.round(def.base * Math.pow(1.045, L)))
      : Math.round(def.base + L * (def.perLvl ?? 0));
  return {
    id: spec.id,
    name: spec.name,
    slot: 'aljava',
    aljavaType: spec.aljavaType,
    reqLevel: spec.reqLevel,
    baseStats: [
      { text: `+${value}${def.suffix ?? ''} de ${def.label}`, color: def.color, effect: { key: def.key, value } },
    ],
    description: spec.description,
  };
}

export const ITEM_BASES: ItemBase[] = [
  // ════════ Espadas de Uma Mão (níveis escalonados) ════════
  weapon({ id: 'espada-curta', name: 'Espada Curta', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.55, description: 'Lâmina curta, sem ornamentos. O que se entrega a um aprendiz no primeiro dia.' }),
  weapon({ id: 'espada-longa', name: 'Espada Longa', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.45, reqLevel: 5, description: 'Mais alcance, mais peso. A primeira arma de quem já sobreviveu a uma briga.' }),
  weapon({ id: 'sabre-gasto', name: 'Sabre Gasto', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.50, reqLevel: 11, description: 'Curva leve, gume vivo. Passou por muitas mãos antes da sua.' }),
  weapon({ id: 'espada-larga', name: 'Espada Larga', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.45, reqLevel: 17, description: 'Folha larga que corta fundo. Pesa o suficiente pra abrir armadura leve.' }),
  weapon({ id: 'lamina-de-guerra', name: 'Lâmina de Guerra', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.45, reqLevel: 24, description: 'Feita pra campanha, não pra desfile. Cada entalhe no aço é uma história.' }),
  weapon({ id: 'espada-antiga', name: 'Espada Antiga', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.40, reqLevel: 31, description: 'Forjada num estilo que já não se ensina. O equilíbrio é estranho — e perfeito.' }),
  weapon({ id: 'cimitarra', name: 'Cimitarra', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.50, reqLevel: 38, description: 'Lâmina larga e curva das estepes. Rápida no talho, cruel no retorno.' }),
  weapon({ id: 'espada-nobre', name: 'Espada Nobre', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.45, reqLevel: 45, description: 'Punho trabalhado, aço dobrado dezenas de vezes. Cara de exibir, afiada pra matar.' }),
  weapon({ id: 'lamina-do-crepusculo', name: 'Lâmina do Crepúsculo', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.45, reqLevel: 52, description: 'Escura como a hora entre o dia e a noite. Reflete pouca luz — de propósito.' }),
  weapon({ id: 'espada-corsaria', name: 'Espada Corsária', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.50, reqLevel: 60, description: 'Aço salgado pela maré. Quem a empunhou nunca pediu permissão pra nada.' }),
  weapon({ id: 'gladio-runico', name: 'Gládio Rúnico', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.45, reqLevel: 68, description: 'Runas gravadas no aço pulsam quando o sangue corre. Ninguém lembra a língua delas.' }),
  weapon({ id: 'lamina-eterna', name: 'Lâmina Eterna', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.45, reqLevel: 76, description: 'Não enferruja, não cega, não quebra. Mais velha que o reino que a perdeu.' }),
  weapon({ id: 'espada-abissal', name: 'Espada Abissal', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.45, reqLevel: 84, description: 'Forjada com metal trazido do fundo do mundo. Frio que não passa, por mais que se segure.' }),
  weapon({ id: 'lamina-do-vazio', name: 'Lâmina do Vazio', weaponType: 'espada-uma-mao', cls: '1h', aps: 1.50, reqLevel: 92, description: 'O gume parece cortar a própria luz ao redor. Olhar fixo nela dá vertigem.' }),

  // ════════ Espadas de Duas Mãos (níveis escalonados) ════════
  weapon({ id: 'montante-rachado', name: 'Montante Rachado', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.30, description: 'Lâmina grande com uma trinca no aço. Ainda corta — só não confie demais.' }),
  weapon({ id: 'espada-bastarda', name: 'Espada Bastarda', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.30, reqLevel: 8, description: 'Cabo longo pra uma ou duas mãos. Versátil pra quem ainda não decidiu o estilo.' }),
  weapon({ id: 'montante', name: 'Montante', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.25, reqLevel: 15, description: 'Lâmina longa de duas mãos. Precisa de espaço — e de coragem pra erguer.' }),
  weapon({ id: 'espadao-de-ferro', name: 'Espadão de Ferro', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.25, reqLevel: 22, description: 'Ferro bruto e pesado. Não é elegante, mas amassa o que acerta.' }),
  weapon({ id: 'lamina-colossal', name: 'Lâmina Colossal', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.20, reqLevel: 29, description: 'Alta como um homem. Cada golpe é um evento, não um gesto.' }),
  weapon({ id: 'montante-de-guerra', name: 'Montante de Guerra', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.25, reqLevel: 36, description: 'Forjado pra abrir formações inimigas. Balança como um pêndulo de morte.' }),
  weapon({ id: 'espadao-gravado', name: 'Espadão Gravado', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.25, reqLevel: 43, description: 'Versos de batalha gravados na folha inteira. Cada nome é de um morto que ela fez.' }),
  weapon({ id: 'montante-ancestral', name: 'Montante Ancestral', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.20, reqLevel: 50, description: 'Passado de geração em geração até quebrar a linhagem. Pesa o dobro da história.' }),
  weapon({ id: 'lamina-titanica', name: 'Lâmina Titânica', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.25, reqLevel: 57, description: 'Diz-se que foi dimensionada para mãos maiores que as humanas. Acredita-se.' }),
  weapon({ id: 'espadao-abissal', name: 'Espadão Abissal', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.20, reqLevel: 65, description: 'Metal do fundo do mundo, fundido em escala brutal. Esfria a sala ao ser sacado.' }),
  weapon({ id: 'montante-runico', name: 'Montante Rúnico', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.25, reqLevel: 73, description: 'Runas correm pela folha inteira e acendem ao golpe. Pesado de carregar, pior de encarar.' }),
  weapon({ id: 'lamina-do-fim', name: 'Lâmina do Fim', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.20, reqLevel: 81, description: 'Forjada para encerrar coisas que não deveriam terminar de outro jeito.' }),
  weapon({ id: 'espadao-primordial', name: 'Espadão Primordial', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.25, reqLevel: 89, description: 'Anterior ao ferro, anterior aos nomes. Lembra como era cortar antes de haver inimigos.' }),
  weapon({ id: 'montante-da-aniquilacao', name: 'Montante da Aniquilação', weaponType: 'espada-duas-maos', cls: '2h', aps: 1.20, reqLevel: 97, description: 'O último golpe que muitos verão. Não há defesa que o explique depois.' }),

  // ════════ Machados de Uma Mão (níveis escalonados) ════════
  weapon({ id: 'machadinha', name: 'Machadinha', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, description: 'Lâmina curta de lenhador. Serve pra cortar lenha — e o que mais aparecer.' }),
  weapon({ id: 'machado-de-mao', name: 'Machado de Mão', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, reqLevel: 6, description: 'Cabo curto, cabeça pesada. Equilíbrio feito pra uma mão só.' }),
  weapon({ id: 'cutelo', name: 'Cutelo', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.45, reqLevel: 13, description: 'Folha larga de açougueiro. Não distingue carne de osso.' }),
  weapon({ id: 'machado-de-abordagem', name: 'Machado de Abordagem', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, reqLevel: 20, description: 'Gancho de um lado, gume do outro. Feito pra subir no convés e descer cabeças.' }),
  weapon({ id: 'machado-largo', name: 'Machado Largo', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.35, reqLevel: 27, description: 'Cabeça ampla que abre talhos largos. Pesa no braço, pesa mais em quem leva.' }),
  weapon({ id: 'machado-de-combate', name: 'Machado de Combate', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, reqLevel: 34, description: 'Forjado pra guerra, não pra floresta. Cada entalhe no cabo é uma campanha.' }),
  weapon({ id: 'tomahawk', name: 'Tomahawk', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.45, reqLevel: 41, description: 'Leve e equilibrado. Tão bom de arremessar quanto de empunhar — dizem.' }),
  weapon({ id: 'machado-ornado', name: 'Machado Ornado', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, reqLevel: 48, description: 'Gravações cobrem a cabeça inteira. Bonito de ver, terrível de receber.' }),
  weapon({ id: 'machado-espectral', name: 'Machado Espectral', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, reqLevel: 55, description: 'O fio parece sumir em certos ângulos. O corte chega antes que você o veja.' }),
  weapon({ id: 'machado-corsario', name: 'Machado Corsário', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.45, reqLevel: 62, description: 'Aço marcado pela maré. Quem o carregou nunca devolveu o que tomou.' }),
  weapon({ id: 'machado-runico', name: 'Machado Rúnico', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, reqLevel: 70, description: 'Runas na cabeça do machado esquentam ao primeiro sangue.' }),
  weapon({ id: 'machado-eterno', name: 'Machado Eterno', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, reqLevel: 78, description: 'Nunca cega, nunca racha. Já derrubou mais que florestas inteiras.' }),
  weapon({ id: 'machado-abissal', name: 'Machado Abissal', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.40, reqLevel: 86, description: 'Metal do fundo do mundo. Frio o bastante pra queimar a mão descuidada.' }),
  weapon({ id: 'machado-do-vazio', name: 'Machado do Vazio', weaponType: 'machado-uma-mao', cls: '1h', aps: 1.45, reqLevel: 94, description: 'A cabeça parece engolir a luz à volta. O golpe abre mais que carne.' }),

  // ════════ Machados de Duas Mãos (níveis escalonados) ════════
  weapon({ id: 'machado-lenhador', name: 'Machado Lenhador', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.20, description: 'Feito pra derrubar árvores. Funciona igual de bem com qualquer tronco.' }),
  weapon({ id: 'machado-duplo', name: 'Machado Duplo', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.25, reqLevel: 7, description: 'Duas lâminas, uma de cada lado. Nenhum golpe é desperdiçado.' }),
  weapon({ id: 'machado-de-haste', name: 'Machado de Haste', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.20, reqLevel: 14, description: 'Cabeça de machado no topo de uma haste longa. Alcance que a espada não tem.' }),
  weapon({ id: 'machado-de-batalha', name: 'Machado de Batalha', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.20, reqLevel: 21, description: 'Erguido com as duas mãos e toda a fé que sobrar. Desce como sentença.' }),
  weapon({ id: 'cutelo-colossal', name: 'Cutelo Colossal', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.15, reqLevel: 28, description: 'Mais parede que lâmina. O que ele acerta, raramente fica inteiro.' }),
  weapon({ id: 'labrys', name: 'Labrys', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.20, reqLevel: 35, description: 'Machado cerimonial de lâmina dupla. Antigo, sagrado e absolutamente letal.' }),
  weapon({ id: 'machado-do-carrasco', name: 'Machado do Carrasco', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.20, reqLevel: 42, description: 'Um só golpe é todo o trabalho que ele precisa fazer. Nunca um segundo.' }),
  weapon({ id: 'machado-ancestral', name: 'Machado Ancestral', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.15, reqLevel: 49, description: 'Passado entre chefes de guerra até a última linhagem cair. Pesa gerações.' }),
  weapon({ id: 'machado-titanico', name: 'Machado Titânico', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.20, reqLevel: 56, description: 'Dimensionado pra mãos maiores que as humanas. Quem o ergue, ergue com tudo.' }),
  weapon({ id: 'machado-do-abismo', name: 'Machado do Abismo', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.15, reqLevel: 63, description: 'Forjado em escala monstruosa com metal das profundezas. Esfria o ar ao redor.' }),
  weapon({ id: 'grande-machado-runico', name: 'Grande Machado Rúnico', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.20, reqLevel: 71, description: 'Runas correm pela cabeça inteira e acendem ao impacto. Brutal e antigo.' }),
  weapon({ id: 'machado-do-fim', name: 'Machado do Fim', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.15, reqLevel: 79, description: 'Forjado pra terminar o que precisa terminar de uma vez por todas.' }),
  weapon({ id: 'machado-primordial', name: 'Machado Primordial', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.20, reqLevel: 87, description: 'Anterior ao ferro e aos nomes. Lembra como era partir o mundo ao meio.' }),
  weapon({ id: 'machado-da-aniquilacao', name: 'Machado da Aniquilação', weaponType: 'machado-duas-maos', cls: '2h', aps: 1.15, reqLevel: 95, description: 'Cada golpe é um cataclismo de bolso. Não há armadura que conte a diferença.' }),

  // ════════ Maças de Uma Mão (níveis escalonados) ════════
  // Contundentes: lentas e pesadas — golpes mais fortes pra compensar a cadência.
  weapon({ id: 'clava', name: 'Clava', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.35, description: 'Um pedaço de madeira pesado numa ponta. Simples como a dor que causa.' }),
  weapon({ id: 'maca-cravejada', name: 'Maça Cravejada', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.35, reqLevel: 4, description: 'Pregos enfiados na cabeça da clava. Bárbaro, mas eficaz.' }),
  weapon({ id: 'marreta-de-pedra', name: 'Marreta de Pedra', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.30, reqLevel: 10, description: 'Cabeça de pedra lascada amarrada ao cabo. Esmaga onde a lâmina escorregaria.' }),
  weapon({ id: 'martelo-de-combate', name: 'Martelo de Combate', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.35, reqLevel: 16, description: 'Cabeça de ferro de um lado, bico do outro. Feito pra amassar elmos.' }),
  weapon({ id: 'maca-flangeada', name: 'Maça Flangeada', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.30, reqLevel: 23, description: 'Aletas de metal concentram o impacto num ponto só. Atravessa placas.' }),
  weapon({ id: 'maca-de-batalha', name: 'Maça de Batalha', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.35, reqLevel: 30, description: 'Equilíbrio feito pra balançar o dia inteiro sem cansar o braço. Quase.' }),
  weapon({ id: 'maca-cerimonial', name: 'Maça Cerimonial', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.30, reqLevel: 37, description: 'Carregada em procissões antes de abrir crânios em batalha. Dupla função.' }),
  weapon({ id: 'maca-lacerante', name: 'Maça Lacerante', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.35, reqLevel: 44, description: 'Farpas curvas que rasgam ao recuar. Não basta acertar — ela quer voltar.' }),
  weapon({ id: 'quebra-rochas', name: 'Quebra-Rochas', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.30, reqLevel: 51, description: 'Pesada o bastante pra rachar pedra. Ossos nem percebem a diferença.' }),
  weapon({ id: 'maca-corsaria', name: 'Maça Corsária', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.35, reqLevel: 59, description: 'Ferro marcado de sal e sangue seco. Sem elegância, só resultado.' }),
  weapon({ id: 'maca-runica', name: 'Maça Rúnica', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.30, reqLevel: 67, description: 'Runas gravadas na cabeça acendem a cada impacto. O troar não é só do metal.' }),
  weapon({ id: 'maca-eterna', name: 'Maça Eterna', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.35, reqLevel: 75, description: 'Nunca amassa, nunca racha. Já reduziu fortalezas a pó, devagar.' }),
  weapon({ id: 'maca-abissal', name: 'Maça Abissal', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.30, reqLevel: 83, description: 'Metal do fundo do mundo, denso além do natural. Cada golpe puxa pra baixo.' }),
  weapon({ id: 'maca-do-vazio', name: 'Maça do Vazio', weaponType: 'maca-uma-mao', cls: '1h', aps: 1.35, reqLevel: 91, description: 'O impacto parece engolir o som ao redor. O silêncio depois é pior.' }),

  // ════════ Maças de Duas Mãos (níveis escalonados) ════════
  // As mais lentas e demolidoras do arsenal.
  weapon({ id: 'marreta', name: 'Marreta', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.15, description: 'Uma marreta de trabalho. Não foi feita pra guerra, mas serve muito bem.' }),
  weapon({ id: 'marreta-tribal', name: 'Marreta Tribal', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.15, reqLevel: 6, description: 'Cabeça de pedra entalhada com símbolos de um clã esquecido. Pesa como a tradição.' }),
  weapon({ id: 'malho', name: 'Malho', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.10, reqLevel: 12, description: 'Bloco maciço no fim de um cabo longo. Erguê-lo já é metade da batalha.' }),
  weapon({ id: 'marreta-pesada', name: 'Marreta Pesada', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.15, reqLevel: 19, description: 'Feita pra demolir muros. Faz o mesmo com quem estiver na frente.' }),
  weapon({ id: 'marreta-denteada', name: 'Marreta Denteada', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.10, reqLevel: 26, description: 'Dentes de ferro cobrem a cabeça inteira. Esmaga e rasga no mesmo golpe.' }),
  weapon({ id: 'estrela-da-manha', name: 'Estrela-da-Manhã', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.15, reqLevel: 33, description: 'Esfera espinhada numa haste. Bonita à distância, devastadora de perto.' }),
  weapon({ id: 'marreta-de-guerra', name: 'Marreta de Guerra', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.10, reqLevel: 40, description: 'Forjada só pra destruir. Cada golpe ecoa pelo campo de batalha.' }),
  weapon({ id: 'grande-malho', name: 'Grande Malho', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.15, reqLevel: 47, description: 'Versão de guerra do malho de ferreiro. A bigorna agora é o inimigo.' }),
  weapon({ id: 'marreta-colossal', name: 'Marreta Colossal', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.10, reqLevel: 54, description: 'Mais parede que arma. O que ela acerta deixa de ter forma.' }),
  weapon({ id: 'bate-estacas', name: 'Bate-Estacas', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.15, reqLevel: 62, description: 'Mecanismo que concentra todo o peso na descida. Crava o que toca no chão.' }),
  weapon({ id: 'marreta-runica', name: 'Marreta Rúnica', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.10, reqLevel: 70, description: 'Runas correm pelo cabo e pela cabeça, acesas pela fúria do golpe.' }),
  weapon({ id: 'marreta-do-fim', name: 'Marreta do Fim', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.15, reqLevel: 78, description: 'Erguida uma vez por era, pra encerrar o que não cede de outro jeito.' }),
  weapon({ id: 'marreta-primordial', name: 'Marreta Primordial', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.10, reqLevel: 86, description: 'Anterior às forjas. Lembra como era moldar montanhas a marteladas.' }),
  weapon({ id: 'marreta-da-aniquilacao', name: 'Marreta da Aniquilação', weaponType: 'maca-duas-maos', cls: '2h', aps: 1.10, reqLevel: 96, description: 'O peso do fim do mundo num só golpe. Não sobra nada pra identificar.' }),

  // ════════ Adagas (uma mão — níveis escalonados) ════════
  // As mais rápidas do corpo-a-corpo: golpe leve, cadência altíssima.
  weapon({ id: 'estilete', name: 'Estilete', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.60, description: 'Lâmina fina como agulha. Não corta — perfura, entre as costelas.' }),
  weapon({ id: 'faca-de-caca', name: 'Faca de Caça', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.55, reqLevel: 5, description: 'Feita pra esfolar presa. Funciona igual com caça de duas pernas.' }),
  weapon({ id: 'punhal', name: 'Punhal', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.60, reqLevel: 11, description: 'Curto, oculto, certeiro. A arma de quem prefere não ser visto.' }),
  weapon({ id: 'adaga-serrilhada', name: 'Adaga Serrilhada', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.55, reqLevel: 18, description: 'Dentes no fio que rasgam ao sair. A ferida não fecha sozinha.' }),
  weapon({ id: 'misericordia', name: 'Misericórdia', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.60, reqLevel: 25, description: 'Estreita pra passar pelas frestas da armadura. O golpe de graça.' }),
  weapon({ id: 'punhal-de-ladrao', name: 'Punhal de Ladrão', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.60, reqLevel: 32, description: 'Equilibrado pra sacar rápido e sumir mais rápido ainda.' }),
  weapon({ id: 'adaga-ritual', name: 'Adaga Ritual', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.55, reqLevel: 39, description: 'Usada em ritos que ninguém admite conhecer. O cabo tem manchas antigas.' }),
  weapon({ id: 'lamina-oculta', name: 'Lâmina Oculta', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.65, reqLevel: 46, description: 'Desliza da manga sem aviso. A vítima costuma sorrir até o último instante.' }),
  weapon({ id: 'kris', name: 'Kris', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.55, reqLevel: 53, description: 'Lâmina ondulada que abre feridas largas. Bela e cruel em medidas iguais.' }),
  weapon({ id: 'adaga-corsaria', name: 'Adaga Corsária', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.60, reqLevel: 61, description: 'Curta o bastante pra brigar no aperto de um convés. Resolve rápido.' }),
  weapon({ id: 'adaga-runica', name: 'Adaga Rúnica', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.55, reqLevel: 69, description: 'Runas minúsculas correm pelo fio e acendem ao furar carne.' }),
  weapon({ id: 'adaga-eterna', name: 'Adaga Eterna', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.60, reqLevel: 77, description: 'Nunca cega, nunca enferruja. Já encerrou mais reinados que exércitos.' }),
  weapon({ id: 'adaga-abissal', name: 'Adaga Abissal', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.55, reqLevel: 85, description: 'Metal do fundo do mundo, fino como um suspiro. O frio entra com ela.' }),
  weapon({ id: 'adaga-do-vazio', name: 'Adaga do Vazio', weaponType: 'adaga-uma-mao', cls: '1h', aps: 1.60, reqLevel: 93, description: 'O fio some quando você pisca. A ferida aparece antes da lembrança do golpe.' }),

  // ════════ Lanças (uma mão — arma de alcance) ════════
  // Alcance e cadência equilibrada — golpe a distância segura.
  weapon({ id: 'lanca-curta', name: 'Lança Curta', weaponType: 'lanca', cls: '1h', aps: 1.50, description: 'Ponta de ferro num cabo curto. Mantém o perigo a um braço de distância.' }),
  weapon({ id: 'azagaia', name: 'Azagaia', weaponType: 'lanca', cls: '1h', aps: 1.55, reqLevel: 4, description: 'Leve o bastante pra arremessar, firme o bastante pra empunhar.' }),
  weapon({ id: 'lanca-de-caca', name: 'Lança de Caça', weaponType: 'lanca', cls: '1h', aps: 1.50, reqLevel: 10, description: 'Travessa abaixo da ponta pra segurar o que se debate. Útil em mais de uma caça.' }),
  weapon({ id: 'lanca-hoplita', name: 'Lança Hoplita', weaponType: 'lanca', cls: '1h', aps: 1.45, reqLevel: 17, description: 'Feita pra muralha de escudos. Sozinha já basta pra manter distância.' }),
  weapon({ id: 'tridente', name: 'Tridente', weaponType: 'lanca', cls: '1h', aps: 1.50, reqLevel: 24, description: 'Três pontas que prendem e perfuram. Veio do mar, ficou na guerra.' }),
  weapon({ id: 'lanca-de-batalha', name: 'Lança de Batalha', weaponType: 'lanca', cls: '1h', aps: 1.50, reqLevel: 31, description: 'Equilíbrio feito pra estocar o dia inteiro sem soltar o escudo.' }),
  weapon({ id: 'lanca-cerimonial', name: 'Lança Cerimonial', weaponType: 'lanca', cls: '1h', aps: 1.45, reqLevel: 38, description: 'Erguida em paradas antes de provar o gume em combate. Faz as duas coisas bem.' }),
  weapon({ id: 'partasana', name: 'Partasana', weaponType: 'lanca', cls: '1h', aps: 1.50, reqLevel: 45, description: 'Ponta larga com abas laterais que aparam e cortam. Versátil no aperto.' }),
  weapon({ id: 'lanca-alada', name: 'Lança Alada', weaponType: 'lanca', cls: '1h', aps: 1.50, reqLevel: 52, description: 'Asas de metal na base da ponta impedem o golpe de afundar demais. Saca rápido.' }),
  weapon({ id: 'lanca-corsaria', name: 'Lança Corsária', weaponType: 'lanca', cls: '1h', aps: 1.55, reqLevel: 60, description: 'Ferro salgado pela maré. Mantém o inimigo longe o bastante pra não revidar.' }),
  weapon({ id: 'lanca-runica', name: 'Lança Rúnica', weaponType: 'lanca', cls: '1h', aps: 1.50, reqLevel: 68, description: 'Runas correm pela haste e acendem na ponta a cada estocada.' }),
  weapon({ id: 'lanca-eterna', name: 'Lança Eterna', weaponType: 'lanca', cls: '1h', aps: 1.50, reqLevel: 76, description: 'Nunca entorta, nunca cega. Atravessou eras e tudo o que veio na frente.' }),
  weapon({ id: 'lanca-abissal', name: 'Lança Abissal', weaponType: 'lanca', cls: '1h', aps: 1.50, reqLevel: 84, description: 'Metal do fundo do mundo numa haste fria. O alcance dela cheira a abismo.' }),
  weapon({ id: 'lanca-do-vazio', name: 'Lança do Vazio', weaponType: 'lanca', cls: '1h', aps: 1.55, reqLevel: 92, description: 'A ponta parece sempre um pouco mais longe do que deveria. E chega antes.' }),

  // ════════ Alabardas (duas mãos — polearms de alcance, pesadas e lentas) ════════
  weapon({ id: 'pique', name: 'Pique', weaponType: 'alabarda', cls: '2h', aps: 1.30, description: 'Haste longa de ponta simples. Mantém cavalaria e tolos à distância.' }),
  weapon({ id: 'voulge', name: 'Voulge', weaponType: 'alabarda', cls: '2h', aps: 1.30, reqLevel: 8, description: 'Uma lâmina de cutelo amarrada a uma haste. Rústica, mas decepa bem.' }),
  weapon({ id: 'guisarme', name: 'Guisarme', weaponType: 'alabarda', cls: '2h', aps: 1.25, reqLevel: 15, description: 'Gancho curvo na ponta da haste. Derruba cavaleiros e prende escudos.' }),
  weapon({ id: 'bardiche', name: 'Bardiche', weaponType: 'alabarda', cls: '2h', aps: 1.25, reqLevel: 22, description: 'Lâmina longa de machado montada num cabo comprido. Talho amplo e profundo.' }),
  weapon({ id: 'alabarda', name: 'Alabarda', weaponType: 'alabarda', cls: '2h', aps: 1.30, reqLevel: 29, description: 'Ponta, gancho e lâmina numa haste só. Estoca, puxa e corta — escolha.' }),
  weapon({ id: 'glaive', name: 'Glaive', weaponType: 'alabarda', cls: '2h', aps: 1.30, reqLevel: 36, description: 'Lâmina longa no topo da haste. Mais talho que estocada, mas alcança igual.' }),
  weapon({ id: 'naginata', name: 'Naginata', weaponType: 'alabarda', cls: '2h', aps: 1.35, reqLevel: 43, description: 'Lâmina curva e elegante numa haste longa. Corta o ar em arcos amplos.' }),
  weapon({ id: 'ceifadora', name: 'Ceifadora', weaponType: 'alabarda', cls: '2h', aps: 1.25, reqLevel: 51, description: 'Uma foice de guerra. Colhe inimigos como quem colhe trigo.' }),
  weapon({ id: 'alabarda-de-guerra', name: 'Alabarda de Guerra', weaponType: 'alabarda', cls: '2h', aps: 1.30, reqLevel: 59, description: 'Forjada pra abrir formações inteiras. Cada golpe varre uma fileira.' }),
  weapon({ id: 'glaive-colossal', name: 'Glaive Colossal', weaponType: 'alabarda', cls: '2h', aps: 1.25, reqLevel: 67, description: 'Lâmina do tamanho de um homem na ponta de uma viga. Precisa de espaço — e coragem.' }),
  weapon({ id: 'alabarda-runica', name: 'Alabarda Rúnica', weaponType: 'alabarda', cls: '2h', aps: 1.30, reqLevel: 75, description: 'Runas correm pela haste e pela lâmina, acesas a cada arco. Brutal e antiga.' }),
  weapon({ id: 'alabarda-abissal', name: 'Alabarda Abissal', weaponType: 'alabarda', cls: '2h', aps: 1.25, reqLevel: 83, description: 'Metal do fundo do mundo numa haste interminável. O alcance dela cheira a abismo.' }),
  weapon({ id: 'alabarda-primordial', name: 'Alabarda Primordial', weaponType: 'alabarda', cls: '2h', aps: 1.30, reqLevel: 91, description: 'Anterior aos exércitos. Lembra como era ceifar antes de haver o que ceifar.' }),
  weapon({ id: 'alabarda-da-aniquilacao', name: 'Alabarda da Aniquilação', weaponType: 'alabarda', cls: '2h', aps: 1.25, reqLevel: 98, description: 'Um arco só decide a batalha. O que ela alcança deixa de existir em pé.' }),

  // ════════ Foices (duas mãos — melee ceifante, pesada) ════════
  weapon({ id: 'foice', name: 'Foice', weaponType: 'foice', cls: '2h', aps: 1.25, description: 'Uma foice de camponês reaproveitada. Ceifa mais que trigo agora.' }),
  weapon({ id: 'foice-de-guerra', name: 'Foice de Guerra', weaponType: 'foice', cls: '2h', aps: 1.25, reqLevel: 7, description: 'Lâmina curva montada pra matar, não pra colher.' }),
  weapon({ id: 'gadanha', name: 'Gadanha', weaponType: 'foice', cls: '2h', aps: 1.20, reqLevel: 14, description: 'Cabo longo, lâmina larga. Um arco de morte a cada golpe.' }),
  weapon({ id: 'foice-de-batalha', name: 'Foice de Batalha', weaponType: 'foice', cls: '2h', aps: 1.25, reqLevel: 21, description: 'Reforçada pra aguentar campanha. Corta fileiras inteiras.' }),
  weapon({ id: 'foice-dupla', name: 'Foice Dupla', weaponType: 'foice', cls: '2h', aps: 1.30, reqLevel: 28, description: 'Duas lâminas em pontas opostas. Nenhuma direção é segura.' }),
  weapon({ id: 'foice-ornada', name: 'Foice Ornada', weaponType: 'foice', cls: '2h', aps: 1.20, reqLevel: 35, description: 'Gravações cobrem o aço curvo. Bela como a colheita da morte.' }),
  weapon({ id: 'foice-do-ceifador', name: 'Foice do Ceifador', weaponType: 'foice', cls: '2h', aps: 1.25, reqLevel: 44, description: 'A ferramenta clássica de quem colhe almas.' }),
  weapon({ id: 'foice-colossal', name: 'Foice Colossal', weaponType: 'foice', cls: '2h', aps: 1.15, reqLevel: 53, description: 'Lâmina do tamanho de um portão. O talho abre caminho no ar.' }),
  weapon({ id: 'foice-runica', name: 'Foice Rúnica', weaponType: 'foice', cls: '2h', aps: 1.25, reqLevel: 62, description: 'Runas correm pela curva da lâmina, acesas a cada ceifa.' }),
  weapon({ id: 'foice-eterna', name: 'Foice Eterna', weaponType: 'foice', cls: '2h', aps: 1.25, reqLevel: 71, description: 'Nunca cega, nunca para. Ceifou eras inteiras.' }),
  weapon({ id: 'foice-espectral', name: 'Foice Espectral', weaponType: 'foice', cls: '2h', aps: 1.20, reqLevel: 80, description: 'A lâmina some em névoa e reaparece já do outro lado do corte.' }),
  weapon({ id: 'foice-abissal', name: 'Foice Abissal', weaponType: 'foice', cls: '2h', aps: 1.25, reqLevel: 88, description: 'Metal do fundo do mundo curvado em fio. Frio como a morte que traz.' }),
  weapon({ id: 'foice-da-morte', name: 'Foice da Morte', weaponType: 'foice', cls: '2h', aps: 1.20, reqLevel: 97, description: 'O instrumento do fim. Um golpe, uma sentença.' }),

  // ════════ Arcos (uma mão — dano à distância) ════════
  weapon({ id: 'arco-curto', name: 'Arco Curto', weaponType: 'arco', cls: '1h', aps: 1.45, description: 'Arco simples de madeira. O primeiro passo do caçador.' }),
  weapon({ id: 'arco-longo', name: 'Arco Longo', weaponType: 'arco', cls: '1h', aps: 1.40, reqLevel: 5, description: 'Maior alcance, maior tensão. Exige braço firme.' }),
  weapon({ id: 'arco-de-caca', name: 'Arco de Caça', weaponType: 'arco', cls: '1h', aps: 1.45, reqLevel: 11, description: 'Equilibrado pra rastrear e abater à distância.' }),
  weapon({ id: 'arco-composto', name: 'Arco Composto', weaponType: 'arco', cls: '1h', aps: 1.45, reqLevel: 17, description: 'Camadas coladas dão mais potência num arco menor.' }),
  weapon({ id: 'arco-de-guerra', name: 'Arco de Guerra', weaponType: 'arco', cls: '1h', aps: 1.40, reqLevel: 24, description: 'Feito pra chuva de flechas em campo aberto.' }),
  weapon({ id: 'arco-recurvo', name: 'Arco Recurvo', weaponType: 'arco', cls: '1h', aps: 1.50, reqLevel: 31, description: 'Pontas curvadas ao contrário guardam mais energia. Dispara rápido.' }),
  weapon({ id: 'arco-elfico', name: 'Arco Élfico', weaponType: 'arco', cls: '1h', aps: 1.50, reqLevel: 38, description: 'Leve e preciso, feito por mãos que enxergam longe.' }),
  weapon({ id: 'arco-de-osso', name: 'Arco de Osso', weaponType: 'arco', cls: '1h', aps: 1.45, reqLevel: 45, description: 'Ossos temperados no lugar de madeira. Estala baixinho ao tensionar.' }),
  weapon({ id: 'arco-corsario', name: 'Arco Corsário', weaponType: 'arco', cls: '1h', aps: 1.50, reqLevel: 52, description: 'Compacto pra atirar de um convés que balança.' }),
  weapon({ id: 'arco-runico', name: 'Arco Rúnico', weaponType: 'arco', cls: '1h', aps: 1.45, reqLevel: 60, description: 'Runas na madeira guiam a flecha ao alvo.' }),
  weapon({ id: 'arco-eterno', name: 'Arco Eterno', weaponType: 'arco', cls: '1h', aps: 1.45, reqLevel: 68, description: 'A corda nunca arrebenta, a madeira nunca racha.' }),
  weapon({ id: 'arco-espectral', name: 'Arco Espectral', weaponType: 'arco', cls: '1h', aps: 1.50, reqLevel: 76, description: 'A flecha parece disparar antes de você soltar a corda.' }),
  weapon({ id: 'arco-abissal', name: 'Arco Abissal', weaponType: 'arco', cls: '1h', aps: 1.45, reqLevel: 84, description: 'Feito de material das profundezas. As flechas cheiram a abismo.' }),
  weapon({ id: 'arco-do-vazio', name: 'Arco do Vazio', weaponType: 'arco', cls: '1h', aps: 1.50, reqLevel: 92, description: 'Tensiona o próprio vazio como corda. O alvo cai antes do som.' }),

  // ════════ Bestas (duas mãos — dano à distância, pesado) ════════
  weapon({ id: 'besta-leve', name: 'Besta Leve', weaponType: 'besta', cls: '2h', aps: 1.20, description: 'Mecanismo simples que dispensa força pra mirar. Lenta pra recarregar.' }),
  weapon({ id: 'besta-de-caca', name: 'Besta de Caça', weaponType: 'besta', cls: '2h', aps: 1.20, reqLevel: 8, description: 'Precisa e silenciosa. Abate antes que a presa perceba.' }),
  weapon({ id: 'besta-pesada', name: 'Besta Pesada', weaponType: 'besta', cls: '2h', aps: 1.15, reqLevel: 15, description: 'Virote grosso e lento, mas atravessa quase tudo.' }),
  weapon({ id: 'balestra', name: 'Balestra', weaponType: 'besta', cls: '2h', aps: 1.20, reqLevel: 22, description: 'Arco de aço tensionado por manivela. Potência brutal.' }),
  weapon({ id: 'besta-de-guerra', name: 'Besta de Guerra', weaponType: 'besta', cls: '2h', aps: 1.20, reqLevel: 29, description: 'Feita pra perfurar armadura a distância de campo.' }),
  weapon({ id: 'besta-de-repeticao', name: 'Besta de Repetição', weaponType: 'besta', cls: '2h', aps: 1.30, reqLevel: 36, description: 'Um carregador de virotes que dispara em sequência.' }),
  weapon({ id: 'besta-ornada', name: 'Besta Ornada', weaponType: 'besta', cls: '2h', aps: 1.15, reqLevel: 43, description: 'Gravada e polida. Precisa até nas mãos de um nobre.' }),
  weapon({ id: 'besta-de-assedio', name: 'Besta de Assédio', weaponType: 'besta', cls: '2h', aps: 1.15, reqLevel: 50, description: 'Quase uma arma de cerco portátil. O virote derruba portões.' }),
  weapon({ id: 'besta-corsaria', name: 'Besta Corsária', weaponType: 'besta', cls: '2h', aps: 1.20, reqLevel: 57, description: 'Compacta e mortal, feita pra abordagem.' }),
  weapon({ id: 'besta-runica', name: 'Besta Rúnica', weaponType: 'besta', cls: '2h', aps: 1.20, reqLevel: 65, description: 'Runas guiam o virote e reforçam o mecanismo.' }),
  weapon({ id: 'besta-eterna', name: 'Besta Eterna', weaponType: 'besta', cls: '2h', aps: 1.20, reqLevel: 73, description: 'O gatilho nunca falha, a corda nunca cede.' }),
  weapon({ id: 'besta-espectral', name: 'Besta Espectral', weaponType: 'besta', cls: '2h', aps: 1.15, reqLevel: 81, description: 'O virote atravessa como se o alvo não estivesse ali — mas está.' }),
  weapon({ id: 'besta-abissal', name: 'Besta Abissal', weaponType: 'besta', cls: '2h', aps: 1.20, reqLevel: 89, description: 'Metal das profundezas, virotes gelados. Perfura carne e coragem.' }),
  weapon({ id: 'besta-do-vazio', name: 'Besta do Vazio', weaponType: 'besta', cls: '2h', aps: 1.15, reqLevel: 97, description: 'Dispara um vazio afiado. O buraco fica; o alvo, não.' }),

  // ════════ Cajados (duas mãos — Fogo, Gelo, Raio e Sagrado) ════════
  // Sem dano físico; concedem magia. Mais fortes e lentos que as varinhas.
  // Bases iniciais — uma por elemento, SEM requisito: o jogador escolhe seu foco já no início.
  magicWeapon({ id: 'cajado-de-carvalho', name: 'Cajado de Carvalho', weaponType: 'cajado', grantedSpellId: 'dardo-de-fogo', spellName: 'Dardo de Fogo', element: 'fogo', description: 'Galho retorcido que canaliza o primeiro dardo de fogo do aprendiz.' }),
  magicWeapon({ id: 'cajado-de-gelo', name: 'Cajado de Gelo', weaponType: 'cajado', grantedSpellId: 'lasca-de-gelo', spellName: 'Lasca de Gelo', element: 'gelo', description: 'Cristal frio engastado na ponta. A madeira nunca descongela.' }),
  magicWeapon({ id: 'cajado-trovejante', name: 'Cajado Trovejante', weaponType: 'cajado', grantedSpellId: 'faisca', spellName: 'Faísca', element: 'raio', description: 'Estala faíscas ao menor toque. O ar perto dele arrepia a pele.' }),
  magicWeapon({ id: 'cajado-abencoado', name: 'Cajado Abençoado', weaponType: 'cajado', grantedSpellId: 'centelha-sagrada', spellName: 'Centelha Sagrada', element: 'sagrado', description: 'Madeira clara que guarda um brilho próprio. Conforta e queima o profano.' }),
  magicWeapon({ id: 'cajado-flamejante', name: 'Cajado Flamejante', weaponType: 'cajado', grantedSpellId: 'bola-de-fogo', spellName: 'Bola de Fogo', element: 'fogo', reqLevel: 33, description: 'A ponta arde sem se consumir. Concentra o fogo numa esfera ardente.' }),
  magicWeapon({ id: 'cajado-glacial', name: 'Cajado Glacial', weaponType: 'cajado', grantedSpellId: 'dardo-glacial', spellName: 'Dardo Glacial', element: 'gelo', reqLevel: 42, description: 'Coberto de geada perpétua. Dispara dardos densos de gelo.' }),
  magicWeapon({ id: 'cajado-tempestuoso', name: 'Cajado Tempestuoso', weaponType: 'cajado', grantedSpellId: 'dardo-eletrico', spellName: 'Dardo Elétrico', element: 'raio', reqLevel: 51, description: 'Um relâmpago preso em madeira. Pulsa antes de cada descarga.' }),
  magicWeapon({ id: 'cajado-radiante', name: 'Cajado Radiante', weaponType: 'cajado', grantedSpellId: 'dardo-de-luz', spellName: 'Dardo de Luz', element: 'sagrado', reqLevel: 60, description: 'Brilha como uma pequena aurora. Dispara raios de luz condensada.' }),
  magicWeapon({ id: 'cajado-infernal', name: 'Cajado Infernal', weaponType: 'cajado', grantedSpellId: 'lanca-de-fogo', spellName: 'Lança de Fogo', element: 'fogo', reqLevel: 69, description: 'Brasa viva no topo. Forja uma lança de fogo concentrado.' }),
  magicWeapon({ id: 'cajado-do-inverno', name: 'Cajado do Inverno', weaponType: 'cajado', grantedSpellId: 'lanca-de-gelo', spellName: 'Lança de Gelo', element: 'gelo', reqLevel: 78, description: 'Traz o inverno consigo. Forja uma lança de gelo afiada.' }),
  magicWeapon({ id: 'cajado-do-trovao', name: 'Cajado do Trovão', weaponType: 'cajado', grantedSpellId: 'raio', spellName: 'Raio', element: 'raio', reqLevel: 87, description: 'Troveja só de ser erguido. Chama um relâmpago focado sobre o alvo.' }),
  magicWeapon({ id: 'cajado-celestial', name: 'Cajado Celestial', weaponType: 'cajado', grantedSpellId: 'lanca-de-luz', spellName: 'Lança de Luz', element: 'sagrado', reqLevel: 95, description: 'Esculpido em luz solidificada. Arremessa uma lança de luz pura.' }),

  // ════════ Varinhas (uma mão — Caos: projéteis rápidos e mais fracos) ════════
  // Sem dano físico; concedem magia de Caos. Mais rápidas e fracas que cajados,
  // mas deixam a outra mão livre (escudo/off-hand).
  magicWeapon({ id: 'varinha-de-aprendiz', name: 'Varinha de Aprendiz', weaponType: 'varinha', grantedSpellId: 'dardo-do-caos', spellName: 'Dardo do Caos', element: 'caos', description: 'A primeira varinha de todo conjurador. Cospe um dardo de energia corruptora.' }),
  magicWeapon({ id: 'varinha-profana', name: 'Varinha Profana', weaponType: 'varinha', grantedSpellId: 'rajada-profana', spellName: 'Rajada Profana', element: 'caos', reqLevel: 30, description: 'Madeira escura que absorve a luz. Dispara rajadas velozes de energia profana.' }),
  magicWeapon({ id: 'varinha-abissal', name: 'Varinha Abissal', weaponType: 'varinha', grantedSpellId: 'lanca-abissal', spellName: 'Lança Abissal', element: 'caos', reqLevel: 60, description: 'Lascada de algo do abismo. Arremessa lanças rápidas de escuridão.' }),
  magicWeapon({ id: 'varinha-do-caos', name: 'Varinha do Caos', weaponType: 'varinha', grantedSpellId: 'esfera-do-caos', spellName: 'Esfera do Caos', element: 'caos', reqLevel: 88, description: 'Instável ao toque. Lança esferas de puro caos que mal se contêm.' }),

  // ════════ Cetros (uma mão — invocação / necromante) ════════
  // Sem dano físico; concedem magia de INVOCAÇÃO (não é ataque básico — custa mana).
  // A 1ª base é sem requisito pra dar acesso ao arquétipo desde cedo.
  summonWeapon({ id: 'cetro-de-osso', name: 'Cetro de Osso', grantedSummonId: 'invocar-esqueleto', summonName: 'Invocar Esqueleto', description: 'Um fêmur entalhado com runas de morte. Chama os ossos de volta à luta.' }),
  summonWeapon({ id: 'cetro-do-coveiro', name: 'Cetro do Coveiro', grantedSummonId: 'invocar-arqueiro-esqueleto', summonName: 'Invocar Arqueiro Esqueleto', reqLevel: 24, description: 'Empunhado por quem enterrou gente demais pra ainda respeitar a morte.' }),
  summonWeapon({ id: 'cetro-do-necromante', name: 'Cetro do Necromante', grantedSummonId: 'invocar-mago-esqueleto', summonName: 'Invocar Mago Esqueleto', reqLevel: 48, description: 'Cristal turvo no topo que pulsa quando há mortos por perto. Reanima conjuradores.' }),
  summonWeapon({ id: 'cetro-profano', name: 'Cetro Profano', grantedSummonId: 'invocar-bruto-esqueleto', summonName: 'Invocar Bruto Esqueleto', reqLevel: 70, description: 'Funde despojos num gigante de ossos. O cetro range sob o próprio poder.' }),
  summonWeapon({ id: 'cetro-do-senhor-dos-mortos', name: 'Cetro do Senhor dos Mortos', grantedSummonId: 'invocar-cavaleiro-esqueleto', summonName: 'Invocar Cavaleiro Esqueleto', reqLevel: 90, description: 'O bastão de quem comanda legiões que não respiram. Ergue cavaleiros caídos.' }),

  // ════════ Elmos — 6 tipos defensivos (slotMult 0.45) ════════
  // ── Armadura ──
  armorPiece({ id: 'capacete-de-ferro', name: 'Capacete de Ferro', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45 }),
  armorPiece({ id: 'elmo-de-ferro', name: 'Elmo de Ferro', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 6 }),
  armorPiece({ id: 'capacete-de-placas', name: 'Capacete de Placas', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 13 }),
  armorPiece({ id: 'bacinete', name: 'Bacinete', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 21 }),
  armorPiece({ id: 'elmo-de-batalha', name: 'Elmo de Batalha', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 30 }),
  armorPiece({ id: 'grande-elmo', name: 'Grande Elmo', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 40 }),
  armorPiece({ id: 'elmo-de-cavaleiro', name: 'Elmo de Cavaleiro', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 51 }),
  armorPiece({ id: 'elmo-completo', name: 'Elmo Completo', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 63 }),
  armorPiece({ id: 'elmo-runico', name: 'Elmo Rúnico', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 76 }),
  armorPiece({ id: 'elmo-abissal', name: 'Elmo Abissal', slot: 'cabeca', armorType: 'armadura', slotMult: 0.45, reqLevel: 90 }),

  // ── Evasão ──
  armorPiece({ id: 'capuz-de-couro', name: 'Capuz de Couro', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45 }),
  armorPiece({ id: 'mascara-de-couro', name: 'Máscara de Couro', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 5 }),
  armorPiece({ id: 'capuz-tachonado', name: 'Capuz Tachonado', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 12 }),
  armorPiece({ id: 'capuz-de-batedor', name: 'Capuz de Batedor', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 20 }),
  armorPiece({ id: 'mascara-de-cacador', name: 'Máscara de Caçador', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 29 }),
  armorPiece({ id: 'capuz-de-sombras', name: 'Capuz de Sombras', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 39 }),
  armorPiece({ id: 'mascara-furtiva', name: 'Máscara Furtiva', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 50 }),
  armorPiece({ id: 'capuz-do-assassino', name: 'Capuz do Assassino', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 62 }),
  armorPiece({ id: 'mascara-espectral', name: 'Máscara Espectral', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 75 }),
  armorPiece({ id: 'capuz-do-vento', name: 'Capuz do Vento', slot: 'cabeca', armorType: 'evasao', slotMult: 0.45, reqLevel: 89 }),

  // ── Escudo de Energia ──
  armorPiece({ id: 'tiara-simples', name: 'Tiara Simples', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45 }),
  armorPiece({ id: 'capuz-de-linho', name: 'Capuz de Linho', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 7 }),
  armorPiece({ id: 'circlete-de-aprendiz', name: 'Circlete de Aprendiz', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 15 }),
  armorPiece({ id: 'tiara-arcana', name: 'Tiara Arcana', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 24 }),
  armorPiece({ id: 'coroa-encantada', name: 'Coroa Encantada', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 34 }),
  armorPiece({ id: 'circlete-runico', name: 'Circlete Rúnico', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 45 }),
  armorPiece({ id: 'tiara-do-sabio', name: 'Tiara do Sábio', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 57 }),
  armorPiece({ id: 'diadema-etereo', name: 'Diadema Etéreo', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 70 }),
  armorPiece({ id: 'coroa-astral', name: 'Coroa Astral', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 83 }),
  armorPiece({ id: 'tiara-do-vazio', name: 'Tiara do Vazio', slot: 'cabeca', armorType: 'escudo-energia', slotMult: 0.45, reqLevel: 92 }),

  // ── Armadura / Evasão ──
  armorPiece({ id: 'capacete-de-escamas', name: 'Capacete de Escamas', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45 }),
  armorPiece({ id: 'elmo-de-couro-batido', name: 'Elmo de Couro Batido', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 8 }),
  armorPiece({ id: 'elmo-lamelar', name: 'Elmo Lamelar', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 16 }),
  armorPiece({ id: 'elmo-de-batedor', name: 'Elmo de Batedor', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 25 }),
  armorPiece({ id: 'capacete-de-guardiao', name: 'Capacete de Guardião', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 35 }),
  armorPiece({ id: 'elmo-do-templario', name: 'Elmo do Templário', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 46 }),
  armorPiece({ id: 'elmo-reforcado', name: 'Elmo Reforçado', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 58 }),
  armorPiece({ id: 'elmo-do-crepusculo', name: 'Elmo do Crepúsculo', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 71 }),
  armorPiece({ id: 'elmo-lamelar-runico', name: 'Elmo Lamelar Rúnico', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 84 }),
  armorPiece({ id: 'elmo-do-ocaso', name: 'Elmo do Ocaso', slot: 'cabeca', armorType: 'armadura-evasao', slotMult: 0.45, reqLevel: 94 }),

  // ── Armadura / Escudo de Energia ──
  armorPiece({ id: 'elmo-encantado', name: 'Elmo Encantado', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45 }),
  armorPiece({ id: 'elmo-bordado', name: 'Elmo Bordado', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 4 }),
  armorPiece({ id: 'bacinete-runico', name: 'Bacinete Rúnico', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 11 }),
  armorPiece({ id: 'elmo-consagrado', name: 'Elmo Consagrado', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 19 }),
  armorPiece({ id: 'capacete-bento', name: 'Capacete Bento', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 28 }),
  armorPiece({ id: 'elmo-arcano', name: 'Elmo Arcano', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 38 }),
  armorPiece({ id: 'coroa-de-ferro', name: 'Coroa de Ferro', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 49 }),
  armorPiece({ id: 'egide-cranial', name: 'Égide Cranial', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 61 }),
  armorPiece({ id: 'elmo-sagrado-runico', name: 'Elmo Sagrado Rúnico', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 74 }),
  armorPiece({ id: 'coroa-abissal', name: 'Coroa Abissal', slot: 'cabeca', armorType: 'armadura-energia', slotMult: 0.45, reqLevel: 88 }),

  // ── Evasão / Escudo de Energia ──
  armorPiece({ id: 'capuz-de-viajante', name: 'Capuz de Viajante', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45 }),
  armorPiece({ id: 'capuz-leve-encantado', name: 'Capuz Leve Encantado', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 9 }),
  armorPiece({ id: 'capuz-elfico', name: 'Capuz Élfico', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 18 }),
  armorPiece({ id: 'capuz-do-andarilho', name: 'Capuz do Andarilho', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 27 }),
  armorPiece({ id: 'veu-arcano', name: 'Véu Arcano', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 37 }),
  armorPiece({ id: 'capuz-espectral', name: 'Capuz Espectral', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 48 }),
  armorPiece({ id: 'mascara-sombria', name: 'Máscara Sombria', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 60 }),
  armorPiece({ id: 'veu-do-vidente', name: 'Véu do Vidente', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 73 }),
  armorPiece({ id: 'capuz-astral', name: 'Capuz Astral', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 86 }),
  armorPiece({ id: 'capuz-do-feiticeiro', name: 'Capuz do Feiticeiro', slot: 'cabeca', armorType: 'evasao-energia', slotMult: 0.45, reqLevel: 95 }),

  // ════════ Peito — 6 tipos defensivos (PoE), progressão cheia ════════
  // Puros: Armadura · Evasão · Escudo de Energia | Híbridos: os 3 pares.
  // Peito é a peça mais defensiva (slotMult 1.0). 1ª base de cada tipo sem requisito.

  // ── Armadura (placas/malha) ──
  armorPiece({ id: 'cota-acolchoada', name: 'Cota Acolchoada', slot: 'peito', armorType: 'armadura', slotMult: 1.0 }),
  armorPiece({ id: 'gibao-de-placas', name: 'Gibão de Placas', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 6 }),
  armorPiece({ id: 'cota-de-malha', name: 'Cota de Malha', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 13 }),
  armorPiece({ id: 'meia-armadura', name: 'Meia-Armadura', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 21 }),
  armorPiece({ id: 'peitoral-de-placas', name: 'Peitoral de Placas', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 30 }),
  armorPiece({ id: 'armadura-de-campo', name: 'Armadura de Campo', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 40 }),
  armorPiece({ id: 'armadura-de-cavaleiro', name: 'Armadura de Cavaleiro', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 51 }),
  armorPiece({ id: 'armadura-completa', name: 'Armadura Completa', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 63 }),
  armorPiece({ id: 'armadura-runica', name: 'Armadura Rúnica', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 76 }),
  armorPiece({ id: 'armadura-abissal-peito', name: 'Armadura Abissal', slot: 'peito', armorType: 'armadura', slotMult: 1.0, reqLevel: 90 }),

  // ── Evasão (couro/leve) ──
  armorPiece({ id: 'tunica-de-couro', name: 'Túnica de Couro', slot: 'peito', armorType: 'evasao', slotMult: 1.0 }),
  armorPiece({ id: 'gibao-de-couro', name: 'Gibão de Couro', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 5 }),
  armorPiece({ id: 'couro-tachonado', name: 'Couro Tachonado', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 12 }),
  armorPiece({ id: 'armadura-leve', name: 'Armadura Leve', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 20 }),
  armorPiece({ id: 'traje-de-cacador', name: 'Traje de Caçador', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 29 }),
  armorPiece({ id: 'armadura-de-sombras', name: 'Armadura de Sombras', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 39 }),
  armorPiece({ id: 'manto-furtivo', name: 'Manto Furtivo', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 50 }),
  armorPiece({ id: 'traje-do-assassino', name: 'Traje do Assassino', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 62 }),
  armorPiece({ id: 'pele-espectral', name: 'Pele Espectral', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 75 }),
  armorPiece({ id: 'manto-do-vento', name: 'Manto do Vento', slot: 'peito', armorType: 'evasao', slotMult: 1.0, reqLevel: 89 }),

  // ── Escudo de Energia (vestes arcanas) ──
  armorPiece({ id: 'vestes-simples', name: 'Vestes Simples', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0 }),
  armorPiece({ id: 'tunica-de-linho', name: 'Túnica de Linho', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 7 }),
  armorPiece({ id: 'vestes-de-aprendiz', name: 'Vestes de Aprendiz', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 15 }),
  armorPiece({ id: 'tunica-arcana', name: 'Túnica Arcana', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 24 }),
  armorPiece({ id: 'manto-encantado', name: 'Manto Encantado', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 34 }),
  armorPiece({ id: 'vestes-runicas', name: 'Vestes Rúnicas', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 45 }),
  armorPiece({ id: 'manto-do-sabio', name: 'Manto do Sábio', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 57 }),
  armorPiece({ id: 'vestes-etereas', name: 'Vestes Etéreas', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 70 }),
  armorPiece({ id: 'manto-astral', name: 'Manto Astral', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 83 }),
  armorPiece({ id: 'vestes-do-vazio', name: 'Vestes do Vazio', slot: 'peito', armorType: 'escudo-energia', slotMult: 1.0, reqLevel: 92 }),

  // ── Armadura / Evasão ──
  armorPiece({ id: 'brigantina', name: 'Brigantina', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0 }),
  armorPiece({ id: 'jaqueta-de-placas', name: 'Jaqueta de Placas', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 8 }),
  armorPiece({ id: 'cota-de-escamas', name: 'Cota de Escamas', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 16 }),
  armorPiece({ id: 'lamelar', name: 'Lamelar', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 25 }),
  armorPiece({ id: 'armadura-de-batedor', name: 'Armadura de Batedor', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 35 }),
  armorPiece({ id: 'meia-placa-leve', name: 'Meia-Placa Leve', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 46 }),
  armorPiece({ id: 'armadura-de-guardiao', name: 'Armadura de Guardião', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 58 }),
  armorPiece({ id: 'armadura-do-templario', name: 'Armadura do Templário', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 71 }),
  armorPiece({ id: 'lamelar-runica', name: 'Lamelar Rúnica', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 84 }),
  armorPiece({ id: 'armadura-do-crepusculo', name: 'Armadura do Crepúsculo', slot: 'peito', armorType: 'armadura-evasao', slotMult: 1.0, reqLevel: 94 }),

  // ── Armadura / Escudo de Energia ──
  armorPiece({ id: 'cota-encantada', name: 'Cota Encantada', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0 }),
  armorPiece({ id: 'malha-bordada', name: 'Malha Bordada', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 4 }),
  armorPiece({ id: 'malha-runica', name: 'Malha Rúnica', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 11 }),
  armorPiece({ id: 'cota-consagrada', name: 'Cota Consagrada', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 19 }),
  armorPiece({ id: 'peitoral-bento', name: 'Peitoral Bento', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 28 }),
  armorPiece({ id: 'placa-arcana', name: 'Placa Arcana', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 38 }),
  armorPiece({ id: 'peitoral-consagrado', name: 'Peitoral Consagrado', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 49 }),
  armorPiece({ id: 'egide-de-ferro', name: 'Égide de Ferro', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 61 }),
  armorPiece({ id: 'egide-runica', name: 'Égide Rúnica', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 74 }),
  armorPiece({ id: 'egide-arcana', name: 'Égide Arcana', slot: 'peito', armorType: 'armadura-energia', slotMult: 1.0, reqLevel: 88 }),

  // ── Evasão / Escudo de Energia ──
  armorPiece({ id: 'vestes-de-viajante', name: 'Vestes de Viajante', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0 }),
  armorPiece({ id: 'traje-leve-encantado', name: 'Traje Leve Encantado', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 9 }),
  armorPiece({ id: 'manto-elfico', name: 'Manto Élfico', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 18 }),
  armorPiece({ id: 'traje-do-andarilho', name: 'Traje do Andarilho', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 27 }),
  armorPiece({ id: 'seda-arcana', name: 'Seda Arcana', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 37 }),
  armorPiece({ id: 'traje-espectral', name: 'Traje Espectral', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 48 }),
  armorPiece({ id: 'manto-sombrio', name: 'Manto Sombrio', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 60 }),
  armorPiece({ id: 'veu-do-feiticeiro', name: 'Véu do Feiticeiro', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 73 }),
  armorPiece({ id: 'traje-astral', name: 'Traje Astral', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 86 }),
  armorPiece({ id: 'manto-do-feiticeiro', name: 'Manto do Feiticeiro', slot: 'peito', armorType: 'evasao-energia', slotMult: 1.0, reqLevel: 95 }),

  // ════════ Luvas — 6 tipos defensivos (slotMult 0.30) ════════
  // ── Armadura ──
  armorPiece({ id: 'manoplas-de-ferro', name: 'Manoplas de Ferro', slot: 'maos', armorType: 'armadura', slotMult: 0.30 }),
  armorPiece({ id: 'manoplas-de-placas', name: 'Manoplas de Placas', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 6 }),
  armorPiece({ id: 'manoplas-de-malha', name: 'Manoplas de Malha', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 13 }),
  armorPiece({ id: 'manoplas-de-batalha', name: 'Manoplas de Batalha', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 21 }),
  armorPiece({ id: 'manoplas-de-guerra', name: 'Manoplas de Guerra', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 30 }),
  armorPiece({ id: 'punhos-de-ferro', name: 'Punhos de Ferro', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 40 }),
  armorPiece({ id: 'manoplas-de-cavaleiro', name: 'Manoplas de Cavaleiro', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 51 }),
  armorPiece({ id: 'manoplas-completas', name: 'Manoplas Completas', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 63 }),
  armorPiece({ id: 'manoplas-runicas', name: 'Manoplas Rúnicas', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 76 }),
  armorPiece({ id: 'manoplas-abissais', name: 'Manoplas Abissais', slot: 'maos', armorType: 'armadura', slotMult: 0.30, reqLevel: 90 }),

  // ── Evasão ──
  armorPiece({ id: 'luvas-de-couro', name: 'Luvas de Couro', slot: 'maos', armorType: 'evasao', slotMult: 0.30 }),
  armorPiece({ id: 'luvas-tachonadas', name: 'Luvas Tachonadas', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 5 }),
  armorPiece({ id: 'manoplas-de-couro', name: 'Manoplas de Couro', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 12 }),
  armorPiece({ id: 'luvas-de-batedor', name: 'Luvas de Batedor', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 20 }),
  armorPiece({ id: 'luvas-de-cacador', name: 'Luvas de Caçador', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 29 }),
  armorPiece({ id: 'luvas-de-sombras', name: 'Luvas de Sombras', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 39 }),
  armorPiece({ id: 'luvas-furtivas', name: 'Luvas Furtivas', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 50 }),
  armorPiece({ id: 'luvas-do-assassino', name: 'Luvas do Assassino', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 62 }),
  armorPiece({ id: 'luvas-espectrais', name: 'Luvas Espectrais', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 75 }),
  armorPiece({ id: 'luvas-do-vento', name: 'Luvas do Vento', slot: 'maos', armorType: 'evasao', slotMult: 0.30, reqLevel: 89 }),

  // ── Escudo de Energia ──
  armorPiece({ id: 'luvas-de-linho', name: 'Luvas de Linho', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30 }),
  armorPiece({ id: 'luvas-de-seda', name: 'Luvas de Seda', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 7 }),
  armorPiece({ id: 'manoplas-de-aprendiz', name: 'Manoplas de Aprendiz', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 15 }),
  armorPiece({ id: 'luvas-arcanas', name: 'Luvas Arcanas', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 24 }),
  armorPiece({ id: 'luvas-encantadas', name: 'Luvas Encantadas', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 34 }),
  armorPiece({ id: 'luvas-runicas', name: 'Luvas Rúnicas', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 45 }),
  armorPiece({ id: 'luvas-do-sabio', name: 'Luvas do Sábio', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 57 }),
  armorPiece({ id: 'luvas-etereas', name: 'Luvas Etéreas', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 70 }),
  armorPiece({ id: 'luvas-astrais', name: 'Luvas Astrais', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 83 }),
  armorPiece({ id: 'luvas-do-vazio', name: 'Luvas do Vazio', slot: 'maos', armorType: 'escudo-energia', slotMult: 0.30, reqLevel: 92 }),

  // ── Armadura / Evasão ──
  armorPiece({ id: 'manoplas-de-escamas', name: 'Manoplas de Escamas', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30 }),
  armorPiece({ id: 'luvas-de-couro-batido', name: 'Luvas de Couro Batido', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 8 }),
  armorPiece({ id: 'manoplas-lamelares', name: 'Manoplas Lamelares', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 16 }),
  armorPiece({ id: 'manoplas-de-batedor', name: 'Manoplas de Batedor', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 25 }),
  armorPiece({ id: 'manoplas-de-guardiao', name: 'Manoplas de Guardião', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 35 }),
  armorPiece({ id: 'manoplas-do-templario', name: 'Manoplas do Templário', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 46 }),
  armorPiece({ id: 'manoplas-reforcadas', name: 'Manoplas Reforçadas', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 58 }),
  armorPiece({ id: 'manoplas-do-crepusculo', name: 'Manoplas do Crepúsculo', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 71 }),
  armorPiece({ id: 'manoplas-lamelares-runicas', name: 'Manoplas Lamelares Rúnicas', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 84 }),
  armorPiece({ id: 'manoplas-do-ocaso', name: 'Manoplas do Ocaso', slot: 'maos', armorType: 'armadura-evasao', slotMult: 0.30, reqLevel: 94 }),

  // ── Armadura / Escudo de Energia ──
  armorPiece({ id: 'manoplas-encantadas', name: 'Manoplas Encantadas', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30 }),
  armorPiece({ id: 'manoplas-bordadas', name: 'Manoplas Bordadas', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 4 }),
  armorPiece({ id: 'manoplas-de-malha-runica', name: 'Manoplas de Malha Rúnica', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 11 }),
  armorPiece({ id: 'manoplas-consagradas', name: 'Manoplas Consagradas', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 19 }),
  armorPiece({ id: 'manoplas-bentas', name: 'Manoplas Bentas', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 28 }),
  armorPiece({ id: 'manoplas-arcanas', name: 'Manoplas Arcanas', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 38 }),
  armorPiece({ id: 'punhos-runicos', name: 'Punhos Rúnicos', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 49 }),
  armorPiece({ id: 'egide-de-punho', name: 'Égide de Punho', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 61 }),
  armorPiece({ id: 'manoplas-sagradas', name: 'Manoplas Sagradas', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 74 }),
  armorPiece({ id: 'punhos-abissais', name: 'Punhos Abissais', slot: 'maos', armorType: 'armadura-energia', slotMult: 0.30, reqLevel: 88 }),

  // ── Evasão / Escudo de Energia ──
  armorPiece({ id: 'luvas-de-viajante', name: 'Luvas de Viajante', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30 }),
  armorPiece({ id: 'luvas-leves-encantadas', name: 'Luvas Leves Encantadas', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 9 }),
  armorPiece({ id: 'luvas-elficas', name: 'Luvas Élficas', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 18 }),
  armorPiece({ id: 'luvas-do-andarilho', name: 'Luvas do Andarilho', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 27 }),
  armorPiece({ id: 'luvas-de-seda-arcana', name: 'Luvas de Seda Arcana', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 37 }),
  armorPiece({ id: 'luvas-fantasma', name: 'Luvas Fantasma', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 48 }),
  armorPiece({ id: 'luvas-sombrias', name: 'Luvas Sombrias', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 60 }),
  armorPiece({ id: 'luvas-do-vidente', name: 'Luvas do Vidente', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 73 }),
  armorPiece({ id: 'luvas-siderais', name: 'Luvas Siderais', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 86 }),
  armorPiece({ id: 'luvas-do-feiticeiro', name: 'Luvas do Feiticeiro', slot: 'maos', armorType: 'evasao-energia', slotMult: 0.30, reqLevel: 95 }),

  // ════════ Botas — 6 tipos defensivos (slotMult 0.35) ════════
  // ── Armadura ──
  armorPiece({ id: 'botas-de-ferro', name: 'Botas de Ferro', slot: 'pes', armorType: 'armadura', slotMult: 0.35 }),
  armorPiece({ id: 'botas-de-placas', name: 'Botas de Placas', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 6 }),
  armorPiece({ id: 'grevas-de-malha', name: 'Grevas de Malha', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 13 }),
  armorPiece({ id: 'botas-de-batalha', name: 'Botas de Batalha', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 21 }),
  armorPiece({ id: 'grevas-de-guerra', name: 'Grevas de Guerra', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 30 }),
  armorPiece({ id: 'botas-reforcadas', name: 'Botas Reforçadas', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 40 }),
  armorPiece({ id: 'grevas-de-cavaleiro', name: 'Grevas de Cavaleiro', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 51 }),
  armorPiece({ id: 'botas-completas', name: 'Botas Completas', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 63 }),
  armorPiece({ id: 'grevas-runicas', name: 'Grevas Rúnicas', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 76 }),
  armorPiece({ id: 'botas-abissais', name: 'Botas Abissais', slot: 'pes', armorType: 'armadura', slotMult: 0.35, reqLevel: 90 }),

  // ── Evasão ──
  armorPiece({ id: 'botas-de-couro', name: 'Botas de Couro', slot: 'pes', armorType: 'evasao', slotMult: 0.35 }),
  armorPiece({ id: 'botas-tachonadas', name: 'Botas Tachonadas', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 5 }),
  armorPiece({ id: 'sapatos-de-couro', name: 'Sapatos de Couro', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 12 }),
  armorPiece({ id: 'botas-de-batedor', name: 'Botas de Batedor', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 20 }),
  armorPiece({ id: 'botas-de-cacador', name: 'Botas de Caçador', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 29 }),
  armorPiece({ id: 'botas-de-sombras', name: 'Botas de Sombras', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 39 }),
  armorPiece({ id: 'botas-furtivas', name: 'Botas Furtivas', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 50 }),
  armorPiece({ id: 'botas-do-assassino', name: 'Botas do Assassino', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 62 }),
  armorPiece({ id: 'botas-espectrais', name: 'Botas Espectrais', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 75 }),
  armorPiece({ id: 'botas-do-vento', name: 'Botas do Vento', slot: 'pes', armorType: 'evasao', slotMult: 0.35, reqLevel: 89 }),

  // ── Escudo de Energia ──
  armorPiece({ id: 'sapatos-de-linho', name: 'Sapatos de Linho', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35 }),
  armorPiece({ id: 'sapatos-de-seda', name: 'Sapatos de Seda', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 7 }),
  armorPiece({ id: 'botas-de-aprendiz', name: 'Botas de Aprendiz', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 15 }),
  armorPiece({ id: 'botas-arcanas', name: 'Botas Arcanas', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 24 }),
  armorPiece({ id: 'botas-encantadas', name: 'Botas Encantadas', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 34 }),
  armorPiece({ id: 'botas-runicas', name: 'Botas Rúnicas', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 45 }),
  armorPiece({ id: 'passos-do-sabio', name: 'Passos do Sábio', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 57 }),
  armorPiece({ id: 'botas-etereas', name: 'Botas Etéreas', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 70 }),
  armorPiece({ id: 'botas-astrais', name: 'Botas Astrais', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 83 }),
  armorPiece({ id: 'botas-do-vazio', name: 'Botas do Vazio', slot: 'pes', armorType: 'escudo-energia', slotMult: 0.35, reqLevel: 92 }),

  // ── Armadura / Evasão ──
  armorPiece({ id: 'botas-de-escamas', name: 'Botas de Escamas', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35 }),
  armorPiece({ id: 'botas-de-couro-batido', name: 'Botas de Couro Batido', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 8 }),
  armorPiece({ id: 'grevas-lamelares', name: 'Grevas Lamelares', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 16 }),
  armorPiece({ id: 'grevas-de-batedor', name: 'Grevas de Batedor', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 25 }),
  armorPiece({ id: 'botas-de-guardiao', name: 'Botas de Guardião', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 35 }),
  armorPiece({ id: 'botas-do-templario', name: 'Botas do Templário', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 46 }),
  armorPiece({ id: 'grevas-reforcadas', name: 'Grevas Reforçadas', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 58 }),
  armorPiece({ id: 'botas-do-crepusculo', name: 'Botas do Crepúsculo', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 71 }),
  armorPiece({ id: 'grevas-lamelares-runicas', name: 'Grevas Lamelares Rúnicas', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 84 }),
  armorPiece({ id: 'botas-do-ocaso', name: 'Botas do Ocaso', slot: 'pes', armorType: 'armadura-evasao', slotMult: 0.35, reqLevel: 94 }),

  // ── Armadura / Escudo de Energia ──
  armorPiece({ id: 'grevas-encantadas', name: 'Grevas Encantadas', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35 }),
  armorPiece({ id: 'botas-bordadas', name: 'Botas Bordadas', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 4 }),
  armorPiece({ id: 'grevas-de-malha-runica', name: 'Grevas de Malha Rúnica', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 11 }),
  armorPiece({ id: 'botas-consagradas', name: 'Botas Consagradas', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 19 }),
  armorPiece({ id: 'botas-bentas', name: 'Botas Bentas', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 28 }),
  armorPiece({ id: 'grevas-arcanas', name: 'Grevas Arcanas', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 38 }),
  armorPiece({ id: 'passos-runicos', name: 'Passos Rúnicos', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 49 }),
  armorPiece({ id: 'egide-dos-pes', name: 'Égide dos Pés', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 61 }),
  armorPiece({ id: 'botas-sagradas', name: 'Botas Sagradas', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 74 }),
  armorPiece({ id: 'grevas-abissais', name: 'Grevas Abissais', slot: 'pes', armorType: 'armadura-energia', slotMult: 0.35, reqLevel: 88 }),

  // ── Evasão / Escudo de Energia ──
  armorPiece({ id: 'botas-de-viajante', name: 'Botas de Viajante', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35 }),
  armorPiece({ id: 'botas-leves-encantadas', name: 'Botas Leves Encantadas', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 9 }),
  armorPiece({ id: 'botas-elficas', name: 'Botas Élficas', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 18 }),
  armorPiece({ id: 'botas-do-andarilho', name: 'Botas do Andarilho', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 27 }),
  armorPiece({ id: 'sapatos-de-seda-arcana', name: 'Sapatos de Seda Arcana', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 37 }),
  armorPiece({ id: 'botas-fantasma', name: 'Botas Fantasma', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 48 }),
  armorPiece({ id: 'botas-sombrias', name: 'Botas Sombrias', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 60 }),
  armorPiece({ id: 'passos-do-vidente', name: 'Passos do Vidente', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 73 }),
  armorPiece({ id: 'botas-siderais', name: 'Botas Siderais', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 86 }),
  armorPiece({ id: 'botas-do-feiticeiro', name: 'Botas do Feiticeiro', slot: 'pes', armorType: 'evasao-energia', slotMult: 0.35, reqLevel: 95 }),

  // ════════ Cintos — tipos por implícito (estilo PoE) ════════
  // ── Vida ──
  beltPiece({ id: 'cinto-de-couro', name: 'Cinto de Couro', beltType: 'vida' }),
  beltPiece({ id: 'cinto-reforcado', name: 'Cinto Reforçado', beltType: 'vida', reqLevel: 15 }),
  beltPiece({ id: 'cinto-de-guerra', name: 'Cinto de Guerra', beltType: 'vida', reqLevel: 33 }),
  beltPiece({ id: 'cinto-robusto', name: 'Cinto Robusto', beltType: 'vida', reqLevel: 52 }),
  beltPiece({ id: 'cinto-vital', name: 'Cinto Vital', beltType: 'vida', reqLevel: 70 }),
  beltPiece({ id: 'cinto-do-sobrevivente', name: 'Cinto do Sobrevivente', beltType: 'vida', reqLevel: 86 }),

  // ── Mana ──
  beltPiece({ id: 'faixa-de-pano', name: 'Faixa de Pano', beltType: 'mana' }),
  beltPiece({ id: 'faixa-de-seda', name: 'Faixa de Seda', beltType: 'mana', reqLevel: 15 }),
  beltPiece({ id: 'cinto-encantado', name: 'Cinto Encantado', beltType: 'mana', reqLevel: 33 }),
  beltPiece({ id: 'cinto-arcano', name: 'Cinto Arcano', beltType: 'mana', reqLevel: 52 }),
  beltPiece({ id: 'cinto-do-mago', name: 'Cinto do Mago', beltType: 'mana', reqLevel: 70 }),
  beltPiece({ id: 'cinto-etereo', name: 'Cinto Etéreo', beltType: 'mana', reqLevel: 86 }),

  // ── Força ──
  beltPiece({ id: 'cinto-pesado', name: 'Cinto Pesado', beltType: 'forca' }),
  beltPiece({ id: 'cinto-de-bronze', name: 'Cinto de Bronze', beltType: 'forca', reqLevel: 15 }),
  beltPiece({ id: 'cinto-de-ferro', name: 'Cinto de Ferro', beltType: 'forca', reqLevel: 33 }),
  beltPiece({ id: 'cinto-do-guerreiro', name: 'Cinto do Guerreiro', beltType: 'forca', reqLevel: 52 }),
  beltPiece({ id: 'cinto-do-tita', name: 'Cinto do Titã', beltType: 'forca', reqLevel: 70 }),
  beltPiece({ id: 'cinto-do-colosso', name: 'Cinto do Colosso', beltType: 'forca', reqLevel: 86 }),

  // ── Armadura ──
  beltPiece({ id: 'cinto-de-placas', name: 'Cinto de Placas', beltType: 'armadura' }),
  beltPiece({ id: 'cinto-blindado', name: 'Cinto Blindado', beltType: 'armadura', reqLevel: 15 }),
  beltPiece({ id: 'cinto-de-malha', name: 'Cinto de Malha', beltType: 'armadura', reqLevel: 33 }),
  beltPiece({ id: 'cinto-do-baluarte', name: 'Cinto do Baluarte', beltType: 'armadura', reqLevel: 52 }),
  beltPiece({ id: 'cinto-da-muralha', name: 'Cinto da Muralha', beltType: 'armadura', reqLevel: 70 }),
  beltPiece({ id: 'cinto-do-guardiao', name: 'Cinto do Guardião', beltType: 'armadura', reqLevel: 86 }),

  // ── Escudo de Energia ──
  beltPiece({ id: 'cinto-de-cristal', name: 'Cinto de Cristal', beltType: 'escudo-energia' }),
  beltPiece({ id: 'faixa-cristalina', name: 'Faixa Cristalina', beltType: 'escudo-energia', reqLevel: 15 }),
  beltPiece({ id: 'cinto-runico', name: 'Cinto Rúnico', beltType: 'escudo-energia', reqLevel: 33 }),
  beltPiece({ id: 'cinto-prismatico', name: 'Cinto Prismático', beltType: 'escudo-energia', reqLevel: 52 }),
  beltPiece({ id: 'cinto-do-vidente', name: 'Cinto do Vidente', beltType: 'escudo-energia', reqLevel: 70 }),
  beltPiece({ id: 'cinto-astral', name: 'Cinto Astral', beltType: 'escudo-energia', reqLevel: 86 }),

  // ── Dano Físico ──
  beltPiece({ id: 'faixa-rustica', name: 'Faixa Rústica', beltType: 'dano-fisico' }),
  beltPiece({ id: 'faixa-de-corda', name: 'Faixa de Corda', beltType: 'dano-fisico', reqLevel: 15 }),
  beltPiece({ id: 'cinto-do-brutamontes', name: 'Cinto do Brutamontes', beltType: 'dano-fisico', reqLevel: 33 }),
  beltPiece({ id: 'cinto-do-carrasco', name: 'Cinto do Carrasco', beltType: 'dano-fisico', reqLevel: 52 }),
  beltPiece({ id: 'cinto-do-barbaro', name: 'Cinto do Bárbaro', beltType: 'dano-fisico', reqLevel: 70 }),
  beltPiece({ id: 'cinto-do-aniquilador', name: 'Cinto do Aniquilador', beltType: 'dano-fisico', reqLevel: 86 }),

  // ════════ Amuletos — tipos por implícito (estilo PoE) ════════
  // ── Vida ──
  amuletPiece({ id: 'amuleto-de-coral', name: 'Amuleto de Coral', amuletType: 'vida' }),
  amuletPiece({ id: 'amuleto-rubro', name: 'Amuleto Rubro', amuletType: 'vida', reqLevel: 18 }),
  amuletPiece({ id: 'colar-vital', name: 'Colar Vital', amuletType: 'vida', reqLevel: 40 }),
  amuletPiece({ id: 'talisma-do-sangue', name: 'Talismã do Sangue', amuletType: 'vida', reqLevel: 62 }),
  amuletPiece({ id: 'medalhao-da-vitalidade', name: 'Medalhão da Vitalidade', amuletType: 'vida', reqLevel: 84 }),

  // ── Mana ──
  amuletPiece({ id: 'amuleto-azul', name: 'Amuleto Azul', amuletType: 'mana' }),
  amuletPiece({ id: 'colar-de-cristal', name: 'Colar de Cristal', amuletType: 'mana', reqLevel: 15 }),
  amuletPiece({ id: 'amuleto-arcano', name: 'Amuleto Arcano', amuletType: 'mana', reqLevel: 38 }),
  amuletPiece({ id: 'talisma-do-mago', name: 'Talismã do Mago', amuletType: 'mana', reqLevel: 60 }),
  amuletPiece({ id: 'medalhao-etereo', name: 'Medalhão Etéreo', amuletType: 'mana', reqLevel: 83 }),

  // ── Força ──
  amuletPiece({ id: 'amuleto-de-ambar', name: 'Amuleto de Âmbar', amuletType: 'forca' }),
  amuletPiece({ id: 'colar-de-bronze', name: 'Colar de Bronze', amuletType: 'forca', reqLevel: 14 }),
  amuletPiece({ id: 'talisma-do-guerreiro', name: 'Talismã do Guerreiro', amuletType: 'forca', reqLevel: 36 }),
  amuletPiece({ id: 'amuleto-do-tita', name: 'Amuleto do Titã', amuletType: 'forca', reqLevel: 58 }),
  amuletPiece({ id: 'medalhao-do-colosso', name: 'Medalhão do Colosso', amuletType: 'forca', reqLevel: 82 }),

  // ── Agilidade ──
  amuletPiece({ id: 'amuleto-de-jade', name: 'Amuleto de Jade', amuletType: 'agilidade' }),
  amuletPiece({ id: 'colar-agil', name: 'Colar Ágil', amuletType: 'agilidade', reqLevel: 16 }),
  amuletPiece({ id: 'talisma-do-batedor', name: 'Talismã do Batedor', amuletType: 'agilidade', reqLevel: 38 }),
  amuletPiece({ id: 'amuleto-do-vento', name: 'Amuleto do Vento', amuletType: 'agilidade', reqLevel: 60 }),
  amuletPiece({ id: 'medalhao-da-sombra', name: 'Medalhão da Sombra', amuletType: 'agilidade', reqLevel: 84 }),

  // ── Intelecto ──
  amuletPiece({ id: 'amuleto-de-lapis', name: 'Amuleto de Lápis', amuletType: 'intelecto' }),
  amuletPiece({ id: 'colar-do-erudito', name: 'Colar do Erudito', amuletType: 'intelecto', reqLevel: 17 }),
  amuletPiece({ id: 'talisma-do-sabio', name: 'Talismã do Sábio', amuletType: 'intelecto', reqLevel: 39 }),
  amuletPiece({ id: 'amuleto-do-vidente', name: 'Amuleto do Vidente', amuletType: 'intelecto', reqLevel: 61 }),
  amuletPiece({ id: 'medalhao-astral', name: 'Medalhão Astral', amuletType: 'intelecto', reqLevel: 85 }),

  // ── Todos os Atributos (tipo Ônix) ──
  amuletPiece({ id: 'amuleto-de-onix', name: 'Amuleto de Ônix', amuletType: 'todos-atributos' }),
  amuletPiece({ id: 'colar-equilibrado', name: 'Colar Equilibrado', amuletType: 'todos-atributos', reqLevel: 16 }),
  amuletPiece({ id: 'talisma-da-trindade', name: 'Talismã da Trindade', amuletType: 'todos-atributos', reqLevel: 38 }),
  amuletPiece({ id: 'amuleto-prismatico', name: 'Amuleto Prismático', amuletType: 'todos-atributos', reqLevel: 60 }),
  amuletPiece({ id: 'medalhao-da-harmonia', name: 'Medalhão da Harmonia', amuletType: 'todos-atributos', reqLevel: 84 }),

  // ── Escudo de Energia ──
  amuletPiece({ id: 'perola-azul', name: 'Pérola Azul', amuletType: 'escudo-energia' }),
  amuletPiece({ id: 'amuleto-de-cristal', name: 'Amuleto de Cristal', amuletType: 'escudo-energia', reqLevel: 15 }),
  amuletPiece({ id: 'colar-runico', name: 'Colar Rúnico', amuletType: 'escudo-energia', reqLevel: 37 }),
  amuletPiece({ id: 'talisma-prismatico', name: 'Talismã Prismático', amuletType: 'escudo-energia', reqLevel: 59 }),
  amuletPiece({ id: 'medalhao-do-vazio', name: 'Medalhão do Vazio', amuletType: 'escudo-energia', reqLevel: 86 }),

  // ════════ Aljavas — off-hand de arqueiro, tipos por implícito ════════
  // ── Dano Físico ──
  aljavaPiece({ id: 'aljava-farpada', name: 'Aljava Farpada', aljavaType: 'dano-fisico' }),
  aljavaPiece({ id: 'aljava-de-pontas-de-ferro', name: 'Aljava de Pontas de Ferro', aljavaType: 'dano-fisico', reqLevel: 18 }),
  aljavaPiece({ id: 'aljava-perfurante', name: 'Aljava Perfurante', aljavaType: 'dano-fisico', reqLevel: 40 }),
  aljavaPiece({ id: 'aljava-de-guerra', name: 'Aljava de Guerra', aljavaType: 'dano-fisico', reqLevel: 62 }),
  aljavaPiece({ id: 'aljava-do-aniquilador', name: 'Aljava do Aniquilador', aljavaType: 'dano-fisico', reqLevel: 84 }),

  // ── Chance de Crítico ──
  aljavaPiece({ id: 'aljava-de-duas-pontas', name: 'Aljava de Duas Pontas', aljavaType: 'critico' }),
  aljavaPiece({ id: 'aljava-afiada', name: 'Aljava Afiada', aljavaType: 'critico', reqLevel: 17 }),
  aljavaPiece({ id: 'aljava-de-precisao', name: 'Aljava de Precisão', aljavaType: 'critico', reqLevel: 39 }),
  aljavaPiece({ id: 'aljava-do-predador', name: 'Aljava do Predador', aljavaType: 'critico', reqLevel: 61 }),
  aljavaPiece({ id: 'aljava-do-assassino', name: 'Aljava do Assassino', aljavaType: 'critico', reqLevel: 85 }),

  // ── Vida ──
  aljavaPiece({ id: 'aljava-de-couro', name: 'Aljava de Couro', aljavaType: 'vida' }),
  aljavaPiece({ id: 'aljava-reforcada', name: 'Aljava Reforçada', aljavaType: 'vida', reqLevel: 16 }),
  aljavaPiece({ id: 'aljava-robusta', name: 'Aljava Robusta', aljavaType: 'vida', reqLevel: 38 }),
  aljavaPiece({ id: 'aljava-vital', name: 'Aljava Vital', aljavaType: 'vida', reqLevel: 60 }),
  aljavaPiece({ id: 'aljava-do-sobrevivente', name: 'Aljava do Sobrevivente', aljavaType: 'vida', reqLevel: 84 }),

  // ── Velocidade de Ataque ──
  aljavaPiece({ id: 'aljava-leve', name: 'Aljava Leve', aljavaType: 'vel-ataque' }),
  aljavaPiece({ id: 'aljava-agil', name: 'Aljava Ágil', aljavaType: 'vel-ataque', reqLevel: 15 }),
  aljavaPiece({ id: 'aljava-veloz', name: 'Aljava Veloz', aljavaType: 'vel-ataque', reqLevel: 37 }),
  aljavaPiece({ id: 'aljava-do-vento', name: 'Aljava do Vento', aljavaType: 'vel-ataque', reqLevel: 59 }),
  aljavaPiece({ id: 'aljava-fugaz', name: 'Aljava Fugaz', aljavaType: 'vel-ataque', reqLevel: 83 }),

  // ════════ Anéis — tipos por implícito (estilo PoE) ════════
  // ── Vida ──
  ringPiece({ id: 'anel-de-coral', name: 'Anel de Coral', ringType: 'vida' }),
  ringPiece({ id: 'anel-vermelho', name: 'Anel Vermelho', ringType: 'vida', reqLevel: 18 }),
  ringPiece({ id: 'anel-vital', name: 'Anel Vital', ringType: 'vida', reqLevel: 40 }),
  ringPiece({ id: 'anel-do-sangue', name: 'Anel do Sangue', ringType: 'vida', reqLevel: 62 }),
  ringPiece({ id: 'anel-da-vitalidade', name: 'Anel da Vitalidade', ringType: 'vida', reqLevel: 84 }),

  // ── Mana ──
  ringPiece({ id: 'anel-azul', name: 'Anel Azul', ringType: 'mana' }),
  ringPiece({ id: 'anel-de-cristal', name: 'Anel de Cristal', ringType: 'mana', reqLevel: 15 }),
  ringPiece({ id: 'anel-arcano', name: 'Anel Arcano', ringType: 'mana', reqLevel: 38 }),
  ringPiece({ id: 'anel-do-mago', name: 'Anel do Mago', ringType: 'mana', reqLevel: 60 }),
  ringPiece({ id: 'anel-etereo', name: 'Anel Etéreo', ringType: 'mana', reqLevel: 83 }),

  // ── Resistência ao Fogo ──
  ringPiece({ id: 'anel-rubi', name: 'Anel de Rubi', ringType: 'res-fogo' }),
  ringPiece({ id: 'anel-escaldante', name: 'Anel Escaldante', ringType: 'res-fogo', reqLevel: 20 }),
  ringPiece({ id: 'anel-flamejante', name: 'Anel Flamejante', ringType: 'res-fogo', reqLevel: 42 }),
  ringPiece({ id: 'anel-de-brasa', name: 'Anel de Brasa', ringType: 'res-fogo', reqLevel: 64 }),
  ringPiece({ id: 'anel-igneo', name: 'Anel Ígneo', ringType: 'res-fogo', reqLevel: 86 }),

  // ── Resistência ao Gelo ──
  ringPiece({ id: 'anel-safira', name: 'Anel de Safira', ringType: 'res-gelo' }),
  ringPiece({ id: 'anel-gelido', name: 'Anel Gélido', ringType: 'res-gelo', reqLevel: 16 }),
  ringPiece({ id: 'anel-glacial', name: 'Anel Glacial', ringType: 'res-gelo', reqLevel: 39 }),
  ringPiece({ id: 'anel-de-cristal-gelado', name: 'Anel de Cristal Gelado', ringType: 'res-gelo', reqLevel: 61 }),
  ringPiece({ id: 'anel-do-inverno', name: 'Anel do Inverno', ringType: 'res-gelo', reqLevel: 84 }),

  // ── Resistência ao Raio ──
  ringPiece({ id: 'anel-topazio', name: 'Anel de Topázio', ringType: 'res-raio' }),
  ringPiece({ id: 'anel-estatico', name: 'Anel Estático', ringType: 'res-raio', reqLevel: 22 }),
  ringPiece({ id: 'anel-trovejante', name: 'Anel Trovejante', ringType: 'res-raio', reqLevel: 44 }),
  ringPiece({ id: 'anel-de-tempestade', name: 'Anel de Tempestade', ringType: 'res-raio', reqLevel: 66 }),
  ringPiece({ id: 'anel-do-trovao', name: 'Anel do Trovão', ringType: 'res-raio', reqLevel: 88 }),

  // ── Resistência ao Caos ──
  ringPiece({ id: 'anel-de-ametista', name: 'Anel de Ametista', ringType: 'res-caos' }),
  ringPiece({ id: 'anel-profano', name: 'Anel Profano', ringType: 'res-caos', reqLevel: 25 }),
  ringPiece({ id: 'anel-corrompido', name: 'Anel Corrompido', ringType: 'res-caos', reqLevel: 48 }),
  ringPiece({ id: 'anel-abissal', name: 'Anel Abissal', ringType: 'res-caos', reqLevel: 70 }),
  ringPiece({ id: 'anel-do-caos', name: 'Anel do Caos', ringType: 'res-caos', reqLevel: 90 }),

  // ── Dano Físico ──
  ringPiece({ id: 'anel-de-ferro', name: 'Anel de Ferro', ringType: 'dano-fisico' }),
  ringPiece({ id: 'anel-de-bronze', name: 'Anel de Bronze', ringType: 'dano-fisico', reqLevel: 14 }),
  ringPiece({ id: 'anel-de-aco', name: 'Anel de Aço', ringType: 'dano-fisico', reqLevel: 36 }),
  ringPiece({ id: 'anel-do-guerreiro', name: 'Anel do Guerreiro', ringType: 'dano-fisico', reqLevel: 58 }),
  ringPiece({ id: 'anel-do-carrasco', name: 'Anel do Carrasco', ringType: 'dano-fisico', reqLevel: 82 }),

  // ════════ Escudos — 6 tipos defensivos + Chance de Bloqueio (slotMult 0.5) ════════
  // ── Armadura ──
  shieldPiece({ id: 'rodela-de-ferro', name: 'Rodela de Ferro', armorType: 'armadura' }),
  shieldPiece({ id: 'escudo-de-ferro', name: 'Escudo de Ferro', armorType: 'armadura', reqLevel: 6 }),
  shieldPiece({ id: 'escudo-de-placas', name: 'Escudo de Placas', armorType: 'armadura', reqLevel: 13 }),
  shieldPiece({ id: 'escudo-de-batalha', name: 'Escudo de Batalha', armorType: 'armadura', reqLevel: 21 }),
  shieldPiece({ id: 'escudo-torre', name: 'Escudo Torre', armorType: 'armadura', reqLevel: 30 }),
  shieldPiece({ id: 'pave', name: 'Pavês', armorType: 'armadura', reqLevel: 40 }),
  shieldPiece({ id: 'escudo-de-cavaleiro', name: 'Escudo de Cavaleiro', armorType: 'armadura', reqLevel: 51 }),
  shieldPiece({ id: 'grande-escudo', name: 'Grande Escudo', armorType: 'armadura', reqLevel: 63 }),
  shieldPiece({ id: 'escudo-runico', name: 'Escudo Rúnico', armorType: 'armadura', reqLevel: 76 }),
  shieldPiece({ id: 'escudo-abissal', name: 'Escudo Abissal', armorType: 'armadura', reqLevel: 90 }),

  // ── Evasão ──
  shieldPiece({ id: 'broquel-de-couro', name: 'Broquel de Couro', armorType: 'evasao' }),
  shieldPiece({ id: 'broquel-tachonado', name: 'Broquel Tachonado', armorType: 'evasao', reqLevel: 5 }),
  shieldPiece({ id: 'rodela-de-couro', name: 'Rodela de Couro', armorType: 'evasao', reqLevel: 12 }),
  shieldPiece({ id: 'broquel-de-batedor', name: 'Broquel de Batedor', armorType: 'evasao', reqLevel: 20 }),
  shieldPiece({ id: 'broquel-de-cacador', name: 'Broquel de Caçador', armorType: 'evasao', reqLevel: 29 }),
  shieldPiece({ id: 'broquel-de-sombras', name: 'Broquel de Sombras', armorType: 'evasao', reqLevel: 39 }),
  shieldPiece({ id: 'broquel-furtivo', name: 'Broquel Furtivo', armorType: 'evasao', reqLevel: 50 }),
  shieldPiece({ id: 'broquel-do-assassino', name: 'Broquel do Assassino', armorType: 'evasao', reqLevel: 62 }),
  shieldPiece({ id: 'broquel-espectral', name: 'Broquel Espectral', armorType: 'evasao', reqLevel: 75 }),
  shieldPiece({ id: 'broquel-do-vento', name: 'Broquel do Vento', armorType: 'evasao', reqLevel: 89 }),

  // ── Escudo de Energia ──
  shieldPiece({ id: 'egide-de-cristal', name: 'Égide de Cristal', armorType: 'escudo-energia' }),
  shieldPiece({ id: 'escudo-de-vidro', name: 'Escudo de Vidro', armorType: 'escudo-energia', reqLevel: 7 }),
  shieldPiece({ id: 'egide-de-aprendiz', name: 'Égide de Aprendiz', armorType: 'escudo-energia', reqLevel: 15 }),
  shieldPiece({ id: 'escudo-arcano', name: 'Escudo Arcano', armorType: 'escudo-energia', reqLevel: 24 }),
  shieldPiece({ id: 'egide-encantada', name: 'Égide Encantada', armorType: 'escudo-energia', reqLevel: 34 }),
  shieldPiece({ id: 'escudo-prismatico', name: 'Escudo Prismático', armorType: 'escudo-energia', reqLevel: 45 }),
  shieldPiece({ id: 'egide-do-sabio', name: 'Égide do Sábio', armorType: 'escudo-energia', reqLevel: 57 }),
  shieldPiece({ id: 'escudo-etereo', name: 'Escudo Etéreo', armorType: 'escudo-energia', reqLevel: 70 }),
  shieldPiece({ id: 'egide-astral', name: 'Égide Astral', armorType: 'escudo-energia', reqLevel: 83 }),
  shieldPiece({ id: 'escudo-do-vazio', name: 'Escudo do Vazio', armorType: 'escudo-energia', reqLevel: 92 }),

  // ── Armadura / Evasão ──
  shieldPiece({ id: 'escudo-de-escamas', name: 'Escudo de Escamas', armorType: 'armadura-evasao' }),
  shieldPiece({ id: 'escudo-de-couro-batido', name: 'Escudo de Couro Batido', armorType: 'armadura-evasao', reqLevel: 8 }),
  shieldPiece({ id: 'rodela-lamelar', name: 'Rodela Lamelar', armorType: 'armadura-evasao', reqLevel: 16 }),
  shieldPiece({ id: 'escudo-de-batedor', name: 'Escudo de Batedor', armorType: 'armadura-evasao', reqLevel: 25 }),
  shieldPiece({ id: 'escudo-de-guardiao', name: 'Escudo de Guardião', armorType: 'armadura-evasao', reqLevel: 35 }),
  shieldPiece({ id: 'escudo-do-templario', name: 'Escudo do Templário', armorType: 'armadura-evasao', reqLevel: 46 }),
  shieldPiece({ id: 'escudo-reforcado', name: 'Escudo Reforçado', armorType: 'armadura-evasao', reqLevel: 58 }),
  shieldPiece({ id: 'escudo-do-crepusculo', name: 'Escudo do Crepúsculo', armorType: 'armadura-evasao', reqLevel: 71 }),
  shieldPiece({ id: 'rodela-lamelar-runica', name: 'Rodela Lamelar Rúnica', armorType: 'armadura-evasao', reqLevel: 84 }),
  shieldPiece({ id: 'escudo-do-ocaso', name: 'Escudo do Ocaso', armorType: 'armadura-evasao', reqLevel: 94 }),

  // ── Armadura / Escudo de Energia ──
  shieldPiece({ id: 'escudo-encantado', name: 'Escudo Encantado', armorType: 'armadura-energia' }),
  shieldPiece({ id: 'escudo-bordado', name: 'Escudo Bordado', armorType: 'armadura-energia', reqLevel: 4 }),
  shieldPiece({ id: 'escudo-de-malha-runica', name: 'Escudo de Malha Rúnica', armorType: 'armadura-energia', reqLevel: 11 }),
  shieldPiece({ id: 'escudo-consagrado', name: 'Escudo Consagrado', armorType: 'armadura-energia', reqLevel: 19 }),
  shieldPiece({ id: 'escudo-bento', name: 'Escudo Bento', armorType: 'armadura-energia', reqLevel: 28 }),
  shieldPiece({ id: 'pave-arcano', name: 'Pavês Arcano', armorType: 'armadura-energia', reqLevel: 38 }),
  shieldPiece({ id: 'escudo-sagrado', name: 'Escudo Sagrado', armorType: 'armadura-energia', reqLevel: 49 }),
  shieldPiece({ id: 'egide-de-batalha', name: 'Égide de Batalha', armorType: 'armadura-energia', reqLevel: 61 }),
  shieldPiece({ id: 'escudo-runico-sagrado', name: 'Escudo Rúnico Sagrado', armorType: 'armadura-energia', reqLevel: 74 }),
  shieldPiece({ id: 'egide-abissal', name: 'Égide Abissal', armorType: 'armadura-energia', reqLevel: 88 }),

  // ── Evasão / Escudo de Energia ──
  shieldPiece({ id: 'broquel-de-viajante', name: 'Broquel de Viajante', armorType: 'evasao-energia' }),
  shieldPiece({ id: 'broquel-leve-encantado', name: 'Broquel Leve Encantado', armorType: 'evasao-energia', reqLevel: 9 }),
  shieldPiece({ id: 'broquel-elfico', name: 'Broquel Élfico', armorType: 'evasao-energia', reqLevel: 18 }),
  shieldPiece({ id: 'broquel-do-andarilho', name: 'Broquel do Andarilho', armorType: 'evasao-energia', reqLevel: 27 }),
  shieldPiece({ id: 'broquel-arcano', name: 'Broquel Arcano', armorType: 'evasao-energia', reqLevel: 37 }),
  shieldPiece({ id: 'broquel-fantasma', name: 'Broquel Fantasma', armorType: 'evasao-energia', reqLevel: 48 }),
  shieldPiece({ id: 'broquel-sombrio', name: 'Broquel Sombrio', armorType: 'evasao-energia', reqLevel: 60 }),
  shieldPiece({ id: 'broquel-do-vidente', name: 'Broquel do Vidente', armorType: 'evasao-energia', reqLevel: 73 }),
  shieldPiece({ id: 'broquel-sideral', name: 'Broquel Sideral', armorType: 'evasao-energia', reqLevel: 86 }),
  shieldPiece({ id: 'broquel-do-feiticeiro', name: 'Broquel do Feiticeiro', armorType: 'evasao-energia', reqLevel: 95 }),
];

export function getBaseById(id: string): ItemBase | undefined {
  return ITEM_BASES.find((b) => b.id === id);
}

/** Tipos de arma de DUAS MÃOS — ocupam as duas mãos (bloqueiam a secundária). */
const TWO_HANDED_WEAPONS: WeaponType[] = [
  'espada-duas-maos',
  'machado-duas-maos',
  'maca-duas-maos',
  'alabarda',
  'foice',
  'besta',
  'cajado',
];

/** Armas de UMA MÃO que, ainda assim, só podem ir na Mão Principal (sem dual-wield). */
const PRIMARY_ONLY_ONE_HANDED: WeaponType[] = ['lanca', 'arco'];

export function isTwoHandedWeaponType(wt: WeaponType): boolean {
  return TWO_HANDED_WEAPONS.includes(wt);
}

/** Só pode ser equipada na Mão Principal (2 mãos, ou 1 mão exclusiva de principal como Lança/Arco). */
export function isPrimaryOnlyWeaponType(wt: WeaponType): boolean {
  return isTwoHandedWeaponType(wt) || PRIMARY_ONLY_ONE_HANDED.includes(wt);
}

/** weaponType de um item instanciado (resolve pela base). */
export function weaponTypeOfItem(item: Item): WeaponType | undefined {
  const baseId = resolveItemBaseId(item);
  return baseId ? getBaseById(baseId)?.weaponType : undefined;
}

/** Resolve o id da base a partir do item instanciado (ex: starter-espada-curta → espada-curta). */
export function resolveItemBaseId(item: Item): string | undefined {
  const bySuffix = ITEM_BASES.find((b) => item.id === b.id || item.id.endsWith(`-${b.id}`));
  if (bySuffix) return bySuffix.id;
  return ITEM_BASES.find((b) => b.name === item.name && b.slot === item.slot)?.id;
}

/**
 * Constrói um Item Comum (sem afixos) a partir do catálogo de bases.
 * `baseStats` viram `stats` do item marcados como `kind: 'base'` pra que o
 * tooltip exiba na seção de stats inerentes (acima das divisórias).
 *
 * `idPrefix` permite distinguir contextos do mesmo item base — ex: 'shop-X'
 * pra itens à venda, 'starter-X' pra equipamento inicial, etc.
 */
export function makeBaseItem(baseId: string, idPrefix = 'item'): Item {
  const base = ITEM_BASES.find((b) => b.id === baseId);
  if (!base) throw new Error(`Base "${baseId}" não encontrada`);
  return {
    id: `${idPrefix}-${base.id}`,
    name: base.name,
    slot: base.slot,
    rarity: 'comum',
    stats: base.baseStats.map((s) => ({ ...s, kind: 'base' as const })),
    description: base.description,
  };
}
