import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Character, Item, ItemStat, Rarity } from '../../types';
import {
  ALL_ENEMY_DEFS,
  getAreaEnemyLevelRange,
  getEnemyAcerto,
  getEnemyCritChance,
  getEnemyCritMult,
  getEnemySpawnLocations,
  getEnemyVelAtaque,
  spawnEnemy,
  type Enemy,
} from '../../data/enemies';
import { getLocationById } from '../../data/world';
import { getMaterialName } from '../../data/materials';
import {
  ITEM_MODS,
  MOD_GROUP_LABEL,
  MOD_GROUP_ORDER,
  rollMod,
  type ItemModDef,
  type ModCategory,
  type ModGroup,
} from '../../data/itemMods';
import { ITEM_BASES, type ItemBase } from '../../data/itemBases';
import { ItemTooltipInline } from '../ItemTooltip/ItemTooltip';
import { StatLine, Unit } from '../StatLine/StatLine';
import { RarityGuide } from './RarityGuide';
import styles from './CodexView.module.css';

type CodexSection = 'mods' | 'raridade' | 'forja' | 'bestiario';

const SECTIONS: { id: CodexSection; label: string }[] = [
  { id: 'mods', label: 'Mods de Item' },
  { id: 'raridade', label: 'Raridade' },
  { id: 'forja', label: 'Forja' },
  { id: 'bestiario', label: 'Bestiário' },
];

interface CodexViewProps {
  character: Character;
}

export function CodexView({ character: _character }: CodexViewProps) {
  const [active, setActive] = useState<CodexSection>('mods');

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
          <StatLine name="Bloqueio" value={`${enemy.bloqueio}%`} color="defesa" />
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
