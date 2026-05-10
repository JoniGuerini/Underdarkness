import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Character, Item } from '../../types';
import { getShopForNpc, type ShopEntry } from '../../data/shops';
import { addItemToInventory, getSellPrice, removeOneAtSlot } from '../../lib/inventory';
import { ItemTooltipInline } from '../ItemTooltip/ItemTooltip';
import styles from './ShopPane.module.css';

interface ShopPaneProps {
  npcId: string;
  character: Character;
  onUpdate: (next: Character) => void;
}

/**
 * UI da loja — duas colunas: Comprar (estoque do NPC) e Vender (inventário do
 * jogador). Click direto compra/vende uma unidade. Hover mostra tooltip do item
 * via portal pra que possa ultrapassar os limites do modal.
 */
export function ShopPane({ npcId, character, onUpdate }: ShopPaneProps) {
  const stock = getShopForNpc(npcId) ?? [];

  // Filtra inventário pra slots não-vazios, mantendo o índice original pra remover certo.
  const sellable = character.inventory
    .map((item, idx) => ({ item, idx }))
    .filter((e): e is { item: Item; idx: number } => e.item !== null);

  const handleBuy = (entry: ShopEntry) => {
    if (character.gold < entry.price) return;
    const { inventory, added } = addItemToInventory(character.inventory, entry.item);
    if (!added) return; // inventário cheio — feedback visual via desabilitar é via state
    onUpdate({
      ...character,
      gold: character.gold - entry.price,
      inventory,
    });
  };

  const handleSell = (slotIdx: number) => {
    const item = character.inventory[slotIdx];
    if (!item) return;
    const price = getSellPrice(item);
    onUpdate({
      ...character,
      gold: character.gold + price,
      inventory: removeOneAtSlot(character.inventory, slotIdx),
    });
  };

  const inventoryFull = !character.inventory.some((i) => i === null);

  return (
    <div className={styles.shop}>
      <div className={styles.shopHeader}>
        <span className={styles.goldLabel}>Ouro</span>
        <span className={styles.goldValue}>{character.gold}</span>
        {inventoryFull && (
          <span className={styles.warning}>Inventário cheio</span>
        )}
      </div>

      <div className={styles.columns}>
        <ShopColumn title="Comprar" subtitle={`${stock.length} ${stock.length === 1 ? 'item' : 'itens'}`}>
          {stock.length === 0 ? (
            <p className={styles.empty}>Estoque vazio.</p>
          ) : (
            stock.map((entry, i) => (
              <ShopRow
                key={i}
                item={entry.item}
                price={entry.price}
                disabled={character.gold < entry.price || inventoryFull}
                onClick={() => handleBuy(entry)}
                action="buy"
              />
            ))
          )}
        </ShopColumn>

        <ShopColumn title="Vender" subtitle={`${sellable.length} no inventário`}>
          {sellable.length === 0 ? (
            <p className={styles.empty}>Nada para vender.</p>
          ) : (
            sellable.map(({ item, idx }) => (
              <ShopRow
                key={idx}
                item={item}
                price={getSellPrice(item)}
                onClick={() => handleSell(idx)}
                action="sell"
              />
            ))
          )}
        </ShopColumn>
      </div>
    </div>
  );
}

// ============================================================================
// ShopColumn — wrapper de cada lado (Comprar / Vender)
// ============================================================================
interface ShopColumnProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function ShopColumn({ title, subtitle, children }: ShopColumnProps) {
  return (
    <section className={styles.column}>
      <header className={styles.columnHeader}>
        <h3 className={styles.columnTitle}>{title}</h3>
        <span className={styles.columnSub}>{subtitle}</span>
      </header>
      <div className={styles.columnBody}>{children}</div>
    </section>
  );
}

// ============================================================================
// ShopRow — uma linha clicável com tooltip on hover
// ============================================================================
interface ShopRowProps {
  item: Item;
  price: number;
  disabled?: boolean;
  onClick: () => void;
  action: 'buy' | 'sell';
}

function ShopRow({ item, price, disabled, onClick, action }: ShopRowProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);

  const handleEnter = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const TT_WIDTH = 300;
    let left = r.right + 12;
    if (left + TT_WIDTH > window.innerWidth - 8) left = r.left - 12 - TT_WIDTH;
    if (left < 8) left = 8;
    setTooltipPos({ left, top: r.top });
  };
  const handleLeave = () => setTooltipPos(null);

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={`${styles.row} ${styles[`rarity_${item.rarity}`]} ${disabled ? styles.rowDisabled : ''}`}
        onClick={onClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        disabled={disabled}
      >
        <span className={styles.rowName}>
          {item.name}
          {item.stackable && (item.stack ?? 1) > 1 && (
            <span className={styles.rowStack}> ×{item.stack}</span>
          )}
        </span>
        <span className={`${styles.rowPrice} ${action === 'sell' ? styles.rowPriceSell : ''}`}>
          {price}
          <span className={styles.rowPriceCoin}>g</span>
        </span>
      </button>

      {tooltipPos &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: tooltipPos.left,
              top: tooltipPos.top,
              zIndex: 1100,
              pointerEvents: 'none',
              maxWidth: 300,
            }}
          >
            <ItemTooltipInline item={item} />
          </div>,
          document.body,
        )}
    </>
  );
}
