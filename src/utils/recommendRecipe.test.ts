import { describe, expect, it } from "vitest";
import type { Recipe, RecipeDifficulty } from "../types/recipe";
import { getRecipeCandidates, pickRecipeCandidate } from "./recommendRecipe";

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
