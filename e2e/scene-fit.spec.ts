// CENAS QUE CABEM E LOGOS NA LINHA DO TEXTO (V3, REVISÃO DA F2)
// Measured on the six routes at 1440 × 900 and 390 × 844, with the scenes settled and every tile of a stage brought to
// the front in turn:
// - F2-02: no text inside a scene is cut (an ellipsis or a hidden overflow with more text than room);
// - F2-03: a scene window keeps at most 24 px of empty strip under its content;
// - F2-01: the ink of every logo of the stage starts within 1 px of the first letter of its text, the ink measured from
//   the SVG file itself (so a new brand version that moves the ink fails here).
import { expect, test, type Page } from "@playwright/test";

const PATHS = [
  "/",
  "/products/domus",
  "/products/relloo",
  "/products/magneto",
  "/products/tuner",
  "/products/knowly",
];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

// Cut texts and empty strips of every scene, minis and stage tiles
const scanScenes = (page: Page) =>
  page.evaluate(() => {
    const cuts: string[] = [];
    const empty: { where: string; px: number }[] = [];
    const scan = (root: Element, label: string) => {
      for (const el of root.querySelectorAll<HTMLElement>("*")) {
        if (!el.textContent?.trim() || el.children.length > 3) continue;
        if (!el.getBoundingClientRect().width) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (
          el.scrollWidth > el.clientWidth + 1 &&
          (cs.textOverflow === "ellipsis" || cs.overflowX === "hidden")
        )
          cuts.push(`${label}: "${el.textContent.trim().slice(0, 30)}" ${el.scrollWidth}>${el.clientWidth}`);
      }
      // The body of each window, down to the lowest thing it paints: a text, a picture, a field, an edge or a fill (a
      // pane that spans the whole body is the body itself and does not count)
      for (const win of root.querySelectorAll("[data-product][data-edge]")) {
        const body = win.querySelector("[data-body]");
        const b = body?.getBoundingClientRect();
        if (!body || !b?.height) continue;
        let low = b.top;
        for (const el of body.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.05) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1 || r.height >= b.height * 0.9) continue;
          const paints =
            el.matches("img, svg, input") ||
            [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()) ||
            cs.borderBottomWidth !== "0px" ||
            cs.backgroundColor !== "rgba(0, 0, 0, 0)";
          if (paints && r.bottom <= b.bottom + 1) low = Math.max(low, r.bottom);
        }
        empty.push({ where: label, px: b.bottom - low });
      }
    };
    document.querySelectorAll("[data-mini]").forEach((d) => scan(d, `mini ${d.getAttribute("data-mini")}`));
    const tiles = [...document.querySelectorAll<HTMLElement>("[data-descent-slot] [data-tile]")];
    tiles.forEach((tile, i) => {
      tiles.forEach((t, k) => (t.dataset.pos = String(k === i ? 0 : k > i ? 1 : -1)));
      scan(tile, `tile ${tile.dataset.tile}`);
    });
    return { cuts, empty };
  });

// The first letter of each text under a stage logo, against the start of the logo's ink (from its file)
const logoOffsets = (page: Page) =>
  page.evaluate(async () => {
    const inkOf = new Map<string, { inkX: number; vbH: number }>();
    const ink = async (src: string) => {
      if (inkOf.has(src)) return inkOf.get(src)!;
      const holder = document.createElement("div");
      holder.style.cssText = "position:absolute;left:-9999px;top:0;width:1000px";
      holder.innerHTML = await (await fetch(src)).text();
      document.body.append(holder);
      const svg = holder.querySelector("svg")!;
      const vb = svg.viewBox.baseVal;
      let x0 = Infinity;
      for (const el of svg.querySelectorAll<SVGGraphicsElement>("path,rect,circle,ellipse,polygon,line,polyline")) {
        const bb = el.getBBox();
        const rel = svg.getCTM()!.inverse().multiply(el.getCTM()!);
        for (const [x, y] of [
          [bb.x, bb.y],
          [bb.x, bb.y + bb.height],
          [bb.x + bb.width, bb.y],
          [bb.x + bb.width, bb.y + bb.height],
        ])
          x0 = Math.min(x0, new DOMPoint(x, y).matrixTransform(rel).x);
      }
      holder.remove();
      const k = { inkX: (x0 - vb.x) / vb.height, vbH: vb.height };
      inkOf.set(src, k);
      return k;
    };
    const firstGlyph = (text: Element) => {
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      let n = walker.nextNode();
      while (n && !n.textContent?.trim()) n = walker.nextNode();
      if (!n) return null;
      const at = n.textContent!.search(/\S/);
      const range = document.createRange();
      range.setStart(n, at);
      range.setEnd(n, at + 1);
      return range.getBoundingClientRect().left;
    };
    const out: { what: string; dx: number }[] = [];
    for (const hub of document.querySelectorAll<HTMLElement>("[data-hub]")) {
      if (!hub.getBoundingClientRect().width) continue;
      const pairs: [string, HTMLImageElement, Element][] = [];
      for (const node of hub.querySelectorAll<HTMLElement>("[data-p]")) {
        const img = node.querySelector<HTMLImageElement>(":scope > img");
        const next = img?.nextElementSibling;
        if (img && next) pairs.push([node.dataset.p!, img, next]);
      }
      for (const line of hub.querySelectorAll<HTMLElement>("[data-of]")) {
        const img = line.querySelector<HTMLImageElement>(":scope > img");
        if (img) pairs.push([`line ${line.dataset.of}`, img, line]);
      }
      for (const [what, img, text] of pairs) {
        const b = img.getBoundingClientRect();
        const glyph = firstGlyph(text);
        if (!b.width || glyph === null) continue;
        const k = await ink(new URL(img.currentSrc || img.src).pathname);
        out.push({ what, dx: glyph - (b.left + b.height * k.inkX) });
      }
    }
    return out;
  });

for (const viewport of VIEWPORTS)
  test.describe(`scenes and stage at ${viewport.width}`, () => {
    test.use({ viewport, contextOptions: { reducedMotion: "reduce" } });

    for (const route of PATHS)
      test(`${route}: no scene text is cut and no window keeps an empty strip`, async ({ page }) => {
        await page.goto(route, { waitUntil: "load" });
        const { cuts, empty } = await scanScenes(page);
        expect(cuts).toEqual([]);
        expect(empty.length).toBeGreaterThan(0);
        for (const e of empty) expect(e.px, e.where).toBeLessThanOrEqual(24);
      });

    for (const route of ["/", "/products/relloo"])
      test(`${route}: the stage logos start on the edge of their text`, async ({ page }) => {
        await page.goto(route, { waitUntil: "load" });
        await page.waitForTimeout(300);
        const offsets = await logoOffsets(page);
        expect(offsets.length).toBeGreaterThanOrEqual(8);
        for (const o of offsets) expect(Math.abs(o.dx), o.what).toBeLessThanOrEqual(1);
      });
  });
