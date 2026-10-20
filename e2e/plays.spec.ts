// INTERAÇÕES RICAS DOS PRODUTOS
// v2.2 (audit A05, section 4): acceptance of the five plays, by the criteria of the audit. Measured on 8187680 / 5fc85df:
// each play was a one-click toggle that rested in about 300 ms. Now, for every product:
//  - at least 3 distinct states the visitor reaches (distinct resting pixels);
//  - at least 1 choice whose consequence differs (a specific element of one branch and not of the other);
//  - a visible effect on the record of the Domus;
//  - from the click to rest, 2 to 6 s, with no still stretch above 1.5 s while it runs (the stall meter of the audit:
//    pixels of the play sampled continuously).
import { expect, test, type Locator, type Page } from "@playwright/test";

type Step = {
  // The control to press (its label is clicked)
  id: string;
  // Not measured: a control set before the measured step
  setup?: boolean;
  // Text that must be visible at rest after this step (the consequence of the choice)
  shows?: string;
};

const PATHS: Record<string, Step[]> = {
  domus: [
    { id: "dp-photo", shows: "Campo Foto no cadastro" },
    { id: "dp-status", shows: "Concluída" },
    { id: "dp-row", shows: "Trocas: 4 registros" },
    { id: "dp-approval", shows: "Aprovação de troca" },
  ],
  relloo: [
    { id: "rl-call", shows: "Respondido no prazo" },
    { id: "rl-site", shows: "Troca de canal" },
    { id: "rl-message", shows: "Passado para a equipe com a conversa" },
  ],
  // A refusal ends the run (the order goes back to be adjusted); another value starts it over, decision cleared
  magneto: [
    { id: "mg-high", shows: "Esperando decisão" },
    { id: "mg-no", shows: "Ajustar pedido" },
    { id: "mg-low", shows: "Não precisa" },
    { id: "mg-high", shows: "Esperando decisão" },
    { id: "mg-ok", shows: "Situação: aprovado e atualizado" },
  ],
  tuner: [
    { id: "tn-1", shows: "Equipe de pedidos assumiu a ligação" },
    { id: "tn-2", shows: "Passou com o contexto do pedido 1234" },
    { id: "tn-3", shows: "Atendimento assumiu a ligação" },
  ],
  knowly: [
    { id: "kn-ship", shows: "Prazo: sábado, até 12h" },
    { id: "kn-goals", shows: "Fora do seu acesso." },
    { id: "kn-finance", shows: "O plano de lojas está fora do seu acesso." },
    { id: "kn-board", shows: "Abrir duas lojas novas." },
  ],
};

// The failure of the Magneto, on a fresh page: switched on first, then the value
const FAILURE: Step[] = [
  { id: "mg-fail", setup: true },
  { id: "mg-low", shows: "Feito na 2ª tentativa" },
];

async function openPlay(page: Page, slug: string) {
  await page.goto(`/products/${slug}`, { waitUntil: "load" });
  const play = page.locator(`[data-play="${slug}"]`).first();
  await play.evaluate((n) =>
    n.scrollIntoView({ block: "start", behavior: "instant" }),
  );
  // The chunk of the plays (play-run.ts) lands after hydration
  await page.waitForTimeout(500);
  return play;
}

// Animations of the play still to run or running (a delay counts: the chain is not at rest yet)
const pending = (play: Locator) =>
  play.evaluate(
    (el) =>
      el
        .getAnimations({ subtree: true })
        .filter((a) => a.playState === "running").length,
  );

// Presses a control and follows the play until it rests: seconds to rest, the longest still stretch and the frame
async function press(page: Page, play: Locator, id: string) {
  const changes: number[] = [];
  let last = await play.screenshot();
  const t0 = Date.now();
  await page.locator(`label[for="${id}"]`).first().click();
  let rest = 0;
  while ((Date.now() - t0) / 1000 < 8) {
    const shot = await play.screenshot();
    const now = (Date.now() - t0) / 1000;
    if (!shot.equals(last)) changes.push(now);
    last = shot;
    if ((await pending(play)) === 0) {
      rest = now;
      break;
    }
  }
  const marks = [0, ...changes, rest];
  const still = Math.max(...marks.slice(1).map((t, i) => t - marks[i]));
  return { rest, still, frame: last.toString("base64") };
}

test.describe("rich plays", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const [slug, steps] of Object.entries(PATHS)) {
    test(slug, async ({ page }) => {
      test.setTimeout(90_000);
      const play = await openPlay(page, slug);
      const frames = new Set<string>();
      const rests: Record<string, number> = {};
      let domus = 0;
      for (const step of steps) {
        const { rest, still, frame } = await press(page, play, step.id);
        rests[step.id] = rest;
        frames.add(frame);
        console.log(
          `${slug} ${step.id}: rest ${rest.toFixed(2)} s, longest still ${still.toFixed(2)} s`,
        );
        expect(rest, `${step.id} rests in 2 to 6 s`).toBeGreaterThanOrEqual(2);
        expect(rest, `${step.id} rests in 2 to 6 s`).toBeLessThanOrEqual(6);
        expect(
          still,
          `${step.id} never stands still over 1.5 s`,
        ).toBeLessThanOrEqual(1.5);
        if (step.shows)
          await expect(
            play.getByText(step.shows).filter({ visible: true }).first(),
          ).toBeVisible();
        if (await play.locator("[data-domus-effect]:visible").count()) domus++;
      }
      console.log(`${slug}: ${frames.size} distinct resting states`);
      expect(frames.size).toBeGreaterThanOrEqual(3);
      // The effect lands on the record of the Domus (on the steps whose subject is an order or a record)
      console.log(
        `${slug}: Domus record written on ${domus} of ${steps.length} steps`,
      );
      expect(domus).toBeGreaterThan(0);
      if (slug === "tuner")
        // The busy team holds the call: the consequence of option 2 takes longer than the free team of option 1
        expect(rests["tn-2"]).toBeGreaterThan(rests["tn-1"] + 1);
    });
  }

  test("magneto: a failure is retried and recovers", async ({ page }) => {
    test.setTimeout(60_000);
    const play = await openPlay(page, "magneto");
    for (const step of FAILURE) {
      if (step.setup) {
        await page.locator(`label[for="${step.id}"]`).click();
        continue;
      }
      const { rest, still } = await press(page, play, step.id);
      console.log(
        `magneto failure ${step.id}: rest ${rest.toFixed(2)} s, longest still ${still.toFixed(2)} s`,
      );
      expect(rest).toBeGreaterThanOrEqual(2);
      expect(rest).toBeLessThanOrEqual(6);
      expect(still).toBeLessThanOrEqual(1.5);
      await expect(
        play.getByText(step.shows!).filter({ visible: true }).first(),
      ).toBeVisible();
    }
  });

  test("relloo: the conversation keeps the order the channels were fired in", async ({
    page,
  }) => {
    const play = await openPlay(page, "relloo");
    for (const id of ["rl-site", "rl-call", "rl-message"])
      await page.locator(`label[for="${id}"]`).click();
    const order = await play
      .locator("[data-thread] [data-channel]")
      .evaluateAll((els) =>
        els
          .sort(
            (a, b) =>
              a.getBoundingClientRect().top - b.getBoundingClientRect().top,
          )
          .map((el) => (el as HTMLElement).dataset.channel),
      );
    expect(order).toEqual(["site", "call", "message"]);
  });

  test("reset puts every play back on its idle frame", async ({ page }) => {
    const play = await openPlay(page, "magneto");
    await page.locator('label[for="mg-high"]').click();
    await play.getByRole("button", { name: "Recomeçar" }).click();
    await expect(page.locator("#mg-high")).not.toBeChecked();
    await expect(play.getByText("Nada ainda.")).toBeVisible();
  });
});

test.describe("plays on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  for (const slug of Object.keys(PATHS))
    test(`${slug} fits the width`, async ({ page }) => {
      const play = await openPlay(page, slug);
      for (const step of PATHS[slug]) {
        await page.locator(`label[for="${step.id}"]`).first().click();
        // The next control may be one this step brings (the decision of the Magneto)
        await page.waitForTimeout(1200);
      }
      await page.waitForTimeout(3000);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      const box = await play.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    });
});
