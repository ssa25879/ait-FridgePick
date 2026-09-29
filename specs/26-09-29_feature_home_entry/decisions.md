# 결정 사항: TDS 연결 방식

## 검토 당시 사실

- 변경 전 프로젝트는 React `^19.2.8`, React DOM `^19.2.8`을 선언했다.
- Apps in Toss 공식 `create-ait-app` README는 TDS 프로젝트를 React 18이 필요한 전용 구성으로 설명한다.
- TDS Mobile 시작 문서는 `@toss/tds-mobile`, `@toss/tds-mobile-ait`, `TDSMobileAITProvider` 구성을 안내한다.

참고: [공식 create-ait-app README](https://github.com/toss/create-ait-app/blob/main/README.md), [TDS Mobile 시작 문서](https://tossmini-docs.toss.im/tds-mobile/start/)

## 결정 (2026-09-29)

TDS Mobile 공식 컴포넌트를 사용하고 React 및 React DOM, 타입 패키지를 React 18 지원 범위로 맞춘다. `@toss/tds-mobile@2.5.1`과 `@toss/tds-mobile-ait@2.5.1`의 peer dependency는 React/React DOM `^18`까지이며 React 19를 허용하지 않는다. `@toss/tds-mobile-ait`은 `@apps-in-toss/web-framework >=0.0.31`을 요구하므로 현재 `3.2.0`과 호환된다. 공식 Apps in Toss TDS 생성 안내도 React 18을 요구한다.

AIT 프레임워크는 React peer dependency를 별도로 제한하지 않는다. 실제 React 18 조합의 성공 조건은 프로젝트의 lint/build와 화면 동작 확인으로 검증한다.

## 근거

- [TDS Mobile 시작 문서](https://tossmini-docs.toss.im/tds-mobile/start/)
- [Apps in Toss create-ait-app 공식 README](https://github.com/toss/create-ait-app/blob/main/README.md)
- 2026-09-29 npm registry peer dependency 확인: `@toss/tds-mobile@2.5.1`, `@toss/tds-mobile-ait@2.5.1`, `@apps-in-toss/web-framework@3.2.0`.
