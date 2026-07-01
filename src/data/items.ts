import type { EquipSlot, Item, ItemSlot, Rarity } from '../types';
import { weaponTypeOfItem, isTwoHandedWeaponType, isPrimaryOnlyWeaponType } from './itemBases';

export const INVENTORY_SIZE = 36;

/**
 * Slots de equipado agrupados por função visual:
 * - Armadura (cabeça, peito, mãos, pés)
 * - Acessórios (amuleto, anéis)
 * - Armas (arma principal, escudo / mão secundária)
 *
 * A ordem aqui controla como aparecem na coluna esquerda do inventário,
 * com separadores entre grupos.
 */
export const EQUIP_GROUPS: { slots: EquipSlot[] }[] = [
  { slots: ['cabeca', 'peito', 'maos', 'pes', 'cinto'] },
  { slots: ['amuleto', 'anel1', 'anel2'] },
  { slots: ['arma', 'escudo'] },
];

export const EQUIP_SLOTS: EquipSlot[] = EQUIP_GROUPS.flatMap((g) => g.slots);

/**
 * Ordem dos 10 slots no layout paper-doll (estilo PoE) — 3×4 grid.
 * `null` representa célula vazia do grid (gap visual, não renderiza slot).
 *
 *   [Amuleto] [Cabeça]   [Anel 1]
 *   [Arma]    [Peito]    [Escudo]
 *   [Mãos]    [Cinto]    [Anel 2]
 *   [ — ]     [Pés]      [ — ]
 *
 * - Topo: acessórios pequenos flanqueando o elmo
 * - Meio: braços + torso (weapon, chest, shield)
 * - Cintura: mãos, cinto, segundo anel
 * - Base: pés sozinhos, centralizados
 */
export const PAPER_DOLL_ORDER: (EquipSlot | null)[] = [
  'amuleto', 'cabeca', 'anel1',
  'arma',    'peito',  'escudo',
  'maos',    'cinto',  'anel2',
  null,      'pes',    null,
];

/** Label da posição equipada (anel1 e anel2 mostram só "Anel" — não diferenciamos). */
export const EQUIP_SLOT_LABEL: Record<EquipSlot, string> = {
  cabeca: 'Cabeça',
  peito: 'Peito',
  maos: 'Mãos',
  pes: 'Pés',
  cinto: 'Cinto',
  amuleto: 'Amuleto',
  anel1: 'Anel',
  anel2: 'Anel',
  arma: 'Arma Principal',
  escudo: 'Mão Secundária',
};

/** Label da categoria do item — usado em tooltips de item. */
export const ITEM_SLOT_LABEL: Record<ItemSlot, string> = {
  cabeca: 'Cabeça',
  peito: 'Peito',
  maos: 'Mãos',
  pes: 'Pés',
  cinto: 'Cinto',
  amuleto: 'Amuleto',
  anel: 'Anel',
  arma: 'Arma Principal',
  escudo: 'Escudo',
  aljava: 'Aljava',
};

/** O item é uma arma de duas mãos? (ocupa as duas mãos) */
export function isTwoHandedItem(item: Item): boolean {
  const wt = weaponTypeOfItem(item);
  return wt ? isTwoHandedWeaponType(wt) : false;
}

/** O item é um arco? (Mão Principal exige Aljava na Secundária) */
export function isBowItem(item: Item): boolean {
  return weaponTypeOfItem(item) === 'arco';
}

/**
 * Pode equipar `item` no slot `equipSlot`, dado o estado atual de equipados?
 *
 * Regras:
 * - **Anel** → anel1 ou anel2.
 * - **Off-hand** (Escudo/Aljava) → só a Mão Secundária, e não se houver arma de
 *   duas mãos na Principal (ela ocupa as duas mãos).
 * - **Arma** → sempre pode na Principal. Na Secundária só se for de uma mão que
 *   permita dual-wield (Lança e Arco não) E já houver uma arma na Principal.
 * - **Armaduras** → o slot da própria categoria.
 */
export function canEquipInSlot(
  item: Item,
  equipSlot: EquipSlot,
  equipped: Record<EquipSlot, Item | null>,
): boolean {
  const s = item.slot;
  if (s === null) return false;
  if (s === 'anel') return equipSlot === 'anel1' || equipSlot === 'anel2';

  if (s === 'escudo' || s === 'aljava') {
    if (equipSlot !== 'escudo') return false;
    const main = equipped.arma;
    if (main && isTwoHandedItem(main)) return false;
    // Arco na Principal → Secundária só aceita Aljava.
    if (main && isBowItem(main) && s !== 'aljava') return false;
    return true;
  }

  if (s === 'arma') {
    if (equipSlot === 'arma') return true;
    if (equipSlot === 'escudo') {
      // Arco na Principal → Secundária só aceita Aljava (nenhuma arma).
      if (equipped.arma && isBowItem(equipped.arma)) return false;
      const wt = weaponTypeOfItem(item);
      if (!wt || isPrimaryOnlyWeaponType(wt)) return false; // 2 mãos, Lança, Arco: só Principal
      return equipped.arma != null; // 2ª arma exige uma arma na Principal
    }
    return false;
  }

  return s === equipSlot;
}

/** Primeira posição vazia compatível (respeita as regras de mão). */
export function findEmptyEquipSlot(
  item: Item,
  equipped: Record<EquipSlot, Item | null>,
): EquipSlot | null {
  for (const slot of EQUIP_SLOTS) {
    if (canEquipInSlot(item, slot, equipped) && equipped[slot] === null) return slot;
  }
  return null;
}

/** Primeira posição compatível, mesmo que ocupada — fallback pra swap. */
export function findFirstCompatibleEquipSlot(
  item: Item,
  equipped: Record<EquipSlot, Item | null>,
): EquipSlot | null {
  for (const slot of EQUIP_SLOTS) {
    if (canEquipInSlot(item, slot, equipped)) return slot;
  }
  return null;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  comum: 'Comum',
  magico: 'Mágico',
  raro: 'Raro',
  unico: 'Único',
  lendario: 'Lendário',
};

// Estado vazio
// ============================================================================
export function emptyEquipped(): Record<EquipSlot, Item | null> {
  return {
    cabeca: null,
    peito: null,
    maos: null,
    pes: null,
    cinto: null,
    amuleto: null,
    anel1: null,
    anel2: null,
    arma: null,
    escudo: null,
  };
}

export function emptyInventory(): (Item | null)[] {
  return new Array(INVENTORY_SIZE).fill(null);
}

