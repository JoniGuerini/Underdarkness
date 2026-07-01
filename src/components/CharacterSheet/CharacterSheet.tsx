import type { ReactNode } from 'react';
import type { Character } from '../../types';
import { computeDerivedStatsWithSources } from '../../lib/stats';
import { StatLine, Unit, Mod, TooltipLine, TooltipMeta } from '../StatLine/StatLine';
import { VitalBar } from '../VitalBar/VitalBar';
import styles from './CharacterSheet.module.css';

interface CharacterSheetProps {
  character: Character;
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

interface ColumnProps {
  title: string;
  children: ReactNode;
}

function Column({ title, children }: ColumnProps) {
  return (
    <div className={styles.col}>
      <h2 className={styles.colTitle}>{title}</h2>
      {children}
    </div>
  );
}

export function CharacterSheet({ character }: CharacterSheetProps) {
  const c = character;
  const { stats: s, sources } = computeDerivedStatsWithSources(c);
  const resCap = <Unit> / {s.resistMax}%</Unit>;

  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        <Column title="Recursos">
          <Section title="Vitais">
            {/* Escudo de Energia sobrepõe a barra de vida (ES ÷ Vida Máx) */}
            <VitalBar label="Vida" current={c.vidaAtual} max={c.vidaMax} kind="vida" overlayCurrent={c.esAtual} />
            <VitalBar label="Mana" current={c.manaAtual} max={c.manaMax} kind="mana" />
            <VitalBar label="Exp" current={c.xp} max={c.xpNext} kind="exp" />
            {s.escudoEnergia > 0 && (
              <StatLine
                name="Escudo de Energia"
                value={s.escudoEnergia}
                color="energia"
                breakdown={sources.escudoEnergia}
                tooltip={
                  <>
                    <TooltipLine>
                      Vital arcano — todo dano recebido consome o Escudo <em>antes</em> da Vida. Aparece sobreposto à barra de vida, proporcional à Vida Máxima.
                    </TooltipLine>
                    <TooltipLine>
                      Zero base — vem de itens com <Mod color="energia">Escudo de Energia</Mod>. Restaura por completo ao fim de cada combate.
                    </TooltipLine>
                  </>
                }
              />
            )}
          </Section>

          <Section title="Atributos">
            <StatLine
              name="Força"
              value={s.forca}
              color="forca"
              breakdown={sources.forca}
              tooltip={
                <>
                  <TooltipLine>Atributo primário.</TooltipLine>
                  <TooltipLine>
                    Cada ponto de Força aumenta o <Mod color="fisico">Dano Físico</Mod> em <Mod color="forca">+1% multiplicativo</Mod> (aplicado sobre o min e o max da arma).
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Agilidade"
              value={s.agilidade}
              color="agilidade"
              breakdown={sources.agilidade}
              tooltip={
                <>
                  <TooltipLine>Atributo primário.</TooltipLine>
                  <TooltipLine>
                    Cada ponto de Agilidade dá <Mod color="agilidade">+2 Esquiva</Mod> e <Mod color="agilidade">+2 Evasão</Mod>.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Intelecto"
              value={s.intelecto}
              color="intelecto"
              breakdown={sources.intelecto}
              tooltip={
                <>
                  <TooltipLine>Atributo primário.</TooltipLine>
                  <TooltipLine>
                    Cada ponto de Intelecto dá <Mod color="mana">+5 Mana Máxima</Mod>.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Regeneração">
            <StatLine
              name="Regeneração de Vida"
              value={<>{s.regenVida}<Unit> /s</Unit></>}
              color="vida"
              breakdown={sources.regenVida}
              tooltip={
                <>
                  <TooltipLine>
                    Recupera <Mod color="vida">{s.regenVida} de Vida</Mod> por segundo — fora e dentro do combate.
                  </TooltipLine>
                  <TooltipLine>
                    Sem contribuição de classe ou atributo — só itens com o afixo correspondente.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Regeneração de Mana"
              value={<>{s.regenMana}<Unit> /s</Unit></>}
              color="mana"
              breakdown={sources.regenMana}
              tooltip={
                <>
                  <TooltipLine>
                    Recupera <Mod color="mana">{s.regenMana} de Mana</Mod> por segundo — fora e dentro do combate.
                  </TooltipLine>
                  <TooltipLine>
                    Sem contribuição de classe ou atributo — só itens com o afixo correspondente.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Magia">
            <StatLine
              name="Dano de Magias"
              value={`${s.pctDmgMagia}%`}
              color="intelecto"
              breakdown={sources.pctDmgMagia}
              tooltip={
                <>
                  Aumenta o dano de todas as magias em percentual.
                </>
              }
            />
            <StatLine
              name="Dano de Magias de Fogo"
              value={`${s.pctDmgFogoMagia}%`}
              color="fogo"
              breakdown={sources.pctDmgFogoMagia}
              tooltip={
                <>
                  Aumenta o dano de magias de <Mod color="fogo">Fogo</Mod> — soma com Dano de Magias.
                </>
              }
            />
            <StatLine
              name="Dano de Magias de Gelo"
              value={`${s.pctDmgGeloMagia}%`}
              color="gelo"
              breakdown={sources.pctDmgGeloMagia}
              tooltip={
                <>
                  Aumenta o dano de magias de <Mod color="gelo">Gelo</Mod> — soma com Dano de Magias.
                </>
              }
            />
            <StatLine
              name="Dano de Magias de Raio"
              value={`${s.pctDmgRaioMagia}%`}
              color="raio"
              breakdown={sources.pctDmgRaioMagia}
              tooltip={
                <>
                  Aumenta o dano de magias de <Mod color="raio">Raio</Mod> — soma com Dano de Magias.
                </>
              }
            />
            <StatLine
              name="Dano de Magias de Caos"
              value={`${s.pctDmgCaosMagia}%`}
              color="caos"
              breakdown={sources.pctDmgCaosMagia}
              tooltip={
                <>
                  Aumenta o dano de magias de <Mod color="caos">Caos</Mod> — soma com Dano de Magias.
                </>
              }
            />
            <StatLine
              name="Dano de Magias Sagradas"
              value={`${s.pctDmgSagradoMagia}%`}
              color="sagrado"
              breakdown={sources.pctDmgSagradoMagia}
              tooltip={
                <>
                  Aumenta o dano de magias <Mod color="sagrado">Sagradas</Mod> — soma com Dano de Magias.
                </>
              }
            />
            <StatLine
              name="Eficiência de Mana"
              value={`${s.eficienciaMana}%`}
              color="mana"
              breakdown={sources.eficienciaMana}
              tooltip={
                <>
                  <TooltipLine>
                    Reduz em % o custo de <Mod color="mana">Mana</Mod> de habilidades e magias.
                  </TooltipLine>
                  <TooltipLine>
                    Ex.: 20% em uma magia de 100 mana → custa 80. Zero base — só itens.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: 95%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Redução do Tempo de Conjuração"
              value={`${s.reducaoTempoConjuracao}%`}
              color="intelecto"
              breakdown={sources.reducaoTempoConjuracao}
              tooltip={
                <>
                  <TooltipLine>
                    Reduz em % o tempo em segundos para conjurar magias — armas e feitiços.
                  </TooltipLine>
                  <TooltipLine>
                    Ex.: magia de 2,0s com 25% → 1,5s. Zero base — só itens.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: 95%</TooltipMeta>
                </>
              }
            />
          </Section>
        </Column>

        <Column title="Ofensivo">
          <Section title="Dano Total">
            <StatLine
              name="Dano Total"
              value={`${s.danoTotalMin} — ${s.danoTotalMax}`}
              breakdown={sources.danoTotalMin}
              tooltip={
                <>
                  Soma de <Mod color="fisico">Físico</Mod>, <Mod color="fogo">Fogo</Mod>, <Mod color="gelo">Gelo</Mod>, <Mod color="raio">Raio</Mod> e <Mod color="caos">Caos</Mod> aplicados por golpe.
                </>
              }
            />
            <StatLine
              name="Dano Por Segundo"
              value={s.dps.toFixed(1)}
              breakdown={sources.dps}
              tooltip={
                <>
                  Dano por segundo médio considerando o Dano Total, o <Mod color="agilidade">Tempo de Ataque</Mod> e a <Mod color="critico">Chance de Crítico</Mod>.
                </>
              }
            />
          </Section>

          <Section title="Dano Físico">
            <StatLine
              name="Dano Físico"
              value={`${s.danoFisicoMin} — ${s.danoFisicoMax}`}
              color="fisico"
              breakdown={sources.danoFisicoMin}
              tooltip={
                <>
                  <TooltipLine>
                    Dano de impacto/corte aplicado por golpe corpo a corpo.
                  </TooltipLine>
                  <TooltipLine>
                    A <Mod color="fisico">Armadura</Mod> do alvo reduz esse dano pela fração <em>armadura ÷ (armadura + 10 × dano)</em> — forte contra golpes fracos, fraca contra golpes pesados.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Dano no Ataque">
            <StatLine
              name="Dano de Fogo"
              value={s.danoFogo}
              color="fogo"
              breakdown={sources.danoFogo}
              tooltip={
                <>
                  <TooltipLine>
                    <Mod color="fogo">Fogo</Mod> por golpe em ataque básico e habilidade física.
                  </TooltipLine>
                  <TooltipLine>
                    Não afeta magias — para isso use <em>Dano de Magias de Fogo</em>.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Dano de Gelo"
              value={s.danoGelo}
              color="gelo"
              breakdown={sources.danoGelo}
              tooltip={
                <>
                  <TooltipLine>
                    <Mod color="gelo">Gelo</Mod> por golpe em ataques que não são magia.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Dano de Raio"
              value={s.danoRaio}
              color="raio"
              breakdown={sources.danoRaio}
              tooltip={
                <>
                  <TooltipLine>
                    <Mod color="raio">Raio</Mod> por golpe em ataques que não são magia.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Dano Caos">
            <StatLine
              name="Dano de Caos"
              value={s.danoCaos}
              color="caos"
              breakdown={sources.danoCaos}
              tooltip={
                <>
                  <TooltipLine>
                    <Mod color="caos">Caos</Mod> por golpe em ataques que não são magia — ignora armadura.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Dano Sagrado">
            <StatLine
              name="Dano Sagrado"
              value={s.danoSagrado}
              color="sagrado"
              breakdown={sources.danoSagrado}
              tooltip={
                <>
                  <TooltipLine>
                    <Mod color="sagrado">Sagrado</Mod> por golpe em ataques que não são magia.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Velocidade">
            <StatLine
              name="Tempo de Ataque"
              value={<>{s.velAtaque.toFixed(1)}<Unit> s</Unit></>}
              color="agilidade"
              breakdown={sources.velAtaque}
              tooltip={
                <>
                  <TooltipLine>
                    Segundos entre cada ataque básico automático no combate — quanto menor, mais rápido.
                  </TooltipLine>
                  <TooltipLine>
                    Bônus de <Mod color="agilidade">% de Velocidade de Ataque</Mod> reduzem esse tempo. Também alimenta o <Mod color="critico">Dano Por Segundo</Mod> teórico na ficha.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Precisão">
            <StatLine
              name="Acerto"
              value={s.acerto}
              color="agilidade"
              breakdown={sources.acerto}
              tooltip={
                <>
                  <TooltipLine>
                    Chance de conectar um ataque físico contra a <Mod color="agilidade">Evasão</Mod> do alvo.
                  </TooltipLine>
                  <TooltipLine>
                    Fórmula: <em>Acerto ÷ (Acerto + Evasão)</em>, entre 5% e 95%. Se conectar, o dano é aplicado.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Crítico">
            <StatLine
              name="Chance de Crítico"
              value={`${s.chanceCritico.toFixed(1)}%`}
              color="critico"
              breakdown={sources.chanceCritico}
              tooltip={
                <>
                  <TooltipLine>
                    Chance de um golpe físico que conectou ser <Mod color="critico">Crítico</Mod>.
                  </TooltipLine>
                  <TooltipLine>
                    O <Mod color="critico">Multiplicador</Mod> aplica no dano rolado <em>antes</em> da Armadura do alvo.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: 100%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Multiplicador de Crítico"
              value={`×${s.multCritico.toFixed(2)}`}
              color="critico"
              breakdown={sources.multCritico}
              tooltip={
                <>
                  <TooltipLine>
                    Multiplica o dano do golpe inteiro em um <Mod color="critico">Golpe Crítico</Mod> (físico ou magia).
                  </TooltipLine>
                  <TooltipLine>
                    Aplica <em>antes</em> da mitigação do alvo (Armadura / Res. Física).
                  </TooltipLine>
                  <TooltipMeta>Base: ×1,5 · Ladino: +0,2</TooltipMeta>
                </>
              }
            />
          </Section>

          <Section title="Penetração">
            <StatLine
              name="Penetração de Fogo"
              value={`${s.penFogo}%`}
              color="fogo"
              breakdown={sources.penFogo}
              tooltip={
                <>
                  <TooltipLine>
                    Ignora parte da <Mod color="fogo">Resistência ao Fogo</Mod> do alvo.
                  </TooltipLine>
                  <TooltipLine>
                    Ex.: 20% de pen. contra 20% de res. do alvo → ele não resiste ao fogo.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Penetração de Gelo"
              value={`${s.penGelo}%`}
              color="gelo"
              breakdown={sources.penGelo}
              tooltip={
                <>
                  <TooltipLine>
                    Ignora parte da <Mod color="gelo">Resistência ao Gelo</Mod> do alvo.
                  </TooltipLine>
                  <TooltipLine>
                    Ex.: 20% de pen. contra 20% de res. → res. efetiva zero.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Penetração de Raio"
              value={`${s.penRaio}%`}
              color="raio"
              breakdown={sources.penRaio}
              tooltip={
                <>
                  <TooltipLine>
                    Ignora parte da <Mod color="raio">Resistência ao Raio</Mod> do alvo.
                  </TooltipLine>
                  <TooltipLine>
                    Ex.: 20% de pen. contra 20% de res. → res. efetiva zero.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Penetração de Caos"
              value={`${s.penCaos}%`}
              color="caos"
              breakdown={sources.penCaos}
              tooltip={
                <>
                  <TooltipLine>
                    Ignora parte da <Mod color="caos">Resistência ao Caos</Mod> do alvo.
                  </TooltipLine>
                  <TooltipLine>
                    Ex.: 20% de pen. contra 20% de res. → res. efetiva zero.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Penetração de Sagrado"
              value={`${s.penSagrado}%`}
              color="sagrado"
              breakdown={sources.penSagrado}
              tooltip={
                <>
                  <TooltipLine>
                    Ignora parte da <Mod color="sagrado">Resistência ao Sagrado</Mod> do alvo.
                  </TooltipLine>
                  <TooltipLine>
                    Ex.: 20% de pen. contra 20% de res. → res. efetiva zero.
                  </TooltipLine>
                </>
              }
            />
          </Section>
        </Column>

        <Column title="Defensivo">
          <Section title="Mitigação">
            <StatLine
              name="Armadura"
              value={s.armadura}
              color="fisico"
              breakdown={sources.armadura}
              tooltip={
                <>
                  <TooltipLine>
                    Reduz o <Mod color="fisico">Dano Físico</Mod> recebido — primeira camada de mitigação.
                  </TooltipLine>
                  <TooltipLine>
                    Eficácia varia conforme o tamanho do golpe — funciona melhor contra muitos ataques pequenos do que contra um único golpe massivo.
                  </TooltipLine>
                  <TooltipLine>
                    <Mod color="fisico">Resistência Física</Mod> % aplica em seguida sobre o restante.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Evasão"
              value={s.evasao}
              color="agilidade"
              breakdown={sources.evasao}
              tooltip={
                <>
                  <TooltipLine>
                    Chance de evitar completamente um ataque físico inimigo.
                  </TooltipLine>
                  <TooltipLine>
                    Comparada ao <Mod color="agilidade">Acerto</Mod> do agressor — fórmula: <em>Acerto ÷ (Acerto + Evasão)</em>, entre 5% e 95%.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Chance de Bloqueio"
              value={<>{s.bloqueio}%<Unit> / {s.blockMax}%</Unit></>}
              color="fisico"
              breakdown={sources.bloqueio}
              tooltip={
                <>
                  <TooltipLine>
                    Chance de anular 100% de um ataque físico que já conectou — após Acerto vs Evasão.
                  </TooltipLine>
                  <TooltipLine>
                    Crítico e mitigação não aplicam se bloquear.
                  </TooltipLine>
                  <TooltipMeta>Requer escudo equipado · Limite: {s.blockMax}%</TooltipMeta>
                </>
              }
            />
          </Section>

          <Section title="Resistências">
            <StatLine
              name="Resistência ao Fogo"
              value={<>{s.resFogo}%{resCap}</>}
              color="fogo"
              breakdown={sources.resFogo}
              tooltip={
                <>
                  <TooltipLine>
                    Reduz dano de <Mod color="fogo">Fogo</Mod> recebido — só itens.
                  </TooltipLine>
                  <TooltipLine>
                    Penetração do atacante ignora parte desta resistência antes do cálculo.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência ao Gelo"
              value={<>{s.resGelo}%{resCap}</>}
              color="gelo"
              breakdown={sources.resGelo}
              tooltip={
                <>
                  <TooltipLine>
                    Reduz dano de <Mod color="gelo">Gelo</Mod> recebido — só itens.
                  </TooltipLine>
                  <TooltipLine>
                    Penetração do atacante ignora parte desta resistência antes do cálculo.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência ao Raio"
              value={<>{s.resRaio}%{resCap}</>}
              color="raio"
              breakdown={sources.resRaio}
              tooltip={
                <>
                  <TooltipLine>
                    Reduz dano de <Mod color="raio">Raio</Mod> recebido — só itens.
                  </TooltipLine>
                  <TooltipLine>
                    Penetração do atacante ignora parte desta resistência antes do cálculo.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência ao Caos"
              value={<>{s.resCaos}%{resCap}</>}
              color="caos"
              breakdown={sources.resCaos}
              tooltip={
                <>
                  <TooltipLine>
                    Reduz dano de <Mod color="caos">Caos</Mod> recebido — só itens.
                  </TooltipLine>
                  <TooltipLine>
                    Penetração do atacante ignora parte desta resistência antes do cálculo.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência ao Sagrado"
              value={<>{s.resSagrado}%{resCap}</>}
              color="sagrado"
              breakdown={sources.resSagrado}
              tooltip={
                <>
                  <TooltipLine>
                    Reduz dano de <Mod color="sagrado">Sagrado</Mod> recebido — só itens.
                  </TooltipLine>
                  <TooltipLine>
                    Penetração do atacante ignora parte desta resistência antes do cálculo.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência Física"
              value={<>{s.resFisico}%{resCap}</>}
              color="fisico"
              breakdown={sources.resFisico}
              tooltip={
                <>
                  <TooltipLine>
                    Diminui o <Mod color="fisico">Dano Físico</Mod> recebido em percentual — só itens.
                  </TooltipLine>
                  <TooltipLine>
                    Aplica <em>depois</em> da <Mod color="fisico">Armadura</Mod> sobre o dano restante.
                  </TooltipLine>
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
          </Section>

          <Section title="Roubo">
            <StatLine
              name="Roubo de Vida"
              value={`${s.rouboVida}%`}
              color="vida"
              breakdown={sources.rouboVida}
              tooltip={
                <>
                  <TooltipLine>
                    Recupera % do dano <em>efetivo</em> causado ao alvo (após armadura dele).
                  </TooltipLine>
                  <TooltipLine>
                    Só itens. Sem dano = sem roubo. Overkill não conta.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Roubo de Mana"
              value={`${s.rouboMana}%`}
              color="mana"
              breakdown={sources.rouboMana}
              tooltip={
                <>
                  <TooltipLine>
                    Recupera % do dano <em>efetivo</em> causado ao alvo (após armadura dele).
                  </TooltipLine>
                  <TooltipLine>
                    Só itens. Sem dano = sem roubo. Overkill não conta.
                  </TooltipLine>
                </>
              }
            />
          </Section>
        </Column>
      </div>
    </div>
  );
}

interface CharacterSheetHeaderProps {
  character: Character;
  onClose: () => void;
  shortcut?: string;
}

export function CharacterSheetHeader({ character, onClose, shortcut = 'C' }: CharacterSheetHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.nameBlock}>
        <div className={styles.csName}>{character.name}</div>
        <div className={styles.csMeta}>
          {character.classLabel} · {character.classTagline} · Nv {character.level}
        </div>
      </div>
      <button className={`btn-secondary ${styles.btnBack}`} onClick={onClose}>
        <span>← Voltar</span>
        <span className={styles.btnBackKey}>{shortcut}</span>
      </button>
    </div>
  );
}
