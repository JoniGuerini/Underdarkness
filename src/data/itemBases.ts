import type { ItemSlot, ItemStat } from '../types';

/**
 * "Base" de item — define a categoria do equipamento e os stats inerentes
 * que aparecem em qualquer tier (Comum, Mágico, Raro). Esses stats não são
 * afixos rolados — são parte do que o item *é*.
 *
 * Ex: "Espada Longa" sempre tem range de dano físico, velocidade de ataque
 * e 5% de crítico base. "Anel de Rubi" sempre traz Resistência ao Fogo.
 */
export interface ItemBase {
  id: string;
  name: string;
  slot: ItemSlot;
  /** Stats inerentes — sempre visíveis no tooltip, independente do tier */
  baseStats: ItemStat[];
  /** Descrição opcional (flavor) — itálico no rodapé do tooltip */
  description?: string;
}

/**
 * Catálogo de bases. Crescer adicionando novas entradas — ids únicos.
 * Cobre todos os 8 slots equipáveis pelo menos uma vez (escudo + cabeça +
 * peito + mãos + pés + amuleto + anel + arma).
 */
export const ITEM_BASES: ItemBase[] = [
  // ════════ Armas ════════
  {
    id: 'espada-longa',
    name: 'Espada Longa',
    slot: 'arma',
    baseStats: [
      { text: '5 a 10 de Dano Físico', color: 'fisico' },
      { text: '1.0 ataques/s' },
      { text: '5% de Chance de Crítico', color: 'critico' },
    ],
  },
  {
    id: 'adaga-curva',
    name: 'Adaga Curva',
    slot: 'arma',
    baseStats: [
      { text: '3 a 6 de Dano Físico', color: 'fisico' },
      { text: '1.6 ataques/s' },
      { text: '8% de Chance de Crítico', color: 'critico' },
    ],
  },
  {
    id: 'martelo-de-guerra',
    name: 'Martelo de Guerra',
    slot: 'arma',
    baseStats: [
      { text: '8 a 16 de Dano Físico', color: 'fisico' },
      { text: '0.7 ataques/s' },
      { text: '5% de Chance de Crítico', color: 'critico' },
    ],
  },
  {
    id: 'cajado-de-carvalho',
    name: 'Cajado de Carvalho',
    slot: 'arma',
    baseStats: [
      { text: '2 a 5 de Dano Físico', color: 'fisico' },
      { text: '0.8 ataques/s' },
      { text: '5% de Chance de Crítico', color: 'critico' },
      { text: '+8 de Bônus Mágico', color: 'intelecto' },
    ],
  },

  // ════════ Cabeça ════════
  {
    id: 'capuz-sombras',
    name: 'Capuz de Sombras',
    slot: 'cabeca',
    baseStats: [{ text: '+18 de Evasão', color: 'agilidade' }],
  },
  {
    id: 'elmo-aco',
    name: 'Elmo de Aço',
    slot: 'cabeca',
    baseStats: [{ text: '+22 de Armadura', color: 'fisico' }],
  },

  // ════════ Peito ════════
  {
    id: 'peitoral-ferro',
    name: 'Peitoral de Ferro',
    slot: 'peito',
    baseStats: [{ text: '+45 de Armadura', color: 'fisico' }],
  },
  {
    id: 'tunica-estudioso',
    name: 'Túnica do Estudioso',
    slot: 'peito',
    baseStats: [
      { text: '+12 de Mana', color: 'mana' },
      { text: '+5 de Bônus Mágico', color: 'intelecto' },
    ],
  },

  // ════════ Mãos ════════
  {
    id: 'manoplas-couro',
    name: 'Manoplas de Couro',
    slot: 'maos',
    baseStats: [{ text: '+10 de Evasão', color: 'agilidade' }],
  },
  {
    id: 'manoplas-aco',
    name: 'Manoplas de Aço',
    slot: 'maos',
    baseStats: [{ text: '+14 de Armadura', color: 'fisico' }],
  },

  // ════════ Pés ════════
  {
    id: 'botas-couro',
    name: 'Botas de Couro',
    slot: 'pes',
    baseStats: [{ text: '+12 de Evasão', color: 'agilidade' }],
  },
  {
    id: 'botas-aco',
    name: 'Botas de Aço',
    slot: 'pes',
    baseStats: [{ text: '+16 de Armadura', color: 'fisico' }],
  },

  // ════════ Amuleto ════════
  {
    id: 'amuleto-simples',
    name: 'Amuleto Simples',
    slot: 'amuleto',
    baseStats: [],
  },

  // ════════ Anel ════════
  {
    id: 'anel-latao',
    name: 'Anel de Latão',
    slot: 'anel',
    baseStats: [],
  },
  {
    id: 'anel-rubi',
    name: 'Anel de Rubi',
    slot: 'anel',
    baseStats: [{ text: '+15% de Resistência ao Fogo', color: 'fogo' }],
  },
  {
    id: 'anel-safira',
    name: 'Anel de Safira',
    slot: 'anel',
    baseStats: [{ text: '+15% de Resistência ao Gelo', color: 'gelo' }],
  },
  {
    id: 'anel-topazio',
    name: 'Anel de Topázio',
    slot: 'anel',
    baseStats: [{ text: '+15% de Resistência ao Raio', color: 'raio' }],
  },

  // ════════ Escudo ════════
  {
    id: 'escudo-torre',
    name: 'Escudo de Torre',
    slot: 'escudo',
    baseStats: [
      { text: '+18 de Armadura', color: 'fisico' },
      { text: '+8% de Chance de Bloqueio', color: 'defesa' },
    ],
  },
  {
    id: 'broquel-couro',
    name: 'Broquel de Couro',
    slot: 'escudo',
    baseStats: [
      { text: '+10 de Evasão', color: 'agilidade' },
      { text: '+5% de Chance de Bloqueio', color: 'defesa' },
    ],
  },
];

export function getBaseById(id: string): ItemBase | undefined {
  return ITEM_BASES.find((b) => b.id === id);
}
