import type { Item } from '../types';

/**
 * Catálogo central de MATERIAIS (stackable, não-consumíveis).
 *
 * Consumíveis (poções, comida, etc.) serão um catálogo à parte, depois.
 * Cada material tem um `type` (Ervas, Minérios, Couro...) e um `tier` (1–5,
 * ~ato de origem) pra organização e progressão. Vamos preenchendo por tipo.
 */

/** Tipo de material — cresce conforme adicionamos categorias. */
export type MaterialType = 'erva' | 'minerio' | 'couro' | 'tecido' | 'carne' | 'verdura' | 'fruta';

export const MATERIAL_TYPE_LABEL: Record<MaterialType, string> = {
  erva: 'Ervas',
  minerio: 'Minérios',
  couro: 'Couros',
  tecido: 'Tecidos',
  carne: 'Carnes',
  verdura: 'Verduras',
  fruta: 'Frutas',
};

/** Rótulo no singular — usado no tooltip/card de um item individual. */
export const MATERIAL_TYPE_SINGULAR: Record<MaterialType, string> = {
  erva: 'Erva',
  minerio: 'Minério',
  couro: 'Couro',
  tecido: 'Tecido',
  carne: 'Carne',
  verdura: 'Verdura',
  fruta: 'Fruta',
};

/** Cor viva por tipo de reagente — destaca o subtipo no tooltip/card.
 *  Referencia tokens de `tokens.css` (aplicada via style inline). */
export const MATERIAL_TYPE_COLOR: Record<MaterialType, string> = {
  erva: 'var(--material-erva)',
  minerio: 'var(--material-minerio)',
  couro: 'var(--material-couro)',
  tecido: 'var(--material-tecido)',
  carne: 'var(--material-carne)',
  verdura: 'var(--material-verdura)',
  fruta: 'var(--material-fruta)',
};

/** Rótulo-guarda-chuva de todos os materiais. */
export const REAGENT_GROUP_LABEL = 'Reagente de Criação';

export interface MaterialDef {
  item: Item;
  /** Preço padrão de venda em loja (compra do jogador). */
  defaultPrice: number;
  /** Categoria do material. */
  type: MaterialType;
  /** Tier de origem (1–5, ~ato). Usado pra ordenar/escalar. */
  tier: number;
}

/** Helper — monta um material stackable (rarity comum, slot null). */
function mat(
  type: MaterialType,
  tier: number,
  id: string,
  name: string,
  description: string,
  defaultPrice: number,
): MaterialDef {
  return {
    item: { id, name, slot: null, rarity: 'comum', stackable: true, stack: 1, description },
    defaultPrice,
    type,
    tier,
  };
}

// ── Ervas (reagentes de alquimia) ──────────────────────────────────────
const ERVAS: MaterialDef[] = [
  // Tier 1 — Vales e bosques (Ato I)
  mat('erva', 1, 'valeriana', 'Valeriana', 'Raiz de cheiro forte que acalma nervos e cavalos. Base de sonos e sedativos.', 3),
  mat('erva', 1, 'arruda', 'Arruda', 'Verde-azulada e amarga. Dizem que afasta o mau-olhado — e pragas menores.', 3),
  mat('erva', 1, 'verbena', 'Verbena', 'Erva miúda de flor lilás. Reagente comum, presente em quase toda receita.', 4),
  mat('erva', 1, 'dedaleira', 'Dedaleira', 'Sinos púrpura numa haste alta. Cura o coração fraco — ou o para de vez.', 5),
  mat('erva', 1, 'salvia-cinzenta', 'Sálvia Cinzenta', 'Folhas aveludadas cor de cinza. Clareia a mente e limpa feridas.', 5),
  mat('erva', 1, 'camomila-brava', 'Camomila Brava', 'Flor amarela do campo. Adormece a dor pequena e o choro fácil.', 3),
  mat('erva', 1, 'confrei', 'Confrei', 'Folha larga que solda osso e pele. Favorita dos curandeiros pobres.', 4),

  // Tier 2 — As Profundezas (Ato II)
  mat('erva', 2, 'meimendro', 'Meimendro', 'Flor pálida e enjoativa. Entorpece a dor e a razão junto.', 8),
  mat('erva', 2, 'liquen-funebre', 'Líquen Fúnebre', 'Cresce sobre ossos no escuro. Absorve tudo o que apodrece.', 9),
  mat('erva', 2, 'trombeteira', 'Trombeteira', 'Trompas brancas caídas. Belas, e cegam quem confia nelas.', 10),
  mat('erva', 2, 'mandragora', 'Mandrágora', 'Raiz com forma de gente. Colhida à noite, com os ouvidos tapados.', 12),
  mat('erva', 2, 'cogumelo-cadaver', 'Cogumelo Cadáver', 'Brota da carne esquecida. Fosforescente e faminto.', 12),
  mat('erva', 2, 'raiz-mortalha', 'Raiz da Mortalha', 'Torcida e preta, cresce onde alguém foi enterrado sem nome.', 10),
  mat('erva', 2, 'chapeu-cobra', 'Chapéu-de-Cobra', 'Cogumelo listrado que finge ser remédio até tarde demais.', 11),

  // Tier 3 — O Mar Sem Sol (Ato III)
  mat('erva', 3, 'sargaco-fantasma', 'Sargaço Fantasma', 'Alga translúcida que boia sozinha. Some quando a maré vira.', 15),
  mat('erva', 3, 'anemona-negra', 'Anêmona Negra', 'Flor do fundo que se fecha ao toque. Guarda um veneno paciente.', 16),
  mat('erva', 3, 'lirio-afogado', 'Lírio Afogado', 'Pétalas brancas sob a água parada. Cheira a memória submersa.', 17),
  mat('erva', 3, 'beladona-marinha', 'Beladona Marinha', 'Bagas escuras dos recifes. Doces até o último gole.', 18),
  mat('erva', 3, 'musgo-luminoso', 'Musgo Luminoso', 'Brilha azul nas paredes submersas. Guia quem já se perdeu.', 15),
  mat('erva', 3, 'coral-lacrimoso', 'Coral Lacrimoso', 'Escorre uma seiva salgada quando arrancado. Chora por você.', 16),

  // Tier 4 — As Veias de Fogo (Ato IV)
  mat('erva', 4, 'cardo-ardente', 'Cardo Ardente', 'Espinhos em brasa que não apagam. Queima a mão descuidada.', 22),
  mat('erva', 4, 'flor-de-enxofre', 'Flor de Enxofre', 'Cristaliza à beira do magma. Cheira a fim de mundo.', 24),
  mat('erva', 4, 'raiz-de-obsidiana', 'Raiz de Obsidiana', 'Preta e vítrea, fincada na rocha quente. Corta como lasca.', 26),
  mat('erva', 4, 'cinza-viva', 'Cinza-Viva', 'Um punhado de cinza que ainda respira calor. Reacende sozinha.', 27),
  mat('erva', 4, 'flor-brasa', 'Flor-Brasa', 'Abre só no calor extremo. Suas pétalas são ascuas vivas.', 25),

  // Tier 5 — O Abismo Primordial (Ato V)
  mat('erva', 5, 'asfodelo-palido', 'Asfódelo Pálido', 'A flor dos mortos, dizem os antigos. Floresce onde a luz falha.', 32),
  mat('erva', 5, 'flor-cadaver', 'Flor-Cadáver', 'Enorme e fétida, atrai tudo o que se alimenta de carniça.', 34),
  mat('erva', 5, 'visco-do-vazio', 'Visco do Vazio', 'Cresce onde não há árvore. Pulsa quando ninguém olha.', 36),
  mat('erva', 5, 'semente-do-nada', 'Semente do Nada', 'Uma semente que não deveria germinar. E ainda assim germina.', 38),
  mat('erva', 5, 'raiz-primordial', 'Raiz Primordial', 'Mais velha que o solo. Lembra de quando não havia nada pra enraizar.', 37),
];

// ── Minérios (metais e pedras de forja) ────────────────────────────────
const MINERIOS: MaterialDef[] = [
  // Tier 1 — Vales e bosques (Ato I): metais comuns, o básico da bigorna
  mat('minerio', 1, 'minerio-ferro', 'Minério de Ferro', 'Veios ferrosos em pedra parda. O pão-com-manteiga de toda forja.', 5),
  mat('minerio', 1, 'minerio-cobre', 'Cobre', 'Avermelhado sob a crosta. Macio, mas honesto no trabalho.', 4),
  mat('minerio', 1, 'minerio-estanho', 'Estanho', 'Cinza-fosco e dócil. Ligado ao cobre, nasce o bronze.', 5),
  mat('minerio', 1, 'minerio-chumbo', 'Chumbo', 'Pesado e mole. Absorve o que não deveria escapar.', 5),
  mat('minerio', 1, 'minerio-pirita', 'Pirita', 'Brilha como ouro e engana o tolo. Ainda assim, presta.', 4),

  // Tier 2 — As Profundezas (Ato II): metais fundos, frios e teimosos
  mat('minerio', 2, 'minerio-prata-bruta', 'Prata Bruta', 'Veios claros na rocha escura. Fere o que vem da noite.', 9),
  mat('minerio', 2, 'minerio-ferro-negro', 'Ferro Negro', 'Ferro que desceu fundo demais e voltou frio de vez.', 10),
  mat('minerio', 2, 'minerio-galena', 'Galena', 'Cubos cinza que reluzem no escuro. Guardam prata e veneno na mesma pedra.', 10),
  mat('minerio', 2, 'minerio-cobalto', 'Cobalto', 'Azul teimoso que ri do fogo brando. Tinge e endurece ligas.', 11),
  mat('minerio', 2, 'minerio-antimonio', 'Antimônio', 'Metaloide quebradiço que não perdoa o descuido do ferreiro.', 12),

  // Tier 3 — O Mar Sem Sol (Ato III): metais do fundo salgado
  mat('minerio', 3, 'minerio-coralita', 'Coralita', 'Metal que cresce como coral, anel sobre anel. Vive com a maré e morre com ela.', 15),
  mat('minerio', 3, 'minerio-nautilita', 'Nautilita', 'Espiral perfeita arrancada de conchas fósseis. Guarda o eco do mar.', 16),
  mat('minerio', 3, 'minerio-sal-de-ferro', 'Sal-de-Ferro', 'Cristais rubros que a água salgada depositou por eras. Cortam a língua.', 17),
  mat('minerio', 3, 'minerio-abissalio', 'Abissálio', 'Reluz num azul doente vindo das fossas. Frio ao toque, sempre.', 18),
  mat('minerio', 3, 'minerio-madreperola', 'Madrepérola Bruta', 'Nácar duro raspado de conchas colossais. Reluz como óleo na água.', 17),

  // Tier 4 — As Veias de Fogo (Ato IV): metais que nascem no calor
  mat('minerio', 4, 'minerio-piroferro', 'Piroferro', 'Ferro que nunca esfria de todo. Brasa presa dentro da pedra.', 22),
  mat('minerio', 4, 'minerio-escoria-viva', 'Escória Viva', 'Rejeito do magma que ainda escorre. Endurece em formas cruéis.', 24),
  mat('minerio', 4, 'minerio-magnetita-ignea', 'Magnetita Ígnea', 'Puxa o aço e a atenção. Nasce onde a terra sangra fogo.', 25),
  mat('minerio', 4, 'minerio-titanio', 'Titânio', 'Cinza-claro e leve como mentira. Ri do calor que derrete o resto.', 26),

  // Tier 5 — O Abismo Primordial (Ato V): metais míticos, quase vivos
  mat('minerio', 5, 'minerio-adamante', 'Adamante', 'A pedra que se recusa a quebrar. Guardada no fundo de tudo.', 32),
  mat('minerio', 5, 'minerio-estelario', 'Estelário', 'Caiu do céu antes do primeiro homem. Ainda lembra do frio do vazio.', 34),
  mat('minerio', 5, 'minerio-vazita', 'Vazita', 'Metal que não reflete luz alguma. Pesa mais quando ninguém olha.', 36),
  mat('minerio', 5, 'minerio-oricalco', 'Oricalco', 'O metal perdido dos primeiros deuses. Canta baixo quando forjado.', 38),
];

// ── Couros (peles e carapaças de criaturas) ────────────────────────────
const COUROS: MaterialDef[] = [
  // Tier 1 — Vales e bosques (Ato I): fauna comum
  mat('couro', 1, 'couro-cru', 'Couro Cru', 'Pele recém-tirada, ainda cheirando a cabra. A base de tudo.', 4),
  mat('couro', 1, 'couro-lobo', 'Couro de Lobo', 'Pelo cinza e correoso. Aquenta e aguenta.', 5),
  mat('couro', 1, 'couro-javali', 'Couro de Javali', 'Grosso e cheio de cerdas. Custa a furar.', 5),
  mat('couro', 1, 'pele-veado', 'Pele de Veado', 'Macia e leve. Boa pra vestes que não pesam a marcha.', 4),
  mat('couro', 1, 'couro-urso', 'Couro de Urso', 'Denso e quente. Quase uma armadura por si só.', 6),
  mat('couro', 1, 'couro-raposa', 'Pele de Raposa', 'Ruiva e lustrosa. Vale mais pela vaidade que pela proteção.', 5),

  // Tier 2 — As Profundezas (Ato II): bestas do subsolo
  mat('couro', 2, 'couro-morcego', 'Membrana de Morcego', 'Fina, escura e correosa. Estica sem rasgar.', 8),
  mat('couro', 2, 'pele-verme-cego', 'Pele de Verme Cego', 'Pálida e pegajosa. Nunca viu o sol e não sente falta.', 9),
  mat('couro', 2, 'quitina-aracnideo', 'Quitina de Aracnídeo', 'Placas que rangem ao vergar. Leves, e cheias de má lembrança.', 10),
  mat('couro', 2, 'couro-necrofago', 'Couro de Necrófago', 'Curtido pela própria podridão. Resiste ao que devora.', 11),
  mat('couro', 2, 'casca-troglodita', 'Casca de Troglodita', 'Pele calejada de quem vive raspando pedra. Dura na mesma medida.', 12),
  mat('couro', 2, 'couro-rato', 'Couro de Rato Gigante', 'Fino, mas surpreendentemente resistente. Cheira a esgoto e teimosia.', 9),

  // Tier 3 — O Mar Sem Sol (Ato III): pele de coisas afogadas
  mat('couro', 3, 'couro-escamado', 'Couro Escamado', 'Escamas sobrepostas que escorrem água. Frias e escorregadias.', 15),
  mat('couro', 3, 'pele-enguia', 'Pele de Enguia Abissal', 'Lisa e elétrica ao toque. Guarda um choque adormecido.', 16),
  mat('couro', 3, 'carapaca-crustaceo', 'Carapaça de Crustáceo', 'Blindagem do fundo, cravejada de sal. Pesa como culpa.', 17),
  mat('couro', 3, 'couro-sereiano', 'Couro Sereiano', 'Nem peixe, nem gente. Reluz num verde afogado.', 18),
  mat('couro', 3, 'couro-tubarao', 'Pele de Tubarão', 'Áspera num sentido, lisa no outro. Lixa madeira e orgulho.', 17),

  // Tier 4 — As Veias de Fogo (Ato IV): peles que bebem calor
  mat('couro', 4, 'couro-salamandra', 'Couro de Salamandra', 'Não queima. Bebe o fogo e pede mais.', 22),
  mat('couro', 4, 'couro-magmatico', 'Couro Magmático', 'Endurecido na brasa, rachado como lava seca.', 24),
  mat('couro', 4, 'escama-draconica', 'Escama Dracônica', 'Cada placa vale uma fortuna e uma cicatriz.', 25),
  mat('couro', 4, 'pele-fenix', 'Pele de Fênix', 'Morna mesmo arrancada. Insiste em brasa sob a mão.', 26),
  mat('couro', 4, 'couro-lagarto-igneo', 'Couro de Lagarto Ígneo', 'Escamas mornas que estalam calor. Ótima contra o frio, péssima no verão.', 23),
  mat('couro', 4, 'casca-golem', 'Casca de Golem', 'Placa de rocha viva arrancada do braço de um. Pesa como sentença.', 26),

  // Tier 5 — O Abismo Primordial (Ato V): peles do que não devia ter pele
  mat('couro', 5, 'couro-abissal', 'Couro Abissal', 'Escuridão curtida em forma de pele. Absorve o olhar.', 32),
  mat('couro', 5, 'pele-quimera', 'Pele de Quimera', 'Três texturas na mesma peça, nenhuma em paz.', 34),
  mat('couro', 5, 'couro-eterno', 'Couro Eterno', 'Não apodrece, não racha, não esquece. Só endurece.', 36),
  mat('couro', 5, 'manto-vazio', 'Manto do Vazio', 'Pele de algo que talvez nunca tenha tido corpo.', 38),
  mat('couro', 5, 'couro-tenebroso', 'Couro Tenebroso', 'Curtido na ausência de luz. Engole a mão de quem toca sem fé.', 35),
];

// ── Tecidos (fibras e panos) ───────────────────────────────────────────
const TECIDOS: MaterialDef[] = [
  // Tier 1 — Vales e bosques (Ato I): fibras rústicas
  mat('tecido', 1, 'estopa', 'Estopa', 'Sobras de fiação. Serve pra remendo e pra pavio.', 3),
  mat('tecido', 1, 'linho-cru', 'Linho Cru', 'Tecido áspero de fibra rústica. Veste os pobres e os começos.', 4),
  mat('tecido', 1, 'la-crua', 'Lã Crua', 'Quente e engordurada, direto do lombo da ovelha.', 4),
  mat('tecido', 1, 'canhamo', 'Cânhamo', 'Fibra teimosa que vira corda ou pano grosso.', 4),
  mat('tecido', 1, 'algodao-silvestre', 'Algodão Silvestre', 'Tufos macios colhidos à beira do caminho.', 5),
  mat('tecido', 1, 'juta', 'Juta', 'Fibra grosseira e barata. Vira saco, vira vela, vira remendo.', 3),

  // Tier 2 — As Profundezas (Ato II): panos da treva
  mat('tecido', 2, 'feltro-negro', 'Feltro Negro', 'Prensado até virar breu. Abafa som e luz.', 8),
  mat('tecido', 2, 'seda-caverna', 'Seda de Caverna', 'Fio de aranha tecido no escuro. Leve e traiçoeiro.', 9),
  mat('tecido', 2, 'la-subterranea', 'Lã Subterrânea', 'Pelo de bestas que nunca sentiram sol. Quente demais.', 10),
  mat('tecido', 2, 'fio-fantasma', 'Fio Fantasma', 'Some sob luz direta, reaparece na penumbra.', 11),
  mat('tecido', 2, 'sudario-mofado', 'Sudário Mofado', 'Pano de morto reaproveitado. Ninguém pergunta a origem.', 12),

  // Tier 3 — O Mar Sem Sol (Ato III): tramas do fundo
  mat('tecido', 3, 'seda-marinha', 'Seda Marinha', 'Fiada por moluscos, dourada e rara. Não teme o sal.', 15),
  mat('tecido', 3, 'linho-afogado', 'Linho Afogado', 'Ficou eras submerso e ainda assim não apodreceu.', 16),
  mat('tecido', 3, 'veludo-recife', 'Veludo de Recife', 'Aveludado por algas. Macio e traiçoeiramente pesado.', 17),
  mat('tecido', 3, 'gaze-nevoa', 'Gaze de Névoa', 'Quase não existe. Você a sente antes de vê-la.', 18),
  mat('tecido', 3, 'veu-agua-viva', 'Véu de Água-Viva', 'Translúcido e urticante. Belo de longe, cruel de perto.', 17),

  // Tier 4 — As Veias de Fogo (Ato IV): panos que zombam da chama
  mat('tecido', 4, 'seda-ignea', 'Seda Ígnea', 'Fio tecido no calor. Reluz em brasa quando esticado.', 22),
  mat('tecido', 4, 'amianto', 'Amianto', 'Pano de pedra que ri das chamas. Cuidado ao respirar perto.', 24),
  mat('tecido', 4, 'la-salamandra', 'Lã de Salamandra', 'Fibra que se aquece sozinha. Nunca esfria de todo.', 25),
  mat('tecido', 4, 'linho-cinzas', 'Linho das Cinzas', 'Tecido das cinzas de mil fogueiras. Cinza e resistente.', 26),

  // Tier 5 — O Abismo Primordial (Ato V): tramas impossíveis
  mat('tecido', 5, 'seda-estelar', 'Seda Estelar', 'Fio que reflete constelações já mortas.', 32),
  mat('tecido', 5, 'manto-sombrio', 'Manto Sombrio', 'Tecido de escuridão pura. Veste, mas não protege da verdade.', 34),
  mat('tecido', 5, 'linho-eterno', 'Linho Eterno', 'Não desfia, não mancha, não cede. Espera.', 36),
  mat('tecido', 5, 'trama-vazia', 'Trama do Vazio', 'Tecida com o que sobra entre as coisas. Pesa nada e tudo.', 38),
  mat('tecido', 5, 'trama-astral', 'Trama Astral', 'Tecida entre uma estrela e outra. Fria como o intervalo do tempo.', 37),
];

// ── Carnes (reagentes de culinária) ────────────────────────────────────
const CARNES: MaterialDef[] = [
  // Tier 1 — Vales e bosques (Ato I): caça comum
  mat('carne', 1, 'carne-caca', 'Carne de Caça', 'Corte magro de bicho do mato. Rende bem no espeto.', 4),
  mat('carne', 1, 'carne-veado', 'Lombo de Veado', 'Macio e magro. O corte que o caçador guarda pra si.', 5),
  mat('carne', 1, 'carne-javali', 'Pernil de Javali', 'Vermelho e rijo, com gosto de terra e briga.', 5),
  mat('carne', 1, 'carne-ave', 'Ave Silvestre', 'Peito firme de pássaro do campo. Boa assada.', 4),
  mat('carne', 1, 'carne-lebre', 'Carne de Lebre', 'Miúda e delicada. Some rápido da panela.', 4),
  mat('carne', 1, 'carne-porco-selvagem', 'Bacon Selvagem', 'Toucinho defumado de porco do mato. Gordura que vale ouro em marcha.', 5),
  mat('carne', 1, 'carne-cabra', 'Perna de Cabra', 'Rija e cheirosa. Precisa de fogo baixo e paciência alta.', 4),
  mat('carne', 1, 'carne-faisao', 'Faisão', 'Ave nobre de carne escura. Bonito no prato, difícil na caça.', 5),

  // Tier 2 — As Profundezas (Ato II): carne do subsolo, pra estômagos fortes
  mat('carne', 2, 'carne-morcego', 'Carne de Morcego', 'Escura e correosa. Melhor não perguntar o sabor.', 8),
  mat('carne', 2, 'carne-verme', 'Polpa de Verme', 'Pálida e gelatinosa. Nutre, se você conseguir engolir.', 9),
  mat('carne', 2, 'carne-aranha', 'Abdômen de Aranha', 'Recheado e amargo. Iguaria pra quem tem coragem.', 10),
  mat('carne', 2, 'carne-rato-gigante', 'Pernil de Rato Gigante', 'Mais carne do que se gostaria de admitir. Sustenta.', 9),
  mat('carne', 2, 'carne-troglodita', 'Posta de Troglodita', 'Carne pálida de quem nunca viu sol. Come-se em tempo de fome.', 12),
  mat('carne', 2, 'carne-serpente-cega', 'Posta de Serpente Cega', 'Longa e sem osso. Escorrega da faca e da consciência.', 10),
  mat('carne', 2, 'carne-toupeira', 'Pernil de Toupeira Gigante', 'Terroso e denso. Sabe a raiz e a escuridão.', 9),
  mat('carne', 2, 'carne-larva', 'Larva Recheada', 'Estoura doce entre os dentes. Não olhe antes de comer.', 8),

  // Tier 3 — O Mar Sem Sol (Ato III): pescados e frutos do fundo
  mat('carne', 3, 'carne-peixe-abissal', 'Filé de Peixe Abissal', 'Branco e frio, com um brilho que não deveria ter.', 15),
  mat('carne', 3, 'carne-polvo', 'Tentáculo de Polvo', 'Elástico e teimoso. Amolece só com pancada e paciência.', 16),
  mat('carne', 3, 'carne-crustaceo', 'Carne de Crustáceo', 'Doce sob a casca dura. Vale o trabalho de quebrar.', 17),
  mat('carne', 3, 'carne-enguia', 'Posta de Enguia', 'Gordurosa e elétrica. Formiga na língua.', 18),
  mat('carne', 3, 'carne-caranguejo', 'Pata de Caranguejo Real', 'Doce e suculenta sob a couraça. Um banquete que se defende.', 17),
  mat('carne', 3, 'carne-lula', 'Manto de Lula Gigante', 'Fatias largas e elásticas. Guardam tinta e mistério.', 16),

  // Tier 4 — As Veias de Fogo (Ato IV): bestas que já vêm temperadas
  mat('carne', 4, 'carne-salamandra', 'Rabo de Salamandra', 'Já vem quase no ponto. Arde na boca, no bom sentido.', 22),
  mat('carne', 4, 'carne-lagarto-igneo', 'Pernil de Lagarto Ígneo', 'Temperado pela própria brasa. Picante de nascença.', 24),
  mat('carne', 4, 'carne-draconica', 'Corte Dracônico', 'Nobre e raro. Um banquete — ou uma última refeição.', 25),
  mat('carne', 4, 'carne-fenix', 'Peito de Fênix', 'Renasce mal-passado se você piscar. Coma logo.', 26),
  mat('carne', 4, 'carne-touro-igneo', 'Costela de Touro Ígneo', 'Marmorizada de brasa. Sela sozinha ao ar quente.', 24),
  mat('carne', 4, 'carne-serpe', 'Filé de Serpe', 'Longo corte de serpente de fogo. Arde de nascença e no molho.', 25),

  // Tier 5 — O Abismo Primordial (Ato V): carne que não devia ser comida
  mat('carne', 5, 'carne-abissal', 'Naco Abissal', 'Carne de algo sem nome. Mastiga de volta, dizem.', 32),
  mat('carne', 5, 'carne-quimera', 'Costela de Quimera', 'Três sabores brigando no mesmo osso.', 34),
  mat('carne', 5, 'carne-eterna', 'Carne Eterna', 'Não estraga, não sacia, não acaba. Só alimenta o vazio.', 36),
  mat('carne', 5, 'carne-vazio', 'Vísceras do Vazio', 'O que sobra de algo que talvez nunca tenha comido nem sido comido.', 38),
  mat('carne', 5, 'carne-leviata', 'Posta de Leviatã', 'Um único corte alimenta uma aldeia. Se a aldeia tiver estômago.', 36),
  mat('carne', 5, 'carne-carnica-astral', 'Carniça Astral', 'Restos de algo que caiu do céu já morto. Ainda pulsa, às vezes.', 34),
];

// ── Verduras (folhas e talos comestíveis) ──────────────────────────────
const VERDURAS: MaterialDef[] = [
  // Tier 1 — Vales e bosques (Ato I): hortas e campos
  mat('verdura', 1, 'verdura-couve', 'Couve Silvestre', 'Folhas grossas que resistem à geada. Sempre há o que colher.', 3),
  mat('verdura', 1, 'verdura-repolho', 'Repolho', 'Cabeça densa e pálida. Enche a panela e o estômago.', 3),
  mat('verdura', 1, 'verdura-alface', 'Alface do Campo', 'Folhas tenras que murcham num piscar. Coma antes que o sol as pegue.', 3),
  mat('verdura', 1, 'verdura-espinafre', 'Espinafre', 'Verde-escuro e ferroso. Força de quem não come carne.', 4),
  mat('verdura', 1, 'verdura-agriao', 'Agrião', 'Cresce na beira das fontes. Pica a língua e limpa o sangue.', 4),
  mat('verdura', 1, 'verdura-nabica', 'Nabiça', 'Folha do nabo, amarga e teimosa. Comida de tempo magro.', 3),

  // Tier 2 — As Profundezas (Ato II): verduras que crescem sem sol
  mat('verdura', 2, 'verdura-folha-palida', 'Folha Pálida', 'Verdura que cresceu sem sol. Branca, mole e vagamente doente.', 8),
  mat('verdura', 2, 'verdura-broto-caverna', 'Broto de Caverna', 'Rebento cego que tateia a rocha. Crocante, se fechar os olhos.', 9),
  mat('verdura', 2, 'verdura-samambaia-negra', 'Samambaia Negra', 'Fronde escura que se enrola ao toque. Amarga e nutritiva.', 9),
  mat('verdura', 2, 'verdura-alga-subterranea', 'Alga Subterrânea', 'Filamentos que boiam em poços cegos. Salgados de mineral.', 10),
  mat('verdura', 2, 'verdura-cardo-fundo', 'Cardo das Profundezas', 'Espinhoso por fora, tenro por dentro. Exige faca e fé.', 11),
  mat('verdura', 2, 'verdura-liquen-comestivel', 'Líquen Comestível', 'Raspado da pedra úmida. Sabe a mofo e sobrevivência.', 8),

  // Tier 3 — O Mar Sem Sol (Ato III): verduras do mar
  mat('verdura', 3, 'verdura-alga-marinha', 'Alga Marinha', 'Fitas verdes que a maré entrega. Salgadas e cheias de força.', 14),
  mat('verdura', 3, 'verdura-kombu', 'Kombu Abissal', 'Lâmina escura e espessa do fundo. Engrossa qualquer caldo.', 16),
  mat('verdura', 3, 'verdura-salsa-marinha', 'Salsa-do-Mar', 'Folhinhas crocantes dos recifes. Frescor de sal na boca.', 15),
  mat('verdura', 3, 'verdura-couve-do-mar', 'Couve-do-Mar', 'Folhas carnudas que retêm água doce. Tesouro de náufrago.', 17),
  mat('verdura', 3, 'verdura-alface-oceano', 'Alface-do-Oceano', 'Fina e translúcida como papel molhado. Some na boca.', 16),

  // Tier 4 — As Veias de Fogo (Ato IV): verduras da cinza e do calor
  mat('verdura', 4, 'verdura-couve-cinza', 'Couve das Cinzas', 'Cresce no solo morno das encostas. Folha que ri do calor.', 22),
  mat('verdura', 4, 'verdura-broto-igneo', 'Broto de Rocha Ígnea', 'Rebento que só germina depois do fogo. Picante como brasa.', 24),
  mat('verdura', 4, 'verdura-cardo-fogo', 'Cardo Flamejante', 'Espinhos quentes e talo suculento. Cozinha a si mesmo.', 23),
  mat('verdura', 4, 'verdura-folha-carvao', 'Folha-Carvão', 'Negra e crocante, torrada pelo próprio ambiente. Amarga e forte.', 25),
  mat('verdura', 4, 'verdura-samambaia-brasa', 'Samambaia de Brasa', 'Fronde que reluz laranja nas bordas. Nunca esfria de todo.', 26),

  // Tier 5 — O Abismo Primordial (Ato V): verduras impossíveis
  mat('verdura', 5, 'verdura-folha-vazio', 'Folha do Vazio', 'Verde que não existe em lugar nenhum. Nutre e assombra.', 32),
  mat('verdura', 5, 'verdura-couve-eterna', 'Couve Eterna', 'Rebrota assim que colhida. Alimenta sem nunca acabar.', 34),
  mat('verdura', 5, 'verdura-broto-estelar', 'Broto Estelar', 'Germinou de uma semente caída do céu. Frio e luminoso.', 35),
  mat('verdura', 5, 'verdura-cardo-abissal', 'Cardo Abissal', 'Cresce onde não há terra nem luz. Come de volta quem o come.', 36),
  mat('verdura', 5, 'verdura-musgo-primordial', 'Musgo Primordial', 'Mais antigo que a fome. Verde de antes do primeiro verde.', 37),
];

// ── Frutas (frutos comestíveis) ────────────────────────────────────────
// Frutas reais. Tiers = do comum/farto ao exótico/raro (não seguem ato).
const FRUTAS: MaterialDef[] = [
  // Tier 1 — Comuns de pomar (fartas e baratas)
  mat('fruta', 1, 'fruta-maca', 'Maçã', 'Firme e ácida. A fruta que nunca falta na feira nem no bolso.', 3),
  mat('fruta', 1, 'fruta-pera', 'Pera', 'Doce e granulada. Amadurece rápido, apodrece mais rápido.', 3),
  mat('fruta', 1, 'fruta-uva', 'Uva', 'Cachos pequenos e azedos. Melhor fermentada que crua.', 4),
  mat('fruta', 1, 'fruta-figo', 'Figo', 'Mel por dentro, veludo por fora. Some da árvore num piscar.', 4),
  mat('fruta', 1, 'fruta-ameixa', 'Ameixa', 'Pele lisa e polpa suculenta. Doce que escurece os dedos.', 4),
  mat('fruta', 1, 'fruta-amora', 'Amora', 'Tinge os dedos de roxo. Os espinhos cobram o doce.', 3),
  mat('fruta', 1, 'fruta-cereja', 'Cereja', 'Rubra e translúcida. Doce com um fundo de amargo.', 5),

  // Tier 2 — Frutas vermelhas e de caroço
  mat('fruta', 2, 'fruta-morango', 'Morango', 'Vermelho e perfumado. Some da tigela antes de servir.', 8),
  mat('fruta', 2, 'fruta-framboesa', 'Framboesa', 'Delicada a ponto de esfarelar na mão. Azeda e cara por isso.', 11),
  mat('fruta', 2, 'fruta-mirtilo', 'Mirtilo', 'Bagas azuis de sabor discreto. Fartas nas encostas frias.', 9),
  mat('fruta', 2, 'fruta-groselha', 'Groselha', 'Ácida a ponto de arrepiar. Rende geleia e caretas.', 10),
  mat('fruta', 2, 'fruta-pessego', 'Pêssego', 'Pele aveludada, polpa que escorre. O verão numa mordida.', 11),
  mat('fruta', 2, 'fruta-damasco', 'Damasco', 'Alaranjado e meloso. Seco, atravessa o inverno.', 12),

  // Tier 3 — Cítricas e frutas de clima temperado prezadas
  mat('fruta', 3, 'fruta-laranja', 'Laranja', 'Gomos doces sob a casca grossa. Sol guardado pra depois.', 14),
  mat('fruta', 3, 'fruta-limao', 'Limão', 'Azedo de fechar o olho. Tempera, conserva e cura escorbuto.', 13),
  mat('fruta', 3, 'fruta-roma', 'Romã', 'Cheia de sementes rubras que tingem a mão apressada.', 16),
  mat('fruta', 3, 'fruta-marmelo', 'Marmelo', 'Duro e áspero cru; vira ouro em compota.', 15),
  mat('fruta', 3, 'fruta-tamara', 'Tâmara', 'Escura e melíflua. Um punhado sustenta uma travessia.', 17),
  mat('fruta', 3, 'fruta-melao', 'Melão', 'Pesado e aguado. Doce recompensa do calor.', 15),

  // Tier 4 — Tropicais (exóticas, de terras quentes e distantes)
  mat('fruta', 4, 'fruta-banana', 'Banana', 'Curva e macia, energia de marujo. Vem de terras quentes.', 22),
  mat('fruta', 4, 'fruta-coco', 'Coco', 'Casca dura, água doce dentro. Presente de praia distante.', 24),
  mat('fruta', 4, 'fruta-manga', 'Manga', 'Doce e fibrosa, escorre pelo queixo. Vale a sujeira.', 24),
  mat('fruta', 4, 'fruta-abacaxi', 'Abacaxi', 'Coroa espinhosa, polpa dourada. Corta a língua e a sede.', 26),
  mat('fruta', 4, 'fruta-mamao', 'Mamão', 'Polpa alaranjada e mole. Doce discreto de terra quente.', 23),

  // Tier 5 — Raras e cobiçadas
  mat('fruta', 5, 'fruta-lichia', 'Lichia', 'Casca rugosa, polpa translúcida e perfumada. Rara e cobiçada.', 34),
  mat('fruta', 5, 'fruta-caqui', 'Caqui', 'Doce como mel maduro — ou amarra a boca toda se colher cedo.', 33),
  mat('fruta', 5, 'fruta-maracuja', 'Maracujá', 'Azedo e aromático sob a casca enrugada. Acalma quem o come.', 35),
  mat('fruta', 5, 'fruta-carambola', 'Carambola', 'Vira estrela amarela quando fatiada. Bonita, azeda, incomum.', 37),
  mat('fruta', 5, 'fruta-tamarindo', 'Tamarindo', 'Vagem azeda que faz a boca fechar. Tempera e refresca.', 32),
];

const ALL_MATERIALS: MaterialDef[] = [...ERVAS, ...MINERIOS, ...COUROS, ...TECIDOS, ...CARNES, ...VERDURAS, ...FRUTAS];

export const MATERIALS: Record<string, MaterialDef> = Object.fromEntries(
  ALL_MATERIALS.map((d) => [d.item.id, d]),
);

/** Lookup por id — retorna item completo (cópia, com stack: 1) ou null. */
export function getMaterial(id: string): Item | null {
  const def = MATERIALS[id];
  return def ? { ...def.item } : null;
}

/** Constrói um stack do material com a quantidade indicada. */
export function makeMaterialStack(id: string, count: number): Item | null {
  const item = getMaterial(id);
  if (!item) return null;
  return { ...item, stack: count };
}

/** Nome humano do material — usado em UIs (CraftPane, etc.) */
export function getMaterialName(id: string): string {
  return MATERIALS[id]?.item.name ?? id;
}

/** Tipo do material (ou null se não for material). */
export function getMaterialType(id: string): MaterialType | null {
  return MATERIALS[id]?.type ?? null;
}

/** Classificação pra tooltip/card: "Reagente de Criação · Erva" (ou null). */
export function getMaterialCategoryLabel(id: string): string | null {
  const type = getMaterialType(id);
  return type ? `${REAGENT_GROUP_LABEL} · ${MATERIAL_TYPE_SINGULAR[type]}` : null;
}
