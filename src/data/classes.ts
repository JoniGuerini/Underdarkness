import type { ClassData, ClassKey } from '../types';

export const CLASSES: Record<ClassKey, ClassData> = {
  guerreiro: {
    label: 'Guerreiro',
    tagline: 'Combate corpo a corpo',
    description:
      'Alta defesa e dano físico. Forte em combate direto, ideal para absorver dano e segurar a linha de frente.',
    vida: 30,
    forca: 8,
    agilidade: 3,
    intelecto: 3,
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
    vida: 20,
    forca: 5,
    agilidade: 8,
    intelecto: 5,
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
    vida: 15,
    forca: 3,
    agilidade: 5,
    intelecto: 8,
    abilities: [
      { name: 'Bola de Fogo', desc: 'dano arcano em área' },
      { name: 'Escudo Arcano', desc: 'absorve um golpe inteiro' },
    ],
  },
};

export const TAB_LABEL: Record<string, string> = {
  personagem: 'Personagem',
  habilidades: 'Habilidades',
  mapa: 'Mapa',
  diario: 'Diário',
  codice: 'Códice',
  mercado: 'Mercado',
  social: 'Social', // SOCIAL: removível
  opcoes: 'Opções',
};

export const TAB_SHORTCUT: Record<string, string> = {
  personagem: 'C',
  habilidades: 'A',
  mapa: 'M',
  diario: 'J',
  codice: 'K',
  mercado: 'L',
  social: 'G', // SOCIAL: removível
  opcoes: 'ESC',
};

export const TAB_DESC: Record<string, string> = {
  personagem: 'Ficha completa, atributos detalhados, equipamento e inventário.',
  habilidades: 'Árvore de habilidades e progressão por arquétipo.',
  mapa: 'Localização atual e regiões já exploradas.',
  diario: 'Quests, anotações e fragmentos de lore.',
  codice: 'Mods, forja, bestiário e guias de mecânica.',
  mercado: 'Casa de leilões — compra e venda entre jogadores.',
  social: 'Chat, guilda, amigos e busca de grupos.', // SOCIAL: removível
  opcoes: 'Preferências do jogo.',
};
