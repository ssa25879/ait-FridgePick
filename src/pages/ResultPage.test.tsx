import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { describe, expect, it, vi } from "vitest";
import { TEST_RECIPES as RECIPES } from "../test/fixtures/recipes";
import type { RecipeMatch } from "../utils/recommendRecipe";
import { ResultPage } from "./ResultPage";

const recipe = RECIPES.find(({ id }) => id === "pork_kimchi_stir_fry")!;
const recommendation: RecipeMatch = {
  recipe,
  matchedRequiredIngredientIds: ["pork", "kimchi", "cooking_oil"],
  missingRequiredIngredientIds: ["onion"],
  missingUnmappedRequiredIngredients: [],
  matchRate: 0.75,
};
const publicRecommendation: RecipeMatch = {
  recipe: {
    ...recipe,
    id: "fsk_100",
    name: "두부 토마토 볶음",
    requiredIngredients: ["tofu", "tomato"],
    unmappedRequiredIngredients: ["황태"],
    sourceIngredientText: "두부 100g, 토마토 1개, 황태 20g",
    source: {
      provider: "식품의약품안전처",
      dataset: "조리식품의 레시피 DB",
      sourceId: "100",
      sourceUrl: "https://www.data.go.kr/data/15060073/openapi.do",
      usageScope: "공공데이터포털 이용허락범위 제한 없음",
    },
  },
  matchedRequiredIngredientIds: ["tofu", "tomato"],
  missingRequiredIngredientIds: [],
  missingUnmappedRequiredIngredients: ["황태"],
  matchRate: 2 / 3,
};

describe("추천 결과 상세", () => {
  it("레시피에 쓰는 보유 재료와 부족 재료, 조리 단계를 표시한다", () => {
    render(
      <TDSMobileAITProvider>
        <ResultPage
          mainRef={createRef<HTMLElement>()}
          recommendation={recommendation}
          selectedIngredientIds={[
            "pork",
            "kimchi",
            "cooking_oil",
            "green_onion",
            "cheese",
          ]}
          candidateCount={2}
          onReroll={vi.fn()}
          onBackHome={vi.fn()}
          onEditIngredients={vi.fn()}
          onStartOver={vi.fn()}
        />
      </TDSMobileAITProvider>,
    );

    const availableIngredients = screen.getByRole("region", { name: "보유 재료" });
    expect(availableIngredients).toHaveTextContent("돼지고기, 김치, 식용유, 대파");
    expect(availableIngredients).not.toHaveTextContent("치즈");
    expect(screen.getByText("양파")).toBeInTheDocument();
    expect(
      screen.getByText("양파와 김치를 먹기 좋은 크기로 썰어요."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("라이브 안내에는 추천 메뉴와 매칭률만 포함한다", () => {
    render(
      <TDSMobileAITProvider>
        <ResultPage
          mainRef={createRef<HTMLElement>()}
          recommendation={recommendation}
          selectedIngredientIds={["pork", "kimchi", "cooking_oil"]}
          candidateCount={2}
          onReroll={vi.fn()}
          onBackHome={vi.fn()}
          onEditIngredients={vi.fn()}
          onStartOver={vi.fn()}
        />
      </TDSMobileAITProvider>,
    );

    const announcement = screen.getByRole("status");
    expect(announcement).toHaveTextContent("돼지고기 김치볶음");
    expect(announcement).toHaveTextContent("필수 재료 매칭률 75%");
    expect(announcement).not.toHaveTextContent("양파와 김치를 먹기 좋은 크기로 썰어요.");
  });

  it("선택할 수 없는 재료와 원문 분량, 공공 데이터 출처를 표시한다", () => {
    const { container } = render(
      <TDSMobileAITProvider>
        <ResultPage
          mainRef={createRef<HTMLElement>()}
          recommendation={publicRecommendation}
          selectedIngredientIds={["tofu", "tomato"]}
          candidateCount={1}
          onReroll={vi.fn()}
          onBackHome={vi.fn()}
          onEditIngredients={vi.fn()}
          onStartOver={vi.fn()}
        />
      </TDSMobileAITProvider>,
    );

    expect(screen.getByRole("region", { name: "부족한 필수 재료" })).toHaveTextContent(
      "황태",
    );
    expect(screen.getByRole("region", { name: "재료와 분량" })).toHaveTextContent(
      "두부 100g, 토마토 1개, 황태 20g",
    );
    const sourceFooter = container.querySelector(".result-source-footer");
    const recipeSteps = screen.getByRole("list");

    expect(sourceFooter).toHaveTextContent(
      "식품의약품안전처 조리식품의 레시피 DB · 원본 ID 100",
    );
    expect(
      recipeSteps.compareDocumentPosition(sourceFooter!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
