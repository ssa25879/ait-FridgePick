import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { expect, it, vi } from "vitest";
import { RECIPES } from "../data/recipes";
import { getRecipeCandidates } from "../utils/recommendRecipe";
import { ResultPage } from "./ResultPage";

it.each([
  ["fsk_834", ["egg", "salt"], ["달걀", "소금"]],
  ["epis_434", ["butter", "milk"], ["버터", "우유", "육수"]],
] as const)("조리 단계 누락을 보완한 %s의 미보유 재료를 추가 준비 영역에 표시한다", (id, removeIds, expectedNames) => {
  const recipe = RECIPES.find((recipe) => recipe.id === id)!;
  const selected = recipe.requiredIngredients.filter((ingredientId) => !(removeIds as readonly string[]).includes(ingredientId));
  const [recommendation] = getRecipeCandidates(selected, [recipe], { minimumMatchRate: 0 });
  render(<TDSMobileAITProvider><ResultPage mainRef={createRef<HTMLElement>()}
    recommendation={recommendation} selectedIngredientIds={selected} candidateCount={1}
    onReroll={vi.fn()} onBackHome={vi.fn()} onEditIngredients={vi.fn()} onStartOver={vi.fn()}
  /></TDSMobileAITProvider>);
  const additional = screen.getByRole("region", { name: "더 준비할 재료" });
  for (const name of expectedNames) expect(additional).toHaveTextContent(name);
  expect(screen.getByRole("region", { name: "원문 재료 확인" })).toBeInTheDocument();
});

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
