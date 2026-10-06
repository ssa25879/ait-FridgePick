import { RECIPES } from "../data/recipes";
import { INGREDIENTS } from "../data/ingredients";
import { isRecipePantryStaple, mapRecipeIngredientName, parseRecipeIngredients } from "../data/recipeCatalog";
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
  matchBasis?: "main" | "required";
}

const seasoningIds = new Set(INGREDIENTS.filter(({ category }) => category === "seasoning").map(({ id }) => id));
const matchingIngredientCache = new WeakMap<Recipe, { ids: string[]; unknown: string[]; basis: "main" | "required" }>();

function getMatchingIngredients(recipe: Recipe) {
  const cached = matchingIngredientCache.get(recipe);
  if (cached) return cached;
  const unknown = recipe.unmappedRequiredIngredients ?? [];
  const mainLines = recipe.sourceIngredientText?.split(/\r?\n/).filter((line) => /^\s*주재료\s*[:：]/.test(line)) ?? [];
  let result;
  if (mainLines.length > 0) {
    // EPIS joins the exact ingredient name and source quantity with a space.
    // Recover names already present in this record before using the CSV parser,
    // which cannot recognize every source quantity (e.g. 2잎, 1cup, 반모).
    const names = mainLines.flatMap((line) => {
      const content = line.replace(/^\s*주재료\s*[:：]\s*/, "").trim();
      const boundaries = [...content.matchAll(/\s+/g)].map(({ index }) => index!).reverse();
      for (const boundary of boundaries) {
        const name = content.slice(0, boundary).trim();
        const id = mapRecipeIngredientName(name);
        if ((id && recipe.requiredIngredients.includes(id)) || unknown.includes(name) || isRecipePantryStaple(name)) return [name];
      }
      return parseRecipeIngredients({ RCP_NM: recipe.name, RCP_PARTS_DTLS: line }).requiredIngredients;
    });
    const mapped = names.map(mapRecipeIngredientName);
    result = {
      ids: [...new Set(mapped.filter((id): id is string => id !== undefined && recipe.requiredIngredients.includes(id) && !seasoningIds.has(id)))],
      unknown: [...new Set(names.filter((name) => !mapRecipeIngredientName(name) && !isRecipePantryStaple(name)))],
      basis: "main" as const,
    };
  } else if (recipe.sourceIngredientText) {
    result = { ids: recipe.requiredIngredients.filter((id) => !seasoningIds.has(id)), unknown, basis: "main" as const };
  } else {
    result = { ids: recipe.requiredIngredients, unknown, basis: "required" as const };
  }
  matchingIngredientCache.set(recipe, result);
  return result;
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
    const matchingIngredients = getMatchingIngredients(recipe);
    const matchingIngredientCount = matchingIngredients.ids.length + matchingIngredients.unknown.length;
    if (matchingIngredientCount === 0) return [];

    const matchedRequiredIngredientIds = recipe.requiredIngredients.filter(
      (id) => selectedIds.has(id),
    );
    const missingRequiredIngredientIds = recipe.requiredIngredients.filter(
      (id) => !selectedIds.has(id),
    );
    const matchRate =
      matchingIngredients.ids.filter((id) => selectedIds.has(id)).length / matchingIngredientCount;

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
        matchBasis: matchingIngredients.basis,
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
