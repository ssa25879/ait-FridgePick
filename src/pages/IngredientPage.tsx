import { useState } from "react";
import { Button, Post } from "@toss/tds-mobile";
import { CategoryTabs } from "../components/CategoryTabs";
import { IngredientChip } from "../components/IngredientChip";
import { SelectedIngredientBar } from "../components/SelectedIngredientBar";
import { INGREDIENTS, INGREDIENT_CATEGORIES } from "../data/ingredients";
import type { Ingredient, IngredientCategory } from "../types/ingredient";

interface IngredientPageProps {
  selectedIngredientIds: string[];
  onToggleIngredient: (ingredientId: string) => void;
  onBack: () => void;
}

export function IngredientPage({
  selectedIngredientIds,
  onToggleIngredient,
  onBack,
}: IngredientPageProps) {
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
    <main className="ingredient-page" aria-labelledby="ingredients-title">
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
    </main>
  );
}
