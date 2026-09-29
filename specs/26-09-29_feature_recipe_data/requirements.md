# 요구사항: 레시피 데이터

## 목적

선택한 재료와 메뉴 후보를 계산할 다음 기능이 사용할 수 있도록, 기존 재료 카탈로그 ID와 일치하는 로컬 레시피 데이터를 제공한다.

## 범위

### 포함

- `Recipe`와 `RecipeDifficulty` 타입을 정의한다.
- 로컬 TypeScript 데이터로 레시피 20~30개를 제공한다.
- 각 레시피에 고유 ID, 메뉴명, 필수 재료 3~6개, 조리 단계 3~5개, 난이도를 둔다.
- 선택 재료는 필요할 때만 `optionalIngredients`로 기록한다.
- 모든 재료 참조가 `src/data/ingredients.ts`의 ID인지 자동 검증한다.

### 제외

- 보유 재료와 레시피를 비교하는 후보·점수 계산
- 무작위 추천, 이전 추천 제외, 빈 결과 처리
- 레시피 선택·결과 화면 및 기존 화면 전환 변경
- 레시피 API, 서버, 영속 저장 또는 새 의존성
- 조리 시간, 분량, 영양 정보, 알레르기 필터

## 데이터 계약

```ts
export type RecipeDifficulty = "easy" | "normal";

export interface Recipe {
  id: string;
  name: string;
  requiredIngredients: string[];
  optionalIngredients?: string[];
  steps: string[];
  difficulty: RecipeDifficulty;
}
```

`requiredIngredients`와 `optionalIngredients`는 재료 ID를 참조한다. 화면 문구나 메뉴명을 ID로 쓰지 않으며, 같은 레시피 안에서 필수·선택 ID를 중복하지 않는다. 난이도는 현재 프로젝트 기획서의 `easy | normal` 범위를 따른다.

## 기능 요구사항

| ID | 요구사항 | 완료 조건 |
| --- | --- | --- |
| REC-01 | 레시피 데이터 계약을 정의한다. | 모든 항목이 ID, 이름, 필수 재료, 단계, 난이도 타입을 만족한다. |
| REC-02 | 초기 로컬 레시피를 제공한다. | `RECIPES`에 메뉴 20~30개가 있다. |
| REC-03 | 필수 재료 수를 제한한다. | 각 레시피가 3~6개의 고유한 필수 재료 ID를 가진다. |
| REC-04 | 간단 조리 단계를 제공한다. | 각 레시피가 읽을 수 있는 단계 3~5개를 가진다. |
| REC-05 | 재료 카탈로그와 참조를 일치시킨다. | 필수·선택 재료 ID가 모두 기존 카탈로그에 있고 서로 중복되지 않는다. |
| REC-06 | 데이터 무결성을 자동 확인한다. | Vitest 검증이 레시피 수, 고유 ID, 필수 필드와 참조 유효성을 검사한다. |

## 완료 조건

- 레시피 20~30개를 로컬 TypeScript 배열로 불러올 수 있다.
- 각 레시피에 필수 재료 3~6개, 조리 단계 3~5개, 유효 난이도가 있다.
- 모든 레시피와 재료 ID가 중복 규칙 및 카탈로그 참조 검증을 통과한다.
- `npm test`, `npm run lint`, `npm run build`가 오류 없이 끝난다.
- 후보 계산이나 화면 변경 없이 다음 로드맵 단계가 사용할 데이터만 제공한다.
