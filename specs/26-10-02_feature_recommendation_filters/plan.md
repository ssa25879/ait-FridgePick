# 구현 계획: 추천 필터와 레시피 출처 각주

작업 브랜치: `feature/recommendation-filters`

상태: 구현·검증 완료, 커밋 전

## 변경 파일 후보

- `src/types/recipe.ts`: `hard`를 포함한 난이도 계약
- `src/utils/recipeDifficulty.ts`, `src/utils/recipeDifficulty.test.ts`: 난이도 판정과 경계 테스트
- `src/utils/recommendRecipe.ts`, `src/utils/recommendRecipe.test.ts`: 사용자 매칭률·난이도 기반 후보 필터
- `src/data/recipeCatalog.ts`, `src/data/recipes.ts`, `src/data/publicRecipes.ts`: 모든 레시피 난이도를 같은 규칙으로 생성·정합
- `src/App.tsx`, `src/App.test.tsx`: 필터 상태와 추천 호출, 설정 보존·초기화
- `src/pages/IngredientPage.tsx`, `src/App.css`: 접근 가능한 매칭률·난이도 컨트롤과 모바일 레이아웃
- `src/pages/ResultPage.tsx`, `src/pages/ResultPage.test.tsx`, `src/App.css`: 출처 각주 이동과 크기
- `specs/roadmap.md`, `specs/26-10-02_feature_recommendation_filters/*`: 범위·결정·검증 기록

## 작업 순서

1. [x] 코드·CSV·로드맵 확인 및 9단계 요구사항 설계
2. [x] 기능 브랜치 생성과 요구사항·설계·결정·계획·검증 문서 작성
3. [x] 난이도 계산 단위 테스트를 먼저 작성해 경계값 실패를 확인한다.
4. [x] 공용 난이도 판정 함수를 구현하고 카탈로그 생성·수기 카탈로그에 적용한다.
5. [x] 추천 후보 계산의 매칭률·난이도 필터 테스트를 작성해 실패를 확인한 뒤 구현한다.
6. [x] 재료 화면 필터를 연결하고 App 상호작용·설정 유지 테스트를 추가한다.
7. [x] 결과의 데이터 출처를 작은 하단 각주로 이동하고 테스트를 갱신한다.
8. [x] 실제 CSV로 공개 카탈로그를 다시 생성하고 전체 난이도 일관성을 확인한다.
9. [x] 자동 검증, lint, TypeScript/Vite/AIT 빌드, 320×640 화면 확인을 수행하고 결과를 기록한다.
10. [x] 변경 요약을 `D:\Codex\Log\20261002_FridgePick_RecommendationFilters_Log.md`에 기록한다.

## 완료 조건

- 기능 요구사항 RF-01~RF-07이 모두 구현·검증된다.
- 기존 60% 기본 동작은 유지되고 사용자가 설정한 임계값과 난이도가 추천 결과에 실제 적용된다.
- 테스트와 빌드 결과가 `validation.md`에 실제 출력 기준으로 기록된다.
- 본 작업 파일만 나중에 스테이징할 수 있도록 기존 미추적 `Review.md`, 아이콘은 그대로 둔다.
