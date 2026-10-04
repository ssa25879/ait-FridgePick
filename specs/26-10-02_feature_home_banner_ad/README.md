# 홈 하단 배너 광고

> 2026-10-04 변경: 사용자가 재료 선택 화면 하단으로 이동하고 스크롤 조건을 적용하도록 선택했다. 아래 홈 전용 설명은 당시 설계 기록이다. 현재 배치와 검증은 [재료 화면 배너 명세](../26-10-04_feature_ingredient_banner/README.md)를 따른다.


- 상태: 테스트·출시 ID 분리 구현, 자동 검증·테스트 AIT 빌드 완료, 모바일/콘솔 검증 대기
- 작성일: 2026-10-02
- 개발 브랜치: codex/home-banner-ad
- 로드맵: [specs/roadmap.md](../roadmap.md) 10단계
- 대상: 앱인토스 WebView 미니앱 (ait-fridgepick)

## 목표

인앱 배너 광고를 홈 화면 하단에만 표시한다. 재료 선택과 추천 결과의 핵심 흐름은 가리지 않으며, 다른 화면에는 광고 슬롯을 만들지 않는다.

## 범위

- 앱 최상위에서 배너 SDK를 한 번 초기화하고 지원 여부를 확인한다.
- 홈 화면에만 공식 배너 SDK 슬롯을 부착하고 화면을 떠날 때 제거한다.
- 전체 너비의 표준 광고 컨테이너를 두고, 홈 버튼 및 하단 safe area와 겹치지 않게 배치한다.
- 개발·테스트 빌드는 공식 테스트 광고 ID를 사용한다. 출시 모드 빌드에는 활성 발급된 실제 그룹 ID를 사용한다.
- UI, SDK 생명주기, 모바일 레이아웃, 앱인토스 빌드 검증 방법을 기록한다.

## 콘솔 상태와 개발 범위

2026-10-02 콘솔 조회에서 미니앱 상태는 PREPARE였고, “배너 광고 1차” 지면은 REGISTERING 상태였으며 groupId는 null이었다. 이후 재조회에서 지면은 ENABLED, 그룹 ID는 `[실제 광고 ID 생략]`로 확인됐다. 코드는 Vite `release` 모드에서만 이 ID를 선택하며 기본 개발·테스트 빌드는 공식 테스트 ID를 유지한다.

앱인토스 개발자 문서는 테스트에 ait-ad-test-banner-id를 사용하도록 안내한다. 샌드박스에서는 배너 광고가 지원되지 않으므로 실제 표시 확인은 콘솔 QR을 통한 토스 앱 테스트가 필요하다. 테스트 중에는 실제 그룹 ID를 사용하지 않는다. `npm run build:release`는 활성 그룹 ID를 출시 모드 산출물에 포함한다. 출시 모드 빌드의 콘솔 검수·출시 및 토스 앱 광고 노출 확인은 별도 단계다.

## 문서

- [requirements.md](./requirements.md): 범위, 요구사항과 완료 조건
- [design.md](./design.md): 초기화, 화면 부착, 정리와 레이아웃 설계
- [decisions.md](./decisions.md): 테스트 ID, 광고 위치, 선행 조건 결정
- [validation.md](./validation.md): 구현 후 검증 시나리오와 현재 수행 상태

## 공식 자료

- [인앱 광고 - 배너 광고(WebView)](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa/web-banner)
- [인앱 광고 소개](https://developers-apps-in-toss.toss.im/guide/monetization/in-app-ad)
