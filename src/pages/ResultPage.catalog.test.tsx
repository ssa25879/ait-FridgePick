import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { expect, it, vi } from "vitest";
import { RECIPES } from "../data/recipes";
import { getRecipeCandidates } from "../utils/recommendRecipe";
import { ResultPage } from "./ResultPage";

it("실제 공식 카탈로그의 후보를 추천하면 원문 분량과 출처를 표시한다", () => {
  const recipe = RECIPES.find(({ id }) => id === "fsk_28")!;
  const selected = recipe.requiredIngredients;
  const candidates = getRecipeCandidates(selected);
  const recommendation = candidates.find(({ recipe: candidate }) => candidate.id === recipe.id)!;
  expect(recommendation).toBeDefined();
  expect(candidates.every(({ recipe: candidate }) => candidate.source && candidate.sourceIngredientText)).toBe(true);
  render(<TDSMobileAITProvider><ResultPage
    mainRef={createRef<HTMLElement>()} recommendation={recommendation}
    selectedIngredientIds={selected} candidateCount={candidates.length}
    onReroll={vi.fn()} onBackHome={vi.fn()} onEditIngredients={vi.fn()} onStartOver={vi.fn()}
  /></TDSMobileAITProvider>);
  expect(screen.getByRole("heading", { name: recipe.name })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "재료와 분량" })).toHaveTextContent("연두부 75g");
  expect(screen.getByText(/식품의약품안전처/)).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")[0].textContent).not.toMatch(/^\d+\.\s/);
  expect(screen.getAllByText(`레시피가 ${candidates.length}개 검색되었습니다`)).toHaveLength(1);
});

it("추가 EPIS 레시피도 원문 분량·출처와 단일 검색 수를 표시한다", () => {
  const recipe = RECIPES.find(({ id }) => id === "epis_320")!;
  expect(recipe.name).toBe("김치볶음밥");
  const candidates = getRecipeCandidates(recipe.requiredIngredients);
  const recommendation = candidates.find(({ recipe: candidate }) => candidate.id === recipe.id)!;
  render(<TDSMobileAITProvider><ResultPage mainRef={createRef<HTMLElement>()}
    recommendation={recommendation} selectedIngredientIds={recipe.requiredIngredients}
    candidateCount={candidates.length} onReroll={vi.fn()} onBackHome={vi.fn()}
    onEditIngredients={vi.fn()} onStartOver={vi.fn()}
  /></TDSMobileAITProvider>);
  expect(screen.getByRole("heading", { name: "김치볶음밥" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "재료와 분량" })).toHaveTextContent(recipe.sourceIngredientText!.replace(/\s+/g, " "));
  expect(screen.getByText(/농림수산식품교육문화정보원/)).toBeInTheDocument();
  expect(screen.getAllByText(`레시피가 ${candidates.length}개 검색되었습니다`)).toHaveLength(1);
});
