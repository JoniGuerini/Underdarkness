import type { Character } from '../../types';
import styles from './CharacterDetailPanel.module.css';

interface CharacterDetailPanelProps {
  character: Character;
}

export function CharacterDetailPanel({ character }: CharacterDetailPanelProps) {
  const c = character;

  return (
    <div className={styles.panel}>
      <div>
        <h2 className={styles.title}>{c.name}</h2>
        <div className={styles.subtitle}>
          {c.classLabel} · Nível {c.level}
        </div>
      </div>

      <div className={styles.world}>
        <span className={styles.worldPlace}>{c.location}</span>
        <span className={styles.worldSep}>·</span>
        <span className={styles.worldMeta}>Dia {c.day} — {c.period}</span>
        <span className={styles.worldSep}>·</span>
        <span className={styles.worldMeta}>{c.time}</span>
        <span className={styles.worldSep}>·</span>
        <span className={styles.worldMeta}>{c.gold} ouro</span>
      </div>

      <div className={styles.cols}>
        <div>
          <div className={styles.colTitle}>Atributos</div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.forca}`}>Força</span>
            <span className={styles.statValue}>{c.forca}</span>
          </div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.agilidade}`}>Agilidade</span>
            <span className={styles.statValue}>{c.agilidade}</span>
          </div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.intelecto}`}>Intelecto</span>
            <span className={styles.statValue}>{c.intelecto}</span>
          </div>
        </div>
        <div>
          <div className={styles.colTitle}>Recursos</div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.vida}`}>Vida</span>
            <span className={styles.statValue}>
              {c.vidaAtual}
              <span className={styles.statSlash}>/</span>
              <span className={styles.statMax}>{c.vidaMax}</span>
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.mana}`}>Mana</span>
            <span className={styles.statValue}>
              {c.manaAtual}
              <span className={styles.statSlash}>/</span>
              <span className={styles.statMax}>{c.manaMax}</span>
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={`${styles.statName} ${styles.exp}`}>Experiência</span>
            <span className={styles.statValue}>
              {c.xp}
              <span className={styles.statSlash}>/</span>
              <span className={styles.statMax}>{c.xpNext}</span>
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className={styles.colTitle}>Habilidades</div>
        {c.abilities.map((ability) => (
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
