// TESTES DA PÁGINA ÚNICA (V2)
// The v2 of the content (approved on 2026-10-20): little text, the rest is motion the visitor plays. The pages are
// rendered on the server (the same HTML the first paint gets) and checked as text: no player, no slogan, the word budget
// of the v2, the order of the sections, the menu, the descent to the next product and the interactions, each a native
// control with a visible label, so it works with no script and with a keyboard.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageFrame } from "@/components/onepage/PageFrame";
import { HOME_INTRO, NAV, PRODUCT_PAGE } from "@/lib/content";
import {
  KNOWN_PERSONS,
  KNOWN_STACK,
  copyViolation,
  personViolation,
  stackViolation,
  vendorViolation,
} from "@/lib/content/rules";
import { PRODUCTS } from "@/lib/products";
import { metadata as homeMetadata } from "@/app/(site)/page";
import { generateMetadata } from "@/app/(site)/products/[slug]/page";
import { HOME_CONFIG, productConfig, type PageConfig } from "@/lib/site-config";
import { Sections } from "./SiteTemplate";

const render = (config: PageConfig) =>
  renderToStaticMarkup(
    <PageFrame>
      <Sections config={config} />
    </PageFrame>,
  );
const home = render(HOME_CONFIG);
const productPages = PRODUCTS.map((p) => ({
  slug: p.slug,
  html: render(productConfig(p.slug)),
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
// Text that only assistive technology gets: every alt and accessible name
const hiddenText = (html: string) =>
  [...html.matchAll(/(?:alt|aria-label)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(" ");

// Text of the page copy: the native scenes draw product screens, whose words are interface (checked by the copy rules,
// but out of the word budget). The stage of a product opening goes, from its tiles to its data; so does every still
// scene (MiniScene), from its `data-mini` holder to the marker `data-mini-end` right after it.
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
const wordCount = (html: string) =>
  visibleText(copyOnly(html)).split(" ").length;

describe("pages carry no player interface", () => {
  it.each(pages)(
    "$slug has no progress bar, no pause button, no controls and no video",
    ({ html }) => {
      expect(html).not.toMatch(/role="progressbar"|<progress\b/i);
      expect(html).not.toMatch(/Pausar|Retomar/i);
      expect(html).not.toMatch(/<video|<iframe|<audio|hyperframes-player/i);
      expect(html).not.toMatch(/\.(mp4|webm|mov)\b/i);
    },
  );
});

describe("little text, no slogan", () => {
  it.each(pages)(
    "$slug carries no slogan, banned word or maturity marker in what it shows or announces",
    ({ html }) => {
      expect(copyViolation(`${visibleText(html)} ${hiddenText(html)}`)).toBeNull();
    },
  );

  // v3: no person by name and no internal stack, besides the known failures of copy-rules.json (each with its phase)
  it.each(pages)(
    "$slug names no person and shows no internal stack",
    ({ html }) => {
      const text = `${visibleText(html)} ${hiddenText(html)}`;
      expect(personViolation(text)).toBeNull();
      expect(stackViolation(text)).toBeNull();
      // v3 (F1 review): a third-party brand only inside brackets, as an example of its category
      expect(vendorViolation(text)).toBeNull();
    },
  );

  it("every tolerated known failure is still on the site (delete it from copy-rules.json `known` when its phase lands)", () => {
    const all = pages
      .map(({ html }) => `${visibleText(html)} ${hiddenText(html)}`)
      .join(" ");
    for (const k of KNOWN_PERSONS)
      expect(all, `${k.value} (${k.phase})`).toContain(k.value);
    for (const k of KNOWN_STACK)
      expect(all, `${k.value} (${k.phase})`).toContain(k.value);
  });

  it("the home and every product page stay inside the word budget of the v2", () => {
    // v2 (2026-10-20): the home went from 700-1000 words to about 250, a product page from 400-700 to about 200; the
    // floor guards against a section losing its words, the ceiling against text creeping back in. Frame included.
    const homeWords = wordCount(home);
    expect(homeWords, `home: ${homeWords}`).toBeGreaterThanOrEqual(200);
    expect(homeWords, `home: ${homeWords}`).toBeLessThanOrEqual(300);
    for (const { slug, html } of productPages) {
      const n = wordCount(html);
      expect(n, `${slug}: ${n}`).toBeGreaterThanOrEqual(110);
      expect(n, `${slug}: ${n}`).toBeLessThanOrEqual(230);
    }
  });

  it("every product line has at most four words", () => {
    for (const p of PRODUCTS)
      expect(p.line.split(" ").length).toBeLessThanOrEqual(4);
  });

  it("names no company: the portfolio has no scope confirmed to attribute a case", () => {
    const body = visibleText(copyOnly(home));
    for (const company of [
      "Light",
      "Neoenergia",
      "Enel",
      "Kiosk",
      "IMA",
      "AVSI",
      "Stant",
      "WeGO",
    ])
      expect(body).not.toMatch(new RegExp(`\\b${company}\\b`));
    expect(home).not.toMatch(/src="\/clients\//);
  });
});

describe("the home", () => {
  const at = (id: string) => home.indexOf(`id="${id}"`);
  it("has the sections of the v2, in order", () => {
    const order = [
      "top",
      "intro",
      "message",
      "domus",
      "products",
      "operation",
      "contact",
      "platforms",
    ];
    for (const id of order) expect(at(id), id).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < order.length; i++)
      expect(at(order[i - 1]), order[i]).toBeLessThan(at(order[i]));
    // v2.1: the film of the fitting pieces (#chain) left, a drawing with no function
    for (const gone of ["how", "audience", "integrations", "faq", "connectors", "chain"])
      expect(at(gone), gone).toBe(-1);
  });

  it("opens with the title as its h1, the word that turns, one line and one button", () => {
    const intro = home.slice(at("intro"), at("message"));
    expect(intro.match(/<h1/g)).toHaveLength(1);
    expect(visibleText(intro)).toContain("Software para");
    expect(intro.match(/href="\/#contact"/g)).toHaveLength(1);
    expect(visibleText(intro)).toContain("Agendar uma demonstração");
  });

  it("the stage lights the products in the order of the turning word, every product a link", () => {
    const intro = home.slice(at("intro"), at("message"));
    expect(intro).toContain('data-hub="cycle"');
    for (const p of PRODUCTS)
      expect(intro).toContain(`href="/products/${p.slug}"`);
    // v2.1: four ties to the record (each carries its packet) and the record of the Domus with one line per product
    expect(intro.match(/<span[^>]*data-of="(relloo|magneto|tuner|knowly)"[^>]*aria-hidden="true"/g)).toHaveLength(4);
    // ...and every piece that lights in the cycle carries its window: 4 ties and 5 lines of the record
    expect(intro.match(/data-of="(domus|relloo|magneto|tuner|knowly)" style/g)).toHaveLength(9);
    expect(visibleText(intro)).toContain(HOME_INTRO.record.title);
  });

  it("the message is dragged or sent with a visible button, and walks through the five products", () => {
    const msg = home.slice(at("message"), at("domus"));
    expect(msg).toMatch(/<input type="checkbox" id="msg-go"/);
    expect(msg).toMatch(/<label[^>]*for="msg-go"/);
    expect(msg).toContain("data-drag");
    expect(msg.match(/<li[^>]*style="--i:\d"/g)).toHaveLength(5);
  });

  it("the Domus is the whole company, with a room the visitor makes and the other products on its ground", () => {
    const domus = home.slice(at("domus"), at("products"));
    for (const area of ["Vendas", "Compras", "Estoque", "Produção", "Projetos"])
      expect(visibleText(domus)).toContain(area);
    expect(domus).toMatch(/<input type="checkbox" id="area-add"/);
    expect(domus).toMatch(/<label[^>]*for="area-add"/);
    for (const p of PRODUCTS.filter((x) => x.slug !== "domus"))
      expect(domus).toContain(`href="/products/${p.slug}"`);
    expect(domus).toContain('href="/products/domus"');
  });

  it("shows five product cards, each leading to its page, with its line", () => {
    const cards = home.match(/<a [^>]*data-card="[a-z]+"[^>]*>/g) ?? [];
    expect(cards).toHaveLength(5);
    for (const p of PRODUCTS) {
      expect(cards.find((c) => c.includes(`data-card="${p.slug}"`))).toContain(
        `href="/products/${p.slug}"`,
      );
      expect(visibleText(home)).toContain(p.line);
    }
  });

  it("what changes is three still native scenes, the outcome only", () => {
    const part = home.slice(at("operation"), at("contact"));
    expect(part.match(/data-mini="s\d"/g)).toHaveLength(3);
  });

  // v3 (F1): every button of the site lands on this band, so it never links to itself (the loop of plano.md 1.3); its
  // way out is the products band until the operator decides where a request goes
  it("the contact asks open questions as an agenda and never links to itself: no form, no address that was not given", () => {
    const contact = home.slice(at("contact"), at("platforms"));
    expect(contact).not.toMatch(/<form|<input|<button|mailto:|wa\.me/);
    expect(contact).toMatch(/<ol[^>]*aria-label="Perguntas para a conversa"/);
    expect(contact.match(/<li>/g)!.length).toBeGreaterThanOrEqual(3);
    expect(contact).not.toContain("#contact");
    expect(contact).toContain('href="/#products"');
    expect(at("products")).toBeGreaterThanOrEqual(0);
  });

  // v3 (F1): the four clouds the operator asked for, and nothing else (no internal stack)
  it("where we run names exactly the four clouds, each beside its mark", () => {
    const strip = home.slice(at("platforms"), home.indexOf("</ul>", at("platforms")));
    const names = [...strip.matchAll(/<li>[\s\S]*?<\/li>/g)].map((m) =>
      visibleText(m[0]),
    );
    expect(names).toEqual(["AWS", "Google Cloud", "DigitalOcean", "HostDime"]);
    // Each mark is a mask over the token of the names (F1 review), one file per cloud
    expect(strip.match(/--src:url\(&quot;\/platforms\/[^&]+&quot;\)/g)).toHaveLength(4);
  });

  it("every product shows its standalone logo; the seal is only the identity of a product page", () => {
    expect(home).not.toMatch(/-endorsed\.svg/);
    expect(home).toContain('alt="Domus by Welabs"');
  });

  it("the title of the home is Welabs, without a suffix", () => {
    expect(homeMetadata.title).toBe("Welabs");
  });
});

describe("the product pages", () => {
  it.each(productPages)(
    "$slug has the sections of the v2, in order",
    ({ slug, html }) => {
      const order = [
        "product",
        ...(slug === "domus" ? ["areas"] : []),
        "play",
        "center",
        "details",
        "contact",
      ];
      const at = (id: string) => html.indexOf(`id="${id}"`);
      for (const id of order) expect(at(id), id).toBeGreaterThanOrEqual(0);
      for (let i = 1; i < order.length; i++)
        expect(at(order[i - 1]), order[i]).toBeLessThan(at(order[i]));
    },
  );

  it.each(productPages)(
    "$slug opens with the logo with the seal as its h1, its sentence and the button",
    ({ slug, html }) => {
      const opening = html.slice(
        html.indexOf('id="product"'),
        html.indexOf('id="play"') > 0 && slug !== "domus"
          ? html.indexOf('id="play"')
          : html.indexOf('id="areas"'),
      );
      expect(opening).toMatch(
        new RegExp(`<h1[^>]*><img[^>]*${slug}-light-endorsed\\.svg`),
      );
      expect(visibleText(opening)).toContain(PRODUCT_PAGE[slug].short);
      expect(opening).toContain('href="/#contact"');
      // The Domus opens with its areas, every other product with the stage of its native scenes
      if (slug === "domus") expect(opening).not.toContain("data-scenes");
      else
        expect(opening.match(/data-tile="/g)).toHaveLength(
          PRODUCT_PAGE[slug].scenes.length,
        );
    },
  );

  it.each(productPages)(
    "$slug has one interaction, a native control with a visible label",
    ({ slug, html }) => {
      const play = html.slice(
        html.indexOf('id="play"'),
        html.indexOf('id="center"'),
      );
      expect(play).toContain(`data-play="${slug}"`);
      expect(play).toMatch(/<input type="(checkbox|radio)"/);
      expect(play).toMatch(/<label[^>]*for="/);
    },
  );

  it.each(productPages)(
    "$slug lights itself among the others (the Domus lights a product working on it) and does not link to itself",
    ({ slug, html }) => {
      const center = html.slice(
        html.indexOf('id="center"'),
        html.indexOf('id="details"'),
      );
      expect(center).toContain('data-hub="still"');
      expect(center).toContain(
        `data-lit="${slug === "domus" ? "relloo" : slug}"`,
      );
      expect(center).toContain('aria-current="page"');
      expect(center).not.toContain(`href="/products/${slug}"`);
      for (const p of PRODUCTS.filter((x) => x.slug !== slug))
        expect(center).toContain(`href="/products/${p.slug}"`);
    },
  );

  it.each(productPages)(
    // v2.1: the door "Próximo produto" left the end of a product; the five products are a selector at its top, the
    // product of the page marked as the current one and the four others links to their pages
    "$slug opens with the selector of the five products and ends on its contact",
    ({ slug, html }) => {
      expect(html).not.toContain("data-door");
      expect(html).not.toContain('id="next"');
      const at = html.indexOf(`aria-label="${NAV.switch}"`);
      expect(at).toBeGreaterThan(html.indexOf('id="product"'));
      const nav = html.slice(at, html.indexOf("</nav>", at));
      for (const p of PRODUCTS)
        expect(nav).toContain(`href="/products/${p.slug}"`);
      const current = nav.match(/<a[^>]*aria-current="page"[^>]*>/g) ?? [];
      expect(current).toHaveLength(1);
      expect(current[0]).toContain(`href="/products/${slug}"`);
      const sections = html.match(/<section id="([a-z]+)"/g) ?? [];
      expect(sections.at(-1)).toBe('<section id="contact"');
    },
  );

  // v3 (F1): the button of a product's contact leads to the contact of the home (another band, with its own way out)
  it.each(productPages)(
    "$slug ends on its questions and the button to the contact of the home",
    ({ html }) => {
      const contact = html.slice(html.indexOf('<section id="contact"'));
      expect(contact).toMatch(/<ol[^>]*aria-label="Perguntas para a conversa"/);
      expect(contact).toContain('href="/#contact"');
      expect(contact).not.toMatch(/href="#contact"|<form|<button/);
    },
  );

  it("follow the 'Domus by Welabs' pattern in the title", async () => {
    for (const { slug, name } of PRODUCTS) {
      const meta = await generateMetadata({
        params: Promise.resolve({ slug }),
      });
      expect(meta.title).toBe(`${name} by Welabs`);
    }
  });
});

describe("navigation on every page", () => {
  it.each(pages)(
    "$slug has the menu (the five products and the Domus), the button and the logo that leads to the home",
    ({ html }) => {
      const header = html.slice(
        html.indexOf("<header"),
        html.indexOf("</header>"),
      );
      expect(header).toContain('href="/"');
      expect(header).toContain('aria-label="Welabs, início"');
      for (const p of PRODUCTS)
        expect(header).toContain(`href="/products/${p.slug}"`);
      expect(header).toContain('href="/#contact"');
      expect(header).toContain('aria-controls="site-nav"');
      expect(header).not.toContain('href="/#how"');
    },
  );
  it.each(pages)("$slug marks every band live, so motion pauses off screen", ({ html }) => {
    const bands = html.match(/<section[^>]*>/g) ?? [];
    expect(bands.length).toBeGreaterThan(4);
    for (const band of bands) expect(band).toContain("data-live");
  });
});
