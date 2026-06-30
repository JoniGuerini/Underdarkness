/**
 * Árvores de diálogo por NPC — aba FALAR no NpcDialog.
 * Cada nó tem fala do NPC e escolhas do jogador; ações disparam aceitar/concluir missão.
 */

import type { Character } from '../types';
import {
  acceptQuest,
  completeQuest,
  hasAcceptedQuest,
  isQuestActiveForCharacter,
  isQuestCompletedForCharacter,
} from '../lib/questProgress';

export type DialogueCondition =
  | 'always'
  | 'quest_not_accepted'
  | 'quest_active'
  | 'quest_completable'
  | 'quest_done';

export interface DialogueChoice {
  label: string;
  next: string;
  when?: DialogueCondition;
  questId?: string;
  /** Destaca escolha ligada a missão */
  questRelated?: boolean;
  action?: 'accept_quest' | 'complete_quest' | 'close';
}

export interface DialogueNode {
  id: string;
  text: string;
  choices: DialogueChoice[];
}

export interface NpcDialogueTree {
  npcId: string;
  start: string;
  nodes: Record<string, DialogueNode>;
}

const TIBERIO_QUEST = 'q-lingotes-perdidos';

const TIBERIO_TREE: NpcDialogueTree = {
  npcId: 'tiberio',
  start: 'saudacao',
  nodes: {
    saudacao: {
      id: 'saudacao',
      text:
        'Tibério ergue o olhar da bigorna. O calor da forja sobe entre vocês.\n\n"Aço é honesto. Ou aguenta o golpe ou parte. Sem meio-termo. O que te traz aqui?"',
      choices: [
        {
          label: 'Você parecia precisar de ajuda com algo.',
          next: 'pedido_ajuda',
          when: 'quest_not_accepted',
          questId: TIBERIO_QUEST,
          questRelated: true,
        },
        {
          label: 'Ainda estou procurando aqueles pedaços de ferro.',
          next: 'lembrete_missao',
          when: 'quest_active',
          questId: TIBERIO_QUEST,
        },
        {
          label: 'Trouxe os três pedaços de ferro da estrada.',
          next: 'entrega_missao',
          when: 'quest_completable',
          questId: TIBERIO_QUEST,
          questRelated: true,
        },
        {
          label: 'Obrigado pela espada — digo, pelo ferro da outra vez.',
          next: 'pos_missao',
          when: 'quest_done',
          questId: TIBERIO_QUEST,
        },
        {
          label: 'Me fala da forja. Como você trabalha o metal?',
          next: 'sobre_forja',
        },
        {
          label: 'Só passei pra cumprimentar. Até logo.',
          next: 'saudacao',
          action: 'close',
        },
      ],
    },

    pedido_ajuda: {
      id: 'pedido_ajuda',
      text:
        'Ele apoia o martelo no chão e suspira.\n\n"Carroça tombou ontem à noite na curva leste, antes da Floresta Densa. Ferro espalhado na lama — três lingotes inteiros, se a sorte não mentir. Tenho pedido de espada aberto e não posso esperar o comerciante voltar. Recupera três pedaços e eu pago em ouro. Não é heroísmo — é trabalho."',
      choices: [
        {
          label: 'Aceitar — vou até a floresta buscar o ferro.',
          next: 'missao_aceita',
          questId: TIBERIO_QUEST,
          questRelated: true,
          action: 'accept_quest',
        },
        {
          label: 'Agora não dá. Talvez depois.',
          next: 'saudacao',
        },
      ],
    },

    missao_aceita: {
      id: 'missao_aceita',
      text:
        '"Bom." Ele assente uma vez, seco. "Três pedaços, não menos. Estrada leste, curva antes dos pinheiros. Não fica bisbilhotando à toa — lobos gostam de ferro frio quanto de carne."\n\nA missão foi registrada no seu diário.',
      choices: [
        {
          label: 'Entendido. Volto com o ferro.',
          next: 'saudacao',
        },
      ],
    },

    lembrete_missao: {
      id: 'lembrete_missao',
      text:
        '"Ainda tô esperando." O martelo volta a bater, ritmado. "Três pedaços na estrada leste. Se encontrar entortado demais, deixa — só serve o que ainda aguenta a bigorna."',
      choices: [
        {
          label: 'Vou continuar procurando.',
          next: 'saudacao',
        },
        {
          label: 'Na verdade, trouxe o ferro agora.',
          next: 'entrega_missao',
          when: 'quest_completable',
          questId: TIBERIO_QUEST,
          questRelated: true,
        },
      ],
    },

    entrega_missao: {
      id: 'entrega_missao',
      text:
        'Tibério pega cada pedaço, gira na mão e examina a superfície.\n\n"Ferro bom. Pesa certo, sem trinca no miolo." Ele empilha os três ao lado da bigorna. "Serve. Pega o ouro — e se precisar de lâmina nova, sabe onde me achar."',
      choices: [
        {
          label: 'Pegar a recompensa.',
          next: 'pos_missao',
          questId: TIBERIO_QUEST,
          questRelated: true,
          action: 'complete_quest',
        },
      ],
    },

    pos_missao: {
      id: 'pos_missao',
      text:
        '"Metal não mente, e quem trabalha com ele também não deveria." Um quase-sorriso. "Forja aberta. Balcão também, se tiver pressa."',
      choices: [
        {
          label: 'Voltar à conversa.',
          next: 'saudacao',
        },
      ],
    },

    sobre_forja: {
      id: 'sobre_forja',
      text:
        '"Aqueço até o vermelho sumir e o aço ficar cor de cinza-azulado. Martelo define o fio; a bigorna define a curva." Ele aponta pro fogo com o queixo. "Cada arma que sai daqui carrega o peso de quem a segura. Por isso não vendo pra qualquer um — mas compro sucata de qualquer mão, se for metal de verdade."',
      choices: [
        {
          label: 'Interessante. Tem mais alguma coisa?',
          next: 'saudacao',
        },
      ],
    },
  },
};

const DIALOGUE_TREES: Record<string, NpcDialogueTree> = {
  tiberio: TIBERIO_TREE,
};

export function getDialogueTree(npcId: string): NpcDialogueTree | undefined {
  return DIALOGUE_TREES[npcId];
}

function matchesCondition(
  condition: DialogueCondition | undefined,
  questId: string | undefined,
  character: Character,
): boolean {
  if (!condition || condition === 'always') return true;
  if (!questId) return false;

  switch (condition) {
    case 'quest_not_accepted':
      return !hasAcceptedQuest(character, questId);
    case 'quest_active':
      return isQuestActiveForCharacter(character, questId);
    case 'quest_completable':
      return isQuestActiveForCharacter(character, questId);
    case 'quest_done':
      return isQuestCompletedForCharacter(character, questId);
    default:
      return true;
  }
}

export function getVisibleChoices(
  choices: DialogueChoice[],
  character: Character,
): DialogueChoice[] {
  return choices.filter((c) => matchesCondition(c.when, c.questId, character));
}

/** ! = missão disponível · ? = entregar missão */
export function getQuestMarker(choice: DialogueChoice): '!' | '?' | null {
  if (choice.action === 'complete_quest') return '?';
  if (choice.when === 'quest_completable') return '?';
  if (
    choice.questRelated ||
    choice.action === 'accept_quest' ||
    choice.when === 'quest_not_accepted'
  ) {
    return '!';
  }
  return null;
}

export function applyDialogueAction(
  character: Character,
  choice: DialogueChoice,
): Character {
  if (!choice.action || !choice.questId) return character;
  if (choice.action === 'accept_quest') return acceptQuest(character, choice.questId);
  if (choice.action === 'complete_quest') return completeQuest(character, choice.questId);
  return character;
}
