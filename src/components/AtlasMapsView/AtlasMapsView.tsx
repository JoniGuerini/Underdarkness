import { useMemo } from 'react';
import type { Character, MapItem } from '../../types';
import { rollMap, tierColorVar } from '../../lib/mapgen';
import { AFFIX_COLOR_VAR } from '../../data/mapAffixes';
import styles from './AtlasMapsView.module.css';

/** Custo em ouro pra forjar um mapa T1 — o ponto de entrada semeado do Atlas. */
const FORGE_T1_COST = 200;

interface AtlasMapsViewProps {
  character: Character;
  onUpdate: (next: Character) => void;
  onRunMap: (map: MapItem) => void;
}

/**
 * Aba do Atlas de Mapas (endgame). Bloqueada até o nível 100. Desbloqueada,
 * mostra o Dispositivo (forjar mapa T1) e o estoque de mapas — cada um abre
 * uma expedição via `onRunMap`.
 */
export function AtlasMapsView({ character, onUpdate, onRunMap }: AtlasMapsViewProps) {
  // TEMP: gate de nível 100 desativado pra inspecionar a UI do endgame sem boneco 100.
  // Restaurar depois: const unlocked = character.level >= 100;
  const unlocked = true;
  const maps = useMemo(
    () => [...character.maps].sort((a, b) => b.tier - a.tier),
    [character.maps],
  );

  if (!unlocked) {
    return (
      <div className={styles.root}>
        <div className={styles.locked}>
          <div className={styles.lockedBadge}>Requer Nível 100</div>
          <h2 className={styles.lockedTitle}>Atlas de Mapas</h2>
          <p className={styles.lockedText}>
            O endgame abre ao atingir o nível máximo. Termine a campanha até o nível 100
            para forjar mapas e correr expedições por loot procedural e tiers mais altos.
          </p>
          <div className={styles.lockedProgress}>
            Progresso: Nível {character.level} de 100
          </div>
        </div>
      </div>
    );
  }

  const canForge = character.gold >= FORGE_T1_COST;

  const handleForge = () => {
    if (!canForge) return;
    onUpdate({
      ...character,
      gold: character.gold - FORGE_T1_COST,
      maps: [rollMap(1), ...character.maps],
    });
  };

  return (
    <div className={styles.root}>
      <section className={styles.device}>
        <div className={styles.deviceInfo}>
          <div className={styles.deviceTitle}>Dispositivo de Mapas</div>
          <p className={styles.deviceDesc}>
            Forje um mapa de Tier 1 para semear o Atlas. Chefes de expedição dropam mapas
            de tier igual ou superior — a escalada de tier vem da caçada, não da forja.
          </p>
          <div className={styles.deviceStats}>
            <span className={styles.deviceStat}>
              <span className={styles.deviceStatLabel}>Maior tier concluído</span>
              <span
                className={styles.deviceStatValue}
                style={{ color: tierColorVar(Math.max(1, character.highestMapTier)) }}
              >
                {character.highestMapTier > 0 ? `T${character.highestMapTier}` : '—'}
              </span>
            </span>
            <span className={styles.deviceStat}>
              <span className={styles.deviceStatLabel}>Ouro</span>
              <span className={styles.deviceStatValue}>{character.gold}g</span>
            </span>
          </div>
        </div>
        <button
          type="button"
          className={`btn-primary ${styles.forgeBtn}`}
          onClick={handleForge}
          disabled={!canForge}
          title={canForge ? undefined : 'Ouro insuficiente'}
        >
          <span>Forjar Mapa T1</span>
          <span className={styles.forgeCost}>{FORGE_T1_COST}g</span>
        </button>
      </section>

      <section className={styles.stock}>
        <div className={styles.stockHeader}>
          <span className={styles.stockTitle}>Estoque de Mapas</span>
          <span className={styles.stockMeta}>
            {character.maps.length} {character.maps.length === 1 ? 'mapa' : 'mapas'}
          </span>
        </div>
        {maps.length === 0 ? (
          <div className={styles.empty}>
            Nenhum mapa no estoque. Forje um Tier 1 para começar a caçada.
          </div>
        ) : (
          <ul className={styles.mapGrid}>
            {maps.map((map) => (
              <li key={map.id}>
                <MapCard map={map} onRun={() => onRunMap(map)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MapCard({ map, onRun }: { map: MapItem; onRun: () => void }) {
  return (
    <article className={styles.mapCard}>
      <div className={styles.mapCardHead}>
        <span className={styles.tierBadge} style={{ color: tierColorVar(map.tier) }}>
          T{map.tier}
        </span>
        <span className={styles.mapName}>{map.themeName}</span>
      </div>
      <div className={styles.mapMeta}>
        Nível {map.monsterLevel} · {map.waves} ondas + chefe
      </div>
      {map.affixes.length > 0 && (
        <ul className={styles.affixList}>
          {map.affixes.map((a, i) => (
            <li
              key={i}
              className={styles.affix}
              style={a.color ? { color: AFFIX_COLOR_VAR[a.color] } : undefined}
            >
              {a.label}
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={`btn-secondary ${styles.mapRunBtn}`} onClick={onRun}>
        Abrir Expedição
      </button>
    </article>
  );
}

// ============================================================================
// Header do modal
// ============================================================================

interface AtlasMapsHeaderProps {
  character: Character;
  onClose: () => void;
  shortcut?: string;
}

export function AtlasMapsHeader({ character, onClose, shortcut = 'N' }: AtlasMapsHeaderProps) {
  // TEMP: alinhado ao gate desativado acima. Restaurar: character.level >= 100.
  const unlocked = true;
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Atlas de Mapas</div>
        <div className={styles.subtitle}>
          {unlocked
            ? `${character.name} · ${character.maps.length} no estoque · maior T${character.highestMapTier}`
            : 'Endgame — desbloqueia no nível 100'}
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
