import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectIngredients, getMissingQuantityRows, GRID } from './downloadEpisIngredients.mjs';

function responder(total, change = x => x) {
  const calls = [];
  const request = async url => {
    const [start, end] = url.split('/').slice(-2).map(Number);
    calls.push([start, end]);
    const row = Array.from({ length: Math.max(0, Math.min(end, total) - start + 1) }, (_, i) => ({
      ROW_NUM: start + i, RECIPE_ID: 1, IRDNT_SN: start + i,
      IRDNT_NM: '쌀', IRDNT_CPCTY: '1컵',
    }));
    return { ok: true, json: async () => change({ [GRID]: { totalCnt: total, result: { code: 'INFO-000' }, row } }) };
  };
  return { calls, request };
}

test('1,000행씩 조회하고 마지막 범위를 줄여 전체 원문을 합친다', async () => {
  const mock = responder(2104);
  const result = await collectIngredients('local-test-key', mock.request);
  assert.deepEqual(mock.calls, [[1, 1000], [1001, 2000], [2001, 2104]]);
  assert.equal(result.length, 2104);
  assert.equal(result.at(-1).IRDNT_CPCTY, '1컵');
});

test('인증 실패는 키를 포함하지 않는 오류로 처리한다', async () => {
  const mock = responder(1, data => { data[GRID].result.code = 'INFO-100'; return data; });
  await assert.rejects(collectIngredients('secret-value', mock.request), error =>
    error.message.includes('INFO-100') && !error.message.includes('secret-value'));
});

test('네트워크 예외의 요청 URL과 키를 외부로 내보내지 않는다', async () => {
  await assert.rejects(collectIngredients('secret-value', async () => { throw new Error('url/secret-value'); }),
    error => !error.message.includes('secret-value') && error.message.includes('연결'));
});

test('중간 행 누락을 완료로 처리하지 않는다', async () => {
  const mock = responder(10, data => { data[GRID].row.pop(); return data; });
  await assert.rejects(collectIngredients('key', mock.request), /행 수/);
});

test('같은 레시피의 같은 재료 순번 중복을 거부한다', async () => {
  const mock = responder(2, data => { data[GRID].row[1].IRDNT_SN = 1; return data; });
  await assert.rejects(collectIngredients('key', mock.request), /중복/);
});

test('수집 도중 전체 건수가 달라지면 실패한다', async () => {
  let count = 0;
  const mock = responder(1001, data => { if (++count > 1) data[GRID].totalCnt++; return data; });
  await assert.rejects(collectIngredients('key', mock.request), /전체 건수/);
});

test('필수 분량 필드가 없는 응답을 거부한다', async () => {
  const mock = responder(1, data => { delete data[GRID].row[0].IRDNT_CPCTY; return data; });
  await assert.rejects(collectIngredients('key', mock.request), /필드/);
});

test('원본의 빈 분량과 null 분량은 그대로 보존해 전체 수집한다', async () => {
  const mock = responder(2, data => {
    data[GRID].row[0].IRDNT_CPCTY = '';
    data[GRID].row[1].IRDNT_CPCTY = null;
    return data;
  });
  const rows = await collectIngredients('key', mock.request);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].IRDNT_CPCTY, '');
  assert.equal(rows[1].IRDNT_CPCTY, null);
  assert.deepEqual(getMissingQuantityRows(rows), [
    { ROW_NUM: 1, RECIPE_ID: 1, IRDNT_SN: 1 },
    { ROW_NUM: 2, RECIPE_ID: 1, IRDNT_SN: 2 },
  ]);
});

test('서비스 최상위 인증 오류도 실제 코드로 표시한다', async () => {
  const mock = responder(1, () => ({ result: { code: 'INFO-100', message: 'private-message' } }));
  await assert.rejects(collectIngredients('key', mock.request), /API 오류 INFO-100/);
});
