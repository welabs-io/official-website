// SELETOR DE IDIOMA: SEM DESLOCAMENTO, BORDA E EFEITO DO PADRÃO
// The selector of the header opens a panel over the page. Three things are pinned here: opening and closing it moves
// nothing (the modal menu of the lib locks the scroll and drops the scrollbar, which shifted the header by the width of
// the bar); the edge of its button and of its panel are the site's (the page's focus ring used to wrap the panel in a
// thick grey double border); and the panel enters and leaves with the motion of the products list of the header
// (opacity and a short rise in 280 ms), its rows filling like the rows of that list.
import { expect, test, type Page } from "@playwright/test";

// A real scrollbar (the headless shell hides it by default), or the shift of a locked scroll is not measurable
test.use({
  launchOptions: {
    executablePath: process.env.PW_CHROMIUM_PATH,
    ignoreDefaultArgs: ["--hide-scrollbars"],
  },
});

const SIZES = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

const trigger = (page: Page) => page.locator("header [data-locale-trigger]");
const panel = (page: Page) =>
  page.locator('[data-slot="dropdown-menu-content"]');

// What the header is made of, as boxes and as the width the page has with its scrollbar
const geometry = (page: Page) =>
  page.evaluate(() => {
    const box = (el: Element | null) => {
      const b = el?.getBoundingClientRect();
      return b ? [b.x, b.y, b.width, b.height] : null;
    };
    return {
      clientWidth: document.documentElement.clientWidth,
      header: box(document.querySelector("header")),
      brand: box(document.querySelector("header img")),
      trigger: box(document.querySelector("header [data-locale-trigger]")),
      title: box(document.querySelector("main h1")),
    };
  });

// The opacity of the panel a few times along its entry or exit
const opacityRun = (page: Page) =>
  page.evaluate(async () => {
    const out: number[] = [];
    for (let i = 0; i < 8; i++) {
      const el = document.querySelector('[data-slot="dropdown-menu-content"]');
      if (el) out.push(Number(getComputedStyle(el).opacity));
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    return out;
  });

// A CSS colour as the browser resolves it, so a token and a computed colour compare as the same string
const resolve = (page: Page, color: string) =>
  page.evaluate((value) => {
    const probe = document.createElement("i");
    probe.style.color = value;
    document.body.appendChild(probe);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return out;
  }, color);

for (const size of SIZES) {
  test.describe(`selector at ${size.name}`, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    test("opening and closing the panel moves nothing in the header", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "load" });
      await page.waitForTimeout(800);
      const before = await geometry(page);
      // The page has a scrollbar, or the measure proves nothing
      expect(before.clientWidth).toBeLessThan(size.width);

      await trigger(page).click();
      await expect(panel(page)).toBeVisible();
      await page.waitForTimeout(450);
      expect(await geometry(page)).toEqual(before);

      await page.keyboard.press("Escape");
      await expect(panel(page)).toHaveCount(0);
      await page.waitForTimeout(450);
      expect(await geometry(page)).toEqual(before);
    });

    test("the edge of the button and of the panel is the site's", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "load" });
      await page.waitForTimeout(800);
      // The button is the lib's outline button, the one of the call of the hero: the same edge
      const edge = (selector: string) =>
        page.evaluate((sel) => {
          const s = getComputedStyle(document.querySelector(sel) as Element);
          return `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`;
        }, selector);
      const standard = await edge(
        'main a[data-slot="button"][data-appearance="outline"]',
      );
      expect(await edge("header [data-locale-trigger]")).toBe(standard);

      // The panel: the site's light line (--border) in one pixel, the lib's shadow, no grey ring
      await trigger(page).click();
      await expect(panel(page)).toBeVisible();
      await page.waitForTimeout(450);
      const line = await resolve(page, "var(--border)");
      const shadow = await panel(page).evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(shadow.startsWith(`${line} 0px 0px 0px 1px`), shadow).toBe(true);
      expect(shadow).not.toContain("155, 159, 165");
    });

    test("the panel enters and leaves with the motion of the products list", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "load" });
      await page.waitForTimeout(800);
      // The products list of the header opens in --dur-2 on --ease-out (280 ms), opacity and a rise
      const list = await page.evaluate(() => {
        const probe = document.createElement("i");
        probe.style.transitionDuration = "var(--dur-2)";
        probe.style.transitionTimingFunction = "var(--ease-out)";
        document.body.appendChild(probe);
        const s = getComputedStyle(probe);
        const out = {
          duration: s.transitionDuration,
          timing: s.transitionTimingFunction,
        };
        probe.remove();
        return out;
      });
      expect(list.duration).toBe("0.28s");

      await trigger(page).click();
      const entry = await opacityRun(page);
      // It fades in: a value strictly between hidden and shown, ending shown
      expect(entry.some((v) => v > 0 && v < 1)).toBe(true);
      await page.waitForTimeout(200);
      expect(await opacityRun(page)).toContain(1);
      const motion = await panel(page).evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          name: s.animationName,
          duration: s.animationDuration,
          timing: s.animationTimingFunction,
        };
      });
      expect(motion.name).toBe("enter");
      expect(motion.duration).toBe(list.duration);
      expect(motion.timing).toBe(list.timing);

      // It fades out, with the same duration, instead of vanishing
      await page.keyboard.press("Escape");
      const exit = await opacityRun(page);
      expect(exit.some((v) => v > 0 && v < 1)).toBe(true);
    });

    test("a row of the panel fills like a row of the products list, and keeps the language switch", async ({
      page,
    }) => {
      await page.goto("/products/knowly", { waitUntil: "load" });
      await page.waitForTimeout(800);
      await trigger(page).click();
      const row = page.getByRole("menuitemradio", { name: "English" });
      await row.hover();
      await page.waitForTimeout(450);
      const accent = await resolve(page, "var(--surface-accent)");
      const style = await row.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          bg: s.backgroundColor,
          duration: s.transitionDuration,
        };
      });
      expect(style.bg).toBe(accent);
      expect(style.duration).toBe("0.16s");
      // The selector still switches the language and keeps the route
      await row.click();
      await page.waitForURL("**/en/products/knowly");
    });
  });
}
