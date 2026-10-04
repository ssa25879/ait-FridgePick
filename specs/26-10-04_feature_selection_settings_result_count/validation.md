# 검증

| ID | 시나리오 | 현재 상태 |
| --- | --- | --- |
| SSC-01 | 저장 성공/실패/미지원·대기 안내, 이전 저장 완료의 상태 역전 방지 | App.persistence.test.tsx 통과 |
| SSC-02 | 초기화 취소는 유지, 확인은0개/60%/전체와 저장값 초기화 | App.persistence.test.tsx·브라우저 통과 |
| SSC-03 | 초기화 재진입·지연 복원 및 기존 실패 회귀 | App.persistence.test.tsx 통과 |
| SSC-04 | 후보0·1·7 표시 위치, 필터 적용과 다시 뽑기 개수 유지 | ResultPage.count.test.tsx·App.test.tsx 통과, 브라우저0개 확인 |
| SSC-05 | 홈 미변경, CTA/조건부 광고와 좁은 화면 | diff·320×640 브라우저 확인, 새 빌드 실기기 대기 |

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
