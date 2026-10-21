// TESTES DA LAPIDAÇÃO VISUAL
// The visual system is enforced by tests, not by memory: the component sheets of the page read the tokens of `.page`
// (type scale, 4 px space grid, shapes) and carry no loose value, every line icon has the same stroke, and the type
// scale never goes under 14 px.
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ICON_STROKE } from "@/lib/icon-stroke";
import { PRODUCTS } from "@/lib/products";
import { HOME_CONFIG, productConfig } from "@/lib/site-config";
import { Sections } from "./SiteTemplate";

const ROOT = path.resolve(__dirname, "../..");
const read = (file: string) => readFileSync(path.join(ROOT, file), "utf8");
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

// Sheets that carry the page's own rhythm: spaces and type come from tokens
// v2.1: the stage, the message, the house and the play of the Tuner have sheets of their own, under the same rule
const SHEETS = [
  "components/template/v2.module.css",
  "components/template/hub.module.css",
  "components/template/message.module.css",
  "components/template/house.module.css",
  // v2.2: the plays moved to components/plays, one sheet for their anatomy and one per product
  "components/plays/plays.module.css",
  "components/plays/domus.module.css",
  "components/plays/relloo.module.css",
  "components/plays/magneto.module.css",
  "components/plays/tuner.module.css",
  "components/plays/knowly.module.css",
  "components/onepage/home.module.css",
  "components/onepage/shell.module.css",
];
const SPACE_PROPS =
  /^(padding|padding-(top|right|bottom|left)|margin|margin-(top|right|bottom|left)|gap|row-gap|column-gap|--pt|--pb|--closing-gap)$/;

// Declarations (property, value) with the selector they sit in, from a stripped sheet
function declarations(css: string) {
  const out: { selector: string; prop: string; value: string }[] = [];
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  for (let m = rule.exec(css); m; m = rule.exec(css))
    for (const decl of m[2].split(";")) {
      const at = decl.indexOf(":");
      if (at < 0) continue;
      out.push({
        selector: m[1].trim().replace(/\s+/g, " "),
        prop: decl.slice(0, at).trim(),
        value: decl.slice(at + 1).trim(),
      });
    }
  return out;
}

// Raw lengths that stay out of the 4 px grid by design: hairlines, the overlap of the timeline cards, the optical padding
// of a link and the fixed height of a mark. Everything else must be a token.
const SPACE_ALLOWED = new Set([".step + .step|margin-top|-44px"]);

describe("space and type tokens", () => {
  it.each(SHEETS)("%s has no loose space value", (file) => {
    const loose = declarations(strip(read(file)))
      .filter(({ prop }) => SPACE_PROPS.test(prop))
      .filter(({ selector, prop, value }) => {
        if (SPACE_ALLOWED.has(`${selector}|${prop}|${value}`)) return false;
        // Negative margins centre a drawing on the axis (half of its width): geometry, not rhythm
        if (
          /^margin(-|$)/.test(prop) &&
          /(^|[ (])-?\d+px\b|\/ -2\)/.test(value) &&
          /(^-|\/ -2\))/.test(value)
        )
          return false;
        // A raw length is a number of px other than 0 (a clamp or calc made only of tokens has none outside var())
        const bare = value.replace(/var\([^)]*\)/g, "");
        return /(^|[^\w.-])-?\d+(\.\d+)?px/.test(bare);
      })
      .map(({ selector, prop, value }) => `${selector} { ${prop}: ${value} }`);
    expect(loose).toEqual([]);
  });

  it.each(SHEETS)("%s sets font sizes only from the type scale", (file) => {
    const loose = declarations(strip(read(file)))
      .filter(({ prop }) => prop === "font-size")
      .filter(({ value }) => !/^var\(--text-[\w-]+\)$/.test(value))
      .map(({ selector, value }) => `${selector} { font-size: ${value} }`);
    expect(loose).toEqual([]);
  });

  it("the type scale starts at 14 px and the display step is above the title step", () => {
    const css = strip(read("components/onepage/shell.module.css"));
    const px = (name: string) =>
      Number(css.match(new RegExp(`${name}:\\s*(\\d+)px`))?.[1]);
    expect(px("--text-xs")).toBe(14);
    for (const name of ["--text-sm", "--text-md", "--text-lg", "--text-xl"])
      expect(px(name)).toBeGreaterThanOrEqual(14);
    const clampMax = (name: string) =>
      Number(
        css.match(new RegExp(`${name}:\\s*clamp\\([^)]*?(\\d+)px\\)`))?.[1],
      );
    expect(clampMax("--text-display")).toBeGreaterThan(
      clampMax("--text-title"),
    );
    expect(clampMax("--text-title")).toBeGreaterThan(clampMax("--text-2xl"));
  });

  it("the 4 px space grid, the three shapes and the measure are defined once", () => {
    const css = strip(read("components/onepage/shell.module.css"));
    for (const [name, px] of [
      ["--sp-1", 4],
      ["--sp-2", 8],
      ["--sp-3", 12],
      ["--sp-4", 16],
      ["--sp-5", 24],
      ["--sp-6", 32],
      ["--sp-7", 48],
      ["--sp-8", 64],
      ["--sp-9", 80],
      // v2.1: the shapes of the ERP front (field 10, surface 8, overlay 14, control 22)
      ["--r-ctl", 10],
      ["--r-card", 8],
      ["--r-win", 14],
      ["--r-pill", 22],
    ] as const)
      expect(css, name).toContain(`${name}: ${px}px;`);
    expect(css).toMatch(/--measure:\s*66ch;/);
  });

  it("cards and chips use the shape tokens, and only the shapes of the scale", () => {
    // Drawings that are not cards keep their own shape: the round end of a 4 to 8 px bar (2px), the squircle of the Domus
    // symbol (26% and 22%), the body of a phone (28px) and the bottom of the house (only its lower corners round)
    // v2.1: plus the tab of a selected entry (only its upper corners round) and `inherit` (a lit ring over its card)
    const DRAWINGS = [
      "2px",
      "26%",
      "22%",
      "28px",
      "0 0 var(--r-win) var(--r-win)",
      "var(--r-win) var(--r-win) var(--r-win) var(--r-ctl)",
      "var(--r-ctl) var(--r-ctl) 0 0",
      "inherit",
      // Pilot of the lib: the ring of the Domus logo around its modules, and its amber square, which has no corner
      "var(--r-domus)",
      "0",
    ];
    const radii = SHEETS.filter((s) => s.startsWith("components/template"))
      .flatMap((s) => declarations(strip(read(s))))
      .filter(({ prop }) => prop === "border-radius")
      .map(({ value }) => value);
    expect(radii.length).toBeGreaterThan(20);
    for (const value of radii)
      expect([
        "var(--r-card)",
        "var(--r-ctl)",
        "var(--r-win)",
        "var(--r-pill)",
        "50%",
        ...DRAWINGS,
      ]).toContain(value);
  });
});

// v2.2 (audit M11): the motion and the round shapes are one scale on the whole page, the scenes included. Measured on
// 8187680: five easing curves besides --ease-out (ease, ease-out, two springs and an easeInOutQuad) and 999px written
// loose in the scenes. The scenes keep their interface text of 11 to 13 px as a documented exception (a drawing of a
// product screen, at the size of that screen; e2e/product-scenes.spec.ts holds its legibility rule).
const MOTION_SHEETS = [
  ...SHEETS,
  "components/scenes/fx.css",
  "components/scenes/scenes.module.css",
  "components/scenes/capability.module.css",
  "components/scenes/ludic.module.css",
  "components/scenes/scene-stage.module.css",
  "components/scenes/mini-scene.module.css",
  "components/intro/intro.module.css",
  "components/onepage/descent.module.css",
];

describe("one motion scale and one round shape", () => {
  it.each(MOTION_SHEETS)(
    "%s eases every transition and animation with a motion token (or linear)",
    (file) => {
      const css = strip(read(file));
      // A curve is written only where a motion token is defined
      expect(
        css.replace(/--ease[\w-]*:\s*cubic-bezier\([^)]*\)/g, ""),
      ).not.toMatch(/cubic-bezier\(/);
      const loose = declarations(css)
        .filter(({ prop }) => /^(transition|animation)$/.test(prop))
        .filter(({ value }) => !/^none\b/.test(value))
        .flatMap(({ selector, value }) =>
          value
            .split(/,(?![^(]*\))/)
            .filter((part) => !/var\(--ease|linear|steps\(/.test(part))
            .map((part) => `${selector} { ${part.trim()} }`),
        );
      expect(loose).toEqual([]);
    },
  );

  it.each(MOTION_SHEETS)("%s writes a full round as --r-dot", (file) => {
    expect(strip(read(file))).not.toMatch(/border-radius:\s*999px/);
  });

  it("the motion tokens are defined once, with one spring", () => {
    const css = strip(read("components/onepage/shell.module.css"));
    for (const name of ["--ease-out", "--ease-in-out", "--ease-spring"])
      expect(css).toMatch(new RegExp(`${name}:\\s*cubic-bezier\\(`));
    expect(css).toMatch(/--r-dot:\s*999px;/);
  });
});

describe("one stroke for every line icon", () => {
  const pages = [
    renderToStaticMarkup(<Sections config={HOME_CONFIG} />),
    ...PRODUCTS.map((p) =>
      renderToStaticMarkup(<Sections config={productConfig(p.slug)} />),
    ),
  ];
  it("every stroked svg on the home and on the five product pages has the shared stroke width", () => {
    const widths = new Set<string>();
    let stroked = 0;
    for (const html of pages)
      for (const svg of html.match(/<svg[^>]*stroke="currentColor"[^>]*>/g) ??
        []) {
        stroked++;
        widths.add(svg.match(/stroke-width="([\d.]+)"/)?.[1] ?? "none");
      }
    expect(stroked).toBeGreaterThan(20);
    expect([...widths]).toEqual([String(ICON_STROKE)]);
  });
});
