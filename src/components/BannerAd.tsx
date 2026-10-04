import { TossAds } from "@apps-in-toss/web-framework";
import { useEffect, useRef, useState } from "react";
import { BANNER_AD_GROUP_ID } from "../ads/bannerAds";

type BannerState = "loading" | "visible" | "hidden";

export function BannerAd() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<BannerState>("loading");

  useEffect(() => {
    const target = targetRef.current;

    try {
      if (!target) {
        return;
      }
      if (!TossAds.attachBanner.isSupported()) {
        console.info("현재 환경에서 배너 광고를 표시할 수 없습니다.");
        return;
      }

      const banner = TossAds.attachBanner(
        BANNER_AD_GROUP_ID,
        target,
        {
          callbacks: {
            onAdRendered: () => setState("visible"),
            onNoFill: () => {
              console.info("표시할 배너 광고가 없습니다.");
              setState("hidden");
            },
            onAdFailedToRender: ({ error }) => {
              console.error("배너 광고 렌더링에 실패했습니다.", error.message);
              setState("hidden");
            },
          },
        },
      );

      return () => banner.destroy();
    } catch (error) {
      console.error("배너 광고를 부착하지 못했습니다.", error);
      queueMicrotask(() => setState("hidden"));
    }
  }, []);

  return (
    <div
      ref={targetRef}
      className="ingredient-page-ad"
      data-state={state}
      role="region"
      aria-label="배너 광고"
      aria-hidden={state === "hidden"}
    />
  );
}
