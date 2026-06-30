import type { Character, Quest, QuestStatus } from '../types';
import { getQuestById, QUESTS } from '../data/quests';
import { applyLevelUp } from './leveling';

/** Status efetivo da missão pro personagem — null se ainda não visível no diário. */
export function getEffectiveQuestStatus(character: Character, quest: Quest): QuestStatus | null {
  if (character.questStates[quest.id]) return character.questStates[quest.id];
  if (quest.requiresAccept && !character.acceptedQuestIds.includes(quest.id)) return null;
  return quest.status;
}

export function hasAcceptedQuest(character: Character, questId: string): boolean {
  return character.acceptedQuestIds.includes(questId);
}

export function isQuestActiveForCharacter(character: Character, questId: string): boolean {
  const quest = getQuestById(questId);
  if (!quest) return false;
  return getEffectiveQuestStatus(character, quest) === 'ativa';
}

export function isQuestCompletedForCharacter(character: Character, questId: string): boolean {
  return character.questStates[questId] === 'concluida';
}

/** Missões visíveis numa aba do diário. */
export function getQuestsForCharacter(character: Character, status: QuestStatus): Quest[] {
  return QUESTS.filter((q) => {
    if (character.abandonedQuestIds.includes(q.id)) return false;
    return getEffectiveQuestStatus(character, q) === status;
  });
}

function parseRewardAmount(label: string): number {
  const match = label.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Aceita missão oferecida por NPC — entra no diário. */
export function acceptQuest(character: Character, questId: string): Character {
  if (character.acceptedQuestIds.includes(questId)) return character;
  return {
    ...character,
    acceptedQuestIds: [...character.acceptedQuestIds, questId],
  };
}

/** Conclui missão ativa e aplica recompensas de ouro/XP. */
export function completeQuest(character: Character, questId: string): Character {
  const quest = getQuestById(questId);
  if (!quest || !isQuestActiveForCharacter(character, questId)) return character;

  let gold = character.gold;
  let xp = character.xp;
  for (const reward of quest.rewards) {
    if (reward.type === 'gold') gold += parseRewardAmount(reward.label);
    if (reward.type === 'xp') xp += parseRewardAmount(reward.label);
  }

  const withRewards: Character = {
    ...character,
    gold,
    xp,
    questStates: { ...character.questStates, [questId]: 'concluida' },
  };

  return applyLevelUp(withRewards).character;
}
