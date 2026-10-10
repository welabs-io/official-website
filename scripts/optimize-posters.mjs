import { createServer } from "node:http";
import { createRequire } from "node:module";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// CAPAS EM WEBP
// 1) Converts every public/motion/posters/*.jpg into a 960 px wide WebP (the largest a tile shows is ~750 px).
// 2) Renders `end-<film id>.webp`: the last frame of the range each film plays, through the pinned player. A carousel
//    tile that has already played shows it as the dimmed previous neighbour once its player is gone, so the frame the
//    viewer saw last is the frame that stays.
// Usage: node scripts/optimize-posters.mjs [--no-end]. Playwright comes from PLAYWRIGHT_DIR (a node_modules folder);
// CHROMIUM_PATH points at an installed browser when the one Playwright expects is missing.
const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(siteRoot, "public");
const posters = join(publicRoot, "motion/posters");

for (const name of readdirSync(posters)) {
  if (extname(name) !== ".jpg") continue;
  await sharp(join(posters, name))
    .resize({ width: 960 })
    .webp({ quality: 72, effort: 5 })
    .toFile(join(posters, name.replace(/\.jpg$/, ".webp")));
}
process.stdout.write("posters: jpg converted to webp\n");

// LOGOS EM PNG
// The marquee draws each mark at most 34 px tall; 68 px is enough for a 2x screen. Alpha is kept.
for (const dir of ["clients", "platforms"]) {
  for (const name of readdirSync(join(publicRoot, dir))) {
    if (extname(name) !== ".png") continue;
    const source = join(publicRoot, dir, name);
    const webp = await sharp(source)
      .resize({ height: 68, withoutEnlargement: true })
      .webp({ quality: 85, alphaQuality: 90, effort: 5 })
      .toBuffer();
    // A mark that is already tiny stays a PNG when WebP would not be smaller
    if (webp.length < statSync(source).size)
      writeFileSync(source.replace(/\.png$/, ".webp"), webp);
  }
}
process.stdout.write("logos: png converted to webp\n");
if (process.argv.includes("--no-end")) process.exit(0);

// CAPAS DO ÚLTIMO QUADRO
const pieces = JSON.parse(
  readFileSync(join(siteRoot, "lib/motion-pieces.json"), "utf8"),
);
const ends = Object.values(pieces.products).flatMap((product) =>
  product.films.map((film) => ({
    id: film.id,
    at: (film.clip ? film.clip[1] : film.duration) - 0.06,
  })),
);
const require = createRequire(
  `${process.env.PLAYWRIGHT_DIR || "/home/douglas/code/a2ui/node_modules"}/`,
);
const { chromium } = require("playwright");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
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
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {},
);
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
for (const { id, at } of ends) {
  await page.goto(
    `${base}/__poster?src=${encodeURIComponent(`/motion/pieces/${id}/index.html`)}`,
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
  }, at);
  await page.waitForTimeout(900);
  const png = await page.screenshot({ type: "png" });
  await sharp(png)
    .resize({ width: 960 })
    .webp({ quality: 72, effort: 5 })
    .toFile(join(posters, `end-${id}.webp`));
}
await browser.close();
server.close();
process.stdout.write(`posters: ${ends.length} end frames written\n`);
