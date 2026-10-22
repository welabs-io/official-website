// LIGAÇÕES EM SVG
// v2.2 (audit A06, M12): the ties of the stage were 2 px divs of about 40 px with no curve or port (measured on 8187680).
// Every tie is now an SVG curve with a port on each end. Acceptance: on the home (cycling) and on a product page (still),
// at 1440 and 1024, every tie is a curved path, has its two ports, never enters a card (overlap of its box with a card
// at most 1 px, the port only touching the edge), and the packet runs the whole curve; the stamps of the products not
// lit read at 0.35. In the Magneto opening, the checks sit inside their blocks.
import { expect, test, type Page } from "@playwright/test";

// The stage of the page: cycling on the home, still on a product page (the home stays mounted above a product)
const hubOf = (path: string) =>
  path === "/" ? '[data-hub="cycle"]' : '[data-hub="still"]';

const measure = (page: Page, sel: string) =>
  page.evaluate((sel) => {
    const hub = document.querySelector(sel)!;
    const cards = [...hub.querySelectorAll<HTMLElement>("[data-p]")].map((el) =>
      el.getBoundingClientRect(),
    );
    return [...hub.querySelectorAll<SVGPathElement>("path[data-tie]")].map(
      (path) => {
        const box = path.getBoundingClientRect();
        // The area of the path's box inside each card, in px of the narrower side
        const inside = Math.max(
          0,
          ...cards.map((c) =>
            Math.min(
              Math.max(
                0,
                Math.min(box.right, c.right) - Math.max(box.left, c.left),
              ),
              Math.max(
                0,
                Math.min(box.bottom, c.bottom) - Math.max(box.top, c.top),
              ),
            ),
          ),
        );
        const d = path.getAttribute("d") ?? "";
        const ports = path.parentElement!.querySelectorAll("circle").length;
        return {
          curved: /C/.test(d),
          length: Math.round(path.getTotalLength()),
          inside: Math.round(inside * 10) / 10,
          ports,
        };
      },
    );
  }, sel);

for (const width of [1440, 1024])
  for (const path of ["/", "/products/relloo"])
    test(`ties at ${width} on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: "load" });
      const sel = hubOf(path);
      const hub = page.locator(sel).first();
      await hub.evaluate((n) =>
        n.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      await page.waitForTimeout(600);
      const ties = await measure(page, sel);
      console.log(`${width} ${path}: ${JSON.stringify(ties)}`);
      expect(ties).toHaveLength(5);
      for (const tie of ties) {
        expect(tie.curved).toBe(true);
        expect(tie.ports).toBe(2);
        expect(tie.inside).toBeLessThanOrEqual(1);
      }
      // The four ties to the record run at least twice the old 40 px; Tuner to Relloo spans the row gap between ports
      for (const tie of ties.slice(0, 4))
        expect(tie.length).toBeGreaterThanOrEqual(80);
      expect(ties[4].length).toBeGreaterThanOrEqual(55);
      // The stamps of the products not lit step back (the still stage of a product page). v3 (F2): by colour, the lit one
      // in ink and the others in the muted text, all at full opacity, so every stamp passes AA (at 0.35 they were 1.7:1)
      if (path !== "/") {
        const dims = await page.evaluate(
          (sel) =>
            [...document.querySelectorAll<HTMLElement>(`${sel} [data-p]`)]
              .filter((el) => el.dataset.p !== "domus")
              .map((el) => {
                const cs = getComputedStyle(el.lastElementChild!);
                return [el.dataset.p, cs.color, Number(cs.opacity)] as const;
              }),
          sel,
        );
        for (const [slug, color, opacity] of dims) {
          expect(opacity, String(slug)).toBe(1);
          expect(color, String(slug)).toBe(
            slug === "relloo" ? "rgb(28, 26, 22)" : "rgb(98, 91, 78)",
          );
        }
      }
    });

test("the checks of the Magneto flow sit inside their blocks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/magneto", { waitUntil: "load" });
  await page.waitForTimeout(3500);
  const out = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        '[data-scene="magneto-canvas"] [class*="blockDone"]',
      ),
    ].map((check) => {
      const c = check.getBoundingClientRect();
      const b = check.parentElement!.getBoundingClientRect();
      return (
        c.left >= b.left &&
        c.right <= b.right &&
        c.top >= b.top &&
        c.bottom <= b.bottom
      );
    }),
  );
  expect(out.length).toBeGreaterThan(0);
  expect(out.every(Boolean)).toBe(true);
});
