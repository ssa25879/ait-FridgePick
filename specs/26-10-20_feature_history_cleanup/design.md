# 설계

## 방식 비교

| 방식 | 내용 | 장점 | 위험·단점 |
| --- | --- | --- | --- |
| **A. 제자리 재작성** | 기존 저장소의 이력을 치환하고 모든 브랜치를 강제 푸시 | URL·설정 유지 | 원격 13개 브랜치 덮어쓰기, 실수 시 원격 이력 손실, 옛 커밋이 GitHub에 한동안 남음, 다른 복제본·작업 트리와 충돌 |
| **B. 새 저장소 (권장)** | 정리본을 새 저장소에 올리고 옛 저장소는 private 보관본으로 둠 | 기존 저장소 불변(강제 푸시 없음), 언제든 롤백, 공개 노출 즉시 종료, 옛 커밋 URL이 닫힘 | 저장소가 바뀜(CI·URL 재설정), 로컬 작업 트리 재구성 |
| **C. 재작성 없이 private만** | 저장소를 private로 바꾸고 광고 그룹은 필요 시 교체 | 가장 간단, 위험 최소 | 이력에 ID가 남음(비공개라 노출은 막힘), 나중에 다시 공개하면 문제 |

기존 저장소의 처분은 **private + 이름 변경(보관)** 이 먼저이고 **삭제는 가장 나중**이다. 삭제는 되돌릴 수 없는 작업이라 새 저장소와 외부 백업이 검증되고 일정 기간 안정 운영된 뒤에만 한다.

## 도구

- **권장: `git-filter-repo`** (Python 3.12 설치됨, `pip install git-filter-repo`). 모든 참조를 한 번에 다시 쓰고 옛 → 새 커밋 대응표(`commit-map`)와 참조 대응표(`ref-map`)를 남기며, 치환 대상을 파일 내용의 정확 문자열로 한정할 수 있다. 설치는 환경 변경이므로 사용자 승인이 필요하다.
- 대안: `git filter-branch --index-filter`(내장, 느리고 deprecated, 이 저장소 크기에서는 가능). filter-repo를 설치하지 않을 때만 쓴다.
- 검사 도구(gitleaks 등)는 없으므로 정확 문자열 검색과 일반 패턴 검색을 직접 쓴다.

## 작업 위치와 비밀 파일

모든 산출물은 **저장소 밖** `D:\work\history-cleanup\` 에 둔다(백업, 연습 복제본, 대응표, 로그, 상태). 치환 규칙 파일(`replace-text.txt`, 한 줄: `<실제 ID>==><AD_GROUP_ID>`)은 `D:\work\local-config\history-cleanup\` 에 두며 ID가 들어 있으므로 커밋하지 않고 작업 후 삭제하거나 `local-config`에서만 보관한다.

## 핵심 명령 (참고, 실행은 세션 계획에서)

```
# 백업: 작업 저장소의 로컬 전용 브랜치·스태시·원격 추적 참조까지 모두 복제
git clone --mirror D:\work\ait-FridgePick D:\work\history-cleanup\backup\ait-FridgePick.mirror.git
git -C D:\work\ait-FridgePick bundle create D:\work\history-cleanup\backup\all-refs.bundle --all
git bundle verify D:\work\history-cleanup\backup\all-refs.bundle
git -C D:\work\ait-FridgePick stash show -p stash@{0} > D:\work\history-cleanup\backup\stash0.patch

# 연습: 백업의 복제본에서만 치환
git clone --mirror D:\work\history-cleanup\backup\ait-FridgePick.mirror.git D:\work\history-cleanup\rehearsal.git
git -C D:\work\history-cleanup\rehearsal.git filter-repo --replace-text D:\work\local-config\history-cleanup\replace-text.txt --force

# 검증(HC-02): 정리본의 모든 커밋에서 정확 문자열 0건
git -C rehearsal.git log --all -S"<실제 ID>" --oneline          # 출력 0줄
git -C rehearsal.git rev-list --all | while read c; do git -C rehearsal.git grep -q "<실제 ID>" "$c" && echo "$c"; done   # 출력 0줄
```

`git filter-repo`는 `origin`을 제거하므로 정리본에서 실수로 기존 저장소로 푸시할 수 없다. 정리본에는 `refs/remotes/*`와 `refs/stash`가 남을 수 있어 **새 저장소로는 `refs/heads/*`만** 푸시한다(`git push <새 URL> "refs/heads/*:refs/heads/*"`).

## 검증 방법 (HC-03)

`ref-map`/`commit-map`으로 옛 커밋과 새 커밋을 짝지어 `git diff --numstat 옛 새`를 비교한다. 차이가 있는 파일은 ID가 있던 6개 파일뿐이어야 하고, 바뀐 줄은 ID를 `<AD_GROUP_ID>`로 치환한 것뿐이어야 한다. 이를 자동으로 확인하는 스크립트를 연습 단계에서 만든다(저장소 밖).

## 새 저장소로 전환할 때 바뀌는 것

| 항목 | 영향 | 처리 |
| --- | --- | --- |
| 저장소 URL | 새 저장소 이름이 기존과 같으면 유지, 다르면 변경 | 결정 3번 |
| CI(`.github/workflows/ci.yml`) | 새 저장소에서 Actions 활성화 필요 | 세션 2에서 확인 |
| 로컬 작업 트리 | 현재 `D:\work\ait-FridgePick`는 옛 `.git` | 폴더 이름을 바꿔 보관하고 새로 복제 |
| codex 작업 트리 2곳, 임시 대시보드 1곳 | 옛 `.git`에 붙어 있음 | 옛 폴더에 그대로 두고 처리는 사용자 결정(결정 6번) |
| 로컬 전용 브랜치 3개, 스태시 | 새 복제에는 없음 | 정리본에서 옮기거나 백업에만 보관(결정 6번) |
| 문서의 커밋 해시 | 모두 바뀜 | 세션 3에서 대응표로 갱신(HC-08) |
| 콘솔 번들 메모의 소스 해시 | 수정 불가 | 대응표를 문서에 보관 |

## 광고 그룹 ID 자체

ID는 출시 번들에도 들어 있어 이력 정리로 노출이 사라지지 않는다. 이력 정리는 "공개 저장소에서 쉽게 보이는 상태"를 없애는 조치이고, 실제 차단은 광고 그룹을 새로 만들어 교체하는 것이다. 교체는 별도 작업(새 지면 등록 약 2시간 + 출시 번들 재생성 + 검수)이며 결정 5번에서 정한다.
