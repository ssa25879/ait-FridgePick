# 미결정 사항: TDS 연결 방식

## 현재 사실

- 프로젝트는 React `^19.2.8`, React DOM `^19.2.8`을 선언한다.
- Apps in Toss 공식 `create-ait-app` README는 TDS 프로젝트를 React 18이 필요한 전용 구성으로 설명한다.
- TDS Mobile 시작 문서는 `@toss/tds-mobile`, `@toss/tds-mobile-ait`, `TDSMobileAITProvider` 구성을 안내한다.

참고: [공식 create-ait-app README](https://github.com/toss/create-ait-app/blob/main/README.md), [TDS Mobile 시작 문서](https://tossmini-docs.toss.im/tds-mobile/start/)

## 권장안

Toss 제공 UI를 기본으로 삼기 위해 TDS Mobile 컴포넌트를 직접 사용한다. 단, 이를 위해 React 18로 버전을 맞춰야 하는지와 현재 `@apps-in-toss/web-framework` 버전이 해당 조합을 지원하는지 먼저 검증한다. 확인 후 필요한 의존성 변경을 별도 개발 단계에서 진행한다.

## 구현 전 확인 질문

공식 패키지 사용에 React 18 전환이 필요하다고 확인되면 다음 중 하나를 결정한다.

1. **TDS 컴포넌트 사용을 우선:** AIT 빌드 호환성을 확인한 뒤 React 18 조합으로 변경한다. (권장)
2. **React 19 유지:** TDS Mobile 공식 시각 리소스를 참고하고, 공식 컴포넌트 지원이 확인될 때까지 패키지 도입을 보류한다.

현재 프로젝트 의존성을 변경하지 않았으며, 이 항목은 구현 시작 전 열려 있다.
