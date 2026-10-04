# 재료 선택 화면의 스크롤 조건부 배너

작성일: 2026-10-04. 브랜치: feature/user-state-persistence. 보완 2번.

## 결정과 근거

사용자는 기존 홈 배너에 대한 대안 중 “재료 선택 화면 하단으로 이동하고 스크롤 조건 적용”을 선택했다. 이는 이전 홈 전용 배치 결정을 대체한다.

공식 [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame)는 배너를 스크롤 가능한 화면에만 표시하고 일시적 인트로 등에 표시하지 않도록 요구한다. [배너 SSP 정책](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa/web-banner#policy)은 광고 Ad 표시 유지, 표준 SDK 컴포넌트 사용, CTA와의 인접 배치로 오클릭을 유발하는 구조 금지를 요구한다. 2026-10-04 조회 기준이며 이후 변경될 수 있다.

이전 홈 320×640에서 scrollHeight=640, viewport=640이었다. 재료 화면은 실제 재료·필터 선택 기능을 제공하므로 소개 화면보다 적합하며, 실제 콘텐츠가 넘칠 때만 배너를 붙인다. 이 판단은 로컬 구현 근거이며 토스 검수 승인이나 실기기 통과를 의미하지 않는다.

## 구현 계약

- 홈·추천 결과·빈 결과에는 배너를 표시하지 않는다.
- 재료 화면의 메뉴 뽑기 CTA 아래 일반 문서 흐름에 하나만 배치한다. fixed 오버레이나 광고용 빈 콘텐츠를 만들지 않는다.
- CTA와 배너 간격은 32px이다. 이 수치는 프로젝트의 배치 선택이며 공식 최소 허용 거리로 단정하지 않는다.
- 원래 재료 화면 콘텐츠를 별도 wrapper로 측정한다. 콘텐츠 하단의 문서 좌표와 조상 하단 padding이 viewport 높이를 1px보다 많이 넘을 때만 광고를 부착한다. 광고 높이·광고 앞 간격은 판정에 포함하지 않는다.
- ResizeObserver로 콘텐츠/문서 크기 변화, window resize로 화면 크기 변화를 다시 판정한다. 조건이 없어지면 광고를 destroy하고, 조건이 다시 생기면 재부착한다. ResizeObserver 미지원이면 광고 없이 핵심 기능을 유지한다.
- SDK 초기화·지원 검사·테스트/출시 ID 분기는 기존 방식이다. 기존 HomeBannerAd는 BannerAd로 이름을 바꿨다.
- no-fill·렌더 실패 시 배너를 display:none으로 접고 빈 간격을 남기지 않는다. 핵심 메뉴 추천 버튼은 계속 작동한다.

## 검증

- RED: 변경 전 App 회귀 테스트 17개 중 3개 실패, 기존 배치와 스크롤 조건 미구현을 확인했다.
- 최종 전체 테스트: 10개 파일 98개 통과. 대상 테스트 실행 중 기존 필터 테스트가 5초 제한에 걸린 1회 실패가 있었으며 검증 서버 종료 후 전체 재실행에서 코드/timeout 설정 변경 없이 통과했다. 부하가 원인이었는지는 확정하지 않는다.
- lint 종료0, 기존 useInAppAds 경고1건. TypeScript·기본/출시 Vite/AIT 빌드 모두 통과. JS 약2.377 MB 청크 경고 유지.
- 독립 코드 리뷰 Critical/Important 없음. observer 콜백에 의한 콘텐츠 재측정·ResizeObserver 미지원 경로의 직접 자동 테스트는 추가하지 않았으며 브라우저 크기 변화는 실제 검증했다.
- 브라우저 AIT DevTools: 320×640 재료 화면 콘텐츠 하단 1472.875px, 전체 scrollHeight=1649px, 배너 1개.
- 480×2000으로 늘리면 전체 높이 2000px, 배너 0개. 다시 320×640으로 줄이면 배너 1개, CTA 간격 32px, 가로 넘침 없음. 홈으로 이동하면 배너 0개.
- 기존 TDS safe-area 브라우저 오류가 있으며 실제 WebView의 safe area·광고 Ad 표기·no-fill·종료·오클릭/검수 적합성은 기기 QA 대기다.
- 콘솔 업로드·테스트 푸시·실제 광고 클릭·출시·커밋·push는 수행하지 않는다. 실제 광고 ID의 기존 원격 노출 문제는 별도 후속이다.

## 변경 파일

src/pages/HomePage.tsx, src/pages/IngredientPage.tsx, src/App.tsx, src/App.css, src/components/BannerAd.tsx, src/components/ScrollableIngredientBanner.tsx, src/App.test.tsx.
