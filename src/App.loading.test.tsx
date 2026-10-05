import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { TEST_RECIPES } from "./test/fixtures/recipes";
import { getRecipeCandidates, pickRecipeCandidate } from "./utils/recommendRecipe";

const loader = vi.hoisted(() => vi.fn());
const platformEvents = vi.hoisted(() => new Map<string, () => void>());
vi.mock("./utils/loadRecommendationModule", () => ({ loadRecommendationModule: loader }));
vi.mock("@apps-in-toss/web-framework", () => ({
  User: { getAnonymousKey: Object.assign(vi.fn(), { isSupported: () => false }) },
  graniteEvent: { addEventListener: (name: string, callbacks: { onEvent: () => void }) => {
    platformEvents.set(name, callbacks.onEvent);
    return () => platformEvents.delete(name);
  } },
  TossAds: { initialize: Object.assign(vi.fn(), { isSupported: () => false }) },
}));

const module = {
  getRecipeCandidates: (ids: string[]) => getRecipeCandidates(ids, TEST_RECIPES),
  pickRecipeCandidate,
};

beforeEach(() => {
  loader.mockReset();
  platformEvents.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); });

function start() {
  const view = render(<TDSMobileAITProvider><App /></TDSMobileAITProvider>);
  expect(loader).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "재료 고르기" }));
  fireEvent.click(screen.getByRole("button", { name: "김치" }));
  return view;
}

describe("추천 모듈 지연 로딩", () => {
  it("다시 뽑은 결과를 반영한 뒤 화면 맨 위로 이동하고 결과에 초점을 둔다", async () => {
    const candidates = TEST_RECIPES.slice(0, 2).map((recipe) => ({
      recipe, matchedRequiredIngredientIds: [], missingRequiredIngredientIds: ["salt"],
      missingUnmappedRequiredIngredients: [], matchRate: 1,
    }));
    const pick = vi.fn().mockReturnValueOnce(candidates[0]).mockReturnValueOnce(candidates[1]);
    loader.mockResolvedValue({ ...module, getRecipeCandidates: () => candidates, pickRecipeCandidate: pick });
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {
      expect(screen.getByRole("heading", { name: candidates[1].recipe.name })).toBeInTheDocument();
    });
    start();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await screen.findByRole("heading", { name: candidates[0].recipe.name });
    expect(scroll).not.toHaveBeenCalled();
    const button = screen.getByRole("button", { name: "다시 뽑기" });
    button.focus();
    fireEvent.click(button);
    expect(scroll).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: "instant" });
    expect(screen.getByRole("main")).toHaveFocus();
    expect(pick).toHaveBeenLastCalledWith(candidates, candidates[0].recipe.id);
  });

  it("준비 완료 메뉴를 우선 뽑고 준비 필요 메뉴는 별도 그룹에서만 다시 뽑는다", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const candidates = [
      { recipe: { id: "missing", name: "준비 필요 메뉴" }, matchedRequiredIngredientIds: ["kimchi"], missingRequiredIngredientIds: ["salt"], missingUnmappedRequiredIngredients: [], matchRate: 1, matchBasis: "main" as const },
      { recipe: { id: "ready", name: "준비 완료 메뉴" }, matchedRequiredIngredientIds: ["kimchi"], missingRequiredIngredientIds: [], missingUnmappedRequiredIngredients: [], matchRate: 1, matchBasis: "main" as const },
      { recipe: { id: "unknown", name: "미지원 재료 메뉴" }, matchedRequiredIngredientIds: ["kimchi"], missingRequiredIngredientIds: [], missingUnmappedRequiredIngredients: ["전복"], matchRate: 1, matchBasis: "main" as const },
    ].map((match) => ({ ...match, recipe: { ...TEST_RECIPES[0], ...match.recipe } }));
    loader.mockResolvedValue({ ...module, getRecipeCandidates: () => candidates });
    start();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    expect(await screen.findByRole("heading", { name: "준비 완료 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("레시피에 필요한 재료를 모두 선택했어요");
    expect(screen.getByRole("button", { name: "바로 만들 수 있는 메뉴 1개" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "다시 뽑기" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "재료 추가가 필요한 메뉴 2개" }));
    expect(screen.getByRole("status")).toHaveTextContent("아래 재료를 추가해야 만들 수 있어요");
    fireEvent.click(screen.getByRole("button", { name: "다시 뽑기" }));
    expect(screen.queryByRole("heading", { name: "준비 완료 메뉴" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "바로 만들 수 있는 메뉴 1개" }));
    expect(screen.getByRole("heading", { name: "준비 완료 메뉴" })).toBeInTheDocument();
  });

  it("준비 완료 메뉴가 없으면 그 사실을 알리고 부족한 메뉴로 표시한다", async () => {
    const partial = { ...getRecipeCandidates(["kimchi", "onion", "pork"], TEST_RECIPES)[0], missingRequiredIngredientIds: ["cooking_oil"] };
    loader.mockResolvedValue({ ...module, getRecipeCandidates: () => [partial] });
    start();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    expect(await screen.findByText("선택한 재료만으로 만들 수 있는 메뉴가 없어요.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("아래 재료를 추가해야 만들 수 있어요");
    expect(screen.getByRole("button", { name: "바로 만들 수 있는 메뉴 0개" })).toBeDisabled();
  });

  it("홈에서 로드하지 않고 진입 후 준비하며 중복 추천을 막는다", async () => {
    let resolve!: (value: typeof module) => void;
    loader.mockReturnValue(new Promise((done) => { resolve = done; }));
    start();
    const button = screen.getByRole("button", { name: "메뉴 뽑기" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "메뉴 준비 중" })).toBeDisabled();
    fireEvent.click(button);
    expect(loader).toHaveBeenCalledTimes(2);
    await act(async () => resolve(module));
    expect(screen.getByRole("heading", { name: "추천 결과" })).toBeInTheDocument();
  });

  it("대기 중 홈으로 돌아가면 늦은 완료가 화면을 바꾸지 않는다", async () => {
    let resolve!: (value: typeof module) => void;
    loader.mockReturnValue(new Promise((done) => { resolve = done; }));
    start();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    expect(screen.getByRole("button", { name: "메뉴 준비 중" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "홈으로" }));
    await act(async () => resolve(module));
    expect(screen.getByRole("button", { name: "재료 고르기" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "추천 결과" })).not.toBeInTheDocument();
  });

  it("입력이 바뀐 뒤 새 요청을 시작하면 최신 입력만 결과에 사용한다", async () => {
    let resolve!: (value: typeof module) => void;
    loader.mockReturnValue(new Promise((done) => { resolve = done; }));
    const calculate = vi.spyOn(module, "getRecipeCandidates");
    start();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    fireEvent.click(screen.getByRole("button", { name: "양파" }));
    expect(screen.getByRole("button", { name: "메뉴 뽑기" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await act(async () => resolve(module));
    expect(calculate).toHaveBeenCalledTimes(1);
    expect(calculate.mock.calls[0][0]).toEqual(["kimchi", "onion"]);
  });

  it("대기 중 초기화하면 늦은 결과를 버리고 빈 선택 안내를 유지한다", async () => {
    let resolve!: (value: typeof module) => void;
    loader.mockReturnValue(new Promise((done) => { resolve = done; }));
    start();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    fireEvent.click(screen.getByText("필터·저장 설정"));
    fireEvent.click(screen.getByRole("button", { name: "재료·필터 초기화" }));
    fireEvent.click(screen.getByRole("button", { name: "초기화하기" }));
    await act(async () => resolve(module));
    expect(screen.queryByRole("heading", { name: "추천 결과" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    expect(screen.getByRole("heading", { name: "추천 결과" })).toBeInTheDocument();
  });

  it.each(["filter", "platform", "unmount"])("%s 이후 늦은 완료에서 후보를 계산하지 않는다", async (action) => {
    let resolve!: (value: typeof module) => void;
    loader.mockReturnValue(new Promise((done) => { resolve = done; }));
    const calculate = vi.spyOn(module, "getRecipeCandidates");
    const view = start();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    if (action === "filter") {
      fireEvent.click(screen.getByText("필터·저장 설정"));
      fireEvent.change(screen.getByRole("slider", { name: "최소 매칭률" }), { target: { value: "75" } });
    } else if (action === "platform") {
      act(() => platformEvents.get("backEvent")!());
    } else {
      view.unmount();
    }
    await act(async () => resolve(module));
    expect(calculate).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "추천 결과" })).not.toBeInTheDocument();
  });

  it("로드 실패는 빈 후보와 구분하고 재시도할 수 있다", async () => {
    loader.mockRejectedValue(new Error("offline"));
    start();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("메뉴를 불러오지 못했어요");
    expect(screen.queryByRole("heading", { name: "추천 결과" })).not.toBeInTheDocument();
    loader.mockResolvedValue(module);
    fireEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "추천 결과" })).toBeInTheDocument());
  });
});
