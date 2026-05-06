import { useState, useEffect } from 'react';
import type { Character, TabKey } from '../../types';
import { TAB_LABEL, TAB_SHORTCUT, TAB_DESC } from '../../data/classes';
import { Modal } from '../../components/Modal/Modal';
import { CharacterSheet, CharacterSheetHeader } from '../../components/CharacterSheet/CharacterSheet';
import { Inventory } from '../../components/Inventory/Inventory';
import { TalentsView, TalentsHeader } from '../../components/TalentsView/TalentsView';
import { MapView, MapHeader } from '../../components/MapView/MapView';
import { JournalView, JournalHeader } from '../../components/JournalView/JournalView';
import { getLocationById } from '../../data/world';
import { useRealTime } from '../../hooks/useRealTime';
import styles from './GameHud.module.css';

interface GameHudProps {
  character: Character;
  onUpdate: (character: Character) => void;
  onBackToList: () => void;
}

const KEY_TO_TAB: Record<string, TabKey> = {
  c: 'personagem',
  t: 'talentos',
  a: 'habilidades',
  m: 'mapa',
  j: 'diario',
};

const TAB_ORDER: TabKey[] = ['personagem', 'talentos', 'habilidades', 'mapa', 'diario', 'opcoes'];

export function GameHud({ character, onUpdate, onBackToList }: GameHudProps) {
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const realTime = useRealTime();

  const closeTab = () => setActiveTab(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (activeTab) closeTab();
        else setActiveTab('opcoes');
        return;
      }

      const tab = KEY_TO_TAB[e.key.toLowerCase()];
      if (tab) {
        e.preventDefault();
        // Toggle: se já está aberta na mesma tab, fecha; senão, abre/troca
        setActiveTab((prev) => (prev === tab ? null : tab));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab]);

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

        <div className={styles.vitals}>
          <div className={styles.vRow}>
            <span className={styles.vLabel}>Vida</span>
            <div className={styles.vTrack}>
              <div className={`${styles.vFill} ${styles.vida}`} style={{ width: `${vidaPct}%` }} />
            </div>
            <span className={styles.vValues}>{character.vidaAtual} / {character.vidaMax}</span>
          </div>
          <div className={styles.vRow}>
            <span className={styles.vLabel}>Mana</span>
            <div className={styles.vTrack}>
              <div className={`${styles.vFill} ${styles.mana}`} style={{ width: `${manaPct}%` }} />
            </div>
            <span className={styles.vValues}>{character.manaAtual} / {character.manaMax}</span>
          </div>
          <div className={styles.vRow}>
            <span className={styles.vLabel}>Exp</span>
            <div className={styles.vTrack}>
              <div className={`${styles.vFill} ${styles.exp}`} style={{ width: `${expPct}%` }} />
            </div>
            <span className={styles.vValues}>{character.xp} / {character.xpNext}</span>
          </div>
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
            <span className={styles.panelMeta}>01 / —</span>
          </div>
          <div className={styles.sceneWrap}>
            <div className={styles.sceneChapter}>Capítulo I</div>
            <h1 className={styles.sceneTitle}>O Início</h1>
            <div className={styles.sceneNarrative}>
              <p>Você está numa estrada de terra batida. O sol está baixo no horizonte e o ar carrega o cheiro de uma fogueira distante.</p>
              <p>Há uma vila à frente, uma floresta densa à direita, e o caminho atrás de você — o que veio percorrendo, sem lembrar exatamente como.</p>
            </div>
            <div className={styles.sceneActionsLabel}>Suas Ações</div>
            <ul className={styles.sceneActions}>
              <li className={styles.sceneAction}>
                <span className={styles.sceneActionNum}>01</span>
                <span className={styles.sceneActionText}>Seguir em direção à vila.</span>
                <span className={styles.sceneActionMeta}>—</span>
              </li>
              <li className={styles.sceneAction}>
                <span className={styles.sceneActionNum}>02</span>
                <span className={styles.sceneActionText}>Investigar a floresta.</span>
                <span className={styles.sceneActionMeta}>Agilidade</span>
              </li>
              <li className={styles.sceneAction}>
                <span className={styles.sceneActionNum}>03</span>
                <span className={styles.sceneActionText}>Voltar pelo caminho de antes.</span>
                <span className={styles.sceneActionMeta}>—</span>
              </li>
              <li className={styles.sceneAction}>
                <span className={styles.sceneActionNum}>04</span>
                <span className={styles.sceneActionText}>Sentar e esperar a noite cair.</span>
                <span className={styles.sceneActionMeta}>Intelecto</span>
              </li>
            </ul>
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
            <span className={styles.tabShortcut}>{TAB_SHORTCUT[tab]}</span>
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
        activeTab === 'diario') && (
        <Modal
          open
          onClose={closeTab}
          large
          header={
            activeTab === 'personagem' ? (
              <CharacterSheetHeader character={character} onClose={closeTab} />
            ) : activeTab === 'talentos' ? (
              <TalentsHeader character={character} onClose={closeTab} />
            ) : activeTab === 'mapa' ? (
              <MapHeader character={character} onClose={closeTab} />
            ) : (
              <JournalHeader character={character} onClose={closeTab} />
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
            {activeTab === 'diario' && <JournalView character={character} />}
          </div>
        </Modal>
      )}

      {/* Modal de Opções */}
      {activeTab === 'opcoes' && (
        <Modal open onClose={closeTab} title={TAB_LABEL.opcoes} shortcut={TAB_SHORTCUT.opcoes}>
          <div className={styles.optionsList}>
            <button className={styles.optionItem} onClick={onBackToList}>
              <span className={styles.optName}>Trocar personagem</span>
              <span className={styles.optDesc}>Salvar progresso e voltar para a seleção de personagens.</span>
            </button>
            <button className={`${styles.optionItem} ${styles.disabled}`} disabled>
              <span className={styles.optName}>Configurações</span>
              <span className={styles.optDesc}>Em desenvolvimento.</span>
            </button>
          </div>
        </Modal>
      )}

      {/* Modais stub das outras tabs (só Habilidades = ex-Magias agora) */}
      {activeTab &&
        activeTab !== 'personagem' &&
        activeTab !== 'talentos' &&
        activeTab !== 'mapa' &&
        activeTab !== 'diario' &&
        activeTab !== 'opcoes' && (
        <Modal open onClose={closeTab} title={TAB_LABEL[activeTab]} shortcut={TAB_SHORTCUT[activeTab]}>
          <div className={styles.modalEmpty}>
            <h3>Em desenvolvimento</h3>
            <p>{TAB_DESC[activeTab]}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
