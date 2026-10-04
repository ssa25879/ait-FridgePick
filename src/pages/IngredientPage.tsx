import { useRef, useState } from "react";
import type { RefObject } from "react";
import { Button, Post } from "@toss/tds-mobile";
import { CategoryTabs } from "../components/CategoryTabs";
import { IngredientChip } from "../components/IngredientChip";
import { SelectedIngredientBar } from "../components/SelectedIngredientBar";
import { INGREDIENTS, INGREDIENT_CATEGORIES } from "../data/ingredients";
import type { Ingredient, IngredientCategory } from "../types/ingredient";
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
  onRecommend: () => void;
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
  onRecommend,
  onBack,
  showBannerAd,
}: IngredientPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] =
    useState<IngredientCategory>("vegetable");
  const categoryName = INGREDIENT_CATEGORIES.find(
    (category) => category.id === activeCategory,
  )?.name ?? "";
  const visibleIngredients = INGREDIENTS.filter(
    (ingredient) => ingredient.category === activeCategory,
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
        </section>

        <SelectedIngredientBar ingredients={selectedIngredients} />

        <section className="recommendation-filters" aria-label="추천 필터">
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

        <div className="ingredient-page-actions">
          <Button
            type="button"
            color="dark"
            display="full"
            size="xlarge"
            onClick={onRecommend}
          >
            메뉴 뽑기
          </Button>
        </div>
      </div>
      {showBannerAd && <ScrollableIngredientBanner contentRef={contentRef} />}
    </main>
  );
}
