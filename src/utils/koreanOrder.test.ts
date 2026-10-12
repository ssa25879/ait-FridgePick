import { describe, expect, it } from "vitest";
import { sortByKoreanName, sortKoreanNames } from "./koreanOrder";

describe("가나다 순 정렬", () => {
  it("한글 이름을 가나다 순으로 정렬하고 원본 배열은 바꾸지 않는다", () => {
    const names = ["파스타면", "김치", "당근", "가지", "다시마"];
    expect(sortKoreanNames(names)).toEqual(["가지", "김치", "다시마", "당근", "파스타면"]);
    expect(names).toEqual(["파스타면", "김치", "당근", "가지", "다시마"]);
  });

  it("짧은 이름이 같은 글자로 시작하는 긴 이름보다 앞에 온다", () => {
    expect(sortKoreanNames(["김치", "김", "김가루"])).toEqual(["김", "김가루", "김치"]);
  });

  it("객체는 name 기준으로 정렬하고 같은 이름은 기존 순서를 유지한다", () => {
    const items = [
      { id: "b", name: "마늘" },
      { id: "a1", name: "가지" },
      { id: "a2", name: "가지" },
    ];
    expect(sortByKoreanName(items).map(({ id }) => id)).toEqual(["a1", "a2", "b"]);
  });
});
