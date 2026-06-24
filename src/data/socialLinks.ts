/**
 * Lookup pra resolver referências do chat (items e quests) ao dado real
 * do projeto. Quando um jogador escreve `[Erva Vermelha]` ou `[O Tribunal
 * do Lobo]` no chat, esses helpers tentam achar o Item/Quest correspondente
 * pra que o tooltip mostre stats reais e não um stub vazio.
 *
 * Buscas são case-sensitive por `name` / `title`. Se não encontrar, retorna
 * null e o caller decide o fallback (não exibe tooltip ou mostra mínimo).
 */

import type { Item, Quest } from '../types';
import { MATERIALS } from './materials';
import { RECIPES } from './recipes';
import { ITEM_BASES } from './itemBases';
import { QUESTS } from './quests';

export function findItemByName(name: string): Item | null {
  // 1. Materiais e consumíveis catalogados
  for (const def of Object.values(MATERIALS)) {
    if (def.item.name === name) return { ...def.item };
  }
  // 2. Resultados de receitas (itens craftados como "Lâmina do Vau")
  for (const recipe of RECIPES) {
    if (recipe.result.name === name) return { ...recipe.result };
  }
  // 3. Bases de equipamento — constrói versão Comum on-the-fly pra preview
  for (const base of ITEM_BASES) {
    if (base.name === name) {
      return {
        id: `link-${base.id}`,
        name: base.name,
        slot: base.slot,
        rarity: 'comum',
        stats: base.baseStats.map((s) => ({ ...s, kind: 'base' as const })),
        description: base.description,
      };
    }
  }
  return null;
}

export function findQuestByName(name: string): Quest | null {
  return QUESTS.find((q) => q.title === name) ?? null;
}
