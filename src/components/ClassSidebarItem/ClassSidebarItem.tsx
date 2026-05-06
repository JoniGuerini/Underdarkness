import type { ClassData } from '../../types';
import styles from './ClassSidebarItem.module.css';

interface ClassSidebarItemProps {
  data: ClassData;
  selected: boolean;
  onClick: () => void;
}

export function ClassSidebarItem({ data, selected, onClick }: ClassSidebarItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className={styles.name}>{data.label}</span>
      <span className={styles.tagline}>{data.tagline}</span>
      {selected && <span className={styles.arrow}>→</span>}
    </button>
  );
}
