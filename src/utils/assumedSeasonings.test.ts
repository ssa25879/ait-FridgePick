import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "../data/ingredients";
import { ASSUMED_SEASONING_IDS, isAssumedSeasoning } from "./assumedSeasonings";

describe("가정하는 기본 양념", () => {
  it("소금·설탕·후추·식용유·간장·참기름·고춧가루·참깨·식초 9개다", () => {
    const names = ASSUMED_SEASONING_IDS.map((id) => INGREDIENTS.find((item) => item.id === id)?.name);

    expect(names).toEqual(["소금", "설탕", "후추", "식용유", "간장", "참기름", "고춧가루", "참깨", "식초"]);
  });

  it("모든 ID가 실제 양념 카테고리 재료다", () => {
    for (const id of ASSUMED_SEASONING_IDS) {
      expect(INGREDIENTS.find((item) => item.id === id)?.category, id).toBe("seasoning");
    }
  });

  it("목록에 있는 양념만 가정한다", () => {
    expect(isAssumedSeasoning("salt")).toBe(true);
    expect(isAssumedSeasoning("soy_sauce")).toBe(true);
  });

  it("고추장·된장·굴소스 같은 다른 양념과 마늘·대파는 가정하지 않는다", () => {
    for (const id of ["gochujang", "doenjang", "oyster_sauce", "garlic", "green_onion", "kimchi"]) {
      expect(isAssumedSeasoning(id), id).toBe(false);
    }
  });
});
