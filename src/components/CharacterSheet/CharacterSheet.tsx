import type { ReactNode } from 'react';
import type { Character } from '../../types';
import { computeDerivedStats } from '../../lib/stats';
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
  const s = computeDerivedStats(c);
  const resCap = <Unit> / {s.resistMax}%</Unit>;

  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        <Column title="Recursos">
          <Section title="Atributos">
            <StatLine
              name="Força"
              value={c.forca}
              color="forca"
              tooltip={
                <>
                  <TooltipLine>Atributo primário.</TooltipLine>
                  <TooltipLine>
                    Escala o <Mod color="fisico">Dano Físico</Mod> base e a capacidade de carga.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Agilidade"
              value={c.agilidade}
              color="agilidade"
              tooltip={
                <>
                  <TooltipLine>Atributo primário.</TooltipLine>
                  <TooltipLine>
                    Escala a <Mod color="agilidade">Velocidade de Ataque</Mod>, <Mod color="agilidade">Esquiva</Mod> e <Mod color="critico">Chance de Crítico</Mod>.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Intelecto"
              value={c.intelecto}
              color="intelecto"
              tooltip={
                <>
                  <TooltipLine>Atributo primário.</TooltipLine>
                  <TooltipLine>
                    Escala o <Mod color="intelecto">Bônus Mágico</Mod> e a <Mod color="agilidade">Velocidade de Conjuração</Mod>.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Vitais">
            <VitalBar label="Vida" current={c.vidaAtual} max={c.vidaMax} kind="vida" />
            <VitalBar label="Mana" current={c.manaAtual} max={c.manaMax} kind="mana" />
            <VitalBar label="Exp" current={c.xp} max={c.xpNext} kind="exp" />
          </Section>

          <Section title="Regeneração">
            <StatLine
              name="Regeneração de Vida"
              value={<>{s.regenVida}<Unit> /turno</Unit></>}
              color="vida"
              tooltip={
                <>
                  Recupera <Mod color="vida">{s.regenVida} de Vida</Mod> por turno fora de combate.
                </>
              }
            />
            <StatLine
              name="Regeneração de Mana"
              value={<>{s.regenMana}<Unit> /turno</Unit></>}
              color="mana"
              tooltip={
                <>
                  Recupera <Mod color="mana">{s.regenMana} de Mana</Mod> por turno.
                </>
              }
            />
          </Section>

          <Section title="Magia">
            <StatLine
              name="Bônus Mágico"
              value={`+${s.bonusMagico}%`}
              color="intelecto"
              tooltip={
                <>
                  Aumenta o dano de <Mod color="intelecto">Magias</Mod> em {s.bonusMagico}%.
                </>
              }
            />
            <StatLine
              name="Eficiência de Mana"
              value={`${s.eficienciaMana}%`}
              color="mana"
              tooltip={
                <>
                  <TooltipLine>
                    Determina o custo de <Mod color="mana">Mana</Mod> das habilidades.
                  </TooltipLine>
                  <TooltipLine>
                    Valores acima de 100% reduzem o custo proporcionalmente.
                  </TooltipLine>
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
              tooltip={
                <>
                  Soma de <Mod color="fisico">Físico</Mod>, <Mod color="fogo">Fogo</Mod>, <Mod color="gelo">Gelo</Mod>, <Mod color="raio">Raio</Mod> e <Mod color="caos">Caos</Mod> aplicados por golpe.
                </>
              }
            />
            <StatLine
              name="Dano Por Segundo"
              value={s.dps.toFixed(1)}
              tooltip={
                <>
                  Dano por segundo médio considerando o Dano Total, a <Mod color="agilidade">Velocidade de Ataque</Mod> e a <Mod color="critico">Chance de Crítico</Mod>.
                </>
              }
            />
          </Section>

          <Section title="Dano Físico">
            <StatLine
              name="Dano Físico"
              value={`${s.danoFisicoMin} — ${s.danoFisicoMax}`}
              color="fisico"
              tooltip={
                <>
                  <TooltipLine>
                    Dano de impacto/corte aplicado por golpe corpo a corpo.
                  </TooltipLine>
                  <TooltipLine>
                    Mitigado por <Mod color="fisico">Armadura</Mod> e <Mod color="fisico">Resistência Física</Mod> do alvo.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Dano Elemental">
            <StatLine
              name="Dano de Fogo"
              value={s.danoFogo}
              color="fogo"
              tooltip={
                <>
                  <TooltipLine>
                    Dano elemental de <Mod color="fogo">Fogo</Mod> aplicado por golpe.
                  </TooltipLine>
                  <TooltipLine>
                    Mitigado pela <Mod color="fogo">Resistência ao Fogo</Mod> do alvo.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Dano de Gelo"
              value={s.danoGelo}
              color="gelo"
              tooltip={
                <>
                  <TooltipLine>
                    Dano elemental de <Mod color="gelo">Gelo</Mod> aplicado por golpe.
                  </TooltipLine>
                  <TooltipLine>
                    Mitigado pela <Mod color="gelo">Resistência ao Gelo</Mod> do alvo.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Dano de Raio"
              value={s.danoRaio}
              color="raio"
              tooltip={
                <>
                  <TooltipLine>
                    Dano elemental de <Mod color="raio">Raio</Mod> aplicado por golpe.
                  </TooltipLine>
                  <TooltipLine>
                    Mitigado pela <Mod color="raio">Resistência ao Raio</Mod> do alvo.
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
              tooltip={
                <>
                  <TooltipLine>
                    Dano de <Mod color="caos">Caos</Mod> aplicado por golpe — ignora <Mod color="fisico">Armadura</Mod>.
                  </TooltipLine>
                  <TooltipLine>
                    Mitigado apenas pela <Mod color="caos">Resistência ao Caos</Mod>.
                  </TooltipLine>
                </>
              }
            />
          </Section>

          <Section title="Velocidade">
            <StatLine
              name="Velocidade de Ataque"
              value={<>{s.velAtaque.toFixed(2)}<Unit> /s</Unit></>}
              color="agilidade"
              tooltip={
                <>
                  <TooltipLine>
                    Quantos ataques por segundo o personagem realiza.
                  </TooltipLine>
                  <TooltipLine>
                    Multiplica o <Mod color="fisico">Dano Total</Mod> no cálculo de <Mod color="critico">Dano Por Segundo</Mod>.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Velocidade de Conjuração"
              value={<>{s.velConjuracao.toFixed(2)}<Unit> /s</Unit></>}
              color="agilidade"
              tooltip={
                <>
                  <TooltipLine>
                    Quantas magias por segundo o personagem conjura.
                  </TooltipLine>
                  <TooltipLine>
                    Multiplica o <Mod color="intelecto">Bônus Mágico</Mod> no dano mágico por segundo.
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
              tooltip={
                <>
                  <TooltipLine>
                    Determina se um ataque conecta com o alvo.
                  </TooltipLine>
                  <TooltipLine>
                    Comparado com a <Mod color="agilidade">Evasão</Mod> do alvo — quanto maior o Acerto em relação à Evasão, maior a chance de acertar.
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
              tooltip={
                <>
                  Chance de causar um <Mod color="critico">Golpe Crítico</Mod>, multiplicando o dano pelo <Mod color="critico">Multiplicador de Crítico</Mod>.
                  <TooltipMeta>Limite máximo: 100%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Multiplicador de Crítico"
              value={`×${s.multCritico.toFixed(2)}`}
              color="critico"
              tooltip={
                <>
                  Multiplicador aplicado ao dano em um <Mod color="critico">Golpe Crítico</Mod>.
                </>
              }
            />
          </Section>

          <Section title="Penetração">
            <StatLine
              name="Penetração de Fogo"
              value={`${s.penFogo}%`}
              color="fogo"
              tooltip={
                <>
                  Ignora {s.penFogo}% da <Mod color="fogo">Resistência ao Fogo</Mod> do alvo.
                </>
              }
            />
            <StatLine
              name="Penetração de Gelo"
              value={`${s.penGelo}%`}
              color="gelo"
              tooltip={
                <>
                  Ignora {s.penGelo}% da <Mod color="gelo">Resistência ao Gelo</Mod> do alvo.
                </>
              }
            />
            <StatLine
              name="Penetração de Raio"
              value={`${s.penRaio}%`}
              color="raio"
              tooltip={
                <>
                  Ignora {s.penRaio}% da <Mod color="raio">Resistência ao Raio</Mod> do alvo.
                </>
              }
            />
            <StatLine
              name="Penetração de Caos"
              value={`${s.penCaos}%`}
              color="caos"
              tooltip={
                <>
                  Ignora {s.penCaos}% da <Mod color="caos">Resistência ao Caos</Mod> do alvo.
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
              tooltip={
                <>
                  <TooltipLine>
                    Reduz o <Mod color="fisico">Dano Físico</Mod> recebido.
                  </TooltipLine>
                  <TooltipLine>
                    Eficácia varia conforme o tamanho do golpe — funciona melhor contra muitos ataques pequenos do que contra um único golpe massivo.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Evasão"
              value={s.evasao}
              color="agilidade"
              tooltip={
                <>
                  <TooltipLine>
                    Determina a chance de evitar completamente um ataque inimigo.
                  </TooltipLine>
                  <TooltipLine>
                    Comparada ao <Mod color="agilidade">Acerto</Mod> do agressor.
                  </TooltipLine>
                </>
              }
            />
            <StatLine
              name="Bloqueio"
              value={`${s.bloqueio}%`}
              color="fisico"
              tooltip={
                <>
                  <TooltipLine>
                    Chance de anular completamente um ataque <Mod color="fisico">Físico</Mod>, evitando 100% do dano do golpe.
                  </TooltipLine>
                  <TooltipMeta>Requer escudo equipado</TooltipMeta>
                </>
              }
            />
          </Section>

          <Section title="Resistências">
            <StatLine
              name="Resistência ao Fogo"
              value={<>{s.resFogo}%{resCap}</>}
              color="fogo"
              tooltip={
                <>
                  Diminui o <Mod color="fogo">Dano de Fogo</Mod> recebido em {s.resFogo}%.
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência ao Gelo"
              value={<>{s.resGelo}%{resCap}</>}
              color="gelo"
              tooltip={
                <>
                  Diminui o <Mod color="gelo">Dano de Gelo</Mod> recebido em {s.resGelo}%.
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência ao Raio"
              value={<>{s.resRaio}%{resCap}</>}
              color="raio"
              tooltip={
                <>
                  Diminui o <Mod color="raio">Dano de Raio</Mod> recebido em {s.resRaio}%.
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência ao Caos"
              value={<>{s.resCaos}%{resCap}</>}
              color="caos"
              tooltip={
                <>
                  Diminui o <Mod color="caos">Dano de Caos</Mod> recebido em {s.resCaos}%.
                  <TooltipMeta>Limite máximo: {s.resistMax}%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Resistência Física"
              value={`${s.resFisico}%`}
              color="fisico"
              tooltip={
                <>
                  Diminui o <Mod color="fisico">Dano Físico</Mod> recebido em {s.resFisico}%.
                </>
              }
            />
          </Section>

          <Section title="Roubo">
            <StatLine
              name="Roubo de Vida"
              value={`${s.rouboVida}%`}
              color="vida"
              tooltip={
                <>
                  Recupera {s.rouboVida}% do dano causado como <Mod color="vida">Vida</Mod>.
                </>
              }
            />
            <StatLine
              name="Roubo de Mana"
              value={`${s.rouboMana}%`}
              color="mana"
              tooltip={
                <>
                  Recupera {s.rouboMana}% do dano causado como <Mod color="mana">Mana</Mod>.
                </>
              }
            />
          </Section>

          <Section title="Mobilidade">
            <StatLine
              name="Velocidade de Movimento"
              value={`${s.velMovimento}%`}
              color="agilidade"
              tooltip={
                <>
                  Velocidade de deslocamento do personagem fora e durante o combate.
                  <TooltipMeta>Base: 100%</TooltipMeta>
                </>
              }
            />
            <StatLine
              name="Esquiva"
              value={`${s.esquiva}%`}
              color="agilidade"
              tooltip={
                <>
                  Chance de evitar dano de armadilhas, efeitos de área e ataques que não dependem de <Mod color="agilidade">Acerto</Mod>.
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
}

export function CharacterSheetHeader({ character, onClose }: CharacterSheetHeaderProps) {
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
        <span className={styles.btnBackKey}>C</span>
      </button>
    </div>
  );
}
