// TESTES DAS CENAS NATIVAS
// Every scene renders on the server in its settled frame, uses every action of its script (and only those: asking for an
// action the script lacks throws), carries no live region, no image and no video, and keeps its words inside the copy
// rules. The stage keeps the same swap of positions as the ring it replaced.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { COPY_RULES } from "@/lib/content/rules";
import { MANIFEST } from "@/lib/manifest";
import { SCRIPT } from "@/lib/scenes/script";
import { STORY } from "@/lib/scenes/story";
import { SceneBody } from "./SceneBody";
import { SceneStage } from "./SceneStage";

const html = (i: number) =>
  renderToStaticMarkup(<SceneBody scene={SCRIPT[i]} />);

describe("scene components", () => {
  it.each(SCRIPT.map((s, i) => [s.id, i] as const))(
    "%s uses every action of its script, in the settled phase",
    (_, i) => {
      const markup = html(i);
      expect(markup).toContain('data-phase="end"');
      for (const action of SCRIPT[i].actions)
        expect(markup, action.id).toContain(`data-act="${action.id}"`);
      // Only actions of this script appear
      const used = new Set(
        [...markup.matchAll(/data-act="([a-z]+)"/g)].map((m) => m[1]),
      );
      for (const id of used)
        expect(SCRIPT[i].actions.map((a) => a.id)).toContain(id);
    },
  );

  it("draws no image, no video and no live region", () => {
    for (let i = 0; i < SCRIPT.length; i++) {
      expect(html(i)).not.toMatch(/<img|<video|<canvas|aria-live/);
    }
  });

  it("a scene asking for an action the script does not have fails loudly", () => {
    const scene = { ...SCRIPT[0], actions: [] };
    expect(() => renderToStaticMarkup(<SceneBody scene={scene} />)).toThrow(
      /no action/,
    );
  });

  it("every sentence of the story respects the copy rules", () => {
    const strings: string[] = [];
    const walk = (value: unknown) => {
      if (typeof value === "string") strings.push(value);
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object")
        Object.values(value).forEach(walk);
    };
    walk(STORY);
    expect(strings.length).toBeGreaterThan(30);
    for (const s of strings) expect(s).not.toMatch(COPY_RULES);
  });

  it("the story has the texts of the brief", () => {
    const all = SCRIPT.map((_, i) => html(i)).join(" ");
    for (const text of [
      "Alteração de entrega",
      "Pedido 1234",
      "Política de entregas",
      "Sábado: entregas até 12h",
      "Aprovar alteração",
      "Confirmado: sábado ✓",
      "Aguardando aprovação",
    ])
      expect(all, text).toContain(text);
  });
});

describe("scene stage", () => {
  const stage = renderToStaticMarkup(
    <SceneStage id="chain-ring" label="Cenas" tone="light" />,
  );
  it("has one tile per step, named by the sentence of the manifest, the centre one first", () => {
    expect(stage.match(/data-tile="s\d"/g)).toHaveLength(
      MANIFEST.chain.steps.length,
    );
    // Quotes are escaped in the markup
    const label = MANIFEST.chain.steps[0].detail.srLabel.replace(
      /"/g,
      "&quot;",
    );
    expect(stage).toContain(`aria-label="${label}"`);
    expect(stage).toMatch(/data-pos="0"[^>]*data-tile="s0"/);
    expect(stage).toMatch(/data-pos="1"[^>]*data-tile="s1"/);
    expect(stage).toMatch(/data-pos="-1"[^>]*data-tile="s6"/);
  });
  it("is plain server markup with the durations next to it and no live region", () => {
    expect(stage).not.toMatch(/aria-live/);
    expect(stage).toMatch(/data-scene-data/);
    const json = stage.match(
      /<script type="application\/json" data-scene-data(?:="[^"]*")?>([^<]*)<\/script>/,
    )![1];
    const data = JSON.parse(json.replace(/&quot;/g, '"')) as {
      scenes: number[];
    };
    expect(data.scenes).toHaveLength(7);
  });
});
