# 사용자 상태 저장·복원 Implementation Plan

**Goal:** 필요한 선택 상태를 사용자별로 복원하고 현재 화면에 맞는 플랫폼 뒤로가기를 연결한다.
**Architecture:** SDK 경계의 사용자키/저장 서비스, React 영속 상태 훅, App 이벤트 연결.
**Tech Stack:** React 18, TypeScript, WebView SDK 3.2.0, Vitest. 새 의존성 없음.
**Spec:** [requirements.md](./requirements.md), [design.md](./design.md).

## Global Constraints

- 저장 대상은 재료 ID·매칭률·난이도만. 사용자키는 저장 키에만 사용하고 외부 전송하지 않는다.
- 광고·출시 콘솔·전체 카탈로그는 수정하지 않는다. 과거 기록은 지우지 않고 현재 정정을 구분한다.
- 2026-10-04 사용자의 문서 보완 후 1번 진행 요청에 따라 현재 전용 clone의 기능 브랜치에서 직접 실행한다.
- 별도 로그는 생략한다. 작업 상태는 이 계획과 validation.md/Task.md에서 이어간다. 커밋·push는 이 단계에서 하지 않는다.

## Review Focus

- 빈/잘못된 HASH, 지원 검사 실패에서 공용 저장소로 쓰지 않는가.
- 복원 지연 중 변경·추천·초기화가 늦은 응답으로 덮이지 않는가.
- StrictMode/재마운트와 느린 저장에서 최신 상태가 보존되는가.
- 손상 데이터·읽기/쓰기 거부·끝나지 않는 조회가 추천 흐름을 막지 않는가.
- 홈에서 back 구독이 남아 종료를 가로막거나 내부 화면에 구독이 중복되지 않는가.

## Task 1: 문서 정합성

- [x] 실제 재료 수·React 버전·커밋 상태와 과거 경로를 구분한다.
- [x] 출시 준비 명세의 동기 저장 인터페이스를 SDK의 비동기 계약으로 수정한다.
- [x] 광고 결정과 사용자 상태 작업의 의존성을 분리하고 코드/자동/기기 완료 기준을 정한다.

## Task 2: 사용자별 저장과 앱 복원

Files: `src/user/userKey.ts`, `src/storage/userState.ts`, `src/hooks/usePersistentUserState.ts`, `src/App.tsx`, `src/App.persistence.test.tsx`.

Interfaces:
- `PersistedUserState = { selectedIngredientIds: string[]; minimumMatchRate: number; difficultyFilter: RecipeDifficulty | 'all' }`
- `getMiniAppUserKey(): Promise<string | null>`
- `loadUserState(hash): Promise<{ status: 'loaded'; state: PersistedUserState | null } | { status: 'unavailable' }>`
- `saveUserState(hash, state): Promise<boolean>`
- `usePersistentUserState()` → `{ state, updateState, preserveCurrentState }`.

- [x] 실제 App과 SDK 경계의 메모리 저장소를 사용해 복원·사용자 분리·초기화·오류·경합 테스트를 먼저 작성한다.
- [x] `npm test -- src/App.persistence.test.tsx`에서 미구현 복원/저장 assertion 실패를 확인한다.
- [x] 위 인터페이스로 최소 저장 서비스·훅을 구현하고 App에 연결한다.
- [x] 같은 테스트와 기존 전체 `npm test` 통과를 확인한다.

## Task 3: 플랫폼 이동

Files: `src/App.tsx`, `src/App.persistence.test.tsx`, 기존 `src/App.test.tsx`의 SDK mock 경계.

- [x] backEvent/homeEvent를 발생시켜 실제 화면 이동, 선택 보존, 홈 및 언마운트 시 해제 테스트를 작성하고 실패를 확인한다.
- [x] App에서 내부 화면에만 구독을 연결한다. 구독 오류에도 기존 버튼 흐름은 유지한다.
- [x] `npm test`, `npm run lint`, `npm run build`를 수행하고 기본 테스트 ID 빌드를 생성한다.
- [x] 브라우저 모의 환경에서 재진입 복원과 초기화를 확인한다. 실기기 검증은 대기로 기록한다.
- [x] 독립 코드 리뷰 후 필요한 회귀 테스트·수정을 수행하고 validation.md/roadmap.md/Task.md를 갱신한다.
