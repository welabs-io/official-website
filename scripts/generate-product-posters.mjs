// PÔSTERES DOS ROTEIROS DE PRODUTO
// Render each planned endpoint through the same pinned player as the site. Accepted source bytes stay intact.
import { createServer } from "node:http";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  mkdirSync,
} from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { homedir } from "node:os";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(siteRoot, "public");
const plans = JSON.parse(
  readFileSync(join(siteRoot, "lib/product-motion-plans.json"), "utf8"),
);
const cacheRoot = join(homedir(), ".npm/_npx");
const candidates = existsSync(cacheRoot)
  ? readdirSync(cacheRoot)
      .map((name) => join(cacheRoot, name, "node_modules/playwright"))
      .filter((candidate) => existsSync(join(candidate, "index.mjs")))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  : [];
const playwrightRoot = process.env.PLAYWRIGHT_DIR
  ? join(process.env.PLAYWRIGHT_DIR, "playwright")
  : candidates[0];
if (!playwrightRoot)
  throw new Error(
    "Set PLAYWRIGHT_DIR to a node_modules folder containing Playwright.",
  );
const { chromium } = await import(
  pathToFileURL(join(playwrightRoot, "index.mjs")).href
);
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
  `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#10141c;overflow:hidden}hyperframes-player{display:block;width:100vw;height:100vh}</style><script src="/motion/player.js"></script><hyperframes-player src="${src}" width="1920" height="1080"></hyperframes-player>`;
const server = createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname === "/__poster") {
    const id = url.searchParams.get("piece");
    if (!id || !/^[a-z0-9-]+$/.test(id)) return response.writeHead(400).end();
    response.writeHead(200, { "content-type": types[".html"] });
    return response.end(host(`/motion/pieces/${id}/index.html`));
  }
  const file = resolve(publicRoot, `.${decodeURIComponent(url.pathname)}`);
  if (
    file.startsWith(publicRoot + sep) &&
    existsSync(file) &&
    statSync(file).isFile()
  ) {
    response.writeHead(200, {
      "content-type": types[extname(file)] ?? "application/octet-stream",
    });
    return response.end(readFileSync(file));
  }
  response.writeHead(404).end();
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const failures = [];
page.on("pageerror", (error) => failures.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400)
    failures.push(
      `HTTP ${response.status()} ${new URL(response.url()).pathname}`,
    );
});
const rendered = [];
try {
  for (const [slug, plan] of Object.entries(plans)) {
    for (const chapter of plan.chapters) {
      for (const [index, segment] of chapter.segments.entries()) {
        if (segment.pieceId.includes("intro")) continue;
        const expected = `/motion/posters/motion-${slug}-${chapter.key}-${index}.webp`;
        if (segment.poster !== expected)
          throw new Error(
            `Unexpected poster path for ${slug}/${chapter.key}/${index}`,
          );
        await page.goto(`${base}/__poster?piece=${segment.pieceId}`, {
          waitUntil: "networkidle",
        });
        await page.waitForFunction(() => {
          const player = document.querySelector("hyperframes-player");
          return player?.ready && player.duration > 0;
        });
        const observed = await page.evaluate(async (time) => {
          const player = document.querySelector("hyperframes-player");
          await player.ready;
          player.pause();
          player.seek(time);
          return { time: player.currentTime, duration: player.duration };
        }, segment.end);
        await page.waitForTimeout(350);
        const image = await page.screenshot({ type: "png" });
        const target = resolve(publicRoot, `.${expected}`);
        mkdirSync(dirname(target), { recursive: true });
        await sharp(image)
          .resize({ width: 960 })
          .webp({ quality: 85, effort: 5 })
          .toFile(target);
        rendered.push({
          slug,
          chapter: chapter.key,
          source: segment.pieceId,
          endpoint: segment.end,
          poster: expected,
          observed,
        });
      }
    }
  }
  if (failures.length)
    throw new Error(`Poster source failures: ${failures.length}`);
  const receipt = {
    commit: execFileSync(
      "git",
      ["-C", siteRoot, "rev-parse", "--short", "HEAD"],
      { encoding: "utf8" },
    ).trim(),
    rendered,
    failures,
  };
  if (process.env.MOTION_POSTER_RECEIPT)
    await writeFile(
      process.env.MOTION_POSTER_RECEIPT,
      JSON.stringify(receipt, null, 2),
    );
  process.stdout.write(
    `posters: ${rendered.length} exact narrative endpoints rendered; source failures ${failures.length}\n`,
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
