import styles from './CodexView.module.css';

interface AtlasConcept {
  id: string;
  name: string;
  tag: string;
  description: string;
  rules: string[];
}

const CONCEPTS: AtlasConcept[] = [
  {
    id: 'desbloqueio',
    name: 'Desbloqueio',
    tag: 'Nível 100',
    description:
      'O Atlas de Mapas é o endgame — abre ao atingir o nível máximo. Como não há mais XP a ganhar, a progressão vira horizontal: você caça equipamento melhor e sobe tiers de mapa, não níveis.',
    rules: [
      'A aba fica bloqueada até o nível 100.',
      'Inimigos de expedição são nível 100 ou mais — não dão XP relevante.',
      'A recompensa é loot procedural, ouro e novos mapas.',
    ],
  },
  {
    id: 'dispositivo',
    name: 'Dispositivo & Estoque',
    tag: 'Forjar T1',
    description:
      'O Dispositivo forja um mapa de Tier 1 por um custo em ouro — a semente do Atlas. Mapas ficam num estoque próprio (não no inventário de 36 slots) e são consumíveis: cada expedição gasta um.',
    rules: [
      'Forjar um mapa T1 custa ouro e sempre está disponível.',
      'Tiers acima de 1 vêm de drops de chefe, não da forja.',
      'Abrir, morrer ou fugir de uma expedição consome o mapa.',
    ],
  },
  {
    id: 'expedicao',
    name: 'Expedição',
    tag: 'Ondas + Chefe',
    description:
      'Cada mapa é uma sequência de lutas 1v1: várias ondas de criaturas e, no fim, um chefe. O detalhe cruel: não há cura entre as lutas. A vida e a mana que sobram de uma onda seguem pra próxima.',
    rules: [
      'Sem cura entre ondas — só regeneração, roubo de vida/mana e habilidades sustentam.',
      'Vencer o chefe restaura os vitais e entrega as recompensas.',
      'Morrer devolve você a Pedragal, restaurado, mas o mapa se perde.',
    ],
  },
  {
    id: 'afixos',
    name: 'Afixos de Mapa',
    tag: 'Perigo × Recompensa',
    description:
      'Mapas de tier mais alto vêm com mais afixos. Cada afixo é uma troca: aumenta o perigo (mais Vida, Dano, Velocidade ou Crítico dos inimigos) ou a recompensa (mais Quantidade e Raridade de itens).',
    rules: [
      'Afixos de perigo multiplicam os stats de TODAS as criaturas, chefe incluso.',
      'Afixos de recompensa aumentam a quantidade e a raridade do loot final.',
      'A quantidade de afixos cresce com o tier do mapa.',
    ],
  },
  {
    id: 'tiers',
    name: 'Tiers & Loot',
    tag: 'Escalada horizontal',
    description:
      'O tier define o nível dos inimigos e a qualidade do loot. Chefes dropam mapas de tier igual ou superior — é assim que você sustenta o estoque e escala. O item gerado é totalmente procedural: base + afixos rolados.',
    rules: [
      'Nível dos inimigos sobe com o tier (começa em 100).',
      'Loot é gerado na hora — base compatível + prefixos e sufixos com valores reais.',
      'Concluir um tier registra seu recorde de maior tier vencido.',
    ],
  },
];

/** Guia do Atlas de Mapas — explica o loop de endgame (Códice). */
export function AtlasGuide() {
  return (
    <>
      <header className={styles.intro}>
        <h2 className={styles.introTitle}>Atlas de Mapas</h2>
        <p className={styles.introText}>
          O sistema de endgame. Ao chegar ao nível 100, a progressão deixa de ser vertical (níveis) e vira horizontal: você forja e corre <strong>mapas</strong> — expedições de ondas e chefe — atrás de loot procedural e tiers cada vez mais altos. Cada mapa é um ingresso de uso único.
        </p>
      </header>

      <div className={styles.rarityList}>
        {CONCEPTS.map((c) => (
          <article key={c.id} className={styles.rarityCard}>
            <header className={styles.rarityCardHeader}>
              <div className={styles.rarityNames}>
                <h3 className={styles.rarityName}>{c.name}</h3>
              </div>
              <div className={styles.rarityRange}>
                <span className={styles.rarityRangeValue}>{c.tag}</span>
              </div>
            </header>

            <p className={styles.rarityDesc}>{c.description}</p>

            <ul className={styles.rarityRules}>
              {c.rules.map((rule, i) => (
                <li key={i} className={styles.rarityRule}>
                  <span className={styles.rarityRuleBullet}>·</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}
