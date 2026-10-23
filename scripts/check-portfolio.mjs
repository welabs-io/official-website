import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// VERIFICAÇÃO DO SITE CONTRA O PREVIEW
// Checks what the Welabs site serves today against a running server (PORTFOLIO_PREVIEW_URL, default 3000): the home
// and the product pages, the one-hop redirects of every old address, the logo files the pages reference, the metadata
// and the operator's rules (no player, no video, no slogan, no banned word) with the word budget of the v2 of the
// content (2026-10-20: little text, the rest is motion the visitor plays).
const base = process.env.PORTFOLIO_PREVIEW_URL || "http://127.0.0.1:3000";
const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"];

const get = async (url, status = 200) => {
  const r = await fetch(base + url);
  assert.equal(r.status, status, url);
  return r;
};
const expectRedirect = async (from, to) => {
  const r = await fetch(base + from, { redirect: "manual" });
  assert.equal(r.status, 308, `${from} is a permanent redirect`);
  assert.equal(
    new URL(r.headers.get("location"), base).href,
    new URL(to, base).href,
    from,
  );
};

// Text a person reads: no head, scripts, styles or tags
const visibleText = (html) =>
  html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
// Text a screen reader reads: every alt and accessible name, the names of the scene tiles included
const hiddenText = (html) =>
  [...html.matchAll(/(?:alt|aria-label)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(" ");

// The copy rules are ONE list, shared with the tests (lib/content/rules.ts reads the same file): slogan verbs, banned
// words ("cliente", "erp"...), slogan phrases, and the closed list of expressions where "entrega" is a noun
const rules = JSON.parse(
  readFileSync(new URL("../lib/content/copy-rules.json", import.meta.url)),
);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const WORDS = new RegExp(`\\b(?:${rules.words.map(esc).join("|")})\\b`, "i");
const PHRASES = new RegExp(rules.phrases.map(esc).join("|"), "i");
const ALLOWED = new RegExp(rules.allowed.map(esc).join("|"), "gi");
const violation = (text) => {
  const clean = text.replace(ALLOWED, " ");
  return clean.match(WORDS)?.[0] ?? clean.match(PHRASES)?.[0] ?? null;
};
// v3: names of people and of the internal stack (case-sensitive, whole words with a unicode edge), besides the known
// failures of the same file, each tolerated until the phase that removes it
const listMatcher = (list) =>
  new RegExp(
    `(?:^|[^\\p{L}])(${list.map(esc).join("|")})(?=[^\\p{L}]|$)`,
    "gu",
  );
const firstOf = (matcher, known, text) => {
  const skip = new Set(known.map((k) => k.value));
  for (const m of text.matchAll(matcher)) if (!skip.has(m[1])) return m[1];
  return null;
};
const PERSONS = listMatcher(rules.persons);
const STACK = listMatcher(rules.stack);
const IMAGINE_SYSTEMS = /stant|tabe\.la|tabela|wego/i;

const pages = new Map();
const page = async (url) => {
  const html = await (await get(url)).text();
  pages.set(url, html);
  assert(!/role="progressbar"|Pausar|Retomar/i.test(html), `${url} has a bar`);
  assert(!/<video|<iframe|<audio/i.test(html), `${url} has a video element`);
  assert(
    !/hyperframes-player|\.mp4|\.webm|\/motion\//i.test(html),
    `${url} references a player, a video file or a motion piece`,
  );
  const all = `${visibleText(html)} ${hiddenText(html)}`;
  assert(!violation(all), `${url} breaks the copy rules: ${violation(all)}`);
  const person = firstOf(PERSONS, rules.known.persons, all);
  assert(!person, `${url} names a person: ${person}`);
  const stack = firstOf(STACK, rules.known.stack, all);
  assert(!stack, `${url} shows the internal stack: ${stack}`);
  return html;
};

// The words of the page copy: the text drawn inside the native scenes is product interface (a screen), not copy, so
// every still scene (data-mini ... data-mini-end) and every kit scene (v3: data-kit ... data-kit-end, SceneSlot) are
// left out of the count; the slogan and banned-word rules above still read them
const copyOnly = (html) =>
  html
    .replace(
      /<div[^>]*data-mini=[\s\S]*?<span[^>]*data-mini-end[^>]*><\/span>/g,
      "",
    )
    .replace(
      /<div[^>]*data-kit=[\s\S]*?<span[^>]*data-kit-end[^>]*><\/span>/g,
      "",
    );
const countWords = (html) => visibleText(copyOnly(html)).split(" ").length;

// The menu is on every page: the five products and the Domus, the button to the contact; the logo leads to the home
const hasMenu = (html) => {
  const header = html.slice(html.indexOf("<header"), html.indexOf("</header>"));
  return (
    header.includes('href="/"') &&
    header.includes('href="/#contact"') &&
    SLUGS.every((s) => header.includes(`href="/products/${s}"`))
  );
};

// HOME: abertura, mensagem, Domus, produtos, o que muda, contato, onde rodamos (v2.1: o encaixe saiu)
const home = await page("/");
const HOME_ORDER = [
  "top",
  "intro",
  "message",
  "domus",
  "products",
  "operation",
  "contact",
  "platforms",
];
for (const id of HOME_ORDER)
  assert(home.includes(`id="${id}"`), `home has section #${id}`);
for (let i = 1; i < HOME_ORDER.length; i++)
  assert(
    home.indexOf(`id="${HOME_ORDER[i - 1]}"`) <
      home.indexOf(`id="${HOME_ORDER[i]}"`),
    `sections come in order: ${HOME_ORDER.join(", ")}`,
  );
for (const gone of ["how", "audience", "integrations", "faq", "connectors"])
  assert(!home.includes(`id="${gone}"`), `the section #${gone} left the home`);
assert(hasMenu(home), "the home header has the menu and the logo link");
// The bands carry an id; a `<section>` inside a kit scene is a pane of its screen, paused by the kit itself
const bands = (html) => html.match(/<section id="[^"]*"[^>]*>/g) ?? [];
assert(
  bands(home).every((s) => s.includes("data-live")),
  "every band is marked live (motion pauses off screen)",
);
assert(
  /<h1[\s\S]*?Software para/.test(home),
  "the title of the home is its h1",
);
assert(home.includes('data-hub="cycle"'), "the stage of the opening cycles");
assert(
  home.includes('id="area-add"') && home.includes('for="area-add"'),
  "the interaction #area-add has a native control and a visible label",
);
// v3 (2026-10-23): the chain is the kit scene home-message (SceneSlot)
assert(
  home
    .slice(home.indexOf('id="message"'), home.indexOf('id="domus"'))
    .includes('data-kit="home-message"'),
  "the message band mounts the kit scene home-message",
);
assert(
  (home.slice(home.indexOf('id="operation"')).match(/data-mini="s\d"/g) ?? [])
    .length === 3,
  "what changes shows three still native scenes",
);
assert(!/mailto:|wa\.me|<form/.test(home), "the contact is the button only");
assert(
  !/products\/\w+-(?:dark|light)-endorsed\.svg/.test(home),
  "the seal is only the identity highlight of the product page, not the home",
);
assert(/href="\/#contact"/.test(home), "CTA points to the contact section");
const words = countWords(home);
// The v2 budget: 200 to 300 visible words on the home (700 to 1000 before it)
assert(words >= 200 && words <= 300, `home has ${words} visible words`);
// Five product cards, each leading to its page, in weight order
const cards = home.match(/<a [^>]*data-card="[a-z]+"[^>]*>/g) ?? [];
assert.deepEqual(
  cards.map((c) => c.match(/data-card="([a-z]+)"/)[1]),
  SLUGS,
  "the home has five product cards, in weight order",
);
for (const slug of SLUGS)
  assert(
    home.includes(`href="/products/${slug}"`),
    `the home links to /products/${slug}`,
  );
// No client brand on the Welabs site (operator, 2026-10-20): logos would need the client's consent
assert.equal(
  [...home.matchAll(/src="\/clients\/[^"]+"/g)].length,
  0,
  "no client logo on the home",
);
assert(
  !IMAGINE_SYSTEMS.test(
    visibleText(home.slice(home.indexOf('id="platforms"'))),
  ),
  "no Imagine system in the strip of platforms",
);
// v3 (F1): the four clouds the operator asked for, and nothing else of the infrastructure
const strip = home.slice(
  home.indexOf('id="platforms"'),
  home.indexOf("</ul>", home.indexOf('id="platforms"')),
);
assert.deepEqual(
  [...strip.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => visibleText(m[1])),
  ["AWS", "Google Cloud", "DigitalOcean", "HostDime"],
  "the strip names exactly the four clouds",
);
// v3 (F1): every button lands on the contact of the home, so that band never links to itself and has a way out
const homeContact = home.slice(
  home.indexOf('id="contact"'),
  home.indexOf('id="platforms"'),
);
assert(
  !homeContact.includes("#contact") && /<a [^>]*href="[^"]+"/.test(homeContact),
  "the contact of the home has an action that does not lead to itself",
);

// PÁGINAS DE PRODUTO: logo com selo, metadado de categoria, zero player, o carrossel do produto, página autônoma
for (const slug of SLUGS) {
  const html = await page(`/products/${slug}`);
  assert(
    new RegExp(`${slug}-light-endorsed\\.svg`).test(html),
    `${slug} page has the logo with seal`,
  );
  assert(
    /<meta name="keywords" content="[^"]+"/.test(html),
    `${slug} keywords`,
  );
  // v3 (operator, 2026-10-21): a product is a page of its own, the slot of the site frame holds the product alone
  const slot = html.slice(
    html.indexOf("data-descent-slot"),
    html.indexOf("<footer"),
  );
  assert(
    html.indexOf("data-descent-slot") > 0 &&
      !html.includes("data-descent-tail") &&
      ["intro", "message", "domus", "products", "operation", "platforms"].every(
        (id) => !html.includes(`<section id="${id}"`),
      ),
    `${slug} page renders no section of the home`,
  );
  assert(
    bands(html).every((s) => s.includes("data-live")),
    `${slug}: every band is marked live (motion pauses off screen)`,
  );
  const productWords = countWords(html);
  // The v2 budget: 110 to 230 visible words on a product page (400 to 700 before it)
  assert(
    productWords >= 110 && productWords <= 230,
    `${slug} has ${productWords} visible words`,
  );
  assert(hasMenu(html), `${slug} header has the menu and the logo link`);
  // v2.1: the door to the next product left; the five products are a selector at the top of the product
  const switcher = slot.slice(
    slot.indexOf('aria-label="Os cinco produtos"'),
    slot.indexOf("</nav>", slot.indexOf('aria-label="Os cinco produtos"')),
  );
  assert(
    !/\sid="next"/.test(slot) &&
      !slot.includes("data-door") &&
      SLUGS.every((s) => switcher.includes(`href="/products/${s}"`)) &&
      (switcher.match(/aria-current="page"/g) ?? []).length === 1,
    `${slug} opens with the selector of the five products, with no door at its end`,
  );
  assert(
    /<title>[^<]* by Welabs<\/title>/.test(html),
    `${slug} title follows the "<Product> by Welabs" pattern`,
  );
  const at = (id) => slot.indexOf(`id="${id}"`);
  const PRODUCT_ORDER = [
    "product",
    ...(slug === "domus" ? ["areas"] : []),
    "center",
    "details",
    "contact",
  ];
  assert(
    PRODUCT_ORDER.every(
      (id, i) => at(id) >= 0 && (i === 0 || at(PRODUCT_ORDER[i - 1]) < at(id)),
    ),
    `${slug} page has its sections in order: ${PRODUCT_ORDER.join(", ")}`,
  );
  // v3 (2026-10-23): the carousel of the product (a kit scene, SceneSlot) opens the page, in place of the play
  const opening = slot.slice(
    at("product"),
    at(slug === "domus" ? "areas" : "center"),
  );
  assert(
    opening.includes(`data-kit="${slug}-carousel"`) &&
      at("play") < 0 &&
      !slot.includes("data-play="),
    `${slug} opens with its carousel and has no play`,
  );
  const center = slot.slice(at("center"), at("details"));
  assert(
    center.includes('aria-current="page"') &&
      !center.includes(`href="/products/${slug}"`),
    `${slug} is itself among the others and does not link to itself`,
  );
  for (const other of SLUGS.filter((s) => s !== slug))
    assert(
      center.includes(`href="/products/${other}"`),
      `${slug} stage links to ${other}`,
    );
}
// The workbench of the video montage left with the videos
await get("/lab/chain", 404);

// ARQUIVOS REFERENCIADOS (logos, marcas, favicons, a fonte) respondem 200
const assets = new Set();
for (const html of pages.values())
  for (const [, src] of html.matchAll(
    /(?:src|href)="(\/(?:brands|clients|platforms|fonts)\/[^"]+)"/g,
  ))
    assets.add(src);
// v3 (F1 review): the marks of the platforms are CSS masks, so their files are in a style attribute
for (const html of pages.values())
  for (const [, src] of html.matchAll(
    /url\((?:&quot;|")?(\/platforms\/[^"&)]+)(?:&quot;|")?\)/g,
  ))
    assets.add(src);
for (const src of assets) await get(src);

// REDIRECIONAMENTOS: um salto, 308, destino final com 200
await expectRedirect("/new", "/");
await expectRedirect("/produtos", "/#products");
await expectRedirect("/solucoes", "/#products");
await expectRedirect("/sobre", "/#message");
await expectRedirect("/products", "/#products");
await expectRedirect("/solutions", "/#products");
await expectRedirect("/about", "/#message");
for (const slug of SLUGS)
  await expectRedirect(`/produtos/${slug}`, `/products/${slug}`);
for (const [from, to] of [
  ["erp", "domus"],
  ["flow", "magneto"],
  ["wekb", "knowly"],
  ["welabs-crm", "relloo"],
  ["channels", "tuner"],
  ["rello", "relloo"],
  ["hub-de-dominio", "domus"],
]) {
  await expectRedirect(`/produtos/${from}`, `/products/${to}`);
  await expectRedirect(`/products/${from}`, `/products/${to}`);
  await expectRedirect(`/welabs/produtos/${from}`, `/products/${to}`);
}
await expectRedirect("/produtos/domus?x=1", "/products/domus?x=1");
await expectRedirect("/welabs", "/");
await expectRedirect("/welabs/sobre", "/#message");
// O produto oculto volta para a seção de produtos (temporário)
const hidden = await fetch(base + "/produtos/ecossistema-monitoramento", {
  redirect: "manual",
});
assert.equal(hidden.status, 307);
assert.equal(
  new URL(hidden.headers.get("location"), base).href,
  base + "/#products",
);
// Endereço inexistente
await get("/products/unknown", 404);

console.log(
  `check-portfolio: ok (${pages.size} pages, ${assets.size} assets, ${words} visible words on the home)`,
);
