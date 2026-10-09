// SINCRONIZAÇÃO DOS FILMES DO SITE
// Copies the pieces listed in lib/motion-pieces.json (five product openings, the Welabs opening, the product films and
// the chain film) from the portfolio round (read only) into public/motion/pieces/<id>/, copies _shared the way the site
// serves it (manifest, loader, sequence player, vendor, Welabs brand version), copies the pinned HyperFrames player and
// renders one cover frame per piece into public/motion/posters/<id>.jpg.
// Usage: node scripts/sync-motion.mjs [--no-posters]
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(siteRoot, "public");
const motionRoot = join(publicRoot, "motion");
const round = resolve(
  homedir(),
  "code/control/portfolio/motion/portfolio-20261002",
);
const PLAYER_VERSION = "0.8.104";
const withPosters = !process.argv.includes("--no-posters");
const pieces = JSON.parse(
  readFileSync(join(siteRoot, "lib/motion-pieces.json"), "utf8"),
);

// PEÇAS DA LISTA
// `cover` is the time (s) of the still frame: the closing frame for openings, a frame inside the clip for films.
const list = [];
const add = (piece, cover) => list.push({ ...piece, cover });
add(pieces.welabsIntro, pieces.welabsIntro.duration - 0.04);
add(pieces.chain, pieces.chain.beats[0]);
for (const product of Object.values(pieces.products)) {
  add(product.intro, product.intro.duration - 0.04);
  for (const film of product.films)
    add(
      film,
      film.clip ? (film.clip[0] + film.clip[1]) / 2 : film.duration * 0.45,
    );
}

// CONFERÊNCIA DE ACEITE
const accepted = JSON.parse(readFileSync(join(round, "accepted.json"), "utf8"));
const html = (id) => join(round, "pieces", id, "index.html");
const sha = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const durationOf = (id) =>
  Number(
    readFileSync(html(id), "utf8").match(/data-duration="([0-9.]+)"/)?.[1],
  );
for (const piece of list) {
  if (
    !existsSync(html(piece.id)) ||
    accepted[piece.id]?.sha256 !== sha(html(piece.id))
  )
    throw new Error(`${piece.id} is not accepted at its hash`);
  if (durationOf(piece.id) !== piece.duration)
    throw new Error(
      `${piece.id}: duration ${durationOf(piece.id)} differs from lib/motion-pieces.json (${piece.duration})`,
    );
}

// CÓPIA
rmSync(motionRoot, { recursive: true, force: true });
mkdirSync(join(motionRoot, "pieces"), { recursive: true });
for (const { id } of list) {
  const target = join(motionRoot, "pieces", id);
  mkdirSync(target, { recursive: true });
  cpSync(html(id), join(target, "index.html"));
  const assets = join(round, "pieces", id, "assets");
  if (existsSync(assets))
    cpSync(assets, join(target, "assets"), {
      recursive: true,
      dereference: true,
    });
}
const manifest = JSON.parse(
  readFileSync(join(round, "_shared/brand/manifest.json"), "utf8"),
);
// The product openings of the manifest must be the ones this site lists
for (const [slug, product] of Object.entries(pieces.products))
  if (manifest.products[slug] !== product.intro.id)
    throw new Error(
      `manifest opening of ${slug} is ${manifest.products[slug]}`,
    );
if (manifest.brands.welabs.intro !== pieces.welabsIntro.id)
  throw new Error(`manifest Welabs opening is ${manifest.brands.welabs.intro}`);
const shared = join(motionRoot, "_shared");
for (const rel of [
  "brand/manifest.json",
  "brand/loader.js",
  "player/sequence-player.js",
]) {
  mkdirSync(dirname(join(shared, rel)), { recursive: true });
  cpSync(join(round, "_shared", rel), join(shared, rel));
}
cpSync(
  join(round, "_shared/brand/welabs", manifest.brands.welabs.version),
  join(shared, "brand/welabs", manifest.brands.welabs.version),
  { recursive: true },
);
cpSync(join(round, "_shared/vendor"), join(shared, "vendor"), {
  recursive: true,
});

// PLAYER FIXADO
function findNpx(pkgPath, check) {
  const cacheRoot = join(homedir(), ".npm/_npx");
  for (const entry of readdirSync(cacheRoot)) {
    const pkg = join(cacheRoot, entry, "node_modules", pkgPath);
    try {
      if (check(pkg)) return pkg;
    } catch {
      /* not this cache entry */
    }
  }
  return null;
}
const hyperframes = findNpx(
  "hyperframes",
  (p) =>
    JSON.parse(readFileSync(join(p, "package.json"), "utf8")).version ===
    PLAYER_VERSION,
);
if (!hyperframes)
  throw new Error(`HyperFrames ${PLAYER_VERSION} not found in the npm cache`);
cpSync(
  join(hyperframes, "dist/hyperframes-player.global.js"),
  join(motionRoot, "player.js"),
);
process.stdout.write(`motion: ${list.length} pieces synced\n`);
if (!withPosters) process.exit(0);

// CAPAS
// A still of each piece through the pinned player, served by a static server over public/ like the site does.
const playwrightRoot = findNpx("playwright", (p) =>
  existsSync(join(p, "index.mjs")),
);
if (!playwrightRoot) throw new Error("playwright not found in the npx cache");
const { chromium } = await import(join(playwrightRoot, "index.mjs"));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const host = (src) =>
  `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000;overflow:hidden}hyperframes-player{display:block;width:100vw;height:100vh}</style><script src="/motion/player.js"></script><hyperframes-player src="${src}" width="1920" height="1080"></hyperframes-player>`;
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/__poster") {
    res.writeHead(200, { "content-type": types[".html"] });
    return res.end(host(url.searchParams.get("src")));
  }
  const file = resolve(publicRoot, `.${decodeURIComponent(url.pathname)}`);
  if (
    file.startsWith(publicRoot + sep) &&
    existsSync(file) &&
    statSync(file).isFile()
  ) {
    res.writeHead(200, {
      "content-type": types[extname(file)] ?? "application/octet-stream",
    });
    return res.end(readFileSync(file));
  }
  res.writeHead(404).end();
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;
mkdirSync(join(motionRoot, "posters"), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
for (const piece of list) {
  await page.goto(
    `${base}/__poster?src=${encodeURIComponent(`/motion/pieces/${piece.id}/index.html`)}`,
  );
  await page.waitForFunction(
    () => {
      const el = document.querySelector("hyperframes-player");
      return el && el.ready && el.duration > 0;
    },
    null,
    { timeout: 30000 },
  );
  await page.evaluate((t) => {
    const el = document.querySelector("hyperframes-player");
    el.pause();
    el.seek(t);
  }, piece.cover);
  await page.waitForTimeout(700);
  await page.screenshot({
    path: join(motionRoot, "posters", `${piece.id}.jpg`),
    type: "jpeg",
    quality: 78,
  });
}
await browser.close();
server.close();
process.stdout.write(`motion: ${list.length} posters written\n`);
