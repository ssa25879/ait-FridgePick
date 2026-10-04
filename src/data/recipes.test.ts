import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "./ingredients";
import { RECIPES, SOURCED_REPLACEMENT_RECIPES } from "./recipes";
import { PUBLIC_RECIPES, PUBLIC_RECIPE_IMPORT_SUMMARY } from "./publicRecipes";
import { EPIS_RECIPES, EPIS_RECIPE_IMPORT_SUMMARY } from "./episRecipes";
import { getRecipeCandidates } from "../utils/recommendRecipe";
import { inferRecipeDifficulty } from "../utils/recipeDifficulty";

describe("레시피 카탈로그", () => {
  const ingredientIds = new Set(INGREDIENTS.map(({ id }) => id));

  it("공식 카탈로그만 중복 없이 제공한다", () => {
    const recipeIds = RECIPES.map(({ id }) => id);

    expect(SOURCED_REPLACEMENT_RECIPES).toHaveLength(20);
    expect(SOURCED_REPLACEMENT_RECIPES.every((recipe) => recipe?.source && recipe.sourceIngredientText)).toBe(true);
    expect(new Set(recipeIds)).toEqual(new Set([...PUBLIC_RECIPES, ...EPIS_RECIPES].map(({ id }) => id)));
    expect(RECIPES).toHaveLength(PUBLIC_RECIPES.length + EPIS_RECIPES.length);
    expect(PUBLIC_RECIPES).toHaveLength(
      PUBLIC_RECIPE_IMPORT_SUMMARY.includedRecordCount,
    );
    expect(new Set(recipeIds).size).toBe(RECIPES.length);
  });

  it("추가 EPIS 데이터의 분량·출처·매핑과 제외 통계가 일치한다", () => {
    expect(EPIS_RECIPES).toHaveLength(EPIS_RECIPE_IMPORT_SUMMARY.includedRecordCount);
    expect(EPIS_RECIPE_IMPORT_SUMMARY.sourceRecordCount).toBe(
      EPIS_RECIPES.length + EPIS_RECIPE_IMPORT_SUMMARY.excludedRecordCount,
    );
    for (const recipe of EPIS_RECIPES) {
      expect(recipe.id).toBe(`epis_${recipe.source!.sourceId}`);
      expect(recipe.source!.provider).toBe("농림수산식품교육문화정보원");
      expect(recipe.sourceIngredientText).toBeTruthy();
      expect(recipe.requiredIngredients.length / (recipe.requiredIngredients.length + recipe.unmappedRequiredIngredients!.length)).toBeGreaterThanOrEqual(0.6);
    }
  });

  it("대표 조합의 기존 무후보에서 실제 EPIS 후보를 제공한다", () => {
    const selected = ["mushroom", "tofu", "zucchini", "green_onion", "soy_sauce"];
    expect(getRecipeCandidates(selected, PUBLIC_RECIPES)).toHaveLength(0);
    expect(getRecipeCandidates(selected).some(({ recipe }) => recipe.id.startsWith("epis_"))).toBe(true);
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
      expect(typeof recipe.sourceIngredientText).toBe("string");
      expect(recipe.sourceIngredientText!.trim().length).toBeGreaterThan(0);
      expect(recipe.sourceIngredientText).toMatch(/\d/);
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
      expect(["easy", "normal", "hard"]).toContain(recipe.difficulty);
      expect(recipe.difficulty).toBe(inferRecipeDifficulty(recipe));
    }
  });

  it("공개 레시피 난이도도 단계 수와 전체 필수 재료 수 판정과 일치한다", () => {
    for (const recipe of PUBLIC_RECIPES) {
      expect(recipe.difficulty).toBe(inferRecipeDifficulty(recipe));
    }
  });

});
