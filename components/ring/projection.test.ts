// TESTES DA PROJEÇÃO E DO CONTEÚDO INTEGRAL
// Verify the image-space crop, complete product-page hero and looping home preview independently of the visual skin.
import { describe, expect, it } from "vitest";
import pieces from "@/lib/motion-pieces.json";
import { heroSlides, previewSlides, productFilms } from "@/lib/motion-slides";
import { PRODUCTS } from "@/lib/products";
import { filmProjection, FILM_CROP, motionPhase, cropOf } from "./projection";

describe("film projection", () => {
  it("maps the useful rectangle uniformly and leaves headers and slogans outside the visible viewport", () => {
    const p = filmProjection();
    const width = 560;
    const height = 315;
    const visibleHeight = (height * p.viewportHeight) / 100;
    const frameWidth = (width * p.contentWidth) / 100;
    const frameHeight = (visibleHeight * p.contentHeight) / 100;
    const project = (x: number, y: number) => [
      (width * p.contentLeft) / 100 + (x / 1920) * frameWidth,
      (visibleHeight * p.contentTop) / 100 + (y / 1080) * frameHeight,
    ];
    expect(frameWidth / 1920).toBeCloseTo(frameHeight / 1080);
    expect(project(120, 180)[0]).toBeCloseTo(0);
    expect(project(120, 180)[1]).toBeCloseTo(0);
    expect(project(1800, 880)[0]).toBeCloseTo(width);
    expect(project(1800, 880)[1]).toBeCloseTo(visibleHeight);
    expect(project(960, 40)[1]).toBeLessThan(0);
    expect(project(960, 906)[1]).toBeGreaterThan(visibleHeight);
    expect(FILM_CROP.y + FILM_CROP.height).toBeLessThan(906);
  });
  it("preserves the measured Tuner borders and journey frame without exposing headers", () => {
    const channels = cropOf("channels-one-contract-ludic-logos-r5-s1");
    const journey = cropOf("welabs-chain-journey-define-logos-r6-s1");
    expect(channels.x).toBeLessThanOrEqual(110);
    expect(channels.x + channels.width).toBeGreaterThanOrEqual(1810);
    expect(journey.y).toBe(140);
    expect(journey.y + journey.height).toBeLessThan(906);
    expect(cropOf("crm-omnichannel-inbox-ludic2-logos-r4-s1").x).toBeLessThan(
      80,
    );
    const house = cropOf("hub-whole-house-ludic-logos-r4-s1");
    expect(house.x).toBeLessThan(64);
    expect(house.x + house.width).toBeGreaterThan(64 + 349);
    const knowledge = cropOf("kb-ask-with-proof-ludic-logos-r5-s1");
    expect(knowledge.x).toBeLessThan(100);
    expect(knowledge.y).toBeLessThanOrEqual(148);
  });
});

describe("complete product heroes", () => {
  it.each(PRODUCTS)(
    "keeps the complete $name identity and first film",
    ({ slug }) => {
      const [hero] = heroSlides(slug);
      const product = pieces.products[slug];
      expect(hero.segments[0].range).toEqual([0, product.intro.duration]);
      expect(motionPhase(hero.segments[0].id)).toBe("intro");
      expect(motionPhase(hero.segments[1].id)).toBe("film");
      expect(hero.segments[1].range[1]).toBe(product.films[0].duration);
      expect(hero.segments[1].range[0]).toBeLessThan(2);
    },
  );

  it.each(PRODUCTS)(
    "gives the $name films distinct functional labels",
    ({ slug }) => {
      const labels = productFilms(slug).map((slide) => slide.label);
      expect(new Set(labels).size).toBe(labels.length);
      expect(labels.every((label) => !/^Filme \d/.test(label))).toBe(true);
    },
  );
});

describe("home product previews", () => {
  it.each(PRODUCTS)(
    "shows a meaningful $name cut without any opening",
    ({ slug }) => {
      const [preview] = previewSlides(slug);
      expect(preview.segments).toHaveLength(1);
      expect(preview.segments[0].id).not.toMatch(/intro/);
      expect(preview.segments[0].range).toEqual(
        slug === "domus" ? [14.1, 20.8] : pieces.products[slug].films[0].clip,
      );
      expect(preview.poster).not.toContain("tail-");
      if (slug === "domus") expect(preview.poster).toContain("cut-5");
    },
  );
});
