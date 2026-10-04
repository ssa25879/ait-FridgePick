export type IngredientCategory =
  | "vegetable"
  | "protein"
  | "eggDairy"
  | "carb"
  | "seasoning";

export type IngredientCategoryFilter = IngredientCategory | "all";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
}
