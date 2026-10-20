import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestReviewOnce } from "./reviewPrompt";

const sdk = vi.hoisted(() => ({
  request: vi.fn(),
  isSupported: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock("@apps-in-toss/web-framework", () => ({
  Review: { request: Object.assign(sdk.request, { isSupported: sdk.isSupported }) },
  Storage: { getItem: sdk.getItem, setItem: sdk.setItem },
}));

beforeEach(() => {
  sdk.request.mockReset().mockResolvedValue(undefined);
  sdk.isSupported.mockReset().mockReturnValue(true);
  sdk.getItem.mockReset().mockResolvedValue(null);
  sdk.setItem.mockReset().mockResolvedValue(undefined);
});

describe("requestReviewOnce", () => {
  it("처음에는 요청 기록을 먼저 남기고 리뷰를 요청한다", async () => {
    await expect(requestReviewOnce()).resolves.toBe(true);

    expect(sdk.setItem).toHaveBeenCalledTimes(1);
    expect(sdk.request).toHaveBeenCalledTimes(1);
    expect(sdk.setItem.mock.invocationCallOrder[0]).toBeLessThan(sdk.request.mock.invocationCallOrder[0]);
  });

  it("이미 요청한 기록이 있으면 다시 요청하지 않는다", async () => {
    sdk.getItem.mockResolvedValue("1");

    await expect(requestReviewOnce()).resolves.toBe(false);
    expect(sdk.request).not.toHaveBeenCalled();
  });

  it("미지원 환경에서는 기록도 요청도 하지 않는다", async () => {
    sdk.isSupported.mockReturnValue(false);

    await expect(requestReviewOnce()).resolves.toBe(false);
    expect(sdk.getItem).not.toHaveBeenCalled();
    expect(sdk.request).not.toHaveBeenCalled();
  });

  it("기록을 저장하지 못하면 반복 요청을 막기 위해 요청하지 않는다", async () => {
    sdk.setItem.mockRejectedValue(new Error("storage"));

    await expect(requestReviewOnce()).resolves.toBe(false);
    expect(sdk.request).not.toHaveBeenCalled();
  });

  it("기록을 읽지 못해도 던지지 않고 요청하지 않는다", async () => {
    sdk.getItem.mockRejectedValue(new Error("storage"));

    await expect(requestReviewOnce()).resolves.toBe(false);
    expect(sdk.request).not.toHaveBeenCalled();
  });

  it("리뷰 요청이 실패해도 던지지 않는다", async () => {
    sdk.request.mockRejectedValue(new Error("unsupported"));

    await expect(requestReviewOnce()).resolves.toBe(false);
  });
});
