// TESTES DO QUADRO NARRATIVO
// Verify one automatic viewport, readable native captions and preservation of the authored action ranges.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductMotion } from "./ProductMotion";
import { PRODUCTS } from "@/lib/products";
import { getProductMotionPlan } from "@/lib/product-motion-plans";
import { productOverviewSlides, productStorySlides } from "@/lib/motion-slides";

describe("product narrative markup", () => {
  it.each(PRODUCTS)(
    "keeps $name chapters together in one automatic viewport without step controls",
    ({ slug }) => {
      const plan = getProductMotionPlan(slug);
      const html = renderToStaticMarkup(
        <ProductMotion id="product-story" slug={slug} mode="story" />,
      );
      expect(html.match(/data-motion-viewport=/g)).toHaveLength(2);
      expect(html).toContain(`data-mobile-product-motion="${slug}"`);
      expect(html).toMatch(/data-motion-viewport="true" aria-hidden="true"/);
      expect(html).toContain('data-presentation="single"');
      expect(html).toContain(`data-motion-plan="${plan.id}"`);
      for (const chapter of plan.chapters) {
        expect(html).toContain(chapter.body);
        expect(html).toContain(chapter.scenario);
        expect(html).toContain(`data-motion-chapter="${chapter.key}"`);
        expect(html).toContain(chapter.segments.at(-1)!.poster);
      }
      expect(html).not.toContain("hyperframes-player");
      expect(html).not.toContain("data-product=");
      expect(html).not.toMatch(/<button\b|data-select=|data-step=/);
      expect(html).toContain('data-navigation="false"');
      expect(html).toContain('data-rotate="true"');
    },
  );

  it.each(PRODUCTS)(
    "uses the same $name package's first chapter as its introductory overview",
    ({ slug }) => {
      const plan = getProductMotionPlan(slug);
      const overview = productOverviewSlides(slug);
      const story = productStorySlides(slug);
      expect(overview).toHaveLength(1);
      expect(overview[0]).toEqual(story[0]);
      expect(overview[0].poster).toBe(plan.chapters[0].segments.at(-1)!.poster);
      expect(overview[0].posterPhase).toBe("film");
      expect(overview[0].segments[0].id).not.toContain("intro");
      expect(overview[0].segments[0].range[0]).toBeGreaterThan(0);
      expect(
        story.flatMap((slide) => slide.segments).map((segment) => segment.id),
      ).toEqual(
        plan.chapters.flatMap((chapter) =>
          chapter.segments.map((segment) => segment.pieceId),
        ),
      );
      const html = renderToStaticMarkup(
        <ProductMotion id="product-opening" slug={slug} mode="overview" />,
      );
      expect(html.match(/data-motion-viewport=/g)).toHaveLength(2);
      expect(html).toContain('data-kind="overview"');
    },
  );
});
