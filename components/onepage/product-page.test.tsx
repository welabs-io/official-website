// TESTES DAS PÁGINAS COMPLETAS DE PRODUTO
// Public scope is readable independently of motion and routes into contextual contact.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { PRODUCT_DETAILS } from "@/lib/product-details";
import { productFilms } from "@/lib/motion-slides";
import { ProductDetail } from "@/components/site/ProductDetail";

describe("product detail template", () => {
  it.each(PRODUCTS)(
    "$slug links the four related products without linking itself",
    ({ slug }) => {
      const html = renderToStaticMarkup(<ProductDetail slug={slug} />);
      const related = html.slice(
        html.indexOf('id="related-products"'),
        html.indexOf('id="contact"'),
      );
      expect(related).not.toContain(`href="/products/${slug}"`);
      for (const product of PRODUCTS.filter((item) => item.slug !== slug)) {
        expect(related).toContain(`href="/products/${product.slug}"`);
      }
      expect(related.match(/href="\/products\//g)).toHaveLength(4);
    },
  );
  it.each(PRODUCTS)(
    "$slug presents resources before demonstrations and contact",
    ({ slug, name }) => {
      const html = renderToStaticMarkup(<ProductDetail slug={slug} />);
      const at = (id: string) => html.indexOf(`id="${id}"`);
      expect(at("overview")).toBeLessThan(at("capabilities"));
      expect(at("capabilities")).toBeLessThan(at("films"));
      expect(at("films")).toBeLessThan(at("related-products"));
      expect(at("related-products")).toBeLessThan(at("contact"));
      const resources = html.slice(at("capabilities"), at("films"));
      for (const capability of PRODUCT_DETAILS[slug].capabilities) {
        expect(resources).toContain(capability.title);
        for (const point of capability.points)
          expect(resources).toContain(point);
      }
      expect(resources.match(/<article\b/g)).toHaveLength(
        PRODUCT_DETAILS[slug].capabilities.length,
      );
      const films = html.slice(at("films"), at("related-products"));
      expect(films.match(/data-layers/g)).toHaveLength(
        productFilms(slug).length,
      );
      expect(
        html.slice(at("overview"), at("capabilities")).match(/data-layers/g),
      ).toHaveLength(1);
      expect(html).toContain(
        `subject=${encodeURIComponent(`Conhecer ${name} by Welabs`)}`,
      );
    },
  );
});
