# 검증 결과: 식품안전나라 CSV 레시피 카탈로그

> 2026-10-04 정정: 아래는 2026-10-01 당시 기록이다. 실제 재료 카탈로그는 95개이며 100개 표기는 오류다. 현재 clone은 `D:\ait-home\ait-FridgePick`이고 원본 CSV는 없다. 과거 경로·Junction·로그 지시는 현재 환경에 적용하지 않는다. 최신 작업은 [문서 안내](../README.md)를 따른다.

기준일: 2026-10-01 / 브랜치: `feature/public-recipe-catalog`

## 데이터 이용 조건

- 공공데이터포털의 [식품의약품안전처 조리식품의 레시피 DB](https://www.data.go.kr/data/15060073/openapi.do)는 이용허락범위를 “제한 없음”으로 표시한다.
- 공공데이터포털의 [이용정책](https://www.data.go.kr/ugs/selectPortalPolicyView.do)은 데이터에 포함된 제3자 권리를 별도로 확보하도록 안내한다. 따라서 원본 이미지 필드는 앱에 복사하지 않고, 정규화한 텍스트에 제공기관·데이터셋·원본 ID·출처 URL을 남긴다.
- [식품안전나라 COOKRCP01 안내](https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=COOKRCP01)와 [식약처 저작권 정책](https://www.mfds.go.kr/wpge/m_34/de010803l001.do)도 검토 자료에 포함했다. 개별 데이터 권리를 포괄적으로 보증하는 문구는 추가하지 않았다.
- 런타임 API 호출이나 인증키 사용은 없다. CSV 원본은 Git ignore 대상이며 앱 카탈로그에는 키가 없다. 이번 세션에 인증키를 입력받지 않았다.

## 실제 CSV 및 생성 결과

| 항목 | 결과 |
| --- | ---: |
| 입력 파일 | 로컬 `COOKRCP01.csv` |
| 인코딩·열 | UTF-8 BOM, 55열 |
| 원본 행·고유 `RCP_SEQ` | 1,156행·1,156개 |
| 빈 레시피명 | 0 |
| 빈 재료 설명 | 3 |
| 조리 단계가 없는 행 | 1 |
| 데이터 기준일 | CSV에 없음. 생성 요약은 `unknown` |
| 포함 | 888 |
| 제외 | 268 |
| 제외 사유 | 매핑률 미달 255, 매핑된 재료 없음 12, 조리 단계 없음 1 |
| 최종 카탈로그 | 기존 20 + 공개 888 = 908 레시피, 100 재료 |

생성기는 `node --experimental-strip-types scripts/generateRecipeCatalog.mjs <CSV 경로> [출력 경로] [데이터 기준일 YYYY-MM-DD]`로 실행했다. 원본 CSV는 저장소 외부에 두고, 임시 출력 파일과 `src/data/publicRecipes.ts`의 SHA-256이 일치해 생성 결과가 재현됨을 확인했다. 원본 CSV 자체는 변경 목록·생성 데이터에 포함하지 않았다.

## 요구사항별 검증

| ID | 확인 항목 | 결과 |
| --- | --- | --- |
| FSK-01 | 출처 재사용 조건 | 통과. 개별 포털 항목의 “제한 없음” 표시를 확인하고 출처·원본 ID를 보존. 제3자 권리 자산인 이미지는 미포함 |
| FSK-02 | 인증키·원본 보호 | 통과. 앱은 정적 데이터만 사용하며 키를 입력받거나 저장하지 않음. `/COOKRCP01.csv` ignore 적용 확인 |
| FSK-03 | CSV 파싱 | 통과. BOM·55열·1,156행·고유 ID 1,156개와 빈 재료·단계 수를 확인 |
| FSK-04 | 재료 정규화 | 통과. 명시적 별칭만 매핑하고 미지원 필수 재료를 별도 기록. 양념장·소스 등은 필수로 처리하고 고명·장식·토핑·곁들임만 선택 처리. 매핑률 60% 미만 행은 제외 |
| FSK-05 | 추적성 | 통과. `fsk_<RCP_SEQ>` ID, 제공기관, 데이터셋, 원본 ID, 출처 URL, 원문 재료 설명을 저장. CSV에 데이터 기준일이 없어 `unknown`으로 기록 |
| FSK-06 | 카탈로그 무결성 | 통과. 기존 20개 보존, 전체 ID 고유, 필수·선택 재료 ID가 100개 카탈로그에 존재 |
| FSK-07 | 추천 효과 | 기록 완료. 비교 기준 및 제한은 아래 참조. 고정 대표 10개 입력의 무후보 비율은 3/10으로 같고, seed 합성 표본 100개에서는 94%→89%로 감소 |
| FSK-08 | 앱인토스 품질 | 통과. 51 테스트·TypeScript·lint·Vite/AIT 빌드 통과, AIT DevTools 모의 환경 320×640에서 선택·결과 확인. 실제 Toss 업로드는 하지 않음 |

## 추천 후보 비교 방법과 결과

추천 임계값 60%는 기존과 동일하게 유지했다. 같은 재료 선택 배열을 기존 `LOCAL_RECIPES`와 통합 `RECIPES`에 넣고, `getRecipeCandidates` 반환 수와 후보 없음 여부를 비교했다.

1. 대표 재료 선택 10개: `kimchi+cooked_rice+egg+green_onion`, `potato+onion+carrot+cooking_oil`, `pork+kimchi+onion+garlic+gochujang+cooked_rice`, `chicken+potato+onion+carrot+soy_sauce`, `mushroom+tofu+zucchini+green_onion+soy_sauce`, `shrimp+egg+tofu+chives+garlic`, `pasta+mushroom+milk+cheese+butter`, `beef+onion+bell_pepper+soy_sauce+garlic`, `cabbage+bean_sprout+pork+gochujang+sesame_oil`, `spinach+chicken+egg+cooked_rice+sesame_oil`. 기존·통합 모두 3/10 조합에서 후보가 없었고 평균 후보 수는 각각 2.0개였다.
2. Mulberry32 seed `20261001` 합성 표본 100개: 카테고리별 재료 배열에서 매 입력마다 단백질 1개, 서로 겹치지 않는 채소 2개, 탄수화물 1개, 계란/유제품 1개를 순서대로 균등 추출했다. 기존 20개 레시피는 94/100(94%)에서 후보가 없었고, 통합 카탈로그는 89/100(89%)이었다. 평균 후보 수는 0.11개에서 0.16개로 증가했다.

두 번째 방법은 실제 이용자의 냉장고·선택 분포가 아니라 카탈로그 범위를 확인하기 위한 합성 표본이다. 이번 재계산은 현재 `INGREDIENTS` 배열의 카테고리 순서와 Mulberry32 seed를 사용했다. 이전 91%→86% 값은 추출 구현이 남아 있지 않아 새 절차로 재현할 수 없으므로 이 최신 수치로 대체했다. 따라서 이 결과만으로 실제 무결과율이 충분히 낮아졌다고 결론내리지 않는다.

## 자동 검증·빌드

- 전체 Vitest: `& .\node_modules\.bin\vitest.cmd run` — 7개 파일, 51/51 통과.
- TypeScript: `& .\node_modules\.bin\tsc.cmd -b` — 종료 코드 0.
- lint: `& .\node_modules\.bin\oxlint.cmd` — 종료 코드 0. 기존 `src/hooks/useInAppAds.tsx:54` 경고 1건.
- Vite: `& .\node_modules\.bin\vite.cmd build` — 통과. JavaScript 청크 2,371.07 kB(gzip 636.50 kB), 500 kB 초과 청크 경고.
- AIT: `& .\node_modules\.bin\ait.cmd build` — 통과. 생성된 `ait-fridgepick.ait` 파일은 959,551 B.
- 생성 파일 재현성: 실제 CSV로 생성한 임시 출력과 `src/data/publicRecipes.ts` SHA-256이 동일. 생성 요약에 입력 파일명, 매핑률 기준 상수, 데이터 기준일(`unknown`)을 기록한다.
- 원문 조리 단계 6,717개 중 17개에 문장부호 뒤 `a`~`d` 접미가 붙어 있었다. 정규화 시 접미를 제거하고 회귀 테스트를 추가했으며, 재생성된 카탈로그에서 해당 표기가 남지 않았음을 확인했다.
- 시스템 `npm`은 존재하지 않는 `npm-cli.js` 경로를 참조해 사용할 수 없어, 저장소 `node_modules`의 로컬 실행 파일을 사용했다.
- 카탈로그 생성기는 Node.js `--experimental-strip-types` 기능을 사용하므로 Node.js 22.6 이상이 필요하다. 이번 검증은 Node.js 24.21.0에서 수행했다.

## 번들 크기 비교

공통 기준 커밋 `155e496e7c03c5469832e6c1453b6f6123db41b9`의 소스를 임시 경로에서 동일한 Node·Vite·AIT 도구로 빌드했다. Vite 출력은 HTML·CSS·JS의 합계이며 AIT 값은 생성된 `.ait` 파일 크기다.

| 산출물 | 기준 | 공개 카탈로그 | 증가 |
| --- | ---: | ---: | ---: |
| AIT `.ait` | 715,371 B | 959,551 B | 244,180 B (+34.1%) |

Vite JavaScript 청크는 2,371.07 kB(gzip 636.50 kB)이며 500 kB 초과 경고가 표시됐다. 실제 Toss 테스트 업로드 및 WebView 시작 속도 측정은 하지 않았다.

## 320×640 CSS px 화면 확인

- AIT DevTools v3.6.0가 붙은 로컬 개발 화면에서 `innerWidth=320`, `innerHeight=640`, 문서 `scrollWidth=320`을 확인했다. 재료 선택 화면의 모든 선택 버튼·카테고리 버튼 높이는 44px 이상이었다.
- 카테고리 전환, 재료 5개 선택, 추천 실행, 보유·부족 재료 표시, 원문 재료와 분량, 식약처 출처와 원본 ID를 확인했다. 길이가 긴 결과도 세로 스크롤로 확인했고 하단 “재료 바꾸기” 버튼이 작동하며 선택 상태가 유지됐다.
- AIT DevTools 패널은 `sandbox` 모드, safe area top 54/bottom 34를 표시했다. 실제 Toss WebView 업로드 검증은 수행하지 않았다.
- 일반 Vite preview와 DevTools 개발 화면의 콘솔에서 Toss 런타임이 없는 브라우저의 `SafeAreaInsets` 오류가 기록됐다. 화면 전환과 데이터 표시에는 영향이 없었고, 실제 Toss 플랫폼에서의 런타임 오류 여부를 이 로컬 검증으로 판단하지 않는다.

## 남은 품질 한계

- 대표 10개 고정 입력의 후보 없음 비율이 30%에서 변하지 않았다. 합성 균등 표본에서도 통합 카탈로그 기준 89% 입력에 후보가 없다.
- 공개 데이터가 기존 재료로 60% 이상 연결된다는 것은 추천 데이터 품질 전체를 보증하지 않는다. 재료 해석은 원문을 결과 화면에 함께 표시해 확인 가능하게 했고, 향후 실제 사용자 선택 통계를 바탕으로 매칭 기준이나 추천 표현을 별도 작업으로 검토할 수 있다.
- 이번 검증은 기능 브랜치의 앱 번들 빌드와 로컬 DevTools 화면까지다. 콘솔 업로드, 검수 제출, 실제 Toss 테스트 후보의 검증은 하지 않았다.
