// O TELHADO DO DOMUS
// v2.2 (audit A07): the roof was 16 px to the left of the house (measured on 8187680 at 1440: svg 184 to 1224 against
// walls 200 to 1240, apex 704 against the axis 720), because `svg { max-width: 100% }` capped its widened box. At 1440,
// 1024 and 375, on the home and on the Domus page: the apex on the axis of the walls (at most 1 px off), the two eaves
// equal (24 px each, within 1 px), a pitch of about 18°, and the walls meeting the roof line.
import { expect, test } from "@playwright/test";

for (const width of [1440, 1024, 375])
  for (const path of ["/", "/products/domus"])
    test(`roof at ${width} on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: "load" });
      // The house of the page in view (the Domus page keeps the home mounted above it)
      const house = page
        .locator(path === "/" ? "#domus" : "#areas")
        .locator("svg")
        .first();
      await house.scrollIntoViewIfNeeded();
      const m = await house.evaluate((svg) => {
        const walls = svg.nextElementSibling!.getBoundingClientRect();
        const roof = svg.getBoundingClientRect();
        const line = svg.querySelector("path:last-of-type") as SVGPathElement;
        const apex = line.getPointAtLength(line.getTotalLength() / 2);
        const ctm = line.getScreenCTM()!;
        const apexX = apex.x * ctm.a + ctm.e;
        const apexY = apex.y * ctm.d + ctm.f;
        const start = line.getPointAtLength(0);
        const eaveX = start.x * ctm.a + ctm.e;
        const eaveY = start.y * ctm.d + ctm.f;
        return {
          apexOff:
            Math.round((apexX - (walls.left + walls.width / 2)) * 10) / 10,
          left: Math.round((walls.left - roof.left) * 10) / 10,
          right: Math.round((roof.right - walls.right) * 10) / 10,
          pitch:
            Math.round(
              ((Math.atan2(eaveY - apexY, apexX - eaveX) * 180) / Math.PI) * 10,
            ) / 10,
        };
      });
      console.log(`${width} ${path}: ${JSON.stringify(m)}`);
      expect(Math.abs(m.apexOff)).toBeLessThanOrEqual(1);
      expect(Math.abs(m.left - m.right)).toBeLessThanOrEqual(1);
      expect(Math.abs(m.left - 24)).toBeLessThanOrEqual(1);
      expect(m.pitch).toBeGreaterThanOrEqual(16);
      expect(m.pitch).toBeLessThanOrEqual(20);
    });
