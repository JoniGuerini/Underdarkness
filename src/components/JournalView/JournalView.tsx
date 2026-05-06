import { useState, useMemo } from 'react';
import type { Character, Quest, QuestStatus } from '../../types';
import {
  QUESTS,
  QUEST_STATUS_LABEL,
  QUEST_TYPE_LABEL,
  getQuestsByStatus,
} from '../../data/quests';
import { getLocationById } from '../../data/world';
import styles from './JournalView.module.css';

interface JournalViewProps {
  character: Character;
}

const STATUS_ORDER: QuestStatus[] = ['ativa', 'concluida', 'falhada'];

export function JournalView({ character: _character }: JournalViewProps) {
  const [activeStatus, setActiveStatus] = useState<QuestStatus>('ativa');

  const questsForTab = useMemo(
    () => getQuestsByStatus(activeStatus),
    [activeStatus],
  );

  // Default: primeira quest da tab ativa
  const [selectedId, setSelectedId] = useState<string | null>(
    questsForTab[0]?.id ?? null,
  );

  // Quando muda de tab, seleciona a primeira da nova lista
  const handleTabChange = (status: QuestStatus) => {
    setActiveStatus(status);
    const first = getQuestsByStatus(status)[0];
    setSelectedId(first?.id ?? null);
  };

  const selectedQuest =
    questsForTab.find((q) => q.id === selectedId) ?? questsForTab[0] ?? null;

  return (
    <div className={styles.card}>
      {/* Tabs por status */}
      <div className={styles.tabs}>
        {STATUS_ORDER.map((status) => {
          const count = QUESTS.filter((q) => q.status === status).length;
          const active = activeStatus === status;
          return (
            <button
              key={status}
              type="button"
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(status)}
            >
              <span className={styles.tabLabel}>{QUEST_STATUS_LABEL[status]}</span>
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Split: lista | detalhe */}
      <div className={styles.split}>
        <aside className={styles.list}>
          {questsForTab.length === 0 ? (
            <div className={styles.empty}>Nenhuma missão {QUEST_STATUS_LABEL[activeStatus].toLowerCase()}.</div>
          ) : (
            questsForTab.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                selected={selectedId === quest.id}
                onClick={() => setSelectedId(quest.id)}
              />
            ))
          )}
        </aside>

        <main className={styles.detail}>
          {selectedQuest ? (
            <QuestDetail quest={selectedQuest} />
          ) : (
            <div className={styles.empty}>Selecione uma missão.</div>
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// QuestCard — item da lista
// ============================================================================
interface QuestCardProps {
  quest: Quest;
  selected: boolean;
  onClick: () => void;
}

function QuestCard({ quest, selected, onClick }: QuestCardProps) {
  const location = quest.locationId ? getLocationById(quest.locationId) : null;
  const classes = [
    styles.questCard,
    styles[`type_${quest.type}`],
    selected ? styles.questCardActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} onClick={onClick}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{quest.title}</span>
        {quest.expiresIn && quest.status === 'ativa' && (
          <span className={styles.expires}>{quest.expiresIn}</span>
        )}
      </div>
      <div className={styles.cardMeta}>
        <span className={`${styles.cardType} ${styles[`type_${quest.type}`]}`}>
          {QUEST_TYPE_LABEL[quest.type]}
        </span>
        {quest.chapter && (
          <>
            <span className={styles.cardSep}>·</span>
            <span className={styles.cardChapter}>{quest.chapter}</span>
          </>
        )}
        {location && (
          <>
            <span className={styles.cardSep}>·</span>
            <span className={styles.cardLocation}>{location.name}</span>
          </>
        )}
      </div>
      <p className={styles.cardDesc}>{quest.description}</p>
    </button>
  );
}

// ============================================================================
// QuestDetail — pane de detalhe
// ============================================================================
interface QuestDetailProps {
  quest: Quest;
}

function QuestDetail({ quest }: QuestDetailProps) {
  const location = quest.locationId ? getLocationById(quest.locationId) : null;

  // Progresso geral (objetivos completados / total)
  const completedCount = quest.objectives.filter((o) => o.completed).length;
  const totalCount = quest.objectives.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <article className={styles.detailInner}>
      {/* Cabeçalho */}
      <header className={styles.detailHeader}>
        <div className={styles.detailMeta}>
          {quest.chapter && <span>{quest.chapter}</span>}
          {quest.chapter && <span className={styles.metaSep}>·</span>}
          <span className={`${styles.detailType} ${styles[`type_${quest.type}`]}`}>
            {QUEST_TYPE_LABEL[quest.type]}
          </span>
          <span className={styles.metaSep}>·</span>
          <span className={`${styles.detailStatus} ${styles[`status_${quest.status}`]}`}>
            {quest.status === 'ativa'
              ? 'Em andamento'
              : quest.status === 'concluida'
                ? 'Concluída'
                : 'Falhada'}
          </span>
          {quest.expiresIn && quest.status === 'ativa' && (
            <>
              <span className={styles.metaSep}>·</span>
              <span className={styles.expiresInline}>Expira em {quest.expiresIn}</span>
            </>
          )}
        </div>
        <h2 className={styles.detailTitle}>{quest.title}</h2>
        {(quest.giver || location) && (
          <div className={styles.detailSubmeta}>
            {quest.giver && <span>{quest.giver}</span>}
            {quest.giver && location && <span className={styles.metaSep}>·</span>}
            {location && <span>{location.name}</span>}
          </div>
        )}
      </header>

      {/* Descrição (italic flavor) */}
      <p className={styles.detailDescription}>{quest.description}</p>

      {/* Story (parágrafo principal) */}
      <p className={styles.detailStory}>{quest.story}</p>

      {/* Objetivos */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Objetivos</h3>
          <span className={styles.progressLabel}>
            {completedCount} / {totalCount}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <ul className={styles.objectiveList}>
          {quest.objectives.map((obj, i) => (
            <li
              key={i}
              className={`${styles.objective} ${obj.completed ? styles.objectiveDone : ''}`}
            >
              <span className={styles.objectiveCheck}>
                {obj.completed ? '✓' : '☐'}
              </span>
              <span className={styles.objectiveText}>{obj.text}</span>
              {obj.current !== undefined && obj.total !== undefined && (
                <span className={styles.objectiveCount}>
                  {obj.current} / {obj.total}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Recompensas */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Recompensas</h3>
        <ul className={styles.rewardList}>
          {quest.rewards.map((reward, i) => (
            <li
              key={i}
              className={`${styles.reward} ${styles[`reward_${reward.type}`]}`}
            >
              <span className={styles.rewardLabel}>{reward.label}</span>
              {reward.detail && (
                <span className={styles.rewardDetail}>{reward.detail}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Diário */}
      {quest.journal.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Diário</h3>
          <ol className={styles.journalList}>
            {quest.journal.map((entry, i) => (
              <li key={i} className={styles.journalEntry}>
                <div className={styles.journalDate}>{entry.date}</div>
                <p className={styles.journalText}>{entry.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

// ============================================================================
// Header pro modal
// ============================================================================
interface JournalHeaderProps {
  character: Character;
  onClose: () => void;
}

export function JournalHeader({ character, onClose }: JournalHeaderProps) {
  const activeCount = QUESTS.filter((q) => q.status === 'ativa').length;
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Diário</div>
        <div className={styles.subtitle}>
          {character.name} · {activeCount} {activeCount === 1 ? 'missão ativa' : 'missões ativas'}
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>J</span>
      </button>
    </div>
  );
}
