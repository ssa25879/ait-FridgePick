export type RecipeDifficulty = "easy" | "normal" | "hard";

export interface RecipeSource {
  provider: string;
  dataset: string;
  sourceId: string;
  sourceUrl: string;
  usageScope: string;
}

export interface Recipe {
  id: string;
  name: string;
  requiredIngredients: string[];
  optionalIngredients?: string[];
  steps: string[];
  difficulty: RecipeDifficulty;
  unmappedRequiredIngredients?: string[];
  sourceIngredientText?: string;
  source?: RecipeSource;
}
