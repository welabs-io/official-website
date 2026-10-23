// TESTES DA FRONTEIRA DA BIBLIOTECA
// The UI standard of the site (.claude/skills/welabs-site-ui) enforced by tool, not by text: every UI primitive comes
// from @imagineapps-team/react through the client boundary components/lib/*.tsx, the lib's role tokens are mapped in
// one place (app/lib.css), and the effects off the brand are never re-exported. What breaks a rule today is a closed
// list of known failures, each with the phase of the v3 plan that removes it; a known failure that is gone fails the
// test too, so the lists only shrink as the phases land.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const read = (file: string) => readFileSync(path.join(ROOT, file), "utf8");
const files = (dir: string, ext: RegExp) =>
  readdirSync(path.join(ROOT, dir), { recursive: true, encoding: "utf8" })
    .map((f) => path.posix.join(dir, f.split(path.sep).join("/")))
    .filter((f) => ext.test(f) && !/\.test\.tsx?$/.test(f));
const stripJs = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const stripCss = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const SOURCES = ["components", "app", "lib"].flatMap((d) =>
  files(d, /\.(tsx?|jsx?|mjs)$/),
);
const COMPONENTS_TSX = files("components", /\.tsx$/);
const SHEETS = [
  ...files("components", /\.css$/),
  ...files("app", /\.css$/),
];
const BOUNDARY = files("components/lib", /\.tsx$/);

// Counts of `key` in a list, as a sorted object (stable diffs in the failure message)
const tally = (keys: string[]) =>
  Object.fromEntries(
    [...keys.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<string, number>())]
      .sort(([a], [b]) => a.localeCompare(b)),
  );

describe("one client boundary for the lib", () => {
  it("only components/lib/ imports @imagineapps-team/react", () => {
    const outside = SOURCES.filter((f) => !f.startsWith("components/lib/")).filter((f) =>
      /(?:from\s*|import\s*\(\s*|require\(\s*)["']@imagineapps-team\/react/.test(stripJs(read(f))),
    );
    expect(outside).toEqual([]);
  });

  it("every boundary file is a client module", () => {
    expect(BOUNDARY.length).toBeGreaterThan(0);
    for (const f of BOUNDARY) expect(read(f), f).toMatch(/^"use client";/);
  });

  // The effects whose look the brand does not use (multicolour, glitch, neon, liquid glass) and the scroll progress bar
  // (the site has no progress bar); a wrapper may not re-export them under any name
  const OFF_BRAND = [
    "GradientText",
    "GlitchText",
    "DecryptedText",
    "ElectricBorder",
    "VideoText",
    "GlassSurface",
    "useLiquidGlass",
    "ScrollProgress",
  ];
  it("no effect off the brand crosses the boundary", () => {
    const found = BOUNDARY.flatMap((f) =>
      OFF_BRAND.filter((name) => new RegExp(`\\b${name}\\b`).test(stripJs(read(f)))).map(
        (name) => `${f}: ${name}`,
      ),
    );
    expect(found).toEqual([]);
  });
});

// PRIMITIVAS FEITAS À MÃO
// A native control or table in the markup of a component, by file and tag. A checkbox or radio with its label is the
// CSS state machine of the plays and of the house (a documented local gap, and check-portfolio requires it), so it is
// allowed; every other input is a text field the lib has.
const NATIVE_GAPS: Record<string, string> = {
  // Choice: the native checkbox/radio of the plays, its `type` prop typed "checkbox" | "radio"
  "components/plays/parts.tsx|input": "local gap: CSS state machine of the plays",
};
// v3 (F3): empty; the menu button is the lib's Button (F2), the reset of the plays left with the demo and the list of
// the Domus play is the lib's Table
const NATIVE_KNOWN: Record<string, number> = {};

const nativePrimitives = () =>
  COMPONENTS_TSX.flatMap((f) => {
    const src = stripJs(read(f));
    const out: string[] = [];
    for (const m of src.matchAll(/<(button|table|select|textarea|input)\b([^>]*)>/g)) {
      if (m[1] === "input" && /\btype="(checkbox|radio)"/.test(m[2])) continue;
      const key = `${f}|${m[1]}`;
      if (key in NATIVE_GAPS) continue;
      out.push(key);
    }
    return out;
  });

describe("UI primitives come from the lib", () => {
  it("no native button, table, select, textarea or text input besides the known failures", () => {
    expect(tally(nativePrimitives())).toEqual(NATIVE_KNOWN);
  });

  it("every documented native gap still exists (delete it when it goes)", () => {
    for (const key of Object.keys(NATIVE_GAPS)) {
      const [file, tag] = key.split("|");
      expect(stripJs(read(file)), key).toMatch(new RegExp(`<${tag}\\b`));
    }
  });
});

// A class of a component sheet named like a UI primitive (badge, chip, pill, tag, card, button, input, field, table)
// paints a primitive by hand, unless the markup only gives it to a component of the lib, to place it
// (`<Badge className={house.tag}>`).
const PRIMITIVE_CLASS =
  /^(?:badge|chip|pill|tag|card|button|btn|input|field|table)(?:[A-Z]\w*)?$|[a-z](?:Badge|Chip|Pill|Tag|Card|Button|Btn|Input|Field|Table)$/;

// The names the boundary exports: the components of the lib the site uses, and the site primitives built on them
// (`export function ActionButton`)
const LIB_NAMES = BOUNDARY.flatMap((f) => [
  ...[...stripJs(read(f)).matchAll(/export\s*\{([^}]*)\}/g)].flatMap((m) =>
    m[1]
      .split(",")
      .map((s) => s.trim().split(/\s+as\s+/).pop()!)
      .filter((s) => s && !s.startsWith("type ")),
  ),
  ...[...stripJs(read(f)).matchAll(/export\s+function\s+(\w+)/g)].map((m) => m[1]),
]);

// The opening tag that starts at `at`, up to its closing `>` outside of braces (an arrow `=>` inside {} is skipped)
const openingTag = (src: string, at: number) => {
  let depth = 0;
  for (let i = at; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") depth--;
    else if (src[i] === ">" && depth === 0) return src.slice(at, i + 1);
  }
  return src.slice(at);
};

// The sheets a component imports, by local name (`import house from "./house.module.css"`)
const sheetImports = (file: string, src: string) => {
  const out = new Map<string, string>();
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+["']([^"']+\.module\.css)["']/g))
    out.set(
      m[1],
      m[2].startsWith("@/")
        ? m[2].slice(2)
        : path.posix.join(path.posix.dirname(file), m[2]),
    );
  return out;
};

// Classes the markup gives to a component of the lib, as `sheet|.class`
const classesOnLib = () => {
  const out = new Set<string>();
  const tag = new RegExp(`<(?:${LIB_NAMES.join("|")})\\b`, "g");
  for (const f of COMPONENTS_TSX) {
    const src = stripJs(read(f));
    const sheets = sheetImports(f, src);
    for (const m of src.matchAll(tag))
      for (const c of openingTag(src, m.index).matchAll(/\b(\w+)\.(\w+)/g)) {
        const sheet = sheets.get(c[1]);
        if (sheet) out.add(`${sheet}|.${c[2]}`);
      }
  }
  return out;
};

const handMadeClasses = () => {
  const onLib = classesOnLib();
  return SHEETS.filter((f) => f.endsWith(".module.css")).flatMap((f) => {
    const selectors = [...stripCss(read(f)).matchAll(/([^{}]+)\{/g)]
      .map((m) => m[1])
      .filter((s) => !s.trim().startsWith("@"));
    const names = new Set(
      selectors.flatMap((s) => [...s.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])),
    );
    return [...names]
      .filter((n) => PRIMITIVE_CLASS.test(n))
      .map((n) => `${f}|.${n}`)
      .filter((key) => !onLib.has(key));
  });
};

// Known failures measured on 155fb83, with the phase that swaps them for the lib (welabs-site-ui, references/block-map.md)
const CLASS_KNOWN: string[] = [
  // TODO(F4): the capability scenes move into the product strips of the home, on Card and Badge
  "components/scenes/capability.module.css|.cardMini",
  "components/scenes/capability.module.css|.cardMiniMeta",
  "components/scenes/capability.module.css|.noteCard",
  "components/scenes/capability.module.css|.orderTag",
  "components/scenes/capability.module.css|.pillOk",
  "components/scenes/ludic.module.css|.card",
  "components/scenes/ludic.module.css|.pill",
  "components/scenes/scenes.module.css|.pillInfo",
  "components/scenes/scenes.module.css|.pillOk",
  // TODO(F4): the five product cards of the home give way to one strip per product
  "components/template/v2.module.css|.card",
  "components/template/v2.module.css|.cardLine",
  "components/template/v2.module.css|.cardLogo",
];

describe("no primitive painted by hand", () => {
  it("no sheet class named like a UI primitive besides the known failures", () => {
    expect(handMadeClasses().sort()).toEqual([...CLASS_KNOWN].sort());
  });
});

// CAMADA ÚNICA DE TEMA
// The role tokens of the lib are mapped to the site's palette in app/lib.css only: no other sheet sets them under a
// data-theme selector, and no component paints a raw colour through a Tailwind arbitrary value or an inline style.
describe("one theme-mapping layer", () => {
  it("only app/lib.css sets tokens under data-theme", () => {
    const sheets = SHEETS.filter((f) => f !== "app/lib.css" && f !== "app/brand/welabs.css");
    const found = sheets.filter((f) =>
      [...stripCss(read(f)).matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(
        (m) => /data-theme/.test(m[1]) && /--[\w-]+\s*:/.test(m[2]),
      ),
    );
    expect(found).toEqual([]);
  });

  it("no component paints a raw colour by class or inline style", () => {
    const found = COMPONENTS_TSX.flatMap((f) => {
      const src = stripJs(read(f));
      return [
        ...src.matchAll(/-\[#[0-9a-fA-F]{3,8}\]/g),
        ...src.matchAll(
          /\b(?:color|background|backgroundColor|borderColor|fill|stroke)\s*:\s*["'](?:#|rgb|hsl|oklch)/g,
        ),
      ].map((m) => `${f}: ${m[0]}`);
    });
    expect(found).toEqual([]);
  });
});

// CONTROLES DO SITE
// Every button and field of the site goes through the control primitives of components/lib/ui.tsx (operator,
// 2026-10-22): one point of change for their look (app/lib.css CONTROLES) and a required icon on each. A raw lib
// Button/Input/InputGroup/Field outside the boundary, a primitive without its icon, or a call site that paints the
// control's edge or fill by utility class fails here.
const PRIMITIVES = ["ActionButton", "LinkButton", "IconButton", "RowButton", "TextField"];
const RAW_CONTROLS = [
  "Button",
  "Input",
  "InputGroup",
  "InputGroupAddon",
  "InputGroupButton",
  "InputGroupInput",
  "InputGroupText",
  "InputGroupTextarea",
  "Field",
];
const UI = "components/lib/ui.tsx";
const CALL_SITES = SOURCES.filter((f) => /\.tsx$/.test(f) && !f.startsWith("components/lib/"));

describe("site controls go through the primitives", () => {
  it("the boundary re-exports no raw lib control", () => {
    const exported = [...stripJs(read(UI)).matchAll(/export\s*\{([^}]*)\}/g)].flatMap((m) =>
      m[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop()!),
    );
    expect(exported.filter((n) => RAW_CONTROLS.includes(n))).toEqual([]);
  });

  it("no call site imports a raw lib control", () => {
    const found = CALL_SITES.flatMap((f) =>
      [...stripJs(read(f)).matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@\/components\/lib\/[^"']+["']/g)].flatMap(
        (m) =>
          m[1]
            .split(",")
            .map((s) => s.trim().split(/\s+as\s+/)[0])
            .filter((n) => RAW_CONTROLS.includes(n))
            .map((n) => `${f}: ${n}`),
      ),
    );
    expect(found).toEqual([]);
  });

  it("every primitive requires its icon", () => {
    const src = stripJs(read(UI));
    for (const name of PRIMITIVES) {
      const at = src.search(new RegExp(`export function ${name}\\b`));
      expect(at, name).toBeGreaterThan(-1);
      // The props type of the function, up to its body
      const signature = src.slice(at, src.indexOf(") {", at));
      expect(signature, name).toMatch(/\bicon: ControlIcon;/);
    }
  });

  it("every button and field of the site carries an icon, and no call site paints its edge or fill", () => {
    const tag = new RegExp(`<(${PRIMITIVES.join("|")})\\b`, "g");
    const missing: string[] = [];
    const painted: string[] = [];
    let seen = 0;
    for (const f of CALL_SITES) {
      const src = stripJs(read(f));
      for (const m of src.matchAll(tag)) {
        seen++;
        const open = openingTag(src, m.index);
        // `icon=` at the top level of the tag (an action's `icon:` inside braces does not count)
        let depth = 0;
        let top = "";
        for (const ch of open) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
          else if (depth === 0) top += ch;
        }
        // A composer field may lead with a chip (`lead=`, Welabs UI v3: the channel of origin, its own icon inside)
        if (!/\s(?:icon|lead)=/.test(top)) missing.push(`${f}: <${m[1]}>`);
        for (const c of open.matchAll(/className="([^"]*)"/g))
          if (/(?:^|\s)(?:bg|border|ring|shadow|outline)-/.test(c[1])) painted.push(`${f}: <${m[1]}> ${c[1]}`);
      }
    }
    expect(seen).toBeGreaterThan(0);
    expect(missing).toEqual([]);
    expect(painted).toEqual([]);
  });
});
