import styles from './CodexView.module.css';

interface RarityTier {
  id: 'comum' | 'magico' | 'raro' | 'unico' | 'lendario';
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
    affixHint: 'Apenas os stats inerentes da base',
    description:
      'O item "limpo" — carrega só o que a base oferece, sem nenhum afixo sorteado. É a referência pra entender o que cada tipo de item faz, e a matéria-prima do craft.',
    rules: [
      'Armas exibem o que a base define: Dano (mín–máx), Velocidade de Ataque e Chance de Crítico.',
      'Armaduras exibem o stat do seu tipo defensivo: Armadura, Evasão, Escudo de Energia ou híbridos.',
      'Anéis, amuletos, cintos e aljavas têm um implícito da base — ex: Anel de Rubi dá Resistência ao Fogo.',
      'Esses valores não são afixos — eles são o item, e escalam com o nível requerido da base.',
    ],
  },
  {
    id: 'magico',
    name: 'Mágico',
    altName: 'Azul Claro',
    colorClass: 'rarity_magico',
    affixRange: '1 a 2 afixos',
    affixHint: 'Prefixo e/ou sufixo, sorteados ao gerar',
    description:
      'O primeiro tier com afixos. Recebe um ou dois mods sorteados da lista mestra — no máximo 1 prefixo e 1 sufixo. O nome do item reflete o que rolou: prefixo antes da base, sufixo depois ("do/da").',
    rules: [
      'Mantém os stats inerentes da base (tier Comum).',
      'Adiciona 1 a 2 afixos sorteados da lista mestra.',
      'Máximo de 1 prefixo e 1 sufixo — nunca dois do mesmo lado.',
      'O tier de cada afixo é limitado pelo Nível do Item (ver rodapé).',
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
      'O topo da geração aleatória. Tem entre três e seis afixos rolados, em qualquer combinação dentro dos limites. É onde builds se diferenciam de verdade — e onde a caça por um bom roll acontece.',
    rules: [
      'Mantém os stats inerentes da base (tier Comum).',
      'Quantidade total de afixos varia entre 3 e 6 (sorteada por item).',
      'Limite de 3 prefixos e 3 sufixos — um Raro de 6 afixos é exatamente 3 + 3.',
      'O tier de cada afixo é limitado pelo Nível do Item (ver rodapé).',
    ],
  },
  {
    id: 'unico',
    name: 'Único',
    altName: 'Tussock',
    colorClass: 'rarity_unico',
    affixRange: 'Mods fixos',
    affixHint: 'Curados à mão, não sorteados',
    description:
      'Itens com identidade própria: nome, flavor e mods definidos à mão, sempre os mesmos. Um Único não rola afixos da lista mestra — o que varia entre dois exemplares é apenas o valor dentro dos ranges fixos de cada mod.',
    rules: [
      'Conjunto de mods fixo e curado — não usa o sorteio de prefixos/sufixos.',
      'Cada mod tem seu próprio range de rolagem, independente dos tiers da lista mestra.',
      'Pode quebrar convenções (ex: um mod que não existe como afixo).',
      'Ainda sem exemplares na database — os primeiros Únicos entram com o gerador de itens.',
    ],
  },
  {
    id: 'lendario',
    name: 'Lendário',
    altName: 'Lavanda',
    colorClass: 'rarity_lendario',
    affixRange: 'Mods fixos + especial',
    affixHint: 'Efeito que muda regras de jogo',
    description:
      'O tier máximo. Como o Único, tem mods fixos curados — mas carrega além disso um efeito especial que altera uma regra do jogo (uma mecânica nova, uma conversão, uma exceção). Raríssimos por definição.',
    rules: [
      'Tudo que vale pro Único vale aqui.',
      'Adiciona um efeito especial único — algo que nenhum afixo comum replica.',
      'Pensados como chase items: definem ou destravam builds inteiras.',
      'Ainda sem exemplares na database — entram depois dos Únicos.',
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
          A raridade define <strong>quantos</strong> afixos um item pode receber ao ser gerado — de Comum (nenhum) a Raro (até 6), com Único e Lendário fora do sorteio, usando mods curados. Já a <strong>qualidade</strong> de cada afixo (o tier) não depende da raridade: depende do Nível do Item.
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
          Cada raridade tem seu cap por categoria: Mágico aceita no máximo <strong>1 prefixo + 1 sufixo</strong>; Raro, no máximo <strong>3 prefixos + 3 sufixos</strong> — um Raro de 6 afixos é exatamente 3 de cada.
        </p>
      </footer>

      <footer className={styles.rarityFooter}>
        <div className={styles.rarityFooterTitle}>Tiers de afixo e Nível do Item</div>
        <p className={styles.rarityFooterText}>
          Cada afixo tem uma escada de tiers (T1 fraco → T-máx forte) com ranges próprios — a lista completa está em <strong>Mods de Item</strong>. O <strong>Nível do Item</strong> define o teto: é igual ao nível do monstro que o dropou (drop de monstro nível 35 = item nível 35), e tiers acima dele não rolam. Dentro dos elegíveis o sorteio tem peso: <strong>cada tier acima é 2× mais raro</strong> que o anterior — rolar o tier máximo é sempre raro, mesmo em item de nível alto. O requisito de nível pra equipar (da base) é independente disso.
        </p>
      </footer>
    </>
  );
}
