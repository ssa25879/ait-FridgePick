import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "./ingredients";
import { RECIPES } from "./recipes";

describe("레시피 카탈로그", () => {
  const ingredientIds = new Set(INGREDIENTS.map(({ id }) => id));

  it("20~30개 레시피의 ID가 고유하다", () => {
    const recipeIds = RECIPES.map(({ id }) => id);

    expect(RECIPES.length).toBeGreaterThanOrEqual(20);
    expect(RECIPES.length).toBeLessThanOrEqual(30);
    expect(new Set(recipeIds).size).toBe(RECIPES.length);
  });

  it("각 레시피의 필수 데이터와 재료 참조가 유효하다", () => {
    for (const recipe of RECIPES) {
      const optionalIngredients = recipe.optionalIngredients ?? [];
      const allIngredientIds = [
        ...recipe.requiredIngredients,
        ...optionalIngredients,
      ];

      expect(recipe.id.trim()).not.toBe("");
      expect(recipe.name.trim()).not.toBe("");
      expect(recipe.requiredIngredients.length).toBeGreaterThanOrEqual(3);
      expect(recipe.requiredIngredients.length).toBeLessThanOrEqual(6);
      expect(new Set(recipe.requiredIngredients).size).toBe(
        recipe.requiredIngredients.length,
      );
      expect(allIngredientIds.every((id) => ingredientIds.has(id))).toBe(true);
      expect(new Set(allIngredientIds).size).toBe(allIngredientIds.length);
      expect(recipe.steps.length).toBeGreaterThanOrEqual(3);
      expect(recipe.steps.length).toBeLessThanOrEqual(5);
      expect(recipe.steps.every((step) => step.trim().length > 0)).toBe(true);
      expect(["easy", "normal"]).toContain(recipe.difficulty);
    }
  });
});
