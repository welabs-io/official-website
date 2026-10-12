// FILEIRA DE LOGOS
// Acceptance of the row unit, at the three sizes: the row is no wider than the tile, the logos are at least 14 px tall
// and do not overlap, the capsule of the core wraps Domus and Relloo and the bus runs the whole row.
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

for (const vp of VIEWPORTS)
  test.describe(`logo rows at ${vp.name}`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      contextOptions: { reducedMotion: "reduce" },
    });

    test("size, order, capsule and bus", async ({ page }) => {
      await page.goto("/", { waitUntil: "load" });
      const rows = await page.evaluate(() =>
        [...document.querySelectorAll("[data-row]")].map((row) => {
          const box = (el: Element | null) => {
            const r = el!.getBoundingClientRect();
            return { x: r.left, y: r.top, w: r.width, h: r.height };
          };
          const tile = row.parentElement!.querySelector("[data-ring]")!;
          const items = [...row.querySelectorAll("[data-slug] img")];
          const all = [...row.querySelectorAll("span")];
          return {
            mode: (row as HTMLElement).dataset.row,
            row: box(row),
            tile: box(tile),
            logos: items.map(box),
            slugs: [...row.querySelectorAll("[data-slug]")].map(
              (li) => (li as HTMLElement).dataset.slug,
            ),
            bus: box(all[0]),
            capsule: box(all[1]),
          };
        }),
      );
      // The home has one row (under the carousel of products); the chain has its own overview (chain-blocks.spec.ts)
      expect(rows).toHaveLength(1);
      for (const r of rows) {
        expect(r.slugs).toEqual([
          "domus",
          "relloo",
          "magneto",
          "tuner",
          "knowly",
        ]);
        // No wider than the tile, and centred under it
        expect(r.row.w).toBeLessThanOrEqual(r.tile.w + 1);
        expect(
          Math.abs(r.row.x + r.row.w / 2 - (r.tile.x + r.tile.w / 2)),
        ).toBeLessThan(1.5);
        // Logos: at least 14 px tall, inside the row, in order and without overlapping
        for (const [i, logo] of r.logos.entries()) {
          expect(logo.h).toBeGreaterThanOrEqual(14);
          expect(logo.x).toBeGreaterThanOrEqual(r.row.x - 1);
          expect(logo.x + logo.w).toBeLessThanOrEqual(r.row.x + r.row.w + 1);
          if (i > 0) {
            const prev = r.logos[i - 1];
            expect(logo.x).toBeGreaterThanOrEqual(prev.x + prev.w - 0.5);
          }
        }
        // The bus runs the whole row; the capsule wraps the first two logos
        expect(r.bus.w).toBeGreaterThanOrEqual(r.row.w - 1);
        expect(r.capsule.x).toBeLessThanOrEqual(r.logos[0].x);
        expect(r.capsule.x + r.capsule.w).toBeGreaterThanOrEqual(
          r.logos[1].x + r.logos[1].w,
        );
        expect(r.capsule.x + r.capsule.w).toBeLessThanOrEqual(r.logos[2].x);
        // The capsule is centred on the two left columns (20% of the row)
        expect(
          Math.abs(r.capsule.x + r.capsule.w / 2 - (r.row.x + r.row.w * 0.2)),
        ).toBeLessThan(1.5);
      }
    });
  });
