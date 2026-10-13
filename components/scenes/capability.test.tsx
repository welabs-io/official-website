// TESTES DAS CENAS DE CAPACIDADE
// The fifteen capability scenes of the product pages follow the rules of the chain: each one renders on the server in
// its settled frame, uses every action of its script and only those, marks exactly one key element, draws no image but
// the logo of its bar, no video and no live region, and keeps its words inside the copy rules. Their script has the
// pace of the chain (actions after the swap, the last one ending at `settle`, 4.5 to 5.5 s per scene, a hold of 1.2 to
// 1.8 s) and the opening of every product is still most of the time. Each scene shows a capability the content already
// lists, named by its sentence.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCT_CONTENT } from "@/lib/content";
import { copyViolation } from "@/lib/content/rules";
import { PRODUCTS } from "@/lib/products";
import {
  CAPABILITY_SCRIPT,
  CAPABILITY_STORY,
  capabilityOf,
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
import {
  HOME_PRODUCT_SCENE,
  homeProductScenes,
} from "@/lib/scenes/home-products";
import { CapabilityBody } from "./CapabilityBody";
import { CapabilityStage, ProductsStage } from "./SceneStage";

const ALL: CapabilityScript[] = PRODUCTS.flatMap(
  ({ slug }) => CAPABILITY_SCRIPT[slug],
);
const cases = ALL.map((scene) => [scene.id, scene] as const);
const html = (scene: CapabilityScript) =>
  renderToStaticMarkup(<CapabilityBody scene={scene} />);

describe("capability script", () => {
  it("has three scenes per product, each about a capability of its content, with unique ids", () => {
    for (const { slug } of PRODUCTS) {
      const scenes = CAPABILITY_SCRIPT[slug];
      expect(scenes).toHaveLength(3);
      for (const scene of scenes) {
        expect(scene.product).toBe(slug);
        expect(PRODUCT_CONTENT[slug].capabilities[scene.cap]).toBeDefined();
        expect(capabilityOf(scene).detail.length).toBeGreaterThan(10);
      }
    }
    expect(new Set(ALL.map((s) => s.id)).size).toBe(ALL.length);
  });

  it.each(cases)(
    "%s: actions start after the swap, end at settle, and the scene keeps the pace of the chain",
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
      expect(1 - motionSeconds(scene) / sceneSeconds(scene)).toBeGreaterThan(
        0.55,
      );
    },
  );

  it.each(PRODUCTS.map((p) => p.slug))(
    `the opening of %s is still at least ${STILL_TARGET * 100}% of its cycle`,
    (slug) => {
      expect(stillRatio(CAPABILITY_SCRIPT[slug])).toBeGreaterThanOrEqual(
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

  it("every string of the capability scenes respects the copy rules", () => {
    const strings: string[] = [];
    const walk = (value: unknown) => {
      if (typeof value === "string") strings.push(value);
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object")
        Object.values(value).forEach(walk);
    };
    walk(CAPABILITY_STORY);
    expect(strings.length).toBeGreaterThan(150);
    for (const s of strings) expect(copyViolation(s), s).toBeNull();
  });
});

describe("capability stage", () => {
  const stage = renderToStaticMarkup(
    <CapabilityStage id="product-scenes" label="Capacidades" slug="domus" />,
  );
  it("has one tile per scene, the first at the centre, each named by its capability and sentence", () => {
    const [first, second, third] = CAPABILITY_SCRIPT.domus;
    expect(stage).toMatch(
      new RegExp(`data-pos="0"[^>]*data-tile="${first.id}"`),
    );
    expect(stage).toMatch(
      new RegExp(`data-pos="1"[^>]*data-tile="${second.id}"`),
    );
    expect(stage).toMatch(
      new RegExp(`data-pos="-1"[^>]*data-tile="${third.id}"`),
    );
    const { name, detail } = capabilityOf(first);
    expect(stage).toContain(`aria-label="${name}: ${detail}"`);
  });
  it("writes the durations and the captions for the runner, the first caption in place, no live region and no steps", () => {
    expect(stage).not.toMatch(/aria-live/);
    const json = stage.match(
      /<script type="application\/json" data-scene-data(?:="[^"]*")?>([^<]*)<\/script>/,
    )![1];
    const data = JSON.parse(json.replace(/&quot;/g, '"')) as {
      scenes: number[];
      captions: string[];
      steps?: number[];
    };
    expect(data.scenes).toEqual(CAPABILITY_SCRIPT.domus.map(sceneSeconds));
    expect(data.captions).toEqual(
      CAPABILITY_SCRIPT.domus.map((s) => capabilityOf(s).detail),
    );
    expect(data.steps).toBeUndefined();
    const caption = stage.match(/<p[^>]*data-caption[^>]*>([^<]*)<\/p>/)![1];
    expect(caption).toBe(data.captions[0]);
  });
});

describe("products stage of the home", () => {
  const scenes = homeProductScenes();
  const stage = renderToStaticMarkup(
    <ProductsStage id="products-ring" label="Produtos" />,
  );
  it("plays one capability scene per product, in the order of the site, each from its own product", () => {
    expect(scenes.map((s) => s.product)).toEqual(PRODUCTS.map((p) => p.slug));
    for (const scene of scenes) {
      expect(CAPABILITY_SCRIPT[scene.product]).toContain(scene);
      expect(scene.id).toBe(HOME_PRODUCT_SCENE[scene.product]);
    }
    const order = [...stage.matchAll(/data-tile="([a-z-]+)"/g)].map(
      (m) => m[1],
    );
    expect(order).toEqual(scenes.map((s) => s.id));
    expect(stage).toMatch(
      new RegExp(`data-pos="0"[^>]*data-tile="${scenes[0].id}"`),
    );
  });
  it("draws the logo of the product in the bar of each window and no video", () => {
    for (const scene of scenes)
      expect(stage).toMatch(
        new RegExp(
          `data-tile="${scene.id}"[\\s\\S]*?data-product="${scene.product}"`,
        ),
      );
    expect(stage).not.toMatch(/<video|<iframe|hyperframes-player|\.mp4|\.webm/);
  });
  it("keeps the accelerated pace: scenes of about 5 s, a legible hold, the swap of the script, still most of the time", () => {
    for (const scene of scenes) {
      expect(sceneSeconds(scene)).toBeGreaterThanOrEqual(4.8);
      expect(sceneSeconds(scene)).toBeLessThanOrEqual(5.2);
      expect(scene.hold).toBeGreaterThanOrEqual(1.2);
      expect(scene.hold).toBeLessThanOrEqual(1.8);
    }
    expect(SWAP_SECONDS).toBe(0.7);
    expect(stillRatio(scenes)).toBeGreaterThanOrEqual(0.55);
  });
  it("writes for the runner the card each scene lights, and names each tile by product and capability", () => {
    const json = stage.match(
      /<script type="application\/json" data-scene-data(?:="[^"]*")?>([^<]*)<\/script>/,
    )![1];
    const data = JSON.parse(json.replace(/&quot;/g, '"')) as {
      scenes: number[];
      lit: string[];
      steps?: number[];
    };
    expect(data.lit).toEqual(PRODUCTS.map((p) => p.slug));
    expect(data.scenes).toEqual(scenes.map(sceneSeconds));
    expect(data.steps).toBeUndefined();
    const { name, detail } = capabilityOf(scenes[0]);
    expect(stage).toContain(`aria-label="Domus, ${name}: ${detail}"`);
  });
});
