// TESTES DO CONTEÚDO VISÍVEL DO CARROSSEL
// Preview selection and product discovery are separate server-rendered actions, even before the driver loads.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { RingStage } from "./RingStage";

describe("product preview markup", () => {
  it("uses textual homepage navigation while preserving authored identities and logo signals elsewhere", () => {
    const home = renderToStaticMarkup(
      <RingStage
        id="products-ring"
        kind="products"
        logos="links"
        label="Produtos"
      />,
    );
    const signals = renderToStaticMarkup(
      <RingStage id="signals" kind="chain" logos="lit" label="Cadeia" />,
    );
    const other = renderToStaticMarkup(
      <RingStage
        id="other-products"
        kind="products"
        logos="links"
        label="Produtos"
      />,
    );
    expect(home).toContain('data-text-navigation="true"');
    for (const product of PRODUCTS) {
      expect(home).toContain(`aria-label="Mostrar ${product.name}"`);
      expect(home).toContain(`>${product.name}</span>`);
    }
    expect(home).not.toMatch(/<button[^>]*data-product[^>]*><img/);
    expect(signals).toContain('data-text-navigation="false"');
    expect(signals).toContain("<img");
    expect(other).toMatch(/<button[^>]*data-product[^>]*><img/);
  });
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
  it("keeps preview and hero phases distinct while enabling the clean website projection", () => {
    const preview = renderToStaticMarkup(
      <RingStage
        id="preview"
        kind="preview"
        slug="domus"
        presentation="single"
        clean
        label="Domus"
      />,
    );
    const hero = renderToStaticMarkup(
      <RingStage
        id="hero"
        kind="hero"
        slug="domus"
        presentation="single"
        clean
        label="Domus"
      />,
    );
    expect(preview).toContain('data-phase="film"');
    expect(preview).toContain('data-clean="true"');
    expect(preview).not.toContain("tail-domus");
    expect(hero).toContain('data-phase="intro"');
    expect(hero).toContain('data-motion-phase="intro"');
  });
  it("renders factual captions for each film instead of hiding every caption of one product", () => {
    const html = renderToStaticMarkup(
      <RingStage id="films" kind="films" slug="relloo" clean label="Relloo" />,
    );
    expect(html).toContain('data-caption-index="0"');
    expect(html).toContain('data-caption-index="2"');
    expect(html).toContain("Assistentes no atendimento");
    expect(html).not.toContain("Filme 1");
  });
  it("separates automatic media playback from manual product exploration", () => {
    const html = renderToStaticMarkup(
      <RingStage
        id="manual-products"
        kind="products"
        rotate={false}
        clean
        label="Produtos"
      />,
    );
    expect(html).toContain('data-rotate="false"');
    expect(html).toContain('data-navigation="true"');
  });
  it("renders supplied product summaries as native copy without leaking them into film captions", () => {
    const summaries = {
      domus: "Reúne a gestão e a definição do negócio na mesma base.",
    };
    const products = renderToStaticMarkup(
      <RingStage
        id="summaries"
        kind="products"
        summaries={summaries}
        label="Produtos"
      />,
    );
    const films = renderToStaticMarkup(
      <RingStage
        id="film-summaries"
        kind="films"
        slug="domus"
        summaries={summaries}
        label="Filmes"
      />,
    );
    expect(products).toContain(summaries.domus);
    expect(products).toContain('data-summaries="true"');
    expect(films).not.toContain(summaries.domus);
  });
});
