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
import { copyViolation } from "@/lib/content/rules";
import { CHAIN_STEPS, ties } from "@/lib/chain";
import { PRODUCTS } from "@/lib/products";
import { capabilityOf, capabilityScenes } from "@/lib/scenes/capabilities";
import { metadata as homeMetadata } from "@/app/(site)/page";
import { generateMetadata } from "@/app/(site)/products/[slug]/page";
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
// Text that only assistive technology gets: every alt and accessible name, the names of the scene tiles included
const hiddenText = (html: string) =>
  [...html.matchAll(/(?:alt|aria-label)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(" ");

// Text of the page copy: the native scenes draw product screens, whose words are interface (checked by the slogan and
// banned-word rules, but out of the word budget of the copy). The block between each stage and its data goes: the chain,
// and on a product page also the capability scenes of the opening. The same goes for the still scenes (MiniScene) of the
// benefits: each one is a block that starts at its `data-mini` holder and ends at the marker `data-mini-end` right after it.
const copyOnly = (html: string) => {
  let withoutStage = html;
  for (;;) {
    const at = withoutStage.indexOf('data-scenes="');
    const end = withoutStage.indexOf('data-scene-data="', at);
    if (at < 0 || end < 0) break;
    withoutStage =
      withoutStage.slice(0, withoutStage.lastIndexOf("<div", at)) +
      withoutStage.slice(end);
  }
  return withoutStage.replace(
    /<div[^>]*data-mini=[\s\S]*?<span[^>]*data-mini-end[^>]*><\/span>/g,
    "",
  );
};

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
    // One list for slogans and banned words (lib/content/copy-rules.json), with the closed list of allowed expressions
    expect(copyViolation(all)).toBeNull();
  });

  it("the home and a product page stay inside the word budget of the depth work", () => {
    // Operator direction of 2026-10-12: more content and more scroll. The home carries 700 to 1000 words (it was 180: the
    // order from start to end, the benefits, the profiles, the integrations, the questions and the contact entered it) and
    // a product page 400 to 700 (it was 260: the groups, the profiles and the questions entered it). The floor guards
    // against a section losing its text as much as the ceiling guards against text creeping in.
    const homeWords = visibleText(copyOnly(home)).split(" ").length;
    expect(homeWords).toBeGreaterThanOrEqual(700);
    expect(homeWords).toBeLessThanOrEqual(1000);
    for (const { html } of productPages) {
      const n = visibleText(copyOnly(html)).split(" ").length;
      expect(n).toBeGreaterThanOrEqual(400);
      expect(n).toBeLessThanOrEqual(700);
    }
  });

  it("every product line has at most six words", () => {
    for (const p of PRODUCTS)
      expect(p.line.split(" ").length).toBeLessThanOrEqual(6);
  });

  it("the home has its sections and the call to action", () => {
    for (const id of [
      "top",
      "chain",
      "how",
      "products",
      "operation",
      "audience",
      "integrations",
      "faq",
      "connectors",
      "platforms",
      "contact",
    ])
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

  it("the closing is one titled strip of platforms, with no client brand, then the button", () => {
    const closing = home.slice(home.indexOf('id="platforms"'));
    // One carousel (the loop copy is aria-hidden) under its title; client brands need consent, so none is shown
    expect(closing.match(/role="region"/g)).toHaveLength(1);
    expect(visibleText(closing)).not.toContain("Quem já opera com a gente");
    expect(visibleText(closing)).toContain("Onde rodamos");
    for (const name of ["AWS", "DigitalOcean", "HostDime", "Google Cloud"])
      expect(closing).toContain(`alt="${name}"`);
    expect(home).not.toMatch(/src="\/clients\//);
    expect(closing.lastIndexOf('role="region"')).toBeLessThan(
      closing.indexOf('id="contact"'),
    );
  });

  it("the sections alternate visual and reading bands: chain, order, products, operation, audience, integrations, questions, connectors, closing", () => {
    const at = (id: string) => home.indexOf(`id="${id}"`);
    const order = [
      "chain",
      "how",
      "products",
      "operation",
      "audience",
      "integrations",
      "faq",
      "connectors",
      "platforms",
      "contact",
    ];
    for (let i = 1; i < order.length; i++)
      expect(at(order[i - 1]), order[i]).toBeLessThan(at(order[i]));
  });
});

describe("the new sections of the home", () => {
  it("the order from start to end has the seven steps of the chain, each with its products and one sentence", () => {
    const section = home.slice(
      home.indexOf('id="how"'),
      home.indexOf('id="products"'),
    );
    expect(section.match(/<li[^>]*>/g)).toHaveLength(7);
    expect(visibleText(section)).toContain("Um pedido, do começo ao fim");
  });
  it("the benefits are six, each with a still native scene and no company", () => {
    const section = home.slice(
      home.indexOf('id="operation"'),
      home.indexOf('id="audience"'),
    );
    expect(section.match(/data-mini="s\d"/g)).toHaveLength(6);
    expect(section).not.toMatch(/hyperframes-player|<video|\/posters\//);
  });
  it("the audience has four profiles, the integrations four groups and the questions are native details", () => {
    const part = (from: string, to: string) =>
      home.slice(home.indexOf(`id="${from}"`), home.indexOf(`id="${to}"`));
    expect(part("audience", "integrations").match(/<h3>/g)).toHaveLength(4);
    expect(part("integrations", "faq").match(/data-group="/g)).toHaveLength(4);
    const faq = part("faq", "connectors");
    const questions = faq.match(/<details/g) ?? [];
    expect(questions.length).toBeGreaterThanOrEqual(6);
    expect(questions.length).toBeLessThanOrEqual(8);
    // Closed by default and no script: the answers are in the markup
    expect(faq).not.toContain("<details open");
  });
  it("names no company: the portfolio has no scope confirmed to attribute a case", () => {
    const body = visibleText(
      copyOnly(home.slice(0, home.indexOf('id="platforms"'))),
    );
    for (const company of [
      "Light",
      "Neoenergia",
      "Enel",
      "Ecoenel",
      "Kiosk",
      "IMA",
      "AVSI",
      "Stant",
      "WeGO",
    ])
      expect(body).not.toMatch(new RegExp(`\\b${company}\\b`));
  });
  it("the contact is a real section: a title, the line the operator chose and the button, and no address that was not given", () => {
    const contact = home.slice(home.indexOf('id="contact"'));
    expect(visibleText(contact)).toContain("Contato");
    expect(visibleText(contact)).toContain("Conversar com a Welabs");
    expect(contact).not.toMatch(/mailto:|wa\.me/);
  });
});

describe("navigation on every page", () => {
  it.each(pages)(
    "$slug has the menu (the five products, Como funciona, Contato) and the logo that leads to the home",
    ({ html }) => {
      const header = html.slice(
        html.indexOf("<header"),
        html.indexOf("</header>"),
      );
      expect(header).toContain('href="/"');
      expect(header).toContain('aria-label="Welabs, início"');
      for (const p of PRODUCTS)
        expect(header).toContain(`href="/products/${p.slug}"`);
      expect(header).toContain('href="/#how"');
      expect(header).toContain('href="/#contact"');
      expect(header).toContain('aria-controls="site-nav"');
    },
  );
  it.each(productPages)(
    "$slug has the product switcher (the way back, the product current) and the other four products at the end",
    ({ slug, html }) => {
      const name = PRODUCTS.find((p) => p.slug === slug)!.name;
      const start = html.indexOf('aria-label="Trocar de produto"');
      const switcher = html.slice(start, html.indexOf("</nav>", start));
      expect(switcher).toContain('data-nav="back"');
      expect(switcher.match(/data-nav="switch"/g)).toHaveLength(4);
      expect(switcher).toMatch(
        new RegExp(`aria-current="page"><img[^>]*alt="${name}"`),
      );
      const others = html.slice(
        html.indexOf('id="others"'),
        html.indexOf("<footer"),
      );
      expect(others.match(/data-card="[a-z]+"/g)).toHaveLength(4);
      expect(others).not.toContain(`href="/products/${slug}"`);
      expect(visibleText(others)).toContain("Outros produtos");
    },
  );
});

describe("the home has no sequential player and no opening on the chain", () => {
  it("no sequential player anywhere in the page", () => {
    expect(home).not.toMatch(/sequence-player|SequencePlayer|sequence:ended/i);
    expect(home).not.toMatch(/welabs-intro/);
  });
  it("the chain section is native: one scene per step of the chain, no opening, no cover image and no video", () => {
    // The markup the viewer gets; the JSON of the stage is not markup
    const chain = home
      .slice(home.indexOf('id="chain"'), home.indexOf('id="products"'))
      .replace(/<script[\s\S]*?<\/script>/g, "");
    expect(chain).not.toMatch(/intro/);
    expect(chain).not.toMatch(/\/posters\/|hyperframes-player|\.webm|\.mp4/);
    expect(chain.match(/data-tile="s\d"/g)).toHaveLength(CHAIN_STEPS.length);
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
      expect(copyViolation(all)).toBeNull();
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
      // The caption starts on the first tile and is plain text: no live region on a carousel that changes by itself
      expect(html).toMatch(/<p[^>]*data-caption[^>]*>/);
      expect(html).not.toMatch(/aria-live/);
      expect(t).toContain(capabilityOf(capabilityScenes(slug)[0]).detail);
      for (const tie of ties().filter((x) => x.a === slug || x.b === slug))
        expect(t).toContain(TIE_LINES[tieKey(tie.a, tie.b)]);
    },
  );

  it("the home has no live caption: the chain section is not touched by this layer", () => {
    expect(home).not.toContain("data-caption");
  });
});
