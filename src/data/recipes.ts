import type { Recipe } from "../types/recipe";
import { PUBLIC_RECIPES } from "./publicRecipes";
import { EPIS_RECIPES } from "./episRecipes";

// Source-backed substitutes for the 20 hand-written recipes; keep original source names.
const replacementIds = [
  "fsk_738",
  "fsk_272",
  "fsk_2986",
  "fsk_458",
  "fsk_3082",
  "fsk_3081",
  "fsk_137",
  "fsk_531",
  "fsk_784",
  "fsk_231",
  "fsk_439",
  "fsk_941",
  "fsk_2978",
  "fsk_982",
  "fsk_3010",
  "fsk_18",
  "fsk_816",
  "fsk_2958",
  "fsk_834",
  "fsk_493"
];

export const SOURCED_REPLACEMENT_RECIPES: Recipe[] = replacementIds.map(
  (id) => PUBLIC_RECIPES.find((recipe) => recipe.id === id)!,
);

// Each official record appears once, even when used as a replacement.
export const RECIPES: Recipe[] = [
  ...SOURCED_REPLACEMENT_RECIPES,
  ...PUBLIC_RECIPES.filter(({ id }) => !replacementIds.includes(id)),
  ...EPIS_RECIPES,
];
