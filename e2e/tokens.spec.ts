// UMA ESCALA DE MOVIMENTO
// v2.2 (audit M11, M09): measured on 8187680, the page eased with five curves besides --ease-out (ease, ease-out,
// cubic-bezier(.3,.6,.4,1), the spring (.3,1.3,.5,1) and an easeInOutQuad), and a pressed chip went through a grey
// in-between frame (its fill interpolated white to graphite in 160 ms). Acceptance, on the computed styles of the home
// and of a product page after playing: every element that moves eases with one of the three motion tokens (or linear),
// and a chip of a play changes its colour at once, moving only by scale.
import { expect, test } from "@playwright/test";

const TOKENS = [
  "cubic-bezier(0.2, 0.7, 0.2, 1)",
  "cubic-bezier(0.65, 0, 0.35, 1)",
  "cubic-bezier(0.34, 1.36, 0.64, 1)",
  "linear",
];

for (const path of ["/", "/products/magneto"])
  test(`one motion scale on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path, { waitUntil: "load" });
    // Scroll the whole page so every band has played
    for (let y = 0; y < 8000; y += 700) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(120);
    }
    const easings = await page.evaluate(() => {
      const out = new Map<string, string>();
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        const moves =
          cs.transitionDuration.split(",").some((d) => parseFloat(d) > 0) ||
          cs.animationName !== "none";
        if (!moves) continue;
        const list = [
          ...(cs.transitionDuration.split(",").some((d) => parseFloat(d) > 0)
            ? cs.transitionTimingFunction.split(/,(?![^(]*\))/)
            : []),
          ...(cs.animationName !== "none"
            ? cs.animationTimingFunction.split(/,(?![^(]*\))/)
            : []),
        ];
        for (const e of list)
          if (!out.has(e.trim()))
            out.set(
              e.trim(),
              `${el.tagName}.${(el.className as string).toString().slice(0, 40)}`,
            );
      }
      return [...out.entries()];
    });
    console.log(`${path}: ${easings.map(([e]) => e).join(" | ")}`);
    const loose = easings.filter(
      ([e]) => !TOKENS.includes(e) && !e.startsWith("steps("),
    );
    expect(loose).toEqual([]);
  });

// v3 (2026-10-23): the chip of the Knowly play left with the plays (the carousels replace them)
