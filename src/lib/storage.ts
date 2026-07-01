import type { Character, Item } from '../types';
import { emptyEquipped, emptyInventory, INVENTORY_SIZE } from '../data/items';
import { CLASSES } from '../data/classes';
import { applyLevelUp, xpForLevel } from './leveling';
import { computeDerivedStats } from './stats';

const STORAGE_KEY = 'underdarkness_characters';

/** Garante rarity e migra StatKeys obsoletos em itens salvos. */
function migrateItem(item: Item | null): Item | null {
  if (!item) return item;
  const withRarity: Item = item.rarity ? item : { ...item, rarity: 'comum' };
  if (!withRarity.stats) return withRarity;
  const REMOVED_KEYS = new Set(['flat-bonus-magico', 'pct-vel-movimento']);
  const KEY_RENAMES: Record<string, string> = {
    'pct-vel-conjuracao': 'pct-red-tempo-conjuracao',
  };
  const stats = withRarity.stats
    .map((stat) => {
      if (!stat.effect) return stat;
      if (REMOVED_KEYS.has(stat.effect.key)) return null;
      const renamed = KEY_RENAMES[stat.effect.key];
      if (!renamed) return stat;
      return { ...stat, effect: { ...stat.effect, key: renamed as typeof stat.effect.key } };
    })
    .filter((s) => s !== null);
  if (stats.length === withRarity.stats.length) return withRarity;
  return { ...withRarity, stats };
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

  // Re-sincroniza atributos primários com a definição atual da classe.
  // Durante a fase de balanceamento (atributos base mudam conforme afinamos
  // o sistema), todo load de personagem pega os valores frescos de CLASSES.
  // Quando o jogador puder alocar pontos manualmente, esse refresh vira
  // condicional (manter só o base; deltas alocados ficam em outro campo).
  const cls = CLASSES[c.classKey];
  const refreshedAttrs = cls
    ? { forca: cls.forca, agilidade: cls.agilidade, intelecto: cls.intelecto }
    : { forca: c.forca, agilidade: c.agilidade, intelecto: c.intelecto };

  const intermediate: Character = {
    ...c,
    ...refreshedAttrs,
    equipped,
    inventory: sized,
    talentRanks: c.talentRanks ?? {},
    // 'origem' foi renomeada pra 'pedragal' — saves antigos migram automaticamente
    visitedLocations: (c.visitedLocations ?? ['pedragal']).map((id) =>
      id === 'origem' ? 'pedragal' : id,
    ),
    abandonedQuestIds: c.abandonedQuestIds ?? [],
    acceptedQuestIds: c.acceptedQuestIds ?? [],
    questStates: c.questStates ?? {},
    location: c.location === 'origem' ? 'pedragal' : (c.location ?? 'pedragal'),
    // Recomputa xpNext com a curva nova (10*level^1.5) — saves antigos tinham
    // xpNext: 100 hardcoded, agora é função do nível atual.
    xpNext: xpForLevel(c.level || 1),
  };
  // Aplica level-ups retroativos caso o jogador tenha acumulado XP suficiente
  // pela curva nova (não cura — heal só acontece em vitória de combate).
  const leveled = applyLevelUp(intermediate).character;

  // Sincroniza vidaMax/manaMax com os valores derivados (que agora dependem
  // de atributos e itens). Clampa vidaAtual/manaAtual pro novo cap quando
  // ele encolhe (ex: jogador desequipou um item +Mana).
  const derived = computeDerivedStats(leveled);
  return {
    ...leveled,
    vidaMax: derived.vidaMax,
    manaMax: derived.manaMax,
    vidaAtual: Math.min(leveled.vidaAtual, derived.vidaMax),
    manaAtual: Math.min(leveled.manaAtual, derived.manaMax),
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
