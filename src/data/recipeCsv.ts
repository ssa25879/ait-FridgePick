export type RecipeCsvRecord = Record<string, string>;

const REQUIRED_HEADERS = [
  "RCP_SEQ",
  "RCP_NM",
  "RCP_PARTS_DTLS",
  "MANUAL01",
] as const;

function parseCsvRows(csvText: string): string[][] {
  const text = csvText.charCodeAt(0) === 0xfeff ? csvText.slice(1) : csvText;
  const rows: string[][] = [];
  let fields: string[] = [];
  let field = "";
  let insideQuotes = false;
  let quoteClosed = false;
  let rowNumber = 1;

  const finishRow = () => {
    fields.push(field);
    if (!(fields.length === 1 && fields[0] === "")) {
      rows.push(fields);
    }
    fields = [];
    field = "";
    quoteClosed = false;
    rowNumber += 1;
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (insideQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          insideQuotes = false;
          quoteClosed = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (quoteClosed) {
      if (character === ",") {
        fields.push(field);
        field = "";
        quoteClosed = false;
        continue;
      }

      if (character === "\r" || character === "\n") {
        finishRow();
        if (character === "\r" && text[index + 1] === "\n") {
          index += 1;
        }
        continue;
      }

      throw new Error(
        "CSV " + rowNumber + "행: 따옴표 뒤에는 쉼표나 줄바꿈만 올 수 있습니다.",
      );
    }

    if (character === ",") {
      fields.push(field);
      field = "";
      continue;
    }

    if (character === "\r" || character === "\n") {
      finishRow();
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) {
        throw new Error(
          "CSV " + rowNumber + "행: 인용부호는 필드 시작에만 올 수 있습니다.",
        );
      }
      insideQuotes = true;
      continue;
    }

    field += character;
  }

  if (insideQuotes) {
    throw new Error("CSV " + rowNumber + "행: 닫히지 않은 따옴표가 있습니다.");
  }

  if (quoteClosed || fields.length > 0 || field.length > 0) {
    finishRow();
  }

  return rows;
}

export function parseRecipeCsv(csvText: string): RecipeCsvRecord[] {
  if (csvText.trim().length === 0) {
    throw new Error("CSV 내용이 비어 있습니다.");
  }

  const rows = parseCsvRows(csvText);
  const headerRow = rows[0];
  if (!headerRow) {
    throw new Error("CSV 헤더가 없습니다.");
  }

  const headers = headerRow.map((header) => header.trim());
  if (headers.some((header) => header.length === 0)) {
    throw new Error("CSV 헤더에 빈 열 이름이 있습니다.");
  }

  const headerSet = new Set<string>();
  for (const header of headers) {
    if (headerSet.has(header)) {
      throw new Error("CSV에 중복 헤더가 있습니다: " + header);
    }
    headerSet.add(header);
  }

  for (const requiredHeader of REQUIRED_HEADERS) {
    if (!headerSet.has(requiredHeader)) {
      throw new Error("필수 CSV 열이 없습니다: " + requiredHeader);
    }
  }

  const records: RecipeCsvRecord[] = [];
  const sourceIds = new Set<string>();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const values = rows[rowIndex];
    const recordNumber = rowIndex + 1;

    if (values.length !== headers.length) {
      throw new Error(
        "CSV " +
          recordNumber +
          "행의 열 수가 헤더와 다릅니다: " +
          values.length +
          "/" +
          headers.length,
      );
    }

    const record = Object.fromEntries(
      headers.map((header, index) => [header, values[index]]),
    ) as RecipeCsvRecord;

    const sourceId = record.RCP_SEQ.trim();
    if (sourceId.length === 0) {
      throw new Error("CSV " + recordNumber + "행의 원본 ID가 비어 있습니다.");
    }
    if (sourceIds.has(sourceId)) {
      throw new Error(
        "CSV " + recordNumber + "행에 중복 원본 ID가 있습니다: " + sourceId,
      );
    }


    sourceIds.add(sourceId);
    records.push(record);
  }

  return records;
}

export function getRecipeSteps(record: RecipeCsvRecord): string[] {
  return Object.entries(record)
    .map(([column, value]) => {
      const match = /^MANUAL(\d+)$/.exec(column);
      return match ? { number: Number(match[1]), value } : undefined;
    })
    .filter(
      (step): step is { number: number; value: string } =>
        step !== undefined && step.value.trim().length > 0,
    )
    .sort((left, right) => left.number - right.number)
    .map(({ value }) => value);
}
