// TESTES DA PÁGINA ÚNICA (V2)
// The v2 of the content (approved on 2026-10-20): little text, the rest is motion the visitor plays. The pages are
// rendered on the server (the same HTML the first paint gets) and checked as text: no player, no slogan, the word budget
// of the v2, the order of the sections, the menu, the descent to the next product and the interactions, each a native
// control with a visible label, so it works with no script and with a keyboard.
import { describe, expect, it } from "vitest";
import { introWords, productPage } from "@/lib/content";
import { LOCALES, localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { renderPage } from "@/lib/i18n/render-page";
import {
  KNOWN_PERSONS,
  KNOWN_STACK,
  copyViolation,
  personViolation,
  stackViolation,
  vendorViolation,
} from "@/lib/content/rules";
import { PRODUCTS } from "@/lib/products";
import { generateMetadata as generateHomeMetadata } from "@/app/[locale]/(site)/page";
import { generateMetadata } from "@/app/[locale]/(site)/products/[slug]/page";
import { HOME_CONFIG, productConfig, type PageConfig } from "@/lib/site-config";

// The pages of the site in pt-BR, with the frame (header and footer); the other locales are checked at the end
const pt = getMessages("pt-BR");
const HOME_INTRO = { ...pt.home.intro, words: introWords(pt) };
const NAV = pt.nav;
const PRODUCT_PAGE = {
  domus: productPage(pt, "domus"),
  relloo: productPage(pt, "relloo"),
  magneto: productPage(pt, "magneto"),
  tuner: productPage(pt, "tuner"),
  knowly: productPage(pt, "knowly"),
};
const render = (config: PageConfig, locale: Locale = "pt-BR") =>
  renderPage(config, { locale, frame: true });
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
// but out of the word budget). Every still scene (MiniScene) goes, from its `data-mini` holder to the marker
// `data-mini-end` right after it; v3: so does every kit scene (SceneSlot), from `data-kit` to `data-kit-end`.
const copyOnly = (html: string) =>
  html
    .replace(
      /<div[^>]*data-mini=[\s\S]*?<span[^>]*data-mini-end[^>]*><\/span>/g,
      "",
    )
    .replace(
      /<div[^>]*data-kit=[\s\S]*?<span[^>]*data-kit-end[^>]*><\/span>/g,
      "",
    );
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
      expect(
        copyViolation(`${visibleText(html)} ${hiddenText(html)}`),
      ).toBeNull();
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
    // v4 (brief-v4, 2026-10-23): the approved accordion gives each of the five products its title, line, three points
    // and question, in place of the product cards, the Domus band and what changes, so the ceiling of the home is 400
    const homeWords = wordCount(home);
    expect(homeWords, `home: ${homeWords}`).toBeGreaterThanOrEqual(200);
    expect(homeWords, `home: ${homeWords}`).toBeLessThanOrEqual(400);
    for (const { slug, html } of productPages) {
      const n = wordCount(html);
      expect(n, `${slug}: ${n}`).toBeGreaterThanOrEqual(110);
      expect(n, `${slug}: ${n}`).toBeLessThanOrEqual(230);
    }
  });

  it("every product line has at most four words", () => {
    for (const p of PRODUCTS)
      expect(pt.products[p.slug].line.split(" ").length).toBeLessThanOrEqual(4);
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
  // v4 (brief-v4, 2026-10-23): the opening in blades, the chain the scroll walks, the accordion of the products, the
  // contact and where we run; the Domus band and what changes left (the blades and the accordion show them)
  it("has the sections of the v4, in order", () => {
    const order = [
      "top",
      "intro",
      "message",
      "products",
      "contact",
      "platforms",
    ];
    for (const id of order) expect(at(id), id).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < order.length; i++)
      expect(at(order[i - 1]), order[i]).toBeLessThan(at(order[i]));
    for (const gone of [
      "how",
      "audience",
      "integrations",
      "faq",
      "connectors",
      "chain",
      "domus",
      "operation",
    ])
      expect(at(gone), gone).toBe(-1);
  });

  it("opens with the title as its h1, the word that turns, one line and one button", () => {
    const intro = home.slice(at("intro"), at("message"));
    expect(intro.match(/<h1/g)).toHaveLength(1);
    // Copy review of 2026-10-24: "Software" is banned, the title opens on "Soluções"
    expect(visibleText(intro)).toContain("Soluções para");
    expect(intro.match(/href="\/#contact"/g)).toHaveLength(1);
    expect(visibleText(intro)).toContain("Agendar uma demonstração");
  });

  // v4: the stage in blades opens on the Domus frame, with its seal, and the five marks in the order of the word
  it("the stage in blades opens on the Domus frame, with its seal and the five marks in the order of the turning word", () => {
    const intro = home.slice(at("intro"), at("message"));
    expect(intro).toContain('data-hub="blades"');
    expect(intro).toContain('data-frame="domus"');
    expect(
      intro.match(/data-blade|class="[^"]*blade[^"]*"/g)?.length,
    ).toBeGreaterThanOrEqual(51);
    // TypeIn draws the turning word one character per span
    expect(visibleText(intro).replace(/\s/g, "")).toContain(
      HOME_INTRO.words[0].text.replace(/\s/g, ""),
    );
    const strip = intro.slice(
      intro.indexOf(`aria-label="${HOME_INTRO.stage}"`),
    );
    const marks = [...strip.matchAll(/<li[^>]*><img[^>]*alt="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(marks).toEqual([
      "Welabs Domus",
      "Relloo",
      "Magneto",
      "Tuner",
      "Knowly",
    ]);
  });

  // v4: the chain the scroll walks; the server draws it settled, the order in the Domus with one line per product
  it("the chain crosses the five products and settles as the order in the Domus", () => {
    const msg = home.slice(at("message"), at("products"));
    expect(msg).toContain("data-chain");
    expect(msg.match(/data-station="[a-z]+"/g)).toEqual(
      ["tuner", "relloo", "knowly", "magneto", "domus"].map(
        (s) => `data-station="${s}"`,
      ),
    );
    expect(msg).toContain("data-record");
    expect(visibleText(msg)).toContain("Pedido 1234");
    expect(msg).not.toMatch(/role="progressbar"/);
  });

  it("shows five product cards, each leading to its page, with its line", () => {
    const cards = home.match(/<a [^>]*data-card="[a-z]+"[^>]*>/g) ?? [];
    expect(cards).toHaveLength(5);
    for (const p of PRODUCTS) {
      expect(cards.find((c) => c.includes(`data-card="${p.slug}"`))).toContain(
        `href="/products/${p.slug}"`,
      );
      expect(visibleText(home)).toContain(pt.products[p.slug].line);
    }
  });

  // v4: the accordion of the products, the Domus open at rest, each panel with its question and the call to action
  it("the accordion opens the Domus at rest, and every panel has its frame, its question and the call to action", () => {
    const part = home.slice(at("products"), at("contact"));
    expect(part.match(/data-panel="[a-z]+"/g)).toHaveLength(5);
    expect(part).toMatch(
      /data-grow="panel" data-open="true"[^>]*data-panel="domus"/,
    );
    expect(part.match(/data-open="true"/g)).toHaveLength(1);
    expect(part.match(/href="\/#contact"/g)).toHaveLength(5);
    expect(part).toContain('data-frame="domus"');
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
    const strip = home.slice(
      at("platforms"),
      home.indexOf("</ul>", at("platforms")),
    );
    const names = [...strip.matchAll(/<li>[\s\S]*?<\/li>/g)].map((m) =>
      visibleText(m[0]),
    );
    expect(names).toEqual(["AWS", "Google Cloud", "DigitalOcean", "HostDime"]);
    // Each mark is a mask over the token of the names (F1 review), one file per cloud
    expect(
      strip.match(/--src:url\(&quot;\/platforms\/[^&]+&quot;\)/g),
    ).toHaveLength(4);
  });

  it("every product shows its standalone logo; the seal is only the identity of a product page", () => {
    expect(home).not.toMatch(/-endorsed\.svg/);
    expect(home).toContain('alt="Welabs Domus"');
    expect(home).not.toContain("Welabs Domus by Welabs");
  });

  it("the title of the home is Welabs, without a suffix", async () => {
    const meta = await generateHomeMetadata({
      params: Promise.resolve({ locale: "pt-BR" }),
    });
    expect(meta.title).toBe("Welabs");
  });
});

describe("the product pages", () => {
  it.each(productPages)(
    "$slug has the sections of the v3, in order",
    ({ slug, html }) => {
      const order = [
        "product",
        ...(slug === "domus" ? ["areas"] : []),
        "center",
        "details",
        "contact",
      ];
      const at = (id: string) => html.indexOf(`id="${id}"`);
      for (const id of order) expect(at(id), id).toBeGreaterThanOrEqual(0);
      for (let i = 1; i < order.length; i++)
        expect(at(order[i - 1]), order[i]).toBeLessThan(at(order[i]));
      // v3: the interaction of the product left; its carousel replaces it
      expect(at("play")).toBe(-1);
      expect(html).not.toContain("data-play=");
    },
  );

  it.each(productPages)(
    "$slug opens with the logo with the seal as its h1, its sentence, the button and its carousel",
    ({ slug, html }) => {
      const opening = html.slice(
        html.indexOf('id="product"'),
        html.indexOf(slug === "domus" ? 'id="areas"' : 'id="center"'),
      );
      expect(opening).toMatch(
        new RegExp(`<h1[^>]*><img[^>]*${slug}-light-endorsed\\.svg`),
      );
      expect(visibleText(opening)).toContain(PRODUCT_PAGE[slug].short);
      expect(opening).toContain('href="/#contact"');
      // v3: one kit scene, the carousel of the product, and none of the scenes it replaces
      expect(opening.match(/data-kit="[a-z-]+"/g)).toEqual([
        `data-kit="${slug}-carousel"`,
      ]);
      expect(opening).toContain(`data-scene="${slug}-carousel"`);
      expect(opening).not.toMatch(/data-scenes=|data-tile=|data-mini=/);
    },
  );

  // v3 (operator, 2026-10-21): a product is a page of its own, with no part of the home above or under it
  it.each(productPages)("$slug renders no section of the home", ({ html }) => {
    for (const id of [
      "intro",
      "message",
      "domus",
      "products",
      "operation",
      "platforms",
    ])
      expect(html, id).not.toContain(`<section id="${id}"`);
    expect(html).not.toContain("data-descent-tail");
  });

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
      // An element id, not the `data-id` of a piece inside a kit scene
      expect(html).not.toMatch(/\sid="next"/);
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

  // v3 (F2 review, P-04): the metadata names no part of the stack either (the "RAG" of the Knowly keywords)
  it("keep the stack out of the metadata", async () => {
    for (const { slug } of PRODUCTS) {
      const meta = await generateMetadata({
        params: Promise.resolve({ locale: "pt-BR", slug }),
      });
      const text = [
        meta.description,
        ...((meta.keywords as string[]) ?? []),
      ].join(" ");
      expect(stackViolation(text, []), slug).toBeNull();
    }
  });

  // "Relloo by Welabs" for the products, "Welabs Domus" alone for the platform (decision 3 of 2026-10-29)
  it("follow the 'Relloo by Welabs' pattern in the title, and the platform is 'Welabs Domus'", async () => {
    for (const { slug, name } of PRODUCTS) {
      const meta = await generateMetadata({
        params: Promise.resolve({ locale: "pt-BR", slug }),
      });
      expect(meta.title).toBe(
        slug === "domus" ? "Welabs Domus" : `${name} by Welabs`,
      );
    }
  });
});

// IDIOMAS
// The same pages in each locale: the document is written and linked in it, the addresses carry the prefix of en and es
// (pt-BR has none), the selector offers the three languages and the metadata says where the other languages are.
describe("the pages by locale", () => {
  const prefix = (locale: Locale) => (locale === "pt-BR" ? "" : `/${locale}`);
  const sample = [HOME_CONFIG, productConfig("relloo")];

  it.each(LOCALES)(
    "%s: every address of the frame and of the page keeps the locale",
    (locale) => {
      for (const config of sample) {
        const html = render(config, locale);
        const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
        for (const href of hrefs) {
          // Files (fonts, logos) are not pages; every page address starts with the prefix of the locale
          if (/\.(woff2|svg|png|webp|css|js)$/.test(href)) continue;
          if (locale === "pt-BR")
            expect(href, `${locale} ${href}`).not.toMatch(/^\/(en|es)(\/|#|$)/);
          else
            expect(href, `${locale} ${href}`).toMatch(
              new RegExp(`^/${locale}([/#?]|$)`),
            );
        }
        expect(hrefs.length).toBeGreaterThan(5);
      }
    },
  );

  it.each(LOCALES)(
    "%s: the call to action lands on the contact of the home of the locale",
    (locale) => {
      const html = render(productConfig("tuner"), locale);
      expect(html).toContain(`href="${localizePath(locale, "/#contact")}"`);
      expect(html).toContain(`href="${prefix(locale)}/products/domus"`);
    },
  );

  it.each(LOCALES)(
    "%s: the header has the language selector with the current code",
    (locale) => {
      const html = render(HOME_CONFIG, locale);
      const header = html.slice(
        html.indexOf("<header"),
        html.indexOf("</header>"),
      );
      expect(header).toContain('data-locale-trigger=""');
      expect(header).toContain(
        locale === "pt-BR" ? ">PT<" : `>${locale.toUpperCase()}<`,
      );
    },
  );

  it.each(LOCALES)(
    "%s: the metadata names the same page in every language",
    async (locale) => {
      const meta = await generateMetadata({
        params: Promise.resolve({ locale, slug: "knowly" }),
      });
      const languages = meta.alternates?.languages as Record<string, string>;
      expect(languages).toEqual({
        "pt-BR": "/products/knowly",
        en: "/en/products/knowly",
        es: "/es/products/knowly",
        "x-default": "/products/knowly",
      });
      expect(meta.alternates?.canonical).toBe(
        `${prefix(locale)}/products/knowly`,
      );
      const home = await generateHomeMetadata({
        params: Promise.resolve({ locale }),
      });
      expect((home.alternates?.languages as Record<string, string>).en).toBe(
        "/en",
      );
      expect(home.alternates?.canonical).toBe(prefix(locale) || "/");
    },
  );
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
  it.each(pages)(
    "$slug marks every band live, so motion pauses off screen",
    ({ html }) => {
      // The bands of the page carry an id (Section.tsx); a `<section>` inside a kit scene is a pane of its screen, and
      // the kit pauses it on its own (data-on of Scene.tsx)
      const bands = html.match(/<section id="[^"]*"[^>]*>/g) ?? [];
      expect(bands.length).toBeGreaterThanOrEqual(4);
      for (const band of bands) expect(band).toContain("data-live");
    },
  );
});
