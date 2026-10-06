import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Isolate state/navigation contracts from changes to the production catalog.
vi.mock("./data/recipes", async () => {
  const { TEST_RECIPES } = await import("./test/fixtures/recipes");
  return { RECIPES: TEST_RECIPES };
});

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
const saved = {
  version: 1,
  selectedIngredientIds: ["kimchi", "cooked_rice"],
  minimumMatchRate: 0.85,
  difficultyFilter: "normal",
};

function mountApp() {
  return render(<StrictMode><TDSMobileAITProvider><App /></TDSMobileAITProvider></StrictMode>);
}

async function start() {
  await userEvent.click(screen.getByRole("button", { name: "재료 고르기" }));
  await userEvent.click(screen.getByText("필터·선택 설정", { exact: true }));
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

describe("실행별 재료와 필터 상태", () => {
  it("이전 실행의 저장값이 있어도 새 실행은 선택 0개와 기본 필터로 시작한다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify(saved));
    mountApp();
    await start();
    await act(async () => {});
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "김치" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("slider")).toHaveValue("60");
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
  });

  it("재료와 필터를 변경한 뒤 종료·재실행하면 선택을 복원하지 않는다", async () => {
    const app = mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "80" } });
    await userEvent.click(screen.getByRole("button", { name: "쉬움" }));
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    app.unmount();
    mountApp();
    await start();
    await act(async () => {});
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("60");
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
  });

  it("한 실행 안에서 홈을 왕복하면 재료와 필터를 유지한다", async () => {
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "85" } });
    await userEvent.click(screen.getByRole("button", { name: "보통" }));
    await userEvent.click(screen.getByRole("button", { name: "홈으로" }));
    await start();
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "양파" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("slider")).toHaveValue("85");
    expect(screen.getByRole("button", { name: "보통" })).toHaveAttribute("aria-pressed", "true");
  });

  it("초기화 취소는 현재 선택을 유지하고 확인하면 재료와 필터를 초기화한다", async () => {
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "85" } });
    await userEvent.click(screen.getByRole("button", { name: "보통" }));
    await userEvent.click(screen.getByRole("button", { name: "재료·필터 초기화" }));
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("85");
    await userEvent.click(screen.getByRole("button", { name: "재료·필터 초기화" }));
    await userEvent.click(screen.getByRole("button", { name: "초기화하기" }));
    expect(screen.getByRole("heading", { name: "선택한 재료 0개" })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("60");
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
  });

  it("실행 중 선택 변경으로 이전 실행의 저장값을 덮어쓰지 않는다", async () => {
    bridge.values.set(ALPHA_KEY, JSON.stringify(saved));
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "양파" }));
    await act(async () => {});
    expect(screen.getByRole("heading", { name: "선택한 재료 1개" })).toBeInTheDocument();
    expect(bridge.values.get(ALPHA_KEY)).toBe(JSON.stringify(saved));
  });

  it("저장소에 접근할 수 없어도 선택과 추천 흐름을 사용할 수 있다", async () => {
    bridge.identify.mockRejectedValue(new Error("native unavailable"));
    bridge.read.mockRejectedValue(new Error("storage denied"));
    mountApp();
    await start();
    await userEvent.click(screen.getByRole("button", { name: "김치" }));
    await userEvent.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    expect(await screen.findByRole("button", { name: "처음부터" })).toBeInTheDocument();
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
