import { describe, expect, it } from "vitest";
import type { Recipe, RecipeDifficulty } from "../types/recipe";
import { getRecipeCandidates, pickRecipeCandidate } from "./recommendRecipe";
import { RECIPES } from "../data/recipes";

const makeRecipe = (
  id: string,
  requiredIngredients: string[],
  optionalIngredients: string[] = [],
  difficulty: RecipeDifficulty = "easy",
): Recipe => ({
  id,
  name: id,
  requiredIngredients,
  optionalIngredients,
  steps: ["첫 단계", "둘째 단계", "셋째 단계"],
  difficulty,
});

describe("메뉴 추천 계산", () => {
  it.each([
    "kimchi cooked_rice egg green_onion",
    "potato onion carrot cooking_oil",
    "pork kimchi onion garlic gochujang cooked_rice",
    "chicken potato onion carrot soy_sauce",
    "mushroom tofu zucchini green_onion soy_sauce",
    "shrimp egg tofu chives garlic",
    "pasta mushroom milk cheese butter",
    "beef onion bell_pepper soy_sauce garlic",
    "cabbage bean_sprout pork gochujang sesame_oil",
    "spinach chicken egg cooked_rice sesame_oil",
  ])("대표 조합 %s에 주재료 60% 이상 후보를 제공한다", (ingredients) => {
    const matches = getRecipeCandidates(ingredients.split(" "));
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every(({ matchRate, matchBasis }) => matchRate >= 0.6 && matchBasis === "main")).toBe(true);
  });
  it("김치볶음밥은 원문 주재료로 계산하고 부족한 부재료·양념을 모두 남긴다", () => {
    const recipe = RECIPES.find(({ id }) => id === "epis_320")!;
    const [match] = getRecipeCandidates(["kimchi", "cooked_rice", "egg", "green_onion"], [recipe]);
    expect(match.matchRate).toBe(1);
    expect(match.matchBasis).toBe("main");
    expect(new Set(match.missingRequiredIngredientIds)).toEqual(new Set(["potato", "onion", "ham", "cooking_oil", "salt", "black_pepper"]));
    expect(getRecipeCandidates(["salt", "black_pepper", "cooking_oil"], [recipe])).toEqual([]);
  });

  it("구분 없는 원문은 양념을 제외하되 미지원 재료를 분모와 부족 목록에 남긴다", () => {
    const recipe = { ...makeRecipe("fallback", ["tofu", "onion", "soy_sauce", "salt"]), sourceIngredientText: "두부 100g, 양파 50g, 간장 1T, 소금 약간, 전복 1개", unmappedRequiredIngredients: ["전복"] };
    const [match] = getRecipeCandidates(["tofu", "onion"], [recipe]);
    expect(match.matchRate).toBe(2 / 3);
    expect(match.missingRequiredIngredientIds).toEqual(["soy_sauce", "salt"]);
    expect(match.missingUnmappedRequiredIngredients).toEqual(["전복"]);
    expect(getRecipeCandidates(["tofu"], [recipe])).toEqual([]);
  });

  it("미지원 주재료는 계산에 남기고 미지원 부재료는 부족 목록에 남긴다", () => {
    const recipe = { ...makeRecipe("roles", ["tofu", "soy_sauce"]), sourceIngredientText: "주재료: 두부 100g\n주재료: 전복 1개\n부재료: 황태 10g\n양념: 간장 1T", unmappedRequiredIngredients: ["전복", "황태"] };
    const [match] = getRecipeCandidates(["tofu"], [recipe], { minimumMatchRate: 0.5 });
    expect(match.matchRate).toBe(0.5);
    expect(match.missingUnmappedRequiredIngredients).toEqual(["전복", "황태"]);
    expect(getRecipeCandidates(["tofu"], [recipe])).toEqual([]);
  });

  it("양념만 있는 레시피는 양념 보유만으로 후보가 되지 않는다", () => {
    const recipe = { ...makeRecipe("seasonings", ["soy_sauce", "salt"]), sourceIngredientText: "주재료: 간장 1T\n주재료: 소금 1t" };
    expect(getRecipeCandidates(["soy_sauce", "salt"], [recipe])).toEqual([]);
  });
  it("원문 분량 단위가 달라도 이미 확인된 재료명을 그대로 사용한다", () => {
    const recipe = { ...makeRecipe("quantities", ["cabbage", "milk", "tofu"]), sourceIngredientText: "주재료: 배추 2잎\n주재료: 우유 1cup\n주재료: 두부 반모" };
    expect(getRecipeCandidates(["cabbage", "milk", "tofu"], [recipe])[0].matchRate).toBe(1);
  });
  it("필수 재료의 보유 목록, 부족 목록과 60% 매칭률을 계산한다", () => {
    const recipe = makeRecipe(
      "sixty_percent",
      ["a", "b", "c", "d", "e"],
      ["optional"],
    );
    const [match] = getRecipeCandidates(
      ["a", "b", "c", "optional"],
      [recipe],
    );

    expect(match.matchedRequiredIngredientIds).toEqual(["a", "b", "c"]);
    expect(match.missingRequiredIngredientIds).toEqual(["d", "e"]);
    expect(match.matchRate).toBe(0.6);
    expect(getRecipeCandidates(["optional"], [recipe])).toEqual([]);
  });

  it("필수 재료 매칭률이 60% 미만이면 후보에서 제외한다", () => {
    const recipe = makeRecipe("below_threshold", ["a", "b", "c"]);

    expect(getRecipeCandidates(["a"], [recipe])).toEqual([]);
  });

  it("사용자가 고른 매칭률 이상인 후보만 포함한다", () => {
    const candidates = getRecipeCandidates(
      ["a", "b", "c", "d"],
      [
        makeRecipe("eighty_percent", ["a", "b", "c", "d", "e"]),
        makeRecipe("sixty_percent", ["a", "b", "c", "d", "e", "f"]),
        makeRecipe("full_match", ["a", "b", "c", "d"]),
      ],
      { minimumMatchRate: 0.8 },
    );

    expect(candidates.map(({ recipe }) => recipe.id)).toEqual([
      "eighty_percent",
      "full_match",
    ]);
    expect(
      getRecipeCandidates(
        ["a", "b", "c", "d"],
        [
          makeRecipe("eighty_percent", ["a", "b", "c", "d", "e"]),
          makeRecipe("full_match", ["a", "b", "c", "d"]),
        ],
        { minimumMatchRate: 1 },
      ).map(({ recipe }) => recipe.id),
    ).toEqual(["full_match"]);
  });

  it("매칭률과 난이도 필터를 동시에 적용한다", () => {
    const candidates = getRecipeCandidates(
      ["a", "b", "c", "d"],
      [
        makeRecipe("easy_eighty", ["a", "b", "c", "d", "e"]),
        makeRecipe("normal_full", ["a", "b", "c", "d"], [], "normal"),
        makeRecipe("hard_full", ["a", "b", "c", "d"], [], "hard"),
      ],
      { minimumMatchRate: 0.8, difficultyFilter: "easy" },
    );

    expect(candidates.map(({ recipe }) => recipe.id)).toEqual(["easy_eighty"]);
  });

  it("선택 목록에 없는 필수 재료도 매칭률과 부족 목록에 포함한다", () => {
    const recipe: Recipe = {
      ...makeRecipe("unmapped", ["tofu", "tomato", "onion"]),
      unmappedRequiredIngredients: ["황태", "전복"],
    };
    const [match] = getRecipeCandidates(["tofu", "tomato", "onion"], [recipe]);

    expect(match.matchRate).toBe(0.6);
    expect(match.missingUnmappedRequiredIngredients).toEqual(["황태", "전복"]);
    expect(getRecipeCandidates(["tofu", "tomato"], [recipe])).toEqual([]);
  });

  it("다시 뽑을 때 후보가 둘 이상이면 직전 메뉴를 제외한다", () => {
    const candidates = getRecipeCandidates(
      ["a", "b", "c", "d", "e", "f"],
      [
        makeRecipe("first", ["a", "b", "c"]),
        makeRecipe("second", ["d", "e", "f"]),
      ],
    );

    expect(pickRecipeCandidate(candidates, "first", () => 0)?.recipe.id).toBe(
      "second",
    );
  });

  it("후보가 하나면 그 메뉴를 유지하고 후보가 없으면 null을 반환한다", () => {
    const [onlyCandidate] = getRecipeCandidates(
      ["a", "b", "c"],
      [makeRecipe("only", ["a", "b", "c"])],
    );

    expect(pickRecipeCandidate([onlyCandidate], "only", () => 0)).toBe(
      onlyCandidate,
    );
    expect(pickRecipeCandidate([], undefined, () => 0)).toBeNull();
  });
});
