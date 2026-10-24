// TESTES DO CONTEÚDO
// The v2 of the content (2026-10-20): each section has at most one short title and one line, every product page has
// the same fields, and no sentence carries a slogan, a banned word, a maturity marker or a promise the code of the
// product does not sustain (v13 analysis, section 1). The same word lists guard the rendered pages
// (components/template/site.test.tsx). i18n: the text lives in the dictionaries; the Portuguese rules (copy-rules.json)
// and the budgets of words read pt-BR, the source of the copy; the list of forbidden words (forbidden.ts) is read on the
// three dictionaries; the structure that does not change with the language is checked on all of them.
import { describe, expect, it } from "vitest";
import { flatten } from "@/lib/i18n/flatten";
import { LOCALES } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { PRODUCTS } from "@/lib/products";
import {
  CHAIN_ORDER,
  COMPACT_MODULES,
  DIFFER_DETAILS,
  MODULE_IDS,
  chainStations,
  domusFrameModules,
  domusModules,
  introWords,
  pageHeadings,
  productPage,
} from "./index";
import { FORBIDDEN_WORDS, KNOWN_FORBIDDEN } from "./forbidden";
import { copyViolation, words } from "./rules";

const pt = getMessages("pt-BR");

// The strings of the sections the copy rules were written for (the page text, not the drawn product screens)
const pageStrings = () => {
  const { intro, domus, contact } = pt.home;
  // `category` and `keywords` are page metadata, never visible text (the category says "ERP" on purpose)
  const products = PRODUCTS.map(({ slug }) => {
    const { category, keywords, ...visible } = pt.products[slug];
    void category;
    void keywords;
    return visible;
  });
  return flatten([
    intro,
    domus,
    contact,
    pt.closing,
    pt.products.headings,
    products,
  ]).map(([, text]) => text);
};
const ALL = pageStrings();

describe("one short title and one line per section", () => {
  it("the opening: a title of at most 8 words with each turning word, and a line of at most 20", () => {
    for (const w of introWords(pt))
      expect(
        words(`${pt.home.intro.before} ${w.text} ${pt.home.intro.after}`),
      ).toBeLessThanOrEqual(8);
    expect(words(pt.home.intro.lead)).toBeLessThanOrEqual(20);
    // One word per product, in the order of the products
    expect(introWords(pt).map((w) => w.product)).toEqual(
      PRODUCTS.map((p) => p.slug),
    );
  });
  it("every section title has at most 7 words and every line at most 12", () => {
    const headings = pageHeadings(pt);
    for (const title of [
      pt.home.chain.title,
      pt.home.accordion.title,
      pt.home.contact.title,
      headings.areas,
      headings.details,
      ...PRODUCTS.map((p) => productPage(pt, p.slug).center.title),
    ])
      expect(words(title), title).toBeLessThanOrEqual(7);
    for (const line of [pt.home.chain.lead, headings.areasLead])
      expect(words(line), line).toBeLessThanOrEqual(12);
  });
  it("the stamps are captions of at most 4 words", () => {
    for (const stamp of Object.values(pt.home.intro.stamps))
      expect(words(stamp)).toBeLessThanOrEqual(4);
  });
});

describe("every product page has the same fields", () => {
  it.each(PRODUCTS.map((p) => p.slug))("%s", (slug) => {
    const page = productPage(pt, slug);
    expect(words(page.short)).toBeLessThanOrEqual(14);
    expect(page.details.length).toBeGreaterThanOrEqual(5);
    expect(page.details.length).toBeLessThanOrEqual(6);
    for (const d of page.details) expect(words(d)).toBeLessThanOrEqual(6);
    expect(page.asks).toHaveLength(3);
    for (const a of page.asks) expect(a.endsWith("?")).toBe(true);
    // v4 cards: three differences, short titles, one sentence each, every detail under exactly one card
    expect(page.differs).toHaveLength(3);
    for (const d of page.differs) {
      expect(words(d.title), d.title).toBeLessThanOrEqual(5);
      expect(words(d.body), d.body).toBeLessThanOrEqual(18);
      expect(d.details.length).toBeGreaterThan(0);
    }
    const placed = page.differs.flatMap((d) => d.details).sort((a, b) => a - b);
    expect(placed).toEqual(page.details.map((_, i) => i));
  });
  it("the contact of the home asks open questions, with no answer", () => {
    expect(pt.home.contact.asks.length).toBeGreaterThanOrEqual(3);
    for (const a of pt.home.contact.asks) expect(a.endsWith("?")).toBe(true);
  });
  it("the line of a product has at most four words", () => {
    for (const p of PRODUCTS)
      expect(words(pt.products[p.slug].line)).toBeLessThanOrEqual(4);
  });
});

describe("the Domus is the whole management of the company", () => {
  // v2.1: the modules are the ones the ERP code installs (modulos-domus.md of the round): the standard floor holds the
  // ERPNext and HRMS modules, the floor made to measure our own apps, and tax and PIX are only a tag
  it("its modules are the ERP's, standard and made to measure, with tax and PIX only as a tag", () => {
    const modules = domusModules(pt);
    const standard = modules.standard.map((r) => r.id);
    const custom = modules.custom.map((r) => r.id);
    for (const area of [
      "sales",
      "purchasing",
      "inventory",
      "production",
      "finance",
      "projects",
      "people",
      "assets",
      "quality",
    ] as const)
      expect(standard).toContain(area);
    for (const app of [
      "tax",
      "banks",
      "legal",
      "tickets",
      "approvals",
    ] as const)
      expect(custom).toContain(app);
    const all = [...modules.standard, ...modules.custom];
    expect(all.filter((r) => r.tag).map((r) => r.tag)).toEqual([
      "NFS-e",
      "PIX",
    ]);
    expect(new Set(all.map((r) => r.name)).size).toBe(all.length);
  });
  it("its sentence is about the whole company and the room the company makes, not about money", () => {
    const { short } = productPage(pt, "domus");
    expect(short).toMatch(/empresa inteira/);
    expect(short).not.toMatch(/financeiro|fiscal|PIX|nota/i);
  });
});

describe("no slogan, banned word, maturity marker or promise without code (pt-BR)", () => {
  it.each(ALL.map((s) => [s]))("%s", (sentence) => {
    expect(copyViolation(sentence)).toBeNull();
  });
});

// A word or phrase of the list, whole and without case (the edge is any non-letter, unicode)
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const forbidden = (text: string) =>
  FORBIDDEN_WORDS.filter((w) =>
    new RegExp(`(?:^|[^\\p{L}])${escape(w)}(?=[^\\p{L}]|$)`, "iu").test(text),
  );

describe("forbidden words, on the three dictionaries", () => {
  const found = (locale: (typeof LOCALES)[number]) =>
    flatten(getMessages(locale)).flatMap(([path, text]) =>
      forbidden(text).map((word) => ({ word, path })),
    );
  const known = (hit: { word: string; path: string }) =>
    KNOWN_FORBIDDEN.some((k) => k.word === hit.word && k.path === hit.path);

  it.each(LOCALES)("%s has none besides the known failures", (locale) => {
    expect(found(locale).filter((hit) => !known(hit))).toEqual([]);
  });
  it("every known failure is still on some dictionary (delete it from forbidden.ts when the copy phase fixes it)", () => {
    const hits = LOCALES.flatMap(found);
    for (const k of KNOWN_FORBIDDEN)
      expect(
        hits.some((h) => h.word === k.word && h.path === k.path),
        `${k.word} @ ${k.path}`,
      ).toBe(true);
  });
});

// Structure the components match by id, never by the visible words (a translated name would stop matching in silence)
describe("what the components match is an id, not a word of the page", () => {
  const ids = [...MODULE_IDS.standard, ...MODULE_IDS.custom];
  it.each(LOCALES)(
    "%s: every module id has a name, and the names are the ids' only key",
    (locale) => {
      const { modules } = getMessages(locale).home.domus;
      expect(Object.keys(modules).sort()).toEqual([...ids].sort());
    },
  );
  it("the modules of the frame and the compact ones are ids of the house or the newest module", () => {
    const frame = domusFrameModules(pt).map((m) => m.id);
    for (const id of frame)
      expect(id === "inspection" || (ids as string[]).includes(id), id).toBe(
        true,
      );
    for (const id of COMPACT_MODULES) expect(frame, id).toContain(id);
  });
  it("the names do not decide which module a list names: the same ids come out in any language", () => {
    for (const locale of LOCALES)
      expect(domusFrameModules(getMessages(locale)).map((m) => m.id)).toEqual(
        domusFrameModules(pt).map((m) => m.id),
      );
  });
  it("the stations of the chain are products, in the order of the walk, for every language", () => {
    for (const locale of LOCALES)
      expect(chainStations(getMessages(locale)).map((s) => s.product)).toEqual([
        ...CHAIN_ORDER,
      ]);
  });
  it("each difference of a product names details that exist", () => {
    for (const { slug } of PRODUCTS) {
      const n = pt.products[slug].details.length;
      for (const group of DIFFER_DETAILS[slug])
        for (const i of group) expect(i).toBeLessThan(n);
    }
  });
});
