// TESTES DA LAPIDAÇÃO VISUAL
// The visual system is enforced by tests, not by memory: the component sheets of the page read the tokens of `.page`
// (type scale, 4 px space grid, shapes) and carry no loose value, every line icon has the same stroke, the type
// scale is the closed scale of seven steps of the plan (v3, F2), the page never goes under 14 px and no sheet anywhere
// goes under the 12 px floor (v3), and the section heads have their three variants (v3, F2).
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ICON_STROKE } from "@/lib/icon-stroke";
import { renderPage } from "@/lib/i18n/render-page";
import { PRODUCTS } from "@/lib/products";
import { HOME_CONFIG, productConfig } from "@/lib/site-config";

const ROOT = path.resolve(__dirname, "../..");
const read = (file: string) => readFileSync(path.join(ROOT, file), "utf8");
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
// The one token source of the site (operator, 2026-10-22): app/lib.css from its TOKENS DO SITE block on (the lib's
// @theme above it carries Tailwind's own --text-* names, which the site's aliases override)
const TOKEN_SOURCE = () => {
  const css = read("app/lib.css");
  return strip(css.slice(css.indexOf("/* TOKENS DO SITE */")));
};

// Sheets that carry the page's own rhythm: spaces and type come from tokens
// v2.1: the stage, the message, the house and the play of the Tuner have sheets of their own, under the same rule
const SHEETS = [
  "components/template/v2.module.css",
  "components/template/hub.module.css",
  "components/template/house.module.css",
  // v3 (2026-10-23): the message and the plays left with their sheets (the kit scenes replace them; their sheets are
  // held by components/scene-kit/tokens.test.ts)
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

  // v3 (F2, plano.md 4.1): a closed scale of seven steps, resolved at 1440 and at 390 to the sizes of the plan, and every
  // --text-* name the sheets read is one of the steps (no size of its own)
  it("the type scale is the seven steps of the plan, at 1440 and at 390", () => {
    const css = TOKEN_SOURCE();
    const value = (name: string) =>
      css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim() ?? "";
    // The size of a step at a viewport width: px as is, a clamp(min, vw, max) resolved
    const at = (name: string, width: number) => {
      const v = value(name);
      const clamp = v.match(
        /^clamp\(\s*([\d.]+)px,\s*([\d.]+)vw,\s*([\d.]+)px\s*\)$/,
      );
      if (clamp) {
        const [, min, vw, max] = clamp.map(Number);
        return Math.min(max, Math.max(min, (vw * width) / 100));
      }
      return Number(v.match(/^([\d.]+)px$/)?.[1]);
    };
    const STEPS: Record<string, [number, number]> = {
      "--t-display": [72, 40],
      "--t-h2": [44, 30],
      "--t-h3": [24, 20],
      "--t-lead": [18, 18],
      "--t-body": [16, 16],
      "--t-label": [14, 14],
      "--t-micro": [12, 12],
    };
    for (const [name, [desktop, phone]] of Object.entries(STEPS)) {
      expect(at(name, 1440), `${name} at 1440`).toBe(desktop);
      expect(at(name, 390), `${name} at 390`).toBe(phone);
    }
    const aliases = [...css.matchAll(/(--text-[\w-]+):\s*([^;]+);/g)];
    expect(aliases.length).toBeGreaterThanOrEqual(9);
    for (const [, name, v] of aliases)
      expect(v.trim(), name).toMatch(
        /^var\(--t-(display|h2|h3|lead|body|label)\)$/,
      );
    // The page itself starts at the label step; the micro step is for the drawn screens only
    expect(value("--text-xs")).toBe("var(--t-label)");
  });

  it("the 4 px space grid, the three shapes and the measure are defined once", () => {
    const css = TOKEN_SOURCE();
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
      // Welabs UI v3 (2026-10-22): control 8, card and window 12, and no pill button (the old round step is 8)
      ["--r-ctl", 8],
      ["--r-card", 12],
      ["--r-win", 12],
      ["--r-pill", 8],
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
// loose in the scenes. The scenes keep their interface text under the page floor as a documented exception (a drawing
// of a product screen, at the size of that screen: v3, the micro and label steps, 12 and 14 px;
// e2e/product-scenes.spec.ts holds its legibility rule).
const MOTION_SHEETS = [
  ...SHEETS,
  "components/scenes/fx.css",
  "components/scenes/scenes.module.css",
  "components/scenes/ludic.module.css",
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
    // The whole app/lib.css: --ease-in-out sits with the lib's curves, above the TOKENS DO SITE block
    const css = strip(read("app/lib.css"));
    for (const name of ["--ease-out", "--ease-in-out", "--ease-spring"])
      expect(css).toMatch(new RegExp(`${name}:\\s*cubic-bezier\\(`));
    expect(css).toMatch(/--r-dot:\s*999px;/);
  });
});

// v3 (plan, section 4.1): the floor of the type scale is 12 px everywhere, the drawn product screens included (the page
// itself starts at 14, above). Every type token and every font size of every sheet resolves at or above the floor; a
// clamp counts by its minimum. Known failures carry the phase that removes them, and one that is gone fails too.
// The SVG labels of the brand intros (components/intro/*.js) are in viewBox units, scaled with the drawing: out of scope.
const FLOOR_PX = 12;
// v3 (F2): empty; the meta text of the scenes went from 11 px to the 12 px step
const FLOOR_KNOWN: Record<string, string> = {};
const ALL_SHEETS = ["components", "app"].flatMap((dir) =>
  readdirSync(path.join(ROOT, dir), { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".css"))
    .map((f) => path.posix.join(dir, f.split(path.sep).join("/"))),
);
// The smallest size a value can render, in px, or null when it is a reference resolved elsewhere (var, em, %)
const minPx = (value: string): number | null => {
  const v = value
    .trim()
    .replace(/^clamp\(\s*([^,]+),[\s\S]*\)$/, "$1")
    .trim();
  const m = v.match(/^(\d*\.?\d+)(px|rem)$/);
  if (!m) return null;
  return Number(m[1]) * (m[2] === "rem" ? 16 : 1);
};

describe("the floor of the type scale", () => {
  const below = () =>
    ALL_SHEETS.flatMap((file) =>
      declarations(strip(read(file)))
        .filter(
          ({ prop }) =>
            prop === "font-size" ||
            /^--(?:text|t|s-t|wl-text)-[\w-]+$/.test(prop),
        )
        .filter(({ value }) => {
          const px = minPx(value);
          return px !== null && px < FLOOR_PX;
        })
        .map(({ prop }) => `${file}|${prop}`),
    );

  it("every type token and font size of the sheets is at least 12 px, besides the known failures", () => {
    expect(ALL_SHEETS.length).toBeGreaterThan(20);
    expect([...new Set(below())].sort()).toEqual(
      Object.keys(FLOOR_KNOWN).sort(),
    );
  });

  it("no component writes a font size under the floor inline", () => {
    const tsx = readdirSync(path.join(ROOT, "components"), {
      recursive: true,
      encoding: "utf8",
    }).filter((f) => f.endsWith(".tsx"));
    const loose = tsx.flatMap((f) =>
      [
        ...read(path.posix.join("components", f)).matchAll(
          /fontSize:\s*["']?(\d*\.?\d+)(px)?["']?|font-size="(\d*\.?\d+)"/g,
        ),
      ]
        .filter((m) => Number(m[1] ?? m[3]) < FLOOR_PX)
        .map((m) => `${f}: ${m[0]}`),
    );
    expect(loose).toEqual([]);
  });
});

// v3 (plan, section 4.1): the sections are not one centred 40 px h2 each; the head has variants (chapter, showcase,
// strip), marked `data-head` on the markup
describe("a hierarchy of section heads", () => {
  // v3 (F2): the three variants of SectionHead.tsx; the home uses all of them, and only them
  it("the home uses at least two variants of section head, all of them known", () => {
    const html = renderPage(HOME_CONFIG);
    const variants = new Set(
      [...html.matchAll(/data-head="([\w-]+)"/g)].map((m) => m[1]),
    );
    expect(variants.size).toBeGreaterThanOrEqual(2);
    for (const v of variants)
      expect(["chapter", "showcase", "strip"]).toContain(v);
  });

  it("every h2 of a section head sits in a head with its variant", () => {
    for (const config of [
      HOME_CONFIG,
      ...PRODUCTS.map((p) => productConfig(p.slug)),
    ]) {
      const html = renderPage(config);
      const heads = html.match(/<div[^>]*data-head="[\w-]+"[^>]*><h2/g) ?? [];
      expect(heads.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("one stroke for every line icon", () => {
  const pages = [
    renderPage(HOME_CONFIG),
    ...PRODUCTS.map((p) => renderPage(productConfig(p.slug))),
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
