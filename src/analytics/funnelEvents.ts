import { Analytics } from "@apps-in-toss/web-framework";

// 재료 이름·ID 같은 선택 내용은 보내지 않는다. 개수와 추천 그룹 같은 비식별 값만 허용한다.
type CandidateGroup = "ready" | "needs";

interface FunnelEventParams {
  app_entry: Record<never, never>;
  ingredient_select_start: Record<never, never>;
  result_view: { selected_count: number; candidate_count: number; group: CandidateGroup };
  result_empty: { selected_count: number };
  reroll: { candidate_count: number; group: CandidateGroup };
}

export type FunnelEventName = keyof FunnelEventParams;

const LOG_TYPES = {
  app_entry: "screen",
  ingredient_select_start: "click",
  result_view: "screen",
  result_empty: "screen",
  reroll: "click",
} as const satisfies Record<FunnelEventName, "screen" | "click">;

type ParamsArgument<N extends FunnelEventName> =
  keyof FunnelEventParams[N] extends never ? [] : [params: FunnelEventParams[N]];

/**
 * 퍼널 이벤트를 기록한다. 기록 실패나 미지원 환경은 화면 흐름에 영향을 주지 않는다.
 */
export function logFunnelEvent<N extends FunnelEventName>(name: N, ...args: ParamsArgument<N>): void {
  try {
    const params = (args[0] ?? {}) as Record<string, string | number | boolean>;
    void Promise.resolve(
      Analytics.log({ log_name: name, log_type: LOG_TYPES[name], params }),
    ).catch(() => { /* 이벤트 전송 실패는 무시한다. */ });
  } catch {
    // 미지원 SDK나 모의 환경에서도 앱 흐름을 막지 않는다.
  }
}
