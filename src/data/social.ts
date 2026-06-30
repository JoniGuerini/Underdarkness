/**
 * MOCKUP DE CHAT MULTIPLAYER — apenas visual.
 *
 * Tudo aqui é dado fake pra simular um MMO chat (jogadores, mensagens,
 * amigos, guilda). Nada conecta a backend; o objetivo é avaliar a estética
 * de "MMO social" antes de decidir se a feature entra de fato.
 *
 * Pra REMOVER essa feature: delete `src/data/social.ts`, a pasta
 * `src/components/SocialView/`, e reverte as entradas marcadas com
 * `// SOCIAL:` em `types.ts`, `data/classes.ts`, `lib/settings.ts` e
 * `views/GameHud/GameHud.tsx`. Build limpa em ~30s.
 */

import type { ClassKey, QuestType, Rarity } from '../types';

// ============================================================================
// Tipos
// ============================================================================

export type PublicChatChannel = 'global' | 'trade' | 'lfg' | 'help';
/** Visualização do chat público — `geral` agrega todos os canais. */
export type PublicChatView = 'geral' | PublicChatChannel;
export type SocialChannel = PublicChatChannel | 'guilda';
export type MessageKind = SocialChannel | 'system' | 'achievement' | 'me';

/** Trechos coloridos de uma mensagem — texto plain, link de item, link de
 *  quest, ou menção a outro jogador. Renderizados separadamente pelo UI
 *  pra aplicar a cor certa em cada parte. */
export type MessageSegment =
  | { kind: 'text'; text: string }
  | { kind: 'item'; name: string; rarity: Rarity }
  | { kind: 'quest'; name: string; type: QuestType }
  | { kind: 'player'; name: string };

export interface ChatPlayer {
  name: string;
  level: number;
  classKey: ClassKey;
  /** Rank dentro da guilda — só usado em mensagens do canal "guilda" */
  guildRank?: 'Líder' | 'Oficial' | 'Veterano' | 'Membro' | 'Iniciado';
}

export interface ChatMessage {
  id: string;
  kind: MessageKind;
  /** Canal de origem — usado no feed Geral e ao filtrar por canal. */
  channel?: PublicChatChannel;
  /** "14:23" — timestamp humano */
  time: string;
  author?: ChatPlayer;
  segments: MessageSegment[];
}

export interface Friend {
  name: string;
  level: number;
  classKey: ClassKey;
  status: 'online' | 'ausente' | 'offline';
  /** Texto curto sobre onde está / o que tá fazendo */
  context: string;
  /** Histórico de DM mock — alterna entre fromMe e !fromMe */
  history: { fromMe: boolean; time: string; text: string }[];
}

// ============================================================================
// Constantes globais
// ============================================================================

export const SERVER_NAME = 'Pedragal';
export const ONLINE_COUNT = 1247;

/** Canais onde o jogador envia mensagens. */
export interface PublicChatChannelDef {
  id: PublicChatChannel;
  label: string;
  /** Texto curto no header do chat */
  description: string;
}

export const PUBLIC_CHAT_CHANNELS: PublicChatChannelDef[] = [
  { id: 'global', label: 'Global', description: 'Conversa geral do servidor' },
  { id: 'trade', label: 'Comércio', description: 'Compra, venda e troca de itens' },
  { id: 'lfg', label: 'Grupos', description: 'Procurando grupo e convites' },
  { id: 'help', label: 'Ajuda', description: 'Dúvidas de mecânica e progressão' },
];

export interface PublicChatViewDef {
  id: PublicChatView;
  label: string;
  description: string;
}

/** Abas/visualizações do chat na aba Global do Social (Geral + canais filtrados). */
export const PUBLIC_CHAT_VIEWS: PublicChatViewDef[] = [
  { id: 'geral', label: 'Geral', description: 'Todas as mensagens de todos os canais' },
  ...PUBLIC_CHAT_CHANNELS,
];

const CHANNEL_LABEL: Record<PublicChatChannel, string> = {
  global: 'Global',
  trade: 'Comércio',
  lfg: 'Grupos',
  help: 'Ajuda',
};

export function getChannelLabel(channel: PublicChatChannel): string {
  return CHANNEL_LABEL[channel];
}

export function getMessageChannel(message: ChatMessage): PublicChatChannel | null {
  if (message.channel) return message.channel;
  if (message.kind === 'global' || message.kind === 'trade' || message.kind === 'lfg' || message.kind === 'help') {
    return message.kind;
  }
  if (message.kind === 'system' || message.kind === 'achievement') return 'global';
  return null;
}

export function mergePublicMessages(
  byChannel: Record<PublicChatChannel, ChatMessage[]>,
): ChatMessage[] {
  const merged = PUBLIC_CHAT_CHANNELS.flatMap((ch) => byChannel[ch.id]);
  return merged.sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
}

export const GUILD = {
  name: 'Veteranos do Corvo Cinza',
  motto: 'O metal lembra. O sangue ensina.',
  memberCount: 47,
  onlineCount: 12,
};

// ============================================================================
// Helpers de construção (deixa o mock mais legível)
// ============================================================================

function p(name: string, level: number, classKey: ClassKey, guildRank?: ChatPlayer['guildRank']): ChatPlayer {
  return { name, level, classKey, guildRank };
}
function t(text: string): MessageSegment { return { kind: 'text', text }; }
function it(name: string, rarity: Rarity): MessageSegment { return { kind: 'item', name, rarity }; }
function qt(name: string, type: QuestType): MessageSegment { return { kind: 'quest', name, type }; }

let _id = 0;
function msg(
  kind: MessageKind,
  time: string,
  author: ChatPlayer | undefined,
  segments: MessageSegment[],
  channel?: PublicChatChannel,
): ChatMessage {
  const resolved =
    channel ??
    (kind === 'global' || kind === 'trade' || kind === 'lfg' || kind === 'help' ? kind : undefined) ??
    (kind === 'system' || kind === 'achievement' ? 'global' : undefined);
  return { id: `m${++_id}`, kind, channel: resolved, time, author, segments };
}

// ============================================================================
// Personagens recorrentes do mock
// ============================================================================

const acoFrio = p('AçoFrio_BR', 14, 'guerreiro', 'Veterano');
const selvinha = p('Selvinha', 23, 'ladino', 'Oficial');
const mestreEspada = p('MestreEspada89', 31, 'guerreiro');
const erudita = p('Erudita_do_Sul', 15, 'mago', 'Membro');
const procurandoBuild = p('ProcurandoBuild', 5, 'ladino');
const k4t4 = p('k4t4r1n4', 18, 'mago');
const botaVau = p('Bota_do_Vau', 9, 'guerreiro', 'Iniciado');
const vinhoFraco = p('VinhoFracoZé', 11, 'guerreiro');
const raposaSul = p('raposa_do_sul', 22, 'ladino', 'Veterano');
const padeiroDoroteu = p('PadeiroDoroteu', 4, 'mago'); // easter egg — alguém usou nome do NPC
const noobMage = p('noobMage123', 7, 'mago');
const loboNorte = p('Lobo_do_Norte', 19, 'guerreiro');
const diabloFan = p('DIABLO2_FOREVER', 35, 'ladino');

// ============================================================================
// CHAT GLOBAL — simula servidor cheio (~25 mensagens variadas)
// ============================================================================

export const GLOBAL_MESSAGES: ChatMessage[] = [
  msg('global', '14:02', vinhoFraco, [t('puta que pariu o boss do pântano')]),
  msg('system', '14:05', undefined, [t('Servidor Pedragal: '), t('1.247 jogadores online')]),
  msg('global', '14:08', k4t4, [t('drop rate de '), it('Raiz Noturna', 'comum'), t(' ta ridículo hj. fiz a cripta 6 vezes nada')]),
  msg('achievement', '14:10', undefined, [t('Selvinha conquistou '), qt('Iniciação dos Caçadores', 'faccao')]),
  msg('global', '14:10', selvinha, [t('caralho finalmente')]),
  msg('global', '14:10', raposaSul, [t('GZ caçadora, bora pra cima da próxima')]),
  msg('global', '14:11', procurandoBuild, [t('bom dia chat')]),
  msg('global', '14:15', mestreEspada, [t('porra de quest bugada')]),
  msg('achievement', '14:18', undefined, [t('AçoFrio_BR encontrou '), it('Insígnia do Mestre de Armas', 'unico'), t('!')]),
  msg('global', '14:18', acoFrio, [t('NÃO ACREDITO QUE DROPOU')]),
  msg('global', '14:18', vinhoFraco, [t('CARALHO')]),
  msg('global', '14:18', selvinha, [t('parabéns demais cara, esse item é raríssimo')]),
  msg('global', '14:19', diabloFan, [t('first try chefe')]),
];

// ============================================================================
// CHAT COMÉRCIO — /trade
// ============================================================================

export const TRADE_MESSAGES: ChatMessage[] = [
  msg('trade', '14:02', acoFrio, [t('alguém vd '), it('Erva Vermelha', 'comum'), t(' em pdg? solana ta cobrando 6g, ta de zoa')]),
  msg('trade', '14:06', mestreEspada, [t('VENDO '), it('Lâmina do Vau', 'magico'), t(' +8 dano fis +3 agi — fz proposta')]),
  msg('trade', '14:12', acoFrio, [t('compro '), it('Pedra de Afiar', 'comum'), t(' x20 — pago 4g cada')]),
  msg('trade', '14:20', noobMage, [t('quanto vale um item lendário?')]),
  msg('trade', '14:21', mestreEspada, [t('@noobMage123 lendário ngm vende, lvl 35 vc vê uns no /trade de tarde')]),
  msg('trade', '14:24', erudita, [t('WTB '), it('Essência de Gelo', 'comum'), t(' x10, pago 3g cada')]),
  msg('trade', '14:25', loboNorte, [t('VENDO set peito comum guerreiro nv 12 — 45g o kit')]),
];

// ============================================================================
// CHAT GRUPOS — /lfg
// ============================================================================

export const LFG_MESSAGES: ChatMessage[] = [
  msg('lfg', '14:04', selvinha, [t('lfg '), qt('A Coleção do Erudito', 'bounty'), t(' 4/5')]),
  msg('lfg', '14:16', loboNorte, [t('alguém comigo no pântano dos mortos? lvl 18+')]),
  msg('lfg', '14:17', k4t4, [t('to sim, daqui 5 min')]),
  msg('lfg', '14:22', raposaSul, [t('alguem fz '), qt('O Tribunal do Lobo', 'side'), t(' comigo? to perdida no claro central')]),
  msg('lfg', '14:23', botaVau, [t('to indo, espera 2 min')]),
  msg('lfg', '14:26', diabloFan, [t('LF2M raid '), qt('A Maré dos Putrefatos', 'evento'), t(' — tank + cura, sábado 21h')]),
  msg('lfg', '14:27', raposaSul, [t('preciso de 1 mago pra '), qt('Os Três Cumes', 'classe'), t(', já tenho guerreiro e ladino')]),
];

// ============================================================================
// CHAT AJUDA — /help
// ============================================================================

export const HELP_MESSAGES: ChatMessage[] = [
  msg('help', '14:03', noobMage, [t('como faço pra subir dano de magias?')]),
  msg('help', '14:03', erudita, [t('@noobMage123 equipa cajado e itens com '), it('+ % de Dano de Magias', 'magico'), t(' ou '), it('+ % de Dano de Magias de Fogo', 'magico'), t(' no sufixo')]),
  msg('help', '14:07', botaVau, [t('alguém indica build pra ladino solo? to apanhando feio')]),
  msg('help', '14:07', diabloFan, [t('@Bota_do_Vau agi cap depois critico, simples')]),
  msg('help', '14:13', padeiroDoroteu, [t('alguém sabe se '), qt('A Última Carga', 'principal'), t(' tem múltiplos finais? to no dilema da carta')]),
  msg('help', '14:14', erudita, [t('@PadeiroDoroteu sim, depende do que vc faz com a carta antes de entregar pro Volk')]),
  msg('help', '14:28', procurandoBuild, [t('onde pego a quest da floresta densa? mapa não mostra')]),
  msg('help', '14:29', acoFrio, [t('@ProcurandoBuild fala com o ancião em Pedragal depois de visitar o caminho do norte')]),
];

export const PUBLIC_CHANNEL_MESSAGES: Record<PublicChatChannel, ChatMessage[]> = {
  global: GLOBAL_MESSAGES,
  trade: TRADE_MESSAGES,
  lfg: LFG_MESSAGES,
  help: HELP_MESSAGES,
};

// ============================================================================
// CHAT DA GUILDA — Veteranos do Corvo Cinza, mais íntimo
// ============================================================================

const tibLider = p('TiberioReal', 27, 'guerreiro', 'Líder');
const acoVet = p('AçoFrio_BR', 14, 'guerreiro', 'Veterano');
const selvOf = p('Selvinha', 23, 'ladino', 'Oficial');
const eruMem = p('Erudita_do_Sul', 15, 'mago', 'Membro');
const novato = p('Bota_do_Vau', 9, 'guerreiro', 'Iniciado');
const raposaVet = p('raposa_do_sul', 22, 'ladino', 'Veterano');

export const GUILD_MESSAGES: ChatMessage[] = [
  msg('guilda', '13:42', tibLider, [t('galera, banco da guilda agora tem 12.450g. Quem precisar pra craft, fala comigo')]),
  msg('guilda', '13:43', selvOf, [t('boa Tib, salvou meu mês passado')]),
  msg('guilda', '13:55', novato, [t('oi galera, sou novo aqui, obrigado pelo convite!')]),
  msg('guilda', '13:55', tibLider, [t('Bem-vindo, '), { kind: 'player', name: 'Bota_do_Vau' }, t('. Lê o /motto se ainda não viu — é resumo do que somos')]),
  msg('guilda', '13:56', selvOf, [t('o motto faz parecer que matamos gente toda quinta haha')]),
  msg('guilda', '13:56', tibLider, [t('matamos sim. quartas tbm')]),
  msg('guilda', '14:01', eruMem, [t('alguém quer split de '), qt('Os Três Cumes', 'classe'), t(' comigo? só falta a Espada do Pântano')]),
  msg('guilda', '14:02', raposaVet, [t('to dentro, vou logar daqui 10 min')]),
  msg('guilda', '14:03', acoVet, [t('ô '), { kind: 'player', name: 'TiberioReal' }, t(', tu pode entrar no banco e tirar 3 '), it('Minério de Ferro', 'comum'), t('? to fazendo a Lâmina do Vau e to sem')]),
  msg('guilda', '14:04', tibLider, [t('jogado lá. depois devolve quando puder')]),
  msg('guilda', '14:04', acoVet, [t('valeu chefe')]),
  msg('guilda', '14:11', eruMem, [t('lembrando: evento de guilda sábado 21h, '), qt('A Maré dos Putrefatos', 'evento'), t('. Quem puder, marca presença')]),
  msg('guilda', '14:12', raposaVet, [t('vou tentar, depende da família')]),
  msg('guilda', '14:18', selvOf, [t('Aço dropou '), it('Insígnia do Mestre de Armas', 'unico'), t(' agora há pouco no global, bora dar parabéns')]),
  msg('guilda', '14:18', tibLider, [t('GG cara, demorou pra aparecer um único na guilda')]),
];

// ============================================================================
// AMIGOS — lista com DMs simuladas
// ============================================================================

export const FRIENDS: Friend[] = [
  {
    name: 'Selvinha',
    level: 23,
    classKey: 'ladino',
    status: 'online',
    context: 'Em Pedragal',
    history: [
      { fromMe: false, time: '13:50', text: 'oi, tu vai no evento sábado?' },
      { fromMe: true, time: '13:52', text: 'vou sim. tu leva poção?' },
      { fromMe: false, time: '13:52', text: 'levo umas 5 médias, nada lendário' },
      { fromMe: true, time: '13:53', text: 'fechou' },
      { fromMe: false, time: '14:10', text: 'olha o que dropei agora!!' },
    ],
  },
  {
    name: 'AçoFrio_BR',
    level: 14,
    classKey: 'guerreiro',
    status: 'online',
    context: 'Caminho do Norte',
    history: [
      { fromMe: false, time: '14:18', text: 'CARALHO MANO' },
      { fromMe: false, time: '14:18', text: 'INSÍGNIA' },
      { fromMe: true, time: '14:19', text: 'parabéns demais, achei que isso só dropava no nível 30+' },
      { fromMe: false, time: '14:19', text: 'eu tbm. ta fora dos guides isso' },
    ],
  },
  {
    name: 'Erudita_do_Sul',
    level: 15,
    classKey: 'mago',
    status: 'online',
    context: 'Cripta Esquecida',
    history: [
      { fromMe: false, time: '11:22', text: 'lembrei do que tu perguntou da carta' },
      { fromMe: false, time: '11:22', text: 'tem 3 finais. cada um leva pra um lugar diferente' },
      { fromMe: true, time: '11:30', text: 'valeu, vou pesquisar mais antes de fechar' },
    ],
  },
  {
    name: 'TiberioReal',
    level: 27,
    classKey: 'guerreiro',
    status: 'ausente',
    context: 'Almoçando',
    history: [
      { fromMe: true, time: '12:45', text: 'ô, tu tá ai?' },
      { fromMe: false, time: '13:30', text: 'desculpa, almoço. precisa de algo?' },
      { fromMe: true, time: '13:31', text: 'queria saber se tem vaga na guilda pra um amigo meu lvl 12' },
      { fromMe: false, time: '13:32', text: 'sempre tem. manda o nick que eu convido' },
    ],
  },
  {
    name: 'raposa_do_sul',
    level: 22,
    classKey: 'ladino',
    status: 'online',
    context: 'Floresta Densa',
    history: [
      { fromMe: false, time: '13:01', text: 'achei um spot bom pra grindar erva azul' },
      { fromMe: false, time: '13:01', text: 'tem 3 nodes que respawn em 4 min cada' },
      { fromMe: true, time: '13:05', text: 'manda print/coords' },
      { fromMe: false, time: '13:06', text: 'depois te mostro pessoalmente, é mais fácil' },
    ],
  },
  {
    name: 'k4t4r1n4',
    level: 18,
    classKey: 'mago',
    status: 'offline',
    context: 'Visto há 3h',
    history: [
      { fromMe: false, time: 'ontem', text: 'tu acha que vale a pena maxar caos antes de fogo?' },
      { fromMe: true, time: 'ontem', text: 'depende do build. caos ignora armadura, fogo escala mais' },
    ],
  },
  {
    name: 'Lobo_do_Norte',
    level: 19,
    classKey: 'guerreiro',
    status: 'offline',
    context: 'Visto há 1d',
    history: [
      { fromMe: false, time: 'ontem', text: 'partida boa hj, valeu' },
      { fromMe: true, time: 'ontem', text: 'qq hr, hoje não tô on' },
    ],
  },
  {
    name: 'Bota_do_Vau',
    level: 9,
    classKey: 'guerreiro',
    status: 'online',
    context: 'Em Pedragal — comprando equip',
    history: [
      { fromMe: false, time: '13:20', text: 'oi, foi tu que me indicou pra guilda né?' },
      { fromMe: true, time: '13:21', text: 'sim, te bem-vindo aí dentro. qualquer coisa fala' },
      { fromMe: false, time: '13:21', text: 'valeu mesmo' },
    ],
  },
];

// ============================================================================
// Construtor de mensagem do próprio jogador (usado quando digita no input)
// ============================================================================

export function makeOwnMessage(
  text: string,
  character: { name: string; level: number; classKey: ClassKey },
  channel: SocialChannel,
): ChatMessage {
  const publicChannel = channel === 'guilda' ? undefined : channel;
  return msg(
    'me',
    currentTimeHHMM(),
    { name: character.name, level: character.level, classKey: character.classKey },
    [t(text)],
    publicChannel,
  );
}

function currentTimeHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Cores de nome por classe — espelham RAID_CLASS_COLORS do WoW (ChrClasses.db2). */
export const CLASS_COLOR_VAR: Record<ClassKey, string> = {
  guerreiro: '#C69B6D', // Warrior
  ladino: '#FFF468',    // Rogue
  mago: '#3FC7EB',      // Mage
};
