export type ClassKey = 'guerreiro' | 'ladino' | 'mago';

/**
 * Posição do equipamento no personagem (onde o item fica vestido).
 * Inclui anel1/anel2 — duas posições distintas.
 */
export type EquipSlot =
  | 'cabeca'
  | 'peito'
  | 'maos'
  | 'pes'
  | 'cinto'
  | 'amuleto'
  | 'anel1'
  | 'anel2'
  | 'arma'
  | 'escudo';

/**
 * Categoria do item (pra que tipo de slot ele se destina).
 * Genérico — um item "anel" pode ir em anel1 OU anel2.
 */
export type ItemSlot =
  | 'cabeca'
  | 'peito'
  | 'maos'
  | 'pes'
  | 'cinto'
  | 'amuleto'
  | 'anel'
  | 'arma'
  | 'escudo'
  | 'aljava';

export type Rarity = 'comum' | 'magico' | 'raro' | 'unico' | 'lendario';

/**
 * Chave de stat afetada por um efeito de item — define COMO o valor entra
 * no cálculo de derivados (substitui default, soma flat, soma percentual).
 *
 * Convenções:
 * - `weapon-*`     — base de arma; SUBSTITUI default da classe se arma equipada
 * - `flat-*`       — soma cumulativa entre todos os slots
 * - `pct-*`        — soma cumulativa como percentual (aplicado conforme stat)
 *
 * Pra mods de range (ex: "+ X a Y de Dano Físico"), `value` é o min e `max`
 * é o max — sumarizados separadamente.
 */
export type StatKey =
  // ── Base de arma (só armas setam; substitui default de classe) ──
  | 'weapon-speed'        // Velocidade de Ataque (ataques por segundo)
  | 'weapon-crit-base'    // % de crit base (substitui default 5%)
  // ── Flat (somam entre slots) ──
  | 'flat-vida' | 'flat-mana'
  | 'flat-armadura' | 'flat-evasao' | 'flat-escudo-energia'
  | 'flat-regen-vida' | 'flat-regen-mana' | 'flat-acerto'
  | 'flat-forca' | 'flat-agilidade' | 'flat-intelecto' | 'flat-todos-atributos'
  | 'flat-dmg-fis'
  | 'flat-dmg-fogo' | 'flat-dmg-gelo' | 'flat-dmg-raio' | 'flat-dmg-caos' | 'flat-dmg-sagrado'
  // ── Magias (%) ──
  | 'pct-dmg-magia'
  | 'pct-dmg-fogo-magia' | 'pct-dmg-gelo-magia' | 'pct-dmg-raio-magia'
  | 'pct-dmg-caos-magia' | 'pct-dmg-sagrado-magia'
  // ── Percentual (somam como %) ──
  | 'pct-res-fogo' | 'pct-res-gelo' | 'pct-res-raio' | 'pct-res-caos' | 'pct-res-sagrado' | 'pct-res-fisica'
  | 'pct-pen-fogo' | 'pct-pen-gelo' | 'pct-pen-raio' | 'pct-pen-caos' | 'pct-pen-sagrado'
  | 'pct-vel-ataque' | 'pct-red-tempo-conjuracao'
  | 'pct-crit-chance' | 'pct-crit-mult'
  | 'pct-eficiencia-mana'
  | 'pct-roubo-vida' | 'pct-roubo-mana'
  | 'pct-bloqueio';

export interface ItemStatEffect {
  key: StatKey;
  value: number;
  /** Pra ranges (ex: "+X a Y"), `max` carrega o segundo valor. Quando ausente,
   *  trata-se como flat puro (min = max = value). */
  max?: number;
}

/**
 * Trecho colorido dentro de uma linha de stat. `color` ausente = texto neutro.
 * `'valor'` é a cor dos números da ficha do personagem (brass), pra manter o
 * valor numérico consistente com o resto da UI.
 */
export interface ItemStatSegment {
  text: string;
  color?: ModColor | 'valor';
}

export interface ItemStat {
  /** texto exibido — ex: "+5 Dano Físico" */
  text: string;
  /** cor de categoria aplicada na linha inteira (opcional) */
  color?: ModColor;
  /**
   * Segmentos coloridos dentro da linha. Quando presente, o renderer usa isto
   * em vez de `text`+`color`, permitindo colorir só parte da linha (ex: apenas
   * o nome do atributo, deixando prefixo e valores neutros). `text` continua
   * como fallback textual.
   */
  segments?: ItemStatSegment[];
  /**
   * Categoria do stat — usada pelo tooltip pra inserir divisória visual
   * entre grupos (base | prefixos | sufixos). Opcional: itens mock antigos
   * sem `kind` renderizam como linha plana.
   */
  kind?: 'base' | 'prefix' | 'suffix';
  /** Efeito numérico — alimenta `computeDerivedStats`. Stat sem effect só
   *  exibe no tooltip (não afeta a ficha). */
  effect?: ItemStatEffect;
}

export interface Item {
  id: string;
  name: string;
  /** null = não-equipável (consumível, material) — só vai pro inventário */
  slot: ItemSlot | null;
  rarity: Rarity;
  /**
   * Nível do item (ilvl) — igual ao nível do monstro que o dropou. Define o
   * teto de tier dos afixos ao GERAR (não afeta o item depois de pronto).
   * Ausente em itens antigos/loja/materiais.
   */
  ilvl?: number;
  stats?: ItemStat[];
  /** texto-flavor (italic, no rodapé do tooltip) */
  description?: string;
  /** consumíveis empilháveis (poções, materiais) */
  stackable?: boolean;
  /** quantidade atual no stack (default 1) */
  stack?: number;
}

export type ModColor =
  | 'fisico' | 'fogo' | 'gelo' | 'raio' | 'caos' | 'sagrado'
  | 'vida' | 'mana' | 'exp' | 'ouro' | 'comum'
  | 'forca' | 'agilidade' | 'intelecto'
  | 'defesa' | 'critico' | 'energia';

export interface Ability {
  name: string;
  desc: string;
}

export interface ClassData {
  label: string;
  tagline: string;
  description: string;
  vida: number;
  forca: number;
  agilidade: number;
  intelecto: number;
  abilities: Ability[];
}

export interface Character {
  id: string;
  name: string;
  classKey: ClassKey;
  classLabel: string;
  classTagline: string;
  level: number;
  xp: number;
  xpNext: number;
  vidaMax: number;
  vidaAtual: number;
  manaMax: number;
  manaAtual: number;
  /** Escudo de Energia atual — vital que absorve dano ANTES da Vida.
   *  Máximo é derivado (só itens); restaura ao fim do combate. */
  esAtual: number;
  forca: number;
  agilidade: number;
  intelecto: number;
  abilities: Ability[];
  equipped: Record<EquipSlot, Item | null>;
  inventory: (Item | null)[];
  /** Mapa talent.id → rank atual (0 se não investido). */
  talentRanks: Record<string, number>;
  /** ids de locais já visitados — controla descoberta progressiva no Atlas */
  visitedLocations: string[];
  /** ids de missões abandonadas — somem do diário, podem ser retomadas no futuro */
  abandonedQuestIds: string[];
  /** Missões aceitas via diálogo com NPC — entram no diário quando `requiresAccept` */
  acceptedQuestIds: string[];
  /** Status por missão quando difere do mock global (ex: concluída pelo jogador) */
  questStates: Record<string, QuestStatus>;
  gold: number;
  time: string;
  day: number;
  period: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DerivedStats {
  /** Atributos finais (base + bônus de equipamento) — diferente de Character.forca etc. */
  forca: number;
  agilidade: number;
  intelecto: number;
  /** Vida e Mana máximas finais — class base + atributo + itens. Character.vidaMax
   *  e Character.manaMax são sincronizados a partir desses valores na migração. */
  vidaMax: number;
  manaMax: number;
  armadura: number;
  evasao: number;
  escudoEnergia: number;
  bloqueio: number;
  blockMax: number;
  resistMax: number;
  resFogo: number;
  resGelo: number;
  resRaio: number;
  resCaos: number;
  resFisico: number;
  danoFisicoMin: number;
  danoFisicoMax: number;
  danoTotalMin: number;
  danoTotalMax: number;
  velAtaque: number;
  chanceCritico: number;
  multCritico: number;
  dps: number;
  danoFogo: number;
  danoGelo: number;
  danoRaio: number;
  penFogo: number;
  penGelo: number;
  penRaio: number;
  danoCaos: number;
  penCaos: number;
  danoSagrado: number;
  resSagrado: number;
  penSagrado: number;
  pctDmgMagia: number;
  pctDmgFogoMagia: number;
  pctDmgGeloMagia: number;
  pctDmgRaioMagia: number;
  pctDmgCaosMagia: number;
  pctDmgSagradoMagia: number;
  reducaoTempoConjuracao: number;
  eficienciaMana: number;
  regenVida: number;
  regenMana: number;
  rouboVida: number;
  rouboMana: number;
  acerto: number;
}

// SOCIAL: 'social' adicionado pra mockup de chat multiplayer (removível)
export type TabKey = 'personagem' | 'habilidades' | 'mapa' | 'diario' | 'codice' | 'mercado' | 'social' | 'opcoes';

// ============================================================================
// Árvore de Talentos (estilo Diablo 2)
// ============================================================================
// ============================================================================
// Diário / Missões
// ============================================================================
export type QuestType = 'principal' | 'side' | 'bounty' | 'classe' | 'evento' | 'faccao';
export type QuestStatus = 'ativa' | 'concluida' | 'falhada';

export interface QuestObjective {
  text: string;
  /** Pra objetivos contáveis (ex: "Matar 5 lobos") — opcional */
  current?: number;
  total?: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'gold' | 'xp' | 'item' | 'reputation';
  label: string;
  /** Detalhe extra — ex: "Vila de Corvalho +10" pra reputação */
  detail?: string;
}

export interface JournalEntry {
  /** Data narrativa — ex: "Dia 4 — Crepúsculo" */
  date: string;
  text: string;
}

export interface Quest {
  id: string;
  title: string;
  type: QuestType;
  status: QuestStatus;
  /** Capítulo da história (opcional) — só pra quests principais */
  chapter?: string;
  /** NPC que deu a missão */
  giver?: string;
  /** Local relacionado — referência ao id de world.ts */
  locationId?: string;
  /** Pitch curto (1 frase) que aparece na lista */
  description: string;
  /** Parágrafo narrativo, contexto do tooltip do detalhe */
  story: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  journal: JournalEntry[];
  /** Pra bounties — texto descritivo de prazo, ex: "2 dias" */
  expiresIn?: string;
  /** Só aparece no diário depois que o jogador aceita com o NPC */
  requiresAccept?: boolean;
  /** id do NPC em npcs.ts que oferece/resolve a missão */
  giverNpcId?: string;
}

// ============================================================================
// Mapa / Atlas (estilo PoE 2)
// ============================================================================
export type LocationType = 'town' | 'wilderness' | 'dungeon' | 'boss';

/**
 * Posição do local na topologia do atlas:
 * - `main`: faz parte do tronco principal (rota que avança a história).
 * - `parallel`: ramo opcional sem saída — o player decide se entra.
 */
export type LocationBranch = 'main' | 'parallel';

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  region: string;
  level: number;
  /** Legado — não usado pelo itinerário. */
  x: number;
  y: number;
  /** ids dos locais conectados (bidirecional) */
  connections: string[];
  type?: LocationType;
  /** Default `main` quando ausente. */
  branch?: LocationBranch;
  /** Ato ao qual o local pertence. Default `1` quando ausente. */
  act?: number;
}

/**
 * Efeito linear por rank — usado pra mostrar "rank atual" e "próximo rank"
 * no tooltip, computando `perRank * rank`.
 * Talents com efeito não-linear / binário deixam isso vazio.
 */
export interface TalentEffect {
  /** valor que escala linearmente por rank investido */
  perRank: number;
  /** label do que está sendo aumentado (ex: "Dano Físico") */
  label: string;
  /** "%" pra percentual, vazio pra valor flat */
  unit?: '%' | '';
  /** cor da categoria pra colorir a label (espelha StatLine.Mod) */
  color?: ModColor;
  /** se true, mostra com sinal + (default: true). Use false pra valores flat tipo "alcance". */
  signed?: boolean;
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  /** linha (tier) — 0 = topo */
  row: number;
  /** coluna dentro da árvore */
  col: number;
  /** rank máximo investível */
  maxRank: number;
  /** ids de talents que precisam ter rank > 0 */
  prerequisites?: string[];
  /** efeito linear por rank (opcional) */
  effect?: TalentEffect;
}

export interface TalentTree {
  id: string;
  name: string;
  description: string;
  /** dimensões do grid (geralmente 3 colunas, 4 tiers) */
  cols: number;
  rows: number;
  talents: Talent[];
}
