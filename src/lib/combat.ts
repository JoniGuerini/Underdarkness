/**
 * Helpers de combate por turnos. Mantém a lógica pura aqui — o componente
 * `CombatModal` só orquestra estado e renderização.
 */

import type { Character, Item, DerivedStats } from '../types';
import type { Enemy } from '../data/enemies';
import { getEnemyAcerto, getEnemyCritChance, getEnemyCritMult, getEnemyVelAtaque } from '../data/enemies';
import { getGrantedSpell, type ElementKey, type Spell } from '../data/spells';
import { computeDerivedStats, effectiveManaCost, effectiveCastTime } from './stats';
import { addItemToInventory } from './inventory';
import { applyLevelUp } from './leveling';
import { generateEquipment } from './itemGen';
import { getMaterial } from '../data/materials';

/** Resultado de uma ação ofensiva (jogador ou inimigo) */
export interface AttackResult {
  /** Quem está atacando (pra log) */
  attacker: string;
  /** Quem está defendendo (pra log) */
  defender: string;
  /** Dano efetivamente aplicado (0 se errou) */
  damage: number;
  /** True se o defensor evadiu (Acerto vs Evasão) */
  dodged: boolean;
  /** True se o golpe foi crítico */
  critical: boolean;
  /** True se o defensor bloqueou (anulou 100% do dano) */
  blocked: boolean;
  /** Marcador opcional do tipo de ação (ataque básico, habilidade, etc.) */
  kind: 'attack' | 'ability';
  /** Multiplicador aplicado (1 pra ataque, 1.5 pra habilidade básica) */
  multiplier: number;
  /** Roubo de vida do atacante neste golpe (0 se nenhum) */
  leechVida: number;
  /** Roubo de mana do atacante neste golpe (0 se nenhum) */
  leechMana: number;
  /** Nome da magia (ataque básico do Mago) */
  spellName?: string;
}

function r(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Uma rolagem: Acerto vs Evasão. true = conectou; false = evadiu (0 de dano).
 * Chance = Acerto ÷ (Acerto + Evasão), limitada entre 5% e 95%.
 */
export function rollHit(acerto: number, evasao: number): boolean {
  if (evasao <= 0) return true;
  if (acerto <= 0) return Math.random() < 0.05;
  const chance = Math.min(0.95, Math.max(0.05, acerto / (acerto + evasao)));
  return Math.random() < chance;
}

/** Chance de crítico (cap 100%). */
export function rollCritical(chanceCritico: number): boolean {
  const chance = Math.min(100, Math.max(0, chanceCritico)) / 100;
  return chance > 0 && Math.random() < chance;
}

/** Chance de bloqueio (cap default 75%). */
export function rollBlock(bloqueio: number, cap = 75): boolean {
  if (bloqueio <= 0) return false;
  const chance = Math.min(cap, Math.max(0, bloqueio)) / 100;
  return Math.random() < chance;
}

/** Multiplica o dano bruto pelo mult. de crítico — aplica antes da armadura. */
function applyCritical(raw: number, multCritico: number): number {
  return Math.max(1, Math.round(raw * multCritico));
}

/**
 * Redução de dano físico pela armadura (fórmula Path of Exile).
 * A fração reduzida é `armadura / (armadura + 10 × dano)` — armadura é forte
 * contra hits pequenos e fraca contra burst (soft-cap natural).
 * Garante pelo menos 1 de dano (um golpe que conecta sempre machuca).
 */
export function applyArmor(damage: number, armor: number): number {
  if (armor <= 0 || damage <= 0) return damage;
  const reduction = armor / (armor + 10 * damage);
  return Math.max(1, Math.round(damage * (1 - reduction)));
}

/**
 * Mitigação física recebida: Armadura (PoE) → Resistência Física % (cap).
 * Res. Física vem só de itens; golpe que conecta causa no mínimo 1.
 */
export function mitigatePhysicalDamage(
  rawDamage: number,
  armor: number,
  resFisico: number,
  resistMax: number,
): number {
  const afterArmor = applyArmor(rawDamage, armor);
  const res = Math.min(Math.max(0, resFisico), resistMax);
  if (res <= 0) return afterArmor;
  return Math.max(1, Math.round(afterArmor * (1 - res / 100)));
}

/**
 * Mitigação elemental: Penetração reduz a Resistência do alvo antes do cálculo.
 * Ex.: 20% pen vs 20% res → res. efetiva 0% → dano integral.
 */
export function applyElementalMitigation(
  damage: number,
  targetRes: number,
  attackerPen: number,
  resistMax: number,
): number {
  if (damage <= 0) return 0;
  const effectiveRes = Math.min(resistMax, Math.max(0, targetRes - attackerPen));
  if (effectiveRes <= 0) return Math.max(1, Math.round(damage));
  return Math.max(1, Math.round(damage * (1 - effectiveRes / 100)));
}

const ELEMENTS: ElementKey[] = ['fogo', 'gelo', 'raio', 'caos', 'sagrado'];

function flatDmgForElement(stats: DerivedStats, element: ElementKey): number {
  switch (element) {
    case 'fogo':
      return stats.danoFogo;
    case 'gelo':
      return stats.danoGelo;
    case 'raio':
      return stats.danoRaio;
    case 'caos':
      return stats.danoCaos;
    case 'sagrado':
      return stats.danoSagrado;
  }
}

function spellPctForElement(stats: DerivedStats, element: ElementKey): number {
  const base = stats.pctDmgMagia;
  switch (element) {
    case 'fogo':
      return base + stats.pctDmgFogoMagia;
    case 'gelo':
      return base + stats.pctDmgGeloMagia;
    case 'raio':
      return base + stats.pctDmgRaioMagia;
    case 'caos':
      return base + stats.pctDmgCaosMagia;
    case 'sagrado':
      return base + stats.pctDmgSagradoMagia;
  }
}

function penForElement(stats: DerivedStats, element: ElementKey): number {
  switch (element) {
    case 'fogo':
      return stats.penFogo;
    case 'gelo':
      return stats.penGelo;
    case 'raio':
      return stats.penRaio;
    case 'caos':
      return stats.penCaos;
    case 'sagrado':
      return stats.penSagrado;
  }
}

function enemyResForElement(enemy: Enemy, element: ElementKey): number {
  switch (element) {
    case 'fogo':
      return enemy.resFogo ?? 0;
    case 'gelo':
      return enemy.resGelo ?? 0;
    case 'raio':
      return enemy.resRaio ?? 0;
    case 'caos':
      return enemy.resCaos ?? 0;
    case 'sagrado':
      return enemy.resSagrado ?? 0;
  }
}

function mitigateElementHit(
  raw: number,
  element: ElementKey,
  stats: DerivedStats,
  enemy: Enemy,
): number {
  if (raw <= 0) return 0;
  return applyElementalMitigation(
    raw,
    enemyResForElement(enemy, element),
    penForElement(stats, element),
    stats.resistMax,
  );
}

function resolveNonSpellElementalDamage(
  stats: DerivedStats,
  enemy: Enemy,
  critical: boolean,
  multCritico: number,
): number {
  let total = 0;
  for (const element of ELEMENTS) {
    const flat = flatDmgForElement(stats, element);
    if (flat <= 0) continue;
    let raw = flat;
    if (critical) raw = applyCritical(raw, multCritico);
    total += mitigateElementHit(raw, element, stats, enemy);
  }
  return total;
}

function resolveSpellDamage(
  stats: DerivedStats,
  enemy: Enemy,
  spell: Spell,
  abilityMult: number,
  critical: boolean,
  multCritico: number,
): number {
  let total = 0;
  for (const hit of spell.hits) {
    let raw = r(hit.min, hit.max);
    const pct = spellPctForElement(stats, hit.element);
    if (pct > 0) raw = Math.floor(raw * (1 + pct / 100));
    if (abilityMult !== 1) raw = Math.floor(raw * abilityMult);
    if (critical) raw = applyCritical(raw, multCritico);
    total += mitigateElementHit(raw, hit.element, stats, enemy);
  }
  return total;
}

/** Roubo proporcional ao dano efetivamente causado (pós-mitigação do alvo). */
export function computeLeech(
  damageDealt: number,
  rouboVida: number,
  rouboMana: number,
): { vida: number; mana: number } {
  if (damageDealt <= 0) return { vida: 0, mana: 0 };
  return {
    vida: rouboVida > 0 ? Math.floor(damageDealt * rouboVida / 100) : 0,
    mana: rouboMana > 0 ? Math.floor(damageDealt * rouboMana / 100) : 0,
  };
}

/** Aplica roubo de vida/mana ao personagem atacante. */
export function applyPlayerLeech(character: Character, damageDealt: number): Character {
  const stats = computeDerivedStats(character);
  const { vida, mana } = computeLeech(damageDealt, stats.rouboVida, stats.rouboMana);
  if (vida === 0 && mana === 0) return character;
  return {
    ...character,
    vidaAtual: Math.min(character.vidaAtual + vida, stats.vidaMax),
    manaAtual: Math.min(character.manaAtual + mana, stats.manaMax),
  };
}

function playerOffensiveHit(
  character: Character,
  stats: DerivedStats,
  enemy: Enemy,
  abilityMult: number,
): { damage: number; critical: boolean; blocked: boolean; spellName?: string } {
  const enemyBlock = enemy.bloqueio ?? 0;
  if (enemyBlock > 0 && rollBlock(enemyBlock)) {
    return { damage: 0, critical: false, blocked: true };
  }

  const critical = rollCritical(stats.chanceCritico);
  const spell = getGrantedSpell(character);

  if (spell) {
    return {
      damage: resolveSpellDamage(stats, enemy, spell, abilityMult, critical, stats.multCritico),
      critical,
      blocked: false,
      spellName: spell.name,
    };
  }

  let raw = r(stats.danoFisicoMin, stats.danoFisicoMax);
  if (abilityMult !== 1) raw = Math.floor(raw * abilityMult);
  if (critical) raw = applyCritical(raw, stats.multCritico);
  const physical = applyArmor(raw, enemy.armadura ?? 0);
  const elemental = resolveNonSpellElementalDamage(stats, enemy, critical, stats.multCritico);
  return { damage: physical + elemental, critical, blocked: false };
}

const missResult = (
  attacker: string,
  defender: string,
  kind: 'attack' | 'ability',
  multiplier: number,
): AttackResult => ({
  attacker,
  defender,
  damage: 0,
  dodged: true,
  critical: false,
  blocked: false,
  kind,
  multiplier,
  leechVida: 0,
  leechMana: 0,
});

/** Ataque básico do jogador no inimigo */
export function playerAttack(character: Character, enemy: Enemy): AttackResult {
  const stats = computeDerivedStats(character);
  if (!rollHit(stats.acerto, enemy.evasao)) {
    return missResult(character.name, enemy.name, 'attack', 1);
  }
  const { damage, critical, blocked, spellName } = playerOffensiveHit(character, stats, enemy, 1);
  return {
    attacker: character.name,
    defender: enemy.name,
    damage,
    dodged: false,
    critical,
    blocked,
    kind: 'attack',
    multiplier: 1,
    leechVida: 0,
    leechMana: 0,
    spellName,
  };
}

/** Custo de mana da habilidade básica (antes de eficiência). */
export const ABILITY_MANA_COST = 1;

/** Habilidade básica — custo reduzido por Eficiência de Mana, dano 1.5× do ataque básico */
export function playerAbility(character: Character, enemy: Enemy): AttackResult | null {
  const stats = computeDerivedStats(character);
  const manaCost = effectiveManaCost(ABILITY_MANA_COST, stats.eficienciaMana);
  if (character.manaAtual < manaCost) return null;
  if (!rollHit(stats.acerto, enemy.evasao)) {
    return missResult(character.name, enemy.name, 'ability', 1.5);
  }
  const { damage, critical, blocked, spellName } = playerOffensiveHit(character, stats, enemy, 1.5);
  return {
    attacker: character.name,
    defender: enemy.name,
    damage,
    dodged: false,
    critical,
    blocked,
    kind: 'ability',
    multiplier: 1.5,
    leechVida: 0,
    leechMana: 0,
    spellName,
  };
}

/** Ataque do inimigo no jogador */
export function enemyAttack(enemy: Enemy, character: Character): AttackResult {
  const stats = computeDerivedStats(character);
  if (!rollHit(getEnemyAcerto(enemy), stats.evasao)) {
    return missResult(enemy.name, character.name, 'attack', 1);
  }
  if (stats.bloqueio > 0 && rollBlock(stats.bloqueio, stats.blockMax)) {
    return {
      attacker: enemy.name,
      defender: character.name,
      damage: 0,
      dodged: false,
      critical: false,
      blocked: true,
      kind: 'attack',
      multiplier: 1,
      leechVida: 0,
      leechMana: 0,
    };
  }
  let raw = r(enemy.danoMin, enemy.danoMax);
  const critical = rollCritical(getEnemyCritChance(enemy));
  if (critical) raw = applyCritical(raw, getEnemyCritMult(enemy));
  const damage = mitigatePhysicalDamage(raw, stats.armadura, stats.resFisico, stats.resistMax);
  const leech = computeLeech(damage, enemy.rouboVida ?? 0, enemy.rouboMana ?? 0);
  return {
    attacker: enemy.name,
    defender: character.name,
    damage,
    dodged: false,
    critical,
    blocked: false,
    kind: 'attack',
    multiplier: 1,
    leechVida: leech.vida,
    leechMana: leech.mana,
  };
}

/**
 * Aplica dano ao jogador consumindo o Escudo de Energia PRIMEIRO (vital que
 * absorve antes da Vida) e só então a Vida. Retorna o personagem atualizado
 * e o quanto foi absorvido/perdido (pra log).
 */
export function applyDamageToPlayer(
  character: Character,
  damage: number,
): { character: Character; absorbed: number; vidaLost: number } {
  const absorbed = Math.min(character.esAtual, damage);
  const vidaLost = damage - absorbed;
  return {
    character: {
      ...character,
      esAtual: character.esAtual - absorbed,
      vidaAtual: Math.max(0, character.vidaAtual - vidaLost),
    },
    absorbed,
    vidaLost,
  };
}

/** Restaura vida, mana e escudo de energia aos máximos derivados — ao encerrar um combate. */
export function restoreVitalsFull(character: Character): Character {
  const d = computeDerivedStats(character);
  return {
    ...character,
    vidaMax: d.vidaMax,
    manaMax: d.manaMax,
    vidaAtual: d.vidaMax,
    manaAtual: d.manaMax,
    esAtual: d.escudoEnergia,
  };
}

/** Tentativa de fuga — retorna true se conseguiu. Chance base 70%. */
export function tryFlee(): boolean {
  return Math.random() < 0.7;
}

/**
 * Aplica recompensas de vitória ao personagem: XP + ouro + loot.
 * Retorna o personagem atualizado + a lista de drops adicionados ao inventário.
 */
export interface VictoryRewards {
  xp: number;
  gold: number;
  loot: Item[];
}

/** Chance de um inimigo dropar um equipamento gerado. Baixa de propósito —
 *  drop de equipamento deve ser evento, não rotina (decisão do usuário). */
export const EQUIP_DROP_CHANCE = 0.12;

export function rollRewards(enemy: Enemy): VictoryRewards {
  const gold = enemy.goldMin === enemy.goldMax ? enemy.goldMin : r(enemy.goldMin, enemy.goldMax);
  const loot: Item[] = [];
  if (enemy.loot) {
    for (const drop of enemy.loot) {
      if (Math.random() < drop.chance) {
        const item = getMaterial(drop.itemId);
        if (item) loot.push(item);
      }
    }
  }
  // Equipamento procedural — ilvl do item = nível do monstro derrotado.
  if (Math.random() < EQUIP_DROP_CHANCE) {
    const equip = generateEquipment(enemy.level);
    if (equip) loot.push(equip);
  }
  return { xp: enemy.xp, gold, loot };
}

/** Resultado de aplicar a vitória — inclui info de level up pra UI mostrar. */
export interface VictoryApplyResult {
  character: Character;
  leveledUp: boolean;
  gainedLevels: number;
  /** Nível final após eventuais level-ups (pode ser igual ao inicial) */
  newLevel: number;
}

/**
 * Aplica vitória — XP + ouro + loot, depois checa level-up. O level-up só
 * libera ponto de talento (sem heal, sem stat bonus). Loot que não cabe no
 * inventário é descartado silenciosamente.
 */
export function applyVictory(character: Character, rewards: VictoryRewards): VictoryApplyResult {
  let inventory = character.inventory;
  for (const item of rewards.loot) {
    const { inventory: next, added } = addItemToInventory(inventory, item);
    if (added) inventory = next;
  }
  const withRewards: Character = {
    ...character,
    xp: character.xp + rewards.xp,
    gold: character.gold + rewards.gold,
    inventory,
  };
  const { character: leveled, leveledUp, gainedLevels } = applyLevelUp(withRewards);
  return {
    character: restoreVitalsFull(leveled),
    leveledUp,
    gainedLevels,
    newLevel: leveled.level,
  };
}

/** Aplica derrota — respawn em Pedragal, vida/mana cheias, perde 10% de ouro */
export function applyDefeat(character: Character): Character {
  const goldLost = Math.floor(character.gold * 0.1);
  return restoreVitalsFull({
    ...character,
    gold: Math.max(0, character.gold - goldLost),
    location: 'pedragal',
  });
}

// ============================================================================
// Combate em tempo real — intervalos entre ações
// ============================================================================

const MIN_ACTION_MS = 400;

/** Intervalo entre ataques básicos do jogador (ms). `velAtaque` é o Tempo de
 *  Ataque em SEGUNDOS (WoW-style) — o intervalo é ele direto. Mago usa o maior
 *  entre o tempo da arma e o cast da magia. */
export function getPlayerAttackIntervalMs(character: Character, stats?: DerivedStats): number {
  const s = stats ?? computeDerivedStats(character);
  const weaponMs = s.velAtaque > 0 ? s.velAtaque * 1000 : 3000;
  const spell = getGrantedSpell(character);
  if (spell) {
    const castMs = effectiveCastTime(spell.castTimeSec, s.reducaoTempoConjuracao) * 1000;
    return Math.max(MIN_ACTION_MS, Math.max(weaponMs, castMs));
  }
  return Math.max(MIN_ACTION_MS, weaponMs);
}

/** Intervalo entre ataques do inimigo (ms) — Tempo de Ataque em segundos. */
export function getEnemyAttackIntervalMs(enemy: Enemy): number {
  return Math.max(MIN_ACTION_MS, getEnemyVelAtaque(enemy) * 1000);
}

/** Intervalo de regen no combate RT — 1 segundo. */
export const COMBAT_REGEN_INTERVAL_MS = 1000;
