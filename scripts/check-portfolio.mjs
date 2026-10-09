import fs from "node:fs";
import assert from "node:assert/strict";

// VERIFICAÇÃO DO SITE CONTRA O PREVIEW
// Checks what the Welabs site serves today against a running server: product pages by public slug,
// redirects from internal ids, former slugs and the old /welabs addresses of the shared site.
// Public slugs are read from lib/public-slugs.ts, so the check follows them.
const catalog = JSON.parse(fs.readFileSync("lib/presentation-catalog.json"));
const motionProducts = JSON.parse(fs.readFileSync("lib/motion-products.json"));
const base = process.env.PORTFOLIO_PREVIEW_URL || "http://127.0.0.1:3000";

const slugSource = fs.readFileSync("lib/public-slugs.ts", "utf8");
// Parse a `const NAME: Record<string, string> = {...}` literal from public-slugs.ts.
const record = (name) =>
  Object.fromEntries(
    [
      ...slugSource
        .match(new RegExp(`const ${name}[^=]*=\\s*\\{([\\s\\S]*?)\\};`))[1]
        .matchAll(/["']?([\w-]+)["']?\s*:\s*["']([^"']+)["']/g),
    ].map(([, key, value]) => [key, value]),
  );
const publicSlug = record("PUBLIC_SLUG");
const formerSlug = record("FORMER_SLUG");
// Products hidden for now are read from lib/catalog.ts: their data stays in the catalog, but the site
// serves no page for them, so they are checked as redirects to the collection instead of as pages.
const hidden = new Set(
  [
    ...fs
      .readFileSync("lib/catalog.ts", "utf8")
      .match(/HIDDEN_PRODUCTS[^=]*=\s*new Set\(\[([^\]]*)\]\)/)[1]
      .matchAll(/["']([\w-]+)["']/g),
  ].map(([, id]) => id),
);

assert.equal(catalog.length, 5);
assert.deepEqual([...hidden], ["malupe"]);

// ORDEM DE PESO DOS PRODUTOS WELABS
// Operator decision (2026-10-08): Domus, Relloo, Magneto, Tuner, Knowly. The emphasis ranking, the
// catalog array and the rendered hub keep it: core (Domus, Relloo), then the rails top to bottom.
const WEIGHT_ORDER = ["erp", "welabs-crm", "flow", "channels", "wekb"];
const emphasis = JSON.parse(fs.readFileSync("lib/emphasis.json"));
assert.deepEqual(
  emphasis.welabs.filter((id) => !hidden.has(id)),
  WEIGHT_ORDER,
  "emphasis.welabs follows the weight order",
);
assert.deepEqual(
  catalog.map((p) => p.id).filter((id) => !hidden.has(id)),
  WEIGHT_ORDER.filter((id) => catalog.some((p) => p.id === id)),
  "catalog array follows the weight order",
);
// Hub nodes in the order the page renders them (data-product on each core card and rail link)
const renderedOrder = (text) => [
  ...new Set(
    [...text.matchAll(/<(?:article|a)\s[^>]*data-product="([\w-]+)"/g)].map(
      ([, id]) => id,
    ),
  ),
];
assert(catalog.every((p) => p.publisher === "Welabs"));
assert(motionProducts.every((p) => p.publisher === "Welabs"));

let html = 0,
  redirects = 0;
// Every page served in the loops below, keyed by address, for the brand 1.5.0 checks at the end.
const pages = new Map();
const get = async (url, status = 200) => {
  const r = await fetch(base + url);
  assert.equal(r.status, status, url);
  return r;
};
const expectRedirect = async (from, to) => {
  const r = await fetch(base + from, { redirect: "manual" });
  assert([307, 308].includes(r.status), `${from} redirects`);
  assert.equal(new URL(r.headers.get("location"), base).pathname, to, from);
  redirects++;
};
const titleOf = (text) => {
  const h1 = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "";
  // Product pages may render the logo as the title: its alt is the title.
  return h1.replace(/<[^>]+>/g, "") || h1.match(/<img[^>]*alt="([^"]*)"/)?.[1];
};

// SEM MARCADOR DE ESTÁGIO
// Commercial rule: no product shows a stage, maturity or version. Only visible text is checked;
// the head and scripts (the RSC payload carries catalog data) are stripped first.
// Category rule (2026-10-08): "ERP" and "Cliente" never show; the category term lives in metadata.
const STAGE_MARKER =
  /em desenvolvimento|in development|apresenta[çc][ãa]o conceitual|concept presentation|conceito reservado|reserved concept|\balpha\b|\bbeta\b|\bsandbox\b|em breve|coming soon|\bprevist[oa]s?\b/i;
const HIDDEN_CATEGORY = /\bERP\b|\bclientes?\b/i;
const visibleText = (text) =>
  text
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
const assertNoStage = (text, url) => {
  const visible = visibleText(text);
  const hit = visible.match(STAGE_MARKER);
  assert(!hit, `${url} shows a stage marker: ${hit?.[0]}`);
  const category = visible.match(HIDDEN_CATEGORY);
  assert(!category, `${url} shows a category term: ${category?.[0]}`);
};
// Product pages carry their category in metadata: title, keywords and a SoftwareApplication JSON-LD.
const assertCategoryMetadata = (text, url) => {
  assert(/<meta name="keywords" content="[^"]+"/.test(text), url + " keywords");
  const ld = [
    ...text.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ]
    .map(([, json]) => JSON.parse(json))
    .find((d) => d["@type"] === "SoftwareApplication");
  assert(
    ld?.applicationCategory && ld.applicationSubCategory,
    url + " JSON-LD",
  );
  const title = text.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  assert(title.includes(ld.applicationSubCategory), url + " title category");
};

const products = [
  ...catalog.map((p) => ({ id: p.id, title: (l) => p.locales[l].title })),
  ...motionProducts.map((p) => ({ id: p.id, title: () => p.title })),
].filter((p) => !hidden.has(p.id));
// Five visible Welabs products: Domus, Relloo, Magneto, Tuner and Knowly
assert.equal(products.length, 5);
// A hidden product's public address (and its internal id) lands on the collection.
for (const id of hidden) {
  const slug = publicSlug[id] ?? id;
  await expectRedirect("/produtos/" + slug, "/produtos");
  const r = await fetch(base + "/produtos/" + id, { redirect: "follow" });
  assert.equal(new URL(r.url).pathname, "/produtos", id + " ends on /produtos");
}
for (const p of products) {
  const slug = publicSlug[p.id] ?? p.id;
  if (slug !== p.id)
    await expectRedirect("/produtos/" + p.id, "/produtos/" + slug);
  // The old address of the shared site lands on the same page.
  await expectRedirect("/welabs/produtos/" + slug, "/produtos/" + slug);
  for (const locale of ["pt-BR", "en"]) {
    const q = locale === "en" ? "?lang=en" : "?lang=pt";
    const text = await (await get("/produtos/" + slug + q)).text();
    assert(text.includes("noindex"), slug + q);
    assert(
      new RegExp(`<html[^>]+lang="${locale === "en" ? "en" : "pt-BR"}"`).test(
        text,
      ),
      slug + q + " SSR language",
    );
    assert.equal(titleOf(text), p.title(locale), slug + q + " title");
    assertNoStage(text, slug + q);
    assertCategoryMetadata(text, slug + q);
    pages.set("/produtos/" + slug + q, text);
    html++;
  }
}

// Former public slugs (e.g. hub-de-dominio) keep a permanent redirect to the current one.
for (const [from, to] of Object.entries(formerSlug))
  await expectRedirect("/produtos/" + from, "/produtos/" + to);

for (const url of ["/", "/sobre", "/solucoes", "/produtos"])
  for (const q of ["?lang=pt", "?lang=en"]) {
    const text = await (await get(url + q)).text();
    assertNoStage(text, url + q);
    pages.set(url + q, text);
    // The home and the collection render the hub: its cards follow the weight order
    if (url === "/" || url === "/produtos")
      assert.deepEqual(renderedOrder(text), WEIGHT_ORDER, url + q + " order");
    html++;
  }
// The Imagine pages and the legacy presentation routes are not part of this site.
for (const url of [
  "/portfolio",
  "/servicos",
  "/produtos/tabela",
  "/apresentacoes/flow",
])
  await get(url, 404);
for (const [from, to] of [
  ["/welabs", "/"],
  ["/welabs/sobre", "/sobre"],
  ["/welabs/solucoes", "/solucoes"],
  ["/welabs/produtos", "/produtos"],
  ["/portfolio-preview/welabs", "/"],
  ["/portfolio-preview/erp", "/produtos/erp"],
])
  await expectRedirect(from, to);

// MARCA WELABS 1.5.0: SELO E PRIMEIRA MENÇÃO
// The product is a sub-brand of Welabs and never shows without it (welabs-io/brand, PR #15).
// 1) A product logo without the "by welabs" seal is allowed only when its x-height on screen is under 14 px.
//    The x-height is the display height times 150 / viewBox height of the SVG (X = 150 units, construction.json);
//    the display height is read from the CSS rule of the image class, so a larger logo without the seal fails.
// 2) The first mention of a product in the visible text of each page is "<Product> by Welabs"; "Welabs <Product>" never.
const UNSEALED_MAX_X_HEIGHT = 14;
const PRODUCT_NAMES = ["Domus", "Relloo", "Magneto", "Tuner", "Knowly"];
const cssSources = fs
  .readdirSync("app")
  .filter((f) => f.endsWith(".css"))
  .map((f) => fs.readFileSync("app/" + f, "utf8"));
// Largest `height: Npx` declared for a class in the global CSS files (media-query overrides included).
const declaredHeights = (cls) => {
  const heights = [];
  for (const css of cssSources)
    for (const [, body] of css.matchAll(
      new RegExp(`(?:^|[\\s,}])\\.${cls}\\s*\\{([^}]*)\\}`, "g"),
    ))
      for (const [, px] of body.matchAll(/(?:^|[;\s])height:\s*([\d.]+)px/g))
        heights.push(Number(px));
  return heights;
};
const viewBoxHeight = (file) =>
  Number(
    fs
      .readFileSync("public" + file, "utf8")
      .match(/viewBox="[-\d.]+ [-\d.]+ [-\d.]+ ([\d.]+)"/)[1],
  );
let unsealed = 0;
const problems = [];
for (const [url, text] of pages) {
  for (const [tag] of text.matchAll(/<img\b[^>]*>/g)) {
    const src = tag.match(/\ssrc="([^"]*)"/)?.[1] ?? "";
    const m = src.match(
      /^\/brands\/welabs\/products\/[a-z]+-(?:dark|light)(-endorsed)?\.svg$/,
    );
    if (!m || m[1]) continue;
    const cls = tag.match(/\sclass="([^"]*)"/)?.[1].split(/\s+/) ?? [];
    const heights = [
      ...cls.flatMap(declaredHeights),
      ...[Number(tag.match(/\sheight="([\d.]+)"/)?.[1])].filter(Boolean),
    ];
    if (heights.length === 0) {
      problems.push(
        `${url}: product logo ${src} without seal has no measurable height (use the -endorsed file)`,
      );
      continue;
    }
    const xHeight = (Math.max(...heights) * 150) / viewBoxHeight(src);
    if (xHeight >= UNSEALED_MAX_X_HEIGHT)
      problems.push(
        `${url}: product logo ${src} without seal has x-height ${xHeight.toFixed(1)} px (14 px or more needs the -endorsed file)`,
      );
    unsealed++;
  }
  // Text read on screen: comments and sr-only elements (headings that only name the card) do not count.
  const visible = visibleText(
    text
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(
        /<(\w+)\b[^>]*\bclass="[^"]*\bsr-only\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g,
        "",
      ),
  )
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
  const wrong = visible.match(/\bWelabs (Domus|Relloo|Magneto|Tuner|Knowly)\b/);
  if (wrong)
    problems.push(`${url}: "${wrong[0]}" (the form is "Product by Welabs")`);
  for (const name of PRODUCT_NAMES) {
    const at = visible.search(new RegExp(`\\b${name}\\b`, "i"));
    if (at < 0) continue;
    if (
      !visible
        .slice(at)
        .toLowerCase()
        .startsWith(`${name.toLowerCase()} by welabs`)
    )
      problems.push(
        `${url}: first mention of ${name} is not "${name} by Welabs": "${visible.slice(Math.max(0, at - 30), at + 50)}"`,
      );
  }
}
assert.deepEqual(problems, [], "brand 1.5.0 (seal and first mention)");

console.log(
  JSON.stringify({
    products: products.length,
    htmlRoutes: html,
    redirects,
    unsealedProductLogos: unsealed,
    status: "PASS",
  }),
);
