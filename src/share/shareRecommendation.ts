import { Share } from "@apps-in-toss/web-framework";
import { INGREDIENTS } from "../data/ingredients";
import type { Recipe } from "../types/recipe";

// 콘솔 미니앱 정보의 서비스 링크. 받는 사람은 앱 첫 화면으로 들어온다.
export const SERVICE_LINK = "intoss://ait-fridgepick";

/** 공유 시트가 받는 길이의 공식 제한은 확인하지 못했다. 이 값은 지나치게 긴 메시지를 막기 위한 가정이다. */
export const MAX_SHARE_MESSAGE_LENGTH = 2000;

const TRUNCATION_NOTICE = "…(이하 생략, 전체 조리 순서는 냉털픽에서 확인해요)";

export type ShareResult = "shared" | "link_failed" | "send_failed";

const ingredientNameById = new Map(INGREDIENTS.map(({ id, name }) => [id, name]));

function ingredientSection(recipe: Recipe): string {
  if (recipe.sourceIngredientText) {
    return recipe.sourceIngredientText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }
  return [
    ...recipe.requiredIngredients.map((id) => ingredientNameById.get(id) ?? id),
    ...(recipe.unmappedRequiredIngredients ?? []),
  ].join(", ");
}

function numberedSteps(recipe: Recipe): string[] {
  return recipe.steps.map((step, index) => `${index + 1}. ${step.replace(/^\d+\.\s+/, "")}`);
}

/**
 * 메뉴 이름·재료와 분량·조리 순서·출처를 담은 공유 메시지. 길면 조리 순서를 단계 단위로 줄인다.
 */
export function buildShareMessage(recipe: Recipe, link: string): string {
  const head = `오늘 메뉴는 ${recipe.name}!\n\n[재료]\n${ingredientSection(recipe)}\n\n[조리 순서]\n`;
  // 출처, 안내 문구는 한 줄씩 띄워 눈에 띄게 하고, 링크는 안내 문구 바로 아래에 둔다.
  const sourceBlock = recipe.source ? `출처: ${recipe.source.provider} ${recipe.source.dataset}\n\n` : "";
  const tail = `${sourceBlock}토스에서 냉털픽으로 골랐어요.\n${link}`;
  const compose = (steps: string[], truncated: boolean) =>
    `${head}${steps.join("\n")}${truncated ? `\n${TRUNCATION_NOTICE}` : ""}\n\n${tail}`;

  const steps = numberedSteps(recipe);
  const full = compose(steps, false);
  if (full.length <= MAX_SHARE_MESSAGE_LENGTH) return full;

  for (let count = steps.length - 1; count >= 1; count -= 1) {
    const shortened = compose(steps.slice(0, count), true);
    if (shortened.length <= MAX_SHARE_MESSAGE_LENGTH) return shortened;
  }
  return compose([], true);
}

/**
 * 추천 레시피를 공유한다. 링크 생성 실패와 공유 시트 거부(사용자 취소 포함)를 구분해 돌려준다.
 */
export async function shareRecommendation(recipe: Recipe): Promise<ShareResult> {
  let link: string;
  try {
    link = await Share.createLink({ path: SERVICE_LINK });
  } catch {
    return "link_failed";
  }
  try {
    await Share.sendMessage({ message: buildShareMessage(recipe, link) });
    return "shared";
  } catch {
    return "send_failed";
  }
}
