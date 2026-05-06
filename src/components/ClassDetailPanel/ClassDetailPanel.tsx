import type { ClassData } from '../../types';
import styles from './ClassDetailPanel.module.css';

interface ClassDetailPanelProps {
  data: ClassData;
}

export function ClassDetailPanel({ data }: ClassDetailPanelProps) {
  return (
    <div className={styles.panel}>
      <div>
        <h2 className={styles.title}>{data.label}</h2>
        <div className={styles.tagline}>{data.tagline}</div>
      </div>

      <p className={styles.description}>{data.description}</p>

      <div className={styles.cols}>
        <div>
          <div className={styles.colTitle}>Atributos Iniciais</div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.forca}`}>Força</span>
            <span className={styles.statValue}>{data.forca}</span>
          </div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.agilidade}`}>Agilidade</span>
            <span className={styles.statValue}>{data.agilidade}</span>
          </div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.intelecto}`}>Intelecto</span>
            <span className={styles.statValue}>{data.intelecto}</span>
          </div>
        </div>
        <div>
          <div className={styles.colTitle}>Recursos</div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.vida}`}>Vida</span>
            <span className={styles.statValue}>{data.vida}</span>
          </div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.mana}`}>Mana</span>
            <span className={styles.statValue}>{data.mana}</span>
          </div>
        </div>
      </div>

      <div>
        <div className={styles.colTitle}>Habilidades Iniciais</div>
        {data.abilities.map((ability) => (
          <div key={ability.name} className={styles.abilityRow}>
            <div>
              <div className={styles.abilityName}>{ability.name}</div>
              <div className={styles.abilityDesc}>{ability.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
