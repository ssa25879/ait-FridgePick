# 설계

## 데이터 흐름과 책임 경계

- 원본: `COOKRCP01.csv`와 EPIS 자료를 `scripts/generateRecipeCatalog.mjs`·`generateEpisCatalog.mjs`가 변환한 `src/data/publicRecipes.ts`·`episRecipes.ts`. 생성 결과이므로 손으로 고치지 않는다.
- 이름 → 재료 ID 매핑: `src/data/recipeCatalog.ts`의 `mapRecipeIngredientName`(동의어 표)와 `src/data/ingredients.ts`의 선택 재료 목록. 이번 작업의 변경은 이 두 곳과 생성기의 매핑 입력에 집중한다.
- 합성: `src/data/recipes.ts`가 생성 결과와 `recipeStepIngredients.ts`·`recipeIngredientReviews.ts`를 합쳐 `RECIPES`를 만든다.
- 계산: `src/utils/recommendRecipe.ts`(후보·매칭률)와 `recipeReadiness.ts`(준비 완료). 규칙은 바꾸지 않는다.

## 실패 유형 구분

- 매핑 누락: 뜻이 같은 이름이 선택 재료에 연결되지 않음 → 동의어 추가로 해결.
- 카탈로그 부재: 자주 쓰이지만 선택 가능한 재료가 없음 → 새 선택 재료 추가(사용자 승인).
- 의미 모호: 육수·기름·호박처럼 하나로 단정할 수 없음 → 보존하고 "미지원 추가 준비"로 표시. 임의 통합은 금지.
- 원문 불일치: 이미 검토 안내가 있는 레시피 → 준비 완료에서 계속 제외.

## 선택지와 비용

- 동의어 표 확장은 가장 단순하고 위험이 낮다. 새 선택 재료 추가는 칩 수 증가로 화면이 길어지고 카테고리 균형이 달라지는 비용이 있다.
- 새 디자인 패턴이나 추상화 계층은 도입하지 않는다. 기존 매핑 표를 데이터로 확장하는 방식이 이번 변화(이름 추가)에 충분하다.
- 전후 비교용 기준선은 테스트 코드로 고정한다(상세는 plan.md). 측정 스크립트는 `node_modules/.cache/rgc/baseline.test.ts`에서 임시로 만든 것을 출발점으로 하되 저장소 테스트로 옮길 때 형식을 맞춘다.

## 제약

- 선택 재료가 늘면 `ingredients.test.ts`·화면 테스트의 개수 기대값이 바뀐다. 재료 총 개수(현재 95)는 문서·README 표기도 함께 점검한다.
- 320×640 화면에서 칩 스크롤·배너·CTA가 겹치지 않아야 한다.
