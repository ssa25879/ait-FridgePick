import { parseCsvRows } from "./recipeCsv.ts";
import type { RecipeCsvRecord } from "./recipeCsv";
import { isRecipePantryStaple, mapRecipeIngredientName, MINIMUM_PUBLIC_RECIPE_COVERAGE } from "./recipeCatalog.ts";
import { inferRecipeDifficulty } from "../utils/recipeDifficulty.ts";
import type { Recipe } from "../types/recipe";

export interface EpisIngredient {
  RECIPE_ID: number | string;
  IRDNT_SN: number | string;
  IRDNT_NM: string;
  IRDNT_CPCTY: string | null;
  IRDNT_TY_NM: string;
}

const BASIC_HEADERS = ["레시피 코드 (SEQ_RECIPE)", "레시피 이름(한글)", "분량"];
const STEP_HEADERS = ["레시피 코드", "요리설명순서", "요리설명", "과정 이미지 URL", "과정팁"];

export function parseEpisCsv(text: string, kind: "basic" | "steps") {
  const quoteRepairs = kind === "steps" ? (text.match(/종이위에 "ㅍ" 모양/g) ?? []).length : 0;
  // Repair only the observed invalid CSV quotation; preserve the original sentence.
  const rows = parseCsvRows(kind === "steps" ? text.replaceAll('종이위에 "ㅍ" 모양', '종이위에 ""ㅍ"" 모양') : text);
  const headers = rows.shift()?.map(value => value.trim());
  if (!headers || new Set(headers).size !== headers.length || headers.some(value => !value)) throw new Error("EPIS CSV 헤더 오류");
  for (const field of kind === "basic" ? BASIC_HEADERS : STEP_HEADERS) {
    if (!headers.includes(field)) throw new Error(`EPIS CSV 필수 열 누락: ${field}`);
  }
  let tipCommaRows = 0;
  const records = rows.map((original, index) => {
    let values = original;
    if (kind === "steps" && values.length > headers.length && headers.at(-1) === "과정팁" && headers.length === 5 &&
      (values[3].trim() === "" || /^https?:\/\//.test(values[3]))) {
      // Provider export leaves the final tip unquoted even when it contains commas.
      values = [...values.slice(0, 4), values.slice(4).join(",")];
      tipCommaRows++;
    }
    if (values.length !== headers.length) throw new Error(`EPIS CSV ${index + 2}행 열 수 불일치`);
    return Object.fromEntries(headers.map((header, position) => [header, values[position]])) as RecipeCsvRecord;
  });
  return { records, repairs: { quoteRepairs, tipCommaRows } };
}

export function buildEpisCatalog(basic: RecipeCsvRecord[], ingredients: EpisIngredient[], steps: RecipeCsvRecord[]) {
  const ingredientGroups = new Map<string, EpisIngredient[]>();
  const stepGroups = new Map<string, RecipeCsvRecord[]>();
  for (const row of ingredients) {
    const id = String(row.RECIPE_ID);
    ingredientGroups.set(id, [...(ingredientGroups.get(id) ?? []), row]);
  }
  for (const row of steps) {
    const id = row["레시피 코드"].trim();
    stepGroups.set(id, [...(stepGroups.get(id) ?? []), row]);
  }
  const recipes: Recipe[] = [];
  const excluded: { sourceId: string; reason: string }[] = [];
  const seen = new Set<string>();
  for (const record of basic) {
    const sourceId = record["레시피 코드 (SEQ_RECIPE)"].trim();
    if (!/^\d+$/.test(sourceId) || seen.has(sourceId)) throw new Error("EPIS 기본정보 ID 오류 또는 중복");
    seen.add(sourceId);
    const name = record["레시피 이름(한글)"].trim();
    const parts = [...(ingredientGroups.get(sourceId) ?? [])].sort((a, b) => Number(a.IRDNT_SN) - Number(b.IRDNT_SN));
    const process = [...(stepGroups.get(sourceId) ?? [])].sort((a, b) => Number(a["요리설명순서"]) - Number(b["요리설명순서"]));
    const mapped = new Set<string>(), unmapped = new Set<string>();
    for (const part of parts) {
      if (isRecipePantryStaple(part.IRDNT_NM)) continue;
      const ingredientId = mapRecipeIngredientName(part.IRDNT_NM);
      if (ingredientId) mapped.add(ingredientId);
      else unmapped.add(part.IRDNT_NM.trim());
    }
    const coverage = mapped.size / (mapped.size + unmapped.size);
    const reason = !name ? "missing-name" : !parts.length || !mapped.size ? "missing-ingredients" :
      parts.some(part => !part.IRDNT_CPCTY?.trim()) ? "missing-quantity" :
      coverage < MINIMUM_PUBLIC_RECIPE_COVERAGE ? "low-ingredient-coverage" :
      !process.length ? "missing-steps" :
      process.some((row, index) => Number(row["요리설명순서"]) !== index + 1 || !row["요리설명"].trim()) ? "invalid-step-sequence" :
      new Set(parts.map(part => String(part.IRDNT_SN))).size !== parts.length ? "duplicate-ingredient-sequence" : undefined;
    if (reason) { excluded.push({ sourceId, reason }); continue; }
    const recipeSteps = process.map(row => row["요리설명"].trim() + (row["과정팁"]?.trim() ? `\n팁: ${row["과정팁"].trim()}` : ""));
    const requiredIngredients = [...mapped], unmappedRequiredIngredients = [...unmapped];
    recipes.push({
      id: `epis_${sourceId}`, name, requiredIngredients, optionalIngredients: [], steps: recipeSteps,
      unmappedRequiredIngredients,
      difficulty: inferRecipeDifficulty({ steps: recipeSteps, requiredIngredients, unmappedRequiredIngredients }),
      sourceIngredientText: [record["분량"].trim() ? `원문 분량: ${record["분량"].trim()}` : "",
        ...parts.map(part => `${part.IRDNT_TY_NM}: ${part.IRDNT_NM} ${part.IRDNT_CPCTY}`)].filter(Boolean).join("\n"),
      source: {
        provider: "농림수산식품교육문화정보원", dataset: "레시피 기본정보·재료정보·과정정보", sourceId,
        sourceUrl: "https://www.data.go.kr/data/15057205/openapi.do",
        usageScope: "공공데이터포털 이용허락범위 제한 없음 표시 확인(2026-10-05)",
      },
    });
  }
  return { recipes, excluded,
    orphanIngredientRecipeIds: [...ingredientGroups.keys()].filter(id => !seen.has(id)).sort(),
    orphanStepRecipeIds: [...stepGroups.keys()].filter(id => !seen.has(id)).sort(),
  };
}
