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
  /** Elemento primário — usado pra cor/organização (derivável de hits[0]). */
  element: ElementKey;
  /** Tier de poder (1 = inicial). Organiza a progressão; será balanceado depois. */
  tier: number;
  /** Tempo base de conjuração em segundos (antes de Redução do Tempo de Conjuração). */
  castTimeSec: number;
  hits: SpellHit[];
}

/**
 * Registro central de magias concedidas por armas mágicas.
 *
 * Conceitos simples por enquanto — todas são PROJÉTEIS de alvo único (sem área).
 * Magias de área/avançadas virão numa etapa futura.
 *
 * Estas magias são o ATAQUE BÁSICO da arma mágica — não custam mana.
 *
 * Divisão por arma:
 *  - **Cajados** (duas mãos): Fogo, Gelo, Raio e Sagrado — mais fortes e lentos.
 *  - **Varinhas** (uma mão): Caos — projéteis mais rápidos, porém mais fracos.
 *
 * Os valores de dano/mana/cast são uma BASE provisória — balanceamento dedicado depois.
 */
export const SPELLS: Record<string, Spell> = {
  // ══ Cajados ═════════════════════════════════════════════════════════
  // ── Fogo ──
  'dardo-de-fogo': {
    id: 'dardo-de-fogo', name: 'Dardo de Fogo', element: 'fogo', tier: 1, castTimeSec: 1.3,
    description: 'Um pequeno dardo de chamas disparado contra o alvo.',
    hits: [{ element: 'fogo', min: 4, max: 8 }],
  },
  'bola-de-fogo': {
    id: 'bola-de-fogo', name: 'Bola de Fogo', element: 'fogo', tier: 2, castTimeSec: 1.6,
    description: 'Esfera ardente que voa em linha reta e queima o que atinge.',
    hits: [{ element: 'fogo', min: 14, max: 24 }],
  },
  'lanca-de-fogo': {
    id: 'lanca-de-fogo', name: 'Lança de Fogo', element: 'fogo', tier: 3, castTimeSec: 1.9,
    description: 'Uma lança de fogo concentrado que perfura e incendeia.',
    hits: [{ element: 'fogo', min: 30, max: 50 }],
  },

  // ── Gelo ──
  'lasca-de-gelo': {
    id: 'lasca-de-gelo', name: 'Lasca de Gelo', element: 'gelo', tier: 1, castTimeSec: 1.3,
    description: 'Estilhaço congelante disparado contra o alvo.',
    hits: [{ element: 'gelo', min: 4, max: 8 }],
  },
  'dardo-glacial': {
    id: 'dardo-glacial', name: 'Dardo Glacial', element: 'gelo', tier: 2, castTimeSec: 1.6,
    description: 'Um dardo de gelo denso que voa e enregela ao acertar.',
    hits: [{ element: 'gelo', min: 14, max: 24 }],
  },
  'lanca-de-gelo': {
    id: 'lanca-de-gelo', name: 'Lança de Gelo', element: 'gelo', tier: 3, castTimeSec: 1.9,
    description: 'Uma lança de gelo afiada que rasga e congela.',
    hits: [{ element: 'gelo', min: 30, max: 50 }],
  },

  // ── Raio ──
  'faisca': {
    id: 'faisca', name: 'Faísca', element: 'raio', tier: 1, castTimeSec: 1.3,
    description: 'Descarga elétrica errática — dano baixo a alto, imprevisível.',
    hits: [{ element: 'raio', min: 1, max: 11 }],
  },
  'dardo-eletrico': {
    id: 'dardo-eletrico', name: 'Dardo Elétrico', element: 'raio', tier: 2, castTimeSec: 1.5,
    description: 'Um dardo crepitante que salta direto ao alvo.',
    hits: [{ element: 'raio', min: 6, max: 32 }],
  },
  'raio': {
    id: 'raio', name: 'Raio', element: 'raio', tier: 3, castTimeSec: 1.8,
    description: 'Um relâmpago focado que despenca sobre o alvo.',
    hits: [{ element: 'raio', min: 12, max: 70 }],
  },

  // ── Sagrado ──
  'centelha-sagrada': {
    id: 'centelha-sagrada', name: 'Centelha Sagrada', element: 'sagrado', tier: 1, castTimeSec: 1.3,
    description: 'Fagulha de luz que queima o profano.',
    hits: [{ element: 'sagrado', min: 4, max: 8 }],
  },
  'dardo-de-luz': {
    id: 'dardo-de-luz', name: 'Dardo de Luz', element: 'sagrado', tier: 2, castTimeSec: 1.6,
    description: 'Um raio de luz condensada disparado contra o alvo.',
    hits: [{ element: 'sagrado', min: 15, max: 25 }],
  },
  'lanca-de-luz': {
    id: 'lanca-de-luz', name: 'Lança de Luz', element: 'sagrado', tier: 3, castTimeSec: 1.9,
    description: 'Uma lança de luz pura que atravessa o alvo.',
    hits: [{ element: 'sagrado', min: 32, max: 52 }],
  },

  // ══ Varinhas — Caos (projéteis rápidos e mais fracos) ═══════════════
  'dardo-do-caos': {
    id: 'dardo-do-caos', name: 'Dardo do Caos', element: 'caos', tier: 1, castTimeSec: 1.0,
    description: 'Um dardo de energia corruptora, rápido e que ignora parte das defesas.',
    hits: [{ element: 'caos', min: 3, max: 6 }],
  },
  'rajada-profana': {
    id: 'rajada-profana', name: 'Rajada Profana', element: 'caos', tier: 2, castTimeSec: 1.2,
    description: 'Uma rajada veloz de energia profana disparada contra o alvo.',
    hits: [{ element: 'caos', min: 9, max: 16 }],
  },
  'lanca-abissal': {
    id: 'lanca-abissal', name: 'Lança Abissal', element: 'caos', tier: 3, castTimeSec: 1.4,
    description: 'Uma lança de escuridão do abismo, rápida e perfurante.',
    hits: [{ element: 'caos', min: 18, max: 32 }],
  },
  'esfera-do-caos': {
    id: 'esfera-do-caos', name: 'Esfera do Caos', element: 'caos', tier: 4, castTimeSec: 1.6,
    description: 'Uma esfera instável de puro caos que voa até o alvo.',
    hits: [{ element: 'caos', min: 32, max: 54 }],
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
