// TESTES DO CONTEÚDO
// Every product has the required fields, every field respects its word limit and no sentence carries a slogan, a
// banned word or a maturity marker. The same word lists guard the rendered pages (components/template/site.test.tsx).
import { describe, expect, it } from "vitest";
import { MANIFEST } from "@/lib/manifest";
import { ties } from "@/lib/manifest/select";
import { PRODUCTS } from "@/lib/products";
import {
  CLOSING,
  HOME_INTRO,
  HUB_NOTE,
  PAGE_HEADINGS,
  TIE_LINES,
  tieKey,
} from "./home";
import { PRODUCT_CONTENT } from "./products";

export const words = (text: string) => text.trim().split(/\s+/).length;

// Slogan verbs and brand-concept phrases (operator rule), plus banned words and maturity markers
export const COPY_RULES =
  /\b(domina|atende|automatiza|entrega|sabe|define|explica|conecta|transforma|ecossistema|cliente|clientes|erp|ficha|recibo|protocolo|tenant|fila|webhook|payload|beta|alpha|mvp|v2|roadmap|em breve|breve)\b|a empresa inteira numa casa|ele automatiza|todo canal, uma conversa só|não é só memória|os outros dão vida|ideias que viram|um só fluxo/i;

const sentences = (): string[] => {
  const all: string[] = [
    HOME_INTRO.title,
    HOME_INTRO.lead,
    HUB_NOTE,
    CLOSING.clients,
    CLOSING.platforms,
    ...Object.values(PAGE_HEADINGS),
    ...Object.values(TIE_LINES),
  ];
  for (const content of Object.values(PRODUCT_CONTENT)) {
    for (const r of content.resolves) all.push(r.problem, r.does);
    for (const c of content.capabilities) all.push(c.text);
    all.push(...content.filmCaptions);
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
    "%s has one live caption per tile of its film ring, at most 14 words",
    (slug) => {
      const support = MANIFEST.products[slug].films.filter(
        (f) => f.role === "support",
      ).length;
      const captions = PRODUCT_CONTENT[slug].filmCaptions;
      expect(captions).toHaveLength(1 + support);
      for (const caption of captions)
        expect(words(caption)).toBeLessThanOrEqual(14);
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
  it("there is a line of at most 14 words for every connection of the manifest", () => {
    for (const tie of ties(MANIFEST)) {
      const line = TIE_LINES[tieKey(tie.a, tie.b)];
      expect(line, `${tie.a}-${tie.b}`).toBeTruthy();
      expect(words(line)).toBeLessThanOrEqual(14);
    }
  });
});

describe("no slogan, banned word or maturity marker in any sentence", () => {
  it.each(sentences().map((s) => [s]))("%s", (sentence) => {
    expect(sentence).not.toMatch(COPY_RULES);
  });
});
