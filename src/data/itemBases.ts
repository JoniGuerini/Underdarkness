import type { Item, ItemSlot, ItemStat } from '../types';

/**
 * "Base" de item — define a categoria do equipamento e os stats inerentes
 * que aparecem em qualquer tier (Comum, Mágico, Raro). Esses stats não são
 * afixos rolados — são parte do que o item *é*.
 *
 * Cada baseStats traz `effect` numérico (alimenta `computeDerivedStats`) e
 * `text` (display no tooltip). Quando o item é equipado, os efeitos viram
 * bônus reais na ficha.
 */
export interface ItemBase {
  id: string;
  name: string;
  slot: ItemSlot;
  /** Magia do ataque básico (Mago) — ex: cajado concede Bola de Fogo */
  grantedSpellId?: string;
  /** Stats inerentes — sempre visíveis no tooltip, independente do tier */
  baseStats: ItemStat[];
  /** Descrição opcional (flavor) — itálico no rodapé do tooltip */
  description?: string;
}

export const ITEM_BASES: ItemBase[] = [
  // ════════ Armas ════════
  {
    id: 'espada-curta',
    name: 'Espada Curta',
    slot: 'arma',
    baseStats: [
      { text: '1 a 2 de Dano Físico', color: 'fisico', effect: { key: 'flat-dmg-fis', value: 1, max: 2 } },
      { text: '1.5 ataques/s', effect: { key: 'weapon-speed', value: 1.5 } },
      { text: '5% de Chance de Crítico', color: 'critico', effect: { key: 'weapon-crit-base', value: 5 } },
    ],
    description: 'Lâmina curta, sem ornamentos. O que se entrega a um aprendiz no primeiro dia.',
  },
  {
    id: 'espada-longa',
    name: 'Espada Longa',
    slot: 'arma',
    baseStats: [
      { text: '5 a 10 de Dano Físico', color: 'fisico', effect: { key: 'flat-dmg-fis', value: 5, max: 10 } },
      { text: '1.0 ataques/s', effect: { key: 'weapon-speed', value: 1.0 } },
      { text: '5% de Chance de Crítico', color: 'critico', effect: { key: 'weapon-crit-base', value: 5 } },
    ],
  },
  {
    id: 'adaga-curva',
    name: 'Adaga Curva',
    slot: 'arma',
    baseStats: [
      { text: '3 a 6 de Dano Físico', color: 'fisico', effect: { key: 'flat-dmg-fis', value: 3, max: 6 } },
      { text: '1.6 ataques/s', effect: { key: 'weapon-speed', value: 1.6 } },
      { text: '8% de Chance de Crítico', color: 'critico', effect: { key: 'weapon-crit-base', value: 8 } },
    ],
  },
  {
    id: 'martelo-de-guerra',
    name: 'Martelo de Guerra',
    slot: 'arma',
    baseStats: [
      { text: '8 a 16 de Dano Físico', color: 'fisico', effect: { key: 'flat-dmg-fis', value: 8, max: 16 } },
      { text: '0.7 ataques/s', effect: { key: 'weapon-speed', value: 0.7 } },
      { text: '5% de Chance de Crítico', color: 'critico', effect: { key: 'weapon-crit-base', value: 5 } },
    ],
  },
  {
    id: 'cajado-de-carvalho',
    name: 'Cajado de Carvalho',
    slot: 'arma',
    grantedSpellId: 'bola-de-fogo',
    baseStats: [
      { text: 'Concede: Bola de Fogo', color: 'fogo', kind: 'base' },
      { text: '0.8 ataques/s', effect: { key: 'weapon-speed', value: 0.8 } },
      { text: '5% de Chance de Crítico', color: 'critico', effect: { key: 'weapon-crit-base', value: 5 } },
    ],
  },

  // ════════ Cabeça ════════
  {
    id: 'capuz-sombras',
    name: 'Capuz de Sombras',
    slot: 'cabeca',
    baseStats: [{ text: '+18 de Evasão', color: 'agilidade', effect: { key: 'flat-evasao', value: 18 } }],
  },
  {
    id: 'elmo-aco',
    name: 'Elmo de Aço',
    slot: 'cabeca',
    baseStats: [{ text: '+22 de Armadura', color: 'fisico', effect: { key: 'flat-armadura', value: 22 } }],
  },

  // ════════ Peito ════════
  {
    id: 'peitoral-ferro',
    name: 'Peitoral de Ferro',
    slot: 'peito',
    baseStats: [{ text: '+45 de Armadura', color: 'fisico', effect: { key: 'flat-armadura', value: 45 } }],
  },
  {
    id: 'tunica-estudioso',
    name: 'Túnica do Estudioso',
    slot: 'peito',
    baseStats: [{ text: '+12 de Mana', color: 'mana', effect: { key: 'flat-mana', value: 12 } }],
  },

  // ════════ Mãos ════════
  {
    id: 'manoplas-couro',
    name: 'Manoplas de Couro',
    slot: 'maos',
    baseStats: [{ text: '+10 de Evasão', color: 'agilidade', effect: { key: 'flat-evasao', value: 10 } }],
  },
  {
    id: 'manoplas-aco',
    name: 'Manoplas de Aço',
    slot: 'maos',
    baseStats: [{ text: '+14 de Armadura', color: 'fisico', effect: { key: 'flat-armadura', value: 14 } }],
  },

  // ════════ Pés ════════
  {
    id: 'botas-couro',
    name: 'Botas de Couro',
    slot: 'pes',
    baseStats: [{ text: '+12 de Evasão', color: 'agilidade', effect: { key: 'flat-evasao', value: 12 } }],
  },
  {
    id: 'botas-aco',
    name: 'Botas de Aço',
    slot: 'pes',
    baseStats: [{ text: '+16 de Armadura', color: 'fisico', effect: { key: 'flat-armadura', value: 16 } }],
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
    baseStats: [{ text: '+15% de Resistência ao Fogo', color: 'fogo', effect: { key: 'pct-res-fogo', value: 15 } }],
  },
  {
    id: 'anel-safira',
    name: 'Anel de Safira',
    slot: 'anel',
    baseStats: [{ text: '+15% de Resistência ao Gelo', color: 'gelo', effect: { key: 'pct-res-gelo', value: 15 } }],
  },
  {
    id: 'anel-topazio',
    name: 'Anel de Topázio',
    slot: 'anel',
    baseStats: [{ text: '+15% de Resistência ao Raio', color: 'raio', effect: { key: 'pct-res-raio', value: 15 } }],
  },

  // ════════ Escudo ════════
  {
    id: 'escudo-torre',
    name: 'Escudo de Torre',
    slot: 'escudo',
    baseStats: [
      { text: '+18 de Armadura', color: 'fisico', effect: { key: 'flat-armadura', value: 18 } },
      { text: '+8% de Chance de Bloqueio', color: 'defesa', effect: { key: 'pct-bloqueio', value: 8 } },
    ],
  },
  {
    id: 'broquel-couro',
    name: 'Broquel de Couro',
    slot: 'escudo',
    baseStats: [
      { text: '+10 de Evasão', color: 'agilidade', effect: { key: 'flat-evasao', value: 10 } },
      { text: '+5% de Chance de Bloqueio', color: 'defesa', effect: { key: 'pct-bloqueio', value: 5 } },
    ],
  },
];

export function getBaseById(id: string): ItemBase | undefined {
  return ITEM_BASES.find((b) => b.id === id);
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
