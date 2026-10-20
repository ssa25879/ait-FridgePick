import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./data/recipes", async () => {
  const { TEST_RECIPES } = await import("./test/fixtures/recipes");
  return { RECIPES: TEST_RECIPES };
});

const sdk = vi.hoisted(() => ({ log: vi.fn() }));

vi.mock("@apps-in-toss/web-framework", () => ({
  Analytics: { log: sdk.log },
  User: { getAnonymousKey: Object.assign(vi.fn(), { isSupported: () => false }) },
  graniteEvent: { addEventListener: () => () => {} },
  TossAds: {
    initialize: Object.assign(vi.fn(), { isSupported: () => false }),
    attachBanner: Object.assign(vi.fn(), { isSupported: () => false }),
  },
}));

beforeEach(() => {
  sdk.log.mockReset();
  sdk.log.mockResolvedValue(undefined);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(() => { vi.unstubAllGlobals(); });

function loggedNames() {
  return sdk.log.mock.calls.map(([event]) => event.log_name);
}

async function pickKimchiRiceOilEgg(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "재료 고르기" }));
  await user.click(screen.getByRole("button", { name: "김치" }));
  await user.click(screen.getByRole("button", { name: "계란·유제품" }));
  await user.click(screen.getByRole("button", { name: "달걀" }));
  await user.click(screen.getByRole("button", { name: "탄수화물" }));
  await user.click(screen.getByRole("button", { name: "밥" }));
  await user.click(screen.getByRole("button", { name: "양념" }));
  await user.click(screen.getByRole("button", { name: "식용유" }));
}

function renderApp(strict = false) {
  const tree = (
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  );
  render(strict ? <StrictMode>{tree}</StrictMode> : tree);
  return userEvent.setup();
}

describe("퍼널 이벤트", () => {
  it("앱을 열면 app_entry를 한 번만 기록한다 (StrictMode 포함)", () => {
    renderApp(true);

    expect(loggedNames().filter((name) => name === "app_entry")).toHaveLength(1);
  });

  it("재료 고르기를 누르면 ingredient_select_start를 기록한다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(loggedNames()).toEqual(["app_entry", "ingredient_select_start"]);
  });

  it("추천 결과를 보면 result_view를 개수만으로 기록한다", async () => {
    const user = renderApp();
    await pickKimchiRiceOilEgg(user);
    sdk.log.mockClear();

    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(sdk.log).toHaveBeenCalledTimes(1);
    const event = sdk.log.mock.calls[0][0];
    expect(event.log_name).toBe("result_view");
    expect(event.params.selected_count).toBe(4);
    expect(event.params.candidate_count).toBeGreaterThan(0);
    expect(["ready", "needs"]).toContain(event.params.group);
    const serialized = JSON.stringify(event);
    for (const ingredientId of ["kimchi", "egg", "cooked_rice", "cooking_oil"]) {
      expect(serialized).not.toContain(ingredientId);
    }
  });

  it("다시 뽑기를 누르면 reroll을 기록한다", async () => {
    const user = renderApp();
    await pickKimchiRiceOilEgg(user);
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    sdk.log.mockClear();

    await user.click(screen.getByRole("button", { name: "다시 뽑기" }));

    expect(loggedNames()).toEqual(["reroll"]);
  });

  it("재료 없이 뽑으면 result_view 대신 result_empty를 기록한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    sdk.log.mockClear();

    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(sdk.log).toHaveBeenCalledTimes(1);
    expect(sdk.log.mock.calls[0][0]).toMatchObject({ log_name: "result_empty", params: { selected_count: 0 } });
  });

  it("이벤트 기록이 실패해도 추천 흐름은 계속된다", async () => {
    sdk.log.mockImplementation(() => { throw new Error("unsupported"); });
    const user = renderApp();
    await pickKimchiRiceOilEgg(user);

    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(screen.getByRole("heading", { name: "추천 결과" })).toBeInTheDocument();
  });
});
