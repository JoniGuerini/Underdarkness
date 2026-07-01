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
// TIBÉRIO — Forjar
// ============================================================================
// Sem receitas por enquanto — as bases de equipamento serão a fonte de armas.
const tiberioRecipes: Recipe[] = [];

// ============================================================================
// SOLANA — Destilar
// ============================================================================
// Sem receitas por enquanto — serão redefinidas com o novo sistema de materiais/consumíveis.
const solanaRecipes: Recipe[] = [];

export const RECIPES: Recipe[] = [...tiberioRecipes, ...solanaRecipes];

export function getRecipesFor(crafterId: string, role: 'forjar' | 'destilar'): Recipe[] {
  return RECIPES.filter((r) => r.crafterId === crafterId && r.role === role);
}
