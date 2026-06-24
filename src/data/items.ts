import type { EquipSlot, Item, ItemSlot, Rarity } from '../types';

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
  escudo: 'Escudo',
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
};

/**
 * Verifica se um item de uma certa categoria pode ir num slot de equipamento.
 * Caso especial: item de categoria 'anel' aceita posições anel1 ou anel2.
 */
export function itemFitsInSlot(itemSlot: ItemSlot | null, equipSlot: EquipSlot): boolean {
  if (itemSlot === null) return false;
  if (itemSlot === 'anel') return equipSlot === 'anel1' || equipSlot === 'anel2';
  return itemSlot === equipSlot;
}

/**
 * Encontra a primeira posição equipada compatível e vazia.
 * Pra click-to-equip: anel vai pra anel1 se livre, senão anel2.
 */
export function findEmptyEquipSlot(
  itemSlot: ItemSlot,
  equipped: Record<EquipSlot, Item | null>,
): EquipSlot | null {
  for (const slot of EQUIP_SLOTS) {
    if (itemFitsInSlot(itemSlot, slot) && equipped[slot] === null) return slot;
  }
  return null;
}

/**
 * Primeira posição compatível, mesmo que ocupada — fallback pra swap
 * quando todas as posições da categoria já têm item.
 */
export function findFirstCompatibleEquipSlot(itemSlot: ItemSlot): EquipSlot | null {
  for (const slot of EQUIP_SLOTS) {
    if (itemFitsInSlot(itemSlot, slot)) return slot;
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

