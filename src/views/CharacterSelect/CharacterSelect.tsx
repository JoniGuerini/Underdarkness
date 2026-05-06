import { useState, useEffect } from 'react';
import type { Character } from '../../types';
import { CharacterSidebarItem } from '../../components/CharacterSidebarItem/CharacterSidebarItem';
import { CharacterDetailPanel } from '../../components/CharacterDetailPanel/CharacterDetailPanel';
import styles from './CharacterSelect.module.css';

interface CharacterSelectProps {
  characters: Character[];
  onContinue: (char: Character) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function CharacterSelect({ characters, onContinue, onDelete, onNew }: CharacterSelectProps) {
  const [selectedId, setSelectedId] = useState<string>(() =>
    characters.length > 0 ? characters[0].id : ''
  );

  // Mantém uma seleção válida quando a lista muda (ex: após excluir)
  useEffect(() => {
    if (characters.length === 0) return;
    if (!characters.some((c) => c.id === selectedId)) {
      setSelectedId(characters[0].id);
    }
  }, [characters, selectedId]);

  const selected = characters.find((c) => c.id === selectedId);
  if (!selected) return null;

  const handleDelete = () => {
    if (confirm(`Excluir "${selected.name}"? A ação não pode ser desfeita.`)) {
      onDelete(selected.id);
    }
  };

  return (
    <section className={styles.view}>
      <div className={styles.container}>
        <header className={styles.brand}>
          <h1>Underdarkness</h1>
        </header>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Personagens</h2>
          <p className={styles.sectionSubtitle}>Continue uma aventura ou comece uma nova.</p>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            {characters.map((char) => (
              <CharacterSidebarItem
                key={char.id}
                character={char}
                selected={char.id === selectedId}
                onClick={() => setSelectedId(char.id)}
              />
            ))}
          </aside>

          <main className={styles.detail}>
            <CharacterDetailPanel character={selected} />
          </main>
        </div>

        <div className={styles.actionRow}>
          <div className={styles.actionGroup}>
            <button className="btn-secondary danger" onClick={handleDelete}>
              Excluir
            </button>
            <button className="btn-secondary" onClick={onNew}>
              Novo Personagem
            </button>
          </div>
          <button className="btn-primary" onClick={() => onContinue(selected)}>
            Continuar
          </button>
        </div>
      </div>
    </section>
  );
}
