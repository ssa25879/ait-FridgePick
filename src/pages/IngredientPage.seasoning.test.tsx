import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IngredientPage } from "./IngredientPage";

const HINT = "소금·설탕·후추·식용유·간장·참기름·고춧가루·참깨·식초는 선택하지 않아도 집에 있다고 가정해요";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});

function renderPage() {
  render(
    <TDSMobileAITProvider>
      <IngredientPage
        mainRef={createRef<HTMLElement>()}
        selectedIngredientIds={[]}
        minimumMatchRate={0.6}
        onMinimumMatchRateChange={vi.fn()}
        difficultyFilter="all"
        onDifficultyFilterChange={vi.fn()}
        onToggleIngredient={vi.fn()}
        onReset={vi.fn()}
        onRecommend={vi.fn()}
        onBack={vi.fn()}
        showBannerAd={false}
      />
    </TDSMobileAITProvider>,
  );
  return userEvent.setup();
}

describe("기본 양념 가정 안내", () => {
  it("처음 보이는 전체 재료 화면에서 안내한다", () => {
    renderPage();

    expect(screen.getByText(HINT)).toBeInTheDocument();
  });

  it("양념 카테고리에서 안내하고 다른 카테고리에서는 숨긴다", async () => {
    const user = renderPage();

    await user.click(screen.getByRole("button", { name: "채소·과일" }));
    expect(screen.queryByText(HINT)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "양념" }));
    expect(screen.getByText(HINT)).toBeInTheDocument();
  });
});
