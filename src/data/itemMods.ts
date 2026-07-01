import type { ItemStat, ModColor, StatKey } from '../types';

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

/**
 * Um tier de um afixo — range de rolagem destravado pelo NÍVEL DO ITEM.
 *
 * Regra de item level (ilvl): o nível do item é IGUAL ao nível do monstro que
 * o dropou (drop de monstro nv 35 → item nv 35). Não confundir com `reqLevel`
 * da base (requisito pra equipar) — são coisas independentes. Quanto maior o
 * ilvl, mais tiers ficam elegíveis; tiers baixos continuam podendo rolar.
 */
export interface ModTierDef {
  /** Item level mínimo pra esse tier poder rolar. */
  ilvl: number;
  /** Range simples — substitui o `#` do label. */
  roll?: [number, number];
  /**
   * Pra mods "+ X a Y" — `min` rola o limite inferior; `max` rola um DELTA
   * somado ao min pra dar o limite superior.
   */
  rollRange?: { min: [number, number]; max: [number, number] };
}

export interface ItemModDef {
  id: string;
  /** Chave do stat que o mod alimenta — liga o afixo ao cálculo da ficha. */
  key: StatKey;
  /** Nome exibido no tooltip do item — ex: "+# de Vida" */
  label: string;
  category: ModCategory;
  group: ModGroup;
  /** Cor da label no tooltip — espelha a paleta de mods da ficha */
  color: ModColor;
  /** Texto curto explicando o que o mod faz */
  description: string;
  /**
   * Escada de tiers — ASCENDENTE (tiers[0] = T1 fraco … último = mais forte),
   * seguindo a convenção do jogo (atos/materiais). A quantidade varia por
   * afixo: stats principais têm escadas longas, utilidades nichadas são curtas.
   */
  tiers: ModTierDef[];
}

// Helpers de construção — mantêm as tabelas de tier legíveis.
const t = (ilvl: number, lo: number, hi: number): ModTierDef => ({ ilvl, roll: [lo, hi] });
const tr = (
  ilvl: number,
  minLo: number,
  minHi: number,
  deltaLo: number,
  deltaHi: number,
): ModTierDef => ({ ilvl, rollRange: { min: [minLo, minHi], max: [deltaLo, deltaHi] } });

/**
 * Catálogo mestre de mods — a fonte de onde itens vão sortear afixos quando o
 * sistema de geração for implementado. Por ora serve só como referência (Códice).
 */
export const ITEM_MODS: ItemModDef[] = [
  // ════════════════ PREFIXOS — poder bruto ════════════════

  // Vital
  {
    id: 'vida-flat',
    key: 'flat-vida',
    label: '+ # de Vida',
    category: 'prefix',
    group: 'vital',
    color: 'vida',
    description: 'Aumenta a Vida máxima do personagem em valor fixo.',
    tiers: [
      t(1, 10, 19),
      t(12, 20, 29),
      t(25, 30, 39),
      t(38, 40, 49),
      t(52, 50, 59),
      t(66, 60, 69),
      t(80, 70, 84),
      t(92, 85, 99),
    ],
  },
  {
    id: 'mana-flat',
    key: 'flat-mana',
    label: '+ # de Mana',
    category: 'prefix',
    group: 'vital',
    color: 'mana',
    description: 'Aumenta a Mana máxima do personagem em valor fixo.',
    tiers: [
      t(1, 5, 9),
      t(15, 10, 14),
      t(30, 15, 19),
      t(50, 20, 24),
      t(70, 25, 29),
      t(85, 30, 39),
    ],
  },

  // Dano (físico + elementais + caos + sagrado)
  {
    id: 'dano-fisico-flat',
    key: 'flat-dmg-fis',
    label: '+ # a # de Dano Físico',
    category: 'prefix',
    group: 'dano',
    color: 'fisico',
    description: 'Adiciona dano físico flat aos ataques.',
    tiers: [
      tr(1, 1, 2, 1, 2),
      tr(15, 3, 5, 2, 3),
      tr(30, 6, 9, 3, 5),
      tr(50, 10, 14, 5, 7),
      tr(70, 15, 20, 7, 10),
      tr(85, 21, 28, 10, 14),
    ],
  },
  {
    id: 'dano-fogo-flat',
    key: 'flat-dmg-fogo',
    label: '+ # a # de Dano de Fogo',
    category: 'prefix',
    group: 'dano',
    color: 'fogo',
    description: 'Dano de fogo por golpe em ataques que não são magia. Ignora armadura.',
    tiers: [
      tr(1, 1, 2, 2, 3),
      tr(15, 3, 5, 3, 4),
      tr(30, 6, 9, 4, 6),
      tr(50, 10, 14, 6, 8),
      tr(70, 15, 20, 8, 11),
      tr(85, 21, 27, 11, 15),
    ],
  },
  {
    id: 'dano-gelo-flat',
    key: 'flat-dmg-gelo',
    label: '+ # a # de Dano de Gelo',
    category: 'prefix',
    group: 'dano',
    color: 'gelo',
    description: 'Dano de gelo por golpe em ataques que não são magia.',
    tiers: [
      tr(1, 1, 2, 2, 3),
      tr(15, 3, 5, 3, 4),
      tr(30, 6, 9, 4, 6),
      tr(50, 10, 14, 6, 8),
      tr(70, 15, 20, 8, 11),
      tr(85, 21, 27, 11, 15),
    ],
  },
  {
    id: 'dano-raio-flat',
    key: 'flat-dmg-raio',
    label: '+ # a # de Dano de Raio',
    category: 'prefix',
    group: 'dano',
    color: 'raio',
    description: 'Dano de raio por golpe em ataques que não são magia.',
    tiers: [
      tr(1, 1, 1, 3, 5),
      tr(15, 2, 3, 4, 7),
      tr(30, 4, 6, 6, 10),
      tr(50, 7, 10, 9, 14),
      tr(70, 11, 15, 12, 19),
      tr(85, 16, 21, 16, 26),
    ],
  },
  {
    id: 'dano-caos-flat',
    key: 'flat-dmg-caos',
    label: '+ # a # de Dano de Caos',
    category: 'prefix',
    group: 'dano',
    color: 'caos',
    description: 'Dano de caos por golpe em ataques que não são magia. Ignora armadura.',
    tiers: [
      tr(1, 1, 2, 2, 3),
      tr(15, 3, 5, 3, 4),
      tr(30, 6, 9, 4, 6),
      tr(50, 10, 14, 6, 8),
      tr(70, 15, 20, 8, 11),
      tr(85, 21, 27, 11, 15),
    ],
  },
  {
    id: 'dano-sagrado-flat',
    key: 'flat-dmg-sagrado',
    label: '+ # a # de Dano Sagrado',
    category: 'prefix',
    group: 'dano',
    color: 'sagrado',
    description: 'Dano sagrado por golpe em ataques que não são magia.',
    tiers: [
      tr(1, 1, 2, 2, 3),
      tr(15, 3, 5, 3, 4),
      tr(30, 6, 9, 4, 6),
      tr(50, 10, 14, 6, 8),
      tr(70, 15, 20, 8, 11),
      tr(85, 21, 27, 11, 15),
    ],
  },

  // Defesa flat
  {
    id: 'armadura-flat',
    key: 'flat-armadura',
    label: '+ # de Armadura',
    category: 'prefix',
    group: 'defesa',
    color: 'fisico',
    description: 'Reduz dano físico recebido — eficácia varia conforme tamanho do golpe.',
    tiers: [
      t(1, 8, 15),
      t(12, 16, 25),
      t(25, 26, 40),
      t(40, 41, 60),
      t(55, 61, 85),
      t(70, 86, 115),
      t(85, 116, 150),
    ],
  },
  {
    id: 'evasao-flat',
    key: 'flat-evasao',
    label: '+ # de Evasão',
    category: 'prefix',
    group: 'defesa',
    color: 'agilidade',
    description: 'Aumenta a Evasão — chance de evitar ataques físicos inimigos.',
    tiers: [
      t(1, 8, 15),
      t(12, 16, 25),
      t(25, 26, 40),
      t(40, 41, 60),
      t(55, 61, 85),
      t(70, 86, 115),
      t(85, 116, 150),
    ],
  },
  {
    id: 'escudo-energia-flat',
    key: 'flat-escudo-energia',
    label: '+ # de Escudo de Energia',
    category: 'prefix',
    group: 'vital',
    color: 'energia',
    description: 'Vital arcano — todo dano consome o Escudo antes da Vida. Restaura ao fim do combate.',
    tiers: [
      t(1, 5, 9),
      t(12, 10, 16),
      t(25, 17, 26),
      t(40, 27, 40),
      t(55, 41, 56),
      t(70, 57, 75),
      t(85, 76, 100),
    ],
  },

  // Magia
  {
    id: 'dmg-magia-pct',
    key: 'pct-dmg-magia',
    label: '+ #% de Dano de Magias',
    category: 'suffix',
    group: 'magia',
    color: 'intelecto',
    description: 'Aumenta o dano de todas as magias em percentual.',
    tiers: [
      t(1, 4, 7),
      t(20, 8, 11),
      t(40, 12, 15),
      t(60, 16, 20),
      t(80, 21, 25),
    ],
  },
  {
    id: 'dmg-fogo-magia-pct',
    key: 'pct-dmg-fogo-magia',
    label: '+ #% de Dano de Magias de Fogo',
    category: 'suffix',
    group: 'magia',
    color: 'fogo',
    description: 'Aumenta o dano de magias de fogo em percentual.',
    tiers: [
      t(1, 6, 10),
      t(20, 11, 15),
      t(40, 16, 20),
      t(60, 21, 26),
      t(80, 27, 32),
    ],
  },
  {
    id: 'dmg-gelo-magia-pct',
    key: 'pct-dmg-gelo-magia',
    label: '+ #% de Dano de Magias de Gelo',
    category: 'suffix',
    group: 'magia',
    color: 'gelo',
    description: 'Aumenta o dano de magias de gelo em percentual.',
    tiers: [
      t(1, 6, 10),
      t(20, 11, 15),
      t(40, 16, 20),
      t(60, 21, 26),
      t(80, 27, 32),
    ],
  },
  {
    id: 'dmg-raio-magia-pct',
    key: 'pct-dmg-raio-magia',
    label: '+ #% de Dano de Magias de Raio',
    category: 'suffix',
    group: 'magia',
    color: 'raio',
    description: 'Aumenta o dano de magias de raio em percentual.',
    tiers: [
      t(1, 6, 10),
      t(20, 11, 15),
      t(40, 16, 20),
      t(60, 21, 26),
      t(80, 27, 32),
    ],
  },
  {
    id: 'dmg-caos-magia-pct',
    key: 'pct-dmg-caos-magia',
    label: '+ #% de Dano de Magias de Caos',
    category: 'suffix',
    group: 'magia',
    color: 'caos',
    description: 'Aumenta o dano de magias de caos em percentual.',
    tiers: [
      t(1, 5, 9),
      t(20, 10, 14),
      t(40, 15, 19),
      t(60, 20, 24),
      t(80, 25, 30),
    ],
  },
  {
    id: 'dmg-sagrado-magia-pct',
    key: 'pct-dmg-sagrado-magia',
    label: '+ #% de Dano de Magias Sagradas',
    category: 'suffix',
    group: 'magia',
    color: 'sagrado',
    description: 'Aumenta o dano de magias sagradas em percentual.',
    tiers: [
      t(1, 5, 9),
      t(20, 10, 14),
      t(40, 15, 19),
      t(60, 20, 24),
      t(80, 25, 30),
    ],
  },

  // Sustain (regen) — em PoE flat regen é prefix
  {
    id: 'regen-vida',
    key: 'flat-regen-vida',
    label: '+ # de Regeneração de Vida por segundo',
    category: 'prefix',
    group: 'sustain',
    color: 'vida',
    description: 'Recupera Vida por segundo — fora e dentro do combate.',
    tiers: [
      t(1, 1, 2),
      t(25, 3, 4),
      t(50, 5, 7),
      t(75, 8, 10),
    ],
  },
  {
    id: 'regen-mana',
    key: 'flat-regen-mana',
    label: '+ # de Regeneração de Mana por segundo',
    category: 'prefix',
    group: 'sustain',
    color: 'mana',
    description: 'Recupera Mana por segundo — fora e dentro do combate.',
    tiers: [
      t(1, 1, 1),
      t(25, 2, 2),
      t(50, 3, 4),
      t(75, 5, 6),
    ],
  },

  // ════════════════ SUFIXOS — utilidade ════════════════

  // Atributos
  {
    id: 'forca',
    key: 'flat-forca',
    label: '+ # de Força',
    category: 'suffix',
    group: 'atributo',
    color: 'forca',
    description: 'Cada ponto aumenta o Dano Físico em +1% multiplicativo (sobre min e max da arma).',
    tiers: [
      t(1, 1, 3),
      t(15, 4, 6),
      t(30, 7, 9),
      t(50, 10, 13),
      t(70, 14, 17),
      t(85, 18, 22),
    ],
  },
  {
    id: 'agilidade',
    key: 'flat-agilidade',
    label: '+ # de Agilidade',
    category: 'suffix',
    group: 'atributo',
    color: 'agilidade',
    description: 'Cada ponto dá +2 Esquiva e +2 Evasão.',
    tiers: [
      t(1, 1, 3),
      t(15, 4, 6),
      t(30, 7, 9),
      t(50, 10, 13),
      t(70, 14, 17),
      t(85, 18, 22),
    ],
  },
  {
    id: 'intelecto',
    key: 'flat-intelecto',
    label: '+ # de Intelecto',
    category: 'suffix',
    group: 'atributo',
    color: 'intelecto',
    description: 'Cada ponto dá +5 Mana Máxima.',
    tiers: [
      t(1, 1, 3),
      t(15, 4, 6),
      t(30, 7, 9),
      t(50, 10, 13),
      t(70, 14, 17),
      t(85, 18, 22),
    ],
  },
  {
    id: 'todos-atributos',
    key: 'flat-todos-atributos',
    label: '+ # de Todos os Atributos',
    category: 'suffix',
    group: 'atributo',
    color: 'comum',
    description: 'Soma o valor em Força, Agilidade e Intelecto ao mesmo tempo.',
    tiers: [
      t(1, 1, 2),
      t(25, 3, 4),
      t(50, 5, 7),
      t(75, 8, 10),
    ],
  },

  // Resistências
  {
    id: 'res-fogo',
    key: 'pct-res-fogo',
    label: '+ #% de Resistência ao Fogo',
    category: 'suffix',
    group: 'resistencia',
    color: 'fogo',
    description: 'Diminui o dano de fogo recebido. Limite: 75%.',
    tiers: [
      t(1, 5, 9),
      t(15, 10, 14),
      t(30, 15, 19),
      t(50, 20, 24),
      t(70, 25, 30),
      t(85, 31, 36),
    ],
  },
  {
    id: 'res-gelo',
    key: 'pct-res-gelo',
    label: '+ #% de Resistência ao Gelo',
    category: 'suffix',
    group: 'resistencia',
    color: 'gelo',
    description: 'Diminui o dano de gelo recebido. Limite: 75%.',
    tiers: [
      t(1, 5, 9),
      t(15, 10, 14),
      t(30, 15, 19),
      t(50, 20, 24),
      t(70, 25, 30),
      t(85, 31, 36),
    ],
  },
  {
    id: 'res-raio',
    key: 'pct-res-raio',
    label: '+ #% de Resistência ao Raio',
    category: 'suffix',
    group: 'resistencia',
    color: 'raio',
    description: 'Diminui o dano de raio recebido. Limite: 75%.',
    tiers: [
      t(1, 5, 9),
      t(15, 10, 14),
      t(30, 15, 19),
      t(50, 20, 24),
      t(70, 25, 30),
      t(85, 31, 36),
    ],
  },
  {
    id: 'res-caos',
    key: 'pct-res-caos',
    label: '+ #% de Resistência ao Caos',
    category: 'suffix',
    group: 'resistencia',
    color: 'caos',
    description: 'Diminui o dano de caos recebido. Limite: 75%.',
    tiers: [
      t(1, 3, 6),
      t(15, 7, 10),
      t(30, 11, 15),
      t(50, 16, 20),
      t(70, 21, 25),
      t(85, 26, 30),
    ],
  },
  {
    id: 'res-sagrado',
    key: 'pct-res-sagrado',
    label: '+ #% de Resistência ao Sagrado',
    category: 'suffix',
    group: 'resistencia',
    color: 'sagrado',
    description: 'Diminui o dano sagrado recebido. Limite: 75%.',
    tiers: [
      t(1, 3, 6),
      t(15, 7, 10),
      t(30, 11, 15),
      t(50, 16, 20),
      t(70, 21, 25),
      t(85, 26, 30),
    ],
  },
  {
    id: 'res-fisica',
    key: 'pct-res-fisica',
    label: '+ #% de Resistência Física',
    category: 'suffix',
    group: 'resistencia',
    color: 'fisico',
    description: 'Diminui o dano físico recebido em % após a Armadura. Só itens. Limite: 75%.',
    tiers: [
      t(1, 2, 4),
      t(25, 5, 7),
      t(50, 8, 10),
      t(75, 11, 14),
    ],
  },

  // Velocidade
  {
    id: 'vel-ataque',
    key: 'pct-vel-ataque',
    label: '+ #% de Velocidade de Ataque',
    category: 'suffix',
    group: 'velocidade',
    color: 'agilidade',
    description: 'Reduz o Tempo de Ataque em % — 10% mais rápido = tempo ÷ 1,10.',
    tiers: [
      t(1, 3, 5),
      t(20, 6, 8),
      t(40, 9, 11),
      t(60, 12, 15),
      t(80, 16, 20),
    ],
  },
  {
    id: 'red-tempo-conjuracao',
    key: 'pct-red-tempo-conjuracao',
    label: '+ #% de Redução do Tempo de Conjuração',
    category: 'suffix',
    group: 'magia',
    color: 'intelecto',
    description: 'Reduz em % o tempo em segundos para conjurar magias (armas e feitiços). Cap 95%.',
    tiers: [
      t(1, 3, 5),
      t(20, 6, 8),
      t(40, 9, 11),
      t(60, 12, 15),
      t(80, 16, 20),
    ],
  },

  // Crítico
  {
    id: 'chance-critico',
    key: 'pct-crit-chance',
    label: '+ #% de Chance de Crítico',
    category: 'suffix',
    group: 'critico',
    color: 'critico',
    description: 'Chance de crítico em golpes físicos que conectam. Cap: 100%.',
    tiers: [
      t(1, 2, 3),
      t(25, 4, 5),
      t(50, 6, 8),
      t(75, 9, 12),
    ],
  },
  {
    id: 'mult-critico',
    key: 'pct-crit-mult',
    label: '+ #% de Multiplicador de Crítico',
    category: 'suffix',
    group: 'critico',
    color: 'critico',
    description: 'Aumenta o multiplicador de crítico — aplica no dano antes da armadura do alvo.',
    tiers: [
      t(1, 8, 12),
      t(20, 13, 18),
      t(40, 19, 25),
      t(60, 26, 33),
      t(80, 34, 42),
    ],
  },

  // Mana — eficiência
  {
    id: 'eficiencia-mana',
    key: 'pct-eficiencia-mana',
    label: '+ #% de Eficiência de Mana',
    category: 'suffix',
    group: 'mana',
    color: 'mana',
    description: 'Reduz em % o custo de mana de habilidades e magias. Cap 95%.',
    tiers: [
      t(1, 3, 5),
      t(25, 6, 8),
      t(50, 9, 12),
      t(75, 13, 16),
    ],
  },

  // Roubo
  {
    id: 'roubo-vida',
    key: 'pct-roubo-vida',
    label: '+ #% de Roubo de Vida',
    category: 'suffix',
    group: 'roubo',
    color: 'vida',
    description: 'Recupera vida igual a % do dano efetivo causado (pós-armadura do alvo). Só itens.',
    tiers: [
      t(1, 1, 1),
      t(35, 2, 3),
      t(70, 4, 5),
    ],
  },
  {
    id: 'roubo-mana',
    key: 'pct-roubo-mana',
    label: '+ #% de Roubo de Mana',
    category: 'suffix',
    group: 'roubo',
    color: 'mana',
    description: 'Recupera mana igual a % do dano efetivo causado (pós-armadura do alvo). Só itens.',
    tiers: [
      t(1, 1, 1),
      t(35, 2, 3),
      t(70, 4, 5),
    ],
  },

  // Defesa secundária (sufixo)
  {
    id: 'bloqueio',
    key: 'pct-bloqueio',
    label: '+ #% de Chance de Bloqueio',
    category: 'suffix',
    group: 'defesa',
    color: 'defesa',
    description: 'Chance de bloquear um ataque físico que conectou — anula 100% do dano. Requer escudo. Limite: 75%.',
    tiers: [
      t(1, 3, 5),
      t(25, 6, 8),
      t(50, 9, 12),
      t(75, 13, 16),
    ],
  },

  // Precisão
  {
    id: 'acerto',
    key: 'flat-acerto',
    label: '+ # de Acerto',
    category: 'suffix',
    group: 'precisao',
    color: 'agilidade',
    description: 'Aumenta o Acerto — chance de conectar ataques físicos contra a Evasão do alvo.',
    tiers: [
      t(1, 8, 15),
      t(15, 16, 25),
      t(30, 26, 40),
      t(50, 41, 60),
      t(70, 61, 85),
      t(85, 86, 120),
    ],
  },

  // Penetração
  {
    id: 'pen-fogo',
    key: 'pct-pen-fogo',
    label: '+ #% de Penetração de Fogo',
    category: 'suffix',
    group: 'penetracao',
    color: 'fogo',
    description: 'Ignora parte da Resistência ao Fogo do alvo. 20% pen. vs 20% res. = sem resistência.',
    tiers: [
      t(1, 4, 7),
      t(25, 8, 12),
      t(50, 13, 18),
      t(75, 19, 25),
    ],
  },
  {
    id: 'pen-gelo',
    key: 'pct-pen-gelo',
    label: '+ #% de Penetração de Gelo',
    category: 'suffix',
    group: 'penetracao',
    color: 'gelo',
    description: 'Ignora parte da Resistência ao Gelo do alvo. Pen. reduz a res. efetiva antes do cálculo.',
    tiers: [
      t(1, 4, 7),
      t(25, 8, 12),
      t(50, 13, 18),
      t(75, 19, 25),
    ],
  },
  {
    id: 'pen-raio',
    key: 'pct-pen-raio',
    label: '+ #% de Penetração de Raio',
    category: 'suffix',
    group: 'penetracao',
    color: 'raio',
    description: 'Ignora parte da Resistência ao Raio do alvo. Pen. reduz a res. efetiva antes do cálculo.',
    tiers: [
      t(1, 4, 7),
      t(25, 8, 12),
      t(50, 13, 18),
      t(75, 19, 25),
    ],
  },
  {
    id: 'pen-caos',
    key: 'pct-pen-caos',
    label: '+ #% de Penetração de Caos',
    category: 'suffix',
    group: 'penetracao',
    color: 'caos',
    description: 'Ignora parte da Resistência ao Caos do alvo. Pen. reduz a res. efetiva antes do cálculo.',
    tiers: [
      t(1, 3, 6),
      t(25, 7, 10),
      t(50, 11, 15),
      t(75, 16, 21),
    ],
  },
  {
    id: 'pen-sagrado',
    key: 'pct-pen-sagrado',
    label: '+ #% de Penetração Sagrada',
    category: 'suffix',
    group: 'penetracao',
    color: 'sagrado',
    description: 'Ignora parte da Resistência ao Sagrado do alvo. Pen. reduz a res. efetiva antes do cálculo.',
    tiers: [
      t(1, 3, 6),
      t(25, 7, 10),
      t(50, 11, 15),
      t(75, 16, 21),
    ],
  },
];

/** Tiers elegíveis pra um item level — tiers com `ilvl` ≤ ilvl do item. */
export function getEligibleTiers(mod: ItemModDef, ilvl: number): ModTierDef[] {
  return mod.tiers.filter((tier) => tier.ilvl <= ilvl);
}

/**
 * Pesos de sorteio pros tiers elegíveis — DECRESCENTES: o tier mais alto
 * elegível é o mais raro, e cada tier abaixo é 2× mais comum que o de cima.
 * Ex.: 4 elegíveis → pesos [8, 4, 2, 1] → T-máx tem 1/15 (~6,7%) de chance.
 * O ilvl só define o TETO; rolar o tier máximo continua sendo o "good roll".
 */
export function getTierWeights(eligibleCount: number): number[] {
  return Array.from({ length: eligibleCount }, (_, i) => 2 ** (eligibleCount - 1 - i));
}

/** Sorteia o tier de um afixo pra um item level (pesos decrescentes). */
export function rollTier(mod: ItemModDef, ilvl = 100): ModTierDef {
  const eligible = getEligibleTiers(mod, ilvl);
  if (eligible.length === 0) return mod.tiers[0];
  const weights = getTierWeights(eligible.length);
  let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < eligible.length; i++) {
    roll -= weights[i];
    if (roll < 0) return eligible[i];
  }
  return eligible[eligible.length - 1];
}

/**
 * Rola uma instância COMPLETA do afixo pra um item level: tier via `rollTier`
 * (pesos decrescentes), valor dentro do range do tier, e `effect` real — o
 * ItemStat resultante entra num Item e alimenta `computeDerivedStats`.
 */
export function rollModStat(mod: ItemModDef, ilvl = 100): ItemStat {
  const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  const tier = rollTier(mod, ilvl);
  if (tier.rollRange) {
    const min = r(tier.rollRange.min[0], tier.rollRange.min[1]);
    const max = min + r(tier.rollRange.max[0], tier.rollRange.max[1]);
    return {
      text: mod.label.replace('# a #', `${min} a ${max}`),
      color: mod.color,
      kind: mod.category,
      effect: { key: mod.key, value: min, max },
    };
  }
  const v = tier.roll ? r(tier.roll[0], tier.roll[1]) : 0;
  return {
    text: mod.label.replace('#', String(v)),
    color: mod.color,
    kind: mod.category,
    effect: { key: mod.key, value: v },
  };
}

/**
 * Sorteia uma instância textual do mod (só o texto — usado pela Forja sandbox).
 * `ilvl` default 100 = todos os tiers liberados.
 */
export function rollMod(mod: ItemModDef, ilvl = 100): string {
  return rollModStat(mod, ilvl).text;
}

/**
 * Range de exibição de um tier: [menor, maior] valor possível.
 * Pra `rollRange`, o maior é min máximo + delta máximo.
 */
export function tierDisplayRange(tier: ModTierDef): [number, number] {
  if (tier.rollRange) {
    return [tier.rollRange.min[0], tier.rollRange.min[1] + tier.rollRange.max[1]];
  }
  return tier.roll ?? [0, 0];
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
