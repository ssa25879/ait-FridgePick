import { RECIPES } from "../data/recipes";
import type { Recipe } from "../types/recipe";

export const MINIMUM_RECIPE_MATCH_RATE = 0.6;

export interface RecipeMatch {
  recipe: Recipe;
  matchedRequiredIngredientIds: string[];
  missingRequiredIngredientIds: string[];
  matchRate: number;
}

export function getRecipeCandidates(
  selectedIngredientIds: string[],
  recipes: Recipe[] = RECIPES,
): RecipeMatch[] {
  const selectedIds = new Set(selectedIngredientIds);

  return recipes.flatMap((recipe) => {
    if (recipe.requiredIngredients.length === 0) return [];

    const matchedRequiredIngredientIds = recipe.requiredIngredients.filter(
      (id) => selectedIds.has(id),
    );
    const missingRequiredIngredientIds = recipe.requiredIngredients.filter(
      (id) => !selectedIds.has(id),
    );
    const matchRate =
      matchedRequiredIngredientIds.length / recipe.requiredIngredients.length;

    if (matchRate < MINIMUM_RECIPE_MATCH_RATE) return [];

    return [
      {
        recipe,
        matchedRequiredIngredientIds,
        missingRequiredIngredientIds,
        matchRate,
      },
    ];
  });
}

export function pickRecipeCandidate(
  candidates: RecipeMatch[],
  previousRecipeId?: string,
  random: () => number = Math.random,
): RecipeMatch | null {
  if (candidates.length === 0) return null;

  const alternatives = previousRecipeId
    ? candidates.filter(({ recipe }) => recipe.id !== previousRecipeId)
    : candidates;
  const pool = alternatives.length > 0 ? alternatives : candidates;
  const index = Math.min(Math.floor(random() * pool.length), pool.length - 1);

  return pool[Math.max(index, 0)];
}
