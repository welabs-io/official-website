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
  // The v3 scenes (tuner-carousel, knowly-answer, home-message): the same three decisions, per kind of control
  "outline|color": "the label and icon take the black ink #121212 (operator decision, as toolbar|color)",
  "icon|color": "the icon takes the black ink #121212 (operator decision, as action|color)",
  "row|color": "the row's text is the black ink #121212 (operator decision, as toolbar|color)",
  "solid|backgroundColor": "the action is black (as send|backgroundColor)",
  "solid|color": "white on the black action (as send|color)",
  "segment|color":
    "the idle options read in the neutral secondary text #55565b (operator decision, 2026-10-22: the preset's sand 700 #625b4e read as graphite)",
  "segment-item|color": "the idle option's label, the same neutral secondary text (as segment|color)",
  "segment-active|backgroundColor":
    "the chosen option is the black primary with white text (Welabs UI v3 Selection: 'Segmento: trilho stone-100, opção ativa primary'); the lib draws a white pill on the rail",
  "segment-active|color": "white on the black chosen option, as above",
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
  // The published Storybook draws its story some seconds after the network goes idle (measured 2026-10-22: no control
  // at networkidle, the InputGroup field ~4 s and both fields 8 s later), so on a story wait for the story's first lib
  // piece (a story that never renders fails here), then briefly for the control itself: a story without the control
  // still reads as null, and the looks a story lacks stay cheap
  if (page.url().includes("react-lib.welabs.space")) {
    await page.locator("#storybook-root [data-slot]").first().waitFor({ timeout: 30_000 });
    await page
      .locator(selector)
      .first()
      .waitFor({ state: "visible", timeout: 3_000 })
      .catch(() => undefined);
  }
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
async function fieldsAndButtonsOf(page: Page, id: string): Promise<Control[]> {
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

// Operator rule (2026-10-22): no control is shrunk below the lib's default (md: 40 px high, 14 px radius, 14 px type).
// Every button, field and segmented control of each v3 scene, found by its data-slot (not a sample), is compared with
// the story that draws its kind: a labelled outline or solid button with components-button--with-icon, an icon button
// with components-buttongroup--icons, a list row (the lib's ghost button laid out as a row) with the ghost of the same
// story (its height may only grow), a field with components-inputgroup--default, a segmented control with
// components-segmentedcontrol--default. Only ALLOWED differs.
// The carousels (brief-v3-carousel) join them: their frame indicator is a segmented control, their call to action
// the black primary; the Domus lays its four frames out at once, so its settled pass reads every control of the loop
const V3_LABS = ["tuner-carousel", "knowly-answer", "home-message", "magneto-carousel", "domus-carousel"] as const;
// The steps of a v3 scene whose controls show only for a moment (a carousel frame before the settled one), measured
// too: the channel rows of the Tuner's frame 2
const V3_STEPS: Partial<Record<(typeof V3_LABS)[number], string[]>> = { "tuner-carousel": ["sent"] };

// Every control of the live layer of the scene, with its kind and its computed style
async function controlsOf(page: Page, id: string) {
  return page.evaluate(
    ({ id, props }) => {
      const live = document.querySelector(`[data-scene="${id}"] > :last-child`)!;
      const read = (el: Element) => {
        const s = getComputedStyle(el);
        const out: Record<string, string> = {};
        for (const p of props) out[p] = String(s[p as keyof CSSStyleDeclaration]);
        out.height = String(el.getBoundingClientRect().height);
        return out;
      };
      const seen = (el: Element) => (el as HTMLElement).offsetParent !== null && el.getBoundingClientRect().width > 0;
      const out: { kind: string; name: string; style: Record<string, string>; state?: string }[] = [];
      live.querySelectorAll('[data-slot="button"]').forEach((el) => {
        if (!seen(el)) return;
        const size = el.getAttribute("data-size") ?? "md";
        const appearance = el.getAttribute("data-appearance");
        const kind = size.startsWith("icon")
          ? "icon"
          : appearance === "ghost"
            ? "row"
            : appearance === "solid"
              ? "solid"
              : appearance ?? "button";
        out.push({
          kind,
          name: `${kind} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24)}"`,
          style: read(el),
          state: el.getAttribute("data-state") ?? undefined,
        });
      });
      live.querySelectorAll('[data-slot="input-group"]').forEach((el) => {
        if (!seen(el)) return;
        const style = read(el);
        const control = el.querySelector('[data-slot="input-group-control"]');
        if (control) style.controlFontSize = getComputedStyle(control).fontSize;
        out.push({ kind: "field", name: "field", style });
      });
      live.querySelectorAll('[data-slot="segmented-control"]').forEach((el) => {
        if (!seen(el)) return;
        out.push({ kind: "segment", name: "segment", style: read(el) });
        el.querySelectorAll('[data-slot="segmented-control-item"]').forEach((item) => {
          const active = item.getAttribute("data-state") === "active";
          const style = read(item);
          // The chosen option's fill is its indicator (the lib's moving pill), or the item itself without motion
          const pill = item.querySelector('[data-slot="segmented-control-indicator"]');
          if (active && pill) style.backgroundColor = getComputedStyle(pill).backgroundColor;
          out.push({ kind: active ? "segment-active" : "segment-item", name: `segment "${item.textContent}"`, style });
        });
      });
      return out;
    },
    { id, props: [...PROPS] },
  );
}

test.describe("every field and button of domus and magneto match the published lib (welabs brand)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.setTimeout(120_000);

  // The Domus and the Magneto left this list for V3_LABS with their carousels
  test("fields and buttons of the single-screen scenes", async ({ page, context }) => {
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
    expect(refField && bySize.md && byLook["neutral/outline"], "every story renders its control").toBeTruthy();

    const GEOMETRY = ["height", "borderTopLeftRadius", "borderTopWidth", "paddingLeft", "fontSize", "fontWeight"];
    const COLOURS = ["borderTopColor", "backgroundColor", "color"];
    const FIELD = ["borderTopLeftRadius", "borderTopWidth", "borderTopColor", "backgroundColor", "height", "controlFontSize"];

    for (const scene of SCENE_CONTROLS) {
      const seen: Control[] = [];
      // The settled frame (reduced motion), then each step whose controls show only for a moment
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/lab/scenes/${scene.id}`);
      await page.locator(`[data-scene="${scene.id}"]`).waitFor();
      seen.push(...(await fieldsAndButtonsOf(page, scene.id)));
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/lab/scenes/${scene.id}`);
      await page.getByRole("button", { name: "Recomeçar" }).click();
      for (const step of scene.steps) {
        await expect(page.locator(`[data-scene="${scene.id}"]`)).toHaveAttribute("data-step", step, { timeout: 15_000 });
        await page.waitForTimeout(150);
        seen.push(...(await fieldsAndButtonsOf(page, scene.id)));
      }
      expect(seen.length, `${scene.id}: controls measured`).toBeGreaterThan(0);

      for (const c of seen) {
        const where = `${scene.id} ${c.kind} "${c.name}" (${c.size}, ${c.look})`;
        // Never below the lib's default size: the md height (40 px), the same floor as the tuner, knowly and home scenes
        expect(parseFloat(c.style.height), `${where} height`).toBeGreaterThanOrEqual(40 - 0.5);
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
        // Every button is the lib's md (no sm or xs): a labelled one is "md", an icon one "icon" (its md); the
        // geometry is held to that story of the sizes story
        expect(["md", "icon"], `${where}: size`).toContain(c.size);
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

test.describe("every control of the tuner, knowly and home scenes matches the published lib (welabs brand)", () => {
  test.setTimeout(120_000);

  test("buttons, fields and segmented controls at 1440 and 390", async ({ page, context }) => {
    // REFERÊNCIA: AS HISTÓRIAS DA LIB
    const sb = await context.newPage();
    await sb.setViewportSize({ width: 1440, height: 900 });
    await sb.goto(STORY("components-button--with-icon"), { waitUntil: "networkidle" });
    const refSolid = (await styleOf(sb, '[data-slot="button"][data-variant="primary"][data-appearance="solid"]'))!;
    const refOutline = (await styleOf(sb, '[data-slot="button"][data-variant="neutral"][data-appearance="outline"]'))!;
    const refGhost = (await styleOf(sb, '[data-slot="button"][data-appearance="ghost"]'))!;
    await sb.goto(STORY("components-buttongroup--icons"), { waitUntil: "networkidle" });
    const refIcon = (await styleOf(sb, '[data-slot="button"][data-size="icon"]'))!;
    await sb.goto(STORY("components-inputgroup--default"), { waitUntil: "networkidle" });
    const refField = (await styleOf(sb, '[data-slot="input-group"]'))!;
    await sb.goto(STORY("components-segmentedcontrol--default"), { waitUntil: "networkidle" });
    const refSegment = (await styleOf(sb, '[data-slot="segmented-control"]'))!;
    const refItem = (await styleOf(sb, '[data-slot="segmented-control-item"][data-state="inactive"]'))!;
    const refActive = (await styleOf(sb, '[data-slot="segmented-control-indicator"]'))!;
    expect(refSolid && refOutline && refGhost && refIcon && refField && refSegment && refItem && refActive).toBeTruthy();

    const BUTTON = ["borderTopLeftRadius", "borderTopWidth", "borderTopColor", "backgroundColor", "height", "paddingLeft", "fontSize", "fontWeight", "color"];
    const REF: Record<string, { ref: Style; props: string[] }> = {
      solid: { ref: refSolid, props: BUTTON },
      outline: { ref: refOutline, props: BUTTON },
      icon: { ref: refIcon, props: ["borderTopLeftRadius", "borderTopWidth", "borderTopColor", "backgroundColor", "height", "color"] },
      // A row is as tall as its two lines (never less than the control): its height is checked as a floor below
      row: { ref: refGhost, props: ["borderTopLeftRadius", "fontSize", "fontWeight", "color"] },
      field: { ref: refField, props: ["borderTopLeftRadius", "borderTopWidth", "backgroundColor", "height", "controlFontSize"] },
      segment: { ref: refSegment, props: ["borderTopLeftRadius", "backgroundColor", "height", "fontSize", "color"] },
      "segment-item": { ref: refItem, props: ["borderTopLeftRadius", "height", "paddingLeft", "fontSize", "fontWeight", "color"] },
      "segment-active": { ref: refActive, props: ["backgroundColor", "color", "height"] },
    };

    for (const id of V3_LABS) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        // The settled frame (reduced motion), then each step of V3_STEPS on the running clock
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(`/lab/scenes/${id}`);
        await page.locator(`[data-scene="${id}"]`).waitFor();
        const controls = await controlsOf(page, id);
        const steps = V3_STEPS[id] ?? [];
        if (steps.length) {
          await page.emulateMedia({ reducedMotion: "no-preference" });
          await page.goto(`/lab/scenes/${id}`);
          await page.getByRole("button", { name: "Recomeçar" }).click();
          for (const step of steps) {
            await expect(page.locator(`[data-scene="${id}"]`)).toHaveAttribute("data-step", step, { timeout: 20_000 });
            await page.waitForTimeout(150);
            controls.push(...(await controlsOf(page, id)));
          }
        }
        expect(controls.length, `${id} at ${width}: controls found`).toBeGreaterThan(0);
        for (const c of controls) {
          const r = REF[c.kind];
          expect(r, `${id} at ${width}: ${c.name} is a known kind of control`).toBeDefined();
          // Never below the lib's default size: the md height (40 px) and its type
          if (c.kind !== "segment-item" && c.kind !== "segment-active")
            expect(parseFloat(c.style.height), `${id} at ${width}: ${c.name} height`).toBeGreaterThanOrEqual(40 - 0.5);
          // A control painted by the scene's state (the amber-50 of the selected row or chip, the green of done) keeps
          // the lib's shape and type; only its fill and its text colour are the state's, not the appearance's
          const painted = c.state !== undefined && !["idle", "waiting"].includes(c.state);
          const props = painted ? r.props.filter((p) => p !== "backgroundColor" && p !== "color") : r.props;
          await compare(page, c.kind, c.style, r.ref, props);
        }
      }
    }
  });
});
