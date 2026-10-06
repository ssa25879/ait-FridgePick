import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('생성기는 원본 해시·확보일과 미확인 기준일을 구분하고 결정적으로 출력한다', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'fridgepick-generator-'));
  try {
    const input = join(directory, 'source.csv');
    const output = join(directory, 'catalog.ts');
    const csv = 'RCP_SEQ,RCP_NM,RCP_PARTS_DTLS,MANUAL01\n1,두부찜,두부 100g,두부를 쪄요.\n';
    await writeFile(input, csv);
    const args = [fileURLToPath(new URL('./generateRecipeCatalog.mjs', import.meta.url)), input, output, 'unknown', '2026-10-05'];
    const first = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(first.status, 0, first.stderr);
    const summary = JSON.parse(first.stdout);
    assert.equal(summary.sourceSnapshotDate, 'unknown');
    assert.equal(summary.acquiredDate, '2026-10-05');
    assert.deepEqual(summary.sourceFiles, [{ name: 'source.csv', sha256: createHash('sha256').update(csv).digest('hex') }]);
    const original = await readFile(output, 'utf8');
    const second = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(second.status, 0, second.stderr);
    assert.equal(await readFile(output, 'utf8'), original);
    args[4] = '2026-02-30';
    assert.notEqual(spawnSync(process.execPath, args).status, 0);
    assert.equal(await readFile(output, 'utf8'), original);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
