import type { ItemStat, ItemStatSegment } from '../types';

/**
 * Deriva segmentos coloridos pra uma linha de stat de item.
 *
 * Regra visual (mesma da ficha do personagem): o VALOR numérico — incluindo %,
 * sufixo /s e ranges "X a Y" — usa a cor de valor (brass, `'valor'`); o
 * conectivo ("de") fica neutro; e só o NOME do atributo recebe a cor da
 * categoria do stat.
 *
 * Ex.: "3 a 5 de Dano Físico" → [ "3 a 5" (valor) | " de " | "Dano Físico" (fisico) ]
 *      "2.6s de Tempo de Ataque" → [ "2.6s" (valor) | " de " | "Tempo de Ataque" ]
 *
 * Retorna `null` quando a linha não segue o padrão "<número> de <atributo>"
 * (ex.: "Concede: Bola de Fogo") ou não tem cor — nesses casos o renderer
 * mantém o comportamento antigo (linha inteira na cor, ou neutra).
 */
const NUMBER = String.raw`[+\-]?\s*\d+(?:[.,]\d+)?(?:%|/s|s)?`;
const STAT_PATTERN = new RegExp(
  `^(${NUMBER}(?:\\s+a\\s+\\d+(?:[.,]\\d+)?%?)?)(\\s+(?:de|do|da|ao|à)\\s+)(.+)$`,
);

export function getStatSegments(stat: ItemStat): ItemStatSegment[] | null {
  if (stat.segments) return stat.segments;
  if (!stat.color) return null;
  const m = stat.text.match(STAT_PATTERN);
  if (!m) return null;
  return [
    { text: m[1], color: 'valor' },
    { text: m[2] },
    { text: m[3], color: stat.color },
  ];
}
