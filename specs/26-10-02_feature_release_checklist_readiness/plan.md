# 비게임 출시 체크리스트 대응 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 비게임 출시 가이드에서 미충족·미확인인 항목을 보완하고 테스트 번들과 토스 앱 검증 근거를 준비한다.

**Architecture:** 비게임 사용자 식별키로 로컬 상태를 사용자별 분리해 필요한 재료 선택·추천 설정을 복원한다. 앱은 서버 로그인 없이 유지하며, 배너는 스크롤 가능·비일시 화면 및 광고 정책 적합성이 확인된 경우에만 부착한다. 출시 검증은 테스트 ID QR 확인과 출시 승인 후 실제 광고 확인을 분리한다.

**Tech Stack:** React 18, TypeScript, Apps in Toss WebView SDK 3.2.0, Vite, Vitest, Toss Ads.

**Spec:** `specs/26-10-02_feature_release_checklist_readiness/requirements.md` 및 `design.md`

## 현재 실행 순서 (2026-10-04)

이 문서는 전체 출시 작업의 상위 계획이다. Task 2·3과 Task 7의 이벤트 연결은 [상태 저장 실행 계획](../26-10-04_feature_user_state_persistence/plan.md)으로 구체화해 먼저 수행한다. 광고 위치 결정을 기다리느라 사용자 상태 작업을 중단하지 않는다. Task 4·5·7의 실기기/콘솔 작업은 별도 후속 단계다.

## Global Constraints

- 새 로그인, 서버 API, 결제, 새 기기 권한을 추가하지 않는다.
- 테스트 빌드에는 공식 테스트 광고 ID만 포함하고 실제 groupId는 테스트에 사용하지 않는다.
- 배너 광고용 빈 공간이나 의미 없는 콘텐츠를 만들지 않는다.
- 출시 위치가 정책 적합한지 확정되기 전 배너 위치를 다른 화면으로 옮기지 않는다.
- 토스 네비게이션·실제 광고 노출은 지원되는 토스 앱 기기에서 확인한다.
- 콘솔 약관 동의·검수·라이브 전환은 별도 사용자 요청과 권한이 있기 전 수행하지 않는다.
- AGENTS.md의 프로젝트 UI·접근성 하드 규칙을 따른다. 사용자 변경사항을 임의 커밋하지 않으며 이번 작업은 미커밋 상태로 제공한다.

## Review Focus

- 사용자 식별키가 늦게 도착하거나 실패할 때 앱 시작과 사용 중 상태가 정상인지 검증한다.
- 앱을 닫았다 다시 열 때 다른 사용자 상태가 섞이지 않고 필요한 선택 상태만 복원되는지 검증한다.
- 짧은 화면·safe area·큰 글자에서 광고, CTA, 콘텐츠가 겹치거나 잘리지 않는지 검증한다.
- 토스 네비게이션과 Android 백버튼이 React 내부 화면 흐름과 충돌하지 않는지 기기에서 검증한다.
- 광고 no-fill·실패·미지원 환경에서도 핵심 기능이 작동하고 테스트 빌드에 실제 광고 ID가 없는지 확인한다.

---

### Task 1: 광고 위치와 보존 데이터 범위 확정

**Files:**
- Modify: `specs/26-10-02_feature_release_checklist_readiness/decisions.md`
- Modify: `specs/26-10-02_feature_release_checklist_readiness/requirements.md`

- [ ] 공식 비게임 가이드와 광고 정책의 스크롤·인트로·오클릭 조건을 현재 홈 화면에 대조한다.
- [ ] 홈이 적합한 화면인지와 근거를 기록한다. 320×640 시각 검사는 사용 전 화면 구조 확인이며 토스 앱 검증을 대체하지 않는다.
- [ ] 홈이 적합하지 않거나 판정이 불분명하면 광고 코드를 바꾸기 전에 사용자에게 위치 결정을 요청한다.
- [ ] 재방문 후 유지할 최소 데이터가 현재 재료 선택·매칭률·난이도인지 확정한다. 별도 사용 이력 기능은 제품 요구가 확인되기 전 추가하지 않는다.
- [ ] 광고와 CTA의 안전한 시각 간격을 정하고 빈 콘텐츠·광고용 스페이서는 배제한다.

### Task 2: 사용자 키와 로컬 상태 저장 서비스

**Files:**
- Create: `src/user/userKey.ts`
- Create: `src/user/userKey.test.ts`
- Create: `src/storage/userState.ts`
- Create: `src/storage/userState.test.ts`

**Interfaces:**
- Consumes: `User.getAnonymousKey(): Promise<{ type: "HASH"; hash: string }>`
- Produces: `getMiniAppUserKey(): Promise<string | null>`
- Produces: `PersistedUserState = { selectedIngredientIds: string[]; minimumMatchRate: number; difficultyFilter: RecipeDifficulty | "all" }`
- Produces: `loadUserState(userHash: string): Promise<{ status: "loaded"; state: PersistedUserState | null } | { status: "unavailable" }>`, `saveUserState(userHash: string, state: PersistedUserState): Promise<boolean>`

- [ ] `getMiniAppUserKey` 성공은 HASH를 반환하고 거부/미지원은 null을 반환하는지, 동일 키 저장 상태는 복원되고 다른 키는 null인지, 저장소 읽기·쓰기 예외가 앱 흐름을 중단시키지 않는지 assertion을 정한 테스트를 작성한다.
- [ ] 실행: `npm test -- src/user/userKey.test.ts src/storage/userState.test.ts` — 기대: 구현 전 함수 미존재 또는 미구현 동작 때문에 HASH/null 반환, 키 분리, 저장소 예외 시 non-throw/session fallback assertion이 실패한다.
- [ ] 공식 `User.getAnonymousKey()` 호출과 키별 최소 상태 저장·복원 서비스를 구현한다.
- [ ] 저장소 오류가 핵심 흐름을 막지 않도록 한다. 키가 없으면 다른 사용자의 상태를 읽지 않는다.
- [ ] 같은 명령을 재실행해 기대 동작이 통과하는지 확인한다.

### Task 3: 앱 상태 복원 연결

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: Task 2의 `getMiniAppUserKey`, `loadUserState`, `saveUserState`
- Produces: 시작 시 사용자 상태 hydrate, 재료·필터 변경 시 상태 저장

- [ ] `App` 테스트에서 재진입 시 저장 값 hydrate, 키 응답 지연 중 새 입력 보존, `처음부터` 후 초기값 저장, 키 조회 실패 후에도 선택/추천 화면 사용 가능을 각각 assertion으로 명시한다.
- [ ] 실행: `npm test -- src/App.test.tsx` — 기대: 구현 전 hydrate·입력 보존·초기화·실패 복구 assertion이 새 동작 부재로 실패한다.
- [ ] 앱 시작 시 필요한 상태만 복원하고 늦은 hydrate가 사용자의 새 입력을 덮지 않도록 연결한다.
- [ ] 재료·매칭률·난이도 변경과 `처음부터` 초기화를 저장 서비스에 연결한다.
- [ ] 실행: `npm test -- src/App.test.tsx` — 기대: 복원·격리·초기화 테스트 통과.

### Task 4: 확대·축소 제스처 제한

**Files:**
- Modify: `index.html`

- [x] 공식 가이드 요구에 맞게 viewport 설정을 보완한다. maximum-scale=1.0, user-scalable=no (2026-10-04)
- [ ] 지원 토스 앱에서 핀치 확대·축소가 비활성화되는지 수동 확인한다.
- [ ] 재료 선택, 가로/세로 스크롤, CTA 터치가 그대로 동작하는지 함께 확인한다.

### Task 5: 정책 적합 배너 배치

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/components/HomeBannerAd.tsx`
- Modify: `src/App.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: Task 1에서 결정한 적합 화면 및 CTA 간격
- Produces: 허용 화면에서만 SDK 배너 부착 및 이탈 시 정리

- [ ] 허용 화면에만 광고가 부착되고 나머지 화면에는 부착되지 않는 통합 테스트를 작성한다.
- [ ] 실행: `npm test -- src/App.test.tsx` — 기대: 새 조건 테스트가 구현 전 실패한다.
- [ ] Task 1에서 합의한 화면·간격 기준으로 광고 표시 조건과 레이아웃을 조정한다.
- [ ] no-fill·렌더 실패·미지원 시 광고 빈 프레임이 CTA처럼 남지 않는지 확인한다.
- [ ] 실행: `npm test -- src/App.test.tsx` — 기대: 부착 조건·실패 상태·핵심 흐름 테스트 통과.
- [ ] 위치 결정이 미해결이면 기존 코드를 추정 변경하지 않고 사용자 선택을 기다린다.

### Task 6: 자동 검증 및 테스트 AIT 번들

**Files:**
- Modify: `specs/26-10-02_feature_release_checklist_readiness/validation.md`

- [ ] 실행: `npm test` — 기대: 전체 Vitest 통과.
- [ ] 실행: `npm run lint` — 기대: 오류 없음; 기존 경고가 남으면 따로 기록.
- [ ] 실행: `npm run build` — 기대: package.json에 정의된 TypeScript, Vite 웹 빌드, AIT 번들이 차례로 성공한다.
- [ ] AIT 테스트 산출물에 테스트 ID만 있고 실제 groupId는 없는지 확인한다.
- [ ] 후속 push 전 staged/unstaged/untracked 변경과 push 대상 커밋을 실제 groupId 비노출 방식으로 검사한다. 검사 결과에는 값 대신 위치와 pass/fail만 남긴다.
- [ ] 명령·수치·화면별 실제 결과를 validation.md에 기록한다.
- [ ] 전체 비게임 가이드의 보안·네트워크·네비게이션·UX 항목을 정적/실기기/조건부로 분류해 validation.md에 매핑한다. 실행 전에는 상태를 미완료로 둔다.


### Task 7: 토스 앱과 콘솔 검증

**Files:**
- Modify: `specs/26-10-02_feature_release_checklist_readiness/validation.md`

- [ ] 새 테스트 번들의 콘솔 업로드·테스트 푸시·QR 확인 전 사용자 승인을 받는다. 승인 전에는 외부 업로드를 하지 않고 이 단계는 대기 상태로 둔다.
- [ ] 승인된 테스트 번들을 콘솔 QR로 토스 앱에서 열어 진입과 User key 응답을 확인한다.
- [ ] 앱 종료·재진입 후 저장 상태와 처음부터 초기화를 확인한다.
- [ ] 닫기·뒤로가기·더보기·Android 시스템 백버튼·등록 기능/스킴·외부 링크 및 공유 `intoss://` 진입/복귀를 확인한다. 앱 이름/로고 표시는 등록 메타데이터와 일치하고, 자체 로고·중복 뒤로가기·기능 버튼 2개 이상은 없어야 한다.
- [ ] 라이트 테마, 모든 UI 동작, 명확한 종료·CTA, 금지된 자동/강제 바텀시트와 자체 서비스·앱 설치 유도 여부, 문구·콘텐츠를 확인한다.
- [ ] 배너 미지원·no-fill·정상 렌더, CTA 오클릭 및 예상치 못한 노출을 확인한다. 다른 광고 타입이 연결된 경우 사전 로딩·음악 일시정지/복귀·광고 종료·리워드 지급 기준도 확인한다.
- [ ] 320×640·safe area·가로 넘침·2초 내 반응·메모리/네트워크 급증 여부를 기록한다.
- [ ] 기존 Stage 10 검증 문서의 QR 미실행 기록과 최신 번들의 `isTested=true`를 대조하고 실제 광고·UI 확인 여부를 별도 증거로 남긴다.
- [ ] 워크스페이스 대표관리자의 약관 동의 및 최초 앱/번들 검수 상태를 확인한다.
- [ ] 실제 광고 검증은 승인·라이브 환경에서만 수행하고 테스트 ID와 실제 ID를 혼용하지 않는다.
- [ ] 토스 로그인·인앱 결제·토스페이·공유 리워드·위치/알림 권한·음악·전면/리워드 광고의 코드·콘솔 연결 여부를 점검하고 미사용 항목에 해당 없음 근거를 기록한다.

### Task 8: 검증 기록과 변경 정리

**Files:**
- Modify: `specs/roadmap.md`
- Modify: `specs/26-10-02_feature_release_checklist_readiness/validation.md`
- Update: `Task.md` (사용자가 별도 작업 로그 생략을 선택함)

- [ ] 요구사항별 실제 결과와 외부 차단 요인을 반영한다.
- [ ] `git diff --check`를 실행해 공백 오류가 없는지 확인한다.
- [ ] 기존 Stage 10과 11·12단계는 각 완료 기준과 증거가 있을 때만 체크한다.
- [ ] 커밋 전 작업 파일만 준비하고 AGENTS.md에 따라 사용자에게 커밋 여부를 확인한다.

## 완료 기준

- RCR-01~RCR-14 상태와 증거가 validation.md에 연결된다.
- 신규 push 전 실제 groupId가 전송 대상에 없고, 기존 원격 이력 노출이 담당자와 해결된 것을 값 비노출 방식으로 확인한다.
- 필요한 상태가 사용자 식별키에 따라 격리되어 복원되고 식별키 실패가 앱 사용을 막지 않는다.
- 광고 위치가 정책 적합하다는 근거가 없으면 광고 요구사항을 통과로 표시하지 않는다.
- 테스트 빌드와 라이브 실제 광고 확인이 혼합되지 않는다.
- 실기기·콘솔에서 확인하지 않은 항목은 완료로 표시하지 않는다.
