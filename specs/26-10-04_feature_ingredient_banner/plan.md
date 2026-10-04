# 실행 계획: 재료 화면 조건부 배너

이 문서는 3a9972c에 구현된 작업과 다음 검증을 추적한다. 문서 작성 자체를 새 구현 완료로 세지 않는다.

| 작업 | 요구사항 | 대상 파일 | 상태 |
| --- | --- | --- | --- |
| 홈 광고 제거·재료 화면에 준비 상태 전달 | IB-01 | App.tsx, pages/HomePage.tsx, pages/IngredientPage.tsx | 구현 완료 |
| 콘텐츠 wrapper·스크롤 판정·크기 변화 구독 | IB-02·03 | pages/IngredientPage.tsx, components/ScrollableIngredientBanner.tsx | 구현·resize 테스트 완료, observer 직접 테스트 미완료 |
| SDK 컴포넌트 이름/슬롯 처리·CTA 간격 | IB-04~06 | components/BannerAd.tsx, App.css | 구현·로컬 확인 완료 |
| 화면 제한·조건 변화·광고 실패 통합 테스트 | IB-01·03·05·06 | App.test.tsx | 기존 실행 통과 |
| 기본/출시 빌드와 ID 분기 | IB-07 | ads/bannerAds.ts | 기존 빌드 통과, 원격 비노출 목표 미달성 |
| 실제 토스 테스트 광고·safe area·Ad·회전/큰글자 | IB-04·08 | validation.md, 상위 출시 검증 | 미실행 |

후속 순서: [상위 계획](../26-10-02_feature_release_checklist_readiness/plan.md)의 선행 조건 확인→테스트 번들 준비→승인된 기기 실행→실패 재현과 수정→검증 기록 갱신. 재실행 명령은 npm test, npm run lint, npm run build이며 문서 정리만 하는 이번 작업에서는 제품 테스트를 재실행하지 않는다.
