// TESTES DO SITE COMPLETO
// Validate the actual routed components and the operator's presentation constraints.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { metadata as homeMetadata } from "@/app/page";
import { generateMetadata } from "@/app/products/[slug]/page";
import { CompleteHome } from "@/components/site/CompleteHome";
import { SiteFrame } from "@/components/site/SiteFrame";
import { ProductDetail } from "@/components/site/ProductDetail";

const home = renderToStaticMarkup(<CompleteHome />);
const pages = [
  { slug: "home", html: home },
  ...PRODUCTS.map(({ slug }) => ({
    slug,
    html: renderToStaticMarkup(
      <SiteFrame>
        <ProductDetail slug={slug} />
      </SiteFrame>,
    ),
  })),
];
const visibleText = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

describe("complete public pages", () => {
  it.each(pages)(
    "$slug supplies one main landmark and one heading",
    ({ html }) => {
      expect(html.match(/<main\b/g)).toHaveLength(1);
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).toContain('id="main-content"');
      expect(html).toContain('aria-label="Navegação principal"');
      expect(html).toContain('aria-label="Navegação mobile"');
    },
  );
  it.each(pages)(
    "$slug carries no player controls or release promises",
    ({ html }) => {
      expect(html).not.toMatch(
        /role="progressbar"|<progress\b|<button[^>]*>\s*(?:Pausar|Retomar)\s*</i,
      );
      expect(html).not.toMatch(
        /<hyperframes-player[^>]*\bcontrols\b|<video|<iframe|<audio/i,
      );
      expect(html).not.toMatch(/\.(mp4|webm|mov)\b/i);
      expect(visibleText(html)).not.toMatch(
        /\b(erp|crm|beta|alpha|mvp|roadmap|em breve)\b/i,
      );
      expect(visibleText(html)).not.toMatch(
        /Domus domina|Relloo atende|Magneto automatiza|Tuner entrega|Knowly sabe/i,
      );
    },
  );
  it.each(pages)(
    "$slug has a real contact destination and all five product routes",
    ({ html }) => {
      expect(html).toContain('href="mailto:contato@welabs.io?subject=');
      expect(visibleText(html)).toContain("contato@welabs.io");
      expect(visibleText(html)).toContain("Copiar e-mail");
      for (const { slug } of PRODUCTS)
        expect(html).toContain(`href="/products/${slug}"`);
    },
  );
});

describe("home presentation", () => {
  it("provides architecture, products, journey, experience and contact in order", () => {
    const ids = ["chain", "products", "journey", "platforms", "contact"];
    const positions = ids.map((id) => home.indexOf(`id="${id}"`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(home.match(/<section\b/g)).toHaveLength(5);
    expect(home).not.toContain('id="connectors"');
  });
  it("keeps a persistent request readable without relying on the motion canvas", () => {
    expect(visibleText(home)).toContain("Marina · Pedido 1234");
    expect(visibleText(home)).toContain(
      "Dá para mudar a entrega do meu pedido para sábado?",
    );
    expect(visibleText(home)).toContain("Fonte: Política de entregas, seção 3");
    expect(home.match(/data-chain-caption=/g)).toHaveLength(5);
    expect(home.match(/data-ecosystem-demo=/g)).toHaveLength(1);
    expect(home.match(/data-motion-viewport=/g)).toHaveLength(1);
    expect(home.indexOf("data-ecosystem-demo")).toBeLessThan(
      home.indexOf('id="products-ring"'),
    );
    expect(home).not.toContain('id="hero-domus"');
    expect(home).not.toContain('id="hero-relloo"');
    expect(home).not.toContain('id="journey-ring"');
    expect(home).toContain('data-architecture-node="domus"');
    expect(home).toContain('data-architecture-node="relloo"');
    expect(home).not.toMatch(/data-chain-select=|data-step=|data-select=/);
  });
  it("advances complete product identities automatically with readable summaries", () => {
    const orbit = home.slice(
      home.indexOf('id="products-ring"'),
      home.indexOf('id="journey"'),
    );
    expect(orbit).toContain('data-rotate="true"');
    expect(orbit).toContain('data-navigation="false"');
    expect(orbit).not.toMatch(/<button\b/);
    expect(orbit).toContain('data-summaries="true"');
    expect(orbit).toContain("Finanças, vendas, compras, estoque e pessoas");
    expect(orbit).toContain("Contatos, oportunidades, conversas e campanhas");
    for (const { slug, name } of PRODUCTS) {
      expect(orbit).toContain(`href="/products/${slug}"`);
      expect(orbit).toContain(`<h3>${name}</h3>`);
    }
  });
  it("distinguishes portfolio brands from the technology base", () => {
    const closing = home.slice(
      home.indexOf('id="platforms"'),
      home.indexOf('id="contact"'),
    );
    expect(closing).toContain('aria-label="Marcas do portfólio"');
    expect(closing).toContain(
      'aria-label="Plataformas de infraestrutura e desenvolvimento"',
    );
    expect(closing).toMatch(/src="\/clients\//);
    for (const name of ["AWS", "DigitalOcean", "HostDime", "Google Cloud"])
      expect(closing).toContain(`alt="${name}"`);
  });
  it("keeps the home compact enough to support scanning", () => {
    // Count all native text, including the inactive functional summaries.
    expect(visibleText(home).split(" ").length).toBeLessThanOrEqual(700);
  });
  it("uses standalone product marks throughout native page content", () => {
    for (const { html } of pages) {
      expect(html).not.toMatch(
        /by Welabs|by welabs|-(?:light|dark)-endorsed\.svg/,
      );
    }
  });
});

describe("metadata", () => {
  it("uses the Welabs title", () => expect(homeMetadata.title).toBe("Welabs"));
  it("keeps product category terms in metadata", async () => {
    for (const { slug, name, category } of PRODUCTS) {
      const meta = await generateMetadata({
        params: Promise.resolve({ slug }),
      });
      expect(meta.title).toBe(name);
      expect(meta.description).toContain(category);
      expect(meta.keywords).toBeDefined();
    }
  });
});
