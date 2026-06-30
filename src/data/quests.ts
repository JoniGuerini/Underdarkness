import type { Quest, QuestStatus } from '../types';

/**
 * Mock de missões cobrindo todos os estados (ativas, concluídas, falhadas)
 * e tipos (principal, side, bounty). Conteúdo flavor pra dar feel do mundo.
 */
export const QUESTS: Quest[] = [
  // ════════ ATIVAS ════════
  {
    id: 'q-ultima-carga',
    title: 'A Última Carga',
    type: 'principal',
    status: 'ativa',
    chapter: 'Capítulo I',
    giver: 'Mestre Aldric',
    locationId: 'corvalho',
    description:
      'O ancião da vila pediu sua ajuda. A estrada do norte não é mais segura.',
    story:
      'Aldric te encontra na estalagem. Os ombros caídos, mas o aperto de mão ainda firme. "Três caravanas em duas semanas. Não chegam ao Caminho do Norte. Os carroceiros somem, mas as carroças continuam viajando. Vazias." Ele te entrega uma bolsa. "Volte com notícias. Qualquer notícia."',
    objectives: [
      { text: 'Encontrar Mestre Aldric na estalagem', completed: true },
      { text: 'Investigar o trecho da estrada entre Corvalho e o Caminho do Norte', completed: false },
      { text: 'Retornar a Aldric com notícias', completed: false },
    ],
    rewards: [
      { type: 'gold', label: '50 Ouro' },
      { type: 'xp', label: '100 Experiência' },
      { type: 'reputation', label: 'Vila de Corvalho', detail: '+10' },
    ],
    journal: [
      {
        date: 'Dia 4 — Aurora',
        text: 'Cheguei à Vila de Corvalho ao entardecer. A estalagem estava silenciosa demais pra essa hora.',
      },
      {
        date: 'Dia 4 — Crepúsculo',
        text: 'Aldric me contou sobre as caravanas. Os relatos não fazem sentido — os carroceiros somem mas as carroças continuam viajando vazias até o destino. Ele jura que não está bebendo demais.',
      },
    ],
  },

  {
    id: 'q-tribunal-lobo',
    title: 'O Tribunal do Lobo',
    type: 'side',
    status: 'ativa',
    giver: 'Caçadora Selva',
    locationId: 'floresta-densa',
    description:
      'Os lobos da Floresta Densa estão se organizando. Não é natural.',
    story:
      'Selva te encontrou agachada num galho, observando. "Eu vivo nessa floresta há vinte anos. Lobo não faz isso. Não andam em círculos. Não param de uivar quando o sol nasce. Tem alguém — algo — comandando os bichos." Ela cuspiu pro chão. "Quero saber o quê."',
    objectives: [
      { text: 'Investigar o claro central da Floresta Densa', completed: false },
      { text: 'Examinar o comportamento dos lobos por uma noite inteira', completed: false },
      { text: 'Confrontar o que estiver no comando', completed: false },
    ],
    rewards: [
      { type: 'gold', label: '80 Ouro' },
      { type: 'xp', label: '150 Experiência' },
      { type: 'item', label: 'Botas de Sola Macia (Mágico)' },
    ],
    journal: [
      {
        date: 'Dia 6 — Crepúsculo',
        text: 'Selva apareceu sem aviso. Tem um peso nela que não é só dos vinte anos de mata.',
      },
    ],
  },

  {
    id: 'q-bounty-lobos',
    title: 'Caçada: Lobos do Inverno',
    type: 'bounty',
    status: 'ativa',
    giver: 'Guilda dos Caçadores',
    locationId: 'caminho-norte',
    description:
      'Cinco lobos do inverno foram avistados nas trilhas. Pague por cabeça.',
    story:
      'Edital pregado na placa da guilda, escrito em letras grossas: "Cabeça do Lobo do Inverno: 16 ouro cada. Provem com a pelagem. Não traga vivos." A tinta ainda estava fresca quando você passou.',
    expiresIn: '2 dias',
    objectives: [
      { text: 'Abater Lobos do Inverno', current: 2, total: 5, completed: false },
    ],
    rewards: [
      { type: 'gold', label: '80 Ouro (16 por cabeça)' },
      { type: 'xp', label: '50 Experiência' },
      { type: 'reputation', label: 'Guilda dos Caçadores', detail: '+5' },
    ],
    journal: [
      {
        date: 'Dia 5 — Aurora',
        text: 'Aceitei o edital. Tenho dois dias antes do prazo expirar.',
      },
      {
        date: 'Dia 5 — Tarde',
        text: 'Dois lobos abatidos perto do Caminho do Norte. Couros guardados.',
      },
    ],
  },

  {
    id: 'q-bounty-saqueadores',
    title: 'Caçada: Saqueadores das Estepes',
    type: 'bounty',
    status: 'ativa',
    giver: 'Guarda Real',
    locationId: 'estepe-cinzenta',
    description:
      'Três líderes de bando estão pilhando caravanas. Recompensa por captura ou morte.',
    story:
      'O cartaz da Guarda Real é mais elaborado: três retratos a carvão, três nomes em maiúsculas, três cabeças com preço. "Vivo se possível. Morto se necessário. Pague-se ao trazer prova." A urgência da Guarda é palpável.',
    expiresIn: '1 dia',
    objectives: [
      { text: 'Eliminar líderes saqueadores', current: 0, total: 3, completed: false },
    ],
    rewards: [
      { type: 'gold', label: '300 Ouro' },
      { type: 'xp', label: '400 Experiência' },
      { type: 'reputation', label: 'Guarda Real', detail: '+15' },
    ],
    journal: [
      {
        date: 'Dia 6 — Aurora',
        text: 'Aceitei. O prazo é apertado e os retratos parecem... familiares. Devo ter visto um deles em algum lugar.',
      },
    ],
  },

  {
    id: 'q-lingotes-perdidos',
    title: 'Lingotes Perdidos',
    type: 'side',
    status: 'ativa',
    requiresAccept: true,
    giver: 'Tibério',
    giverNpcId: 'tiberio',
    locationId: 'floresta-densa',
    description:
      'O ferreiro perdeu ferro na estrada leste. Precisa de três pedaços recuperados na Floresta Densa.',
    story:
      'Tibério bate o martelo na bigorna e para no meio do golpe. "Carroça tombou ontem à noite — ferro espalhado na curva antes da floresta. Não posso fechar pedido de espada sem aquele metal. Se trouxer três pedaços inteiros, pago em ouro e não esqueço."',
    objectives: [
      { text: 'Falar com Tibério na forja', completed: true },
      { text: 'Recuperar 3 Pedaços de Ferro na Floresta Densa', current: 0, total: 3, completed: false },
      { text: 'Entregar os pedaços a Tibério', completed: false },
    ],
    rewards: [
      { type: 'gold', label: '25 Ouro' },
      { type: 'xp', label: '40 Experiência' },
    ],
    journal: [],
  },

  // ════════ CONCLUÍDAS ════════
  {
    id: 'q-mensagem-porto',
    title: 'Mensagem ao Porto',
    type: 'principal',
    status: 'concluida',
    chapter: 'Prólogo',
    giver: 'Mestre Aldric',
    locationId: 'porto-lume',
    description:
      'Levar uma carta selada de Aldric até um certo Capitão Volk em Porto Lume.',
    story:
      'Sua primeira tarefa. Aldric te entregou um envelope com um lacre estranho — não era nenhum brasão que você conhecia. "Não abra. Não leia. Não pergunte. Só entregue ao Volk e volte."',
    objectives: [
      { text: 'Receber a carta de Aldric', completed: true },
      { text: 'Entregar ao Capitão Volk em Porto Lume', completed: true },
      { text: 'Retornar a Aldric', completed: true },
    ],
    rewards: [
      { type: 'gold', label: '20 Ouro' },
      { type: 'xp', label: '40 Experiência' },
    ],
    journal: [
      {
        date: 'Dia 1 — Crepúsculo',
        text: 'Recebi a carta. O lacre não me era familiar. Aldric me olhou com algo entre confiança e pena.',
      },
      {
        date: 'Dia 2 — Tarde',
        text: 'Volk recebeu a carta sem dizer uma palavra. Leu, queimou na vela, e me pagou em moedas pequenas. Algo está acontecendo nas sombras.',
      },
      {
        date: 'Dia 3 — Aurora',
        text: 'De volta a Corvalho. Aldric só assentiu quando me viu. Como se já soubesse o que Volk havia decidido.',
      },
    ],
  },

  {
    id: 'q-coleção-erudito',
    title: 'A Coleção do Erudito',
    type: 'bounty',
    status: 'concluida',
    giver: 'Erudito Cassio',
    locationId: 'cripta-esquecida',
    description:
      'Reunir dez pergaminhos antigos espalhados pelas catacumbas.',
    story:
      'Cassio passa os dias na entrada da Cripta, lendo a mesma página há semanas. "Faltam dez. Sempre os dez últimos. Quem quer que tenha escondido essa coleção sabia o que estava fazendo." Ele te ofereceu pagamento por cada pergaminho — autêntico — recuperado.',
    objectives: [
      { text: 'Recuperar pergaminhos antigos', current: 10, total: 10, completed: true },
    ],
    rewards: [
      { type: 'gold', label: '120 Ouro' },
      { type: 'xp', label: '200 Experiência' },
      { type: 'reputation', label: 'Erudito Cassio', detail: '+20' },
    ],
    journal: [
      {
        date: 'Dia 2 — Tarde',
        text: 'Aceitei. O Cassio é estranho mas honesto. Os pergaminhos estão protegidos por… coisas.',
      },
      {
        date: 'Dia 3 — Crepúsculo',
        text: 'Coleção completa entregue. Cassio mal me olhou — abriu o último e desabou na cadeira. Disse "Por todos os deuses, então é verdade" e me dispensou. Não perguntei o quê.',
      },
    ],
  },

  // ════════ CLASSE (Guerreiro) ════════
  {
    id: 'q-classe-aco-vivo',
    title: 'Provação do Aço Vivo',
    type: 'classe',
    status: 'ativa',
    giver: 'Mestre Halvar',
    locationId: 'corvalho',
    description:
      'O velho mestre de armas quer ver se você merece o título.',
    story:
      'Halvar te encontrou treinando atrás da estalagem. Ficou parado um tempo, sem dizer nada. Depois cuspiu no chão e disse: "Se você é guerreiro, prove. Sete combates. Corpo a corpo. Não recue um passo. Quem recua morre — ou pior, sobrevive sem honra."',
    objectives: [
      { text: 'Vencer combates corpo a corpo sem recuar', current: 3, total: 7, completed: false },
      { text: 'Retornar a Halvar com a marca dos sete', completed: false },
    ],
    rewards: [
      { type: 'xp', label: '300 Experiência' },
      { type: 'item', label: 'Faixa do Aço Vivo (Raro)' },
      { type: 'reputation', label: 'Veteranos do Corvo Cinza', detail: '+15' },
    ],
    journal: [
      {
        date: 'Dia 5 — Tarde',
        text: 'Halvar tem o olhar de alguém que viu tudo antes. Aceitei a provação. Três combates já. Quatro a faltar.',
      },
    ],
  },

  {
    id: 'q-classe-tres-cumes',
    title: 'Os Três Cumes',
    type: 'classe',
    status: 'ativa',
    giver: 'Conselho dos Veteranos',
    locationId: 'cidade-alta',
    description:
      'Três guerreiros lendários se exilaram em três picos diferentes. Encontre-os e duele com cada um.',
    story:
      'O Conselho te recebeu em silêncio. Quando o último velho falou, sua voz era mais sussurro do que palavra: "Antes do mestrado vem a peregrinação. Três espadas. Três derrotas. Não é vergonha perder — é vergonha não tentar." Te entregaram um mapa com três marcações sem nome.',
    objectives: [
      { text: 'Duelar com a Espada do Norte (Picos Gelados)', completed: true },
      { text: 'Duelar com a Espada do Pântano (Pântano dos Mortos)', completed: false },
      { text: 'Duelar com a Espada da Catacumba (Catacumbas Profundas)', completed: false },
    ],
    rewards: [
      { type: 'xp', label: '800 Experiência' },
      { type: 'item', label: 'Insígnia do Mestre de Armas (Único)' },
    ],
    journal: [
      {
        date: 'Dia 8 — Aurora',
        text: 'O primeiro cume foi os Picos Gelados. A Espada do Norte é uma mulher que mora numa caverna. Não falou comigo antes do duelo. Não falou depois. Só assentiu quando saí.',
      },
    ],
  },

  // ════════ EVENTO ════════
  {
    id: 'q-evento-mare-putrefatos',
    title: 'A Maré dos Putrefatos',
    type: 'evento',
    status: 'ativa',
    locationId: 'corvalho',
    description:
      'Os mortos do Pântano transbordaram. Vilas precisam de defensores agora.',
    story:
      'Acontece uma vez por geração: as águas do Pântano dos Mortos sobem, e o que estava soterrado caminha. Corvalho está na rota. Toda alma capaz é convocada. Os sinos não param.',
    expiresIn: '2 dias',
    objectives: [
      { text: 'Defender Corvalho durante a noite', current: 1, total: 3, completed: false },
      { text: 'Eliminar o Necromante que comanda a maré', completed: false },
    ],
    rewards: [
      { type: 'gold', label: '250 Ouro' },
      { type: 'xp', label: '500 Experiência' },
      { type: 'item', label: 'Amuleto da Vigília (Raro)' },
      { type: 'reputation', label: 'Vila de Corvalho', detail: '+25' },
    ],
    journal: [
      {
        date: 'Dia 6 — Crepúsculo',
        text: 'Os sinos começaram ao pôr do sol. Sobrevivi à primeira noite. Eles vieram em ondas, sempre do oeste. O cheiro fica nas roupas.',
      },
    ],
  },

  {
    id: 'q-evento-sol-curto',
    title: 'Festival do Sol Curto',
    type: 'evento',
    status: 'concluida',
    locationId: 'cidade-alta',
    description:
      'O solstício de inverno em Cidade Alta. Um dia em que o trabalho para e as fogueiras queimam até de manhã.',
    story:
      'Cidade Alta vira outra coisa no Sol Curto. As muralhas brancas refletem mil fogueiras. Estranhos compartilham mesa com nobres. Por uma noite, ninguém é inimigo de ninguém. Por uma noite.',
    objectives: [
      { text: 'Acender uma fogueira pessoal na praça', completed: true },
      { text: 'Compartilhar pão com três desconhecidos', completed: true },
      { text: 'Fazer uma oferenda ao Sol Velho antes da aurora', completed: true },
    ],
    rewards: [
      { type: 'gold', label: '50 Ouro' },
      { type: 'item', label: 'Bênção do Sol Velho (consumível, +20% XP por 3 dias)' },
    ],
    journal: [
      {
        date: 'Dia 3 — Crepúsculo',
        text: 'Cheguei a Cidade Alta no fim da tarde. As fogueiras já estavam aparecendo nas praças.',
      },
      {
        date: 'Dia 3 — Madrugada',
        text: 'Compartilhei pão com uma viúva, um soldado bêbado e uma criança que disse que eu parecia perdido. Acho que ela tinha razão.',
      },
      {
        date: 'Dia 4 — Aurora',
        text: 'A oferenda foi aceita — a chama da minha fogueira virou azul antes de apagar. Saí da cidade com o peito mais leve do que cheguei.',
      },
    ],
  },

  // ════════ FACÇÃO ════════
  {
    id: 'q-faccao-cacadores',
    title: 'Iniciação dos Caçadores',
    type: 'faccao',
    status: 'ativa',
    giver: 'Mestre Caçador Korad',
    locationId: 'caminho-norte',
    description:
      'Pra entrar de fato na Guilda, é preciso provar. Sozinho. Uma fera. Sem testemunha.',
    story:
      'Korad te entregou um rastro: pegadas frescas, pelagem branca presa num arbusto. "Lobo Branco do Norte. Ferido — você vai ver os pingos de sangue. Mas ferido não quer dizer fraco. Vai sozinho. Sem testemunha. Volte com a cabeça ou não volte."',
    objectives: [
      { text: 'Rastrear o Lobo Branco do Norte', completed: true },
      { text: 'Abater a fera sozinho (sem testemunha)', completed: false },
      { text: 'Apresentar a cabeça a Korad', completed: false },
    ],
    rewards: [
      { type: 'item', label: 'Insígnia da Guilda (Caçador Pleno)' },
      { type: 'reputation', label: 'Guilda dos Caçadores', detail: '+30' },
    ],
    journal: [
      {
        date: 'Dia 7 — Aurora',
        text: 'O rastro me levou pra cima do Caminho do Norte. O sangue continua. Algo me diz que o Lobo sabe que estou seguindo.',
      },
    ],
  },

  {
    id: 'q-faccao-guarda-real',
    title: 'Pacto da Guarda Real',
    type: 'faccao',
    status: 'concluida',
    giver: 'Capitã Lyra',
    locationId: 'cidade-alta',
    description:
      'Servir como informante voluntário em troca de proteção legal nas estradas reais.',
    story:
      'Lyra é jovem demais pra ser capitã. Ou velha demais pra parecer jovem. Você não consegue decidir. "Você anda. A gente precisa de gente que ande. Não estamos pedindo pra você delatar — só pra você nos contar o que vê. Em troca: as estradas reais são suas. Nenhum guarda te interroga. Nenhuma taxa te alcança." Você assinou.',
    objectives: [
      { text: 'Reunir-se com a Capitã Lyra', completed: true },
      { text: 'Assinar o pacto formal', completed: true },
    ],
    rewards: [
      { type: 'item', label: 'Selo da Guarda Real (passe livre nas estradas)' },
      { type: 'reputation', label: 'Guarda Real', detail: '+25' },
    ],
    journal: [
      {
        date: 'Dia 2 — Tarde',
        text: 'Assinei. Não li tudo. Lyra disse "ninguém lê tudo" quando perguntei se eu deveria. Suspeito que ela mesma não tenha lido.',
      },
    ],
  },

  // ════════ FALHADAS ════════
  {
    id: 'q-pacto-quebrado',
    title: 'O Pacto Quebrado',
    type: 'side',
    status: 'falhada',
    giver: 'Anciã Vora',
    locationId: 'pantano-mortos',
    description:
      'Mediar uma trégua entre os habitantes do Pântano e os caçadores. Falhou.',
    story:
      'Vora te recebeu numa cabana de palafita. "Os caçadores acham que somos monstros. Nós achamos que eles são saqueadores. Já se mataram demais. Você é de fora — talvez te escutem." Você aceitou. Você falhou. Cada lado culpou o outro pela aproximação. Os mortos só aumentaram.',
    objectives: [
      { text: 'Reunir-se com a Anciã Vora', completed: true },
      { text: 'Levar os termos aos Caçadores', completed: true },
      { text: 'Convencer ambos os lados a aceitar a trégua', completed: false },
    ],
    rewards: [
      { type: 'reputation', label: 'Pântano dos Mortos', detail: '−20' },
      { type: 'reputation', label: 'Guilda dos Caçadores', detail: '−15' },
    ],
    journal: [
      {
        date: 'Dia 5 — Aurora',
        text: 'Vora foi clara. Os termos eram justos. Ambos os lados deveriam ter aceitado.',
      },
      {
        date: 'Dia 5 — Crepúsculo',
        text: 'Os caçadores recusaram. Disseram que os "habitantes do pântano" não são humanos. Vora cuspiu no chão quando soube. Disse que eu nunca tinha sido confiável. Saí da cabana com uma flecha de aviso na lateral.',
      },
      {
        date: 'Dia 6 — Aurora',
        text: 'Soube que dois caçadores foram encontrados mortos perto da estrada do pântano. A guerra fria virou guerra aberta. Foi por minha mediação.',
      },
    ],
  },
];

// ============================================================================
// Helpers
// ============================================================================
export function getQuestsByStatus(status: QuestStatus): Quest[] {
  return QUESTS.filter((q) => q.status === status);
}

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

export const QUEST_TYPE_LABEL: Record<string, string> = {
  principal: 'Principal',
  side: 'Secundária',
  bounty: 'Caçada',
  classe: 'Classe',
  evento: 'Evento',
  faccao: 'Facção',
};

export const QUEST_STATUS_LABEL: Record<QuestStatus, string> = {
  ativa: 'Ativas',
  concluida: 'Concluídas',
  falhada: 'Falhadas',
};
