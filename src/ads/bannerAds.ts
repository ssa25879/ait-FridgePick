import { TossAds } from "@apps-in-toss/web-framework";

export const TEST_BANNER_AD_GROUP_ID = "ait-ad-test-banner-id";

let initialization: Promise<boolean> | undefined;

export function initializeBannerAds(): Promise<boolean> {
  if (initialization) {
    return initialization;
  }

  initialization = new Promise((resolve) => {
    try {
      if (!TossAds.initialize.isSupported()) {
        console.info("배너 광고 SDK를 지원하지 않는 환경입니다.");
        resolve(false);
        return;
      }

      TossAds.initialize({
        callbacks: {
          onInitialized: () => {
            try {
              const isBannerSupported = TossAds.attachBanner.isSupported();
              if (!isBannerSupported) {
                console.info("배너 광고 API를 지원하지 않는 환경입니다.");
              }
              resolve(isBannerSupported);
            } catch {
              console.warn("배너 광고 API 지원 여부를 확인하지 못했습니다.");
              resolve(false);
            }
          },
          onInitializationFailed: (error) => {
            console.error("배너 광고 SDK 초기화에 실패했습니다.", error);
            resolve(false);
          },
        },
      });
    } catch (error) {
      console.error("배너 광고 SDK 초기화에 실패했습니다.", error);
      resolve(false);
    }
  });

  return initialization;
}
