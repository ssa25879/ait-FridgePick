# 식품안전나라 레시피 CSV 카탈로그 확장

- 상태: 구현·검증·커밋 완료, master 병합 완료 (`a30268a`)
- 작성일: 2026-09-29 / 구현 완료: 2026-10-01
- 작업 브랜치: `feature/public-recipe-catalog` (master에 병합됨)
- 대상: 앱인토스 WebView 미니앱 (`ait-fridgepick`)
- 로드맵: [`specs/roadmap.md`](../roadmap.md) 8단계

## 목표

레시피가 적어 추천 후보가 부족한 문제를 줄이기 위해, 식품안전나라 조리식품 레시피 CSV를 운영자가 내려받아 품질을 검토하고 앱에서 쓰는 정적 카탈로그로 변환한다. 앱 실행 중에는 원격 API를 호출하지 않고 인증키를 앱에 전달하지 않는다.

공공데이터포털의 [개별 식약처 레시피 DB 항목](https://www.data.go.kr/data/15060073/openapi.do)은 이용허락범위를 “제한 없음”으로 표시한다. 앱은 제공기관·원본 ID·출처를 남기며 제3자 권리 여부를 확인하지 않은 원본 이미지는 포함하지 않는다.

## 구현 결과

2026-10-04 정정: 코드의 실제 재료는 95개다. 아래 수치 중 테스트·번들 크기는 2026-10-01 검증 기록이며 최신 결과는 [문서 안내](../README.md)를 따른다.


- 입력 1,156행·55열의 CSV에서 888개 레시피를 포함하고 268개를 제외했다. 제외 원인과 데이터 무결성 검사는 [`validation.md`](./validation.md)에 있다.
- 재료 카탈로그는 28개에서 95개로 확장했다. 명시적 별칭만 연결하고, 미지원 필수 재료는 레시피 데이터와 결과 화면에 보존한다.
- 기존 수기 레시피 20개를 보존해 총 908개 레시피를 제공한다.
- 결과 화면에 보유 재료, 부족한 필수 재료, 원문 재료·분량, 출처와 원본 ID를 표시한다.
- 양념장·소스·드레싱 등은 기본적으로 필수 재료로, 고명·장식·토핑·곁들임은 선택 재료로 분류한다. CSV에 데이터 기준일이 없어 생성 요약에 `unknown`으로 남긴다.
- 실제 CSV로 다시 생성한 임시 카탈로그와 체크인 대상 정적 카탈로그의 SHA-256이 일치한다.
- 테스트 51/51, TypeScript, lint, Vite/AIT build를 통과했다. AIT DevTools 모의 환경에서 320×640 화면의 선택·결과 흐름도 확인했다.
- 기준 대비 AIT `.ait` 번들은 715,371 B에서 959,551 B로 증가했다(+34.1%). Vite JavaScript 청크는 gzip 636.50 kB이며, 실제 Toss 시작 속도는 측정하지 않았다.

## 추천 효과 해석

고정한 대표 10개 조합의 후보 없음 비율은 기존·통합 데이터 모두 30%였다. 재료 카테고리에서 균등 추출한 고정 seed 합성 표본 100개에서는 94%에서 89%로 감소했지만, 실제 사용자 선택 분포를 반영한 수치가 아니다. 따라서 데이터 규모는 늘었으나 일상 조합의 추천 공백이 해결됐다고 단정하지 않는다.

## 문서

- [`requirements.md`](./requirements.md): 범위와 완료 조건
- [`design.md`](./design.md): 수집·파싱·정규화 및 앱 연동 설계
- [`decisions.md`](./decisions.md): 구현 선택과 근거
- [`validation.md`](./validation.md): CSV·추천·빌드·모바일 검증 결과
- [`plan.md`](./plan.md): 진행 체크리스트
- [`HANDOFF.md`](./HANDOFF.md): Git 상태와 이어서 할 일

## 참고 자료

- [식품안전나라 조리식품의 레시피 DB](https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=COOKRCP01)
- [공공데이터포털: 식품의약품안전처 조리식품의 레시피 DB](https://www.data.go.kr/data/15060073/openapi.do)
- [공공데이터포털 이용정책](https://www.data.go.kr/ugs/selectPortalPolicyView.do)
- [식품의약품안전처 저작권정책](https://www.mfds.go.kr/wpge/m_34/de010803l001.do)
