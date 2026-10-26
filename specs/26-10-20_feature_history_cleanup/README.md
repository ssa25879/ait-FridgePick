# 이력 정리 계획 (공개 저장소의 광고 그룹 ID 제거)

공개 GitHub 저장소의 옛 커밋에 실제 광고 그룹 ID가 남아 있었다. 이를 **최대한 안전하게** 정리하는 계획이며 세 세션에 나눠 진행했다. 아래 "현황"과 "이 문서가 권하는 방향"은 계획 시점의 기록이다.

- 브랜치: `feature/history-cleanup-plan`(계획), `feature/history-cleanup-execute`(세션 3, PR #1로 master에 병합)
- 상태(2026-10-26 갱신): **방식 B로 실행해 게이트 G1·G2·G3를 통과했다.** 남은 일은 안정 운영 확인과 선택 사항인 옛 저장소 삭제 게이트다. 자세한 판정은 [검증](./validation.md)에 있다.
- 비밀 취급: 이 문서와 저장소의 어떤 파일에도 ID 값을 쓰지 않는다. 문서에서는 `<AD_GROUP_ID>`로 표기하고 실제 값은 저장소 밖 파일에만 둔다.

## 실행 결과 (2026-10-21 기준)

| 항목 | 결과 |
| --- | --- |
| 옛 저장소 | `ssa25879/ait-FridgePick-private`로 이름을 바꾸고 private로 보관했다. 삭제하지 않았다 |
| 새 저장소 | `ssa25879/ait-FridgePick`, 정리한 이력을 강제 푸시 없이 올렸다. 2026-10-21 public으로 전환했다 |
| ID 검색 | 새 저장소 전체 이력에서 0건(public 전환 전과 PR #1 병합 후에 다시 검색) |
| 해시 대응 | 옛 → 새 해시는 [`commit-map.txt`](./commit-map.txt)에 있다. 문서의 해시는 치환하지 않았다 |
| 재발 방지 | `scripts/checkSecrets.mjs`, `.githooks/pre-commit`, CI `check:secrets` 단계, `AGENTS.md` 비밀값 규칙 |
| 백업 | 저장소 밖 `D:\work\history-cleanup\backup\`과 구글 드라이브 사본(크기만 일치, 해시 미확인) |
| 작업 위치 | `D:\work\ait-FridgePick-new`(새 저장소 복제본). 옛 폴더 `D:\work\ait-FridgePick`은 origin을 제거하고 보관한다 |
| CI | 새 저장소의 `Validate` 워크플로 전체 Success(2026-10-26 확인) |
| 광고 그룹 | 유지. 2026-10-26 지면 기준 어뷰징 수준 `NONE`, 제한 없음 |
| 남은 일 | V3 해시 비교, 어뷰징 수준 주기 확인, 안정 운영 확인(2026-11-04 이후), 폴더 이름 전환, 삭제 게이트 |

## 현황 (2026-10-20 실측, 계획 시점)

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
