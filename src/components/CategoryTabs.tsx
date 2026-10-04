import { Button } from "@toss/tds-mobile";
import { INGREDIENT_CATEGORIES } from "../data/ingredients";
import type { IngredientCategoryFilter } from "../types/ingredient";

const categories = [{ id: "all", name: "전체" } as const, ...INGREDIENT_CATEGORIES];

interface CategoryTabsProps {
  activeCategory: IngredientCategoryFilter;
  onSelectCategory: (category: IngredientCategoryFilter) => void;
}

export function CategoryTabs({
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="category-tabs" role="group" aria-label="재료 카테고리">
      {categories.map((category) => {
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
            aria-label={category.id === "all" ? "전체 재료" : undefined}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
}
