import type { Item } from '../types';
import { getFood } from './foods';
import { getMaterial, getMaterialName } from './materials';

/**
 * Receita de crafting — consome reagentes do inventário e produz um item.
 * Cada NPC com role "forjar", "destilar", "cozinhar" ou "fundir" tem suas
 * próprias receitas, filtradas por `crafterId` + `role`.
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
  /** Role usada — define em qual estação a receita aparece */
  role: 'forjar' | 'destilar' | 'cozinhar' | 'fundir';
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

// ============================================================================
// COZINHA — pratos de buff (Carnes + Verduras + Frutas)
// ============================================================================
// O `result` vem do catálogo de comidas (foods.ts). Cada receita telegrafa seu
// buff no tooltip do prato (efeito real plugado no futuro).
//
// ⚠️ DATABASE-ONLY POR ORA: estas receitas existem só como dados e são exibidas
// no CÓDICE (seção "Receitas"). Elas NÃO estão ligadas a nenhum NPC/estação de
// craft ainda — `crafterId: 'doroteu'` marca só o cozinheiro pretendido. A
// ligação ao NPC (aba "Cozinhar" no diálogo) entra quando formos relacionar as
// coisas a mobs/NPCs/quests.

type Ing = [itemId: string, quantity: number];

/** Helper — monta uma receita de cozinha do Doroteu a partir do id do prato. */
function cook(foodId: string, description: string, ingredients: Ing[]): Recipe {
  const result = getFood(foodId);
  if (!result) throw new Error(`Receita de cozinha aponta pra comida inexistente: ${foodId}`);
  return {
    id: `rec-${foodId}`,
    name: result.name,
    crafterId: 'doroteu',
    role: 'cozinhar',
    description,
    ingredients: ingredients.map(([itemId, quantity]) => ({ itemId, quantity })),
    result,
  };
}

const doroteuRecipes: Recipe[] = [
  // --- Tier 1 -------------------------------------------------------------
  cook('prato-ensopado-caca', 'Cozido lento numa panela de ferro até a carne soltar do osso.', [
    ['carne-caca', 2],
    ['verdura-couve', 1],
  ]),
  cook('prato-espeto-antilope', 'Lombo espetado e passado na brasa, esfregado com folhas de agrião.', [
    ['carne-antilope', 1],
    ['verdura-agriao', 1],
  ]),
  cook('prato-torta-silvestre', 'Frutas do bosque assadas dentro de massa rústica de forno de lenha.', [
    ['fruta-amora', 1],
    ['fruta-cereja', 1],
    ['fruta-maca', 1],
  ]),

  // --- Tier 2 -------------------------------------------------------------
  cook('prato-caldo-profundezas', 'Fervura demorada de carne pálida com brotos raspados da rocha.', [
    ['carne-tateador', 1],
    ['verdura-broto-caverna', 1],
  ]),
  cook('prato-aranha-grelhada', 'Abdômen aberto e selado na chapa, acompanhado de cardo tenro.', [
    ['carne-aranha', 1],
    ['verdura-cardo-fundo', 1],
  ]),
  cook('prato-geleia-escura', 'Bagas cozidas com pouco mel até virar pasta espessa.', [
    ['fruta-mirtilo', 2],
    ['fruta-groselha', 1],
  ]),

  // --- Tier 3 -------------------------------------------------------------
  cook('prato-ensopado-mar', 'Peixe do fundo fervido num caldo escuro engrossado com kombu.', [
    ['carne-peixe-abissal', 1],
    ['verdura-kombu', 1],
  ]),
  cook('prato-ceviche-enguia', 'Enguia crua "cozida" no ácido do limão, salpicada de salsa-do-mar.', [
    ['carne-enguia', 1],
    ['fruta-limao', 1],
    ['verdura-salsa-marinha', 1],
  ]),
  cook('prato-salada-recife', 'Folhas do mar e gomos cítricos montados sobre carne fria de caranguejo.', [
    ['verdura-couve-do-mar', 1],
    ['fruta-laranja', 1],
    ['carne-caranguejo', 1],
  ]),

  // --- Tier 4 -------------------------------------------------------------
  cook('prato-churrasco-igneo', 'Cortes brasa assados no próprio calor, com couve das cinzas ao lado.', [
    ['carne-corte-flamejante', 1],
    ['verdura-couve-cinza', 1],
  ]),
  cook('prato-espeto-serpe', 'Filé de serpe enrolado no espeto com talos de cardo flamejante.', [
    ['carne-serpe', 1],
    ['verdura-cardo-fogo', 1],
  ]),
  cook('prato-assado-fenix', 'Peito assado e glaçado com purê de manga e abacaxi.', [
    ['carne-fenix', 1],
    ['fruta-manga', 1],
    ['fruta-abacaxi', 1],
  ]),

  // --- Tier 5 -------------------------------------------------------------
  cook('prato-banquete-abissal', 'Guisado pesado de duas carnes do abismo com couve que rebrota.', [
    ['carne-leviata', 1],
    ['carne-abissal', 1],
    ['verdura-couve-eterna', 1],
  ]),
  cook('prato-caldo-vazio', 'Vísceras fervidas até restar só o essencial, temperadas com cardo abissal.', [
    ['carne-vazio', 1],
    ['verdura-cardo-abissal', 1],
  ]),
  cook('prato-torta-astral', 'Carniça celeste adoçada e assada com fatias de carambola e maracujá.', [
    ['carne-carnica-astral', 1],
    ['fruta-carambola', 1],
    ['fruta-maracuja', 1],
  ]),
];

// ============================================================================
// FUNDIÇÃO — minérios → barras
// ============================================================================
// Mesmo esquema database-only da cozinha: receitas existem como dados,
// `crafterId: 'tiberio'` marca só o fundidor pretendido (a role 'fundir' não é
// renderizada em nenhum NPC ainda). Regra: 2 minérios → 1 barra — as barras
// valem ~2,8× o minério, então fundir compensa o trabalho.

/** Helper — monta uma receita de fundição minério → barra. */
function smelt(oreId: string, barId: string, description: string): Recipe {
  const result = getMaterial(barId);
  if (!result) throw new Error(`Receita de fundição aponta pra barra inexistente: ${barId}`);
  return {
    id: `rec-${barId}`,
    name: getMaterialName(barId),
    crafterId: 'tiberio',
    role: 'fundir',
    description,
    ingredients: [{ itemId: oreId, quantity: 2 }],
    result: { ...result, stack: 1 },
  };
}

const fundicaoRecipes: Recipe[] = [
  // --- Tier 1 -------------------------------------------------------------
  smelt('minerio-ferro', 'barra-ferro', 'Fundido em forno comum e batido até purgar a escória.'),
  smelt('minerio-cobre', 'barra-cobre', 'Derrete rápido e verte fácil. O primeiro lingote de todo aprendiz.'),
  smelt('minerio-estanho', 'barra-estanho', 'Funde em fogo brando. Sozinho é mole; com cobre, vira bronze.'),
  smelt('minerio-chumbo', 'barra-chumbo', 'Verte denso e sem pressa. Cuidado com o vapor — ele cobra caro.'),

  // --- Tier 2 -------------------------------------------------------------
  smelt('minerio-prata-bruta', 'barra-prata', 'Refinada em cadinho limpo pra não manchar o brilho frio.'),
  smelt('minerio-ferro-negro', 'barra-ferro-negro', 'Exige o dobro de carvão e o triplo de paciência. Não reflete a forja.'),
  smelt('minerio-cobalto', 'barra-cobalto', 'Só cede em fogo soprado. O azul sobrevive à fundição inteira.'),
  smelt('minerio-antimonio', 'barra-antimonio', 'Funde baixo e quebra fácil. Verter devagar é metade do ofício.'),

  // --- Tier 3 -------------------------------------------------------------
  smelt('minerio-coralaco', 'barra-coralaco', 'Fundido com sal da própria maré pra não perder a têmpera do recife.'),
  smelt('minerio-abissalio', 'barra-abissalio', 'Gela o cadinho em vez de esquentá-lo. Fundição às avessas.'),

  // --- Tier 4 -------------------------------------------------------------
  smelt('minerio-piroferro', 'barra-piroferro', 'Não precisa de forno — precisa de contenção. A brasa já vem de dentro.'),
  smelt('minerio-titanio', 'barra-titanio', 'Ri do fogo comum. Só a forja soprada a fole duplo o convence.'),

  // --- Tier 5 -------------------------------------------------------------
  smelt('minerio-adamante', 'barra-adamante', 'Fundi-lo já é uma proeza; vertê-lo inteiro, uma lenda de ferreiro.'),
  smelt('minerio-estelario', 'barra-estelario', 'Funde em silêncio e esfria depressa, como se quisesse voltar ao vazio.'),
  smelt('minerio-vazita', 'barra-vazita', 'A forja escurece enquanto ele derrete. O lingote engole a própria luz.'),
  smelt('minerio-oricalco', 'barra-oricalco', 'Canta baixo no cadinho. Dizem que a nota certa é o ponto de verter.'),
];

export const RECIPES: Recipe[] = [
  ...tiberioRecipes,
  ...solanaRecipes,
  ...doroteuRecipes,
  ...fundicaoRecipes,
];

export function getRecipesFor(crafterId: string, role: 'forjar' | 'destilar'): Recipe[] {
  return RECIPES.filter((r) => r.crafterId === crafterId && r.role === role);
}

/** Todas as receitas de um tipo (independe do NPC). Usado pelo Códice. */
export function getRecipesByRole(role: Recipe['role']): Recipe[] {
  return RECIPES.filter((r) => r.role === role);
}

/** Receita cujo resultado é o item indicado (ou null). Usado pelo Códice. */
export function getRecipeByResult(itemId: string): Recipe | null {
  return RECIPES.find((r) => r.result.id === itemId) ?? null;
}

/** Nome da estação de craft de cada role — exibido junto da receita. */
export const RECIPE_ROLE_LABEL: Record<Recipe['role'], string> = {
  forjar: 'Forja',
  destilar: 'Destilaria',
  cozinhar: 'Cozinha',
  fundir: 'Fundição',
};
