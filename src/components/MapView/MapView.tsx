import { useMemo, useState } from 'react';
import type { Character, MapLocation } from '../../types';
import {
  ACTS,
  LOCATIONS,
  getLocationAct,
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

type AtlasCategory = 'safe' | 'open' | 'dungeon' | 'boss' | 'parallel';

const SECTIONS: { id: AtlasCategory; title: string; desc: string }[] = [
  { id: 'safe', title: 'Áreas Seguras', desc: 'Sem encontros — descanse e prepare-se.' },
  { id: 'open', title: 'Áreas Abertas', desc: 'Campo aberto da rota principal, com inimigos.' },
  { id: 'dungeon', title: 'Masmorras', desc: 'Interiores fechados e perigosos.' },
  { id: 'boss', title: 'Confronto Final', desc: 'O fim de todos os caminhos.' },
  { id: 'parallel', title: 'Áreas Paralelas', desc: 'Desvios opcionais — entre por sua conta.' },
];

function getCategory(loc: MapLocation): AtlasCategory {
  if (loc.branch === 'parallel') return 'parallel';
  switch (loc.type) {
    case 'town':
      return 'safe';
    case 'dungeon':
      return 'dungeon';
    case 'boss':
      return 'boss';
    default:
      return 'open';
  }
}

export function MapView({ character, onUpdate, onTravelComplete }: MapViewProps) {
  const visited = character.visitedLocations ?? ['pedragal'];
  const currentId = character.location;

  const currentAct = useMemo(() => {
    const here = getLocationById(currentId);
    return here ? getLocationAct(here) : 1;
  }, [currentId]);

  const [selectedAct, setSelectedAct] = useState(currentAct);

  const sections = useMemo(() => {
    const entries = [...LOCATIONS]
      .filter((loc) => getLocationAct(loc) === selectedAct)
      .map((loc) => ({
        loc,
        state: getLocationState(loc.id, currentId, visited, character.level),
      }))
      .sort((a, b) => a.loc.level - b.loc.level);

    return SECTIONS.map((section) => ({
      ...section,
      items: entries.filter(({ loc }) => getCategory(loc) === section.id),
    })).filter((section) => section.items.length > 0);
  }, [selectedAct, currentId, visited, character.level]);

  const handleTravel = (locationId: string) => {
    if (locationId === currentId) return;
    const state = getLocationState(locationId, currentId, visited, character.level);
    if (state !== 'available' && state !== 'visited') return;
    const nextVisited = visited.includes(locationId) ? visited : [...visited, locationId];
    onUpdate({ location: locationId, visitedLocations: nextVisited });
    onTravelComplete?.();
  };

  const activeAct = ACTS.find((a) => a.num === selectedAct);

  return (
    <div className={styles.wrapper}>
      <div className={styles.actSwitcher} role="tablist" aria-label="Atos">
        {ACTS.map((act) => {
          const isActive = act.num === selectedAct;
          const isCurrent = act.num === currentAct;
          return (
            <button
              key={act.num}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={!act.available}
              className={`${styles.actTab} ${isActive ? styles.actTabActive : ''}`}
              onClick={() => act.available && setSelectedAct(act.num)}
              title={act.available ? act.name : 'Em breve'}
            >
              <span className={styles.actTabTitle}>{act.title}</span>
              <span className={styles.actTabName}>
                {act.available ? act.name : 'Em breve'}
              </span>
              {isCurrent && <span className={styles.actTabHere}>Você</span>}
            </button>
          );
        })}
      </div>

      {activeAct && (
        <div className={styles.actBanner}>
          <span className={styles.actBannerName}>{activeAct.name}</span>
          <span className={styles.actBannerLevel}>
            Nv {activeAct.levelRange[0]}–{activeAct.levelRange[1]}
          </span>
        </div>
      )}

      <div className={styles.card}>
        {sections.map((section) => (
          <section key={section.id} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <span className={styles.sectionCount}>{section.items.length}</span>
              <span className={styles.sectionDesc}>{section.desc}</span>
            </div>
            <ul className={styles.locationList} aria-label={section.title}>
              {section.items.map(({ loc, state }) => (
                <li key={loc.id}>
                  <LocationCard
                    location={loc}
                    state={state}
                    onTravel={() => handleTravel(loc.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
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
