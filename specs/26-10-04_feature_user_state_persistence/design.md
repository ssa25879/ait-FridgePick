# 설계

## 결정

- 기존 React 상태에 저장 서비스를 연결한다. 상태 관리 라이브러리나 서버는 추가하지 않는다.
- 브라우저 `localStorage`를 직접 쓰는 방안은 단순하지만 토스 SDK의 네이티브 저장 계약과 다르다. 설치된 SDK와 공식 문서에 존재하는 비동기 `Storage.getItem/setItem`을 선택한다.
- 저장 키는 `fridgepick:user-state:v1:<encodeURIComponent(HASH)>`. JSON에는 `version: 1`과 재료·필터만 포함한다.
- `src/user/userKey.ts`는 지원 검사와 HASH 응답 검증만 담당한다. 공개 웹 문서에 생략된 `isSupported()`는 설치된 SDK 3.2.0 타입·구현으로 확인했다.
- `src/storage/userState.ts`는 데이터 검증과 키별 직렬 쓰기를 담당한다. 읽기는 해당 키의 앞선 쓰기를 기다린다. 쓰기 실패도 다음 쓰기를 막지 않는다.
- `src/hooks/usePersistentUserState.ts`는 앱 상태·초기 조회·사용자 입력 우선권을 담당한다. 화면/추천 후보는 기존 App 상태에 둔다.

## 초기화와 경합

1. 기본값으로 UI를 즉시 연다. 초기 조회 전 기본값 저장은 하지 않는다.
2. 마운트당 한 초기화 Promise에서 HASH와 해당 사용자 저장값을 조회한다.
3. 초기 조회 전체에 1,500ms 제한을 두고 timeout/언마운트 이후 응답은 무시한다. 조회 실패·시간 초과에는 저장 키를 활성화하지 않는다.
4. 조회 중 변경 또는 추천 실행이 없으면 저장값을 적용한다. 변경·추천·처음부터가 있었다면 현재 세션을 우선하여 조회된 키에 현재 상태를 저장한다. 늦게 복원하여 선택과 이미 계산된 추천을 불일치시키지 않는다.
5. 이후 변경은 즉시 메모리에 반영하고 SDK 저장을 직렬로 요청한다. 쓰기 Promise에 timeout을 걸어 큐를 앞지르지 않는다. SDK 응답이 영구히 멈춘 경우 UI는 계속 동작하나 해당 저장은 보장할 수 없다.
6. 앱 종료 직전 비동기 쓰기의 완료는 플랫폼에 의존한다. 기기 QA는 저장 완료 후 재진입과 빠른 종료를 구분해서 기록한다.

손상 JSON은 초기값으로 해석하되 단순 진입만으로 자동 덮어쓰지 않는다. Storage 읽기 자체의 실패는 ‘저장값 없음’과 구분하고 그 마운트의 쓰기를 비활성화한다. 사용자키는 마운트 간 전역 캐시하지 않는다. 같은 WebView 생존 중 토스 계정 전환 동작은 플랫폼 기기 QA 대상이며 이 구현은 새 진입/마운트 때 키를 다시 확인한다.

## 네비게이션

홈 이외 화면에서 `graniteEvent`의 backEvent와 homeEvent를 구독한다. back 콜백은 최신 상태를 기준으로 결과→재료→홈으로 전환한다. 홈에서는 리스너가 없어 기본 닫기 동작을 가로채지 않는다. 구독 실패와 정리 실패는 앱을 중단시키지 않으며 오류 객체·사용자키는 출력하지 않는다. 토스 네비게이션 표시 구성이나 Android 전달 여부는 실제 기기에서 별도 확인한다.

## 근거 (2026-10-04 확인)

- [User.getAnonymousKey](https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/user/user.getanonymouskey)
- [Storage](https://developers-apps-in-toss.toss.im/documentation/common/file-storage/storage)
- [이벤트 제어](https://developers-apps-in-toss.toss.im/documentation/common/screen/event)
- 설치된 `@apps-in-toss/web-framework` 3.2.0의 `dist/index.d.ts`와 `dist/index.js`
