import { useState } from 'react';
import type { Character } from '../../types';
import { Modal } from '../Modal/Modal';
import { ShopPane } from '../ShopPane/ShopPane';
import { CraftPane } from '../CraftPane/CraftPane';
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
  // Aba ativa do diálogo — começa sempre em "falar" pra mostrar a fala de boas-vindas.
  // Reseta cada vez que troca de NPC (key={npc.id} no Modal).
  const [active, setActive] = useState<NpcRole>('falar');

  if (!npc) return null;

  const handleRoleClick = (role: NpcRole) => setActive(role);

  return (
    <Modal
      open={!!npc}
      onClose={onClose}
      title={npc.name}
      shortcut={npc.title.toUpperCase()}
    >
      <div key={npc.id} className={styles.body}>
        <div className={styles.intro}>{npc.description}</div>

        <nav className={styles.roleTabs}>
          {npc.roles.map((role) => {
            const isActive = active === role;
            return (
              <button
                key={role}
                type="button"
                className={`${styles.roleTab} ${isActive ? styles.roleTabActive : ''}`}
                onClick={() => handleRoleClick(role)}
              >
                {NPC_ROLE_LABEL[role]}
              </button>
            );
          })}
        </nav>

        <div className={styles.pane} key={active}>
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
          {active === 'descansar' && <StubPane title="Descansar" message="Em desenvolvimento — pague uma diária para recuperar Vida e Mana ao máximo." />}
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// FALAR — fala principal do NPC (citação direta)
// ============================================================================
function FalarPane({ npc }: { npc: Npc }) {
  return <p className={styles.dialogue}>{npc.dialogue}</p>;
}

// ============================================================================
// STUB — placeholder pras roles ainda não implementadas
// ============================================================================
function StubPane({ title: _title, message }: { title: string; message: string }) {
  return (
    <div className={styles.stub}>
      <p className={styles.stubMessage}>{message}</p>
    </div>
  );
}
