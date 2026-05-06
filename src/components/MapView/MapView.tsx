import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Character, MapLocation } from '../../types';
import {
  LOCATIONS,
  MAP_VIEWPORT,
  getLocationById,
  getLocationState,
  type LocationState,
} from '../../data/world';
import styles from './MapView.module.css';

interface MapViewProps {
  character: Character;
  onUpdate: (patch: { location: string; visitedLocations: string[] }) => void;
}

/**
 * Constrói uma curva de Bézier quadrática suave entre dois pontos.
 * O ponto de controle fica no meio da linha, deslocado perpendicularmente
 * por uma fração da distância — quanto maior a distância, mais pronunciada
 * a curva (mantém densidade visual proporcional).
 *
 * O lado pra qual a curva entorta é determinístico via hash do `seed`,
 * então pares próximos não têm todas as curvas no mesmo sentido (variedade).
 */
function curvedPath(x1: number, y1: number, x2: number, y2: number, seed: string): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length === 0) return `M ${x1} ${y1}`;

  // Vetor perpendicular unitário (rotação 90° anti-horária)
  const perpX = -dy / length;
  const perpY = dx / length;

  // Curva proporcional à distância — entre 8% e 14% gera arcos sutis
  const offset = length * 0.12;

  // Hash simples do seed pra alternar lado da curva (-1 ou +1)
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const side = hash % 2 === 0 ? 1 : -1;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const cx = midX + perpX * offset * side;
  const cy = midY + perpY * offset * side;

  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export function MapView({ character, onUpdate }: MapViewProps) {
  const visited = character.visitedLocations ?? ['origem'];
  const current = character.location;

  // Resolve estado de cada local uma vez
  const stateById = new Map<string, LocationState>(
    LOCATIONS.map((loc) => [
      loc.id,
      getLocationState(loc.id, current, visited, character.level),
    ]),
  );

  // Todas as conexões são sempre renderizadas (sem fog).
  // Linha "ativa" = rota já percorrida (ambas pontas visited/current).
  // Cada conexão vira um caminho cúbico de Bézier (curva suave) em vez
  // de linha reta — feel mais orgânico, estilo trilhas de mapa.
  // Dedup via Set: mesma aresta declarada em ambos os lados conta uma vez.
  const seenEdges = new Set<string>();
  const connections = LOCATIONS.flatMap((loc) =>
    loc.connections.map((targetId) => {
      const key = [loc.id, targetId].sort().join('|');
      if (seenEdges.has(key)) return null;
      seenEdges.add(key);

      const target = getLocationById(targetId);
      if (!target) return null;

      const stateA = stateById.get(loc.id);
      const stateB = stateById.get(targetId);
      const active =
        (stateA === 'current' || stateA === 'visited') &&
        (stateB === 'current' || stateB === 'visited');

      return {
        id: key,
        d: curvedPath(loc.x, loc.y, target.x, target.y, key),
        active,
      };
    }),
  ).filter((c): c is NonNullable<typeof c> => c !== null);

  const handleTravel = (locationId: string) => {
    const state = stateById.get(locationId);
    if (state !== 'available' && state !== 'visited') return;
    if (locationId === current) return;
    const nextVisited = visited.includes(locationId) ? visited : [...visited, locationId];
    onUpdate({ location: locationId, visitedLocations: nextVisited });
  };

  return (
    <div className={styles.card}>
      <div className={styles.canvas}>
        {/* Camada 1: linhas de conexão (SVG escala via viewBox) */}
        <svg
          className={styles.connections}
          viewBox={`0 0 ${MAP_VIEWPORT.width} ${MAP_VIEWPORT.height}`}
          preserveAspectRatio="none"
        >
          {connections.map((c) => (
            <path
              key={c.id}
              d={c.d}
              fill="none"
              vectorEffect="non-scaling-stroke"
              className={`${styles.connection} ${c.active ? styles.connectionActive : ''}`}
            />
          ))}
        </svg>

        {/* Camada 2: nodes posicionados via percentage do canvas */}
        {LOCATIONS.map((loc) => {
          const state = stateById.get(loc.id);
          if (!state) return null;
          return (
            <MapNode
              key={loc.id}
              location={loc}
              state={state}
              xPercent={(loc.x / MAP_VIEWPORT.width) * 100}
              yPercent={(loc.y / MAP_VIEWPORT.height) * 100}
              onClick={() => handleTravel(loc.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MapNode — círculo individual com nome embaixo + tooltip
// ============================================================================
interface MapNodeProps {
  location: MapLocation;
  state: LocationState;
  /** posição em % do canvas (0-100) */
  xPercent: number;
  yPercent: number;
  onClick: () => void;
}

function MapNode({ location, state, xPercent, yPercent, onClick }: MapNodeProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);

  const handleEnter = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();

    // Estimativa do tamanho do tooltip (max-width 280 + padding 14*2)
    const TT_WIDTH = 308;
    const TT_HEIGHT = 220;
    const MARGIN = 12;

    // Default: à direita do node
    let left = r.right + MARGIN;
    // Se sair pela direita, flipa pro lado esquerdo
    if (left + TT_WIDTH > window.innerWidth - 8) {
      left = r.left - MARGIN - TT_WIDTH;
    }
    // Garantia mínima — se ambos lados não caberem (modal estreito), encosta na esquerda
    if (left < 8) left = 8;

    // Vertical: alinha com o topo do node, mas evita estourar embaixo
    let top = r.top;
    if (top + TT_HEIGHT > window.innerHeight - 8) {
      top = window.innerHeight - TT_HEIGHT - 8;
    }
    if (top < 8) top = 8;

    setTooltipPos({ left, top });
  }, []);
  const handleLeave = useCallback(() => setTooltipPos(null), []);

  const canTravel = state === 'available' || state === 'visited';

  const classes = [
    styles.node,
    styles[`state_${state}`],
    location.type ? styles[`type_${location.type}`] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        className={styles.nodeWrapper}
        style={{
          left: `${xPercent}%`,
          top: `${yPercent}%`,
        }}
      >
        <button
          ref={ref}
          type="button"
          className={classes}
          onClick={canTravel ? onClick : undefined}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          aria-label={location.name}
        >
          {/* círculo interno (decorativo) */}
          <span className={styles.nodeCore} />
        </button>
        <span className={styles.nodeLabel}>{location.name}</span>
      </div>

      {tooltipPos && (
        <MapTooltip location={location} state={state} position={tooltipPos} />
      )}
    </>
  );
}

// ============================================================================
// MapTooltip — em portal, posição fixed
// ============================================================================
interface MapTooltipProps {
  location: MapLocation;
  state: LocationState;
  position: { left: number; top: number };
}

const STATE_LABEL: Record<LocationState, string> = {
  current: 'Você está aqui',
  visited: 'Visitado',
  available: 'Disponível',
  locked: 'Indisponível',
};

function MapTooltip({ location, state, position }: MapTooltipProps) {
  return createPortal(
    <div className={styles.tooltip} style={{ left: position.left, top: position.top }}>
      <div className={styles.tooltipHeader}>
        <div className={styles.tooltipName}>{location.name}</div>
        <div className={styles.tooltipLevel}>Nv {location.level}</div>
      </div>
      <div className={styles.tooltipRegion}>{location.region}</div>
      <div className={styles.tooltipDesc}>{location.description}</div>
      <div className={`${styles.tooltipState} ${styles[`state_${state}`]}`}>
        {STATE_LABEL[state]}
      </div>
    </div>,
    document.body,
  );
}

// ============================================================================
// Header pro modal — espelha o pattern padrão
// ============================================================================
interface MapHeaderProps {
  character: Character;
  onClose: () => void;
  shortcut?: string;
}

export function MapHeader({ character, onClose, shortcut = 'M' }: MapHeaderProps) {
  const current = getLocationById(character.location);
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Atlas</div>
        <div className={styles.subtitle}>
          {current ? `${current.name} · ${current.region}` : 'Localização desconhecida'}
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
