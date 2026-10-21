import assert from "node:assert/strict";
import test from "node:test";
import { findSecretLines, maskLine } from "./checkSecrets.mjs";

// 실제 ID가 아닌 가짜 값이다. 소스에 형식 그대로 쓰지 않으려고 이어 붙인다.
const FAKE = "ait.v2.live." + "0123456789abcdef";

test("실제 형식의 광고 그룹 ID를 찾는다", () => {
  const hits = findSecretLines(`const id = "${FAKE}";\nok`, []);
  assert.deepEqual(hits.map((hit) => hit.line), [1]);
});

test("자리표시자와 말줄임 표기는 통과한다", () => {
  const text = [
    "ID는 `<AD_GROUP_ID>`로 쓴다",
    "형식은 ait.v2.live.… 이다",
    "정규식 ait\\.v2\\.live\\.[a-f0-9]{16}",
  ].join("\n");
  assert.deepEqual(findSecretLines(text, []), []);
});

test("로컬 설정에서 읽은 정확한 값도 찾는다", () => {
  const exact = "custom-group-0123456789";
  const hits = findSecretLines(`x\ny ${exact} z`, [exact]);
  assert.deepEqual(hits.map((hit) => hit.line), [2]);
});

test("출력에는 값이 남지 않는다", () => {
  const masked = maskLine(`id: ${FAKE}`, []);
  assert.ok(!masked.includes("0123456789abcdef"));
  assert.ok(masked.includes("<MASKED>"));
});
