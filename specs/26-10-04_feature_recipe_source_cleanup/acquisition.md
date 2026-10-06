# 추가 레시피 확보 안내

확인일: 2026-10-05. 아래 최초 확보 절차 이후 EPIS 전체 자료와 사용자 제공 식약처 압축 원본을 확보했다. 제품은 식약처888개·EPIS471개로 총1359개다.

식약처 원본은 D:/ait-home/recipe-sources/mfds/acquired-20261005-1791194578004에 압축 사본·CSV·manifest와 재생성 대조 파일로 보존했다. 원본1156행이며 기존 생성 코드9d94ad8의888개 출력과 LF 정규화 후 전체 일치한다. 확보일2026-10-05와 데이터 기준일unknown을 구분한다. 현재 매핑의 추가 후보6개는 검토 후 모두 보류했다. 경로·SHA256·재현 근거와 후보별 사유는 [원본 복구 검증](./source-recovery-review.md)을 따른다.

다음은 최초 자료 확보 당시의 안내와 후속 기록이다.

## 1차 확보 대상: 농림수산식품교육문화정보원

다음 세 자료를 모두 확보한다. 기본정보만으로는 분량과 조리법을 구성할 수 없다.

| 자료 | 공공데이터포털 | 제공기관 상세·신청·다운로드 안내 | API 서비스 식별자 |
| --- | --- | --- | --- |
| 기본정보 | [기본정보](https://www.data.go.kr/data/15057205/openapi.do) | [기관 상세](https://data.mafra.go.kr/opendata/data/indexOpenDataDetail.do?data_id=20150827000000000464) | Grid_20150827000000000226_1 |
| 재료정보 | [재료정보](https://www.data.go.kr/data/15058981/openapi.do) | [기관 상세](https://data.mafra.go.kr/opendata/data/indexOpenDataDetail.do?data_id=20150827000000000465) | Grid_20150827000000000227_1 |
| 과정정보 | [과정정보](https://www.data.go.kr/data/15056535/openapi.do) | [기관 상세](https://data.mafra.go.kr/opendata/data/indexOpenDataDetail.do?data_id=20150827000000000466) | Grid_20150827000000000228_1 |

공공데이터포털 세 페이지는 현재 무료·이용허락범위 제한 없음으로 표시한다. 기관 상세 페이지의 이용허락란은 비어 있어 실제 내려받는 자료의 별도 조건도 확인한다. 이미지 사용 조건은 별도로 확인하기 전 편입 범위에 포함하지 않는다.

## 사용자 확보 순서

1. 위 기관 상세 페이지에 접속한다. 각 자료의 `파일` 및 OpenAPI의 `파일다운로드` 안내를 확인한다. 내려받을 수 있는 전체 파일이 있으면 원본 형식으로 세 자료를 모두 저장한다. 샘플 Excel/XML은 전체 자료가 아니다.
2. 전체 파일 다운로드에 인증이 필요하거나 제공되지 않으면 해당 기관 포털에 로그인/가입한 뒤 `오픈 API 신청` 안내를 따른다. 공공데이터포털의 API 유형은 LINK이므로 최종 신청·키 발급은 연결되는 제공기관 안내를 기준으로 한다.
3. 신청 활용 목적 예시: “보유 재료 기반 레시피 추천 미니앱에서 공식 재료 분량과 조리 순서를 제공하기 위한 정적 카탈로그 구축”. 발급 화면에서 세 서비스의 사용 범위를 확인한다.
4. 파일을 확보한 경우 `D:\ait-home\recipe-sources\epis\` 같은 저장소 밖의 로컬 폴더에 원본 그대로 보관하고 경로를 알려준다. 이 경로는 제안이며 현재 폴더·자료는 생성하지 않았다.
5. 키를 발급받은 경우 키 값은 채팅·specs·Git에 붙여넣지 않는다. 아래 로컬 수집기의 숨김 입력을 사용한다. 키는 명령 인자나 환경변수로 전달하지 않는다.

전체 자료 수와 새로 편입 가능한 수는 확보 후 판단한다. 인증된 전체 조회와 다운로드는 아직 실행하지 않았으므로 가입·승인·파일 제공 상태를 확정하지 않는다.

## 재료정보 5,000행 제한 대응 도구

사용자가 파일 다운로드5,000행 제한을 보고했다. 공식 안내의 일반 API 조회 한도1,000행에 맞춰 별도 요청으로 수집한다. 2026-10-05 공개 JSON 샘플은 totalCnt6104를 반환했다. 전체 인증 조회 시 달라질 수 있으며 레시피 수가 아닌 재료 행 수다.

PowerShell에서 실행한다.

```powershell
cd D:\ait-home\ait-FridgePick
.\scripts\downloadEpisIngredients.ps1
```

`EPIS API key (hidden input)`에 키를 입력한다. 이 PC에서는 번들 Node를 우선 사용하고, 없으면 PATH의 Node22이상을 사용한다. 필요하면 `-NodePath 'C:\경로\node.exe'`를 지정한다. 키를 코드나 명령문에 적지 않는다. PowerShell 실행 정책으로 막히면 오류를 확인하며 이 도구는 정책을 임의로 변경하지 않는다.

- 출력: 기본 `D:\ait-home\recipe-sources\epis\ingredients-날짜-고유값\ingredients.json`, `manifest.json`. 출력 위치 변경은 `-OutputRoot`를 사용한다. 기존 내보내기 폴더는 덮어쓰지 않는다.
- 1~1000부터 순차 요청하고 응답 totalCnt에 맞춰 마지막 범위를 줄인다. 모든 행 번호·재료 순번 고유성·필수 분량 필드·전체 건수 일치를 확인한 뒤 저장한다.
- 인증·네트워크 오류, 행 누락·중복·수집 중 건수 변경·필드 자체 누락은 실패로 끝낸다. 원문 분량의 빈 문자열/null은 보존하고 manifest.json의 missingQuantityCount/missingQuantityRows에 건수·행 번호·레시피 ID·재료 순번을 기록한다. 자동 재시도·이어받기는 구현하지 않았다. 파일 저장 도중 실패하면 새 출력 폴더에 일부 파일이 남을 수 있으므로 `저장 완료`와 종료 성공을 확인한다.
- 원문 재료 필드를 그대로 보존한다. manifest의 확보 시각은 데이터 기준일을 의미하지 않는다. 원본 기준일은 unknown으로 둔다.
- 기본정보와 과정정보는 이 도구의 수집 대상이 아니다. 세 자료를 확보한 뒤 결합·추천 편입을 진행한다.

독립 검사 명령: `node --test scripts/downloadEpisIngredients.checks.mjs`. 앱의 Vitest 검사와 별도로 실행한다. 현재 사용자 키로 전체6,104행을 수집한 결과는 미확인이다.

후속 확인: 사용자 수집 결과 ingredients-20261005-015434-8a9035의 실제 파일을 검사해6104행·고유 RECIPE_ID575개·빈 분량16행, 행 번호/재료키/해시/manifest 일치를 확인했다. 앞 문장의 미확인은 수집 성공 전 상태다. 기본/과정 파일 확보와 제품 편입은 아직 남아 있다.

## 확보 완료 후 재생성

사용자가 기본CSV537개·과정CSV3022행을 제공했다. 재료6104행과 함께 공식 샘플 JSON의 현재 totalCnt에 일치한다. 메뉴 기본정보는537개이며 재료/과정의575개 ID 중38개는 기본정보가 없어 제외한다. 원본은 Downloads와 저장소 밖 recipe-sources에 그대로 보존한다. 파일명 날짜와 확보일은 원본 데이터 기준일이 아니므로 기준일unknown을 유지한다.

Node24에서 다음 명령으로 같은 생성 파일을 재현한다. 다른 PC에서는 세 입력 경로와 확보일을 실제 자료에 맞게 지정한다.

```powershell
node scripts/generateEpisCatalog.mjs "C:\Users\User\Downloads\레시피+기본정보_20261005.csv" "D:\ait-home\recipe-sources\epis\ingredients-20261005-015434-8a9035\ingredients.json" "C:\Users\User\Downloads\레시피+과정정보_20261005.csv" "src/data/episRecipes.ts" "2026-10-05"
```

변환 결과467개와 제외70개의 ID·사유·CSV 복구 수·원본SHA256은 EPIS_RECIPE_IMPORT_SUMMARY에 기록한다. 생성 파일을 수기로 수정하지 않는다. 숫자/개/큰술/약간 등 원문 분량을 그대로 쓰며 빈 분량 레시피는 제품에서 제외한다. 원본 수집기의16행 공백 허용과 제품 편입의 분량 검증은 서로 다른 단계다.

## 확보 후 처리 계약

- 기본정보의 RECIPE_ID, RECIPE_NM_KO, QNT, COOKING_TIME, LEVEL_NM 등을 보존한다.
- 재료정보의 RECIPE_ID, IRDNT_SN, IRDNT_NM, IRDNT_CPCTY, IRDNT_TY_CODE/IRDNT_TY_NM을 보존한다.
- 과정정보의 RECIPE_ID, COOKING_NO, COOKING_DC, STEP_TIP을 보존한다.
- 세 자료를 RECIPE_ID로 결합하고 원문 재료·분량과 조리 순서를 확인한다. ID가 다른 자료의 행 번호로 결합하지 않는다.
- sample 키는 서비스별 처음 5행 확인용이다. 재료/과정의 5행은 레시피 5개의 전체 조리법을 뜻하지 않는다. 전체 수집에는 정상 발급 키와 페이지 누락 검사가 필요하다.
- 출처별 ID를 구분하고 중복 메뉴는 이름만으로 합치지 않는다. 기존 식약처 레시피와 재료·분량·과정을 비교해 중복 여부를 판단한다.
- 필수 재료를 삭제하거나 양념을 자동 보유로 처리하지 않는다. ‘약간’ 같은 원문 분량은 유지하며 g·인분을 추정하지 않는다. ‘안심’처럼 축종이 불명확한 재료는 임의로 돼지/소에 매핑하지 않는다.
- 원본 해시·확보일·자료 기준일·전체/편입/제외 수와 제외 사유를 기록하고 재생성 절차를 준비한다. API 키는 앱 번들에 포함하지 않는다.

## 추가 후보와 한계

| 후보 | 근거 | 현재 상태 |
| --- | --- | --- |
| 농식품 올바로 메뉴젠 | [공식 API 안내](https://www.nics.go.kr/food/kfi/openapi/useNewGuidance)의 음식·재료 및 조리정보 | 전체 응답·사용 조건·중복률 확인 전, 2차 후보 |
| 농촌진흥청 이달의 음식 | [공식 데이터 안내](https://www.data.go.kr/data/15033496/openapi.do) | 계절 음식 보완 후보, 실제 분량·매핑 적합성 확인 전 |
| 기존 식약처 COOKRCP01 원본 | [공식 API 안내](https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=COOKRCP01) | 사용자 제공 압축 원본1156행 복구·기존888개 재현 확인. 기준일unknown; 위 복구 검증 참고 |

확보 우선순위는 EPIS 세 자료 → 일상 조합에 대한 추천 검증 → 필요하면 메뉴젠/계절 음식이다. 추가 출처가 현재 추천 공백을 해결하는지는 전체 자료 확보 전 확정할 수 없다.
