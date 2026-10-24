// TESTES DO TEXTO DAS ABERTURAS DE MARCA
// v3 (F1 review): the brand openings are chunks fetched on a click, so the tests of the rendered pages never read them,
// and the Relloo opening drew four people by name and the Tuner opening two brands as channel names. Every string
// literal of every opening source (comments out) goes through the copy rules here: no person's name, no internal stack,
// no slogan or banned word, and no third-party brand at all (a drawn label has no brackets to hold an example).
// v4 (2026-10-24): the choreographies are back after v4 swapped them for the brand's logo motion, so the labels they
// draw are read again (the player alone, intro-run.ts, drew no text).
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { flatten } from "@/lib/i18n/flatten";
import { getMessages } from "@/lib/i18n/messages";
import {
  copyViolation,
  personViolation,
  stackViolation,
  vendorIn,
} from "@/lib/content/rules";

const DIR = __dirname;
const SOURCES = readdirSync(DIR).filter(
  (f) => /\.(js|ts)$/.test(f) && !/\.(test|d)\.ts$/.test(f),
);

// The source without its comments (a `//` inside a string such as a URL stays), then each quoted literal
const literals = (src: string) => {
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
  return [
    ...code.matchAll(
      /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g,
    ),
  ].map((m) => m[1] ?? m[2] ?? m[3] ?? "");
};
// The words a literal can draw: the text between the tags of an SVG or HTML fragment, or the literal itself
const words = (lit: string) => lit.replace(/<[^>]*>/g, " ");

describe("the text of the brand openings", () => {
  it("there are opening sources to read", () => {
    expect(SOURCES).toEqual(
      expect.arrayContaining([
        "relloo.js",
        "tuner.js",
        "domus.js",
        "knowly.js",
      ]),
    );
  });

  it.each(SOURCES)(
    "%s names no person, no stack and no brand, and carries no banned word",
    (file) => {
      const text = literals(readFileSync(path.join(DIR, file), "utf8"))
        .map(words)
        .join(" | ");
      expect(personViolation(text, [])).toBeNull();
      expect(stackViolation(text, [])).toBeNull();
      expect(vendorIn(text)).toBeNull();
      expect(copyViolation(text)).toBeNull();
    },
  );

  // i18n: the words an opening draws live in the dictionary (`openings`, cfg.labels), so the sources above carry none;
  // the same rules read the labels of every locale
  it.each(LOCALES)(
    "%s: the labels the openings draw name no person, no stack and no brand",
    (locale) => {
      const text = flatten(getMessages(locale).openings)
        .map(([, label]) => label)
        .join(" | ");
      expect(text).toContain(locale === "en" ? "Contact 4821" : "4821");
      expect(personViolation(text, [])).toBeNull();
      expect(stackViolation(text, [])).toBeNull();
      expect(vendorIn(text)).toBeNull();
      if (locale === "pt-BR") expect(copyViolation(text)).toBeNull();
      // A name or a brand among the labels is found
      expect(personViolation(`${text} | Ana`, [])).toBe("Ana");
      expect(vendorIn(`${text} | whatsapp`)).toBe("whatsapp");
    },
  );

  it("the openings carry no label of the dictionary as a literal", () => {
    const labels = new Set(
      LOCALES.flatMap((locale) =>
        flatten(getMessages(locale).openings).map(([, label]) => label),
      ),
    );
    for (const file of SOURCES) {
      const hits = literals(readFileSync(path.join(DIR, file), "utf8")).filter(
        (lit) => labels.has(lit),
      );
      expect(hits, file).toEqual([]);
    }
  });
});
