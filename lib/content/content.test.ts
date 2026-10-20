// TESTES DO CONTEÚDO
// The v2 of the content (2026-10-20): each section has at most one short title and one line, every product page has
// the same fields, and no sentence carries a slogan, a banned word, a maturity marker or a promise the code of the
// product does not sustain (v13 analysis, section 1). The same word lists guard the rendered pages
// (components/template/site.test.tsx).
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import {
  CLOSING,
  DOMUS_MODULES,
  HOME_CONTACT,
  HOME_DOMUS,
  HOME_EFFECTS,
  HOME_INTRO,
  HOME_MESSAGE,
  HOME_PRODUCTS,
} from "./home";
import {
  DOMUS_PLAY,
  KNOWLY_PLAY,
  MAGNETO_PLAY,
  RELLOO_PLAY,
  TUNER_PLAY,
} from "./plays";
import { PAGE_HEADINGS, PRODUCT_PAGE } from "./products";
import { copyViolation, words } from "./rules";

const strings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") out.push((value as (s: string) => string)("Domus"));
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => strings(v, out));
  return out;
};

const ALL = strings([
  HOME_INTRO,
  HOME_MESSAGE,
  HOME_DOMUS,
  DOMUS_MODULES,
  HOME_PRODUCTS,
  HOME_EFFECTS,
  HOME_CONTACT,
  CLOSING,
  PRODUCT_PAGE,
  PAGE_HEADINGS,
  DOMUS_PLAY,
  RELLOO_PLAY,
  MAGNETO_PLAY,
  TUNER_PLAY,
  KNOWLY_PLAY,
  PRODUCTS.map((p) => p.line),
]);

describe("one short title and one line per section", () => {
  it("the opening: a title of at most 8 words with each turning word, and a line of at most 20", () => {
    for (const w of HOME_INTRO.words)
      expect(
        words(`${HOME_INTRO.before} ${w.text} ${HOME_INTRO.after}`),
      ).toBeLessThanOrEqual(8);
    expect(words(HOME_INTRO.lead)).toBeLessThanOrEqual(20);
    // One word per product, in the order of the products
    expect(HOME_INTRO.words.map((w) => w.product)).toEqual(
      PRODUCTS.map((p) => p.slug),
    );
  });
  it("every section title has at most 7 words and every line at most 12", () => {
    for (const title of [
      HOME_MESSAGE.title,
      HOME_DOMUS.title,
      HOME_PRODUCTS.title,
      HOME_EFFECTS.title,
      HOME_CONTACT.title,
      PAGE_HEADINGS.areas,
      PAGE_HEADINGS.details,
      ...PRODUCTS.map((p) => PRODUCT_PAGE[p.slug].play.title),
      ...PRODUCTS.map((p) => PRODUCT_PAGE[p.slug].center.title),
    ])
      expect(words(title), title).toBeLessThanOrEqual(7);
    for (const line of [
      HOME_MESSAGE.lead,
      HOME_DOMUS.lead,
      PAGE_HEADINGS.areasLead,
      ...PRODUCTS.map((p) => PRODUCT_PAGE[p.slug].play.lead),
    ])
      expect(words(line), line).toBeLessThanOrEqual(12);
  });
  it("the effects and the stamps are captions of at most 6 words", () => {
    for (const item of HOME_EFFECTS.items)
      expect(words(item.text)).toBeLessThanOrEqual(6);
    for (const stamp of Object.values(HOME_INTRO.stamps))
      expect(words(stamp)).toBeLessThanOrEqual(4);
    for (const s of HOME_MESSAGE.stations)
      expect(words(s.label)).toBeLessThanOrEqual(3);
  });
});

describe("every product page has the same fields", () => {
  it.each(PRODUCTS.map((p) => p.slug))("%s", (slug) => {
    const page = PRODUCT_PAGE[slug];
    expect(words(page.short)).toBeLessThanOrEqual(14);
    expect(page.details.length).toBeGreaterThanOrEqual(5);
    expect(page.details.length).toBeLessThanOrEqual(6);
    for (const d of page.details) expect(words(d)).toBeLessThanOrEqual(6);
    expect(page.asks).toHaveLength(3);
    for (const a of page.asks) expect(a.endsWith("?")).toBe(true);
    // The Domus opens with its areas; every other product with its native scenes
    if (slug === "domus") expect(page.scenes).toHaveLength(0);
    else expect(page.scenes.length).toBeGreaterThan(0);
  });
  it("the contact of the home asks open questions, with no answer", () => {
    expect(HOME_CONTACT.asks.length).toBeGreaterThanOrEqual(3);
    for (const a of HOME_CONTACT.asks) expect(a.endsWith("?")).toBe(true);
  });
});

describe("the Domus is the whole management of the company", () => {
  // v2.1: the modules are the ones the ERP code installs (modulos-domus.md of the round): the standard floor holds the
  // ERPNext and HRMS modules, the floor made to measure our own apps, and tax and PIX are only a tag
  it("its modules are the ERP's, standard and made to measure, with tax and PIX only as a tag", () => {
    const standard = DOMUS_MODULES.standard.map((r) => r.name);
    const custom = DOMUS_MODULES.custom.map((r) => r.name);
    for (const area of [
      "Vendas",
      "Compras",
      "Estoque",
      "Produção",
      "Financeiro",
      "Projetos",
      "Pessoas",
      "Ativos",
      "Qualidade",
    ])
      expect(standard).toContain(area);
    for (const app of ["Fiscal", "Bancos", "Jurídico", "Chamados", "Aprovações"])
      expect(custom).toContain(app);
    const all = [...DOMUS_MODULES.standard, ...DOMUS_MODULES.custom];
    expect(all.filter((r) => r.tag).map((r) => r.tag)).toEqual(["NFS-e", "PIX"]);
    expect(new Set(all.map((r) => r.name)).size).toBe(all.length);
  });
  it("its sentence is about the whole company and the room the company makes, not about money", () => {
    expect(PRODUCT_PAGE.domus.short).toMatch(/empresa inteira/);
    expect(PRODUCT_PAGE.domus.short).not.toMatch(/financeiro|fiscal|PIX|nota/i);
  });
});

describe("no slogan, banned word, maturity marker or promise without code", () => {
  it.each(ALL.map((s) => [s]))("%s", (sentence) => {
    expect(copyViolation(sentence)).toBeNull();
  });
  it("none of the promises the code does not sustain", () => {
    const all = ALL.join(" ");
    expect(all).not.toMatch(
      /funil|cupom|cashback|em frase|numa frase|volta num toque|baixa sozinho|Instagram/i,
    );
  });
});
