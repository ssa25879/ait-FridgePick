# 인수인계: 식품안전나라 레시피 CSV 카탈로그

- 기준일: 2026-10-01
- 저장소: `D:\work\ait-FridgePick`
- 작업 브랜치: `feature/public-recipe-catalog`
- 작업 체크아웃: `C:\Users\USER\.codex\worktrees\public-recipe-catalog\ait-FridgePick`
- 입력 CSV: 기본 작업 폴더의 `COOKRCP01.csv` (로컬 입력, Git에 넣지 않음)
- 구현 상태: 데이터 정규화·통합·화면·테스트·빌드 검증과 기능 브랜치 커밋 완료. 기본 체크아웃 병합과 Toss 테스트 업로드는 별도 상태다.
- 상세 문서: [`plan.md`](./plan.md), [`validation.md`](./validation.md)

## 완료된 내용

- `src/data/recipeCsv.ts`, `src/data/recipeCsv.test.ts`: BOM 및 인용 필드 안 쉼표·개행을 지원하고 필수 열·행 폭·중복 ID를 검사하는 CSV 파서.
- `src/data/recipeCatalog.ts`, `src/data/recipeCatalog.test.ts`: 재료 표현과 선택 섹션 파싱, 명시적 별칭 매핑, 물 제외, 60% 미만 매핑 레시피 제외와 미지원 필수 재료 보존.
- `scripts/generateRecipeCatalog.mjs`, `src/data/publicRecipes.ts`: CSV를 재현 가능한 정적 TypeScript 레시피 배열로 생성. 실제 입력 1,156행 중 881개 포함, 275개 제외.
- `src/data/ingredients.ts`: 28개에서 100개로 재료를 확장하고 기존 카테고리 안에 배치.
- `src/data/recipes.ts`: 기존 수기 20개를 보존하고 공개 881개를 합쳐 총 901개 제공.
- `src/utils/recommendRecipe.ts`, `src/pages/ResultPage.tsx`: 미지원 필수 재료도 매칭률 분모·부족 재료 표시에 포함하고 원문 재료·분량 및 데이터 출처·ID를 표시.
- `src/App.css` 및 테스트: 긴 재료 설명 줄바꿈과 카탈로그/추천/결과 화면을 검증.
- 공공데이터포털 개별 레시피 DB 이용허락범위 “제한 없음” 표기 확인. 출처와 원본 ID를 남기며 원본 이미지 자산은 배포하지 않음.

## 확인 결과

- 테스트 46/46 통과, TypeScript 통과, oxlint 종료 코드 0(기존 경고 1건).
- Vite/AIT 빌드 통과. 기준 대비 `.ait`가 715,371 B에서 958,299 B로 증가.
- CSV 조리 단계 6,717개 중 원문에서 문장부호 뒤 표시용 알파벳 접미가 확인된 17건을 정규화 시 제거하고 회귀 테스트를 추가했다.
- AIT DevTools 모의 환경 320×640에서 선택 화면, 공개 레시피 결과, 세로 스크롤과 CTA를 확인. 실제 Toss 테스트 업로드는 아직 하지 않음.
- 대표 10개 선택 조합의 후보 없음 비율은 50%로 같았고, 카테고리 균등 합성표본 100개에서는 94%에서 83%로 내려감. 실제 사용자 분포를 나타내지는 않아 무결과 문제가 해결됐다고 단정하지 않음.
- 일반 브라우저에서는 Toss safe-area 브리지 부재 오류가 기록됐지만 로컬 DevTools 화면에서 주요 UI 흐름은 동작했다. 로컬 결과를 실제 Toss WebView와 동일한 검증으로 간주하지 않음.
- 근거·통계·검증 한계는 [`validation.md`](./validation.md)에 정리함.

## Git 및 로컬 상태

- 이 작업은 관리형 feature worktree에서만 진행했고 기본 `D:\work\ait-FridgePick` 체크아웃은 `master`로 유지한다.
- 기능 관련 파일만 feature 브랜치에 커밋했다. 기본 폴더의 기존 `COOKRCP01.csv`, `Review.md`, `public/fridgepick-app-icon.png`는 이번 변경과 무관하므로 수정·stage하지 않았다.
- `.gitignore`의 `/COOKRCP01.csv` 규칙과 실제 ignore 적용을 확인했다.
- `node_modules` Junction은 검증을 위해 기본 폴더의 설치를 가리킨다. 제거할 때는 링크 대상이 기본 폴더인지 확인하고 Junction만 제거한다.
- 임시 Vite/AIT 비교 산출물은 Codex 시각화 임시 폴더에 두었고 저장소에는 추가하지 않았다.
- Codex 작업 로그는 `D:\Codex\Log\20261001_FridgePick_PublicRecipeCatalog_Log.md`에 기록한다. 저장소 루트 `Log.md`는 수정하지 않는다.

## 이어서 할 일

1. 이 기능 브랜치는 `feature/public-recipe-catalog`이며 기본 `master` 체크아웃에 병합하지 않았다.
2. 실제 사용자 선택 분포가 생기면 추천 후보 없음 비율과 60% 임계값·원문 재료 해석을 다시 평가한다.
3. 실제 Toss 테스트 업로드와 검수 제출은 아직 하지 않았다.
