import type { MapLocation } from '../types';

/**
 * Atlas do mundo — tronco principal + ramos paralelos sem saída.
 *
 * **Pedragal** é a única zona segura (`town`). Demais locais têm encontros.
 * Conexões bidirecionais (`getConnections`).
 */
export const LOCATIONS: MapLocation[] = [
  // ── Tronco: Pedragal → … → Forja ─────────────────────────────────
  {
    id: 'pedragal',
    name: 'Pedragal',
    region: 'Vales Centrais',
    level: 1,
    description:
      'Vila de pedra do vale — ruas estreitas entre casas baixas de granito cinza, fumaça da forja subindo no fim da praça. Sólida e simples. Aqui se começa.',
    type: 'town',
    x: 110,
    y: 340,
    connections: [],
  },
  {
    id: 'floresta-densa',
    name: 'Floresta Densa',
    region: 'Bosques Norte',
    level: 1,
    description:
      'Pinheiros gigantescos cobrem a luz do dia. Algo se move entre as árvores quando você não está olhando.',
    type: 'wilderness',
    x: 310,
    y: 340,
    connections: ['pedragal'],
  },
  {
    id: 'corvalho',
    name: 'Vila de Corvalho',
    region: 'Vales Centrais',
    level: 2,
    description:
      'Carvalhos antigos sobre casas trancadas. A vila ainda respira, mas quem ronda as ruas não veio negociar.',
    type: 'wilderness',
    x: 480,
    y: 425,
    connections: ['floresta-densa'],
  },
  {
    id: 'pantano-mortos',
    name: 'Pântano dos Mortos',
    region: 'Bosques Norte',
    level: 3,
    description:
      'Solo encharcado, vapores que cheiram a metal e uma quietude que não é natural.',
    type: 'wilderness',
    x: 640,
    y: 210,
    connections: ['corvalho'],
  },
  {
    id: 'estepe-cinzenta',
    name: 'Estepe Cinzenta',
    region: 'Estepes Sul',
    level: 6,
    description:
      'Planícies de capim seco até o horizonte. O vento corta. Bandos nômades cruzam aqui.',
    type: 'wilderness',
    x: 810,
    y: 295,
    connections: ['pantano-mortos'],
  },
  {
    id: 'porto-lume',
    name: 'Porto Lume',
    region: 'Litoral',
    level: 8,
    description:
      'Cais molhados, lanternas fracas e facas nos cantos. O porto recebe — e cobra caro.',
    type: 'wilderness',
    x: 1040,
    y: 295,
    connections: ['estepe-cinzenta'],
  },
  {
    id: 'catacumbas-profundas',
    name: 'Catacumbas Profundas',
    region: 'Catacumbas',
    level: 11,
    description:
      'Galerias soterradas que se estendem por quilômetros. Há vozes nas pedras.',
    type: 'dungeon',
    x: 810,
    y: 480,
    connections: ['porto-lume'],
  },
  {
    id: 'cidade-alta',
    name: 'Cidade Alta',
    region: 'Capital',
    level: 14,
    description:
      'Baixadas sob as muralhas brancas. O que a capital exibe ao céu esconde o que vive debaixo dela.',
    type: 'dungeon',
    x: 810,
    y: 610,
    connections: ['catacumbas-profundas'],
  },
  {
    id: 'forja-do-caos',
    name: 'Forja do Caos',
    region: 'Profundezas',
    level: 19,
    description:
      'O fim de todos os caminhos. Apenas heróis tolos vêm aqui — e nenhum volta.',
    type: 'boss',
    x: 1040,
    y: 550,
    connections: ['cidade-alta'],
  },

  // ── Ramos sem saída ────────────────────────────────────────────────
  {
    id: 'cripta-esquecida',
    name: 'Cripta Esquecida',
    region: 'Catacumbas',
    level: 4,
    description:
      'Uma escada descendo pelo solo. As tochas que alguém deixou ainda queimam — ninguém lembra de tê-las acendido.',
    type: 'dungeon',
    x: 480,
    y: 85,
    connections: ['corvalho'],
  },
  {
    id: 'caminho-norte',
    name: 'Caminho do Norte',
    region: 'Cordilheira',
    level: 5,
    description:
      'Estrada de pedra que serpenteia entre montanhas. Bandidos cobram pedágio. O caminho termina num desfiladeiro.',
    type: 'wilderness',
    x: 640,
    y: 550,
    connections: ['pantano-mortos'],
  },
  {
    id: 'mina-abandonada',
    name: 'Mina Abandonada',
    region: 'Estepes Sul',
    level: 7,
    description:
      'Túneis escavados há gerações. Algo emergiu lá de dentro — e nunca foi catalogado.',
    type: 'dungeon',
    x: 810,
    y: 85,
    connections: ['estepe-cinzenta'],
  },
  {
    id: 'picos-gelados',
    name: 'Picos Gelados',
    region: 'Cordilheira',
    level: 9,
    description:
      'Cumes brancos eternos. O ar é fino, o frio mata mais rápido que as feras. Não há passagem além.',
    type: 'wilderness',
    x: 1040,
    y: 85,
    connections: ['porto-lume'],
  },
];

export function getConnections(locationId: string): string[] {
  const explicit = LOCATIONS.find((l) => l.id === locationId)?.connections ?? [];
  const reverse = LOCATIONS.filter((l) => l.connections.includes(locationId)).map((l) => l.id);
  return Array.from(new Set([...explicit, ...reverse]));
}

export function getLocationById(id: string): MapLocation | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

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

  const connections = getConnections(locationId);
  const reachable = connections.some(
    (id) => id === currentLocationId || visitedIds.includes(id),
  );

  if (!reachable) return 'locked';
  if (loc.level > characterLevel + 5) return 'locked';

  return 'available';
}
