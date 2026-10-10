// TESTES DOS CONECTORES
// The graph of the home and of the product pages: geometry of the two layouts, the state of each product, and the
// links the block gives to the other products. The markup is rendered on the server and read as text.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CORE,
  RAILS,
  TALL,
  WIDE,
  nodeAt,
  railRuns,
  stateOf,
} from "@/lib/connectors";
import { PRODUCTS } from "@/lib/products";
import { Connectors } from "./Connectors";
import { OnePage } from "./OnePage";

describe("graph geometry", () => {
  it.each([WIDE, TALL])(
    "$name: every logo sits inside the view box and the core covers every rail",
    (layout) => {
      for (const { slug } of PRODUCTS) {
        const box = nodeAt(layout, slug);
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.top).toBeGreaterThanOrEqual(0);
        expect(box.left + box.width).toBeLessThanOrEqual(layout.width);
        expect(box.top + box.height).toBeLessThanOrEqual(layout.height);
      }
      // Rails stay between the edges of the core, so every pulse passes behind it
      const [lo, hi] = layout.core.across;
      for (const across of layout.rails) {
        expect(across).toBeGreaterThan(0);
        expect(across).toBeLessThan(
          layout.name === "wide" ? layout.height : layout.width,
        );
      }
      expect(lo).toBeLessThan(hi);
      expect(layout.core.along[0]).toBeGreaterThan(layout.from);
      expect(layout.core.along[1]).toBeLessThan(layout.to);
    },
  );
  it("the rail logos do not overlap each other", () => {
    for (const layout of [WIDE, TALL]) {
      const boxes = RAILS.map((slug) => nodeAt(layout, slug));
      for (let i = 1; i < boxes.length; i++) {
        const a = boxes[i - 1];
        const b = boxes[i];
        const apart =
          layout.name === "wide"
            ? b.top - (a.top + a.height)
            : b.left - (a.left + a.width);
        expect(apart).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("state of each product", () => {
  it("without a lit product everything is linked and every rail runs", () => {
    for (const { slug } of PRODUCTS) expect(stateOf(slug)).toBe("linked");
    for (const slug of RAILS) expect(railRuns(slug)).toBe(true);
  });
  it("a rail product lights itself and the core; the other rails dim and stop", () => {
    expect(stateOf("tuner", "tuner")).toBe("lit");
    for (const slug of CORE) expect(stateOf(slug, "tuner")).toBe("linked");
    expect(stateOf("magneto", "tuner")).toBe("dim");
    expect(railRuns("magneto", "tuner")).toBe(false);
    expect(railRuns("tuner", "tuner")).toBe(true);
  });
  it("a core product is tied to the other half and to every rail", () => {
    expect(stateOf("domus", "domus")).toBe("lit");
    expect(stateOf("relloo", "domus")).toBe("linked");
    for (const slug of RAILS) expect(stateOf(slug, "domus")).toBe("linked");
  });
});

describe("connectors markup", () => {
  it("the home block links all five products and has no visible text", () => {
    const html = renderToStaticMarkup(<Connectors tone="dark" />);
    // Two layouts are rendered; CSS shows one
    for (const { slug } of PRODUCTS)
      expect(
        html.match(new RegExp(`href="/products/${slug}"`, "g")),
      ).toHaveLength(2);
    expect(html).not.toMatch(/aria-current/);
    expect(html.replace(/<[^>]+>/g, "").trim()).toBe("");
    // The drawing is decorative
    expect(html).toContain('aria-hidden="true"');
  });
});

describe("the thread and the live markers", () => {
  it("every band of the home is marked live, so the thread and the pulses pause off screen", () => {
    const html = renderToStaticMarkup(<OnePage />);
    const bands = html.match(/<section[^>]*>/g) ?? [];
    expect(bands).toHaveLength(4);
    for (const band of bands) expect(band).toContain("data-live");
    expect(html).toContain('id="connectors"');
  });
});
