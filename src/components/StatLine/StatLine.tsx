import { useState, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ModColor } from '../../types';
import styles from './StatLine.module.css';

interface StatLineProps {
  name: string;
  value: ReactNode;
  color?: ModColor;
  tooltip?: ReactNode;
}

export function StatLine({ name, value, color, tooltip }: StatLineProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

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
      className={`${styles.line} ${tooltip ? styles.hasTooltip : ''}`}
      onMouseEnter={tooltip ? handleEnter : undefined}
      onMouseLeave={tooltip ? handleLeave : undefined}
    >
      <span className={`${styles.name} ${color ? styles[color] : ''}`}>{name}</span>
      <span className={styles.value}>{value}</span>
      {tooltip && pos &&
        createPortal(
          <span
            className={styles.tooltip}
            style={{ left: pos.left, top: pos.top }}
          >
            {tooltip}
          </span>,
          document.body,
        )}
    </div>
  );
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
