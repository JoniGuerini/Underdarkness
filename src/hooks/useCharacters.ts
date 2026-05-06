import { useState, useCallback } from 'react';
import type { Character } from '../types';
import { loadCharacters, saveCharacters } from '../lib/storage';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>(() => loadCharacters());

  const saveCharacter = useCallback((char: Character) => {
    setCharacters((prev) => {
      const updated = { ...char, updatedAt: new Date().toISOString() };
      const idx = prev.findIndex((c) => c.id === char.id);
      const next = idx >= 0 ? prev.map((c, i) => (i === idx ? updated : c)) : [...prev, updated];
      saveCharacters(next);
      return next;
    });
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCharacters(next);
      return next;
    });
  }, []);

  return { characters, saveCharacter, deleteCharacter };
}
