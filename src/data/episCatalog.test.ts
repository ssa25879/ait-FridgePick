import { describe, expect, it } from "vitest";
import { buildEpisCatalog, parseEpisCsv } from "./episCatalog";

const basic = [{ "레시피 코드 (SEQ_RECIPE)": "1", "레시피 이름(한글)": "계란찜", "분량": "2인분" }];
const ingredients = [
  { RECIPE_ID: 1, IRDNT_SN: 1, IRDNT_NM: "계란", IRDNT_CPCTY: "2개", IRDNT_TY_NM: "주재료" },
  { RECIPE_ID: 1, IRDNT_SN: 2, IRDNT_NM: "소금", IRDNT_CPCTY: "약간", IRDNT_TY_NM: "양념" },
];
const steps = [
  { "레시피 코드": "1", "요리설명순서": "2", "요리설명": "찐다.", "과정팁": "천천히, 약불로" },
  { "레시피 코드": "1", "요리설명순서": "1", "요리설명": "섞는다.", "과정팁": " " },
];

describe("EPIS 변환", () => {
  it("ID로 결합해 순서를 복원하고 원문 인분·양념·팁을 보존한다", () => {
    const result = buildEpisCatalog(basic, ingredients, steps);
    expect(result.recipes).toHaveLength(1);
    expect(result.recipes[0]).toMatchObject({ id: "epis_1", requiredIngredients: ["egg", "salt"], steps: ["섞는다.", "찐다.\n팁: 천천히, 약불로"] });
    expect(result.recipes[0].sourceIngredientText).toContain("2인분");
    expect(result.recipes[0].sourceIngredientText).toContain("소금 약간");
  });
  it("분량 누락 레시피는 임의 보충 없이 제외한다", () => {
    const result = buildEpisCatalog(basic, [{ ...ingredients[0], IRDNT_CPCTY: "" }], steps);
    expect(result.excluded).toEqual([{ sourceId: "1", reason: "missing-quantity" }]);
  });
  it("누락된 조리 단계와 중복 순번은 제외한다", () => {
    expect(buildEpisCatalog(basic, ingredients, [steps[0]]).excluded[0].reason).toBe("invalid-step-sequence");
    expect(buildEpisCatalog(basic, ingredients, [steps[1], steps[1]]).excluded[0].reason).toBe("invalid-step-sequence");
  });
  it("모호한 안심을 고기 종류로 추정하지 않는다", () => {
    const result = buildEpisCatalog(basic, [...ingredients, { ...ingredients[0], IRDNT_SN: 3, IRDNT_NM: "안심" }], steps);
    expect(result.recipes[0].unmappedRequiredIngredients).toEqual(["안심"]);
  });
  it("기본정보가 없는 행을 이름 없이 생성하지 않는다", () => {
    expect(buildEpisCatalog([], ingredients, steps).recipes).toEqual([]);
  });
  it("기본정보 ID 중복은 전체 변환을 중단한다", () => {
    expect(() => buildEpisCatalog([...basic, ...basic], ingredients, steps)).toThrow(/중복/);
  });
  it("인용되지 않은 마지막 팁의 쉼표를 보존하고 수정 수를 기록한다", () => {
    const result = parseEpisCsv('레시피 코드,요리설명순서,요리설명,과정 이미지 URL,과정팁\n"1","1","끓인다."," ",약불로,천천히', "steps");
    expect(result.records[0]["과정팁"]).toBe("약불로,천천히");
    expect(result.repairs.tipCommaRows).toBe(1);
  });
  it("실제 원문의 따옴표 오류를 문장 보존해 복구한다", () => {
    const result = parseEpisCsv('레시피 코드,요리설명순서,요리설명,과정 이미지 URL,과정팁\n"28","6","종이위에 "ㅍ" 모양으로 바른다."," ", ', "steps");
    expect(result.records[0]["요리설명"]).toBe('종이위에 "ㅍ" 모양으로 바른다.');
    expect(result.repairs.quoteRepairs).toBe(1);
  });
});
