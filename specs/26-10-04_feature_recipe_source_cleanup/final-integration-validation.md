# 최종 로컬 통합 검증과 출시 잔여

## 최신 후속: 스크롤 수정 포함 출시 점검

2026-10-05 사용자 요청으로 다시 뽑기 수정의 실기기 검증을 생략하고 로드맵12단계 출시 산출물 점검을 진행했다. 생략은 실제 기기 통과 증거가 아니다. 최신16의 채소치즈죽 추가 재료 표시·버터/우유 추가 후 목록 갱신 정상 확인은 사용자 결과로 별도 기록한다. 아래15 산출물과 검증은 당시 기록이다.

- 현재 수정본 기본AIT:deployment01a10c05-c1d8-7fc3-a481-6ce7ff68e2a5/1113446bytes/SHA256e1984b0f7e3f540028c932fb328f0844c1a87a5a57c5ed65d9c206ab14e4ad38.
- 현재 수정본 출시AIT:deployment01a10c09-7b92-7608-871d-06d943ced3dc/1113562bytes/SHA2567a194c22922f0f81ae99213abc380b7f7b39463d5ad3bfb383832699c9bc82a4. TypeScript/Vite/AIT 출시빌드 통과,대형청크 경고 유지.
- 두AIT 각각9entry/JS2개 dist바이트동일. 실제ID형식/테스트ID 포함 파일수:기본0/1,출시1/0. 실제값 출력 없음. 출시산출물 보존 후 루트dist/AIT를 기본으로 복원하고 SHA확인. 보존 경로:D:/ait-home/fridgepick-release-check-20261005-scroll (default/release.ait,default/release-dist,bundle-proof.json).
- 콘솔 재조회:앱정보APPROVED/최초등록false/라이브false/제휴약관동의필요/검수요청ALLOWED/검수중없음. 수정본 두번들 미업로드·미푸시. 콘솔 최신16에는 스크롤 수정 없음. 약관 수락·검수 제출·출시·Git커밋/push 미수행.
- 다음12단계:대표관리자 제휴약관 동의·최초 등록. 현재 기본 수정본과 출시산출물 중 제출 모드를 구분하고 실제 광고 환경 확인은 별도다. 기존ID이력 대응은11단계 결정이 필요하다.

2026-10-05, 로드맵11~14단계. 제품 기준 HEAD507ffa5 위 미커밋 변경이다. 기능/데이터 수정 없이 마지막 빌드·업로드·브라우저·콘솔 확인을 수행했다. 전체 로드맵 또는 출시 완료를 뜻하지 않는다.

## 최신 본인 테스트

- 버전20261005-15 / deployment01a10bbd-d4d2-751d-9967-afc170981151.
- [PC QR](https://apps-in-toss.toss.im/workspace/96603/mini-app/80586/app-build?testDeploymentId=01a10bbd-d4d2-751d-9967-afc170981151&testVersionName=20261005-15).
- 도구 반환 본인 링크: intoss-private://ait-fridgepick?_deploymentId=01a10bbd-d4d2-751d-9967-afc170981151&host=appsInTossHost
- PUT200/업로드완료true/CREATED/failureReason null/isTested true/deployed false. isTested는 환경 준비이고 실제 사용자의 테스트 완료를 뜻하지 않는다.
- 1111999bytes/SHA256733abedc34e994b1112e2681a1cc2323451e038adfde4aba5ab0fbd2c3f2795d.
- 안내201개(EPIS72/식약처129),제품1359개. S26U 사용자 확인13/14에는 최신 데이터 보완이 들어 있지 않다. 최신15와14는 데이터가 달라 성능 비교쌍으로 사용하지 않는다.

## 검증 근거

|범위|실행 결과|한계|
|---|---|---|
|자동검사|동일 최종 제품 소스의 전체14파일194개·수집/생성기10개 통과. [직전 검사](./mfds-remaining-review.md)|기관 원문 전체의 정확성·실제 보유량 보증은 아님|
|lint/기본 빌드|종료0/기존 광고 훅 경고1개. TypeScript/Vite/AIT 성공|큰 JS 청크 경고 유지|
|기본 실제 AIT|9entry/JS2개 dist바이트 일치,실제 광고ID형식0/테스트ID포함. 업로드 전 복원 후 SHA 동일 확인|실기기 광고 렌더는 별도|
|새 출시 빌드|TypeScript/Vite/AIT 성공,9entry/JS2개 dist일치·실제ID1파일/테스트ID0|출시 빌드는 외부 설정 사용,미업로드|
|320px 김치+밥|준비완료0/준비필요3,김치볶음밥 원문분량·출처·부족7개 표시,검색 안내1회|김치+밥만으로 만들 수 있다고 표시하지 않음|
|320px 전체95개|준비완료126 우선/준비필요817,그룹 전환 확인,검색 안내126/817|등록 필수 재료 보유 기준,분량·재료 종류의 상세는 원문 확인 필요|
|393px 초기화|취소 후95개 보존/확인 후0개,기본60%·전체 복원/결과0개·검색 안내1회|SDK 미지원 브라우저는 실행중 보관,토스 영구저장 증거가 아님|
|가로 넘침|위320/393px 결과 document.scrollWidth=innerWidth|실제 광고·플랫폼 safe area·제스처와 구분|
|광고 미지원 흐름|production 브라우저에서 재료 선택·추천·그룹 전환·초기화 유지|no-fill/실제 SDK실패의 기기 증거가 아님|
|현재 소스 ID|비무시 추적/미추적168파일에서 기존 실제값0|로컬origin참조6개중4개에 기존값. 원격 전체/전체 과거이력 조사 아님|

출시 AIT:deployment01a10bd2-1e06-7cde-b7a6-1adf6968ef1c/1112104bytes/SHA2560f86e93566bf78ffa0a93046a6a75a74c5d35894c5d67d7c334ff298e39aebcd. 검사 후 루트 dist/.ait를 기본15로 복원했다. 현재 소스54개+빌드설정/패키지4개의 해시는 source-security-manifest.json에 보존했다.

보존 경로 D:/ait-home/fridgepick-final-validation-20261005:

- default.ait/default-dist 및 release.ait/release-dist.
- source-security-manifest.json:기준HEAD/현재소스 해시/노출 건수,실제ID 값 없음.
- kimchi-rice-320.png/ready-320.png/empty-393.png/final-result-393.png. 임시 브라우저탭·뷰포트·preview 서버 정리 완료.
- Task.md/roadmap.md/validation.md 수정전 사본. 원본 CSV·생성 카탈로그·기존13/14 쌍은 유지했다.

## 콘솔 상태와 준비된 설명 수정안

2026-10-05 최종 작업 중 재조회:앱정보APPROVED/isInitialRegistrationCompleted false/isDeployed false/rejectedMessage null. releaseDecision WORKSPACE_TERMS_AGREEMENT_REQUIRED/reviewRequestDecision ALLOWED/hasBundleInReview false/liveBundleVersionName null. 주요기능DRAFT/requiresFeatureRegistration true는 비필수이며 그 자체로 검수 차단이 아니다.

[미니앱 콘솔 홈](https://apps-in-toss.toss.im/workspace/96603/mini-app/80586/home)에서 대표관리자의 제휴 약관 동의와 최초 등록 절차를 진행해야 한다. 약관 동의 MCP는 없고 실제 출시 전환도 콘솔에서만 가능하다. ALLOWED를 검수 승인으로 해석하지 않는다.

현재 콘솔 상세 설명은 초기의 재료 선택·실행중 유지만 설명한다. 아래는 확인된 현재 기능에 맞춘 **로컬 수정안**이며 콘솔에 제출하지 않았다:

> 냉털픽은 냉장고에 있는 재료를 선택해 요리 레시피를 찾는 앱입니다. 등록된 필요 재료가 모두 선택되고 원문 확인 안내가 없는 메뉴를 먼저 보여주며, 재료 추가가 필요한 메뉴는 따로 안내합니다. 주재료 매칭률과 난이도로 후보를 좁히고, 더 준비할 재료와 원문 재료 분량·조리 순서·출처를 확인할 수 있습니다. 지원되는 토스 환경에서는 선택한 재료와 필터가 자동 저장됩니다.

앱 이름 냉털픽/appName ait-fridgepick 일치,권한배열0. 로그인·결제 등 N/A 근거와 지정3개 에이전트 검토는 [기존 출시 검증](../26-10-02_feature_release_checklist_readiness/validation.md)을 재사용한다. 명시적 검수 요청·최신 기기 QA 결과 없이 검수 제출하지 않는다.

## 마지막 통합 기기 확인과 외부 조건

1. **로드맵12·14:** 최신15에서 김치+밥의 준비완료0/추가준비3,준비 그룹 전환,확인 안내가 있는 메뉴의 준비필요 유지,원문 분량/출처/검색 안내1회,저장·초기화·종료 재진입·뒤로가기·스크롤·하단 여백을 확인한다. 확인 안내 대상은 [식약처 메뉴별 목록](./mfds-remaining-review.md)에 있다.
2. **로드맵11·12:** 실제HASH/계정분리·스킴·지원 플랫폼 제스처·실제 광고/no-fill/실패는 아직 상세 증거가 없다. 계정전환은 사용자가 테스트할 수 없다는 기존 상태를 유지한다. 최신15 기본 광고는 테스트ID다.
3. **로드맵12:** 제휴 약관 수락·최초 앱/번들 검수·콘솔 설명 반영·출시는 외부 절차다. 콘솔 수정안은 위에 준비했다.
4. **로드맵11·12:** 기존 광고그룹값의 이력 대응은 그룹 교체 또는 이력 재작성 등 방법·영향을 먼저 결정해야 한다. 광고ID는 release 클라이언트에 포함되는 식별자이며 인증키를 숨기는 방식으로 설명하지 않는다. 기존값을 비밀로 되돌렸다고 주장하지 않는다. 강제push/그룹변경은 미수행.
5. **로드맵13:** 제공 원본의 기준일unknown,검색범위 밖 원문완전성·복합재료/기관 원문 정정·실제사용자 조합 표본은 미확정이다. README/Node/CI는 로컬 검증 완료,원격CI는 변경 커밋/푸시 후 실행 확인이 필요하다. S26U13/14 체감 차이 작음 보고를 수치상 개선으로 확대하지 않는다. 정량 비교는 [동일 기능13/14 측정표](./final-pair-validation.md)를 사용한다.

홈 꾸밈은 보류다. 로컬에서 실행할 수 있는 구현·검증·최신 테스트 준비는 마쳤으며 외부 조건을 충족할 때 출시 판단을 이어간다. 이번 후속은 미커밋·미푸시다.
