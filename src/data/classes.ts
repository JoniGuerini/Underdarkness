import type { ClassData, ClassKey } from '../types';

export const CLASSES: Record<ClassKey, ClassData> = {
  guerreiro: {
    label: 'Guerreiro',
    tagline: 'Combate corpo a corpo',
    description:
      'Alta defesa e dano físico. Forte em combate direto, ideal para absorver dano e segurar a linha de frente.',
    vida: 14,
    mana: 2,
    forca: 16,
    agilidade: 11,
    intelecto: 8,
    abilities: [
      { name: 'Golpe Devastador', desc: 'causa o dobro de dano' },
      { name: 'Postura Defensiva', desc: 'reduz dano recebido pela metade' },
    ],
  },
  ladino: {
    label: 'Ladino',
    tagline: 'Furtividade e precisão',
    description:
      'Dano alto em ataques únicos com chance crítica. Boa esquiva e mobilidade, mas pouca defesa.',
    vida: 10,
    mana: 4,
    forca: 11,
    agilidade: 17,
    intelecto: 13,
    abilities: [
      { name: 'Ataque Furtivo', desc: 'crítico se o alvo não te vê' },
      { name: 'Esquiva Ágil', desc: 'chance de evitar o golpe inteiro' },
    ],
  },
  mago: {
    label: 'Mago',
    tagline: 'Magia arcana',
    description:
      'Magias de dano em área e controle. Frágil em combate corpo a corpo, mas devastador a distância.',
    vida: 8,
    mana: 12,
    forca: 8,
    agilidade: 11,
    intelecto: 17,
    abilities: [
      { name: 'Bola de Fogo', desc: 'dano arcano em área' },
      { name: 'Escudo Arcano', desc: 'absorve um golpe inteiro' },
    ],
  },
};

export const TAB_LABEL: Record<string, string> = {
  personagem: 'Personagem',
  talentos: 'Talentos',
  habilidades: 'Habilidades',
  mapa: 'Mapa',
  diario: 'Diário',
  codice: 'Códice',
  opcoes: 'Opções',
};

export const TAB_SHORTCUT: Record<string, string> = {
  personagem: 'C',
  talentos: 'T',
  habilidades: 'A',
  mapa: 'M',
  diario: 'J',
  codice: 'K',
  opcoes: 'ESC',
};

export const TAB_DESC: Record<string, string> = {
  personagem: 'Ficha completa, atributos detalhados, equipamento e inventário.',
  talentos: 'Árvore de talentos e progressão por arquétipo.',
  habilidades: 'Habilidades ativas e magias conhecidas.',
  mapa: 'Localização atual e regiões já exploradas.',
  diario: 'Quests, anotações e fragmentos de lore.',
  codice: 'Referência sobre itens, mods, criaturas e lore do mundo.',
  opcoes: 'Preferências do jogo.',
};
