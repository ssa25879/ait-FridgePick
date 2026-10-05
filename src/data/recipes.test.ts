import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "./ingredients";
import { RECIPES, SOURCED_REPLACEMENT_RECIPES } from "./recipes";
import { PUBLIC_RECIPES, PUBLIC_RECIPE_IMPORT_SUMMARY } from "./publicRecipes";
import { EPIS_RECIPES, EPIS_RECIPE_IMPORT_SUMMARY } from "./episRecipes";
import { getRecipeCandidates } from "../utils/recommendRecipe";
import { inferRecipeDifficulty } from "../utils/recipeDifficulty";
import { mapRecipeIngredientName } from "./recipeCatalog";
import { isRecipeReady } from "../utils/recipeReadiness";
import { RECIPE_STEP_REQUIRED_INGREDIENTS } from "./recipeStepIngredients";

describe("레시피 카탈로그", () => {

  it("검토된 추가 준비 재료는 실제 조리 단계와 대응하며 원래 필요한 재료를 제거하지 않는다", () => {
    const originals = new Map([...PUBLIC_RECIPES, ...EPIS_RECIPES].map((recipe) => [recipe.id, recipe]));
    for (const [id, names] of Object.entries(RECIPE_STEP_REQUIRED_INGREDIENTS)) {
      const original = originals.get(id)!;
      const current = RECIPES.find((recipe) => recipe.id === id)!;
      expect(current.ingredientReviewNotes?.length, id).toBeGreaterThan(0);
      for (const name of names) {
        expect(original.steps.join("").replace(/\s/g, ""), `${id}:${name}`).toContain(name.replace(/\s/g, ""));
      }
      expect(current.requiredIngredients, id).toEqual(expect.arrayContaining(original.requiredIngredients));
      expect(current.sourceIngredientText, id).toBe(original.sourceIngredientText);
      expect(current.steps, id).toEqual(original.steps);
    }
  });

  it("두부 달걀전에서 단계에만 적힌 달걀과 소금을 실제 추가 준비 재료로 계산한다", () => {
    const original = PUBLIC_RECIPES.find(({ id }) => id === "fsk_834")!;
    const current = RECIPES.find(({ id }) => id === "fsk_834")!;
    const [match] = getRecipeCandidates(original.requiredIngredients, [current], { minimumMatchRate: 0 });
    expect(match.missingRequiredIngredientIds).toEqual(expect.arrayContaining(["egg", "salt"]));
    const [selected] = getRecipeCandidates([...original.requiredIngredients, "egg", "salt"], [current], { minimumMatchRate: 0 });
    expect(selected.missingRequiredIngredientIds).toEqual([]);
    expect(isRecipeReady(selected)).toBe(false); // Missing source quantities still need checking.
    expect(original.requiredIngredients).not.toContain("egg");
  });

  it("채소치즈죽의 단계상 버터·우유와 미지원 육수를 준비 목록에 포함한다", () => {
    const original = EPIS_RECIPES.find(({ id }) => id === "epis_434")!;
    const current = RECIPES.find(({ id }) => id === "epis_434")!;
    const [match] = getRecipeCandidates(original.requiredIngredients, [current], { minimumMatchRate: 0 });
    expect(match.missingRequiredIngredientIds).toEqual(expect.arrayContaining(["butter", "milk"]));
    expect(match.missingUnmappedRequiredIngredients).toContain("육수");
    expect(current.sourceIngredientText).toBe(original.sourceIngredientText);
    expect(current.steps).toEqual(original.steps);
  });

  it("종류가 없는 조리 기름을 임의로 식용유와 같다고 판정하지 않는다", () => {
    const current = RECIPES.find(({ id }) => id === "fsk_1064")!;
    const [match] = getRecipeCandidates(INGREDIENTS.map(({ id }) => id), [current], { minimumMatchRate: 0 });
    expect(match.missingUnmappedRequiredIngredients).toContain("기름");
    expect(isRecipeReady(match)).toBe(false);
  });

  it("식약처 잔여 검토 116개에 확인 안내를 붙이고 원문을 보존한다", () => {
    const ids = ["fsk_89","fsk_163","fsk_219","fsk_220","fsk_231","fsk_237","fsk_245","fsk_258","fsk_260","fsk_261","fsk_263","fsk_267","fsk_277","fsk_297","fsk_300","fsk_307","fsk_331","fsk_342","fsk_357","fsk_363","fsk_377","fsk_378","fsk_393","fsk_396","fsk_410","fsk_415","fsk_425","fsk_448","fsk_454","fsk_486","fsk_494","fsk_508","fsk_514","fsk_538","fsk_557","fsk_559","fsk_563","fsk_565","fsk_566","fsk_567","fsk_581","fsk_582","fsk_583","fsk_585","fsk_586","fsk_587","fsk_588","fsk_596","fsk_597","fsk_602","fsk_608","fsk_620","fsk_628","fsk_631","fsk_647","fsk_657","fsk_666","fsk_667","fsk_693","fsk_709","fsk_728","fsk_791","fsk_804","fsk_805","fsk_809","fsk_814","fsk_827","fsk_832","fsk_849","fsk_853","fsk_859","fsk_869","fsk_878","fsk_881","fsk_886","fsk_909","fsk_917","fsk_958","fsk_987","fsk_993","fsk_1015","fsk_1017","fsk_1026","fsk_1042","fsk_1045","fsk_1046","fsk_1062","fsk_1066","fsk_1070","fsk_1074","fsk_1079","fsk_1082","fsk_1086","fsk_1098","fsk_2953","fsk_2958","fsk_2961","fsk_2964","fsk_2970","fsk_2979","fsk_2997","fsk_2999","fsk_3008","fsk_3066","fsk_3067","fsk_3069","fsk_3089","fsk_3174","fsk_3222","fsk_3260","fsk_3275","fsk_3278","fsk_3284","fsk_3286","fsk_3462","fsk_3568"];
    for (const id of ids) {
      const recipe = RECIPES.find((recipe) => recipe.id === id)!;
      const original = PUBLIC_RECIPES.find((recipe) => recipe.id === id)!;
      expect(recipe.ingredientReviewNotes?.length ?? 0, id).toBeGreaterThan(0);
      const [match] = getRecipeCandidates(INGREDIENTS.map(({ id }) => id), [recipe], { minimumMatchRate: 0 });
      expect(isRecipeReady(match), id).toBe(false);
      expect(recipe.sourceIngredientText, id).toBe(original.sourceIngredientText);
      expect(recipe.steps, id).toEqual(original.steps);
      expect(recipe.source, id).toEqual(original.source);
    }
  });

  it("식약처 잔여 검토의 동의어·파생·비유·선택 문맥 142개를 일괄 누락으로 만들지 않는다", () => {
    const ids = ["fsk_18","fsk_36","fsk_114","fsk_121","fsk_125","fsk_181","fsk_218","fsk_228","fsk_230","fsk_232","fsk_253","fsk_254","fsk_280","fsk_296","fsk_321","fsk_323","fsk_329","fsk_332","fsk_337","fsk_358","fsk_361","fsk_370","fsk_379","fsk_406","fsk_412","fsk_416","fsk_447","fsk_456","fsk_458","fsk_462","fsk_466","fsk_467","fsk_468","fsk_471","fsk_482","fsk_485","fsk_487","fsk_489","fsk_490","fsk_491","fsk_492","fsk_506","fsk_509","fsk_511","fsk_536","fsk_542","fsk_561","fsk_564","fsk_572","fsk_573","fsk_578","fsk_589","fsk_590","fsk_593","fsk_595","fsk_615","fsk_617","fsk_618","fsk_622","fsk_630","fsk_633","fsk_636","fsk_639","fsk_643","fsk_651","fsk_652","fsk_662","fsk_669","fsk_673","fsk_690","fsk_696","fsk_700","fsk_704","fsk_725","fsk_732","fsk_754","fsk_757","fsk_759","fsk_760","fsk_764","fsk_785","fsk_788","fsk_792","fsk_876","fsk_889","fsk_907","fsk_919","fsk_920","fsk_939","fsk_951","fsk_960","fsk_966","fsk_967","fsk_969","fsk_972","fsk_980","fsk_981","fsk_1010","fsk_1014","fsk_1021","fsk_1028","fsk_1031","fsk_1059","fsk_1063","fsk_1065","fsk_1075","fsk_1077","fsk_1078","fsk_1085","fsk_1095","fsk_1104","fsk_1119","fsk_1131","fsk_2952","fsk_2969","fsk_2972","fsk_2977","fsk_2978","fsk_3001","fsk_3007","fsk_3058","fsk_3060","fsk_3063","fsk_3074","fsk_3081","fsk_3086","fsk_3092","fsk_3167","fsk_3186","fsk_3193","fsk_3205","fsk_3228","fsk_3233","fsk_3266","fsk_3270","fsk_3280","fsk_3283","fsk_3363","fsk_3364","fsk_3367","fsk_3467","fsk_3569"];
    for (const id of ids) {
      const recipe = RECIPES.find((recipe) => recipe.id === id)!;
      expect(recipe.ingredientReviewNotes, id).toBeUndefined();
    }
  });
  it.each([
    "fsk_834", "fsk_32", "fsk_720", "fsk_2967", "fsk_1060",
    "fsk_1064", "fsk_1073", "fsk_1076", "fsk_1088", "fsk_836",
    "fsk_672", "fsk_575", "fsk_560",
  ])("식약처 원문 누락 확인 메뉴 %s를 준비 완료에서 제외하고 원본을 보존한다", (id) => {
    const recipe = RECIPES.find((recipe) => recipe.id === id)!;
    const original = PUBLIC_RECIPES.find((recipe) => recipe.id === id)!;
    const [match] = getRecipeCandidates(INGREDIENTS.map(({ id }) => id), [recipe]);
    expect(match.missingRequiredIngredientIds).toEqual([]);
    expect(match.missingUnmappedRequiredIngredients).toEqual(
      (recipe.unmappedRequiredIngredients ?? []),
    );
    expect(isRecipeReady(match)).toBe(false);
    expect(recipe.ingredientReviewNotes?.length ?? 0).toBeGreaterThan(0);
    expect(recipe.sourceIngredientText).toBe(original.sourceIngredientText);
    expect(recipe.steps).toEqual(original.steps);
    expect(recipe.source).toEqual(original.source);
  });

  it("식약처의 파생 재료·동의어·부정 조리법·선택 소스를 누락으로 오인하지 않는다", () => {
    for (const id of ["fsk_674", "fsk_579", "fsk_322", "fsk_526", "fsk_3237", "fsk_940", "fsk_3279", "fsk_614", "fsk_212"]) {
      const recipe = RECIPES.find((recipe) => recipe.id === id)!;
      const [match] = getRecipeCandidates(INGREDIENTS.map(({ id }) => id), [recipe]);
      expect(isRecipeReady(match), id).toBe(true);
      expect(recipe.ingredientReviewNotes, id).toBeUndefined();
    }
  });

  it("과정 원본으로 확인한 오탈자는 연결하되 원문과 다른 미지원 재료는 보존한다", () => {
    const cases = [
      ["epis_227", "돼기고기", "pork"], ["epis_223", "돼기고기", "pork"],
      ["epis_56", "돼기고기", "pork"], ["epis_54", "돼기고기", "pork"],
      ["epis_51", "돼기고기", "pork"], ["epis_49", "돼기고기", "pork"],
      ["epis_39665", "참쌀", "glutinous_rice"],
    ];
    for (const [id, spelling, ingredient] of cases) {
      const current = RECIPES.find((recipe) => recipe.id === id)!;
      const original = EPIS_RECIPES.find((recipe) => recipe.id === id)!;
      expect(original.unmappedRequiredIngredients, id).toContain(spelling);
      expect(current.requiredIngredients, id).toContain(ingredient);
      expect(current.unmappedRequiredIngredients, id).not.toContain(spelling);
      expect(current.sourceIngredientText, id).toBe(original.sourceIngredientText);
      expect(current.steps, id).toEqual(original.steps);
      expect(current.source, id).toEqual(original.source);
    }
    const recipe = RECIPES.find(({ id }) => id === "epis_54")!;
    const [match] = getRecipeCandidates(recipe.requiredIngredients.filter((id) => id !== "pork"), [recipe], { minimumMatchRate: 0 });
    expect(match.missingRequiredIngredientIds).toContain("pork");
    expect(isRecipeReady(match)).toBe(false);
  });

  it("보류 메뉴에서 새로 확인한 원문 불일치를 안내한다", () => {
    for (const id of ["epis_120441", "epis_419", "epis_56"]) {
      const current = RECIPES.find((recipe) => recipe.id === id)!;
      const original = EPIS_RECIPES.find((recipe) => recipe.id === id)!;
      expect(current.ingredientReviewNotes?.length ?? 0, id).toBeGreaterThan(0);
      expect(current.sourceIngredientText, id).toBe(original.sourceIngredientText);
      expect(current.steps, id).toEqual(original.steps);
    }
  });

  it("추가 원문 대조에서 확인된 불일치 안내를 원본 수정 없이 제공한다", () => {
    const ids = ["epis_39692", "epis_492", "epis_478", "epis_473", "epis_454", "epis_446", "epis_439", "epis_427", "epis_426", "epis_415", "epis_412", "epis_409", "epis_402", "epis_397", "epis_390", "epis_383", "epis_379", "epis_369", "epis_367", "epis_354", "epis_347", "epis_340", "epis_338", "epis_330", "epis_329", "epis_308", "epis_293", "epis_281", "epis_279", "epis_272", "epis_269", "epis_260", "epis_259", "epis_255", "epis_252", "epis_250", "epis_245", "epis_235", "epis_233", "epis_224", "epis_211", "epis_207", "epis_138", "epis_132", "epis_130", "epis_110", "epis_74", "epis_68", "epis_16", "epis_14", "epis_13", "epis_12", "epis_9", "epis_8", "epis_3", "epis_444", "epis_385", "epis_90846", "epis_69", "epis_324", "epis_345"];
    for (const id of ids) {
      const recipe = RECIPES.find((recipe) => recipe.id === id)!;
      const original = EPIS_RECIPES.find((recipe) => recipe.id === id)!;
      expect(recipe.ingredientReviewNotes?.length, id).toBeGreaterThan(0);
      expect(recipe.requiredIngredients, id).toEqual(expect.arrayContaining(original.requiredIngredients));
      expect(recipe.sourceIngredientText, id).toBe(original.sourceIngredientText);
      expect(recipe.steps, id).toEqual(original.steps);
      expect(recipe.source, id).toEqual(original.source);
    }
  });

  it("파생 재료와 명시적 대체 조리법을 원문 누락으로 추가하지 않는다", () => {
    for (const id of ["epis_6", "epis_296", "epis_55", "epis_451", "epis_445", "epis_333", "epis_1"]) {
      expect(RECIPES.find((recipe) => recipe.id === id)?.ingredientReviewNotes, id).toBeUndefined();
    }
  });

  it("원문 재료 누락이 확인된 메뉴는 모든 선택 재료를 보유해도 준비 완료로 분류하지 않는다", () => {
    const ids = ["epis_467", "epis_434", "epis_407", "epis_353", "epis_237", "epis_232", "epis_92", "epis_18"];
    const allIngredients = INGREDIENTS.map(({ id }) => id);
    for (const id of ids) {
      const recipe = RECIPES.find((recipe) => recipe.id === id)!;
      const [match] = getRecipeCandidates(allIngredients, [recipe]);
      expect(match.missingRequiredIngredientIds).toEqual([]);
      expect(match.missingUnmappedRequiredIngredients).toEqual(recipe.unmappedRequiredIngredients ?? []);
      expect(isRecipeReady(match), id).toBe(false);
      expect(recipe.ingredientReviewNotes?.length, id).toBeGreaterThan(0);
      const original = EPIS_RECIPES.find((recipe) => recipe.id === id)!;
      expect(recipe.requiredIngredients).toEqual(expect.arrayContaining(original.requiredIngredients));
      expect(recipe.sourceIngredientText).toBe(original.sourceIngredientText);
      expect(recipe.steps).toEqual(original.steps);
    }
  });

  it("목록 재료로 만든 육수와 감자에서 제거한 전분은 새 재료 누락으로 판정하지 않는다", () => {
    for (const id of ["epis_475", "epis_375", "epis_320"]) {
      const recipe = RECIPES.find((recipe) => recipe.id === id)!;
      const [match] = getRecipeCandidates(INGREDIENTS.map(({ id }) => id), [recipe]);
      expect(isRecipeReady(match), id).toBe(true);
      expect(recipe.ingredientReviewNotes).toBeUndefined();
    }
  });
  const ingredientIds = new Set(INGREDIENTS.map(({ id }) => id));

  it("생성 시 미지원이던 찬밥 표기를 현재 선택 가능한 밥으로 반영한다", () => {
    const original = PUBLIC_RECIPES.find(({ id }) => id === "fsk_673")!;
    const current = RECIPES.find(({ id }) => id === "fsk_673")!;
    expect(original.unmappedRequiredIngredients).toContain("찬밥");
    expect(current.requiredIngredients).toContain("cooked_rice");
    expect(current.unmappedRequiredIngredients).not.toContain("찬밥");
  });

  it("현재 매핑이 지원하는 표기를 미지원 필수 재료에 남기지 않는다", () => {
    const staleMappings = RECIPES.flatMap((recipe) =>
      (recipe.unmappedRequiredIngredients ?? [])
        .filter((name) => mapRecipeIngredientName(name))
        .map((name) => `${recipe.id}:${name}`),
    );
    expect(staleMappings).toEqual([]);
  });

  it("매핑을 갱신해도 원문 분량·단계·출처와 알 수 없는 재료는 보존한다", () => {
    const originals = new Map([...PUBLIC_RECIPES, ...EPIS_RECIPES].map((r) => [r.id, r]));
    for (const current of RECIPES) {
      const original = originals.get(current.id)!;
      expect(current.sourceIngredientText).toBe(original.sourceIngredientText);
      expect(current.steps).toEqual(original.steps);
      expect(current.source).toEqual(original.source);
      expect(current.unmappedRequiredIngredients).toEqual(expect.arrayContaining(
        (original.unmappedRequiredIngredients ?? []).filter((name) => !mapRecipeIngredientName(name)),
      ));
    }
  });

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
    expect(getRecipeCandidates(selected, PUBLIC_RECIPES).length).toBeGreaterThan(0);
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
