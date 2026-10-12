// TESTES DO TEMPLATE DE PRODUTO
// One template for the five pages: opening, connectors with the product lit, other films, call to action. The page is
// rendered on the server and read as text.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { productFilms } from "@/lib/motion-slides";
import { productConfig } from "@/lib/site-config";
import { Sections } from "./SiteTemplate";

const slugs = PRODUCTS.map((p) => p.slug);
const render = (slug: (typeof slugs)[number]) =>
  renderToStaticMarkup(<Sections config={productConfig(slug)} />);

describe("product page template", () => {
  it.each(slugs)(
    "the %s page lights its own product and links the other four",
    (slug) => {
      const html = render(slug);
      const block = html.slice(
        html.indexOf('id="connectors"'),
        html.indexOf('id="films"'),
      );
      expect(block.match(/aria-current="page"/g)).toHaveLength(2);
      // One lit logo per layout (a lit rail also marks its own line in the drawing)
      expect(block.match(/<span[^>]*data-state="lit"/g)).toHaveLength(2);
      expect(block).not.toContain(`href="/products/${slug}"`);
      for (const other of PRODUCTS.filter((p) => p.slug !== slug))
        expect(block).toContain(`href="/products/${other.slug}"`);
    },
  );
  it.each(slugs)(
    "the %s page has the four blocks in order and one carousel tile per other film",
    (slug) => {
      const html = render(slug);
      const at = (id: string) => html.indexOf(`id="${id}"`);
      expect(at("product")).toBeLessThan(at("connectors"));
      expect(at("connectors")).toBeLessThan(at("films"));
      expect(at("films")).toBeLessThan(at("contact"));
      const films = html.slice(at("films"), at("contact"));
      expect(films.match(/data-layers/g)).toHaveLength(
        productFilms(slug).length,
      );
      // The opening block is one tile that holds the opening and the first film
      const opening = html.slice(at("product"), at("connectors"));
      expect(opening.match(/data-layers/g)).toHaveLength(1);
    },
  );
  it("every band of the pages is marked live, so the thread and the pulses pause off screen", () => {
    const html = render("domus");
    const bands = html.match(/<section[^>]*>/g) ?? [];
    expect(bands).toHaveLength(4);
    for (const band of bands) expect(band).toContain("data-live");
  });
});
