import { execFileSync } from "node:child_process";

// npm install/ci 뒤에 실행되어 커밋 전 비밀값 검사 훅(.githooks)을 연결한다.
// Git 저장소가 아니거나 git이 없으면(예: 압축본) 조용히 넘어간다.
try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
  // 훅은 선택 기능이라 실패해도 설치를 막지 않는다.
}
