import type { RecipeCsvRecord } from "./recipeCsv";
import { getRecipeSteps } from "./recipeCsv.ts";
import type { Recipe } from "../types/recipe";
import { inferRecipeDifficulty } from "../utils/recipeDifficulty.ts";

export interface ParsedRecipeIngredients {
  requiredIngredients: string[];
  optionalIngredients: string[];
}

const OPTIONAL_SECTIONS = new Set([
  "고명",
  "장식",
  "토핑",
  "곁들임",
]);

const REQUIRED_SECTIONS = new Set([
  "양념",
  "양념장",
  "소스",
  "드레싱",
  "밑간",
  "부재료",
]);

const NEUTRAL_SECTIONS = new Set(["재료", "기본재료", "주재료"]);
const NUMBER_PATTERN = String.raw`\d+(?:\.\d+)?(?:\/\d+)?(?:\s*[~～–-]\s*\d+(?:\.\d+)?(?:\/\d+)?)?`;
const LATIN_QUANTITY_UNITS = String.raw`(?:kg|mg|g|ml|cc|cm|mm|l|ts|t)`;
const KOREAN_QUANTITY_UNITS =
  String.raw`(?:작은술|큰술|줄기|가닥|꼬집|뿌리|토막|조각|봉지|방울|송이|포기|인분|마리|공기|컵|쪽|모|장|줄|대|단|줌|캔|팩|통|알|개|분|초|일|회|배|톨)(?:씩)?`;
const QUANTITY_PATTERN = new RegExp(
  `(?:${NUMBER_PATTERN}\\s*${LATIN_QUANTITY_UNITS}(?![a-z])|${NUMBER_PATTERN}\\s*${KOREAN_QUANTITY_UNITS}(?![가-힣])|약간|적당량|적당히|조금|한\\s*꼬집|한\\s*줌|한\\s*큰술|한\\s*작은술)`,
  "i",
);
const BARE_QUANTITY_PATTERN =
  /\s+\d+(?:\.\d+)?(?:\/\d+)?(?:\s*[~～–-]\s*\d+(?:\.\d+)?(?:\/\d+)?)?(?=$|\s*[()])/;

function findQuantityAfterIngredient(value: string): RegExpExecArray | null {
  const pattern = new RegExp(QUANTITY_PATTERN.source, "gi");
  let match = pattern.exec(value);

  while (match && match.index === 0) {
    match = pattern.exec(value);
  }

  return match ?? BARE_QUANTITY_PATTERN.exec(value);
}

function hasQuantity(value: string): boolean {
  return findQuantityAfterIngredient(value) !== null;
}

const INGREDIENT_ALIASES: Record<string, string[]> = {
  kimchi: ["김치", "배추김치", "묵은지", "신김치"],
  onion: ["양파", "다진양파", "양파다진것"],
  green_onion: ["대파", "실파", "쪽파", "파", "다진파", "다진대파"],
  garlic: ["마늘", "다진마늘", "마늘다진것", "양념다진마늘"],
  carrot: ["당근"],
  potato: ["감자"],
  zucchini: ["애호박"],
  mushroom: [
    "버섯",
    "표고버섯",
    "새송이버섯",
    "양송이버섯",
    "양송이",
    "느타리버섯",
    "팽이버섯",
    "목이버섯",
    "애느타리버섯",
    "새송이버섯기둥",
    "표고버섯기둥",
  ],
  pork: [
    "돼지고기",
    "다진돼지고기",
    "삼겹살",
    "목살",
    "앞다리살",
    "뒷다리살",
    "돼지등심",
  ],
  beef: [
    "소고기",
    "쇠고기",
    "한우",
    "소고기등심",
    "쇠고기등심",
    "다진소고기",
    "다진쇠고기",
  ],
  chicken: [
    "닭고기",
    "닭가슴살",
    "닭다리살",
    "닭안심",
    "닭다리",
    "닭고기살",
    "닭",
  ],
  ham: ["햄"],
  bacon: ["베이컨"],
  egg: ["달걀", "계란", "삶은달걀"],
  milk: ["우유"],
  cheese: ["치즈", "파마산치즈", "모짜렐라치즈"],
  butter: ["버터", "무염버터"],
  cooked_rice: ["밥", "찬밥"],
  ramen_noodles: ["라면", "라면사리"],
  pasta: ["파스타면", "스파게티면", "파스타"],
  bread: ["식빵"],
  glass_noodles: ["당면"],
  soy_sauce: [
    "간장",
    "저염간장",
    "진간장",
    "국간장",
    "맛간장",
    "양조간장",
    "저염국간장",
    "간편어간장",
    "어간장",
  ],
  gochujang: ["고추장"],
  doenjang: ["된장", "저염된장"],
  sesame_oil: ["참기름"],
  cooking_oil: [
    "식용유",
    "올리브유",
    "올리브오일",
    "카놀라유",
    "튀김기름",
    "마늘기름",
    "마늘오일",
  ],
  salt: ["소금", "천일염", "꽃소금", "저염소금", "볶은소금", "함초소금"],
  sugar: ["설탕", "요리당"],
  black_pepper: ["후추", "후춧가루", "통후추", "흰후추", "흰후춧가루"],
  vinegar: ["식초", "사과식초", "발사믹식초", "감식초", "허브식초"],
  tomato: ["토마토", "방울토마토", "홀토마토"],
  tofu: ["두부", "연두부", "순두부"],
  flour: ["밀가루", "강력분", "박력분"],
  chili_powder: ["고춧가루", "고추가루"],
  cucumber: ["오이", "오이피클", "다진오이피클"],
  lemon: ["레몬", "레몬즙", "레몬주스"],
  honey: ["꿀"],
  bell_pepper: [
    "파프리카",
    "2가지색파프리카",
    "청피망",
    "홍피망",
    "피망",
    "노랑파프리카",
    "빨강파프리카",
    "황파프리카",
    "홍파프리카",
    "노란파프리카",
  ],
  cream: ["생크림", "크림"],
  sesame: ["통깨", "참깨", "깨소금", "흑임자", "검은깨", "깨"],
  radish: ["무", "레디쉬", "래디쉬"],
  apple: ["사과"],
  perilla_leaf: ["깻잎"],
  kelp: ["다시마", "건다시마"],
  pumpkin: ["단호박"],
  ginger: ["생강", "생강즙", "다진생강"],
  chili_pepper: [
    "고추",
    "홍고추",
    "청고추",
    "청양고추",
    "붉은고추",
    "풋고추",
    "다진청고추",
    "다진홍고추",
  ],
  spinach: ["시금치"],
  syrup: ["올리고당", "물엿"],
  eggplant: ["가지"],
  shrimp: ["새우", "칵테일새우", "건새우", "새우살"],
  chives: ["부추", "조선부추", "영양부추"],
  starch: ["전분", "녹말가루", "녹말", "감자전분", "물녹말"],
  sweet_potato: ["고구마"],
  mayonnaise: ["마요네즈"],
  cooking_wine: ["맛술", "청주", "정종", "미림"],
  broccoli: ["브로콜리", "브로컬리", "브로코리"],
  cabbage: ["양배추", "배추", "배추잎", "적양배추", "알배추"],
  bean_sprout: ["숙주", "콩나물"],
  yogurt: ["요거트", "플레인요거트", "플레인요구르트", "요구르트"],
  raw_rice: ["쌀", "멥쌀", "불린쌀"],
  pear: ["배"],
  water_parsley: ["미나리"],
  glutinous_rice_flour: ["찹쌀가루"],
  walnut: ["호두"],
  jujube: ["대추"],
  breadcrumbs: ["빵가루"],
  yuzu: ["유자청"],
  pine_nut: ["잣"],
  curry_powder: ["카레가루"],
  plum_syrup: ["매실액", "매실청"],
  basil: ["바질"],
  parsley: ["파슬리", "파슬리가루"],
  bay_leaf: ["월계수잎"],
  banana: ["바나나"],
  lettuce: ["양상추"],
  peanut: ["땅콩", "다진땅콩"],
  almond: ["아몬드"],
  orange: ["오렌지"],
  rosemary: ["로즈마리"],
  squid: ["오징어"],
  asparagus: ["아스파라거스"],
  pineapple: ["파인애플"],
  beet: ["비트"],
  crown_daisy: ["쑥갓"],
  perilla_oil: ["들기름"],
  bok_choy: ["청경채"],
  glutinous_rice: ["찹쌀"],
  lotus_root: ["연근"],
  anchovy: ["멸치", "국물용멸치", "국멸치"],
  salmon: ["연어"],
  cockle: ["바지락"],
  octopus: ["주꾸미", "쭈꾸미"],
  sprouts: ["무순"],
};

const ALIAS_TO_INGREDIENT_ID = new Map<string, string>();
for (const [ingredientId, aliases] of Object.entries(INGREDIENT_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_INGREDIENT_ID.set(alias.replace(/\s+/g, ""), ingredientId);
  }
}

const PANTRY_STAPLES = new Set(["물"]);

export function mapRecipeIngredientName(name: string): string | undefined {
  return ALIAS_TO_INGREDIENT_ID.get(name.replace(/\s+/g, ""));
}

export function isRecipePantryStaple(name: string): boolean {
  return PANTRY_STAPLES.has(name.replace(/\s+/g, ""));
}

export function getRecipeIngredientAliasTargets(): string[] {
  return Object.keys(INGREDIENT_ALIASES);
}

export const MINIMUM_PUBLIC_RECIPE_COVERAGE = 0.6;

export type PublicRecipeExclusionReason =
  | "missing-name"
  | "missing-ingredients"
  | "missing-steps"
  | "low-ingredient-coverage";

export interface PublicRecipeNormalizationResult {
  recipe?: Recipe;
  exclusionReason?: PublicRecipeExclusionReason;
  unmappedRequiredIngredients: string[];
  ingredientCoverage: number;
}

const RECIPE_SOURCE_URL =
  "https://www.data.go.kr/data/15060073/openapi.do";

export function normalizePublicRecipeRecord(
  record: RecipeCsvRecord,
): PublicRecipeNormalizationResult {
  const sourceId = record.RCP_SEQ.trim();
  const name = record.RCP_NM.trim();
  const sourceIngredientText = record.RCP_PARTS_DTLS;
  const parsedIngredients = parseRecipeIngredients(record);
  const requiredIngredientIds = new Set<string>();
  const unmappedRequiredIngredients = new Set<string>();

  for (const ingredientName of parsedIngredients.requiredIngredients) {
    if (isRecipePantryStaple(ingredientName)) continue;
    const ingredientId = mapRecipeIngredientName(ingredientName);
    if (ingredientId) requiredIngredientIds.add(ingredientId);
    else unmappedRequiredIngredients.add(ingredientName);
  }

  const requiredIds = [...requiredIngredientIds];
  const unmappedNames = [...unmappedRequiredIngredients];
  const totalRequiredIngredientCount = requiredIds.length + unmappedNames.length;
  const ingredientCoverage =
    totalRequiredIngredientCount > 0
      ? requiredIds.length / totalRequiredIngredientCount
      : 0;
  const steps = getRecipeSteps(record).map((step) =>
    step.trim().replace(/([.!?])[a-d]$/, "$1"),
  );

  const excluded = (
    exclusionReason: PublicRecipeExclusionReason,
  ): PublicRecipeNormalizationResult => ({
    exclusionReason,
    unmappedRequiredIngredients: unmappedNames,
    ingredientCoverage,
  });

  if (!name) return excluded("missing-name");
  if (!steps.length) return excluded("missing-steps");
  if (!requiredIds.length) return excluded("missing-ingredients");
  if (ingredientCoverage < MINIMUM_PUBLIC_RECIPE_COVERAGE) {
    return excluded("low-ingredient-coverage");
  }

  const optionalIngredientIds = new Set<string>();
  for (const ingredientName of parsedIngredients.optionalIngredients) {
    const ingredientId = mapRecipeIngredientName(ingredientName);
    if (ingredientId && !requiredIngredientIds.has(ingredientId)) {
      optionalIngredientIds.add(ingredientId);
    }
  }

  const recipe: Recipe = {
    id: `fsk_${sourceId}`,
    name,
    requiredIngredients: requiredIds,
    optionalIngredients: [...optionalIngredientIds],
    steps,
    difficulty: inferRecipeDifficulty({
      steps,
      requiredIngredients: requiredIds,
      unmappedRequiredIngredients: unmappedNames,
    }),
    unmappedRequiredIngredients: unmappedNames,
    sourceIngredientText,
    source: {
      provider: "식품의약품안전처",
      dataset: "조리식품의 레시피 DB",
      sourceId,
      sourceUrl: RECIPE_SOURCE_URL,
      usageScope: "공공데이터포털 이용허락범위 제한 없음",
    },
  };

  return { recipe, unmappedRequiredIngredients: unmappedNames, ingredientCoverage };
}

function splitIngredientItems(text: string): string[] {
  const items: string[] = [];
  let item = "";
  let depth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const insideQuantityParentheses =
      character === "," &&
      depth > 0 &&
      hasQuantity(item) &&
      item.lastIndexOf("(") > item.lastIndexOf(")");

    if (character === "(" || character === "[") depth += 1;
    if ((character === ")" || character === "]") && depth > 0) depth -= 1;

    if ((character === "," && depth === 0) || insideQuantityParentheses) {
      const value = item.trim();
      if (value) items.push(value);
      item = "";
      continue;
    }

    if (character === "\n" || character === "\r") {
      const value = item.trim();
      if (value) items.push(value);
      item = "";
      depth = 0;
      continue;
    }

    item += character;
  }

  const value = item.trim();
  if (value) items.push(value);
  return items;
}

function normalizeSectionLabel(value: string): string {
  return value
    .replace(/^[\s●·•*-]+/, "")
    .replace(/[：:]$/, "")
    .replace(/\s+/g, "")
    .trim();
}

function extractIngredientName(value: string, recipeName: string): string {
  let item = value
    .replace(/^[\s●·•*-]+/, "")
    .replace(/^\[\s*\d+\s*인분\s*\]\s*/, "")
    .trim();

  const colonIndex = item.indexOf(":");
  if (colonIndex >= 0) {
    item = item.slice(colonIndex + 1).trim();
  }

  const quantity = findQuantityAfterIngredient(item);
  if (quantity?.index !== undefined) {
    const nameBeforeQuantity = item.slice(0, quantity.index);
    const lastOpeningParenthesis = nameBeforeQuantity.lastIndexOf("(");
    const lastClosingParenthesis = nameBeforeQuantity.lastIndexOf(")");
    item =
      lastOpeningParenthesis > lastClosingParenthesis
        ? nameBeforeQuantity.slice(0, lastOpeningParenthesis).trim()
        : nameBeforeQuantity.trim();
  }

  item = item.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "");
  item = item.replace(/\s+/g, " ").trim().replace(/[：:,·]+$/, "");

  const compactName = item.replace(/\s+/g, "");
  if (!compactName || compactName === recipeName.replace(/\s+/g, "")) {
    return "";
  }

  return item;
}

export function parseRecipeIngredients(
  record: RecipeCsvRecord,
): ParsedRecipeIngredients {
  const recipeName = record.RCP_NM ?? "";
  const ingredientText = record.RCP_PARTS_DTLS ?? "";
  const firstLine = ingredientText.split(/\r?\n/, 1)[0]?.trim() ?? "";
  const hasMultipleLines = /\r?\n/.test(ingredientText);
  const requiredIngredients: string[] = [];
  const optionalIngredients: string[] = [];
  const requiredSet = new Set<string>();
  const optionalSet = new Set<string>();
  let currentSection: "required" | "optional" = "required";

  for (const rawItem of splitIngredientItems(ingredientText)) {
    let item = rawItem.trim();
    const colonIndex = item.indexOf(":");
    const sectionLabel = normalizeSectionLabel(
      colonIndex >= 0 ? item.slice(0, colonIndex) : item,
    );

    if (
      hasMultipleLines &&
      item === firstLine &&
      !hasQuantity(firstLine) &&
      !OPTIONAL_SECTIONS.has(sectionLabel) &&
      !REQUIRED_SECTIONS.has(sectionLabel) &&
      !NEUTRAL_SECTIONS.has(sectionLabel)
    ) {
      continue;
    }

    if (OPTIONAL_SECTIONS.has(sectionLabel)) {
      currentSection = "optional";
      if (colonIndex >= 0) item = item.slice(colonIndex + 1).trim();
      else continue;
    } else if (
      NEUTRAL_SECTIONS.has(sectionLabel) ||
      REQUIRED_SECTIONS.has(sectionLabel)
    ) {
      currentSection = "required";
      if (colonIndex >= 0) item = item.slice(colonIndex + 1).trim();
      else continue;
    }

    const ingredientName = extractIngredientName(item, recipeName);
    if (!ingredientName) continue;

    const target =
      currentSection === "optional"
        ? optionalIngredients
        : requiredIngredients;
    const seen = currentSection === "optional" ? optionalSet : requiredSet;
    if (!seen.has(ingredientName)) {
      seen.add(ingredientName);
      target.push(ingredientName);
    }
  }

  return { requiredIngredients, optionalIngredients };
}
