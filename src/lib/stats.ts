import type { Character, DerivedStats } from '../types';

export function computeDerivedStats(c: Character): DerivedStats {
  const cls = c.classKey;
  const f = c.forca;
  const a = c.agilidade;
  const i = c.intelecto;
  const lvl = c.level || 1;

  // Defesa — armadura escala com Força, evasão com Agilidade
  const armaduraBase = cls === 'guerreiro' ? 8 : cls === 'ladino' ? 4 : 2;
  const armadura = armaduraBase + Math.floor(f / 2) + lvl;

  const evasaoBase = cls === 'ladino' ? 8 : cls === 'guerreiro' ? 3 : 5;
  const evasao = evasaoBase + Math.floor(a / 2) + lvl;

  const bloqueio = cls === 'guerreiro' ? 15 : 0;

  // Resistências — todas começam em 0% com cap de 75%
  const resistMax = 75;
  const resFogo = 0;
  const resGelo = 0;
  const resRaio = 0;
  const resCaos = 0;
  const resFisico = cls === 'guerreiro' ? Math.floor(f / 4) : 0;

  // Ofensiva — Físico
  const danoFisicoBase: [number, number] =
    cls === 'guerreiro' ? [4, 8] : cls === 'ladino' ? [3, 6] : [1, 3];
  const bonusForca = Math.floor(f * 0.15);
  const danoFisicoMin = danoFisicoBase[0] + bonusForca;
  const danoFisicoMax = danoFisicoBase[1] + bonusForca;

  const velAtaqueBase = cls === 'ladino' ? 1.6 : cls === 'guerreiro' ? 1.0 : 0.8;
  const velAtaque = velAtaqueBase + (a - 10) * 0.02;

  const chanceCritico = 5 + Math.max(0, a - 10) * 0.4;
  const multCritico = 1.5 + (cls === 'ladino' ? 0.2 : 0);

  // Ofensiva — Elemental
  const danoFogo = cls === 'mago' ? Math.floor(i * 0.6) : 0;
  const danoGelo = 0;
  const danoRaio = cls === 'mago' ? Math.floor(i * 0.4) : 0;
  const penFogo = 0;
  const penGelo = 0;
  const penRaio = 0;

  // Ofensiva — Caos
  const danoCaos = 0;
  const penCaos = 0;

  // Ofensiva / Defensiva — Sagrado
  const danoSagrado = 0;
  const resSagrado = 0;
  const penSagrado = 0;

  // Dano Total — soma de todos os tipos (físico + elemental + caos + sagrado)
  const danoTotalMin = danoFisicoMin + danoFogo + danoGelo + danoRaio + danoCaos + danoSagrado;
  const danoTotalMax = danoFisicoMax + danoFogo + danoGelo + danoRaio + danoCaos + danoSagrado;
  const danoMedio = (danoTotalMin + danoTotalMax) / 2;
  const dps = danoMedio * velAtaque * (1 + (chanceCritico / 100) * (multCritico - 1));

  // Magia
  const bonusMagico = cls === 'mago' ? Math.floor(i * 5) : 0;
  const velConjuracaoBase = cls === 'mago' ? 1.2 : 0.8;
  const velConjuracao = velConjuracaoBase + (i - 10) * 0.02;
  const eficienciaMana = 100 + (cls === 'mago' ? Math.floor(i / 2) : 0);

  // Sustain
  const regenVida = cls === 'guerreiro' ? 1 : 0;
  const regenMana = cls === 'mago' ? 2 : cls === 'ladino' ? 1 : 0;
  const rouboVida = 0;
  const rouboMana = 0;

  // Mobilidade
  const velMovimento = 100;
  const esquiva = Math.floor(a * 0.5);

  // Precisão — contraponto ofensivo da Evasão
  const acertoBase = cls === 'ladino' ? 12 : cls === 'guerreiro' ? 8 : 6;
  const acerto = acertoBase + Math.floor(a * 1.5) + lvl * 2;

  return {
    armadura,
    evasao,
    bloqueio,
    resistMax,
    resFogo,
    resGelo,
    resRaio,
    resCaos,
    resFisico,
    danoFisicoMin,
    danoFisicoMax,
    danoTotalMin,
    danoTotalMax,
    velAtaque,
    chanceCritico,
    multCritico,
    dps,
    danoFogo,
    danoGelo,
    danoRaio,
    penFogo,
    penGelo,
    penRaio,
    danoCaos,
    penCaos,
    danoSagrado,
    resSagrado,
    penSagrado,
    bonusMagico,
    velConjuracao,
    eficienciaMana,
    regenVida,
    regenMana,
    rouboVida,
    rouboMana,
    velMovimento,
    esquiva,
    acerto,
  };
}
