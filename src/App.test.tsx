import { StrictMode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const ads = vi.hoisted(() => ({
  initialize: vi.fn(),
  initializeSupported: vi.fn(),
  attachBanner: vi.fn(),
  attachBannerSupported: vi.fn(),
  destroyBanner: vi.fn(),
}));

vi.mock("@apps-in-toss/web-framework", () => ({
  User: { getAnonymousKey: Object.assign(vi.fn(), { isSupported: () => false }) },
  graniteEvent: { addEventListener: () => () => {} },
  TossAds: {
    initialize: Object.assign(ads.initialize, {
      isSupported: ads.initializeSupported,
    }),
    attachBanner: Object.assign(ads.attachBanner, {
      isSupported: ads.attachBannerSupported,
    }),
  },
}));

let contentBottom = 1000;
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

beforeEach(() => {
  contentBottom = 1000;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return { bottom: this.classList.contains("ingredient-page-content") ? contentBottom : 0, top: 0, height: 0, width: 0, left: 0, right: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.clearAllMocks();
  ads.initializeSupported.mockReturnValue(true);
  ads.initialize.mockImplementation((options) => {
    options.callbacks?.onInitialized?.();
  });
  ads.attachBannerSupported.mockReturnValue(true);
  ads.attachBanner.mockImplementation(() => ({ destroy: ads.destroyBanner }));
});

function renderApp() {
  const user = userEvent.setup();
  render(
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>,
  );

  return user;
}

describe("재료 선택 흐름", () => {
  it("StrictMode에서도 홈에는 광고가 없고 스크롤 가능한 재료 화면에서 부착·해제한다", async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <TDSMobileAITProvider>
          <App />
        </TDSMobileAITProvider>
      </StrictMode>,
    );

    expect(screen.queryByRole("region", { name: "배너 광고" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    expect(await screen.findByRole("region", { name: "배너 광고" })).toBeInTheDocument();
    expect(ads.initialize).toHaveBeenCalledTimes(1);
    expect(ads.attachBanner).toHaveBeenCalled();
    expect(ads.attachBanner.mock.calls[0][0]).toBe("ait-ad-test-banner-id");
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    expect(screen.queryByRole("region", { name: "배너 광고" })).not.toBeInTheDocument();
    expect(ads.destroyBanner).toHaveBeenCalledTimes(ads.attachBanner.mock.calls.length);
  });

  it("콘텐츠가 화면 안에 들어오면 광고가 스크롤을 만들지 않는다", async () => {
    contentBottom = 300;
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    expect(screen.queryByRole("region", { name: "배너 광고" })).not.toBeInTheDocument();
    expect(ads.attachBanner).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "메뉴 뽑기" })).toBeEnabled();
  });

  it("화면 크기 변경으로 스크롤 조건이 사라지면 슬롯을 해제하고 다시 필요할 때 부착한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await screen.findByRole("region", { name: "배너 광고" });
    contentBottom = 300;
    fireEvent(window, new Event("resize"));
    await waitFor(() => expect(screen.queryByRole("region", { name: "배너 광고" })).not.toBeInTheDocument());
    expect(ads.destroyBanner).toHaveBeenCalled();
    contentBottom = 1000;
    fireEvent(window, new Event("resize"));
    expect(await screen.findByRole("region", { name: "배너 광고" })).toBeInTheDocument();
  });

  it("광고가 없으면 슬롯을 접고 재료 CTA를 계속 사용할 수 있다", async () => {
    ads.attachBanner.mockImplementation((_groupId, _target, options) => {
      options.callbacks?.onNoFill?.({
        slotId: "test-slot",
        adGroupId: "test-group",
        adMetadata: {},
      });
      return { destroy: ads.destroyBanner };
    });
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await waitFor(() => expect(ads.attachBanner).toHaveBeenCalled());

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "배너 광고" }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "메뉴 뽑기" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(screen.getByRole("heading", { name: "추천 결과" })).toBeInTheDocument();
  });

  it("배너 렌더 실패 뒤에도 재료 CTA를 사용할 수 있다", async () => {
    ads.attachBanner.mockImplementation((_groupId, _target, options) => {
      options.callbacks?.onAdFailedToRender?.({
        slotId: "test-slot",
        adGroupId: "test-group",
        adMetadata: {},
        error: { code: 1, message: "render failed" },
      });
      return { destroy: ads.destroyBanner };
    });
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await waitFor(() => expect(ads.attachBanner).toHaveBeenCalled());

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "배너 광고" }),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(screen.getByRole("heading", { name: "추천 결과" })).toBeInTheDocument();
  });

  it("매칭률·난이도 필터를 결과 편집까지 유지하고 처음부터 기본값으로 초기화한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    const matchRate = screen.getByRole("slider", { name: "최소 매칭률" });
    expect(matchRate).toHaveValue("60");
    expect(matchRate).toHaveAttribute("min", "60");
    expect(matchRate).toHaveAttribute("max", "100");
    expect(matchRate).toHaveAttribute("step", "5");
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.change(matchRate, { target: { value: "80" } });
    await user.click(screen.getByRole("button", { name: "어려움" }));
    await user.click(screen.getByRole("button", { name: "계란·유제품" }));
    await user.click(screen.getByRole("button", { name: "달걀" }));
    await user.click(screen.getByRole("button", { name: "치즈" }));
    await user.click(screen.getByRole("button", { name: "버터" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByText("현재 재료로 추천할 수 있는 메뉴가 없어요."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "재료 추가·변경하기" }),
    );

    expect(
      screen.getByRole("slider", { name: "최소 매칭률" }),
    ).toHaveValue("80");
    expect(screen.getByRole("button", { name: "어려움" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await user.click(screen.getByRole("button", { name: "처음부터" }));

    expect(
      screen.getByRole("slider", { name: "최소 매칭률" }),
    ).toHaveValue("60");
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("화면 전환 후 새 화면의 기본 영역으로 초점을 옮긴다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(screen.getByRole("main")).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(screen.getByRole("main")).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "홈으로" }));

    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("홈에서 재료 선택 화면을 열면 채소 재료를 보여준다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(
      screen.getByRole("heading", { name: "재료 선택" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "김치" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "돼지고기" }),
    ).not.toBeInTheDocument();
  });

  it("카테고리를 바꾸면 해당 재료 목록만 보여준다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    await user.click(screen.getByRole("button", { name: "단백질" }));

    expect(
      screen.getByRole("button", { name: "돼지고기" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "김치" }),
    ).not.toBeInTheDocument();
  });

  it("서로 다른 카테고리의 재료를 선택하고 하나만 해제한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "김치" }));
    await user.click(screen.getByRole("button", { name: "단백질" }));
    await user.click(screen.getByRole("button", { name: "돼지고기" }));

    expect(
      screen.getByRole("heading", { name: "선택한 재료 2개" }),
    ).toBeInTheDocument();
    expect(screen.getByText("김치, 돼지고기")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "돼지고기" }));

    expect(
      screen.getByRole("heading", { name: "선택한 재료 1개" }),
    ).toBeInTheDocument();
    expect(screen.getByText("김치")).toBeInTheDocument();
    expect(screen.queryByText("김치, 돼지고기")).not.toBeInTheDocument();
  });

  it("홈으로 이동한 뒤 다시 돌아오면 재료 선택을 유지한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "김치" }));
    await user.click(screen.getByRole("button", { name: "홈으로" }));

    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(screen.getByRole("button", { name: "김치" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("heading", { name: "선택한 재료 1개" }),
    ).toBeInTheDocument();
  });

  it("추천 결과에서 홈으로 돌아간다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "김치" }));
    await user.click(screen.getByRole("button", { name: "탄수화물" }));
    await user.click(screen.getByRole("button", { name: "밥" }));
    await user.click(screen.getByRole("button", { name: "양념" }));
    await user.click(screen.getByRole("button", { name: "식용유" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByRole("heading", { name: "추천 결과" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "홈으로" }));

    expect(
      screen.getByRole("heading", {
        name: "냉장고 속 재료로 오늘 메뉴를 골라보세요",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(screen.getByRole("button", { name: "김치" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("대체 후보가 있으면 다시 뽑아 다른 메뉴를 보여준다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "계란·유제품" }));
    await user.click(screen.getByRole("button", { name: "달걀" }));
    await user.click(screen.getByRole("button", { name: "탄수화물" }));
    await user.click(screen.getByRole("button", { name: "밥" }));
    await user.click(screen.getByRole("button", { name: "양념" }));
    await user.click(screen.getByRole("button", { name: "식용유" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    const firstRecipe = screen.getByRole("heading", { level: 2 }).textContent;
    await user.click(screen.getByRole("button", { name: "다시 뽑기" }));

    expect(screen.getByRole("heading", { level: 2 }).textContent).not.toBe(
      firstRecipe,
    );
  });

  it("재료를 선택하지 않으면 먼저 재료를 고르도록 안내한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByText("메뉴를 추천하려면 재료를 먼저 선택해 주세요."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "재료 선택하기" }));
    expect(
      screen.getByRole("heading", { name: "선택한 재료 0개" }),
    ).toBeInTheDocument();
  });

  it("추천 후보가 없으면 재료를 추가하거나 바꾸도록 안내한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "당근" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByText("현재 재료로 추천할 수 있는 메뉴가 없어요."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "재료 추가·변경하기" }),
    );
    expect(screen.getByRole("button", { name: "당근" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("후보가 하나면 다시 뽑기 대신 단일 후보 안내를 표시한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "계란·유제품" }));
    await user.click(screen.getByRole("button", { name: "치즈" }));
    await user.click(screen.getByRole("button", { name: "버터" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByText("현재 재료로 추천할 수 있는 메뉴가 1개예요."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다시 뽑기" }),
    ).not.toBeInTheDocument();
  });

  it("처음부터를 누르면 선택 상태를 비우고 재료 선택으로 돌아간다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "김치" }));
    await user.click(screen.getByRole("button", { name: "탄수화물" }));
    await user.click(screen.getByRole("button", { name: "밥" }));
    await user.click(screen.getByRole("button", { name: "양념" }));
    await user.click(screen.getByRole("button", { name: "식용유" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await user.click(screen.getByRole("button", { name: "처음부터" }));

    expect(
      screen.getByRole("heading", { name: "선택한 재료 0개" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "김치" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
