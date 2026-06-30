import { useMemo } from 'react';
import type { Character, MapLocation } from '../../types';
import {
  LOCATIONS,
  getLocationById,
  getLocationState,
  type LocationState,
} from '../../data/world';
import { getLocationLevelBadge, getEncounterLevelLabel } from '../../lib/locationInfo';
import styles from './MapView.module.css';

interface MapViewProps {
  character: Character;
  onUpdate: (patch: { location: string; visitedLocations: string[] }) => void;
  onTravelComplete?: () => void;
}

const TYPE_TAG: Record<NonNullable<MapLocation['type']>, string> = {
  town: 'Vila',
  wilderness: 'Campo',
  dungeon: 'Masmorra',
  boss: 'Chefe',
};

const STATE_LABEL: Record<LocationState, string> = {
  current: 'Aqui',
  visited: 'Visitado',
  available: 'Disponível',
  locked: 'Indisponível',
};

export function MapView({ character, onUpdate, onTravelComplete }: MapViewProps) {
  const visited = character.visitedLocations ?? ['pedragal'];
  const currentId = character.location;

  const locations = useMemo(
    () =>
      [...LOCATIONS]
        .map((loc) => ({
          loc,
          state: getLocationState(loc.id, currentId, visited, character.level),
        }))
        .sort((a, b) => a.loc.level - b.loc.level),
    [currentId, visited, character.level],
  );

  const handleTravel = (locationId: string) => {
    if (locationId === currentId) return;
    const state = getLocationState(locationId, currentId, visited, character.level);
    if (state !== 'available' && state !== 'visited') return;
    const nextVisited = visited.includes(locationId) ? visited : [...visited, locationId];
    onUpdate({ location: locationId, visitedLocations: nextVisited });
    onTravelComplete?.();
  };

  return (
    <div className={styles.card}>
      <ul className={styles.locationList} aria-label="Regiões do vale">
        {locations.map(({ loc, state }) => (
          <li key={loc.id}>
            <LocationCard
              location={loc}
              state={state}
              onTravel={() => handleTravel(loc.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface LocationCardProps {
  location: MapLocation;
  state: LocationState;
  onTravel: () => void;
}

function LocationCard({ location, state, onTravel }: LocationCardProps) {
  const canTravel = state === 'available' || state === 'visited';
  const typeTag = location.type ? TYPE_TAG[location.type] : 'Campo';
  const levelBadge = getLocationLevelBadge(location);
  const encounterLabel = getEncounterLevelLabel(location);

  return (
    <button
      type="button"
      className={`${styles.locationCard} ${styles[`card_${state}`]}`}
      disabled={!canTravel}
      onClick={canTravel ? onTravel : undefined}
      aria-label={`${location.name} — ${levelBadge} — ${STATE_LABEL[state]}`}
      aria-current={state === 'current' ? 'location' : undefined}
    >
      <div className={styles.locationCardBody}>
        <div className={styles.locationCardHeader}>
          <span className={styles.locationCardName}>{location.name}</span>
          <span className={styles.locationCardLevel}>{levelBadge}</span>
        </div>
        <span className={styles.locationCardMeta}>
          {location.region} · {typeTag}
        </span>
        <p className={styles.locationCardDesc}>{location.description}</p>
        {encounterLabel && (
          <span className={styles.locationCardEncounter}>{encounterLabel}</span>
        )}
        <span className={styles.locationCardState}>{STATE_LABEL[state]}</span>
      </div>
    </button>
  );
}

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
