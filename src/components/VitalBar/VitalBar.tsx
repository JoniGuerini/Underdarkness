import styles from './VitalBar.module.css';

export type VitalKind = 'vida' | 'mana' | 'exp';

interface VitalBarProps {
  label: string;
  current: number;
  max: number;
  kind: VitalKind;
}

export function VitalBar({ label, current, max, kind }: VitalBarProps) {
  const pct = max > 0 ? (current / max) * 100 : 0;
  return (
    <div className={styles.track}>
      <div className={`${styles.fill} ${styles[kind]}`} style={{ width: `${pct}%` }} />
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.values}>{current} / {max}</span>
      </div>
    </div>
  );
}
