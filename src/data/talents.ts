import type { ClassKey, Talent, TalentEffect, TalentTree } from '../types';

// ============================================================================
// Helper de criação — reduz boilerplate por talent
// ============================================================================
interface TalentSeed {
  id: string;
  name: string;
  description: string;
  row: number;
  col: number;
  maxRank?: number;
  prerequisites?: string[];
  effect?: TalentEffect;
}

const t = (seed: TalentSeed): Talent => ({
  id: seed.id,
  name: seed.name,
  description: seed.description,
  row: seed.row,
  col: seed.col,
  maxRank: seed.maxRank ?? 5,
  prerequisites: seed.prerequisites,
  effect: seed.effect,
});

// ============================================================================
// GUERREIRO — 3 árvores × 12 talents cada (3 caminhos paralelos por árvore)
// ============================================================================

/*
  Layout 5 colunas × 4 tiers, posições staggered (zig-zag):
  - Tiers ímpares (0, 2): cols 0, 2, 4 (extremos + meio)
  - Tiers pares (1, 3): cols 1, 2, 3 (centralizados)
  Resultado: linhas alternam entre verticais e diagonais — feel orgânico.

           col 0       col 1       col 2       col 3       col 4
  row 0  [Postura]    .           [Investida]  .          [Provocar]
  row 1   .          [Frenesi]    [G.Brutal]   [Reflexos]  .
  row 2  [Punhos]    .            [Maestria]   .          [Tornado]
  row 3   .          [Berserker]  [Mestre]     [Sangu.]    .
*/
const G_COMBATE: TalentTree = {
  id: 'g-combate',
  name: 'Combate',
  description: 'Habilidades ofensivas e técnicas de batalha. Três caminhos: Fúria, Lâmina e Disciplina.',
  cols: 5,
  rows: 4,
  talents: [
    // ====== TIER 1 — fundamentos (cols 0, 2, 4) ======
    t({
      id: 'g-c-postura', name: 'Postura Agressiva',
      description: 'Aumenta o dano dos seus golpes corpo a corpo.',
      row: 0, col: 0,
      effect: { perRank: 5, label: 'Dano Físico', unit: '%', color: 'fisico' },
    }),
    t({
      id: 'g-c-investida', name: 'Investida',
      description: 'Avança rapidamente em direção ao alvo, ignorando a primeira tentativa de evasão.',
      row: 0, col: 2,
      maxRank: 3,
      effect: { perRank: 1, label: 'Alcance da Investida', unit: '', signed: true },
    }),
    t({
      id: 'g-c-provocar', name: 'Provocar',
      description: 'Força inimigos próximos a te atacarem em vez de aliados.',
      row: 0, col: 4,
      maxRank: 3,
      effect: { perRank: 20, label: 'Chance de Provocar', unit: '%' },
    }),

    // ====== TIER 2 — escala fundamentos (cols 1, 2, 3) ======
    t({
      id: 'g-c-frenesi', name: 'Frenesi',
      description: 'Cada acerto aumenta sua Velocidade de Ataque temporariamente (acumulável até 5x).',
      row: 1, col: 1,
      prerequisites: ['g-c-postura'],
      effect: { perRank: 5, label: 'Vel. Ataque por acerto', unit: '%', color: 'agilidade' },
    }),
    t({
      id: 'g-c-brutal', name: 'Golpe Brutal',
      description: 'Golpes carregados de fúria têm chance maior de causar dano crítico.',
      row: 1, col: 2,
      prerequisites: ['g-c-investida'],
      effect: { perRank: 5, label: 'Chance de Crítico', unit: '%', color: 'critico' },
    }),
    t({
      id: 'g-c-reflexos', name: 'Reflexos Apurados',
      description: 'Treinamento marcial aprimora sua precisão em combate.',
      row: 1, col: 3,
      prerequisites: ['g-c-provocar'],
      effect: { perRank: 3, label: 'Acerto', unit: '', color: 'agilidade', signed: true },
    }),

    // ====== TIER 3 — especializações (cols 0, 2, 4) ======
    t({
      id: 'g-c-punhos', name: 'Punhos de Ferro',
      description: 'Anos manejando armas pesadas refinaram seu balanço.',
      row: 2, col: 0,
      prerequisites: ['g-c-frenesi'],
      effect: { perRank: 8, label: 'Dano com Armas Pesadas', unit: '%', color: 'fisico' },
    }),
    t({
      id: 'g-c-maestria', name: 'Maestria de Lâminas',
      description: 'O corte certo abre caminho até o osso.',
      row: 2, col: 2,
      prerequisites: ['g-c-brutal'],
      effect: { perRank: 0.1, label: 'Multiplicador de Crítico', unit: '', color: 'critico', signed: true },
    }),
    t({
      id: 'g-c-whirlwind', name: 'Tornado de Aço',
      description: 'Um único golpe giratório atinge todos os inimigos adjacentes ao mesmo tempo.',
      row: 2, col: 4,
      maxRank: 1,
      prerequisites: ['g-c-reflexos'],
    }),

    // ====== TIER 4 — capstones (cols 1, 2, 3) ======
    t({
      id: 'g-c-berserk', name: 'Berserker',
      description: 'Quando abaixo de 50% de Vida, sua fúria desperta. +30% Dano Total e +20% Vel. Ataque, mas Armadura cai pela metade.',
      row: 3, col: 1,
      maxRank: 1,
      prerequisites: ['g-c-punhos'],
    }),
    t({
      id: 'g-c-mestre', name: 'Mestre de Armas',
      description: 'O auge da disciplina marcial — todo golpe físico é refinado ao máximo.',
      row: 3, col: 2,
      maxRank: 1,
      prerequisites: ['g-c-maestria'],
      effect: { perRank: 30, label: 'Dano Total', unit: '%' },
    }),
    t({
      id: 'g-c-sanguinario', name: 'Sanguinário',
      description: 'Cada inimigo abatido restaura parte da sua Vida e Vel. Ataque por 5s.',
      row: 3, col: 3,
      maxRank: 1,
      prerequisites: ['g-c-whirlwind'],
      effect: { perRank: 8, label: 'Vida restaurada por kill', unit: '%', color: 'vida' },
    }),
  ],
};

const G_DEFESA: TalentTree = {
  id: 'g-defesa',
  name: 'Defesa',
  description: 'Mitigação, bloqueio e resiliência. Três caminhos: Carne, Escudo e Espírito.',
  cols: 5,
  rows: 4,
  talents: [
    // ====== TIER 1 (cols 0, 2, 4) ======
    t({
      id: 'g-d-pele', name: 'Pele Dura',
      description: 'Sua pele é mais espessa que a média.',
      row: 0, col: 0,
      effect: { perRank: 5, label: 'Armadura', unit: '', color: 'fisico', signed: true },
    }),
    t({
      id: 'g-d-bloqueio', name: 'Bloqueio Sólido',
      description: 'Postura defensiva refinada com escudo.',
      row: 0, col: 2,
      effect: { perRank: 3, label: 'Chance de Bloqueio', unit: '%', color: 'fisico' },
    }),
    t({
      id: 'g-d-resistencia', name: 'Resistência Natural',
      description: 'Seu corpo absorve naturalmente energias hostis.',
      row: 0, col: 4,
      effect: { perRank: 2, label: 'Resistência a Todos Elementos', unit: '%' },
    }),

    // ====== TIER 2 (cols 1, 2, 3) ======
    t({
      id: 'g-d-recuperacao', name: 'Recuperação',
      description: 'Seu corpo se cura rapidamente entre combates.',
      row: 1, col: 1,
      prerequisites: ['g-d-pele'],
      effect: { perRank: 1, label: 'Regeneração de Vida', unit: '', color: 'vida', signed: true },
    }),
    t({
      id: 'g-d-sagrado', name: 'Escudo Sagrado',
      description: 'Bloqueio bem-sucedido atordoa o agressor por 1 segundo.',
      row: 1, col: 2,
      maxRank: 1,
      prerequisites: ['g-d-bloqueio'],
    }),
    t({
      id: 'g-d-ferro', name: 'Vontade de Ferro',
      description: 'Seu espírito resiste à corrupção dos abismos.',
      row: 1, col: 3,
      prerequisites: ['g-d-resistencia'],
      effect: { perRank: 3, label: 'Resistência ao Caos', unit: '%', color: 'caos' },
    }),

    // ====== TIER 3 (cols 0, 2, 4) ======
    t({
      id: 'g-d-pedra', name: 'Pele de Pedra',
      description: 'Treinamento intensivo enrijece a pele a níveis sobrenaturais.',
      row: 2, col: 0,
      prerequisites: ['g-d-recuperacao'],
      effect: { perRank: 10, label: 'Armadura', unit: '', color: 'fisico', signed: true },
    }),
    t({
      id: 'g-d-formapedra', name: 'Forma de Pedra',
      description: 'Sua carne endurece momentaneamente. Reduz dano recebido em 30% por 5s. Cooldown 30s.',
      row: 2, col: 2,
      maxRank: 1,
      prerequisites: ['g-d-sagrado'],
    }),
    t({
      id: 'g-d-espirito', name: 'Espírito Resiliente',
      description: 'Sua mente é uma fortaleza contra todas as forças.',
      row: 2, col: 4,
      prerequisites: ['g-d-ferro'],
      effect: { perRank: 2, label: 'Resistência a Todos Elementos', unit: '%' },
    }),

    // ====== TIER 4 — capstones (cols 1, 2, 3) ======
    t({
      id: 'g-d-indomavel', name: 'Indomável',
      description: 'Anos de combate forjaram um corpo que recusa cair.',
      row: 3, col: 1,
      maxRank: 1,
      prerequisites: ['g-d-pedra'],
      effect: { perRank: 25, label: 'Vida Máxima', unit: '%', color: 'vida' },
    }),
    t({
      id: 'g-d-sentinela', name: 'Sentinela',
      description: 'Imune a atordoamentos, derrubadas e knockbacks. Você não cede terreno.',
      row: 3, col: 2,
      maxRank: 1,
      prerequisites: ['g-d-formapedra'],
    }),
    t({
      id: 'g-d-salvaguarda', name: 'Salvaguarda',
      description: 'Ao receber dano fatal, ressuscita imediatamente com 50% de Vida. Cooldown 10min.',
      row: 3, col: 3,
      maxRank: 1,
      prerequisites: ['g-d-espirito'],
    }),
  ],
};

const G_HEROICO: TalentTree = {
  id: 'g-heroico',
  name: 'Heroico',
  description: 'Comando, inspiração e presença em batalha. Três caminhos: Berserker, Tático e Sagrado.',
  cols: 5,
  rows: 4,
  talents: [
    // ====== TIER 1 (cols 0, 2, 4) ======
    t({
      id: 'g-h-grito', name: 'Grito de Batalha',
      description: 'Um rugido de guerra inspira aliados próximos. +10% Dano por 10s.',
      row: 0, col: 0,
      maxRank: 1,
    }),
    t({
      id: 'g-h-comando', name: 'Comando',
      description: 'Sua presença em batalha acelera o avanço dos seus.',
      row: 0, col: 2,
      effect: { perRank: 5, label: 'Vel. Movimento de Aliados', unit: '%', color: 'agilidade' },
    }),
    t({
      id: 'g-h-inspiracao', name: 'Inspiração',
      description: 'Sua coragem é contagiosa.',
      row: 0, col: 4,
      effect: { perRank: 1, label: 'Regen de Vida de Aliados', unit: '', color: 'vida', signed: true },
    }),

    // ====== TIER 2 (cols 1, 2, 3) ======
    t({
      id: 'g-h-furia', name: 'Fúria Desencadeada',
      description: 'Seu Grito de Batalha se torna autoinflamado — você também ganha o buff.',
      row: 1, col: 1,
      prerequisites: ['g-h-grito'],
      effect: { perRank: 10, label: 'Vel. Ataque após Grito', unit: '%', color: 'agilidade' },
    }),
    t({
      id: 'g-h-lider', name: 'Líder Nato',
      description: 'Cada vitória ensina mais do que mil derrotas.',
      row: 1, col: 2,
      maxRank: 3,
      prerequisites: ['g-h-comando'],
      effect: { perRank: 10, label: 'XP Ganho', unit: '%' },
    }),
    t({
      id: 'g-h-resiliencia', name: 'Resiliência',
      description: 'Recuperação acelerada de corpo e mente.',
      row: 1, col: 3,
      prerequisites: ['g-h-inspiracao'],
      effect: { perRank: 1, label: 'Regen de Vida e Mana', unit: '', signed: true },
    }),

    // ====== TIER 3 (cols 0, 2, 4) ======
    t({
      id: 'g-h-veterano', name: 'Veterano',
      description: 'Você reconhece a fraqueza dos feridos e ataca com mais força.',
      row: 2, col: 0,
      maxRank: 3,
      prerequisites: ['g-h-furia'],
      effect: { perRank: 10, label: 'Dano contra inimigos abaixo de 50% Vida', unit: '%' },
    }),
    t({
      id: 'g-h-carisma', name: 'Carisma',
      description: 'Sua reputação te abre portas — e bolsos — em vilas e tavernas.',
      row: 2, col: 2,
      maxRank: 3,
      prerequisites: ['g-h-lider'],
      effect: { perRank: 10, label: 'Reputação com NPCs', unit: '%' },
    }),
    t({
      id: 'g-h-sermao', name: 'Sermão',
      description: 'Seu Grito de Batalha também cura aliados próximos.',
      row: 2, col: 4,
      prerequisites: ['g-h-resiliencia'],
      effect: { perRank: 5, label: 'Vida curada de aliados após Grito', unit: '%', color: 'vida' },
    }),

    // ====== TIER 4 — capstones (cols 1, 2, 3) ======
    t({
      id: 'g-h-tirano', name: 'Tirano de Guerra',
      description: 'Aura passiva: inimigos próximos têm sua Vel. Ataque reduzida em 10% e Resistências reduzidas em 5%.',
      row: 3, col: 1,
      maxRank: 1,
      prerequisites: ['g-h-veterano'],
    }),
    t({
      id: 'g-h-ultima', name: 'Última Resistência',
      description: 'Quando sua Vida cai abaixo de 10%: regeneração total imediata. Cooldown 5min.',
      row: 3, col: 2,
      maxRank: 1,
      prerequisites: ['g-h-carisma'],
    }),
    t({
      id: 'g-h-avatar', name: 'Avatar do Combate',
      description: 'Aura passiva: aliados próximos ganham +10% Chance de Crítico e +1 Regen de Vida por turno.',
      row: 3, col: 4,
      maxRank: 1,
      prerequisites: ['g-h-sermao'],
    }),
  ],
};

// ============================================================================
// LADINO (placeholder — preencher com conteúdo final depois)
// ============================================================================
const L_FURTIVIDADE: TalentTree = {
  id: 'l-furtividade',
  name: 'Furtividade',
  description: 'Stealth, esquiva e ataques pelas costas.',
  cols: 3, rows: 4,
  talents: [
    t({
      id: 'l-f-sombra', name: 'Andar nas Sombras',
      description: 'Reduz a chance de ser detectado em ambientes escuros.',
      row: 0, col: 1,
      effect: { perRank: 10, label: 'Esquiva em ambientes escuros', unit: '%', color: 'agilidade' },
    }),
  ],
};

const L_PRECISAO: TalentTree = {
  id: 'l-precisao',
  name: 'Precisão',
  description: 'Crítico, acerto e dano por golpe.',
  cols: 3, rows: 4,
  talents: [
    t({
      id: 'l-p-mira', name: 'Mira Apurada',
      description: 'Treinamento intensivo de pontaria.',
      row: 0, col: 1,
      effect: { perRank: 3, label: 'Acerto', unit: '', color: 'agilidade', signed: true },
    }),
  ],
};

const L_MOBILIDADE: TalentTree = {
  id: 'l-mobilidade',
  name: 'Mobilidade',
  description: 'Velocidade, evasão e reposicionamento.',
  cols: 3, rows: 4,
  talents: [
    t({
      id: 'l-m-pesleves', name: 'Pés Leves',
      description: 'Movimentos ágeis aprendidos nas ruas.',
      row: 0, col: 1,
      effect: { perRank: 2, label: 'Evasão', unit: '', color: 'agilidade' },
    }),
  ],
};

// ============================================================================
// MAGO (placeholder — preencher com conteúdo final depois)
// ============================================================================
const M_FOGO: TalentTree = {
  id: 'm-fogo',
  name: 'Fogo',
  description: 'Magias incandescentes e dano em área.',
  cols: 3, rows: 4,
  talents: [
    t({
      id: 'm-f-faisca', name: 'Faísca',
      description: 'Conjura uma faísca de fogo na ponta dos dedos.',
      row: 0, col: 1,
      effect: { perRank: 3, label: 'Dano de Fogo', unit: '', color: 'fogo', signed: true },
    }),
  ],
};

const M_GELO: TalentTree = {
  id: 'm-gelo',
  name: 'Gelo',
  description: 'Magias congelantes que travam e estilhaçam.',
  cols: 3, rows: 4,
  talents: [
    t({
      id: 'm-g-cristais', name: 'Cristais',
      description: 'Conjura cristais de gelo afiados.',
      row: 0, col: 1,
      effect: { perRank: 3, label: 'Dano de Gelo', unit: '', color: 'gelo', signed: true },
    }),
  ],
};

const M_CAOS: TalentTree = {
  id: 'm-caos',
  name: 'Caos',
  description: 'Magias proibidas que devoram a realidade.',
  cols: 3, rows: 4,
  talents: [
    t({
      id: 'm-c-sussurro', name: 'Sussurro Profano',
      description: 'Aprende a sussurrar palavras proibidas — e elas escutam de volta.',
      row: 0, col: 1,
      effect: { perRank: 3, label: 'Dano de Caos', unit: '', color: 'caos', signed: true },
    }),
  ],
};

// ============================================================================
// Mapping classe → árvores
// ============================================================================
const CLASS_TREES: Record<ClassKey, TalentTree[]> = {
  guerreiro: [G_COMBATE, G_DEFESA, G_HEROICO],
  ladino: [L_FURTIVIDADE, L_PRECISAO, L_MOBILIDADE],
  mago: [M_FOGO, M_GELO, M_CAOS],
};

export function getTalentTrees(classKey: ClassKey): TalentTree[] {
  return CLASS_TREES[classKey];
}

/** Quantos pontos foram gastos numa árvore específica (soma dos ranks). */
export function pointsSpentInTree(tree: TalentTree, ranks: Record<string, number>): number {
  return tree.talents.reduce((sum, talent) => sum + (ranks[talent.id] ?? 0), 0);
}

/**
 * Pontos disponíveis = (level - 1) - total já gasto em todas árvores.
 * Lv 1 = 0 pontos; cada level up dá 1 ponto.
 */
export function availableTalentPoints(
  level: number,
  ranks: Record<string, number>,
): number {
  const totalSpent = Object.values(ranks).reduce((s, n) => s + n, 0);
  return Math.max(0, level - 1 - totalSpent);
}

/** Talent está desbloqueado se todos os prerequisites têm rank > 0. */
export function isTalentUnlocked(
  talent: Talent,
  ranks: Record<string, number>,
): boolean {
  if (!talent.prerequisites || talent.prerequisites.length === 0) return true;
  return talent.prerequisites.every((id) => (ranks[id] ?? 0) > 0);
}
