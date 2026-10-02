import { describe, expect, it } from "vitest";
import { inferRecipeDifficulty } from "./recipeDifficulty";

function makeRecipe(
  stepCount: number,
  requiredIngredientCount: number,
  unmappedIngredientCount = 0,
) {
  return {
    steps: Array.from({ length: stepCount }, (_, index) => `단계 ${index + 1}`),
    requiredIngredients: Array.from(
      { length: requiredIngredientCount },
      (_, index) => `ingredient_${index + 1}`,
    ),
    unmappedRequiredIngredients: Array.from(
      { length: unmappedIngredientCount },
      (_, index) => `미지원 재료 ${index + 1}`,
    ),
  };
}

describe("레시피 난이도 판정", () => {
  it("단계와 필수 재료가 각각 6개 이하면 쉬움으로 판정한다", () => {
    expect(inferRecipeDifficulty(makeRecipe(6, 6))).toBe("easy");
  });

  it("쉬움 경계를 넘지만 두 값이 10개 이하면 보통으로 판정한다", () => {
    expect(inferRecipeDifficulty(makeRecipe(7, 6))).toBe("normal");
    expect(inferRecipeDifficulty(makeRecipe(10, 10))).toBe("normal");
  });

  it("단계 또는 필수 재료가 10개를 넘으면 어려움으로 판정한다", () => {
    expect(inferRecipeDifficulty(makeRecipe(11, 6))).toBe("hard");
    expect(inferRecipeDifficulty(makeRecipe(10, 11))).toBe("hard");
  });

  it("미지원 필수 재료도 난이도 계산의 필수 재료 수에 포함한다", () => {
    expect(inferRecipeDifficulty(makeRecipe(6, 5, 1))).toBe("easy");
    expect(inferRecipeDifficulty(makeRecipe(6, 5, 2))).toBe("normal");
  });
});
