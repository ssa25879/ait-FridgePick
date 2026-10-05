import type { RecipeMatch } from "./recommendRecipe";

// Match rate measures similarity; readiness also requires no known source gaps.
export function isRecipeReady(match: RecipeMatch): boolean {
  return match.missingRequiredIngredientIds.length === 0
    && match.missingUnmappedRequiredIngredients.length === 0
    && (match.recipe.ingredientReviewNotes?.length ?? 0) === 0;
}
