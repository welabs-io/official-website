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

assert.equal(catalog.length, 5);
assert(catalog.every((p) => p.publisher === "Welabs"));
assert(motionProducts.every((p) => p.publisher === "Welabs"));

let html = 0,
  redirects = 0;
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
// scripts (the RSC payload carries catalog data such as `maturity`) are stripped first.
const STAGE_MARKER =
  /em desenvolvimento|in development|apresenta[çc][ãa]o conceitual|concept presentation|conceito reservado|reserved concept|\balpha\b|\bbeta\b|\bsandbox\b|em breve|coming soon|\bprevist[oa]s?\b/i;
const assertNoStage = (text, url) => {
  const visible = text
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
  const hit = visible.match(STAGE_MARKER);
  assert(!hit, `${url} shows a stage marker: ${hit?.[0]}`);
};

const products = [
  ...catalog.map((p) => ({ id: p.id, title: (l) => p.locales[l].title })),
  ...motionProducts.map((p) => ({ id: p.id, title: () => p.title })),
];
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
    html++;
  }
}

// Former public slugs (e.g. hub-de-dominio) keep a permanent redirect to the current one.
for (const [from, to] of Object.entries(formerSlug))
  await expectRedirect("/produtos/" + from, "/produtos/" + to);

for (const url of ["/", "/sobre", "/solucoes", "/produtos"])
  for (const q of ["?lang=pt", "?lang=en"]) {
    assertNoStage(await (await get(url + q)).text(), url + q);
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

console.log(
  JSON.stringify({
    products: products.length,
    htmlRoutes: html,
    redirects,
    status: "PASS",
  }),
);
