// TESTES DO CONTEÚDO DA PÁGINA ÚNICA
// The operator's direction of 2026-10-09: no player, no video, little text, no brand-concept slogans. The pages are
// rendered on the server (the same HTML the first paint gets) and checked as text.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  HUB_NOTE,
  PAGE_HEADINGS,
  PRODUCT_CONTENT,
  TIE_LINES,
  tieKey,
} from "@/lib/content";
import { COPY_RULES } from "@/lib/content/rules";
import { MANIFEST } from "@/lib/manifest";
import { ties } from "@/lib/manifest/select";
import { PRODUCTS } from "@/lib/products";
import { metadata as homeMetadata } from "@/app/page";
import { generateMetadata } from "@/app/products/[slug]/page";
import { SiteTemplate } from "@/components/template/SiteTemplate";
import { HOME_CONFIG, productConfig } from "@/lib/site-config";

const home = renderToStaticMarkup(<SiteTemplate config={HOME_CONFIG} />);
const productPages = PRODUCTS.map((p) => ({
  slug: p.slug,
  html: renderToStaticMarkup(<SiteTemplate config={productConfig(p.slug)} />),
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
// Text that only assistive technology gets. The names of the tiles (`role="group"`) are the sentences the motion manifest
// writes to describe each step (`srLabel`, `title`): descriptions of what the film shows, checked by the manifest tests,
// not brand copy, so they are out of the slogan check.
const hiddenText = (html: string) =>
  [
    ...html
      .replace(/role="group" aria-label="[^"]*"/g, "")
      .matchAll(/(?:alt|aria-label)="([^"]*)"/g),
  ]
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

  it("the home and a product page stay under the word budget of the content layer", () => {
    // Measured when the content layer landed: see COUNT in the test below; the budgets guard against text creeping in
    // 160 before the opening (29 words) and the overview (token and caption, 7 words) entered the home; now 180
    expect(visibleText(home).split(" ").length).toBeLessThanOrEqual(180);
    for (const { html } of productPages)
      expect(visibleText(html).split(" ").length).toBeLessThanOrEqual(260);
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
    // Every product shows its standalone logo under the active frame (the seal is only the identity highlight)
    for (const p of PRODUCTS) {
      expect(home).toContain(`${p.slug}-light.svg`);
      expect(home).not.toContain(`${p.slug}-light-endorsed.svg`);
    }
    expect(visibleText(home)).toContain("Conversar com a Welabs");
  });

  it("the closing is two titled strips, one of the marks of who operates with us and one of the platforms, then the button", () => {
    const closing = home.slice(home.indexOf('id="platforms"'));
    // Two carousels (the loop copy is aria-hidden), each under its title
    expect(closing.match(/role="region"/g)).toHaveLength(2);
    expect(visibleText(closing)).toContain("Quem já opera com a gente");
    expect(visibleText(closing)).toContain("Onde rodamos");
    for (const name of ["AWS", "DigitalOcean", "HostDime", "Google Cloud"])
      expect(closing).toContain(`alt="${name}"`);
    expect(closing).toMatch(/src="\/clients\//);
    expect(closing.lastIndexOf('role="region"')).toBeLessThan(
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
  it("the chain section carries no opening, only the settled cover of each step of the manifest", () => {
    // The markup the viewer gets; the JSON of the ring (ids of the pieces it plays) is not markup
    const chain = home
      .slice(home.indexOf('id="chain"'), home.indexOf('id="products"'))
      .replace(/<script[\s\S]*?<\/script>/g, "");
    expect(chain).not.toMatch(/intro/);
    // One still per step, no title text
    expect(chain.match(/ src="[^"]*\/posters\/[^"]*"/g)).toHaveLength(
      MANIFEST.chain.steps.length,
    );
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

describe("the content layer on the rendered pages", () => {
  const text = (html: string) => visibleText(html);

  it.each(pages)(
    "$slug carries no slogan, banned word or maturity marker in what it shows or announces",
    ({ html }) => {
      const all = `${text(html)} ${hiddenText(html)}`;
      expect(all).not.toMatch(COPY_RULES);
    },
  );

  it("the home shows five product cards, the active one lit, each leading to its page", () => {
    const cards = home.match(/<a [^>]*data-card="[a-z]+"[^>]*>/g) ?? [];
    expect(cards).toHaveLength(5);
    expect(cards.filter((c) => c.includes('data-on="true"'))).toHaveLength(1);
    for (const p of PRODUCTS) {
      const card = cards.find((c) => c.includes(`data-card="${p.slug}"`))!;
      expect(card).toContain(`href="/products/${p.slug}"`);
    }
    // Name (logo), one line and three capabilities per card
    for (const p of PRODUCTS) {
      expect(text(home)).toContain(p.line);
      for (const cap of PRODUCT_CONTENT[p.slug].capabilities.slice(0, 3))
        expect(text(home)).toContain(cap.text);
    }
  });

  it("the home explains the core and the rails in one sentence and closes with the footer links", () => {
    expect(text(home)).toContain(HUB_NOTE);
    const footer = home.slice(home.indexOf("<footer"));
    for (const p of PRODUCTS)
      expect(footer).toContain(`href="/products/${p.slug}"`);
  });

  it.each(productPages)(
    "$slug has the problems, the capabilities, the live caption and a line per connection",
    ({ slug, html }) => {
      const t = text(html);
      for (const heading of Object.values(PAGE_HEADINGS))
        expect(t).toContain(heading);
      const c = PRODUCT_CONTENT[slug];
      for (const r of c.resolves) {
        expect(t).toContain(r.problem);
        expect(t).toContain(r.does);
      }
      for (const cap of c.capabilities) expect(t).toContain(cap.text);
      // The caption is a polite live region that starts on the first tile
      expect(html).toMatch(/<p[^>]*data-caption[^>]*aria-live="polite"[^>]*>/);
      expect(t).toContain(c.filmCaptions[0]);
      for (const tie of ties(MANIFEST).filter(
        (x) => x.a === slug || x.b === slug,
      ))
        expect(t).toContain(TIE_LINES[tieKey(tie.a, tie.b)]);
    },
  );

  it("the home has no live caption: the chain section is not touched by this layer", () => {
    expect(home).not.toContain("data-caption");
  });
});
