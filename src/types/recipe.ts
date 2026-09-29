export type RecipeDifficulty = "easy" | "normal";

export interface Recipe {
  id: string;
  name: string;
  requiredIngredients: string[];
  optionalIngredients?: string[];
  steps: string[];
  difficulty: RecipeDifficulty;
}
