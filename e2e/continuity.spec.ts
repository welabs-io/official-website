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

const BLOCKS: Block[] = [
  // TODO(F3): the loop and the reset are the pattern, but after a click the module holds its screen 3.2 s (measured on
  // 155fb83 at 1440, sampled every 200 ms) where the contract holds about 1 s (house.module.css, --domus-cycle)
  {
    name: "the new module of the Domus",
    path: "/",
    block: "#domus",
    trigger: '#domus label[for="area-add"]',
    knownUntil: "F3",
  },
  // TODO(F3): the message waits for a gesture and lands frozen (no loop, no reset)
  {
    name: "the message along the chain",
    path: "/",
    block: "#message",
    trigger: '#message label[for="msg-go"]',
    knownUntil: "F3",
  },
  // TODO(F3): the plays open empty and never demonstrate by themselves (autodemo, hold, reset)
  ...["domus", "relloo", "magneto", "tuner", "knowly"].map((slug) => ({
    name: `the play of the ${slug}`,
    path: `/products/${slug}`,
    block: `[data-play="${slug}"]`,
    trigger: `[data-play="${slug}"] label`,
    knownUntil: "F3",
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
