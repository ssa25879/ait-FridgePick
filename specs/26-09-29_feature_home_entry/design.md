# 디자인: 홈 진입 화면

## 디자인 기준

Toss Design System Mobile(TDS Mobile)을 시각·컴포넌트 기준으로 사용한다. 버튼·타이포그래피·여백·색상은 TDS가 제공하는 패턴과 토큰을 우선하고, 같은 역할의 자체 컴포넌트와 임의 색상 규칙을 추가하지 않는다.

TDS Mobile 공식 시작 문서는 `@toss/tds-mobile`과 `@toss/tds-mobile-ait` 패키지, `TDSMobileAITProvider` 구성을 안내한다. 컴포넌트 API와 버전은 실제 설치 시점의 공식 문서를 다시 확인한다.

## 화면 구성

### 홈

1. 위쪽: 냉털픽 서비스명 또는 TDS `Top` 계열 제목 영역
2. 본문: “냉장고 속 재료로 오늘 메뉴를 골라보세요” 제목과 한 줄 설명
3. 주요 동작: 화면 아래쪽에서 쉽게 누를 수 있는 TDS 강조 버튼 `재료 고르기`

본문보다 장식이 앞서지 않도록 텍스트와 버튼 중심으로 구성한다. 별도 사진, 카드 묶음, 광고 배너는 이번 화면에 넣지 않는다.

### 재료 선택 안내 화면

- 제목과 재료 선택 기능이 다음 단계에서 제공된다는 짧은 안내를 보여준다.
- TDS 보조 버튼 또는 뒤로 가기 동작으로 홈에 돌아온다.
- 재료 칩, 카테고리, 추천 버튼은 아직 표시하지 않는다.

## 반응형·접근성

- 세로 화면과 320 CSS px 이상 폭에서 가로 스크롤이 생기지 않게 한다.
- TDS의 기본 타이포그래피·간격·버튼 높이·포커스 표현을 따른다.
- 버튼 텍스트는 동작을 직접 설명한다.
- TDS 컴포넌트의 기본 키보드 동작과 접근성 이름을 유지한다.
- 전역 `#root` 여백이나 샘플 스타일이 TDS 간격을 덮지 않는지 확인한다.

## 기술 적용 원칙

- TDS Mobile의 버튼·상단/본문 타이포그래피 컴포넌트를 사용한다. 상세 컴포넌트 선택은 설치된 버전 문서를 따른다.
- TDS 문서가 요구하는 앱 루트 Provider를 구성한다.
- 페이지 전환은 기존 앱 규모에 맞춰 단순한 로컬 상태로 관리하고 라우터 라이브러리는 추가하지 않는다.
- 광고 샘플 파일은 제품 홈에 연결하지 않는다. 해당 파일 삭제는 별도 요청이 없는 한 범위에 넣지 않는다.
- React 버전과 TDS 패키지 호환성은 코드를 바꾸기 전에 확인한다.

## 공식 참고

- [TDS Mobile 시작하기](https://tossmini-docs.toss.im/tds-mobile/start/)
- [TDS Mobile Top](https://tossmini-docs.toss.im/tds-mobile/components/top/)
- [앱인토스 디자인 리소스와 TDS 안내](https://developers-apps-in-toss.toss.im/design/components.md)
- [TDS Mobile UI Kit 라이선스 안내](https://developers-apps-in-toss.toss.im/design/prepare/figma-ui-license.md)
