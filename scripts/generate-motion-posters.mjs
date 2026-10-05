// GERAÇÃO DOS POSTERS DOS FILMES
// Renders the closing frame of every film in lib/motion-catalog.json (slogan and brand) through the
// pinned HyperFrames Player and writes public/motion/<id>/poster.jpg. Films that open with a brand
// intro use the last frame of that intro instead, so every card cover is a brand frame.
// Usage: node scripts/generate-motion-posters.mjs [film-id ...]
import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(siteRoot, "public");
const catalog = JSON.parse(
  readFileSync(join(siteRoot, "lib/motion-catalog.json"), "utf8"),
);
const only = new Set(process.argv.slice(2));

// Pieces assembled as "<brand intro> + passage + film" (RECEIPT: abertura 8,5 s + passagem 0,5 s).
// The intro closes on its brand frame just before the passage starts.
const INTRO_END = 8.45;
// Seek slightly before the end: the last instant can already be past the final tween.
const END_MARGIN = 0.04;
const posterTime = (item) =>
  item.kind !== "intro" &&
  item.id.endsWith("-intro") &&
  item.duration > INTRO_END + 1
    ? INTRO_END
    : item.duration - END_MARGIN;

// Playwright is not a site dependency; reuse the copy in the npx cache, as the motion tooling does.
const npx = join(homedir(), ".npm/_npx");
const playwrightRoot = readdirSync(npx)
  .map((e) => join(npx, e, "node_modules/playwright"))
  .find((p) => existsSync(join(p, "index.mjs")));
if (!playwrightRoot)
  throw new Error(
    "playwright not found in the npx cache (run `npx playwright --version` once)",
  );
const { chromium } = await import(join(playwrightRoot, "index.mjs"));

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};
const host = (src) =>
  `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000;overflow:hidden}hyperframes-player{display:block;width:100vw;height:100vh}</style><script src="/motion/player.js"></script><hyperframes-player src="${src}" width="1920" height="1080"></hyperframes-player>`;

// Static server over public/, the same paths the site serves.
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

const browser = await chromium.launch();
const failures = [];
let written = 0;
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  for (const item of catalog) {
    if (only.size && !only.has(item.id)) continue;
    const t = posterTime(item);
    await page.goto(`${base}/__poster?src=${encodeURIComponent(item.src)}`, {
      waitUntil: "networkidle",
    });
    const ok = await page.evaluate(async (time) => {
      const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
      for (let k = 0; k < 75; k++) {
        const p = document.querySelector("hyperframes-player");
        const w = p?.shadowRoot?.querySelector("iframe")?.contentWindow;
        if (p?.ready && w?.__timelines && Object.keys(w.__timelines).length) {
          await w.document.fonts?.ready;
          p.pause?.();
          p.seek(time);
          await sleep(400);
          p.seek(time);
          await sleep(300);
          return true;
        }
        await sleep(200);
      }
      return false;
    }, t);
    if (!ok) {
      failures.push(item.id);
      continue;
    }
    await page.screenshot({
      path: join(publicRoot, "motion", item.id, "poster.jpg"),
      type: "jpeg",
      quality: 84,
    });
    written += 1;
    process.stdout.write(`poster ${item.id} @ ${t.toFixed(2)}s\n`);
  }
} finally {
  await browser.close();
  server.close();
}

process.stdout.write(
  `posters: ${written} written${failures.length ? `; failed: ${failures.join(", ")}` : ""}\n`,
);
process.exit(failures.length ? 1 : 0);
