/**
 * Gerador procedural de itens. Combina uma base do catálogo ([data/itemBases.ts])
 * com afixos do catálogo de mods ([data/itemMods.ts]) pra produzir equipamento
 * rolado — com efeito numérico real na ficha, não só texto.
 *
 * Fluxo: escolhe base compatível com o slot e o nível do item → decide raridade
 * → sorteia prefixos/sufixos distintos (respeitando os limites por raridade) →
 * monta os `ItemStat` (texto + efeito) → compõe o nome estilo PoE.
 */

import type { Item, ItemSlot, ItemStat, Rarity } from '../types';
import { ITEM_BASES, getBaseById, makeBaseItem, type ItemBase } from '../data/itemBases';
import { ITEM_MODS, rollModStat, type ItemModDef } from '../data/itemMods';

/** Slots que o gerador pode produzir (equipáveis; aljava fica de fora do pool). */
export const LOOT_SLOTS: ItemSlot[] = [
  'arma',
  'escudo',
  'cabeca',
  'peito',
  'maos',
  'pes',
  'cinto',
  'amuleto',
  'anel',
];

export interface RollItemOptions {
  /** Slot desejado — se ausente, sorteia entre `LOOT_SLOTS`. */
  slot?: ItemSlot;
  /** Nível do item — limita bases (reqLevel) e escala a força implícita. */
  itemLevel: number;
  /** Força uma raridade — se ausente, sorteia com `bonusRarity`. */
  rarity?: Rarity;
  /** Empurra a rolagem de raridade pro topo (afixos de mapa aumentam isso). */
  bonusRarity?: number;
  /** Prefixo do id gerado (pra distinguir contexto — ex: 'mapa', 'drop'). */
  idPrefix?: string;
}

function rand(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Sorteia a raridade. `bonusRarity` (0..~60) desloca peso pro Raro. Único e
 * Lendário ficam de fora do gerador v1 — são curados.
 */
export function rollRarity(bonusRarity = 0): Rarity {
  const raroW = 15 + Math.max(0, bonusRarity);
  const magicoW = 45;
  const comumW = Math.max(5, 40 - Math.max(0, bonusRarity));
  const total = raroW + magicoW + comumW;
  const roll = Math.random() * total;
  if (roll < raroW) return 'raro';
  if (roll < raroW + magicoW) return 'magico';
  return 'comum';
}

/** Base compatível com o slot, dentro de uma janela de nível pra dar variedade. */
function pickBase(slot: ItemSlot, itemLevel: number): ItemBase | undefined {
  const eligible = ITEM_BASES.filter(
    (b) => b.slot === slot && (b.reqLevel ?? 1) <= itemLevel,
  );
  const pool = eligible.length > 0 ? eligible : ITEM_BASES.filter((b) => b.slot === slot);
  if (pool.length === 0) return undefined;
  const maxReq = Math.max(...pool.map((b) => b.reqLevel ?? 1));
  const window = pool.filter((b) => (b.reqLevel ?? 1) >= maxReq - 12);
  return pick(window.length > 0 ? window : pool);
}

/** Alguns afixos só fazem sentido em certos slots (ex: bloqueio exige escudo). */
function modAllowedForSlot(mod: ItemModDef, slot: ItemSlot): boolean {
  if (mod.id === 'bloqueio') return slot === 'escudo';
  return true;
}

/** Quantos afixos (e teto de prefixo/sufixo) por raridade. */
function affixBudget(rarity: Rarity): { total: number; maxPrefix: number; maxSuffix: number } {
  if (rarity === 'magico') return { total: rand(1, 2), maxPrefix: 1, maxSuffix: 1 };
  if (rarity === 'raro') return { total: rand(3, 6), maxPrefix: 3, maxSuffix: 3 };
  return { total: 0, maxPrefix: 0, maxSuffix: 0 };
}

/** Escolhe afixos distintos (por id) respeitando os tetos de prefixo/sufixo. */
function pickAffixes(slot: ItemSlot, rarity: Rarity): { prefixes: ItemModDef[]; suffixes: ItemModDef[] } {
  const { total, maxPrefix, maxSuffix } = affixBudget(rarity);
  if (total === 0) return { prefixes: [], suffixes: [] };

  const prefixPool = shuffle(
    ITEM_MODS.filter((m) => m.category === 'prefix' && modAllowedForSlot(m, slot)),
  );
  const suffixPool = shuffle(
    ITEM_MODS.filter((m) => m.category === 'suffix' && modAllowedForSlot(m, slot)),
  );

  const prefixes: ItemModDef[] = [];
  const suffixes: ItemModDef[] = [];
  while (prefixes.length + suffixes.length < total) {
    const canPrefix = prefixes.length < maxPrefix && prefixPool.length > 0;
    const canSuffix = suffixes.length < maxSuffix && suffixPool.length > 0;
    if (!canPrefix && !canSuffix) break;
    const takePrefix = canPrefix && (!canSuffix || Math.random() < 0.5);
    if (takePrefix) prefixes.push(prefixPool.pop()!);
    else suffixes.push(suffixPool.pop()!);
  }
  return { prefixes, suffixes };
}

/** Gênero do nome da base (heurística pela terminação da primeira palavra). */
function inferGender(baseName: string): 'm' | 'f' {
  const first = baseName.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  return first.endsWith('a') ? 'f' : 'm';
}

/** Nome estilo PoE: [prefixo] Base [sufixo] usando o 1º afixo com fragmento. */
function composeName(base: ItemBase, prefixes: ItemModDef[], suffixes: ItemModDef[]): string {
  let name = base.name;
  const namedPrefix = prefixes.find((m) => m.namePrefix);
  if (namedPrefix?.namePrefix) {
    const gender = inferGender(base.name);
    name = `${namedPrefix.namePrefix[gender]} ${name}`;
  }
  const namedSuffix = suffixes.find((m) => m.nameSuffix);
  if (namedSuffix?.nameSuffix) {
    name = `${name} ${namedSuffix.nameSuffix}`;
  }
  return name;
}

/**
 * Rola um item completo. `makeBaseItem` fornece nome, slot, descrição e stats
 * inerentes (kind 'base'); anexamos prefixos e sufixos rolados e reescrevemos
 * nome e raridade.
 */
export function rollItem(opts: RollItemOptions): Item | null {
  const slot = opts.slot ?? pick(LOOT_SLOTS);
  const base = pickBase(slot, opts.itemLevel);
  if (!base) return null;

  const rarity = opts.rarity ?? rollRarity(opts.bonusRarity ?? 0);
  const idPrefix = opts.idPrefix ?? 'loot';
  const item = makeBaseItem(base.id, idPrefix);
  const uniqueId = `${idPrefix}-${base.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  if (rarity === 'comum') {
    return { ...item, id: uniqueId, rarity: 'comum' };
  }

  const { prefixes, suffixes } = pickAffixes(slot, rarity);
  const baseStats = item.stats ?? [];
  const affixStats: ItemStat[] = [
    ...prefixes.map((m) => rollModStat(m)),
    ...suffixes.map((m) => rollModStat(m)),
  ];

  return {
    ...item,
    id: uniqueId,
    name: composeName(base, prefixes, suffixes),
    rarity,
    stats: [...baseStats, ...affixStats],
  };
}

/** Conveniência: rola N itens de uma vez (usado pelas recompensas de expedição). */
export function rollItems(count: number, opts: Omit<RollItemOptions, 'slot'> & { slot?: ItemSlot }): Item[] {
  const out: Item[] = [];
  for (let i = 0; i < count; i++) {
    const it = rollItem(opts);
    if (it) out.push(it);
  }
  return out;
}

/** Reexport util pra quem quiser resolver uma base por id sem importar itemBases. */
export { getBaseById };
