import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "./ingredients";
import { LOCAL_RECIPES, RECIPES } from "./recipes";
import { PUBLIC_RECIPES, PUBLIC_RECIPE_IMPORT_SUMMARY } from "./publicRecipes";

describe("레시피 카탈로그", () => {
  const ingredientIds = new Set(INGREDIENTS.map(({ id }) => id));

  it("기존 레시피 20개를 유지하고 전체 ID가 고유하다", () => {
    const recipeIds = RECIPES.map(({ id }) => id);

    expect(LOCAL_RECIPES).toHaveLength(20);
    expect(PUBLIC_RECIPES).toHaveLength(
      PUBLIC_RECIPE_IMPORT_SUMMARY.includedRecordCount,
    );
    expect(new Set(recipeIds).size).toBe(RECIPES.length);
  });

  it("기존 수기 레시피의 재료 참조와 필수 데이터가 유효하다", () => {
    for (const recipe of LOCAL_RECIPES) {
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

  it("공개 레시피는 출처와 미지원 재료를 보존하고 매핑 기준을 충족한다", () => {
    for (const recipe of PUBLIC_RECIPES) {
      const totalRequired =
        recipe.requiredIngredients.length +
        (recipe.unmappedRequiredIngredients?.length ?? 0);
      const coverage = recipe.requiredIngredients.length / totalRequired;

      expect(recipe.id).toMatch(/^fsk_\d+$/);
      expect(recipe.source?.provider).toBe("식품의약품안전처");
      expect(recipe.source?.sourceId).toBe(recipe.id.slice("fsk_".length));
      expect(recipe.sourceIngredientText?.trim()).not.toBe("");
      expect(recipe.requiredIngredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(coverage).toBeGreaterThanOrEqual(0.6);
      expect(recipe.requiredIngredients.every((id) => ingredientIds.has(id))).toBe(
        true,
      );
    }
  });

  it("모든 레시피에 필수 필드와 유효한 재료 참조가 있다", () => {
    for (const recipe of RECIPES) {
      const optionalIngredients = recipe.optionalIngredients ?? [];
      const allIngredientIds = [
        ...recipe.requiredIngredients,
        ...optionalIngredients,
      ];

      expect(recipe.id.trim()).not.toBe("");
      expect(recipe.name.trim()).not.toBe("");
      expect(recipe.requiredIngredients.length).toBeGreaterThan(0);
      expect(new Set(recipe.requiredIngredients).size).toBe(
        recipe.requiredIngredients.length,
      );
      expect(allIngredientIds.every((id) => ingredientIds.has(id))).toBe(true);
      expect(new Set(allIngredientIds).size).toBe(allIngredientIds.length);
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(recipe.steps.every((step) => step.trim().length > 0)).toBe(true);
      expect(["easy", "normal"]).toContain(recipe.difficulty);
    }
  });
});
