import { Fragment } from 'react';
import { createPortal } from 'react-dom';
import type { Item } from '../../types';
import { ITEM_SLOT_LABEL, RARITY_LABEL } from '../../data/items';
import { getMaterialType, MATERIAL_TYPE_SINGULAR, MATERIAL_TYPE_COLOR, REAGENT_GROUP_LABEL } from '../../data/materials';
import { getSellPrice } from '../../lib/inventory';
import { getStatSegments } from '../../lib/statSegments';
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
      <ItemTooltipBody item={item} />
    </div>,
    document.body,
  );
}

/**
 * Renderiza o tooltip de item inline (sem portal, sem position fixed) — usado
 * em contextos que não são hover (ex: preview da Forja). Chama `inline` no
 * className do wrapper externo pra desativar o offset/animação do hover.
 */
export function ItemTooltipInline({ item }: { item: Item }) {
  return (
    <div className={`${styles.tooltip} ${styles.inline} ${styles[item.rarity]}`}>
      <ItemTooltipBody item={item} />
    </div>
  );
}

function ItemTooltipBody({ item }: { item: Item }) {
  const materialType = getMaterialType(item.id);
  return (
    <>
      <div className={styles.header}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.meta}>
          <span className={styles.rarity}>{RARITY_LABEL[item.rarity]}</span>
          {materialType && (
            <>
              <span className={styles.metaSep}>·</span>
              <span className={styles.reagentGroup}>{REAGENT_GROUP_LABEL}</span>
              <span className={styles.metaSep}>·</span>
              <span className={styles.reagentType} style={{ color: MATERIAL_TYPE_COLOR[materialType] }}>
                {MATERIAL_TYPE_SINGULAR[materialType]}
              </span>
            </>
          )}
          {item.slot && (
            <>
              <span className={styles.metaSep}>·</span>
              <span className={styles.slotLabel}>{ITEM_SLOT_LABEL[item.slot]}</span>
            </>
          )}
          {item.ilvl !== undefined && (
            <>
              <span className={styles.metaSep}>·</span>
              <span className={styles.slotLabel}>Nv Item {item.ilvl}</span>
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
          {item.stats.map((stat, i) => {
            // Insere divisória sempre que `kind` muda entre stats consecutivos.
            // Stats sem `kind` (mocks antigos) renderizam como linha plana.
            const prev = item.stats![i - 1];
            const showDivider = i > 0 && prev?.kind !== undefined && stat.kind !== undefined && prev.kind !== stat.kind;
            const segments = getStatSegments(stat);
            return (
              <Fragment key={i}>
                {showDivider && <div className={styles.statDivider} />}
                {segments ? (
                  <span className={styles.stat}>
                    {segments.map((seg, j) => (
                      <span key={j} className={seg.color ? styles[seg.color] : ''}>
                        {seg.text}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className={`${styles.stat} ${stat.color ? styles[stat.color] : ''}`}>
                    {stat.text}
                  </span>
                )}
              </Fragment>
            );
          })}
        </div>
      )}

      {item.description && <div className={styles.description}>{item.description}</div>}

      <div className={styles.sellValue}>
        <span className={styles.sellValueLabel}>Venda</span>
        <span className={styles.sellValueGold}>{getSellPrice(item)} ouro</span>
      </div>
    </>
  );
}
