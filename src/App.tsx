import { useState, useEffect } from 'react';
import type { Character } from './types';
import { useCharacters } from './hooks/useCharacters';
import { CharacterSelect } from './views/CharacterSelect/CharacterSelect';
import { CharacterCreate } from './views/CharacterCreate/CharacterCreate';
import { GameHud } from './views/GameHud/GameHud';

type View = 'list' | 'create' | 'hud';

export function App() {
  const { characters, saveCharacter, deleteCharacter } = useCharacters();
  const [view, setView] = useState<View>(() => (characters.length > 0 ? 'list' : 'create'));
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);

  // Se não restou nenhum personagem na list, manda pra create
  useEffect(() => {
    if (view === 'list' && characters.length === 0) setView('create');
  }, [view, characters.length]);

  if (view === 'list') {
    return (
      <CharacterSelect
        characters={characters}
        onContinue={(char) => {
          setActiveCharacter(char);
          setView('hud');
        }}
        onDelete={deleteCharacter}
        onNew={() => setView('create')}
      />
    );
  }

  if (view === 'create') {
    return (
      <CharacterCreate
        canGoBack={characters.length > 0}
        onBack={() => setView('list')}
        onCreate={(char) => {
          saveCharacter(char);
          setActiveCharacter(char);
          setView('hud');
        }}
      />
    );
  }

  if (view === 'hud' && activeCharacter) {
    return (
      <GameHud
        character={activeCharacter}
        onUpdate={(updated) => {
          setActiveCharacter(updated);
          saveCharacter(updated);
        }}
        onBackToList={() => {
          if (activeCharacter) saveCharacter(activeCharacter);
          setView('list');
        }}
      />
    );
  }

  return null;
}
