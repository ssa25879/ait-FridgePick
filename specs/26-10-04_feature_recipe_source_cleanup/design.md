# 설계

RSC-01: src/data/recipes.ts의 SOURCED_REPLACEMENT_RECIPES가 공식 ID20개를 참조한다. RECIPES는 대체 목록과 나머지 공공 카탈로그를 중복 없이 합친다. 데이터 원문은 생성 파일 publicRecipes.ts를 재사용하며 수기로 수정하지 않는다.

RSC-02: ResultPage의 기존 재료와 분량·출처·미지원 필수 재료 표시를 사용한다. 모든 재료에 정확한 g가 있다는 의미는 아니며 원문의 약간/적당량·개·컵 등도 그대로 둔다. 기본 매칭률60%와 난이도 규칙은 유지한다.

RSC-03: 카탈로그 무결성 검증은 실제 데이터로 수행한다. App 상태/탐색 테스트는 안정적인 합성 fixture로 분리하며 ResultPage.catalog.test.tsx는 실제 카탈로그와 getRecipeCandidates를 연결해 검증한다.

조리 단계의 원문 앞 번호(예:1.)는 화면의 ol 번호와 중복되지 않도록 렌더링에서만 제거한다. 생성 데이터와 조리 문장·수치·분량은 그대로 유지한다.
