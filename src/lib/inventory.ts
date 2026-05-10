import type { Item } from '../types';

/**
 * Adiciona uma unidade do item ao inventário. Se o item é stackable e já
 * existe um stack do mesmo `id`, incrementa o stack. Caso contrário, ocupa
 * o primeiro slot vazio.
 *
 * Retorna `{ inventory: novo array, added: boolean }`. `added: false`
 * indica que o inventário está cheio (item descartado, sem alteração).
 */
export function addItemToInventory(
  inventory: (Item | null)[],
  item: Item,
): { inventory: (Item | null)[]; added: boolean } {
  const next = [...inventory];

  // Tenta empilhar primeiro (se stackable)
  if (item.stackable) {
    const existingIdx = next.findIndex((i) => i && i.id === item.id && i.stackable);
    if (existingIdx >= 0) {
      const existing = next[existingIdx]!;
      next[existingIdx] = { ...existing, stack: (existing.stack ?? 1) + 1 };
      return { inventory: next, added: true };
    }
  }

  // Senão, primeiro slot vazio
  const emptyIdx = next.findIndex((i) => i === null);
  if (emptyIdx < 0) return { inventory, added: false };

  next[emptyIdx] = item.stackable ? { ...item, stack: 1 } : item;
  return { inventory: next, added: true };
}

/**
 * Remove uma unidade do item no slot `idx`. Se o item é stackable com mais
 * de 1 unidade, decrementa. Caso contrário, esvazia o slot. Retorna o
 * inventário novo.
 */
export function removeOneAtSlot(
  inventory: (Item | null)[],
  idx: number,
): (Item | null)[] {
  const item = inventory[idx];
  if (!item) return inventory;
  const next = [...inventory];
  if (item.stackable && (item.stack ?? 1) > 1) {
    next[idx] = { ...item, stack: (item.stack ?? 1) - 1 };
  } else {
    next[idx] = null;
  }
  return next;
}

/**
 * Conta total de unidades de um item no inventário (soma todos os stacks
 * com o `id` informado). Usado pra checar reagentes em receitas.
 */
export function countItem(inventory: (Item | null)[], itemId: string): number {
  return inventory.reduce((sum, slot) => {
    if (slot && slot.id === itemId) {
      return sum + (slot.stack ?? 1);
    }
    return sum;
  }, 0);
}

/**
 * Consome `quantity` unidades do item `itemId` do inventário, decrementando
 * stacks e esvaziando slots conforme necessário. Retorna o novo inventário
 * ou `null` se não houver quantidade suficiente.
 */
export function consumeItem(
  inventory: (Item | null)[],
  itemId: string,
  quantity: number,
): (Item | null)[] | null {
  if (countItem(inventory, itemId) < quantity) return null;
  const next = [...inventory];
  let remaining = quantity;
  for (let i = 0; i < next.length && remaining > 0; i++) {
    const slot = next[i];
    if (!slot || slot.id !== itemId) continue;
    const have = slot.stack ?? 1;
    if (have <= remaining) {
      remaining -= have;
      next[i] = null;
    } else {
      next[i] = { ...slot, stack: have - remaining };
      remaining = 0;
    }
  }
  return next;
}

/**
 * Preço de venda do item — fórmula simples baseada em raridade e tipo.
 * Lojas pagam isso ao comprar item do jogador. Materiais/consumíveis
 * stackable valem pouco; equipamento escala com raridade.
 */
export function getSellPrice(item: Item): number {
  if (item.stackable) return 1;
  switch (item.rarity) {
    case 'comum': return 5;
    case 'magico': return 22;
    case 'raro': return 65;
    case 'unico': return 160;
    case 'lendario': return 420;
    default: return 1;
  }
}
