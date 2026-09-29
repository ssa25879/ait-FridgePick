import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: vi.fn((query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })),
});

Object.defineProperty(window, "__appsInTossConstants", {
  configurable: true,
  value: {
    safeAreaInsets: {
      top: "0px",
      bottom: "0px",
      left: "0px",
      right: "0px",
    },
  },
});

afterEach(() => cleanup());
