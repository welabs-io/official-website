// TESTES DO CONTEÚDO DA PÁGINA ÚNICA
// The operator's direction of 2026-10-09: no player, no video, little text, no brand-concept slogans. The pages are
// rendered on the server (the same HTML the first paint gets) and checked as text.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { metadata as homeMetadata } from "@/app/page";
import { generateMetadata } from "@/app/products/[slug]/page";
import { OnePage } from "./OnePage";
import { PageFrame } from "./PageFrame";
import { ProductPageBody } from "./ProductPageBody";

const home = renderToStaticMarkup(<OnePage />);
const productPages = PRODUCTS.map((p) => ({
  slug: p.slug,
  html: renderToStaticMarkup(
    <PageFrame>
      <ProductPageBody slug={p.slug} />
    </PageFrame>,
  ),
}));
const pages = [{ slug: "home", html: home }, ...productPages];

// Text a person reads: no tags, no scripts or styles
const visibleText = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
// Text that only assistive technology gets
const hiddenText = (html: string) =>
  [...html.matchAll(/(?:alt|aria-label)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(" ");

// Brand-concept words and phrases that are only allowed inside chain presentations
const SLOGAN =
  /\b(domina|atende|automatiza|entrega|sabe|define|explica|conecta|transforma|ideias que viram|um só fluxo|ecossistema)\b/i;
// Words the operator ruled out of the site
const BANNED =
  /\b(cliente|clientes|erp|ficha|beta|alpha|mvp|em breve|roadmap)\b/i;

describe("pages carry no player interface", () => {
  it.each(pages)(
    "$slug has no progress bar, no pause button, no controls and no video",
    ({ html }) => {
      expect(html).not.toMatch(/role="progressbar"|<progress\b/i);
      expect(html).not.toMatch(
        /Pausar|Retomar|aria-pressed="(true|false)"[^>]*pause/i,
      );
      expect(html).not.toMatch(/<hyperframes-player[^>]*\bcontrols\b/i);
      expect(html).not.toMatch(/<video|<iframe|<audio/i);
      expect(html).not.toMatch(/\.(mp4|webm|mov)\b/i);
    },
  );
});

describe("pages carry little text and no slogan", () => {
  it.each(pages)("$slug has no slogan or banned word", ({ html }) => {
    const all = `${visibleText(html)} ${hiddenText(html)}`;
    expect(all).not.toMatch(SLOGAN);
    expect(all).not.toMatch(BANNED);
  });

  it("the home stays under the word budget", () => {
    const words = visibleText(home).split(" ").length;
    // Measured at the time of writing: 75; the budget guards against text creeping back
    expect(words).toBeLessThanOrEqual(85);
  });

  it("every product line has at most six words", () => {
    for (const p of PRODUCTS)
      expect(p.line.split(" ").length).toBeLessThanOrEqual(6);
  });

  it("the home has its three sections and the call to action", () => {
    for (const id of ["top", "chain", "products", "platforms", "contact"])
      expect(home).toContain(`id="${id}"`);
    // The old strip and the second products-like section are gone
    expect(home).not.toContain('id="logos"');
    expect(home).toContain('href="/#contact"');
    // Every product shows its logo with the seal under the active frame
    for (const p of PRODUCTS)
      expect(home).toContain(`${p.slug}-light-endorsed.svg`);
    expect(visibleText(home)).toContain("Conversar com a Welabs");
  });

  it("the closing is one strip with the logos of clients and platforms together, then the button", () => {
    const closing = home.slice(home.indexOf('id="platforms"'));
    // One carousel only (the loop copy is aria-hidden), no visible label
    expect(closing.match(/role="region"/g)).toHaveLength(1);
    expect(visibleText(closing)).not.toMatch(/Quem atendemos|Infraestrutura/);
    for (const name of ["AWS", "DigitalOcean", "HostDime", "Google Cloud"])
      expect(closing).toContain(`alt="${name}"`);
    expect(closing).toMatch(/src="\/clients\//);
    expect(closing.indexOf('role="region"')).toBeLessThan(
      closing.indexOf('id="contact"'),
    );
  });

  it("the sections come in order: chain, products, closing", () => {
    const at = (id: string) => home.indexOf(`id="${id}"`);
    expect(at("chain")).toBeLessThan(at("products"));
    expect(at("products")).toBeLessThan(at("platforms"));
    expect(at("platforms")).toBeLessThan(at("contact"));
  });
});

describe("the home has no sequential player and no opening on the chain", () => {
  it("no sequential player anywhere in the page", () => {
    expect(home).not.toMatch(/sequence-player|SequencePlayer|sequence:ended/i);
    expect(home).not.toMatch(/welabs-intro/);
  });
  it("the chain section carries no opening and no chain film, only montage covers", () => {
    const chain = home.slice(
      home.indexOf('id="chain"'),
      home.indexOf('id="products"'),
    );
    expect(chain).not.toMatch(/intro|welabs-chain/);
    // One still per cut (nine cuts), no title text
    expect(chain.match(/cut-\d\.jpg/g)).toHaveLength(9);
  });
  it("the title of the home is Welabs, without a suffix", () => {
    expect(homeMetadata.title).toBe("Welabs");
    expect(String(homeMetadata.title)).not.toMatch(/Plataforma/i);
  });
  it("other pages follow the 'Domus by Welabs' pattern", async () => {
    for (const { slug, name } of PRODUCTS.map((p) => ({
      slug: p.slug,
      name: p.name,
    }))) {
      const meta = await generateMetadata({
        params: Promise.resolve({ slug }),
      });
      expect(meta.title).toBe(`${name} by Welabs`);
    }
  });
});
