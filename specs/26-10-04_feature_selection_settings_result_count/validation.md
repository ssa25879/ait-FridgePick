# 검증

| ID | 시나리오 | 현재 상태 |
| --- | --- | --- |
| SSC-01 | 저장 성공/실패/미지원·대기 안내, 이전 저장 완료의 상태 역전 방지 | App.persistence.test.tsx 통과 |
| SSC-02 | 초기화 취소는 유지, 확인은0개/60%/전체와 저장값 초기화 | App.persistence.test.tsx·브라우저 통과 |
| SSC-03 | 초기화 재진입·지연 복원 및 기존 실패 회귀 | App.persistence.test.tsx 통과 |
| SSC-04 | 후보0·1·7 표시 위치, 필터 적용과 다시 뽑기 개수 유지 | ResultPage.count.test.tsx·App.test.tsx 통과, 브라우저0개 확인 |
| SSC-05 | 홈 미변경, CTA/조건부 광고와 좁은 화면 | diff·320×640 브라우저 확인, 새 빌드 실기기 대기 |
| SSC-06 | 전체95개·탭 간 선택 유지 | App.test.tsx·브라우저 통과, 새 번들 기기 대기 |
| SSC-07 | 접힘/펼침·값 유지·스크롤 감소·최소 크기 | App.test.tsx·브라우저 통과, 새 번들 기기 대기 |

## 실행 결과 (2026-10-04)

- 구현 전 신규7개 테스트 실패·기존26개 통과를 확인했다. 버튼·상태 안내·검색 개수가 없는 것이 실패 원인이었다.
- 구현 후 초기 전체 검증105개 통과/1개 실패: 결과 개수를 두 번째 role=status로 표시하여 기존 간결한 라이브 안내 계약을 깨뜨렸다. 개수는 일반 문단으로 제공하고 기존 메뉴·매칭률 음성 안내를 유지하도록 수정했다.
- 최종 `npm test`:11개 파일106개 통과. 신규8개: 초기화 취소/확인·재진입, 실패 후 저장 회복, 미지원 안내, 지연 복원 중 초기화, 이전 저장 완료가 최신 대기를 덮지 않음, 후보0/1/7 표시. 기존 다시 뽑기 테스트에 검색 개수 유지 assertion 추가.
- `npm run lint`: 종료0, 기존 useInAppAds.tsx:54 경고1건. `npm run build`: TypeScript·Vite·AIT 통과, 기존 약2.379MB 청크 경고. 현재 설치된 Vite는8.3.1이다.
- 브라우저320×640: 김치·보통 선택 후 초기화 취소는 선택 유지, 확인 후0개/60%/전체. 초기화 후 추천에서0개 표시. 가로폭320px/scrollWidth320px, 확인 버튼 각각115×48px, 광고와 서비스 콘텐츠 간격32px. 브라우저는 AIT DevTools mock이며 실기기 증거가 아니다.
- 기존 TDS 네이티브 SafeAreaInsets 조회 오류는 브라우저에서 유지됐다. 기본 흐름 검증은 가능했지만 실제 safe area 적합성은 새 번들 실기기에서 확인한다. 임시5175 서버·검증 탭은 종료하고 viewport를 원복했다.
- 문서72개/상대 링크159개 누락0, `git diff --check` 통과. SSC-01~05의 요구사항과 검증표를 대조했다. 홈 파일은 변경하지 않았다.
- 기본 번들 deploymentId:01a10732-9b57-7e91-b7d0-ba18979807d0. 이 새 번들은 로컬 생성만 했으며 콘솔 업로드·실기기·검수·출시는 수행하지 않았다.

이전 S26U 확인은 새 변경의 실기기 통과가 아니다. 새 번들에서 초기화 취소/확인, 저장 완료 후 종료·재진입, 후보0/1/여러 개·다시 뽑기, CTA·광고 간격을 확인한다.

## 새 테스트 번들 업로드 (2026-10-04)

사용자가 정리된 작업1~8을 순서대로 진행하도록 요청하여 `ait:test-on-device` 경로로 새 번들을 준비했다.

| 항목 | 확인 결과 |
| --- | --- |
| 소스 | fa8b4e06878af7c573c8485d021b8274e18205d2, feature/selection-settings-result-count |
| Git | 기능 브랜치 push 후 원격 SHA 일치. 원격 master는def4bae 유지 |
| 빌드 | npm run build 종료0: TypeScript·Vite·AIT 성공, 기존 큰 청크 경고 |
| 파일 | ait-fridgepick.ait, 964020 bytes |
| SHA256 | 116effd4878752cf38332cbeb199572894dc5dc2249cf4e2b584506f38d08bbe |
| 내부 검사 | 공식 AIT 판독기로8파일 확인, 테스트 광고 ID1파일·실제 광고 ID 패턴0파일 |
| 대상 | workspace96603/miniApp80586, appName ait-fridgepick 일치 |
| deploymentId | 01a1073a-0617-7005-8723-4e1a318ecb28 |
| 콘솔 | 버전20261004-7, PUT HTTP200, upload_complete 성공, 컴파일CREATED/failureReason null |
| 본인 테스트 푸시 | 성공, isTested=true: 테스트 준비만 완료, 실제 QA 통과 아님 |
| 실기기·검수·출시 | 새 번들 실기기 결과 대기, 검수 제출·라이브 전환 수행하지 않음 |

도구 반환 [테스트 QR](https://apps-in-toss.toss.im/workspace/96603/mini-app/80586/app-build?testDeploymentId=01a1073a-0617-7005-8723-4e1a318ecb28&testVersionName=20261004-7).
본인 전용 링크: intoss-private://ait-fridgepick?_deploymentId=01a1073a-0617-7005-8723-4e1a318ecb28&host=appsInTossHost

다음 작업2: 초기화 취소/확인, 저장 완료 후 종료·재진입, 검색 개수0/1/여러 개와 다시 뽑기, 화면·광고 겹침을 확인하고 기기/OS/토스 버전·결과를 받는다. 작업5·8은 각각 하위 에이전트3개, gpt-6-luna/xhigh로 검증하도록 사용자가 지정했다. 아직 해당 검증을 실행하지 않았다.

## 2번 실기기 피드백 보완

사용자 확인: 초기화 정상, 종료·재진입 복원 정상, 겹침 없음. 후보0/1개 안내 중복 및 전체적으로 큰 화면·긴 스크롤은 수정 요청이다. 새 UI 변경 후 다시 확인해야 한다.

- 변경 전 후보0/1개의 중복 안내와 전체 탭·접힘 UI 부재를 테스트로 확인했다.
- 최종11파일108개 테스트 통과. 후보0/1/7 단일 안내, 전체95개와 선택 유지, 펼침/접힘 후85%·보통 값 유지, 기존 저장·초기화 회귀를 포함한다.
- jsdom에서는 닫힌 details 내부를 role 조회로 찾을 수 있어 가시성 assertion으로 접힘을 검증했다. 기존 광고 초기화 단일 실행 검증은 파일의 첫 시나리오에 유지했다. 모듈 초기화가 캐시되는 테스트 순서 의존성을 제품 버그로 처리하지 않았다.
- TypeScript·Vite·AIT build 통과, lint 종료0/기존 광고 훅 경고1건, 기존 큰 청크 경고 유지.
- 브라우저320×640, 채소 탭·선택0개·설정 접힘의 동일 조건: 전체 높이1793→1526px(267px, 약14.9% 감소), 서비스 콘텐츠1569.375→1302.4375px. scrollWidth320px, 재료 칩46px/15px, 카테고리45.53px, 초기화44px, summary46.5px, 광고 간격32px. 전체 탭95개 표시 확인.
- ait:design 국소 수정/모드B 적용. 기존 가이드v1/TDS를 유지하고 별도 토큰·아이콘 파일을 주입하지 않았다. 공식 비게임 출시 가이드에서 스크롤 가능한 화면 배너·터치/화면 전환 조건을 재확인했다. 44px/15px/32px 수치는 저장소 기준이며 공식 수치로 주장하지 않는다.

| 화면/품질 축 | 판정 |
| --- | --- |
| 재료·결과 G0 | 기존 중립 브랜드·시스템 폰트 유지, 신규 외부 자산 없음 |
| G1 | 네비/CTA 고정 배치 변경 없음, 실제 safe area·제스처는 새 번들 기기 확인 필요 |
| G2 | 등록 자산 미요청으로 해당 없음 |
| G3/G4 | 본문15px·터치44px 이상 실측, 기존 색상·TDS 유지; 기존 직접 CSS 값은 유지 |
| G5/G6 | 저장 실패/세션 유지 안내·초기화 취소 유지, 후보 안내 중복 제거 |
| G7/G8 | 320px 가로 넘침 없음·광고 간격32px, 접기/펼치기로 광고 스크롤 측정 기준을 변경하지 않음 |

새 번들의 실기기에서0/1개 안내 단일 표시, 전체 탭, 설정 접기/펼치기·저장/초기화, 긴 스크롤 체감을 재확인한다. 계정 분리·핀치 제한·실제 광고 실패는 계속 별도 미확인이다.

## 보완 테스트 번들20261004-8

- 제품 소스38fae50b163fa65500e7c0e12b6f0225284fa538을 기존 기능 브랜치에 push하고 원격 SHA 일치를 확인했다. master def4bae 유지.
- 빌드 deploymentId:01a1074a-4ed9-7383-9224-b4b27d181d0d.964139 bytes, SHA256 4f71963a27245099088fceaa7ed35fde28c1ec49c33d562242378bc8422a317f.
- 공식 AIT 판독기로8파일·테스트 광고 ID1파일·실제 ID 패턴0파일을 확인했다. PUT HTTP200, upload_complete 성공, 콘솔CREATED/failureReason null/deployed false, 본인 테스트 푸시 성공/isTested true.
- [새 테스트 QR](https://apps-in-toss.toss.im/workspace/96603/mini-app/80586/app-build?testDeploymentId=01a1074a-4ed9-7383-9224-b4b27d181d0d&testVersionName=20261004-8).
- 도구 반환 본인 전용 링크: intoss-private://ait-fridgepick?_deploymentId=01a1074a-4ed9-7383-9224-b4b27d181d0d&host=appsInTossHost
- 실기기 결과는 대기. 검수 제출·라이브 전환은 수행하지 않았다. 기존7버전 사용자 보고를8버전 QA 통과로 재사용하지 않는다.

## SSC-08 브라우저 검증

393×852 전체95개 목록: 높이280px/콘텐츠1782px/justify-content:center/필터가 카테고리보다 위에 있다. 320×640: 목록218px/콘텐츠2592px/최소 칩46px/문서 너비320px로 수평 넘침 없음. 카테고리 전환 후 scrollTop0이며 선택 유지 테스트를 수행했다. 키보드로 목록 스크롤 시 페이지 scrollY99를 유지했다. 네이티브 scroll 호출은 대상 진입 때 외부 페이지도 이동하므로 기기 터치 스크롤 느낌은 미검증이다.

이미지: ingredient-scroll-centered.png, ingredient-filter-expanded.png, ingredient-scroll-320.png(사용자 시각 자료 디렉터리). 기존 S26U 결과를 이번 변경의 기기 통과로 재사용하지 않는다. 최종 테스트/빌드 결과는 후속 기록한다.

## 최종 검사 결과

2026-10-04 최종 코드 기준 npm test:12파일/108개 통과. 후속 단계 번호 중복 회귀는 수정 전 실패를 확인하고 수정 후 관련7개를 확인했으며 전체108개를 다시 통과했다. npm run lint:성공(기존 useInAppAds.tsx:54 경고1개). npm run build와 npm run build:release:TypeScript/Vite/AIT 성공, 기존 큰 JS 청크 경고 유지. git diff --check:공백 오류 없음. 빌드 산출물에 수기 fixture ID가 포함되지 않음을 확인했다. 브라우저 모의 이미지에는 파란 AIT 개발 도구 버튼이 포함된다. 신규 기기 QA/커밋/푸시/번들 업로드는 미수행.

## 2026-10-05 커밋·테스트 번들 준비

사용자가 이미지 확인 이후 커밋·푸시와 다음 단계를 승인했다. 코드 변경 없이 전체12파일/108개 테스트를 재확인해 통과했다. 기본 TypeScript/Vite/AIT 빌드 성공. 새 deploymentId01a10774-4e3e-7e61-94cb-c9acfe84dfac,962950바이트,SHA256 adf50c43025a7e4312ca763111fdc3313a3a9c3afa5f6093beeb74a7f4fc80bc. AITReader8파일 검사: 실제 광고ID0/테스트 배너ID1/수기 fixture ID0. 이번 기록 시점 업로드·기기 확인은 아직 미수행이며 다음 단계로 진행한다.

## 2026-10-05 새 번들 QA 시나리오

- 제품 소스9d94ad8을 origin/feature/selection-settings-result-count에 push하고 원격 SHA 일치를 확인했다. master def4bae는 유지했다.
- 새 버전20261005-9의 업로드 PUT200/완료 접수true를 확인했다. 컴파일 완료 상태와 테스트 링크는 후속 기록한다.
- 기기 확인1: 전체 탭의 재료 목록 내부 스크롤·중앙 정렬, 카테고리 전환 시 목록 처음으로 이동/선택 유지, 목록 끝에서 페이지로 넘어가는 스크롤 체감을 확인한다.
- 기기 확인2: 필터가 카테고리 위에 있고 접기·펼치기, 저장·초기화 취소/확인과 종료·재진입 복원이 유지되는지 확인한다.
- 기기 확인3: 초기화 후 당근/감자/요거트만 선택하고60%·전체에서 공식 감자요거트 샐러드 후보1개,75%,부족 재료 완두콩,원문 분량·출처·하단 검색 수1회를 확인한다.100% 또는 재료0개에서 무후보 안내와 하단에 검색 수0개가 한 번만 표시되는지를 확인한다.
- 기기 확인4: 조리 단계 번호 중복 없음과 CTA/광고 겹침·safe area·가로 넘침을 확인한다. 신규 기기 결과가 있어야 이 변경의 QA를 통과로 표시한다.
- 실제 사용자 QA 대기 중에는 검수 제출·출시를 하지 않는다. 정해진5/8단계의 하위 에이전트 검증은 아직 해당 단계가 아니다.

## 2026-10-05 테스트 환경 준비 완료

- 버전 20261005-9, 제품 소스9d94ad8ac82efa9ebbf65b4aec11908abea22ab2.
- deployment 01a10774-4e3e-7e61-94cb-c9acfe84dfac, 컴파일CREATED/failureReason null/deployed false. 본인 테스트 푸시 성공/isTested true는 환경 준비 완료이며 실제 QA 완료가 아니다.
- 도구 반환 privateLink: intoss-private://ait-fridgepick?_deploymentId=01a10774-4e3e-7e61-94cb-c9acfe84dfac&host=appsInTossHost
- 도구 반환 consoleTestUrl: https://apps-in-toss.toss.im/workspace/96603/mini-app/80586/app-build?testDeploymentId=01a10774-4e3e-7e61-94cb-c9acfe84dfac&testVersionName=20261005-9
- 다음 단계: 위 새 버전에서 재료 내부 스크롤/중앙 정렬/필터 위치, 선택 저장·초기화, 공식 레시피 분량·출처/단계 번호/검색 개수, CTA·광고를 실기기 확인한다. 사용자 결과 대기. 검수 제출·출시는 수행하지 않았다.
