import styles from './VitalBar.module.css';

export type VitalKind = 'vida' | 'mana' | 'exp';

interface VitalBarProps {
  label: string;
  current: number;
  max: number;
  kind: VitalKind;
  /**
   * Escudo de Energia sobreposto à barra (só faz sentido em kind="vida").
   * A camada cobre a barra proporcionalmente a `overlayCurrent / max` — com
   * ES ≥ Vida Máxima, cobre a barra inteira.
   */
  overlayCurrent?: number;
}

export function VitalBar({ label, current, max, kind, overlayCurrent }: VitalBarProps) {
  const pct = max > 0 ? (current / max) * 100 : 0;
  const overlayPct = overlayCurrent && max > 0 ? Math.min(100, (overlayCurrent / max) * 100) : 0;
  return (
    <div className={styles.track}>
      <div className={`${styles.fill} ${styles[kind]}`} style={{ width: `${pct}%` }} />
      {overlayPct > 0 && <div className={styles.overlay} style={{ width: `${overlayPct}%` }} />}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.values}>
          {current} / {max}
          {overlayCurrent !== undefined && overlayCurrent > 0 && (
            <span className={styles.overlayValue}> +{overlayCurrent}</span>
          )}
        </span>
      </div>
    </div>
  );
}
