import { useRef, useState } from "react";
import type { RefObject } from "react";
import { Button, Post } from "@toss/tds-mobile";
import { CategoryTabs } from "../components/CategoryTabs";
import { IngredientChip } from "../components/IngredientChip";
import { SelectedIngredientBar } from "../components/SelectedIngredientBar";
import { INGREDIENTS, INGREDIENT_CATEGORIES } from "../data/ingredients";
import type { Ingredient, IngredientCategoryFilter } from "../types/ingredient";
import type { RecipeDifficulty } from "../types/recipe";

import { ScrollableIngredientBanner } from "../components/ScrollableIngredientBanner";

const DIFFICULTY_FILTERS = [
  { value: "all", label: "전체" },
  { value: "easy", label: "쉬움" },
  { value: "normal", label: "보통" },
  { value: "hard", label: "어려움" },
] as const;

interface IngredientPageProps {
  mainRef: RefObject<HTMLElement>;
  selectedIngredientIds: string[];
  minimumMatchRate: number;
  onMinimumMatchRateChange: (value: number) => void;
  difficultyFilter: RecipeDifficulty | "all";
  onDifficultyFilterChange: (value: RecipeDifficulty | "all") => void;
  onToggleIngredient: (ingredientId: string) => void;
  onReset: () => void;
  onRecommend: () => void;
  isRecommending?: boolean;
  recommendationError?: string;
  onBack: () => void;
  showBannerAd: boolean;
}

export function IngredientPage({
  mainRef,
  selectedIngredientIds,
  minimumMatchRate,
  onMinimumMatchRateChange,
  difficultyFilter,
  onDifficultyFilterChange,
  onToggleIngredient,
  onReset,
  onRecommend,
  isRecommending = false,
  recommendationError,
  onBack,
  showBannerAd,
}: IngredientPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const closeReset = () => {
    setConfirmReset(false);
    resetRef.current?.focus();
  };
  const [activeCategory, setActiveCategory] =
    useState<IngredientCategoryFilter>("vegetable");
  const categoryName = activeCategory === "all" ? "전체" : INGREDIENT_CATEGORIES.find(
    (category) => category.id === activeCategory,
  )?.name ?? "";
  const visibleIngredients = INGREDIENTS.filter(
    (ingredient) => activeCategory === "all" || ingredient.category === activeCategory,
  );
  const selectedIngredients = selectedIngredientIds
    .map((id) => INGREDIENTS.find((ingredient) => ingredient.id === id))
    .filter(
      (ingredient): ingredient is Ingredient => ingredient !== undefined,
    );

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className="ingredient-page"
      aria-labelledby="ingredients-title"
    >
      <div ref={contentRef} className="ingredient-page-content">
        <header className="ingredient-page-header">
          <div className="ingredient-page-heading">
            <Post.H1 id="ingredients-title" className="page-title">
              재료 선택
            </Post.H1>
            <Post.Paragraph className="page-description">
              냉장고에 있는 재료를 모두 골라주세요.
            </Post.Paragraph>
          </div>
          <Button
            type="button"
            color="dark"
            variant="weak"
            size="small"
            onClick={onBack}
          >
            홈으로
          </Button>
        </header>

        <details className="filter-settings">
          <summary>
            <span>필터·선택 설정</span>
            <span className="filter-settings-value">
              {Math.round(minimumMatchRate * 100)}% · {DIFFICULTY_FILTERS.find(({ value }) => value === difficultyFilter)?.label}
            </span>
          </summary>
        <section className="recommendation-filters" aria-label="추천 필터">
          <p className="selection-save-status">레시피에 필요한 재료를 모두 선택한 메뉴를 먼저 추천해요. 재료 추가가 필요한 메뉴는 주재료 매칭률로 찾고 별도로 표시해요.</p>
          <div className="match-rate-filter">
            <div className="match-rate-filter-label">
              <label htmlFor="minimum-match-rate">최소 매칭률</label>
              <output htmlFor="minimum-match-rate" aria-live="polite">
                {Math.round(minimumMatchRate * 100)}% 이상
              </output>
            </div>
            <input
              id="minimum-match-rate"
              className="match-rate-slider"
              type="range"
              min="60"
              max="100"
              step="5"
              value={Math.round(minimumMatchRate * 100)}
              onChange={(event) =>
                onMinimumMatchRateChange(Number(event.currentTarget.value) / 100)
              }
            />
          </div>

          <fieldset className="difficulty-filter">
            <legend className="difficulty-filter-title">난이도</legend>
            <div className="difficulty-filter-options">
              {DIFFICULTY_FILTERS.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  color="dark"
                  variant="weak"
                  size="small"
                  className="difficulty-filter-choice"
                  aria-pressed={difficultyFilter === value}
                  onClick={() => onDifficultyFilterChange(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="selection-settings" aria-label="선택 항목 설정">
          <p className="selection-save-status" role="status">선택한 재료와 필터는 이번 실행 동안만 유지돼요. 앱을 다시 실행하면 초기화돼요.</p>
          <Button
            ref={resetRef}
            type="button" color="dark" variant="weak" display="full" size="small"
            aria-expanded={confirmReset} aria-controls="reset-confirmation"
            onClick={() => setConfirmReset(true)}
          >
            재료·필터 초기화
          </Button>
          {confirmReset && (
            <div id="reset-confirmation" className="reset-confirmation" role="group" aria-label="초기화 확인">
              <p className="selection-save-status">
                선택한 재료를 지우고 최소 매칭률을 60%, 난이도를 전체로 되돌릴까요?
              </p>
              <div className="reset-confirmation-actions">
                <Button type="button" color="dark" variant="weak" size="small" onClick={closeReset}>취소</Button>
                <Button type="button" color="dark" size="small" onClick={() => { onReset(); closeReset(); }}>초기화하기</Button>
              </div>
            </div>
          )}
        </section>

        </details>

        <CategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <section
          className="ingredient-list-section"
          aria-labelledby="ingredient-list-title"
        >
          <h2 id="ingredient-list-title" className="ingredient-category-title">
            {categoryName} 재료
          </h2>
          <div
            key={activeCategory}
            className="ingredient-scroll-viewport"
            tabIndex={0}
            role="group"
            aria-label="스크롤 가능한 재료 목록"
          >
            <div className="ingredient-chip-list">
              {visibleIngredients.map((ingredient) => (
                <IngredientChip
                  key={ingredient.id}
                  name={ingredient.name}
                  selected={selectedIngredientIds.includes(ingredient.id)}
                  onToggle={() => onToggleIngredient(ingredient.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <SelectedIngredientBar ingredients={selectedIngredients} />

        <div className="ingredient-page-actions">
          {recommendationError && <p className="selection-save-status" role="alert">{recommendationError}</p>}
          <Button
            type="button"
            color="dark"
            display="full"
            size="large"
            onClick={onRecommend}
            disabled={isRecommending}
          >
            {isRecommending ? "메뉴 준비 중" : "메뉴 뽑기"}
          </Button>
        </div>
      </div>
      {showBannerAd && <ScrollableIngredientBanner contentRef={contentRef} />}
    </main>
  );
}
