// TRILHOS QUE CONVERGEM NO FECHAMENTO
// Acceptance of the closing unit, at the three sizes: three docks on top of the strip of logos, aligned to the columns
// (1/6, 1/2 and 5/6 of the content width) with 1 px of tolerance, one dock on the button on the axis, and a closing no
// taller than 42% of the window (two titled strips). Runs with motion: under reduced motion the strip wraps into rows and grows.
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

for (const vp of VIEWPORTS)
  test(`closing at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/", { waitUntil: "load" });
    const m = await page.evaluate(() => {
      const box = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      };
      const closing = document.querySelector("#platforms")!;
      const wrap = document.querySelector("#connectors > div")!;
      // The first titled group (title and strip): the docks land on its top edge, above the title
      const strip = closing.querySelector("[role=group]")!;
      const contact = document.querySelector("#contact")!;
      const dock = getComputedStyle(contact, "::after");
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        closing: box(closing),
        wrap: box(wrap),
        strip: box(strip),
        contact: box(contact),
        docks: [...document.querySelectorAll("[data-rail=converge] b")].map(
          box,
        ),
        buttonDock: {
          top: parseFloat(dock.top),
          width: parseFloat(dock.width),
        },
      };
    });
    expect(m.docks).toHaveLength(3);
    m.docks.forEach((dock, i) => {
      const column = m.wrap.x + (m.wrap.w * (2 * i + 1)) / 6;
      expect(
        Math.abs(dock.x + dock.w / 2 - column),
        `dock ${i} x`,
      ).toBeLessThanOrEqual(1);
      // On top of the strip: the centre of the dock is the top edge of the strip
      expect(
        Math.abs(dock.y + dock.h / 2 - m.strip.y),
        `dock ${i} y`,
      ).toBeLessThanOrEqual(1);
    });
    // One dock on the button, on the axis, on its top edge
    expect(
      Math.abs(m.contact.x + m.contact.w / 2 - m.innerWidth / 2),
    ).toBeLessThanOrEqual(1);
    expect(m.buttonDock).toEqual({ top: -5, width: 10 });
    // Two titled strips (measured 0.36 to 0.41 of the window at the three sizes; was 0.28 with one untitled strip)
    expect(m.closing.h / m.innerHeight).toBeLessThanOrEqual(0.42);
  });
