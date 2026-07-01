import { useState, useRef, useCallback, useEffect } from 'react';
import type { Character, EquipSlot, Item } from '../../types';
import {
  EQUIP_SLOT_LABEL,
  emptyEquipped,
  emptyInventory,
  canEquipInSlot,
  findEmptyEquipSlot,
  findFirstCompatibleEquipSlot,
  isTwoHandedItem,
  INVENTORY_SIZE,
  PAPER_DOLL_ORDER,
} from '../../data/items';
import { ItemTooltip } from '../ItemTooltip/ItemTooltip';
import styles from './Inventory.module.css';

interface InventoryProps {
  character: Character;
  onUpdate: (patch: { equipped: Character['equipped']; inventory: Character['inventory'] }) => void;
}

// ============================================================================
// Types internos
// ============================================================================
type Location =
  | { kind: 'inventory'; index: number }
  | { kind: 'equipped'; slot: EquipSlot };

const DRAG_KEY = 'application/x-underdarkness-item';

const locId = (loc: Location) =>
  loc.kind === 'inventory' ? `inv-${loc.index}` : `eq-${loc.slot}`;

const sameLoc = (a: Location, b: Location) =>
  (a.kind === 'inventory' &&
    b.kind === 'inventory' &&
    a.index === b.index) ||
  (a.kind === 'equipped' && b.kind === 'equipped' && a.slot === b.slot);

// ============================================================================
// Componente
// ============================================================================
export function Inventory({ character, onUpdate }: InventoryProps) {
  const [equipped, setEquipped] = useState<Character['equipped']>(
    character.equipped ?? emptyEquipped(),
  );
  const [inventory, setInventory] = useState<Character['inventory']>(
    character.inventory ?? emptyInventory(),
  );
  const [dragSource, setDragSource] = useState<Location | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Tooltip — mantemos posição e item ativo. Hide durante drag.
  const [tooltip, setTooltip] = useState<{ item: Item; left: number; top: number } | null>(null);

  // Refs por slot — pro tooltip ler a posição
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // ===== Sync upstream =====
  useEffect(() => {
    onUpdate({ equipped, inventory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipped, inventory]);

  // ===== Helpers de leitura/escrita =====
  const getItem = useCallback(
    (loc: Location): Item | null => {
      if (loc.kind === 'inventory') return inventory[loc.index];
      return equipped[loc.slot];
    },
    [equipped, inventory],
  );

  const canDropAt = useCallback((target: Location, item: Item): boolean => {
    if (target.kind === 'inventory') return true;
    return canEquipInSlot(item, target.slot, equipped);
  }, [equipped]);

  /** Verifica swap bidirecional + checa stacks empilháveis. */
  const canSwap = useCallback(
    (source: Location, target: Location): boolean => {
      if (sameLoc(source, target)) return false;

      const sourceItem = getItem(source);
      if (!sourceItem) return false;
      const targetItem = getItem(target);

      // Stack: itens iguais e ambos stackable → merge é sempre permitido
      if (
        sourceItem.stackable &&
        targetItem?.stackable &&
        sourceItem.name === targetItem.name
      ) {
        return target.kind === 'inventory'; // só faz sentido em inventário
      }

      if (!canDropAt(target, sourceItem)) return false;
      if (targetItem && !canDropAt(source, targetItem)) return false;

      return true;
    },
    [getItem, canDropAt],
  );

  /** Aplica swap ou merge de stacks. */
  const swap = useCallback(
    (a: Location, b: Location) => {
      if (!canSwap(a, b)) return;

      const itemA = getItem(a);
      const itemB = getItem(b);
      if (!itemA) return;

      const nextEquipped = { ...equipped };
      const nextInventory = [...inventory];

      const setAt = (loc: Location, item: Item | null) => {
        if (loc.kind === 'inventory') nextInventory[loc.index] = item;
        else nextEquipped[loc.slot] = item;
      };

      // Merge de stacks: se ambos são iguais e stackable, soma
      if (
        itemA.stackable &&
        itemB?.stackable &&
        itemA.name === itemB.name
      ) {
        const merged: Item = {
          ...itemB,
          stack: (itemB.stack ?? 1) + (itemA.stack ?? 1),
        };
        setAt(b, merged);
        setAt(a, null); // origem fica vazia após merge
      } else {
        setAt(a, itemB);
        setAt(b, itemA);
      }

      // Arma de duas mãos ocupa as duas mãos: manda a Mão Secundária pro inventário.
      const mainNow = nextEquipped.arma;
      if (mainNow && isTwoHandedItem(mainNow) && nextEquipped.escudo) {
        const freeIdx = nextInventory.findIndex((x) => x === null);
        if (freeIdx >= 0) {
          nextInventory[freeIdx] = nextEquipped.escudo;
          nextEquipped.escudo = null;
        }
      }

      setEquipped(nextEquipped);
      setInventory(nextInventory);
    },
    [equipped, inventory, getItem, canSwap],
  );

  // ===== Click-to-equip =====
  /** Click sem drag: equipa (se origem=inventário) ou desequipa (se origem=equipado). */
  const quickToggle = useCallback(
    (source: Location) => {
      const item = getItem(source);
      if (!item || !item.slot) return; // só itens equipáveis

      if (source.kind === 'inventory') {
        // Equipar: prefere posição vazia compatível (ex: anel1 antes de anel2).
        // Se nenhuma vazia, troca com a primeira posição compatível (swap).
        const emptySlot = findEmptyEquipSlot(item, equipped);
        const targetSlot = emptySlot ?? findFirstCompatibleEquipSlot(item, equipped);
        if (!targetSlot) return;
        swap(source, { kind: 'equipped', slot: targetSlot });
      } else {
        // Desequipar: encontra primeiro slot vazio do inventário
        const emptyIdx = inventory.findIndex((it) => it === null);
        if (emptyIdx === -1) return;
        swap(source, { kind: 'inventory', index: emptyIdx });
      }
    },
    [getItem, equipped, inventory, swap],
  );

  // ===== Drag handlers =====
  const handleDragStart = (src: Location) => (e: React.DragEvent) => {
    const item = getItem(src);
    if (!item) {
      e.preventDefault();
      return;
    }
    setDragSource(src);
    setTooltip(null); // fecha tooltip ao começar drag
    e.dataTransfer.setData(DRAG_KEY, item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDragSource(null);
    setDropTarget(null);
  };

  const handleDragOver = (target: Location) => (e: React.DragEvent) => {
    if (!dragSource) return;
    if (!canSwap(dragSource, target)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(locId(target));
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = (target: Location) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragSource) return;
    swap(dragSource, target);
    setDragSource(null);
    setDropTarget(null);
  };

  // ===== Mouse handlers (tooltip + click + context menu) =====
  const handleMouseEnter = (loc: Location, item: Item | null) => () => {
    if (!item || dragSource) return;
    const el = slotRefs.current.get(locId(loc));
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltip({ item, left: rect.right + 8, top: rect.top });
  };

  const handleMouseLeave = () => setTooltip(null);

  const handleClick = (loc: Location, item: Item | null) => (e: React.MouseEvent) => {
    if (e.button !== 0) return; // só botão esquerdo
    if (!item) return;
    setTooltip(null);
    quickToggle(loc);
  };

  /** Botão direito agora replica click-to-equip: equipa item do inventário
   *  ou desequipa item de slot equipado. Mantém comportamento simétrico com
   *  clique esquerdo — sem menu de contexto. Descartar passou pra drag-out
   *  (futuro) ou outra interação. */
  const handleContextMenu = (loc: Location, item: Item | null) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!item) return;
    setTooltip(null);
    quickToggle(loc);
  };

  // ===== Render =====
  const renderSlot = (item: Item | null, src: Location, label?: string) => {
    const id = locId(src);
    const isDragging = !!dragSource && sameLoc(dragSource, src);
    const isHover = dropTarget === id;

    const isCompatible = !!dragSource && !isDragging && canSwap(dragSource, src);
    const isIncompatible = !!dragSource && !isDragging && !canSwap(dragSource, src);

    const classes = [
      styles.slot,
      item ? styles.filled : styles.empty,
      item ? styles[item.rarity] : '',
      isDragging ? styles.dragging : '',
      isHover ? styles.hover : '',
      isCompatible && !item ? styles.compatible : '',
      isIncompatible ? styles.incompatible : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={id}
        ref={(el) => {
          if (el) slotRefs.current.set(id, el);
          else slotRefs.current.delete(id);
        }}
        className={classes}
        draggable={!!item}
        onDragStart={handleDragStart(src)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver(src)}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop(src)}
        onMouseEnter={handleMouseEnter(src, item)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick(src, item)}
        onContextMenu={handleContextMenu(src, item)}
      >
        {item ? (
          <>
            <span className={styles.itemName}>{item.name}</span>
            {item.stackable && item.stack !== undefined && item.stack > 1 && (
              <span className={styles.stackBadge}>{item.stack}</span>
            )}
          </>
        ) : (
          label && <span className={styles.slotLabel}>{label}</span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={styles.card}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Equipado</h2>
          <div className={styles.equippedGrid}>
            {PAPER_DOLL_ORDER.map((slot, i) =>
              slot
                ? renderSlot(equipped[slot], { kind: 'equipped', slot }, EQUIP_SLOT_LABEL[slot])
                : <div key={`gap-${i}`} className={styles.slotGap} aria-hidden />,
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Inventário</h2>
          <div className={styles.inventoryGrid}>
            {Array.from({ length: INVENTORY_SIZE }).map((_, idx) =>
              renderSlot(inventory[idx], { kind: 'inventory', index: idx }),
            )}
          </div>
        </section>
      </div>

      {/* Tooltip do item (não aparece durante drag) */}
      {tooltip && !dragSource && (
        <ItemTooltip item={tooltip.item} position={{ left: tooltip.left, top: tooltip.top }} />
      )}
    </>
  );
}

// Header do modal — espelha o padrão da CharacterSheet
interface InventoryHeaderProps {
  character: Character;
  onClose: () => void;
}

export function InventoryHeader({ character, onClose }: InventoryHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Inventário</div>
        <div className={styles.subtitle}>
          {character.name} · {character.classLabel}
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>I</span>
      </button>
    </div>
  );
}
