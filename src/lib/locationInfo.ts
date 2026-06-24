import type { MapLocation } from '../types';
import { hasEncounters } from '../data/enemies';

/** Nível mínimo e máximo dos inimigos que podem spawnar na área. */
export function getEncounterLevelRange(location: MapLocation): { min: number; max: number } | null {
  if (location.type === 'town') return null;
  if (!hasEncounters(location.id)) return null;
  return { min: location.level, max: location.level + 1 };
}

/** Rótulo curto pro badge do mapa (canto do tooltip). */
export function getLocationLevelBadge(location: MapLocation): string {
  if (location.type === 'town') return 'Zona segura';
  const range = getEncounterLevelRange(location);
  if (range) return `Nv ${range.min}–${range.max}`;
  return `Nv ${location.level}`;
}

/** Meta da cena atual — texto explícito quando há encontros. */
export function getSceneLocationMeta(location: MapLocation): string {
  if (location.type === 'town') return 'Zona segura';
  const label = getEncounterLevelLabel(location);
  if (label) return label;
  return `Nv ${location.level}`;
}

/** Linha descritiva de inimigos (cena atual, tooltip). */
export function getEncounterLevelLabel(location: MapLocation): string | null {
  const range = getEncounterLevelRange(location);
  if (!range) return null;
  return `Inimigos: Nv ${range.min}–${range.max}`;
}
