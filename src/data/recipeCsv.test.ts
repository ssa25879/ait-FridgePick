import { describe, expect, it } from "vitest";
import { getRecipeSteps, parseRecipeCsv } from "./recipeCsv";

describe("식품안전나라 레시피 CSV 파서", () => {
  it("BOM, 인용 쉼표·큰따옴표·줄바꿈과 마지막 빈 열을 보존한다", () => {
    const csv = [
      "\uFEFFRCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01,MANUAL02,MANUAL10",
      '101,"두부, 달걀 ""한 접시""","두부 1모,\r\n달걀 2개","1. 재료를 섞어요.","2. 팬에서 익혀요.",',
      "",
    ].join("\r\n");

    const records = parseRecipeCsv(csv);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      RCP_SEQ: "101",
      RCP_NM: '두부, 달걀 "한 접시"',
      RCP_PARTS_DTLS: "두부 1모,\r\n달걀 2개",
      MANUAL10: "",
    });
    expect(getRecipeSteps(records[0])).toEqual([
      "1. 재료를 섞어요.",
      "2. 팬에서 익혀요.",
    ]);
  });

  it("조리 단계를 숫자 순서대로 정렬한다", () => {
    const csv = [
      "RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL10,MANUAL02,MANUAL01",
      "102,메뉴,재료,열 번째,두 번째,첫 번째",
    ].join("\n");

    expect(getRecipeSteps(parseRecipeCsv(csv)[0])).toEqual([
      "첫 번째",
      "두 번째",
      "열 번째",
    ]);
  });

  it("필수 열이 없으면 구체적으로 거부한다", () => {
    const csv = "RCP_SEQ,RCP_NM,MANUAL01\n101,메뉴,단계";

    expect(() => parseRecipeCsv(csv)).toThrow(/RCP_PARTS_DTLS/);
  });

  it("중복 헤더를 거부한다", () => {
    const csv = [
      "RCP_SEQ,RCP_NM,RCP_NM,RCP_PARTS_DTLS,MANUAL01",
      "101,메뉴,중복,재료,단계",
    ].join("\n");

    expect(() => parseRecipeCsv(csv)).toThrow(/중복 헤더/);
  });

  it("행의 열 수가 헤더와 다르면 거부한다", () => {
    const csv = [
      "RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01",
      "101,메뉴,재료",
    ].join("\n");

    expect(() => parseRecipeCsv(csv)).toThrow(/열 수/);
  });

  it("비어 있는 원본 ID와 중복 ID를 거부한다", () => {
    const missingIdCsv = [
      "RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01",
      ",메뉴,재료,단계",
    ].join("\n");
    const duplicateIdCsv = [
      "RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01",
      "101,첫 메뉴,재료,단계",
      "101,두 번째 메뉴,재료,단계",
    ].join("\n");

    expect(() => parseRecipeCsv(missingIdCsv)).toThrow(/원본 ID/);
    expect(() => parseRecipeCsv(duplicateIdCsv)).toThrow(/중복 원본 ID/);
  });

  it("빈 메뉴명과 재료 필드를 원본 그대로 보존한다", () => {
    const csv = [
      "RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01",
      "101,,재료,단계",
      "102,메뉴,,단계",
    ].join("\n");

    const records = parseRecipeCsv(csv);

    expect(records).toHaveLength(2);
    expect(records[0].RCP_NM).toBe("");
    expect(records[1].RCP_PARTS_DTLS).toBe("");
  });

  it("조리 단계가 없는 레코드도 보존해 후속 품질 검사를 맡긴다", () => {
    const csv = [
      "RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01,MANUAL02",
      "103,조리법 확인 필요,재료 목록,,",
    ].join("\n");

    const [record] = parseRecipeCsv(csv);

    expect(record.RCP_SEQ).toBe("103");
    expect(getRecipeSteps(record)).toEqual([]);
  });

  it("닫히지 않은 따옴표와 따옴표 뒤의 잘못된 문자를 거부한다", () => {
    const unclosedQuoteCsv =
      'RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01\n101,"메뉴,재료,단계';
    const trailingCharacterCsv = [
      "RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01",
      '101,"메뉴"x,재료,단계',
    ].join("\n");

    expect(() => parseRecipeCsv(unclosedQuoteCsv)).toThrow(
      /CSV 2행.*닫히지 않은 따옴표/,
    );
    expect(() => parseRecipeCsv(trailingCharacterCsv)).toThrow(/따옴표 뒤/);
  });
});
