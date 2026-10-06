# 냉털픽 (ait-fridgepick)

보유 재료를 선택해 공식 레시피 후보를 추천받는 Apps in Toss WebView 미니앱입니다.
React 18·TypeScript·Vite·Toss TDS를 사용합니다. 데이터는 정적 카탈로그이며 실행 중 외부 레시피 API를 호출하지 않습니다.

## 개발 환경

검증 기준 Node.js는 `.node-version`의 **24.19.0**입니다. 의존성이 요구하는 Node 범위는 `>=24.15.0 <25`입니다.
Node 16에서는 실행하지 마세요. `node --version`으로 버전을 확인하고 잠금 파일 그대로 설치합니다.
`.npmrc`는 호환되지 않는 Node의 설치를 차단합니다. Windows에서는 `node`와 `npm`이 같은 Node 설치를 가리키는지 확인하세요.

```bash
npm ci
npm run dev
```

검증 명령은 `npm test -- --maxWorkers=1`, `npm run test:scripts`, `npm run lint`, `npm run build`입니다.
`npm run preview`는 로컬 빌드 미리보기이며 토스 실기기 검증을 대신하지 않습니다.
`.github/workflows/ci.yml`은 push/PR에서 같은 Node 버전으로 설치·테스트·lint·기본 빌드와 테스트 광고 ID를 검사합니다.
검수 제출·출시는 CI에 포함하지 않습니다. 워크플로의 GitHub 실행 결과는 별도로 확인해야 합니다.

홈에서는 레시피 카탈로그를 불러오지 않습니다. 재료 선택 화면 진입 시 추천 모듈을 미리 준비하며,
로딩 중 추천 버튼을 누르면 준비 완료를 기다립니다. 로딩 실패는 재시도할 수 있으며 추천 후보가 없는 상태와 구분합니다.

## Apps in Toss

추천은 주재료 중심으로 계산합니다. 원문에 주재료 구분이 있으면 해당 식재료를,
구분이 없으면 양념을 제외한 필수 식재료를 기준으로 최소60% 이상인 후보를 뽑습니다.
미지원 주재료는 분모에 포함합니다. 부족한 양념·부재료는 계속 표시하므로
주재료 매칭률100%여도 원문 분량과 부족 재료를 확인해야 합니다.

```bash
npm run dev
npm run build
```

플랫폼 설정은 `apps-in-toss.config.ts`에서 관리해요.

## 레시피 데이터와 재생성

식약처888개와 EPIS471개, 총1359개를 중복 없이 제공합니다. 생성 원본은 저장소에 넣지 않습니다.
현재 선택 재료 매핑은 `src/data/recipes.ts`에서 추가 적용하므로 생성 시점 통계와 앱 후보 수는 다를 수 있습니다.

- 식약처: `scripts/generateRecipeCatalog.mjs` → `src/data/publicRecipes.ts`.
  2026-10-05 사용자 제공 `COOKRCP01.csv.gz`에서1156행을 확보했고 압축/CSV 해시를 기록했습니다.
  기존 생성 코드 `9d94ad8`로888개를 재현했으며 LF 줄바꿈으로 비교한 전체 생성 파일이 일치합니다.
  현재 매핑으로는894개가 생성되므로 제품 파일을 자동 덮어쓰지 않습니다. 기준일은 `unknown`입니다.
  원본 경로·해시·복구 절차·추가6개 검토 대상은 [원본 복구 근거](specs/26-10-04_feature_recipe_source_cleanup/source-recovery-review.md)를 참고하세요.
- EPIS: `scripts/generateEpisCatalog.mjs` → `src/data/episRecipes.ts`.
  기본CSV537개·재료JSON6104행·과정CSV3022행에서471개를 편입합니다.
  생성 요약에 원본 파일명·SHA256·확보일2026-10-05를 기록하며 데이터 기준일은 `unknown`입니다.

```bash
node scripts/generateRecipeCatalog.mjs "<식약처 CSV 경로>" "<임시 출력 경로>/publicRecipes.ts" "unknown" "YYYY-MM-DD"
node scripts/generateEpisCatalog.mjs "기본CSV경로" "재료JSON경로" "과정CSV경로" "src/data/episRecipes.ts" "YYYY-MM-DD"
```

`YYYY-MM-DD`는 실제 확보일로 바꿉니다. 식약처의 세 번째 인자는 자료에 명시된 기준일이며 없으면 `unknown`을 유지합니다.
페이지 수정일·파일명 날짜·다운로드일을 원본 기준일로 대신하지 않습니다.
원본 파일은 저장소 밖에 보관하고 재생성은 임시 출력으로 먼저 비교하세요. 생성 파일을 수기로 수정하지 않습니다.
확보 경로와 검증 상태는 [자료 확보 안내](specs/26-10-04_feature_recipe_source_cleanup/acquisition.md) 및
[검증 기록](specs/26-10-04_feature_recipe_source_cleanup/validation.md)을 참고합니다.

현재 식약처 원본 재확보 경로는 [식품안전나라 COOKRCP01 안내](https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=COOKRCP01)입니다.
개별 레시피의 원문 분량·출처 ID를 보존하며 원본 이미지는 배포하지 않습니다.

## 광고 ID 설정

`npm run build`는 항상 공식 테스트 배너 ID를 사용합니다. 실제 ID는 소스·테스트·Git에 작성하지 않습니다.

출시 설정의 기본 위치는 저장소 밖 `../local-config/ait-fridgepick/.env.release.local`입니다.
`config/release.env.example`을 이 위치로 복사하고 `FRIDGEPICK_BANNER_AD_GROUP_ID`에
콘솔에서 발급된 실제 그룹 ID를 입력한 뒤 `npm run build:release`를 실행합니다.
기존 설정 파일은 덮어쓰지 마세요. CI에서는
`FRIDGEPICK_BANNER_AD_GROUP_ID`를 보호된 환경변수로 제공할 수 있습니다.

출시 ID가 없거나 현재 지원하는 그룹 ID 형식과 다르면 출시 빌드를 중단합니다.
기본 빌드는 출시 설정을 읽지 않습니다. 이 분리는 Git 소스 노출을 줄이기 위한 것입니다.
광고 SDK가 사용하는 실제 ID는 출시 번들의 클라이언트 코드에 포함됩니다.
인증키나 비밀값을 이 설정으로 전달하지 마세요.
([Vite 환경변수·빌드 치환](https://vite.dev/guide/env-and-mode))

기존 원격 커밋에 남은 ID는 이 변경으로 제거되지 않습니다.
이력 정리·강제 푸시·광고 그룹 교체는 별도로 결정하고 진행합니다.
