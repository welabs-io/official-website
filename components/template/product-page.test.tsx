// TESTES DO TEMPLATE DAS PÁGINAS
// The home and the five product pages are one template: the same sequence of sections (ring, ring, connector block,
// closing). The product pages light their own product in the block and the row, take one ring for the opening and the
// films, and narrow the chain to the steps that show the product. Rendered on the server and read as text.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MANIFEST } from "@/lib/manifest";
import { chainSteps } from "@/lib/manifest/select";
import { PRODUCTS } from "@/lib/products";
import { HOME_CONFIG, productConfig } from "@/lib/site-config";
import { Sections } from "./SiteTemplate";

const slugs = PRODUCTS.map((p) => p.slug);
const render = (slug: (typeof slugs)[number]) =>
  renderToStaticMarkup(<Sections config={productConfig(slug)} />);
const kinds = (config: { sections: { kind: string }[] }) =>
  config.sections.map((s) => s.kind);

describe("one template, same sequence", () => {
  it("the home is ring, ring, connector block, closing; every product page adds the problems and the capabilities", () => {
    expect(kinds(HOME_CONFIG)).toEqual(["ring", "ring", "hub", "closing"]);
    for (const config of slugs.map(productConfig))
      expect(kinds(config)).toEqual([
        "ring",
        "resolves",
        "capabilities",
        "ring",
        "hub",
        "closing",
      ]);
  });
  it.each(slugs)("the %s page renders its sections in that order", (slug) => {
    const html = render(slug);
    const at = (id: string) => html.indexOf(`id="${id}"`);
    expect(at("product")).toBeGreaterThanOrEqual(0);
    expect(at("product")).toBeLessThan(at("chain"));
    expect(at("chain")).toBeLessThan(at("connectors"));
    expect(at("connectors")).toBeLessThan(at("platforms"));
    expect(at("platforms")).toBeLessThan(at("contact"));
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
    "the %s page has one ring for the opening and the films, one tile each",
    (slug) => {
      const html = render(slug);
      const at = (id: string) => html.indexOf(`id="${id}"`);
      const ring = html.slice(at("product"), at("chain"));
      const films = MANIFEST.products[slug].films;
      // The opening and the main film share the first tile; every support film has its own
      expect(ring.match(/data-layers/g)).toHaveLength(
        1 + films.filter((f) => f.role === "support").length,
      );
      // One h1 per page, the product logo, with its row pinned to the product
      expect(ring.match(/<h1\b/g)).toHaveLength(1);
      expect(ring).toContain('data-row="pinned"');
      expect(ring.match(/aria-current="page"/g)).toHaveLength(1);
    },
  );
  it.each(slugs)(
    "the %s page narrows the chain to the steps that show it",
    (slug) => {
      const html = render(slug);
      const chain = html.slice(
        html.indexOf('id="chain"'),
        html.indexOf('id="connectors"'),
      );
      expect(chain.match(/data-layers/g)).toHaveLength(
        chainSteps(MANIFEST, slug).length,
      );
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
    expect(bands).toHaveLength(6);
    for (const band of bands) expect(band).toContain("data-live");
  });
});
