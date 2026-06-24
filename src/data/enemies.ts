/**
 * Catálogo de inimigos — cada criatura pertence a **uma** área (`locationId`).
 * Templates definem stats no **nível 1**; `spawnEnemy` escala pelo nível do encontro.
 *
 * Nível do encontro = clamp(nível do personagem, nível da área, nível da área + 1).
 * Ex.: Floresta Densa (área 1) — personagem nv 1 → inimigo nv 1; nv 2 → nv 2; nv 3+ → nv 2.
 */

import { getLocationById } from './world';
import { xpForLevel } from '../lib/leveling';

export interface Enemy {
  id: string;
  name: string;
  description: string;
  level: number;
  vidaMax: number;
  danoMin: number;
  danoMax: number;
  evasao: number;
  velAtaque?: number;
  acerto?: number;
  chanceCritico?: number;
  multCritico?: number;
  bloqueio?: number;
  rouboVida?: number;
  rouboMana?: number;
  resFogo?: number;
  resGelo?: number;
  resRaio?: number;
  resCaos?: number;
  resSagrado?: number;
  armadura?: number;
  xp: number;
  goldMin: number;
  goldMax: number;
  loot?: { itemId: string; chance: number }[];
}

export interface EnemyDef {
  id: string;
  name: string;
  description: string;
  /** Área exclusiva onde este inimigo pode aparecer. */
  locationId: string;
  vida: number;
  danoMin: number;
  danoMax: number;
  evasao: number;
  velAtaque?: number;
  acerto?: number;
  chanceCritico?: number;
  multCritico?: number;
  bloqueio?: number;
  rouboVida?: number;
  rouboMana?: number;
  resFogo?: number;
  resGelo?: number;
  resRaio?: number;
  resCaos?: number;
  resSagrado?: number;
  armadura?: number;
  goldMin: number;
  goldMax: number;
  loot?: { itemId: string; chance: number }[];
  xpFactor?: number;
}

export function getEnemyAcerto(enemy: Enemy): number {
  return enemy.acerto ?? enemy.level * 6;
}

export function getEnemyCritChance(enemy: Enemy): number {
  return enemy.chanceCritico ?? 5;
}

export function getEnemyCritMult(enemy: Enemy): number {
  return enemy.multCritico ?? 1.5;
}

export function getEnemyVelAtaque(enemy: Enemy): number {
  return enemy.velAtaque ?? 1;
}

function scaleLv(base: number, level: number): number {
  return Math.max(1, Math.round(base * level));
}

/** Faixa de nível dos inimigos numa área hostil. */
export function getAreaEnemyLevelRange(areaLevel: number): { min: number; max: number } {
  return { min: areaLevel, max: areaLevel + 1 };
}

/**
 * Nível efetivo do encontro — escala com o personagem até o teto da área.
 * Personagem abaixo do piso da área sobe pro mínimo da área.
 */
export function resolveEncounterLevel(characterLevel: number, areaLevel: number): number {
  const { min, max } = getAreaEnemyLevelRange(areaLevel);
  return Math.min(Math.max(characterLevel, min), max);
}

export function spawnEnemy(def: EnemyDef, level: number): Enemy {
  const dMin = scaleLv(def.danoMin, level);
  const dMax = Math.max(dMin, scaleLv(def.danoMax, level));
  const gMin = scaleLv(def.goldMin, level);
  const gMax = Math.max(gMin, scaleLv(def.goldMax, level));
  const xpFactor = def.xpFactor ?? 0.75;

  return {
    id: def.id,
    name: def.name,
    description: def.description,
    level,
    vidaMax: scaleLv(def.vida, level),
    danoMin: dMin,
    danoMax: dMax,
    evasao: scaleLv(def.evasao, level),
    velAtaque: def.velAtaque,
    acerto: def.acerto !== undefined ? scaleLv(def.acerto, level) : undefined,
    chanceCritico: def.chanceCritico,
    multCritico: def.multCritico,
    bloqueio: def.bloqueio,
    rouboVida: def.rouboVida,
    rouboMana: def.rouboMana,
    resFogo: def.resFogo,
    resGelo: def.resGelo,
    resRaio: def.resRaio,
    resCaos: def.resCaos,
    resSagrado: def.resSagrado,
    armadura: def.armadura !== undefined ? scaleLv(def.armadura, level) : undefined,
    xp: Math.max(1, Math.round(xpForLevel(level) * xpFactor)),
    goldMin: gMin,
    goldMax: gMax,
    loot: def.loot,
  };
}

// ── Floresta Densa (área 1) ─────────────────────────────────────────
// ── Pântano dos Mortos (3) ── Cripta (4) ── Caminho Norte (5) ──
// ── Estepe (6) ── Mina (7) ── Picos Gelados (9) ── Catacumbas (11) ── Forja (19)

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  // Floresta Densa
  'lobo-cinzento': {
    id: 'lobo-cinzento',
    locationId: 'floresta-densa',
    name: 'Lobo Cinzento',
    description: 'Magro e rápido. Os olhos amarelos te encontram antes que você o veja entre os pinheiros.',
    vida: 9,
    danoMin: 1,
    danoMax: 3,
    evasao: 2,
    velAtaque: 1.2,
    goldMin: 1,
    goldMax: 2,
    loot: [{ itemId: 'mat-couro-cru', chance: 0.45 }],
    xpFactor: 0.8,
  },
  'lobo-faminto': {
    id: 'lobo-faminto',
    locationId: 'floresta-densa',
    name: 'Lobo Faminto',
    description: 'Esquelético, costelas marcadas. Não foge — a fome venceu o instinto.',
    vida: 9,
    danoMin: 1,
    danoMax: 2,
    evasao: 1,
    velAtaque: 1.0,
    goldMin: 1,
    goldMax: 2,
    loot: [
      { itemId: 'mat-couro-cru', chance: 0.6 },
      { itemId: 'food-pao-duro', chance: 0.15 },
    ],
    xpFactor: 0.57,
  },
  'aranha-da-mata': {
    id: 'aranha-da-mata',
    locationId: 'floresta-densa',
    name: 'Aranha-da-Mata',
    description: 'Do tamanho de um cão pequeno. Patas pretas peludas, abdômen verde-musgo.',
    vida: 7,
    danoMin: 2,
    danoMax: 2,
    evasao: 4,
    velAtaque: 1.1,
    chanceCritico: 10,
    armadura: 1,
    goldMin: 0,
    goldMax: 1,
    loot: [{ itemId: 'raiz-noturna', chance: 0.25 }],
  },
  'galho-caminhante': {
    id: 'galho-caminhante',
    locationId: 'floresta-densa',
    name: 'Galho Caminhante',
    description: 'Você jura que viu uma árvore se mover. Aí ela se moveu de novo, em sua direção.',
    vida: 11,
    danoMin: 1,
    danoMax: 2,
    evasao: 1,
    velAtaque: 0.7,
    armadura: 3,
    goldMin: 0,
    goldMax: 0,
    loot: [
      { itemId: 'erva-azul', chance: 0.4 },
      { itemId: 'raiz-noturna', chance: 0.3 },
    ],
    xpFactor: 1.0,
  },

  // Vila de Corvalho (campo hostil)
  'ladrao-de-corvalho': {
    id: 'ladrao-de-corvalho',
    locationId: 'corvalho',
    name: 'Ladrão de Corvalho',
    description: 'Conhece cada beco da vila. A mão no bolso é mais rápida que a conversa.',
    vida: 8,
    danoMin: 1,
    danoMax: 3,
    evasao: 3,
    velAtaque: 1.1,
    goldMin: 2,
    goldMax: 4,
    loot: [{ itemId: 'food-vinho-fraco', chance: 0.2 }],
  },
  'cervo-bravo': {
    id: 'cervo-bravo',
    locationId: 'corvalho',
    name: 'Cervo Bravo',
    description: 'Chifres grossos, olhar fixo. O bosque invadiu a praça — e não recua.',
    vida: 9,
    danoMin: 2,
    danoMax: 3,
    evasao: 2,
    velAtaque: 1.0,
    goldMin: 0,
    goldMax: 1,
    loot: [{ itemId: 'mat-couro-cru', chance: 0.4 }],
  },
  'capataz-corrupto': {
    id: 'capataz-corrupto',
    locationId: 'corvalho',
    name: 'Capataz Corrupto',
    description: 'Cinto cheio de chaves que não são dele. Cobra pedágio com porrete.',
    vida: 10,
    danoMin: 2,
    danoMax: 3,
    evasao: 1,
    velAtaque: 0.9,
    armadura: 1,
    goldMin: 3,
    goldMax: 6,
    loot: [{ itemId: 'mat-pedra-afiar', chance: 0.25 }],
  },
  'sombra-do-carvalho': {
    id: 'sombra-do-carvalho',
    locationId: 'corvalho',
    name: 'Sombra do Carvalho',
    description: 'Silhueta entre os troncos. Quando você olha de novo, já está perto demais.',
    vida: 7,
    danoMin: 1,
    danoMax: 4,
    evasao: 5,
    velAtaque: 1.2,
    chanceCritico: 8,
    goldMin: 0,
    goldMax: 2,
    loot: [{ itemId: 'erva-vermelha', chance: 0.2 }],
  },

  // Pântano dos Mortos
  'sapo-do-pantano': {
    id: 'sapo-do-pantano',
    locationId: 'pantano-mortos',
    name: 'Sapo do Pântano',
    description: 'Bolhas na pele venenosa. Pula sem aviso — a língua é mais rápida que o reflexo.',
    vida: 8,
    danoMin: 1,
    danoMax: 3,
    evasao: 2,
    velAtaque: 0.9,
    goldMin: 0,
    goldMax: 1,
    loot: [{ itemId: 'erva-vermelha', chance: 0.35 }],
  },
  'lodo-vivo': {
    id: 'lodo-vivo',
    locationId: 'pantano-mortos',
    name: 'Lodo Vivo',
    description: 'Massa negra que escorre pelo charco. Engole o que pisa fundo demais.',
    vida: 12,
    danoMin: 1,
    danoMax: 3,
    evasao: 0,
    velAtaque: 0.6,
    armadura: 2,
    resCaos: 10,
    goldMin: 0,
    goldMax: 0,
    loot: [{ itemId: 'frasco-vazio', chance: 0.2 }],
  },
  'carniceiro-do-pantano': {
    id: 'carniceiro-do-pantano',
    locationId: 'pantano-mortos',
    name: 'Carniceiro do Pântano',
    description: 'Ave imensa de bico curvo. Espera o cheiro de sangue — ou de hesitação.',
    vida: 7,
    danoMin: 2,
    danoMax: 3,
    evasao: 3,
    velAtaque: 1.15,
    chanceCritico: 8,
    goldMin: 0,
    goldMax: 2,
    loot: [{ itemId: 'mat-couro-cru', chance: 0.3 }],
  },
  'bruma-corrosiva': {
    id: 'bruma-corrosiva',
    locationId: 'pantano-mortos',
    name: 'Bruma Corrosiva',
    description: 'Vapor que ganhou forma. Onde passa, a pele arde e o metal enferruja.',
    vida: 6,
    danoMin: 2,
    danoMax: 3,
    evasao: 4,
    velAtaque: 1.0,
    resCaos: 15,
    goldMin: 0,
    goldMax: 0,
    loot: [{ itemId: 'erva-azul', chance: 0.25 }],
  },

  // Cripta Esquecida
  'esqueleto-rachado': {
    id: 'esqueleto-rachado',
    locationId: 'cripta-esquecida',
    name: 'Esqueleto Rachado',
    description: 'Ossos amarelados remendados com arame. Ainda empunha a espada de quem foi.',
    vida: 8,
    danoMin: 1,
    danoMax: 3,
    evasao: 1,
    velAtaque: 0.95,
    armadura: 1,
    goldMin: 1,
    goldMax: 3,
    loot: [{ itemId: 'mat-pedra-afiar', chance: 0.2 }],
  },
  'rato-da-cripta': {
    id: 'rato-da-cripta',
    locationId: 'cripta-esquecida',
    name: 'Rato da Cripta',
    description: 'Olhos vermelhos no escuro. Enxame sozinho — mas nunca está só por muito tempo.',
    vida: 5,
    danoMin: 1,
    danoMax: 2,
    evasao: 5,
    velAtaque: 1.35,
    goldMin: 0,
    goldMax: 1,
  },
  'espectro-menor': {
    id: 'espectro-menor',
    locationId: 'cripta-esquecida',
    name: 'Espectro Menor',
    description: 'Sussurro gelado sem corpo. Passa pelas paredes; o medo não passa.',
    vida: 6,
    danoMin: 1,
    danoMax: 3,
    evasao: 4,
    velAtaque: 1.0,
    resSagrado: 10,
    resCaos: 10,
    goldMin: 0,
    goldMax: 0,
    loot: [{ itemId: 'raiz-noturna', chance: 0.3 }],
  },
  'morto-em-decomposicao': {
    id: 'morto-em-decomposicao',
    locationId: 'cripta-esquecida',
    name: 'Morto em Decomposição',
    description: 'Carne pendurada em osso. Avança sem pressa — o tempo já venceu essa batalha.',
    vida: 10,
    danoMin: 1,
    danoMax: 2,
    evasao: 0,
    velAtaque: 0.75,
    rouboVida: 5,
    goldMin: 0,
    goldMax: 2,
    loot: [{ itemId: 'erva-vermelha', chance: 0.2 }],
  },

  // Caminho do Norte
  'bandido-vagante': {
    id: 'bandido-vagante',
    locationId: 'caminho-norte',
    name: 'Bandido Vagante',
    description: 'Roupa puída, faca cega. Espera atrás de uma pedra — não esperava resistência.',
    vida: 8,
    danoMin: 1,
    danoMax: 2,
    evasao: 1,
    velAtaque: 0.9,
    armadura: 1,
    goldMin: 2,
    goldMax: 5,
    loot: [
      { itemId: 'mat-pedra-afiar', chance: 0.3 },
      { itemId: 'food-vinho-fraco', chance: 0.2 },
    ],
  },
  'salteador-de-estrada': {
    id: 'salteador-de-estrada',
    locationId: 'caminho-norte',
    name: 'Salteador de Estrada',
    description: 'Armadura de placas roubadas, rosto coberto. Cobra pedágio com aço.',
    vida: 9,
    danoMin: 2,
    danoMax: 4,
    evasao: 2,
    velAtaque: 0.85,
    armadura: 2,
    bloqueio: 8,
    goldMin: 4,
    goldMax: 8,
    loot: [{ itemId: 'mat-minerio-ferro', chance: 0.25 }],
  },
  'lobo-das-rochas': {
    id: 'lobo-das-rochas',
    locationId: 'caminho-norte',
    name: 'Lobo das Rochas',
    description: 'Pelagem espessa, patas calosas. Caça em bando nas curvas estreitas da estrada.',
    vida: 10,
    danoMin: 2,
    danoMax: 4,
    evasao: 2,
    velAtaque: 1.1,
    goldMin: 0,
    goldMax: 2,
    loot: [{ itemId: 'mat-couro-cru', chance: 0.5 }],
  },
  'urso-cinzento': {
    id: 'urso-cinzento',
    locationId: 'caminho-norte',
    name: 'Urso Cinzento',
    description: 'Massa de músculo e garras. A estrada é dele — você só atravessa.',
    vida: 13,
    danoMin: 2,
    danoMax: 5,
    evasao: 0,
    velAtaque: 0.75,
    armadura: 3,
    goldMin: 0,
    goldMax: 1,
    loot: [{ itemId: 'mat-couro-cru', chance: 0.7 }],
    xpFactor: 1.0,
  },

  // Estepe Cinzenta
  'hiena-risonha': {
    id: 'hiena-risonha',
    locationId: 'estepe-cinzenta',
    name: 'Hiena Risonha',
    description: 'Risada seca antes do ataque. Circula até a presa cansar.',
    vida: 7,
    danoMin: 2,
    danoMax: 3,
    evasao: 3,
    velAtaque: 1.2,
    chanceCritico: 8,
    goldMin: 0,
    goldMax: 1,
    loot: [{ itemId: 'mat-couro-cru', chance: 0.35 }],
  },
  'antilope-selvagem': {
    id: 'antilope-selvagem',
    locationId: 'estepe-cinzenta',
    name: 'Antílope Selvagem',
    description: 'Chifres afiados, patas que levantam poeira. Ataca quando encurralado.',
    vida: 6,
    danoMin: 1,
    danoMax: 3,
    evasao: 5,
    velAtaque: 1.4,
    goldMin: 0,
    goldMax: 0,
    loot: [{ itemId: 'food-queijo-cabra', chance: 0.15 }],
  },
  'lanceiro-nomade': {
    id: 'lanceiro-nomade',
    locationId: 'estepe-cinzenta',
    name: 'Lanceiro Nômade',
    description: 'Cavalo longe, lança perto. Nômade sem tribo — só saque.',
    vida: 8,
    danoMin: 2,
    danoMax: 4,
    evasao: 2,
    acerto: 7,
    velAtaque: 1.0,
    goldMin: 3,
    goldMax: 7,
    loot: [{ itemId: 'food-conserva-raiz', chance: 0.2 }],
  },
  'escorpiao-cinzento': {
    id: 'escorpiao-cinzento',
    locationId: 'estepe-cinzenta',
    name: 'Escorpião Cinzento',
    description: 'Enterrado na poeira até o último instante. O ferrão não avisa.',
    vida: 5,
    danoMin: 2,
    danoMax: 3,
    evasao: 2,
    velAtaque: 1.1,
    chanceCritico: 15,
    goldMin: 0,
    goldMax: 0,
    loot: [{ itemId: 'erva-vermelha', chance: 0.2 }],
  },

  // Mina Abandonada
  'goblin-minerador': {
    id: 'goblin-minerador',
    locationId: 'mina-abandonada',
    name: 'Goblin Minerador',
    description: 'Pequeno, sujo de pó de ferro. Defende o veio com picareta e dentes.',
    vida: 7,
    danoMin: 1,
    danoMax: 2,
    evasao: 3,
    velAtaque: 1.15,
    goldMin: 1,
    goldMax: 4,
    loot: [{ itemId: 'mat-minerio-ferro', chance: 0.45 }],
  },
  'morcego-da-mina': {
    id: 'morcego-da-mina',
    locationId: 'mina-abandonada',
    name: 'Morcego da Mina',
    description: 'Asas que bloqueiam a tocha. Mordida rápida, grito agudo.',
    vida: 5,
    danoMin: 1,
    danoMax: 2,
    evasao: 6,
    velAtaque: 1.3,
    goldMin: 0,
    goldMax: 0,
  },
  'rato-de-mina': {
    id: 'rato-de-mina',
    locationId: 'mina-abandonada',
    name: 'Rato de Mina',
    description: 'Do tamanho de um cachorro. Pelos duros, olhos sem pupilas.',
    vida: 6,
    danoMin: 1,
    danoMax: 3,
    evasao: 2,
    velAtaque: 1.1,
    goldMin: 0,
    goldMax: 1,
  },
  'limo-de-minerio': {
    id: 'limo-de-minerio',
    locationId: 'mina-abandonada',
    name: 'Limo de Minério',
    description: 'Gosma metálica que se alimenta de ferro. Lento, mas quase impenetrável.',
    vida: 12,
    danoMin: 1,
    danoMax: 2,
    evasao: 0,
    velAtaque: 0.5,
    armadura: 4,
    goldMin: 0,
    goldMax: 0,
    loot: [{ itemId: 'mat-minerio-ferro', chance: 0.55 }],
    xpFactor: 0.9,
  },

  // Picos Gelados
  'lobo-branco': {
    id: 'lobo-branco',
    locationId: 'picos-gelados',
    name: 'Lobo Branco',
    description: 'Quase invisível na neve. Só os olhos denunciam — depois, as presas.',
    vida: 10,
    danoMin: 2,
    danoMax: 4,
    evasao: 3,
    velAtaque: 1.15,
    resGelo: 15,
    goldMin: 0,
    goldMax: 2,
    loot: [{ itemId: 'mat-couro-cru', chance: 0.4 }],
  },
  'yeti-jovem': {
    id: 'yeti-jovem',
    locationId: 'picos-gelados',
    name: 'Yeti Jovem',
    description: 'Ainda não atingiu a estatura dos contos. Já é grande o bastante pra esmagar.',
    vida: 14,
    danoMin: 3,
    danoMax: 5,
    evasao: 1,
    velAtaque: 0.8,
    armadura: 3,
    resGelo: 10,
    goldMin: 0,
    goldMax: 1,
    loot: [{ itemId: 'erva-azul', chance: 0.3 }],
    xpFactor: 1.0,
  },
  'harpia-das-neves': {
    id: 'harpia-das-neves',
    locationId: 'picos-gelados',
    name: 'Harpia das Neves',
    description: 'Garras geladas, grito que corta o vento. Mergulha de cima sem som.',
    vida: 7,
    danoMin: 2,
    danoMax: 4,
    evasao: 5,
    velAtaque: 1.2,
    resGelo: 5,
    goldMin: 0,
    goldMax: 0,
    loot: [{ itemId: 'raiz-noturna', chance: 0.2 }],
  },
  'fragmento-de-gelo': {
    id: 'fragmento-de-gelo',
    locationId: 'picos-gelados',
    name: 'Fragmento de Gelo',
    description: 'Cristal vivo que desliza pelo gelo. Quebra lanças — não quebra sozinho.',
    vida: 9,
    danoMin: 2,
    danoMax: 3,
    evasao: 1,
    velAtaque: 0.85,
    armadura: 4,
    resGelo: 25,
    goldMin: 0,
    goldMax: 0,
  },

  // Porto Lume
  'saqueador-do-cais': {
    id: 'saqueador-do-cais',
    locationId: 'porto-lume',
    name: 'Saqueador do Cais',
    description: 'Gancho enferrujado, capa de sal. Opera onde a lanterna não alcança.',
    vida: 9,
    danoMin: 2,
    danoMax: 4,
    evasao: 2,
    velAtaque: 1.0,
    goldMin: 4,
    goldMax: 8,
    loot: [{ itemId: 'food-conserva-raiz', chance: 0.2 }],
  },
  'contrabandista': {
    id: 'contrabandista',
    locationId: 'porto-lume',
    name: 'Contrabandista',
    description: 'Fala baixo, mão no punhal. Mercadoria ilegal — e disposição pra usar.',
    vida: 8,
    danoMin: 2,
    danoMax: 3,
    evasao: 3,
    velAtaque: 1.15,
    chanceCritico: 8,
    goldMin: 5,
    goldMax: 10,
  },
  'sentinela-enferrujada': {
    id: 'sentinela-enferrujada',
    locationId: 'porto-lume',
    name: 'Sentinela Enferrujada',
    description: 'Armadura de placas do porto, juntas corroídas. Ainda bloqueia o caminho.',
    vida: 11,
    danoMin: 2,
    danoMax: 4,
    evasao: 0,
    velAtaque: 0.85,
    armadura: 3,
    bloqueio: 10,
    goldMin: 2,
    goldMax: 5,
    loot: [{ itemId: 'mat-minerio-ferro', chance: 0.3 }],
  },
  'cultista-da-mare': {
    id: 'cultista-da-mare',
    locationId: 'porto-lume',
    name: 'Cultista da Maré',
    description: 'Voz molhada, olhos vidrados. Reza a algo que vive debaixo dos cais.',
    vida: 7,
    danoMin: 2,
    danoMax: 5,
    evasao: 2,
    velAtaque: 0.95,
    resCaos: 10,
    goldMin: 1,
    goldMax: 4,
    loot: [{ itemId: 'raiz-noturna', chance: 0.25 }],
  },

  // Catacumbas Profundas
  'caveira-ardente': {
    id: 'caveira-ardente',
    locationId: 'catacumbas-profundas',
    name: 'Caveira Ardente',
    description: 'Crânio envolto em chama fria. Os olhos são brasas que não se apagam.',
    vida: 8,
    danoMin: 2,
    danoMax: 4,
    evasao: 2,
    velAtaque: 1.0,
    resFogo: 20,
    goldMin: 0,
    goldMax: 2,
    loot: [{ itemId: 'erva-vermelha', chance: 0.25 }],
  },
  'necromante-aprendiz': {
    id: 'necromante-aprendiz',
    locationId: 'catacumbas-profundas',
    name: 'Necromante Aprendiz',
    description: 'Manto rasgado, grimório mal fechado. Errou o ritual — você paga o preço.',
    vida: 6,
    danoMin: 1,
    danoMax: 4,
    evasao: 2,
    velAtaque: 0.9,
    resCaos: 15,
    resSagrado: 5,
    goldMin: 2,
    goldMax: 6,
    loot: [{ itemId: 'raiz-noturna', chance: 0.35 }],
  },
  'gargula-rachada': {
    id: 'gargula-rachada',
    locationId: 'catacumbas-profundas',
    name: 'Gárgula Rachada',
    description: 'Pedra que desprendeu do teto. Asas curtas, mandíbula de granito.',
    vida: 11,
    danoMin: 2,
    danoMax: 4,
    evasao: 1,
    velAtaque: 0.8,
    armadura: 4,
    bloqueio: 12,
    goldMin: 0,
    goldMax: 1,
  },
  'verme-de-ossos': {
    id: 'verme-de-ossos',
    locationId: 'catacumbas-profundas',
    name: 'Verme de Ossos',
    description: 'Serpente pálida que se alimenta de restos. Engole e não devolve.',
    vida: 10,
    danoMin: 2,
    danoMax: 3,
    evasao: 1,
    velAtaque: 0.95,
    rouboVida: 8,
    goldMin: 0,
    goldMax: 0,
    loot: [{ itemId: 'mat-couro-cru', chance: 0.2 }],
  },

  // Cidade Alta (masmorra)
  'guarda-fanatico': {
    id: 'guarda-fanatico',
    locationId: 'cidade-alta',
    name: 'Guarda Fanático',
    description: 'Elmo fechado, voz sem rosto. Defende a capital — mesmo debaixo dela.',
    vida: 12,
    danoMin: 3,
    danoMax: 5,
    evasao: 1,
    velAtaque: 0.9,
    armadura: 4,
    bloqueio: 12,
    goldMin: 4,
    goldMax: 9,
  },
  'penetra-das-muralhas': {
    id: 'penetra-das-muralhas',
    locationId: 'cidade-alta',
    name: 'Penetra das Muralhas',
    description: 'Conhece os túneis de serviço. Surgiu atrás de você — como sempre faz.',
    vida: 9,
    danoMin: 3,
    danoMax: 6,
    evasao: 4,
    velAtaque: 1.15,
    chanceCritico: 10,
    goldMin: 3,
    goldMax: 7,
    loot: [{ itemId: 'mat-pedra-afiar', chance: 0.2 }],
  },
  'eco-da-capital': {
    id: 'eco-da-capital',
    locationId: 'cidade-alta',
    name: 'Eco da Capital',
    description: 'Som sem fonte nas galerias. Quando materializa, já está gritando.',
    vida: 8,
    danoMin: 2,
    danoMax: 5,
    evasao: 3,
    velAtaque: 1.0,
    resSagrado: 10,
    resCaos: 10,
    goldMin: 0,
    goldMax: 3,
    loot: [{ itemId: 'erva-azul', chance: 0.3 }],
  },
  'carnificina-do-trono': {
    id: 'carnificina-do-trono',
    locationId: 'cidade-alta',
    name: 'Carnificina do Trono',
    description: 'Lâmina longa, passos medidos. Executa sentenças que ninguém assinou.',
    vida: 13,
    danoMin: 4,
    danoMax: 7,
    evasao: 1,
    velAtaque: 0.85,
    armadura: 3,
    multCritico: 1.7,
    goldMin: 6,
    goldMax: 12,
    xpFactor: 1.05,
  },

  // Forja do Caos
  'guardiao-de-cinzas': {
    id: 'guardiao-de-cinzas',
    locationId: 'forja-do-caos',
    name: 'Guardião de Cinzas',
    description: 'Armadura fundida ao corpo. Guarda a porta da forja — não negocia.',
    vida: 15,
    danoMin: 3,
    danoMax: 6,
    evasao: 1,
    velAtaque: 0.85,
    armadura: 5,
    resFogo: 30,
    bloqueio: 10,
    goldMin: 5,
    goldMax: 12,
    xpFactor: 1.1,
  },
  'aberracao-do-caos': {
    id: 'aberracao-do-caos',
    locationId: 'forja-do-caos',
    name: 'Aberração do Caos',
    description: 'Forma que muda a cada piscar de olhos. A lógica não se aplica aqui.',
    vida: 11,
    danoMin: 4,
    danoMax: 7,
    evasao: 3,
    velAtaque: 1.0,
    resCaos: 25,
    chanceCritico: 10,
    goldMin: 0,
    goldMax: 3,
    loot: [{ itemId: 'erva-azul', chance: 0.3 }],
    xpFactor: 1.0,
  },
  'forjado-corrompido': {
    id: 'forjado-corrompido',
    locationId: 'forja-do-caos',
    name: 'Forjado Corrompido',
    description: 'Ferramenta que ganhou vontade própria. O martelo ainda quer bater metal.',
    vida: 13,
    danoMin: 3,
    danoMax: 5,
    evasao: 0,
    velAtaque: 0.9,
    armadura: 4,
    resFogo: 15,
    goldMin: 2,
    goldMax: 5,
    loot: [{ itemId: 'mat-minerio-ferro', chance: 0.4 }],
  },
  'emissario-do-caos': {
    id: 'emissario-do-caos',
    locationId: 'forja-do-caos',
    name: 'Emissário do Caos',
    description: 'Figura encapuzada com runas que doem de olhar. O ar fica pesado ao redor.',
    vida: 12,
    danoMin: 4,
    danoMax: 8,
    evasao: 2,
    velAtaque: 1.05,
    chanceCritico: 12,
    multCritico: 1.8,
    resCaos: 20,
    resSagrado: 15,
    goldMin: 4,
    goldMax: 10,
    xpFactor: 1.2,
  },
};

/** Ordem das áreas na cadeia do atlas — usada pra ordenar o bestiário. */
const LOCATION_ORDER = [
  'floresta-densa',
  'corvalho',
  'pantano-mortos',
  'cripta-esquecida',
  'caminho-norte',
  'estepe-cinzenta',
  'mina-abandonada',
  'porto-lume',
  'picos-gelados',
  'catacumbas-profundas',
  'cidade-alta',
  'forja-do-caos',
] as const;

function locationSortIndex(locationId: string): number {
  const idx = LOCATION_ORDER.indexOf(locationId as (typeof LOCATION_ORDER)[number]);
  return idx === -1 ? 999 : idx;
}

export const ALL_ENEMY_DEFS: EnemyDef[] = Object.values(ENEMY_DEFS).sort(
  (a, b) => locationSortIndex(a.locationId) - locationSortIndex(b.locationId) || a.name.localeCompare(b.name, 'pt-BR'),
);

/** Pool derivado — um inimigo por área, sem duplicatas. */
export const LOCATION_ENEMIES: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const def of Object.values(ENEMY_DEFS)) {
    if (!map[def.locationId]) map[def.locationId] = [];
    map[def.locationId].push(def.id);
  }
  return map;
})();

export function getEnemySpawnLocations(defId: string): { id: string; name: string }[] {
  const def = ENEMY_DEFS[defId];
  if (!def) return [];
  const loc = getLocationById(def.locationId);
  return loc ? [{ id: loc.id, name: loc.name }] : [];
}

export function rollEncounter(locationId: string, characterLevel: number): Enemy | null {
  const pool = LOCATION_ENEMIES[locationId];
  if (!pool || pool.length === 0) return null;
  const loc = getLocationById(locationId);
  if (!loc) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const def = ENEMY_DEFS[pick];
  if (!def) return null;
  const level = resolveEncounterLevel(characterLevel, loc.level);
  return spawnEnemy(def, level);
}

export function hasEncounters(locationId: string): boolean {
  const pool = LOCATION_ENEMIES[locationId];
  return !!pool && pool.length > 0;
}
