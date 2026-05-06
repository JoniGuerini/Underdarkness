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
  const [editing, setEditing] = useState<EditableTab | null>(null);
  // Ref pra ter o valor "atual" no listener sem refazer o efeito a cada keydown
  const editingRef = useRef<EditableTab | null>(null);
  editingRef.current = editing;

  // Captura a próxima tecla quando uma linha está em modo edição.
  // Esc cancela. Modificadores sozinhos são ignorados. Qualquer outra tecla
  // (letra, dígito, Tab, Enter, Space, F-keys, símbolo) vira o novo atalho.
  useEffect(() => {
    if (!editing) return;
    const handleKey = (e: KeyboardEvent) => {
      // capture phase + stopImmediate pra evitar que o handler do GameHud abra
      // outra tab no mesmo evento — e que Tab faça focus walk no DOM.
      e.stopImmediatePropagation();
      e.preventDefault();

      const tab = editingRef.current;
      if (!tab) return;

      if (e.key === 'Escape') {
        setEditing(null);
        return;
      }

      // Ignora modificadores pressionados sozinhos (eles disparam keydown próprio
      // antes da combinação real; sem isso, Shift/Ctrl/Alt viraria o atalho).
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock', 'Dead', 'Unidentified'].includes(e.key)) {
        return;
      }
      // Combos com modificador também são ignorados — só teclas únicas por enquanto.
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const nextShortcuts = assignShortcut(settings.shortcuts, tab, e.key);
      onSettingsChange({ ...settings, shortcuts: nextShortcuts });
      setEditing(null);
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [editing, settings, onSettingsChange]);

  return (
    <div className={styles.root}>
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

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Personagem</h2>
        </div>
        <button type="button" className={styles.optionItem} onClick={onBackToList}>
          <span className={styles.optName}>Trocar personagem</span>
          <span className={styles.optDesc}>Salvar progresso e voltar para a seleção de personagens.</span>
        </button>
      </section>
    </div>
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
