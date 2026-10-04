<!-- ait:design-guide v1 -->
앱인토스 미니앱 프로젝트다. 하드 규칙 위반은 `/ait:design`이 자동으로 고친다.

하드 규칙:
- 텍스트 11px 이하 금지, 본문은 15px 이상
- 모든 이모지는 Tossface로 렌더(폰트 스택 배선 또는 `.tf`)
- 한글은 `word-break: keep-all`
- 터치 타깃 44px 이상
- 하단 CTA는 safe area 34px
- 광고가 첫 화면 콘텐츠(ATF)를 가리지 않음
- 다크패턴(가짜 버튼·막다른 화면) 금지
- 꺾쇠·화살표는 텍스트 글리프 대신 SVG(currentColor)
- 상단 네비는 직접 그리지 않음(플랫폼 자동 배치)
- font-weight는 400~700만 사용

토큰 사용:
- 텍스트 색: `--color-text-strong/default/subtle/hint/disabled/inverse`
- 배경 색: `--color-bg`, `--color-bg-canvas`
- 상태 색: `--color-danger`/`--color-success`/`--color-warning`
- 브랜드 색: `--brand-primary`(중립 기본값, 바꿔도 됨)
- 타이포: `--font-size-*`/`--font-weight-*` 6단계(display~caption)
- 간격: `--space-1`~`--space-6`(4/8/12/16/24/32px)
- 오버레이: `--dim`(#000 대신)
- 인라인 style 객체에서도 `var()`가 그대로 동작한다

이 프로젝트는 TDS 기반이다 — 색·크기·아이콘은 TDS 컴포넌트가 주는 것을 쓴다(위 토큰 목록과 아이콘 파일 경로는 이 프로젝트에 없다).
1층 하드 규칙은 플랫폼 제약이라 그대로 적용된다 — 꺾쇠·닫기·검색은 TDS 아이콘 컴포넌트로 충족하고, 텍스트 글리프로 대체하는 것은 여전히 금지다.

전문(3층 전체 규칙): `docs/design-guide.md`.
판단이 애매하면 화면을 그리기 전에 먼저 읽는다.

다음 단계:
`/ait:design`   말로: "화면이 좀 구려 보여. 예쁘게 고쳐줘."
`/ait:design`   말로: "등록용 로고랑 스크린샷 만들어줘"
<!-- /ait:design-guide -->

## 로드맵·문서·변경 이력 작업

사용자는 후속 작업에서 `codex-skills:roadmap-feature-specs`와
`codex-skills:recording-change-history`를 자주 적용하도록 요청했다.

- 다음 로드맵 기능의 범위·브랜치·개발 문서를 준비하거나 기존 specs를 보완할 때
  `roadmap-feature-specs`를 읽고 사용한다. 같은 목적의 문서와 브랜치를 먼저 찾아
  재사용하고 요구사항 ID→설계→작업→검증 결과를 연결한다.
- 지속 파일을 생성·수정·삭제할 때 `recording-change-history`를 적용한다.
  Git 변경 이력은 Files, Change, Before, After, Verification 순서로 기록하고,
  커밋 권한과 사용자 변경사항 보호 규칙을 따른다.
- 스킬 위치는 현재 세션의 스킬 목록에서 찾는다. 설치 버전이나 다른 PC의
  절대 경로를 저장소 실행 조건으로 고정하지 않는다.
- 문서 작성, 코드 구현, 자동 검증, 브라우저 모의 검증, 토스 실기기 검증,
  콘솔 검수·출시를 구분한다. 실행하지 않은 항목은 완료로 표시하지 않는다.
- 사용자 선택에 따라 별도 `D:\Codex` 작업 로그는 생략한다. 후속 상태는
  `Task.md`와 기능의 `validation.md`에 기록한다.
- 단순 조회·설명처럼 파일 변경이나 로드맵 준비가 없는 요청에 두 스킬의
  문서·커밋 절차를 불필요하게 적용하지 않는다.
