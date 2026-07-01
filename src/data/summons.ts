/**
 * Invocações (minions) e magias de invocação — arquétipo necromante.
 *
 * Conceito inicial (a refinar): cetros concedem magias de invocação que trazem
 * mortos-vivos com atributos próprios pro campo. Diferente das magias de
 * cajado/varinha, estas NÃO são ataque básico — são habilidades ativas e
 * custam mana.
 *
 * Os atributos dos minions e os custos aqui são uma BASE provisória; a
 * integração com o combate (IA, escala por nível, duração/limite) virá depois.
 */

/** Papel tático do minion — flavor/organização por enquanto. */
export type MinionRole = 'corpo-a-corpo' | 'à distância' | 'conjurador';

export interface Minion {
  id: string;
  name: string;
  description: string;
  role: MinionRole;
  /** Atributos no nível 1 — escala futura ainda a definir. */
  vida: number;
  danoMin: number;
  danoMax: number;
}

export const MINIONS: Record<string, Minion> = {
  'esqueleto-guerreiro': {
    id: 'esqueleto-guerreiro',
    name: 'Esqueleto Guerreiro',
    description: 'Ossos remontados que ainda empunham uma lâmina enferrujada. Avança sem medo — não tem o que temer.',
    role: 'corpo-a-corpo',
    vida: 14,
    danoMin: 2,
    danoMax: 4,
  },
  'esqueleto-arqueiro': {
    id: 'esqueleto-arqueiro',
    name: 'Esqueleto Arqueiro',
    description: 'Mira com olhos vazios e nunca cansa de esticar a corda. Ataca de longe enquanto os outros seguram a linha.',
    role: 'à distância',
    vida: 9,
    danoMin: 3,
    danoMax: 5,
  },
  'esqueleto-mago': {
    id: 'esqueleto-mago',
    name: 'Mago Esqueleto',
    description: 'Um conjurador que a morte não calou. Lança fragmentos de magia que sobraram em sua memória apodrecida.',
    role: 'conjurador',
    vida: 7,
    danoMin: 4,
    danoMax: 7,
  },
  'esqueleto-bruto': {
    id: 'esqueleto-bruto',
    name: 'Bruto Esqueleto',
    description: 'Montado a partir de muitos corpos num só. Lento, enorme e difícil de derrubar de novo.',
    role: 'corpo-a-corpo',
    vida: 24,
    danoMin: 5,
    danoMax: 9,
  },
  'esqueleto-cavaleiro': {
    id: 'esqueleto-cavaleiro',
    name: 'Cavaleiro Esqueleto',
    description: 'Ainda veste a armadura com que tombou. Disciplinado na morte como foi em vida — e bem mais cruel.',
    role: 'corpo-a-corpo',
    vida: 30,
    danoMin: 6,
    danoMax: 10,
  },
};

export interface SummonSpell {
  id: string;
  name: string;
  description: string;
  /** Tier de poder (1 = inicial). Organiza a progressão; balancear depois. */
  tier: number;
  /** Custo base de mana — magias de invocação NÃO são ataque básico. */
  manaCost: number;
  /** Tempo base de conjuração em segundos. */
  castTimeSec: number;
  /** Minion invocado. */
  minionId: string;
  /** Quantos são invocados por conjuração. */
  count: number;
}

export const SUMMON_SPELLS: Record<string, SummonSpell> = {
  'invocar-esqueleto': {
    id: 'invocar-esqueleto', name: 'Invocar Esqueleto', tier: 1, manaCost: 8, castTimeSec: 1.5,
    description: 'Ergue um esqueleto guerreiro para lutar ao seu lado.',
    minionId: 'esqueleto-guerreiro', count: 1,
  },
  'invocar-arqueiro-esqueleto': {
    id: 'invocar-arqueiro-esqueleto', name: 'Invocar Arqueiro Esqueleto', tier: 2, manaCost: 12, castTimeSec: 1.6,
    description: 'Ergue um arqueiro morto-vivo que ataca à distância.',
    minionId: 'esqueleto-arqueiro', count: 1,
  },
  'invocar-mago-esqueleto': {
    id: 'invocar-mago-esqueleto', name: 'Invocar Mago Esqueleto', tier: 3, manaCost: 16, castTimeSec: 1.7,
    description: 'Reanima um conjurador para lançar magia ao seu serviço.',
    minionId: 'esqueleto-mago', count: 1,
  },
  'invocar-bruto-esqueleto': {
    id: 'invocar-bruto-esqueleto', name: 'Invocar Bruto Esqueleto', tier: 4, manaCost: 22, castTimeSec: 2.0,
    description: 'Funde vários corpos num bruto colossal de ossos.',
    minionId: 'esqueleto-bruto', count: 1,
  },
  'invocar-cavaleiro-esqueleto': {
    id: 'invocar-cavaleiro-esqueleto', name: 'Invocar Cavaleiro Esqueleto', tier: 5, manaCost: 28, castTimeSec: 2.2,
    description: 'Convoca um cavaleiro morto-vivo, blindado e implacável.',
    minionId: 'esqueleto-cavaleiro', count: 1,
  },
};

export function getMinionById(id: string): Minion | undefined {
  return MINIONS[id];
}

export function getSummonSpellById(id: string): SummonSpell | undefined {
  return SUMMON_SPELLS[id];
}
