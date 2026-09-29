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
});
