import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Character } from '../../types';
import { getRecipesFor, type Recipe } from '../../data/recipes';
import { getMaterialName } from '../../data/materials';
import {
  addItemToInventory,
  consumeItem,
  countItem,
} from '../../lib/inventory';
import { ItemTooltipInline } from '../ItemTooltip/ItemTooltip';
import styles from './CraftPane.module.css';

interface CraftPaneProps {
  npcId: string;
  role: 'forjar' | 'destilar';
  character: Character;
  onUpdate: (next: Character) => void;
}

/**
 * UI de crafting — lista as receitas que o NPC conhece, mostra reagentes
 * disponíveis vs necessários e permite executar a receita se tudo encaixa.
 */
export function CraftPane({ npcId, role, character, onUpdate }: CraftPaneProps) {
  const recipes = getRecipesFor(npcId, role);
  const actionLabel = role === 'forjar' ? 'Forjar' : 'Destilar';

  const handleCraft = (recipe: Recipe) => {
    // Consome reagentes em sequência. Se algum falhar, aborta sem mutar.
    let inv = character.inventory;
    for (const ing of recipe.ingredients) {
      const next = consumeItem(inv, ing.itemId, ing.quantity);
      if (!next) return; // falta reagente — botão deveria estar desabilitado
      inv = next;
    }
    // Adiciona o resultado
    const { inventory: finalInv, added } = addItemToInventory(inv, recipe.result);
    if (!added) return; // inventário cheio
    onUpdate({ ...character, inventory: finalInv });
  };

  if (recipes.length === 0) {
    return (
      <div className={styles.empty}>
        Nenhuma receita disponível.
      </div>
    );
  }

  return (
    <div className={styles.craft}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          inventory={character.inventory}
          actionLabel={actionLabel}
          onCraft={() => handleCraft(recipe)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// RecipeCard — uma receita com nome, descrição, lista de reagentes, botão
// ============================================================================
interface RecipeCardProps {
  recipe: Recipe;
  inventory: (import('../../types').Item | null)[];
  actionLabel: string;
  onCraft: () => void;
}

function RecipeCard({ recipe, inventory, actionLabel, onCraft }: RecipeCardProps) {
  // Checa cada reagente — se algum estiver faltando, desabilita o botão
  const ingredientStatus = recipe.ingredients.map((ing) => {
    const have = countItem(inventory, ing.itemId);
    return { ...ing, have, ok: have >= ing.quantity };
  });
  const canCraft = ingredientStatus.every((i) => i.ok);

  // Tooltip do item resultante
  const resultRef = useRef<HTMLSpanElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);

  const handleEnter = () => {
    if (!resultRef.current) return;
    const r = resultRef.current.getBoundingClientRect();
    const TT_WIDTH = 300;
    let left = r.right + 12;
    if (left + TT_WIDTH > window.innerWidth - 8) left = r.left - 12 - TT_WIDTH;
    if (left < 8) left = 8;
    setTooltipPos({ left, top: r.top });
  };
  const handleLeave = () => setTooltipPos(null);

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <span
          ref={resultRef}
          className={`${styles.resultName} ${styles[`rarity_${recipe.result.rarity}`]}`}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {recipe.name}
        </span>
        <button
          type="button"
          className={`btn-secondary ${styles.btnCraft}`}
          onClick={onCraft}
          disabled={!canCraft}
        >
          {actionLabel}
        </button>
      </header>

      <p className={styles.cardDesc}>{recipe.description}</p>

      <ul className={styles.ingredients}>
        {ingredientStatus.map((ing) => (
          <li
            key={ing.itemId}
            className={`${styles.ingredient} ${ing.ok ? styles.ingredientOk : styles.ingredientMissing}`}
          >
            <span className={styles.ingName}>{getMaterialName(ing.itemId)}</span>
            <span className={styles.ingCount}>
              {ing.have} / {ing.quantity}
            </span>
          </li>
        ))}
      </ul>

      {tooltipPos &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: tooltipPos.left,
              top: tooltipPos.top,
              zIndex: 1100,
              pointerEvents: 'none',
              maxWidth: 300,
            }}
          >
            <ItemTooltipInline item={recipe.result} />
          </div>,
          document.body,
        )}
    </article>
  );
}

