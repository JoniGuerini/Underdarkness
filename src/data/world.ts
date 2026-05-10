import type { MapLocation } from '../types';

/**
 * Atlas do mundo — chain estritamente linear.
 *
 * REGRA DE CONEXÃO: cada nó tem exatamente UMA conexão, com o próximo
 * nível na sequência. Origem (1) → Floresta Densa (2) → Vila de Corvalho (3)
 * → ... → Forja do Caos (20). Não há bifurcações.
 *
 * Convenção: cada nó declara conexão pro nível ANTERIOR (mais baixo).
 * Origem é o único sem conexões declaradas (é o head).
 *
 * Posições seguem layout serpentino: começa no canto superior-esquerdo,
 * varre o mapa horizontalmente em zig-zag, termina no canto inferior-direito.
 */
export const LOCATIONS: MapLocation[] = [
  // ════════ Nível 1 — START (top-left) ════════
  {
    id: 'pedragal',
    name: 'Pedragal',
    region: 'Vales Centrais',
    level: 1,
    description:
      'Vila de pedra do vale — ruas estreitas entre casas baixas de granito cinza, fumaça da forja subindo no fim da praça. Sólida e simples. Aqui se começa.',
    type: 'town',
    x: 180,
    y: 200,
    connections: [],
  },

  // ════════ Faixa superior — varre da esquerda pra direita ════════
  {
    id: 'floresta-densa',
    name: 'Floresta Densa',
    region: 'Bosques Norte',
    level: 2,
    description:
      'Pinheiros gigantescos cobrem a luz do dia. Algo se move entre as árvores quando você não está olhando.',
    type: 'wilderness',
    x: 420,
    y: 280,
    connections: ['pedragal'],
  },
  {
    id: 'corvalho',
    name: 'Vila de Corvalho',
    region: 'Vales Centrais',
    level: 3,
    description:
      'Pequena vila à sombra de carvalhos antigos. Comerciantes, ferreiros e uma estalagem com cerveja honesta.',
    type: 'town',
    x: 660,
    y: 180,
    connections: ['floresta-densa'],
  },
  {
    id: 'pantano-mortos',
    name: 'Pântano dos Mortos',
    region: 'Bosques Norte',
    level: 4,
    description:
      'Solo encharcado, vapores que cheiram a metal e uma quietude que não é natural.',
    type: 'wilderness',
    x: 900,
    y: 240,
    connections: ['corvalho'],
  },
  {
    id: 'cripta-esquecida',
    name: 'Cripta Esquecida',
    region: 'Catacumbas',
    level: 5,
    description:
      'Uma escada descendo pelo solo. As tochas que alguém deixou ainda queimam — ninguém lembra de tê-las acendido.',
    type: 'dungeon',
    x: 1030,
    y: 380,
    connections: ['pantano-mortos'],
  },

  // ════════ Faixa do meio — varre da direita pra esquerda ════════
  {
    id: 'caminho-norte',
    name: 'Caminho do Norte',
    region: 'Cordilheira',
    level: 6,
    description:
      'Estrada de pedra que serpenteia entre montanhas. Bandidos cobram pedágio.',
    type: 'wilderness',
    x: 820,
    y: 420,
    connections: ['cripta-esquecida'],
  },
  {
    id: 'estepe-cinzenta',
    name: 'Estepe Cinzenta',
    region: 'Estepes Sul',
    level: 7,
    description:
      'Planícies de capim seco até o horizonte. O vento corta. Bandos nômades cruzam aqui.',
    type: 'wilderness',
    x: 580,
    y: 360,
    connections: ['caminho-norte'],
  },
  {
    id: 'mina-abandonada',
    name: 'Mina Abandonada',
    region: 'Estepes Sul',
    level: 8,
    description:
      'Túneis escavados há gerações. Algo emergiu lá de dentro — e nunca foi catalogado.',
    type: 'dungeon',
    x: 340,
    y: 420,
    connections: ['estepe-cinzenta'],
  },
  {
    id: 'porto-lume',
    name: 'Porto Lume',
    region: 'Litoral',
    level: 9,
    description:
      'Cidade portuária cinzenta. Aqui se chega, daqui se parte. Ninguém fica.',
    type: 'town',
    x: 160,
    y: 500,
    connections: ['mina-abandonada'],
  },

  // ════════ Faixa inferior — varre da esquerda pra direita ════════
  {
    id: 'picos-gelados',
    name: 'Picos Gelados',
    region: 'Cordilheira',
    level: 10,
    description:
      'Cumes brancos eternos. O ar é fino, o frio mata mais rápido que as feras.',
    type: 'wilderness',
    x: 380,
    y: 580,
    connections: ['porto-lume'],
  },
  {
    id: 'catacumbas-profundas',
    name: 'Catacumbas Profundas',
    region: 'Catacumbas',
    level: 12,
    description:
      'Galerias soterradas que se estendem por quilômetros. Há vozes nas pedras.',
    type: 'dungeon',
    x: 620,
    y: 540,
    connections: ['picos-gelados'],
  },
  {
    id: 'cidade-alta',
    name: 'Cidade Alta',
    region: 'Capital',
    level: 15,
    description:
      'Muralhas de pedra branca sobre um penhasco. A capital — tão bela quanto perigosa.',
    type: 'town',
    x: 840,
    y: 580,
    connections: ['catacumbas-profundas'],
  },

  // ════════ Endgame ════════
  {
    id: 'forja-do-caos',
    name: 'Forja do Caos',
    region: 'Profundezas',
    level: 20,
    description:
      'O fim de todos os caminhos. Apenas heróis tolos vêm aqui — e nenhum volta.',
    type: 'boss',
    x: 1080,
    y: 540,
    connections: ['cidade-alta'],
  },
];

export const MAP_VIEWPORT = { width: 1180, height: 680 };

/**
 * Resolve conexões bidirecionais — se A diz que está conectado a B,
 * B também está conectado a A mesmo se não declarou explicitamente.
 */
export function getConnections(locationId: string): string[] {
  const explicit = LOCATIONS.find((l) => l.id === locationId)?.connections ?? [];
  const reverse = LOCATIONS.filter((l) => l.connections.includes(locationId)).map((l) => l.id);
  return Array.from(new Set([...explicit, ...reverse]));
}

export function getLocationById(id: string): MapLocation | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

/**
 * Resolve estado visual de cada nó dado o personagem atual:
 * - 'current': onde o personagem está agora
 * - 'visited': já foi (mas não é o atual)
 * - 'available': adjacente a um visitado/atual e nível compatível
 * - 'locked': nível muito alto pra ir agora
 *
 * Nota: o mapa todo é sempre revelado (sem fog). Locais não-adjacentes
 * mostram como 'locked' até virarem alcançáveis.
 */
export type LocationState = 'current' | 'visited' | 'available' | 'locked';

export function getLocationState(
  locationId: string,
  currentLocationId: string,
  visitedIds: string[],
  characterLevel: number,
): LocationState {
  if (locationId === currentLocationId) return 'current';
  if (visitedIds.includes(locationId)) return 'visited';

  const loc = getLocationById(locationId);
  if (!loc) return 'locked';

  // Adjacente a visitado/atual?
  const connections = getConnections(locationId);
  const reachable = connections.some(
    (id) => id === currentLocationId || visitedIds.includes(id),
  );

  // Locked se: nível muito alto OU não-adjacente. Se ambos: ainda locked.
  if (!reachable) return 'locked';
  if (loc.level > characterLevel + 5) return 'locked';

  return 'available';
}
