# 이력 정리 계획 (공개 저장소의 광고 그룹 ID 제거)

공개 GitHub 저장소의 옛 커밋에 실제 광고 그룹 ID가 남아 있다. 이를 **최대한 안전하게** 정리하는 계획이며 세 세션에 나눠 진행한다. 이 문서는 계획만이고 아직 아무것도 실행하지 않았다.

- 브랜치: `feature/history-cleanup-plan` (기준 `master` d970732)
- 상태: **계획 문서만 작성. 저장소 설정 변경·재작성·푸시·삭제는 하지 않았다.**
- 비밀 취급: 이 문서와 저장소의 어떤 파일에도 ID 값을 쓰지 않는다. 문서에서는 `<AD_GROUP_ID>`로 표기하고 실제 값은 저장소 밖 파일에만 둔다.

## 현황 (2026-10-20 실측)

| 항목 | 값 |
| --- | --- |
| 저장소 | `ssa25879/ait-FridgePick`, **public**, 별 0·포크 0·이슈/PR 0, Pages 없음, 크기 약 2.2MB |
| 원격 브랜치 | 13개(기본 브랜치 `master`), 태그 0, PR 참조 0 |
| ID가 있는 커밋 | 6개(`def4bae` `3a9972c` `507ffa5` `fe2301a` `170408a` `defe34c`, 2026-10-02~10-05) |
| ID가 있었던 파일 | `src/ads/bannerAds.ts`, `src/ads/bannerAds.test.ts`, `specs/26-10-02_feature_home_banner_ad/{README,decisions,design,validation}.md` (6개) |
| 현재 트리의 ID | 0건 (HEAD 기준) |
| 첫 ID 커밋 이후 | `master`의 76개 커밋(전체 97개)이 영향을 받는다 |
| 로컬 전용 브랜치 | `codex/home-banner-ad`, `feature/public-recipe-catalog`, `feature/recommendation-filters`(원격 없음, ID 0건), 스태시 1개(ID 0건) |
| 작업 트리 | codex 2곳과 임시 대시보드 1곳이 같은 `.git`에 붙어 있다 |
| CI | `.github/workflows/ci.yml` |
| 도구 | git 2.53, Python 3.12(`git-filter-repo` 미설치), Java·gitleaks 없음 |

## 이 문서가 권하는 방향

1. **지금 바로(세션 전, 1분):** 현재 저장소를 **private**로 바꾼다. 되돌릴 수 있고 공개 노출(ID와 `Task.md`의 운영 수치)을 즉시 멈춘다. 아래 모든 선택지의 첫 단계다.
2. **재작성은 "새 저장소 방식(방식 B)"을 권한다.** 기존 저장소를 건드리지 않고(강제 푸시 없음) 정리한 이력을 새 저장소에 올린다. 옛 저장소는 private 보관본으로 남겨 되돌릴 수 있게 한다.
3. 삭제는 **마지막 단계에서, 안정 운영을 확인한 뒤, 명시 승인으로만** 한다.

## 문서

- [요구사항](./requirements.md): HC-01~10
- [설계](./design.md): 방식 비교, 도구, 명령, 검증 방법
- [계획](./plan.md): 세션 1~3의 작업·게이트·중단 조건·롤백
- [결정·미확정](./decisions.md): 사용자 결정이 필요한 항목
- [검증](./validation.md): 게이트별 확인표
- [인수인계](./HANDOFF.md): 세션 시작 프롬프트와 상태 기록 양식

## 범위 밖

광고 그룹 교체 실행(결정만 다룬다), 앱 코드 변경, 출시·검수, Toss 콘솔 설정 변경.
