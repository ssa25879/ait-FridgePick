import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { describe, expect, it } from "vitest";
import App from "./App";

function renderApp() {
  const user = userEvent.setup();
  render(
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>,
  );

  return user;
}

describe("재료 선택 흐름", () => {
  it("화면 전환 후 새 화면의 기본 영역으로 초점을 옮긴다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(screen.getByRole("main")).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(screen.getByRole("main")).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "홈으로" }));

    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("홈에서 재료 선택 화면을 열면 채소 재료를 보여준다", async () => {
    const user = renderApp();

    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(
      screen.getByRole("heading", { name: "재료 선택" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "김치" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "돼지고기" }),
    ).not.toBeInTheDocument();
  });

  it("카테고리를 바꾸면 해당 재료 목록만 보여준다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    await user.click(screen.getByRole("button", { name: "고기" }));

    expect(
      screen.getByRole("button", { name: "돼지고기" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "김치" }),
    ).not.toBeInTheDocument();
  });

  it("서로 다른 카테고리의 재료를 선택하고 하나만 해제한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "김치" }));
    await user.click(screen.getByRole("button", { name: "고기" }));
    await user.click(screen.getByRole("button", { name: "돼지고기" }));

    expect(
      screen.getByRole("heading", { name: "선택한 재료 2개" }),
    ).toBeInTheDocument();
    expect(screen.getByText("김치, 돼지고기")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "돼지고기" }));

    expect(
      screen.getByRole("heading", { name: "선택한 재료 1개" }),
    ).toBeInTheDocument();
    expect(screen.getByText("김치")).toBeInTheDocument();
    expect(screen.queryByText("김치, 돼지고기")).not.toBeInTheDocument();
  });

  it("홈으로 이동한 뒤 다시 돌아오면 재료 선택을 유지한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "김치" }));
    await user.click(screen.getByRole("button", { name: "홈으로" }));

    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(screen.getByRole("button", { name: "김치" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("heading", { name: "선택한 재료 1개" }),
    ).toBeInTheDocument();
  });

  it("추천 결과에서 홈으로 돌아간다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "김치" }));
    await user.click(screen.getByRole("button", { name: "탄수화물" }));
    await user.click(screen.getByRole("button", { name: "밥" }));
    await user.click(screen.getByRole("button", { name: "양념" }));
    await user.click(screen.getByRole("button", { name: "식용유" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByRole("heading", { name: "추천 결과" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "홈으로" }));

    expect(
      screen.getByRole("heading", {
        name: "냉장고 속 재료로 오늘 메뉴를 골라보세요",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "재료 고르기" }));

    expect(screen.getByRole("button", { name: "김치" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("대체 후보가 있으면 다시 뽑아 다른 메뉴를 보여준다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "계란·유제품" }));
    await user.click(screen.getByRole("button", { name: "달걀" }));
    await user.click(screen.getByRole("button", { name: "탄수화물" }));
    await user.click(screen.getByRole("button", { name: "밥" }));
    await user.click(screen.getByRole("button", { name: "양념" }));
    await user.click(screen.getByRole("button", { name: "식용유" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    const firstRecipe = screen.getByRole("heading", { level: 2 }).textContent;
    await user.click(screen.getByRole("button", { name: "다시 뽑기" }));

    expect(screen.getByRole("heading", { level: 2 }).textContent).not.toBe(
      firstRecipe,
    );
  });

  it("재료를 선택하지 않으면 먼저 재료를 고르도록 안내한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByText("메뉴를 추천하려면 재료를 먼저 선택해 주세요."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "재료 선택하기" }));
    expect(
      screen.getByRole("heading", { name: "선택한 재료 0개" }),
    ).toBeInTheDocument();
  });

  it("추천 후보가 없으면 재료를 추가하거나 바꾸도록 안내한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "당근" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByText("현재 재료로 추천할 수 있는 메뉴가 없어요."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "재료 추가·변경하기" }),
    );
    expect(screen.getByRole("button", { name: "당근" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("후보가 하나면 다시 뽑기 대신 단일 후보 안내를 표시한다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "계란·유제품" }));
    await user.click(screen.getByRole("button", { name: "치즈" }));
    await user.click(screen.getByRole("button", { name: "버터" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));

    expect(
      screen.getByText("현재 재료로 추천할 수 있는 메뉴가 1개예요."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다시 뽑기" }),
    ).not.toBeInTheDocument();
  });

  it("처음부터를 누르면 선택 상태를 비우고 재료 선택으로 돌아간다", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "재료 고르기" }));
    await user.click(screen.getByRole("button", { name: "김치" }));
    await user.click(screen.getByRole("button", { name: "탄수화물" }));
    await user.click(screen.getByRole("button", { name: "밥" }));
    await user.click(screen.getByRole("button", { name: "양념" }));
    await user.click(screen.getByRole("button", { name: "식용유" }));
    await user.click(screen.getByRole("button", { name: "메뉴 뽑기" }));
    await user.click(screen.getByRole("button", { name: "처음부터" }));

    expect(
      screen.getByRole("heading", { name: "선택한 재료 0개" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "김치" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
