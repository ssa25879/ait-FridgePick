# 설계: 비게임 출시 체크리스트 대응 및 출시 준비

## 사용자 식별키와 저장 상태

- 비게임 공식 API `User.getAnonymousKey()`에서 `HASH` 키를 가져온다. 지원 버전은 공식 문서에 따라 확인하고, 샌드박스 mock 값은 실제 사용자 식별 동작의 증거로 취급하지 않는다.
- 앱에 계정·서버가 없으므로 SDK `Storage`의 네이티브 로컬 저장소에 필요한 최소 상태를 보관하고 키 hash로 사용자 상태를 분리한다.
- 저장 범위는 재료 선택 ID, 매칭률, 난이도로 확정했다. 앱 화면은 재진입 시 홈에서 시작하되 다음 선택 단계에서 저장 상태를 복원한다.
- `처음부터`는 재료 선택과 필터를 기존 기본값으로 초기화하고 저장 상태도 일관되게 갱신한다.
- API 실패·미지원 환경에서는 앱의 핵심 추천 흐름을 막지 않는다. 이 경우 세션 상태만 사용하고 다른 사용자 상태를 섞거나 임의 키를 만들어 저장하지 않는다.
- 식별키나 선택 데이터를 자체 서버로 전송하지 않는다.

## 확대·축소 제한

- `index.html`의 viewport 선언을 공식 체크리스트에 맞게 보완한다.
- 실제 토스 앱에서 핀치 확대·축소를 확인한다. 브라우저 미리보기 설정만으로 통과 처리하지 않는다.

## 현재 배너 배치

사용자의2026-10-04 선택에 따라 홈 전용 배치는 재료 화면 하단의 스크롤 조건부 배치로 대체됐다. 광고를 제외한 콘텐츠만 측정하고 CTA 아래32px 간격을 둔다. 홈·결과에는 부착하지 않는다. 실제 코드 구조는 [IB 설계](../26-10-04_feature_ingredient_banner/design.md)를 따른다. SDK 표준 UI/Ad 표기는 수정하지 않으며 기기·검수 적합성은 미확인이다.

테스트 번들은 기본 build로 생성한다. release도 같은 파일명을 쓰므로 산출물을 모드/시각/SHA로 구분한다. 실제 ID 원격 비노출 목표는 현재 미달성으로 남긴다.

## 플랫폼 이동과 출시 검증

- React 내부 화면 전환과 토스 네비게이션의 뒤로가기 동작이 연동되는지 기기에서 확인한다. 코드만으로 플랫폼 back 처리 여부를 가정하지 않는다.
- 네비게이션 바·더보기·홈 버튼·스킴 연결은 콘솔 설정과 토스 앱 런타임을 함께 확인한다.
- 320×640 CSS px 및 실기기에서 광고, CTA, 하단 safe area, 스크롤, 가로 넘침을 확인한다.
- 광고 그룹이 활성화된 상태는 광고 렌더 성공을 보증하지 않는다. 실제 광고는 승인·라이브 환경에서 별도 검증한다.
- 워크스페이스 약관 동의와 최초 등록/번들 검수는 코드 작업과 별도인 콘솔 선행조건으로 기록한다.

## 공식 자료

- [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame)
- [사용자 식별키 발급](https://developers-apps-in-toss.toss.im/guide/authentication/anon-key)
- [User.getAnonymousKey API](https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/user/user.getanonymouskey)
- [인앱 광고 정책](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa/interstitial-rewarded-ad#policy)

## 실제 광고 그룹 ID 보호

- 목표 상태: 실제 groupId를 소스·추적 설정·문서·로그에 기록하지 않고 원격 저장소로 push하지 않는다.
- 테스트 빌드에서는 공식 테스트 ID만 사용한다.
- 배포가 실제 ID를 필요로 하면 저장소 밖의 승인된 보호 입력 경로를 사용 가능한지 먼저 확인한다. 구현 전까지 특정 환경변수나 CI 설정 기능을 지원한다고 가정하지 않는다.
- 민감값 검색 결과는 값 대신 파일/커밋 위치와 pass/fail만 표시한다.

## 2026-10-04 저장 설계 구체화

비동기 API 계약, JSON 검증, 1,500ms 초기 조회 제한, 입력 우선권, 읽기 실패 시 덮어쓰기 방지, 키별 쓰기 순서는 [상태 저장 설계](../26-10-04_feature_user_state_persistence/design.md)를 따른다. 광고 위치 판단은 이 작업을 막지 않는다.

## 2026-10-05 RCR-14 구현 구성

- src/ads/bannerAdConfig.ts:공식 테스트ID와 출시 설정 형식 검사. 실제 ID 상수는 없다.
- src/ads/bannerAds.ts:빌드 MODE로 분기하며 release만 설정 검사를 호출한다. 모드 분기를 최상위에 두어 반대 모드 ID가 산출물에 남지 않도록 한다.
- vite.config.ts:release만 외부 .env.release.local/보호 프로세스 환경변수를 읽고 빌드 시 검증·정적 치환한다. 기본 모드는 실제 값 대신 빈 값을 정의한다.
- config/release.env.example와 README:빈 값 예제·외부 설정 위치·설정 누락 차단·이력/클라이언트 노출 경계.
- 해당 환경변수는 인증 비밀키 전달에 사용하지 않는다. 실제 광고 그룹ID의 원격 소스 노출과 배포 클라이언트 포함을 구분한다.
