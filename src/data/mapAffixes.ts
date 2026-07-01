/**
 * Catálogo de afixos de mapa (Atlas de Mapas). Cada afixo aumenta a dificuldade
 * da expedição, a recompensa, ou ambos — o trade-off clássico de PoE (mapa mais
 * perigoso = mais/melhor loot). A expedição resolve o efeito pelo `kind`.
 */

import type { MapAffix, ModColor } from '../types';

/**
 * ModColor → token CSS, pra colorir a label de afixos de mapa inline (os
 * componentes do Atlas usam esta tabela em vez de classes por módulo).
 */
export const AFFIX_COLOR_VAR: Record<ModColor, string> = {
  fisico: 'var(--elem-fisico)',
  fogo: 'var(--elem-fogo)',
  gelo: 'var(--elem-gelo)',
  raio: 'var(--elem-raio)',
  caos: 'var(--elem-caos)',
  sagrado: 'var(--elem-sagrado)',
  vida: 'var(--vital-vida)',
  mana: 'var(--vital-mana)',
  exp: 'var(--vital-exp)',
  ouro: 'var(--brass-bright)',
  comum: 'var(--ink-muted)',
  forca: 'var(--stat-forca)',
  agilidade: 'var(--stat-agilidade)',
  intelecto: 'var(--stat-intelecto)',
  defesa: 'var(--stat-defesa)',
  critico: 'var(--stat-critico)',
  energia: 'var(--ink)',
};

export type MapAffixKind =
  | 'enemy-vida' // +% Vida dos inimigos
  | 'enemy-dano' // +% Dano dos inimigos
  | 'enemy-vel' // +% Vel. de Ataque dos inimigos
  | 'enemy-crit' // +% Chance de Crítico dos inimigos (flat)
  | 'loot-quantidade' // +% Quantidade de Itens
  | 'loot-raridade'; // + bônus de Raridade dos Itens

export interface MapAffixDef {
  id: string;
  /** Label com `#` — substituído pelo valor rolado ao instanciar. */
  label: string;
  description: string;
  color?: ModColor;
  kind: MapAffixKind;
  roll: [number, number];
  /** Tier mínimo pra o afixo poder aparecer (os mais fortes só em tiers altos). */
  minTier?: number;
}

export const MAP_AFFIXES: MapAffixDef[] = [
  // ── Perigo (sobem a dificuldade) ─────────────────────────────────
  {
    id: 'inimigos-vida',
    label: 'Inimigos têm +#% de Vida',
    description: 'Toda criatura da expedição — incluindo o chefe — recebe mais Vida máxima.',
    color: 'vida',
    kind: 'enemy-vida',
    roll: [20, 60],
  },
  {
    id: 'inimigos-dano',
    label: 'Inimigos causam +#% de Dano',
    description: 'Os golpes das criaturas ferem mais fundo.',
    color: 'fisico',
    kind: 'enemy-dano',
    roll: [15, 45],
  },
  {
    id: 'inimigos-velocidade',
    label: 'Inimigos atacam #% mais rápido',
    description: 'As criaturas agem em intervalos menores.',
    color: 'agilidade',
    kind: 'enemy-vel',
    roll: [10, 25],
  },
  {
    id: 'inimigos-critico',
    label: 'Inimigos têm +#% de Chance de Crítico',
    description: 'As criaturas acertam golpes críticos com mais frequência.',
    color: 'critico',
    kind: 'enemy-crit',
    roll: [6, 16],
    minTier: 3,
  },

  // ── Recompensa (sobem o loot) ────────────────────────────────────
  {
    id: 'itens-quantidade',
    label: '+#% de Quantidade de Itens',
    description: 'A expedição dropa mais itens ao ser concluída.',
    color: 'ouro',
    kind: 'loot-quantidade',
    roll: [20, 80],
  },
  {
    id: 'itens-raridade',
    label: '+#% de Raridade dos Itens',
    description: 'Os itens dropados têm mais chance de vir Mágicos e Raros.',
    color: 'ouro',
    kind: 'loot-raridade',
    roll: [15, 50],
  },
];

export function getMapAffixDef(id: string): MapAffixDef | undefined {
  return MAP_AFFIXES.find((a) => a.id === id);
}

/** Instancia um afixo com valor rolado — pronto pra guardar no MapItem. */
export function rollMapAffix(def: MapAffixDef): MapAffix {
  const value = def.roll[0] + Math.floor(Math.random() * (def.roll[1] - def.roll[0] + 1));
  return {
    id: def.id,
    label: def.label.replace('#', String(value)),
    color: def.color,
    value,
  };
}

/** Soma os valores dos afixos de um dado `kind` (0 se nenhum). */
export function sumAffixValue(affixes: MapAffix[], kind: MapAffixKind): number {
  let total = 0;
  for (const a of affixes) {
    if (getMapAffixDef(a.id)?.kind === kind) total += a.value;
  }
  return total;
}
