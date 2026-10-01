import { Button, Post } from "@toss/tds-mobile";
import type { RefObject } from "react";
import { INGREDIENTS } from "../data/ingredients";
import type { RecipeMatch } from "../utils/recommendRecipe";

interface ResultPageProps {
  mainRef: RefObject<HTMLElement>;
  recommendation: RecipeMatch | null;
  selectedIngredientIds: string[];
  candidateCount: number;
  onReroll: () => void;
  onBackHome: () => void;
  onEditIngredients: () => void;
  onStartOver: () => void;
}

export function ResultPage({
  mainRef,
  recommendation,
  selectedIngredientIds,
  candidateCount,
  onReroll,
  onBackHome,
  onEditIngredients,
  onStartOver,
}: ResultPageProps) {
  const selectedIds = new Set(selectedIngredientIds);
  const ingredientById = new Map(INGREDIENTS.map((item) => [item.id, item]));
  const availableIngredients = recommendation
    ? [
        ...recommendation.recipe.requiredIngredients,
        ...(recommendation.recipe.optionalIngredients ?? []),
      ]
        .filter((id) => selectedIds.has(id))
        .map((id) => ingredientById.get(id))
        .filter((ingredient) => ingredient !== undefined)
    : [];
  const missingIngredients = recommendation
    ? recommendation.missingRequiredIngredientIds
        .map((id) => ingredientById.get(id))
        .filter((ingredient) => ingredient !== undefined)
    : [];
  const missingIngredientNames = recommendation
    ? [
        ...missingIngredients.map(({ name }) => name),
        ...recommendation.missingUnmappedRequiredIngredients,
      ]
    : [];

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className="result-page"
      aria-labelledby="result-title"
    >
      <header className="result-page-header">
        <Post.H1 id="result-title" className="page-title">
          추천 결과
        </Post.H1>
        <Button
          type="button"
          color="dark"
          variant="weak"
          size="small"
          onClick={onBackHome}
        >
          홈으로
        </Button>
      </header>

      {recommendation ? (
        <section className="result-recommendation">
          <div className="result-summary" role="status">
            <h2 className="result-recipe-name">
              {recommendation.recipe.name}
            </h2>
            <p className="result-match-rate">
              필수 재료 매칭률 {Math.round(recommendation.matchRate * 100)}%
            </p>
          </div>
          <section className="result-detail" aria-labelledby="available-title">
            <h3 id="available-title" className="result-detail-title">
              보유 재료
            </h3>
            <p className="result-detail-text">
              {availableIngredients.map(({ name }) => name).join(", ")}
            </p>
          </section>
          <section className="result-detail" aria-labelledby="missing-title">
            <h3 id="missing-title" className="result-detail-title">
              부족한 필수 재료
            </h3>
            <p className="result-detail-text">
              {missingIngredientNames.length > 0
                ? missingIngredientNames.join(", ")
                : "부족한 필수 재료가 없어요."}
            </p>
          </section>
          {recommendation.recipe.sourceIngredientText && (
            <section
              className="result-detail"
              aria-labelledby="source-ingredients-title"
            >
              <h3
                id="source-ingredients-title"
                className="result-detail-title"
              >
                재료와 분량
              </h3>
              <p className="result-detail-text result-source-ingredients">
                {recommendation.recipe.sourceIngredientText}
              </p>
            </section>
          )}
          <section className="result-detail" aria-labelledby="steps-title">
            <h3 id="steps-title" className="result-detail-title">
              조리 순서
            </h3>
            <ol className="result-steps">
              {recommendation.recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          {recommendation.recipe.source && (
            <section className="result-detail" aria-labelledby="source-title">
              <h3 id="source-title" className="result-detail-title">
                데이터 출처
              </h3>
              <p className="result-detail-text">
                출처: {recommendation.recipe.source.provider}{" "}
                {recommendation.recipe.source.dataset} · 원본 ID{" "}
                {recommendation.recipe.source.sourceId}
              </p>
            </section>
          )}
          {candidateCount === 1 && (
            <p className="result-no-alternatives">
              현재 재료로 추천할 수 있는 메뉴가 1개예요.
            </p>
          )}
        </section>
      ) : (
        <section className="result-empty" role="status">
          <Post.Paragraph className="result-empty-message">
            {selectedIngredientIds.length === 0
              ? "메뉴를 추천하려면 재료를 먼저 선택해 주세요."
              : "현재 재료로 추천할 수 있는 메뉴가 없어요."}
          </Post.Paragraph>
          {selectedIngredientIds.length > 0 && (
            <p className="result-empty-hint">재료를 더 선택하거나 바꿔 보세요.</p>
          )}
        </section>
      )}

      <div className="result-page-actions">
        {recommendation && candidateCount > 1 && (
          <Button
            type="button"
            color="dark"
            display="full"
            size="xlarge"
            onClick={onReroll}
          >
            다시 뽑기
          </Button>
        )}
        <Button
          type="button"
          color="dark"
          display="full"
          size="xlarge"
          onClick={onEditIngredients}
        >
          {selectedIngredientIds.length === 0
            ? "재료 선택하기"
            : recommendation
              ? "재료 바꾸기"
              : "재료 추가·변경하기"}
        </Button>
        {selectedIngredientIds.length > 0 && (
          <Button
            type="button"
            color="dark"
            variant="weak"
            display="full"
            size="xlarge"
            onClick={onStartOver}
          >
            처음부터
          </Button>
        )}
      </div>
    </main>
  );
}
