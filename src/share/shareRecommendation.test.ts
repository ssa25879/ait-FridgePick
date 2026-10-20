import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "../types/recipe";
import { MAX_SHARE_MESSAGE_LENGTH, SERVICE_LINK, buildShareMessage, shareRecommendation } from "./shareRecommendation";

const sdk = vi.hoisted(() => ({ createLink: vi.fn(), sendMessage: vi.fn() }));

vi.mock("@apps-in-toss/web-framework", () => ({
  Share: { createLink: sdk.createLink, sendMessage: sdk.sendMessage },
}));

const LINK = "https://toss.im/share/abc";

const recipe: Recipe = {
  id: "fsk_1",
  name: "김치볶음밥",
  requiredIngredients: ["kimchi", "cooked_rice", "cooking_oil"],
  steps: ["1. 김치를 잘게 썰어요.", "2. 팬에 기름을 두르고 밥과 김치를 볶아요.", "3. 간을 맞춰 마무리해요."],
  difficulty: "easy",
  sourceIngredientText: "주재료: 김치 100g, 밥 200g\n양념: 식용유 1큰술",
  source: {
    provider: "식품의약품안전처",
    dataset: "조리식품의 레시피 DB",
    sourceId: "1",
    sourceUrl: "https://www.data.go.kr/data/15060073/openapi.do",
    usageScope: "이용허락범위 제한 없음",
  },
};

beforeEach(() => {
  sdk.createLink.mockReset().mockResolvedValue(LINK);
  sdk.sendMessage.mockReset().mockResolvedValue(undefined);
});

describe("buildShareMessage", () => {
  it("메뉴 이름·재료와 분량·조리 순서·출처·링크를 담는다", () => {
    const message = buildShareMessage(recipe, LINK);

    expect(message).toContain("김치볶음밥");
    expect(message).toContain("[재료]");
    expect(message).toContain("주재료: 김치 100g, 밥 200g");
    expect(message).toContain("양념: 식용유 1큰술");
    expect(message).toContain("[조리 순서]");
    expect(message).toContain("1. 김치를 잘게 썰어요.");
    expect(message).toContain("3. 간을 맞춰 마무리해요.");
    expect(message).toContain("출처: 식품의약품안전처 조리식품의 레시피 DB");
    expect(message.trimEnd().endsWith(LINK)).toBe(true);
  });

  it("단계 번호를 중복해서 붙이지 않는다", () => {
    const message = buildShareMessage(recipe, LINK);

    expect(message).not.toMatch(/\d+\.\s+\d+\./);
  });

  it("원문 재료 목록이 없으면 지원하는 재료 이름을 쓴다", () => {
    const message = buildShareMessage({ ...recipe, sourceIngredientText: undefined, source: undefined }, LINK);

    expect(message).toContain("[재료]");
    expect(message).toContain("김치, 밥, 식용유");
    expect(message).not.toContain("출처:");
  });

  it("지원하지 않는 필수 재료 이름도 재료에 포함한다", () => {
    const message = buildShareMessage(
      { ...recipe, sourceIngredientText: undefined, unmappedRequiredIngredients: ["육수"] },
      LINK,
    );

    expect(message).toContain("김치, 밥, 식용유, 육수");
  });

  it("너무 길면 조리 순서를 단계 단위로 줄이고 안내와 링크는 남긴다", () => {
    const longRecipe: Recipe = {
      ...recipe,
      steps: Array.from({ length: 40 }, (_, index) => `${index + 1}. ${"아주 긴 조리 설명 ".repeat(8)}`),
    };

    const message = buildShareMessage(longRecipe, LINK);

    expect(message.length).toBeLessThanOrEqual(MAX_SHARE_MESSAGE_LENGTH);
    expect(message).toContain("이하 생략");
    expect(message.trimEnd().endsWith(LINK)).toBe(true);
    expect(message).toContain("1. 아주 긴 조리 설명");
    expect(message).not.toContain("40. 아주 긴 조리 설명");
  });

  it("외부 광고 가이드의 금지 표현과 토스 연상 표현을 쓰지 않는다", () => {
    const message = buildShareMessage(recipe, LINK);

    expect(message).toContain("토스에서 냉털픽");
    for (const banned of ["공식 파트너", "입점사", "제휴사"]) expect(message).not.toContain(banned);
  });
});

describe("shareRecommendation", () => {
  it("서비스 링크로 공유 링크를 만들고 레시피가 담긴 메시지로 공유 시트를 연다", async () => {
    await expect(shareRecommendation(recipe)).resolves.toBe("shared");

    expect(sdk.createLink).toHaveBeenCalledWith({ path: SERVICE_LINK });
    expect(sdk.sendMessage).toHaveBeenCalledWith({ message: buildShareMessage(recipe, LINK) });
  });

  it("링크를 만들지 못하면 시트를 열지 않고 link_failed를 돌려준다", async () => {
    sdk.createLink.mockRejectedValue(new Error("unsupported"));

    await expect(shareRecommendation(recipe)).resolves.toBe("link_failed");
    expect(sdk.sendMessage).not.toHaveBeenCalled();
  });

  it("공유 시트가 거부(취소 포함)되면 send_failed를 돌려주고 던지지 않는다", async () => {
    sdk.sendMessage.mockRejectedValue(new Error("cancelled"));

    await expect(shareRecommendation(recipe)).resolves.toBe("send_failed");
  });
});
