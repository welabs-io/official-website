// INTEGRIDADE DOS ROTEIROS DE PRODUTO
// Editorial ranges must resolve to shipped accepted sources and remain inside their authored duration.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import pieces from "./motion-pieces.json";
import { PRODUCTS } from "./products";
import {
  getProductMotionPlan,
  PRODUCT_MOTION_PLANS,
} from "./product-motion-plans";

const durations = new Map<string, number>([
  ...pieces.chain.map(({ id, duration }) => [id, duration] as const),
  ...Object.values(pieces.products).flatMap(({ intro, films }) => [
    [intro.id, intro.duration] as const,
    ...films.map(({ id, duration }) => [id, duration] as const),
  ]),
]);

describe("independent motion production plans", () => {
  it("provides a dedicated plan for every public product", () => {
    expect(Object.keys(PRODUCT_MOTION_PLANS).sort()).toEqual(
      PRODUCTS.map(({ slug }) => slug).sort(),
    );
    expect(
      new Set(Object.values(PRODUCT_MOTION_PLANS).map(({ id }) => id)).size,
    ).toBe(5);
  });

  it.each(PRODUCTS)(
    "$slug starts with an action and preserves ordered chapters and usable source ranges",
    ({ slug }) => {
      const plan = getProductMotionPlan(slug);
      expect(plan.chapters.length).toBeGreaterThanOrEqual(3);
      expect(new Set(plan.chapters.map(({ key }) => key)).size).toBe(
        plan.chapters.length,
      );
      const segments = plan.chapters.flatMap((chapter) => chapter.segments);
      expect(
        segments.every((segment) => !segment.pieceId.includes("intro")),
      ).toBe(true);
      expect(
        segments.reduce(
          (duration, segment) =>
            duration +
            (segment.end - segment.start) / segment.rate +
            segment.holdAfter,
          0,
        ),
      ).toBeLessThan(42);
      for (const chapter of plan.chapters) {
        expect(chapter.title.trim().length).toBeGreaterThan(0);
        expect(chapter.body.trim().length).toBeGreaterThan(0);
        expect(chapter.scenario.trim().length).toBeGreaterThan(0);
        expect(chapter.segments.length).toBeGreaterThan(0);
        for (const segment of chapter.segments) {
          expect(durations.has(segment.pieceId), segment.pieceId).toBe(true);
          expect(segment.start).toBeGreaterThanOrEqual(0);
          expect(segment.end).toBeGreaterThan(segment.start);
          expect(segment.end).toBeLessThanOrEqual(
            durations.get(segment.pieceId)!,
          );
          expect(segment.rate).toBeGreaterThan(0);
          expect(segment.rate).toBeLessThanOrEqual(1.2);
          expect(segment.holdAfter).toBeGreaterThanOrEqual(0);
          expect(
            fs.existsSync(path.join(process.cwd(), "public", segment.poster)),
            segment.poster,
          ).toBe(true);
        }
      }
    },
  );
});
