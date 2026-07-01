import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Character, Item, ItemSlot, ItemStat, Rarity } from '../../types';
import { getSpellById, type Spell, type ElementKey } from '../../data/spells';
import { getSummonSpellById, getMinionById, type SummonSpell } from '../../data/summons';
import {
  ALL_ENEMY_DEFS,
  getAreaEnemyLevelRange,
  getEnemyAcerto,
  getEnemyCritChance,
  getEnemyCritMult,
  getEnemySpawnLocations,
  getEnemyVelAtaque,
  getItemDropSources,
  spawnEnemy,
  type Enemy,
} from '../../data/enemies';
import { ACTS, getLocationById } from '../../data/world';
import {
  MATERIALS,
  MATERIAL_TYPE_LABEL,
  MATERIAL_TYPE_SINGULAR,
  MATERIAL_TYPE_COLOR,
  REAGENT_GROUP_LABEL,
  getMaterial,
  getMaterialName,
  getMaterialType,
  type MaterialType,
} from '../../data/materials';
import { ITEM_SLOT_LABEL } from '../../data/items';
import { getItemShopSources } from '../../data/shops';
import {
  ITEM_MODS,
  MOD_GROUP_LABEL,
  MOD_GROUP_ORDER,
  rollMod,
  type ItemModDef,
  type ModCategory,
  type ModGroup,
} from '../../data/itemMods';
import {
  ITEM_BASES,
  WEAPON_TYPE_LABEL,
  ARMOR_TYPE_LABEL,
  BELT_TYPE_LABEL,
  RING_TYPE_LABEL,
  AMULET_TYPE_LABEL,
  ALJAVA_TYPE_LABEL,
  makeBaseItem,
  type ItemBase,
  type WeaponType,
  type ArmorType,
  type BeltType,
  type RingType,
  type AmuletType,
  type AljavaType,
} from '../../data/itemBases';
import { ItemTooltipInline } from '../ItemTooltip/ItemTooltip';
import { StatLine, Unit } from '../StatLine/StatLine';
import { RarityGuide } from './RarityGuide';
import styles from './CodexView.module.css';

type CodexSection = 'itens' | 'mods' | 'raridade' | 'forja' | 'bestiario';

const SECTIONS: { id: CodexSection; label: string }[] = [
  { id: 'itens', label: 'Itens' },
  { id: 'mods', label: 'Mods de Item' },
  { id: 'raridade', label: 'Raridade' },
  { id: 'forja', label: 'Forja' },
  { id: 'bestiario', label: 'Bestiário' },
];

interface CodexViewProps {
  character: Character;
}

export function CodexView({ character: _character }: CodexViewProps) {
  const [active, setActive] = useState<CodexSection>('itens');

  return (
    <div className={styles.root}>
      <nav className={styles.sectionTabs}>
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`${styles.sectionTab} ${isActive ? styles.sectionTabActive : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className={styles.sectionBody} key={active}>
        {active === 'itens' && <ItemsView />}
        {active === 'mods' && <ModsList />}
        {active === 'raridade' && <RarityGuide />}
        {active === 'forja' && <ForgeView />}
        {active === 'bestiario' && <BestiaryView />}
      </div>
    </div>
  );
}

// ============================================================================
// MODS DE ITEM — lista de prefixos e sufixos
// ============================================================================
function ModsList() {
  const prefixes = ITEM_MODS.filter((m) => m.category === 'prefix');
  const suffixes = ITEM_MODS.filter((m) => m.category === 'suffix');

  return (
    <>
      <header className={styles.intro}>
        <h2 className={styles.introTitle}>Mods de Item</h2>
        <p className={styles.introText}>
          Lista mestra dos modificadores que podem aparecer em itens gerados. <strong>Prefixos</strong> aparecem antes do nome base do item; <strong>Sufixos</strong> aparecem depois ("do/da"). A separação segue a convenção de Path of Exile — prefixos concedem poder bruto, sufixos qualificam o personagem.
        </p>
      </header>

      <div className={styles.split}>
        <ModColumn title="Prefixos" subtitle="Aparecem antes do nome base" mods={prefixes} category="prefix" />
        <ModColumn title="Sufixos" subtitle="Aparecem depois do nome base" mods={suffixes} category="suffix" />
      </div>
    </>
  );
}

interface ModColumnProps {
  title: string;
  subtitle: string;
  mods: ItemModDef[];
  category: ModCategory;
}

function ModColumn({ title, subtitle, mods, category }: ModColumnProps) {
  const grouped = groupMods(mods);
  return (
    <section className={styles.column}>
      <header className={styles.columnHeader}>
        <h3 className={`${styles.columnTitle} ${styles[`title_${category}`]}`}>{title}</h3>
        <span className={styles.columnCount}>{mods.length}</span>
        <span className={styles.columnSubtitle}>{subtitle}</span>
      </header>

      <div className={styles.groups}>
        {MOD_GROUP_ORDER.filter((g) => grouped[g]?.length).map((group) => (
          <div key={group} className={styles.group}>
            <div className={styles.groupHeader}>{MOD_GROUP_LABEL[group]}</div>
            <ul className={styles.modList}>
              {grouped[group]!.map((mod) => (
                <li key={mod.id} className={styles.modRow}>
                  <span className={`${styles.modLabel} ${styles[`color_${mod.color}`]}`}>
                    {mod.label}
                  </span>
                  <span className={styles.modDesc}>{mod.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function groupMods(mods: ItemModDef[]): Partial<Record<ModGroup, ItemModDef[]>> {
  const out: Partial<Record<ModGroup, ItemModDef[]>> = {};
  for (const mod of mods) {
    if (!out[mod.group]) out[mod.group] = [];
    out[mod.group]!.push(mod);
  }
  return out;
}

// ============================================================================
// ITENS — base de dados de equipamentos e materiais, com origem de drop
// ============================================================================

interface CatalogEntry {
  id: string;
  name: string;
  /** Item completo (pro tooltip). */
  item: Item;
  /** Texto curto de categoria (ex: nível requerido, slot ou "Material"). */
  meta: string;
  /** Nível requerido (equipamentos). */
  reqLevel?: number;
  /** Rótulo da classe/categoria (ex: "Espadas de Uma Mão"). */
  typeLabel?: string;
  /** Magia concedida (armas mágicas). */
  grantedSpellId?: string;
  /** Magia de invocação concedida (cetros). */
  grantedSummonId?: string;
  /** Sub-seção dentro da grade (ex: tipo defensivo da armadura). */
  sectionLabel?: string;
}

interface CatalogCategory {
  id: string;
  /** Rótulo na sidebar (ex: "Espadas"). */
  label: string;
  /** Título no topo da grade (ex: "Espadas de Uma Mão"). Default = label. */
  title?: string;
  /** Cabeçalho de topo na sidebar (ex: "Armas", "Armaduras"). */
  group: string;
  /** Sub-cabeçalho opcional (ex: "De Uma Mão", "Duas Mãos"). */
  subgroup?: string;
  entries: CatalogEntry[];
}

/** Famílias de arma — definem o rótulo (Espadas, Machados...) de cada tipo. */
const WEAPON_FAMILIES: { family: string; types: WeaponType[] }[] = [
  { family: 'Espadas', types: ['espada-uma-mao', 'espada-duas-maos'] },
  { family: 'Machados', types: ['machado-uma-mao', 'machado-duas-maos'] },
  { family: 'Maças', types: ['maca-uma-mao', 'maca-duas-maos'] },
  { family: 'Adagas', types: ['adaga-uma-mao'] },
  { family: 'Lanças', types: ['lanca'] },
  { family: 'Alabardas', types: ['alabarda'] },
  { family: 'Foices', types: ['foice'] },
  { family: 'Arcos', types: ['arco'] },
  { family: 'Bestas', types: ['besta'] },
  { family: 'Varinhas', types: ['varinha'] },
  { family: 'Cetros', types: ['cetro'] },
  { family: 'Cajados', types: ['cajado'] },
];

/** Slots de armadura (com tipos defensivos), na ordem da sidebar. */
const ARMOR_SLOTS: { slot: ItemSlot; label: string }[] = [
  { slot: 'cabeca', label: 'Elmos' },
  { slot: 'peito', label: 'Peitorais' },
  { slot: 'maos', label: 'Luvas' },
  { slot: 'pes', label: 'Botas' },
  { slot: 'escudo', label: 'Escudos' },
];

const ARMOR_TYPE_ORDER: ArmorType[] = [
  'armadura',
  'evasao',
  'escudo-energia',
  'armadura-evasao',
  'armadura-energia',
  'evasao-energia',
];

const BELT_TYPE_ORDER: BeltType[] = [
  'vida',
  'mana',
  'forca',
  'armadura',
  'escudo-energia',
  'dano-fisico',
];

const RING_TYPE_ORDER: RingType[] = [
  'vida',
  'mana',
  'res-fogo',
  'res-gelo',
  'res-raio',
  'res-caos',
  'dano-fisico',
];

const AMULET_TYPE_ORDER: AmuletType[] = [
  'vida',
  'mana',
  'forca',
  'agilidade',
  'intelecto',
  'todos-atributos',
  'escudo-energia',
];

const ALJAVA_TYPE_ORDER: AljavaType[] = ['dano-fisico', 'critico', 'vel-ataque', 'vida'];

const MATERIAL_TYPE_ORDER: MaterialType[] = ['erva', 'minerio', 'couro', 'tecido', 'carne', 'verdura', 'fruta'];


function baseToEntry(b: ItemBase): CatalogEntry {
  const typeLabel = b.weaponType
    ? WEAPON_TYPE_LABEL[b.weaponType]
    : b.armorType
      ? ARMOR_TYPE_LABEL[b.armorType]
      : ITEM_SLOT_LABEL[b.slot];
  return {
    id: b.id,
    name: b.name,
    item: makeBaseItem(b.id, 'codex'),
    meta: b.reqLevel != null ? `Nv ${b.reqLevel}` : ITEM_SLOT_LABEL[b.slot],
    reqLevel: b.reqLevel,
    typeLabel,
    grantedSpellId: b.grantedSpellId,
    grantedSummonId: b.grantedSummonId,
    sectionLabel: b.armorType
      ? ARMOR_TYPE_LABEL[b.armorType]
      : b.beltType
        ? BELT_TYPE_LABEL[b.beltType]
        : b.ringType
          ? RING_TYPE_LABEL[b.ringType]
          : b.amuletType
            ? AMULET_TYPE_LABEL[b.amuletType]
            : b.aljavaType
              ? ALJAVA_TYPE_LABEL[b.aljavaType]
              : cajadoElement(b)
                ? ELEMENT_LABEL[cajadoElement(b)!]
                : undefined,
  };
}

/** Elemento da magia concedida por um cajado (pra seccionar por elemento). */
function cajadoElement(b: ItemBase): ElementKey | undefined {
  if (b.weaponType !== 'cajado' || !b.grantedSpellId) return undefined;
  return getSpellById(b.grantedSpellId)?.element;
}

const CAJADO_ELEMENT_ORDER: ElementKey[] = ['fogo', 'gelo', 'raio', 'sagrado', 'caos'];

const ELEMENT_LABEL: Record<ElementKey, string> = {
  fogo: 'Fogo',
  gelo: 'Gelo',
  raio: 'Raio',
  caos: 'Caos',
  sagrado: 'Sagrado',
};

/** Nomes de dano por elemento — idênticos aos da ficha do personagem. */
const DAMAGE_LABEL: Record<ElementKey, string> = {
  fogo: 'Dano de Fogo',
  gelo: 'Dano de Gelo',
  raio: 'Dano de Raio',
  caos: 'Dano de Caos',
  sagrado: 'Dano Sagrado',
};

/** Tipos de duas mãos cujo id não contém "duas". */
const TWO_HANDED_TYPES: WeaponType[] = ['cajado', 'alabarda', 'foice', 'besta'];

/** Subgrupo (mão) de um tipo de arma. */
const handSubgroup = (wt: WeaponType): string => {
  if (TWO_HANDED_TYPES.includes(wt) || wt.includes('duas')) return 'Duas Mãos';
  return 'De Uma Mão';
};

const byReqLevel = (a: ItemBase, b: ItemBase) => (a.reqLevel ?? 0) - (b.reqLevel ?? 0);

// Ordem das mãos dentro de "Armas".
const HAND_ORDER = ['De Uma Mão', 'Duas Mãos'];

function buildCatalog(): CatalogCategory[] {
  const cats: CatalogCategory[] = [];

  // Armas — grupo "Armas", subgrupos por mão (De Uma Mão / Duas Mãos),
  // listando os tipos de arma (Espadas, Machados, Maças, Adagas, Lanças, Cajados).
  const weaponCats: CatalogCategory[] = [];
  for (const fam of WEAPON_FAMILIES) {
    for (const wt of fam.types) {
      const bases = ITEM_BASES.filter((b) => b.slot === 'arma' && b.weaponType === wt);
      if (wt === 'cajado') {
        // Cajados: ordena por elemento (pra seccionar) e depois por nível.
        bases.sort((x, y) => {
          const ex = CAJADO_ELEMENT_ORDER.indexOf(cajadoElement(x) ?? 'fogo');
          const ey = CAJADO_ELEMENT_ORDER.indexOf(cajadoElement(y) ?? 'fogo');
          return ex - ey || (x.reqLevel ?? 0) - (y.reqLevel ?? 0);
        });
      } else {
        bases.sort(byReqLevel);
      }
      if (bases.length > 0) {
        weaponCats.push({
          id: wt,
          label: fam.family,
          title: WEAPON_TYPE_LABEL[wt],
          group: 'Armas',
          subgroup: handSubgroup(wt),
          entries: bases.map(baseToEntry),
        });
      }
    }
  }
  // Ordena por mão (Uma Mão antes de Duas Mãos), mantendo a ordem das famílias.
  weaponCats.sort((a, b) => HAND_ORDER.indexOf(a.subgroup!) - HAND_ORDER.indexOf(b.subgroup!));
  cats.push(...weaponCats);

  // Armaduras — grupo "Armaduras", uma categoria por slot (Peitorais, Elmos...).
  // As entradas ficam ordenadas por tipo defensivo (e nível) pra a grade agrupar em seções.
  for (const s of ARMOR_SLOTS) {
    const slotBases = ITEM_BASES.filter((b) => b.slot === s.slot);
    if (slotBases.length === 0) continue;
    const typed = slotBases.filter((b) => b.armorType);
    let entries: CatalogEntry[];
    if (typed.length > 0) {
      entries = [];
      for (const t of ARMOR_TYPE_ORDER) {
        entries.push(...typed.filter((b) => b.armorType === t).sort(byReqLevel).map(baseToEntry));
      }
      entries.push(...slotBases.filter((b) => !b.armorType).sort(byReqLevel).map(baseToEntry));
    } else {
      entries = slotBases.sort(byReqLevel).map(baseToEntry);
    }
    cats.push({ id: s.slot, label: s.label, group: 'Armaduras', entries });
  }

  // Cintos — categoria única, entradas ordenadas por tipo (implícito) pra a grade seccionar.
  const belts = ITEM_BASES.filter((b) => b.slot === 'cinto');
  if (belts.length > 0) {
    const entries: CatalogEntry[] = [];
    for (const bt of BELT_TYPE_ORDER) {
      entries.push(...belts.filter((b) => b.beltType === bt).sort(byReqLevel).map(baseToEntry));
    }
    entries.push(...belts.filter((b) => !b.beltType).sort(byReqLevel).map(baseToEntry));
    cats.push({ id: 'cinto', label: 'Cintos', group: 'Armaduras', entries });
  }

  // Anéis — categoria única, entradas ordenadas por tipo (implícito) pra a grade seccionar.
  const rings = ITEM_BASES.filter((b) => b.slot === 'anel');
  if (rings.length > 0) {
    const entries: CatalogEntry[] = [];
    for (const rt of RING_TYPE_ORDER) {
      entries.push(...rings.filter((b) => b.ringType === rt).sort(byReqLevel).map(baseToEntry));
    }
    entries.push(...rings.filter((b) => !b.ringType).sort(byReqLevel).map(baseToEntry));
    cats.push({ id: 'anel', label: 'Anéis', group: 'Acessórios', entries });
  }

  // Amuletos — categoria única, entradas ordenadas por tipo (implícito) pra a grade seccionar.
  const amulets = ITEM_BASES.filter((b) => b.slot === 'amuleto');
  if (amulets.length > 0) {
    const entries: CatalogEntry[] = [];
    for (const at of AMULET_TYPE_ORDER) {
      entries.push(...amulets.filter((b) => b.amuletType === at).sort(byReqLevel).map(baseToEntry));
    }
    entries.push(...amulets.filter((b) => !b.amuletType).sort(byReqLevel).map(baseToEntry));
    cats.push({ id: 'amuleto', label: 'Amuletos', group: 'Acessórios', entries });
  }

  // Aljavas — off-hand de arqueiro, seccionada por tipo (implícito).
  const quivers = ITEM_BASES.filter((b) => b.slot === 'aljava');
  if (quivers.length > 0) {
    const entries: CatalogEntry[] = [];
    for (const at of ALJAVA_TYPE_ORDER) {
      entries.push(...quivers.filter((b) => b.aljavaType === at).sort(byReqLevel).map(baseToEntry));
    }
    entries.push(...quivers.filter((b) => !b.aljavaType).sort(byReqLevel).map(baseToEntry));
    cats.push({ id: 'aljava', label: 'Aljavas', group: 'Armaduras', entries });
  }

  // Materiais — grupo "Materiais", uma categoria por tipo (Ervas, Minérios...).
  const materialDefs = Object.values(MATERIALS);
  for (const mt of MATERIAL_TYPE_ORDER) {
    const defs = materialDefs
      .filter((d) => d.type === mt)
      .sort((a, b) => a.tier - b.tier);
    if (defs.length > 0) {
      cats.push({
        id: `mat-${mt}`,
        label: MATERIAL_TYPE_LABEL[mt],
        group: 'Reagentes de Criação',
        entries: defs.map((d) => ({
          id: d.item.id,
          name: d.item.name,
          item: getMaterial(d.item.id)!,
          meta: MATERIAL_TYPE_LABEL[mt],
          typeLabel: `${REAGENT_GROUP_LABEL} · ${MATERIAL_TYPE_SINGULAR[mt]}`,
        })),
      });
    }
  }
  return cats;
}

function actTitle(act: number): string {
  return ACTS.find((a) => a.num === act)?.title ?? `Ato ${act}`;
}

function ItemsView() {
  const categories = useMemo(buildCatalog, []);
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id ?? '');
  const active = categories.find((c) => c.id === selectedCat) ?? categories[0];

  // Agrupa em grupo → subgrupo → categorias, preservando a ordem de inserção.
  const groups = useMemo(() => {
    const map = new Map<string, Map<string, CatalogCategory[]>>();
    for (const c of categories) {
      if (!map.has(c.group)) map.set(c.group, new Map());
      const subs = map.get(c.group)!;
      const key = c.subgroup ?? '';
      if (!subs.has(key)) subs.set(key, []);
      subs.get(key)!.push(c);
    }
    return [...map.entries()].map(([group, subs]) => ({ group, subs: [...subs.entries()] }));
  }, [categories]);

  if (!active) return null;

  const renderCat = (cat: CatalogCategory) => (
    <li key={cat.id}>
      <button
        type="button"
        className={`${styles.dbCat} ${cat.id === active.id ? styles.dbCatActive : ''}`}
        onClick={() => setSelectedCat(cat.id)}
      >
        <span className={styles.dbCatLabel}>{cat.label}</span>
        <span className={styles.dbCatCount}>{cat.entries.length}</span>
      </button>
    </li>
  );

  return (
    <div className={styles.dbRoot}>
      <aside className={styles.dbSidebar}>
        {groups.map(({ group, subs }) => (
          <div key={group} className={styles.dbSection}>
            <div className={styles.dbSectionHeader}>{group}</div>
            {subs.map(([sub, cats]) => (
              <div key={sub || group} className={styles.dbSubgroup}>
                {sub && <div className={styles.dbSubHeader}>{sub}</div>}
                <ul className={styles.dbCatList}>{cats.map(renderCat)}</ul>
              </div>
            ))}
          </div>
        ))}
      </aside>

      <section className={styles.dbContent}>
        <div className={styles.dbContentHeader}>
          <h2 className={styles.dbContentTitle}>{active.title ?? active.label}</h2>
          <span className={styles.dbContentCount}>
            {active.entries.length} {active.entries.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
        <ContentBody entries={active.entries} />
      </section>
    </div>
  );
}

/** Corpo da grade — agrupa em seções por `sectionLabel` quando houver; senão, grade plana. */
function ContentBody({ entries }: { entries: CatalogEntry[] }) {
  const sections = useMemo(() => {
    const map = new Map<string, CatalogEntry[]>();
    let hasSections = false;
    for (const e of entries) {
      if (e.sectionLabel) hasSections = true;
      const key = e.sectionLabel ?? '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return { hasSections, groups: [...map.entries()] };
  }, [entries]);

  if (!sections.hasSections) {
    return (
      <div className={styles.dbGrid}>
        {entries.map((entry) => (
          <ItemCard key={entry.id} entry={entry} />
        ))}
      </div>
    );
  }

  return (
    <>
      {sections.groups.map(([label, es]) => (
        <div key={label || 'sem-tipo'} className={styles.dbTypeSection}>
          {label && (
            <div className={styles.dbTypeHeader}>
              <span className={styles.dbTypeTitle}>{label}</span>
              <span className={styles.dbTypeCount}>{es.length}</span>
            </div>
          )}
          <div className={styles.dbGrid}>
            {es.map((entry) => (
              <ItemCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ItemCard({ entry }: { entry: CatalogEntry }) {
  const dropSources = getItemDropSources(entry.id);
  const shopSources = getItemShopSources(entry.id);
  const spell = entry.grantedSpellId ? getSpellById(entry.grantedSpellId) ?? null : null;
  const summon = entry.grantedSummonId ? getSummonSpellById(entry.grantedSummonId) ?? null : null;
  const stats = entry.item.stats ?? [];
  // As linhas "Concede:"/"Invoca:" são renderizadas de forma especial (com
  // tooltip), então as removemos da lista de stats simples pra não duplicar.
  const plainStats = stats.filter(
    (s) => !s.text.startsWith('Concede:') && !s.text.startsWith('Invoca:'),
  );
  const hasSource = dropSources.length > 0 || shopSources.length > 0;

  return (
    <article className={styles.itemCard}>
      <div className={styles.itemCardHeader}>
        <span className={styles.itemCardName}>{entry.name}</span>
      </div>
      {(() => {
        const matType = getMaterialType(entry.id);
        if (matType) {
          return (
            <span className={styles.itemCardType}>
              <span className={styles.itemCardTypeDim}>{REAGENT_GROUP_LABEL}</span>
              {' · '}
              <span style={{ color: MATERIAL_TYPE_COLOR[matType] }}>
                {MATERIAL_TYPE_SINGULAR[matType]}
              </span>
            </span>
          );
        }
        return entry.typeLabel ? <span className={styles.itemCardType}>{entry.typeLabel}</span> : null;
      })()}

      {stats.length > 0 ? (
        <ul className={styles.itemCardStats}>
          {spell && <SpellGrant spell={spell} />}
          {summon && <SummonGrant summon={summon} />}
          {plainStats.map((s, i) => (
            <li
              key={i}
              className={`${styles.itemCardStat} ${s.color ? styles[`color_${s.color}`] : ''}`}
            >
              {s.text}
            </li>
          ))}
        </ul>
      ) : (
        entry.item.description && <p className={styles.itemCardDesc}>{entry.item.description}</p>
      )}

      {entry.reqLevel != null && (
        <div className={styles.itemCardReq}>Requer Nível {entry.reqLevel}</div>
      )}

      <div className={styles.itemCardOrigin}>
        <div className={styles.itemCardOriginLabel}>Origem</div>

        {dropSources.map((src) => (
          <div key={`drop-${src.enemyId}-${src.locationId}`} className={styles.itemCardSource}>
            <span className={styles.itemCardSourceName}>{src.enemyName}</span>
            <span className={styles.itemCardSourceMeta}>
              {src.locationName} · {actTitle(src.act)}
            </span>
            <span className={styles.itemCardSourceChance}>{Math.round(src.chance * 100)}%</span>
          </div>
        ))}

        {shopSources.map((src) => (
          <div key={`shop-${src.npcId}`} className={styles.itemCardSource}>
            <span className={styles.itemCardSourceName}>{src.npcName}</span>
            <span className={styles.itemCardSourceMeta}>
              {src.locationName ? `${src.locationName} · ` : ''}Loja
            </span>
            <span className={styles.itemCardSourceShop}>{src.price} ouro</span>
          </div>
        ))}

        {!hasSource && (
          <div className={styles.itemCardNoSource}>Sem fonte definida ainda.</div>
        )}
      </div>
    </article>
  );
}

/** Linha "Concede: <skill>" com nome sublinhado e tooltip de detalhes ao hover. */
function SpellGrant({ spell }: { spell: Spell }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ left: r.left, top: r.bottom + 6 });
  };
  const hide = () => setPos(null);

  return (
    <li className={`${styles.itemCardStat} ${styles[`color_${spell.element}`]}`}>
      Concede:{' '}
      <span
        ref={ref}
        className={styles.spellName}
        onMouseEnter={show}
        onMouseLeave={hide}
        tabIndex={0}
        onFocus={show}
        onBlur={hide}
      >
        {spell.name}
      </span>
      {pos && <SpellTooltip spell={spell} position={pos} />}
    </li>
  );
}

function SpellTooltip({ spell, position }: { spell: Spell; position: { left: number; top: number } }) {
  return createPortal(
    <div className={styles.spellTooltip} style={{ left: position.left, top: position.top }}>
      <div className={`${styles.spellTipName} ${styles[`color_${spell.element}`]}`}>{spell.name}</div>
      <div className={styles.spellTipMeta}>Magia · {ELEMENT_LABEL[spell.element]} · Tier {spell.tier}</div>
      <p className={styles.spellTipDesc}>{spell.description}</p>
      <div className={styles.spellTipStats}>
        {spell.hits.map((h, i) => (
          <div key={i} className={`${styles.spellTipLine} ${styles[`color_${h.element}`]}`}>
            {h.min}–{h.max} de {DAMAGE_LABEL[h.element]}
          </div>
        ))}
        <div className={`${styles.spellTipLine} ${styles.color_intelecto}`}>
          Tempo de Conjuração: {spell.castTimeSec.toFixed(1)}s
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Linha "Invoca: <skill>" com nome sublinhado e tooltip de detalhes ao hover. */
function SummonGrant({ summon }: { summon: SummonSpell }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ left: r.left, top: r.bottom + 6 });
  };
  const hide = () => setPos(null);

  return (
    <li className={`${styles.itemCardStat} ${styles.color_caos}`}>
      Invoca:{' '}
      <span
        ref={ref}
        className={styles.spellName}
        onMouseEnter={show}
        onMouseLeave={hide}
        tabIndex={0}
        onFocus={show}
        onBlur={hide}
      >
        {summon.name}
      </span>
      {pos && <SummonTooltip summon={summon} position={pos} />}
    </li>
  );
}

function SummonTooltip({ summon, position }: { summon: SummonSpell; position: { left: number; top: number } }) {
  const minion = getMinionById(summon.minionId);
  return createPortal(
    <div className={styles.spellTooltip} style={{ left: position.left, top: position.top }}>
      <div className={`${styles.spellTipName} ${styles.color_caos}`}>{summon.name}</div>
      <div className={styles.spellTipMeta}>Invocação · Tier {summon.tier}</div>
      <p className={styles.spellTipDesc}>{summon.description}</p>
      <div className={styles.spellTipStats}>
        {minion && (
          <>
            <div className={styles.spellTipLine}>
              Invoca: {summon.count} × {minion.name}
            </div>
            <div className={styles.spellTipLine}>{minion.role}</div>
            <div className={`${styles.spellTipLine} ${styles.color_vida}`}>
              Vida Máxima: {minion.vida}
            </div>
            <div className={styles.spellTipLine}>
              Dano: {minion.danoMin}–{minion.danoMax}
            </div>
          </>
        )}
        <div className={`${styles.spellTipLine} ${styles.color_mana}`}>
          Custo de Mana: {summon.manaCost}
        </div>
        <div className={`${styles.spellTipLine} ${styles.color_intelecto}`}>
          Tempo de Conjuração: {summon.castTimeSec.toFixed(1)}s
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ============================================================================
// BESTIÁRIO — ficha de cada inimigo
// ============================================================================

function getDefAreaRange(def: (typeof ALL_ENEMY_DEFS)[number]) {
  const loc = getLocationById(def.locationId);
  return loc ? getAreaEnemyLevelRange(loc.level) : { min: 1, max: 1 };
}

function BestiaryView() {
  const [selectedId, setSelectedId] = useState(ALL_ENEMY_DEFS[0]?.id ?? '');

  const def = ALL_ENEMY_DEFS.find((d) => d.id === selectedId) ?? ALL_ENEMY_DEFS[0];
  const areaRange = useMemo(() => (def ? getDefAreaRange(def) : { min: 1, max: 1 }), [def]);

  const [previewLevel, setPreviewLevel] = useState(() =>
    def ? getDefAreaRange(def).min : 1,
  );

  // Ao trocar de criatura, o preview usa o piso de nível da área dela.
  useEffect(() => {
    if (def) setPreviewLevel(getDefAreaRange(def).min);
  }, [def?.id]);

  const preview = useMemo(
    () => (def ? spawnEnemy(def, previewLevel) : null),
    [def, previewLevel],
  );

  if (!def || !preview) return null;

  const regions = getEnemySpawnLocations(def.id);

  return (
    <>
      <header className={styles.intro}>
        <h2 className={styles.introTitle}>Bestiário</h2>
        <p className={styles.introText}>
          Ficha de referência de cada criatura. O <strong>nível do encontro</strong> segue o seu personagem, limitado ao intervalo da área (ex.: Floresta Densa — Nv 1–2). Use o seletor abaixo para simular instâncias.
        </p>
      </header>

      <div className={styles.bestiarySplit}>
        <aside className={styles.bestiaryList}>
          <div className={styles.bestiaryListHeader}>
            <h3 className={styles.bestiaryListTitle}>Criaturas</h3>
            <span className={styles.columnCount}>{ALL_ENEMY_DEFS.length}</span>
          </div>
          <ul className={styles.bestiaryEntries}>
            {ALL_ENEMY_DEFS.map((entry) => {
              const active = entry.id === def.id;
              const range = getDefAreaRange(entry);
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`${styles.bestiaryEntry} ${active ? styles.bestiaryEntryActive : ''}`}
                    onClick={() => setSelectedId(entry.id)}
                  >
                    <span className={styles.bestiaryEntryTop}>
                      <span className={styles.bestiaryEntryName}>{entry.name}</span>
                      <span className={styles.bestiaryEntryLevel}>Nv {range.min}–{range.max}</span>
                    </span>
                    <span className={styles.bestiaryEntryRegions}>
                      {getEnemySpawnLocations(entry.id).map((r) => r.name).join(', ') || '—'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className={styles.bestiarySheet}>
          <header className={styles.bestiarySheetHeader}>
            <div>
              <h3 className={styles.bestiaryName}>
                {def.name}
                <span className={styles.bestiaryPreviewLevel}>Nv {preview.level}</span>
              </h3>
              <p className={styles.bestiaryDesc}>{def.description}</p>
            </div>
            <div className={styles.bestiaryLevelField}>
              <label className={styles.forgeLabel} htmlFor="bestiary-level">
                Nível <span className={styles.bestiaryLevelHint}>(área {areaRange.min}–{areaRange.max})</span>
              </label>
              <input
                id="bestiary-level"
                type="number"
                className={styles.bestiaryLevelInput}
                min={areaRange.min}
                max={areaRange.max}
                value={previewLevel}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  if (!Number.isNaN(n)) {
                    setPreviewLevel(Math.min(areaRange.max, Math.max(areaRange.min, n)));
                  }
                }}
              />
            </div>
          </header>

          {regions.length > 0 && (
            <div className={styles.bestiaryRegions}>
              <span className={styles.bestiaryRegionsLabel}>Regiões</span>
              <span className={styles.bestiaryRegionsValue}>
                {regions.map((r) => r.name).join(' · ')}
              </span>
            </div>
          )}

          <EnemyStatSheet enemy={preview} />
        </section>
      </div>
    </>
  );
}

function EnemyStatSheet({ enemy }: { enemy: Enemy }) {
  const acerto = getEnemyAcerto(enemy);
  const crit = getEnemyCritChance(enemy);
  const critMult = getEnemyCritMult(enemy);
  const vel = getEnemyVelAtaque(enemy);

  return (
    <div className={styles.bestiaryStats}>
      <BestiaryStatGroup title="Ofensivo">
        <StatLine name="Dano Físico" value={`${enemy.danoMin} — ${enemy.danoMax}`} color="fisico" />
        <StatLine
          name="Vel. de Ataque"
          value={<>{vel.toFixed(2)}<Unit> /s</Unit></>}
          color="agilidade"
        />
        <StatLine name="Acerto" value={String(acerto)} color="agilidade" />
        <StatLine name="Chance de Crítico" value={`${crit}%`} color="critico" />
        <StatLine name="Mult. de Crítico" value={`×${critMult.toFixed(2)}`} color="critico" />
      </BestiaryStatGroup>

      <BestiaryStatGroup title="Defensivo">
        <StatLine name="Vida Máxima" value={String(enemy.vidaMax)} color="vida" />
        <StatLine name="Evasão" value={String(enemy.evasao)} color="agilidade" />
        {(enemy.armadura ?? 0) > 0 && (
          <StatLine name="Armadura" value={String(enemy.armadura)} color="defesa" />
        )}
        {(enemy.bloqueio ?? 0) > 0 && (
          <StatLine name="Chance de Bloqueio" value={`${enemy.bloqueio}%`} color="fisico" />
        )}
        {(enemy.resFogo ?? 0) > 0 && (
          <StatLine name="Res. Fogo" value={`${enemy.resFogo}%`} color="fogo" />
        )}
        {(enemy.resGelo ?? 0) > 0 && (
          <StatLine name="Res. Gelo" value={`${enemy.resGelo}%`} color="gelo" />
        )}
        {(enemy.resRaio ?? 0) > 0 && (
          <StatLine name="Res. Raio" value={`${enemy.resRaio}%`} color="raio" />
        )}
        {(enemy.resCaos ?? 0) > 0 && (
          <StatLine name="Res. Caos" value={`${enemy.resCaos}%`} color="caos" />
        )}
        {(enemy.resSagrado ?? 0) > 0 && (
          <StatLine name="Res. Sagrado" value={`${enemy.resSagrado}%`} color="sagrado" />
        )}
        {(enemy.rouboVida ?? 0) > 0 && (
          <StatLine name="Roubo de Vida" value={`${enemy.rouboVida}%`} color="vida" />
        )}
        {(enemy.rouboMana ?? 0) > 0 && (
          <StatLine name="Roubo de Mana" value={`${enemy.rouboMana}%`} color="mana" />
        )}
      </BestiaryStatGroup>

      <BestiaryStatGroup title="Recompensas">
        <StatLine name="Experiência" value={String(enemy.xp)} color="exp" />
        <StatLine
          name="Ouro"
          value={enemy.goldMin === enemy.goldMax ? String(enemy.goldMin) : `${enemy.goldMin} — ${enemy.goldMax}`}
          color="ouro"
        />
        {enemy.loot && enemy.loot.length > 0 && (
          <div className={styles.bestiaryLoot}>
            <div className={`${styles.bestiaryLootLabel} ${styles.lootLabel}`}>Loot</div>
            {enemy.loot.map((drop) => (
              <StatLine
                key={drop.itemId}
                name={getMaterialName(drop.itemId)}
                value={`${Math.round(drop.chance * 100)}%`}
                color="comum"
              />
            ))}
          </div>
        )}
      </BestiaryStatGroup>
    </div>
  );
}

function BestiaryStatGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.bestiaryGroup}>
      <div className={styles.groupHeader}>{title}</div>
      <div className={styles.bestiaryGroupBody}>{children}</div>
    </div>
  );
}

// ============================================================================
// FORJA — sandbox de geração de itens (escolher base, raridade, mods)
// ============================================================================

/** Regras por raridade — quantidade de afixos permitidos (min/max). */
const RARITY_RULES: Record<Exclude<Rarity, 'unico' | 'lendario'>, { min: number; max: number }> = {
  comum: { min: 0, max: 0 },
  magico: { min: 0, max: 2 },
  raro: { min: 3, max: 6 },
};

/** Limite global por categoria — independe da raridade. */
const PER_CATEGORY_CAP = 3;

type ForgeRarity = 'comum' | 'magico' | 'raro';

interface RolledMod {
  /** Snapshot da definição na hora que entrou */
  def: ItemModDef;
  /** Texto rolado pra exibição (já com valor substituído) */
  text: string;
}

function ForgeView() {
  const [baseId, setBaseId] = useState<string>(ITEM_BASES[0].id);
  const [rarity, setRarity] = useState<ForgeRarity>('raro');
  const [rolled, setRolled] = useState<RolledMod[]>([]);

  const base = useMemo(
    () => ITEM_BASES.find((b) => b.id === baseId) ?? ITEM_BASES[0],
    [baseId],
  );

  const rules = RARITY_RULES[rarity];

  const prefixCount = rolled.filter((r) => r.def.category === 'prefix').length;
  const suffixCount = rolled.filter((r) => r.def.category === 'suffix').length;

  const handleRarityChange = (next: ForgeRarity) => {
    setRarity(next);
    // Trim mods se nova raridade não suporta a quantidade atual
    const max = RARITY_RULES[next].max;
    if (rolled.length > max) {
      setRolled(rolled.slice(0, max));
    }
  };

  const handleBaseChange = (id: string) => {
    setBaseId(id);
    // Mantém os mods — em PoE mudar de base mantém os mods compatíveis.
    // Pra esse sandbox simplificado, não há restrição por slot ainda.
  };

  const toggleMod = (def: ItemModDef) => {
    const existingIdx = rolled.findIndex((r) => r.def.id === def.id);
    if (existingIdx >= 0) {
      setRolled(rolled.filter((_, i) => i !== existingIdx));
      return;
    }
    // Validações de adição
    if (rolled.length >= rules.max) return;
    if (def.category === 'prefix' && prefixCount >= PER_CATEGORY_CAP) return;
    if (def.category === 'suffix' && suffixCount >= PER_CATEGORY_CAP) return;

    setRolled([...rolled, { def, text: rollMod(def) }]);
  };

  const handleRoll = () => {
    // Sortea entre min e max afixos pra raridade. Respeita o cap por categoria.
    const total = rules.min === rules.max
      ? rules.max
      : rules.min + Math.floor(Math.random() * (rules.max - rules.min + 1));
    const pool = [...ITEM_MODS];
    // Embaralha
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const next: RolledMod[] = [];
    let p = 0, s = 0;
    for (const def of pool) {
      if (next.length >= total) break;
      if (def.category === 'prefix' && p >= PER_CATEGORY_CAP) continue;
      if (def.category === 'suffix' && s >= PER_CATEGORY_CAP) continue;
      next.push({ def, text: rollMod(def) });
      if (def.category === 'prefix') p++; else s++;
    }
    setRolled(next);
  };

  const handleClear = () => setRolled([]);

  // Monta o Item virtual pra passar pro tooltip — base stats + mods rolados.
  // Marca cada stat com `kind` pra que o tooltip insira divisórias entre grupos.
  const previewItem: Item = useMemo(() => {
    const stats: ItemStat[] = [];
    for (const bs of base.baseStats) stats.push({ ...bs, kind: 'base' });
    const prefixes = rolled.filter((r) => r.def.category === 'prefix');
    const suffixes = rolled.filter((r) => r.def.category === 'suffix');
    for (const r of prefixes) stats.push({ text: r.text, color: r.def.color, kind: 'prefix' });
    for (const r of suffixes) stats.push({ text: r.text, color: r.def.color, kind: 'suffix' });
    return {
      id: 'forge-preview',
      name: base.name,
      slot: base.slot,
      rarity,
      stats,
      description: base.description,
    };
  }, [base, rolled, rarity]);

  return (
    <div className={styles.forgeRoot}>
      <section className={styles.forgeConfig}>
        <ForgeBaseSelector base={base} onChange={handleBaseChange} />
        <ForgeRaritySelector rarity={rarity} onChange={handleRarityChange} />
        <ForgeAffixManager
          rarity={rarity}
          rolled={rolled}
          rules={rules}
          prefixCount={prefixCount}
          suffixCount={suffixCount}
          onToggle={toggleMod}
          onRoll={handleRoll}
          onClear={handleClear}
        />
      </section>

      <section className={styles.forgePreview}>
        <div className={styles.forgePreviewHeader}>
          <span className={styles.forgePreviewLabel}>Preview do tooltip</span>
          <span className={styles.forgePreviewCount}>
            {rolled.length} {rolled.length === 1 ? 'afixo' : 'afixos'}
          </span>
        </div>
        <div className={styles.forgePreviewSlot}>
          <ItemTooltipInline item={previewItem} />
        </div>
      </section>
    </div>
  );
}

// ────────────── ForgeBaseSelector ──────────────
interface ForgeBaseSelectorProps {
  base: ItemBase;
  onChange: (id: string) => void;
}

function ForgeBaseSelector({ base, onChange }: ForgeBaseSelectorProps) {
  return (
    <div className={styles.forgeField}>
      <label className={styles.forgeLabel} htmlFor="forge-base">Base</label>
      <select
        id="forge-base"
        className={styles.forgeSelect}
        value={base.id}
        onChange={(e) => onChange(e.target.value)}
      >
        {ITEM_BASES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} — {b.slot}
          </option>
        ))}
      </select>
    </div>
  );
}

// ────────────── ForgeRaritySelector ──────────────
interface ForgeRaritySelectorProps {
  rarity: ForgeRarity;
  onChange: (next: ForgeRarity) => void;
}

const RARITY_BUTTONS: { id: ForgeRarity; label: string }[] = [
  { id: 'comum', label: 'Comum' },
  { id: 'magico', label: 'Mágico' },
  { id: 'raro', label: 'Raro' },
];

function ForgeRaritySelector({ rarity, onChange }: ForgeRaritySelectorProps) {
  return (
    <div className={styles.forgeField}>
      <span className={styles.forgeLabel}>Raridade</span>
      <div className={styles.forgeRarityChips}>
        {RARITY_BUTTONS.map((r) => {
          const isActive = rarity === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className={`${styles.forgeRarityChip} ${styles[`rarity_${r.id}`]} ${isActive ? styles.forgeRarityChipActive : ''}`}
              onClick={() => onChange(r.id)}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ────────────── ForgeAffixManager ──────────────
interface ForgeAffixManagerProps {
  rarity: ForgeRarity;
  rolled: RolledMod[];
  rules: { min: number; max: number };
  prefixCount: number;
  suffixCount: number;
  onToggle: (def: ItemModDef) => void;
  onRoll: () => void;
  onClear: () => void;
}

function ForgeAffixManager({
  rarity,
  rolled,
  rules,
  prefixCount,
  suffixCount,
  onToggle,
  onRoll,
  onClear,
}: ForgeAffixManagerProps) {
  const rolledIds = new Set(rolled.map((r) => r.def.id));

  if (rarity === 'comum') {
    return (
      <div className={styles.forgeField}>
        <span className={styles.forgeLabel}>Afixos</span>
        <p className={styles.forgeNote}>
          Itens comuns não têm afixos rolados — apenas os stats inerentes da base.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.forgeField}>
      <div className={styles.forgeAffixHeader}>
        <span className={styles.forgeLabel}>Afixos</span>
        <div className={styles.forgeAffixActions}>
          <button type="button" className={`btn-secondary ${styles.forgeBtnSm}`} onClick={onRoll}>
            Sortear
          </button>
          <button
            type="button"
            className={`btn-secondary ${styles.forgeBtnSm}`}
            onClick={onClear}
            disabled={rolled.length === 0}
          >
            Limpar
          </button>
        </div>
      </div>

      <div className={styles.forgeCounts}>
        <span>
          Total: <strong>{rolled.length}</strong> / {rules.max}
        </span>
        <span className={styles.forgeCountSep}>·</span>
        <span>
          Prefixos: <strong>{prefixCount}</strong> / {PER_CATEGORY_CAP}
        </span>
        <span className={styles.forgeCountSep}>·</span>
        <span>
          Sufixos: <strong>{suffixCount}</strong> / {PER_CATEGORY_CAP}
        </span>
      </div>

      <ForgeModPicker
        title="Prefixos"
        category="prefix"
        rolledIds={rolledIds}
        canAdd={rolled.length < rules.max && prefixCount < PER_CATEGORY_CAP}
        onToggle={onToggle}
      />
      <ForgeModPicker
        title="Sufixos"
        category="suffix"
        rolledIds={rolledIds}
        canAdd={rolled.length < rules.max && suffixCount < PER_CATEGORY_CAP}
        onToggle={onToggle}
      />
    </div>
  );
}

// ────────────── ForgeModPicker (lista de chips por categoria) ──────────────
interface ForgeModPickerProps {
  title: string;
  category: ModCategory;
  rolledIds: Set<string>;
  canAdd: boolean;
  onToggle: (def: ItemModDef) => void;
}

function ForgeModPicker({ title, category, rolledIds, canAdd, onToggle }: ForgeModPickerProps) {
  const mods = ITEM_MODS.filter((m) => m.category === category);
  return (
    <div className={styles.forgeModSection}>
      <div className={styles.forgeModSectionTitle}>{title}</div>
      <div className={styles.forgeModChips}>
        {mods.map((mod) => {
          const isOn = rolledIds.has(mod.id);
          const disabled = !isOn && !canAdd;
          return (
            <button
              key={mod.id}
              type="button"
              className={`${styles.forgeModChip} ${styles[`color_${mod.color}`]} ${isOn ? styles.forgeModChipOn : ''}`}
              onClick={() => onToggle(mod)}
              disabled={disabled}
              title={mod.description}
            >
              {mod.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Header pro modal
// ============================================================================
interface CodexHeaderProps {
  character: Character;
  onClose: () => void;
  shortcut?: string;
}

export function CodexHeader({ character, onClose, shortcut = 'K' }: CodexHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Códice</div>
        <div className={styles.subtitle}>
          {character.name} · {ITEM_MODS.length} mods · {ALL_ENEMY_DEFS.length} criaturas
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
