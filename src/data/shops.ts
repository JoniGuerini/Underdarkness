import type { Item } from '../types';
import { makeBaseItem } from './itemBases';
import { MATERIALS } from './materials';

/**
 * Item à venda numa loja — instância já-pronta com preço associado.
 * Stock infinito por enquanto: cada compra cria uma cópia, NPC nunca esgota.
 */
export interface ShopEntry {
  item: Item;
  price: number;
}

/** Atalho local — usa o helper público mas com idPrefix 'shop' pra distinguir
 *  itens vindos de loja de outros contextos (ex: drops, starter, crafting). */
const fromBase = (baseId: string) => makeBaseItem(baseId, 'shop');

/** Constrói uma ShopEntry a partir do registro de materiais — preço padrão. */
function fromMaterial(id: string, priceOverride?: number): ShopEntry {
  const def = MATERIALS[id];
  if (!def) throw new Error(`Material "${id}" não encontrado em MATERIALS`);
  return { item: { ...def.item }, price: priceOverride ?? def.defaultPrice };
}

// ============================================================================
// TIBÉRIO — Ferreiro: armas e armaduras de aço + materiais brutos
// ============================================================================
const tiberioStock: ShopEntry[] = [
  { item: fromBase('espada-longa'), price: 25 },
  { item: fromBase('adaga-curva'), price: 18 },
  { item: fromBase('martelo-de-guerra'), price: 35 },
  { item: fromBase('elmo-aco'), price: 30 },
  { item: fromBase('manoplas-aco'), price: 22 },
  { item: fromBase('botas-aco'), price: 25 },
  { item: fromBase('peitoral-ferro'), price: 50 },
  { item: fromBase('escudo-torre'), price: 28 },
  fromMaterial('mat-minerio-ferro'),
  fromMaterial('mat-couro-cru'),
  fromMaterial('mat-pedra-afiar'),
];

// ============================================================================
// SOLANA — Alquimista: poções prontas + reagentes brutos
// ============================================================================
const solanaStock: ShopEntry[] = [
  fromMaterial('pot-vida-pequena'),
  fromMaterial('pot-mana-pequena'),
  fromMaterial('erva-vermelha'),
  fromMaterial('erva-azul'),
  fromMaterial('raiz-noturna'),
  fromMaterial('frasco-vazio'),
];

// ============================================================================
// DOROTEU — Padaria: comida de estrada (consumíveis baratos)
// ============================================================================
const doroteoStock: ShopEntry[] = [
  fromMaterial('food-pao-duro'),
  fromMaterial('food-queijo-cabra'),
  fromMaterial('food-conserva-raiz'),
  fromMaterial('food-vinho-fraco'),
];

export const SHOPS: Record<string, ShopEntry[]> = {
  tiberio: tiberioStock,
  solana: solanaStock,
  doroteu: doroteoStock,
};

export function getShopForNpc(npcId: string): ShopEntry[] | null {
  return SHOPS[npcId] ?? null;
}
