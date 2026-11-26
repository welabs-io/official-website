import { afterEach, describe, expect, it } from "vitest";
import {
  EARLY_HOLD_KEY,
  earlyHoldScript,
  releaseEarlyHold,
} from "./early-hold";

// SCRIPT INLINE QUE RETÉM O CLIQUE
// The inline script runs alone in the page, so it is run here from its source, against a stub of window: if it used
// anything outside its own body, the evaluation below would throw.
class FakeElement {
  constructor(public href: string | null) {}
  closest() {
    return this.href ? this : null;
  }
}

type Listener = (event: unknown) => void;

function stubPage(pathname: string) {
  const listeners = new Set<Listener>();
  const w: Record<string, unknown> = {
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  };
  Object.assign(globalThis, {
    window: w,
    location: {
      href: `https://welabs.io${pathname}`,
      pathname,
      origin: "https://welabs.io",
    },
    Element: FakeElement,
  });
  const click = (href: string | null) => {
    const event = {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      target: new FakeElement(href ? `https://welabs.io${href}` : null),
      prevented: false,
      preventDefault() {
        this.prevented = true;
      },
    };
    for (const fn of listeners) fn(event);
    return event.prevented;
  };
  return { w, listeners, click };
}

afterEach(() => {
  for (const key of ["window", "location", "Element"])
    delete (globalThis as Record<string, unknown>)[key];
});

describe("early hold", () => {
  it("runs from its own source and holds a click on a product or the home", () => {
    const page = stubPage("/products/knowly");
    new Function(earlyHoldScript())();
    expect(page.w[EARLY_HOLD_KEY]).toBeDefined();
    expect(page.click("/products/domus")).toBe(true);
    expect(page.click("/en/products/relloo")).toBe(true);
    const held = releaseEarlyHold();
    expect(held && (held as unknown as FakeElement).href).toBe(
      "https://welabs.io/en/products/relloo",
    );
    expect(page.listeners.size).toBe(0);
  });

  it("lets other links and the current page go through", () => {
    const page = stubPage("/products/knowly");
    new Function(earlyHoldScript())();
    expect(page.click("/contact")).toBe(false);
    expect(page.click("/products/knowly")).toBe(false);
    expect(page.click(null)).toBe(false);
    expect(releaseEarlyHold()).toBeNull();
  });

  it("returns nothing when the script never ran", () => {
    stubPage("/");
    expect(releaseEarlyHold()).toBeNull();
  });
});
