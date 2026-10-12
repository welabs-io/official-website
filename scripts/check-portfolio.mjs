import assert from "node:assert/strict";

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
// The names of the tiles (`role="group"`) are the step descriptions the motion manifest writes (srLabel, title)
const hiddenText = (html) =>
  [
    ...html
      .replace(/role="group" aria-label="[^"]*"/g, "")
      .matchAll(/(?:alt|aria-label)="([^"]*)"/g),
  ]
    .map((m) => m[1])
    .join(" ");

const SLOGAN =
  /\b(domina|atende|automatiza|entrega|sabe|define|explica|conecta|transforma|ideias que viram|um só fluxo|ecossistema)\b/i;
const BANNED =
  /\b(cliente|clientes|erp|ficha|beta|alpha|mvp|sandbox|em breve|roadmap|em desenvolvimento|coming soon)\b/i;
const IMAGINE_SYSTEMS = /stant|tabe\.la|tabela|wego/i;

const pages = new Map();
const page = async (url) => {
  const html = await (await get(url)).text();
  pages.set(url, html);
  assert(
    !/<hyperframes-player[^>]*\bcontrols\b/i.test(html),
    `${url} has a player with controls`,
  );
  assert(!/role="progressbar"|Pausar|Retomar/i.test(html), `${url} has a bar`);
  assert(!/<video|<iframe|<audio/i.test(html), `${url} has a video element`);
  const all = `${visibleText(html)} ${hiddenText(html)}`;
  assert(
    !SLOGAN.test(all),
    `${url} has a slogan word: ${all.match(SLOGAN)?.[0]}`,
  );
  assert(
    !BANNED.test(all),
    `${url} has a banned word: ${all.match(BANNED)?.[0]}`,
  );
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
assert(
  home.indexOf('id="chain"') < home.indexOf('id="products"') &&
    home.indexOf('id="products"') < home.indexOf('id="connectors"') &&
    home.indexOf('id="connectors"') < home.indexOf('id="platforms"'),
  "sections come in order: chain, products, connectors, closing",
);
assert(
  (home.match(/<section[^>]*>/g) ?? []).every((s) => s.includes("data-live")),
  "every band is marked live (the thread and the pulses pause off screen)",
);
for (const slug of SLUGS)
  assert(
    home.includes(`href="/products/${slug}"`),
    `the product row links to /products/${slug}`,
  );
const order = [
  ...new Set(
    [
      ...home.matchAll(/products\/(\w+)-(?:dark|light)(?:-endorsed)?\.svg/g),
    ].map((m) => m[1]),
  ),
];
assert.deepEqual(order, SLUGS, "products appear in weight order");
assert(
  !/products\/\w+-(?:dark|light)-endorsed\.svg/.test(home),
  "the seal is only the identity highlight of the product page, not the home",
);
assert(/href="\/#contact"/.test(home), "CTA points to the closing section");
const words = visibleText(home).split(" ").length;
assert(words <= 85, `home has ${words} visible words`);
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
    new RegExp(`${slug}-dark-endorsed\\.svg`).test(html),
    `${slug} page has the logo with seal`,
  );
  assert(
    /<meta name="keywords" content="[^"]+"/.test(html),
    `${slug} keywords`,
  );
  assert(
    /<title>[^<]* by Welabs<\/title>/.test(html),
    `${slug} title follows the "<Product> by Welabs" pattern`,
  );
  // Template: opening and films in one ring, the chain of the product, connectors with this product lit, closing
  const at = (id) => html.indexOf(`id="${id}"`);
  assert(
    at("product") > 0 &&
      at("product") < at("chain") &&
      at("chain") < at("connectors") &&
      at("connectors") < at("platforms") &&
      at("platforms") < at("contact") &&
      at("films") < 0,
    `${slug} page has the same sections as the home, in order`,
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
// /lab/chain is a workbench: it must stay out of the index
const lab = await (await get("/lab/chain")).text();
assert(
  /<meta name="robots" content="noindex/.test(lab),
  "/lab/chain is noindex",
);

// ARQUIVOS REFERENCIADOS (logos, marcas, favicons) respondem 200
const assets = new Set();
for (const html of pages.values())
  for (const [, src] of html.matchAll(
    /(?:src|href)="(\/(?:brands|clients|platforms|motion)\/[^"]+)"/g,
  ))
    assets.add(src);
// The player and the manifest every reel needs (there is no sequential player any more)
for (const src of [
  "/motion/v5/player.js",
  "/motion/v5/_shared/brand/manifest.json",
])
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
