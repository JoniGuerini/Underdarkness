import { useState, useEffect, useMemo } from 'react';
import type { Character, TabKey } from '../../types';
import { TAB_LABEL } from '../../data/classes';
import { Modal } from '../../components/Modal/Modal';
import { CharacterSheet, CharacterSheetHeader } from '../../components/CharacterSheet/CharacterSheet';
import { Inventory } from '../../components/Inventory/Inventory';
import { TalentsView, TalentsHeader } from '../../components/TalentsView/TalentsView';
import { MapView, MapHeader } from '../../components/MapView/MapView';
import { JournalView, JournalHeader } from '../../components/JournalView/JournalView';
import { CodexView, CodexHeader } from '../../components/CodexView/CodexView';
import { OptionsView, OptionsHeader } from '../../components/OptionsView/OptionsView';
import { NpcDialog } from '../../components/NpcDialog/NpcDialog';
import { getNpcsAt, type Npc } from '../../data/npcs';
import {
  EDITABLE_TABS,
  displayKey,
  normalizeKey,
  type EditableTab,
  type Settings,
} from '../../lib/settings';
import { getLocationById } from '../../data/world';
import { useRealTime } from '../../hooks/useRealTime';
import styles from './GameHud.module.css';

interface GameHudProps {
  character: Character;
  settings: Settings;
  onSettingsChange: (next: Settings) => void;
  onResetShortcuts: () => void;
  onUpdate: (character: Character) => void;
  onBackToList: () => void;
}

const TAB_ORDER: TabKey[] = ['personagem', 'talentos', 'habilidades', 'mapa', 'diario', 'codice', 'opcoes'];

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
  const realTime = useRealTime();

  const currentLocation = getLocationById(character.location);
  const npcsHere = getNpcsAt(character.location);

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
                <div className={styles.vContent}>
                  <span className={styles.vLabel}>Vida</span>
                  <span className={styles.vValues}>{character.vidaAtual} / {character.vidaMax}</span>
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
              <span className={styles.statValue}>{character.forca}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statName}>Agilidade</span>
              <span className={styles.statValue}>{character.agilidade}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statName}>Intelecto</span>
              <span className={styles.statValue}>{character.intelecto}</span>
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
                <p className={styles.sceneDescription}>{currentLocation.description}</p>

                {npcsHere.length > 0 && (
                  <>
                    <div className={styles.sceneActionsLabel}>Habitantes</div>
                    <ul className={styles.npcList}>
                      {npcsHere.map((npc) => (
                        <li key={npc.id}>
                          <button
                            type="button"
                            className={styles.npcCard}
                            onClick={() => setActiveNpc(npc)}
                          >
                            <div className={styles.npcCardHeader}>
                              <span className={styles.npcCardName}>{npc.name}</span>
                              <span className={styles.npcCardTitle}>{npc.title}</span>
                            </div>
                            <p className={styles.npcCardDesc}>{npc.description}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {npcsHere.length === 0 && (
                  <p className={styles.sceneEmpty}>
                    Não há ninguém por aqui. Use o Atlas (M) para escolher um destino.
                  </p>
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
            <span className={styles.panelMeta}>0 / 4</span>
          </div>
          <div className={styles.panelSection}>
            {['Arma', 'Armadura', 'Amuleto', 'Botas'].map((slot) => (
              <div key={slot} className={styles.equipRow}>
                <span className={styles.equipLabel}>{slot}</span>
                <span className={`${styles.equipValue} ${styles.empty}`}>— vazio —</span>
              </div>
            ))}
          </div>
          <div className={styles.panelSection}>
            <div className={styles.panelSectionLabel}>Ações Rápidas</div>
            {['01', '02', '03', '04'].map((num) => (
              <div key={num} className={styles.quickAction}>
                <span className={styles.qaNum}>{num}</span>
                <span className={`${styles.qaName} ${styles.empty}`}>— vazio —</span>
                <span />
              </div>
            ))}
          </div>
          <div className={styles.panelSection}>
            <div className={styles.panelSectionLabel}>Status Ativos</div>
            <div className={styles.statusEmpty}>Nenhum efeito ativo.</div>
          </div>
        </aside>
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
        activeTab === 'talentos' ||
        activeTab === 'mapa' ||
        activeTab === 'diario' ||
        activeTab === 'codice' ||
        activeTab === 'opcoes') && (
        <Modal
          open
          onClose={closeTab}
          large
          header={
            activeTab === 'personagem' ? (
              <CharacterSheetHeader character={character} onClose={closeTab} shortcut={shortcutFor('personagem')} />
            ) : activeTab === 'talentos' ? (
              <TalentsHeader character={character} onClose={closeTab} shortcut={shortcutFor('talentos')} />
            ) : activeTab === 'mapa' ? (
              <MapHeader character={character} onClose={closeTab} shortcut={shortcutFor('mapa')} />
            ) : activeTab === 'diario' ? (
              <JournalHeader character={character} onClose={closeTab} shortcut={shortcutFor('diario')} />
            ) : activeTab === 'codice' ? (
              <CodexHeader character={character} onClose={closeTab} shortcut={shortcutFor('codice')} />
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
                  onUpdate={({ equipped, inventory }) =>
                    onUpdate({ ...character, equipped, inventory })
                  }
                />
                <CharacterSheet character={character} />
              </div>
            )}
            {activeTab === 'talentos' && (
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

      {/* Modal stub do Habilidades (única tab grande sem implementação) */}
      {activeTab === 'habilidades' && (
        <Modal open onClose={closeTab} title={TAB_LABEL.habilidades} shortcut={shortcutFor('habilidades')}>
          <div className={styles.modalEmpty}>
            <h3>Em desenvolvimento</h3>
            <p>Habilidades ativas e magias conhecidas.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
