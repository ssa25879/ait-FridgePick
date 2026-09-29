import type { Ingredient, IngredientCategory } from "../types/ingredient";

export const INGREDIENT_CATEGORIES: {
  id: IngredientCategory;
  name: string;
}[] = [
  { id: "vegetable", name: "채소" },
  { id: "meat", name: "고기" },
  { id: "eggDairy", name: "계란·유제품" },
  { id: "carb", name: "탄수화물" },
  { id: "seasoning", name: "양념" },
];

export const INGREDIENTS: Ingredient[] = [
  { id: "kimchi", name: "김치", category: "vegetable" },
  { id: "onion", name: "양파", category: "vegetable" },
  { id: "green_onion", name: "대파", category: "vegetable" },
  { id: "garlic", name: "마늘", category: "vegetable" },
  { id: "carrot", name: "당근", category: "vegetable" },
  { id: "potato", name: "감자", category: "vegetable" },
  { id: "zucchini", name: "애호박", category: "vegetable" },
  { id: "mushroom", name: "버섯", category: "vegetable" },
  { id: "pork", name: "돼지고기", category: "meat" },
  { id: "beef", name: "소고기", category: "meat" },
  { id: "chicken", name: "닭고기", category: "meat" },
  { id: "ham", name: "햄", category: "meat" },
  { id: "bacon", name: "베이컨", category: "meat" },
  { id: "egg", name: "달걀", category: "eggDairy" },
  { id: "milk", name: "우유", category: "eggDairy" },
  { id: "cheese", name: "치즈", category: "eggDairy" },
  { id: "butter", name: "버터", category: "eggDairy" },
  { id: "cooked_rice", name: "밥", category: "carb" },
  { id: "ramen_noodles", name: "라면", category: "carb" },
  { id: "pasta", name: "파스타면", category: "carb" },
  { id: "bread", name: "식빵", category: "carb" },
  { id: "glass_noodles", name: "당면", category: "carb" },
  { id: "soy_sauce", name: "간장", category: "seasoning" },
  { id: "gochujang", name: "고추장", category: "seasoning" },
  { id: "doenjang", name: "된장", category: "seasoning" },
  { id: "sesame_oil", name: "참기름", category: "seasoning" },
  { id: "cooking_oil", name: "식용유", category: "seasoning" },
  { id: "salt", name: "소금", category: "seasoning" },
];
