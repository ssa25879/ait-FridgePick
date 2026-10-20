import { Share } from "@apps-in-toss/web-framework";

// 콘솔 미니앱 정보의 서비스 링크. 받는 사람은 앱 첫 화면으로 들어온다.
export const SERVICE_LINK = "intoss://ait-fridgepick";

export type ShareResult = "shared" | "link_failed" | "send_failed";

export function buildShareMessage(recipeName: string, link: string): string {
  return `오늘 메뉴는 ${recipeName}! 토스에서 냉털픽으로 골랐어요.\n${link}`;
}

/**
 * 추천 결과를 공유한다. 링크 생성 실패와 공유 시트 거부(사용자 취소 포함)를 구분해 돌려준다.
 */
export async function shareRecommendation(recipeName: string): Promise<ShareResult> {
  let link: string;
  try {
    link = await Share.createLink({ path: SERVICE_LINK });
  } catch {
    return "link_failed";
  }
  try {
    await Share.sendMessage({ message: buildShareMessage(recipeName, link) });
    return "shared";
  } catch {
    return "send_failed";
  }
}
