import { StrictMode } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const bridge = vi.hoisted(() => ({
  identify: vi.fn(),
  supported: vi.fn(),
  read: vi.fn(),
  write: vi.fn(),
  subscribe: vi.fn(),
  values: new Map<string, string>(),
  listeners: new Map<string, Set<() => void>>(),
}));

vi.mock("@apps-in-toss/web-framework", () => ({
  User: {
    getAnonymousKey: Object.assign(bridge.identify, { isSupported: bridge.supported }),
  },
  Storage: { getItem: bridge.read, setItem: bridge.write },
  graniteEvent: { addEventListener: bridge.subscribe },
  TossAds: {
    initialize: Object.assign(vi.fn(), { isSupported: () => false }),
  },
}));

const ALPHA_KEY = "fridgepick:user-state:v1:alpha";
const BETA_KEY = "fridgepick:user-state:v1:beta";
const saved = {
  version: 1,
  selectedIngredientIds: ["kimchi", "cooked_rice"],
  minimumMatchRate: 0.85,
  difficultyFilter: "normal",
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function mountApp() {
  return render(<StrictMode><TDSMobileAITProvider><App /></TDSMobileAITProvider></StrictMode>);
}

async function start() {
  await userEvent.click(screen.getByRole("button", { name: "재료 고르기" }));
  await userEvent.click(screen.getByText("필터·저장 설정", { exact: true }));
}

beforeEach(() => {
  vi.resetAllMocks();
  bridge.values.clear();
  bridge.listeners.clear();
  bridge.supported.mockReturnValue(true);
  bridge.identify.mockResolvedValue({ type: "HASH", hash: "alpha" });
  bridge.read.mockImplementation(async (key: string) => bridge.values.get(key) ?? null);
  bridge.write.mockImplementation(async (key: string, value: string) => { bridge.values.set(key, value); });
  bridge.subscribe.mockImplementation((event: string, options: { onEvent: () => void }) => {
    const listeners = bridge.listeners.get(event) ?? new Set();
    bridge.listeners.set(event, listeners);
    listeners.add(options.onEvent);
    return () => { listeners.delete(options.onEvent); };
  });
});

afterEach(() => { vi.useRealTimers(); });

describe("사용자별 재료와 필터 저장", () => {
  it("재료 화면 초기화 취소는 선택을 유지하고 확인은 저장 상태와 재진입을 초기화한다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify(saved));
    const app = mountApp();
    await start();
    await screen.findByRole("heading", { name: "선택한 재료 2개" });
    await userEvent.click(screen.getByRole("button", { name: "재료·필터 초기화" }));
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.getByRole("slider")).toHaveValue("85");
    expect(screen.getByRole("heading", { name: "선택한 재료 2개" })).toBeInTheDocument();
    expect(bridge.values.get(ALPHA_KEY)).toBe(JSON.stringify(saved));
    await userEvent.click(screen.getByRole("button", { name: "재료·필터 초기화" }));
    await userEvent.click(screen.getByRole("button", { name: "초기화하기" }));
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("60");
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(JSON.parse(bridge.values.get(ALPHA_KEY)!)).toEqual({
      version: 1, selectedIngredientIds: [], minimumMatchRate: 0.6, difficultyFilter: "all",
    }));
    app.unmount();
    mountApp();
    await start();
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
  });

  it("저장 실패를 성공으로 안내하지 않고 다음 변경 성공 시 회복한다", async () => {
    bridge.write.mockRejectedValueOnce(new Error("write failed"));
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    expect(await screen.findByText("저장하지 못했어요. 선택을 바꾸면 다시 저장해요.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    expect(await screen.findByText("선택한 재료와 필터를 저장했어요.")).toBeInTheDocument();
  });

  it("저장이 미지원이면 이번 실행에만 유지됨을 안내한다", async () => {
    bridge.supported.mockReturnValue(false);
    mountApp();
    await start();
    expect(await screen.findByText("이 환경에서는 선택한 항목이 이번 실행 동안만 유지돼요.")).toBeInTheDocument();
  });

  it("이전 저장 완료는 더 최신 입력의 저장 중 안내를 덮지 않는다", async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    bridge.write.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    await act(async () => { first.resolve(); });
    expect(screen.getByText("선택한 재료와 필터를 저장하고 있어요.")).toBeInTheDocument();
    await act(async () => { second.resolve(); });
    expect(screen.getByText("선택한 재료와 필터를 저장했어요.")).toBeInTheDocument();
  });

  it("늦은 복원 중 초기화 확인은 기존 저장값의 복원을 막는다", async () => {
    const read = deferred<string>();
    bridge.read.mockReturnValue(read.promise);
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "재료·필터 초기화" }));
    await userEvent.click(screen.getByRole("button", { name: "초기화하기" }));
    await act(async () => { read.resolve(JSON.stringify(saved)); });
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(bridge.values.get(ALPHA_KEY)!).selectedIngredientIds).toEqual([]));
  });

  it("StrictMode 재진입에서 저장한 재료·필터를 복원하고 홈부터 시작한다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify(saved));
    mountApp();
    expect(screen.getByRole("button", { name: "재료 고르기" })).toBeInTheDocument();
    await start();
    expect(await screen.findByRole("heading", { name: "선택한 재료 2개" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "김치" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("slider", { name: "최소 매칭률" })).toHaveValue("85");
    expect(screen.getByRole("button", { name: "보통" })).toHaveAttribute("aria-pressed", "true");
    expect(bridge.identify).toHaveBeenCalledTimes(1);
    expect(bridge.write).not.toHaveBeenCalled();
  });

  it("재료·필터 변경을 저장하고 같은 사용자의 다음 마운트에 복원한다", async () => {
    const app = mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "80" } });
    await userEvent.click(screen.getByRole("button", { name: "쉬움" }));
    await waitFor(() => expect(JSON.parse(bridge.values.get(ALPHA_KEY)!)).toEqual({
      version: 1, selectedIngredientIds: ["kimchi"], minimumMatchRate: 0.8, difficultyFilter: "easy",
    }));
    app.unmount();
    mountApp();
    await start();
    expect(await screen.findByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("80");
    expect(screen.getByRole("button", { name: "쉬움" })).toHaveAttribute("aria-pressed", "true");
  });

  it("다른 사용자의 데이터는 읽거나 덮어쓰지 않는다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify(saved));
    bridge.identify.mockResolvedValue({ type: "HASH", hash: "beta" });
    mountApp();
    await start();
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    await waitFor(() => expect(JSON.parse(bridge.values.get(BETA_KEY)!).selectedIngredientIds).toEqual(["onion"]));
    expect(bridge.read).toHaveBeenCalledWith(BETA_KEY);
    expect(bridge.read).not.toHaveBeenCalledWith(ALPHA_KEY);
    expect(bridge.values.get(ALPHA_KEY)).toBe(JSON.stringify(saved));
  });

  it("처음부터는 저장 상태도 기본값으로 되돌린다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify({ ...saved, minimumMatchRate: 0.6, difficultyFilter: "easy" }));
    const app = mountApp();
    await start();
    await screen.findByRole("heading", { name: "선택한 재료 2개" });
    await userEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await userEvent.click(screen.getByRole("button", { name: "처음부터" }));
    await waitFor(() => expect(JSON.parse(bridge.values.get(ALPHA_KEY)!)).toEqual({
      version: 1, selectedIngredientIds: [], minimumMatchRate: 0.6, difficultyFilter: "all",
    }));
    app.unmount();
    mountApp();
    await start();
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("60");
  });

  it("늦은 복원이 새 재료 입력을 덮어쓰지 않는다", async () => {
    const read = deferred<string>();
    bridge.read.mockReturnValue(read.promise);
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    expect(bridge.write).not.toHaveBeenCalled();
    await act(async () => { read.resolve(JSON.stringify(saved)); });
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "양파" })).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(JSON.parse(bridge.values.get(ALPHA_KEY)!).selectedIngredientIds).toEqual(["onion"]));
  });

  it("조회 중 추천을 실행하면 늦은 복원이 빈 결과의 선택 상태를 바꾸지 않는다", async () => {
    const read = deferred<string>();
    bridge.read.mockReturnValue(read.promise);
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await act(async () => { read.resolve(JSON.stringify(saved)); });
    expect(screen.getByText("메뉴를 추천하려면 재료를 먼저 선택해 주세요.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "재료 선택하기" }));
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
  });

  it("빠른 변경의 저장을 직렬화하여 느린 과거 쓰기가 최신 선택을 되돌리지 않는다", async () => {
    const write = deferred<void>();
    bridge.write.mockImplementationOnce(async (key: string, value: string) => {
      await write.promise;
      bridge.values.set(key, value);
    });
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    expect(bridge.write).toHaveBeenCalledTimes(1);
    await act(async () => { write.resolve(); });
    await waitFor(() => expect(JSON.parse(bridge.values.get(ALPHA_KEY)!).selectedIngredientIds).toEqual(["kimchi", "onion"]));
  });

  it("느린 쓰기 뒤 처음부터와 재진입에서도 초기화 상태가 유지된다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify({ ...saved, minimumMatchRate: 0.6, difficultyFilter: "easy" }));
    const write = deferred<void>();
    bridge.write.mockImplementationOnce(async (key: string, value: string) => {
      await write.promise;
      bridge.values.set(key, value);
    });
    const app = mountApp();
    await start();
    await screen.findByRole("heading", { name: "선택한 재료 2개" });
    fireEvent.change(screen.getByRole("slider"), { target: { value: "65" } });
    await userEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await userEvent.click(screen.getByRole("button", { name: "처음부터" }));
    app.unmount();
    mountApp();
    expect(bridge.write).toHaveBeenCalledTimes(1);
    await act(async () => { write.resolve(); });
    await waitFor(() => expect(JSON.parse(bridge.values.get(ALPHA_KEY)!)).toEqual({
      version: 1, selectedIngredientIds: [], minimumMatchRate: 0.6, difficultyFilter: "all",
    }));
    await waitFor(() => expect(bridge.read).toHaveBeenCalledTimes(2));
    await start();
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("60");
  });

  it("같은 사용자 재마운트는 대기 중인 저장을 읽기 전에 기다린다", async () => {
    const write = deferred<void>();
    bridge.write.mockImplementationOnce(async (key: string, value: string) => {
      await write.promise;
      bridge.values.set(key, value);
    });
    const app = mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    app.unmount();
    mountApp();
    await waitFor(() => expect(bridge.identify).toHaveBeenCalledTimes(2));
    expect(bridge.read).toHaveBeenCalledTimes(1);
    await act(async () => { write.resolve(); });
    await start();
    expect(await screen.findByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(bridge.read).toHaveBeenCalledTimes(2);
  });

  it("알 수 없는 재료·중복을 제거하고 잘못된 필터를 기본값으로 복원한다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify({ ...saved, selectedIngredientIds: ["kimchi", "removed", "kimchi", 42], minimumMatchRate: 0.63, difficultyFilter: "expert" }));
    mountApp();
    await start();
    expect(await screen.findByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("60");
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
  });

  it.each(["{broken", "null", JSON.stringify({ ...saved, version: 2 })])("손상되거나 지원하지 않는 저장값 %s는 진입만으로 덮어쓰지 않는다", async (raw) => {
    bridge.values.set(ALPHA_KEY, raw);
    mountApp();
    await start();
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    expect(bridge.values.get(ALPHA_KEY)).toBe(raw);
    expect(bridge.write).not.toHaveBeenCalled();
  });

  it.each([undefined, "ERROR", { type: "HASH", hash: " " }, { type: "OTHER", hash: "alpha" }])("유효하지 않은 식별 응답은 저장소 접근 없이 추천을 유지한다 (%j)", async (response) => {
    bridge.identify.mockResolvedValue(response);
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(bridge.read).not.toHaveBeenCalled();
    expect(bridge.write).not.toHaveBeenCalled();
  });

  it("미지원 SDK는 사용자키 API와 저장소를 호출하지 않는다", async () => {
    bridge.supported.mockReturnValue(false);
    mountApp();
    await start();
    expect(screen.getByRole("heading", { name: "재료 선택" })).toBeInTheDocument();
    expect(bridge.identify).not.toHaveBeenCalled();
    expect(bridge.read).not.toHaveBeenCalled();
  });

  it("사용자키 거부에도 핵심 흐름을 사용한다", async () => {
    bridge.identify.mockRejectedValue(new Error("native unavailable"));
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    expect(screen.getByText("메뉴를 추천하려면 재료를 먼저 선택해 주세요.")).toBeInTheDocument();
    expect(bridge.write).not.toHaveBeenCalled();
  });

  it("저장소 읽기 거부를 빈 값으로 취급해 기존 데이터를 덮지 않는다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify(saved));
    bridge.read.mockRejectedValue(new Error("storage denied"));
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(bridge.write).not.toHaveBeenCalled();
    expect(bridge.values.get(ALPHA_KEY)).toBe(JSON.stringify(saved));
  });

  it("쓰기 실패 이후에도 다음 변경을 저장할 수 있다", async () => {
    bridge.write.mockRejectedValueOnce(new Error("quota"));
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    await waitFor(() => expect(JSON.parse(bridge.values.get(ALPHA_KEY)!).selectedIngredientIds).toEqual(["kimchi", "onion"]));
  });

  it("초기 조회가 시간 초과하면 늦은 응답으로 복원하거나 저장하지 않는다", async () => {
    vi.useFakeTimers();
    const read = deferred<string>();
    bridge.read.mockReturnValue(read.promise);
    mountApp();
    await act(async () => { await vi.advanceTimersByTimeAsync(1501); });
    fireEvent.click(screen.getByRole("button", { name: "재료 고르기" }));
    fireEvent.click(screen.getByRole("button", { name: "양파" }));
    await act(async () => { read.resolve(JSON.stringify(saved)); });
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(bridge.write).not.toHaveBeenCalled();
  });

  it("이전 마운트의 늦은 응답이 다른 사용자의 현재 상태를 변경하지 않는다", async () => {
    const firstKey = deferred<{ type: string; hash: string }>();
    bridge.identify.mockReturnValueOnce(firstKey.promise);
    const old = mountApp();
    old.unmount();
    bridge.identify.mockResolvedValue({ type: "HASH", hash: "beta" });
    bridge.values.set(BETA_KEY, JSON.stringify({ ...saved, selectedIngredientIds: ["onion"] }));
    mountApp();
    await start();
    expect(await screen.findByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    await act(async () => { firstKey.resolve({ type: "HASH", hash: "alpha" }); });
    expect(screen.getByRole("button", { name: "양파" })).toHaveAttribute("aria-pressed", "true");
    expect(bridge.write).not.toHaveBeenCalled();
  });
});

describe("플랫폼 화면 이동", () => {
  it("뒤로가기는 결과→재료→홈이며 홈에서는 기본 종료를 가로채지 않는다", async () => {
    mountApp();
    expect(bridge.listeners.get("backEvent")?.size ?? 0).toBe(0);
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    await userEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    act(() => bridge.listeners.get("backEvent")?.forEach((handler) => handler()));
    expect(screen.getByRole("heading", { name: "재료 선택" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(bridge.listeners.get("backEvent")?.size).toBe(1);
    act(() => bridge.listeners.get("backEvent")?.forEach((handler) => handler()));
    expect(screen.getByRole("button", { name: "재료 고르기" })).toBeInTheDocument();
    expect(bridge.listeners.get("backEvent")?.size).toBe(0);
  });

  it("홈 이벤트 후 선택이 유지되고 언마운트 시 구독이 해제된다", async () => {
    const app = mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    act(() => bridge.listeners.get("homeEvent")?.forEach((handler) => handler()));
    expect(screen.getByRole("button", { name: "재료 고르기" })).toBeInTheDocument();
    await start();
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    app.unmount();
    expect(bridge.listeners.get("backEvent")?.size).toBe(0);
    expect(bridge.listeners.get("homeEvent")?.size).toBe(0);
  });

  it("이벤트 구독 실패에도 화면 안의 홈 버튼은 사용할 수 있다", async () => {
    bridge.subscribe.mockImplementation(() => { throw new Error("unsupported"); });
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "홈으로" }));
    expect(screen.getByRole("button", { name: "재료 고르기" })).toBeInTheDocument();
  });
});
