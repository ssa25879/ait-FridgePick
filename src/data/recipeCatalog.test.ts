import { describe, expect, it } from "vitest";
import {
  getRecipeIngredientAliasTargets,
  isRecipePantryStaple,
  mapRecipeIngredientName,
  parseRecipeIngredients,
  normalizePublicRecipeRecord,
} from "./recipeCatalog";
import { INGREDIENTS } from "./ingredients";

describe("parseRecipeIngredients", () => {
  it("분량을 제거하고 제목·고명 구역을 구분한다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "연두부 계란찜",
        RCP_PARTS_DTLS:
          "연두부 계란찜\n연두부 75g(3/4모), 달걀 1개, 다진 마늘 2g\n고명\n시금치 10g",
      }),
    ).toEqual({
      requiredIngredients: ["연두부", "달걀", "다진 마늘"],
      optionalIngredients: ["시금치"],
    });
  });

  it("괄호 안 쉼표는 재료 구분자로 취급하지 않는다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "소고기 양파볶음",
        RCP_PARTS_DTLS: "소고기(등심, 얇게 썬 것) 100g, 양파 1/2개",
      }),
    ).toEqual({
      requiredIngredients: ["소고기", "양파"],
      optionalIngredients: [],
    });
  });

  it("재료명 뒤 분량 괄호와 괄호 안 분량 구분 쉼표를 제거한다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "호박잎 삼계탕",
        RCP_PARTS_DTLS:
          "호박잎(5장), 닭고기(가슴살, 120g), 소고기(등심, 얇게 썬 것) 100g",
      }),
    ).toEqual({
      requiredIngredients: ["호박잎", "닭고기", "소고기"],
      optionalIngredients: [],
    });
  });

  it("양념장처럼 콜론으로 표시된 구역을 선택 재료로 분류한다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "토마토 닭가슴살",
        RCP_PARTS_DTLS:
          "주재료 : 닭가슴살 100g, 토마토 1개\n●양념장 : 다진 마늘 2g, 소금 약간",
      }),
    ).toEqual({
      requiredIngredients: ["닭가슴살", "토마토"],
      optionalIngredients: ["다진 마늘", "소금"],
    });
  });

  it("빈 재료 설명을 빈 목록으로 반환한다", () => {
    expect(
      parseRecipeIngredients({ RCP_NM: "재료 없음", RCP_PARTS_DTLS: "" }),
    ).toEqual({ requiredIngredients: [], optionalIngredients: [] });
  });

  it("재료 설명 첫 줄에 반복된 요리 제목을 재료로 오인하지 않는다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "사과 새우 북엇국",
        RCP_PARTS_DTLS: "북엇국\n북어채 25g, 새우 10g, 사과 30g",
      }),
    ).toEqual({
      requiredIngredients: ["북어채", "새우", "사과"],
      optionalIngredients: [],
    });
  });
});

describe("공식 레시피 재료 매핑", () => {
  it("명시한 표기 별칭만 기존 카탈로그 ID로 연결한다", () => {
    expect(mapRecipeIngredientName("다진 마늘")).toBe("garlic");
    expect(mapRecipeIngredientName("새송이버섯")).toBe("mushroom");
    expect(mapRecipeIngredientName("저염간장")).toBe("soy_sauce");
    expect(mapRecipeIngredientName("황태")).toBeUndefined();
  });

  it("모든 별칭 대상이 실제 재료 카탈로그에 존재한다", () => {
    const ingredientIds = new Set(INGREDIENTS.map(({ id }) => id));
    expect(
      getRecipeIngredientAliasTargets().filter((id) => !ingredientIds.has(id)),
    ).toEqual([]);
  });

  it("물은 선택 화면에서 고르지 않는 기본 재료로 구분한다", () => {
    expect(isRecipePantryStaple("물")).toBe(true);
    expect(isRecipePantryStaple("소금")).toBe(false);
  });
});

describe("공식 레시피 정규화", () => {
  it("조리 단계 끝에 붙은 CSV 표시용 알파벳 접미를 제거한다", () => {
    const result = normalizePublicRecipeRecord({
      RCP_SEQ: "99",
      RCP_NM: "두부 달걀찜",
      RCP_PARTS_DTLS: "두부 100g, 달걀 1개",
      MANUAL01: "1. 재료를 섞어 익힌다.a",
      MANUAL02: "2. 불을 끈다.",
    });

    expect(result.recipe?.steps).toEqual([
      "1. 재료를 섞어 익힌다.",
      "2. 불을 끈다.",
    ]);
  });

  it("지원 재료와 미지원 재료를 함께 보존하고 출처를 연결한다", () => {
    const result = normalizePublicRecipeRecord({
      RCP_SEQ: "100",
      RCP_NM: "두부 토마토 볶음",
      RCP_PARTS_DTLS: "두부 100g, 토마토 1개, 황태 20g, 물 100ml",
      MANUAL01: "팬에서 두부와 토마토를 익힌다.",
    });

    expect(result.exclusionReason).toBeUndefined();
    expect(result.recipe).toMatchObject({
      id: "fsk_100",
      name: "두부 토마토 볶음",
      requiredIngredients: ["tofu", "tomato"],
      unmappedRequiredIngredients: ["황태"],
      sourceIngredientText: "두부 100g, 토마토 1개, 황태 20g, 물 100ml",
      source: {
        provider: "식품의약품안전처",
        dataset: "조리식품의 레시피 DB",
        sourceId: "100",
      },
    });
  });

  it("미지원 필수 재료 비율이 높으면 사유와 함께 제외한다", () => {
    const result = normalizePublicRecipeRecord({
      RCP_SEQ: "101",
      RCP_NM: "감자 황태 전복 요리",
      RCP_PARTS_DTLS: "감자 1개, 황태 100g, 전복 1개, 샐러리 20g",
      MANUAL01: "재료를 익힌다.",
    });

    expect(result.recipe).toBeUndefined();
    expect(result.exclusionReason).toBe("low-ingredient-coverage");
    expect(result.unmappedRequiredIngredients).toEqual(["황태", "전복", "샐러리"]);
  });

  it("단계가 없는 레코드를 사유와 함께 제외한다", () => {
    const result = normalizePublicRecipeRecord({
      RCP_SEQ: "102",
      RCP_NM: "토마토 샐러드",
      RCP_PARTS_DTLS: "토마토 1개, 오이 1개",
      MANUAL01: "",
    });

    expect(result.recipe).toBeUndefined();
    expect(result.exclusionReason).toBe("missing-steps");
  });
});
