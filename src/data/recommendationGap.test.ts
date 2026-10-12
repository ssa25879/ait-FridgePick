import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "./ingredients";
import { RECIPES } from "./recipes";
import { PUBLIC_RECIPES } from "./publicRecipes";
import { EPIS_RECIPES } from "./episRecipes";
import { mapRecipeIngredientName } from "./recipeCatalog";
import { getRecipeCandidates } from "../utils/recommendRecipe";
import { isRecipeReady } from "../utils/recipeReadiness";

// RGC-01 baseline measured on 2026-10-12 before the first mapping batch.
const BASELINE = { unmappedRecipes: 1218, allSelectedCandidates: 938, allSelectedReady: 126 };

const FIRST_BATCH = [
  { id: "oyster_sauce", name: "굴소스", category: "seasoning", aliases: ["굴소스", "청정원굴소스"] },
  { id: "ketchup", name: "케첩", category: "seasoning", aliases: ["토마토케첩", "케첩"] },
  { id: "celery", name: "셀러리", category: "vegetable", aliases: ["셀러리", "샐러리"] },
  { id: "leaf_lettuce", name: "상추", category: "vegetable", aliases: ["상추", "상추잎"] },
  { id: "laver", name: "김", category: "vegetable", aliases: ["김", "구운김", "김밥용김", "김가루"] },
  { id: "mussel", name: "홍합", category: "protein", aliases: ["홍합", "홍합살"] },
  { id: "chestnut", name: "밤", category: "vegetable", aliases: ["밤", "깐밤", "생밤"] },
  { id: "salted_shrimp", name: "새우젓", category: "seasoning", aliases: ["새우젓"] },
  { id: "perilla_powder", name: "들깻가루", category: "seasoning", aliases: ["들깻가루", "들깨가루", "거피들깨가루", "거피한들깨가루"] },
  { id: "frying_mix", name: "튀김가루", category: "carb", aliases: ["튀김가루"] },
  { id: "bracken", name: "고사리", category: "vegetable", aliases: ["고사리"] },
  { id: "bellflower_root", name: "도라지", category: "vegetable", aliases: ["도라지", "통도라지"] },
  { id: "mustard", name: "머스터드", category: "seasoning", aliases: ["머스터드", "디종머스터드"] },
  { id: "mackerel", name: "고등어", category: "protein", aliases: ["고등어", "냉동고등어", "손질된고등어"] },
  { id: "rice_cake", name: "떡", category: "carb", aliases: ["떡", "떡볶이떡", "가래떡", "떡국떡", "흰떡", "조랭이떡"] },
] as const;

// Everyday combinations used as the before/after comparison set (all had 0 ready recipes before).
const EVERYDAY_COMBOS: Record<string, string[]> = {
  김치볶음: ["김치", "돼지고기", "대파", "양파", "식용유", "간장"],
  계란밥: ["밥", "달걀", "간장", "참기름"],
  두부조림: ["두부", "대파", "간장", "고춧가루", "마늘"],
  감자볶음: ["감자", "양파", "당근", "소금", "식용유"],
  라면: ["라면", "달걀", "대파"],
  된장찌개: ["된장", "두부", "애호박", "양파", "대파", "마늘"],
  파스타: ["파스타면", "마늘", "식용유", "소금"],
  닭요리: ["닭고기", "감자", "당근", "양파", "간장"],
  샐러드: ["양상추", "토마토", "오이"],
  간단: ["달걀", "우유", "식빵"],
};

const idsByName = new Map(INGREDIENTS.map(({ id, name }) => [name, id]));
const toIds = (names: string[]) => names.map((name) => idsByName.get(name)!);

describe("RGC first mapping batch", () => {
  it.each(FIRST_BATCH)("$name is a selectable ingredient with source-backed aliases", ({ id, name, category, aliases }) => {
    expect(INGREDIENTS).toContainEqual({ id, name, category });
    for (const alias of aliases) expect(mapRecipeIngredientName(alias)).toBe(id);
  });

  it("maps 스파게티 to the existing pasta ingredient", () => {
    expect(mapRecipeIngredientName("스파게티")).toBe("pasta");
  });

  it("keeps ambiguous or derived names unmapped", () => {
    for (const name of ["육수", "닭육수", "기름", "고추기름", "호박", "호박잎", "새우젓국", "꽃상추", "허니머스터드", "백김치", "튀김"]) {
      expect(mapRecipeIngredientName(name), name).toBeUndefined();
    }
  });

  it("keeps ingredient ids unique", () => {
    expect(new Set(INGREDIENTS.map(({ id }) => id)).size).toBe(INGREDIENTS.length);
    expect(new Set(INGREDIENTS.map(({ name }) => name)).size).toBe(INGREDIENTS.length);
  });

  it("does not change source quantities, steps or provenance", () => {
    const source = new Map([...PUBLIC_RECIPES, ...EPIS_RECIPES].map((recipe) => [recipe.id, recipe]));
    expect(RECIPES).toHaveLength(source.size);
    for (const recipe of RECIPES) {
      const original = source.get(recipe.id)!;
      expect(recipe.name).toBe(original.name);
      expect(recipe.steps).toEqual(original.steps);
      expect(recipe.sourceIngredientText).toBe(original.sourceIngredientText);
      expect(recipe.source).toEqual(original.source);
    }
  });

  it("reduces unsupported-ingredient recipes and raises ready recipes against the baseline", () => {
    const unmappedRecipes = RECIPES.filter((recipe) => (recipe.unmappedRequiredIngredients ?? []).length > 0).length;
    const all = getRecipeCandidates(INGREDIENTS.map(({ id }) => id));
    expect(unmappedRecipes).toBeLessThan(BASELINE.unmappedRecipes);
    expect(all.length).toBeGreaterThanOrEqual(BASELINE.allSelectedCandidates);
    expect(all.filter(isRecipeReady).length).toBeGreaterThan(BASELINE.allSelectedReady);
  });

  it("never marks a reviewed recipe as ready", () => {
    const all = getRecipeCandidates(INGREDIENTS.map(({ id }) => id), RECIPES, { minimumMatchRate: 0 });
    for (const match of all) {
      if ((match.recipe.ingredientReviewNotes ?? []).length > 0) expect(isRecipeReady(match), match.recipe.id).toBe(false);
    }
  });

  it("does not lose candidates for any everyday combination", () => {
    for (const [label, names] of Object.entries(EVERYDAY_COMBOS)) {
      expect(getRecipeCandidates(toIds(names)).length, label).toBeGreaterThan(0);
    }
  });
});
