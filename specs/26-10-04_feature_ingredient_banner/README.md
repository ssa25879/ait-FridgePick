# 재료 선택 화면의 스크롤 조건부 배너

- 작성일: 2026-10-04
- 로드맵: 11단계 RCR-05·06·09 (10단계 홈 전용 배치 대체)
- 구현 브랜치/커밋: feature/user-state-persistence / 3a9972c
- 문서 보완 브랜치: feature/release-validation-specs (c4f44f7에서 분기)
- 상태: 코드·자동·브라우저 확인 완료, 실기기·검수 대기

사용자 결정에 따라 홈 배너를 재료 선택 화면의 메뉴 뽑기 아래로 옮겼다. 광고를 제외한 서비스 콘텐츠가 화면 높이를 넘을 때만 부착하고 크기 변화에 따라 해제/재부착한다. 광고용 콘텐츠 확장·다른 포맷·콘솔 업로드·출시·원격 이력 변경은 범위 밖이다.

| 문서 | 역할 |
| --- | --- |
| [requirements.md](./requirements.md) | IB-01~08 요구사항과 완료 조건 |
| [design.md](./design.md) | 실제 구성·높이 판정·SDK 수명 |
| [plan.md](./plan.md) | 구현 상태·후속 검증 순서 |
| [decisions.md](./decisions.md) | 사용자 결정·대안·미확정 사항 |
| [validation.md](./validation.md) | ID별 증거와 기기 미완료 항목 |

상위: [출시 준비](../26-10-02_feature_release_checklist_readiness/README.md). 과거 [홈 배너 명세](../26-10-02_feature_home_banner_ad/README.md)는 당시 기록으로 유지한다. 문서 구조 보완을 새로운 기능 구현이나 기기 검증 통과로 표시하지 않는다.
