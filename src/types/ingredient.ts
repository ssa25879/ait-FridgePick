export type IngredientCategory =
  | "vegetable"
  | "protein"
  | "eggDairy"
  | "carb"
  | "seasoning";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
}
