import type { Character, Item } from '../types';
import { emptyEquipped, emptyInventory, INVENTORY_SIZE } from '../data/items';

const STORAGE_KEY = 'underdarkness_characters';

/** Garante que todo Item carregado tem `rarity` (campo novo). */
function migrateItem<T extends Item | null>(item: T): T {
  if (!item) return item;
  if (item.rarity) return item;
  return { ...item, rarity: 'comum' } as T;
}

/**
 * Migra um personagem carregado do localStorage pra forma atual,
 * preenchendo campos novos com defaults seguros e ajustando renames.
 */
function migrate(c: Character): Character {
  const rawEquipped = (c.equipped ?? emptyEquipped()) as Record<string, Item | null>;
  const rawInventory = c.inventory ?? emptyInventory();

  // Renomeia 'anel' antigo (slot único) pra 'anel1' (novo modelo de 2 slots).
  // O segundo slot fica vazio. Saves antigos não perdem nada.
  const equipped = emptyEquipped();
  for (const [slot, item] of Object.entries(rawEquipped)) {
    const target = slot === 'anel' ? 'anel1' : slot;
    if (target in equipped) {
      (equipped as Record<string, Item | null>)[target] = migrateItem(item);
    }
  }

  // Redimensiona inventário: cresce com nulls se aumentou (ex: 24 → 36),
  // trunca se reduziu (caso de pânico).
  const sized: (Item | null)[] = new Array(INVENTORY_SIZE).fill(null);
  for (let i = 0; i < Math.min(rawInventory.length, INVENTORY_SIZE); i++) {
    sized[i] = migrateItem(rawInventory[i]);
  }

  return {
    ...c,
    equipped,
    inventory: sized,
    talentRanks: c.talentRanks ?? {},
    // 'origem' foi renomeada pra 'pedragal' — saves antigos migram automaticamente
    visitedLocations: (c.visitedLocations ?? ['pedragal']).map((id) =>
      id === 'origem' ? 'pedragal' : id,
    ),
    abandonedQuestIds: c.abandonedQuestIds ?? [],
    location: c.location === 'origem' ? 'pedragal' : (c.location ?? 'pedragal'),
  };
}

export function loadCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Character[];
    return parsed.map(migrate);
  } catch (e) {
    console.error('Erro ao ler personagens:', e);
    return [];
  }
}

export function saveCharacters(chars: Character[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chars));
  } catch (e) {
    console.error('Erro ao salvar personagens:', e);
  }
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
