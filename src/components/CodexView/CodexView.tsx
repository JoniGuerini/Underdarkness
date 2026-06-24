import type { Character } from '../../types';
import { RarityGuide } from './RarityGuide';
import styles from './CodexView.module.css';

interface CodexViewProps {
  character: Character;
}

/** Códice — guias que ensinam mecânicas ao jogador. */
export function CodexView({ character: _character }: CodexViewProps) {
  return (
    <div className={styles.root}>
      <div className={styles.sectionBody}>
        <RarityGuide />
      </div>
    </div>
  );
}

interface CodexHeaderProps {
  character: Character;
  onClose: () => void;
  shortcut?: string;
}

export function CodexHeader({ character, onClose, shortcut = 'L' }: CodexHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Códice</div>
        <div className={styles.subtitle}>
          {character.name} · Guias de mecânica
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
