# 개발 계획: 홈 진입 화면

## 목표

현재 샘플 화면을 TDS Mobile 기반 냉털픽 홈으로 바꾸고, 재료 선택 안내 화면까지 이동하는 작은 앱 흐름을 만든다. 실제 재료 선택·추천 기능은 다음 로드맵 작업이다.

## 변경 파일 후보

- `package.json`, `package-lock.json`: TDS 의존성 및 React 버전 조정이 승인된 경우에만 수정
- `src/main.tsx`: TDS 문서가 요구하는 Provider 연결
- `src/App.tsx`: 샘플 홈을 제거하고 홈/재료 선택 안내 상태를 연결
- `src/pages/HomePage.tsx`: 냉털픽 제목, 설명, 주요 버튼
- `src/pages/IngredientSelectPlaceholder.tsx`: 후속 기능을 예고하고 홈으로 돌아가는 안내 화면
- `src/index.css`, `src/create-ait-app.css`: TDS 레이아웃을 방해하는 템플릿 전역 스타일만 필요한 범위에서 정리

## 선행 조건

로드맵 0단계의 현재 화면 확인, `npm run lint`, `npm run build` 결과를 기록한다. 현재 선언된 React는 `^19.2.8`이고 공식 TDS 앱 생성 안내는 React 18을 요구한다. 따라서 아래 순서대로 검토한다.

1. TDS Mobile의 현재 설치 가이드와 패키지 peer dependency를 확인한다.
2. `@apps-in-toss/web-framework@3.2.0` 및 현재 Vite 구성과 React 18 조합을 확인한다.
3. 호환성이 확인되면 React·React DOM·타입 패키지를 TDS가 지원하는 범위로 맞추고 TDS 패키지를 연결한다.
4. 버전 변경이 적절하지 않거나 AIT 빌드와 충돌하면 의존성을 수정하기 전에 대안을 사용자와 결정한다.

이 문서는 의존성 변경을 승인하거나 적용하지 않는다. 호환성 결과와 버전 변경 범위를 구현 전에 검토한다.

## 작은 작업 순서

### 1. 기준 상태 확인

- [ ] `npm run dev`로 현재 샘플 화면이 뜨는지 확인한다.
- [ ] `npm run lint` 결과를 기록한다.
- [ ] `npm run build` 결과를 기록한다.

### 2. TDS 연결 방식 확정

- [ ] 공식 TDS Mobile 설치·Provider 안내와 현재 package peer dependency를 확인한다.
- [ ] 앱인토스 웹 프레임워크 빌드와 호환되는 React 버전을 확인한다.
- [ ] TDS 패키지 도입과 React 버전 조정 범위를 정한다.
- [ ] TDS 의존성을 설치하고 잠금 파일을 갱신한다.
- [ ] `src/main.tsx`의 앱 최상단에 TDS Provider를 연결한다.

### 3. 홈 및 진입 안내 구현

- [ ] `HomePage`에 TDS 제목·본문·주요 버튼을 배치한다.
- [ ] `IngredientSelectPlaceholder`에 준비 중 안내와 홈 복귀 동작을 배치한다.
- [ ] `App.tsx`의 화면 상태를 `home`과 `ingredients`로 제한된 유니온 타입으로 관리한다.
- [ ] 홈 버튼을 누르면 안내 화면이 표시되게 연결한다.
- [ ] 안내 화면의 홈 버튼이 초기 홈 화면을 표시하게 연결한다.
- [ ] 샘플 광고 테스트 버튼과 해당 샘플 라우트를 홈 사용자 흐름에서 제거한다.
- [ ] 전역 템플릿 스타일이 TDS 기본 레이아웃과 충돌하는 부분만 제거한다.

### 4. 검증

- [ ] 요구사항 ID별 수동 검증을 `validation.md`대로 수행한다.
- [ ] `npm run lint`를 실행한다.
- [ ] `npm run build`를 실행한다.
- [ ] 모바일 폭에서 버튼·문구와 안전 여백을 확인한다.
- [ ] 가능한 경우 앱인토스 테스트 환경에서 같은 진입 흐름을 확인한다.

## 완료 정의

- TDS 공식 컴포넌트와 Provider가 호환되는 버전으로 동작한다.
- 냉털픽 홈이 초기 화면이고 `재료 고르기`로 안내 화면에 진입할 수 있다.
- 안내 화면에서 홈으로 돌아올 수 있다.
- 홈에서 광고 샘플이 노출되지 않는다.
- 린트와 빌드가 통과하고 검증 문서의 필수 시나리오가 완료된다.
