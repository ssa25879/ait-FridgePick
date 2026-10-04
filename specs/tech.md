# 기술 스택

현재 의존성과 실행 명령은 [`package.json`](../package.json), 앱인토스 설정은 [`apps-in-toss.config.ts`](../apps-in-toss.config.ts)가 기준이다. 루트 README는 Vite 템플릿 설명을 포함하므로 실제 버전과 명령은 프로젝트 설정 파일을 우선한다.

## 현재 스택

| 영역 | 기술 | 프로젝트 설정 |
| --- | --- | --- |
| 언어 | TypeScript | `~6.0.2` |
| UI | React / React DOM | `^18.3.1` |
| 개발·번들러 | Vite | `^8.2.2` |
| React 플러그인 | `@vitejs/plugin-react` | `^6.1.0` |
| 앱 플랫폼 | Apps in Toss WebView 미니앱 | `@apps-in-toss/web-framework` `3.2.0` |
| 로컬 개발 도구 | Apps in Toss Devtools | `@apps-in-toss/devtools` `^3.2.0` |
| 린터 | Oxlint | `^1.79.0` |
| UI 컴포넌트 | Toss TDS | `@toss/tds-mobile`, `@toss/tds-mobile-ait` `^2.5.1` |
| 스타일 | TDS + 일반 CSS | 컴포넌트와 `src` CSS를 함께 사용한다. |

버전은 `package.json`에 선언된 범위다. 잠금된 설치 결과는 `package-lock.json`에서 확인한다.

## 실행 환경

Node.js 24.15.0 이상(24 계열)을 기준으로 한다. 잠금된 devtools는 Node 24 이상, jsdom은 24.15.0 이상을 요구한다. 2026-10-04에는 Node 24.19.0에서 설치·테스트·빌드를 확인했다. 현재 PC 기본 Node 16은 이 프로젝트와 호환되지 않는다. `node --version` 확인 후 잠금 파일 기준 `npm ci`를 사용한다.

## 실행 명령

| 명령 | 동작 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 실행 |
| `npm test` | Vitest 전체 테스트 |
| `npm run lint` | Oxlint 실행 |
| `npm run build` | TypeScript 프로젝트 검사 → Vite 빌드 → 앱인토스 빌드 |
| `npm run build:release` | TypeScript → release 모드 Vite → AIT 빌드 (현재 실제 광고 ID 포함) |
| `npm run preview` | Vite 빌드 결과 미리보기 |
| `npm run deploy` | 앱인토스 배포 명령 실행 |

## 앱인토스 설정

- 앱 이름은 `ait-fridgepick`이다.
- 웹 번들 출력 폴더는 `dist`다.
- 현재 권한 목록은 비어 있다. 기능이 권한을 요구하게 되면 공식 가이드에서 필요한 권한을 확인하고 설정한다.
- Vite에는 React 플러그인과 Apps in Toss Devtools 플러그인이 등록되어 있다.

## 냉털픽 MVP 구현 방향

- **렌더링 구조:** 작은 화면 흐름을 React 페이지·컴포넌트로 나눈다. `App.tsx`에서 홈·재료 선택·결과 흐름을 전환한다.
- **상태:** 선택 재료와 현재 추천을 React 기본 상태로 관리한다. 기획서 기준으로 `useState`와 props 또는 작은 Context면 충분하며 Redux/Zustand는 도입하지 않는다.
- **재료·레시피 데이터:** 서버 없이 로컬 TypeScript 또는 JSON으로 제공한다. 별도 백엔드, 데이터베이스, 외부 레시피 API는 MVP 범위에서 제외한다.
- **추천 계산:** 선택 재료와 레시피의 필수 재료를 비교하는 로컬 함수와 매칭률·난이도 필터를 사용한다. 기본 매칭 기준은 60%이며 60~100%를 5% 단위로 조절할 수 있다. 상세 기준은 [로드맵 9단계](./roadmap.md)를 따른다.
- **스타일:** 기존 일반 CSS 구성을 우선 활용한다. CSS Modules로 바꿔야 할 요구사항은 현재 없다.
- **화면 흐름:** 홈 → 재료 선택 → 결과 또는 빈 결과. 현재 패키지에는 별도 라우터가 선언되어 있지 않다.

## 개발 상태 메모

현재 앱은 재료 카탈로그, 레시피 데이터, 추천 로직과 홈·재료 선택·결과 화면을 제공한다. `src/hooks/useInAppAds.tsx`와 `src/pages/InAppAdsPage.tsx`에는 전면형·보상형 광고 샘플이 있으나 제품 화면 흐름에 연결되어 있지 않다. 재료 선택 화면의 스크롤 조건부 배너는 기본 개발·테스트 모드에서 공식 테스트 ID를 쓰고 `build:release`에서만 활성 발급 groupId를 선택한다. 토스 앱의 콘솔 QR 광고 검증은 아직 대기 중이다. 자세한 범위는 [홈 하단 배너 광고 문서](./26-10-02_feature_home_banner_ad/README.md)에 기록한다.

## 사용자 상태·플랫폼 이벤트 보완

[2026-10-04 명세](./26-10-04_feature_user_state_persistence/README.md)에 따라 SDK `User.getAnonymousKey`와 비동기 `Storage`로 재료·필터를 저장한다. 기존 동기 localStorage 제안은 이 명세로 대체한다. 화면/추천 결과는 메모리에만 유지하며 기기 검증 완료 여부는 해당 validation 문서를 따른다.

## 현재 배너 배치 (2026-10-04)

홈 전용 배치는 사용자 결정으로 재료 화면 하단 배치로 대체했다. 광고 자체를 제외한 콘텐츠가 viewport를 넘는 경우에만 노출한다. [배치 계약과 검증](./26-10-04_feature_ingredient_banner/README.md)을 따른다.
