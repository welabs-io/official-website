// CENAS QUE TOCAM DE NOVO
// v2.2 (audit A01, A02, A03, M04): a scene must move again on every cycle, not only on the first. Measured on 8187680:
// the Magneto and Tuner openings, the three outcomes of the home and the Domus opening played once and froze, because
// `start → play` kept the same animation name and a finished CSS animation does not restart. This spec samples the
// pixels of each scene through three cycles and requires changed frames inside the 2nd and the 3rd.
import { expect, test, type Locator, type Page } from "@playwright/test";

// Seconds of one cycle of each target, from lib/scenes/script.ts (settle 1.52 + hold 1.0) and replay.ts (pause 2.2)
const REPLAY_CYCLE = 2.52 + 2.2;

type Target = {
  name: string;
  path: string;
  selector: string;
  cycle: number;
};

// v3 (2026-10-23): the openings of the products are their carousels (kit scenes, whose loop is held by
// e2e/scene-kit-scenes.spec.ts), so only the outcomes of the home stay here
const TARGETS: Target[] = [
  {
    name: "home outcome",
    path: "/",
    selector: "#operation [data-replay] >> nth=0",
    cycle: REPLAY_CYCLE,
  },
];

// Animations running inside the playing scene of the element (the swap of the ring does not count: only scene content)
const running = (el: Locator) =>
  el.evaluate((root) => {
    const scenes = [
      ...(root.matches(".scn, [data-replay]") ? [root] : []),
      ...root.querySelectorAll('[data-phase="play"]'),
    ];
    return scenes
      .flatMap((s) => s.getAnimations({ subtree: true }))
      .filter((a) => a.playState === "running").length;
  });

// Samples the element until `seconds` have passed: the instants (s) at which its pixels changed, and those at which its
// playing scene had content animations running
async function changes(page: Page, el: Locator, seconds: number) {
  const moved: number[] = [];
  const live: number[] = [];
  const t0 = Date.now();
  let last = await el.screenshot();
  while ((Date.now() - t0) / 1000 < seconds) {
    const shot = await el.screenshot();
    const now = (Date.now() - t0) / 1000;
    if (!shot.equals(last)) moved.push(now);
    if ((await running(el)) > 0) live.push(now);
    last = shot;
  }
  return { moved, live };
}

test.describe("scenes play again on every cycle", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const t of TARGETS) {
    test(t.name, async ({ page }) => {
      test.setTimeout(60_000);
      await page.goto(t.path, { waitUntil: "load" });
      const el = page.locator(t.selector).first();
      await el.evaluate((n) =>
        n.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      // The runner chunk loads and the first cycle starts
      await page.waitForTimeout(300);
      const { moved, live } = await changes(page, el, t.cycle * 3 + 0.5);
      const inCycle = (list: number[], n: number) =>
        list.filter((s) => s >= t.cycle * (n - 1) && s < t.cycle * n).length;
      console.log(
        `${t.name}: cycle ${t.cycle.toFixed(2)}s, changed frames c2=${inCycle(moved, 2)} c3=${inCycle(moved, 3)}, samples with content running c2=${inCycle(live, 2)} c3=${inCycle(live, 3)}`,
      );
      for (const n of [2, 3]) {
        expect(inCycle(moved, n), `changed frames, cycle ${n}`).toBeGreaterThan(
          1,
        );
        expect(
          inCycle(live, n),
          `content animations running, cycle ${n}`,
        ).toBeGreaterThan(0);
      }
    });
  }
});
