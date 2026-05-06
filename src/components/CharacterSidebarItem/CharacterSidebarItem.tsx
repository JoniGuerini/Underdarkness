import type { Character } from '../../types';
import styles from './CharacterSidebarItem.module.css';

interface CharacterSidebarItemProps {
  character: Character;
  selected: boolean;
  onClick: () => void;
}

export function CharacterSidebarItem({ character, selected, onClick }: CharacterSidebarItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className={styles.name}>{character.name}</span>
      <span className={styles.meta}>
        {character.classLabel} · Nv {character.level}
      </span>
      {selected && <span className={styles.arrow}>→</span>}
    </button>
  );
}
