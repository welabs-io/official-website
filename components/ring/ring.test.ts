// TESTES DO CARROSSEL CIRCULAR
// Positions around the ring, the flat segment list with its leads, and the shape of the slides: the chain montage has no
// opening and runs at 2.5x, the product ring uses 1.5 to 2.5 s of each opening, nothing is a sequential player.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pieces from "@/lib/motion-pieces.json";
import fluid from "@/lib/fluid-motion-pieces.json";
import montage from "@/lib/home-montage.json";
import {
  INTRO_HOLD,
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  productFilms,
  heroSlides,
} from "@/lib/motion-slides";
import { PRODUCTS } from "@/lib/products";
import { ringPosition } from "./positions";
import { BLEND_SECONDS, SWAP_SECONDS, flatten } from "./ring-playback";

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
  it("the authored cut count retains circular previous and next positions", () => {
    const count = MONTAGE_SLIDES.flatMap((slide) => slide.segments).length;
    const positions = Array.from({ length: count }, (_, i) =>
      ringPosition(i, 0, count),
    );
    expect(positions[0]).toBe(0);
    expect(positions[1]).toBe(1);
    expect(positions[count - 1]).toBe(-1);
    // The last cut is the previous one of the first: the loop closes without a seam
    expect(ringPosition(count - 1, 0, count)).toBe(-1);
    expect(ringPosition(0, count - 1, count)).toBe(1);
  });
  it("the swap duration is the push duration of the leaving cut (0.4 s between products, 0.3 s inside one)", () => {
    const flat = flatten(MONTAGE_SLIDES);
    expect(flat.map((segment) => segment.lead)).toEqual(
      montage.steps.flatMap((step) =>
        step.segments.map((segment) => segment.transition.duration),
      ),
    );
  });
});

describe("flat segments", () => {
  it("swap lead between slides, blend lead inside a slide, never past 80%", () => {
    const flat = flatten(PRODUCT_SLIDES);
    expect(flat).toHaveLength(PRODUCTS.length);
    // Independent identities hand off between product slots; detail heroes still blend within the same slot.
    expect(flat.every((segment) => segment.lead === SWAP_SECONDS)).toBe(true);
    expect(flatten(heroSlides("domus"))[0].lead).toBeCloseTo(BLEND_SECONDS);
    expect(SWAP_SECONDS).toBe(1);
    for (const segment of flat)
      expect(segment.lead).toBeLessThanOrEqual(
        (segment.range[1] - segment.range[0]) * 0.8 + 1e-9,
      );
  });
});

describe("slides of the home", () => {
  it("keeps the same accepted journey and person across its three contextual chapters", () => {
    const cuts = MONTAGE_SLIDES.flatMap((slide) => slide.segments);
    expect(cuts).toHaveLength(3);
    expect(new Set(cuts.map((cut) => cut.id))).toEqual(
      new Set([
        fluid.pieces.find(
          ({ sourceId }) =>
            sourceId === "welabs-chain-journey-define-logos-r6-s1",
        )!.id,
      ]),
    );
    expect(cuts.map((cut) => cut.range)).toEqual([
      [6.5, 9.18],
      [12.7, 15.68],
      [25.3, 30.79],
    ]);
    expect(MONTAGE_SLIDES.map((slide) => slide.poster)).toEqual([
      "/motion/posters/cut-4-standalone.webp",
      "/motion/posters/cut-9-standalone.webp",
      "/motion/posters/cut-6-standalone.webp",
    ]);
  });
  it("the chain is a montage of product cuts and relation cuts, each at its own rate, no opening", () => {
    expect(MONTAGE_SLIDES.map((s) => s.slug)).toEqual(
      montage.steps.map((step) => step.product),
    );
    for (const slide of MONTAGE_SLIDES) {
      expect(slide.segments.length).toBeGreaterThan(0);
      for (const { id, rate } of slide.segments) {
        expect(id).not.toMatch(/intro/);
        expect(rate).toBeGreaterThanOrEqual(0.5);
        expect(rate).toBeLessThanOrEqual(2.5);
      }
    }
    expect(montage.steps).toHaveLength(MONTAGE_SLIDES.length);
  });
  it("the compact narrative keeps reading holds and consumes its authored pushes", () => {
    let cycle = 0;
    const cuts = MONTAGE_SLIDES.flatMap((slide, si) =>
      slide.segments.map((segment) => ({ ...segment, si })),
    );
    cuts.forEach((cut) => {
      const screen = (cut.range[1] - cut.range[0]) / (cut.rate ?? 1);
      // The last frame stays still for the hold (1 s by default) before the push out starts
      expect(cut.holdAfter).toBeGreaterThanOrEqual(1);
      expect(cut.transition?.duration).toBeGreaterThan(0);
      expect(["push-up", "push-left"]).toContain(cut.transition?.type);
      cycle += screen + (cut.holdAfter ?? 0) - (cut.transition?.duration ?? 0);
    });
    expect(cycle).toBeGreaterThanOrEqual(15);
    expect(cycle).toBeLessThanOrEqual(27);
  });
  it("product cuts and relation cuts alternate and the Domus house is never shown empty", () => {
    const kinds = montage.steps.flatMap((s) => s.segments.map((c) => c.kind));
    expect(kinds.filter((k) => k === "relation").length).toBeGreaterThanOrEqual(
      1,
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
  it("each product retains its complete identity formation and a legible settled-mark hold without a film cover", () => {
    const flat = flatten(PRODUCT_SLIDES);
    PRODUCT_SLIDES.forEach((slide) => {
      const entry = pieces.products[slide.slug as keyof typeof pieces.products];
      expect(slide.segments).toHaveLength(1);
      const [opening] = slide.segments;
      expect(opening.range).toEqual([0, entry.intro.duration]);
      expect(opening.holdAfter).toBe(INTRO_HOLD);
      expect(slide.endPoster).toBeUndefined();
      expect(slide.poster).toBe(`/motion/posters/tail-${slide.slug}.webp`);
    });
    // The additional reading interval belongs to the formed identity only.
    expect(flat.map((segment) => segment.hold)).toEqual(
      PRODUCT_SLIDES.map(() => INTRO_HOLD),
    );
  });
  it("the site copy of every opening hides the tagline slot", () => {
    for (const product of Object.values(pieces.products)) {
      const html = readFileSync(
        join(
          process.cwd(),
          "public/motion/pieces",
          product.intro.id,
          "index.html",
        ),
        "utf8",
      );
      expect(html).toContain(".role{display:none!important}");
    }
  });
  it("the five brand openings keep commercial order and never load product-film segments", () => {
    expect(PRODUCT_SLIDES.map((s) => s.slug)).toEqual(
      PRODUCTS.map((p) => p.slug),
    );
    for (const slide of PRODUCT_SLIDES) {
      expect(slide.segments).toHaveLength(1);
      const [opening] = slide.segments;
      expect(opening.id).toMatch(/intro/);
      expect(opening.range[0]).toBe(0);
      expect(opening.range[1]).toBeGreaterThan(5);
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
      ...PRODUCTS.flatMap((p) => productFilms(p.slug)),
    ];
    for (const slide of all)
      for (const segment of slide.segments)
        expect(segment.range[1]).toBeLessThanOrEqual(
          durations.get(segment.id)!,
        );
  });
});

describe("product page carousel", () => {
  it("holds the other films in full, each with a last-frame cover, and never the opening", () => {
    for (const { slug } of PRODUCTS) {
      const slides = productFilms(slug);
      const films = pieces.products[slug].films;
      expect(slides).toHaveLength(films.length - 1);
      slides.forEach((slide, i) => {
        expect(slide.segments).toHaveLength(1);
        expect(slide.segments[0].id).toBe(films[i + 1].id);
        expect(slide.segments[0].id).not.toMatch(/intro/);
        expect(slide.segments[0].holdAfter).toBe(montage.holdAfter);
        expect(slide.endPoster).toBe(
          `/motion/posters/end-${films[i + 1].id}.webp`,
        );
      });
    }
  });
});

describe("ring positions with two tiles", () => {
  it("the other tile always waits on the right", () => {
    expect([0, 1].map((i) => ringPosition(i, 0, 2))).toEqual([0, 1]);
    expect([0, 1].map((i) => ringPosition(i, 1, 2))).toEqual([1, 0]);
  });
});
