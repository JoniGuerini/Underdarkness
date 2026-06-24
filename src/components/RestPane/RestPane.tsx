import { useState } from 'react';
import type { Character } from '../../types';
import { VitalBar } from '../VitalBar/VitalBar';
import styles from './RestPane.module.css';

const REST_COST = 5;

interface RestPaneProps {
  character: Character;
  onUpdate: (next: Character) => void;
}

/**
 * Pane da role "descansar" — paga uma diária e recupera Vida + Mana ao máximo.
 * Também avança o tempo (dia + 1, período = Aurora) pra sentir a passagem
 * da noite. Mock: custo fixo de 5g, sem limite de vezes por dia.
 */
export function RestPane({ character, onUpdate }: RestPaneProps) {
  const [notice, setNotice] = useState<string | null>(null);

  const vidaCheia = character.vidaAtual >= character.vidaMax;
  const manaCheia = character.manaAtual >= character.manaMax;
  const totalmenteCurado = vidaCheia && manaCheia;
  const semOuro = character.gold < REST_COST;

  const disabled = semOuro || totalmenteCurado;
  const buttonLabel = semOuro
    ? 'Sem ouro suficiente'
    : totalmenteCurado
      ? 'Você já está descansado'
      : 'Pagar e descansar';

  const handleRest = () => {
    if (disabled) return;
    onUpdate({
      ...character,
      vidaAtual: character.vidaMax,
      manaAtual: character.manaMax,
      gold: character.gold - REST_COST,
      day: character.day + 1,
      period: 'Aurora',
      time: '06:00',
    });
    setNotice(
      'Você dorme até o amanhecer. Sopa quente, pão duro, fogo na lareira. Acorda inteiro.',
    );
    window.setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className={styles.rest}>
      <div className={styles.intro}>
        <p className={styles.flavor}>
          "Cama limpa, sopa de raiz, fogo a noite toda. Cinco ouro a diária. Quem dorme aqui
          acorda inteiro — não prometo mais que isso."
        </p>
      </div>

      <section className={styles.statusCard}>
        <div className={styles.statusLabel}>Estado atual</div>
        <div className={styles.statusBars}>
          <VitalBar label="Vida" current={character.vidaAtual} max={character.vidaMax} kind="vida" />
          <VitalBar label="Mana" current={character.manaAtual} max={character.manaMax} kind="mana" />
        </div>
        <div className={styles.statusMeta}>
          <span>Dia {character.day} · {character.period}</span>
          <span>{character.time}</span>
        </div>
      </section>

      <section className={styles.priceCard}>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Diária</span>
          <span className={styles.priceValue}>{REST_COST} ouro</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Seu ouro</span>
          <span className={`${styles.priceValue} ${semOuro ? styles.priceLow : ''}`}>
            {character.gold} ouro
          </span>
        </div>
      </section>

      {notice && (
        <div className={styles.notice}>
          <span className={styles.noticeMark}>✦</span>
          {notice}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={`btn-primary ${styles.btnRest}`}
          onClick={handleRest}
          disabled={disabled}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
