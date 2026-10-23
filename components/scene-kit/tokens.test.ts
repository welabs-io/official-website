// TESTES DOS TOKENS DO KIT DE CENAS
// The operator's rule of 2026-10-22 (one standard, one place to change): every value of a kit sheet (components/
// scene-kit/**/*.css) is a token of app/lib.css (TOKENS DO SITE and the colour roles), so a change there reflects on
// every scene. A raw size, weight, line height, tracking, radius, shadow, space, line width, duration or geometry in a
// kit sheet fails here; raw colours fail in scene-colour.test.ts. The only way out is GEOMETRY_ALLOWED, an explicit list
// of geometry that is truly one scene's own, each entry with its reason.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const KIT = "components/scene-kit";
const read = (file: string) => readFileSync(path.join(ROOT, file), "utf8");
const kitSheets = () =>
  readdirSync(path.join(ROOT, KIT), { recursive: true, encoding: "utf8" })
    .map((f) => path.posix.join(KIT, f.split(path.sep).join("/")))
    .filter((f) => f.endsWith(".css"));
const stripCss = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

// Properties whose value must come from tokens: type, shape, shadow, space, lines, motion and geometry
const TOKEN_PROPS =
  /^(?:font-size|font-weight|line-height|letter-spacing|border-radius|box-shadow|padding(?:-[\w-]+)?|margin(?:-[\w-]+)?|gap|row-gap|column-gap|border(?:-(?:top|right|bottom|left|width))?|transition(?:-duration|-delay)?|animation(?:-duration|-delay)?|width|height|min-width|min-height|max-width|max-height|top|right|bottom|left|inset)$/;

// A declaration of a kit sheet allowed to keep a raw value, as `file|selector|property`, with its reason
const GEOMETRY_ALLOWED: Record<string, string> = {
  'components/scene-kit/lab.module.css|.main[data-theme="welabs"]|min-height':
    "the lab workbench fills the viewport (100vh), a page rule and not a size of a scene",
};

// The value with every var(...) taken out (nested ones included), so only what is written by hand is left
const withoutVars = (value: string) => {
  let v = value;
  for (let prev = ""; prev !== v; ) {
    prev = v;
    v = v.replace(/var\(\s*--[\w-]+(?:\s*,[^()]*)?\)/g, "");
  }
  return v;
};

// A raw unit (px, rem, em, s, ms, vw, vh) or, for weight, line height and tracking, any bare number
function isRaw(prop: string, value: string) {
  const left = withoutVars(value);
  if (/^(?:font-weight|line-height|letter-spacing)$/.test(prop)) return /\d/.test(left);
  // A full round written as a percentage is a shape, not a size (50%); 0 and 100% need no token
  return /(?<![\w-])\d*\.?\d+(?:px|rem|em|s|ms|vw|vh)\b/.test(left);
}

// The declarations of a sheet that write a raw value, as `selector { prop: value }`
function rawDeclarations(css: string) {
  const found: { selector: string; prop: string; value: string }[] = [];
  for (const block of stripCss(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = block[1].trim();
    for (const d of block[2].matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)) {
      const [prop, value] = [d[1], d[2].trim()];
      if (TOKEN_PROPS.test(prop) && isRaw(prop, value)) found.push({ selector, prop, value });
    }
  }
  return found;
}

describe("the detector", () => {
  it("flags a raw value and passes a token, a calc of tokens, 0 and percentages", () => {
    const css = `.a { font-size: 14px; padding: var(--sp-2) 0; border-radius: 50%; }
      .b { font-weight: 600; line-height: var(--line-label); gap: calc(var(--sp-2) * 2); }
      .c { box-shadow: inset 0 0 0 1px var(--border); width: 100%; transition: color var(--dur-2) var(--ease-out); }
      .d { transition: color 0.2s linear; margin-left: calc(var(--mark-xs) + 4px); top: calc((var(--a) - var(--b)) / -2); }`;
    expect(rawDeclarations(css).map((d) => `${d.selector} ${d.prop}`)).toEqual([
      ".a font-size",
      ".b font-weight",
      ".c box-shadow",
      ".d transition",
      ".d margin-left",
    ]);
  });
});

describe("every value of a kit sheet is a token of app/lib.css", () => {
  it("no raw size, weight, line height, radius, shadow, space, duration or geometry", () => {
    const raw = kitSheets().flatMap((f) =>
      rawDeclarations(read(f))
        .filter((d) => !(`${f}|${d.selector}|${d.prop}` in GEOMETRY_ALLOWED))
        .map((d) => `${f}: ${d.selector} { ${d.prop}: ${d.value} }`),
    );
    expect(raw).toEqual([]);
  });

  it("every allowed geometry still exists (delete it when it goes)", () => {
    for (const key of Object.keys(GEOMETRY_ALLOWED)) {
      const [file, selector, prop] = key.split("|");
      expect(
        rawDeclarations(read(file)).some((d) => d.selector === selector && d.prop === prop),
        key,
      ).toBe(true);
    }
  });

  it("the token families are defined in app/lib.css", () => {
    const lib = stripCss(read("app/lib.css"));
    for (const name of [
      "--sp-1",
      "--t-label",
      "--line-label",
      "--weight-title",
      "--ls-caps",
      "--r-card",
      "--rule",
      "--bar-active",
      "--edge-ring",
      "--shadow-raise",
      "--dur-2",
      "--ease-out",
      "--icon-md",
      "--mark-md",
      "--row-min",
    ])
      expect(lib, name).toMatch(new RegExp(`${name}:`));
  });
});
