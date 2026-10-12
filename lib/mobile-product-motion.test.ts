// CONTRATO DAS DEMONSTRAÇÕES NO CELULAR
// Every compact scene must retain its desktop scenario and expose a readable, independent native clock.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "./products";
import { getProductMotionPlan } from "./product-motion-plans";
import {
  getMobileProductMotion,
  mobileProductPoster,
  mobileProductSource,
} from "./mobile-product-motion";

describe("native portrait product demonstrations", () => {
  it.each(PRODUCTS)(
    "keeps $slug scenarios ordered without an identity pre-roll",
    ({ slug }) => {
      const source = getMobileProductMotion(slug);
      const plan = getProductMotionPlan(slug);
      expect(source.chapters.map((chapter) => chapter.key)).toEqual(
        plan.chapters.map((chapter) => chapter.key),
      );
      expect(source.chapters[0].start).toBe(0);
      expect(source.duration).toBeLessThanOrEqual(32);
      const html = fs.readFileSync(
        path.join(process.cwd(), "public", mobileProductSource(source.id)),
        "utf8",
      );
      expect(html).toContain('data-width="1080"');
      expect(html).toContain('data-height="1350"');
      for (const [index, chapter] of source.chapters.entries()) {
        expect(chapter.start).toBeGreaterThanOrEqual(
          index ? source.chapters[index - 1].end : 0,
        );
        expect(chapter.end).toBeGreaterThan(chapter.start);
        expect(chapter.end).toBeLessThanOrEqual(source.duration);
        expect(chapter.posterTime).toBeGreaterThan(chapter.start);
        expect(chapter.posterTime).toBeLessThan(chapter.end);
        expect(
          fs.existsSync(
            path.join(
              process.cwd(),
              "public",
              mobileProductPoster(source.id, chapter.key),
            ),
          ),
        ).toBe(true);
      }
    },
  );
});
