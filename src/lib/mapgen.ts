/**
 * Gerador de mapas de endgame (Atlas de Mapas). Um mapa é um item consumível
 * que define uma expedição: nível dos inimigos por tier, número de ondas, tema
 * (pool de inimigos) e afixos (dificuldade × recompensa).
 *
 * Reaproveita o escalonamento de inimigos existente (`spawnEnemy`) e os pools
 * por área (`LOCATION_ENEMIES`). A expedição é sempre no nível ≥100 — o eixo é
 * horizontal (loot/tier), não vertical (nível).
 */

import type { MapItem } from '../types';
import { LOCATIONS, getLocationById, getLocationAct } from '../data/world';
import { ENEMY_DEFS, LOCATION_ENEMIES, spawnEnemy, type Enemy } from '../data/enemies';
import { MAP_AFFIXES, rollMapAffix } from '../data/mapAffixes';

export const MAX_MAP_TIER = 16;

/** Nível dos inimigos da expedição — começa em 100 (endgame) e sobe com o tier. */
export function tierMonsterLevel(tier: number): number {
  return 100 + (tier - 1) * 3;
}

/** Ondas antes do chefe — cresce devagar com o tier. */
export function tierWaves(tier: number): number {
  return Math.min(7, 4 + Math.floor((tier - 1) / 4));
}

/** Quantidade de afixos do mapa — cresce com o tier. */
function tierAffixCount(tier: number): number {
  return Math.min(4, 1 + Math.floor(tier / 2));
}

function rand(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Locais que servem de tema — têm pool de inimigos e não são vilas. */
const THEME_IDS: string[] = Object.keys(LOCATION_ENEMIES).filter((id) => {
  const loc = getLocationById(id);
  return loc && loc.type !== 'town' && loc.type !== 'boss';
});

const BOSS_LOCATIONS = LOCATIONS.filter((l) => l.type === 'boss');

/** Um inimigo-chefe pra fechar a expedição — preferindo o ato do tema. */
function pickBossEnemyId(themeId: string): string | undefined {
  const themeLoc = getLocationById(themeId);
  const act = themeLoc ? getLocationAct(themeLoc) : 1;
  const inAct = BOSS_LOCATIONS.filter((l) => getLocationAct(l) === act);
  const src = inAct.length > 0 ? inAct : BOSS_LOCATIONS;
  const ids = src.flatMap((l) => LOCATION_ENEMIES[l.id] ?? []);
  return ids.length > 0 ? pick(ids) : undefined;
}

/** Sorteia afixos distintos elegíveis pro tier. */
function rollMapAffixes(tier: number, count: number) {
  const eligible = MAP_AFFIXES.filter((a) => (a.minTier ?? 1) <= tier);
  const pool = [...eligible];
  const out = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const [def] = pool.splice(idx, 1);
    out.push(rollMapAffix(def));
  }
  return out;
}

/** Rola um mapa completo de um dado tier. */
export function rollMap(tier: number): MapItem {
  const clampedTier = Math.max(1, Math.min(MAX_MAP_TIER, Math.round(tier)));
  const themeId = THEME_IDS.length > 0 ? pick(THEME_IDS) : 'floresta-densa';
  const themeName = getLocationById(themeId)?.name ?? themeId;
  const id = `mapa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    name: `Mapa: ${themeName}`,
    tier: clampedTier,
    theme: themeId,
    themeName,
    monsterLevel: tierMonsterLevel(clampedTier),
    waves: tierWaves(clampedTier),
    affixes: rollMapAffixes(clampedTier, tierAffixCount(clampedTier)),
  };
}

function beefBoss(e: Enemy): Enemy {
  return {
    ...e,
    vidaMax: Math.round(e.vidaMax * 1.8),
    danoMin: Math.round(e.danoMin * 1.15),
    danoMax: Math.round(e.danoMax * 1.15),
  };
}

/**
 * Monta a fila de inimigos da expedição: `waves` inimigos normais do tema +
 * 1 chefe (último da lista). Os afixos de mapa são aplicados pela expedição
 * na hora de cada onda (`applyMapModsToEnemy` em combat.ts).
 */
export function buildExpeditionEnemies(map: MapItem): Enemy[] {
  const pool = LOCATION_ENEMIES[map.theme] ?? [];
  const fallbackId = Object.keys(ENEMY_DEFS)[0];
  const enemies: Enemy[] = [];

  for (let i = 0; i < map.waves; i++) {
    const defId = pool.length > 0 ? pick(pool) : fallbackId;
    const def = ENEMY_DEFS[defId];
    if (def) enemies.push(spawnEnemy(def, map.monsterLevel));
  }

  const bossId = pickBossEnemyId(map.theme) ?? fallbackId;
  const bossDef = ENEMY_DEFS[bossId];
  if (bossDef) enemies.push(beefBoss(spawnEnemy(bossDef, map.monsterLevel + 2)));

  return enemies;
}

/**
 * Sorteia mapas de recompensa ao concluir uma expedição de tier `tier`.
 * Garante sustain (média ~1 mapa/clear) e progressão (chance de subir de tier).
 */
export function rollExpeditionMapDrops(tier: number): MapItem[] {
  const drops: MapItem[] = [];
  const count = Math.random() < 0.65 ? (Math.random() < 0.3 ? 2 : 1) : 0;
  for (let i = 0; i < count; i++) {
    const tierUp = Math.random() < 0.4 && tier < MAX_MAP_TIER;
    drops.push(rollMap(tierUp ? tier + 1 : tier));
  }
  return drops;
}

/** Número de itens-base dropados por uma expedição (antes do bônus de quantidade). */
export function baseLootCount(tier: number): number {
  return 2 + Math.floor(tier / 3) + rand(0, 1);
}

/** Cor (token CSS) do tier — quatro faixas, do sóbrio ao raro. */
export function tierColorVar(tier: number): string {
  if (tier <= 4) return 'var(--map-tier-1)';
  if (tier <= 8) return 'var(--map-tier-2)';
  if (tier <= 12) return 'var(--map-tier-3)';
  return 'var(--map-tier-4)';
}
