// 가나다 순 정렬. 짧은 이름이 같은 글자로 시작하는 긴 이름보다 앞에 오고,
// 같은 이름은 기존 순서를 유지한다(Array.prototype.sort는 안정 정렬).
const collator = new Intl.Collator("ko");

export function sortKoreanNames(names: string[]): string[] {
  return [...names].sort(collator.compare);
}

export function sortByKoreanName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => collator.compare(a.name, b.name));
}
