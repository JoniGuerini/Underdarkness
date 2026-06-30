import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Character, Item } from '../../types';
import {
  INITIAL_MARKET_LISTINGS,
  MARKET_CATEGORY_LABEL,
  MARKET_CATEGORY_ORDER,
  cloneItemForTrade,
  formatListedAge,
  listingMatchesCategory,
  listingMatchesSearch,
  suggestListPrice,
  type MarketCategory,
  type MarketListing,
} from '../../data/market';
import { CLASS_COLOR_VAR } from '../../data/social';
import { addItemToInventory, removeOneAtSlot } from '../../lib/inventory';
import { ItemTooltipInline } from '../ItemTooltip/ItemTooltip';
import styles from './MercadoView.module.css';

type MercadoSection = 'comprar' | 'vender' | 'minhas';

const SECTIONS: { id: MercadoSection; label: string }[] = [
  { id: 'comprar', label: 'Comprar' },
  { id: 'vender', label: 'Vender' },
  { id: 'minhas', label: 'Minhas Listagens' },
];

type SortKey = 'preco-asc' | 'preco-desc' | 'tempo-asc';

interface MercadoViewProps {
  character: Character;
  onUpdate: (character: Character) => void;
}

export function MercadoView({ character, onUpdate }: MercadoViewProps) {
  const [active, setActive] = useState<MercadoSection>('comprar');
  const [listings, setListings] = useState<MarketListing[]>(() => [...INITIAL_MARKET_LISTINGS]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MarketCategory>('todos');
  const [sort, setSort] = useState<SortKey>('tempo-asc');
  const [notice, setNotice] = useState<string | null>(null);

  const myListings = useMemo(
    () => listings.filter((l) => l.isPlayer),
    [listings],
  );

  const browseListings = useMemo(() => {
    const q = search;
    const filtered = listings.filter(
      (l) =>
        !l.isPlayer &&
        listingMatchesSearch(l, q) &&
        listingMatchesCategory(l, category),
    );
    return filtered.sort((a, b) => {
      if (sort === 'preco-asc') return a.price - b.price;
      if (sort === 'preco-desc') return b.price - a.price;
      return a.listedMinutesAgo - b.listedMinutesAgo;
    });
  }, [listings, search, category, sort]);

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 2400);
  };

  const handleBuy = (listing: MarketListing) => {
    if (character.gold < listing.price) {
      showNotice('Ouro insuficiente.');
      return;
    }
    const item = cloneItemForTrade(listing.item, 'market-buy');
    const { inventory, added } = addItemToInventory(character.inventory, item);
    if (!added) {
      showNotice('Inventário cheio.');
      return;
    }
    onUpdate({
      ...character,
      gold: character.gold - listing.price,
      inventory,
    });
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    showNotice(`Comprou ${listing.item.name} por ${listing.price}g.`);
  };

  const handleListItem = (slotIdx: number, price: number) => {
    const item = character.inventory[slotIdx];
    if (!item || price <= 0) return;
    const listing: MarketListing = {
      id: `player-${Date.now()}`,
      seller: character.name,
      sellerClassKey: character.classKey,
      item: cloneItemForTrade(item, 'market-list'),
      price,
      listedMinutesAgo: 0,
      isPlayer: true,
    };
    onUpdate({
      ...character,
      inventory: removeOneAtSlot(character.inventory, slotIdx),
    });
    setListings((prev) => [listing, ...prev]);
    showNotice(`${item.name} listado por ${price}g.`);
  };

  const handleCancelListing = (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing?.isPlayer) return;
    const { inventory, added } = addItemToInventory(character.inventory, listing.item);
    if (!added) {
      showNotice('Inventário cheio — libere um slot antes de cancelar.');
      return;
    }
    onUpdate({ ...character, inventory });
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    showNotice('Listagem cancelada — item devolvido ao inventário.');
  };

  return (
    <div className={styles.root}>
      <header className={styles.toolbar}>
        <div className={styles.goldBlock}>
          <span className={styles.goldLabel}>Ouro</span>
          <span className={styles.goldValue}>{character.gold}g</span>
        </div>
        <span className={styles.toolbarMeta}>
          {listings.length} {listings.length === 1 ? 'listagem' : 'listagens'} ativas
        </span>
      </header>

      {notice && <div className={styles.notice}>{notice}</div>}

      <nav className={styles.sectionTabs}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.sectionTab} ${active === s.id ? styles.sectionTabActive : ''}`}
            onClick={() => setActive(s.id)}
          >
            {s.label}
            {s.id === 'minhas' && myListings.length > 0 && (
              <span className={styles.sectionTabBadge}>{myListings.length}</span>
            )}
          </button>
        ))}
      </nav>

      <div className={styles.sectionBody} key={active}>
        {active === 'comprar' && (
          <BrowsePane
            listings={browseListings}
            search={search}
            category={category}
            sort={sort}
            gold={character.gold}
            inventoryFull={!character.inventory.some((i) => i === null)}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onSortChange={setSort}
            onBuy={handleBuy}
          />
        )}
        {active === 'vender' && (
          <SellPane character={character} onList={handleListItem} />
        )}
        {active === 'minhas' && (
          <MyListingsPane listings={myListings} onCancel={handleCancelListing} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Comprar
// ============================================================================

interface BrowsePaneProps {
  listings: MarketListing[];
  search: string;
  category: MarketCategory;
  sort: SortKey;
  gold: number;
  inventoryFull: boolean;
  onSearchChange: (v: string) => void;
  onCategoryChange: (c: MarketCategory) => void;
  onSortChange: (s: SortKey) => void;
  onBuy: (listing: MarketListing) => void;
}

function BrowsePane({
  listings,
  search,
  category,
  sort,
  gold,
  inventoryFull,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onBuy,
}: BrowsePaneProps) {
  return (
    <div className={styles.browse}>
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchLabel}>Buscar</span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nome do item ou vendedor…"
            className={styles.searchInput}
          />
        </div>
        <div className={styles.sortWrap}>
          <span className={styles.sortLabel}>Ordenar</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className={styles.sortSelect}
          >
            <option value="tempo-asc">Mais recentes</option>
            <option value="preco-asc">Menor preço</option>
            <option value="preco-desc">Maior preço</option>
          </select>
        </div>
      </div>

      <div className={styles.categoryRow}>
        {MARKET_CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.categoryChip} ${category === cat ? styles.categoryChipActive : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {MARKET_CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      <div className={styles.listHeader}>
        <span>Item</span>
        <span>Vendedor</span>
        <span>Preço</span>
        <span>Listado</span>
        <span />
      </div>

      <div className={styles.listBody}>
        {listings.length === 0 ? (
          <div className={styles.listEmpty}>Nenhuma listagem neste filtro.</div>
        ) : (
          listings.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              disabled={gold < listing.price || inventoryFull}
              disabledReason={
                inventoryFull ? 'Inventário cheio' : gold < listing.price ? 'Ouro insuficiente' : undefined
              }
              actionLabel="Comprar"
              onAction={() => onBuy(listing)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Vender
// ============================================================================

interface SellPaneProps {
  character: Character;
  onList: (slotIdx: number, price: number) => void;
}

function SellPane({ character, onList }: SellPaneProps) {
  const sellable = character.inventory
    .map((item, idx) => ({ item, idx }))
    .filter((e): e is { item: Item; idx: number } => e.item !== null);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(sellable[0]?.idx ?? null);
  const [price, setPrice] = useState('');

  const selected = sellable.find((e) => e.idx === selectedIdx) ?? null;

  const handleSelect = (idx: number, item: Item) => {
    setSelectedIdx(idx);
    setPrice(String(suggestListPrice(item)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIdx === null) return;
    const parsed = parseInt(price, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onList(selectedIdx, parsed);
    setSelectedIdx(null);
    setPrice('');
  };

  return (
    <div className={styles.sellSplit}>
      <aside className={styles.sellList}>
        <div className={styles.sellListHeader}>
          <span className={styles.sellListTitle}>Inventário</span>
          <span className={styles.sellListHint}>{sellable.length} itens</span>
        </div>
        {sellable.length === 0 ? (
          <div className={styles.listEmpty}>Nada para listar.</div>
        ) : (
          <ul className={styles.sellEntries}>
            {sellable.map(({ item, idx }) => (
              <li key={idx}>
                <button
                  type="button"
                  className={`${styles.sellEntry} ${idx === selectedIdx ? styles.sellEntryActive : ''} ${styles[`rarity_${item.rarity}`]}`}
                  onClick={() => handleSelect(idx, item)}
                >
                  <span className={styles.sellEntryName}>{item.name}</span>
                  {item.stackable && (item.stack ?? 1) > 1 && (
                    <span className={styles.sellEntryStack}>×{item.stack}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className={styles.sellDetail}>
        {selected ? (
          <form className={styles.sellForm} onSubmit={handleSubmit}>
            <div className={styles.sellPreview}>
              <ItemTooltipInline item={selected.item} />
            </div>
            <div className={styles.sellFields}>
              <label className={styles.sellField}>
                <span className={styles.sellFieldLabel}>Preço de venda</span>
                <div className={styles.priceInputWrap}>
                  <input
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={styles.priceInput}
                  />
                  <span className={styles.priceSuffix}>g</span>
                </div>
              </label>
              <p className={styles.sellHint}>
                Sugestão baseada na raridade. Taxa de leilão ainda não implementada.
              </p>
              <button type="submit" className={`btn-primary ${styles.sellSubmit}`}>
                Listar no Mercado
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.sellEmpty}>Selecione um item do inventário.</div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// Minhas listagens
// ============================================================================

function MyListingsPane({
  listings,
  onCancel,
}: {
  listings: MarketListing[];
  onCancel: (id: string) => void;
}) {
  return (
    <div className={styles.myListings}>
      <p className={styles.myListingsIntro}>
        Itens que você colocou à venda. Cancelar devolve o item ao inventário se houver espaço.
      </p>
      <div className={styles.listHeader}>
        <span>Item</span>
        <span>Vendedor</span>
        <span>Preço</span>
        <span>Listado</span>
        <span />
      </div>
      <div className={styles.listBody}>
        {listings.length === 0 ? (
          <div className={styles.listEmpty}>Você não tem listagens ativas.</div>
        ) : (
          listings.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              actionLabel="Cancelar"
              onAction={() => onCancel(listing.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Linha de listagem compartilhada
// ============================================================================

interface ListingRowProps {
  listing: MarketListing;
  disabled?: boolean;
  disabledReason?: string;
  actionLabel: string;
  onAction: () => void;
}

function ListingRow({ listing, disabled, disabledReason, actionLabel, onAction }: ListingRowProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);

  const handleEnter = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const TT_WIDTH = 320;
    let left = r.right + 12;
    if (left + TT_WIDTH > window.innerWidth - 8) left = r.left - 12 - TT_WIDTH;
    if (left < 8) left = 8;
    setTooltipPos({ left, top: r.top });
  };
  const handleLeave = () => setTooltipPos(null);

  return (
    <>
      <div className={styles.listRow}>
        <button
          ref={ref}
          type="button"
          className={`${styles.rowItemBtn} ${styles[`rarity_${listing.item.rarity}`]}`}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {listing.item.name}
          {listing.item.stackable && (listing.item.stack ?? 1) > 1 && (
            <span className={styles.rowStack}> ×{listing.item.stack}</span>
          )}
        </button>
        <span
          className={styles.rowSeller}
          style={{ color: CLASS_COLOR_VAR[listing.sellerClassKey] }}
        >
          {listing.seller}
          {listing.isPlayer && <span className={styles.rowYou}> (você)</span>}
        </span>
        <span className={styles.rowPrice}>
          {listing.price}
          <span className={styles.rowPriceCoin}>g</span>
        </span>
        <span className={styles.rowAge}>{formatListedAge(listing.listedMinutesAgo)}</span>
        <button
          type="button"
          className={`btn-secondary ${styles.rowAction}`}
          onClick={onAction}
          disabled={disabled}
          title={disabledReason}
        >
          {actionLabel}
        </button>
      </div>
      {tooltipPos &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: tooltipPos.left,
              top: tooltipPos.top,
              zIndex: 1100,
              pointerEvents: 'none',
              maxWidth: 320,
            }}
          >
            <ItemTooltipInline item={listing.item} />
          </div>,
          document.body,
        )}
    </>
  );
}

// ============================================================================
// Header do modal
// ============================================================================

interface MercadoHeaderProps {
  character: Character;
  onClose: () => void;
  shortcut?: string;
}

export function MercadoHeader({ character, onClose, shortcut = 'L' }: MercadoHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Mercado</div>
        <div className={styles.subtitle}>
          {character.name} · {character.gold}g · Casa de leilões de Pedragal
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
