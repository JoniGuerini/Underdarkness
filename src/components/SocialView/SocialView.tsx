/**
 * SOCIAL VIEW — mockup visual de chat multiplayer.
 *
 * Tudo aqui é estado local (useState). Não há network nem persistência —
 * é só pra avaliar a estética de "MMO social". Pra remover, delete a pasta
 * inteira e as referências marcadas com `// SOCIAL:` no código.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Character, Quest, Rarity } from '../../types';
import {
  GUILD_MESSAGES,
  GUILD,
  ONLINE_COUNT,
  SERVER_NAME,
  FRIENDS,
  CLASS_COLOR_VAR,
  PUBLIC_CHAT_CHANNELS,
  PUBLIC_CHAT_VIEWS,
  PUBLIC_CHANNEL_MESSAGES,
  getChannelLabel,
  getMessageChannel,
  mergePublicMessages,
  makeOwnMessage,
  type ChatMessage,
  type Friend,
  type MessageSegment,
  type PublicChatChannel,
  type PublicChatView,
  type SocialChannel,
} from '../../data/social';
import { findItemByName, findQuestByName } from '../../data/socialLinks';
import { QUEST_TYPE_LABEL } from '../../data/quests';
import { PARTIES, PARTY_TYPE_LABEL, ACTIVITY_CATEGORY_LABEL, countByCategory, formatAge, getActivityCategory, type ActivityCategory, type PartyListing } from '../../data/parties';
import { ItemTooltipInline } from '../ItemTooltip/ItemTooltip';
import styles from './SocialView.module.css';

type SocialSection = 'global' | 'guilda' | 'amigos' | 'grupos';

const SECTIONS: { id: SocialSection; label: string }[] = [
  { id: 'global', label: 'Global' },
  { id: 'guilda', label: 'Guilda' },
  { id: 'amigos', label: 'Amigos' },
  { id: 'grupos', label: 'Grupos' },
];

interface SocialViewProps {
  character: Character;
}

export function SocialView({ character }: SocialViewProps) {
  const [active, setActive] = useState<SocialSection>('global');

  return (
    <div className={styles.root}>
      <nav className={styles.sectionTabs}>
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`${styles.sectionTab} ${isActive ? styles.sectionTabActive : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.label}
              {s.id === 'amigos' && (
                <span className={styles.sectionTabBadge}>{FRIENDS.filter((f) => f.status === 'online').length}</span>
              )}
              {s.id === 'grupos' && (
                <span className={styles.sectionTabBadge}>{PARTIES.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={styles.sectionBody} key={active}>
        {active === 'global' && <PublicChatPane character={character} />}
        {active === 'guilda' && <ChatPane channel="guilda" character={character} />}
        {active === 'amigos' && <FriendsPane />}
        {active === 'grupos' && <PartiesPane character={character} />}
      </div>
    </div>
  );
}

// ============================================================================
// PublicChatPane — Geral (feed unificado) + canais filtrados
// ============================================================================

interface PublicChatPaneProps {
  character: Character;
}

function PublicChatPane({ character }: PublicChatPaneProps) {
  const [view, setView] = useState<PublicChatView>('geral');
  const [sendChannel, setSendChannel] = useState<PublicChatChannel>('global');
  const [messagesByChannel, setMessagesByChannel] = useState<Record<PublicChatChannel, ChatMessage[]>>(() => ({
    ...PUBLIC_CHANNEL_MESSAGES,
  }));
  const [input, setInput] = useState('');
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [sendMenuOpen, setSendMenuOpen] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const viewPickerRef = useRef<HTMLDivElement>(null);
  const sendPickerRef = useRef<HTMLDivElement>(null);

  const viewDef = PUBLIC_CHAT_VIEWS.find((c) => c.id === view)!;
  const messages = useMemo(
    () => (view === 'geral' ? mergePublicMessages(messagesByChannel) : messagesByChannel[view]),
    [view, messagesByChannel],
  );
  const activeSendChannel = view === 'geral' ? sendChannel : view;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages.length, view]);

  useEffect(() => {
    if (!viewMenuOpen && !sendMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (viewPickerRef.current?.contains(target) || sendPickerRef.current?.contains(target)) return;
      setViewMenuOpen(false);
      setSendMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [viewMenuOpen, sendMenuOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessagesByChannel((prev) => ({
      ...prev,
      [activeSendChannel]: [...prev[activeSendChannel], makeOwnMessage(text, character, activeSendChannel)],
    }));
    setInput('');
  };

  const handleViewChange = (next: PublicChatView) => {
    setView(next);
    if (next !== 'geral') setSendChannel(next);
    setViewMenuOpen(false);
  };

  const handleSendChannelChange = (next: PublicChatChannel) => {
    setSendChannel(next);
    setSendMenuOpen(false);
  };

  const viewPickerLabel = view === 'geral' ? 'Geral' : `/${view}`;

  return (
    <div className={styles.chat}>
      <header className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <span className={styles.chatChannelTag}>{viewDef.label}</span>
          <span className={styles.chatServerName}>{SERVER_NAME}</span>
        </div>
        <span className={styles.chatHeaderMeta}>
          <span className={styles.onlineDot} /> {ONLINE_COUNT.toLocaleString('pt-BR')} online
        </span>
      </header>

      <div className={styles.chatChannelHint}>{viewDef.description}</div>

      <div ref={logRef} className={styles.chatLog}>
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} showChannelTag={view === 'geral'} />
        ))}
      </div>

      <form className={styles.chatInput} onSubmit={handleSubmit}>
        <div ref={viewPickerRef} className={styles.channelPicker}>
          <button
            type="button"
            className={`${styles.channelPickerBtn} ${viewMenuOpen ? styles.channelPickerBtnOpen : ''}`}
            onClick={() => {
              setSendMenuOpen(false);
              setViewMenuOpen((open) => !open);
            }}
            aria-expanded={viewMenuOpen}
            aria-haspopup="listbox"
          >
            <span>{viewPickerLabel}</span>
            <span className={styles.channelPickerCaret} aria-hidden>▾</span>
          </button>
          {viewMenuOpen && (
            <ul className={styles.channelPickerMenu} role="listbox" aria-label="Visualização do chat">
              {PUBLIC_CHAT_VIEWS.map((ch) => {
                const isActive = ch.id === view;
                return (
                  <li key={ch.id} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      className={`${styles.channelPickerItem} ${isActive ? styles.channelPickerItemActive : ''}`}
                      onClick={() => handleViewChange(ch.id)}
                    >
                      <span className={styles.channelPickerSlug}>
                        {ch.id === 'geral' ? 'Geral' : `/${ch.id}`}
                      </span>
                      <span className={styles.channelPickerLabel}>{ch.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {view === 'geral' && (
          <div ref={sendPickerRef} className={styles.channelPicker}>
            <button
              type="button"
              className={`${styles.channelPickerBtn} ${styles.channelPickerBtnSend} ${sendMenuOpen ? styles.channelPickerBtnOpen : ''}`}
              onClick={() => {
                setViewMenuOpen(false);
                setSendMenuOpen((open) => !open);
              }}
              aria-expanded={sendMenuOpen}
              aria-haspopup="listbox"
              title="Canal de envio"
            >
              <span>→ /{sendChannel}</span>
              <span className={styles.channelPickerCaret} aria-hidden>▾</span>
            </button>
            {sendMenuOpen && (
              <ul className={styles.channelPickerMenu} role="listbox" aria-label="Canal de envio">
                {PUBLIC_CHAT_CHANNELS.map((ch) => {
                  const isActive = ch.id === sendChannel;
                  return (
                    <li key={ch.id} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        className={`${styles.channelPickerItem} ${isActive ? styles.channelPickerItemActive : ''}`}
                        onClick={() => handleSendChannelChange(ch.id)}
                      >
                        <span className={styles.channelPickerSlug}>/{ch.id}</span>
                        <span className={styles.channelPickerLabel}>{ch.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            view === 'geral'
              ? `Enviar em /${sendChannel}…`
              : `Mensagem em /${view}…`
          }
          className={styles.chatInputField}
          maxLength={200}
        />
        <button
          type="submit"
          className={`btn-secondary ${styles.chatInputSend}`}
          disabled={input.trim().length === 0}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// ChatPane — Guilda (layout compartilhado: header + log + input)
// ============================================================================

interface ChatPaneProps {
  channel: SocialChannel;
  character: Character;
}

function ChatPane({ channel, character }: ChatPaneProps) {
  const initial = GUILD_MESSAGES;
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [input, setInput] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll quando uma nova mensagem entra (typed pelo usuário)
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages([...messages, makeOwnMessage(text, character, channel)]);
    setInput('');
  };

  return (
    <div className={styles.chat}>
      <header className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <span className={styles.chatChannelTag}>Guilda</span>
          <span className={styles.chatServerName}>{GUILD.name}</span>
        </div>
        <span className={styles.chatHeaderMeta}>
          <span className={styles.onlineDot} /> {GUILD.onlineCount} de {GUILD.memberCount}
        </span>
      </header>

      <div className={styles.guildMotto}>"{GUILD.motto}"</div>

      <div ref={logRef} className={styles.chatLog}>
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </div>

      <form className={styles.chatInput} onSubmit={handleSubmit}>
        <span className={styles.chatInputPrefix}>/{channel}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pressione Enter para enviar…"
          className={styles.chatInputField}
          maxLength={200}
        />
        <button
          type="submit"
          className={`btn-secondary ${styles.chatInputSend}`}
          disabled={input.trim().length === 0}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// FriendsPane — split: lista à esquerda, DM à direita
// ============================================================================

function FriendsPane() {
  const [selectedName, setSelectedName] = useState<string | null>(FRIENDS[0]?.name ?? null);
  const selected = useMemo(
    () => FRIENDS.find((f) => f.name === selectedName) ?? null,
    [selectedName],
  );

  const online = FRIENDS.filter((f) => f.status === 'online');
  const ausente = FRIENDS.filter((f) => f.status === 'ausente');
  const offline = FRIENDS.filter((f) => f.status === 'offline');

  return (
    <div className={styles.friendsSplit}>
      <aside className={styles.friendsList}>
        {online.length > 0 && (
          <FriendsGroup label={`Online — ${online.length}`}>
            {online.map((f) => (
              <FriendRow key={f.name} friend={f} active={f.name === selectedName} onClick={() => setSelectedName(f.name)} />
            ))}
          </FriendsGroup>
        )}
        {ausente.length > 0 && (
          <FriendsGroup label={`Ausentes — ${ausente.length}`}>
            {ausente.map((f) => (
              <FriendRow key={f.name} friend={f} active={f.name === selectedName} onClick={() => setSelectedName(f.name)} />
            ))}
          </FriendsGroup>
        )}
        {offline.length > 0 && (
          <FriendsGroup label={`Offline — ${offline.length}`}>
            {offline.map((f) => (
              <FriendRow key={f.name} friend={f} active={f.name === selectedName} onClick={() => setSelectedName(f.name)} />
            ))}
          </FriendsGroup>
        )}
      </aside>

      <main className={styles.friendsDm}>
        {selected ? <DmPane friend={selected} /> : <div className={styles.friendsEmpty}>Selecione um amigo.</div>}
      </main>
    </div>
  );
}

function FriendsGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className={styles.friendsGroup}>
      <div className={styles.friendsGroupLabel}>{label}</div>
      {children}
    </section>
  );
}

function FriendRow({ friend, active, onClick }: { friend: Friend; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.friendRow} ${active ? styles.friendRowActive : ''} ${styles[`status_${friend.status}`]}`}
      onClick={onClick}
    >
      <span className={styles.friendDot} />
      <div className={styles.friendInfo}>
        <span className={styles.friendName} style={{ color: CLASS_COLOR_VAR[friend.classKey] }}>
          {friend.name}
        </span>
        <span className={styles.friendMeta}>
          Nv {friend.level} · {friend.context}
        </span>
      </div>
    </button>
  );
}

function DmPane({ friend }: { friend: Friend }) {
  const [messages, setMessages] = useState(friend.history);
  const [input, setInput] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages.length]);

  // Reset histórico quando muda de amigo
  useEffect(() => {
    setMessages(friend.history);
    setInput('');
  }, [friend.name, friend.history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages([...messages, { fromMe: true, time: 'agora', text }]);
    setInput('');
  };

  return (
    <div className={styles.dm}>
      <header className={styles.dmHeader}>
        <div>
          <div className={styles.dmName} style={{ color: CLASS_COLOR_VAR[friend.classKey] }}>
            {friend.name}
          </div>
          <div className={styles.dmMeta}>
            Nv {friend.level} · {friend.context} · {STATUS_LABEL[friend.status]}
          </div>
        </div>
      </header>

      <div ref={logRef} className={styles.dmLog}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.dmBubble} ${m.fromMe ? styles.dmBubbleMe : styles.dmBubbleThem}`}
          >
            <div className={styles.dmText}>{m.text}</div>
            <div className={styles.dmTime}>{m.time}</div>
          </div>
        ))}
      </div>

      <form className={styles.chatInput} onSubmit={handleSubmit}>
        <span className={styles.chatInputPrefix}>/w {friend.name}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={friend.status === 'offline' ? 'Amigo offline — mensagem ficará pendente' : 'Pressione Enter para enviar…'}
          className={styles.chatInputField}
          maxLength={200}
        />
        <button
          type="submit"
          className={`btn-secondary ${styles.chatInputSend}`}
          disabled={input.trim().length === 0}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

const STATUS_LABEL: Record<Friend['status'], string> = {
  online: 'Online',
  ausente: 'Ausente',
  offline: 'Offline',
};

// ============================================================================
// MessageRow — uma linha do log de chat (Global / Guilda)
// ============================================================================

function MessageRow({ message, showChannelTag = false }: { message: ChatMessage; showChannelTag?: boolean }) {
  const sourceChannel = getMessageChannel(message);
  const channelTag = showChannelTag && sourceChannel ? getChannelLabel(sourceChannel) : null;

  const channelTagEl = channelTag ? (
    <span className={styles.messageChannelTag}>[{channelTag}]</span>
  ) : null;

  // Mensagens de sistema e conquista têm tratamento especial
  if (message.kind === 'system') {
    return (
      <div className={`${styles.message} ${styles.messageSystem}`}>
        {channelTagEl}
        <span className={styles.systemPrefix}>✦ Sistema</span>
        <span className={styles.systemText}>
          {message.segments.map((s, i) => renderSegment(s, i))}
        </span>
        <span className={styles.messageTime}>{message.time}</span>
      </div>
    );
  }

  if (message.kind === 'achievement') {
    return (
      <div className={`${styles.message} ${styles.messageAchievement}`}>
        {channelTagEl}
        <span className={styles.achievementPrefix}>✦ Conquista</span>
        <span className={styles.achievementText}>
          {message.segments.map((s, i) => renderSegment(s, i))}
        </span>
        <span className={styles.messageTime}>{message.time}</span>
      </div>
    );
  }

  // Mensagens normais (jogadores)
  const isMe = message.kind === 'me';
  const author = message.author;

  return (
    <div className={`${styles.message} ${isMe ? styles.messageMe : ''}`}>
      <span className={styles.messageTime}>{message.time}</span>
      {channelTagEl}
      {author && (
        <>
          <span className={styles.authorLevel}>[Nv {author.level}]</span>
          {author.guildRank && (
            <span className={`${styles.authorRank} ${styles[`rank_${author.guildRank.toLowerCase()}`]}`}>
              {author.guildRank}
            </span>
          )}
          <span
            className={styles.authorName}
            style={{ color: CLASS_COLOR_VAR[author.classKey] }}
          >
            {author.name}:
          </span>
        </>
      )}
      <span className={styles.messageBody}>
        {message.segments.map((s, i) => renderSegment(s, i))}
      </span>
    </div>
  );
}

function renderSegment(seg: MessageSegment, i: number): React.ReactNode {
  switch (seg.kind) {
    case 'text':
      return <span key={i}>{seg.text}</span>;
    case 'item':
      return <ItemLink key={i} name={seg.name} rarity={seg.rarity} />;
    case 'quest':
      return <QuestLink key={i} name={seg.name} type={seg.type} />;
    case 'player':
      return (
        <span key={i} className={styles.linkPlayer}>
          @{seg.name}
        </span>
      );
  }
}

// ============================================================================
// Hooks/components compartilhados pra tooltip via portal
// ============================================================================

interface TooltipPos { left: number; top: number }

function useHoverPortal() {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<TooltipPos | null>(null);

  const handleEnter = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const TT_WIDTH = 320;
    let left = r.right + 12;
    if (left + TT_WIDTH > window.innerWidth - 8) left = r.left - 12 - TT_WIDTH;
    if (left < 8) left = 8;
    let top = r.top;
    // Mantém dentro do viewport vertical (ajuste simples)
    if (top < 8) top = 8;
    if (top + 200 > window.innerHeight - 8) top = window.innerHeight - 200 - 8;
    setPos({ left, top });
  };
  const handleLeave = () => setPos(null);

  return { ref, pos, handleEnter, handleLeave };
}

// ============================================================================
// ItemLink — span colorido + tooltip rico no hover (via portal)
// ============================================================================

function ItemLink({ name, rarity }: { name: string; rarity: Rarity }) {
  const { ref, pos, handleEnter, handleLeave } = useHoverPortal();
  const item = useMemo(() => findItemByName(name), [name]);

  return (
    <>
      <span
        ref={ref}
        className={`${styles.linkItem} ${styles[`rarity_${rarity}`]}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        [{name}]
      </span>
      {pos && item &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              zIndex: 1100,
              pointerEvents: 'none',
              maxWidth: 320,
            }}
          >
            <ItemTooltipInline item={item} />
          </div>,
          document.body,
        )}
    </>
  );
}

// ============================================================================
// QuestLink — span colorido + tooltip de quest no hover
// ============================================================================

function QuestLink({ name, type }: { name: string; type?: import('../../types').QuestType }) {
  const { ref, pos, handleEnter, handleLeave } = useHoverPortal();
  const quest = useMemo(() => findQuestByName(name), [name]);
  // Cor da label deriva do `type` se passado, senão do quest encontrado, senão neutro
  const colorType = type ?? quest?.type ?? 'side';

  return (
    <>
      <span
        ref={ref}
        className={`${styles.linkQuest} ${styles[`questType_${colorType}`]}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        [{name}]
      </span>
      {pos && quest &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              zIndex: 1100,
              pointerEvents: 'none',
              maxWidth: 320,
            }}
          >
            <QuestTooltip quest={quest} />
          </div>,
          document.body,
        )}
    </>
  );
}

// ============================================================================
// QuestTooltip — preview compacto da quest (título + tipo + descrição)
// ============================================================================

function QuestTooltip({ quest }: { quest: Quest }) {
  return (
    <div className={styles.questTooltip}>
      <header className={styles.questTooltipHeader}>
        <h4 className={`${styles.questTooltipTitle} ${styles[`questType_${quest.type}`]}`}>
          {quest.title}
        </h4>
        <div className={styles.questTooltipMeta}>
          <span className={`${styles.questTooltipType} ${styles[`questType_${quest.type}`]}`}>
            {QUEST_TYPE_LABEL[quest.type]}
          </span>
          {quest.giver && (
            <>
              <span className={styles.questTooltipDot}>·</span>
              <span className={styles.questTooltipGiver}>{quest.giver}</span>
            </>
          )}
        </div>
      </header>
      <p className={styles.questTooltipDesc}>{quest.description}</p>
      {quest.expiresIn && quest.status === 'ativa' && (
        <div className={styles.questTooltipExpires}>Expira em {quest.expiresIn}</div>
      )}
    </div>
  );
}

// ============================================================================
// PartiesPane — buscador de atividades / LFG (mockup visual)
// ============================================================================

const CATEGORY_ORDER: ActivityCategory[] = ['todos', 'masmorra', 'raid', 'missao', 'farm', 'aberto'];

interface PartiesPaneProps {
  character: Character;
}

function PartiesPane({ character }: PartiesPaneProps) {
  const [category, setCategory] = useState<ActivityCategory>('todos');
  const [search, setSearch] = useState('');
  const [onlyCompatible, setOnlyCompatible] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(PARTIES[0]?.id ?? '');
  const [notice, setNotice] = useState<string | null>(null);

  const counts = useMemo(() => countByCategory(PARTIES), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PARTIES.filter((p) => {
      if (category !== 'todos' && getActivityCategory(p.type) !== category) return false;
      if (onlyCompatible && (character.level < p.levelRange.min || character.level > p.levelRange.max)) return false;
      if (!q) return true;
      const hay = `${p.activity} ${p.title} ${p.location ?? ''} ${p.description} ${PARTY_TYPE_LABEL[p.type]}`.toLowerCase();
      return hay.includes(q);
    });
  }, [category, search, onlyCompatible, character.level]);

  const selected = useMemo(
    () => filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((p) => p.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const handleCreateGroup = () => {
    setNotice('Mockup — criação de grupo ainda não implementada.');
    setTimeout(() => setNotice(null), 2400);
  };

  const handleJoin = (party: PartyListing) => {
    setNotice(`Mockup — pedido de entrada enviado para "${party.activity}".`);
    setTimeout(() => setNotice(null), 2400);
  };

  return (
    <div className={styles.lfg}>
      <header className={styles.lfgToolbar}>
        <div className={styles.lfgSearchWrap}>
          <span className={styles.lfgSearchLabel}>Buscar</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Masmorra, raid, missão…"
            className={styles.lfgSearch}
          />
        </div>
        <label className={styles.lfgCompat}>
          <input
            type="checkbox"
            checked={onlyCompatible}
            onChange={(e) => setOnlyCompatible(e.target.checked)}
            className={styles.lfgCompatInput}
          />
          <span>Compatível com Nv {character.level}</span>
        </label>
        <button
          type="button"
          className={`btn-primary ${styles.lfgCreate}`}
          onClick={handleCreateGroup}
        >
          + Criar Grupo
        </button>
      </header>

      {notice && <div className={styles.partiesNotice}>{notice}</div>}

      <div className={styles.lfgSplit}>
        <nav className={styles.lfgNav}>
          <div className={styles.lfgNavTitle}>Atividades</div>
          <ul className={styles.lfgNavList}>
            {CATEGORY_ORDER.map((cat) => {
              const isActive = category === cat;
              return (
                <li key={cat}>
                  <button
                    type="button"
                    className={`${styles.lfgNavItem} ${isActive ? styles.lfgNavItemActive : ''} ${cat !== 'todos' ? styles[`lfgCat_${cat}`] : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    <span className={styles.lfgNavItemLabel}>{ACTIVITY_CATEGORY_LABEL[cat]}</span>
                    <span className={styles.lfgNavItemCount}>{counts[cat]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <aside className={styles.lfgList}>
          <div className={styles.lfgListHeader}>
            <span className={styles.lfgListTitle}>
              {filtered.length} {filtered.length === 1 ? 'grupo' : 'grupos'}
            </span>
            <span className={styles.lfgListHint}>
              {category === 'todos' ? 'todas as categorias' : ACTIVITY_CATEGORY_LABEL[category]}
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className={styles.lfgListEmpty}>Nenhum grupo neste filtro.</div>
          ) : (
            <ul className={styles.lfgEntries}>
              {filtered.map((party) => (
                <PartyRow
                  key={party.id}
                  party={party}
                  active={party.id === selected?.id}
                  onClick={() => setSelectedId(party.id)}
                />
              ))}
            </ul>
          )}
        </aside>

        <main className={styles.lfgDetail}>
          {selected ? (
            <PartyDetail party={selected} onJoin={() => handleJoin(selected)} />
          ) : (
            <div className={styles.lfgDetailEmpty}>Selecione um grupo.</div>
          )}
        </main>
      </div>
    </div>
  );
}

function PartyRow({ party, active, onClick }: { party: PartyListing; active: boolean; onClick: () => void }) {
  const isFull = party.members.current >= party.members.max;
  const openSlots = party.members.max - party.members.current;

  return (
    <li>
      <button
        type="button"
        className={`${styles.lfgRow} ${active ? styles.lfgRowActive : ''} ${isFull ? styles.lfgRowFull : ''}`}
        onClick={onClick}
      >
        <div className={styles.lfgRowTop}>
          <span className={`${styles.lfgRowType} ${styles[`partyType_${party.type}`]}`}>
            {PARTY_TYPE_LABEL[party.type]}
          </span>
          <span className={styles.lfgRowAge}>{formatAge(party.ageMinutes)}</span>
        </div>
        <div className={styles.lfgRowActivity}>{party.activity}</div>
        <div className={styles.lfgRowMeta}>
          <span className={styles.lfgRowSlots}>
            {isFull ? 'Cheio' : `${openSlots} vaga${openSlots === 1 ? '' : 's'}`}
          </span>
          <span className={styles.lfgRowDot}>·</span>
          <span>Nv {party.levelRange.min}–{party.levelRange.max}</span>
          {party.location && (
            <>
              <span className={styles.lfgRowDot}>·</span>
              <span className={styles.lfgRowLocation}>{party.location}</span>
            </>
          )}
        </div>
      </button>
    </li>
  );
}

function PartyDetail({ party, onJoin }: { party: PartyListing; onJoin: () => void }) {
  const isFull = party.members.current >= party.members.max;
  const openSlots = party.members.max - party.members.current;

  return (
    <article className={styles.lfgSheet}>
      <header className={styles.lfgSheetHeader}>
        <div className={styles.lfgSheetHeadings}>
          <span className={`${styles.lfgSheetType} ${styles[`partyType_${party.type}`]}`}>
            {PARTY_TYPE_LABEL[party.type]}
          </span>
          <h3 className={styles.lfgSheetActivity}>{party.activity}</h3>
          {party.location && (
            <div className={styles.lfgSheetLocation}>{party.location}</div>
          )}
          <p className={styles.lfgSheetTitle}>{party.title}</p>
        </div>
        <button
          type="button"
          className={`btn-primary ${styles.lfgJoin}`}
          onClick={onJoin}
          disabled={isFull}
        >
          {isFull ? 'Grupo cheio' : 'Entrar'}
        </button>
      </header>

      <div className={styles.lfgSheetStats}>
        <div className={styles.lfgStat}>
          <div className={styles.lfgStatLabel}>Vagas</div>
          <div className={styles.lfgStatValue}>
            <span className={styles.lfgSlotsBar}>
              {Array.from({ length: party.members.max }).map((_, i) => (
                <span
                  key={i}
                  className={`${styles.lfgSlot} ${i < party.members.current ? styles.lfgSlotFilled : ''}`}
                />
              ))}
            </span>
            <span className={styles.lfgStatMeta}>
              {party.members.current}/{party.members.max}
              {!isFull && ` · ${openSlots} aberta${openSlots === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>
        <div className={styles.lfgStat}>
          <div className={styles.lfgStatLabel}>Nível</div>
          <div className={styles.lfgStatValue}>Nv {party.levelRange.min}–{party.levelRange.max}</div>
        </div>
        <div className={styles.lfgStat}>
          <div className={styles.lfgStatLabel}>Listado</div>
          <div className={styles.lfgStatValue}>{formatAge(party.ageMinutes)}</div>
        </div>
        {party.voiceRequired && (
          <div className={styles.lfgStat}>
            <div className={styles.lfgStatLabel}>Voz</div>
            <div className={`${styles.lfgStatValue} ${styles.lfgVoice}`}>Obrigatório</div>
          </div>
        )}
      </div>

      {party.lookingFor && party.lookingFor.length > 0 && (
        <div className={styles.lfgRoles}>
          <div className={styles.lfgRolesLabel}>Procurando</div>
          <div className={styles.lfgRolesChips}>
            {party.lookingFor.map((role) => (
              <span key={role} className={styles.lfgRoleChip}>{role}</span>
            ))}
          </div>
        </div>
      )}

      {party.questRef && (
        <div className={styles.lfgQuestRef}>
          <span className={styles.lfgQuestLabel}>Missão vinculada</span>
          <QuestLink name={party.questRef} />
        </div>
      )}

      <p className={styles.lfgSheetDesc}>{party.description}</p>

      <footer className={styles.lfgSheetFooter}>
        <span className={styles.lfgLeaderLabel}>Líder</span>
        <span
          className={styles.lfgLeaderName}
          style={{ color: CLASS_COLOR_VAR[party.leader.classKey] }}
        >
          {party.leader.name}
        </span>
        <span className={styles.lfgLeaderMeta}>· Nv {party.leader.level}</span>
      </footer>
    </article>
  );
}

// ============================================================================
// Header pro modal large
// ============================================================================

interface SocialHeaderProps {
  character: Character;
  onClose: () => void;
  shortcut?: string;
}

export function SocialHeader({ character, onClose, shortcut = 'G' }: SocialHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Social</div>
        <div className={styles.subtitle}>
          {character.name} · {SERVER_NAME} · {ONLINE_COUNT.toLocaleString('pt-BR')} online
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}

