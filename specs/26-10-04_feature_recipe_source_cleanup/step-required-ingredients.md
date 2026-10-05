# RSC-13 조리 단계 누락 재료의 준비 목록 반영

2026-10-05, 로드맵13단계 데이터 보완·14단계 기기 피드백 문구 보완. 사용자 승인: 조리 단계에서 실제 사용이 명확한 재료를 조리에 필요한 목록에 추가하고,지원 재료의 보유 여부와 미지원 재료 이름을 추가 준비 영역에 반영한다. 원문 분량·종류가 불명확한 경우에는 확인 안내를 유지한다.

## 원인과 설계

RSC-12는 원문 불일치 안내201개를 붙이고 준비 완료에서 제외했지만 requiredIngredients/unmappedRequiredIngredients에는 단계상 누락을 추가하지 않았다. 이 때문에 두부 달걀전의 달걀·소금 등이 확인 안내에만 나타나고 부족 재료 계산에는 빠졌다. 이번 RSC-13은 **생성 원본의 분량·단계·출처 보존**과 **앱의 준비 목록 보완**을 구분해 이전의 준비 목록 불변 방침을 대체한다.

- recipeStepIngredients.ts의 원문 이름192개 메뉴 목록을 recipes.ts의 합성 RECIPES에 적용한다. 단순 검색어/안내 문장 파싱으로 재료를 자동 추가하지 않는다.
- 기존 등록 필수 재료와 신규 지원 재료의 합집합,기존 미지원 이름과 신규 미지원 이름의 합집합을 구성한다. 중복을 제거하고 필수로 이동한 재료는 선택 목록에서 제거한다. 난이도는 실제 준비 재료 수로 다시 계산한다.
- 통마늘→마늘,녹말물→물녹말은 검토된 단계 보완에만 적용한다. 전역 별칭은 바꾸지 않는다.
- 종류 없는 기름·육수와 양지·생강청·호박잎·소고기육수·팔각·골뱅이·핫소스·다시물·홍합은 특정 지원 재료로 임의 변환하지 않는다. 미지원 이름으로 표시한다.
- 원문확인 안내201개는 유지한다. 추가 재료를 선택해도 누락 분량·구성·원문 충돌의 확인 필요성을 지우지 않는다. sourceIngredientText/steps/source와 생성 publicRecipes.ts/episRecipes.ts는 변경하지 않는다.
- 매칭60%·주재료 방식은 유지하지만 원문 주재료 구분이 없는 메뉴는 새 준비 재료가 분모에 포함되어 후보 수가 바뀔 수 있다. 준비 여부와 매칭률을 같은 값으로 해석하지 않는다.

## 범위와 보류

192개 메뉴의 각 구조화 이름이 원본 조리 단계에 등장하는지 전수 대조했다(공백 정규화). 그 중 실제 목록 변경189개,신규 지원 ID223회·신규 미지원 이름45회다. 나머지3개는 기존의 지원/미지원 재료와 이미 같은 항목이다. 이름의 단계 포함 검사는 문맥 검토를 대체하지 않으며 기존 [EPIS 검토](./ingredient-review-followup.md)/[식약처 검토](./mfds-remaining-review.md)의 판정을 전제로 한다.

아래9개는 새 재료를 확정할 근거가 충분하지 않아 목록 추가 없이 원문 확인 안내를 유지한다:

|ID|보류 이유|
|---|---|
|fsk_586|목록의 쌀을 단계에서 밥으로 사용,밥 짓기 준비 설명 없음|
|fsk_587|목록과 단계의 주재료·소스가 전반적으로 불일치|
|fsk_588|목록과 단계의 주재료·소스가 전반적으로 불일치|
|fsk_597|단계의 주먹밥이 메뉴와 맞는지 불명확|
|fsk_693|다슬기/호박잎 목록과 수박/소면 조리 내용 불일치|
|fsk_1086|목록의 현미를 현미밥으로 쓰지만 준비 설명 없음|
|fsk_2953|목록의 다시마로 육수를 준비하는 과정 생략|
|fsk_3462|다시팩으로 만든 육수와 다시마 육수의 구성 불명확|
|fsk_3568|닭고기/스파게티 목록과 가지/현미밥/참깨 소스 내용 불일치|

부분 충돌 메뉴는 명확한 추가 항목만 반영했다. fsk_267은 양지·식용유만 추가,육수 분량 충돌은 유지. fsk_393은 흰 후추만 추가,삼치/참치 충돌은 유지. fsk_559는 기름만 추가,양상추/양배추 중 무엇인지 임의 선택하지 않음. fsk_596은 소금·후추·식초만 추가,소고기/닭고기 충돌은 유지. fsk_832는 참깨만 추가,곤약/도토리묵 충돌은 유지.

## 검증

- 신규 실패 조건3개를 수정 전 실패로 확인:두부 달걀전 달걀/소금,채소치즈죽 버터/우유/육수,종류 없는 기름.
- 최종 전체14파일200개 통과. 기존 원문 보존 계약은 생성 원본 보존·기존 필요 재료 제거 금지로 보완했고 실제 원문/출처/단계 검사를 유지했다.
- TypeScript/Vite/AIT 기본 빌드 성공,lint 종료0/기존 useInAppAds54경고1개. 이 변경은 수집/생성 스크립트를 수정하지 않아 기존 스크립트10개 검사를 반복하지 않았다.
- 전체1359개/안내201개 유지,95개 전체 선택·60% 후보943→938,준비완료126 유지/추가준비817→812. 김치+밥 후보3개 유지. 후보 감소는 추가 준비 항목이 계산에 반영된 결과이며 실제 사용자 성공률 개선 수치가 아니다.
- 실제 production 브라우저320px:햄/양파/파프리카/밥/치즈/파슬리/소금/후추로 채소치즈죽의 추가 준비 버터·우유·육수 확인. 버터/우유 선택 후 동일 메뉴의 부족 목록은 육수만 남음. 원문 분량·확인 안내 유지. 검색 안내1회,320/393px 가로 넘침 없음. 브라우저 영구저장/실기기 검증은 아님.
- 문구 승인4항목 적용:더 준비할 재료/아래 재료를 추가해야 만들 수 있어요/레시피에 필요한 재료를 모두 선택했어요/재료 추가가 필요한 메뉴. G6 사실·행동 안내와 어투를 점검했고320/393px 줄바꿈을 확인했다. 원문 상세에 남은 필수재료 표현은 제공기관의 원문이다.
- 기본 AIT9entry/JS2개 dist바이트 동일,실제 광고ID형식0/테스트ID1파일. deployment01a10bec-a4e4-7f3d-9592-cae746547bc5/1113364bytes/SHA256aacbaa84e6a04d34c06292b19e421cb5bf606d28b3773f8031d562a7d533aae9. 홈1260.56/gzip399.45kB·추천1868.81/gzip387.74kB.

보존 경로 D:/ait-home/fridgepick-cook-steps-backup-20261005:수정전 소스/문서,step-supplement-validation.json(192개 원문·단계·추가 목록),bundle-proof.json,latest.ait/latest-dist,320/393px 전후 화면. 미커밋·미푸시. 새 번들 기기 QA는 별도로 확인한다.

최신 테스트20261005-16:PUT200/업로드완료true/CREATED/failureReason null/isTested true/deployed false. 본인 푸시와 [PC QR](https://apps-in-toss.toss.im/workspace/96603/mini-app/80586/app-build?testDeploymentId=01a10bec-a4e4-7f3d-9592-cae746547bc5&testVersionName=20261005-16) 준비 완료. isTested는 환경 준비다. 이전15는 이번 보완 전 버전이며 최신16 기기QA는 미확인이다.

## 메뉴별 반영 이름

이름은 원문 단계 표기이며 새 지원 ID/미지원 이름은 보완 직전 합성 카탈로그 대비 추가분이다. 분량을 임의 생성하지 않았다.

|ID / 메뉴|단계에서 확인한 이름|신규 지원 ID|신규 미지원 이름|
|---|---|---|---|
|fsk_89 시금치 우유 소스와 그린매쉬드포테이토|소금|salt|-|
|fsk_163 꼬막 달래 된장 무침|소금|salt|-|
|fsk_219 해물볶음밥|식용유, 참기름, 고추장|cooking_oil, sesame_oil, gochujang|-|
|fsk_220 토마토카레 채소볶음밥|식용유|cooking_oil|-|
|fsk_231 두부달걀덮밥|식용유|cooking_oil|-|
|fsk_237 삼색꼬치구이|식용유|cooking_oil|-|
|fsk_245 계만두|소금, 기름|salt|기름|
|fsk_258 두부곤약조림|식초, 올리브유|vinegar, cooking_oil|-|
|fsk_260 카레가자미조림|식용유|cooking_oil|-|
|fsk_261 타콤소스닭조림|식용유|cooking_oil|-|
|fsk_263 관자해장국|식용유|cooking_oil|-|
|fsk_267 양지해장국|양지, 식용유|cooking_oil|양지|
|fsk_277 나가사키부대찌개|식초, 식용유|vinegar, cooking_oil|-|
|fsk_297 아몬드치킨볼|식용유|cooking_oil|-|
|fsk_300 콩고기샐러드|식용유|-|-|
|fsk_307 로제소스라면|식용유|cooking_oil|-|
|fsk_331 해초갈비찜|청주|cooking_wine|-|
|fsk_342 간편콩국수|당근|carrot|-|
|fsk_357 삼합잡채|생강청, 배|pear|생강청|
|fsk_363 미역 닭가슴살전|소금, 후추|salt, black_pepper|-|
|fsk_377 실곤약냉파스타|올리브오일|-|-|
|fsk_378 명란프리타타|후추|black_pepper|-|
|fsk_393 맛간장삼치구이|흰 후추|black_pepper|-|
|fsk_396 까르보나라뇨끼|밀가루|flour|-|
|fsk_410 전복내장밥|청주|cooking_wine|-|
|fsk_415 매실동치미|레몬즙|lemon|-|
|fsk_425 새콤한연어샐러드|올리브오일, 후추|cooking_oil, black_pepper|-|
|fsk_448 홍합죽|소금|salt|-|
|fsk_454 닭고기채소스파게티|소금|salt|-|
|fsk_486 실곤약팟타야|기름|-|기름|
|fsk_494 떡갈비통치미국수|소금|salt|-|
|fsk_508 햄버거스테이크|기름|-|기름|
|fsk_514 연어차우더스프|소금|salt|-|
|fsk_538 생선카레튀김|기름|-|기름|
|fsk_557 들깨죽|기름|-|기름|
|fsk_559 룰룰랄라|기름|-|기름|
|fsk_563 미니함박스테이크|기름|-|기름|
|fsk_565 봄옷을 입은 닭|기름|-|기름|
|fsk_566 삼계치킨|달걀, 기름|egg|기름|
|fsk_567 삼계치킨롤|소금|salt|-|
|fsk_581 파프리카더덕소고기깻잎롤|당근, 대파|carrot, green_onion|-|
|fsk_582 해물아란치니|기름|-|기름|
|fsk_583 호박잎삼계|호박잎|-|호박잎|
|fsk_585 닭고기 완자삼계죽|소금|salt|-|
|fsk_596 방울토마토를 곁들인 너비아니구이와 쌈밥|소금, 후추, 식초|salt, black_pepper, vinegar|-|
|fsk_602 세 가지 미니 에피타이저|소금|salt|-|
|fsk_608 카레닭 룰라이드|기름|-|기름|
|fsk_620 된장크림소스 잡곡 오므라이스|기름|-|기름|
|fsk_628 삼색샐러드와두부구이|기름|-|기름|
|fsk_631 소안심 야채 호박잎쌈|소금|salt|-|
|fsk_647 녹차와 대추밀전병|기름, 소금|salt|기름|
|fsk_657 봄날의 연못|소금|salt|-|
|fsk_666 오이냉국을 곁들인 오색쌈밥|식초, 설탕|vinegar, sugar|-|
|fsk_667 카레탄두리치킨과 닭가슴살냉채|소금, 후춧가루, 기름|salt, black_pepper|기름|
|fsk_709 배추토란국|소금|salt|-|
|fsk_728 과일겨자채|설탕|sugar|-|
|fsk_791 쌈밥|소금, 다진 마늘|salt, garlic|-|
|fsk_804 모듬탕수|다진 마늘, 참기름|garlic, sesame_oil|-|
|fsk_805 새싹 비빔밥|식용유|cooking_oil|-|
|fsk_809 고추잡채|대파, 생강|green_onion, ginger|-|
|fsk_814 도라지 검은깨 튀김|소금|salt|-|
|fsk_827 고추 장떡|고추장|gochujang|-|
|fsk_832 도토리묵 콩국|참깨|sesame|-|
|fsk_849 닭고기 바비큐|식용유|cooking_oil|-|
|fsk_853 등심 배구이|소금|salt|-|
|fsk_859 양송이버섯과 포도주스를 가미한 등심구이|소고기육수|-|소고기육수|
|fsk_869 낙지볶음면|식용유|cooking_oil|-|
|fsk_878 꽁치 양념구이|청주|-|-|
|fsk_881 낙지 잣소스 냉채|밀가루|flour|-|
|fsk_886 부추조개살 콩비지조림|소금|salt|-|
|fsk_909 김치 고구마밥|소금|salt|-|
|fsk_917 바질 고구마 옥수수빵(플렌타)|소금, 후추, 버터|salt, black_pepper, butter|-|
|fsk_958 누룽지 피자|식용유|cooking_oil|-|
|fsk_987 다시마전|기름|-|기름|
|fsk_993 시금치 돼지고기 볶음|팔각|-|팔각|
|fsk_1015 바지락 볶음면|청주|cooking_wine|-|
|fsk_1017 버섯을 넣은 가지 라자냐|소금|salt|-|
|fsk_1026 참치 쇠고기 양상추 쌈|다진 마늘, 기름|garlic|기름|
|fsk_1042 시저 샐러드|기름|-|기름|
|fsk_1045 차가운 당근 수프|후추|black_pepper|-|
|fsk_1046 태국식 불고기 샐러드|소금, 후추, 밥|salt, black_pepper, cooked_rice|-|
|fsk_1062 함박스테이크 볼 밥|밥|cooked_rice|-|
|fsk_1066 신호등 통통이(어린이 곤약삼색주먹밥)|마늘|garlic|-|
|fsk_1070 순창 고추장 두부강정|기름|-|기름|
|fsk_1074 그린커리|기름|-|기름|
|fsk_1079 현미 입은 미트볼|식용유|cooking_oil|-|
|fsk_1082 영유아를 위한 고소한 닭꼬치|식용유|cooking_oil|-|
|fsk_1098 단호박치즈스틱|소금|salt|-|
|fsk_2958 일본식 계란말이|기름|-|기름|
|fsk_2961 유부초절임|후추|black_pepper|-|
|fsk_2964 단호박 마전|식용유|cooking_oil|-|
|fsk_2970 두부해물완자|기름|-|기름|
|fsk_2979 과일 먹은 닭탕수|기름|-|기름|
|fsk_2997 참치 두부 함박스테이크|식용유|cooking_oil|-|
|fsk_2999 마늘칩 감자샐러드|식용유|cooking_oil|-|
|fsk_3008 단호박 생선탕수, 키위소스|소금, 흰후추, 기름|salt, black_pepper|기름|
|fsk_3066 새뱅이찌개|들기름|perilla_oil|-|
|fsk_3067 배추된장국|참기름|sesame_oil|-|
|fsk_3069 새우살토마토스튜|기름|-|기름|
|fsk_3089 고사리파전&단감전|기름|-|기름|
|fsk_3174 오이파프리카새콤무침|소금|salt|-|
|fsk_3222 두유 크림 현미리소토|식용유|cooking_oil|-|
|fsk_3260 두부크림 관자뇨키|식용유|cooking_oil|-|
|fsk_3275 골뱅이무침과 삼겹살수육|양파, 대파, 통마늘, 알배추, 골뱅이|onion, green_onion, cabbage|골뱅이|
|fsk_3278 새우 카레 빠에야|식용유|cooking_oil|-|
|fsk_3284 닭가슴살 채소쌈|식용유|cooking_oil|-|
|fsk_3286 타이거새우 현미볶음밥|식용유|cooking_oil|-|
|fsk_834 두부 달걀전|소금, 달걀|salt, egg|-|
|fsk_32 순두부 사과 소스 오이무침|소금|salt|-|
|fsk_720 무대하무침|소금|salt|-|
|fsk_2967 소고기 무국|참기름, 고춧가루|sesame_oil, chili_powder|-|
|fsk_1060 마늘 불고기 덮밥|기름|-|기름|
|fsk_1064 대추닭살리조또|기름|-|기름|
|fsk_1073 바나나를 감싼 일본식 달걀말이|식용유|cooking_oil|-|
|fsk_1076 유자 치킨 꿔바로우|간장|soy_sauce|-|
|fsk_1088 오이 짱아지 무침|소금, 참깨|salt, sesame|-|
|fsk_836 두부 튀김 조림|소금|salt|-|
|fsk_672 해물애호박 전병말이|기름|-|기름|
|fsk_575 음메꼬꼬돌돌|기름|-|기름|
|fsk_560 매실소스를 곁들인 돼지고기만두|기름|-|기름|
|epis_120441 단호박 고등어조림|육수|-|육수|
|epis_419 북어해장국밥|밥|cooked_rice|-|
|epis_56 김치찌개|청주|cooking_wine|-|
|epis_39692 시래기돼지갈비찜|된장|doenjang|-|
|epis_492 떡만두국|소금|salt|-|
|epis_478 두부파프리카전|밀가루|flour|-|
|epis_473 무쌈말이|당근, 표고버섯|carrot, mushroom|-|
|epis_454 죽순회와미나리강회|소금|salt|-|
|epis_446 깻잎말이김치|소금|salt|-|
|epis_439 얼갈이열무물김치|감자, 찹쌀가루, 무, 배|potato, glutinous_rice_flour, radish, pear|-|
|epis_427 돌솥비빔밥|간장|soy_sauce|-|
|epis_426 낙지불고기|미나리, 참기름|water_parsley, sesame_oil|-|
|epis_415 고등어튀김케첩조림|후추, 맛술, 식용유|black_pepper, cooking_wine, cooking_oil|-|
|epis_412 맑은대구탕|대파|green_onion|-|
|epis_409 라조기|양파, 소금, 식용유, 생강|onion, salt, cooking_oil, ginger|-|
|epis_402 쟁반라면|대파, 파프리카|green_onion, bell_pepper|-|
|epis_397 떡꼬치|식초, 소금|vinegar, salt|-|
|epis_390 라조육|식용유|cooking_oil|-|
|epis_383 마파두부덮밥|육수|-|육수|
|epis_379 돈까스덮밥|소금, 후춧가루, 파인애플, 핫소스, 다시물, 간장, 설탕|salt, black_pepper, pineapple, soy_sauce, sugar|핫소스, 다시물|
|epis_369 채소스프|양배추|cabbage|-|
|epis_367 깐풍새우|설탕|sugar|-|
|epis_354 고구마그라탱|설탕|sugar|-|
|epis_347 파래무침|마늘|garlic|-|
|epis_340 상추채소무침|대파, 마늘|green_onion, garlic|-|
|epis_338 콩나물비빔밥|간장, 참기름, 깨소금, 후춧가루, 다진 파, 마늘|soy_sauce, sesame_oil, sesame, black_pepper, green_onion, garlic|-|
|epis_330 불고기찹쌀구이|다진 파, 마늘, 깨소금|green_onion, garlic, sesame|-|
|epis_329 대구탕|다시마, 마늘, 생강|kelp, garlic, ginger|-|
|epis_308 류산슬|계란|egg|-|
|epis_293 감자그라탕|우유|milk|-|
|epis_281 상추겉절이비빔밥|깨소금, 고추장, 쇠고기|sesame, gochujang, beef|-|
|epis_279 돼지고기표고볶음|간장, 참기름|soy_sauce, sesame_oil|-|
|epis_272 닭고기콩나물덮밥|생강, 간장, 참기름|ginger, soy_sauce, sesame_oil|-|
|epis_269 숙주미나리무침|식초|vinegar|-|
|epis_260 두부채소냉채|마늘|garlic|-|
|epis_259 떡잡채|간장|soy_sauce|-|
|epis_255 어묵꼬치|당근|carrot|-|
|epis_252 채소비빔소면|참기름, 소금|sesame_oil, salt|-|
|epis_250 별미밥|설탕|sugar|-|
|epis_245 사골우거지탕|소금|salt|-|
|epis_235 생태매운탕|생강|ginger|-|
|epis_233 닭고기카레튀김|빵가루|breadcrumbs|-|
|epis_224 제육배추찜|육수, 물녹말|starch|육수|
|epis_211 닭꼬치구이|소금, 후추, 식용유|salt, black_pepper, cooking_oil|-|
|epis_207 양상추튀김|소금|salt|-|
|epis_138 버섯덮밥|식용유|cooking_oil|-|
|epis_132 까르보나라스파게티|식용유|cooking_oil|-|
|epis_130 두부양념조림|소금, 식용유|salt, cooking_oil|-|
|epis_110 모듬초밥|다시마|kelp|-|
|epis_74 알탕|참기름, 미나리|sesame_oil, water_parsley|-|
|epis_68 동치미|생강|ginger|-|
|epis_16 만둣국|양파, 밀가루|onion, flour|-|
|epis_14 채소국수|소금|salt|-|
|epis_13 열무김치냉면|소금|salt|-|
|epis_12 동치미막국수|오이|cucumber|-|
|epis_9 오므라이스|버터|butter|-|
|epis_8 카레라이스|버터|butter|-|
|epis_3 잡채밥|생강|ginger|-|
|epis_444 근대된장국|후춧가루, 소금|black_pepper, salt|-|
|epis_385 우묵냉채|소금|salt|-|
|epis_90846 오이동치미|쪽파|green_onion|-|
|epis_69 갓김치|찹쌀가루|glutinous_rice_flour|-|
|epis_324 애호박무침|홍고추|chili_pepper|-|
|epis_345 해물국시|홍합, 홍고추|-|홍합|
|epis_467 크림소스파스타|바질, 식용유|basil, cooking_oil|-|
|epis_434 채소치즈죽|버터, 육수, 우유|butter, milk|육수|
|epis_407 돼지불고기|식용유|cooking_oil|-|
|epis_353 두부두루치기|설탕, 후춧가루, 녹말물|sugar, black_pepper, starch|-|
|epis_237 버섯두부찌개|생강|ginger|-|
|epis_232 가지된장찜|식용유|cooking_oil|-|
|epis_92 쇠고기장조림|당근|carrot|-|
|epis_18 두부국|육수|-|육수|
