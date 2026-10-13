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
const SHEETS = [
  "components/template/reading.module.css",
  "components/template/content.module.css",
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

  it.each([
    ...SHEETS,
    "components/template/chain-overview.module.css",
    "components/template/corehub.module.css",
    "components/onepage/logos.module.css",
  ])("%s sets font sizes only from the type scale", (file) => {
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
      ["--r-ctl", 6],
      ["--r-card", 12],
      ["--r-win", 16],
    ] as const)
      expect(css, name).toContain(`${name}: ${px}px;`);
    expect(css).toMatch(/--measure:\s*66ch;/);
  });

  it("cards and chips use the shape tokens, and only the shapes of the scale", () => {
    for (const file of [
      "components/template/reading.module.css",
      "components/template/content.module.css",
    ]) {
      const radii = declarations(strip(read(file)))
        .filter(({ prop }) => prop === "border-radius")
        .map(({ value }) => value);
      for (const value of radii)
        expect(["var(--r-card)", "var(--r-ctl)", "50%", "1px"]).toContain(
          value,
        );
    }
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
