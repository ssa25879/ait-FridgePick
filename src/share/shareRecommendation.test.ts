import { beforeEach, describe, expect, it, vi } from "vitest";
import { SERVICE_LINK, buildShareMessage, shareRecommendation } from "./shareRecommendation";

const sdk = vi.hoisted(() => ({ createLink: vi.fn(), sendMessage: vi.fn() }));

vi.mock("@apps-in-toss/web-framework", () => ({
  Share: { createLink: sdk.createLink, sendMessage: sdk.sendMessage },
}));

beforeEach(() => {
  sdk.createLink.mockReset().mockResolvedValue("https://toss.im/share/abc");
  sdk.sendMessage.mockReset().mockResolvedValue(undefined);
});

describe("buildShareMessage", () => {
  it("메뉴 이름과 링크를 담고 금지 표현을 쓰지 않는다", () => {
    const message = buildShareMessage("김치볶음밥", "https://toss.im/share/abc");

    expect(message).toContain("김치볶음밥");
    expect(message).toContain("https://toss.im/share/abc");
    expect(message).toContain("토스");
    for (const banned of ["공식 파트너", "입점사", "제휴사"]) expect(message).not.toContain(banned);
  });
});

describe("shareRecommendation", () => {
  it("서비스 링크로 공유 링크를 만들고 공유 시트를 연다", async () => {
    await expect(shareRecommendation("김치볶음밥")).resolves.toBe("shared");

    expect(sdk.createLink).toHaveBeenCalledWith({ path: SERVICE_LINK });
    expect(sdk.sendMessage).toHaveBeenCalledWith({
      message: buildShareMessage("김치볶음밥", "https://toss.im/share/abc"),
    });
  });

  it("링크를 만들지 못하면 시트를 열지 않고 link_failed를 돌려준다", async () => {
    sdk.createLink.mockRejectedValue(new Error("unsupported"));

    await expect(shareRecommendation("김치볶음밥")).resolves.toBe("link_failed");
    expect(sdk.sendMessage).not.toHaveBeenCalled();
  });

  it("공유 시트가 거부(취소 포함)되면 send_failed를 돌려주고 던지지 않는다", async () => {
    sdk.sendMessage.mockRejectedValue(new Error("cancelled"));

    await expect(shareRecommendation("김치볶음밥")).resolves.toBe("send_failed");
  });
});
