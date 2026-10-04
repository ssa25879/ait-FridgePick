import { describe, expect, it } from "vitest";
import {
  getRecipeIngredientAliasTargets,
  isRecipePantryStaple,
  mapRecipeIngredientName,
  parseRecipeIngredients,
  normalizePublicRecipeRecord,
} from "./recipeCatalog";
import { INGREDIENTS } from "./ingredients";

describe("일상 재료의 명확한 표기 매핑", () => {
  it.each([
    ["다진생강", "ginger"], ["불린 쌀", "raw_rice"], ["닭", "chicken"],
    ["다진쇠고기", "beef"], ["고추가루", "chili_powder"], ["고추", "chili_pepper"],
    ["찬밥", "cooked_rice"], ["신김치", "kimchi"], ["쭈꾸미", "octopus"],
    ["브로코리", "broccoli"],
  ])("%s를 %s에 연결한다", (name, id) => {
    expect(mapRecipeIngredientName(name)).toBe(id);
  });
  it.each(["안심", "호박", "육수", "계란노른자", "계란흰자", "술", "국수"])(
    "종류·형태가 불명확한 %s를 임의로 연결하지 않는다", name => {
      expect(mapRecipeIngredientName(name)).toBeUndefined();
    },
  );
});

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

  it("양념장처럼 콜론으로 표시된 구역을 필수 재료로 분류한다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "토마토 닭가슴살",
        RCP_PARTS_DTLS:
          "주재료 : 닭가슴살 100g, 토마토 1개\n●양념장 : 다진 마늘 2g, 소금 약간",
      }),
    ).toEqual({
      requiredIngredients: ["닭가슴살", "토마토", "다진 마늘", "소금"],
      optionalIngredients: [],
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

  it("숫자로 시작하는 재료명에서 숫자를 수량으로 오인하지 않는다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "파프리카 달걀 볶음",
        RCP_PARTS_DTLS: "2가지색 파프리카 100g, 달걀 1개",
      }),
    ).toEqual({
      requiredIngredients: ["2가지색 파프리카", "달걀"],
      optionalIngredients: [],
    });
  });

  it("단위가 생략된 분량 뒤의 재료 이름도 보존한다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "김치밥그라탕",
        RCP_PARTS_DTLS: "밥 180, 배추김치 30, 양파 20",
      }),
    ).toEqual({
      requiredIngredients: ["밥", "배추김치", "양파"],
      optionalIngredients: [],
    });
  });

  it("양념장 재료는 필수로, 고명은 선택 재료로 분류한다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "토마토 소박이",
        RCP_PARTS_DTLS:
          "토마토 소박이\n토마토 150g, 양파 10g\n양념장\n고춧가루 4g, 다진 마늘 2.5g\n고명\n통깨 약간",
      }),
    ).toEqual({
      requiredIngredients: ["토마토", "양파", "고춧가루", "다진 마늘"],
      optionalIngredients: ["통깨"],
    });
  });

  it("장식 구역의 재료는 선택 재료로 분류한다", () => {
    expect(
      parseRecipeIngredients({
        RCP_NM: "토마토 샐러드",
        RCP_PARTS_DTLS:
          "토마토 샐러드\n토마토 150g, 양파 10g\n●장식\n호두 4개, 오이 20g",
      }),
    ).toEqual({
      requiredIngredients: ["토마토", "양파"],
      optionalIngredients: ["호두", "오이"],
    });
  });
});

describe("공식 레시피 재료 매핑", () => {
  it("명시한 표기 별칭만 기존 카탈로그 ID로 연결한다", () => {
    expect(mapRecipeIngredientName("다진 마늘")).toBe("garlic");
    expect(mapRecipeIngredientName("새송이버섯")).toBe("mushroom");
    expect(mapRecipeIngredientName("저염간장")).toBe("soy_sauce");
    expect(mapRecipeIngredientName("2가지색 파프리카")).toBe("bell_pepper");
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
  it("숫자로 시작하는 재료를 매핑해 필수 재료로 보존한다", () => {
    const result = normalizePublicRecipeRecord({
      RCP_SEQ: "385",
      RCP_NM: "파프리카 달걀 볶음",
      RCP_PARTS_DTLS: "2가지색 파프리카 100g, 달걀 1개",
      MANUAL01: "재료를 함께 볶는다.",
    });

    expect(result.recipe?.requiredIngredients).toEqual([
      "bell_pepper",
      "egg",
    ]);
    expect(result.recipe?.unmappedRequiredIngredients).toEqual([]);
  });

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
      difficulty: "easy",
      sourceIngredientText: "두부 100g, 토마토 1개, 황태 20g, 물 100ml",
      source: {
        provider: "식품의약품안전처",
        dataset: "조리식품의 레시피 DB",
        sourceId: "100",
      },
    });
  });

  it("난이도 판정에서 미지원 필수 재료도 재료 수에 포함한다", () => {
    const result = normalizePublicRecipeRecord({
      RCP_SEQ: "103",
      RCP_NM: "여러 재료 볶음",
      RCP_PARTS_DTLS:
        "두부 100g, 토마토 1개, 양파 1개, 달걀 1개, 당근 1개, 감자 1개, 황태 20g",
      MANUAL01: "재료를 익힌다.",
    });

    expect(result.recipe?.requiredIngredients).toHaveLength(6);
    expect(result.recipe?.unmappedRequiredIngredients).toEqual(["황태"]);
    expect(result.recipe?.difficulty).toBe("normal");
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
