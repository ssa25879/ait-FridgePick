import type { Recipe } from "../types/recipe";
import { PUBLIC_RECIPES } from "./publicRecipes";
import { EPIS_RECIPES } from "./episRecipes";
import { mapRecipeIngredientName } from "./recipeCatalog";
import { inferRecipeDifficulty } from "../utils/recipeDifficulty";
import { RECIPE_INGREDIENT_REVIEW_NOTES } from "./recipeIngredientReviews";
import { mapReviewedStepIngredient, RECIPE_STEP_REQUIRED_INGREDIENTS } from "./recipeStepIngredients";

function applyCurrentIngredientMappings(recipe: Recipe): Recipe {
  const unresolved = recipe.unmappedRequiredIngredients ?? [];
  const newlyMapped = unresolved
    .map(mapRecipeIngredientName)
    .filter((id): id is string => id !== undefined);
  if (newlyMapped.length === 0) return recipe;

  const requiredIngredients = [...new Set([...recipe.requiredIngredients, ...newlyMapped])];
  const updated: Recipe = {
    ...recipe,
    requiredIngredients,
    optionalIngredients: recipe.optionalIngredients?.filter((id) => !requiredIngredients.includes(id)),
    unmappedRequiredIngredients: unresolved.filter((name) => !mapRecipeIngredientName(name)),
  };
  return { ...updated, difficulty: inferRecipeDifficulty(updated) };
}

// Source-backed substitutes for the 20 hand-written recipes; keep original source names.
const replacementIds = [
  "fsk_738",
  "fsk_272",
  "fsk_2986",
  "fsk_458",
  "fsk_3082",
  "fsk_3081",
  "fsk_137",
  "fsk_531",
  "fsk_784",
  "fsk_231",
  "fsk_439",
  "fsk_941",
  "fsk_2978",
  "fsk_982",
  "fsk_3010",
  "fsk_18",
  "fsk_816",
  "fsk_2958",
  "fsk_834",
  "fsk_493"
];

export const SOURCED_REPLACEMENT_RECIPES: Recipe[] = replacementIds.map(
  (id) => PUBLIC_RECIPES.find((recipe) => recipe.id === id)!,
);

// Each official record appears once, even when used as a replacement.
export const RECIPES: Recipe[] = [
  ...SOURCED_REPLACEMENT_RECIPES,
  ...PUBLIC_RECIPES.filter(({ id }) => !replacementIds.includes(id)),
  ...EPIS_RECIPES,
].map(applyCurrentIngredientMappings).map((recipe) => {
  const notes = RECIPE_INGREDIENT_REVIEW_NOTES[recipe.id];
  const stepIngredients = RECIPE_STEP_REQUIRED_INGREDIENTS[recipe.id];
  if (!notes && !stepIngredients) return recipe;
  const requiredIngredients = [...new Set([
    ...recipe.requiredIngredients,
    ...(stepIngredients ?? []).map(mapReviewedStepIngredient).filter((id): id is string => id !== undefined),
  ])];
  const updated: Recipe = {
    ...recipe,
    requiredIngredients,
    optionalIngredients: recipe.optionalIngredients?.filter((id) => !requiredIngredients.includes(id)),
    unmappedRequiredIngredients: [...new Set([
      ...(recipe.unmappedRequiredIngredients ?? []),
      ...(stepIngredients ?? []).filter((name) => !mapReviewedStepIngredient(name)),
    ])],
    ingredientReviewNotes: notes ? [...notes] : undefined,
  };
  return { ...updated, difficulty: inferRecipeDifficulty(updated) };
});
