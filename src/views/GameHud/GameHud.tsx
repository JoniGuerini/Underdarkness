import { useState, useEffect, useMemo, useRef } from 'react';
import type { Character, EquipSlot, Item, TabKey } from '../../types';
import { TAB_LABEL } from '../../data/classes';
import { EQUIP_GROUPS, EQUIP_SLOTS, EQUIP_SLOT_LABEL } from '../../data/items';
import { ItemTooltip } from '../../components/ItemTooltip/ItemTooltip';
import { Modal } from '../../components/Modal/Modal';
import { CharacterSheet, CharacterSheetHeader } from '../../components/CharacterSheet/CharacterSheet';
import { Inventory } from '../../components/Inventory/Inventory';
import { TalentsView, TalentsHeader } from '../../components/TalentsView/TalentsView';
import { MapView, MapHeader } from '../../components/MapView/MapView';
import { JournalView, JournalHeader } from '../../components/JournalView/JournalView';
import { CodexView, CodexHeader } from '../../components/CodexView/CodexView';
import { MercadoView, MercadoHeader } from '../../components/MercadoView/MercadoView';
import { SocialView, SocialHeader } from '../../components/SocialView/SocialView'; // SOCIAL: removível
import { OptionsView, OptionsHeader } from '../../components/OptionsView/OptionsView';
import { NpcDialog } from '../../components/NpcDialog/NpcDialog';
import { CombatModal } from '../../components/CombatModal/CombatModal';
import { getNpcsAt, type Npc } from '../../data/npcs';
import { hasEncounters, rollEncounter, type Enemy } from '../../data/enemies';
import { computeDerivedStats } from '../../lib/stats';
import {
  EDITABLE_TABS,
  displayKey,
  normalizeKey,
  type EditableTab,
  type Settings,
} from '../../lib/settings';
import { getLocationById } from '../../data/world';
import { getSceneLocationMeta } from '../../lib/locationInfo';
import { useRealTime } from '../../hooks/useRealTime';
import { useRegenTick } from '../../hooks/useRegenTick';
import styles from './GameHud.module.css';

interface GameHudProps {
  character: Character;
  settings: Settings;
  onSettingsChange: (next: Settings) => void;
  onResetShortcuts: () => void;
  onUpdate: (character: Character) => void;
  onBackToList: () => void;
}

const TAB_ORDER: TabKey[] = ['personagem', 'habilidades', 'mapa', 'diario', 'codice', 'mercado', 'social', 'opcoes'];

export function GameHud({
  character,
  settings,
  onSettingsChange,
  onResetShortcuts,
  onUpdate,
  onBackToList,
}: GameHudProps) {
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [activeNpc, setActiveNpc] = useState<Npc | null>(null);
  const [combatEnemy, setCombatEnemy] = useState<Enemy | null>(null);
  const [combatSession, setCombatSession] = useState(0);
  /** Tooltip do item equipado no painel direito — hover-driven, portal-fixed. */
  const [equipTooltip, setEquipTooltip] = useState<
    { item: Item; left: number; top: number } | null
  >(null);
  const equipRowRefs = useRef<Map<EquipSlot, HTMLDivElement>>(new Map());
  const realTime = useRealTime();
  useRegenTick(character, onUpdate, !combatEnemy);

  /** Quantidade total de slots preenchidos — exibido no header do painel. */
  const equippedCount = useMemo(
    () => EQUIP_SLOTS.filter((s) => character.equipped[s]).length,
    [character.equipped],
  );

  const currentLocation = getLocationById(character.location);
  const npcsHere = getNpcsAt(character.location);
  // Atributos exibidos no painel lateral refletem bônus de equipamento via derived stats
  const stats = computeDerivedStats(character);
  const canEncounter = currentLocation?.type !== 'town' && hasEncounters(character.location);

  const handlePatrol = () => {
    const enemy = rollEncounter(character.location, character.level);
    if (enemy) {
      setCombatSession((n) => n + 1);
      setCombatEnemy(enemy);
    }
  };

  const closeTab = () => setActiveTab(null);

  // Mapa "tecla pressionada → tab que abre" derivado dos settings.
  // Reconstrói a cada mudança de atalho — propaga customização instantaneamente.
  const keyToTab = useMemo(() => {
    const map: Record<string, EditableTab> = {};
    for (const tab of EDITABLE_TABS) {
      map[normalizeKey(settings.shortcuts[tab])] = tab;
    }
    return map;
  }, [settings.shortcuts]);

  // Lookup pra exibir o atalho de uma tab (footer + header de cada modal).
  const shortcutFor = (tab: TabKey): string =>
    tab === 'opcoes' ? 'ESC' : displayKey(settings.shortcuts[tab as EditableTab]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (activeTab) closeTab();
        else setActiveTab('opcoes');
        return;
      }

      const tab = keyToTab[normalizeKey(e.key)];
      if (tab) {
        e.preventDefault();
        // Toggle: se já está aberta na mesma tab, fecha; senão, abre/troca
        setActiveTab((prev) => (prev === tab ? null : tab));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab, keyToTab]);

  const vidaPct = (character.vidaAtual / character.vidaMax) * 100;
  const manaPct = (character.manaAtual / character.manaMax) * 100;
  const expPct = character.xpNext > 0 ? (character.xp / character.xpNext) * 100 : 0;
  // Escudo de Energia sobrepõe a barra de vida, proporcional à Vida Máxima
  const esPct = Math.min(100, (character.esAtual / character.vidaMax) * 100);

  return (
    <div className={styles.view}>
      <header className={styles.topbar}>
        <div className={styles.character}>
          <div className={styles.charName}>{character.name}</div>
          <div className={styles.charClass}>{character.classLabel} · Nv {character.level}</div>
        </div>

        <div className={styles.world}>
          <div>
            <div className={styles.worldPlaceL1}>
              {getLocationById(character.location)?.name ?? character.location}
            </div>
            <div className={styles.worldPlaceL2}>Dia {character.day} — {character.period}</div>
          </div>
          <div className={styles.worldStat}>
            <div className={styles.worldStatLabel}>Tempo</div>
            <div className={styles.worldStatValue}>{realTime}</div>
          </div>
          <div className={styles.worldStat}>
            <div className={styles.worldStatLabel}>Ouro</div>
            <div className={styles.worldStatValue}>{character.gold}</div>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={`${styles.panel} ${styles.panelLeft}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Ficha</span>
            <span className={styles.panelMeta}>Nv {character.level}</span>
          </div>
          <div className={styles.panelSection}>
            <div className={styles.vitals}>
              <div className={styles.vTrack}>
                <div className={`${styles.vFill} ${styles.vida}`} style={{ width: `${vidaPct}%` }} />
                {character.esAtual > 0 && (
                  <div className={`${styles.vFill} ${styles.energia}`} style={{ width: `${esPct}%` }} />
                )}
                <div className={styles.vContent}>
                  <span className={styles.vLabel}>Vida</span>
                  <span className={styles.vValues}>
                    {character.vidaAtual} / {character.vidaMax}
                    {character.esAtual > 0 && <span className={styles.vEs}> +{character.esAtual}</span>}
                  </span>
                </div>
              </div>
              <div className={styles.vTrack}>
                <div className={`${styles.vFill} ${styles.mana}`} style={{ width: `${manaPct}%` }} />
                <div className={styles.vContent}>
                  <span className={styles.vLabel}>Mana</span>
                  <span className={styles.vValues}>{character.manaAtual} / {character.manaMax}</span>
                </div>
              </div>
              <div className={styles.vTrack}>
                <div className={`${styles.vFill} ${styles.exp}`} style={{ width: `${expPct}%` }} />
                <div className={styles.vContent}>
                  <span className={styles.vLabel}>Exp</span>
                  <span className={styles.vValues}>{character.xp} / {character.xpNext}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.panelSection}>
            <div className={styles.panelSectionLabel}>Atributos</div>
            <div className={styles.statRow}>
              <span className={styles.statName}>Força</span>
              <span className={styles.statValue}>{stats.forca}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statName}>Agilidade</span>
              <span className={styles.statValue}>{stats.agilidade}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statName}>Intelecto</span>
              <span className={styles.statValue}>{stats.intelecto}</span>
            </div>
          </div>
          <div className={styles.panelSection}>
            <div className={styles.panelSectionLabel}>Habilidades</div>
            {character.abilities.map((ab) => (
              <div key={ab.name} className={styles.abilityMini}>
                <div className={styles.abilityMiniName}>{ab.name}</div>
                <div className={styles.abilityMiniDesc}>{ab.desc}</div>
              </div>
            ))}
          </div>
        </aside>

        <main className={`${styles.panel} ${styles.panelCenter}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Cena Atual</span>
            <span className={styles.panelMeta}>{currentLocation?.region ?? '—'}</span>
          </div>
          <div className={styles.sceneWrap}>
            {currentLocation ? (
              <>
                <div className={styles.sceneChapter}>{currentLocation.region}</div>
                <h1 className={styles.sceneTitle}>{currentLocation.name}</h1>
                <div className={styles.sceneMeta}>{getSceneLocationMeta(currentLocation)}</div>
                <p className={styles.sceneDescription}>{currentLocation.description}</p>

                {npcsHere.length > 0 && (
                  <>
                    <div className={styles.sceneActionsLabel}>Habitantes</div>
                    <ul className={styles.npcList}>
                      {npcsHere.map((npc) => (
                        <li key={npc.id}>
                          <button
                            type="button"
                            className={`${styles.npcCard} ${npc.portrait ? styles.npcCardPortrait : ''}`}
                            onClick={() => setActiveNpc(npc)}
                          >
                            {npc.portrait && (
                              <img
                                src={npc.portrait}
                                alt=""
                                className={styles.npcCardImage}
                                draggable={false}
                              />
                            )}
                            <div className={styles.npcCardBody}>
                              <div className={styles.npcCardHeader}>
                                <span className={styles.npcCardName}>{npc.name}</span>
                                <span className={styles.npcCardTitle}>{npc.title}</span>
                              </div>
                              {!npc.portrait && (
                                <p className={styles.npcCardDesc}>{npc.description}</p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {npcsHere.length === 0 && !canEncounter && (
                  <p className={styles.sceneEmpty}>
                    Não há ninguém por aqui. Use o Atlas (M) para escolher um destino.
                  </p>
                )}

                {canEncounter && (
                  <>
                    <div className={styles.sceneActionsLabel}>Ações</div>
                    <button
                      type="button"
                      className={`btn-primary ${styles.scenePatrolBtn}`}
                      onClick={handlePatrol}
                      disabled={character.vidaAtual <= 0}
                    >
                      Patrulhar a região
                    </button>
                    <p className={styles.scenePatrolHint}>
                      Avançar pela mata pode resultar em encontros hostis. Sua vida atual: {character.vidaAtual}/{character.vidaMax}.
                    </p>
                  </>
                )}
              </>
            ) : (
              <p className={styles.sceneEmpty}>Localização desconhecida.</p>
            )}
          </div>
        </main>

        <aside className={`${styles.panel} ${styles.panelRight}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Equipamento</span>
            <span className={styles.panelMeta}>{equippedCount} / {EQUIP_SLOTS.length}</span>
          </div>
          {/* Renderiza grupos do paper-doll (armadura / acessórios / armas)
              com separador entre eles. Cada slot mostra label + nome do item
              colorido por raridade, ou "— vazio —" em itálico se livre.
              Hover dispara ItemTooltip ancorado no canto esquerdo da linha. */}
          {EQUIP_GROUPS.map((group, gi) => (
            <div
              key={gi}
              className={`${styles.panelSection} ${gi > 0 ? styles.panelSectionDivided : ''}`}
            >
              {group.slots.map((slot) => {
                const item = character.equipped[slot];
                return (
                  <div
                    key={slot}
                    ref={(el) => {
                      if (el) equipRowRefs.current.set(slot, el);
                      else equipRowRefs.current.delete(slot);
                    }}
                    className={styles.equipRow}
                    onMouseEnter={() => {
                      if (!item) return;
                      const el = equipRowRefs.current.get(slot);
                      if (!el) return;
                      const r = el.getBoundingClientRect();
                      // Ancora à esquerda da linha; tooltip cresce pra esquerda do painel direito
                      setEquipTooltip({ item, left: r.left, top: r.top });
                    }}
                    onMouseLeave={() => setEquipTooltip(null)}
                  >
                    <span className={styles.equipLabel}>{EQUIP_SLOT_LABEL[slot]}</span>
                    {item ? (
                      <span
                        className={styles.equipValue}
                        style={{ color: `var(--rarity-${item.rarity})` }}
                      >
                        {item.name}
                      </span>
                    ) : (
                      <span className={`${styles.equipValue} ${styles.empty}`}>— vazio —</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div className={`${styles.panelSection} ${styles.panelSectionDivided}`}>
            <div className={styles.panelSectionLabel}>Status Ativos</div>
            <div className={styles.statusEmpty}>Nenhum efeito ativo.</div>
          </div>
        </aside>
        {equipTooltip && (
          <ItemTooltip item={equipTooltip.item} position={{ left: equipTooltip.left, top: equipTooltip.top }} />
        )}
      </div>

      <footer className={styles.footer}>
        {TAB_ORDER.map((tab) => (
          <button
            key={tab}
            className={styles.tabButton}
            onClick={() => setActiveTab((prev) => (prev === tab ? null : tab))}
          >
            <span className={styles.tabLabel}>{TAB_LABEL[tab]}</span>
            <span className={styles.tabShortcut}>{shortcutFor(tab)}</span>
          </button>
        ))}
      </footer>

      {/* Modal "large" único compartilhado entre Personagem, Talentos, Mapa e Diário.
          Manter um <Modal> só evita replay das animações de abrir/fechar quando
          o usuário troca entre essas tabs (C ↔ T ↔ M ↔ J). React reconcilia
          header e body conforme activeTab muda — overlay/frame não remontam.
          O `key={activeTab}` no wrapper força fade-in suave do conteúdo. */}
      {(activeTab === 'personagem' ||
        activeTab === 'habilidades' ||
        activeTab === 'mapa' ||
        activeTab === 'diario' ||
        activeTab === 'codice' ||
        activeTab === 'mercado' ||
        activeTab === 'social' || // SOCIAL: removível
        activeTab === 'opcoes') && (
        <Modal
          open
          onClose={closeTab}
          large
          header={
            activeTab === 'personagem' ? (
              <CharacterSheetHeader character={character} onClose={closeTab} shortcut={shortcutFor('personagem')} />
            ) : activeTab === 'habilidades' ? (
              <TalentsHeader character={character} onClose={closeTab} shortcut={shortcutFor('habilidades')} />
            ) : activeTab === 'mapa' ? (
              <MapHeader character={character} onClose={closeTab} shortcut={shortcutFor('mapa')} />
            ) : activeTab === 'diario' ? (
              <JournalHeader character={character} onClose={closeTab} shortcut={shortcutFor('diario')} />
            ) : activeTab === 'codice' ? (
              <CodexHeader character={character} onClose={closeTab} shortcut={shortcutFor('codice')} />
            ) : activeTab === 'mercado' ? (
              <MercadoHeader character={character} onClose={closeTab} shortcut={shortcutFor('mercado')} />
            ) : activeTab === 'social' ? ( // SOCIAL: removível
              <SocialHeader character={character} onClose={closeTab} shortcut={shortcutFor('social')} />
            ) : (
              <OptionsHeader character={character} onClose={closeTab} />
            )
          }
        >
          <div key={activeTab} className={styles.tabBody}>
            {activeTab === 'personagem' && (
              <div className={styles.mergedPanel}>
                <Inventory
                  character={character}
                  onUpdate={({ equipped, inventory }) => {
                    // Recomputa vidaMax/manaMax após troca de equipamento — itens
                    // podem ter +Vida/+Mana ou +Atributo que muda os caps. Clampa
                    // vidaAtual/manaAtual quando o cap encolhe (item desequipado).
                    const next = { ...character, equipped, inventory };
                    const derived = computeDerivedStats(next);
                    onUpdate({
                      ...next,
                      vidaMax: derived.vidaMax,
                      manaMax: derived.manaMax,
                      vidaAtual: Math.min(character.vidaAtual, derived.vidaMax),
                      manaAtual: Math.min(character.manaAtual, derived.manaMax),
                      // Escudo de Energia re-forma no novo máximo fora de combate
                      // (não há regen de ES; ele só se consome em combate).
                      esAtual: derived.escudoEnergia,
                    });
                  }}
                />
                <CharacterSheet character={character} />
              </div>
            )}
            {activeTab === 'habilidades' && (
              <TalentsView
                character={character}
                onUpdate={({ talentRanks }) => onUpdate({ ...character, talentRanks })}
              />
            )}
            {activeTab === 'mapa' && (
              <MapView
                character={character}
                onUpdate={({ location, visitedLocations }) =>
                  onUpdate({ ...character, location, visitedLocations })
                }
                onTravelComplete={closeTab}
              />
            )}
            {activeTab === 'diario' && (
              <JournalView
                character={character}
                onUpdate={({ abandonedQuestIds }) =>
                  onUpdate({ ...character, abandonedQuestIds })
                }
              />
            )}
            {activeTab === 'codice' && <CodexView character={character} />}
            {activeTab === 'mercado' && (
              <MercadoView character={character} onUpdate={onUpdate} />
            )}
            {activeTab === 'social' && <SocialView character={character} />}{/* SOCIAL: removível */}
            {activeTab === 'opcoes' && (
              <OptionsView
                settings={settings}
                onSettingsChange={onSettingsChange}
                onResetShortcuts={onResetShortcuts}
                onBackToList={onBackToList}
              />
            )}
          </div>
        </Modal>
      )}

      {/* Diálogo de NPC — abre ao clicar num habitante na Cena Atual */}
      <NpcDialog
        npc={activeNpc}
        character={character}
        onUpdate={onUpdate}
        onClose={() => setActiveNpc(null)}
      />

      {/* Combate — abre quando um encontro é gerado via Patrulhar */}
      <CombatModal
        key={combatSession}
        enemy={combatEnemy}
        character={character}
        onUpdate={onUpdate}
        onClose={() => setCombatEnemy(null)}
      />

    </div>
  );
}
