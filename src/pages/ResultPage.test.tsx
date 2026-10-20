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
  assumedSeasoningIds: [],
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
  assumedSeasoningIds: [],
  missingUnmappedRequiredIngredients: ["황태"],
  matchRate: 2 / 3,
};

describe("추천 결과 상세", () => {
  it("보유 재료와 더 준비할 재료는 가나다 순으로 보여준다", () => {
    render(
      <TDSMobileAITProvider>
        <ResultPage mainRef={createRef<HTMLElement>()}
          recommendation={{
            recipe: { ...recipe, requiredIngredients: ["tomato", "tofu", "onion", "egg"], unmappedRequiredIngredients: ["황태"] },
            matchedRequiredIngredientIds: ["tomato", "tofu"],
            missingRequiredIngredientIds: ["onion", "egg"],
            assumedSeasoningIds: [],
            missingUnmappedRequiredIngredients: ["황태"],
            matchRate: 0.5,
            matchBasis: "main",
          }}
          selectedIngredientIds={["tomato", "tofu"]} candidateCount={1}
          onReroll={vi.fn()} onBackHome={vi.fn()} onEditIngredients={vi.fn()} onStartOver={vi.fn()} />
      </TDSMobileAITProvider>,
    );
    expect(screen.getByText("두부, 토마토")).toBeInTheDocument();
    expect(screen.getByText("달걀, 양파, 황태")).toBeInTheDocument();
  });

  it("등록 필수 재료를 모두 보유해도 원문 누락 검토 안내가 있으면 조리 가능으로 안내하지 않는다", () => {
    render(<TDSMobileAITProvider>
      <ResultPage mainRef={createRef<HTMLElement>()}
        recommendation={{ ...recommendation, recipe: { ...recipe, ingredientReviewNotes: ["조리 2단계의 육수가 원문 재료 목록에 없어요. 분량을 확인해 주세요."] }, missingRequiredIngredientIds: [], matchRate: 1 }}
        selectedIngredientIds={recipe.requiredIngredients} candidateCount={1}
        onReroll={vi.fn()} onBackHome={vi.fn()} onEditIngredients={vi.fn()} onStartOver={vi.fn()} />
    </TDSMobileAITProvider>);
    expect(screen.getByRole("status")).toHaveTextContent("레시피 재료 확인이 필요해요");
    expect(screen.getByRole("status")).not.toHaveTextContent("레시피에 필요한 재료를 모두 선택했어요");
    expect(screen.getByRole("region", { name: "원문 재료 확인" })).toHaveTextContent("육수");
    expect(screen.getByRole("region", { name: "더 준비할 재료" })).toHaveTextContent("등록된 재료는 모두 선택했어요. 아래 원문 확인 안내도 살펴봐 주세요.");
  });
  it("주재료 100%여도 더 준비할 재료와 준비 안내를 표시한다", () => {
    render(
      <TDSMobileAITProvider>
        <ResultPage mainRef={createRef<HTMLElement>()}
          recommendation={{ ...recommendation, matchRate: 1, matchBasis: "main" }}
          selectedIngredientIds={["pork", "kimchi", "cooking_oil"]} candidateCount={1}
          onReroll={vi.fn()} onBackHome={vi.fn()} onEditIngredients={vi.fn()} onStartOver={vi.fn()} />
      </TDSMobileAITProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("주재료 매칭률 100%");
    expect(screen.getByRole("region", { name: "더 준비할 재료" })).toHaveTextContent("양파");
    expect(screen.getByText(/100%여도 부족한 양념·부재료/)).toBeInTheDocument();
  });
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
    expect(availableIngredients).toHaveTextContent("김치, 대파, 돼지고기, 식용유");
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

    expect(screen.getByRole("region", { name: "더 준비할 재료" })).toHaveTextContent(
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

describe("기본 양념 보유 가정 안내", () => {
  const renderResult = (overrides: Partial<RecipeMatch>) => render(
    <TDSMobileAITProvider>
      <ResultPage mainRef={createRef<HTMLElement>()}
        recommendation={{ ...recommendation, ...overrides }}
        selectedIngredientIds={["pork", "kimchi"]} candidateCount={1}
        onReroll={vi.fn()} onBackHome={vi.fn()} onEditIngredients={vi.fn()} onStartOver={vi.fn()} />
    </TDSMobileAITProvider>,
  );

  it("가정한 기본 양념을 양념 확인에 가나다 순으로 따로 보여준다", () => {
    renderResult({ missingRequiredIngredientIds: [], assumedSeasoningIds: ["soy_sauce", "salt", "cooking_oil"] });

    const region = screen.getByRole("region", { name: "양념 확인" });
    expect(region).toHaveTextContent("집에 있다고 가정했어요");
    expect(region).toHaveTextContent("간장, 소금, 식용유");
  });

  it("양념은 더 준비할 재료에 중복해서 나오지 않는다", () => {
    renderResult({ missingRequiredIngredientIds: ["onion"], assumedSeasoningIds: ["salt"] });

    expect(screen.getByRole("region", { name: "더 준비할 재료" })).toHaveTextContent("양파");
    expect(screen.getByRole("region", { name: "더 준비할 재료" })).not.toHaveTextContent("소금");
  });

  it("가정한 양념이 없으면 양념 확인을 숨긴다", () => {
    renderResult({ missingRequiredIngredientIds: [], assumedSeasoningIds: [] });

    expect(screen.queryByRole("region", { name: "양념 확인" })).not.toBeInTheDocument();
  });

  it("양념만 가정한 준비 완료 메뉴는 양념을 빼고 모두 선택했다고 안내한다", () => {
    renderResult({ missingRequiredIngredientIds: [], assumedSeasoningIds: ["salt"], matchRate: 1 });

    expect(screen.getByRole("status")).toHaveTextContent("기본 양념을 빼고 필요한 재료를 모두 선택했어요");
  });

  it("가정한 양념이 없는 준비 완료 메뉴는 기존 문구를 유지한다", () => {
    renderResult({ missingRequiredIngredientIds: [], assumedSeasoningIds: [], matchRate: 1 });

    expect(screen.getByRole("status")).toHaveTextContent("레시피에 필요한 재료를 모두 선택했어요");
  });
});

describe("보조 버튼 배치", () => {
  const renderResult = (selected: string[]) => render(
    <TDSMobileAITProvider>
      <ResultPage mainRef={createRef<HTMLElement>()}
        recommendation={recommendation}
        selectedIngredientIds={selected} candidateCount={2}
        onReroll={vi.fn()} onShare={vi.fn()} onBackHome={vi.fn()} onEditIngredients={vi.fn()} onStartOver={vi.fn()} />
    </TDSMobileAITProvider>,
  );

  it("결과 공유하기와 처음부터는 한 줄에 나란히 놓고 다시 뽑기·재료 바꾸기는 따로 둔다", () => {
    renderResult(["pork", "kimchi"]);

    const share = screen.getByRole("button", { name: "결과 공유하기" });
    const startOver = screen.getByRole("button", { name: "처음부터" });
    expect(share.parentElement).toBe(startOver.parentElement);
    expect(share.parentElement).toHaveClass("result-secondary-actions");
    for (const name of ["다시 뽑기", "재료 바꾸기"]) {
      expect(screen.getByRole("button", { name }).parentElement).not.toBe(share.parentElement);
    }
  });

  it("처음부터가 없으면 공유 버튼만 같은 줄 구역에 남는다", () => {
    renderResult([]);

    expect(screen.queryByRole("button", { name: "처음부터" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "결과 공유하기" }).parentElement).toHaveClass("result-secondary-actions");
  });
});
