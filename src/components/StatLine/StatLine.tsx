import { useState, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ModColor } from '../../types';
import type { StatSource } from '../../lib/stats';
import styles from './StatLine.module.css';

interface StatLineProps {
  name: string;
  value: ReactNode;
  color?: ModColor;
  tooltip?: ReactNode;
  /** Lista de fontes que contribuem pro valor — exibida no rodapé do tooltip.
   *  Cada source vira uma linha "label … +N". O total é exibido se ≠ value mostrado. */
  breakdown?: StatSource[];
}

export function StatLine({ name, value, color, tooltip, breakdown }: StatLineProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const hasTooltip = !!tooltip || (breakdown && breakdown.length > 0);

  const handleEnter = useCallback(() => {
    if (lineRef.current) {
      const rect = lineRef.current.getBoundingClientRect();
      setPos({ left: rect.left, top: rect.top });
    }
  }, []);

  const handleLeave = useCallback(() => {
    setPos(null);
  }, []);

  return (
    <div
      ref={lineRef}
      className={`${styles.line} ${hasTooltip ? styles.hasTooltip : ''}`}
      onMouseEnter={hasTooltip ? handleEnter : undefined}
      onMouseLeave={hasTooltip ? handleLeave : undefined}
    >
      <span className={`${styles.name} ${color ? styles[color] : ''}`}>{name}</span>
      <span className={styles.value}>{value}</span>
      {hasTooltip && pos &&
        createPortal(
          <span
            className={styles.tooltip}
            style={{ left: pos.left, top: pos.top }}
          >
            {tooltip}
            {breakdown && breakdown.length > 0 && <StatBreakdownBlock sources={breakdown} />}
          </span>,
          document.body,
        )}
    </div>
  );
}

/** Bloco de breakdown — lista de fontes ordenadas com total final. Suporta
 *  fontes com `max` pra renderizar ranges (ex: "+1 a 2"). */
function StatBreakdownBlock({ sources }: { sources: StatSource[] }) {
  const anyRange = sources.some((s) => s.max !== undefined && s.max !== s.value);
  const totalMin = sources.reduce((s, x) => s + x.value, 0);
  const totalMax = sources.reduce((s, x) => s + (x.max ?? x.value), 0);
  // Aplica a "tone" como className tipo `tone_item-comum` etc (mapeamento direto CSS)
  const toneClass = (t?: string) => (t ? styles[`tone_${t.replace(/-/g, '_')}`] : '');
  return (
    <span className={styles.breakdown}>
      {sources.map((src, i) => (
        <span key={i} className={`${styles.breakdownRow} ${toneClass(src.tone)}`}>
          <span className={styles.breakdownLabel}>{src.label}</span>
          <span className={styles.breakdownValue}>{formatSourceValue(src.value, src.max)}</span>
        </span>
      ))}
      <span className={styles.breakdownTotal}>
        <span className={styles.breakdownLabel}>Total</span>
        <span className={styles.breakdownValue}>
          {anyRange ? formatSourceValue(totalMin, totalMax) : formatSourceValue(totalMin)}
        </span>
      </span>
    </span>
  );
}

function formatSourceValue(min: number, max?: number): string {
  const fmt = (v: number) => {
    const r = Math.round(v * 100) / 100;
    return Number.isInteger(r) ? r.toString() : r.toFixed(2);
  };
  if (max !== undefined && max !== min) {
    return `+${fmt(min)} a ${fmt(max)}`;
  }
  return (min >= 0 ? '+' : '') + fmt(min);
}

interface UnitProps {
  children: ReactNode;
}

export function Unit({ children }: UnitProps) {
  return <span className={styles.unit}>{children}</span>;
}

/**
 * Trecho colorido pra usar dentro de tooltips (e qualquer outro texto).
 * Aplica a cor da categoria do mod no texto.
 */
interface ModProps {
  color: ModColor;
  children: ReactNode;
}

export function Mod({ color, children }: ModProps) {
  return <span className={styles[color]}>{children}</span>;
}

/**
 * Linha de "meta" dentro do tooltip — separada do texto principal por
 * uma divisória sutil. Usar pra limites, condições, regras secundárias.
 */
interface TooltipMetaProps {
  children: ReactNode;
}

export function TooltipMeta({ children }: TooltipMetaProps) {
  return <span className={styles.tooltipMeta}>{children}</span>;
}

/**
 * Bloco de texto dentro do tooltip — cada TooltipLine é um pensamento
 * distinto, separado por espaçamento vertical. Usar quando o tooltip
 * tem mais de uma frase (descrição + mitigação, por exemplo).
 */
interface TooltipLineProps {
  children: ReactNode;
}

export function TooltipLine({ children }: TooltipLineProps) {
  return <span className={styles.tooltipLine}>{children}</span>;
}
