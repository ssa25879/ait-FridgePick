import { Button } from "@toss/tds-mobile";
import { INGREDIENT_CATEGORIES } from "../data/ingredients";
import type { IngredientCategory } from "../types/ingredient";

interface CategoryTabsProps {
  activeCategory: IngredientCategory;
  onSelectCategory: (category: IngredientCategory) => void;
}

export function CategoryTabs({
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="category-tabs" role="group" aria-label="재료 카테고리">
      {INGREDIENT_CATEGORIES.map((category) => {
        const selected = activeCategory === category.id;

        return (
          <Button
            key={category.id}
            type="button"
            color="dark"
            variant={selected ? "fill" : "weak"}
            display="full"
            size="small"
            aria-pressed={selected}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
}
