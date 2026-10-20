import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "../data/ingredients";
import type { Recipe } from "../types/recipe";
import {
  getMissingIngredientCount,
  getRecipeCandidates,
  getTopCandidatePool,
  pickRecipeCandidate,
  type RecipeMatch,
} from "./recommendRecipe";
import { isRecipeReady } from "./recipeReadiness";

// RSA-01 golden set: everyday combinations plus a basic pantry (synthetic, not real user data).
const PANTRY = ["소금", "설탕", "후추", "식용유", "간장", "참기름", "고춧가루", "참깨", "식초", "마늘", "대파"];
const GOLDEN_COMBOS: Record<string, string[]> = {
  김치볶음: ["김치", "돼지고기", "양파"],
  계란밥: ["밥", "달걀"],
  두부조림: ["두부", "양파"],
  감자볶음: ["감자", "양파", "당근"],
  라면: ["라면", "달걀"],
  된장찌개: ["된장", "두부", "애호박", "양파", "버섯"],
  파스타: ["파스타면", "양파", "베이컨"],
  닭요리: ["닭고기", "감자", "당근", "양파"],
  샐러드: ["양상추", "토마토", "오이"],
  간단: ["달걀", "우유", "식빵"],
};

const idByName = new Map(INGREDIENTS.map(({ id, name }) => [name, id]));
const selection = (names: string[]) => [...names, ...PANTRY].map((name) => idByName.get(name)!);

// Evaluate the picker over an even grid of random values so the expectation is deterministic.
const GRID = Array.from({ length: 200 }, (_, i) => (i + 0.5) / 200);
function exposure(candidates: RecipeMatch[], previousId?: string) {
  const picks = GRID.map((value) => pickRecipeCandidate(candidates, previousId, () => value)!);
  const meanMissing = picks.reduce((sum, match) => sum + getMissingIngredientCount(match), 0) / picks.length;
  return { meanMissing, distinct: new Set(picks.map(({ recipe }) => recipe.id)).size };
}
const uniformMeanMissing = (candidates: RecipeMatch[]) =>
  candidates.reduce((sum, match) => sum + getMissingIngredientCount(match), 0) / candidates.length;

function match(id: string, missing: number, matchRate = 1): RecipeMatch {
  const recipe: Recipe = { id, name: id, requiredIngredients: [], steps: ["a"], difficulty: "easy" };
  return {
    recipe,
    matchedRequiredIngredientIds: [],
    missingRequiredIngredientIds: Array.from({ length: missing }, (_, i) => `m${i}`),
    assumedSeasoningIds: [],
    missingUnmappedRequiredIngredients: [],
    matchRate,
  };
}

describe("추천 선택 순수 함수", () => {
  it("부족 재료 수는 부족 필수 재료와 부족 미지원 재료의 합이다", () => {
    const item = { ...match("x", 2), missingUnmappedRequiredIngredients: ["황태"] };
    expect(getMissingIngredientCount(item)).toBe(3);
  });

  it("후보 풀은 부족이 적은 순, 같으면 매칭률이 높은 순으로 상위 max(5, 25%)개다", () => {
    const candidates = Array.from({ length: 24 }, (_, i) => match(`r${i}`, 24 - i, 1));
    const pool = getTopCandidatePool(candidates);
    expect(pool).toHaveLength(6);
    expect(pool.map(({ recipe }) => recipe.id)).toEqual(["r23", "r22", "r21", "r20", "r19", "r18"]);
    const tie = getTopCandidatePool([match("low", 1, 0.6), match("high", 1, 0.9), match("few", 0, 0.6)]);
    expect(tie.map(({ recipe }) => recipe.id)).toEqual(["few", "high", "low"]);
  });

  it("후보가 5개 이하이면 풀은 후보 전체이고 입력 배열은 바뀌지 않는다", () => {
    const candidates = [match("c", 3), match("a", 1), match("b", 2)];
    const before = candidates.map(({ recipe }) => recipe.id);
    expect(getTopCandidatePool(candidates)).toHaveLength(3);
    expect(candidates.map(({ recipe }) => recipe.id)).toEqual(before);
  });

  it("직전 메뉴는 풀에 있어도 제외하고 풀이 비면 전체에서 고른다", () => {
    const candidates = [match("best", 0), match("good", 1), match("ok", 2)];
    for (const value of GRID) {
      expect(pickRecipeCandidate(candidates, "best", () => value)?.recipe.id).not.toBe("best");
    }
    expect(pickRecipeCandidate([match("only", 0)], "only", () => 0)?.recipe.id).toBe("only");
  });

  it("이름이 같은 다른 레시피도 직전 메뉴와 같은 이름이면 다시 뽑기에서 제외한다", () => {
    const first = match("dup_a", 0);
    first.recipe.name = "호박죽";
    const sameName = match("dup_b", 0);
    sameName.recipe.name = "호박죽";
    const other = match("other", 1);
    other.recipe.name = "된장국";
    for (const value of GRID) {
      expect(pickRecipeCandidate([first, sameName, other], "dup_a", () => value)?.recipe.name).toBe("된장국");
    }
    // If only same-name recipes remain, fall back to the id rule instead of returning nothing.
    expect(pickRecipeCandidate([first, sameName], "dup_a", () => 0)?.recipe.id).toBe("dup_b");
  });

  it("후보 집합을 바꾸지 않는다: 선택 결과는 항상 입력 후보 중 하나다", () => {
    const candidates = Array.from({ length: 40 }, (_, i) => match(`r${i}`, i % 7));
    const ids = new Set(candidates.map(({ recipe }) => recipe.id));
    for (const value of GRID) expect(ids.has(pickRecipeCandidate(candidates, undefined, () => value)!.recipe.id)).toBe(true);
  });
});

describe("RSA-03 일상 조합 노출 품질", () => {
  it.each(Object.entries(GOLDEN_COMBOS))("%s: 노출 메뉴의 평균 부족 재료가 균등 무작위의 60% 이하이고 다양성을 유지한다", (_label, names) => {
    const candidates = getRecipeCandidates(selection(names));
    expect(candidates.length).toBeGreaterThanOrEqual(5);
    const result = exposure(candidates);
    expect(result.meanMissing).toBeLessThanOrEqual(uniformMeanMissing(candidates) * 0.6);
    expect(result.distinct).toBeGreaterThanOrEqual(5);
  });

  it("준비 완료 판정과 후보 집합은 선택 방식과 무관하다", () => {
    for (const names of Object.values(GOLDEN_COMBOS)) {
      const candidates = getRecipeCandidates(selection(names));
      const ready = candidates.filter(isRecipeReady);
      expect(ready.every((item) => getMissingIngredientCount(item) === 0)).toBe(true);
      for (const item of ready) expect((item.recipe.ingredientReviewNotes ?? []).length).toBe(0);
    }
  });

  it("다시 뽑기를 연속 3번 해도 서로 다른 메뉴 3개를 만날 수 있다", () => {
    const candidates = getRecipeCandidates(selection(GOLDEN_COMBOS.닭요리));
    const first = pickRecipeCandidate(candidates, undefined, () => 0)!;
    const second = pickRecipeCandidate(candidates, first.recipe.id, () => 0)!;
    const third = pickRecipeCandidate(candidates, second.recipe.id, () => 0.5)!;
    expect(new Set([first.recipe.id, second.recipe.id, third.recipe.id]).size).toBe(3);
  });
});
