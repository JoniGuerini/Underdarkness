import type { Item, ItemStat, Rarity } from '../types';
import { ITEM_BASES, type ItemBase } from '../data/itemBases';
import { ITEM_MODS, rollModStat, type ItemModDef } from '../data/itemMods';

/**
 * GERADOR DE EQUIPAMENTO — o coração do loot procedural.
 *
 * Fluxo (regras validadas com o usuário):
 * 1. ilvl do item = nível do monstro que dropou (vem de fora).
 * 2. Base sorteada entre as com `reqLevel` ≤ ilvl (dropa o que o mundo daquele
 *    nível fabrica — nunca uma base que o personagem daquela área não veria).
 * 3. Raridade sorteada por peso (comum 55% / mágico 35% / raro 10%).
 * 4. Afixos sorteados da lista mestra respeitando os caps da raridade
 *    (mágico 1–2, máx 1 prefixo + 1 sufixo; raro 3–6, máx 3 + 3), sem repetir
 *    mod. O tier de cada afixo respeita o teto do ilvl com pesos decrescentes
 *    (cada tier acima 2× mais raro) — ver itemMods.ts.
 */

const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

// ────────────────────────────────────────────────────────────────
// Raridade
// ────────────────────────────────────────────────────────────────

/**
 * Pesos de raridade do drop. Mágico e raro são DE VERDADE raros (decisão do
 * usuário): com EQUIP_DROP_CHANCE de 12%, por vitória isso dá ~10% comum,
 * ~1,9% mágico (1 a cada ~52 kills) e ~0,24% raro (1 a cada ~415 kills).
 * Ajustar aqui se o ritmo do jogo pedir.
 */
const RARITY_WEIGHTS: { rarity: Rarity; weight: number }[] = [
  { rarity: 'comum', weight: 82 },
  { rarity: 'magico', weight: 16 },
  { rarity: 'raro', weight: 2 },
];

export function rollDropRarity(): Rarity {
  const total = RARITY_WEIGHTS.reduce((a, w) => a + w.weight, 0);
  let roll = Math.random() * total;
  for (const { rarity, weight } of RARITY_WEIGHTS) {
    roll -= weight;
    if (roll < 0) return rarity;
  }
  return 'comum';
}

// ────────────────────────────────────────────────────────────────
// Afixos
// ────────────────────────────────────────────────────────────────

/** Caps de afixos por raridade — espelha o guia de Raridade do Códice. */
const AFFIX_RULES: Partial<Record<Rarity, { min: number; max: number; perCategory: number }>> = {
  magico: { min: 1, max: 2, perCategory: 1 },
  raro: { min: 3, max: 6, perCategory: 3 },
};

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sorteia os afixos de um item: mods únicos, caps por categoria, tier por ilvl. */
function rollAffixes(rarity: Rarity, ilvl: number): ItemStat[] {
  const rules = AFFIX_RULES[rarity];
  if (!rules) return [];

  const total = r(rules.min, rules.max);
  const picked: ItemModDef[] = [];
  let prefixes = 0;
  let suffixes = 0;

  for (const def of shuffle(ITEM_MODS)) {
    if (picked.length >= total) break;
    if (def.category === 'prefix') {
      if (prefixes >= rules.perCategory) continue;
      prefixes++;
    } else {
      if (suffixes >= rules.perCategory) continue;
      suffixes++;
    }
    picked.push(def);
  }

  // Prefixos primeiro, sufixos depois — o tooltip insere a divisória por `kind`.
  picked.sort((a, b) => (a.category === b.category ? 0 : a.category === 'prefix' ? -1 : 1));
  return picked.map((def) => rollModStat(def, ilvl));
}

// ────────────────────────────────────────────────────────────────
// Geração completa
// ────────────────────────────────────────────────────────────────
// Nome do item = nome da base — a COR (raridade) diferencia mágico/raro.
// Decisão do usuário: sem nome expandido por afixo (6 mods viraria um nome
// quilométrico); os afixos falam por si no tooltip.

/** Bases que podem dropar num ilvl — reqLevel ausente conta como nível 1. */
export function getEligibleBases(ilvl: number): ItemBase[] {
  return ITEM_BASES.filter((b) => (b.reqLevel ?? 1) <= ilvl);
}

let dropSeq = 0;

/**
 * Gera um equipamento dropado por um monstro de nível `ilvl`.
 * Retorna null se nenhuma base é elegível (não acontece com ilvl ≥ 1).
 */
export function generateEquipment(ilvl: number): Item | null {
  const pool = getEligibleBases(ilvl);
  if (pool.length === 0) return null;

  const base = pool[Math.floor(Math.random() * pool.length)];
  const rarity = rollDropRarity();
  const affixStats = rollAffixes(rarity, ilvl);

  const baseStats: ItemStat[] = base.baseStats.map((s) => ({ ...s, kind: 'base' as const }));

  return {
    id: `drop-${Date.now()}-${dropSeq++}`,
    name: base.name,
    slot: base.slot,
    rarity,
    ilvl,
    stats: [...baseStats, ...affixStats],
    description: base.description,
  };
}
