// TESTES DO TEXTO DAS ABERTURAS DE MARCA
// v3 (F1 review): the brand openings are chunks fetched on a click, so the tests of the rendered pages never read them,
// and the Relloo opening drew four people by name and the Tuner opening two brands as channel names. v4 (brief-v4):
// the opening is the brand's logo motion, which draws no text at all; every string literal of the player (comments
// out) still goes through the copy rules: no person's name, no internal stack, no banned word, no third-party brand.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { copyViolation, personViolation, stackViolation, vendorIn } from "@/lib/content/rules";

const DIR = __dirname;
const SOURCES = readdirSync(DIR).filter((f) => /\.(js|ts)$/.test(f) && !/\.(test|d)\.ts$/.test(f));

// The source without its comments (a `//` inside a string such as a URL stays), then each quoted literal
const literals = (src: string) => {
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
  return [...code.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map(
    (m) => m[1] ?? m[2] ?? m[3] ?? "",
  );
};
// The words a literal can draw: the text between the tags of an SVG or HTML fragment, or the literal itself
const words = (lit: string) => lit.replace(/<[^>]*>/g, " ");

describe("the text of the brand openings", () => {
  it("there is a player to read", () => {
    expect(SOURCES).toEqual(["intro-run.ts"]);
  });

  it.each(SOURCES)("%s names no person, no stack and no brand, and carries no banned word", (name) => {
    const text = literals(readFileSync(path.join(DIR, name), "utf8"))
      .map(words)
      .join(" | ");
    expect(personViolation(text, [])).toBeNull();
    expect(stackViolation(text, [])).toBeNull();
    expect(vendorIn(text)).toBeNull();
    expect(copyViolation(text)).toBeNull();
  });
});
