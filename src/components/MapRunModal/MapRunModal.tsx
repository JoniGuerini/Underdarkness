import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Character, Item, MapItem } from '../../types';
import {
  applyDefeat,
  applyMapModsToEnemy,
  applyPlayerLeech,
  applyVictoryNoRestore,
  ABILITY_MANA_COST,
  COMBAT_REGEN_INTERVAL_MS,
  enemyAttack,
  getEnemyAttackIntervalMs,
  getPlayerAttackIntervalMs,
  playerAbility,
  playerAttack,
  restoreVitalsFull,
  rollRewards,
  tryFlee,
  type AttackResult,
} from '../../lib/combat';
import { applyRegenTick, computeDerivedStats, effectiveManaCost } from '../../lib/stats';
import {
  baseLootCount,
  buildExpeditionEnemies,
  rollExpeditionMapDrops,
  tierColorVar,
} from '../../lib/mapgen';
import { rollItems } from '../../lib/lootgen';
import { addItemToInventory } from '../../lib/inventory';
import { sumAffixValue } from '../../data/mapAffixes';
import { Modal } from '../Modal/Modal';
import styles from './MapRunModal.module.css';

type RunPhase = 'opening' | 'fighting' | 'intermission' | 'won' | 'lost' | 'fled';

interface LogEntry {
  id: number;
  text: string;
  tone?: 'neutral' | 'player_hit' | 'enemy_hit' | 'miss' | 'system' | 'reward';
}

interface RunRewards {
  gold: number;
  items: Item[];
  maps: MapItem[];
}

interface MapRunModalProps {
  map: MapItem | null;
  character: Character;
  onUpdate: (next: Character) => void;
  onClose: () => void;
}

const TICK_MS = 100;
const LOG_CAP = 100;

/**
 * Expedição do Atlas de Mapas — sequência de lutas 1v1 (ondas + chefe) **sem
 * cura entre elas**. Vida/mana carregam de uma luta pra próxima; só regen,
 * roubo e habilidade sustentam. Vitória final rola loot procedural + mapas e
 * restaura vitais; morte ou fuga consomem o mapa.
 */
export function MapRunModal({ map, character, onUpdate, onClose }: MapRunModalProps) {
  // Fila de inimigos (ondas + chefe no fim), com afixos de dificuldade aplicados.
  // Estável por corrida — o modal é remontado (key) a cada nova expedição.
  const enemies = useMemo(() => {
    if (!map) return [];
    return buildExpeditionEnemies(map).map((e) => applyMapModsToEnemy(e, map.affixes));
  }, [map]);
  const total = enemies.length;

  const [index, setIndex] = useState(0);
  const [enemyHp, setEnemyHp] = useState(enemies[0]?.vidaMax ?? 0);
  const [phase, setPhase] = useState<RunPhase>('opening');
  const [log, setLog] = useState<LogEntry[]>([]);
  const [rewards, setRewards] = useState<RunRewards | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const idRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef(character);
  const enemyHpRef = useRef(enemyHp);
  const phaseRef = useRef(phase);
  const indexRef = useRef(0);
  const nextPlayerAttackRef = useRef(0);
  const nextEnemyAttackRef = useRef(0);
  const nextRegenRef = useRef(0);
  const nextAbilityRef = useRef(0);
  const intermissionTimerRef = useRef<number | null>(null);

  characterRef.current = character;
  enemyHpRef.current = enemyHp;
  phaseRef.current = phase;

  const isBossIndex = useCallback((i: number) => i >= total - 1, [total]);

  const pushLog = useCallback((text: string, tone: LogEntry['tone'] = 'neutral') => {
    setLog((prev) => {
      const next = [...prev, { id: ++idRef.current, text, tone }];
      return next.length > LOG_CAP ? next.slice(-LOG_CAP) : next;
    });
  }, []);

  const advanceWave = useCallback(() => {
    const next = indexRef.current + 1;
    indexRef.current = next;
    setIndex(next);
    const nextEnemy = enemies[next];
    enemyHpRef.current = nextEnemy?.vidaMax ?? 0;
    setEnemyHp(nextEnemy?.vidaMax ?? 0);
    setPhase('intermission');
    phaseRef.current = 'intermission';
    if (intermissionTimerRef.current) window.clearTimeout(intermissionTimerRef.current);
    intermissionTimerRef.current = window.setTimeout(() => {
      const now = Date.now();
      nextPlayerAttackRef.current = now + 500;
      nextEnemyAttackRef.current = now + 900;
      nextRegenRef.current = now + COMBAT_REGEN_INTERVAL_MS;
      setPhase('fighting');
      phaseRef.current = 'fighting';
      if (nextEnemy) {
        const label = isBossIndex(next) ? `O chefe ${nextEnemy.name}` : `Um ${nextEnemy.name}`;
        pushLog(`${label} (Nv ${nextEnemy.level}) avança.`, 'system');
      }
    }, 1100);
  }, [enemies, isBossIndex, pushLog]);

  const finalizeVictory = useCallback(() => {
    if (!map) return;
    const char = characterRef.current;
    const tier = map.tier;
    const lootQty = sumAffixValue(map.affixes, 'loot-quantidade');
    const lootRar = sumAffixValue(map.affixes, 'loot-raridade');
    const count = Math.max(1, Math.round(baseLootCount(tier) * (1 + lootQty / 100)));
    const bonusRarity = Math.round(tier * 1.5 + lootRar * 0.3);
    const items = rollItems(count, { itemLevel: map.monsterLevel, bonusRarity, idPrefix: 'mapa' });
    const mapDrops = rollExpeditionMapDrops(tier);
    const gold = 30 * tier + 10 + Math.floor(Math.random() * 31);

    let inventory = char.inventory;
    const keptItems: Item[] = [];
    for (const it of items) {
      const { inventory: nx, added } = addItemToInventory(inventory, it);
      if (added) {
        inventory = nx;
        keptItems.push(it);
      }
    }

    const maps = [...mapDrops, ...char.maps.filter((m) => m.id !== map.id)];
    const finalChar = restoreVitalsFull({
      ...char,
      gold: char.gold + gold,
      inventory,
      maps,
      highestMapTier: Math.max(char.highestMapTier, tier),
    });
    onUpdate(finalChar);
    characterRef.current = finalChar;

    setRewards({ gold, items: keptItems, maps: mapDrops });
    setPhase('won');
    phaseRef.current = 'won';
    pushLog(`Expedição concluída. +${gold} ouro.`, 'reward');
    if (keptItems.length > 0) {
      pushLog(`Loot: ${keptItems.map((i) => i.name).join(', ')}.`, 'reward');
    }
    if (mapDrops.length > 0) {
      pushLog(`Mapas obtidos: ${mapDrops.map((m) => `${m.themeName} (T${m.tier})`).join(', ')}.`, 'reward');
    }
  }, [map, onUpdate, pushLog]);

  const handleEnemyDefeated = useCallback(
    (i: number) => {
      const foe = enemies[i];
      if (!foe) return;
      const r = rollRewards(foe);
      const res = applyVictoryNoRestore(characterRef.current, r);
      onUpdate(res.character);
      characterRef.current = res.character;
      if (res.leveledUp) {
        pushLog(`✦ Você subiu para o Nv ${res.newLevel}.`, 'reward');
      }
      if (isBossIndex(i)) {
        pushLog(`O chefe ${foe.name} tomba.`, 'reward');
        finalizeVictory();
      } else {
        pushLog(`Onda ${i + 1} de ${total - 1} vencida. +${r.gold} ouro.`, 'reward');
        advanceWave();
      }
    },
    [enemies, isBossIndex, total, onUpdate, pushLog, advanceWave, finalizeVictory],
  );

  const handleDefeat = useCallback(() => {
    if (!map) return;
    const consumed: Character = {
      ...characterRef.current,
      maps: characterRef.current.maps.filter((m) => m.id !== map.id),
    };
    onUpdate(applyDefeat(consumed));
    setPhase('lost');
    phaseRef.current = 'lost';
    pushLog('Você tomba na expedição. O mapa se desfaz; você acorda em Pedragal, restaurado.', 'system');
  }, [map, onUpdate, pushLog]);

  const applyPlayerHit = useCallback(
    (result: AttackResult, charBase: Character, foeIndex: number) => {
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
      if (afterLeech !== charBase) {
        onUpdate(afterLeech);
        characterRef.current = afterLeech;
      }
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
      if (newHp <= 0) handleEnemyDefeated(foeIndex);
    },
    [handleEnemyDefeated, onUpdate, pushLog],
  );

  const applyEnemyHit = useCallback(
    (result: AttackResult, foeName: string) => {
      if (result.dodged) {
        pushLog(`${foeName} ataca, mas você desvia.`, 'miss');
        return;
      }
      if (result.blocked) {
        pushLog(`Você bloqueia o golpe de ${foeName}.`, 'miss');
        return;
      }
      const crit = result.critical ? ' Golpe crítico.' : '';
      pushLog(`${foeName} ataca — você toma ${result.damage} de dano.${crit}`, 'player_hit');
      if (result.leechVida > 0) {
        const foe = enemies[indexRef.current];
        const healed = Math.min(result.leechVida, (foe?.vidaMax ?? 0) - enemyHpRef.current);
        if (healed > 0) {
          const newHp = enemyHpRef.current + healed;
          enemyHpRef.current = newHp;
          setEnemyHp(newHp);
          pushLog(`${foeName} recupera ${healed} de vida (roubo).`, 'system');
        }
      }
      const char = characterRef.current;
      const newHp = Math.max(0, char.vidaAtual - result.damage);
      const afterHit: Character = { ...char, vidaAtual: newHp };
      onUpdate(afterHit);
      characterRef.current = afterHit;
      if (newHp <= 0) handleDefeat();
    },
    [enemies, handleDefeat, onUpdate, pushLog],
  );

  // Inicializa expedição
  useEffect(() => {
    if (!map || enemies.length === 0) return;
    idRef.current = 0;
    indexRef.current = 0;
    setIndex(0);
    const first = enemies[0];
    enemyHpRef.current = first.vidaMax;
    setEnemyHp(first.vidaMax);
    setRewards(null);
    setPhase('opening');
    phaseRef.current = 'opening';
    const now = Date.now();
    nextPlayerAttackRef.current = now + 900;
    nextEnemyAttackRef.current = now + 1400;
    nextRegenRef.current = now + COMBAT_REGEN_INTERVAL_MS;
    nextAbilityRef.current = 0;
    setLog([
      { id: ++idRef.current, text: `Expedição: ${map.themeName} — Tier ${map.tier}.`, tone: 'system' },
      {
        id: ++idRef.current,
        text: `${total - 1} ondas até o chefe. Sem cura entre as lutas — só regen, roubo e habilidade.`,
        tone: 'system',
      },
      { id: ++idRef.current, text: `Um ${first.name} (Nv ${first.level}) surge.`, tone: 'system' },
    ]);
    const t = window.setTimeout(() => {
      setPhase('fighting');
      phaseRef.current = 'fighting';
    }, 700);
    return () => {
      window.clearTimeout(t);
      if (intermissionTimerRef.current) window.clearTimeout(intermissionTimerRef.current);
    };
  }, [map, enemies, total]);

  // Loop de combate
  useEffect(() => {
    if (!map || phase !== 'fighting') return;
    const tick = window.setInterval(() => {
      if (phaseRef.current !== 'fighting') return;
      const now = Date.now();
      setNowMs(now);
      const char = characterRef.current;
      const foe = enemies[indexRef.current];
      if (!foe || enemyHpRef.current <= 0) return;

      if (now >= nextRegenRef.current) {
        nextRegenRef.current = now + COMBAT_REGEN_INTERVAL_MS;
        const regened = applyRegenTick(char);
        if (regened !== char) {
          onUpdate(regened);
          characterRef.current = regened;
        }
      }

      if (now >= nextPlayerAttackRef.current) {
        const stats = computeDerivedStats(char);
        nextPlayerAttackRef.current = now + getPlayerAttackIntervalMs(char, stats);
        const result = playerAttack(char, foe);
        applyPlayerHit(result, char, indexRef.current);
      }

      if (now >= nextEnemyAttackRef.current) {
        nextEnemyAttackRef.current = now + getEnemyAttackIntervalMs(foe);
        const result = enemyAttack(foe, characterRef.current);
        applyEnemyHit(result, foe.name);
      }
    }, TICK_MS);
    return () => window.clearInterval(tick);
  }, [map, phase, enemies, applyPlayerHit, applyEnemyHit, onUpdate]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [log.length]);

  if (!map) return null;

  const currentEnemy = enemies[index];
  const pct = (cur: number, max: number) => Math.max(0, Math.min(100, (cur / max) * 100));
  const playerHpPct = pct(character.vidaAtual, character.vidaMax);
  const playerMpPct = pct(character.manaAtual, character.manaMax);
  const enemyHpPct = currentEnemy ? pct(enemyHp, currentEnemy.vidaMax) : 0;

  const ability = character.abilities[0]?.name ?? 'Habilidade';
  const abilityManaCost = effectiveManaCost(ABILITY_MANA_COST, computeDerivedStats(character).eficienciaMana);
  const canFight = phase === 'fighting';
  const abilityReady = canFight && nowMs >= nextAbilityRef.current && character.manaAtual >= abilityManaCost;
  const runOver = phase === 'won' || phase === 'lost' || phase === 'fled';
  const bossNow = isBossIndex(index);

  const handleAbility = () => {
    if (!canFight || !currentEnemy) return;
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

    const result = playerAbility(afterCost, currentEnemy);
    if (!result) {
      pushLog('Sem mana suficiente.', 'miss');
      return;
    }
    applyPlayerHit(result, afterCost, indexRef.current);
  };

  const handleFlee = () => {
    if (!canFight) return;
    if (tryFlee()) {
      const consumed: Character = {
        ...characterRef.current,
        maps: characterRef.current.maps.filter((m) => m.id !== map.id),
      };
      onUpdate(restoreVitalsFull(consumed));
      characterRef.current = restoreVitalsFull(consumed);
      setPhase('fled');
      phaseRef.current = 'fled';
      pushLog('Você abandona a expedição. O mapa se consome; vida e mana se recompõem.', 'system');
    } else {
      pushLog('Você tenta recuar, mas as criaturas cercam o caminho.', 'miss');
    }
  };

  return (
    <Modal
      open={!!map}
      onClose={onClose}
      large
      header={<RunHeader map={map} canClose={runOver} onClose={onClose} />}
    >
      <div className={styles.root}>
        <div className={styles.progress}>
          {enemies.map((_, i) => (
            <span
              key={i}
              className={`${styles.progressDot} ${i < index ? styles.dotDone : ''} ${
                i === index && !runOver ? styles.dotActive : ''
              } ${isBossIndex(i) ? styles.dotBoss : ''}`}
              title={isBossIndex(i) ? 'Chefe' : `Onda ${i + 1}`}
            />
          ))}
          <span className={styles.progressLabel}>
            {bossNow ? 'Chefe' : `Onda ${Math.min(index + 1, total - 1)} de ${total - 1}`}
          </span>
        </div>

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
            <div className={styles.combatantLabel}>{bossNow ? 'CHEFE' : 'INIMIGO'}</div>
            <div className={styles.combatantName}>{currentEnemy?.name ?? '—'}</div>
            <div className={styles.combatantMeta}>
              {currentEnemy ? `Nv ${currentEnemy.level}` : '—'}
            </div>
            <div className={styles.bars}>
              <BarRow
                label="Vida"
                current={Math.max(0, enemyHp)}
                max={currentEnemy?.vidaMax ?? 1}
                pct={enemyHpPct}
                kind="vida"
              />
            </div>
          </article>
        </div>

        <div className={styles.logCard}>
          <div className={styles.logHeader}>Expedição</div>
          <div className={styles.logBody}>
            {log.map((entry) => (
              <div key={entry.id} className={`${styles.logEntry} ${styles[`tone_${entry.tone ?? 'neutral'}`]}`}>
                {entry.text}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {phase === 'won' && <RunResultCard tier={map.tier} rewards={rewards} onClose={onClose} />}
        {phase === 'lost' && (
          <ResultCard
            title="Expedição perdida"
            tone="loss"
            message="Você tombou. O mapa se desfez; vida e mana restauradas em Pedragal."
            onClose={onClose}
          />
        )}
        {phase === 'fled' && (
          <ResultCard
            title="Expedição abandonada"
            tone="flee"
            message="Você recuou. O mapa foi consumido, mas vida e mana voltaram ao máximo."
            onClose={onClose}
          />
        )}
        {(phase === 'opening' || phase === 'fighting' || phase === 'intermission') && (
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
              Abandonar
            </button>
            {canFight && <span className={styles.rtHint}>Ataque automático · sem cura entre ondas</span>}
          </div>
        )}
      </div>
    </Modal>
  );
}

function RunHeader({ map, canClose, onClose }: { map: MapItem; canClose: boolean; onClose: () => void }) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Expedição</div>
        <div className={styles.subtitle}>
          <span style={{ color: tierColorVar(map.tier) }}>T{map.tier}</span> · {map.themeName} · Nível {map.monsterLevel}
        </div>
      </div>
      {canClose ? (
        <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
          <span>← Voltar</span>
        </button>
      ) : (
        <span className={styles.headerNote}>EM EXPEDIÇÃO</span>
      )}
    </div>
  );
}

function BarRow({
  label,
  current,
  max,
  pct,
  kind,
}: {
  label: string;
  current: number;
  max: number;
  pct: number;
  kind: 'vida' | 'mana';
}) {
  return (
    <div className={styles.barTrack}>
      <div className={`${styles.barFill} ${styles[`fill_${kind}`]}`} style={{ width: `${pct}%` }} />
      <div className={styles.barContent}>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barValues}>
          {current} / {max}
        </span>
      </div>
    </div>
  );
}

function RunResultCard({
  tier,
  rewards,
  onClose,
}: {
  tier: number;
  rewards: RunRewards | null;
  onClose: () => void;
}) {
  return (
    <div className={`${styles.resultCard} ${styles.result_win}`}>
      <h3 className={styles.resultTitle}>Vitória</h3>
      {rewards && (
        <ul className={styles.rewardList}>
          <li className={styles.rewardItem}>
            <span className={styles.rewardLabel}>Ouro</span>
            <span className={styles.rewardValue}>+{rewards.gold}</span>
          </li>
          <li className={styles.rewardItem}>
            <span className={styles.rewardLabel}>Itens</span>
            <span className={styles.rewardValue}>{rewards.items.length}</span>
          </li>
          {rewards.items.length > 0 && (
            <li className={styles.lootLine}>
              {rewards.items.map((it, i) => (
                <span key={i} className={styles.lootItem} style={{ color: `var(--rarity-${it.rarity})` }}>
                  {it.name}
                </span>
              ))}
            </li>
          )}
          <li className={styles.rewardItem}>
            <span className={styles.rewardLabel}>Mapas</span>
            <span className={styles.rewardValue}>
              {rewards.maps.length > 0
                ? rewards.maps.map((m) => `T${m.tier}`).join(', ')
                : 'nenhum'}
            </span>
          </li>
        </ul>
      )}
      <p className={styles.resultMessage} style={{ color: tierColorVar(tier) }}>
        Tier {tier} concluído. O mapa foi consumido; vida e mana restauradas.
      </p>
      <button type="button" className={`btn-primary ${styles.btnContinue}`} onClick={onClose}>
        Continuar
      </button>
    </div>
  );
}

function ResultCard({
  title,
  tone,
  message,
  onClose,
}: {
  title: string;
  tone: 'loss' | 'flee';
  message: string;
  onClose: () => void;
}) {
  return (
    <div className={`${styles.resultCard} ${styles[`result_${tone}`]}`}>
      <h3 className={styles.resultTitle}>{title}</h3>
      <p className={styles.resultMessage}>{message}</p>
      <button type="button" className={`btn-primary ${styles.btnContinue}`} onClick={onClose}>
        Continuar
      </button>
    </div>
  );
}
