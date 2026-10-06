# 결정 기록: 재료 화면 조건부 배너

| 결정 | 근거 | 영향/미확정 |
| --- | --- | --- |
| 홈→재료 화면 | 사용자가 “재료 선택 화면 하단으로 이동하고 스크롤 조건 적용”을 직접 선택 | 이전 홈 전용 결정 대체. 검수 최종 적합성은 미확인 |
| 광고 제외 높이 측정 | 광고가 자신의 높이로 스크롤 조건을 만들면 실제 콘텐츠 기준이 무너짐 | 별도 wrapper 사용, 빈 콘텐츠 추가 안 함 |
| CTA 아래32px | 기존12px보다 조작/광고 구분 여유 확보 | 공식 허용 최소 거리로 단정하지 않음, 실기기 오클릭 QA 필요 |
| 콘텐츠/viewport 변화 관찰 | 카테고리·선택 요약·화면 크기가 변함 | observer 콜백과 미지원 경로의 직접 회귀 테스트는 아직 없음 |
| 기존 SDK/ID 분기 유지 | 배치 변경의 최소 범위 | 실제 광고 ID 보호 입력·기존 이력은 별도 RCR-14 |

공식 자료: [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame), [배너 SSP 정책](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa/web-banner#policy). 2026-10-04 이전 작업에서 확인한 근거이며 이번 문서 정리에서 외부 정책을 새로 재조회하지 않았다.
