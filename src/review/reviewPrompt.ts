import { Review, Storage } from "@apps-in-toss/web-framework";

const REQUESTED_KEY = "fridgepick:review-requested:v1";

/** 바로 만들 수 있는 메뉴를 이만큼 본 뒤에 리뷰를 요청한다. 근거 있는 값이 아니라 시작 가정이다. */
export const REVIEW_READY_VIEW_THRESHOLD = 2;

/**
 * 리뷰를 기기당 한 번만 요청한다. 요청 기록을 먼저 저장하고, 저장하지 못하면 반복 요청을 막기 위해 요청하지 않는다.
 * 실제로 요청했을 때만 true를 돌려주며 실패는 던지지 않는다.
 */
export async function requestReviewOnce(): Promise<boolean> {
  try {
    if (!Review.request.isSupported()) return false;
    if ((await Storage.getItem(REQUESTED_KEY)) !== null) return false;
    await Storage.setItem(REQUESTED_KEY, "1");
    await Review.request();
    return true;
  } catch {
    return false;
  }
}
