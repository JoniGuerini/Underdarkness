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
import styles from './NpcDialog.module.css';

interface NpcDialogProps {
  npc: Npc | null;
  character: Character;
  onUpdate: (next: Character) => void;
  onClose: () => void;
}

export function NpcDialog({ npc, character, onUpdate, onClose }: NpcDialogProps) {
  // Aba ativa do diálogo — começa sempre em "falar". Reseta cada vez que troca
  // de NPC (o key={npc.id} no root garante remount).
  const [active, setActive] = useState<NpcRole>('falar');

  if (!npc) return null;

  return (
    <Modal
      open={!!npc}
      onClose={onClose}
      large
      header={<NpcHeader npc={npc} onClose={onClose} />}
    >
      <div key={npc.id} className={styles.root}>
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
          {active === 'falar' && <FalarPane npc={npc} />}
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
    </Modal>
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
// FALAR — fala principal do NPC (citação direta)
// ============================================================================
function FalarPane({ npc }: { npc: Npc }) {
  return <p className={styles.dialogue}>{npc.dialogue}</p>;
}

