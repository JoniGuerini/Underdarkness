import { useState } from 'react';
import type { Character } from '../../types';
import { Modal } from '../Modal/Modal';
import { ShopPane } from '../ShopPane/ShopPane';
import { CraftPane } from '../CraftPane/CraftPane';
import { RestPane } from '../RestPane/RestPane';
import {
  NPC_ROLE_LABEL,
  type Npc,
  type NpcRole,
} from '../../data/npcs';
import {
  applyDialogueAction,
  getDialogueTree,
  getQuestMarker,
  getVisibleChoices,
  type DialogueChoice,
} from '../../data/npcDialogues';
import styles from './NpcDialog.module.css';

interface NpcDialogProps {
  npc: Npc | null;
  character: Character;
  onUpdate: (next: Character) => void;
  onClose: () => void;
}

export function NpcDialog({ npc, character, onUpdate, onClose }: NpcDialogProps) {
  if (!npc) return null;

  return (
    <Modal
      open
      onClose={onClose}
      large
      header={<NpcHeader npc={npc} onClose={onClose} />}
    >
      {/* key força remount ao trocar de NPC; ao fechar o body desmonta e reabre em Falar */}
      <NpcDialogBody
        key={npc.id}
        npc={npc}
        character={character}
        onUpdate={onUpdate}
        onClose={onClose}
      />
    </Modal>
  );
}

interface NpcDialogBodyProps {
  npc: Npc;
  character: Character;
  onUpdate: (next: Character) => void;
  onClose: () => void;
}

function NpcDialogBody({ npc, character, onUpdate, onClose }: NpcDialogBodyProps) {
  const [active, setActive] = useState<NpcRole>('falar');

  return (
    <div className={styles.root}>
      <section className={styles.introCard}>
        <p className={styles.intro}>{npc.description}</p>
        <nav className={styles.roleTabs}>
          {npc.roles.map((role) => {
            const isActive = active === role;
            return (
              <button
                key={role}
                type="button"
                className={`${styles.roleTab} ${isActive ? styles.roleTabActive : ''}`}
                onClick={() => setActive(role)}
              >
                {NPC_ROLE_LABEL[role]}
              </button>
            );
          })}
        </nav>
      </section>

      <section className={styles.paneCard} key={active}>
        {active === 'falar' && (
          <FalarPane
            npc={npc}
            character={character}
            onUpdate={onUpdate}
            onClose={onClose}
          />
        )}
        {active === 'loja' && (
          <ShopPane npcId={npc.id} character={character} onUpdate={onUpdate} />
        )}
        {active === 'forjar' && (
          <CraftPane npcId={npc.id} role="forjar" character={character} onUpdate={onUpdate} />
        )}
        {active === 'destilar' && (
          <CraftPane npcId={npc.id} role="destilar" character={character} onUpdate={onUpdate} />
        )}
        {active === 'descansar' && (
          <RestPane character={character} onUpdate={onUpdate} />
        )}
      </section>
    </div>
  );
}

// ============================================================================
// Header — espelha o pattern dos outros large headers (CodexHeader, etc.)
// ============================================================================
function NpcHeader({ npc, onClose }: { npc: Npc; onClose: () => void }) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>{npc.name}</div>
        <div className={styles.subtitle}>{npc.title}</div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>ESC</span>
      </button>
    </div>
  );
}

// ============================================================================
// FALAR — árvore de diálogo com escolhas e missões
// ============================================================================
interface FalarPaneProps {
  npc: Npc;
  character: Character;
  onUpdate: (next: Character) => void;
  onClose: () => void;
}

function FalarPane({ npc, character, onUpdate, onClose }: FalarPaneProps) {
  const tree = getDialogueTree(npc.id);
  const [nodeId, setNodeId] = useState(tree?.start ?? 'fallback');

  if (!tree) {
    return <p className={styles.dialogue}>{npc.dialogue}</p>;
  }

  const node = tree.nodes[nodeId] ?? tree.nodes[tree.start];
  const choices = getVisibleChoices(node.choices, character);

  const handleChoice = (choice: DialogueChoice) => {
    if (choice.action === 'close') {
      onClose();
      return;
    }
    const nextChar = applyDialogueAction(character, choice);
    if (nextChar !== character) onUpdate(nextChar);
    setNodeId(choice.next);
  };

  return (
    <div className={styles.falarPane}>
      <div className={styles.dialogueBlock}>
        <div className={styles.dialogueSpeaker}>{npc.name}</div>
        {node.text.split('\n\n').map((paragraph, i) => (
          <p key={i} className={styles.dialogue}>
            {paragraph}
          </p>
        ))}
      </div>

      {choices.length > 0 && (
        <div className={styles.dialogueChoices}>
          <div className={styles.dialogueChoicesLabel}>Suas respostas</div>
          {choices.map((choice, i) => {
            const marker = getQuestMarker(choice);
            return (
              <button
                key={`${node.id}-${i}`}
                type="button"
                className={`${styles.dialogueChoice} ${marker ? styles.dialogueChoiceQuest : ''}`}
                onClick={() => handleChoice(choice)}
              >
                {marker && (
                  <span className={styles.dialogueQuestMarker} aria-hidden>
                    {marker}
                  </span>
                )}
                <span className={styles.dialogueChoiceLabel}>{choice.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

