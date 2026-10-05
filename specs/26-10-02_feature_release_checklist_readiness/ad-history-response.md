# RCR-14 원격 광고 그룹 ID 이력 조사와 대응안

2026-10-05 21:33 KST, 로드맵11단계. 기존 기능 브랜치를 유지하고 사용자 미커밋 변경을 보존했다. 광고 ID 실제값은 이 문서·출력·검사 JSON에 기록하지 않는다.

## 최종 원격 반영 결과 (21:45 KST)

사용자 정책선택과3브랜치일반push승인후원격재확인·fast-forward관계확인·atomic push성공. master fe2301a21ee3fbf7d96b3e984f7ee32eddb6cbfa/codex-release170408a0084e980c50dcd0bb9a3e16c2fe4f9515/user-state defe34c7ab281c3e11793ed1bad6cddd5e825138를ls-remote및재fetch확인. 아래조사표는반영전기록이다.

원격5heads의최신소스실제값0,연결된고유39커밋중과거15개값존재유지,현재작업172파일0건. 신규추가줄·새커밋스냅샷0검사완료. 변경된RCR-14정책기준완료. 과거값제거·fork/cache삭제·광고ID클라이언트비노출을주장하지않는다. 근거history-audit-after-push.json. 현재제품미커밋작업은원격에반영하지않았다. 분리복제본3개와커밋증거는후속검토용으로보존.

다음12단계콘솔재조회도약관동의필요/최초등록false/라이브없음유지. 약관수락·검수제출·출시는하지않았다.

## 현재 확인 결과

git fetch origin --tags 및 git ls-remote --heads --tags origin 성공. 광고된 원격 브랜치5개·태그0개와 해당 브랜치에서 도달 가능한 고유36커밋을 조사했다. 보호 설정의 실제값을 기준으로 파일명만 수집했다.

| 원격 브랜치 | 최신 커밋 | 최신 파일의 ID 존재 | ID 포함 과거 커밋 수 |
|---|---|---|---|
| codex/release-checklist-readiness | 9cf1fcd | 6파일 | 2 |
| feature/home-entry-docs | 603d0df | 없음 | 0 |
| feature/selection-settings-result-count | 507ffa5 | 없음 | 15 |
| feature/user-state-persistence | c4f44f7 | 2파일 | 4 |
| master | def4bae | 6파일 | 1 |

커밋은 브랜치끼리 중복되므로 위 수를 합산하지 않는다. ID 포함 고유 커밋15개. 현재 작업 트리의 비무시 추적·미추적171파일에서는 실제값 포함 파일0개.

원격 최신 파일의 위치:

- master와 codex/release-checklist-readiness: src/ads/bannerAds.ts, src/ads/bannerAds.test.ts, specs/26-10-02_feature_home_banner_ad/README.md·decisions.md·design.md·validation.md.
- feature/user-state-persistence: src/ads/bannerAds.ts, src/ads/bannerAds.test.ts.

조사 범위 밖: PR 전용 참조, 서버의 도달 불가 객체, forks·caches·이미 다운로드된 복제본. 원격 전체 정보의 완전한 제거를 보증하지 않는다.

증거: D:/ait-home/fridgepick-release-check-20261005-scroll/history-audit.json. 파일별·커밋별 목록과 조회 시각 보존. 검사 자체는 원격 소스를 변경하지 않는다.

## 구체적인 선택지

사용자 결정:1번 일반커밋으로 최신 소스 정리·과거 이력 보존. 엄격한 원격 이력 제거 목표는 [RCR-14 요구사항](./requirements.md)의 최신소스·신규커밋 비기록 정책으로 변경했다. 강제push/이력재작성/그룹교체는 제외한다.

검증된 로컬 커밋:

| 원격 반영 대상 | 정리 커밋 | 변경 | 검증 |
|---|---|---|---|
| master | fe2301a21ee3fbf7d96b3e984f7ee32eddb6cbfa | 11파일,+70/-23 | 광고10개/기본·출시빌드/ID분리통과 |
| codex/release-checklist-readiness | 170408a0084e980c50dcd0bb9a3e16c2fe4f9515 | 11파일,+70/-23 | 광고10개/기본·출시빌드/ID분리통과 |
| feature/user-state-persistence | defe34c7ab281c3e11793ed1bad6cddd5e825138 | 7파일,+66/-19 | 광고10개/기본·출시빌드/ID분리통과 |

분리복제본:D:/ait-home/fridgepick-ad-cleanup-{master,release-checklist,user-state}-20261005. 현재 작업 트리와 원격 브랜치는 유지했다. 각 복제본은 clean이며,소스·신규추가줄·커밋스냅샷의실제값0검사완료. 기존설치의node_modules를junction으로사용했으므로원래lockfile의새설치재현성검증으로주장하지않는다. 기존검증된507ffa5의설정·테스트를각대상원본위에적용했으며데이터/UI기능변경없음. 기본AIT실제/테스트파일0/1,출시1/0확인. 과거15개커밋은유지. 원격push는결과공유후별도요청·답변대기,반영검증전완료표시안함.

1. **일반 커밋으로 최신 소스 정리·과거 이력 보존**: master/codex-release/feature-user-state의 최신 파일을 각각 외부 출시 설정·테스트ID 방식으로 정리한다. 현재 기능 브랜치의171파일0건을 유지하고 새 커밋의 실제ID 추가를 검사한다. 과거15커밋은 남으므로 RCR-14의 원격 이력 비노출 기준을 이 정책으로 변경하는 사용자 결정이 선행돼야 한다. 기존 과거 이력 완전 제거를 완료로 표시하지 않는다.
2. **원격 연결 이력 정리**: 별도 복제본에서 위36커밋의 실제값을 치환하고5브랜치의 변경 전후SHA·복구bundle·협업 재동기화 절차·보호 브랜치 설정을 준비한다. 검토 후 정확한 대상 refs에만 사용자 승인된 강제 업데이트가 필요하다. 기존clone/forks/caches까지 삭제되지 않으며 현재 dirty작업 트리에서 실행하지 않는다. 현 단계에서는 실행하지 않았다.
3. **광고 그룹 교체 검토**: 기존값을 과거 이력에서 제거하지 않으며 그룹 설정·수익/광고 연동에 영향을 줄 수 있다. 현재 호출 가능한 광고 그룹 생성/교체 도구가 없어 콘솔 지원 여부와 운영 영향을 별도 확인해야 한다. 기존 그룹을 폐기하지 않는다.

현재 빌드 검사에서는 출시 클라이언트에 실제 광고ID가 포함된다. 소스 설정 분리는 저장소에 새 값을 기록하지 않기 위한 것이며 클라이언트에서 값을 숨긴다는 의미가 아니다. 이 결과만으로 인증권한이나 악용 가능성을 단정하지 않는다.

## 12단계 최초 등록 준비

miniapp_get에서 현재 설명은 재료 선택 기능만 설명하며 추천·필터·출처·저장 설명이 없다. 현재 확인 기능에 맞춘 설명은 [최종 통합 검증의 로컬 수정안](../26-10-04_feature_recipe_source_cleanup/final-integration-validation.md)에 준비됐다. 현 조회에서 images는 빈 배열,iconUri는 설정돼 있다. images 미등록을 공식 필수항목 미충족으로 단정하지 않는다.

직전 재조회:앱정보APPROVED/최초등록false/제휴약관동의필요/라이브없음. 세션에 initial_review_submit·약관동의 도구가 없다. 최초 등록과 약관은 [콘솔 홈](https://apps-in-toss.toss.im/workspace/96603/mini-app/80586/home)의 절차가 필요하다. 약관 수락과 제출은 수행하지 않았다.

## 변경 이력

Files: Task.md, specs/26-10-02_feature_release_checklist_readiness/README.md, validation.md, ad-history-response.md
Change: 원격 광고ID 노출 위치·범위와 세 가지 대응안을 현재 근거로 정리했다.
Before: 로컬origin참조의 오래된 건수만 있으며 현재 원격head와 연결이력 범위 미확인.
After: 원격5heads/태그0/고유36커밋 확인,최신3브랜치·고유15커밋 노출 및 현재소스171파일0건을 구분했다. 파괴적 대응은 미실행.
Verification: fetch/ls-remote 성공,보호값 파일명 검사 및 JSON보존. 문서 전용 변경으로 제품검사 재실행 없음. 커밋·push·이력재작성·광고그룹변경·약관수락·검수제출·출시 미수행.
