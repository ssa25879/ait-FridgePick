# 재료 카탈로그와 선택

- 상태: 구현 및 320 CSS px 화면 확인 완료
- 작성일: 2026-09-29
- 개발 브랜치: `feature/ingredient-catalog-selection`
- 로드맵: [`specs/roadmap.md`](../roadmap.md) 2단계

## 목표

사용자가 카테고리별 로컬 재료 목록을 보고 여러 재료를 선택·해제할 수 있게 한다. 선택된 재료와 개수를 확인하고 홈으로 이동했다가 돌아와도 선택을 유지한다.

## 문서

- [`requirements.md`](./requirements.md): 기능 범위, 재료 분류, 완료 조건
- [`design.md`](./design.md): 화면 구성, 상태 소유, 데이터 흐름
- [`plan.md`](./plan.md): 구현 순서와 변경 파일 후보
- [`validation.md`](./validation.md): 구현 후 수동·빌드 검증 절차
- [`decisions.md`](./decisions.md): ID, 카테고리, 상태 범위에 대한 결정

## 현재 상태와 의존성

현재 앱은 홈과 카테고리별 재료 선택 화면을 제공한다. 로컬 28개 카탈로그, 다중 선택·해제, 선택 요약, 홈 왕복 상태 유지를 구현했다. 브라우저에서 카테고리·선택·새로고침 초기화와 키보드 입력을 확인했고, AIT DevTools 사용자 지정 320×640 CSS px 뷰포트에서도 재료 선택 화면의 잘림·겹침이 없는지 확인했다. 레시피 데이터·메뉴 추천·결과 화면은 구현하지 않았다.

로드맵 1단계의 결과 화면 상태와 결과에서 홈으로 돌아오는 항목은 결과 흐름이 생기는 3~5단계 이후에 마무리한다. 이번 범위에서 결과 화면용 임시 버튼이나 가짜 추천 흐름을 추가하지 않는다.

현재 의존성은 `package.json`을 기준으로 React/React DOM `^18.3.1`, TDS Mobile `^2.5.1`이다. `specs/tech.md`의 React 19 표기는 이전 상태이므로 이 계획은 설치·선언된 패키지 정보를 우선한다.

## 기준 자료

- [로드맵](../roadmap.md)
- [프로젝트 목표](../mission.md)
- [프로젝트 기획서](../NaengteolPick_React_Project_Plan.md)
- [기술 스택](../tech.md)
- [홈 진입 화면 계획](../26-09-29_feature_home_entry/README.md)
