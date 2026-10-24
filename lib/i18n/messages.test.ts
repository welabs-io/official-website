// TESTES DOS DICIONÁRIOS
// The three dictionaries are one shape: `tsc` already fails a missing or extra key (en and es are annotated with the type
// of pt-BR); this file holds the rest that a type cannot say: the same paths with the same arrays, the same placeholders
// in every sentence, no empty text, and the address rules of the locales. It also reports how much of en and es is still
// the Portuguese copy (the pending translation), without failing on it.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localizePath,
  splitLocale,
  stripLocale,
  switchLocale,
} from "./config";
import { flatten, placeholders } from "./flatten";
import { fmt } from "./format";
import { getMessages } from "./messages";

const entries = (locale: (typeof LOCALES)[number]) =>
  flatten(getMessages(locale));
const pt = entries("pt-BR");
const OTHERS = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

describe("the dictionaries have the same keys", () => {
  it("there is a dictionary per locale, and pt-BR is not empty", () => {
    expect([...LOCALES]).toEqual(["pt-BR", "en", "es"]);
    expect(pt.length).toBeGreaterThan(400);
  });
  it.each(OTHERS)("%s has exactly the paths of pt-BR", (locale) => {
    expect(entries(locale).map(([p]) => p)).toEqual(pt.map(([p]) => p));
  });
  it.each(LOCALES)("%s has no empty text", (locale) => {
    for (const [p, text] of entries(locale))
      expect(text.trim(), `${locale}: ${p}`).not.toBe("");
  });
  it.each(OTHERS)("%s keeps the placeholders of every sentence", (locale) => {
    const mine = new Map(entries(locale));
    for (const [p, text] of pt)
      expect(placeholders(mine.get(p) ?? ""), `${locale}: ${p}`).toEqual(
        placeholders(text),
      );
  });
  it("every product has its words in every language", () => {
    for (const locale of LOCALES)
      for (const { slug } of PRODUCTS) {
        const copy = getMessages(locale).products[slug];
        expect(copy.line, `${locale} ${slug}`).toBeTruthy();
        expect(copy.keywords.length).toBeGreaterThan(0);
      }
  });
});

// The translation that is still to be written: the strings of en and es equal to the Portuguese ones. Informational (the
// count falls as the copy phase fills the files); never fails.
describe("pending translation", () => {
  it.each(OTHERS)("%s: strings still equal to pt-BR", (locale) => {
    const mine = new Map(entries(locale));
    const same = pt.filter(([p, text]) => mine.get(p) === text);
    console.info(
      `[i18n] ${locale}: ${same.length} of ${pt.length} strings are still the pt-BR copy`,
    );
    expect(same.length).toBeLessThanOrEqual(pt.length);
  });
});

describe("addresses by locale", () => {
  it("pt-BR has no prefix, en and es do, and the slug is never translated", () => {
    expect(localizePath("pt-BR", "/")).toBe("/");
    expect(localizePath("pt-BR", "/products/relloo")).toBe("/products/relloo");
    expect(localizePath("en", "/")).toBe("/en");
    expect(localizePath("en", "/products/relloo")).toBe("/en/products/relloo");
    expect(localizePath("es", "/#contact")).toBe("/es#contact");
    expect(localizePath("pt-BR", "/#contact")).toBe("/#contact");
  });
  it("splits a pathname into its locale and the page", () => {
    expect(splitLocale("/")).toEqual({ locale: "pt-BR", path: "/" });
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/es/products/tuner")).toEqual({
      locale: "es",
      path: "/products/tuner",
    });
    expect(splitLocale("/products/tuner")).toEqual({
      locale: "pt-BR",
      path: "/products/tuner",
    });
    // A product or a word that starts like a locale is not a locale
    expect(stripLocale("/english")).toBe("/english");
    expect(stripLocale("/estoque")).toBe("/estoque");
  });
  it("switching language keeps the page, the search and the hash", () => {
    const at = {
      pathname: "/en/products/knowly",
      search: "?a=1",
      hash: "#details",
    };
    expect(switchLocale("pt-BR", at)).toBe("/products/knowly?a=1#details");
    expect(switchLocale("es", at)).toBe("/es/products/knowly?a=1#details");
    expect(switchLocale("en", { pathname: "/" })).toBe("/en");
    expect(switchLocale("pt-BR", { pathname: "/es" })).toBe("/");
  });
});

describe("fmt", () => {
  it("fills the placeholders and leaves a missing one visible", () => {
    expect(fmt("Abrir {name}", { name: "Domus" })).toBe("Abrir Domus");
    expect(fmt("{a} e {b}", { a: 1 })).toBe("1 e {b}");
  });
});

// TEXTO NO CÓDIGO
// A visible sentence of the dictionary that is also written as a literal in a component is a copy that will not follow
// the language (and a literal compared with text breaks silently when the text is translated). The literals of the
// components may not repeat a string of the pt-BR dictionary; the product names (brands) and the codes are not text.
describe("no visible text left in the code of the pages", () => {
  const ROOT = path.resolve(__dirname, "../..");
  const files = (dir: string) =>
    readdirSync(path.join(ROOT, dir), { recursive: true, encoding: "utf8" })
      .map((f) => path.posix.join(dir, f.split(path.sep).join("/")))
      // The lab and the legacy native scenes are outside the i18n (Portuguese by decision)
      .filter(
        (f) =>
          /\.tsx?$/.test(f) &&
          !/\.test\.tsx?$/.test(f) &&
          !f.startsWith("app/lab/") &&
          !f.startsWith("components/scenes/") &&
          !f.includes("scene-kit/scenes/home-message") &&
          !f.includes("scene-kit/LabStage"),
      );
  const BRANDS = new Set<string>(PRODUCTS.map((p) => p.name));
  const literals = (src: string) =>
    [
      ...src
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1")
        .matchAll(/"((?:[^"\\\n]|\\.)+)"|'((?:[^'\\\n]|\\.)+)'/g),
    ].map((m) => m[1] ?? m[2]);
  // Sentences of the dictionary with a letter and a space or a capital: what a visitor reads, not a key or a unit
  const TEXT = new Set(
    pt
      .map(([, text]) => text)
      .filter(
        (t) =>
          /\p{L}{3}/u.test(t) && !BRANDS.has(t) && !/^[A-Z][A-Za-z]*$/.test(t),
      ),
  );
  it("no component writes a sentence of the dictionary as a literal", () => {
    const hits = ["app", "components", "lib/content"].flatMap((dir) =>
      files(dir).flatMap((f) =>
        literals(readFileSync(path.join(ROOT, f), "utf8"))
          .filter((l) => TEXT.has(l))
          .map((l) => `${f}: ${l}`),
      ),
    );
    expect(hits).toEqual([]);
  });
});
