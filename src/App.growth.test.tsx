import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./data/recipes", async () => {
  const { TEST_RECIPES } = await import("./test/fixtures/recipes");
  return { RECIPES: TEST_RECIPES };
});

const sdk = vi.hoisted(() => ({
  log: vi.fn(),
  createLink: vi.fn(),
  sendMessage: vi.fn(),
  reviewRequest: vi.fn(),
  reviewSupported: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock("@apps-in-toss/web-framework", () => ({
  Analytics: { log: sdk.log },
  Share: { createLink: sdk.createLink, sendMessage: sdk.sendMessage },
  Review: { request: Object.assign(sdk.reviewRequest, { isSupported: sdk.reviewSupported }) },
  Storage: { getItem: sdk.getItem, setItem: sdk.setItem },
  User: { getAnonymousKey: Object.assign(vi.fn(), { isSupported: () => false }) },
  graniteEvent: { addEventListener: () => () => {} },
  TossAds: {
    initialize: Object.assign(vi.fn(), { isSupported: () => false }),
    attachBanner: Object.assign(vi.fn(), { isSupported: () => false }),
  },
}));

beforeEach(() => {
  sdk.log.mockReset().mockResolvedValue(undefined);
  sdk.createLink.mockReset().mockResolvedValue("https://toss.im/share/abc");
  sdk.sendMessage.mockReset().mockResolvedValue(undefined);
  sdk.reviewRequest.mockReset().mockResolvedValue(undefined);
  sdk.reviewSupported.mockReset().mockReturnValue(true);
  sdk.getItem.mockReset().mockResolvedValue(null);
  sdk.setItem.mockReset().mockResolvedValue(undefined);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(() => { vi.unstubAllGlobals(); });

type User = ReturnType<typeof userEvent.setup>;

async function showReadyResult(user: User) {
  await user.click(screen.getByRole("button", { name: "재료 고르기" }));
  await user.click(screen.getByRole("button", { name: "김치" }));
  await user.click(screen.getByRole("button", { name: "계란·유제품" }));
  await user.click(screen.getByRole("button", { name: "달걀" }));
  await user.click(screen.getByRole("button", { name: "탄수화물" }));
  await user.click(screen.getByRole("button", { name: "밥" }));
  await user.click(screen.getByRole("button", { name: "양념" }));
  await user.click(screen.getByRole("button", { name: "식용유" }));
  await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
}

function renderApp(): User {
  render(<TDSMobileAITProvider><App /></TDSMobileAITProvider>);
  return userEvent.setup();
}

const loggedNames = () => sdk.log.mock.calls.map(([event]) => event.log_name);

describe("결과 공유", () => {
  it("추천이 없으면 공유 버튼을 보이지 않는다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(screen.queryByRole("button", { name: "결과 공유하기" })).not.toBeInTheDocument();
  });

  it("공유 버튼을 누르면 메뉴 이름으로 공유하고 share_tap을 기록한다", async () => {
    const user = renderApp();
    await showReadyResult(user);
    const menuName = screen.getByRole("heading", { level: 2 }).textContent!;

    await user.click(screen.getByRole("button", { name: "결과 공유하기" }));

    await waitFor(() => expect(sdk.sendMessage).toHaveBeenCalledTimes(1));
    expect(sdk.sendMessage.mock.calls[0][0].message).toContain(menuName);
    expect(loggedNames()).toContain("share_tap");
  });

  it("링크를 만들지 못하면 안내하고 앱은 계속 쓸 수 있다", async () => {
    sdk.createLink.mockRejectedValue(new Error("unsupported"));
    const user = renderApp();
    await showReadyResult(user);

    await user.click(screen.getByRole("button", { name: "결과 공유하기" }));

    expect(await screen.findByText("공유 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 뽑기" })).toBeEnabled();
  });

  it("공유 시트를 취소해도 오류 안내를 보이지 않는다", async () => {
    sdk.sendMessage.mockRejectedValue(new Error("cancelled"));
    const user = renderApp();
    await showReadyResult(user);

    await user.click(screen.getByRole("button", { name: "결과 공유하기" }));

    await waitFor(() => expect(sdk.sendMessage).toHaveBeenCalled());
    expect(screen.queryByText(/공유 링크를 만들지 못했어요/)).not.toBeInTheDocument();
  });
});

describe("리뷰 요청", () => {
  it("첫 결과만으로는 요청하지 않는다", async () => {
    const user = renderApp();
    await showReadyResult(user);

    expect(sdk.reviewRequest).not.toHaveBeenCalled();
  });

  it("바로 만들 수 있는 메뉴를 두 번째로 보면 한 번만 요청하고 기록한다", async () => {
    const user = renderApp();
    await showReadyResult(user);

    await user.click(screen.getByRole("button", { name: "다시 뽑기" }));
    await waitFor(() => expect(sdk.reviewRequest).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(loggedNames()).toContain("review_request"));

    await user.click(screen.getByRole("button", { name: "다시 뽑기" }));
    expect(sdk.reviewRequest).toHaveBeenCalledTimes(1);
  });

  it("이미 요청한 기기에서는 요청하지 않는다", async () => {
    sdk.getItem.mockResolvedValue("1");
    const user = renderApp();
    await showReadyResult(user);

    await user.click(screen.getByRole("button", { name: "다시 뽑기" }));

    await waitFor(() => expect(sdk.getItem).toHaveBeenCalled());
    expect(sdk.reviewRequest).not.toHaveBeenCalled();
    expect(loggedNames()).not.toContain("review_request");
  });
});
