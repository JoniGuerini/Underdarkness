/**
 * MOCKUP DE GRUPOS / LFG (Looking For Group).
 *
 * Lista fake de grupos abertos buscando jogadores. Ideia: visualizar uma
 * interface estilo "Premade Group Finder" do WoW adaptada ao conteúdo
 * que já existe no jogo — quests, masmorras, raids, eventos.
 *
 * Tudo aqui é mockup visual — nada conecta a backend. Pra remover essa
 * feature, delete `src/data/parties.ts` e a `PartiesPane` de SocialView.
 */

import type { ClassKey } from '../types';

/** Tipos de conteúdo que um grupo pode ter — mistura quest types reais
 *  com categorias informais (masmorra, raid, aberto, farm). */
export type PartyContentType =
  | 'principal'
  | 'side'
  | 'bounty'
  | 'classe'
  | 'evento'
  | 'faccao'
  | 'masmorra'
  | 'raid'
  | 'aberto'
  | 'farm';

export const PARTY_TYPE_LABEL: Record<PartyContentType, string> = {
  principal: 'Principal',
  side: 'Secundária',
  bounty: 'Caçada',
  classe: 'Classe',
  evento: 'Evento',
  faccao: 'Facção',
  masmorra: 'Masmorra',
  raid: 'Raid',
  aberto: 'Aberto',
  farm: 'Farm',
};

/** Categorias de navegação no buscador de atividades */
export type ActivityCategory = 'todos' | 'masmorra' | 'raid' | 'missao' | 'farm' | 'aberto';

export const ACTIVITY_CATEGORY_LABEL: Record<ActivityCategory, string> = {
  todos: 'Todas',
  masmorra: 'Masmorras',
  raid: 'Raids',
  missao: 'Missões',
  farm: 'Farm',
  aberto: 'Aberto',
};

export function getActivityCategory(type: PartyContentType): ActivityCategory {
  if (type === 'masmorra') return 'masmorra';
  if (type === 'raid') return 'raid';
  if (type === 'farm') return 'farm';
  if (type === 'aberto') return 'aberto';
  return 'missao';
}

export interface PartyLeader {
  name: string;
  level: number;
  classKey: ClassKey;
}

export interface PartyListing {
  id: string;
  /** Título escrito pelo líder — estilo livre, costuma carregar a chamada */
  title: string;
  /** Pitch mais longo — flavor + objetivos do grupo */
  description: string;
  leader: PartyLeader;
  type: PartyContentType;
  /** Nome da atividade em destaque — masmorra, raid ou missão */
  activity: string;
  /** Região ou local do atlas (quando aplicável) */
  location?: string;
  /** Referência opcional a uma quest existente (renderiza como link) */
  questRef?: string;
  members: { current: number; max: number };
  levelRange: { min: number; max: number };
  /** Minutos desde criação — usado pra "há X min" / "há X h" */
  ageMinutes: number;
  /** Necessita voice chat (Discord, etc.) */
  voiceRequired?: boolean;
  /** Vagas que o líder ainda procura */
  lookingFor?: string[];
}

const lead = (name: string, level: number, classKey: ClassKey): PartyLeader => ({ name, level, classKey });

// Roster reusa nomes que aparecem no chat global pra dar coesão — mesmos
// jogadores postam grupo e conversam no /global.
export const PARTIES: PartyListing[] = [
  {
    id: 'p1',
    title: 'LFM — falta tank',
    activity: 'Cripta Esquecida',
    location: 'Corvalho',
    description: 'Brincamos casual, foco em completar a masmorra e sair com loot. Se for novo, sem stress — explico no caminho.',
    leader: lead('AçoFrio_BR', 14, 'guerreiro'),
    type: 'masmorra',
    questRef: 'A Coleção do Erudito',
    members: { current: 4, max: 5 },
    levelRange: { min: 8, max: 16 },
    ageMinutes: 12,
    lookingFor: ['Tank'],
  },
  {
    id: 'p2',
    title: 'Speedrun em 4 min',
    activity: 'A Última Carga',
    location: 'Estepe Cinzenta',
    description: 'Fiz 30+ vezes, sei o caminho ótimo. Precisa de atenção e não ficar parado mexendo no inventário.',
    leader: lead('MestreEspada89', 31, 'guerreiro'),
    type: 'principal',
    questRef: 'A Última Carga',
    members: { current: 1, max: 3 },
    levelRange: { min: 5, max: 99 },
    ageMinutes: 3,
    voiceRequired: true,
  },
  {
    id: 'p3',
    title: 'FORMANDO RAID — sábado 21h',
    activity: 'Forja do Caos',
    location: 'Profundezas',
    description: 'Boss final do atlas. 12/20 confirmados. Levem poções médias e armas com elemento. Discord obrigatório.',
    leader: lead('TiberioReal', 27, 'guerreiro'),
    type: 'raid',
    questRef: 'A Maré dos Putrefatos',
    members: { current: 12, max: 20 },
    levelRange: { min: 18, max: 99 },
    ageMinutes: 240,
    voiceRequired: true,
    lookingFor: ['Curador', 'Tank', 'DPS'],
  },
  {
    id: 'p4',
    title: 'Caçada — vou pra cima',
    activity: 'Caçada: Lobos do Inverno',
    location: 'Picos Gelados',
    description: 'Pago 50% do bounty pra quem entrar. Faço em ~30 min se ninguém ficar enrolando.',
    leader: lead('Selvinha', 23, 'ladino'),
    type: 'bounty',
    questRef: 'Caçada: Lobos do Inverno',
    members: { current: 2, max: 4 },
    levelRange: { min: 12, max: 99 },
    ageMinutes: 18,
  },
  {
    id: 'p5',
    title: 'Iniciação — guia + dúvidas',
    activity: 'Iniciação dos Caçadores',
    location: 'Pântano dos Mortos',
    description: 'Sou Caçador Pleno. Não posso entrar com você no solo (regra da quest), mas tiro dúvidas e dou tips antes.',
    leader: lead('raposa_do_sul', 22, 'ladino'),
    type: 'faccao',
    questRef: 'Iniciação dos Caçadores',
    members: { current: 1, max: 2 },
    levelRange: { min: 10, max: 25 },
    ageMinutes: 65,
  },
  {
    id: 'p6',
    title: 'PvE casual, devagar e bonito',
    activity: 'Exploração livre',
    location: 'Floresta Densa',
    description: 'Sem pressa, sem speedrun. Foco no gameplay tranquilo, conversar e explorar. Qualquer classe.',
    leader: lead('Erudita_do_Sul', 15, 'mago'),
    type: 'aberto',
    members: { current: 3, max: 5 },
    levelRange: { min: 10, max: 20 },
    ageMinutes: 8,
  },
  {
    id: 'p7',
    title: 'Os Três Cumes — peregrinação',
    activity: 'Os Três Cumes',
    location: 'Cordilheira',
    description: 'Quest de classe guerreiro. Já bati no Picos Gelados, falta os outros dois cumes. Vou junto na sua run.',
    leader: lead('Lobo_do_Norte', 19, 'guerreiro'),
    type: 'classe',
    questRef: 'Os Três Cumes',
    members: { current: 2, max: 3 },
    levelRange: { min: 18, max: 30 },
    ageMinutes: 45,
  },
  {
    id: 'p8',
    title: 'FARM Raiz Noturna — lvl 12+',
    activity: 'Cripta Esquecida',
    location: 'Catacumbas',
    description: 'Achei spot bom na Cripta — 3 nodes que respawn em 4min. Divido drops igual entre todos.',
    leader: lead('k4t4r1n4', 18, 'mago'),
    type: 'farm',
    members: { current: 1, max: 4 },
    levelRange: { min: 12, max: 99 },
    ageMinutes: 28,
  },
  {
    id: 'p9',
    title: 'Travei no boss',
    activity: 'O Tribunal do Lobo',
    location: 'Floresta Densa',
    description: 'Já fiz a parte de investigar e examinar. Travei no confronto. Preciso de alguém pra ajudar a derrubar.',
    leader: lead('Bota_do_Vau', 9, 'guerreiro'),
    type: 'side',
    questRef: 'O Tribunal do Lobo',
    members: { current: 1, max: 3 },
    levelRange: { min: 8, max: 15 },
    ageMinutes: 6,
    lookingFor: ['DPS'],
  },
  {
    id: 'p10',
    title: 'Treino com Mestre Halvar',
    activity: 'Provação do Aço Vivo',
    location: 'Pedragal',
    description: 'Provação dos sete combates. Precisa ser guerreiro lvl 8+. Fazemos em sequência rápida.',
    leader: lead('VinhoFracoZé', 11, 'guerreiro'),
    type: 'classe',
    questRef: 'Provação do Aço Vivo',
    members: { current: 2, max: 4 },
    levelRange: { min: 8, max: 20 },
    ageMinutes: 90,
  },
  {
    id: 'p11',
    title: 'WTS Carry — Insígnia',
    activity: 'Mina Abandonada',
    location: 'Estepe Cinzenta',
    description: 'Lvl 30+ apenas. Cobro 200g pelo carry na masmorra. Desconto pra grupo de 3+. Pago sucesso ou volta o ouro.',
    leader: lead('DIABLO2_FOREVER', 35, 'ladino'),
    type: 'masmorra',
    members: { current: 1, max: 4 },
    levelRange: { min: 30, max: 99 },
    ageMinutes: 4,
    lookingFor: ['Cliente'],
  },
  {
    id: 'p12',
    title: 'Pacto Quebrado — mediação 2.0',
    activity: 'O Pacto Quebrado',
    location: 'Pântano dos Mortos',
    description: 'Tentando refazer a quest. Preciso de alguém com reputação alta com os Caçadores ou o Pântano.',
    leader: lead('ProcurandoBuild', 5, 'ladino'),
    type: 'side',
    questRef: 'O Pacto Quebrado',
    members: { current: 1, max: 2 },
    levelRange: { min: 5, max: 12 },
    ageMinutes: 150,
  },
  {
    id: 'p13',
    title: 'Primeira clear — Catacumbas',
    activity: 'Catacumbas Profundas',
    location: 'Porto Lume',
    description: 'Nunca entrei. Quero grupo organizado, sem rush. Leio o mapa devagar e marco tudo.',
    leader: lead('noobMage123', 11, 'mago'),
    type: 'masmorra',
    members: { current: 2, max: 5 },
    levelRange: { min: 10, max: 14 },
    ageMinutes: 22,
    lookingFor: ['Tank', 'Curador'],
  },
  {
    id: 'p14',
    title: 'Raid semanal — Cidade Alta',
    activity: 'Cidade Alta',
    location: 'Capital',
    description: 'Masmorra de raid 10 jogadores nas baixadas da capital. Já temos rota memorizada — só falta gente.',
    leader: lead('Selvinha', 23, 'ladino'),
    type: 'raid',
    members: { current: 7, max: 10 },
    levelRange: { min: 14, max: 99 },
    ageMinutes: 35,
    voiceRequired: true,
    lookingFor: ['Tank', 'DPS'],
  },
];

/** Formata `ageMinutes` em texto humano: "agora" / "há 12 min" / "há 4h" / "há 2d" */
export function formatAge(minutes: number): string {
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

/** Conta grupos por categoria de atividade */
export function countByCategory(parties: PartyListing[]): Record<ActivityCategory, number> {
  const counts: Record<ActivityCategory, number> = {
    todos: parties.length,
    masmorra: 0,
    raid: 0,
    missao: 0,
    farm: 0,
    aberto: 0,
  };
  for (const p of parties) {
    counts[getActivityCategory(p.type)] += 1;
  }
  return counts;
}
