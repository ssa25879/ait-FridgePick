# 추천 필터와 레시피 출처 각주

- 상태: 구현·검증 완료, `a7256d7`로 master 반영됨
- 작성일: 2026-10-02
- 개발 브랜치: `feature/recommendation-filters`
- 로드맵: [`specs/roadmap.md`](../roadmap.md) 9단계
- 대상: 앱인토스 WebView 미니앱 (`ait-fridgepick`)

## 목표

재료 추천 전에 사용자가 필수 재료 매칭 기준(60~100%)과 난이도를 선택하게 한다. CSV에는 난이도 값이 없으므로 조리 단계 수와 전체 필수 재료 수로 전 레시피의 난이도를 계산한다. 결과 화면의 제공기관·데이터셋·원본 ID는 출처 각주로 작게 표시한다.

## 결정된 기본값

- 매칭 기준: 60%, 60~100% 범위, 5% 단위
- 난이도: 전체
- `쉬움`: 조리 단계 ≤6, 전체 필수 재료 ≤6
- `보통`: 쉬움 조건은 아니며 조리 단계 ≤10, 전체 필수 재료 ≤10
- `어려움`: 조리 단계 또는 전체 필수 재료가 10 초과
- 전체 필수 재료 수는 `requiredIngredients`와 `unmappedRequiredIngredients`의 합이다. 선택 재료는 난이도와 매칭률에서 제외한다.

## 문서

- [`requirements.md`](./requirements.md): 동작 요구사항과 완료 조건
- [`design.md`](./design.md): 상태·계산·화면 설계
- [`decisions.md`](./decisions.md): 데이터 한계와 난이도 경계 결정
- [`plan.md`](./plan.md): 실행 순서 및 진행 체크리스트
- [`validation.md`](./validation.md): 기준선과 기능별 검증 결과
