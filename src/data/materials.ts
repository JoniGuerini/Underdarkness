import type { Item } from '../types';

/**
 * Catálogo central de materiais e consumíveis stackable. Reagentes de
 * receitas, mercadorias de loja e itens iniciais de criação de personagem
 * referenciam essa fonte única — evita duplicar nome/descrição em vários
 * arquivos e garante que o tooltip vai sempre exibir o mesmo texto.
 *
 * Cada entrada tem `defaultPrice` opcional — usado pra popular lojas com
 * o preço padrão. Lojas individuais podem sobrescrever se quiserem.
 */
export interface MaterialDef {
  item: Item;
  /** Preço padrão de venda em loja (compra do jogador) */
  defaultPrice: number;
}

/**
 * Helper pra construir o Item — garante shape consistente (rarity comum,
 * slot null, stackable true, stack 1).
 */
function mat(id: string, name: string, description: string): Item {
  return {
    id,
    name,
    slot: null,
    rarity: 'comum',
    stackable: true,
    stack: 1,
    description,
  };
}

export const MATERIALS: Record<string, MaterialDef> = {
  // ── Forja ────────────────────────────────────────────────────────
  'mat-minerio-ferro': {
    item: mat(
      'mat-minerio-ferro',
      'Minério de Ferro',
      'Pedra escura, peso bom. Boa pra fundir uma lâmina simples.',
    ),
    defaultPrice: 5,
  },
  'mat-couro-cru': {
    item: mat(
      'mat-couro-cru',
      'Couro Cru',
      'Couro de animal recém-curtido. Cheira a cabra.',
    ),
    defaultPrice: 4,
  },
  'mat-pedra-afiar': {
    item: mat(
      'mat-pedra-afiar',
      'Pedra de Afiar',
      'Mantém o gume da lâmina. Usada em receitas de aprimoramento.',
    ),
    defaultPrice: 3,
  },

  // ── Alquimia ─────────────────────────────────────────────────────
  'erva-vermelha': {
    item: mat(
      'erva-vermelha',
      'Erva Vermelha',
      'Folha grossa de tom carmesim. Base de poções vitais.',
    ),
    defaultPrice: 3,
  },
  'erva-azul': {
    item: mat(
      'erva-azul',
      'Erva Azul',
      'Pétalas que mantêm um brilho fraco no escuro. Base arcana.',
    ),
    defaultPrice: 4,
  },
  'raiz-noturna': {
    item: mat(
      'raiz-noturna',
      'Raiz Noturna',
      'Raiz preta e amarga. Útil pra elixires mais complexos.',
    ),
    defaultPrice: 6,
  },
  'frasco-vazio': {
    item: mat(
      'frasco-vazio',
      'Frasco Vazio',
      'Vidro soprado à mão. Necessário pra qualquer destilação.',
    ),
    defaultPrice: 2,
  },

  // ── Consumíveis prontos (poções compradas) ───────────────────────
  'pot-vida-pequena': {
    item: {
      id: 'pot-vida-pequena',
      name: 'Poção de Vida Pequena',
      slot: null,
      rarity: 'comum',
      stackable: true,
      stack: 1,
      description: 'Vidro translúcido com líquido carmesim. Restaura uma porção pequena de Vida.',
    },
    defaultPrice: 8,
  },
  'pot-mana-pequena': {
    item: {
      id: 'pot-mana-pequena',
      name: 'Poção de Mana Pequena',
      slot: null,
      rarity: 'comum',
      stackable: true,
      stack: 1,
      description: 'Líquido azul com brilho próprio. Restaura uma porção pequena de Mana.',
    },
    defaultPrice: 10,
  },

  // ── Comida ───────────────────────────────────────────────────────
  'food-pao-duro': {
    item: mat(
      'food-pao-duro',
      'Pão Duro',
      'Aguenta dias na bolsa. Recupera 5 de Vida quando comido.',
    ),
    defaultPrice: 2,
  },
  'food-queijo-cabra': {
    item: mat(
      'food-queijo-cabra',
      'Queijo de Cabra',
      'Forte e salgado. Recupera 8 de Vida.',
    ),
    defaultPrice: 3,
  },
  'food-conserva-raiz': {
    item: mat(
      'food-conserva-raiz',
      'Conserva de Raiz',
      'Vinagre vence o tempo. Recupera 10 de Vida.',
    ),
    defaultPrice: 5,
  },
  'food-vinho-fraco': {
    item: mat(
      'food-vinho-fraco',
      'Vinho Fraco',
      'Mais coragem que mérito. Recupera 4 de Mana.',
    ),
    defaultPrice: 4,
  },
};

/** Lookup por id — retorna item completo (cópia, com stack: 1) ou null. */
export function getMaterial(id: string): Item | null {
  const def = MATERIALS[id];
  return def ? { ...def.item } : null;
}

/** Constrói um stack do material com a quantidade indicada. */
export function makeMaterialStack(id: string, count: number): Item | null {
  const item = getMaterial(id);
  if (!item) return null;
  return { ...item, stack: count };
}

/** Nome humano do material — usado em UIs (CraftPane, etc.) */
export function getMaterialName(id: string): string {
  return MATERIALS[id]?.item.name ?? id;
}
