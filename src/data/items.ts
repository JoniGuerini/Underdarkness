import type { ClassKey, EquipSlot, Item, ItemSlot, ItemStat, Rarity } from '../types';

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
  { slots: ['cabeca', 'peito', 'maos', 'pes'] },
  { slots: ['amuleto', 'anel1', 'anel2'] },
  { slots: ['arma', 'escudo'] },
];

export const EQUIP_SLOTS: EquipSlot[] = EQUIP_GROUPS.flatMap((g) => g.slots);

/**
 * Ordem dos 9 slots no layout paper-doll (estilo PoE) — 3×3 grid.
 *
 *   [Amuleto] [Cabeça]   [Anel 1]
 *   [Arma]    [Peito]    [Escudo]
 *   [Mãos]    [Pés]      [Anel 2]
 *
 * - Topo: acessórios pequenos flanqueando o elmo
 * - Meio: braços + torso (weapon, chest, shield)
 * - Base: mãos, pés e segundo anel
 */
export const PAPER_DOLL_ORDER: EquipSlot[] = [
  'amuleto', 'cabeca', 'anel1',
  'arma',    'peito',  'escudo',
  'maos',    'pes',    'anel2',
];

/** Label da posição equipada (anel1 e anel2 mostram só "Anel" — não diferenciamos). */
export const EQUIP_SLOT_LABEL: Record<EquipSlot, string> = {
  cabeca: 'Cabeça',
  peito: 'Peito',
  maos: 'Mãos',
  pes: 'Pés',
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

// ============================================================================
// Catálogo
// ============================================================================
const newId = () => Math.random().toString(36).slice(2, 10);

interface ItemSeed {
  name: string;
  slot: ItemSlot | null;
  rarity?: Rarity;
  stats?: ItemStat[];
  description?: string;
  stackable?: boolean;
  stack?: number;
}

const make = (seed: ItemSeed): Item => ({
  id: `item-${newId()}`,
  name: seed.name,
  slot: seed.slot,
  rarity: seed.rarity ?? 'comum',
  stats: seed.stats,
  description: seed.description,
  stackable: seed.stackable,
  stack: seed.stack,
});

const ITEMS = {
  // ===== Guerreiro =====
  espadaLonga: () =>
    make({
      name: 'Espada Longa',
      slot: 'arma',
      rarity: 'comum',
      stats: [{ text: '+6 Dano Físico', color: 'fisico' }],
    }),
  martelo: () =>
    make({
      name: 'Martelo de Guerra',
      slot: 'arma',
      rarity: 'magico',
      stats: [
        { text: '+9 Dano Físico', color: 'fisico' },
        { text: '+5% Velocidade de Ataque', color: 'agilidade' },
      ],
      description: 'Forjado em uma única noite por um ferreiro sem nome.',
    }),
  lanca: () =>
    make({
      name: 'Lança Sangrenta',
      slot: 'arma',
      rarity: 'raro',
      stats: [
        { text: '+12 Dano Físico', color: 'fisico' },
        { text: '+3% Roubo de Vida', color: 'vida' },
        { text: '+8% Chance de Crítico', color: 'critico' },
      ],
      description: 'A ponta nunca seca por completo.',
    }),
  escudoTorre: () =>
    make({
      name: 'Escudo de Torre',
      slot: 'escudo',
      rarity: 'comum',
      stats: [
        { text: '+18 Armadura', color: 'fisico' },
        { text: '+8% Bloqueio', color: 'fisico' },
      ],
    }),
  elmoFerro: () =>
    make({
      name: 'Elmo de Ferro',
      slot: 'cabeca',
      rarity: 'comum',
      stats: [{ text: '+8 Armadura', color: 'fisico' }],
    }),
  peitoralFerro: () =>
    make({
      name: 'Peitoral de Ferro',
      slot: 'peito',
      rarity: 'comum',
      stats: [
        { text: '+22 Armadura', color: 'fisico' },
        { text: '+10 Vida Máxima', color: 'vida' },
      ],
    }),
  manoplas: () =>
    make({
      name: 'Manoplas de Couro',
      slot: 'maos',
      rarity: 'comum',
      stats: [{ text: '+6 Armadura', color: 'fisico' }],
    }),
  botasReforcadas: () =>
    make({
      name: 'Botas Reforçadas',
      slot: 'pes',
      rarity: 'comum',
      stats: [
        { text: '+8 Armadura', color: 'fisico' },
        { text: '+3% Velocidade de Movimento', color: 'agilidade' },
      ],
    }),

  // ===== Ladino =====
  adagaBronze: () =>
    make({
      name: 'Adaga de Bronze',
      slot: 'arma',
      rarity: 'comum',
      stats: [
        { text: '+4 Dano Físico', color: 'fisico' },
        { text: '+8% Velocidade de Ataque', color: 'agilidade' },
      ],
    }),
  adagaVeneno: () =>
    make({
      name: 'Lâmina Envenenada',
      slot: 'arma',
      rarity: 'magico',
      stats: [
        { text: '+5 Dano Físico', color: 'fisico' },
        { text: '+3 Dano de Caos', color: 'caos' },
        { text: '+10% Chance de Crítico', color: 'critico' },
      ],
    }),
  arcoCurto: () =>
    make({
      name: 'Arco Curto',
      slot: 'arma',
      rarity: 'comum',
      stats: [
        { text: '+5 Dano Físico', color: 'fisico' },
        { text: '+5% Velocidade de Ataque', color: 'agilidade' },
      ],
    }),
  capuzCouro: () =>
    make({
      name: 'Capuz de Couro',
      slot: 'cabeca',
      rarity: 'comum',
      stats: [
        { text: '+4 Armadura', color: 'fisico' },
        { text: '+8 Evasão', color: 'agilidade' },
      ],
    }),
  gibao: () =>
    make({
      name: 'Gibão de Couro',
      slot: 'peito',
      rarity: 'comum',
      stats: [
        { text: '+12 Armadura', color: 'fisico' },
        { text: '+15 Evasão', color: 'agilidade' },
      ],
    }),
  luvasViajante: () =>
    make({
      name: 'Luvas do Viajante',
      slot: 'maos',
      rarity: 'comum',
      stats: [{ text: '+6 Evasão', color: 'agilidade' }],
    }),
  botasMacia: () =>
    make({
      name: 'Botas de Sola Macia',
      slot: 'pes',
      rarity: 'magico',
      stats: [
        { text: '+10 Evasão', color: 'agilidade' },
        { text: '+8% Velocidade de Movimento', color: 'agilidade' },
      ],
      description: 'Não fazem barulho na pedra molhada.',
    }),

  // ===== Mago =====
  cajadoCarvalho: () =>
    make({
      name: 'Cajado de Carvalho',
      slot: 'arma',
      rarity: 'comum',
      stats: [
        { text: '+15% Bônus Mágico', color: 'intelecto' },
        { text: '+8 Dano de Fogo', color: 'fogo' },
      ],
    }),
  variaVidro: () =>
    make({
      name: 'Vara de Vidro Negro',
      slot: 'arma',
      rarity: 'raro',
      stats: [
        { text: '+25% Bônus Mágico', color: 'intelecto' },
        { text: '+10 Dano de Caos', color: 'caos' },
        { text: '+15% Velocidade de Conjuração', color: 'agilidade' },
      ],
      description: 'O vidro lembra quem o quebrou.',
    }),
  chapeuPontiagudo: () =>
    make({
      name: 'Chapéu Pontiagudo',
      slot: 'cabeca',
      rarity: 'comum',
      stats: [
        { text: '+10 Mana Máxima', color: 'mana' },
        { text: '+5% Bônus Mágico', color: 'intelecto' },
      ],
    }),
  manto: () =>
    make({
      name: 'Manto de Aprendiz',
      slot: 'peito',
      rarity: 'comum',
      stats: [
        { text: '+8 Armadura', color: 'fisico' },
        { text: '+12 Mana Máxima', color: 'mana' },
      ],
    }),
  luvasSeda: () =>
    make({
      name: 'Luvas de Seda',
      slot: 'maos',
      rarity: 'comum',
      stats: [{ text: '+10% Velocidade de Conjuração', color: 'agilidade' }],
    }),
  sapatosAlpaca: () =>
    make({
      name: 'Sapatos de Alpaca',
      slot: 'pes',
      rarity: 'comum',
      stats: [{ text: '+5% Velocidade de Movimento', color: 'agilidade' }],
    }),

  // ===== Acessórios =====
  amuletoSimples: () =>
    make({
      name: 'Amuleto Simples',
      slot: 'amuleto',
      rarity: 'comum',
      stats: [{ text: '+3 a Todos os Atributos', color: 'forca' }],
    }),
  amuletoCobre: () =>
    make({
      name: 'Amuleto de Cobre Verde',
      slot: 'amuleto',
      rarity: 'magico',
      stats: [
        { text: '+8 Agilidade', color: 'agilidade' },
        { text: '+5% Esquiva', color: 'agilidade' },
      ],
    }),
  amuletoFenix: () =>
    make({
      name: 'Pingente da Fênix',
      slot: 'amuleto',
      rarity: 'unico',
      stats: [
        { text: '+25 Vida Máxima', color: 'vida' },
        { text: '+15% Resistência ao Fogo', color: 'fogo' },
        { text: '+5 Regeneração de Vida por turno', color: 'vida' },
      ],
      description: 'Quem o porta, queima por último.',
    }),
  anelLatao: () =>
    make({
      name: 'Anel de Latão',
      slot: 'anel',
      rarity: 'comum',
      stats: [{ text: '+5 Vida Máxima', color: 'vida' }],
    }),
  anelPrata: () =>
    make({
      name: 'Anel de Prata',
      slot: 'anel',
      rarity: 'magico',
      stats: [
        { text: '+8 Mana Máxima', color: 'mana' },
        { text: '+5% Resistência ao Caos', color: 'caos' },
      ],
    }),

  // ===== Consumíveis (stackáveis) =====
  pocaoVida: (n = 3) =>
    make({
      name: 'Poção de Vida',
      slot: null,
      rarity: 'comum',
      description: 'Restaura 30 de Vida ao usar.',
      stackable: true,
      stack: n,
    }),
  pocaoMana: (n = 3) =>
    make({
      name: 'Poção de Mana',
      slot: null,
      rarity: 'comum',
      description: 'Restaura 20 de Mana ao usar.',
      stackable: true,
      stack: n,
    }),
  pao: (n = 5) =>
    make({
      name: 'Pão Duro',
      slot: null,
      rarity: 'comum',
      description: 'Mata a fome. Mais ou menos.',
      stackable: true,
      stack: n,
    }),

  // ===== Materiais (stackáveis) =====
  panoLimpo: (n = 4) =>
    make({
      name: 'Pano Limpo',
      slot: null,
      rarity: 'comum',
      description: 'Material de costura.',
      stackable: true,
      stack: n,
    }),
  pedraAfiada: (n = 2) =>
    make({
      name: 'Pedra de Afiar',
      slot: null,
      rarity: 'comum',
      description: 'Material de manutenção de armas.',
      stackable: true,
      stack: n,
    }),
};

// ============================================================================
// Estado vazio
// ============================================================================
export function emptyEquipped(): Record<EquipSlot, Item | null> {
  return {
    cabeca: null,
    peito: null,
    maos: null,
    pes: null,
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

// ============================================================================
// Loadouts iniciais por classe
// ============================================================================
interface Loadout {
  equipped: Partial<Record<EquipSlot, Item>>;
  inventory: Item[];
}

export function getStarterLoadout(classKey: ClassKey): Loadout {
  switch (classKey) {
    case 'guerreiro':
      return {
        equipped: {
          arma: ITEMS.espadaLonga(),
          escudo: ITEMS.escudoTorre(),
          peito: ITEMS.peitoralFerro(),
        },
        inventory: [
          ITEMS.elmoFerro(),
          ITEMS.manoplas(),
          ITEMS.botasReforcadas(),
          ITEMS.martelo(),
          ITEMS.lanca(),
          ITEMS.amuletoSimples(),
          ITEMS.anelLatao(),
          ITEMS.pocaoVida(),
          ITEMS.pao(),
          ITEMS.pedraAfiada(),
        ],
      };
    case 'ladino':
      return {
        equipped: {
          arma: ITEMS.adagaBronze(),
          peito: ITEMS.gibao(),
          pes: ITEMS.botasMacia(),
        },
        inventory: [
          ITEMS.capuzCouro(),
          ITEMS.luvasViajante(),
          ITEMS.adagaVeneno(),
          ITEMS.arcoCurto(),
          ITEMS.amuletoCobre(),
          ITEMS.anelPrata(),
          ITEMS.pocaoVida(),
          ITEMS.pocaoMana(2),
          ITEMS.panoLimpo(),
        ],
      };
    case 'mago':
      return {
        equipped: {
          arma: ITEMS.cajadoCarvalho(),
          peito: ITEMS.manto(),
          cabeca: ITEMS.chapeuPontiagudo(),
        },
        inventory: [
          ITEMS.luvasSeda(),
          ITEMS.sapatosAlpaca(),
          ITEMS.variaVidro(),
          ITEMS.amuletoFenix(),
          ITEMS.anelLatao(),
          ITEMS.pocaoMana(5),
          ITEMS.pocaoVida(),
          ITEMS.pao(),
        ],
      };
  }
}

export function applyLoadout(
  loadout: Loadout,
): { equipped: Record<EquipSlot, Item | null>; inventory: (Item | null)[] } {
  const equipped = emptyEquipped();
  (Object.entries(loadout.equipped) as [EquipSlot, Item][]).forEach(([slot, itm]) => {
    equipped[slot] = itm;
  });
  const inventory = emptyInventory();
  loadout.inventory.forEach((itm, i) => {
    if (i < INVENTORY_SIZE) inventory[i] = itm;
  });
  return { equipped, inventory };
}
