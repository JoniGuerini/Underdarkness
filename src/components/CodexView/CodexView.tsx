import { useMemo, useState } from 'react';
import type { Character, Item, ItemStat, Rarity } from '../../types';
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
import styles from './CodexView.module.css';

type CodexSection = 'mods' | 'raridade' | 'forja';

const SECTIONS: { id: CodexSection; label: string }[] = [
  { id: 'mods', label: 'Mods de Item' },
  { id: 'raridade', label: 'Raridade' },
  { id: 'forja', label: 'Forja' },
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
        {active === 'raridade' && <RarityList />}
        {active === 'forja' && <ForgeView />}
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
// RARIDADE — explicação dos tiers e regras de geração
// ============================================================================
interface RarityTier {
  id: 'comum' | 'magico' | 'raro';
  name: string;
  altName: string;
  colorClass: string;
  affixRange: string;
  affixHint: string;
  description: string;
  rules: string[];
}

const RARITY_TIERS: RarityTier[] = [
  {
    id: 'comum',
    name: 'Comum',
    altName: 'Base / Branco',
    colorClass: 'rarity_comum',
    affixRange: '0 afixos',
    affixHint: 'Apenas valores base do item',
    description:
      'O item sem afixos aleatórios — carrega apenas os atributos intrínsecos da sua base. É o ponto de partida: previsível, sem desvios. Vale como matéria-prima e como referência pra entender o que cada tipo de item oferece "limpo".',
    rules: [
      'Botas exibem só Armadura ou Esquiva (depende da base).',
      'Armas exibem só Dano (mín–máx), Velocidade de Ataque e a Chance de Crítico base de 5% comum a todas.',
      'Anéis e amuletos têm mods inerentes à base — ex: Anel de Rubi traz Resistência ao Fogo, Anel de Safira traz Resistência ao Gelo.',
      'Esses valores não são afixos rolados — eles são o item.',
    ],
  },
  {
    id: 'magico',
    name: 'Mágico',
    altName: 'Azul Claro',
    colorClass: 'rarity_magico',
    affixRange: 'Até 2 afixos',
    affixHint: 'Prefixo e/ou sufixo, sorteados ao gerar',
    description:
      'O primeiro tier com afixos. Pode receber até dois mods sorteados aleatoriamente — qualquer combinação de prefixo e sufixo (dois prefixos, dois sufixos, ou um de cada).',
    rules: [
      'Mantém os mods base do tier Comum.',
      'Adiciona até 2 afixos sorteados da lista mestra.',
      'Cada afixo é independente — pode rolar prefixo, sufixo ou um de cada.',
    ],
  },
  {
    id: 'raro',
    name: 'Raro',
    altName: 'Amarelo Claro',
    colorClass: 'rarity_raro',
    affixRange: '3 a 6 afixos',
    affixHint: 'Mistura livre de prefixos e sufixos',
    description:
      'O tier mais flexível e poderoso entre os comuns. Tem entre três e seis afixos rolados, em qualquer combinação. É onde builds começam a se diferenciar de verdade.',
    rules: [
      'Mantém os mods base do tier Comum.',
      'Quantidade total de afixos varia entre 3 e 6 (sorteado por item).',
      'Cada slot é independente — pode rolar como prefixo ou sufixo.',
    ],
  },
];

function RarityList() {
  return (
    <>
      <header className={styles.intro}>
        <h2 className={styles.introTitle}>Raridade</h2>
        <p className={styles.introText}>
          A raridade define quantos afixos um item pode receber ao ser gerado. Cada tier sobe sobre o anterior — Comum vira Mágico ao ganhar afixos, Mágico vira Raro ao ganhar mais. <strong>Limite global:</strong> nenhum item pode ter mais de 3 prefixos ou 3 sufixos, mesmo nos tiers mais altos.
        </p>
      </header>

      <div className={styles.rarityList}>
        {RARITY_TIERS.map((tier) => (
          <article key={tier.id} className={styles.rarityCard}>
            <header className={styles.rarityCardHeader}>
              <div className={styles.rarityNames}>
                <h3 className={`${styles.rarityName} ${styles[tier.colorClass]}`}>{tier.name}</h3>
                <span className={styles.rarityAlt}>{tier.altName}</span>
              </div>
              <div className={styles.rarityRange}>
                <span className={`${styles.rarityRangeValue} ${styles[tier.colorClass]}`}>
                  {tier.affixRange}
                </span>
                <span className={styles.rarityRangeHint}>{tier.affixHint}</span>
              </div>
            </header>

            <p className={styles.rarityDesc}>{tier.description}</p>

            <ul className={styles.rarityRules}>
              {tier.rules.map((rule, i) => (
                <li key={i} className={styles.rarityRule}>
                  <span className={styles.rarityRuleBullet}>·</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <footer className={styles.rarityFooter}>
        <div className={styles.rarityFooterTitle}>Limite de afixos por item</div>
        <p className={styles.rarityFooterText}>
          Independente do tier, um item nunca terá mais de <strong>3 prefixos</strong> ou <strong>3 sufixos</strong>. Em itens Raros com 6 afixos, isso significa exatamente 3 de cada — qualquer outra distribuição (ex: 4 prefixos + 2 sufixos) é inválida.
        </p>
      </footer>
    </>
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
          {character.name} · {ITEM_MODS.length} mods catalogados
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
