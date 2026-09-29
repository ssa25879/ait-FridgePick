import { describe, expect, it } from "vitest";
import { INGREDIENTS, INGREDIENT_CATEGORIES } from "./ingredients";

describe("재료 카탈로그", () => {
  it("28개 재료의 ID가 고유하고 다섯 카테고리 중 하나에 속한다", () => {
    const categoryIds = INGREDIENT_CATEGORIES.map(({ id }) => id);
    const ingredientIds = INGREDIENTS.map(({ id }) => id);

    expect(categoryIds).toEqual([
      "vegetable",
      "meat",
      "eggDairy",
      "carb",
      "seasoning",
    ]);
    expect(INGREDIENTS).toHaveLength(28);
    expect(new Set(ingredientIds).size).toBe(28);
    expect(
      INGREDIENTS.every(({ category }) => categoryIds.includes(category)),
    ).toBe(true);
  });
});
