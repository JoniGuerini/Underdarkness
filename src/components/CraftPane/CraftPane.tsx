import { useMemo, useState } from 'react';
import type { Character, Item } from '../../types';
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
 * UI de crafting — layout split inspirado no PoE/WoW: lista de receitas à
 * esquerda (só nome), detalhes do item selecionado à direita (descrição,
 * reagentes, preview do resultado, botão de craftar).
 */
export function CraftPane({ npcId, role, character, onUpdate }: CraftPaneProps) {
  const recipes = getRecipesFor(npcId, role);
  const actionLabel = role === 'forjar' ? 'Forjar' : 'Destilar';

  const [selectedId, setSelectedId] = useState<string | null>(
    recipes[0]?.id ?? null,
  );

  const selected = useMemo(
    () => recipes.find((r) => r.id === selectedId) ?? recipes[0] ?? null,
    [recipes, selectedId],
  );

  const handleCraft = (recipe: Recipe) => {
    let inv = character.inventory;
    for (const ing of recipe.ingredients) {
      const next = consumeItem(inv, ing.itemId, ing.quantity);
      if (!next) return;
      inv = next;
    }
    const { inventory: finalInv, added } = addItemToInventory(inv, recipe.result);
    if (!added) return;
    onUpdate({ ...character, inventory: finalInv });
  };

  if (recipes.length === 0) {
    return <div className={styles.empty}>Nenhuma receita disponível.</div>;
  }

  return (
    <div className={styles.split}>
      <RecipeList
        recipes={recipes}
        inventory={character.inventory}
        selectedId={selected?.id ?? null}
        onSelect={(id) => setSelectedId(id)}
      />
      {selected && (
        <RecipeDetail
          recipe={selected}
          inventory={character.inventory}
          actionLabel={actionLabel}
          onCraft={() => handleCraft(selected)}
        />
      )}
    </div>
  );
}

// ============================================================================
// RecipeList — sidebar esquerda com nomes das receitas
// ============================================================================
interface RecipeListProps {
  recipes: Recipe[];
  inventory: (Item | null)[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function RecipeList({ recipes, inventory, selectedId, onSelect }: RecipeListProps) {
  return (
    <aside className={styles.list}>
      <div className={styles.listHeader}>Receitas</div>
      {recipes.map((recipe) => {
        const canCraft = recipe.ingredients.every(
          (ing) => countItem(inventory, ing.itemId) >= ing.quantity,
        );
        const isActive = selectedId === recipe.id;
        return (
          <button
            key={recipe.id}
            type="button"
            className={`${styles.listItem} ${isActive ? styles.listItemActive : ''}`}
            onClick={() => onSelect(recipe.id)}
          >
            <span
              className={`${styles.listItemName} ${styles[`rarity_${recipe.result.rarity}`]}`}
            >
              {recipe.name}
            </span>
            <span
              className={`${styles.listItemStatus} ${canCraft ? styles.statusOk : styles.statusMissing}`}
              aria-label={canCraft ? 'Reagentes prontos' : 'Faltam reagentes'}
            >
              {canCraft ? '●' : '○'}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

// ============================================================================
// RecipeDetail — pane direita com descrição, reagentes e preview do resultado
// ============================================================================
interface RecipeDetailProps {
  recipe: Recipe;
  inventory: (Item | null)[];
  actionLabel: string;
  onCraft: () => void;
}

function RecipeDetail({ recipe, inventory, actionLabel, onCraft }: RecipeDetailProps) {
  const ingredientStatus = recipe.ingredients.map((ing) => {
    const have = countItem(inventory, ing.itemId);
    return { ...ing, have, ok: have >= ing.quantity };
  });
  const canCraft = ingredientStatus.every((i) => i.ok);

  return (
    <main className={styles.detail}>
      <header className={styles.detailHeader}>
        <h3
          className={`${styles.detailName} ${styles[`rarity_${recipe.result.rarity}`]}`}
        >
          {recipe.name}
        </h3>
        <p className={styles.detailDesc}>{recipe.description}</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionLabel}>Reagentes</div>
        <ul className={styles.ingredients}>
          {ingredientStatus.map((ing) => (
            <li
              key={ing.itemId}
              className={`${styles.ingredient} ${ing.ok ? styles.ingredientOk : styles.ingredientMissing}`}
            >
              <span className={styles.ingCount}>
                {ing.have} / {ing.quantity}
              </span>
              <span className={styles.ingName}>{getMaterialName(ing.itemId)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionLabel}>Resultado</div>
        <div className={styles.resultPreview}>
          <ItemTooltipInline item={recipe.result} />
        </div>
      </section>

      <footer className={styles.detailFooter}>
        <button
          type="button"
          className={`btn-primary ${styles.btnCraft}`}
          onClick={onCraft}
          disabled={!canCraft}
        >
          {actionLabel}
        </button>
      </footer>
    </main>
  );
}
