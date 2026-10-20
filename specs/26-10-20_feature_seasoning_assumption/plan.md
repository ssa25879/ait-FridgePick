# 계획

체크 표시는 실제로 수행·검증한 항목에만 한다. 구현은 테스트를 먼저 쓴다(실패 확인 후 구현).

## 선행

- [x] 가정 범위 결정: 기본 양념 9개(2026-10-20 사용자). 그룹 라벨은 유지([결정·미확정](./decisions.md) 2번).

## 작업

- [x] TASK-01 `assumedSeasonings.ts` 테스트 작성 후 구현(9개 ID가 모두 양념 카테고리 재료임을 확인). (SAS-08)
- [x] TASK-02 `getRecipeCandidates`의 부족 재료 분리 테스트 작성(실패 확인) 후 구현. 후보 ID 집합·`matchRate` 불변 테스트 포함. (SAS-01, 02, 05)
- [x] TASK-03 `isRecipeReady`·`getMissingIngredientCount` 테스트 추가. (SAS-01, 03, 06)
- [x] TASK-04 기존 테스트의 기대값 갱신과 이유 기록. (SAS-01)
- [x] TASK-05 `ResultPage`에 "양념 확인" 구역·상태 문구·"더 준비할 재료" 변경, 테스트 포함. (SAS-04, 05)
- [x] TASK-06 `IngredientPage` 양념 카테고리 안내 문구와 테스트. (SAS-07)
- [x] TASK-07 합성 냉장고 전후 측정을 임시 테스트로 재실행해 README 표와 비교한다. 측정 파일은 저장소에 남기지 않는다. (SAS-02)
- [x] TASK-08 `tsc -b`, `npm test`, `npm run test:scripts`, lint, 기본 빌드, 320×640 화면 확인.
- [ ] TASK-09 테스트 번들 업로드·실기기 확인은 사용자 승인 후. 실제 사용에서 준비 완료 메뉴가 나오는지 사용자가 확인한다.
- [ ] TASK-10 `Task.md`와 `validation.md`에 결과 기록.

## 승인 지점

번들 업로드, 테스트 푸시, 검수 제출, 출시는 각각 사용자 승인이 필요하다. 이전 승인은 이어지지 않는다.

## 후속(이번 범위 밖)

- 미지원 필수 재료 매핑: 상위 100개를 해소하면 준비 가능 레시피가 239 → 401개로 늘어난다(합성 측정). 별도 명세로 진행한다.
- 레시피 데이터 확장과 데이터 소스: [레시피 DB·API 탐색](../26-10-20_feature_recipe_db_api_research/README.md).
