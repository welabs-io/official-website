// TESTES DO CONTEÚDO
// Every product has the required fields, every field respects its word limit and no sentence carries a slogan, a
// banned word or a maturity marker. The same word lists guard the rendered pages (components/template/site.test.tsx).
import { describe, expect, it } from "vitest";
import { CHAIN_STEPS, ties } from "@/lib/chain";
import { PRODUCTS } from "@/lib/products";
import { capabilityOf, capabilityScenes } from "@/lib/scenes/capabilities";
import {
  CLOSING,
  HOME_INTRO,
  HUB_NOTE,
  PAGE_HEADINGS,
  TIE_LINES,
  tieKey,
} from "./home";
import { PRODUCT_DEPTH } from "./product-depth";
import { PRODUCT_CONTENT } from "./products";
import { copyViolation, words } from "./rules";
import {
  AUDIENCE,
  BENEFITS,
  HOME_FAQ,
  HOME_SECTIONS,
  INTEGRATIONS,
  JOURNEY,
} from "./sections";

const sentences = (): string[] => {
  const all: string[] = [
    HOME_INTRO.title,
    HOME_INTRO.lead,
    HUB_NOTE,
    CLOSING.clients,
    CLOSING.platforms,
    ...Object.values(PAGE_HEADINGS),
    ...Object.values(TIE_LINES),
    ...Object.values(HOME_SECTIONS).flatMap((s) => Object.values(s)),
    ...JOURNEY.map((s) => s.text),
    ...BENEFITS.flatMap((b) => [b.title, b.text]),
    ...AUDIENCE.flatMap((a) => [a.title, a.text]),
    ...INTEGRATIONS.flatMap((g) => [
      g.title,
      g.text,
      ...g.chips.map((c) => c.text),
    ]),
    ...HOME_FAQ.flatMap((f) => [f.q, f.a]),
  ];
  for (const depth of Object.values(PRODUCT_DEPTH)) {
    for (const g of depth.groups)
      all.push(g.title, ...g.items.map((i) => i.detail));
    for (const a of depth.audience) all.push(a.title, a.text);
    for (const f of depth.faq) all.push(f.q, f.a);
  }
  for (const content of Object.values(PRODUCT_CONTENT)) {
    for (const r of content.resolves) all.push(r.problem, r.does);
    for (const c of content.capabilities) all.push(c.text);
  }
  for (const p of PRODUCTS) all.push(p.line);
  return all;
};

describe("every product has the required content", () => {
  it.each(PRODUCTS.map((p) => p.slug))("%s", (slug) => {
    const c = PRODUCT_CONTENT[slug];
    expect(c.resolves).toHaveLength(3);
    expect(c.capabilities).toHaveLength(6);
    for (const r of c.resolves) {
      expect(r.problem.length).toBeGreaterThan(0);
      expect(r.does.length).toBeGreaterThan(0);
    }
    for (const cap of c.capabilities) {
      expect(cap.icon).toBeTruthy();
      expect(words(cap.text)).toBeGreaterThanOrEqual(2);
      expect(words(cap.text)).toBeLessThanOrEqual(5);
    }
  });

  it("the home card capabilities are the first three, with distinct icons", () => {
    for (const p of PRODUCTS) {
      const icons = PRODUCT_CONTENT[p.slug].capabilities.map((c) => c.icon);
      expect(new Set(icons).size).toBe(6);
    }
  });

  it.each(PRODUCTS.map((p) => p.slug))(
    "%s has one caption per scene of its opening (the sentence of the capability), at most 20 words",
    (slug) => {
      const captions = capabilityScenes(slug).map(
        (scene) => capabilityOf(scene).detail,
      );
      expect(captions).toHaveLength(3);
      for (const caption of captions)
        expect(words(caption)).toBeLessThanOrEqual(20);
    },
  );
});

describe("the common sentences respect their limits", () => {
  it("the opening title has at most 8 words and the lead at most 20", () => {
    expect(words(HOME_INTRO.title)).toBeLessThanOrEqual(8);
    expect(words(HOME_INTRO.lead)).toBeLessThanOrEqual(20);
  });
  it("the connector sentence has at most 12 words", () => {
    expect(words(HUB_NOTE)).toBeLessThanOrEqual(12);
  });
  it("there is a line of at most 14 words for every connection of the chain", () => {
    for (const tie of ties()) {
      const line = TIE_LINES[tieKey(tie.a, tie.b)];
      expect(line, `${tie.a}-${tie.b}`).toBeTruthy();
      expect(words(line)).toBeLessThanOrEqual(14);
    }
  });
});

describe("the reading sections of the home", () => {
  it("the order from start to end has the seven steps of the chain, one sentence of at most 22 words each", () => {
    expect(JOURNEY).toHaveLength(CHAIN_STEPS.length);
    for (const step of JOURNEY) {
      expect(step.products.length).toBeGreaterThan(0);
      expect(words(step.text)).toBeLessThanOrEqual(22);
    }
  });
  it("there are six benefits, each on a distinct scene, and four profiles", () => {
    expect(BENEFITS).toHaveLength(6);
    expect(new Set(BENEFITS.map((b) => b.scene)).size).toBe(6);
    expect(AUDIENCE).toHaveLength(4);
    for (const a of AUDIENCE) expect(words(a.text)).toBeLessThanOrEqual(24);
  });
  it("the integrations are the four groups asked for, in order", () => {
    expect(INTEGRATIONS.map((g) => g.id)).toEqual([
      "channels",
      "data",
      "cloud",
      "ai",
    ]);
  });
  it("there are six to eight questions, each answer at most 40 words", () => {
    expect(HOME_FAQ.length).toBeGreaterThanOrEqual(6);
    expect(HOME_FAQ.length).toBeLessThanOrEqual(8);
    for (const f of HOME_FAQ) expect(words(f.a)).toBeLessThanOrEqual(40);
  });
});

describe("the depth of every product page", () => {
  it.each(PRODUCTS.map((p) => p.slug))(
    "%s places each of its six capabilities in exactly one group, with one sentence of at most 20 words",
    (slug) => {
      const used = PRODUCT_DEPTH[slug].groups.flatMap((g) =>
        g.items.map((i) => i.cap),
      );
      expect([...used].sort()).toEqual([0, 1, 2, 3, 4, 5]);
      for (const g of PRODUCT_DEPTH[slug].groups)
        for (const item of g.items)
          expect(words(item.detail)).toBeLessThanOrEqual(20);
    },
  );
  it.each(PRODUCTS.map((p) => p.slug))(
    "%s has three profiles and three or four questions",
    (slug) => {
      expect(PRODUCT_DEPTH[slug].audience).toHaveLength(3);
      expect(PRODUCT_DEPTH[slug].faq.length).toBeGreaterThanOrEqual(3);
      expect(PRODUCT_DEPTH[slug].faq.length).toBeLessThanOrEqual(4);
      for (const f of PRODUCT_DEPTH[slug].faq)
        expect(words(f.a)).toBeLessThanOrEqual(30);
    },
  );
});

describe("no slogan, banned word or maturity marker in any sentence", () => {
  it.each(sentences().map((s) => [s]))("%s", (sentence) => {
    expect(copyViolation(sentence)).toBeNull();
  });
});
