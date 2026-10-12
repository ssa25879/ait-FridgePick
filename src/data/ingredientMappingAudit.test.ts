import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "./ingredients";
import { RECIPES } from "./recipes";
import { mapRecipeIngredientName } from "./recipeCatalog";
import { getRecipeCandidates } from "../utils/recommendRecipe";

// RSA-04 audit result: 배추 (napa cabbage) was mapped to 양배추 (cabbage), so selecting 양배추
// made napa-cabbage recipes look satisfiable. Other risky aliases are recorded in
// specs/26-10-12_feature_recipe_search_accuracy/decisions.md as accepted or preserved.
const NAPA_NAMES = ["배추", "알배추", "배추잎"];
const CABBAGE_NAMES = ["양배추", "적양배추"];

// Same exact-name rule as the data layer: "얼갈이 배추" and "절인 배추" are different ingredients.
function sourceTokens(text: string | undefined): string[] {
  return (text ?? "")
    .split(/[,\n]/)
    .map((segment) => segment.replace(/^\s*(주재료|부재료|양념|재료)\s*[:：]\s*/, "").replace(/\s*[\d½¼¾].*$/, "").replace(/\s+/g, ""))
    .filter(Boolean);
}

describe("RSA-04 배추와 양배추를 구분한다", () => {
  it("배추는 별도 선택 재료이고 양배추와 다른 ID로 연결된다", () => {
    expect(INGREDIENTS).toContainEqual({ id: "napa_cabbage", name: "배추", category: "vegetable" });
    for (const name of NAPA_NAMES) expect(mapRecipeIngredientName(name), name).toBe("napa_cabbage");
    for (const name of [...CABBAGE_NAMES]) expect(mapRecipeIngredientName(name), name).toBe("cabbage");
    expect(mapRecipeIngredientName("배추김치")).toBe("kimchi");
  });

  it("원문에 배추만 있는 레시피는 양배추가 아니라 배추를 필요로 한다", () => {
    const napaOnly = RECIPES.filter((recipe) => {
      const tokens = sourceTokens(recipe.sourceIngredientText);
      return tokens.some((token) => NAPA_NAMES.includes(token)) && !tokens.some((token) => CABBAGE_NAMES.includes(token));
    });
    expect(napaOnly.length).toBeGreaterThanOrEqual(25);
    for (const recipe of napaOnly) {
      expect(recipe.requiredIngredients, recipe.name).toContain("napa_cabbage");
      expect(recipe.requiredIngredients, recipe.name).not.toContain("cabbage");
      expect(recipe.optionalIngredients ?? [], recipe.name).not.toContain("cabbage");
    }
  });

  it("원문에 양배추만 있는 레시피는 배추를 요구하지 않는다", () => {
    const cabbageOnly = RECIPES.filter((recipe) => {
      const tokens = sourceTokens(recipe.sourceIngredientText);
      return tokens.some((token) => CABBAGE_NAMES.includes(token)) && !tokens.some((token) => NAPA_NAMES.includes(token));
    });
    expect(cabbageOnly.length).toBeGreaterThan(0);
    for (const recipe of cabbageOnly) expect(recipe.requiredIngredients, recipe.name).not.toContain("napa_cabbage");
  });

  it("양배추만 선택하면 배추 전용 레시피는 주재료가 맞지 않는다", () => {
    const napaOnlyIds = new Set(
      RECIPES.filter((recipe) => recipe.requiredIngredients.includes("napa_cabbage") && !recipe.requiredIngredients.includes("cabbage")).map(({ id }) => id),
    );
    const matches = getRecipeCandidates(["cabbage"]);
    for (const match of matches) {
      if (napaOnlyIds.has(match.recipe.id)) expect(match.matchedRequiredIngredientIds, match.recipe.name).not.toContain("cabbage");
    }
  });
});
