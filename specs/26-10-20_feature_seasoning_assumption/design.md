# 설계

## 현재 동작 (코드 기준)

- `getRecipeCandidates`(`src/utils/recommendRecipe.ts`)는 레시피마다 `missingRequiredIngredientIds`에 **양념을 포함한** 모든 미선택 필수 재료를 담는다. 후보 여부는 주재료 매칭률(60% 기본)로 정해지며, 원문이 있는 레시피는 양념을 매칭률 계산에서 이미 제외한다.
- `isRecipeReady`(`src/utils/recipeReadiness.ts`)는 `missingRequiredIngredientIds`가 비어 있고, 미지원 필수 재료가 없고, 원문 확인 안내가 없을 때만 참이다. 그래서 양념까지 골라야 준비 완료가 된다.
- `getMissingIngredientCount`는 추천 풀 정렬에 쓰이며 양념도 센다.
- 결과 화면(`ResultPage`)의 "더 준비할 재료"는 `missingRequiredIngredientIds`(양념 포함)와 미지원 재료를 보여준다.

## 변경 설계

### 1. 가정 대상 정의 (SAS-08)

`src/utils/assumedSeasonings.ts`(신규)에 한 곳으로 모은다.

- `isAssumedSeasoning(id)`: `INGREDIENTS`에서 `category === "seasoning"`인 ID 집합 조회. 현재 33개(간장, 고추장, 된장, 참기름, 식용유, 소금, 설탕, 후추 … 토마토소스).
- 범위를 바꾸려면(예: 기본 11개만) 이 함수 하나만 고친다. 판정·정렬·표시는 모두 이 함수를 쓴다.

### 2. 데이터 모델

`RecipeMatch`에서 부족 재료를 둘로 나눈다. 계산은 `getRecipeCandidates` 한 곳에서만 한다.

| 필드 | 변경 전 | 변경 후 |
| --- | --- | --- |
| `missingRequiredIngredientIds` | 선택하지 않은 필수 재료 전부 | **양념을 제외한** 선택하지 않은 필수 재료 |
| `assumedSeasoningIds` (신규) | 없음 | 선택하지 않은 필수 재료 중 가정 대상 양념 |
| `matchedRequiredIngredientIds` | 선택한 필수 재료 | 변경 없음 |
| `matchRate`, `matchBasis`, 후보 집합 | — | **변경 없음** (SAS-02) |

이렇게 나누는 이유: 판정·정렬·표시가 같은 필드를 읽으므로 한 곳에서 나누면 세 곳이 어긋날 수 없다. 대안은 필드를 그대로 두고 소비처마다 필터링하는 것인데, 소비처가 3곳(`isRecipeReady`, `getMissingIngredientCount`, `ResultPage`)이라 누락 위험이 크다. 단점은 `missingRequiredIngredientIds`의 의미가 바뀌어 기존 테스트 기대값을 갱신해야 한다는 것이다.

### 3. 판정과 정렬

- `isRecipeReady`: `missingRequiredIngredientIds`(이제 양념 제외)가 비고, 미지원 재료가 없고, 원문 확인 안내가 없으면 참. 코드는 그대로이고 입력 의미만 바뀐다 (SAS-01, SAS-06).
- `getMissingIngredientCount`: 변경 없이 양념 제외 값이 된다 (SAS-03). 추천 풀 정렬이 "양념 외 재료가 더 갖춰진 메뉴"를 우선하게 된다.

### 4. 결과 화면 (SAS-04, SAS-05)

- 새 구역 **"양념 확인"** (제목 `h3`, 기존 "보유 재료"·"더 준비할 재료"와 같은 `result-detail` 스타일).
  - `assumedSeasoningIds`가 비어 있지 않을 때만 표시. 문구 초안: "아래 양념은 집에 있다고 가정했어요. 없다면 준비해 주세요." + 이름 목록(가나다 순).
- 상단 상태 문구: 준비 완료이고 양념 안내가 있으면 "양념을 빼고 필요한 재료를 모두 선택했어요". 양념 안내가 없으면 기존 문구 유지. 준비 미완료·원문 확인 문구는 변경 없음.
- "더 준비할 재료"는 `missingRequiredIngredientIds`(양념 제외)와 미지원 재료만 표시한다. 양념이 중복되어 나오지 않는다.
- 배치 순서: 보유 재료 → 더 준비할 재료 → 양념 확인 → 원문 재료 확인 → 재료와 분량 → 조리 순서.

### 5. 재료 선택 화면 (SAS-07)

양념 카테고리가 선택된 동안 카테고리 설명 줄에 "선택하지 않아도 집에 있다고 가정해요" 안내를 보인다. 구체 위치·스타일은 `IngredientPage`의 기존 카테고리 영역 구현을 확인해 정한다(구현 시 확정). 양념을 선택하는 동작은 그대로 둔다. 선택한 양념은 보유로 계산되어 "양념 확인" 목록에서 빠진다.

### 6. 실패 유형

순수 함수 변경이라 데이터 접근 실패는 없다. 도메인 규칙에 따른 "준비 미완료"(양념 외 재료 부족, 미지원 재료, 원문 확인 안내)와 "양념 안내만 있음"을 구분한다. 후자는 준비 완료다.

## 테스트 영향

- `recommendRecipe` 단위 테스트: `missingRequiredIngredientIds`에서 양념이 빠지고 `assumedSeasoningIds`에 들어가는지, 후보 ID 집합·`matchRate`가 변경 전과 같은지.
- `recipeReadiness`: 양념만 부족하면 준비 완료, 양념 외 재료나 미지원 재료가 부족하면 미완료.
- 기존 테스트 갱신 대상 후보: `recommendationAccuracy.test.ts`, `recommendationGap.test.ts`, `recipes.test.ts`, `ResultPage.*.test.tsx`, `App.test.tsx`(양념을 골라 준비 완료를 만드는 시나리오). 갱신은 "의미가 바뀐 기대값만" 하고 이유를 커밋에 적는다.
- `ResultPage`: "양념 확인" 표시·미표시, 가나다 순, 중복 없음.

## 디자인 패턴

필요하지 않다. 규칙은 한 함수와 한 필드 분리로 충분하다.
