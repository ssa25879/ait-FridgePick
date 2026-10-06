import { Button, Post } from "@toss/tds-mobile";
import type { RefObject } from "react";
import { INGREDIENTS } from "../data/ingredients";
import type { RecipeMatch } from "../utils/recommendRecipe";
import { isRecipeReady } from "../utils/recipeReadiness";

interface ResultPageProps {
  mainRef: RefObject<HTMLElement>;
  recommendation: RecipeMatch | null;
  selectedIngredientIds: string[];
  candidateCount: number;
  readyCandidateCount?: number;
  needsCandidateCount?: number;
  candidateGroup?: "ready" | "needs";
  onChangeCandidateGroup?: (group: "ready" | "needs") => void;
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
  readyCandidateCount,
  needsCandidateCount,
  candidateGroup,
  onChangeCandidateGroup,
  onReroll,
  onBackHome,
  onEditIngredients,
  onStartOver,
}: ResultPageProps) {
  const selectedIds = new Set(selectedIngredientIds);
  const reviewNotes = recommendation?.recipe.ingredientReviewNotes ?? [];
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

      {onChangeCandidateGroup && readyCandidateCount !== undefined && needsCandidateCount !== undefined && (
        <section className="result-detail" aria-label="재료 준비 상태별 메뉴">
          <Button type="button" color="dark" variant={candidateGroup === "ready" ? undefined : "weak"} display="full" size="large"
            aria-pressed={candidateGroup === "ready"} disabled={readyCandidateCount === 0}
            onClick={() => onChangeCandidateGroup("ready")}>
            바로 만들 수 있는 메뉴 {readyCandidateCount}개
          </Button>
          <Button type="button" color="dark" variant={candidateGroup === "needs" ? undefined : "weak"} display="full" size="large"
            aria-pressed={candidateGroup === "needs"} disabled={needsCandidateCount === 0}
            onClick={() => onChangeCandidateGroup("needs")}>
            재료 추가가 필요한 메뉴 {needsCandidateCount}개
          </Button>
          {readyCandidateCount === 0 && needsCandidateCount > 0 && (
            <p className="result-detail-text">선택한 재료만으로 만들 수 있는 메뉴가 없어요.</p>
          )}
        </section>
      )}

      {recommendation ? (
        <section className="result-recommendation">
          <div className="result-summary" role="status">
            <p className="result-detail-text">
              {reviewNotes.length > 0 ? "레시피 재료 확인이 필요해요" : isRecipeReady(recommendation) ? "레시피에 필요한 재료를 모두 선택했어요" : "아래 재료를 추가해야 만들 수 있어요"}
            </p>
            <h2 className="result-recipe-name">
              {recommendation.recipe.name}
            </h2>
            <p className="result-match-rate">
              {recommendation.matchBasis === "main" ? "주재료" : "필수 재료"} 매칭률 {Math.round(recommendation.matchRate * 100)}%
            </p>
          </div>
          <p className="result-detail-text">선택한 재료의 보유 여부 기준이에요. 필요한 분량은 레시피에서 확인해 주세요.</p>
          {recommendation.matchBasis === "main" && !isRecipeReady(recommendation) && (
            <p className="result-detail-text">주재료 중심으로 계산한 비율이에요. 100%여도 부족한 양념·부재료를 확인해 주세요.</p>
          )}
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
              더 준비할 재료
            </h3>
            <p className="result-detail-text">
              {missingIngredientNames.length > 0
                ? missingIngredientNames.join(", ")
                : reviewNotes.length > 0 ? "등록된 재료는 모두 선택했어요. 아래 원문 확인 안내도 살펴봐 주세요." : "더 준비할 재료가 없어요."}
            </p>
          </section>
          {reviewNotes.length > 0 && (
            <section className="result-detail" aria-labelledby="ingredient-review-title">
              <h3 id="ingredient-review-title" className="result-detail-title">원문 재료 확인</h3>
              {reviewNotes.map((note) => <p key={note} className="result-detail-text">{note}</p>)}
            </section>
          )}
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
                <li key={step}>{step.replace(/^\d+\.\s+/, "")}</li>
              ))}
            </ol>
          </section>
          {recommendation.recipe.source && (
            <footer className="result-source-footer" aria-label="데이터 출처">
              출처: {recommendation.recipe.source.provider}{" "}
              {recommendation.recipe.source.dataset} · 원본 ID{" "}
              {recommendation.recipe.source.sourceId}
            </footer>
          )}
        </section>
      ) : (
        <section className="result-empty" role="status">
          {selectedIngredientIds.length === 0 && (
            <Post.Paragraph className="result-empty-message">
              메뉴를 추천하려면 재료를 먼저 선택해 주세요.
            </Post.Paragraph>
          )}
          {selectedIngredientIds.length > 0 && (
            <p className="result-empty-hint">재료를 더 선택하거나 바꿔 보세요.</p>
          )}
        </section>
      )}

      <p className="result-candidate-count">
        레시피가 {candidateCount}개 검색되었습니다
      </p>

      <div className="result-page-actions">
        {recommendation && candidateCount > 1 && (
          <Button
            type="button"
            color="dark"
            display="full"
            size="large"
            onClick={onReroll}
          >
            다시 뽑기
          </Button>
        )}
        <Button
          type="button"
          color="dark"
          display="full"
          size="large"
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
            size="large"
            onClick={onStartOver}
          >
            처음부터
          </Button>
        )}
      </div>
    </main>
  );
}
