// TESTES DO TEMPLATE DAS PÁGINAS
// The home and the five product pages are one template: the same band structure with two lists of sections. The product
// pages open with the trail, the logo and the stage of three capability scenes, then what it solves, how it works (the
// native chain), the capabilities in groups, who it is for, the questions, the connector block lit on the product, the
// closing and the other products. No video anywhere. Rendered on the server and read as text.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MANIFEST } from "@/lib/manifest";
import { PRODUCTS } from "@/lib/products";
import {
  PRODUCT_MIN_CYCLE,
  scenesOfProduct,
} from "@/lib/scenes/product-scenes";
import { STILL_TARGET, cycleSeconds, stillRatio } from "@/lib/scenes/script";
import { HOME_CONFIG, productConfig } from "@/lib/site-config";
import { capabilityOf, capabilityScenes } from "@/lib/scenes/capabilities";
import { Sections } from "./SiteTemplate";

const slugs = PRODUCTS.map((p) => p.slug);
const render = (slug: (typeof slugs)[number]) =>
  renderToStaticMarkup(<Sections config={productConfig(slug)} />);
const kinds = (config: { sections: { kind: string }[] }) =>
  config.sections.map((s) => s.kind);

describe("one template, same sequence", () => {
  it("the home alternates visual and reading bands and ends in the connector block and the closing", () => {
    expect(kinds(HOME_CONFIG)).toEqual([
      "chain",
      "journey",
      "ring",
      "benefits",
      "audience",
      "integrations",
      "faq",
      "hub",
      "closing",
    ]);
  });
  it("every product page has the same ten bands, the connector block right before the closing", () => {
    for (const config of slugs.map(productConfig))
      expect(kinds(config)).toEqual([
        "hero",
        "resolves",
        "how",
        "capabilities",
        "audience",
        "faq",
        "hub",
        "closing",
        "others",
      ]);
  });
  it.each(slugs)("the %s page renders its sections in that order", (slug) => {
    const html = render(slug);
    const order = [
      "product",
      "resolves",
      "how",
      "capabilities",
      "audience",
      "faq",
      "connectors",
      "platforms",
      "contact",
      "others",
    ];
    const at = (id: string) => html.indexOf(`id="${id}"`);
    for (const id of order) expect(at(id), id).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < order.length; i++)
      expect(at(order[i - 1]), order[i]).toBeLessThan(at(order[i]));
    expect(html).not.toContain('id="films"');
  });
});

describe("product page", () => {
  it.each(slugs)(
    "the %s page lights its own product in the block and links the other four",
    (slug) => {
      const html = render(slug);
      const block = html.slice(
        html.indexOf('role="group" aria-label="Núcleo'),
        html.indexOf('id="platforms"'),
      );
      expect(block.match(/aria-current="page"/g)).toHaveLength(1);
      expect(block.match(/data-state="lit"/g)).toHaveLength(1);
      expect(block).not.toContain(`href="/products/${slug}"`);
      for (const other of PRODUCTS.filter((p) => p.slug !== slug))
        expect(block).toContain(`href="/products/${other.slug}"`);
    },
  );
  it.each(slugs)(
    "the %s page opens with its logo as the only h1 and the stage of its three capability scenes, animated and native",
    (slug) => {
      const html = render(slug);
      const hero = html.slice(
        html.indexOf('id="product"'),
        html.indexOf('id="resolves"'),
      );
      expect(hero.match(/<h1\b/g)).toHaveLength(1);
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      const scenes = capabilityScenes(slug);
      expect(scenes).toHaveLength(3);
      expect(hero).toContain('id="product-scenes"');
      for (const scene of scenes) {
        expect(scene.product).toBe(slug);
        expect(hero).toContain(`data-tile="${scene.id}"`);
        // The name of the capability and the sentence of the page about it
        const { name, detail } = capabilityOf(scene);
        expect(hero).toContain(name);
        expect(hero).toContain(detail);
      }
      // One capability per scene, never the same twice
      expect(new Set(scenes.map((s) => s.cap)).size).toBe(3);
      // The runner gets the times and the captions; the first caption is in the markup, as plain text
      expect(hero).toContain(
        `"captions":${JSON.stringify(scenes.map((s) => capabilityOf(s).detail))}`,
      );
      expect(hero.match(/data-on="true"/g)).toHaveLength(1);
      // No video, no cover, no still frame: the opening is native and plays
      expect(hero).not.toMatch(
        /hyperframes-player|\/posters\/|<video|data-mini=/,
      );
    },
  );
  it.each(slugs)(
    "the %s page has no film: no player, no cover and no ring of videos anywhere",
    (slug) => {
      const html = render(slug);
      expect(html).not.toMatch(
        /hyperframes-player|\/posters\/|<video|data-layers|id="product-ring"/,
      );
    },
  );
  it.each(slugs)(
    "the %s page plays the native chain narrowed to the scenes it takes part in, with its logo marked",
    (slug) => {
      const html = render(slug);
      const at = (id: string) => html.indexOf(`id="${id}"`);
      const how = html.slice(at("how"), at("capabilities"));
      const scenes = scenesOfProduct(slug);
      expect(scenes.length).toBeGreaterThan(0);
      // The product is the protagonist or an end of the connection of every scene it plays
      for (const scene of scenes) {
        const { connection } = MANIFEST.chain.steps[scene.step];
        expect(
          scene.products.includes(slug) ||
            connection.from === slug ||
            connection.to === slug,
        ).toBe(true);
      }
      const tiles = how.match(/data-tile="s\d"/g) ?? [];
      expect(tiles).toHaveLength(scenes.length);
      for (const scene of scenes)
        expect(how).toContain(`data-tile="${scene.id}"`);
      expect(how).toContain('id="product-chain"');
      expect(how.match(/data-self="true"/g)).toHaveLength(1);
      // The overview starts on the first step of the product and the runner is told the steps
      expect(how).toContain(
        MANIFEST.chain.steps[scenes[0].step].overview.label,
      );
      expect(how).toContain(`"steps":[${scenes.map((s) => s.step).join(",")}]`);
      // The scenes are native: no video in the section
      expect(how).not.toMatch(
        /hyperframes-player|\/posters\/|<video|data-layers/,
      );
    },
  );
  it.each(slugs)("the %s cycle is at least the product minimum", (slug) => {
    expect(cycleSeconds(scenesOfProduct(slug))).toBeGreaterThanOrEqual(
      PRODUCT_MIN_CYCLE - 1e-9,
    );
  });
  it("the scenes of each product, in the plot's order", () => {
    const ids = (slug: (typeof slugs)[number]) =>
      scenesOfProduct(slug).map((s) => s.id);
    expect(ids("domus")).toEqual(["s0", "s2", "s3", "s5", "s6"]);
    expect(ids("relloo")).toEqual(["s0", "s1", "s2", "s3", "s4"]);
    expect(ids("tuner")).toEqual(["s1", "s6"]);
    expect(ids("knowly")).toEqual(["s4"]);
    expect(ids("magneto")).toEqual(["s5"]);
  });
  it.each(slugs)(
    "the %s scenes keep at least the still share of the script",
    (slug) => {
      const scenes = scenesOfProduct(slug);
      expect(stillRatio(scenes)).toBeGreaterThanOrEqual(STILL_TARGET);
    },
  );
  it("only the labels of the connections of the product stay in the block", () => {
    const html = render("domus");
    const block = html.slice(html.indexOf('role="group" aria-label="Núcleo'));
    // Domus has the seam and the Magneto rail
    expect(block).toContain("Dados no cartão");
    expect(block).toContain("Regra que roda");
    expect(block).not.toContain("Uma conversa só");
    expect(block).not.toContain("Fonte no cartão");
  });
  it("every band of the pages is marked live, so the thread and the pulses pause off screen", () => {
    const html = render("domus");
    const bands = html.match(/<section[^>]*>/g) ?? [];
    expect(bands).toHaveLength(9);
    for (const band of bands) expect(band).toContain("data-live");
  });
});
