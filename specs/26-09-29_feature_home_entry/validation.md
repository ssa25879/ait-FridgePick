# 검증 계획: 홈 진입 화면

이 문서는 구현 후 수행할 확인 절차다. 현재 기능 구현이나 검증을 완료했다는 뜻은 아니다. 현재 프로젝트에는 별도 테스트 러너 스크립트가 없으므로 수동 화면 확인, 기존 lint/build 명령을 기준으로 한다.

## 사전 확인

| 단계 | 명령/절차 | 기대 결과 |
| --- | --- | --- |
| 개발 서버 | `npm run dev` | 현재 앱이 브라우저에서 열린다. |
| 린트 기준 | `npm run lint` | 오류·경고를 기록해 기능 변경 후 비교한다. |
| 빌드 기준 | `npm run build` | 현재 TypeScript, Vite, 앱인토스 빌드 결과를 기록한다. |
| TDS 호환성 | 설치된 TDS·React·AIT 버전 확인 | Provider를 포함한 조합이 공식 지원 범위와 맞는다. |

### 기준 상태 기록 (2026-09-29)

- 개발 화면: Chrome `http://localhost:5173/`에서 샘플 홈과 광고 테스트 버튼이 표시됨.
- `npm run lint`: 종료 코드 0. 기존 `src/hooks/useInAppAds.tsx:54`의 `react(set-state-in-effect)` 경고 1건.
- `npm run build`: 종료 코드 0. TypeScript, Vite, 앱인토스 번들 빌드 완료.
- TDS 호환성: 공식 TDS 패키지 peer dependency는 React/React DOM 18 이하를 지원하고 React 19는 지원하지 않음. `@apps-in-toss/web-framework@3.2.0`의 peer dependency에는 React 제한이 없음.

## 요구사항별 검증

| 시나리오 | 동작 | 기대 결과 | 결과 |
| --- | --- | --- | --- |
| VAL-01 첫 진입 | 앱을 새로고침한다. | 홈이 첫 화면이며 `냉털픽`과 메뉴 추천 목적이 보인다. | 통과: Chrome에서 홈 제목·설명·CTA 표시 확인 |
| VAL-02 주요 CTA | `재료 고르기`를 누른다. | 재료 선택 안내 화면으로 이동한다. | 통과: 클릭과 Space 키로 안내 화면 표시 확인 |
| VAL-03 홈 복귀 | 안내 화면에서 `홈으로`를 누른다. | 홈 제목과 주요 CTA가 다시 표시된다. | 통과: 클릭과 Enter 키로 홈 복귀 확인 |
| VAL-04 샘플 제거 | 홈 화면을 확인한다. | Apps in Toss 샘플 소개와 광고 테스트 진입 버튼이 보이지 않는다. | 통과: 홈 접근성 트리에 샘플 문구·광고 버튼 없음 |
| VAL-05 좁은 폭 | Devtools viewport를 320 CSS px 이상으로 설정한다. | 제목·설명·버튼이 잘리지 않고 가로 스크롤이 없다. | 통과: 320×874 CSS px에서 두 화면의 텍스트 줄바꿈과 버튼 표시 확인, 가로 잘림 없음 |
| VAL-06 입력 접근성 | Tab, Enter, Space로 버튼을 사용한다. | 포커스가 보이고 버튼 동작이 키보드로 실행된다. | 통과: Tab 포커스 테두리 확인, Enter/Space 동작 확인 |
| VAL-07 TDS 일관성 | TDS 컴포넌트와 기본 토큰을 확인한다. | 별도 임의 버튼·타이포그래피 스타일이 TDS 표현을 덮지 않는다. | 통과: TDS Provider, 제목·본문·버튼 컴포넌트 사용; CSS는 배치·간격과 포커스 표시만 지정 |
| VAL-08 코드 품질 | `npm run lint`, `npm run build` | 두 명령이 오류 없이 끝난다. | 린트/빌드 종료 코드 0; 기존 린트 경고와 번들 크기 경고는 아래 최종 기록 참조 |

## 앱인토스 확인

브라우저 기반 Apps in Toss Devtools에서 두 화면 이동과 버튼 입력을 확인했다. 실제 Toss 앱에서의 기기 검증은 이번 작업에서 수행하지 않았다.

## 완료 기록

사용 환경: Chrome `http://localhost:5173/`, Apps in Toss Devtools viewport `320×874 CSS px`, 2026-09-29.

최종 코드 확인: `npm run lint`와 `npm run build`의 종료 코드는 모두 0이다. 린트는 기준 상태와 같은 기존 `src/hooks/useInAppAds.tsx:54` 경고 1건을 보고했다. 빌드는 TDS 적용 번들의 minify 후 JavaScript 청크 크기 1,234.91 kB( gzip 391.35 kB)가 500 kB 권장선을 넘는다는 경고를 보고했으나 `.ait` 생성은 완료했다. 실제 기기 검증은 남아 있다.
