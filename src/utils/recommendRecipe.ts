import { RECIPES } from "../data/recipes";
import type { Recipe, RecipeDifficulty } from "../types/recipe";

export const MINIMUM_RECIPE_MATCH_RATE = 0.6;

export interface RecipeCandidateFilters {
  minimumMatchRate?: number;
  difficultyFilter?: RecipeDifficulty | "all";
}

export interface RecipeMatch {
  recipe: Recipe;
  matchedRequiredIngredientIds: string[];
  missingRequiredIngredientIds: string[];
  missingUnmappedRequiredIngredients: string[];
  matchRate: number;
}

export function getRecipeCandidates(
  selectedIngredientIds: string[],
  recipes: Recipe[] = RECIPES,
  filters: RecipeCandidateFilters = {},
): RecipeMatch[] {
  const selectedIds = new Set(selectedIngredientIds);
  const minimumMatchRate =
    filters.minimumMatchRate ?? MINIMUM_RECIPE_MATCH_RATE;
  const difficultyFilter = filters.difficultyFilter ?? "all";

  return recipes.flatMap((recipe) => {
    const unmappedRequiredIngredients =
      recipe.unmappedRequiredIngredients ?? [];
    const totalRequiredIngredientCount =
      recipe.requiredIngredients.length + unmappedRequiredIngredients.length;
    if (totalRequiredIngredientCount === 0) return [];

    const matchedRequiredIngredientIds = recipe.requiredIngredients.filter(
      (id) => selectedIds.has(id),
    );
    const missingRequiredIngredientIds = recipe.requiredIngredients.filter(
      (id) => !selectedIds.has(id),
    );
    const matchRate =
      matchedRequiredIngredientIds.length / totalRequiredIngredientCount;

    if (matchRate < minimumMatchRate) return [];
    if (difficultyFilter !== "all" && recipe.difficulty !== difficultyFilter) {
      return [];
    }

    return [
      {
        recipe,
        matchedRequiredIngredientIds,
        missingRequiredIngredientIds,
        missingUnmappedRequiredIngredients: unmappedRequiredIngredients,
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
