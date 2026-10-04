# 냉털픽 작업 인수인계

갱신: 2026-10-04 (Asia/Seoul)

## 위치와 Git 상태

- 로컬: D:\ait-home\ait-FridgePick
- 원격: https://github.com/ssa25879/ait-FridgePick.git
- 현재 문서 브랜치: feature/release-validation-specs (c4f44f7에서 분기)
- 구현 브랜치: feature/user-state-persistence, origin 최신확인 c4f44f7
- 최초 구현 기준:9cf1fcd. 이번 문서 기준:c4f44f7. master 기준 제품 커밋:def4bae.
- 문서·사용자 상태·배너 변경 커밋3a9972c를 origin/feature/user-state-persistence에 push 완료했다.
- viewport 제한 설정은 c4f44f7로 커밋·push 완료했다. master는 변경하지 않았다. 콘솔 업로드·출시는 수행하지 않았다.
- 사용자 요청으로 D:\Codex 별도 로그는 생략했다. 기존 Log.md도 변경하지 않았다.

## 완료

- 지정 스킬로 specs 구조 보완: 배너6문서/IB-01~08, 사용자 상태 결정기록·USP 검증 추적, 출시 계획/RCR 증거 양식·현재 경로/상태 정합화. 이번 문서 작업은 제품 코드·테스트·빌드·기기·콘솔을 재실행하지 않는다. 문서 일관성만 검사했다: specs66문서/상대링크148개 누락0, USP10·IB8·RCR14 ID 검증표 대응 누락0, 제품 코드 변경0. 문서 전용 커밋으로 기록하며 새 문서 브랜치는 아직 push하지 않았다.

- 다음 단계: index.html viewport 최대 배율1/사용자 확대 금지 설정 추가. TypeScript·기본 Vite/AIT 빌드, 320×640 버튼/매칭률 슬라이더/김치볶음밥 흐름 확인. 실제 토스 핀치 차단은 미검증.

- specs 문서의 실제 재료 95개, React 18.3.1, 필터 구현 상태와 과거 경로/검증 기록을 정합화했다.
- 보완 2번: 사용자 선택에 따라 홈 광고를 제거하고 재료 화면 CTA 아래 스크롤 조건부 배너로 전환했다. 광고 자체의 높이와 간격을 측정에서 제외하고 크기 변경 시 해제/재부착한다.
- 로드맵 11A 상태 저장과 11B 광고·제스처 의존성을 분리하고 13단계 추천 품질·개발 재현성 보완을 추가했다.
- 보완 1번: 공식 SDK 사용자키 지원 검사/HASH 검증, 사용자별 비동기 저장, 재료·매칭률·난이도 복원, 초기화 저장을 구현했다.
- 늦은 조회가 현재 입력/추천을 덮지 않으며 읽기 실패·1500ms 초과 시 세션만 유지한다. 같은 사용자 쓰기를 직렬화하고 재마운트 조회는 이전 쓰기를 기다린다.
- 내부 화면 back은 결과→재료→홈, home은 홈으로 이동한다. 홈에서는 구독을 해제해 기본 종료 동작을 가로막지 않는다.

## 검증

- Node 24.19.0 / SDK 3.2.0, 전체 10개 파일 98개 테스트 통과.
- lint 종료 0: 기존 src/hooks/useInAppAds.tsx:54 경고 1건 유지.
- TypeScript, 기본 및 release Vite/AIT 빌드 통과. 약 2.377 MB JS 청크 경고 유지.
- 브라우저 AIT DevTools에서 김치·보통 필터 새로고침 복원, 밥 추가 추천, 처음부터 후 새로고침 0개/60%/전체 확인.
- 광고 브라우저 확인: 320×640 재료 화면 배너 1개/간격32px/가로 넘침 없음, 480×2000 배너0개, 다시 작은 화면 배너1개, 홈0개.
- 광고 독립 코드 리뷰 Critical/Important 없음. observer 콜백·미지원 경로의 직접 테스트는 후속 검증 보완이다.
- 독립 코드 리뷰 Critical/Important 없음. 느린 저장 중 초기화·동일 사용자 재마운트 테스트 추가 후 재검증 통과.
- 브라우저 TDS safe-area 오류는 기존과 동일. 실제 토스 앱 HASH·영속 저장·Android 백 동작은 미검증.
- 이번 검증용 5174 개발 서버와 브라우저 탭은 종료했다. 기존 5173 프로세스는 건드리지 않았다.

## 다음 작업

1. 보완 1번 실기기 QA: 실제 HASH 응답 타입, 종료·재진입, 계정 분리, 플랫폼 back/home/닫기. WebView 유지 중 계정 변경과 저장 완료 전 즉시 종료도 확인한다.
2. 보완 2번 실기기 QA: 재료 화면 실제 광고/Ad 표기, 크기·카테고리 변화, no-fill, safe area, CTA 오클릭 위험과 검수 적합성을 확인한다. 홈→재료 조건부 배치는 구현 완료했다.
3. 확대 제한 설정은 구현 완료. 실제 토스 핀치·두 번 탭·터치/스크롤, UI/스킴/성능 검증과 약관·최초 검수 확인이 남는다.
4. 대표 10개 조합 무후보 3/10, 미지원 필수 재료 포함 814개 레시피의 매핑 보완.
5. 실제 광고 groupId가 기존 원격 코드 이력에 있다. 값은 문서에 복사하지 않는다. 사용자의 이번 브랜치 push 요청을 우선하며 신규 diff/미추적 파일의 실제 ID 추가는 0건으로 확인했다. 기존 원격 코드/이력의 값은 그대로 남아 있고 비노출 목표는 미달성이다. 보호 입력·이력 대응과 출시는 별도다.
6. README/Node 버전/CI, CSV 원본과 기준일 unknown, 초기 로딩 성능을 별도 보완한다.

## 중요한 경로

- 문서 안내: specs/README.md
- 구현 명세·검증: specs/26-10-04_feature_user_state_persistence/
- 전체 출시 검증: specs/26-10-02_feature_release_checklist_readiness/validation.md
- 로드맵: specs/roadmap.md
- 구현: src/App.tsx, src/hooks/usePersistentUserState.ts, src/storage/userState.ts, src/user/userKey.ts
- 광고 명세: specs/26-10-04_feature_ingredient_banner/README.md
- 광고 구현: src/components/ScrollableIngredientBanner.tsx, src/components/BannerAd.tsx
- 회귀 테스트: src/App.persistence.test.tsx, src/App.test.tsx

## 실행 환경

시스템 Node 16은 부족하다. 현재 PC에서는 아래 Node를 해당 PowerShell 프로세스 PATH 앞에 추가해 실행했다.

C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin

npm_config_cache는 $env:TEMP\codex-fridgepick-npm-cache를 사용한다. npm test / npm run lint / npm run build / npm run build:release로 검증한다.
