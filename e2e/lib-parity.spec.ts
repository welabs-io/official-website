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
  "field|borderColor":
    "the lib's welabs preset draws the field edge in --input oklch(0.6 0 0) (4.23:1 on white), the dark line the operator rejected twice (rounds 1 and 2); the site draws the default brand's edge, the --border hairline. Below the 3:1 of WCAG 1.4.11: operator decision pending",
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
