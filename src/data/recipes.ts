import type { Item } from '../types';

/**
 * Receita de crafting — consome reagentes do inventário e produz um item.
 * Cada NPC com role "forjar" ou "destilar" tem suas próprias receitas
 * filtradas por `crafterId` + `role`.
 */

export interface RecipeIngredient {
  /** ID do item-reagente que precisa estar no inventário */
  itemId: string;
  /** Quantidade total necessária (soma de todos os stacks com esse id) */
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  /** ID do NPC que conhece essa receita */
  crafterId: string;
  /** Role usada — define se a receita aparece em "Forjar" ou "Destilar" */
  role: 'forjar' | 'destilar';
  /** Descrição flavor — exibida abaixo do nome da receita */
  description: string;
  ingredients: RecipeIngredient[];
  /** Item gerado quando a receita é executada */
  result: Item;
}

// ============================================================================
// TIBÉRIO — Forjar (armas e armaduras com afixos básicos)
// ============================================================================
const tiberioRecipes: Recipe[] = [
  {
    id: 'craft-lamina-vau',
    name: 'Lâmina do Vau',
    crafterId: 'tiberio',
    role: 'forjar',
    description:
      'Lâmina simples mas bem temperada. Tibério forja com calma, batendo o aço três vezes pra cada vez que outros baterriam uma.',
    ingredients: [
      { itemId: 'mat-minerio-ferro', quantity: 3 },
      { itemId: 'mat-pedra-afiar', quantity: 1 },
    ],
    result: {
      id: 'craft-espada-longa-magica',
      name: 'Lâmina do Vau',
      slot: 'arma',
      rarity: 'magico',
      stats: [
        { text: '5 a 10 de Dano Físico', color: 'fisico', kind: 'base' },
        { text: '1.0 ataques/s', kind: 'base' },
        { text: '5% de Chance de Crítico', color: 'critico', kind: 'base' },
        { text: '+ 6 a 10 de Dano Físico', color: 'fisico', kind: 'prefix' },
      ],
      description: 'Forjada na bigorna do Vau. O cabo ainda guarda o calor da forja.',
    },
  },
  {
    id: 'craft-botas-reforcadas',
    name: 'Botas Reforçadas',
    crafterId: 'tiberio',
    role: 'forjar',
    description:
      'Couro batido com placas finas de ferro nas canelas. Pesa um pouco mais, mas o golpe que vier não passa.',
    ingredients: [
      { itemId: 'mat-couro-cru', quantity: 2 },
      { itemId: 'mat-minerio-ferro', quantity: 1 },
    ],
    result: {
      id: 'craft-botas-magicas',
      name: 'Botas Reforçadas',
      slot: 'pes',
      rarity: 'magico',
      stats: [
        { text: '+12 de Evasão', color: 'agilidade', kind: 'base' },
        { text: '+ 18 de Armadura', color: 'fisico', kind: 'prefix' },
      ],
      description: 'Cheiram a couro novo e fumaça de carvão.',
    },
  },
];

// ============================================================================
// SOLANA — Destilar (poções e elixires)
// ============================================================================
const solanaRecipes: Recipe[] = [
  {
    id: 'craft-pot-vida-media',
    name: 'Poção de Vida Média',
    crafterId: 'solana',
    role: 'destilar',
    description:
      'Carmesim escuro, espessa. Solana destila baixinho, contando algo em voz quase inaudível enquanto mexe.',
    ingredients: [
      { itemId: 'erva-vermelha', quantity: 2 },
      { itemId: 'frasco-vazio', quantity: 1 },
    ],
    result: {
      id: 'pot-vida-media',
      name: 'Poção de Vida Média',
      slot: null,
      rarity: 'magico',
      stackable: true,
      stack: 1,
      description: 'Restaura uma porção média de Vida. Quente ao toque.',
    },
  },
  {
    id: 'craft-pot-mana-media',
    name: 'Poção de Mana Média',
    crafterId: 'solana',
    role: 'destilar',
    description:
      'Azul-elétrico, com brilho próprio. Mantém-se viva por dias antes de esmaecer.',
    ingredients: [
      { itemId: 'erva-azul', quantity: 2 },
      { itemId: 'frasco-vazio', quantity: 1 },
    ],
    result: {
      id: 'pot-mana-media',
      name: 'Poção de Mana Média',
      slot: null,
      rarity: 'magico',
      stackable: true,
      stack: 1,
      description: 'Restaura uma porção média de Mana. O vidro vibra de leve.',
    },
  },
  {
    id: 'craft-elixir-vale',
    name: 'Elixir do Vale',
    crafterId: 'solana',
    role: 'destilar',
    description:
      'Combinação rara de raiz noturna com ervas comuns. Solana só destila quando tem todos os reagentes — cada gota é cara.',
    ingredients: [
      { itemId: 'raiz-noturna', quantity: 1 },
      { itemId: 'erva-vermelha', quantity: 1 },
      { itemId: 'erva-azul', quantity: 1 },
      { itemId: 'frasco-vazio', quantity: 1 },
    ],
    result: {
      id: 'pot-elixir-vale',
      name: 'Elixir do Vale',
      slot: null,
      rarity: 'raro',
      stackable: true,
      stack: 1,
      description: 'Restaura Vida e Mana ao máximo. Solana sussurra que o gosto "lembra outra vida".',
    },
  },
];

export const RECIPES: Recipe[] = [...tiberioRecipes, ...solanaRecipes];

export function getRecipesFor(crafterId: string, role: 'forjar' | 'destilar'): Recipe[] {
  return RECIPES.filter((r) => r.crafterId === crafterId && r.role === role);
}
