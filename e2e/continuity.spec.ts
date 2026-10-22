// CONTINUIDADE DAS CENAS E DOS PLAYS
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
    path: "/",
    block: "#domus",
    trigger: '#domus label[for="area-add"]',
  },
  // The message sends itself, lands, holds and starts again (components/plays/play-demo.ts)
  {
    name: "the message along the chain",
    path: "/",
    block: "#message",
    trigger: '#message label[for="msg-go"]',
  },
  // The plays demonstrate themselves, and a choice of the visitor plays, holds and gives the demo back
  ...["domus", "relloo", "magneto", "tuner", "knowly"].map((slug) => ({
    name: `the play of the ${slug}`,
    path: `/products/${slug}`,
    block: `[data-play="${slug}"]`,
    trigger: `[data-play="${slug}"] label`,
  })),
];

for (const b of BLOCKS) {
  const run = b.knownUntil ? test.fail : test;
  run(`${b.name} runs, loops and comes back after a click${b.knownUntil ? ` (known failure until ${b.knownUntil})` : ""}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(b.path, { waitUntil: "load" });
    await expectContinuousLoop(page.locator(b.block).first(), {
      trigger: page.locator(b.trigger).first(),
    });
  });
}

for (const b of BLOCKS)
  test(`${b.name} shows its final frame under reduced motion`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(b.path, { waitUntil: "load" });
    await expectFinalFrameUnderReducedMotion(page, page.locator(b.block).first());
  });
