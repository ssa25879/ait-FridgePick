import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { describe, expect, it, vi } from "vitest";
import { ResultPage } from "./ResultPage";
import { LOCAL_RECIPES } from "../data/recipes";

describe("검색 후보 수 안내", () => {
  it.each([0, 1, 7])("후보 %i개를 레시피 내용 다음과 동작 버튼 전에 표시한다", (count) => {
    render(<TDSMobileAITProvider><ResultPage
      mainRef={createRef<HTMLElement>()}
      recommendation={count === 0 ? null : {
        recipe: LOCAL_RECIPES[0], matchRate: 1,
        matchedRequiredIngredientIds: ["kimchi", "cooked_rice", "cooking_oil"],
        missingRequiredIngredientIds: [], missingUnmappedRequiredIngredients: [],
      }}
      selectedIngredientIds={["kimchi", "cooked_rice", "cooking_oil"]}
      candidateCount={count}
      onReroll={vi.fn()} onBackHome={vi.fn()} onEditIngredients={vi.fn()} onStartOver={vi.fn()}
    /></TDSMobileAITProvider>);
    const summary = screen.getByText(`레시피가 ${count}개 검색되었습니다`);
    const edit = screen.getByRole("button", { name: count === 0 ? "재료 추가·변경하기" : "재료 바꾸기" });
    expect(summary.compareDocumentPosition(edit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    if (count > 0) {
      expect(screen.getByRole("heading", { name: "조리 순서" }).compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});
