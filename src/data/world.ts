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
    branch: 'parallel',
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
    branch: 'parallel',
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
    branch: 'parallel',
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
    branch: 'parallel',
    x: 1040,
    y: 85,
    connections: ['porto-lume'],
  },

  // ══ ATO II — As Profundezas (níveis 20–40) ═══════════════════════════
  // A descida ao Underdark sob a Forja do Caos.
  // ── Tronco: Candelária → … → Trono Cego ──────────────────────────────
  {
    id: 'candelaria',
    name: 'Candelária',
    region: 'Limiar Profundo',
    level: 20,
    description:
      'Última luz antes do breu absoluto. Velas em cada soleira, mantidas por exilados que se recusam a descer. Aqui ninguém dorme sem chama acesa.',
    type: 'town',
    act: 2,
    x: 110,
    y: 340,
    connections: ['forja-do-caos'],
  },
  {
    id: 'gargantas-breu',
    name: 'Gargantas de Breu',
    region: 'Fendas Inferiores',
    level: 22,
    description:
      'Fendas verticais onde a escuridão é espessa como água. O que vive aqui aprendeu a caçar sem olhos.',
    type: 'wilderness',
    act: 2,
    x: 310,
    y: 340,
    connections: ['candelaria'],
  },
  {
    id: 'mar-lajes',
    name: 'Mar de Lajes',
    region: 'Salões Cavos',
    level: 25,
    description:
      'Um chão de lajes quebradas que se estende como um mar morto. Cada passo ecoa — e algo sempre responde.',
    type: 'wilderness',
    act: 2,
    x: 480,
    y: 425,
    connections: ['gargantas-breu'],
  },
  {
    id: 'veios-ambar',
    name: 'Veios de Âmbar',
    region: 'Salões Cavos',
    level: 28,
    description:
      'Veios de âmbar vivo pulsam nas paredes — a única luz aqui embaixo. O brilho atrai presas, e o que come presas.',
    type: 'wilderness',
    act: 2,
    x: 640,
    y: 210,
    connections: ['mar-lajes'],
  },
  {
    id: 'foz-subterranea',
    name: 'Foz Subterrânea',
    region: 'Águas Negras',
    level: 31,
    description:
      'Um rio negro despeja-se num abismo sem fundo. A correnteza arrasta coisas que ainda se mexem.',
    type: 'wilderness',
    act: 2,
    x: 810,
    y: 295,
    connections: ['veios-ambar'],
  },
  {
    id: 'necropole-submersa',
    name: 'Necrópole Submersa',
    region: 'Águas Negras',
    level: 34,
    description:
      'Uma cidade afogada antes do tempo dos homens. As ruas seguem sob a água parada, e seus moradores nunca partiram.',
    type: 'dungeon',
    act: 2,
    x: 810,
    y: 480,
    connections: ['foz-subterranea'],
  },
  {
    id: 'carcere-raizes',
    name: 'Cárcere de Raízes',
    region: 'Raizame',
    level: 37,
    description:
      'Raízes petrificadas formam celas que prenderam algo por eras. As grades agora estão quebradas — por dentro.',
    type: 'dungeon',
    act: 2,
    x: 810,
    y: 610,
    connections: ['necropole-submersa'],
  },
  {
    id: 'trono-cego',
    name: 'Trono Cego',
    region: 'Coração do Abismo',
    level: 40,
    description:
      'No fundo de tudo, um trono sem rei e sem olhos. O que se senta nele enxerga cada coisa que ainda vive na luz.',
    type: 'boss',
    act: 2,
    x: 1040,
    y: 550,
    connections: ['carcere-raizes'],
  },

  // ── Ramos sem saída (Ato II) ────────────────────────────────────────
  {
    id: 'cripta-sal',
    name: 'Cripta de Sal',
    region: 'Fendas Inferiores',
    level: 24,
    description:
      'Galerias de sal cristalizado que preservam tudo o que tocam — inclusive os que entraram para nunca mais sair.',
    type: 'dungeon',
    act: 2,
    branch: 'parallel',
    x: 480,
    y: 85,
    connections: ['gargantas-breu'],
  },
  {
    id: 'mata-fungal',
    name: 'Mata Fungal',
    region: 'Salões Cavos',
    level: 27,
    description:
      'Uma floresta de cogumelos altos como árvores, fosforescente e úmida. Esporos saturam o ar — respire pouco.',
    type: 'wilderness',
    act: 2,
    branch: 'parallel',
    x: 640,
    y: 550,
    connections: ['mar-lajes'],
  },
  {
    id: 'mina-afogados',
    name: 'Mina dos Afogados',
    region: 'Águas Negras',
    level: 32,
    description:
      'Poços de mineração tomados pela água escura. Os antigos cavadores ainda erguem suas picaretas, lá no fundo.',
    type: 'dungeon',
    act: 2,
    branch: 'parallel',
    x: 810,
    y: 85,
    connections: ['veios-ambar'],
  },
  {
    id: 'abismo-ecoante',
    name: 'Abismo Ecoante',
    region: 'Coração do Abismo',
    level: 36,
    description:
      'Uma garganta sem fundo onde cada som volta multiplicado. Grite uma vez e mil vozes gritam de volta.',
    type: 'wilderness',
    act: 2,
    branch: 'parallel',
    x: 1040,
    y: 85,
    connections: ['foz-subterranea'],
  },

  // ══ ATO III — O Mar Sem Sol (níveis 40–60) ═══════════════════════════
  // Além do Trono Cego, o abismo se abre num oceano subterrâneo.
  {
    id: 'cais-palido',
    name: 'Cais Pálido',
    region: 'Margem Sem Sol',
    level: 40,
    description:
      'Um porto erguido na beira do mar interior, iluminado só pelo brilho dos seres das águas. Os últimos vivos atracam aqui.',
    type: 'town',
    act: 3,
    x: 110,
    y: 340,
    connections: ['trono-cego'],
  },
  {
    id: 'praias-obsidiana',
    name: 'Praias de Obsidiana',
    region: 'Margem Sem Sol',
    level: 42,
    description:
      'Areia de vidro negro que corta a sola. A maré traz coisas que nunca deveriam ter chegado à praia.',
    type: 'wilderness',
    act: 3,
    x: 310,
    y: 340,
    connections: ['cais-palido'],
  },
  {
    id: 'mar-sem-sol',
    name: 'Mar Sem Sol',
    region: 'Águas Cegas',
    level: 45,
    description:
      'Água negra que se estende além da luz da lanterna. Algo se move sob a superfície — sempre sob a superfície.',
    type: 'wilderness',
    act: 3,
    x: 480,
    y: 425,
    connections: ['praias-obsidiana'],
  },
  {
    id: 'recifes-cantantes',
    name: 'Recifes Cantantes',
    region: 'Águas Cegas',
    level: 48,
    description:
      'Corais ocos que cantam com a corrente. A melodia é bonita — e os afogados ao redor também acharam.',
    type: 'wilderness',
    act: 3,
    x: 640,
    y: 210,
    connections: ['mar-sem-sol'],
  },
  {
    id: 'arquipelago-afogado',
    name: 'Arquipélago Afogado',
    region: 'Ruínas Submersas',
    level: 51,
    description:
      'Picos de uma cidade que afundou inteira. As torres ainda furam a água, e as janelas ainda observam.',
    type: 'wilderness',
    act: 3,
    x: 810,
    y: 295,
    connections: ['recifes-cantantes'],
  },
  {
    id: 'templo-mares',
    name: 'Templo das Marés',
    region: 'Ruínas Submersas',
    level: 54,
    description:
      'Um santuário a um deus que o mar engoliu. Os fiéis continuam a reza, de pulmões cheios d\u2019água.',
    type: 'dungeon',
    act: 3,
    x: 810,
    y: 480,
    connections: ['arquipelago-afogado'],
  },
  {
    id: 'palacio-naufragado',
    name: 'Palácio Naufragado',
    region: 'Trono das Águas',
    level: 57,
    description:
      'A sede do império afogado, virada de cabeça pra baixo no leito. A corte nunca aceitou o fim do reinado.',
    type: 'dungeon',
    act: 3,
    x: 810,
    y: 610,
    connections: ['templo-mares'],
  },
  {
    id: 'leviata-adormecido',
    name: 'Leviatã Adormecido',
    region: 'Fundo Absoluto',
    level: 60,
    description:
      'No leito mais fundo, algo do tamanho de uma ilha respira devagar. Reze para que continue dormindo.',
    type: 'boss',
    act: 3,
    x: 1040,
    y: 550,
    connections: ['palacio-naufragado'],
  },
  {
    id: 'caverna-perolas',
    name: 'Caverna das Pérolas',
    region: 'Margem Sem Sol',
    level: 44,
    description:
      'Conchas do tamanho de portas, cada uma com sua pérola — e seu guardião que não dorme.',
    type: 'dungeon',
    act: 3,
    branch: 'parallel',
    x: 480,
    y: 85,
    connections: ['praias-obsidiana'],
  },
  {
    id: 'bruma-salgada',
    name: 'Bruma Salgada',
    region: 'Águas Cegas',
    level: 47,
    description:
      'Um banco de névoa que cheira a maresia e ferrugem. Vultos cruzam dentro dela e somem antes do segundo olhar.',
    type: 'wilderness',
    act: 3,
    branch: 'parallel',
    x: 640,
    y: 550,
    connections: ['mar-sem-sol'],
  },
  {
    id: 'casco-do-tita',
    name: 'Casco do Titã',
    region: 'Ruínas Submersas',
    level: 52,
    description:
      'Os restos de um navio grande como uma catedral, encalhado no escuro. Algo ainda comanda o convés.',
    type: 'dungeon',
    act: 3,
    branch: 'parallel',
    x: 810,
    y: 85,
    connections: ['arquipelago-afogado'],
  },
  {
    id: 'fenda-abissal',
    name: 'Fenda Abissal',
    region: 'Fundo Absoluto',
    level: 56,
    description:
      'O lugar onde o leito do mar se rasga e desce sem fim. A pressão esmaga; o frio mata; o que vive aqui faz pior.',
    type: 'wilderness',
    act: 3,
    branch: 'parallel',
    x: 1040,
    y: 85,
    connections: ['palacio-naufragado'],
  },

  // ══ ATO IV — As Veias de Fogo (níveis 60–80) ═════════════════════════
  // Sob o mar, a fornalha do mundo.
  {
    id: 'brasa-ultima',
    name: 'Brasa Última',
    region: 'Limiar de Fogo',
    level: 60,
    description:
      'O último abrigo antes do calor que derrete pedra. Forjas acesas dia e noite, porque aqui a noite não existe.',
    type: 'town',
    act: 4,
    x: 110,
    y: 340,
    connections: ['leviata-adormecido'],
  },
  {
    id: 'campos-cinza',
    name: 'Campos de Cinza',
    region: 'Limiar de Fogo',
    level: 62,
    description:
      'Planícies de cinza fina até onde a vista alcança. O que respira aqui já está meio queimado por dentro.',
    type: 'wilderness',
    act: 4,
    x: 310,
    y: 340,
    connections: ['brasa-ultima'],
  },
  {
    id: 'rios-magma',
    name: 'Rios de Magma',
    region: 'Veias Ardentes',
    level: 65,
    description:
      'Correntes de rocha derretida cortam o caminho. As pontes são finas, e o que as cruza com você não tem pressa de viver.',
    type: 'wilderness',
    act: 4,
    x: 480,
    y: 425,
    connections: ['campos-cinza'],
  },
  {
    id: 'caldeira-viva',
    name: 'Caldeira Viva',
    region: 'Veias Ardentes',
    level: 68,
    description:
      'Uma cratera que pulsa como um coração. A cada batida, o chão sobe — e algo sobe com ele.',
    type: 'wilderness',
    act: 4,
    x: 640,
    y: 210,
    connections: ['rios-magma'],
  },
  {
    id: 'desfiladeiro-brasa',
    name: 'Desfiladeiro de Brasa',
    region: 'Gargantas Ígneas',
    level: 71,
    description:
      'Paredes de obsidiana que respiram fogo pelas fendas. O ar queima ao entrar nos pulmões.',
    type: 'wilderness',
    act: 4,
    x: 810,
    y: 295,
    connections: ['caldeira-viva'],
  },
  {
    id: 'fundicao-primeva',
    name: 'Fundição Primeva',
    region: 'Gargantas Ígneas',
    level: 74,
    description:
      'A primeira forja que existiu, ainda acesa. Aqui se moldaram coisas antes de haver mãos para empunhá-las.',
    type: 'dungeon',
    act: 4,
    x: 810,
    y: 480,
    connections: ['desfiladeiro-brasa'],
  },
  {
    id: 'cofre-obsidiana',
    name: 'Cofre de Obsidiana',
    region: 'Núcleo',
    level: 77,
    description:
      'Um cofre selado em vidro vulcânico, guardando o que nem o fogo deveria tocar. Alguém quebrou o selo antes de você.',
    type: 'dungeon',
    act: 4,
    x: 810,
    y: 610,
    connections: ['fundicao-primeva'],
  },
  {
    id: 'coracao-da-forja',
    name: 'Coração da Forja',
    region: 'Núcleo',
    level: 80,
    description:
      'O centro incandescente do mundo, onde o primeiro fogo ainda arde. O ferreiro primordial nunca parou de bater.',
    type: 'boss',
    act: 4,
    x: 1040,
    y: 550,
    connections: ['cofre-obsidiana'],
  },
  {
    id: 'veia-enxofre',
    name: 'Veia de Enxofre',
    region: 'Limiar de Fogo',
    level: 64,
    description:
      'Túneis amarelos que ardem nos olhos e na garganta. Cada faísca é um risco — e há faíscas por toda parte.',
    type: 'dungeon',
    act: 4,
    branch: 'parallel',
    x: 480,
    y: 85,
    connections: ['campos-cinza'],
  },
  {
    id: 'planalto-calcinado',
    name: 'Planalto Calcinado',
    region: 'Veias Ardentes',
    level: 67,
    description:
      'Um platô de rocha rachada pelo calor, alto sobre o magma. Não há sombra, não há água, não há trégua.',
    type: 'wilderness',
    act: 4,
    branch: 'parallel',
    x: 640,
    y: 550,
    connections: ['rios-magma'],
  },
  {
    id: 'cripta-lava',
    name: 'Cripta de Lava',
    region: 'Gargantas Ígneas',
    level: 73,
    description:
      'Sepulturas seladas em rocha derretida que esfriou. O que estava morto aqui foi recozido em algo novo.',
    type: 'dungeon',
    act: 4,
    branch: 'parallel',
    x: 810,
    y: 85,
    connections: ['desfiladeiro-brasa'],
  },
  {
    id: 'geiser-negro',
    name: 'Gêiser Negro',
    region: 'Núcleo',
    level: 76,
    description:
      'Jatos de fumaça e fogo escuro irrompem sem aviso do chão. Entre uma erupção e outra, algo te espreita.',
    type: 'wilderness',
    act: 4,
    branch: 'parallel',
    x: 1040,
    y: 85,
    connections: ['cofre-obsidiana'],
  },

  // ══ ATO V — O Abismo Primordial (níveis 80–100) ══════════════════════
  // Abaixo do fogo, a origem de toda a escuridão.
  {
    id: 'ultimo-limiar',
    name: 'Último Limiar',
    region: 'Borda do Nada',
    level: 80,
    description:
      'O derradeiro lugar onde a realidade ainda obedece regras. Quem segue além raramente volta inteiro — se volta.',
    type: 'town',
    act: 5,
    x: 110,
    y: 340,
    connections: ['coracao-da-forja'],
  },
  {
    id: 'campos-vazio',
    name: 'Campos do Vazio',
    region: 'Borda do Nada',
    level: 83,
    description:
      'Uma planície onde não há chão nem céu, só uma extensão cinza que apaga os passos. O silêncio aqui tem peso.',
    type: 'wilderness',
    act: 5,
    x: 310,
    y: 340,
    connections: ['ultimo-limiar'],
  },
  {
    id: 'horizonte-quebrado',
    name: 'Horizonte Quebrado',
    region: 'Realidade Rachada',
    level: 86,
    description:
      'A linha do horizonte está partida em cacos flutuantes. Caminhar exige escolher por qual fragmento de mundo passar.',
    type: 'wilderness',
    act: 5,
    x: 480,
    y: 425,
    connections: ['campos-vazio'],
  },
  {
    id: 'jardim-ossos',
    name: 'Jardim de Ossos',
    region: 'Realidade Rachada',
    level: 89,
    description:
      'Tudo o que já morreu nas profundezas foi parar aqui, plantado como flores. Alguns ainda florescem.',
    type: 'wilderness',
    act: 5,
    x: 640,
    y: 210,
    connections: ['horizonte-quebrado'],
  },
  {
    id: 'limiar-do-nada',
    name: 'Limiar do Nada',
    region: 'Beira do Fim',
    level: 92,
    description:
      'A última fronteira antes de não haver mais nada. Do outro lado, algo enorme observa quem ousa chegar.',
    type: 'wilderness',
    act: 5,
    x: 810,
    y: 295,
    connections: ['jardim-ossos'],
  },
  {
    id: 'catedral-invertida',
    name: 'Catedral Invertida',
    region: 'Beira do Fim',
    level: 95,
    description:
      'Um templo que cresce de cabeça pra baixo no vazio, dedicado a algo que veio antes dos deuses.',
    type: 'dungeon',
    act: 5,
    x: 810,
    y: 480,
    connections: ['limiar-do-nada'],
  },
  {
    id: 'utero-do-caos',
    name: 'Útero do Caos',
    region: 'Origem',
    level: 97,
    description:
      'O lugar onde a escuridão pare a si mesma, sem parar nunca. Cada batida das paredes cospe mais um horror.',
    type: 'dungeon',
    act: 5,
    x: 810,
    y: 610,
    connections: ['catedral-invertida'],
  },
  {
    id: 'escuridao-primordial',
    name: 'A Escuridão Primordial',
    region: 'Origem',
    level: 100,
    description:
      'A fonte de tudo. O que havia antes da primeira luz, e o que restará depois da última. Você chegou ao fim.',
    type: 'boss',
    act: 5,
    x: 1040,
    y: 550,
    connections: ['utero-do-caos'],
  },
  {
    id: 'memoria-esquecida',
    name: 'Memória Esquecida',
    region: 'Borda do Nada',
    level: 85,
    description:
      'Um pedaço do mundo que o tempo apagou da história. Caminhar aqui é lembrar coisas que não foram suas.',
    type: 'dungeon',
    act: 5,
    branch: 'parallel',
    x: 480,
    y: 85,
    connections: ['campos-vazio'],
  },
  {
    id: 'planicie-sussurrante',
    name: 'Planície Sussurrante',
    region: 'Realidade Rachada',
    level: 88,
    description:
      'Uma campina de poeira que repete tudo o que você pensa, em voz alta, com a sua voz. Não pense em nada.',
    type: 'wilderness',
    act: 5,
    branch: 'parallel',
    x: 640,
    y: 550,
    connections: ['horizonte-quebrado'],
  },
  {
    id: 'selo-rachado',
    name: 'Selo Rachado',
    region: 'Beira do Fim',
    level: 94,
    description:
      'Uma porta antiga, lacrada por mãos que já viraram pó, agora trincada. Vaza pelas frestas algo que não tem nome.',
    type: 'dungeon',
    act: 5,
    branch: 'parallel',
    x: 810,
    y: 85,
    connections: ['limiar-do-nada'],
  },
  {
    id: 'eco-do-fim',
    name: 'Eco do Fim',
    region: 'Origem',
    level: 96,
    description:
      'O lugar onde o futuro já aconteceu. Você vê o próprio fim refletido em tudo — e ele anda em sua direção.',
    type: 'wilderness',
    act: 5,
    branch: 'parallel',
    x: 1040,
    y: 85,
    connections: ['utero-do-caos'],
  },
];

export interface ActMeta {
  num: number;
  /** Rótulo curto da aba, ex: "Ato II". */
  title: string;
  /** Nome temático do ato. */
  name: string;
  /** Faixa de nível aproximada [min, max]. */
  levelRange: [number, number];
  /** Se o ato já tem conteúdo jogável (controla aba habilitada). */
  available: boolean;
}

export const ACTS: ActMeta[] = [
  { num: 1, title: 'Ato I', name: 'O Vale de Pedra', levelRange: [1, 20], available: true },
  { num: 2, title: 'Ato II', name: 'As Profundezas', levelRange: [20, 40], available: true },
  { num: 3, title: 'Ato III', name: 'O Mar Sem Sol', levelRange: [40, 60], available: true },
  { num: 4, title: 'Ato IV', name: 'As Veias de Fogo', levelRange: [60, 80], available: true },
  { num: 5, title: 'Ato V', name: 'O Abismo Primordial', levelRange: [80, 100], available: true },
];

/** Ato do local (default 1 quando ausente). */
export function getLocationAct(location: MapLocation): number {
  return location.act ?? 1;
}

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
