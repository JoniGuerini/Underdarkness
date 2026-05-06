import type { ClassData } from '../../types';
import styles from './ClassCard.module.css';

interface ClassCardProps {
  data: ClassData;
  selected: boolean;
  onClick: () => void;
}

export function ClassCard({ data, selected, onClick }: ClassCardProps) {
  return (
    <article
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h3 className={styles.name}>{data.label}</h3>
      <p className={styles.tagline}>{data.tagline}</p>
      <p className={styles.description}>{data.description}</p>

      <div className={styles.statsPanel}>
        <div className={styles.vitalsRow}>
          <div className={styles.vital}>
            <div className={styles.vitalLabel}>Vida</div>
            <div className={styles.vitalValue}>{data.vida}</div>
          </div>
          <div className={styles.vital}>
            <div className={styles.vitalLabel}>Mana</div>
            <div className={styles.vitalValue}>{data.mana}</div>
          </div>
        </div>
        <div className={styles.attrRow}>
          <div className={styles.attr}>
            <div className={styles.attrLabel}>Força</div>
            <div className={styles.attrValue}>{data.forca}</div>
          </div>
          <div className={styles.attr}>
            <div className={styles.attrLabel}>Agilidade</div>
            <div className={styles.attrValue}>{data.agilidade}</div>
          </div>
          <div className={styles.attr}>
            <div className={styles.attrLabel}>Intelecto</div>
            <div className={styles.attrValue}>{data.intelecto}</div>
          </div>
        </div>
      </div>

      <ul className={styles.abilityList}>
        {data.abilities.map((ability) => (
          <li key={ability.name}>
            <div>
              <span className={styles.abilityName}>{ability.name}</span>{' '}
              <span className={styles.abilityDesc}>— {ability.desc}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
