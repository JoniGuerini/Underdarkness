/**
 * MERCADO — listagens entre jogadores (mock estilo Casa de Leilões do WoW).
 *
 * Listagens mock de NPCs/jogadores fictícios + suporte a listagens do jogador
 * local via MercadoView. Compra/venda altera ouro e inventário de verdade.
 */

import type { ClassKey, Item } from '../types';
import { makeBaseItem } from './itemBases';
import { MATERIALS } from './materials';

export type MarketCategory = 'todos' | 'arma' | 'armadura' | 'acessorio' | 'consumivel';

export interface MarketListing {
  id: string;
  seller: string;
  sellerClassKey: ClassKey;
  item: Item;
  price: number;
  listedMinutesAgo: number;
  /** Listagem criada pelo jogador — pode cancelar e recuperar o item. */
  isPlayer?: boolean;
}

export const MARKET_CATEGORY_LABEL: Record<MarketCategory, string> = {
  todos: 'Todos',
  arma: 'Armas',
  armadura: 'Armadura',
  acessorio: 'Acessórios',
  consumivel: 'Consumíveis',
};

const CATEGORY_ORDER: MarketCategory[] = ['todos', 'arma', 'armadura', 'acessorio', 'consumivel'];

export { CATEGORY_ORDER as MARKET_CATEGORY_ORDER };

export function formatListedAge(minutes: number): string {
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
}

export function getMarketCategory(item: Item): Exclude<MarketCategory, 'todos'> {
  const slot = item.slot;
  if (!slot) return 'consumivel';
  if (slot === 'arma' || slot === 'escudo') return 'arma';
  if (slot === 'amuleto' || slot === 'anel') return 'acessorio';
  return 'armadura';
}

function matListing(
  id: string,
  seller: string,
  sellerClassKey: ClassKey,
  materialId: string,
  price: number,
  listedMinutesAgo: number,
  stack = 1,
): MarketListing {
  const def = MATERIALS[materialId];
  const item: Item = {
    ...def.item,
    stack: def.item.stackable ? stack : undefined,
  };
  return { id, seller, sellerClassKey, item, price, listedMinutesAgo };
}

function equipListing(
  id: string,
  seller: string,
  sellerClassKey: ClassKey,
  item: Item,
  price: number,
  listedMinutesAgo: number,
): MarketListing {
  return { id, seller, sellerClassKey, item, price, listedMinutesAgo };
}

/** Listagens iniciais do servidor — jogadores fictícios. */
export const INITIAL_MARKET_LISTINGS: MarketListing[] = [
  equipListing(
    'm1',
    'MestreEspada89',
    'guerreiro',
    {
      ...makeBaseItem('espada-longa', 'market'),
      id: 'market-m1-espada',
      rarity: 'magico',
      name: 'Sangrenta Espada Longa',
      stats: [
        ...(makeBaseItem('espada-longa', 'market').stats ?? []),
        { text: '+28 de Vida', color: 'vida', kind: 'prefix', effect: { key: 'flat-vida', value: 28 } },
        { text: '+3 de Força', color: 'forca', kind: 'suffix', effect: { key: 'flat-forca', value: 3 } },
      ],
    },
    85,
    12,
  ),
  equipListing(
    'm2',
    'Selvinha',
    'ladino',
    {
      ...makeBaseItem('adaga-curva', 'market'),
      id: 'market-m2-adaga',
      rarity: 'raro',
      name: 'Adaga Curva do Lince',
      stats: [
        ...(makeBaseItem('adaga-curva', 'market').stats ?? []),
        { text: '+12% de Chance de Crítico', color: 'critico', kind: 'prefix', effect: { key: 'pct-crit-chance', value: 12 } },
        { text: '+5 de Agilidade', color: 'agilidade', kind: 'suffix', effect: { key: 'flat-agilidade', value: 5 } },
        { text: '+18 de Evasão', color: 'agilidade', kind: 'suffix', effect: { key: 'flat-evasao', value: 18 } },
      ],
    },
    240,
    45,
  ),
  equipListing(
    'm3',
    'Erudita_do_Sul',
    'mago',
    {
      ...makeBaseItem('cajado-de-carvalho', 'market'),
      id: 'market-m3-cajado',
      rarity: 'magico',
      name: 'Cajado de Carvalho Flamejante',
      stats: [
        ...(makeBaseItem('cajado-de-carvalho', 'market').stats ?? []),
        { text: '+14% de Dano de Magias', color: 'fogo', kind: 'prefix', effect: { key: 'pct-dmg-magia', value: 14 } },
        { text: '+6 de Intelecto', color: 'intelecto', kind: 'suffix', effect: { key: 'flat-intelecto', value: 6 } },
      ],
    },
    120,
    8,
  ),
  equipListing(
    'm4',
    'AçoFrio_BR',
    'guerreiro',
    {
      ...makeBaseItem('peitoral-ferro', 'market'),
      id: 'market-m4-peito',
      rarity: 'magico',
      name: 'Peitoral de Ferro Reforçado',
      stats: [
        ...(makeBaseItem('peitoral-ferro', 'market').stats ?? []),
        { text: '+35 de Armadura', color: 'fisico', kind: 'prefix', effect: { key: 'flat-armadura', value: 35 } },
        { text: '+8% de Resistência Física', color: 'fisico', kind: 'suffix', effect: { key: 'pct-res-fisica', value: 8 } },
      ],
    },
    95,
    22,
  ),
  equipListing(
    'm5',
    'raposa_do_sul',
    'ladino',
    {
      ...makeBaseItem('capuz-sombras', 'market'),
      id: 'market-m5-capuz',
      rarity: 'comum',
      name: 'Capuz de Sombras',
      stats: makeBaseItem('capuz-sombras', 'market').stats,
    },
    18,
    3,
  ),
  equipListing(
    'm6',
    'Lobo_do_Norte',
    'guerreiro',
    {
      ...makeBaseItem('escudo-torre', 'market'),
      id: 'market-m6-escudo',
      rarity: 'magico',
      name: 'Escudo Torre do Guardião',
      stats: [
        ...(makeBaseItem('escudo-torre', 'market').stats ?? []),
        { text: '+14% de Bloqueio', color: 'defesa', kind: 'prefix', effect: { key: 'pct-bloqueio', value: 14 } },
        { text: '+20 de Vida', color: 'vida', kind: 'suffix', effect: { key: 'flat-vida', value: 20 } },
      ],
    },
    55,
    67,
  ),
  matListing('m7', 'k4t4r1n4', 'mago', 'erva-vermelha', 3, 5, 20),
  matListing('m8', 'DIABLO2_FOREVER', 'ladino', 'pot-vida-pequena', 8, 18, 5),
  matListing('m9', 'ProcurandoBuild', 'ladino', 'mat-minerio-ferro', 4, 90, 15),
  matListing('m10', 'VinhoFracoZé', 'guerreiro', 'mat-pedra-afiar', 5, 34, 10),
  equipListing(
    'm11',
    'TiberioReal',
    'guerreiro',
    {
      ...makeBaseItem('martelo-de-guerra', 'market'),
      id: 'market-m11-martelo',
      rarity: 'raro',
      name: 'Martelo de Guerra do Vau',
      stats: [
        ...(makeBaseItem('martelo-de-guerra', 'market').stats ?? []),
        { text: '+6 a 10 de Dano Físico', color: 'fisico', kind: 'prefix', effect: { key: 'flat-dmg-fis', value: 6, max: 10 } },
        { text: '+4 de Força', color: 'forca', kind: 'suffix', effect: { key: 'flat-forca', value: 4 } },
        { text: '+10% de Vel. de Ataque', color: 'agilidade', kind: 'suffix', effect: { key: 'pct-vel-ataque', value: 10 } },
      ],
    },
    310,
    120,
  ),
  equipListing(
    'm12',
    'noobMage123',
    'mago',
    {
      ...makeBaseItem('amuleto-simples', 'market'),
      id: 'market-m12-amuleto',
      rarity: 'magico',
      name: 'Amuleto Simples Flamejante',
      stats: [
        ...(makeBaseItem('amuleto-simples', 'market').stats ?? []),
        { text: '+12% de Resistência ao Fogo', color: 'fogo', kind: 'suffix', effect: { key: 'pct-res-fogo', value: 12 } },
        { text: '+10 de Mana', color: 'mana', kind: 'prefix', effect: { key: 'flat-mana', value: 10 } },
      ],
    },
    42,
    14,
  ),
];

/** Preço sugerido ao listar — acima do valor de venda a NPC. */
export function suggestListPrice(item: Item): number {
  if (item.stackable) {
    const mat = Object.values(MATERIALS).find((m) => m.item.id === item.id);
    return Math.max(2, (mat?.defaultPrice ?? 2) + 1);
  }
  switch (item.rarity) {
    case 'comum': return 12;
    case 'magico': return 45;
    case 'raro': return 130;
    case 'unico': return 320;
    case 'lendario': return 800;
    default: return 10;
  }
}

export function cloneItemForTrade(item: Item, idPrefix: string): Item {
  return {
    ...structuredClone(item),
    id: `${idPrefix}-${Date.now()}-${item.id}`,
  };
}

export function listingMatchesSearch(listing: MarketListing, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    listing.item.name.toLowerCase().includes(q) ||
    listing.seller.toLowerCase().includes(q)
  );
}

export function listingMatchesCategory(listing: MarketListing, category: MarketCategory): boolean {
  if (category === 'todos') return true;
  return getMarketCategory(listing.item) === category;
}
