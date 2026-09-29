# 인수인계: 식품안전나라 CSV 레시피 카탈로그

- 기준일: 2026-09-29
- 저장소: `D:\work\ait-FridgePick`
- 브랜치: `feature/public-recipe-catalog`
- 다음 작업: CSV 데이터 이용 조건을 확인하고, 허용 범위 안에서 파서·재료 매핑·추천 카탈로그를 구현한다.
- 진행 문서: [`plan.md`](./plan.md)

## 현재까지 완료

- 로드맵 8단계(식품안전나라 레시피 CSV 카탈로그 확장)를 추가했다. 7단계 앱인토스 실기기 사이클 완료는 사용자의 확인을 근거로 표시했다.
- 기능 명세 디렉터리의 README, 요구사항, 설계, 결정, 검증 문서 초안을 작성했다.
- 앱이 `ait-fridgepick` 앱인토스 WebView 미니앱이며 정적 Vite/AIT 번들로 배포된다는 점을 설계에 반영했다. 런타임 외부 API 호출은 계획하지 않는다.
- 식품안전나라 COOKRCP01 CSV 상세 페이지의 다운로드 방식과 인증키 포함 URL 형식, 공식 앱인토스 자료를 확인했다. API 상세 페이지만으로 앱 번들 내 재배포 권리는 확인되지 않았다.
- 루트의 사용자 제공 CSV를 실제로 조사했다.
  - 파일: `COOKRCP01.csv` (UTF-8 BOM)
  - 열: 55개. `RCP_SEQ`, `RCP_NM`, 재료 설명, 최대 20개 조리 단계·이미지 필드 등을 포함한다.
  - 데이터: 1,164행, 비어 있지 않은 `RCP_SEQ` 1,164개 모두 고유, 이름 누락 0개, 조리 단계가 없는 레코드 1개.
  - 현재 재료 28개만 대상으로 한 초기 토큰 매핑은 낮은 적합도를 보였다. 당시 규칙은 탐색용 근사치이며 최종 제외·포함 통계가 아니다. 재료 별칭·괄호·수량·묶음 제목을 처리하는 파서와 매핑 분석이 필요하다.

## 아직 하지 않은 작업

- 앱 내 정적 재배포와 가공을 허용하는 공식 이용 조건·라이선스를 확인하지 않았다. 앱용 파생 레시피 데이터 생성 및 커밋은 이 확인 전 보류한다.
- CSV 파서, 단위 테스트, 레시피 카탈로그, 재료 카탈로그 변경, 추천 계산 변경, 결과 화면 출처 표시는 구현되지 않았다.
- 테스트, lint, Vite/AIT 빌드, 번들 크기 비교, CSV 반영 후 320×640 모바일 화면 또는 Toss 테스트 환경 검증은 실행하지 않았다.
- CSV가 `.gitignore`에 아직 추가되지 않았다. 원본 파일은 커밋 금지이며 다음 작업에서 제외 규칙을 추가한다.

## 구현 시 중요한 코드 위치

- `src/data/ingredients.ts`: 현재 재료 28개와 카테고리
- `src/types/ingredient.ts`: 재료 카테고리 타입
- `src/data/recipes.ts`: 기존 20개 레시피
- `src/types/recipe.ts`: `Recipe` 모델. 현재 출처·미지원 재료 메타데이터 없음
- `src/utils/recommendRecipe.ts`: 필수 재료 기준 60% 매칭 계산
- `src/pages/ResultPage.tsx`: 보유·부족 재료 표시. 현재 카탈로그에 없는 재료 ID는 이름 조회가 불가능함
- `src/data/recipes.test.ts`, `src/data/ingredients.test.ts`, `src/pages/ResultPage.test.tsx`, `src/App.test.tsx`: 데이터·화면·흐름 테스트. 현재 일부 테스트가 20개 레시피/28개 재료에 고정된 기대값을 가짐
- `package.json`, `vite.config.ts`: Vitest와 AIT 빌드 명령 설정

## 진행 순서와 제약

1. 공식 이용 조건에서 상업 앱 번들 내 정적 제공, 변형·요약, 출처 표기 방법을 확인한다. 불명확하면 식품안전나라에 문의하고 답변 근거를 남긴다. 확인 전 파생 레시피를 앱에 배포하지 않는다.
2. `/COOKRCP01.csv`를 `.gitignore`에 추가한다. 기존에 있던 `Review.md`, `public/fridgepick-app-icon.png`는 별도 미관련 파일이므로 수정하거나 커밋하지 않는다.
3. 테스트 우선으로 CSV 파서를 만든다. BOM, CSV 인용 쉼표·줄바꿈·큰따옴표, 빈 필드와 중복 ID를 검증한다. 재료명 파싱은 괄호 안 쉼표를 보존하고 수량·묶음 제목 처리를 테스트한다.
4. 기존 카탈로그의 근사 매핑 결과가 낮으므로, 자주 등장하는 재료를 근거로 선택 카탈로그 확장안을 만든다. 근거가 모호한 재료는 기존 ID로 억지 매핑하지 않는다. 누락 재료명은 결과에서 숨기지 않거나 해당 레시피를 명시적으로 제외한다.
5. 권리 확인을 통과한 데이터만 기존 20개 레시피와 결합한다. 원본 `RCP_SEQ`, 출처, 필요한 attribution을 파생 데이터에 보존한다.
6. 동일한 대표 재료 선택 묶음에서 기존/확장 후보 수와 후보 없음 비율을 비교한다. 레시피 개수 증가만으로 추천 개선을 단정하지 않는다.
7. 테스트, lint, `npm run build`(TypeScript, Vite, `ait build`), 번들 크기, AIT DevTools 320×640 CSS px 모바일 흐름을 검증하고 실제 수행 결과만 기록한다.

## Git 작업 상태

마지막 확인 시점의 상태:

```text
## feature/public-recipe-catalog
 M specs/roadmap.md
?? COOKRCP01.csv
?? Review.md
?? public/fridgepick-app-icon.png
?? specs/26-09-29_feature_public_recipe_catalog/
```

- `specs/roadmap.md`와 기능 명세 디렉터리는 이번 기능 작업이다.
- `COOKRCP01.csv`는 로컬 입력으로만 사용하며 절대 stage/commit하지 않는다. `.gitignore` 규칙을 추가한다.
- `Review.md`, `public/fridgepick-app-icon.png`는 현재 상태에서 기존 미관련 untracked 파일이다. 변경하거나 stage하지 않는다.
- 아직 기능 구현 커밋은 없다. 사용자는 앞서 현재 작업 완료 후 커밋을 지시했다. 구현과 검증을 마치면 기능 관련 파일만 명시적으로 stage해 저장소 커밋 관례를 따른다. master 병합은 이번 요청 범위가 아니다.

## 작업 로그

Codex 외부 로그는 `D:\Codex\Log\20260929_FridgePick_PublicRecipeApi_Log.md`에 이어 쓴다. 저장소 루트의 `Log.md`와 위 미관련 파일은 건드리지 않는다.
