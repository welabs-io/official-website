import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// VERIFICAÇÃO DO SITE CONTRA O PREVIEW
// Checks what the Welabs site serves today against a running server (PORTFOLIO_PREVIEW_URL, default 3000): the home
// and the product pages, the one-hop redirects of every old address, the logo files the pages reference, the metadata
// and the operator's rules of 2026-10-09 (no player, no video, little text, no slogan, no banned word).
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
  return html;
};

// HOME: cadeia, produtos, conectores e fechamento, ordem de peso, selo, carrosséis
const home = await page("/");
for (const id of [
  "top",
  "chain",
  "products",
  "connectors",
  "platforms",
  "contact",
])
  assert(home.includes(`id="${id}"`), `home has section #${id}`);
assert(!home.includes('id="logos"'), "the old logos strip is gone");
// The depth work (2026-10-12): visual and reading bands alternate, the connector block stays right before the closing
const HOME_ORDER = [
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
for (const id of HOME_ORDER)
  assert(home.includes(`id="${id}"`), `home has section #${id}`);
for (let i = 1; i < HOME_ORDER.length; i++)
  assert(
    home.indexOf(`id="${HOME_ORDER[i - 1]}"`) <
      home.indexOf(`id="${HOME_ORDER[i]}"`),
    `sections come in order: ${HOME_ORDER.join(", ")}`,
  );
{
  const faq = home.slice(
    home.indexOf('id="faq"'),
    home.indexOf('id="connectors"'),
  );
  const n = (faq.match(/<details/g) ?? []).length;
  assert(n >= 6 && n <= 8, `the home has ${n} questions (6 to 8)`);
  assert(
    (home.slice(home.indexOf('id="operation"')).match(/data-mini="s\d"/g) ?? [])
      .length >= 6,
    "the benefits show six still native scenes",
  );
  assert(!/mailto:|wa\.me/.test(home), "no contact address that was not given");
}
// The menu is on every page: the five products, "Como funciona" and "Contato"; the logo leads to the home
const hasMenu = (html) => {
  const header = html.slice(html.indexOf("<header"), html.indexOf("</header>"));
  return (
    header.includes('href="/"') &&
    header.includes('href="/#how"') &&
    header.includes('href="/#contact"') &&
    SLUGS.every((s) => header.includes(`href="/products/${s}"`))
  );
};
assert(hasMenu(home), "the home header has the menu and the logo link");
assert(
  (home.match(/<section[^>]*>/g) ?? []).every((s) => s.includes("data-live")),
  "every band is marked live (the thread and the pulses pause off screen)",
);
for (const slug of SLUGS)
  assert(
    home.includes(`href="/products/${slug}"`),
    `the product row links to /products/${slug}`,
  );
const logoOrder = (html) => [
  ...new Set(
    [
      ...html.matchAll(/products\/(\w+)-(?:dark|light)(?:-endorsed)?\.svg/g),
    ].map((m) => m[1]),
  ),
];
// The overview of the chain lists the products in the order of the plot (lib/chain.ts), the rest of the page in weight order
const chainHtml = home.slice(
  home.indexOf('id="chain"'),
  home.indexOf('id="how"'),
);
assert.deepEqual(
  logoOrder(chainHtml),
  ["domus", "relloo", "tuner", "knowly", "magneto"],
  "the overview of the chain lists the products in the order of the plot",
);
assert.deepEqual(
  logoOrder(
    home.slice(home.indexOf('id="products"'), home.indexOf('id="operation"')),
  ),
  SLUGS,
  "products appear in weight order",
);
assert(
  !/products\/\w+-(?:dark|light)-endorsed\.svg/.test(home),
  "the seal is only the identity highlight of the product page, not the home",
);
assert(/href="\/#contact"/.test(home), "CTA points to the closing section");
// The words of the page copy: the text drawn inside the native scenes is product interface (a screen), not copy, so the
// block between the stage and its data is left out of the count (the slogan and banned-word rules above still read it)
// Every stage goes (the chain, and the capability scenes of a product opening); the still scenes (data-mini ...
// data-mini-end) of the benefits are interface as well
const copyOnly = (html) => {
  let withoutStage = html;
  for (;;) {
    // The attributes of the markup only (`="`), never their names inside the payload of the page's own scripts
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
const words = visibleText(copyOnly(home)).split(" ").length;
// 700 to 1000 words since the depth work of 2026-10-12 (180 before it: more content and more scroll was the direction)
assert(words >= 700 && words <= 1000, `home has ${words} visible words`);
assert(
  (home.match(/data-tile="s\d"/g) ?? []).length === 7,
  "the chain has seven native scenes",
);
// The products carousel: one native capability scene per product, in weight order
const productsHtml = home.slice(
  home.indexOf('id="products"'),
  home.indexOf('id="operation"'),
);
assert.deepEqual(
  [...productsHtml.matchAll(/data-tile="([a-z]+)-[a-z]+"/g)].map((m) => m[1]),
  SLUGS,
  "the products carousel plays one native scene per product, in order",
);
// Content layer: five product cards, the active one lit, each leading to its page
const cards = home.match(/<a [^>]*data-card="[a-z]+"[^>]*>/g) ?? [];
assert.equal(cards.length, 5, "the home has five product cards");
assert.equal(
  cards.filter((c) => c.includes('data-on="true"')).length,
  1,
  "one card is lit",
);
const clientLogos = [...home.matchAll(/src="\/clients\/[^"]+"/g)].length;
assert(clientLogos >= 7, "clients carousel renders its logos");
assert(
  !IMAGINE_SYSTEMS.test(home.slice(home.indexOf('id="platforms"'))),
  "no Imagine system in the closing strip",
);
for (const name of ["AWS", "DigitalOcean", "HostDime", "Google Cloud"])
  assert(home.includes(`alt="${name}"`), `platform carousel has ${name}`);

// PÁGINAS DE PRODUTO: logo com selo, metadado de categoria, zero player
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
  // Content layer: problems, capabilities and the live caption, within the word budget
  assert(
    html.includes('id="resolves"') && html.includes('id="capabilities"'),
    `${slug} page has the problems and the capabilities`,
  );
  // The caption follows the scene as plain text: a carousel that changes by itself is not a live region
  assert(
    /<p[^>]*data-caption/.test(html) && !/aria-live/.test(html),
    `${slug} page has the caption, without a live region`,
  );
  const productWords = visibleText(copyOnly(html)).split(" ").length;
  assert(
    productWords >= 400 && productWords <= 700,
    `${slug} has ${productWords} visible words`,
  );
  assert(hasMenu(html), `${slug} header has the menu and the logo link`);
  assert(
    html.includes('aria-label="Você está em"') && html.includes('id="others"'),
    `${slug} has the trail and the other products`,
  );
  assert(
    /<title>[^<]* by Welabs<\/title>/.test(html),
    `${slug} title follows the "<Product> by Welabs" pattern`,
  );
  // Template: opening with the capability scenes, what it solves, the chain, capabilities in groups, profiles,
  // questions, connectors with this product lit, the closing and the other products
  const at = (id) => html.indexOf(`id="${id}"`);
  const PRODUCT_ORDER = [
    "product",
    "resolves",
    "how",
    "capabilities",
    "audience",
    "faq",
    "connectors",
    "platforms",
    "contact",
    "others",
  ];
  assert(
    PRODUCT_ORDER.every(
      (id, i) => at(id) >= 0 && (i === 0 || at(PRODUCT_ORDER[i - 1]) < at(id)),
    ) && at("films") < 0,
    `${slug} page has its sections in order: ${PRODUCT_ORDER.join(", ")}`,
  );
  const opening = html.slice(at("product"), at("resolves"));
  assert(
    (opening.match(new RegExp(`data-tile="${slug}-`, "g")) ?? []).length ===
      3 && !/data-mini=/.test(opening),
    `${slug} opens with three native capability scenes, no still`,
  );
  const block = html.slice(at("connectors"), at("platforms"));
  assert(
    block.includes('aria-current="page"') &&
      !block.includes(`href="/products/${slug}"`),
    `${slug} is lit in the connectors and does not link to itself`,
  );
  for (const other of SLUGS.filter((s) => s !== slug))
    assert(
      block.includes(`href="/products/${other}"`),
      `${slug} connectors link to ${other}`,
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
for (const src of assets) await get(src);

// REDIRECIONAMENTOS: um salto, 308, destino final com 200
await expectRedirect("/new", "/");
await expectRedirect("/produtos", "/#products");
await expectRedirect("/solucoes", "/#products");
await expectRedirect("/sobre", "/#chain");
await expectRedirect("/products", "/#products");
await expectRedirect("/solutions", "/#products");
await expectRedirect("/about", "/#chain");
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
await expectRedirect("/welabs/sobre", "/#chain");
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
