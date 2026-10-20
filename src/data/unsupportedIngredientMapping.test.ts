import { describe, expect, it } from "vitest";
import { EPIS_RECIPES } from "./episRecipes";
import { PUBLIC_RECIPES } from "./publicRecipes";
import { mapRecipeIngredientName } from "./recipeCatalog";
import { RECIPES } from "./recipes";

// 미지원 필수 재료 매핑 1차(UIM-02, 05, 06, 08): 원문으로 뜻을 확인한 별칭만 추가한다.
describe("1차 별칭 (원문으로 확인한 이름)", () => {
  it.each([
    ["통마늘", "garlic"],
    ["배춧잎", "napa_cabbage"],
    ["달걀노른자", "egg"],
    ["계란노른자", "egg"],
    ["달걀흰자", "egg"],
  ])("%s는 %s로 매핑한다", (name, id) => {
    expect(mapRecipeIngredientName(name)).toBe(id);
  });

  it("공백이 있어도 같은 재료로 매핑한다", () => {
    expect(mapRecipeIngredientName("달걀 노른자")).toBe("egg");
  });
});

describe("원문으로 뜻을 확인하지 못한 이름은 매핑하지 않는다", () => {
  it.each(["호박", "기름", "육수", "닭육수", "다시물", "쌀뜨물", "물전분"])("%s는 미지원으로 둔다", (name) => {
    expect(mapRecipeIngredientName(name)).toBeUndefined();
  });
});

describe("별칭 적용 결과", () => {
  const byId = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));

  it("밥핫도그의 달걀흰자는 달걀로 연결되고 미지원 목록에서 빠진다", () => {
    const recipe = byId.get("fsk_443")!;

    expect(recipe.requiredIngredients).toContain("egg");
    expect(recipe.unmappedRequiredIngredients ?? []).not.toContain("달걀흰자");
  });

  it("통마늘장아찌의 통마늘은 마늘로, 우거지된장찌개의 배춧잎은 배추로 연결된다", () => {
    expect(byId.get("epis_418")!.requiredIngredients).toContain("garlic");
    expect(byId.get("epis_75")!.requiredIngredients).toContain("napa_cabbage");
    expect(byId.get("epis_75")!.requiredIngredients).not.toContain("cabbage");
  });

  it("호박이 필수 재료인 레시피는 호박을 미지원으로 유지한다", () => {
    expect(byId.get("epis_341")!.unmappedRequiredIngredients).toContain("호박");
    expect(byId.get("epis_341")!.requiredIngredients).not.toContain("zucchini");
    expect(byId.get("epis_341")!.requiredIngredients).not.toContain("pumpkin");
  });

  it("원문 재료 목록은 변경하지 않는다", () => {
    const originals = new Map([...PUBLIC_RECIPES, ...EPIS_RECIPES].map((recipe) => [recipe.id, recipe.sourceIngredientText]));
    for (const id of ["fsk_443", "epis_418", "epis_75", "epis_341"]) {
      expect(byId.get(id)!.sourceIngredientText).toBe(originals.get(id));
    }
  });
});
