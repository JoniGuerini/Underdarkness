/**
 * NPC — habitante de uma localização. Pode ter múltiplos papéis (falar,
 * vender, craftar, etc.) — cada papel destrava uma interação no diálogo.
 *
 * O sistema é declarativo: a UI lê os roles e renderiza os botões de ação
 * disponíveis. As implementações de loja/crafting ainda são stubs.
 */

export type NpcRole =
  | 'falar'
  | 'loja'
  | 'forjar'
  | 'destilar'
  | 'descansar';

export const NPC_ROLE_LABEL: Record<NpcRole, string> = {
  falar: 'Falar',
  loja: 'Loja',
  forjar: 'Forjar',
  destilar: 'Destilar',
  descansar: 'Descansar',
};

export interface Npc {
  id: string;
  /** Nome próprio — ex: "Tibério" */
  name: string;
  /** Função/título — ex: "Ferreiro", "Alquimista" */
  title: string;
  /** ID da localização (de world.ts) onde o NPC mora */
  locationId: string;
  /** Pitch curto (1 frase) que aparece no card da cena */
  description: string;
  /** Texto de "Falar" — exibido quando o jogador escolhe a interação básica */
  dialogue: string;
  /** Papéis disponíveis — define os botões de ação no diálogo */
  roles: NpcRole[];
  /** Retrato opcional — imagem quadrada exibida no card da cena. Quando
   *  presente, preenche o card inteiro e nome/título ficam sobrepostos. */
  portrait?: string;
}

/**
 * Roster da vila inicial — Pedragal. Cinco NPCs cobrindo as funções básicas:
 * - Tibério: ferraria (loja + crafting de armas/armaduras)
 * - Solana: alquimia (loja + crafting de poções)
 * - Doroteu: padaria (consumíveis baratos pra regen)
 * - Sirvên: ancião (lore, futuras quests)
 * - Madalena: estalagem (descanso pra recuperar Vida/Mana)
 */
export const NPCS: Npc[] = [
  {
    id: 'tiberio',
    name: 'Tibério',
    title: 'Ferreiro',
    locationId: 'pedragal',
    description:
      'Forja na entrada sul da vila. Mãos calejadas, olhar direto. Compra metais e velhas espadas, vende o que ele mesmo bate.',
    dialogue:
      '"Aço é honesto. Ou aguenta o golpe ou parte. Sem meio-termo. Se trouxer minério decente eu boto na bigorna; se não, tem coisa pronta no balcão."',
    roles: ['falar', 'loja', 'forjar'],
  },
  {
    id: 'solana',
    name: 'Solana',
    title: 'Alquimista',
    locationId: 'pedragal',
    description:
      'Mora na casa de cantos enegrecidos atrás da estalagem. Cheira a ervas. Sabe o nome de coisas que ninguém mais lembra.',
    dialogue:
      '"Tudo é veneno e tudo é cura — depende da dose. Tenho frascos prontos pra quem precisar agora. Pra quem traz raiz boa, eu destilo o que pedir."',
    roles: ['falar', 'loja', 'destilar'],
  },
  {
    id: 'doroteu',
    name: 'Doroteu',
    title: 'Padeiro',
    locationId: 'pedragal',
    description:
      'Padaria abre antes do galo. Pão duro, queijo de cabra, conserva de raiz. Comida de estrada que aguenta dias na bolsa.',
    dialogue:
      '"Pão saindo do forno desde que meu pai era moleque. Quem sai pra estrada leva um saco — engana fome até no terceiro dia."',
    roles: ['falar', 'loja'],
  },
  {
    id: 'sirven',
    name: 'Sirvên',
    title: 'Ancião',
    locationId: 'pedragal',
    description:
      'Sentado na pedra da praça desde que se entende. Sabe os nomes velhos do vale — os de antes do mapa.',
    dialogue:
      '"O vale tem mais histórias do que pessoas. A maioria delas começa aqui, em Pedragal. Sente um pouco e ouça — depois vá fazer a sua."',
    roles: ['falar'],
  },
  {
    id: 'madalena',
    name: 'Madalena',
    title: 'Estalajadeira',
    locationId: 'pedragal',
    description:
      'Toca a Estalagem do Vau sozinha desde que o marido sumiu na estrada do norte. Cama limpa, sopa quente, e sempre um quarto.',
    dialogue:
      '"Tem cama, tem sopa, tem fogo. Deixa as botas na porta e sobe. Se quiser saber o que andam dizendo, pague uma jarra e fique no salão."',
    roles: ['falar', 'descansar'],
  },
];

export function getNpcsAt(locationId: string): Npc[] {
  return NPCS.filter((n) => n.locationId === locationId);
}

export function getNpcById(id: string): Npc | undefined {
  return NPCS.find((n) => n.id === id);
}
