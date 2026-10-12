// TESTES DO CARROSSEL CIRCULAR
// Positions around the ring, the flat segment list with the hold and the transition of the manifest, and the shape of the
// slides: the site decides no time, everything on screen comes from lib/motion-manifest.json.
import { describe, expect, it } from "vitest";
import { MANIFEST } from "@/lib/manifest";
import {
  chainSlides,
  productPageSlides,
  productSlides,
} from "@/lib/motion-slides";
import { PRODUCTS } from "@/lib/products";
import { PLAYER_SRC, piece } from "./player";
import { ringPosition } from "./positions";
import { flatten } from "./ring-playback";

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
  it("the last tile is the previous one of the first: the loop closes without a seam", () => {
    expect(ringPosition(5, 0, 6)).toBe(-1);
    expect(ringPosition(0, 5, 6)).toBe(1);
  });
  it("two tiles: the other tile always waits on the right", () => {
    expect([0, 1].map((i) => ringPosition(i, 0, 2))).toEqual([0, 1]);
    expect([0, 1].map((i) => ringPosition(i, 1, 2))).toEqual([1, 0]);
  });
});

describe("flat segments follow the manifest", () => {
  it("the lead of every segment is the duration of its transition, never past 80% of its real time", () => {
    for (const slides of [
      chainSlides(),
      productSlides(),
      ...PRODUCTS.map((p) => productPageSlides(p.slug)),
    ])
      for (const segment of flatten(slides)) {
        const real = (segment.range[1] - segment.range[0]) / segment.rate;
        expect(segment.lead).toBeCloseTo(
          Math.min(segment.transition.duration, real * 0.8),
        );
      }
  });
  it("the hold of every segment is the holdAfter of the manifest", () => {
    const flat = flatten(chainSlides());
    expect(flat.map((s) => s.hold)).toEqual(
      MANIFEST.chain.steps.map((s) => s.holdAfter),
    );
    expect(flat.every((s) => s.hold >= MANIFEST.defaults.holdAfter)).toBe(true);
  });
  it("the chain cycle is the one the manifest declares", () => {
    const cycle = flatten(chainSlides()).reduce(
      (sum, s) => sum + (s.range[1] - s.range[0]) / s.rate + s.hold,
      0,
    );
    expect(cycle).toBeCloseTo(MANIFEST.chain.cycleSeconds!, 1);
  });
  it("the rate of every segment is the one of the manifest", () => {
    const flat = flatten(chainSlides());
    expect(flat.map((s) => s.rate)).toEqual(
      MANIFEST.chain.steps.map((s) => s.rate),
    );
  });
});

describe("slides of the home", () => {
  it("the chain has one slide per step, each with the products and the label of its connection", () => {
    const slides = chainSlides();
    expect(slides).toHaveLength(MANIFEST.chain.steps.length);
    slides.forEach((slide, i) => {
      const step = MANIFEST.chain.steps[i];
      expect(slide.label).toBe(step.srLabel);
      expect(slide.segments).toHaveLength(1);
      expect(slide.segments[0].products).toEqual(step.products);
      expect(slide.connection?.label).toBe(step.connection.label);
      expect(slide.cover.w1280).toBe(step.covers.settled.w1280);
    });
  });
  it("narrowing the chain to a product keeps the steps that show it, in order", () => {
    for (const { slug } of PRODUCTS) {
      const slides = chainSlides(slug);
      expect(slides.length).toBeGreaterThan(0);
      for (const slide of slides)
        expect(slide.segments[0].products).toContain(slug);
    }
  });
  it("each product opens with its opening piece (named for screen readers) and then plays its main film", () => {
    const slides = productSlides();
    expect(slides.map((s) => s.slug)).toEqual(PRODUCTS.map((p) => p.slug));
    for (const slide of slides) {
      const entry = MANIFEST.products[slide.slug!];
      const main = entry.films.find((f) => f.role === "main")!;
      expect(slide.label).toBe(entry.intro.title);
      expect(slide.segments[0].id).toBe(entry.intro.piece);
      expect(slide.segments[0].id).toMatch(/intro/);
      expect(slide.segments.slice(1).map((s) => s.id)).toEqual(
        main.segments.map((s) => s.piece),
      );
      // The intro blends into the film (manifest), the film hands off to the next product
      expect(slide.segments[0].transition.type).toBe("blend");
      expect(slide.cover.w1280).toBe(entry.intro.covers.settled.w1280);
      expect(slide.endCover?.w1280).toBe(
        main.segments[main.segments.length - 1].covers.settled.w1280,
      );
    }
  });
  it("no range goes past the duration of its piece", () => {
    for (const slides of [
      chainSlides(),
      productSlides(),
      ...PRODUCTS.map((p) => productPageSlides(p.slug)),
    ])
      for (const slide of slides)
        for (const segment of slide.segments) {
          const duration = MANIFEST.pieces[segment.id].duration;
          expect(segment.range[0]).toBeGreaterThanOrEqual(0);
          expect(segment.range[1]).toBeLessThanOrEqual(duration + 1e-9);
        }
  });
});

describe("product page carousel", () => {
  it("is one ring: the opening with the main film, then each support film in full, with its title", () => {
    for (const { slug } of PRODUCTS) {
      const slides = productPageSlides(slug);
      const support = MANIFEST.products[slug].films.filter(
        (f) => f.role === "support",
      );
      expect(slides).toHaveLength(1 + support.length);
      expect(slides[0].segments[0].id).toMatch(/intro/);
      support.forEach((film, i) => {
        const slide = slides[i + 1];
        expect(slide.label).toBe(film.title);
        expect(slide.segments.map((s) => s.id)).toEqual(
          film.segments.map((s) => s.piece),
        );
        expect(slide.segments[0].id).not.toMatch(/intro/);
        expect(slide.endCover?.w640).toMatch(/\.webp$/);
      });
    }
  });
});

describe("player addresses", () => {
  it("the player script and every piece address are the ones of the manifest", () => {
    expect(PLAYER_SRC).toBe(MANIFEST.player.src);
    for (const [id, p] of Object.entries(MANIFEST.pieces))
      expect(piece(id)).toBe(p.src);
  });
});
