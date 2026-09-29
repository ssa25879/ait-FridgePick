# 레시피 데이터

- 상태: 구현 및 자동 검증 완료
- 작성일: 2026-09-29
- 개발 브랜치: `feature/recipe-data`
- 로드맵: [`specs/roadmap.md`](../roadmap.md) 3단계

## 목표

로드맵 4단계 메뉴 추천 계산이 사용할 로컬 레시피 카탈로그와 타입을 준비한다. 이번 단계는 데이터와 무결성 검증에 한정하며 추천 계산이나 화면은 추가하지 않는다.

## 문서

- [`requirements.md`](./requirements.md): 데이터 범위와 완료 조건
- [`design.md`](./design.md): 타입, 카탈로그 구성, ID 검증 방식
- [`plan.md`](./plan.md): 구현 순서와 변경 파일
- [`validation.md`](./validation.md): 자동·정적 검증 결과
- [`decisions.md`](./decisions.md): 데이터 규모와 모델 결정

## 현재 상태와 의존성

기존 `src/data/ingredients.ts`의 28개 재료 ID를 참조하는 로컬 레시피 20개를 `src/data/recipes.ts`에 작성했다. 모든 항목은 필수 재료 3~6개, 조리 단계 3개, `easy` 또는 `normal` 난이도를 갖는다. Vitest로 레시피 ID 중복, 필수 재료 수, 재료 ID 참조, 선택 재료 중복, 단계 문구와 난이도를 확인한다.

레시피 후보 계산, 매칭 점수, 결과 화면과 사용자 흐름 연결은 다음 로드맵 단계에서 진행한다.

## 기준 자료

- [로드맵](../roadmap.md)
- [프로젝트 목표](../mission.md)
- [프로젝트 기획서](../NaengteolPick_React_Project_Plan.md)
- [기술 스택](../tech.md)
- [재료 카탈로그와 선택](../26-09-29_feature_ingredient_catalog_selection/README.md)
