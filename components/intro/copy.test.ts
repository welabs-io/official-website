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

  it("the check reads the drawn labels (the cards of the Relloo and the chips of the Tuner)", () => {
    const relloo = literals(
      readFileSync(path.join(DIR, "relloo.js"), "utf8"),
    ).join(" | ");
    const tuner = literals(
      readFileSync(path.join(DIR, "tuner.js"), "utf8"),
    ).join(" | ");
    expect(relloo).toContain("Contato 4821");
    expect(relloo).toContain("Mensagem");
    expect(tuner).toContain("Comunidade");
    // A name or a brand among the literals is found
    expect(personViolation(`${relloo} | Ana`, [])).toBe("Ana");
    expect(vendorIn(`${tuner} | whatsapp`)).toBe("whatsapp");
  });
});
