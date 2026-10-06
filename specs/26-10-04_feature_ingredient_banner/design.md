# 설계: 재료 화면 조건부 배너

## 구성

| 구성 | 책임 | 요구사항 |
| --- | --- | --- |
| [App](../../src/App.tsx) | SDK 준비 상태를 재료 화면에 전달 | IB-01·05 |
| [HomePage](../../src/pages/HomePage.tsx) | 광고 없는 시작 화면 | IB-01 |
| [IngredientPage](../../src/pages/IngredientPage.tsx) | 서비스 콘텐츠 wrapper와 마지막 배너 영역 | IB-01·02·04 |
| [ScrollableIngredientBanner](../../src/components/ScrollableIngredientBanner.tsx) | 광고를 제외한 높이 측정·구독·해제 | IB-02·03·06 |
| [BannerAd](../../src/components/BannerAd.tsx) | SDK 부착·destroy·실패 슬롯 숨김 | IB-05·06 |
| [CSS](../../src/App.css) | 기존 콘텐츠 간격24px, CTA와 배너32px, 숨김 슬롯 display:none | IB-04·06 |
| [광고 설정](../../src/ads/bannerAds.ts) | 기존 초기화 및 ID 분기 | IB-07 |

## 판정과 수명

contentRef는 배너 앞의 서비스 콘텐츠만 가리킨다. getBoundingClientRect().bottom+scrollY에 조상들의 실제 bottom padding을 더해 광고가 없는 경우의 문서 하단을 계산한다. innerHeight+1보다 크면 배너를 렌더한다. 광고 높이와 flex gap32px를 포함하지 않아 광고가 만든 overflow로 스스로 적격이 되지 않는다.

ResizeObserver는 콘텐츠와 documentElement를 관찰하고 window resize도 구독한다. 조건이 바뀌면 BannerAd가 마운트/언마운트되며 SDK 슬롯을 부착/해제한다. observer와 listener는 언마운트에서 정리한다. observer 미지원은 배너를 생략한다.

배너 자체는 SDK 표준 컴포넌트와 콜백을 사용한다. no-fill·실패 시 display:none으로 flex item을 제외해 간격도 접힌다. 실제 네이티브 safe area, Ad 표시, 카테고리 변화, 큰 글자·회전 환경의 판정은 기기로 검증한다.

32px은 프로젝트 결정값으로 공식 안전 최소 간격이 아니다. 정책·콘솔 판정은 [상위 검증](../26-10-02_feature_release_checklist_readiness/validation.md)에서 관리한다.
