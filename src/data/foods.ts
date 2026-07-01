import type { Item, ItemStat, ItemStatSegment } from '../types';

/**
 * Catálogo de COMIDAS (pratos cozinhados) — consumíveis de buff.
 *
 * Feitas na estação "Cozinhar" (Doroteu, o Padeiro) a partir de Carnes,
 * Verduras e Frutas. Cada prato concede um BUFF TEMPORÁRIO com DURAÇÃO em tempo
 * (30 min a 2 h, escalando por tier — ver TIER_BUFF_DURATION).
 *
 * ⚠️ NOTA DE DEV: o efeito de "comer" ainda NÃO é aplicado — não existe sistema
 * de uso de consumível no jogo. Por ora o buff é só TELEGRAFADO no tooltip (uma
 * linha `ItemStat` colorida, SEM `effect`, portanto não mexe na ficha). Quando o
 * sistema de consumo existir, converter esses textos em efeitos reais. Os
 * valores/durações abaixo são uma PROPOSTA a ser balanceada.
 */

export interface FoodDef {
  item: Item;
  /** Preço padrão de venda em loja (provisório). */
  defaultPrice: number;
  /** Tier de origem (1–5, ~ato de onde vêm os ingredientes). */
  tier: number;
}

/**
 * Duração do buff por tier (~ato). Comida melhor dura mais tempo.
 * PROPOSTA a balancear — o efeito real (contagem do tempo) ainda não existe.
 */
const TIER_BUFF_DURATION: Record<number, string> = {
  1: '30 min',
  2: '45 min',
  3: '1 h',
  4: '1 h 30 min',
  5: '2 h',
};

/**
 * Monta um prato: stackable, não-equipável (slot null), raridade comum.
 *
 * O buff é telegrafado em DUAS linhas `ItemStat` (SEM `effect`, então não mexem
 * na ficha):
 *   1. Efeito — "Ao comer: <valor> <atributo>". "Ao comer:" é neutro; o valor
 *      numérico usa a cor de valor da ficha ('valor' = brass); só o nome do
 *      atributo usa a cor da categoria.
 *   2. Duração — "Duração: <tempo>". "Duração:" neutro; o tempo na cor de valor.
 *
 * @param amount    parte numérica do efeito, com % quando houver (ex: '+5', '+12%').
 * @param attribute nome do atributo/stat (ex: 'Força').
 * @param color     cor da categoria do atributo.
 */
function food(
  tier: number,
  id: string,
  name: string,
  description: string,
  defaultPrice: number,
  amount: string,
  attribute: string,
  color: ItemStat['color'],
): FoodDef {
  const duration = TIER_BUFF_DURATION[tier] ?? '30 min';
  const effectLine: ItemStat = {
    text: `Ao comer: ${amount} ${attribute}`,
    kind: 'base',
    segments: [
      { text: 'Ao comer: ' },
      { text: amount, color: 'valor' },
      { text: ' ' },
      { text: attribute, color },
    ],
  };
  // Na duração, só os NÚMEROS ficam na cor de valor — unidades (min, h) neutras.
  const durationSegments: ItemStatSegment[] = [{ text: 'Duração: ' }];
  for (const part of duration.split(/(\d+)/)) {
    if (part === '') continue;
    durationSegments.push(/^\d+$/.test(part) ? { text: part, color: 'valor' } : { text: part });
  }
  const durationLine: ItemStat = {
    text: `Duração: ${duration}`,
    kind: 'base',
    segments: durationSegments,
  };
  return {
    item: {
      id,
      name,
      slot: null,
      rarity: 'comum',
      stackable: true,
      stack: 1,
      description,
      stats: [effectLine, durationLine],
    },
    defaultPrice,
    tier,
  };
}

const FOODS_LIST: FoodDef[] = [
  // ==========================================================================
  // TIER 1 — Ato I (vales, bosques, campos) · buff dura 30 min
  // ==========================================================================
  food(
    1,
    'prato-ensopado-caca',
    'Ensopado de Caça',
    'Carne de mato cozida lenta com couve, até desmanchar na colher. Enche o peito de coragem antes da estrada.',
    10,
    '+5',
    'Força',
    'forca',
  ),
  food(
    1,
    'prato-espeto-antilope',
    'Espeto de Antílope com Ervas',
    'Lombo magro no espeto, esfregado com agrião picante. Afia os sentidos pro golpe certeiro.',
    11,
    '+5%',
    'Crítico',
    'critico',
  ),
  food(
    1,
    'prato-torta-silvestre',
    'Torta de Frutas Silvestres',
    'Amoras, cerejas e maçã assadas em massa rústica. Doce que faz a jornada render mais.',
    12,
    '+10%',
    'XP',
    'exp',
  ),

  // ==========================================================================
  // TIER 2 — Ato II (profundezas, cavernas) · buff dura 45 min
  // ==========================================================================
  food(
    2,
    'prato-caldo-profundezas',
    'Caldo das Profundezas',
    'Posta pálida fervida com brotos cegos da rocha. Sustenta quem luta longe do sol.',
    18,
    '+8',
    'Força',
    'forca',
  ),
  food(
    2,
    'prato-aranha-grelhada',
    'Abdômen de Aranha Grelhado',
    'Recheio amargo selado no fogo, servido com cardo tenro. Aguça a mira de quem tem estômago.',
    19,
    '+8%',
    'Crítico',
    'critico',
  ),
  food(
    2,
    'prato-geleia-escura',
    'Geleia de Frutas Escuras',
    'Mirtilo e groselha reduzidos a uma pasta densa. Azeda na boca, mas adoça o balanço de XP.',
    20,
    '+15%',
    'XP',
    'exp',
  ),

  // ==========================================================================
  // TIER 3 — Ato III (Mar Sem Sol) · buff dura 1 h
  // ==========================================================================
  food(
    3,
    'prato-ensopado-mar',
    'Ensopado do Mar Sem Sol',
    'Peixe do fundo cozido em caldo espesso de kombu. Encorpado o bastante pra encarar a maré.',
    30,
    '+12',
    'Força',
    'forca',
  ),
  food(
    3,
    'prato-ceviche-enguia',
    'Ceviche de Enguia',
    'Enguia curtida no limão com salsa-do-mar. Formiga na língua e acelera as mãos.',
    31,
    '+8%',
    'Vel. Ataque',
    'agilidade',
  ),
  food(
    3,
    'prato-salada-recife',
    'Salada de Recife com Cítricos',
    'Couve-do-mar e gomos de laranja sobre carne doce de caranguejo. Leve — o corpo agradece na esquiva.',
    32,
    '+12%',
    'Evasão',
    'agilidade',
  ),

  // ==========================================================================
  // TIER 4 — Ato IV (veias de fogo) · buff dura 1 h 30 min
  // ==========================================================================
  food(
    4,
    'prato-churrasco-igneo',
    'Churrasco Ígneo',
    'Cortes já temperados pela própria brasa, servidos com couve das cinzas. Força que arde de dentro pra fora.',
    48,
    '+16',
    'Força',
    'forca',
  ),
  food(
    4,
    'prato-espeto-serpe',
    'Espeto de Serpe Apimentado',
    'Filé de serpente de fogo no espeto, com cardo flamejante. Cada mordida afia o instinto do golpe fatal.',
    49,
    '+12%',
    'Crítico',
    'critico',
  ),
  food(
    4,
    'prato-assado-fenix',
    'Assado de Fênix com Frutas Tropicais',
    'Peito de fênix caramelizado em manga e abacaxi. Renascer nunca teve gosto tão premiado.',
    50,
    '+20%',
    'XP',
    'exp',
  ),

  // ==========================================================================
  // TIER 5 — Ato V (abismo primordial) · buff dura 2 h
  // ==========================================================================
  food(
    5,
    'prato-banquete-abissal',
    'Banquete Abissal',
    'Postas de coisas sem nome guisadas com couve que rebrota sozinha. Um banquete que revida — e fortalece.',
    68,
    '+20',
    'Força',
    'forca',
  ),
  food(
    5,
    'prato-caldo-vazio',
    'Caldo do Vazio',
    'Vísceras do vazio fervidas com cardo do abismo. Desperta uma frieza que não erra o alvo.',
    69,
    '+15%',
    'Crítico',
    'critico',
  ),
  food(
    5,
    'prato-torta-astral',
    'Torta Astral',
    'Carniça caída do céu adoçada com carambola e maracujá. O sabor do que veio de além — e da vitória.',
    70,
    '+30%',
    'XP',
    'exp',
  ),
];

export const FOODS: Record<string, FoodDef> = Object.fromEntries(
  FOODS_LIST.map((d) => [d.item.id, d]),
);

/** Cópia fresca do item (stack 1) — pronta pra virar `result` de receita. */
export function getFood(id: string): Item | null {
  const def = FOODS[id];
  if (!def) return null;
  return {
    ...def.item,
    stack: 1,
    stats: def.item.stats ? def.item.stats.map((s) => ({ ...s })) : undefined,
  };
}

export function getFoodName(id: string): string {
  return FOODS[id]?.item.name ?? id;
}
