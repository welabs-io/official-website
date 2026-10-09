// TESTES DO CARROSSEL CIRCULAR
// Positions around the ring, the flat segment list with its leads, and the shape of the slides: the chain montage has no
// opening and runs at 2.5x, the product ring uses 1.5 to 2.5 s of each opening, nothing is a sequential player.
import { describe, expect, it } from "vitest";
import pieces from "@/lib/motion-pieces.json";
import montage from "@/lib/home-montage.json";
import {
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  productReel,
} from "@/lib/motion-slides";
import { PRODUCTS } from "@/lib/products";
import { ringPosition } from "./Ring";
import {
  BLEND_SECONDS,
  SWAP_SECONDS,
  firstSegmentOf,
  flatten,
} from "./ring-playback";

describe("ring positions", () => {
  it("five slides: centre, two neighbours, two behind", () => {
    const positions = [0, 1, 2, 3, 4].map((i) => ringPosition(i, 0, 5));
    expect(positions).toEqual([0, 1, 2, -2, -1]);
    expect(ringPosition(3, 3, 5)).toBe(0);
    expect(ringPosition(0, 4, 5)).toBe(1);
  });
  it("four slides: one hidden at the back", () => {
    expect([0, 1, 2, 3].map((i) => ringPosition(i, 0, 4))).toEqual([
      0, 1, -2, -1,
    ]);
  });
});

describe("circular carousel of the workbench", () => {
  it("nine cuts: the previous and the next sit beside the active one, the rest clamp behind", () => {
    const positions = Array.from({ length: 9 }, (_, i) =>
      ringPosition(i, 0, 9),
    );
    expect(positions).toEqual([0, 1, 2, 3, 4, -4, -3, -2, -1]);
    // The last cut is the previous one of the first: the loop closes without a seam
    expect(ringPosition(8, 0, 9)).toBe(-1);
    expect(ringPosition(0, 8, 9)).toBe(1);
  });
  it("the swap duration is the push duration of the leaving cut (0.4 s between products, 0.3 s inside one)", () => {
    const flat = flatten(MONTAGE_SLIDES);
    expect(new Set(flat.map((segment) => segment.lead))).toEqual(
      new Set([0.4, 0.3]),
    );
  });
});

describe("flat segments", () => {
  it("swap lead between slides, blend lead inside a slide, never past 80%", () => {
    const flat = flatten(PRODUCT_SLIDES);
    expect(flat).toHaveLength(PRODUCTS.length * 2);
    // opening tail -> film (same slide)
    expect(flat[0].lead).toBeCloseTo(BLEND_SECONDS);
    // film -> next product opening (another slide)
    expect(flat[1].lead).toBeCloseTo(SWAP_SECONDS);
    for (const segment of flat)
      expect(segment.lead).toBeLessThanOrEqual(
        (segment.range[1] - segment.range[0]) * 0.8 + 1e-9,
      );
    expect(firstSegmentOf(flat, 2)).toBe(4);
  });
});

describe("slides of the home", () => {
  it("the chain is a montage of product cuts and relation cuts, each at its own rate, no opening", () => {
    expect(MONTAGE_SLIDES.map((s) => s.slug)).toEqual([
      "tuner",
      "relloo",
      "domus",
      "magneto",
      "knowly",
    ]);
    for (const slide of MONTAGE_SLIDES) {
      expect(slide.segments.length).toBeGreaterThan(0);
      for (const { id, rate } of slide.segments) {
        expect(id).not.toMatch(/intro/);
        expect(rate).toBeGreaterThanOrEqual(1.25);
        expect(rate).toBeLessThanOrEqual(2.5);
      }
    }
    expect(montage.steps).toHaveLength(MONTAGE_SLIDES.length);
  });
  it("the loop lasts 34 to 40 s, every cut holds its last frame for 2 s and the pushes follow the product changes", () => {
    let cycle = 0;
    const cuts = MONTAGE_SLIDES.flatMap((slide, si) =>
      slide.segments.map((segment) => ({ ...segment, si })),
    );
    cuts.forEach((cut, i) => {
      const screen = (cut.range[1] - cut.range[0]) / (cut.rate ?? 1);
      // The last frame stays still for the hold (2 s by default) before the push out starts
      expect(cut.holdAfter).toBeGreaterThanOrEqual(2);
      // 0.4 s between products, 0.3 s inside the same product
      const next = cuts[(i + 1) % cuts.length];
      expect(cut.transition?.duration).toBe(next.si === cut.si ? 0.3 : 0.4);
      expect(cut.transition?.type).toBe(
        next.si === cut.si ? "push-up" : "push-left",
      );
      cycle += screen + (cut.holdAfter ?? 0) - (cut.transition?.duration ?? 0);
    });
    expect(cycle).toBeGreaterThanOrEqual(34);
    expect(cycle).toBeLessThanOrEqual(40);
  });
  it("product cuts and relation cuts alternate and the Domus house is never shown empty", () => {
    const kinds = montage.steps.flatMap((s) => s.segments.map((c) => c.kind));
    expect(kinds.filter((k) => k === "relation").length).toBeGreaterThanOrEqual(
      4,
    );
    for (let i = 1; i < kinds.length; i++)
      if (kinds[i] === "product") expect(kinds[i - 1]).toBe("relation");
    // hub-defines-runs draws the house as an outline for its whole length: no cut may use it
    for (const slide of MONTAGE_SLIDES)
      for (const { id } of slide.segments)
        expect(id).not.toMatch(/hub-defines-runs/);
  });
  it("the lead of a cut is the duration of its push", () => {
    const flat = flatten(MONTAGE_SLIDES);
    for (const segment of flat)
      expect(segment.lead).toBe(segment.transition?.duration);
  });
  it("the lead never exceeds 80% of the real time of a clip", () => {
    const flat = flatten(MONTAGE_SLIDES, montage.swap);
    for (const segment of flat)
      expect(segment.lead).toBeLessThanOrEqual(
        ((segment.range[1] - segment.range[0]) / segment.rate) * 0.8 + 1e-9,
      );
  });
  it("the products keep the weight order, each with a short opening tail and a 6 to 9 s clip", () => {
    expect(PRODUCT_SLIDES.map((s) => s.slug)).toEqual(
      PRODUCTS.map((p) => p.slug),
    );
    for (const slide of PRODUCT_SLIDES) {
      const [tail, film] = slide.segments;
      expect(tail.id).toMatch(/intro/);
      expect(tail.range[1] - tail.range[0]).toBeGreaterThanOrEqual(1.5);
      expect(tail.range[1] - tail.range[0]).toBeLessThanOrEqual(2.5);
      expect(film.id).not.toMatch(/intro/);
      expect(film.range[1] - film.range[0]).toBeGreaterThanOrEqual(6);
      expect(film.range[1] - film.range[0]).toBeLessThanOrEqual(9);
    }
  });
  it("no range goes past the duration of its piece", () => {
    const durations = new Map<string, number>();
    for (const film of pieces.chain) durations.set(film.id, film.duration);
    for (const product of Object.values(pieces.products)) {
      durations.set(product.intro.id, product.intro.duration);
      for (const film of product.films) durations.set(film.id, film.duration);
    }
    const all = [
      ...MONTAGE_SLIDES,
      ...PRODUCT_SLIDES,
      ...PRODUCTS.flatMap((p) => productReel(p.slug)),
    ];
    for (const slide of all)
      for (const segment of slide.segments)
        expect(segment.range[1]).toBeLessThanOrEqual(
          durations.get(segment.id)!,
        );
  });
});

describe("product page ring", () => {
  it("opens with the whole opening, then the films in full", () => {
    for (const { slug } of PRODUCTS) {
      const slides = productReel(slug);
      expect(slides[0].segments[0].id).toMatch(/intro/);
      expect(slides[0].segments[0].range[0]).toBe(0);
      for (const slide of slides.slice(1))
        expect(slide.segments[0].id).not.toMatch(/intro/);
    }
  });
});
