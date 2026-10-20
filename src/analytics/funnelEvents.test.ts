import { beforeEach, describe, expect, it, vi } from "vitest";
import { logFunnelEvent } from "./funnelEvents";

const sdk = vi.hoisted(() => ({ log: vi.fn() }));

vi.mock("@apps-in-toss/web-framework", () => ({
  Analytics: { log: sdk.log },
}));

beforeEach(() => {
  sdk.log.mockReset();
  sdk.log.mockResolvedValue(undefined);
});

describe("logFunnelEvent", () => {
  it("이벤트 이름·종류·비식별 값을 SDK에 전달한다", () => {
    logFunnelEvent("result_view", { selected_count: 3, candidate_count: 7, group: "ready" });

    expect(sdk.log).toHaveBeenCalledWith({
      log_name: "result_view",
      log_type: "screen",
      params: { selected_count: 3, candidate_count: 7, group: "ready" },
    });
  });

  it("파라미터가 없는 이벤트는 빈 params로 보낸다", () => {
    logFunnelEvent("app_entry");
    logFunnelEvent("ingredient_select_start");

    expect(sdk.log).toHaveBeenNthCalledWith(1, { log_name: "app_entry", log_type: "screen", params: {} });
    expect(sdk.log).toHaveBeenNthCalledWith(2, { log_name: "ingredient_select_start", log_type: "click", params: {} });
  });

  it("SDK가 동기적으로 던져도 호출자에게 전파하지 않는다", () => {
    sdk.log.mockImplementation(() => { throw new Error("unsupported"); });

    expect(() => logFunnelEvent("reroll", { candidate_count: 2, group: "needs" })).not.toThrow();
  });

  it("SDK가 거부해도 처리되지 않은 거부를 남기지 않는다", () => {
    const rejected = Promise.reject(new Error("network"));
    const handled = vi.spyOn(rejected, "catch");
    sdk.log.mockReturnValue(rejected);

    logFunnelEvent("app_entry");

    expect(handled).toHaveBeenCalledTimes(1);
  });
});
