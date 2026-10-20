import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./data/recipes", async () => {
  const { TEST_RECIPES } = await import("./test/fixtures/recipes");
  return { RECIPES: TEST_RECIPES };
});

const ads = vi.hoisted(() => ({
  attachBanner: vi.fn(),
  destroyBanner: vi.fn(),
  // 광고 SDK 초기화 결과. bannerAds의 초기화 상태는 모듈에 캐시되므로 테스트에서 직접 제어한다.
  ready: true,
}));

vi.mock("./ads/bannerAds", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./ads/bannerAds")>()),
  initializeBannerAds: () => Promise.resolve(ads.ready),
}));

vi.mock("@apps-in-toss/web-framework", () => ({
  User: { getAnonymousKey: Object.assign(vi.fn(), { isSupported: () => false }) },
  graniteEvent: { addEventListener: () => () => {} },
  TossAds: {
    initialize: Object.assign(vi.fn(), { isSupported: () => true }),
    attachBanner: Object.assign(ads.attachBanner, { isSupported: () => true }),
  },
}));

// 결과 화면 서비스 콘텐츠의 문서 하단 위치. 뷰포트(jsdom 기본 768)보다 크면 스크롤이 생긴다.
let resultContentBottom = 3000;

beforeEach(() => {
  resultContentBottom = 3000;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const bottom = this.classList.contains("result-page-content") ? resultContentBottom : 0;
    return { bottom, top: 0, height: 0, width: 0, left: 0, right: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  ads.ready = true;
  ads.attachBanner.mockReset().mockImplementation(() => ({ destroy: ads.destroyBanner }));
  ads.destroyBanner.mockReset();
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

async function showResult(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "재료 고르기" }));
  await user.click(screen.getByRole("button", { name: "김치" }));
  await user.click(screen.getByRole("button", { name: "탄수화물" }));
  await user.click(screen.getByRole("button", { name: "밥" }));
  await user.click(screen.getByRole("button", { name: "양념" }));
  await user.click(screen.getByRole("button", { name: "식용유" }));
  await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
  await screen.findByRole("heading", { name: "추천 결과" });
}

function renderApp() {
  render(<TDSMobileAITProvider><App /></TDSMobileAITProvider>);
  return userEvent.setup();
}

describe("추천 결과 화면 하단 배너 광고", () => {
  it("스크롤되는 결과 화면의 맨 아래(버튼 다음)에 배너를 붙인다", async () => {
    const user = renderApp();
    await showResult(user);

    const banner = await screen.findByRole("region", { name: "배너 광고" });
    const main = screen.getByRole("main");
    expect(main.lastElementChild).toBe(banner);
    expect(main.querySelector(".result-page-content")).toContainElement(screen.getByRole("button", { name: "처음부터" }));
    expect(main.querySelector(".result-page-content")).not.toContainElement(banner);
    expect(ads.attachBanner).toHaveBeenCalled();
  });

  it("결과 콘텐츠가 한 화면에 들어오면 배너를 붙이지 않는다", async () => {
    resultContentBottom = 300;
    const user = renderApp();
    await showResult(user);

    expect(screen.queryByRole("region", { name: "배너 광고" })).not.toBeInTheDocument();
  });

  it("광고 SDK가 준비되지 않으면 배너를 붙이지 않고 결과를 계속 쓸 수 있다", async () => {
    ads.ready = false;
    const user = renderApp();
    await showResult(user);

    expect(screen.queryByRole("region", { name: "배너 광고" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "처음부터" })).toBeEnabled();
  });

  it("결과 화면을 떠나면 배너를 해제한다", async () => {
    const user = renderApp();
    await showResult(user);
    await screen.findByRole("region", { name: "배너 광고" });

    await user.click(screen.getByRole("button", { name: "홈으로" }));

    await waitFor(() => expect(ads.destroyBanner).toHaveBeenCalled());
    expect(screen.queryByRole("region", { name: "배너 광고" })).not.toBeInTheDocument();
  });
});
