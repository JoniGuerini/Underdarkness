import { useEffect, useRef } from 'react';
import type { Character } from '../types';
import { applyRegenTick, computeDerivedStats } from '../lib/stats';

const REGEN_INTERVAL_MS = 1000;

/**
 * Aplica regeneração de vida/mana a cada segundo enquanto `active`.
 * Usado fora do combate; no combate por turnos cada round equivale a 1s
 * até migrarmos para combate em tempo real.
 */
export function useRegenTick(
  character: Character,
  onUpdate: (c: Character) => void,
  active: boolean,
): void {
  const characterRef = useRef(character);
  const onUpdateRef = useRef(onUpdate);
  characterRef.current = character;
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!active) return;
    const d = computeDerivedStats(characterRef.current);
    if (d.regenVida === 0 && d.regenMana === 0) return;

    const id = setInterval(() => {
      const c = characterRef.current;
      const next = applyRegenTick(c);
      if (next !== c) onUpdateRef.current(next);
    }, REGEN_INTERVAL_MS);

    return () => clearInterval(id);
  }, [active]);
}
