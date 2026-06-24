/**
 * Magias concedidas por armas (cajados, etc.). O ataque básico do Mago
 * dispara a magia engastada na arma — não um golpe físico da haste.
 */

export type ElementKey = 'fogo' | 'gelo' | 'raio' | 'caos' | 'sagrado';

export interface SpellHit {
  element: ElementKey;
  min: number;
  max: number;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  /** Tempo base de conjuração em segundos (antes de Redução do Tempo de Conjuração). */
  castTimeSec: number;
  hits: SpellHit[];
}

export const SPELLS: Record<string, Spell> = {
  'bola-de-fogo': {
    id: 'bola-de-fogo',
    name: 'Bola de Fogo',
    description: 'Projétil ardente. Dano de fogo mitigado pela resistência do alvo.',
    castTimeSec: 1.5,
    hits: [{ element: 'fogo', min: 4, max: 8 }],
  },
};

import type { Character } from '../types';
import { getBaseById, resolveItemBaseId } from './itemBases';

export function getSpellById(id: string): Spell | undefined {
  return SPELLS[id];
}

/** Magia de ataque básico do Mago, concedida pela arma equipada. */
export function getGrantedSpell(character: Character): Spell | null {
  if (character.classKey !== 'mago') return null;
  const weapon = character.equipped.arma;
  if (!weapon) return null;
  const baseId = resolveItemBaseId(weapon);
  if (!baseId) return null;
  const spellId = getBaseById(baseId)?.grantedSpellId;
  if (!spellId) return null;
  return getSpellById(spellId) ?? null;
}
