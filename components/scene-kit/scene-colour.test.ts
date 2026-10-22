// TESTES DOS PAPÉIS DE COR DO KIT DE CENAS
// The colour roles of the kit (colour-decisions of 2026-10-22, .claude/skills/welabs-site-ui "Papéis de cor") enforced
// by tool: the sand 700 (#625b4e, --muted-foreground and every token that resolves to it in app/lib.css) is a text and
// icon tone only, so no sheet or class of components/scene-kit paints a background or a fill with it; and the kit's
// sheets carry no raw colour (every colour is a role token of app/lib.css).
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const KIT = "components/scene-kit";
const read = (file: string) => readFileSync(path.join(ROOT, file), "utf8");
const kitFiles = (ext: RegExp) =>
  readdirSync(path.join(ROOT, KIT), { recursive: true, encoding: "utf8" })
    .map((f) => path.posix.join(KIT, f.split(path.sep).join("/")))
    .filter((f) => ext.test(f) && !/\.test\.tsx?$/.test(f));
const stripCss = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const SAND_700 = /#625b4e\b|rgba?\(\s*98\s*,\s*91\s*,\s*78\b/i;

// The custom properties of a sheet that resolve to the sand 700, through any chain of var() aliases
function textOnlyTokens(themeCss: string): Set<string> {
  const decls = [...stripCss(themeCss).matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)].map(
    (m) => [m[1], m[2].trim()] as const,
  );
  const out = new Set<string>(["--muted-foreground"]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const [name, value] of decls) {
      if (out.has(name)) continue;
      const aliases = [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]);
      if (SAND_700.test(value) || aliases.some((a) => out.has(a))) {
        out.add(name);
        grew = true;
      }
    }
  }
  return out;
}

// Background and fill declarations of a sheet that paint with a text-only tone, as `selector { prop: value }`
function sandFills(css: string, tokens: Set<string>): string[] {
  const found: string[] = [];
  for (const block of stripCss(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const d of block[2].matchAll(/(?:^|;)\s*(background(?:-color|-image)?|fill)\s*:\s*([^;]+)/g)) {
      const aliases = [...d[2].matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]);
      if (SAND_700.test(d[2]) || aliases.some((a) => tokens.has(a)))
        found.push(`${block[1].trim()} { ${d[1]}: ${d[2].trim()} }`);
    }
  }
  return found;
}

// Tailwind classes of a component that fill with a text-only tone (bg-muted-foreground, fill-[#625b4e], ...)
function sandFillClasses(src: string, tokens: Set<string>): string[] {
  const names = [...tokens].map((t) => t.slice(2)).join("|");
  const re = new RegExp(
    `\\b(?:bg|fill|from|via|to)-(?:(?:${names})\\b|\\[(?:#625b4e|var\\(--(?:${names})\\))\\]|\\(--(?:${names})\\))`,
    "gi",
  );
  return [...src.matchAll(re)].map((m) => m[0]);
}

const TOKENS = textOnlyTokens(read("app/lib.css"));

describe("the detectors", () => {
  it("resolve the aliases of the sand 700 and flag only fills", () => {
    const tokens = textOnlyTokens(":root { --a: #625B4E; --b: var(--a); --c: var(--card); }");
    expect([...tokens].sort()).toEqual(["--a", "--b", "--muted-foreground"]);
    const css = `.x { color: var(--b); background: var(--card); }
      .y { background-color: var(--b); } .z { fill: rgb(98, 91, 78) } .w { box-shadow: inset 0 0 0 1px var(--a) }
      .v { background: linear-gradient(var(--muted-foreground), transparent) }`;
    expect(sandFills(css, tokens)).toEqual([
      ".y { background-color: var(--b) }",
      ".z { fill: rgb(98, 91, 78) }",
      ".v { background: linear-gradient(var(--muted-foreground), transparent) }",
    ]);
    expect(
      sandFillClasses('className="text-muted-foreground bg-muted-foreground fill-[#625b4e] bg-card"', tokens),
    ).toEqual(["bg-muted-foreground", "fill-[#625b4e]"]);
  });

  it("find the sand 700 among the tokens of app/lib.css", () => {
    expect(TOKENS.has("--muted-foreground")).toBe(true);
  });
});

describe("sand 700 is text and icon only in the scene kit", () => {
  it("no sheet of the kit paints a background or fill with it", () => {
    expect(kitFiles(/\.css$/).flatMap((f) => sandFills(read(f), TOKENS).map((d) => `${f}: ${d}`))).toEqual([]);
  });

  it("no component of the kit fills with it by class", () => {
    expect(
      kitFiles(/\.tsx$/).flatMap((f) => sandFillClasses(read(f), TOKENS).map((c) => `${f}: ${c}`)),
    ).toEqual([]);
  });

  it("the sheets of the kit carry no raw colour", () => {
    const raw = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/gi;
    expect(
      kitFiles(/\.css$/).flatMap((f) => [...stripCss(read(f)).matchAll(raw)].map((m) => `${f}: ${m[0]}`)),
    ).toEqual([]);
  });
});
