// TESTES DO CONTEÚDO VISÍVEL DO CARROSSEL
// Preview selection and product discovery are separate server-rendered actions, even before the driver loads.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { RingStage } from "./RingStage";

describe("product preview markup", () => {
  it("renders factual captions, detail links and product-selection buttons", () => {
    const html = renderToStaticMarkup(
      <RingStage
        id="products"
        kind="products"
        logos="links"
        label="Produtos"
      />,
    );
    for (const product of PRODUCTS) {
      expect(html).toContain(product.line);
      expect(html).toContain(`href="/products/${product.slug}"`);
      expect(html).toContain(`data-product="${product.slug}"`);
      expect(html).toContain(`aria-label="Mostrar ${product.name}"`);
    }
    expect(html.match(/Conhecer produto/g)).toHaveLength(5);
    expect(html).toContain('aria-roledescription="carrossel"');
    expect(html).toContain('data-announcement="true" aria-live="polite"');
  });

  it("keeps the single chain frame free of carousel navigation and captions", () => {
    const html = renderToStaticMarkup(
      <RingStage
        id="chain"
        kind="chain"
        presentation="single"
        navigation={false}
        caption={false}
        label="Cadeia"
      />,
    );
    expect(html).toContain('data-presentation="single"');
    expect(html).toContain('data-navigation="false"');
    expect(html).not.toContain("<button");
    expect(html).not.toContain("Conhecer produto");
  });
});
