import styles from './CodexView.module.css';

interface RarityTier {
  id: 'comum' | 'magico' | 'raro';
  name: string;
  altName: string;
  colorClass: string;
  affixRange: string;
  affixHint: string;
  description: string;
  rules: string[];
}

const RARITY_TIERS: RarityTier[] = [
  {
    id: 'comum',
    name: 'Comum',
    altName: 'Base / Branco',
    colorClass: 'rarity_comum',
    affixRange: '0 afixos',
    affixHint: 'Apenas valores base do item',
    description:
      'O item sem afixos aleatórios — carrega apenas os atributos intrínsecos da sua base. É o ponto de partida: previsível, sem desvios. Vale como matéria-prima e como referência pra entender o que cada tipo de item oferece "limpo".',
    rules: [
      'Botas exibem só Armadura ou Esquiva (depende da base).',
      'Armas exibem só Dano (mín–máx), Velocidade de Ataque e a Chance de Crítico base de 5% comum a todas.',
      'Anéis e amuletos têm mods inerentes à base — ex: Anel de Rubi traz Resistência ao Fogo, Anel de Safira traz Resistência ao Gelo.',
      'Esses valores não são afixos rolados — eles são o item.',
    ],
  },
  {
    id: 'magico',
    name: 'Mágico',
    altName: 'Azul Claro',
    colorClass: 'rarity_magico',
    affixRange: 'Até 2 afixos',
    affixHint: 'Prefixo e/ou sufixo, sorteados ao gerar',
    description:
      'O primeiro tier com afixos. Pode receber até dois mods sorteados aleatoriamente — qualquer combinação de prefixo e sufixo (dois prefixos, dois sufixos, ou um de cada).',
    rules: [
      'Mantém os mods base do tier Comum.',
      'Adiciona até 2 afixos sorteados da lista mestra.',
      'Cada afixo é independente — pode rolar prefixo, sufixo ou um de cada.',
    ],
  },
  {
    id: 'raro',
    name: 'Raro',
    altName: 'Amarelo Claro',
    colorClass: 'rarity_raro',
    affixRange: '3 a 6 afixos',
    affixHint: 'Mistura livre de prefixos e sufixos',
    description:
      'O tier mais flexível e poderoso entre os comuns. Tem entre três e seis afixos rolados, em qualquer combinação. É onde builds começam a se diferenciar de verdade.',
    rules: [
      'Mantém os mods base do tier Comum.',
      'Quantidade total de afixos varia entre 3 e 6 (sorteado por item).',
      'Cada slot é independente — pode rolar como prefixo ou sufixo.',
    ],
  },
];

/** Guia de raridade — ensina regras de geração de itens (Códice). */
export function RarityGuide() {
  return (
    <>
      <header className={styles.intro}>
        <h2 className={styles.introTitle}>Raridade</h2>
        <p className={styles.introText}>
          A raridade define quantos afixos um item pode receber ao ser gerado. Cada tier sobe sobre o anterior — Comum vira Mágico ao ganhar afixos, Mágico vira Raro ao ganhar mais. <strong>Limite global:</strong> nenhum item pode ter mais de 3 prefixos ou 3 sufixos, mesmo nos tiers mais altos.
        </p>
      </header>

      <div className={styles.rarityList}>
        {RARITY_TIERS.map((tier) => (
          <article key={tier.id} className={styles.rarityCard}>
            <header className={styles.rarityCardHeader}>
              <div className={styles.rarityNames}>
                <h3 className={`${styles.rarityName} ${styles[tier.colorClass]}`}>{tier.name}</h3>
                <span className={styles.rarityAlt}>{tier.altName}</span>
              </div>
              <div className={styles.rarityRange}>
                <span className={`${styles.rarityRangeValue} ${styles[tier.colorClass]}`}>
                  {tier.affixRange}
                </span>
                <span className={styles.rarityRangeHint}>{tier.affixHint}</span>
              </div>
            </header>

            <p className={styles.rarityDesc}>{tier.description}</p>

            <ul className={styles.rarityRules}>
              {tier.rules.map((rule, i) => (
                <li key={i} className={styles.rarityRule}>
                  <span className={styles.rarityRuleBullet}>·</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <footer className={styles.rarityFooter}>
        <div className={styles.rarityFooterTitle}>Limite de afixos por item</div>
        <p className={styles.rarityFooterText}>
          Independente do tier, um item nunca terá mais de <strong>3 prefixos</strong> ou <strong>3 sufixos</strong>. Em itens Raros com 6 afixos, isso significa exatamente 3 de cada — qualquer outra distribuição (ex: 4 prefixos + 2 sufixos) é inválida.
        </p>
      </footer>
    </>
  );
}
