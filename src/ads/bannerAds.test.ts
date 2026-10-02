import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  initialize: vi.fn(),
  initializeSupported: vi.fn(),
  attachBanner: vi.fn(),
  attachBannerSupported: vi.fn(),
}));

vi.mock("@apps-in-toss/web-framework", () => ({
  TossAds: {
    initialize: Object.assign(sdk.initialize, {
      isSupported: sdk.initializeSupported,
    }),
    attachBanner: Object.assign(sdk.attachBanner, {
      isSupported: sdk.attachBannerSupported,
    }),
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  sdk.initializeSupported.mockReturnValue(true);
  sdk.attachBannerSupported.mockReturnValue(true);
});

describe("배너 광고 초기화", () => {
  it("중복 호출과 관계없이 SDK를 한 번만 초기화한다", async () => {
    sdk.initialize.mockImplementation((options) => {
      options.callbacks?.onInitialized?.();
    });
    const { initializeBannerAds } = await import("./bannerAds");

    const first = initializeBannerAds();
    const second = initializeBannerAds();

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(sdk.initializeSupported).toHaveBeenCalledTimes(1);
    expect(sdk.initialize).toHaveBeenCalledTimes(1);
  });

  it("초기화 API를 지원하지 않으면 광고 없이 진행한다", async () => {
    sdk.initializeSupported.mockReturnValue(false);
    const { initializeBannerAds } = await import("./bannerAds");

    await expect(initializeBannerAds()).resolves.toBe(false);
    expect(sdk.initialize).not.toHaveBeenCalled();
  });

  it("초기화 실패를 광고 비활성 결과로 반환한다", async () => {
    sdk.initialize.mockImplementation((options) => {
      options.callbacks?.onInitializationFailed?.(new Error("SDK error"));
    });
    const { initializeBannerAds } = await import("./bannerAds");

    await expect(initializeBannerAds()).resolves.toBe(false);
  });

  it("배너 API를 지원하지 않으면 화면 슬롯 준비를 실패로 처리한다", async () => {
    sdk.initialize.mockImplementation((options) => {
      options.callbacks?.onInitialized?.();
    });
    sdk.attachBannerSupported.mockReturnValue(false);
    const { initializeBannerAds } = await import("./bannerAds");

    await expect(initializeBannerAds()).resolves.toBe(false);
  });
});

afterEach(() => vi.unstubAllEnvs());

describe("배너 광고 그룹 ID 선택", () => {
  it("테스트 모드는 공식 테스트 ID를 사용한다", async () => {
    const { BANNER_AD_GROUP_ID, TEST_BANNER_AD_GROUP_ID } = await import("./bannerAds");

    expect(BANNER_AD_GROUP_ID).toBe(TEST_BANNER_AD_GROUP_ID);
  });

  it("release 모드는 발급된 활성 그룹 ID를 사용한다", async () => {
    vi.stubEnv("MODE", "release");
    const { BANNER_AD_GROUP_ID, RELEASE_BANNER_AD_GROUP_ID } = await import("./bannerAds");

    expect(RELEASE_BANNER_AD_GROUP_ID).toBe("ait.v2.live.65a4afab51804f34");
    expect(BANNER_AD_GROUP_ID).toBe(RELEASE_BANNER_AD_GROUP_ID);
  });
});
