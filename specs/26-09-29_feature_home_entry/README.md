# 냉털픽 홈 진입 화면

- 상태: 개발 전 계획
- 작성일: 2026-09-29
- 로드맵: [`specs/roadmap.md`](../roadmap.md) 0단계 선행 확인 후 1단계 화면 뼈대의 첫 사용자 화면

## 목표

현재 create-ait-app 샘플 첫 화면을 냉털픽 소개 화면으로 바꾸고, 사용자가 재료 선택 흐름으로 들어갈 수 있게 한다. 화면과 공통 UI는 Toss Design System(TDS) Mobile을 기본으로 설계한다.

## 문서

- [`requirements.md`](./requirements.md): 기능 범위와 완료 조건
- [`design.md`](./design.md): 화면 구성과 TDS 사용 지침
- [`plan.md`](./plan.md): 구현 전제와 작은 개발 작업
- [`validation.md`](./validation.md): 기능·시각·빌드 검증 절차
- [`decisions.md`](./decisions.md): React/TDS 호환성 판단이 필요한 항목

## 현재 코드와 선행 확인

현재 앱은 `src/App.tsx`에서 Apps in Toss 샘플 소개와 인앱 광고 테스트 진입점을 보여준다. 재료 선택 기능은 아직 없다. 먼저 로드맵의 개발 서버·린트·빌드 기준 확인을 하고, 이 기능에서는 홈 화면과 재료 선택 안내용 빈 화면까지만 만든다.

Toss의 공식 `create-ait-app` 안내에 따르면 TDS 프로젝트는 React 18을 요구한다. 이 저장소는 React 19를 선언하고 있으므로, TDS 컴포넌트를 연결하기 전에 [`decisions.md`](./decisions.md)의 호환성 확인과 버전 선택을 끝낸다. 이 문서 작성 과정에서는 코드와 의존성을 변경하지 않았다.

## 기준 자료

- [Toss Design System Mobile 시작하기](https://tossmini-docs.toss.im/tds-mobile/start/)
- [Toss Design System Mobile Top 컴포넌트](https://tossmini-docs.toss.im/tds-mobile/components/top/)
- [Apps in Toss `create-ait-app`의 TDS 안내](https://github.com/toss/create-ait-app/blob/main/README.md)
- [Apps in Toss 디자인 및 TDS 자료 안내](https://developers-apps-in-toss.toss.im/design/components.md)
