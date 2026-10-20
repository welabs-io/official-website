// TESTES DA PÁGINA ÚNICA (V2)
// The v2 of the content (approved on 2026-10-20): little text, the rest is motion the visitor plays. The pages are
// rendered on the server (the same HTML the first paint gets) and checked as text: no player, no slogan, the word budget
// of the v2, the order of the sections, the menu, the descent to the next product and the interactions, each a native
// control with a visible label, so it works with no script and with a keyboard.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageFrame } from "@/components/onepage/PageFrame";
import { NAV, PRODUCT_PAGE } from "@/lib/content";
import { copyViolation } from "@/lib/content/rules";
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
      "chain",
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
    for (const gone of ["how", "audience", "integrations", "faq", "connectors"])
      expect(at(gone), gone).toBe(-1);
  });

  it("opens with the title as its h1, the word that turns, one line and one button", () => {
    const intro = home.slice(at("intro"), at("chain"));
    expect(intro.match(/<h1/g)).toHaveLength(1);
    expect(visibleText(intro)).toContain("Software para");
    expect(intro.match(/href="\/#contact"/g)).toHaveLength(1);
    expect(visibleText(intro)).toContain("Agendar uma demonstração");
  });

  it("the stage lights the products in the order of the turning word, every product a link", () => {
    const intro = home.slice(at("intro"), at("chain"));
    expect(intro).toContain('data-orbit="cycle"');
    for (const p of PRODUCTS)
      expect(intro).toContain(`href="/products/${p.slug}"`);
    // Five ties drawn, each with one amber copy per end
    expect(intro.match(/<line /g)).toHaveLength(15);
  });

  it("the film of the fitting pieces has no text, only a name for assistive technology", () => {
    const fit = home.slice(
      home.indexOf(">", at("chain")) + 1,
      home.lastIndexOf("<section", at("message")),
    );
    expect(visibleText(fit)).toBe("Os produtos se encaixam");
    expect(fit).toContain('role="img"');
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

  it("the contact asks open questions and has only the button: no form, no address that was not given", () => {
    const contact = home.slice(at("contact"), at("platforms"));
    expect(contact).not.toMatch(/<form|<input|mailto:|wa\.me/);
    expect(contact.match(/<li>/g)!.length).toBeGreaterThanOrEqual(3);
    expect(contact).toContain('href="/#contact"');
  });

  it("where we run names every platform under its mark", () => {
    const strip = home.slice(at("platforms"));
    for (const name of ["AWS", "DigitalOcean", "HostDime", "Google Cloud"])
      expect(visibleText(strip)).toContain(name);
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
        "next",
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
      expect(center).toContain('data-orbit="still"');
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
    // The descent model (PR #27): no switcher and no list of the others; the way back is up the page and the way on is
    // the door at the end, which leads to the next product in the order of the list
    "$slug ends on the door to the next product, with no switcher",
    ({ slug, html }) => {
      const next =
        PRODUCTS[
          (PRODUCTS.findIndex((p) => p.slug === slug) + 1) % PRODUCTS.length
        ];
      expect(html).not.toContain('aria-label="Trocar de produto"');
      expect(html).not.toContain('id="others"');
      const door = html.slice(html.indexOf('id="next"'), html.indexOf("<footer"));
      expect(door.match(/data-door="[a-z]+"/g)).toEqual([
        `data-door="${next.slug}"`,
      ]);
      expect(door).toContain(`href="/products/${next.slug}"`);
      // The name of the link is what it shows: the label, the logo of the product (its alt) and its line
      expect(door).not.toContain("aria-label=");
      expect(visibleText(door)).toContain(NAV.next);
      expect(door).toContain(`alt="${next.name}"`);
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
