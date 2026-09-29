import { ChipItem } from "@toss/tds-mobile";

interface IngredientChipProps {
  name: string;
  selected: boolean;
  onToggle: () => void;
}

export function IngredientChip({
  name,
  selected,
  onToggle,
}: IngredientChipProps) {
  return (
    <ChipItem
      as="button"
      type="button"
      className="ingredient-chip"
      selected={selected}
      aria-pressed={selected}
      onClick={onToggle}
    >
      {selected && (
        <span className="ingredient-chip-check" aria-hidden="true">
          ✓
        </span>
      )}
      {name}
    </ChipItem>
  );
}
