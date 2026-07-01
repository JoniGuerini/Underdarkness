import type { Item } from '../types';
import { NPCS } from './npcs';
import { getLocationById } from './world';

/**
 * Item à venda numa loja — instância já-pronta com preço associado.
 * Stock infinito por enquanto: cada compra cria uma cópia, NPC nunca esgota.
 */
export interface ShopEntry {
  item: Item;
  price: number;
}

/**
 * Estoques das lojas — esvaziados de propósito.
 *
 * A economia (o que cada NPC vende e por quanto) será redesenhada depois que a
 * base de dados de itens estiver completa. Por ora nenhuma loja vende nada, então
 * a "origem" de todos os itens aparece como "Sem fonte definida ainda".
 */
export const SHOPS: Record<string, ShopEntry[]> = {
  tiberio: [],
  solana: [],
  doroteu: [],
};

export function getShopForNpc(npcId: string): ShopEntry[] | null {
  return SHOPS[npcId] ?? null;
}

/** Uma fonte de compra de um item — qual NPC vende, onde e por quanto. */
export interface ShopSource {
  npcId: string;
  npcName: string;
  locationName: string;
  price: number;
}

/**
 * Todas as lojas que vendem um dado item (base ou material).
 * Itens de base na loja têm id `shop-<baseId>`; materiais usam o próprio id.
 */
export function getItemShopSources(itemId: string): ShopSource[] {
  const out: ShopSource[] = [];
  for (const [npcId, entries] of Object.entries(SHOPS)) {
    const entry = entries.find((e) => e.item.id === itemId || e.item.id === `shop-${itemId}`);
    if (!entry) continue;
    const npc = NPCS.find((n) => n.id === npcId);
    const loc = npc ? getLocationById(npc.locationId) : undefined;
    out.push({
      npcId,
      npcName: npc?.name ?? npcId,
      locationName: loc?.name ?? '',
      price: entry.price,
    });
  }
  return out;
}
