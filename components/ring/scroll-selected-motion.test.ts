// TESTES DO ENQUADRAMENTO MANUAL
// Real rectangle geometry must account for both pinned bars and preserve an already readable viewport.
import { afterEach, describe, expect, it, vi } from "vitest";
import { revealSelectedMotion } from "./scroll-selected-motion";

afterEach(() => vi.unstubAllGlobals());

function fixture(top: number, bottom: number, reduced = false) {
  const viewport = { getBoundingClientRect: () => ({ top, bottom }) };
  const header = { position: "fixed", top: 0, bottom: 72, width: 390 };
  const navigation = { position: "sticky", top: 72, bottom: 132, width: 390 };
  const offscreen = { position: "sticky", top: 300, bottom: 340, width: 390 };
  const scrollTo = vi.fn();
  vi.stubGlobal("document", {
    querySelectorAll: () =>
      [offscreen, navigation, header].map((bounds) => ({
        position: bounds.position,
        getBoundingClientRect: () => bounds,
      })),
  });
  vi.stubGlobal("getComputedStyle", (element: { position: string }) => element);
  vi.stubGlobal("window", {
    scrollTo,
    scrollY: 900,
    innerHeight: 844,
    matchMedia: () => ({ matches: reduced }),
  });
  return {
    root: { querySelector: vi.fn(() => viewport) } as unknown as HTMLElement,
    scrollTo,
  };
}

describe("manual narrative framing", () => {
  it("reveals a clipped frame below the measured header and navigation plus 16px", () => {
    const { root, scrollTo } = fixture(-121.4, 75.5);
    revealSelectedMotion(root);
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
      top: 630.6,
      behavior: "smooth",
    });
  });

  it("also locates a product ring without the narrative-only viewport attribute", () => {
    const { root, scrollTo } = fixture(-115.375, 199.625);
    revealSelectedMotion(root);
    expect(root.querySelector).toHaveBeenCalledWith(
      "[data-motion-viewport], [data-ring]",
    );
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
      top: 636.625,
      behavior: "smooth",
    });
  });

  it("uses immediate motion under the reduced-motion preference", () => {
    const { root, scrollTo } = fixture(750, 947, true);
    revealSelectedMotion(root);
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
      top: 1502,
      behavior: "auto",
    });
  });

  it("keeps a readable frame and page position unchanged", () => {
    const { root, scrollTo } = fixture(148, 345);
    revealSelectedMotion(root);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
