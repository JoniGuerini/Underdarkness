import { useState } from 'react';
import type { Character, ClassKey, Item } from '../../types';
import { CLASSES } from '../../data/classes';
import { applyLoadout, getStarterLoadout } from '../../data/items';
import { makeMaterialStack } from '../../data/materials';
import { ClassSidebarItem } from '../../components/ClassSidebarItem/ClassSidebarItem';
import { ClassDetailPanel } from '../../components/ClassDetailPanel/ClassDetailPanel';
import { genId } from '../../lib/storage';
import styles from './CharacterCreate.module.css';

/**
 * Itens iniciais — colocados nos primeiros slots vazios do inventário
 * pra que o jogador possa testar crafting/loja imediatamente após criar.
 * Mistura de reagentes da forja (ferro, pedra) + alquimia (ervas, frasco)
 * + comida básica.
 */
const STARTER_KIT: { id: string; count: number }[] = [
  { id: 'mat-minerio-ferro', count: 3 },
  { id: 'mat-pedra-afiar', count: 1 },
  { id: 'erva-vermelha', count: 2 },
  { id: 'erva-azul', count: 2 },
  { id: 'frasco-vazio', count: 2 },
  { id: 'food-pao-duro', count: 2 },
];

/** Mutates the inventory in-place adding STARTER_KIT items in empty slots. */
function addStarterKit(inventory: (Item | null)[]) {
  for (const entry of STARTER_KIT) {
    const stack = makeMaterialStack(entry.id, entry.count);
    if (!stack) continue;
    const emptyIdx = inventory.findIndex((s) => s === null);
    if (emptyIdx < 0) break;
    inventory[emptyIdx] = stack;
  }
}

interface CharacterCreateProps {
  canGoBack: boolean;
  onBack: () => void;
  onCreate: (character: Character) => void;
}

export function CharacterCreate({ canGoBack, onBack, onCreate }: CharacterCreateProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassKey>('guerreiro');

  const trimmedName = name.trim();
  const canCreate = trimmedName.length > 0;

  const handleReset = () => {
    setName('');
    setSelectedClass('guerreiro');
  };

  const handleCreate = () => {
    if (!canCreate) return;
    const data = CLASSES[selectedClass];
    const { equipped, inventory } = applyLoadout(getStarterLoadout(selectedClass));
    // Kit inicial — alguns reagentes pra testar crafting de imediato + uns frascos
    addStarterKit(inventory);
    const character: Character = {
      id: genId(),
      name: trimmedName,
      classKey: selectedClass,
      classLabel: data.label,
      classTagline: data.tagline,
      level: 1,
      xp: 0,
      xpNext: 100,
      vidaMax: data.vida,
      vidaAtual: data.vida,
      manaMax: data.mana,
      manaAtual: data.mana,
      forca: data.forca,
      agilidade: data.agilidade,
      intelecto: data.intelecto,
      abilities: data.abilities,
      equipped,
      inventory,
      talentRanks: {},
      visitedLocations: ['pedragal'],
      abandonedQuestIds: [],
      gold: 60,
      time: '06:00',
      day: 1,
      period: 'Aurora',
      location: 'pedragal',
      createdAt: new Date().toISOString(),
    };
    onCreate(character);
  };

  return (
    <section className={styles.view}>
      <div className={styles.container}>
        <header className={styles.brand}>
          <h1>Underdarkness</h1>
        </header>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Criação de Personagem</h2>
          <p className={styles.sectionSubtitle}>Escolha um nome e uma classe.</p>
        </div>

        <div className={styles.nameField}>
          <label htmlFor="hero-name">Nome do Personagem</label>
          <input
            type="text"
            id="hero-name"
            placeholder="Digite o nome do personagem"
            maxLength={32}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            {(Object.keys(CLASSES) as ClassKey[]).map((key) => (
              <ClassSidebarItem
                key={key}
                data={CLASSES[key]}
                selected={selectedClass === key}
                onClick={() => setSelectedClass(key)}
              />
            ))}
          </aside>

          <main className={styles.detail}>
            <ClassDetailPanel data={CLASSES[selectedClass]} />
          </main>
        </div>

        <div className={styles.actionRow}>
          <div className={styles.actionGroup}>
            {canGoBack && (
              <button className="btn-secondary" onClick={onBack}>
                ← Personagens
              </button>
            )}
            <button className="btn-secondary" onClick={handleReset}>
              Limpar
            </button>
          </div>
          <button className="btn-primary" onClick={handleCreate} disabled={!canCreate}>
            Criar Personagem
          </button>
        </div>
      </div>
    </section>
  );
}
