// TESTES DAS CENAS DE CAPACIDADE
// The capability scenes of the product openings follow the rules of every native scene: each one renders on the server
// in its settled frame, uses every action of its script and only those, marks exactly one key element, draws no image
// but the logo of its bar, no video and no live region, and keeps its words inside the copy rules. Their script has the
// shared pace (actions after the swap, the last one ending at `settle`, 2.3 to 2.8 s per scene, a hold of 0.8 to 1.0 s)
// and every opening is still most of the time. The page names each scene; the promises the code does not sustain left
// with the v2 of the content (no campaign, no process written as a sentence, no chat of the site in the Tuner).
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCT_PAGE } from "@/lib/content";
import { copyViolation } from "@/lib/content/rules";
import { PRODUCTS } from "@/lib/products";
import {
  CAPABILITY_SCRIPT,
  CAPABILITY_STORY,
  capabilityScenes,
  type CapabilityScript,
} from "@/lib/scenes/capabilities";
import {
  HOLD_SECONDS_RANGE,
  SCENE_SECONDS_RANGE,
  STILL_TARGET,
  SWAP_SECONDS,
  motionSeconds,
  sceneSeconds,
  stillRatio,
} from "@/lib/scenes/script";
import { CapabilityBody } from "./CapabilityBody";
import { CapabilityStage } from "./SceneStage";

const ALL: CapabilityScript[] = PRODUCTS.flatMap(
  ({ slug }) => CAPABILITY_SCRIPT[slug],
);
const cases = ALL.map((scene) => [scene.id, scene] as const);
const html = (scene: CapabilityScript) =>
  renderToStaticMarkup(<CapabilityBody scene={scene} />);

describe("capability script", () => {
  it("every scene belongs to its product, is named by its page, and the ids are unique", () => {
    for (const { slug } of PRODUCTS) {
      for (const scene of CAPABILITY_SCRIPT[slug])
        expect(scene.product).toBe(slug);
      expect(capabilityScenes(slug).map((s) => s.id)).toEqual(
        PRODUCT_PAGE[slug].scenes.map((s) => s.id),
      );
    }
    expect(new Set(ALL.map((s) => s.id)).size).toBe(ALL.length);
    // Every scene of the script is played by its page: no scene is left behind
    expect(ALL).toHaveLength(
      PRODUCTS.reduce((n, p) => n + PRODUCT_PAGE[p.slug].scenes.length, 0),
    );
  });

  it("the Domus opens with its areas, every other product with at least one scene", () => {
    expect(CAPABILITY_SCRIPT.domus).toHaveLength(0);
    for (const { slug } of PRODUCTS.filter((p) => p.slug !== "domus"))
      expect(capabilityScenes(slug).length).toBeGreaterThan(0);
  });

  it.each(cases)(
    "%s: actions start after the swap, end at settle, and the scene keeps the shared pace",
    (_, scene) => {
      expect(new Set(scene.actions.map((a) => a.id)).size).toBe(
        scene.actions.length,
      );
      for (const a of scene.actions) {
        expect(a.at).toBeGreaterThanOrEqual(SWAP_SECONDS);
        expect(a.dur).toBeGreaterThan(0);
      }
      const ends = scene.actions.map((a) => a.at + a.dur);
      expect(Math.max(...ends)).toBeCloseTo(scene.settle, 3);
      expect(sceneSeconds(scene)).toBeGreaterThanOrEqual(
        SCENE_SECONDS_RANGE[0],
      );
      expect(sceneSeconds(scene)).toBeLessThanOrEqual(SCENE_SECONDS_RANGE[1]);
      expect(scene.hold).toBeGreaterThanOrEqual(HOLD_SECONDS_RANGE[0]);
      expect(scene.hold).toBeLessThanOrEqual(HOLD_SECONDS_RANGE[1]);
      expect(
        1 - motionSeconds(scene) / sceneSeconds(scene),
      ).toBeGreaterThanOrEqual(STILL_TARGET);
    },
  );

  it.each(PRODUCTS.filter((p) => p.slug !== "domus").map((p) => p.slug))(
    `the opening of %s is still at least ${STILL_TARGET * 100}% of its cycle`,
    (slug) => {
      expect(stillRatio(capabilityScenes(slug))).toBeGreaterThanOrEqual(
        STILL_TARGET,
      );
    },
  );
});

describe("capability scenes", () => {
  it.each(cases)(
    "%s uses every action of its script and only those, in the settled phase, with one key element",
    (_, scene) => {
      const markup = html(scene);
      expect(markup).toContain('data-phase="end"');
      for (const action of scene.actions)
        expect(markup, action.id).toContain(`data-act="${action.id}"`);
      const used = new Set(
        [...markup.matchAll(/data-act="([a-z]+)"/g)].map((m) => m[1]),
      );
      for (const id of used)
        expect(scene.actions.map((a) => a.id)).toContain(id);
      expect(markup.match(/data-key=""/g)).toHaveLength(1);
      expect(markup).not.toMatch(/✓/);
    },
  );

  it.each(cases)(
    "%s draws no image but the logo of its bar, no video and no live region",
    (_, scene) => {
      const markup = html(scene);
      expect(markup).not.toMatch(/<video|<canvas|aria-live/);
      const withoutBars = markup.replace(
        /<div class="[^"]*" data-frame-bar="">.*?<\/b>/g,
        "",
      );
      expect(withoutBars).not.toMatch(/<img/);
    },
  );

  it("a capability scene asking for an action the script does not have fails loudly", () => {
    const scene = { ...ALL[0], actions: [] };
    expect(() =>
      renderToStaticMarkup(<CapabilityBody scene={scene} />),
    ).toThrow(/no action/);
  });

  it("every string of the capability scenes respects the copy rules and none promises what the code lacks", () => {
    const strings: string[] = [];
    const walk = (value: unknown) => {
      if (typeof value === "string") strings.push(value);
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object")
        Object.values(value).forEach(walk);
    };
    walk(CAPABILITY_STORY);
    expect(strings.length).toBeGreaterThan(80);
    for (const s of strings) expect(copyViolation(s), s).toBeNull();
    const all = strings.join(" ");
    expect(all).not.toMatch(/cupom|cashback|funil|Descreva o processo|Voltar à versão|Baixa automática/i);
  });
});

describe("capability stage", () => {
  const stage = renderToStaticMarkup(
    <CapabilityStage id="product-scenes" label="Telas" slug="knowly" />,
  );
  const scenes = capabilityScenes("knowly");
  const names = PRODUCT_PAGE.knowly.scenes.map((s) => s.name);
  it("has one tile per scene, the first at the centre, each named by the short name of its page", () => {
    expect(stage).toMatch(
      new RegExp(`data-pos="0"[^>]*data-tile="${scenes[0].id}"`),
    );
    expect(stage).toMatch(
      new RegExp(`data-pos="1"[^>]*data-tile="${scenes[1].id}"`),
    );
    expect(stage).toMatch(
      new RegExp(`data-pos="-1"[^>]*data-tile="${scenes[2].id}"`),
    );
    expect(stage).toContain(`aria-label="${names[0]}"`);
    for (const name of names) expect(stage).toContain(`>${name}</li>`);
  });
  it("writes the durations for the runner, no caption, no live region", () => {
    expect(stage).not.toMatch(/aria-live|data-caption/);
    const json = stage.match(
      /<script type="application\/json" data-scene-data(?:="[^"]*")?>([^<]*)<\/script>/,
    )![1];
    const data = JSON.parse(json.replace(/&quot;/g, '"')) as {
      scenes: number[];
      captions?: string[];
    };
    expect(data.scenes).toEqual(scenes.map(sceneSeconds));
    expect(data.captions).toBeUndefined();
  });
  it("a stage of one scene shows no list of names", () => {
    const one = renderToStaticMarkup(
      <CapabilityStage id="product-scenes" label="Telas" slug="tuner" />,
    );
    expect(one.match(/data-tile="/g)).toHaveLength(1);
    expect(one).not.toContain("data-cap=");
  });
});
