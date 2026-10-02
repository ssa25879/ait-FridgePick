# 검증 계획: 홈 하단 배너 광고

## 현재 상태

홈 배너 구현에 테스트·출시 ID 선택을 추가했다. 기본 `build`는 공식 테스트 ID만 포함하고 `build:release`는 활성 발급된 실제 groupId만 포함한다. 두 모드의 AIT 산출물을 각각 생성해 ID 포함 여부를 확인했으며, 최종 `ait-fridgepick.ait`는 테스트 ID 빌드로 준비했다.

콘솔 조회(2026-10-02): 워크스페이스 `YWS_WorkSpace`(96603)의 미니앱 `냉털픽`(80586)은 PREPARE다. “배너 광고 1차” 지면은 ENABLED이며 groupId `ait.v2.live.65a4afab51804f34`가 발급됐다. release 모드 AIT 번들은 로컬 생성 및 ID 확인을 마쳤다. 콘솔 업로드·QR 테스트·출시는 수행하지 않았다.

## 요구사항별 검증

| ID | 검증 방법 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| HAB-01 | App 통합 테스트에서 홈 부착과 재료 선택 화면 진입 시 제거를 확인한다. | 홈에서만 배너가 부착된다. | 통과 |
| HAB-02 | CSS의 홈 세로 레이아웃, safe area를 포함하는 화면 너비·높이를 확인하고 320×640 화면에서 겹침을 시각 점검한다. | 100vw 너비·96px 슬롯이 CTA와 safe area를 가리지 않는다. | CSS 확인, 320×640 시각 점검 대기 |
| HAB-03 | StrictMode 통합 테스트와 SDK 초기화 단위 테스트로 지원 확인·초기화·부착·정리 횟수를 검사한다. | 초기화는 한 번, StrictMode 재실행 부착은 정리되며 화면 이탈 때 destroy가 호출된다. | 통과 |
| HAB-04 | SDK 초기화 미지원·초기화 실패·배너 미지원·no-fill·렌더 실패를 자동 확인한다. | 광고가 없어도 홈 CTA와 재료 선택 흐름이 작동한다. | 통과 |
| HAB-05 | 기본 Vite/AIT 테스트 번들에서 광고 ID를 확인한다. | 테스트 ID만 포함하고 실제 지면 ID는 포함하지 않는다. | 통과: 두 문자열 포함 여부 확인 |
| HAB-06 | 콘솔 QR로 테스트 빌드를 토스 앱에서 연다. | 지원 환경에서 홈 배너와 화면 이동을 확인한다. | 대기: 콘솔 QR 실행 안 함 |
| HAB-07 | 전체 App 테스트에서 홈→재료 선택→결과와 배너 부착/제거를 확인한다. | 광고가 기존 핵심 흐름을 가리지 않는다. | 자동 테스트 통과 |
| HAB-08 | `MODE`를 바꿔 exported ID를 단위 테스트한다. | 기본 모드는 테스트 ID, release 모드는 활성 groupId를 반환한다. | 통과 |

## 실행 결과

### 실제 그룹 ID 설정 후 재검증

- 전체 테스트: `npm.cmd test` — 9개 파일, 70개 테스트 통과.
- TypeScript: 기본 `npm.cmd run build` 및 `npm.cmd run build:release`의 `tsc -b` 단계 통과.
- lint: `npm.cmd run lint` — 종료 코드 0. 기존 `src/hooks/useInAppAds.tsx:54` 경고 1건.
- 기본 테스트 AIT 빌드: `npm.cmd run build` 통과. `dist/assets/index-CvtbuzIS.js`와 AIT 내부 JS에 테스트 ID만 있고 실제 groupId는 없음.
- release AIT 빌드: `npm.cmd run build:release` 통과. 웹 번들과 AIT 내부 JS에 실제 groupId만 있고 테스트 ID는 없음.
- 최종 산출물: 두 모드 검증 뒤 기본 테스트 빌드를 다시 생성해 `ait-fridgepick.ait`에 남김.
- `git diff --check` 통과. LF/CRLF 변환 알림만 표시됨.
- 서브에이전트 검토에서 초기 실제 ID 포함 문제를 찾아 수정했고, ID 분기 단위 테스트와 기본 번들 검증을 확인함.

## 배너 구현 초기 검증 기록

- 전체 테스트: `.\node_modules\.bin\vitest.cmd run` — 9개 파일, 68개 테스트 통과.
- TypeScript: `.\node_modules\.bin\tsc.cmd -b --pretty false` — 통과.
- lint: `.\node_modules\.bin\oxlint.cmd` — 종료 코드 0. 기존 `src/hooks/useInAppAds.tsx`의 `react(set-state-in-effect)` 경고 1건.
- 웹 빌드: `.\node_modules\.bin\vite.cmd build` — 통과. 번들 크기 경고가 있으나 빌드 실패는 아니다.
- 앱인토스 테스트 빌드: `.\node_modules\.bin\ait.cmd build` — 통과, `ait-fridgepick.ait` 생성.
- 번들 ID 확인: `dist/assets/index-CvtbuzIS.js`에서 `ait-ad-test-banner-id` 확인.
- 변경 공백 확인: `git diff --check` — 종료 코드 0. Git의 LF/CRLF 변환 알림만 출력됐다.
- 서브에이전트 독립 리뷰: safe-area 보정과 실패 로그 추가를 재검토했으며 Critical·Important 문제는 남지 않았다.

## 남은 검증과 외부 동작

- 320×640 화면의 실제 레이아웃, 겹침과 가로 넘침을 시각적으로 확인한다.
- 기본 테스트 빌드를 콘솔 QR로 토스 앱에서 열어 광고 표시와 화면 이동을 확인한다. 샌드박스 미리보기는 광고 표시 검증으로 간주하지 않는다.
- 콘솔 업로드·테스트 푸시·출시는 아직 수행하지 않았다.
