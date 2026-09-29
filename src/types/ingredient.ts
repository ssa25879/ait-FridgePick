export type IngredientCategory =
  | "vegetable"
  | "meat"
  | "eggDairy"
  | "carb"
  | "seasoning";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
}
