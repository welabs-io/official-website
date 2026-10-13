// TESTES DO CARROSSEL CIRCULAR
// Positions around the ring, the flat segment list with the hold and the transition of the manifest, and the shape of the
// slides: the site decides no time, everything on screen comes from lib/motion-manifest.json.
import { describe, expect, it } from "vitest";
import { MANIFEST } from "@/lib/manifest";
import { chainSlides, productSlides } from "@/lib/motion-slides";
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
    for (const slides of [chainSlides(), productSlides()])
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
    for (const slides of [chainSlides(), productSlides()])
      for (const slide of slides)
        for (const segment of slide.segments) {
          const duration = MANIFEST.pieces[segment.id].duration;
          expect(segment.range[0]).toBeGreaterThanOrEqual(0);
          expect(segment.range[1]).toBeLessThanOrEqual(duration + 1e-9);
        }
  });
});

// Time on screen of each tile of the products ring of the home (intro and film, holds included) before the
// faster-rotation round, from the manifest of that day (portfolio-20261002, 12/10): the new time must be at least 35%
// shorter. The support films of the product pages are no longer played by the site (native scenes since 13/10).
const TILE_SECONDS_BEFORE: Record<string, number> = {
  domus: 24.07,
  relloo: 32.93,
  magneto: 23.81,
  tuner: 23.44,
  knowly: 25.65,
};
const tileSeconds = (segments: ReturnType<typeof flatten>) =>
  segments.reduce(
    (sum, s) => sum + (s.range[1] - s.range[0]) / s.rate + s.hold,
    0,
  );

describe("faster rotation of the video rings", () => {
  const tiles = productSlides();
  it("every tile is at least 35% shorter than before", () => {
    for (const slide of tiles) {
      // A product tile is keyed by its slug, a support film by its piece
      const key = slide.key;
      const before = TILE_SECONDS_BEFORE[key];
      expect(before, key).toBeGreaterThan(0);
      const now = tileSeconds(flatten([slide]));
      expect(now, key).toBeLessThanOrEqual(before * 0.65 + 1e-9);
    }
  });
  it("the tail of each opening is about 1.6 s and every hold about 0.8 s", () => {
    for (const { slug } of PRODUCTS) {
      const { intro } = MANIFEST.products[slug];
      expect((intro.to - intro.from) / intro.rate).toBeCloseTo(1.6, 1);
      expect(intro.holdAfter).toBeCloseTo(0.8, 2);
    }
    for (const slide of tiles)
      for (const segment of slide.segments)
        expect(segment.holdAfter).toBeLessThanOrEqual(0.8 + 1e-9);
  });
  it("films run at 2x or less (the reading limit) and the swap between tiles is a rotation of 0.6 to 0.8 s", () => {
    for (const slide of tiles) {
      for (const segment of slide.segments)
        expect(segment.rate).toBeLessThanOrEqual(2 + 1e-9);
      const last = slide.segments[slide.segments.length - 1];
      expect(last.transition.duration).toBeGreaterThanOrEqual(0.6);
      expect(last.transition.duration).toBeLessThanOrEqual(0.8);
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
