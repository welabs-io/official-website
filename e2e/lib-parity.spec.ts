// PARIDADE DOS CONTROLES DO LAB COM A LIB PUBLICADA
// The published Storybook of @imagineapps-team/react with the welabs brand is the reference for every control of the
// site (operator, 2026-10-22). This spec opens the stories, reads the computed style of the lib's own InputGroup and
// Button, reads the same properties on the Relloo lab's field, its buttons and the toolbar, and asserts they match:
// sizes and type exactly (≤ 0.5 px), colours within ΔE76 ≤ 3 once composited over white. Only the deviations in
// ALLOWED differ, each with its reason. Needs the network (react-lib.welabs.space) and the lab on PORTFOLIO_PREVIEW_URL.
import { expect, test, type Page } from "@playwright/test";

const STORY = (id: string) =>
  `https://react-lib.welabs.space/iframe.html?id=${id}&globals=brand:welabs&viewMode=story`;
const LAB = "/lab/scenes/relloo-inbox";

// DESVIOS PERMITIDOS
// `control|property` → why the site differs from the lib's welabs brand on purpose
const ALLOWED: Record<string, string> = {
  "field|borderTopColor":
    "the lib's welabs preset draws the field edge in --input oklch(0.6 0 0) (4.23:1 on white), the dark line the operator rejected twice (rounds 1 and 2); the site draws the default brand's edge, the --border hairline. Below the 3:1 of WCAG 1.4.11: operator decision pending",
  "toolbar|color":
    "the text ink is black #121212 (operator decision, 2026-10-22: the preset's #1c1a16 read as a brownish graphite)",
  "action|color": "the icon takes the same black ink #121212 (operator decision, as above)",
  "send|backgroundColor":
    "the action is black (Welabs UI v3: --primary #121212 with white text); the lib's welabs primary is the amber, which the site keeps for what is live (--signal)",
  "send|color": "white on the black action, as above (the lib's welabs solid primary has ink text on amber)",
};

type Style = Record<string, string>;
const PROPS = [
  "borderTopLeftRadius",
  "borderTopWidth",
  "borderTopColor",
  "backgroundColor",
  "height",
  "paddingLeft",
  "fontSize",
  "fontWeight",
  "color",
] as const;

// The computed style of the first element matching `selector` (and, for a field, of its text control)
async function styleOf(page: Page, selector: string) {
  return page.evaluate(
    ({ selector, props }) => {
      const el = [...document.querySelectorAll<HTMLElement>(selector)].find((e) => e.offsetParent !== null);
      if (!el) return null;
      const s = getComputedStyle(el);
      const out: Record<string, string> = {};
      for (const p of props) out[p] = String(s[p as keyof CSSStyleDeclaration]);
      out.height = String(el.getBoundingClientRect().height);
      const control = el.querySelector('[data-slot="input-group-control"]');
      if (control) out.controlFontSize = getComputedStyle(control).fontSize;
      return out;
    },
    { selector, props: [...PROPS] },
  );
}

// A CSS colour as sRGB over white, through a canvas (it resolves oklab/oklch/alpha the browser's way)
async function rgbOverWhite(page: Page, colour: string) {
  return page.evaluate((c) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, colour);
}

const lab = (rgb: number[]) => {
  const lin = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const xyz = [
    (lin[0] * 0.4124 + lin[1] * 0.3576 + lin[2] * 0.1805) / 0.95047,
    lin[0] * 0.2126 + lin[1] * 0.7152 + lin[2] * 0.0722,
    (lin[0] * 0.0193 + lin[1] * 0.1192 + lin[2] * 0.9505) / 1.08883,
  ].map((t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116));
  return [116 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
};
const deltaE = (a: number[], b: number[]) => {
  const [x, y] = [lab(a), lab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
};

async function compare(page: Page, name: string, ours: Style, ref: Style, props: string[]) {
  const rows: string[] = [];
  for (const p of props) {
    const key = `${name}|${p}`;
    if (ALLOWED[key]) continue;
    if (/Color$|^color$/.test(p)) {
      const d = deltaE(await rgbOverWhite(page, ours[p]), await rgbOverWhite(page, ref[p]));
      rows.push(`${p}: ${ours[p]} vs ${ref[p]} (ΔE ${d.toFixed(1)})`);
      expect(d, `${name} ${p}: ours ${ours[p]}, lib ${ref[p]}`).toBeLessThanOrEqual(3);
    } else {
      const [a, b] = [parseFloat(ours[p]), parseFloat(ref[p])];
      rows.push(`${p}: ${ours[p]} vs ${ref[p]}`);
      expect(Math.abs(a - b), `${name} ${p}: ours ${ours[p]}, lib ${ref[p]}`).toBeLessThanOrEqual(0.5);
    }
  }
  console.log(`[parity] ${name}\n  ${rows.join("\n  ")}`);
}

test.describe("lab controls match the published lib (welabs brand)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.setTimeout(90_000);

  test("field, buttons and toolbar", async ({ page, context }) => {
    // REFERÊNCIA: AS HISTÓRIAS DA LIB
    const sb = await context.newPage();
    await sb.setViewportSize({ width: 1440, height: 900 });
    await sb.goto(STORY("components-inputgroup--default"), { waitUntil: "networkidle" });
    const refField = (await styleOf(sb, '[data-slot="input-group"]'))!;
    await sb.goto(STORY("components-button--with-icon"), { waitUntil: "networkidle" });
    const refOutline = (await styleOf(sb, '[data-slot="button"][data-variant="neutral"][data-appearance="outline"]'))!;
    await sb.goto(STORY("components-buttongroup--icons"), { waitUntil: "networkidle" });
    const refIcon = (await styleOf(sb, '[data-slot="button"][data-size="icon"]'))!;
    await sb.goto(STORY("components-button--sizes"), { waitUntil: "networkidle" });
    const refSm = (await styleOf(sb, '[data-slot="button"][data-size="sm"]'))!;
    expect(refField && refOutline && refIcon && refSm, "every story renders its control").toBeTruthy();

    // O LAB
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(LAB);
    const live = '[data-scene="relloo-inbox"] > :last-child';
    const composer = (await styleOf(page, `${live} [data-slot="input-group"]`))!;
    const search = (await styleOf(page, '[role="figure"] > :first-child [data-slot="input-group"]'))!;
    const toolbar = (await styleOf(page, '[data-lab="take"]'))!;
    const action = (await styleOf(page, `${live} [data-header="actions"] [data-slot="button"]`))!;
    const send = (await styleOf(page, `${live} [data-slot="input-group"] [data-slot="input-group-button"], ${live} [data-slot="input-group"] [data-slot="button"]`))!;
    expect(composer && search && toolbar && action && send, "every lab control renders").toBeTruthy();

    const FIELD = ["borderTopLeftRadius", "borderTopWidth", "borderTopColor", "backgroundColor", "height", "controlFontSize"];
    await compare(page, "field", composer, refField, FIELD);
    await compare(page, "field", search, refField, FIELD);
    const BUTTON = ["borderTopLeftRadius", "borderTopWidth", "borderTopColor", "backgroundColor", "height", "paddingLeft", "fontSize", "fontWeight", "color"];
    await compare(page, "toolbar", toolbar, refOutline, BUTTON);
    await compare(page, "action", action, refIcon, ["borderTopLeftRadius", "borderTopWidth", "borderTopColor", "backgroundColor", "height", "color"]);
    await compare(page, "send", send, refSm, ["height", "paddingLeft", "fontSize", "fontWeight", "backgroundColor", "color"]);
  });
});

// PARIDADE DE TODOS OS CONTROLES DAS CENAS V3
// Domus and Magneto (brief-v3-scenes, 2026-10-22): not a sample, EVERY field (data-slot="input-group") and EVERY button
// (data-slot="button" / "input-group-button") of the scene's live layer, on the settled frame and on the steps where a
// control shows only for a moment, is held to the lib story of its own size: the geometry (height, radius, side
// padding, type, edge width) to components-button--sizes and the field to components-inputgroup--default, so a control
// can never be shrunk below the lib's size (a 30 px field slipped through a one-sample check). Colours are compared to
// the story of the same variant and appearance; a pair with no story fails, so a new look needs a story or a reason here.
const SCENE_CONTROLS: { id: string; steps: string[] }[] = [
  { id: "domus-modules", steps: ["start", "date"] },
  { id: "magneto-approval", steps: ["high", "waiting", "failed"] },
];

// DESVIOS PERMITIDOS DOS CONTROLES DAS CENAS
// `variant/appearance|property` → why the site differs from the lib's welabs brand on purpose
const SCENE_ALLOWED: Record<string, string> = {
  "field|borderTopColor": ALLOWED["field|borderTopColor"],
  "primary/solid|backgroundColor": ALLOWED["send|backgroundColor"],
  "primary/solid|color": ALLOWED["send|color"],
  "neutral/outline|color": ALLOWED["toolbar|color"],
};

type Control = { kind: "field" | "button"; name: string; size: string; look: string; state: string | null; style: Style };

// Every visible field and button of the live layer of a scene, with its computed style
async function controlsOf(page: Page, id: string): Promise<Control[]> {
  return page.evaluate(
    ({ id, props }) => {
      const live = document.querySelector(`[data-scene="${id}"] > :last-child`)!;
      const read = (el: HTMLElement) => {
        const s = getComputedStyle(el);
        const out: Record<string, string> = {};
        for (const p of props) out[p] = String(s[p as keyof CSSStyleDeclaration]);
        out.height = String(el.getBoundingClientRect().height);
        const control = el.querySelector('[data-slot="input-group-control"]');
        if (control) out.controlFontSize = getComputedStyle(control).fontSize;
        return out;
      };
      return [...live.querySelectorAll<HTMLElement>('[data-slot="input-group"], [data-slot="button"], [data-slot="input-group-button"]')]
        .filter((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0)
        .map((el) => ({
          kind: el.dataset.slot === "input-group" ? ("field" as const) : ("button" as const),
          name: (el.textContent || el.getAttribute("aria-label") || (el.querySelector("input")?.placeholder ?? "")).trim().slice(0, 24),
          size: el.dataset.size ?? "md",
          look: `${el.dataset.variant}/${el.dataset.appearance}`,
          state: el.getAttribute("data-state"),
          style: read(el),
        }));
    },
    { id, props: [...PROPS] },
  );
}

test.describe("every control of the v3 scenes matches the published lib (welabs brand)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.setTimeout(120_000);

  test("fields and buttons of domus-modules and magneto-approval", async ({ page, context }) => {
    // REFERÊNCIA: AS HISTÓRIAS DA LIB
    const sb = await context.newPage();
    await sb.setViewportSize({ width: 1440, height: 900 });
    await sb.goto(STORY("components-inputgroup--default"), { waitUntil: "networkidle" });
    const refField = (await styleOf(sb, '[data-slot="input-group"]'))!;
    // Geometry by size: the sizes story draws one primary button per size
    const bySize: Record<string, Style> = {};
    await sb.goto(STORY("components-button--sizes"), { waitUntil: "networkidle" });
    for (const size of ["xs", "sm", "md", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"]) {
      const ref = await styleOf(sb, `[data-slot="button"][data-size="${size}"]`);
      if (ref) bySize[size] = ref;
    }
    // Colours by look: the appearances (primary) and with-icon (neutral outline, neutral ghost) stories
    const byLook: Record<string, Style> = {};
    for (const story of ["components-button--appearances", "components-button--with-icon"]) {
      await sb.goto(STORY(story), { waitUntil: "networkidle" });
      for (const look of ["primary/solid", "primary/outline", "primary/soft", "primary/ghost", "neutral/outline", "neutral/ghost"]) {
        const [variant, appearance] = look.split("/");
        const ref = await styleOf(sb, `[data-slot="button"][data-variant="${variant}"][data-appearance="${appearance}"]`);
        if (ref && !byLook[look]) byLook[look] = ref;
      }
    }
    expect(refField && bySize.md && bySize.sm && byLook["neutral/outline"], "every story renders its control").toBeTruthy();

    const GEOMETRY = ["height", "borderTopLeftRadius", "borderTopWidth", "paddingLeft", "fontSize", "fontWeight"];
    const COLOURS = ["borderTopColor", "backgroundColor", "color"];
    const FIELD = ["borderTopLeftRadius", "borderTopWidth", "borderTopColor", "backgroundColor", "height", "controlFontSize"];

    for (const scene of SCENE_CONTROLS) {
      const seen: Control[] = [];
      // The settled frame (reduced motion), then each step whose controls show only for a moment
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/lab/scenes/${scene.id}`);
      await page.locator(`[data-scene="${scene.id}"]`).waitFor();
      seen.push(...(await controlsOf(page, scene.id)));
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/lab/scenes/${scene.id}`);
      await page.getByRole("button", { name: "Recomeçar" }).click();
      for (const step of scene.steps) {
        await expect(page.locator(`[data-scene="${scene.id}"]`)).toHaveAttribute("data-step", step, { timeout: 15_000 });
        await page.waitForTimeout(150);
        seen.push(...(await controlsOf(page, scene.id)));
      }
      expect(seen.length, `${scene.id}: controls measured`).toBeGreaterThan(0);

      for (const c of seen) {
        const where = `${scene.id} ${c.kind} "${c.name}" (${c.size}, ${c.look})`;
        if (c.kind === "field") {
          for (const p of FIELD) {
            if (SCENE_ALLOWED[`field|${p}`]) continue;
            if (/Color$/.test(p)) {
              const d = deltaE(await rgbOverWhite(page, c.style[p]), await rgbOverWhite(page, refField[p]));
              expect(d, `${where} ${p}: ours ${c.style[p]}, lib ${refField[p]}`).toBeLessThanOrEqual(3);
            } else
              expect(Math.abs(parseFloat(c.style[p]) - parseFloat(refField[p])), `${where} ${p}: ours ${c.style[p]}, lib ${refField[p]}`).toBeLessThanOrEqual(0.5);
          }
          continue;
        }
        const geo = bySize[c.size];
        expect(geo, `${where}: the lib has a story for its size`).toBeTruthy();
        for (const p of GEOMETRY)
          expect(Math.abs(parseFloat(c.style[p]) - parseFloat(geo[p])), `${where} ${p}: ours ${c.style[p]}, lib ${geo[p]}`).toBeLessThanOrEqual(0.5);
        const ref = byLook[c.look];
        expect(ref, `${where}: the lib has a story for its look`).toBeTruthy();
        for (const p of COLOURS) {
          if (SCENE_ALLOWED[`${c.look}|${p}`]) continue;
          // A chip that follows a state of the scene (data-state) paints its own fill: amber-50 while chosen, the
          // muted label while waiting (components/scene-kit/parts.module.css ESTADOS DE CHIP); its edge stays the lib's
          if (c.state && p !== "borderTopColor") continue;
          const d = deltaE(await rgbOverWhite(page, c.style[p]), await rgbOverWhite(page, ref[p]));
          expect(d, `${where} ${p}: ours ${c.style[p]}, lib ${ref[p]}`).toBeLessThanOrEqual(3);
        }
      }
      console.log(`[parity] ${scene.id}: ${seen.length} controls (${[...new Set(seen.map((c) => `${c.kind} ${c.size} ${c.look}`))].join("; ")})`);
    }
  });
});
