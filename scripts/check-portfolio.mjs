import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// VERIFICAÇÃO DO PORTFÓLIO CONTRA O PREVIEW
// Checks only what the site serves today: retired packs, moved products and public slugs are read
// from the same sources the site uses (proxy.ts, lib/public-slugs.ts), so the check follows them.
const catalog = JSON.parse(fs.readFileSync("lib/presentation-catalog.json"));
const base = process.env.PORTFOLIO_PREVIEW_URL || "http://127.0.0.1:3000";
const hash = (x) => createHash("sha256").update(x).digest("hex");

const proxySource = fs.readFileSync("proxy.ts", "utf8");
const slugSource = fs.readFileSync("lib/public-slugs.ts", "utf8");
const retired = new Set(
  proxySource.match(/const packs='([^']+)'/)[1].split("|"),
);
// Parse a `const NAME: Record<string, string> = {...}` literal from public-slugs.ts.
const record = (name) =>
  Object.fromEntries(
    [
      ...slugSource
        .match(new RegExp(`const ${name}[^=]*=\\s*\\{([\\s\\S]*?)\\};`))[1]
        .matchAll(/'?([\w-]+)'?\s*:\s*'([^']+)'/g),
    ].map(([, key, value]) => [key, value]),
  );
const publicSlug = record("PUBLIC_SLUG");
const moved = record("MOVED_PRODUCT");

assert.equal(catalog.length, 22);
assert.equal(catalog.filter((p) => p.publisher === "Welabs").length, 5);
assert.equal(
  catalog.filter((p) => p.publisher === "Imagine" && p.status === "selecionado")
    .length,
  5,
);
assert(!catalog.some((p) => ["factory", "nfe-flow"].includes(p.id)));

let assets = 0,
  html = 0,
  presentations = 0,
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

for (const p of catalog) {
  const route = p.publisher === "Welabs" ? "/welabs/produtos/" : "/portfolio/";
  // Moved products only redirect to the page that carries them now.
  if (moved[p.id]) {
    await expectRedirect(route + p.id, moved[p.id]);
    await get("/apresentacoes/" + p.id, 404);
    continue;
  }
  const slug = publicSlug[p.id] ?? p.id;
  if (slug !== p.id) await expectRedirect(route + p.id, route + slug);
  const isRetired = retired.has(p.id);
  const dir = path.join("public", p.presentationBase);
  const manifestPath = path.join(dir, "manifest.json");
  const m = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath))
    : null;
  if (!isRetired) {
    assert(m, `${p.id} manifest`);
    assert.equal(m.id, p.id);
    assert.equal(m.publisher, p.publisher);
  }
  for (const locale of ["pt-BR", "en"]) {
    const q = locale === "en" ? "?lang=en" : "?lang=pt";
    // Retired packs keep a product page under its current name, but no presentation.
    const urls = isRetired
      ? [route + slug + q]
      : [route + slug + q, "/apresentacoes/" + p.id + q];
    for (const url of urls) {
      const text = await (await get(url)).text();
      assert(text.includes("noindex"), url);
      assert(
        new RegExp(`<html[^>]+lang="${locale === "en" ? "en" : "pt-BR"}"`).test(
          text,
        ),
        url + " SSR language",
      );
      if (!isRetired) {
        // The catalog carries the current product name; the hashed pack keeps its original one.
        assert(text.includes(p.productName), url);
        assert.equal(
          titleOf(text),
          p.locales[locale].title,
          url + " localized title",
        );
      }
      html++;
    }
    if (isRetired) continue;
    assert.equal(m.locales[locale].scenes.length, 3);
    const a = m.assets.find((a) => a.id === m.locales[locale].player.assetId);
    const text = await (await get(p.presentationBase + "/" + a.path)).text();
    assert(text.includes("Content-Security-Policy"));
    assert(text.includes("<noscript>"));
  }
  if (isRetired) {
    await get("/apresentacoes/" + p.id, 404);
    if (m) await get(`/presentation-downloads/${p.id}-${m.version}.zip`, 404);
    continue;
  }
  for (const a of m.assets) {
    const bytes = fs.readFileSync(path.join(dir, a.path));
    assert.equal(bytes.length, a.bytes);
    assert.equal(hash(bytes), a.sha256);
    assets++;
  }
  const zipPath = `/presentation-downloads/${p.id}-${m.version}.zip`;
  const zip = await (await get(zipPath)).arrayBuffer();
  assert.equal(
    hash(Buffer.from(zip)),
    hash(fs.readFileSync("public" + zipPath)),
  );
  presentations++;
}

for (const url of [
  "/",
  "/sobre",
  "/servicos",
  "/portfolio",
  "/welabs",
  "/welabs/sobre",
  "/welabs/solucoes",
  "/welabs/produtos",
])
  for (const q of ["?lang=pt", "?lang=en"]) {
    await get(url + q);
    html++;
  }
for (const url of [
  "/portfolio/erp",
  "/welabs/produtos/tabela",
  "/apresentacoes/does-not-exist",
])
  await get(url, 404);
for (const [from, to] of [
  ["/portfolio-preview", "/portfolio"],
  ["/portfolio-preview/welabs", "/welabs"],
  ["/portfolio-preview/erp", "/welabs/produtos/erp"],
  ["/portfolio/filmes", "/portfolio"],
])
  await expectRedirect(from, to);

console.log(
  JSON.stringify({
    packages: catalog.length,
    presentations,
    retired: catalog.filter((p) => retired.has(p.id)).length,
    assets,
    htmlRoutes: html,
    redirects,
    status: "PASS",
  }),
);
