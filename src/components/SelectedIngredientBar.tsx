import type { Ingredient } from "../types/ingredient";

interface SelectedIngredientBarProps {
  ingredients: Ingredient[];
}

export function SelectedIngredientBar({
  ingredients,
}: SelectedIngredientBarProps) {
  return (
    <section
      className="selected-ingredients"
      aria-labelledby="selected-ingredients-title"
      aria-live="polite"
      aria-atomic="true"
    >
      <h2 id="selected-ingredients-title" className="selected-ingredients-title">
        선택한 재료 {ingredients.length}개
      </h2>
      {ingredients.length > 0 ? (
        <p className="selected-ingredients-names">
          {ingredients.map((ingredient) => ingredient.name).join(", ")}
        </p>
      ) : (
        <p className="selected-ingredients-empty">재료를 선택해 주세요.</p>
      )}
    </section>
  );
}
