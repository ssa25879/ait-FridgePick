import type { Recipe, RecipeDifficulty } from "../types/recipe";

type RecipeDifficultyInput = Pick<
  Recipe,
  "steps" | "requiredIngredients" | "unmappedRequiredIngredients"
>;

export function inferRecipeDifficulty(
  recipe: RecipeDifficultyInput,
): RecipeDifficulty {
  const stepCount = recipe.steps.length;
  const requiredIngredientCount =
    recipe.requiredIngredients.length +
    (recipe.unmappedRequiredIngredients?.length ?? 0);

  if (stepCount <= 6 && requiredIngredientCount <= 6) return "easy";
  if (stepCount <= 10 && requiredIngredientCount <= 10) return "normal";
  return "hard";
}
