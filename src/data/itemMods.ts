import type { ModColor } from '../types';

/**
 * Categoria do mod no nome do item (lógica inspirada em Path of Exile):
 * - **prefix**: aparece ANTES do nome base ("Sangrento Espada Longa"). Geralmente
 *   poder bruto — vida, mana, dano flat, defesa flat.
 * - **suffix**: aparece DEPOIS do nome base ("Espada Longa do Lince"). Geralmente
 *   utilidade — atributos, resistências, velocidade, crítico, penetração.
 */
export type ModCategory = 'prefix' | 'suffix';

/**
 * Subcategoria semântica — usada pra agrupar mods no Códice e (futuro) limitar
 * quantos mods do mesmo grupo podem aparecer no mesmo item.
 */
export type ModGroup =
  | 'vital'
  | 'dano'
  | 'defesa'
  | 'magia'
  | 'sustain'
  | 'atributo'
  | 'resistencia'
  | 'velocidade'
  | 'critico'
  | 'mana'
  | 'roubo'
  | 'precisao'
  | 'penetracao';

export interface ItemModDef {
  id: string;
  /** Nome exibido no tooltip do item — ex: "+# de Vida" */
  label: string;
  category: ModCategory;
  group: ModGroup;
  /** Cor da label no tooltip — espelha a paleta de mods da ficha */
  color: ModColor;
  /** Texto curto explicando o que o mod faz */
  description: string;
  /**
   * Range pra rolagem do valor — substitui o `#` no label.
   * Pra mods com 2 valores ("Adiciona X a Y"), use `rollRange` em vez disso.
   */
  roll?: [number, number];
  /**
   * Pra mods de dano "Adiciona X a Y" — `min` rola o limite inferior,
   * `max` rola um delta que é somado ao min pra dar o limite superior.
   */
  rollRange?: { min: [number, number]; max: [number, number] };
}

/**
 * Catálogo mestre de mods — a fonte de onde itens vão sortear afixos quando o
 * sistema de geração for implementado. Por ora serve só como referência (Códice).
 */
export const ITEM_MODS: ItemModDef[] = [
  // ════════════════ PREFIXOS — poder bruto ════════════════

  // Vital
  {
    id: 'vida-flat',
    label: '+ # de Vida',
    category: 'prefix',
    group: 'vital',
    color: 'vida',
    description: 'Aumenta a Vida máxima do personagem em valor fixo.',
    roll: [15, 60],
  },
  {
    id: 'mana-flat',
    label: '+ # de Mana',
    category: 'prefix',
    group: 'vital',
    color: 'mana',
    description: 'Aumenta a Mana máxima do personagem em valor fixo.',
    roll: [8, 30],
  },

  // Dano (físico + elementais + caos + sagrado)
  {
    id: 'dano-fisico-flat',
    label: '+ # a # de Dano Físico',
    category: 'prefix',
    group: 'dano',
    color: 'fisico',
    description: 'Adiciona dano físico flat aos ataques.',
    rollRange: { min: [2, 6], max: [3, 6] },
  },
  {
    id: 'dano-fogo-flat',
    label: '+ # a # de Dano de Fogo',
    category: 'prefix',
    group: 'dano',
    color: 'fogo',
    description: 'Adiciona dano de fogo flat aos ataques e magias.',
    rollRange: { min: [1, 5], max: [3, 7] },
  },
  {
    id: 'dano-gelo-flat',
    label: '+ # a # de Dano de Gelo',
    category: 'prefix',
    group: 'dano',
    color: 'gelo',
    description: 'Adiciona dano de gelo flat aos ataques e magias.',
    rollRange: { min: [1, 5], max: [3, 7] },
  },
  {
    id: 'dano-raio-flat',
    label: '+ # a # de Dano de Raio',
    category: 'prefix',
    group: 'dano',
    color: 'raio',
    description: 'Adiciona dano de raio flat aos ataques e magias.',
    rollRange: { min: [1, 4], max: [4, 9] },
  },
  {
    id: 'dano-caos-flat',
    label: '+ # a # de Dano de Caos',
    category: 'prefix',
    group: 'dano',
    color: 'caos',
    description: 'Adiciona dano de caos flat — ignora armadura.',
    rollRange: { min: [2, 5], max: [3, 6] },
  },
  {
    id: 'dano-sagrado-flat',
    label: '+ # a # de Dano Sagrado',
    category: 'prefix',
    group: 'dano',
    color: 'sagrado',
    description: 'Adiciona dano sagrado flat — efetivo contra profanos e mortos-vivos.',
    rollRange: { min: [2, 5], max: [3, 6] },
  },

  // Defesa flat
  {
    id: 'armadura-flat',
    label: '+ # de Armadura',
    category: 'prefix',
    group: 'defesa',
    color: 'fisico',
    description: 'Reduz dano físico recebido — eficácia varia conforme tamanho do golpe.',
    roll: [10, 40],
  },
  {
    id: 'evasao-flat',
    label: '+ # de Evasão',
    category: 'prefix',
    group: 'defesa',
    color: 'agilidade',
    description: 'Aumenta a chance de evitar completamente um ataque.',
    roll: [10, 40],
  },

  // Magia
  {
    id: 'bonus-magico-flat',
    label: '+ # de Bônus Mágico',
    category: 'prefix',
    group: 'magia',
    color: 'intelecto',
    description: 'Aumenta o dano de magias em valor fixo.',
    roll: [5, 25],
  },

  // Sustain (regen) — em PoE flat regen é prefix
  {
    id: 'regen-vida',
    label: '+ # de Regeneração de Vida por turno',
    category: 'prefix',
    group: 'sustain',
    color: 'vida',
    description: 'Recupera vida automaticamente a cada turno.',
    roll: [1, 5],
  },
  {
    id: 'regen-mana',
    label: '+ # de Regeneração de Mana por turno',
    category: 'prefix',
    group: 'sustain',
    color: 'mana',
    description: 'Recupera mana automaticamente a cada turno.',
    roll: [1, 4],
  },

  // ════════════════ SUFIXOS — utilidade ════════════════

  // Atributos
  {
    id: 'forca',
    label: '+ # de Força',
    category: 'suffix',
    group: 'atributo',
    color: 'forca',
    description: 'Escala dano físico base e capacidade de carga.',
    roll: [1, 8],
  },
  {
    id: 'agilidade',
    label: '+ # de Agilidade',
    category: 'suffix',
    group: 'atributo',
    color: 'agilidade',
    description: 'Escala velocidade de ataque, esquiva e chance de crítico.',
    roll: [1, 8],
  },
  {
    id: 'intelecto',
    label: '+ # de Intelecto',
    category: 'suffix',
    group: 'atributo',
    color: 'intelecto',
    description: 'Escala bônus mágico, mana e velocidade de conjuração.',
    roll: [1, 8],
  },

  // Resistências
  {
    id: 'res-fogo',
    label: '+ #% de Resistência ao Fogo',
    category: 'suffix',
    group: 'resistencia',
    color: 'fogo',
    description: 'Diminui o dano de fogo recebido. Limite: 75%.',
    roll: [10, 30],
  },
  {
    id: 'res-gelo',
    label: '+ #% de Resistência ao Gelo',
    category: 'suffix',
    group: 'resistencia',
    color: 'gelo',
    description: 'Diminui o dano de gelo recebido. Limite: 75%.',
    roll: [10, 30],
  },
  {
    id: 'res-raio',
    label: '+ #% de Resistência ao Raio',
    category: 'suffix',
    group: 'resistencia',
    color: 'raio',
    description: 'Diminui o dano de raio recebido. Limite: 75%.',
    roll: [10, 30],
  },
  {
    id: 'res-caos',
    label: '+ #% de Resistência ao Caos',
    category: 'suffix',
    group: 'resistencia',
    color: 'caos',
    description: 'Diminui o dano de caos recebido. Limite: 75%.',
    roll: [5, 20],
  },
  {
    id: 'res-sagrado',
    label: '+ #% de Resistência ao Sagrado',
    category: 'suffix',
    group: 'resistencia',
    color: 'sagrado',
    description: 'Diminui o dano sagrado recebido. Limite: 75%.',
    roll: [5, 20],
  },
  {
    id: 'res-fisica',
    label: '+ #% de Resistência Física',
    category: 'suffix',
    group: 'resistencia',
    color: 'fisico',
    description: 'Diminui o dano físico recebido em percentual — soma com Armadura.',
    roll: [3, 12],
  },

  // Velocidade
  {
    id: 'vel-ataque',
    label: '+ #% de Velocidade de Ataque',
    category: 'suffix',
    group: 'velocidade',
    color: 'agilidade',
    description: 'Aumenta o número de ataques por segundo.',
    roll: [4, 12],
  },
  {
    id: 'vel-conjuracao',
    label: '+ #% de Velocidade de Conjuração',
    category: 'suffix',
    group: 'velocidade',
    color: 'intelecto',
    description: 'Aumenta a velocidade de conjuração de magias.',
    roll: [4, 12],
  },
  {
    id: 'vel-movimento',
    label: '+ #% de Velocidade de Movimento',
    category: 'suffix',
    group: 'velocidade',
    color: 'agilidade',
    description: 'Aumenta a velocidade de deslocamento no mundo.',
    roll: [3, 10],
  },

  // Crítico
  {
    id: 'chance-critico',
    label: '+ #% de Chance de Crítico',
    category: 'suffix',
    group: 'critico',
    color: 'critico',
    description: 'Chance adicional de aplicar um golpe crítico.',
    roll: [2, 8],
  },
  {
    id: 'mult-critico',
    label: '+ #% de Multiplicador de Crítico',
    category: 'suffix',
    group: 'critico',
    color: 'critico',
    description: 'Aumenta o dano de golpes críticos.',
    roll: [10, 30],
  },

  // Mana — eficiência
  {
    id: 'eficiencia-mana',
    label: '+ #% de Eficiência de Mana',
    category: 'suffix',
    group: 'mana',
    color: 'mana',
    description: 'Reduz o custo de mana de habilidades e magias.',
    roll: [3, 12],
  },

  // Roubo
  {
    id: 'roubo-vida',
    label: '+ #% de Roubo de Vida',
    category: 'suffix',
    group: 'roubo',
    color: 'vida',
    description: 'Recupera vida proporcional ao dano causado.',
    roll: [1, 4],
  },
  {
    id: 'roubo-mana',
    label: '+ #% de Roubo de Mana',
    category: 'suffix',
    group: 'roubo',
    color: 'mana',
    description: 'Recupera mana proporcional ao dano causado.',
    roll: [1, 4],
  },

  // Defesa secundária (sufixo)
  {
    id: 'esquiva',
    label: '+ #% de Esquiva',
    category: 'suffix',
    group: 'defesa',
    color: 'agilidade',
    description: 'Chance de anular completamente um ataque inimigo.',
    roll: [3, 10],
  },
  {
    id: 'bloqueio',
    label: '+ #% de Chance de Bloqueio',
    category: 'suffix',
    group: 'defesa',
    color: 'defesa',
    description: 'Chance de bloquear um ataque, anulando o dano. Requer escudo.',
    roll: [3, 10],
  },

  // Precisão
  {
    id: 'acerto',
    label: '+ # de Acerto',
    category: 'suffix',
    group: 'precisao',
    color: 'agilidade',
    description: 'Aumenta a chance de seus ataques conectarem com o alvo.',
    roll: [10, 50],
  },

  // Penetração
  {
    id: 'pen-fogo',
    label: '+ #% de Penetração de Fogo',
    category: 'suffix',
    group: 'penetracao',
    color: 'fogo',
    description: 'Ignora parte da Resistência ao Fogo do alvo.',
    roll: [5, 18],
  },
  {
    id: 'pen-gelo',
    label: '+ #% de Penetração de Gelo',
    category: 'suffix',
    group: 'penetracao',
    color: 'gelo',
    description: 'Ignora parte da Resistência ao Gelo do alvo.',
    roll: [5, 18],
  },
  {
    id: 'pen-raio',
    label: '+ #% de Penetração de Raio',
    category: 'suffix',
    group: 'penetracao',
    color: 'raio',
    description: 'Ignora parte da Resistência ao Raio do alvo.',
    roll: [5, 18],
  },
  {
    id: 'pen-caos',
    label: '+ #% de Penetração de Caos',
    category: 'suffix',
    group: 'penetracao',
    color: 'caos',
    description: 'Ignora parte da Resistência ao Caos do alvo.',
    roll: [4, 15],
  },
  {
    id: 'pen-sagrado',
    label: '+ #% de Penetração Sagrada',
    category: 'suffix',
    group: 'penetracao',
    color: 'sagrado',
    description: 'Ignora parte da Resistência ao Sagrado do alvo.',
    roll: [4, 15],
  },
];

/**
 * Sorteia uma instância textual do mod, substituindo placeholders por valores
 * dentro do range definido em `roll` ou `rollRange`. Retorna o label original
 * se o mod não tiver range (caso impossível em produção).
 */
export function rollMod(mod: ItemModDef): string {
  const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  if (mod.rollRange) {
    const min = r(mod.rollRange.min[0], mod.rollRange.min[1]);
    const delta = r(mod.rollRange.max[0], mod.rollRange.max[1]);
    const max = min + delta;
    return mod.label.replace('# a #', `${min} a ${max}`);
  }
  if (mod.roll) {
    const v = r(mod.roll[0], mod.roll[1]);
    return mod.label.replace('#', String(v));
  }
  return mod.label;
}

/** Label exibida em cada subcategoria (uppercase nas seções do Códice) */
export const MOD_GROUP_LABEL: Record<ModGroup, string> = {
  vital: 'Vital',
  dano: 'Dano',
  defesa: 'Defesa',
  magia: 'Magia',
  sustain: 'Regeneração',
  atributo: 'Atributos',
  resistencia: 'Resistências',
  velocidade: 'Velocidade',
  critico: 'Crítico',
  mana: 'Mana',
  roubo: 'Roubo',
  precisao: 'Precisão',
  penetracao: 'Penetração',
};

/**
 * Ordem canônica em que cada grupo aparece dentro de uma coluna do Códice.
 * Não precisa cobrir grupos que não existem na coluna — o componente filtra.
 */
export const MOD_GROUP_ORDER: ModGroup[] = [
  'vital',
  'atributo',
  'dano',
  'defesa',
  'resistencia',
  'magia',
  'sustain',
  'velocidade',
  'critico',
  'mana',
  'roubo',
  'precisao',
  'penetracao',
];

export function getModsByCategory(category: ModCategory): ItemModDef[] {
  return ITEM_MODS.filter((m) => m.category === category);
}
