import { useEffect, useRef, useState } from 'react';
import type { Character } from '../../types';
import {
  EDITABLE_TABS,
  assignShortcut,
  displayKey,
  type EditableTab,
  type Settings,
} from '../../lib/settings';
import { TAB_LABEL, TAB_DESC } from '../../data/classes';
import styles from './OptionsView.module.css';

type OptionsSection = 'geral' | 'atalhos' | 'video';

const SECTIONS: { id: OptionsSection; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'atalhos', label: 'Atalhos' },
  { id: 'video', label: 'Vídeo' },
];

interface OptionsViewProps {
  settings: Settings;
  onSettingsChange: (next: Settings) => void;
  onResetShortcuts: () => void;
  onBackToList: () => void;
}

export function OptionsView({
  settings,
  onSettingsChange,
  onResetShortcuts,
  onBackToList,
}: OptionsViewProps) {
  const [active, setActive] = useState<OptionsSection>('geral');

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
            </button>
          );
        })}
      </nav>

      <div className={styles.sectionBody} key={active}>
        {active === 'geral' && <GeralPane onBackToList={onBackToList} />}
        {active === 'atalhos' && (
          <AtalhosPane
            settings={settings}
            onSettingsChange={onSettingsChange}
            onResetShortcuts={onResetShortcuts}
          />
        )}
        {active === 'video' && (
          <VideoPane settings={settings} onSettingsChange={onSettingsChange} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// GERAL — ações de conta e gerais (por ora só seleção de personagem)
// ============================================================================
function GeralPane({ onBackToList }: { onBackToList: () => void }) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Geral</h2>
      </div>
      <p className={styles.sectionDesc}>
        Ações de conta e preferências globais. Mais opções aparecerão aqui conforme o jogo crescer.
      </p>
      <button type="button" className={styles.optionItem} onClick={onBackToList}>
        <span className={styles.optName}>Selecionar Personagem</span>
        <span className={styles.optDesc}>Salva o progresso atual e volta para a tela de seleção de personagens.</span>
      </button>
    </section>
  );
}

// ============================================================================
// ATALHOS — tabela editável de teclas pra abrir cada menu
// ============================================================================
interface AtalhosPaneProps {
  settings: Settings;
  onSettingsChange: (next: Settings) => void;
  onResetShortcuts: () => void;
}

function AtalhosPane({ settings, onSettingsChange, onResetShortcuts }: AtalhosPaneProps) {
  const [editing, setEditing] = useState<EditableTab | null>(null);
  const editingRef = useRef<EditableTab | null>(null);
  editingRef.current = editing;

  // Captura a próxima tecla quando uma linha está em modo edição.
  useEffect(() => {
    if (!editing) return;
    const handleKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();

      const tab = editingRef.current;
      if (!tab) return;

      if (e.key === 'Escape') {
        setEditing(null);
        return;
      }

      if (
        ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock', 'Dead', 'Unidentified'].includes(
          e.key,
        )
      ) {
        return;
      }
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const nextShortcuts = assignShortcut(settings.shortcuts, tab, e.key);
      onSettingsChange({ ...settings, shortcuts: nextShortcuts });
      setEditing(null);
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [editing, settings, onSettingsChange]);

  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Atalhos</h2>
        <button
          type="button"
          className={`btn-secondary ${styles.btnReset}`}
          onClick={onResetShortcuts}
        >
          Restaurar padrões
        </button>
      </div>
      <p className={styles.sectionDesc}>
        Defina a tecla que abre cada menu. Esc é reservado para abrir Opções e fechar modais.
      </p>

      <div className={styles.shortcutTable}>
        <div className={`${styles.shortcutRow} ${styles.shortcutRowHeader}`}>
          <span className={styles.colAction}>Menu</span>
          <span className={styles.colDesc}>Descrição</span>
          <span className={styles.colKey}>Tecla</span>
          <span className={styles.colEdit} />
        </div>
        {EDITABLE_TABS.map((tab) => {
          const isEditing = editing === tab;
          return (
            <div
              key={tab}
              className={`${styles.shortcutRow} ${isEditing ? styles.shortcutRowEditing : ''}`}
            >
              <span className={styles.actionName}>{TAB_LABEL[tab]}</span>
              <span className={styles.actionDesc}>{TAB_DESC[tab]}</span>
              <span className={styles.keyChip}>
                {isEditing ? (
                  <span className={styles.keyChipPrompt}>Pressione…</span>
                ) : (
                  displayKey(settings.shortcuts[tab])
                )}
              </span>
              <button
                type="button"
                className={`btn-secondary ${styles.btnEdit}`}
                onClick={() => setEditing(isEditing ? null : tab)}
              >
                {isEditing ? 'Cancelar' : 'Alterar'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================================
// VÍDEO — preferências de display
// ============================================================================
interface VideoPaneProps {
  settings: Settings;
  onSettingsChange: (next: Settings) => void;
}

function VideoPane({ settings, onSettingsChange }: VideoPaneProps) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Vídeo</h2>
      </div>
      <div className={styles.toggleRow}>
        <div className={styles.toggleText}>
          <span className={styles.toggleName}>Iniciar em tela cheia</span>
          <span className={styles.toggleDesc}>
            Sempre que continuar uma aventura ou criar um novo personagem, o jogo entra em tela cheia automaticamente.
          </span>
        </div>
        <button
          type="button"
          className={`${styles.toggle} ${settings.startInFullscreen ? styles.toggleOn : ''}`}
          onClick={() =>
            onSettingsChange({
              ...settings,
              startInFullscreen: !settings.startInFullscreen,
            })
          }
          aria-pressed={settings.startInFullscreen}
        >
          {settings.startInFullscreen ? 'Ativado' : 'Desativado'}
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// Header pro modal
// ============================================================================
interface OptionsHeaderProps {
  character: Character;
  onClose: () => void;
}

export function OptionsHeader({ character, onClose }: OptionsHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Opções</div>
        <div className={styles.subtitle}>{character.name} · Preferências do jogo</div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>ESC</span>
      </button>
    </div>
  );
}
