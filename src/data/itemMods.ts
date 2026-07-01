import type { ModColor, StatKey, ItemStat } from '../types';

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
 * Fragmento de nome pro afixo compor o nome do item procedural (estilo PoE).
 * Prefixos precisam de forma masculina e feminina (o nome da base tem gênero:
 * "Espada" é feminina, "Machado" masculino). Sufixos são frases invariáveis
 * do tipo "do Lince" / "das Chamas" — não concordam com a base.
 */
export interface ModNameFragment {
  m: string;
  f: string;
}

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
   * Chave do efeito numérico que este mod aplica na ficha. O gerador procedural
   * (`rollModStat`) usa isso pra montar o `ItemStatEffect` real do item.
   */
  statKey: StatKey;
  /**
   * Fragmento pra compor o nome do item procedural. Prefixos usam `namePrefix`
   * (m/f), sufixos usam `nameSuffix` (frase "do/da …"). Opcional — mods sem
   * fragmento simplesmente não contribuem pro nome.
   */
  namePrefix?: ModNameFragment;
  nameSuffix?: string;
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
 * Catálogo mestre de mods — a fonte de onde itens sorteiam afixos. O Códice lê
 * daqui (label/description); o gerador procedural (`lib/lootgen.ts`) usa
 * `statKey` + `roll`/`rollRange` pra montar o efeito numérico real.
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
    statKey: 'flat-vida',
    namePrefix: { m: 'Robusto', f: 'Robusta' },
    roll: [15, 60],
  },
  {
    id: 'mana-flat',
    label: '+ # de Mana',
    category: 'prefix',
    group: 'vital',
    color: 'mana',
    description: 'Aumenta a Mana máxima do personagem em valor fixo.',
    statKey: 'flat-mana',
    namePrefix: { m: 'Arcano', f: 'Arcana' },
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
    statKey: 'flat-dmg-fis',
    namePrefix: { m: 'Brutal', f: 'Brutal' },
    rollRange: { min: [2, 6], max: [3, 6] },
  },
  {
    id: 'dano-fogo-flat',
    label: '+ # a # de Dano de Fogo',
    category: 'prefix',
    group: 'dano',
    color: 'fogo',
    description: 'Dano de fogo por golpe em ataques que não são magia. Ignora armadura.',
    statKey: 'flat-dmg-fogo',
    namePrefix: { m: 'Flamejante', f: 'Flamejante' },
    rollRange: { min: [1, 5], max: [3, 7] },
  },
  {
    id: 'dano-gelo-flat',
    label: '+ # a # de Dano de Gelo',
    category: 'prefix',
    group: 'dano',
    color: 'gelo',
    description: 'Dano de gelo por golpe em ataques que não são magia.',
    statKey: 'flat-dmg-gelo',
    namePrefix: { m: 'Gélido', f: 'Gélida' },
    rollRange: { min: [1, 5], max: [3, 7] },
  },
  {
    id: 'dano-raio-flat',
    label: '+ # a # de Dano de Raio',
    category: 'prefix',
    group: 'dano',
    color: 'raio',
    description: 'Dano de raio por golpe em ataques que não são magia.',
    statKey: 'flat-dmg-raio',
    namePrefix: { m: 'Fulminante', f: 'Fulminante' },
    rollRange: { min: [1, 4], max: [4, 9] },
  },
  {
    id: 'dano-caos-flat',
    label: '+ # a # de Dano de Caos',
    category: 'prefix',
    group: 'dano',
    color: 'caos',
    description: 'Dano de caos por golpe em ataques que não são magia. Ignora armadura.',
    statKey: 'flat-dmg-caos',
    namePrefix: { m: 'Corrompido', f: 'Corrompida' },
    rollRange: { min: [2, 5], max: [3, 6] },
  },
  {
    id: 'dano-sagrado-flat',
    label: '+ # a # de Dano Sagrado',
    category: 'prefix',
    group: 'dano',
    color: 'sagrado',
    description: 'Dano sagrado por golpe em ataques que não são magia.',
    statKey: 'flat-dmg-sagrado',
    namePrefix: { m: 'Radiante', f: 'Radiante' },
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
    statKey: 'flat-armadura',
    namePrefix: { m: 'Blindado', f: 'Blindada' },
    roll: [10, 40],
  },
  {
    id: 'evasao-flat',
    label: '+ # de Evasão',
    category: 'prefix',
    group: 'defesa',
    color: 'agilidade',
    description: 'Aumenta a Evasão — chance de evitar ataques físicos inimigos.',
    statKey: 'flat-evasao',
    namePrefix: { m: 'Ágil', f: 'Ágil' },
    roll: [10, 40],
  },

  // Magia
  {
    id: 'dmg-magia-pct',
    label: '+ #% de Dano de Magias',
    category: 'suffix',
    group: 'magia',
    color: 'intelecto',
    description: 'Aumenta o dano de todas as magias em percentual.',
    statKey: 'pct-dmg-magia',
    nameSuffix: 'do Feiticeiro',
    roll: [4, 14],
  },
  {
    id: 'dmg-fogo-magia-pct',
    label: '+ #% de Dano de Magias de Fogo',
    category: 'suffix',
    group: 'magia',
    color: 'fogo',
    description: 'Aumenta o dano de magias de fogo em percentual.',
    statKey: 'pct-dmg-fogo-magia',
    nameSuffix: 'das Chamas',
    roll: [6, 20],
  },
  {
    id: 'dmg-gelo-magia-pct',
    label: '+ #% de Dano de Magias de Gelo',
    category: 'suffix',
    group: 'magia',
    color: 'gelo',
    description: 'Aumenta o dano de magias de gelo em percentual.',
    statKey: 'pct-dmg-gelo-magia',
    nameSuffix: 'do Inverno',
    roll: [6, 20],
  },
  {
    id: 'dmg-raio-magia-pct',
    label: '+ #% de Dano de Magias de Raio',
    category: 'suffix',
    group: 'magia',
    color: 'raio',
    description: 'Aumenta o dano de magias de raio em percentual.',
    statKey: 'pct-dmg-raio-magia',
    nameSuffix: 'da Tempestade',
    roll: [6, 20],
  },
  {
    id: 'dmg-caos-magia-pct',
    label: '+ #% de Dano de Magias de Caos',
    category: 'suffix',
    group: 'magia',
    color: 'caos',
    description: 'Aumenta o dano de magias de caos em percentual.',
    statKey: 'pct-dmg-caos-magia',
    nameSuffix: 'da Praga',
    roll: [5, 18],
  },
  {
    id: 'dmg-sagrado-magia-pct',
    label: '+ #% de Dano de Magias Sagradas',
    category: 'suffix',
    group: 'magia',
    color: 'sagrado',
    description: 'Aumenta o dano de magias sagradas em percentual.',
    statKey: 'pct-dmg-sagrado-magia',
    nameSuffix: 'da Aurora',
    roll: [5, 18],
  },

  // Sustain (regen) — em PoE flat regen é prefix
  {
    id: 'regen-vida',
    label: '+ # de Regeneração de Vida por segundo',
    category: 'prefix',
    group: 'sustain',
    color: 'vida',
    description: 'Recupera Vida por segundo — fora e dentro do combate.',
    statKey: 'flat-regen-vida',
    namePrefix: { m: 'Restaurador', f: 'Restauradora' },
    roll: [1, 5],
  },
  {
    id: 'regen-mana',
    label: '+ # de Regeneração de Mana por segundo',
    category: 'prefix',
    group: 'sustain',
    color: 'mana',
    description: 'Recupera Mana por segundo — fora e dentro do combate.',
    statKey: 'flat-regen-mana',
    namePrefix: { m: 'Meditativo', f: 'Meditativa' },
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
    description: 'Cada ponto aumenta o Dano Físico em +1% multiplicativo (sobre min e max da arma).',
    statKey: 'flat-forca',
    nameSuffix: 'do Touro',
    roll: [1, 8],
  },
  {
    id: 'agilidade',
    label: '+ # de Agilidade',
    category: 'suffix',
    group: 'atributo',
    color: 'agilidade',
    description: 'Cada ponto dá +2 Esquiva e +2 Evasão.',
    statKey: 'flat-agilidade',
    nameSuffix: 'do Lince',
    roll: [1, 8],
  },
  {
    id: 'intelecto',
    label: '+ # de Intelecto',
    category: 'suffix',
    group: 'atributo',
    color: 'intelecto',
    description: 'Cada ponto dá +5 Mana Máxima.',
    statKey: 'flat-intelecto',
    nameSuffix: 'da Coruja',
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
    statKey: 'pct-res-fogo',
    nameSuffix: 'da Salamandra',
    roll: [10, 30],
  },
  {
    id: 'res-gelo',
    label: '+ #% de Resistência ao Gelo',
    category: 'suffix',
    group: 'resistencia',
    color: 'gelo',
    description: 'Diminui o dano de gelo recebido. Limite: 75%.',
    statKey: 'pct-res-gelo',
    nameSuffix: 'da Foca',
    roll: [10, 30],
  },
  {
    id: 'res-raio',
    label: '+ #% de Resistência ao Raio',
    category: 'suffix',
    group: 'resistencia',
    color: 'raio',
    description: 'Diminui o dano de raio recebido. Limite: 75%.',
    statKey: 'pct-res-raio',
    nameSuffix: 'do Condor',
    roll: [10, 30],
  },
  {
    id: 'res-caos',
    label: '+ #% de Resistência ao Caos',
    category: 'suffix',
    group: 'resistencia',
    color: 'caos',
    description: 'Diminui o dano de caos recebido. Limite: 75%.',
    statKey: 'pct-res-caos',
    nameSuffix: 'da Hidra',
    roll: [5, 20],
  },
  {
    id: 'res-sagrado',
    label: '+ #% de Resistência ao Sagrado',
    category: 'suffix',
    group: 'resistencia',
    color: 'sagrado',
    description: 'Diminui o dano sagrado recebido. Limite: 75%.',
    statKey: 'pct-res-sagrado',
    nameSuffix: 'do Mártir',
    roll: [5, 20],
  },
  {
    id: 'res-fisica',
    label: '+ #% de Resistência Física',
    category: 'suffix',
    group: 'resistencia',
    color: 'fisico',
    description: 'Diminui o dano físico recebido em % após a Armadura. Só itens. Limite: 75%.',
    statKey: 'pct-res-fisica',
    nameSuffix: 'do Rinoceronte',
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
    statKey: 'pct-vel-ataque',
    nameSuffix: 'da Víbora',
    roll: [4, 12],
  },
  {
    id: 'red-tempo-conjuracao',
    label: '+ #% de Redução do Tempo de Conjuração',
    category: 'suffix',
    group: 'magia',
    color: 'intelecto',
    description: 'Reduz em % o tempo em segundos para conjurar magias (armas e feitiços). Cap 95%.',
    statKey: 'pct-red-tempo-conjuracao',
    nameSuffix: 'do Conjurador',
    roll: [4, 12],
  },

  // Crítico
  {
    id: 'chance-critico',
    label: '+ #% de Chance de Crítico',
    category: 'suffix',
    group: 'critico',
    color: 'critico',
    description: 'Chance de crítico em golpes físicos que conectam. Cap: 100%.',
    statKey: 'pct-crit-chance',
    nameSuffix: 'do Falcão',
    roll: [2, 8],
  },
  {
    id: 'mult-critico',
    label: '+ #% de Multiplicador de Crítico',
    category: 'suffix',
    group: 'critico',
    color: 'critico',
    description: 'Aumenta o multiplicador de crítico — aplica no dano antes da armadura do alvo.',
    statKey: 'pct-crit-mult',
    nameSuffix: 'do Carrasco',
    roll: [10, 30],
  },

  // Mana — eficiência
  {
    id: 'eficiencia-mana',
    label: '+ #% de Eficiência de Mana',
    category: 'suffix',
    group: 'mana',
    color: 'mana',
    description: 'Reduz em % o custo de mana de habilidades e magias. Cap 95%.',
    statKey: 'pct-eficiencia-mana',
    nameSuffix: 'da Sabedoria',
    roll: [3, 12],
  },

  // Roubo
  {
    id: 'roubo-vida',
    label: '+ #% de Roubo de Vida',
    category: 'suffix',
    group: 'roubo',
    color: 'vida',
    description: 'Recupera vida igual a % do dano efetivo causado (pós-armadura do alvo). Só itens.',
    statKey: 'pct-roubo-vida',
    nameSuffix: 'da Sanguessuga',
    roll: [1, 4],
  },
  {
    id: 'roubo-mana',
    label: '+ #% de Roubo de Mana',
    category: 'suffix',
    group: 'roubo',
    color: 'mana',
    description: 'Recupera mana igual a % do dano efetivo causado (pós-armadura do alvo). Só itens.',
    statKey: 'pct-roubo-mana',
    nameSuffix: 'do Vampiro',
    roll: [1, 4],
  },

  // Defesa secundária (sufixo)
  {
    id: 'bloqueio',
    label: '+ #% de Chance de Bloqueio',
    category: 'suffix',
    group: 'defesa',
    color: 'defesa',
    description: 'Chance de bloquear um ataque físico que conectou — anula 100% do dano. Requer escudo. Limite: 75%.',
    statKey: 'pct-bloqueio',
    nameSuffix: 'do Guardião',
    roll: [3, 10],
  },

  // Precisão
  {
    id: 'acerto',
    label: '+ # de Acerto',
    category: 'suffix',
    group: 'precisao',
    color: 'agilidade',
    description: 'Aumenta o Acerto — chance de conectar ataques físicos contra a Evasão do alvo.',
    statKey: 'flat-acerto',
    nameSuffix: 'da Águia',
    roll: [10, 50],
  },

  // Penetração
  {
    id: 'pen-fogo',
    label: '+ #% de Penetração de Fogo',
    category: 'suffix',
    group: 'penetracao',
    color: 'fogo',
    description: 'Ignora parte da Resistência ao Fogo do alvo. 20% pen. vs 20% res. = sem resistência.',
    statKey: 'pct-pen-fogo',
    nameSuffix: 'do Incêndio',
    roll: [5, 18],
  },
  {
    id: 'pen-gelo',
    label: '+ #% de Penetração de Gelo',
    category: 'suffix',
    group: 'penetracao',
    color: 'gelo',
    description: 'Ignora parte da Resistência ao Gelo do alvo. Pen. reduz a res. efetiva antes do cálculo.',
    statKey: 'pct-pen-gelo',
    nameSuffix: 'da Avalanche',
    roll: [5, 18],
  },
  {
    id: 'pen-raio',
    label: '+ #% de Penetração de Raio',
    category: 'suffix',
    group: 'penetracao',
    color: 'raio',
    description: 'Ignora parte da Resistência ao Raio do alvo. Pen. reduz a res. efetiva antes do cálculo.',
    statKey: 'pct-pen-raio',
    nameSuffix: 'do Trovão',
    roll: [5, 18],
  },
  {
    id: 'pen-caos',
    label: '+ #% de Penetração de Caos',
    category: 'suffix',
    group: 'penetracao',
    color: 'caos',
    description: 'Ignora parte da Resistência ao Caos do alvo. Pen. reduz a res. efetiva antes do cálculo.',
    statKey: 'pct-pen-caos',
    nameSuffix: 'da Corrosão',
    roll: [4, 15],
  },
  {
    id: 'pen-sagrado',
    label: '+ #% de Penetração Sagrada',
    category: 'suffix',
    group: 'penetracao',
    color: 'sagrado',
    description: 'Ignora parte da Resistência ao Sagrado do alvo. Pen. reduz a res. efetiva antes do cálculo.',
    statKey: 'pct-pen-sagrado',
    nameSuffix: 'do Juízo',
    roll: [4, 15],
  },
];

function rollBetween(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

/**
 * Sorteia uma instância textual do mod, substituindo placeholders por valores
 * dentro do range definido em `roll` ou `rollRange`. Retorna o label original
 * se o mod não tiver range (caso impossível em produção).
 */
export function rollMod(mod: ItemModDef): string {
  if (mod.rollRange) {
    const min = rollBetween(mod.rollRange.min[0], mod.rollRange.min[1]);
    const delta = rollBetween(mod.rollRange.max[0], mod.rollRange.max[1]);
    const max = min + delta;
    return mod.label.replace('# a #', `${min} a ${max}`);
  }
  if (mod.roll) {
    const v = rollBetween(mod.roll[0], mod.roll[1]);
    return mod.label.replace('#', String(v));
  }
  return mod.label;
}

/**
 * Sorteia o mod completo — texto exibido + efeito numérico real. Usado pelo
 * gerador procedural (`lib/lootgen.ts`) pra transformar um afixo do catálogo
 * num `ItemStat` que afeta a ficha. Ranges ("+X a Y") viram `value`=min e
 * `max`=max no efeito.
 */
export function rollModStat(mod: ItemModDef): ItemStat {
  const kind = mod.category === 'prefix' ? 'prefix' : 'suffix';
  if (mod.rollRange) {
    const min = rollBetween(mod.rollRange.min[0], mod.rollRange.min[1]);
    const delta = rollBetween(mod.rollRange.max[0], mod.rollRange.max[1]);
    const max = min + delta;
    return {
      text: mod.label.replace('# a #', `${min} a ${max}`),
      color: mod.color,
      kind,
      effect: { key: mod.statKey, value: min, max },
    };
  }
  const value = mod.roll ? rollBetween(mod.roll[0], mod.roll[1]) : 0;
  return {
    text: mod.label.replace('#', String(value)),
    color: mod.color,
    kind,
    effect: { key: mod.statKey, value },
  };
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
