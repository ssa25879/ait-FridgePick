# 개발 계획: 홈 진입 화면

## 목표

현재 샘플 화면을 TDS Mobile 기반 냉털픽 홈으로 바꾸고, 재료 선택 안내 화면까지 이동하는 작은 앱 흐름을 만든다. 실제 재료 선택·추천 기능은 다음 로드맵 작업이다.

## 변경 파일 후보

- `package.json`, `package-lock.json`: TDS 호환성 확인 후 React 18 및 TDS 의존성 적용
- `src/main.tsx`: TDS 문서가 요구하는 Provider 연결
- `src/App.tsx`: 샘플 홈을 제거하고 홈/재료 선택 안내 상태를 연결
- `src/pages/HomePage.tsx`: 냉털픽 제목, 설명, 주요 버튼
- `src/pages/IngredientSelectPlaceholder.tsx`: 후속 기능을 예고하고 홈으로 돌아가는 안내 화면
- `src/index.css`, `src/create-ait-app.css`: TDS 레이아웃을 방해하는 템플릿 전역 스타일만 필요한 범위에서 정리

## 선행 조건

로드맵 0단계의 기준 화면과 `npm run lint`, `npm run build` 결과를 기록했다. 공식 TDS 패키지는 React 18까지만 지원해 프로젝트를 React 18로 맞췄으며 AIT 빌드로 호환성을 확인했다.

1. TDS Mobile의 설치 가이드와 peer dependency를 확인했다.
2. `@apps-in-toss/web-framework@3.2.0`은 React peer dependency를 제한하지 않음을 확인했다.
3. React·React DOM·타입 패키지를 React 18로 맞추고 TDS 패키지를 설치했다.
4. 결정 근거는 [`decisions.md`](./decisions.md)에 기록했다.

## 작은 작업 순서

### 1. 기준 상태 확인

- [x] `npm run dev`로 현재 샘플 화면이 뜨는지 확인한다.
- [x] `npm run lint` 결과를 기록한다.
- [x] `npm run build` 결과를 기록한다.

### 2. TDS 연결 방식 확정

- [x] 공식 TDS Mobile 설치·Provider 안내와 현재 package peer dependency를 확인한다.
- [x] 앱인토스 웹 프레임워크 빌드와 호환되는 React 버전을 확인한다.
- [x] TDS 패키지 도입과 React 버전 조정 범위를 정한다.
- [x] TDS 의존성을 설치하고 잠금 파일을 갱신한다.
- [x] `src/main.tsx`의 앱 최상단에 TDS Provider를 연결한다.

### 3. 홈 및 진입 안내 구현

- [x] `HomePage`에 TDS 제목·본문·주요 버튼을 배치한다.
- [x] `IngredientSelectPlaceholder`에 준비 중 안내와 홈 복귀 동작을 배치한다.
- [x] `App.tsx`의 화면 상태를 `home`과 `ingredients`로 제한된 유니온 타입으로 관리한다.
- [x] 홈 버튼을 누르면 안내 화면이 표시되게 연결한다.
- [x] 안내 화면의 홈 버튼이 초기 홈 화면을 표시하게 연결한다.
- [x] 샘플 광고 테스트 버튼과 해당 샘플 라우트를 홈 사용자 흐름에서 제거한다.
- [x] 전역 템플릿 스타일이 TDS 기본 레이아웃과 충돌하는 부분만 제거한다.

### 4. 검증

- [x] 요구사항 ID별 수동 검증을 `validation.md`대로 수행한다.
- [x] `npm run lint`를 실행한다.
- [x] `npm run build`를 실행한다.
- [x] 모바일 폭에서 버튼·문구와 안전 여백을 확인한다.
- [ ] 실제 Toss 앱인토스 환경에서 같은 진입 흐름을 확인한다. (이번 작업에서는 미수행)

## 완료 정의

- TDS 공식 컴포넌트와 Provider가 호환되는 버전으로 동작한다.
- 냉털픽 홈이 초기 화면이고 `재료 고르기`로 안내 화면에 진입할 수 있다.
- 안내 화면에서 홈으로 돌아올 수 있다.
- 홈에서 광고 샘플이 노출되지 않는다.
- 린트와 빌드가 통과하고 검증 문서의 필수 시나리오가 완료된다.

실제 Toss 앱에서의 기기 검증은 이번 범위에서 수행하지 않았으며, 브라우저 Apps in Toss Devtools 확인으로 대체했다.
