import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { describe, expect, it, vi } from "vitest";
import { RECIPES } from "../data/recipes";
import type { RecipeMatch } from "../utils/recommendRecipe";
import { ResultPage } from "./ResultPage";

const recipe = RECIPES.find(({ id }) => id === "pork_kimchi_stir_fry")!;
const recommendation: RecipeMatch = {
  recipe,
  matchedRequiredIngredientIds: ["pork", "kimchi", "cooking_oil"],
  missingRequiredIngredientIds: ["onion"],
  matchRate: 0.75,
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
});
