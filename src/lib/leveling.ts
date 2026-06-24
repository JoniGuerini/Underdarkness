/**
 * Sistema de níveis do personagem. Curva polinomial — XP requerida cresce
 * com o quadrado-ish do nível atual (formula `10 * level^1.5`).
 *
 * Marcos da curva:
 *   1 →  2  :   10 XP
 *   2 →  3  :   28 XP
 *   5 →  6  :  112 XP
 *  10 → 11  :  316 XP
 *  20 → 21  :  894 XP
 *  50 → 51  : 3535 XP
 *  99 → 100 : 9851 XP
 *
 * Cap em 100 níveis. Cada nível ganho destrava 1 ponto de talento — Vida/Mana
 * máximas, atributos e tudo mais ficam estáticos. Pontos de talento NÃO são
 * stored no Character; são derivados via `availableTalentPoints(level, ranks)`
 * em `data/talents.ts` — fórmula: `(level - 1) - total gasto`.
 */

import type { Character } from '../types';

export const MAX_LEVEL = 100;
const XP_BASE = 10;
const XP_EXPONENT = 1.5;

/** XP necessária pra ir do `level` atual pro `level + 1`. 0 se já está no cap. */
export function xpForLevel(level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return Math.round(XP_BASE * Math.pow(level, XP_EXPONENT));
}

export interface LevelUpResult {
  character: Character;
  leveledUp: boolean;
  gainedLevels: number;
}

/**
 * Aplica level-ups consecutivos enquanto `xp >= xpNext`. Só incrementa `level`
 * e ajusta `xp/xpNext`. Vida/Mana não mudam — o único ganho real do level-up é
 * o ponto de talento (derivado automaticamente via `availableTalentPoints`).
 */
export function applyLevelUp(character: Character): LevelUpResult {
  let { level, xp, xpNext } = character;
  let gainedLevels = 0;

  while (level < MAX_LEVEL && xp >= xpNext && xpNext > 0) {
    xp -= xpNext;
    level += 1;
    xpNext = xpForLevel(level);
    gainedLevels += 1;
  }

  // Se atingiu o cap, zera xp/xpNext pra que a barra mostre "0/0" e nunca avance
  if (level >= MAX_LEVEL) {
    xp = 0;
    xpNext = 0;
  }

  return {
    character: { ...character, level, xp, xpNext },
    leveledUp: gainedLevels > 0,
    gainedLevels,
  };
}
