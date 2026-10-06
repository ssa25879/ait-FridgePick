export type RecommendationModule = typeof import("./recommendRecipe");

let pending: Promise<RecommendationModule> | undefined;

export function loadRecommendationModule(): Promise<RecommendationModule> {
  pending ??= import("./recommendRecipe").catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  return pending;
}
