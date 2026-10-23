// O DOMUS E SEUS MÓDULOS
// Pilot of @imagineapps-team/react 0.18.0 (2026-10-21), in place of e2e/roof.spec.ts (the house lost its roof).
// Acceptance, on the home (#domus) and on the Domus page (#areas):
//  - the frame is the ring of the Domus logo: outer corner = inner corner + stroke (domus-light.svg), 12 px (8 on a
//    phone), equal gutters, and every stem of the products under it leaves the straight edge on the centre of its cell;
//  - text against geometry: names centred on their icon tile (≤ 1.5 px), badges on the tile (≤ 1 px), the button on the
//    name of its floor (≤ 1 px), no name cut, the products and "Conhecer o Domus" on the axis of the ring (≤ 1 px);
//  - the badges, the screen and the fields are the lib's components (data-slot) in its welabs theme, with the site's
//    sand control border;
//  - continuity: the new module is born and goes away on its own every cycle; a click restarts it from the first frame,
//    and it plays to the end, holds, resets and keeps looping (never frozen for more than one cycle);
//  - reduced motion shows the final frame and runs nothing.
import { expect, test, type Locator, type Page } from "@playwright/test";

// v3 (F3): one loop of the new module is 6 s, its filled screen held about a second (house.module.css)
const CYCLE = 6000;

// v4 (brief-v4, 2026-10-23): the house left the home; it lives on the Domus page (#areas) only
async function open(page: Page, width: number, path = "/products/domus") {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path, { waitUntil: "load" });
  const band = page.locator(path === "/" ? "#domus" : "#areas");
  await band.scrollIntoViewIfNeeded();
  return band;
}

// The opacity of the new module, of its dashed slot and of its screen
const state = (band: Locator) =>
  band.evaluate((root) => {
    const slot = root.querySelector("li[aria-label]")!;
    const o = (el: Element) => Number(getComputedStyle(el).opacity);
    return {
      ghost: o(slot.children[0]),
      born: o(slot.children[1]),
      screen: o(slot.querySelector("[data-slot='card']")!),
    };
  });

for (const width of [1440, 1024, 390])
  for (const path of ["/products/domus"])
    test(`the Domus ring and its alignment at ${width} on ${path}`, async ({
      page,
    }) => {
      const band = await open(page, width, path);
      await page.addStyleTag({
        content: "*{animation:none!important;transition:none!important}",
      });
      const m = await band.evaluate((root) => {
        const r = (el: Element) => el.getBoundingClientRect();
        const cy = (b: DOMRect) => b.top + b.height / 2;
        const cx = (b: DOMRect) => b.left + b.width / 2;
        const text = (el: Element) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect();
        };
        const house = root.querySelector("[data-theme='welabs']")!;
        const frame = house.querySelector("ul")!.closest("div")!.parentElement!;
        const cs = getComputedStyle(frame);
        const ring = parseFloat(cs.borderTopWidth);
        const radius = parseFloat(cs.borderTopLeftRadius);
        const fr = r(frame);
        let icon = 0,
          badge = 0;
        const cut: string[] = [];
        for (const li of house.querySelectorAll("ul li:not([aria-label])")) {
          const [tile, name] = li.children;
          icon = Math.max(icon, Math.abs(cy(r(tile)) - cy(text(name))));
          if (name.scrollWidth > name.clientWidth + 0.5)
            cut.push(name.textContent!);
          const tag = li.querySelector("[data-slot='badge']");
          if (tag && getComputedStyle(tag).position !== "absolute")
            badge = Math.max(badge, Math.abs(cy(r(tag)) - cy(r(tile))));
        }
        const cards = [...house.querySelectorAll("ul > li")].map(r);
        const inner = {
          l: fr.left + ring,
          r: fr.right - ring,
          t: fr.top + ring,
          b: fr.bottom - ring,
        };
        const add = house.querySelector("label")!;
        const floorName = add.parentElement!.querySelector("p")!;
        const ground = root.querySelector("ul[aria-label]");
        const stems = ground
          ? [...ground.children].map((li) => {
              const b = r(li);
              const stem = parseFloat(getComputedStyle(li, "::before").height);
              return {
                off: Math.abs(cx(b) - cx(r(li.querySelector("a")!))),
                gap: Math.abs(b.top - stem - fr.bottom),
                straight: cx(b) > fr.left + radius && cx(b) < fr.right - radius,
              };
            })
          : [];
        const link = ground ? root.querySelector("p a") : null;
        return {
          ring,
          radius,
          gutters: [
            Math.min(...cards.map((c) => c.left)) - inner.l,
            inner.r - Math.max(...cards.map((c) => c.right)),
            r(frame.querySelector("div > div")!).top - inner.t,
            inner.b - Math.max(...cards.map((c) => c.bottom)),
          ],
          icon,
          badge,
          cut,
          add: Math.abs(cy(r(add)) - cy(text(floorName))),
          stems,
          axis: ground
            ? Math.abs(
                (cx(r(ground.children[0])) +
                  cx(r(ground.children[ground.children.length - 1]))) /
                  2 -
                  cx(fr),
              )
            : 0,
          link: link ? Math.abs(cx(r(link)) - cx(fr)) : 0,
        };
      });
      console.log(`${width} ${path}: ${JSON.stringify(m)}`);
      expect(m.ring).toBe(width < 860 ? 8 : 12);
      // The logo's rule: an inner corner that stays round (outer = inner + stroke, inner > 0)
      expect(m.radius - m.ring).toBeGreaterThan(0);
      expect(
        Math.max(...m.gutters) - Math.min(...m.gutters),
      ).toBeLessThanOrEqual(1);
      expect(m.icon).toBeLessThanOrEqual(1.5);
      expect(m.badge).toBeLessThanOrEqual(1);
      expect(m.cut).toEqual([]);
      expect(m.add).toBeLessThanOrEqual(1);
      for (const s of m.stems) {
        expect(s.off).toBeLessThanOrEqual(1);
        expect(s.gap).toBeLessThanOrEqual(1);
        expect(s.straight).toBe(true);
      }
      expect(m.axis).toBeLessThanOrEqual(1);
      expect(m.link).toBeLessThanOrEqual(1);
    });

// Welabs UI v3 (app/lib.css, 22/10): the field is the site's TextField over the lib's InputGroup, its edge the light
// line (--input = --border, #e5e5e1) at the lib's control radius (14 px); the sand border was retired
test("the badges, the screen and the fields are the lib's, in its welabs theme with the light field edge", async ({
  page,
}) => {
  const band = await open(page, 1440);
  const house = band.locator("[data-theme='welabs']");
  await expect(house.locator("[data-slot='badge']")).toHaveCount(3);
  await expect(house.locator("[data-slot='card']")).toHaveCount(1);
  const inputs = house.locator("[data-slot='input-group-control']");
  await expect(inputs).toHaveCount(3);
  expect(
    await inputs.evaluateAll((els) =>
      els.map((e) => (e as HTMLInputElement).value),
    ),
  ).toEqual(["Doca 3", "21/10/2026", "3 fotos"]);
  const look = await inputs.first().evaluate((el) => {
    // The edge and the radius are the group's (the control inside it is flush)
    const cs = getComputedStyle(el.closest("[data-slot='input-group']")!);
    return {
      border: cs.borderTopColor,
      radius: cs.borderTopLeftRadius,
      label: el.closest("[data-slot='field']")!.querySelector("label")!
        .textContent,
    };
  });
  expect(look).toEqual({
    border: "rgb(229, 229, 225)",
    radius: "14px",
    label: "Local",
  });
  // No third-party product named in the block
  expect(await house.textContent()).not.toMatch(/Omie/);
});

test("the new module loops on its own, and a click plays it to the end and goes back to the loop", async ({
  page,
}) => {
  // Two cycles in idle and two after the click, sampled every 250 ms
  test.setTimeout(4 * CYCLE + 30000);
  const band = await open(page, 1440);
  const sample = async (ms: number) => {
    const out: { t: number; born: number; screen: number }[] = [];
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const s = await state(band);
      out.push({ t: Date.now() - t0, born: s.born, screen: s.screen });
      await page.waitForTimeout(250);
    }
    return out;
  };
  // Births: the module going from hidden to shown
  const births = (s: { t: number; born: number }[]) =>
    s
      .filter((x, i) => i > 0 && s[i - 1].born < 0.5 && x.born >= 0.5)
      .map((x) => x.t);
  const idle = await sample(2 * CYCLE + 1000);
  const idleBirths = births(idle);
  console.log(`idle births at ${idleBirths.join(", ")} ms`);
  expect(idleBirths.length).toBeGreaterThanOrEqual(2);
  expect(idleBirths[1] - idleBirths[0]).toBeGreaterThan(CYCLE - 600);
  expect(idleBirths[1] - idleBirths[0]).toBeLessThan(CYCLE + 600);
  // The click lands while the module is shown: the sequence restarts from its first frame
  await expect
    .poll(async () => (await state(band)).born, { timeout: CYCLE })
    .toBeGreaterThan(0.9);
  await band.locator("label", { hasText: "Novo módulo" }).click();
  const after = await sample(2 * CYCLE + 1000);
  console.log(
    `after click: ${JSON.stringify(after.filter((_, i) => i % 4 === 0))}`,
  );
  expect(after[0].born).toBeLessThan(0.5);
  const b = births(after);
  expect(b[0]).toBeLessThan(2000);
  // It holds the screen open for at least a second, then resets and is born again on its own
  const open1 = after.filter((x) => x.t < CYCLE && x.screen > 0.9);
  expect(open1.at(-1)!.t - open1[0].t).toBeGreaterThanOrEqual(1000);
  expect(
    after.some((x) => x.t > b[0] && x.t < CYCLE + 500 && x.born < 0.1),
  ).toBe(true);
  expect(b.length).toBeGreaterThanOrEqual(2);
  expect(b[1] - b[0]).toBeLessThan(CYCLE + 600);
});

test("reduced motion shows the final frame and runs nothing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390]) {
    const band = await open(page, width);
    await page.waitForTimeout(500);
    const s = await state(band);
    expect(s.born).toBe(1);
    expect(s.ghost).toBe(0);
    // The screen covers modules on a wide grid, so the still frame keeps it closed there; on a phone it has its own row
    expect(s.screen).toBe(width < 860 ? 1 : 0);
    expect(
      await band.evaluate(
        (root) =>
          root
            .querySelector("[data-theme='welabs']")!
            .getAnimations({ subtree: true }).length,
      ),
    ).toBe(0);
  }
});
