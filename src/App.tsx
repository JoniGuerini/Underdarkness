import { useState, useEffect } from 'react';
import type { Character } from './types';
import { useCharacters } from './hooks/useCharacters';
import { useSettings } from './hooks/useSettings';
import { CharacterSelect } from './views/CharacterSelect/CharacterSelect';
import { CharacterCreate } from './views/CharacterCreate/CharacterCreate';
import { GameHud } from './views/GameHud/GameHud';

type View = 'list' | 'create' | 'hud';

/** Pede tela cheia ao navegador. Precisa rodar dentro de um user gesture
 * (click handler) — o navegador rejeita chamadas fora disso. Falhas são
 * silenciosas: o jogo segue normalmente em janela. */
function tryRequestFullscreen() {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };
  const req = el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.msRequestFullscreen;
  if (!req) return;
  if (document.fullscreenElement) return;
  try {
    const result = req.call(el);
    if (result instanceof Promise) result.catch(() => {});
  } catch {
    /* silently ignore — usuário pode não ter dado gesture, ou navegador bloqueou */
  }
}

export function App() {
  const { characters, saveCharacter, deleteCharacter } = useCharacters();
  const { settings, setSettings, resetShortcuts } = useSettings();

  const enterHud = () => {
    if (settings.startInFullscreen) tryRequestFullscreen();
  };
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
          enterHud();
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
          enterHud();
        }}
      />
    );
  }

  if (view === 'hud' && activeCharacter) {
    return (
      <GameHud
        character={activeCharacter}
        settings={settings}
        onSettingsChange={setSettings}
        onResetShortcuts={resetShortcuts}
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
