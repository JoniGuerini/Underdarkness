import { createPortal } from 'react-dom';
import type { Item } from '../../types';
import { ITEM_SLOT_LABEL, RARITY_LABEL } from '../../data/items';
import styles from './ItemTooltip.module.css';

interface ItemTooltipProps {
  item: Item;
  /** Coordenadas viewport-relative (do getBoundingClientRect do slot). */
  position: { left: number; top: number };
}

export function ItemTooltip({ item, position }: ItemTooltipProps) {
  return createPortal(
    <div
      className={`${styles.tooltip} ${styles[item.rarity]}`}
      style={{ left: position.left, top: position.top }}
    >
      <div className={styles.header}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.meta}>
          <span className={styles.rarity}>{RARITY_LABEL[item.rarity]}</span>
          {item.slot && (
            <>
              <span className={styles.metaSep}>·</span>
              <span className={styles.slotLabel}>{ITEM_SLOT_LABEL[item.slot]}</span>
            </>
          )}
          {item.stackable && item.stack !== undefined && (
            <>
              <span className={styles.metaSep}>·</span>
              <span className={styles.stackLabel}>×{item.stack}</span>
            </>
          )}
        </div>
      </div>

      {item.stats && item.stats.length > 0 && (
        <div className={styles.stats}>
          {item.stats.map((stat, i) => (
            <span
              key={i}
              className={`${styles.stat} ${stat.color ? styles[stat.color] : ''}`}
            >
              {stat.text}
            </span>
          ))}
        </div>
      )}

      {item.description && <div className={styles.description}>{item.description}</div>}
    </div>,
    document.body,
  );
}
