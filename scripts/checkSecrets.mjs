import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// 실제 광고 그룹 ID 형식. 자리표시자(<AD_GROUP_ID>)와 말줄임 표기는 걸리지 않는다.
const LIVE_ID = /ait\.v2\.live\.[0-9A-Za-z]{8,}/g;
const MASK = "<MASKED>";
const LOCAL_ENV = new URL("../../local-config/ait-fridgepick/.env.release.local", import.meta.url);
const SKIP_EXT = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|ait|zip|lock)$/i;

export function findSecretLines(text, exactValues) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, index) => {
    LIVE_ID.lastIndex = 0;
    if (LIVE_ID.test(line) || exactValues.some((value) => line.includes(value))) {
      hits.push({ line: index + 1 });
    }
  });
  return hits;
}

export function maskLine(line, exactValues) {
  let masked = line.replace(LIVE_ID, MASK);
  for (const value of exactValues) masked = masked.split(value).join(MASK);
  return masked;
}

function readLocalValues() {
  if (!existsSync(LOCAL_ENV)) return [];
  const match = readFileSync(LOCAL_ENV, "utf8").match(/^FRIDGEPICK_BANNER_AD_GROUP_ID=(.+)$/m);
  const value = match?.[1].trim().replace(/^["']|["']$/g, "");
  return value ? [value] : [];
}

function listFiles(staged) {
  const args = staged
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACM", "-z"]
    : ["ls-files", "-z"];
  return execFileSync("git", args, { encoding: "utf8" }).split("\0").filter(Boolean);
}

function readContent(file, staged) {
  if (!staged) return readFileSync(file, "utf8");
  return execFileSync("git", ["show", `:${file}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function main() {
  const staged = process.argv.includes("--staged");
  const exactValues = readLocalValues();
  let failures = 0;
  for (const file of listFiles(staged)) {
    if (SKIP_EXT.test(file)) continue;
    let text;
    try {
      text = readContent(file, staged);
    } catch {
      continue;
    }
    if (text.includes("\0")) continue;
    for (const hit of findSecretLines(text, exactValues)) {
      failures += 1;
      console.error(`${file}:${hit.line}: 광고 그룹 ID로 보이는 값이 있습니다 (${maskLine(text.split(/\r?\n/)[hit.line - 1].trim(), exactValues).slice(0, 80)})`);
    }
  }
  if (failures > 0) {
    console.error(`비밀값 검사 실패: ${failures}곳. 문서에는 <AD_GROUP_ID> 같은 자리표시자를 쓰세요.`);
    process.exit(1);
  }
  console.log(`비밀값 검사 통과 (${staged ? "스테이징" : "추적 파일 전체"}${exactValues.length ? ", 로컬 값 대조 포함" : ""})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
