import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Character, Talent, TalentEffect, TalentTree } from '../../types';
import {
  availableTalentPoints,
  getTalentTrees,
  isTalentUnlocked,
  pointsSpentInTree,
} from '../../data/talents';
import styles from './TalentsView.module.css';

interface TalentsViewProps {
  character: Character;
  onUpdate: (patch: { talentRanks: Record<string, number> }) => void;
}

// ============================================================================
// Formatação de efeitos por rank
// ============================================================================
function formatEffect(effect: TalentEffect, rank: number): string {
  const value = effect.perRank * rank;
  const sign = effect.signed !== false && value >= 0 ? '+' : '';
  const unit = effect.unit ?? '';
  return `${sign}${value}${unit} ${effect.label}`;
}

export function TalentsView({ character, onUpdate }: TalentsViewProps) {
  const trees = getTalentTrees(character.classKey);
  const [activeTreeId, setActiveTreeId] = useState<string>(trees[0].id);
  const activeTree = trees.find((t) => t.id === activeTreeId) ?? trees[0];

  const ranks = character.talentRanks ?? {};
  const available = availableTalentPoints(character.level, ranks);

  const addRank = (talent: Talent) => {
    if (available <= 0) return;
    if (!isTalentUnlocked(talent, ranks)) return;
    const current = ranks[talent.id] ?? 0;
    if (current >= talent.maxRank) return;
    onUpdate({ talentRanks: { ...ranks, [talent.id]: current + 1 } });
  };

  return (
    <div className={styles.card}>
      {/* Tabs das árvores */}
      <div className={styles.tabs}>
        {trees.map((tree) => {
          const spent = pointsSpentInTree(tree, ranks);
          return (
            <button
              key={tree.id}
              className={`${styles.tab} ${tree.id === activeTreeId ? styles.tabActive : ''}`}
              onClick={() => setActiveTreeId(tree.id)}
            >
              <span className={styles.tabName}>{tree.name}</span>
              <span className={styles.tabPoints}>{spent}</span>
            </button>
          );
        })}
        <div className={styles.spacer} />
        <div className={styles.available}>
          <span className={styles.availableLabel}>Pontos disponíveis</span>
          <span className={styles.availableValue}>{available}</span>
        </div>
      </div>

      {/* Cabeçalho da árvore ativa */}
      <div className={styles.treeHeader}>
        <h3 className={styles.treeName}>{activeTree.name}</h3>
        <p className={styles.treeDesc}>{activeTree.description}</p>
      </div>

      {/* Grid de talents */}
      <TalentGrid
        tree={activeTree}
        ranks={ranks}
        available={available}
        onAddRank={addRank}
      />
    </div>
  );
}

// ============================================================================
// TalentGrid — renderiza o grid posicionado da árvore ativa
// ============================================================================
interface TalentGridProps {
  tree: TalentTree;
  ranks: Record<string, number>;
  available: number;
  onAddRank: (talent: Talent) => void;
}

// Constantes geométricas — TS e CSS precisam concordar.
// Mudar aqui propaga pro grid e pro SVG.
const NODE_SIZE = 100;
const COL_GAP = 80;
const ROW_GAP = 56;
const HALF = NODE_SIZE / 2;

/**
 * Calcula o ponto onde uma linha (saindo do centro `c` em direção a `target`)
 * intersecta a borda de um node quadrado de lado NODE_SIZE.
 * Resultado: ponto exatamente na borda do retângulo, lado mais próximo ao target.
 */
function edgePoint(
  c: { x: number; y: number },
  target: { x: number; y: number },
): { x: number; y: number } {
  const dx = target.x - c.x;
  const dy = target.y - c.y;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  // Escolhe a face do retângulo que a linha intersecta primeiro
  const scale = ax === 0
    ? HALF / ay
    : ay === 0
      ? HALF / ax
      : Math.min(HALF / ax, HALF / ay);
  return { x: c.x + dx * scale, y: c.y + dy * scale };
}

function TalentGrid({ tree, ranks, available, onAddRank }: TalentGridProps) {
  const totalWidth = tree.cols * NODE_SIZE + (tree.cols - 1) * COL_GAP;
  const totalHeight = tree.rows * NODE_SIZE + (tree.rows - 1) * ROW_GAP;

  // Centro absoluto de um node em pixels (0,0 = top-left do wrapper)
  const center = (talent: Talent) => ({
    x: talent.col * (NODE_SIZE + COL_GAP) + NODE_SIZE / 2,
    y: talent.row * (NODE_SIZE + ROW_GAP) + NODE_SIZE / 2,
  });

  // Conexões prereq → dependente. Pontos das linhas ficam nas bordas dos nodes
  // pra não passarem por dentro das caixas.
  const connections = tree.talents.flatMap((talent) =>
    (talent.prerequisites ?? [])
      .map((prereqId) => {
        const prereq = tree.talents.find((tt) => tt.id === prereqId);
        if (!prereq) return null;
        const fromCenter = center(prereq);
        const toCenter = center(talent);
        return {
          id: `${prereqId}->${talent.id}`,
          from: edgePoint(fromCenter, toCenter),
          to: edgePoint(toCenter, fromCenter),
          met: (ranks[prereqId] ?? 0) > 0,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null),
  );

  return (
    <div
      className={styles.gridWrapper}
      style={{ width: totalWidth, height: totalHeight }}
    >
      {/* Camada 1: linhas SVG (entre os nodes) */}
      <svg
        className={styles.connectors}
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      >
        {connections.map((c) => (
          <line
            key={c.id}
            x1={c.from.x}
            y1={c.from.y}
            x2={c.to.x}
            y2={c.to.y}
            className={`${styles.connector} ${c.met ? styles.connectorMet : ''}`}
          />
        ))}
      </svg>

      {/* Camada 2: nodes posicionados via gridRow/gridColumn inline */}
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${tree.cols}, ${NODE_SIZE}px)`,
          gridTemplateRows: `repeat(${tree.rows}, ${NODE_SIZE}px)`,
          columnGap: `${COL_GAP}px`,
          rowGap: `${ROW_GAP}px`,
        }}
      >
        {tree.talents.map((talent) => (
          <TalentNode
            key={talent.id}
            tree={tree}
            talent={talent}
            rank={ranks[talent.id] ?? 0}
            ranks={ranks}
            unlocked={isTalentUnlocked(talent, ranks)}
            available={available}
            onClick={() => onAddRank(talent)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TalentNode — quadrado individual com nome + rank + tooltip
// ============================================================================
interface TalentNodeProps {
  tree: TalentTree;
  talent: Talent;
  rank: number;
  ranks: Record<string, number>;
  unlocked: boolean;
  available: number;
  onClick: () => void;
}

function TalentNode({
  tree,
  talent,
  rank,
  ranks,
  unlocked,
  available,
  onClick,
}: TalentNodeProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);

  const maxed = rank >= talent.maxRank;
  const active = rank > 0;
  const canSpend = unlocked && !maxed && available > 0;

  const handleEnter = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTooltipPos({ left: r.right + 8, top: r.top });
  }, []);
  const handleLeave = useCallback(() => setTooltipPos(null), []);

  // Click só dispara se canSpend; gatear aqui em vez de via `disabled` —
  // botão disabled não dispara hover events em alguns browsers (Safari).
  const handleClick = useCallback(() => {
    if (!canSpend) return;
    onClick();
  }, [canSpend, onClick]);

  const classes = [
    styles.node,
    !unlocked ? styles.locked : '',
    active && !maxed ? styles.active : '',
    maxed ? styles.maxed : '',
    !canSpend ? styles.unspendable : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={classes}
        style={{
          gridRow: talent.row + 1,
          gridColumn: talent.col + 1,
        }}
        aria-disabled={!canSpend}
        onClick={handleClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <span className={styles.nodeName}>{talent.name}</span>
        <span className={styles.nodeRank}>
          {rank} / {talent.maxRank}
        </span>
      </button>

      {tooltipPos && (
        <TalentTooltip
          tree={tree}
          talent={talent}
          rank={rank}
          ranks={ranks}
          unlocked={unlocked}
          position={tooltipPos}
        />
      )}
    </>
  );
}

// ============================================================================
// TalentTooltip — em portal, posição fixed.
// Mostra: nome, descrição, rank atual com efeito, próximo rank (preview),
// pré-requisitos (se bloqueado), status.
// ============================================================================
interface TalentTooltipProps {
  tree: TalentTree;
  talent: Talent;
  rank: number;
  ranks: Record<string, number>;
  unlocked: boolean;
  position: { left: number; top: number };
}

function TalentTooltip({
  tree,
  talent,
  rank,
  ranks,
  unlocked,
  position,
}: TalentTooltipProps) {
  const maxed = rank >= talent.maxRank;
  const hasNext = !maxed;

  // Efeito numérico (se talent tem effect estruturado)
  const currentEffect = talent.effect && rank > 0 ? formatEffect(talent.effect, rank) : null;
  const nextEffect = talent.effect && hasNext ? formatEffect(talent.effect, rank + 1) : null;

  // Pré-requisitos não cumpridos
  const missingPrereqs = talent.prerequisites
    ?.filter((id) => (ranks[id] ?? 0) === 0)
    .map((id) => tree.talents.find((t) => t.id === id))
    .filter((t): t is Talent => Boolean(t));

  const colorClass = talent.effect?.color ? styles[talent.effect.color] : '';

  return createPortal(
    <div className={styles.tooltip} style={{ left: position.left, top: position.top }}>
      <div className={styles.tooltipHeader}>
        <div className={styles.tooltipName}>{talent.name}</div>
        <div className={styles.tooltipRank}>
          {rank} / {talent.maxRank}
        </div>
      </div>

      <div className={styles.tooltipDesc}>{talent.description}</div>

      {/* Rank atual — só aparece se já tem rank > 0 */}
      {currentEffect && (
        <div className={styles.tooltipBlock}>
          <div className={styles.tooltipBlockLabel}>Rank Atual</div>
          <div className={`${styles.tooltipEffect} ${colorClass}`}>{currentEffect}</div>
        </div>
      )}

      {/* Próximo rank — preview do que ganha investindo +1 */}
      {nextEffect && (
        <div className={styles.tooltipBlock}>
          <div className={styles.tooltipBlockLabel}>
            {rank === 0 ? 'Primeiro Rank' : 'Próximo Rank'}
          </div>
          <div className={`${styles.tooltipEffect} ${colorClass}`}>{nextEffect}</div>
        </div>
      )}

      {/* Pré-requisitos faltantes — só se bloqueado */}
      {!unlocked && missingPrereqs && missingPrereqs.length > 0 && (
        <div className={styles.tooltipBlock}>
          <div className={styles.tooltipBlockLabel}>Requer</div>
          <div className={styles.tooltipPrereqs}>
            {missingPrereqs.map((p) => p.name).join(' · ')}
          </div>
        </div>
      )}

      {/* Status final */}
      <div className={styles.tooltipMeta}>
        {maxed
          ? 'Maximizado'
          : !unlocked
            ? 'Bloqueado'
            : rank === 0
              ? 'Não investido'
              : `Investido ${rank} de ${talent.maxRank}`}
      </div>
    </div>,
    document.body,
  );
}

// ============================================================================
// Header pro modal — espelha o pattern de CharacterSheetHeader
// ============================================================================
interface TalentsHeaderProps {
  character: Character;
  onClose: () => void;
  shortcut?: string;
}

export function TalentsHeader({ character, onClose, shortcut = 'T' }: TalentsHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.title}>Talentos</div>
        <div className={styles.subtitle}>
          {character.name} · {character.classLabel} · Nv {character.level}
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
