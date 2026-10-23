// CONTRATO DE CONTINUIDADE
// The motion contract of the site (.claude/skills/welabs-site-motion) as reusable assertions: every scene and play runs
// by itself, loops, and after any human event plays to the end, holds about a second, resets and goes back to the loop.
// The state of a block is sampled as a signature of what a visitor sees (its text, the phase and state attributes, the
// checked controls, and the opacity and transform of every element that is animating); a block that keeps the same
// signature longer than the hold is frozen.
import { expect, type Locator, type Page } from "@playwright/test";

export type Sample = { t: number; sig: string };

export type LoopOptions = {
  // How long to watch the block with no gesture, and after the gesture (default 2 cycles of 8 s)
  windowMs?: number;
  afterMs?: number;
  // Interval between two samples
  sampleMs?: number;
  // Longest run of one unchanged signature allowed with no gesture: a settled frame stays to be read (the pause of
  // the replays is 2.2 s, components/scenes/replay.ts), never longer than this
  maxIdleStillMs?: number;
  // Longest run allowed after the gesture: the hold of about 1 s plus the slack of the sampling
  maxStillMs?: number;
  // The human event (a click on this locator); without it only the idle loop is checked
  trigger?: Locator;
  // After the gesture the block must react within this time, and hold its end frame at least `minHoldMs`
  reactMs?: number;
  minHoldMs?: number;
  // A signature of your own, evaluated in the page on the block (it must not close over test variables)
  probe?: (root: Element) => unknown;
};

// Default signature: what a visitor sees, rounded so that sub-pixel noise does not count as motion
const defaultProbe = (root: Element) => {
  const round = (n: number) => Math.round(n * 10) / 10;
  const animated = new Set<Element>();
  for (const a of root.getAnimations({ subtree: true })) {
    const target = (a.effect as KeyframeEffect | null)?.target;
    if (target) animated.add(target);
  }
  return {
    text: (root as HTMLElement).innerText.replace(/\s+/g, " ").trim(),
    attrs: [...root.querySelectorAll("[data-phase],[data-state],[data-step]")].map(
      (el) =>
        `${el.getAttribute("data-phase") ?? ""}/${el.getAttribute("data-state") ?? ""}/${el.getAttribute("data-step") ?? ""}`,
    ),
    checked: [...root.querySelectorAll("input")].map((el) => el.checked),
    moving: [...animated].map((el) => {
      const cs = getComputedStyle(el);
      const matrix = cs.transform.replace(/-?\d*\.?\d+(e-?\d+)?/g, (n) =>
        String(round(Number(n))),
      );
      return `${round(Number(cs.opacity))}|${matrix}`;
    }),
  };
};

// Samples the signature of the block every `sampleMs` for `ms`
export async function sampleState(
  locator: Locator,
  ms: number,
  sampleMs = 200,
  probe: LoopOptions["probe"] = defaultProbe,
): Promise<Sample[]> {
  const out: Sample[] = [];
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    out.push({
      t: Date.now() - t0,
      sig: JSON.stringify(await locator.evaluate(probe!)),
    });
    await locator.page().waitForTimeout(sampleMs);
  }
  return out;
}

// The longest stretch, in ms, during which the signature did not change
export const longestStill = (s: Sample[]) => {
  let longest = 0;
  let from = 0;
  for (let i = 1; i < s.length; i++) {
    if (s[i].sig !== s[i - 1].sig) from = i;
    longest = Math.max(longest, s[i].t - s[from].t);
  }
  return longest;
};

// Whether the signature still changes after `fromMs` (the block went on, it did not settle for good)
const movesAfter = (s: Sample[], fromMs: number) =>
  s.some((x, i) => i > 0 && x.t >= fromMs && x.sig !== s[i - 1].sig);

// The block runs by itself and never freezes; after the trigger it reacts, plays, holds, resets and keeps looping
export async function expectContinuousLoop(
  locator: Locator,
  options: LoopOptions = {},
) {
  const {
    windowMs = 16000,
    afterMs = windowMs,
    sampleMs = 200,
    maxIdleStillMs = 3500,
    maxStillMs = 2000,
    trigger,
    reactMs = 1000,
    minHoldMs = 800,
    probe = defaultProbe,
  } = options;
  await locator.scrollIntoViewIfNeeded();

  const idle = await sampleState(locator, windowMs, sampleMs, probe);
  const distinct = new Set(idle.map((x) => x.sig)).size;
  expect(distinct, "the block runs by itself (its state changes with no gesture)").toBeGreaterThan(2);
  expect(longestStill(idle), "with no gesture the block never stays still past its settled frame").toBeLessThanOrEqual(maxIdleStillMs);
  expect(movesAfter(idle, (windowMs * 2) / 3), "with no gesture the block keeps looping to the end of the window").toBe(true);
  if (!trigger) return { idle, after: [] as Sample[] };

  const before = JSON.stringify(await locator.evaluate(probe));
  await trigger.click();
  const after = await sampleState(locator, afterMs, sampleMs, probe);
  const firstChange = after.find((x) => x.sig !== before);
  expect(firstChange, "the block reacts to the gesture").toBeDefined();
  expect(firstChange!.t, "the block reacts to the gesture at once").toBeLessThanOrEqual(reactMs);
  const still = longestStill(after);
  expect(still, "after the gesture the block holds its end frame").toBeGreaterThanOrEqual(minHoldMs);
  expect(still, "after the gesture the block resets instead of freezing").toBeLessThanOrEqual(maxStillMs);
  expect(movesAfter(after, (afterMs * 2) / 3), "after the gesture the block goes back to its loop").toBe(true);
  return { idle, after };
}

// Under reduced motion the block runs nothing and shows its final frame (some visible content)
export async function expectFinalFrameUnderReducedMotion(
  page: Page,
  locator: Locator,
) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const state = await locator.evaluate((root) => ({
    running: root
      .getAnimations({ subtree: true })
      .filter((a) => a.playState === "running").length,
    text: (root as HTMLElement).innerText.trim().length,
  }));
  expect(state.running, "reduced motion runs no animation").toBe(0);
  expect(state.text, "reduced motion shows the final frame").toBeGreaterThan(0);
}
