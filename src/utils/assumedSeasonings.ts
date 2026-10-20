// 사용자가 선택하지 않아도 집에 있다고 가정하는 기본 양념. 판정·정렬·표시가 모두 이 목록을 쓴다.
// 고추장·된장·굴소스처럼 집에 없을 수 있는 양념과 마늘·대파(채소)는 가정하지 않는다.
export const ASSUMED_SEASONING_IDS = [
  "salt",
  "sugar",
  "black_pepper",
  "cooking_oil",
  "soy_sauce",
  "sesame_oil",
  "chili_powder",
  "sesame",
  "vinegar",
] as const;

const assumedSeasoningIdSet: ReadonlySet<string> = new Set(ASSUMED_SEASONING_IDS);

export function isAssumedSeasoning(ingredientId: string): boolean {
  return assumedSeasoningIdSet.has(ingredientId);
}
