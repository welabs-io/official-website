// CONTINUIDADE DOS BLOCOS QUE SE MOVEM
// The motion contract (.claude/skills/welabs-site-motion) measured on the blocks that move: with no gesture they run and
// loop, a click plays to the end, holds about a second, resets and goes back to the loop, and reduced motion shows the
// final frame. The blocks still outside the contract are a closed list of known failures (`test.fail`, which fails if
// the block already passes), each with the phase of the v3 plan that brings it in; turn it into `test` when it lands.
import { test } from "@playwright/test";
import {
  expectContinuousLoop,
  expectFinalFrameUnderReducedMotion,
} from "./helpers/continuity";

type Block = {
  name: string;
  path: string;
  block: string;
  trigger: string;
  // The phase that brings the block into the contract; absent when it already holds
  knownUntil?: string;
};

// v3 (F3): every block holds the contract; the list of known failures is empty
const BLOCKS: Block[] = [
  // The 6 s loop of the new module, its filled screen held 1.2 s (it held 3.2 s on 155fb83)
  {
    name: "the new module of the Domus",
    // v4 (2026-10-23): the house left the home; it lives on the Domus page
    path: "/products/domus",
    block: "#areas",
    trigger: '#areas label[for="area-add-page"]',
  },
  // v3 (2026-10-23): the message of the home and the plays of the products left; the kit scenes that replace them hold
  // the same contract on their pages (e2e/scene-kit-scenes.spec.ts, "scene kit on the site")
];

for (const b of BLOCKS) {
  const run = b.knownUntil ? test.fail : test;
  run(
    `${b.name} runs, loops and comes back after a click${b.knownUntil ? ` (known failure until ${b.knownUntil})` : ""}`,
    async ({ page }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(b.path, { waitUntil: "load" });
      await expectContinuousLoop(page.locator(b.block).first(), {
        trigger: page.locator(b.trigger).first(),
      });
    },
  );
}

for (const b of BLOCKS)
  test(`${b.name} shows its final frame under reduced motion`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(b.path, { waitUntil: "load" });
    await expectFinalFrameUnderReducedMotion(
      page,
      page.locator(b.block).first(),
    );
  });
