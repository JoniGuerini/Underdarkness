import { useState, useMemo } from 'react';
import type { Character, Quest, QuestStatus, QuestType } from '../../types';
import {
  QUEST_STATUS_LABEL,
  QUEST_TYPE_LABEL,
} from '../../data/quests';
import { getQuestsForCharacter } from '../../lib/questProgress';
import { getLocationById } from '../../data/world';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import styles from './JournalView.module.css';

interface JournalViewProps {
  character: Character;
  onUpdate: (patch: { abandonedQuestIds: string[] }) => void;
}

const STATUS_ORDER: QuestStatus[] = ['ativa', 'concluida', 'falhada'];
const TYPE_ORDER: QuestType[] = ['principal', 'side', 'bounty', 'classe', 'evento', 'faccao'];

export function JournalView({ character, onUpdate }: JournalViewProps) {
  const [activeStatus, setActiveStatus] = useState<QuestStatus>('ativa');
  // Filtro multi-select por tipo. Set vazio = sem filtro (mostra todos os tipos).
  const [selectedTypes, setSelectedTypes] = useState<Set<QuestType>>(new Set());
  const [pendingAbandon, setPendingAbandon] = useState<Quest | null>(null);

  const questsForTab = useMemo(() => {
    const base = getQuestsForCharacter(character, activeStatus);
    if (selectedTypes.size === 0) return base;
    return base.filter((q) => selectedTypes.has(q.type));
  }, [character, activeStatus, selectedTypes]);

  const toggleType = (type: QuestType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const requestAbandon = (quest: Quest) => setPendingAbandon(quest);
  const cancelAbandon = () => setPendingAbandon(null);
  const confirmAbandon = () => {
    if (!pendingAbandon) return;
    onUpdate({
      abandonedQuestIds: [...character.abandonedQuestIds, pendingAbandon.id],
    });
    setPendingAbandon(null);
  };

  // Default: primeira quest da tab ativa
  const [selectedId, setSelectedId] = useState<string | null>(
    questsForTab[0]?.id ?? null,
  );

  // Quando muda de tab, seleciona a primeira da nova lista
  const handleTabChange = (status: QuestStatus) => {
    setActiveStatus(status);
    const first = getQuestsForCharacter(character, status)[0];
    setSelectedId(first?.id ?? null);
  };

  const selectedQuest =
    questsForTab.find((q) => q.id === selectedId) ?? questsForTab[0] ?? null;

  return (
    <div className={styles.root}>
      {/* Card de filtros: status (single-select) + tipo (multi-select) */}
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Status</span>
          <div className={styles.filterChips}>
            {STATUS_ORDER.map((status) => {
              const count = getQuestsForCharacter(character, status).filter(
                (q) => selectedTypes.size === 0 || selectedTypes.has(q.type),
              ).length;
              const active = activeStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  className={`${styles.statusChip} ${active ? styles.statusChipActive : ''}`}
                  onClick={() => handleTabChange(status)}
                >
                  <span className={styles.statusChipLabel}>{QUEST_STATUS_LABEL[status]}</span>
                  <span className={styles.statusChipCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Tipo</span>
          <div className={styles.filterChips}>
            {TYPE_ORDER.map((type) => {
              const active = selectedTypes.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={`${styles.typeChip} ${styles[`type_${type}`]} ${active ? styles.typeChipActive : ''}`}
                  onClick={() => toggleType(type)}
                >
                  {QUEST_TYPE_LABEL[type]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Card esquerdo: lista de missões */}
        <aside className={styles.listCard}>
          <div className={styles.list}>
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
          </div>
        </aside>

        {/* Card direito: detalhe da missão selecionada */}
        <main className={styles.detailCard}>
          {selectedQuest ? (
            <QuestDetail quest={selectedQuest} onAbandon={requestAbandon} />
          ) : (
            <div className={styles.empty}>Selecione uma missão.</div>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={pendingAbandon !== null}
        title="Abandonar missão"
        message={
          pendingAbandon ? (
            <>
              Tem certeza que quer abandonar <em className={styles.confirmTitle}>{pendingAbandon.title}</em>?
              {' '}A missão sai do diário. Você poderá retomá-la com quem a ofereceu.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Abandonar"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmAbandon}
        onCancel={cancelAbandon}
      />
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
  onAbandon: (quest: Quest) => void;
}

function QuestDetail({ quest, onAbandon }: QuestDetailProps) {
  // Principais não podem ser abandonadas — fazem parte da história.
  const canAbandon = quest.status === 'ativa' && quest.type !== 'principal';
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
        {canAbandon && (
          <div className={styles.detailActions}>
            <button
              type="button"
              className={`btn-secondary danger ${styles.btnAbandon}`}
              onClick={() => onAbandon(quest)}
            >
              Abandonar missão
            </button>
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
  shortcut?: string;
}

export function JournalHeader({ character, onClose, shortcut = 'J' }: JournalHeaderProps) {
  const activeCount = getQuestsForCharacter(character, 'ativa').length;
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
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
