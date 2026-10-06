import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const GRID = 'Grid_20150827000000000227_1';
const SOURCE = 'https://data.mafra.go.kr/opendata/data/indexOpenDataDetail.do?data_id=20150827000000000465';

export function getMissingQuantityRows(rows) {
  return rows.filter(row => row.IRDNT_CPCTY === null || String(row.IRDNT_CPCTY).trim() === '')
    .map(row => ({ ROW_NUM: row.ROW_NUM, RECIPE_ID: row.RECIPE_ID, IRDNT_SN: row.IRDNT_SN }));
}

export async function collectIngredients(key, request = fetch, progress = () => {}) {
  if (!key?.trim() || key.trim() === 'sample') throw new Error('정상 발급 키가 필요합니다.');
  const rows = [];
  const seen = new Set();
  let total;
  for (let start = 1; total === undefined || start <= total; start += 1000) {
    const end = total === undefined ? 1000 : Math.min(start + 999, total);
    const url = `http://211.237.50.150:7080/openapi/${encodeURIComponent(key.trim())}/json/${GRID}/${start}/${end}`;
    let response;
    let payload;
    try {
      response = await request(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error('HTTP');
      payload = await response.json();
    } catch {
      // Do not forward exceptions: fetch/proxy errors may contain the credential URL.
      throw new Error(`연결 또는 JSON 응답 오류 (${start}~${end}). 키 값은 출력하지 않습니다.`);
    }
    const page = payload?.[GRID];
    const code = page?.result?.code ?? payload?.result?.code;
    if (code !== 'INFO-000') {
      const safeCode = typeof code === 'string' && /^(INFO|ERROR)-\d{3}$/.test(code) ? code : 'UNKNOWN';
      throw new Error(`API 오류 ${safeCode} (${start}~${end}).`);
    }
    const count = Number(page.totalCnt);
    if (!Number.isSafeInteger(count) || count < 1) throw new Error('전체 건수가 없거나 유효하지 않습니다.');
    if (total !== undefined && total !== count) throw new Error('수집 중 전체 건수가 변경되었습니다. 다시 실행하세요.');
    total = count;
    if (!Array.isArray(page.row) || page.row.length !== Math.min(end, total) - start + 1) {
      throw new Error(`행 수가 조회 범위와 다릅니다 (${start}~${end}).`);
    }
    for (const [index, row] of page.row.entries()) {
      if (Number(row.ROW_NUM) !== start + index) throw new Error('행 번호가 연속적이지 않습니다.');
      for (const field of ['RECIPE_ID', 'IRDNT_SN', 'IRDNT_NM', 'IRDNT_CPCTY']) {
        // Export source rows even when a quantity is blank; review quality at import time.
        // A missing field still indicates an unexpected response schema.
        if (row[field] === undefined || (field !== 'IRDNT_CPCTY' &&
          (row[field] === null || String(row[field]).trim() === ''))) {
          throw new Error(`필수 필드 ${field}가 비어 있습니다 (행 ${start + index}).`);
        }
      }
      const identity = JSON.stringify([String(row.RECIPE_ID), String(row.IRDNT_SN)]);
      if (seen.has(identity)) throw new Error(`재료 순번 중복 (행 ${start + index}).`);
      seen.add(identity);
      rows.push(row);
    }
    progress(rows.length, total);
  }
  return rows;
}

async function main() {
  if (process.argv.length !== 3) throw new Error('출력 폴더를 인자로 지정하세요. 키는 표준입력으로만 받습니다.');
  let key = '';
  for await (const chunk of process.stdin) key += chunk;
  const rows = await collectIngredients(key, fetch, (done, total) => console.log(`재료정보 ${done}/${total}행`));
  key = '';
  const missingQuantityRows = getMissingQuantityRows(rows);
  const directory = resolve(process.argv[2]);
  // New directory only: never overwrite a previous export.
  await mkdir(directory);
  const content = JSON.stringify({ service: GRID, totalCnt: rows.length, row: rows }, null, 2) + '\n';
  const manifest = {
    source: SOURCE, service: GRID, fetchedAt: new Date().toISOString(),
    sourceSnapshotDate: 'unknown', rowCount: rows.length,
    recipeCount: new Set(rows.map(row => String(row.RECIPE_ID))).size,
    missingQuantityCount: missingQuantityRows.length, missingQuantityRows,
    sha256: createHash('sha256').update(content).digest('hex'),
  };
  await writeFile(join(directory, 'ingredients.json'), content, { flag: 'wx' });
  await writeFile(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  if (missingQuantityRows.length) console.log(`원문 분량 미기재 ${missingQuantityRows.length}행: 그대로 보존했고 manifest.json에 기록했습니다.`);
  console.log(`저장 완료: ${directory}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    // File I/O errors may contain private paths; print only our safe validation errors.
    console.error(error.code ? '파일 저장 실패: 폴더 권한 또는 기존 폴더 여부를 확인하세요.' : error.message);
    process.exitCode = 1;
  });
}
