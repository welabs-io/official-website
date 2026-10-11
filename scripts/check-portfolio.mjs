import assert from "node:assert/strict";

// VERIFICAÇÃO DO SITE COMPLETO
// Validate public pages, real contact, referenced assets and every preserved redirect against a running preview.
const base = process.env.PORTFOLIO_PREVIEW_URL || "http://127.0.0.1:3000";
const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"];
const get = async (url, status = 200) => {
  const response = await fetch(base + url);
  assert.equal(response.status, status, url);
  return response;
};
const expectRedirect = async (from, to) => {
  const response = await fetch(base + from, { redirect: "manual" });
  assert.equal(response.status, 308, from + " permanent redirect");
  assert.equal(
    new URL(response.headers.get("location"), base).href,
    new URL(to, base).href,
    from,
  );
};
const visibleText = (html) =>
  html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const pages = new Map();
const page = async (url) => {
  const html = await (await get(url)).text();
  pages.set(url, html);
  assert.equal(
    (html.match(/<main\b/g) ?? []).length,
    1,
    url + " main landmark",
  );
  assert.equal(
    (html.match(/<h1\b/g) ?? []).length,
    1,
    url + " primary heading",
  );
  assert(
    !/<hyperframes-player[^>]*\bcontrols\b|role="progressbar"|<button[^>]*>\s*(?:Pausar|Retomar)\s*<|<video|<iframe|<audio/i.test(
      html,
    ),
    url + " presentation controls",
  );
  assert(
    !/\b(erp|crm|beta|alpha|mvp|roadmap|em breve)\b/i.test(visibleText(html)),
    url + " visible categories and promises",
  );
  assert(
    html.includes('href="mailto:contato@welabs.io?subject='),
    url + " commercial contact",
  );
  return html;
};

// HOME E JORNADA
const home = await page("/");
const blocks = ["chain", "products", "journey", "platforms", "contact"];
const positions = blocks.map((id) => home.indexOf('id="' + id + '"'));
assert(
  positions.every((index) => index >= 0),
  "all five home sections exist",
);
assert.deepEqual(
  positions,
  [...positions].sort((a, b) => a - b),
  "home sequence",
);
assert(home.includes('data-rotate="false"'), "product selection stays stable");
assert(home.includes('data-summaries="true"'), "functional product summaries");
assert(
  visibleText(home).includes("Marina · Pedido 1234"),
  "persistent native journey context",
);
assert(
  home.includes('aria-label="Marcas do portfólio"'),
  "portfolio attribution",
);
assert(
  home.includes('aria-label="Plataformas de infraestrutura e desenvolvimento"'),
  "technology attribution",
);
for (const slug of SLUGS)
  assert(home.includes('href="/products/' + slug + '"'), "route " + slug);
const words = visibleText(home).split(" ").length;
assert(
  words <= 700,
  "compact home: " + words + " native words including inactive summaries",
);

// RECURSOS, DEMONSTRAÇÕES E RELAÇÕES DOS PRODUTOS
for (const slug of SLUGS) {
  const html = await page("/products/" + slug);
  assert(
    html.includes(slug + "-dark-endorsed.svg"),
    slug + " endorsed identity",
  );
  assert(
    /<meta name="keywords" content="[^"]+"/.test(html),
    slug + " keywords",
  );
  assert(/<title>[^<]* by Welabs<\/title>/.test(html), slug + " title");
  const ids = [
    "overview",
    "capabilities",
    "films",
    "related-products",
    "contact",
  ];
  const at = ids.map((id) => html.indexOf('id="' + id + '"'));
  assert(
    at.every((index) => index >= 0),
    slug + " complete sections",
  );
  assert.deepEqual(
    at,
    [...at].sort((a, b) => a - b),
    slug + " sequence",
  );
  const related = html.slice(at[3], at[4]);
  assert(
    !related.includes('href="/products/' + slug + '"'),
    slug + " does not link to itself",
  );
  for (const other of SLUGS.filter((item) => item !== slug))
    assert(
      related.includes('href="/products/' + other + '"'),
      slug + " links " + other,
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
for (const src of ["/motion/player.js", "/motion/_shared/brand/manifest.json"])
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
