# 식품안전나라 레시피 CSV 카탈로그 확장

- 상태: 입력 CSV 분석 완료, 구현 전
- 작성일: 2026-09-29
- 개발 브랜치: `feature/public-recipe-catalog`
- 대상: 앱인토스 WebView 미니앱 (`ait-fridgepick`)
- 로드맵: [`specs/roadmap.md`](../roadmap.md) 8단계 (MVP 이후)

## 목표

레시피가 적어 추천 가능한 조합이 부족한 문제를 줄이기 위해, 식품안전나라 조리식품 레시피 DB에서 운영자가 CSV를 내려받아 품질과 이용 조건을 확인하고, 앱에서 사용할 수 있는 로컬 정적 카탈로그로 정규화한다.

앱인토스 미니앱은 외부 API를 호출하지 않고 빌드 시 포함된 정적 카탈로그를 사용한다. 인증키는 미니앱 번들·저장소에 포함하지 않는다. 원본 CSV를 Git에 넣거나 데이터를 앱에 재배포하기 전에 제공기관의 이용·재사용 조건을 확인한다.

## 문서

- [`requirements.md`](./requirements.md): 범위, 요구사항 ID, 완료 조건
- [`design.md`](./design.md): CSV 처리와 앱 데이터 설계, 제약
- [`decisions.md`](./decisions.md): 현재 결정과 확인이 필요한 사항
- [`validation.md`](./validation.md): 데이터·추천·빌드 검증 방법
- [`plan.md`](./plan.md): 구현 순서와 확인 조건
- [`HANDOFF.md`](./HANDOFF.md): 현재 작업 상태와 다음 세션 인수인계

## 현재 상태와 전제

- 기존 앱에는 로컬 레시피 20개와 재료 카탈로그 28개가 있다.
- 사용자는 식품안전나라 레시피 DB용 인증키가 이미 있어 CSV를 받을 수 있다고 확인했다. 키 자체는 공유하거나 저장하지 않는다.
- 사용자가 루트에 제공한 `COOKRCP01.csv`는 UTF-8 BOM, 55개 열, 1,164개 데이터 행이며 `RCP_SEQ`는 모두 고유하다. 조리 단계가 없는 행은 1개다. 원본 파일은 로컬 입력이며 Git에 커밋하지 않는다.
- 현재 28개 재료만 대상으로 한 초기 분석에서는 매핑 가능성이 낮았다. 토큰화와 매핑 규칙을 확정한 결과가 아니므로 최종 포함 건수로 간주하지 않는다. 상세 상태와 다음 분석 순서는 인수인계 문서에 기록했다.
- 식품안전나라 API 상세 페이지는 CSV 다운로드 방식을 안내하지만, 이 페이지만으로 앱 번들 내 레시피 내용 재배포 허용 범위는 확인되지 않았다.
- 사용자가 실제 앱인토스 미니앱에서 핵심 사이클이 정상 동작함을 확인했다. 로드맵 7단계 완료 여부는 사용자 확인으로 기록했다.
- 이 기능은 MVP 이후 로드맵 8단계 작업이다. 앱 번들에 파생 데이터를 포함하기 전 재사용·가공·재배포 허용 범위와 출처 표시 조건을 확인해야 한다.

## 기준 자료

- [식품안전나라 조리식품의 레시피 DB](https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=COOKRCP01)
- [식품안전나라 공공데이터 활용 방법](https://www.foodsafetykorea.go.kr/api/howToUseApi.do)
- [앱인토스 개발자센터: 앱인토스 개요](https://developers-apps-in-toss.toss.im/intro/overview.html)
- [앱인토스 개발자센터: 주요 기능과 번들 검토](https://developers-apps-in-toss.toss.im/development/test/function.html)
- [로드맵](../roadmap.md)
- [레시피 데이터와 타입](../26-09-29_feature_recipe_data/README.md)
- [재료 카탈로그와 선택](../26-09-29_feature_ingredient_catalog_selection/README.md)
