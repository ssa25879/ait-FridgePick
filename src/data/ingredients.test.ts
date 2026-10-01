import { describe, expect, it } from "vitest";
import { INGREDIENTS, INGREDIENT_CATEGORIES } from "./ingredients";

describe("재료 카탈로그", () => {
  it("확장 재료의 ID가 고유하고 다섯 카테고리 중 하나에 속한다", () => {
    const categoryIds = INGREDIENT_CATEGORIES.map(({ id }) => id);
    const ingredientIds = INGREDIENTS.map(({ id }) => id);

    expect(categoryIds).toEqual([
      "vegetable",
      "protein",
      "eggDairy",
      "carb",
      "seasoning",
    ]);
    expect(INGREDIENTS.length).toBeGreaterThan(28);
    expect(new Set(ingredientIds).size).toBe(INGREDIENTS.length);
    expect(
      INGREDIENTS.every(({ category }) => categoryIds.includes(category)),
    ).toBe(true);
  });
});
