import { useCallback, useEffect, useRef, useState } from 'react';
import type { Character } from '../../types';
import type { Enemy } from '../../data/enemies';
import {
  applyDefeat,
  applyVictory,
  applyPlayerLeech,
  ABILITY_MANA_COST,
  COMBAT_REGEN_INTERVAL_MS,
  enemyAttack,
  getEnemyAttackIntervalMs,
  getPlayerAttackIntervalMs,
  playerAbility,
  playerAttack,
  rollRewards,
  restoreVitalsFull,
  tryFlee,
  type AttackResult,
  type VictoryRewards,
} from '../../lib/combat';
import { applyRegenTick, computeDerivedStats, effectiveManaCost } from '../../lib/stats';
import { Modal } from '../Modal/Modal';
import styles from './CombatModal.module.css';

type CombatPhase = 'opening' | 'fighting' | 'won' | 'lost' | 'fled';

interface LogEntry {
  id: number;
  text: string;
  tone?: 'neutral' | 'player_hit' | 'enemy_hit' | 'miss' | 'system' | 'reward';
}

interface CombatModalProps {
  enemy: Enemy | null;
  character: Character;
  onUpdate: (next: Character) => void;
  onClose: () => void;
}

const TICK_MS = 100;
const LOG_CAP = 80;

/**
 * Modal de combate em tempo real. Ataques básicos disparam automaticamente
 * conforme Vel. de Ataque / tempo de conjuração; inimigo ataca no próprio ritmo.
 * Regen aplica a cada segundo.
 */
export function CombatModal({ enemy, character, onUpdate, onClose }: CombatModalProps) {
  const [enemyHp, setEnemyHp] = useState(enemy?.vidaMax ?? 0);
  const [phase, setPhase] = useState<CombatPhase>('opening');
  const [log, setLog] = useState<LogEntry[]>([]);
  const [rewards, setRewards] = useState<VictoryRewards | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const idRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef(character);
  const enemyHpRef = useRef(enemyHp);
  const phaseRef = useRef(phase);
  const nextPlayerAttackRef = useRef(0);
  const nextEnemyAttackRef = useRef(0);
  const nextRegenRef = useRef(0);
  const nextAbilityRef = useRef(0);

  characterRef.current = character;
  enemyHpRef.current = enemyHp;
  phaseRef.current = phase;

  const pushLog = useCallback((text: string, tone: LogEntry['tone'] = 'neutral') => {
    setLog((prev) => {
      const next = [...prev, { id: ++idRef.current, text, tone }];
      return next.length > LOG_CAP ? next.slice(-LOG_CAP) : next;
    });
  }, []);

  const handleVictory = useCallback((foe: Enemy) => {
    const char = characterRef.current;
    const r = rollRewards(foe);
    setRewards(r);
    const result = applyVictory(char, r);
    onUpdate(result.character);
    setPhase('won');
    phaseRef.current = 'won';
    pushLog(`O ${foe.name} cai. +${r.xp} XP, +${r.gold} ouro.`, 'reward');
    if (r.loot.length > 0) {
      pushLog(`Loot: ${r.loot.map((i) => i.name).join(', ')}.`, 'reward');
    }
    if (result.leveledUp) {
      const niveis = result.gainedLevels === 1 ? 'nível' : 'níveis';
      const pontos = result.gainedLevels === 1 ? 'ponto de talento' : 'pontos de talento';
      pushLog(
        `✦ Você subiu ${result.gainedLevels} ${niveis} — agora é Nv ${result.newLevel}. +${result.gainedLevels} ${pontos}.`,
        'reward',
      );
    }
  }, [onUpdate, pushLog]);

  const handleDefeat = useCallback(() => {
    onUpdate(applyDefeat(characterRef.current));
    setPhase('lost');
    phaseRef.current = 'lost';
    pushLog('Você desmaia. Acorda em Pedragal com vida e mana restauradas. Perdeu parte do ouro.', 'system');
  }, [onUpdate, pushLog]);

  const applyPlayerHit = useCallback((result: AttackResult, charBase: Character, foe: Enemy) => {
    if (result.dodged) {
      pushLog(`${result.attacker} ataca, mas o ${result.defender} desvia.`, 'miss');
      return;
    }
    if (result.blocked) {
      pushLog(`O ${result.defender} bloqueia seu golpe.`, 'miss');
      return;
    }
    const hpBefore = enemyHpRef.current;
    const dealt = Math.min(result.damage, hpBefore);
    const afterLeech = applyPlayerLeech(charBase, dealt);
    if (afterLeech !== charBase) onUpdate(afterLeech);
    const vidaGain = afterLeech.vidaAtual - charBase.vidaAtual;
    const manaGain = afterLeech.manaAtual - charBase.manaAtual;
    const verb = result.spellName
      ? `conjura ${result.spellName} em`
      : result.kind === 'ability'
        ? 'golpeia com fúria'
        : 'ataca';
    const crit = result.critical ? ' Golpe crítico.' : '';
    pushLog(`${result.attacker} ${verb} ${result.defender} — ${result.damage} de dano.${crit}`, 'enemy_hit');
    if (vidaGain > 0 || manaGain > 0) {
      const parts: string[] = [];
      if (vidaGain > 0) parts.push(`+${vidaGain} vida`);
      if (manaGain > 0) parts.push(`+${manaGain} mana`);
      pushLog(`Roubo: ${parts.join(', ')}.`, 'system');
    }
    const newHp = hpBefore - result.damage;
    enemyHpRef.current = newHp;
    setEnemyHp(newHp);
    if (newHp <= 0) {
      handleVictory(foe);
    }
  }, [handleVictory, onUpdate, pushLog]);

  const applyEnemyHit = useCallback((result: AttackResult, foe: Enemy) => {
    if (result.dodged) {
      pushLog(`${foe.name} ataca, mas você desvia.`, 'miss');
      return;
    }
    if (result.blocked) {
      pushLog(`Você bloqueia o golpe de ${foe.name}.`, 'miss');
      return;
    }
    const crit = result.critical ? ' Golpe crítico.' : '';
    pushLog(`${foe.name} ataca — você toma ${result.damage} de dano.${crit}`, 'player_hit');
    if (result.leechVida > 0) {
      const healed = Math.min(result.leechVida, foe.vidaMax - enemyHpRef.current);
      if (healed > 0) {
        const newHp = enemyHpRef.current + healed;
        enemyHpRef.current = newHp;
        setEnemyHp(newHp);
        pushLog(`${foe.name} recupera ${healed} de vida (roubo).`, 'system');
      }
    }
    const char = characterRef.current;
    const newHp = Math.max(0, char.vidaAtual - result.damage);
    const afterHit: Character = { ...char, vidaAtual: newHp };
    if (newHp <= 0) {
      onUpdate(afterHit);
      handleDefeat();
    } else {
      onUpdate(afterHit);
    }
  }, [handleDefeat, onUpdate, pushLog]);

  // Inicializa encontro
  useEffect(() => {
    if (!enemy) return;
    idRef.current = 0;
    const now = Date.now();
    enemyHpRef.current = enemy.vidaMax;
    setEnemyHp(enemy.vidaMax);
    setPhase('opening');
    phaseRef.current = 'opening';
    setRewards(null);
    nextPlayerAttackRef.current = now + 900;
    nextEnemyAttackRef.current = now + 1400;
    nextRegenRef.current = now + COMBAT_REGEN_INTERVAL_MS;
    nextAbilityRef.current = 0;
    setLog([
      { id: ++idRef.current, text: enemy.description, tone: 'system' },
      { id: ++idRef.current, text: `Um ${enemy.name} (Nv ${enemy.level}) bloqueia seu caminho.`, tone: 'system' },
      { id: ++idRef.current, text: 'Combate em tempo real — ataques automáticos.', tone: 'system' },
    ]);
    const t = window.setTimeout(() => {
      setPhase('fighting');
      phaseRef.current = 'fighting';
    }, 600);
    return () => window.clearTimeout(t);
  }, [enemy?.id, enemy?.level, enemy?.vidaMax]);

  // Loop de combate
  useEffect(() => {
    if (!enemy || phase !== 'fighting') return;

    const tick = window.setInterval(() => {
      if (phaseRef.current !== 'fighting') return;
      const now = Date.now();
      setNowMs(now);
      const char = characterRef.current;
      const hp = enemyHpRef.current;
      if (hp <= 0) return;

      if (now >= nextRegenRef.current) {
        nextRegenRef.current = now + COMBAT_REGEN_INTERVAL_MS;
        const regened = applyRegenTick(char);
        if (regened !== char) onUpdate(regened);
      }

      if (now >= nextPlayerAttackRef.current) {
        const stats = computeDerivedStats(char);
        nextPlayerAttackRef.current = now + getPlayerAttackIntervalMs(char, stats);
        const result = playerAttack(char, enemy);
        applyPlayerHit(result, char, enemy);
      }

      if (now >= nextEnemyAttackRef.current) {
        nextEnemyAttackRef.current = now + getEnemyAttackIntervalMs(enemy);
        const result = enemyAttack(enemy, characterRef.current);
        applyEnemyHit(result, enemy);
      }
    }, TICK_MS);

    return () => window.clearInterval(tick);
  }, [enemy, phase, applyEnemyHit, applyPlayerHit, onUpdate]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [log.length]);

  if (!enemy) return null;

  const pct = (cur: number, max: number) => Math.max(0, Math.min(100, (cur / max) * 100));
  const playerHpPct = pct(character.vidaAtual, character.vidaMax);
  const playerMpPct = pct(character.manaAtual, character.manaMax);
  const enemyHpPct = pct(enemyHp, enemy.vidaMax);

  const ability = character.abilities[0]?.name ?? 'Habilidade';
  const abilityManaCost = effectiveManaCost(ABILITY_MANA_COST, computeDerivedStats(character).eficienciaMana);
  const canFight = phase === 'fighting';
  const abilityReady = canFight && nowMs >= nextAbilityRef.current && character.manaAtual >= abilityManaCost;

  const handleAbility = () => {
    if (!canFight) return;
    const char = characterRef.current;
    const stats = computeDerivedStats(char);
    const manaCost = effectiveManaCost(ABILITY_MANA_COST, stats.eficienciaMana);
    if (char.manaAtual < manaCost) {
      pushLog('Sem mana suficiente.', 'miss');
      return;
    }
    if (Date.now() < nextAbilityRef.current) return;

    const afterCost = { ...char, manaAtual: char.manaAtual - manaCost };
    onUpdate(afterCost);
    characterRef.current = afterCost;

    const interval = getPlayerAttackIntervalMs(afterCost, stats);
    nextAbilityRef.current = Date.now() + interval;
    nextPlayerAttackRef.current = Date.now() + interval;

    const result = playerAbility(afterCost, enemy);
    if (!result) {
      pushLog('Sem mana suficiente.', 'miss');
      return;
    }
    applyPlayerHit(result, afterCost, enemy);
  };

  const handleFlee = () => {
    if (!canFight) return;
    if (tryFlee()) {
      onUpdate(restoreVitalsFull(characterRef.current));
      pushLog('Você foge para a mata. Vida e mana se recompõem ao sair do combate.', 'system');
      setPhase('fled');
      phaseRef.current = 'fled';
    } else {
      pushLog('Você tenta fugir, mas o inimigo bloqueia o caminho.', 'miss');
    }
  };

  return (
    <Modal
      open={!!enemy}
      onClose={onClose}
      large
      header={<CombatHeader enemy={enemy} onClose={onClose} canClose={phase === 'won' || phase === 'lost' || phase === 'fled'} />}
    >
      <div className={styles.root}>
        <div className={styles.combatants}>
          <article className={styles.combatant}>
            <div className={styles.combatantLabel}>JOGADOR</div>
            <div className={styles.combatantName}>{character.name}</div>
            <div className={styles.combatantMeta}>
              {character.classLabel} · Nv {character.level}
            </div>
            <div className={styles.bars}>
              <BarRow label="Vida" current={character.vidaAtual} max={character.vidaMax} pct={playerHpPct} kind="vida" />
              <BarRow label="Mana" current={character.manaAtual} max={character.manaMax} pct={playerMpPct} kind="mana" />
            </div>
          </article>

          <div className={styles.versus}>VS</div>

          <article className={styles.combatant}>
            <div className={styles.combatantLabel}>INIMIGO</div>
            <div className={styles.combatantName}>{enemy.name}</div>
            <div className={styles.combatantMeta}>
              Bestiário · Nv {enemy.level}
            </div>
            <div className={styles.bars}>
              <BarRow label="Vida" current={Math.max(0, enemyHp)} max={enemy.vidaMax} pct={enemyHpPct} kind="vida" />
            </div>
          </article>
        </div>

        <div className={styles.logCard}>
          <div className={styles.logHeader}>Combate</div>
          <div className={styles.logBody}>
            {log.map((entry) => (
              <div key={entry.id} className={`${styles.logEntry} ${styles[`tone_${entry.tone ?? 'neutral'}`]}`}>
                {entry.text}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {phase === 'won' && (
          <ResultCard title="Vitória" tone="win" rewards={rewards} onClose={onClose} />
        )}
        {phase === 'lost' && (
          <ResultCard
            title="Derrota"
            tone="loss"
            message="Você acorda em Pedragal. Vida e mana restauradas; parte do seu ouro se foi com a queda."
            onClose={onClose}
          />
        )}
        {phase === 'fled' && (
          <ResultCard
            title="Você fugiu"
            tone="flee"
            message="Você escapa. Vida e mana voltam ao máximo ao deixar o combate."
            onClose={onClose}
          />
        )}
        {(phase === 'opening' || phase === 'fighting') && (
          <div className={styles.actionsCard}>
            <button
              type="button"
              className={`btn-secondary ${styles.btnAction}`}
              onClick={handleAbility}
              disabled={!abilityReady}
              title={`Custa ${abilityManaCost} de mana — dano 1.5×`}
            >
              {ability} <span className={styles.btnAbilityCost}>{abilityManaCost} MP</span>
            </button>
            <button
              type="button"
              className={`btn-secondary danger ${styles.btnAction}`}
              onClick={handleFlee}
              disabled={!canFight}
            >
              Fugir
            </button>
            {canFight && (
              <span className={styles.rtHint}>Ataque básico automático</span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function CombatHeader({ enemy, onClose, canClose }: { enemy: Enemy; onClose: () => void; canClose: boolean }) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Combate</div>
        <div className={styles.subtitle}>{enemy.name} · Nv {enemy.level}</div>
      </div>
      {canClose ? (
        <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
          <span>← Voltar</span>
        </button>
      ) : (
        <span className={styles.headerNote}>EM COMBATE</span>
      )}
    </div>
  );
}

function BarRow({ label, current, max, pct, kind }: { label: string; current: number; max: number; pct: number; kind: 'vida' | 'mana' }) {
  return (
    <div className={styles.barTrack}>
      <div className={`${styles.barFill} ${styles[`fill_${kind}`]}`} style={{ width: `${pct}%` }} />
      <div className={styles.barContent}>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barValues}>{current} / {max}</span>
      </div>
    </div>
  );
}

function ResultCard({ title, tone, rewards, message, onClose }: {
  title: string;
  tone: 'win' | 'loss' | 'flee';
  rewards?: VictoryRewards | null;
  message?: string;
  onClose: () => void;
}) {
  return (
    <div className={`${styles.resultCard} ${styles[`result_${tone}`]}`}>
      <h3 className={styles.resultTitle}>{title}</h3>
      {rewards && (
        <ul className={styles.rewardList}>
          <li className={styles.rewardItem}>
            <span className={styles.rewardLabel}>Experiência</span>
            <span className={styles.rewardValue}>+{rewards.xp}</span>
          </li>
          <li className={styles.rewardItem}>
            <span className={styles.rewardLabel}>Ouro</span>
            <span className={styles.rewardValue}>+{rewards.gold}</span>
          </li>
          {rewards.loot.length > 0 && (
            <li className={styles.rewardItem}>
              <span className={styles.rewardLabel}>Loot</span>
              <span className={styles.rewardValue}>{rewards.loot.map((i) => i.name).join(', ')}</span>
            </li>
          )}
        </ul>
      )}
      {message && <p className={styles.resultMessage}>{message}</p>}
      <button type="button" className={`btn-primary ${styles.btnContinue}`} onClick={onClose}>
        Continuar
      </button>
    </div>
  );
}
