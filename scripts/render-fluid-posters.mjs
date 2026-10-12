// PÔSTERES DAS FONTES ACEITAS
// Capture actual accepted timelines; write fresh standalone fallbacks without touching previous poster versions.
import { createServer } from "node:http";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));
const sharp = require("sharp");
const cache = join(homedir(), ".npm/_npx");
const playwright = readdirSync(cache)
  .map((id) => join(cache, id, "node_modules/playwright"))
  .find((p) => existsSync(join(p, "index.mjs")));
if (!playwright) throw new Error("Playwright runtime is unavailable");
const { chromium } = await import(join(playwright, "index.mjs"));
const publicRoot = join(root, "public");
const mobile = process.argv.includes("--mobile");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const evidenceSuffix = args.includes("--evidence-suffix")
  ? `-${args[args.indexOf("--evidence-suffix") + 1]}`
  : "";
const namespace = mobile ? "product-mobile" : "fluid-system";
const evidence = join(
  homedir(),
  `code/control/portfolio/site-redesign/fluid-revision/${mobile ? "product-mobile-posters" : "posters"}${evidenceSuffix}`,
);
mkdirSync(evidence, { recursive: true });
const pieces = JSON.parse(
  readFileSync(join(root, "lib/motion-pieces.json"), "utf8"),
);
const plans = JSON.parse(
  readFileSync(join(root, "lib/product-motion-plans.json"), "utf8"),
);
const ecosystem = JSON.parse(
  readFileSync(join(root, "lib/ecosystem-motion-pieces.json"), "utf8"),
);
const montage = JSON.parse(
  readFileSync(join(root, "lib/home-montage.json"), "utf8"),
);
const manifest = JSON.parse(
  readFileSync(
    join(
      root,
      mobile
        ? "lib/mobile-product-motion-pieces.json"
        : "lib/fluid-motion-pieces.json",
    ),
    "utf8",
  ),
);
const jobs = [];
if (mobile) {
  if (only)
    manifest.products = Object.fromEntries(
      Object.entries(manifest.products).filter(([slug]) => slug === only),
    );
  for (const source of Object.values(manifest.products))
    for (const chapter of source.chapters)
      jobs.push({
        id: source.id,
        name: `${source.id}-${chapter.key}`,
        time: chapter.posterTime,
        width: 1080,
        height: 1350,
      });
} else {
  for (const product of Object.values(pieces.products))
    for (const film of product.films) {
      jobs.push({
        id: film.id,
        name: film.id,
        time: (film.clip?.[0] ?? 1.2) + 0.5,
      });
      jobs.push({
        id: film.id,
        name: `end-${film.id}`,
        time: film.duration - 0.04,
      });
    }
  for (const plan of Object.values(plans))
    for (const chapter of plan.chapters)
      for (const segment of chapter.segments)
        jobs.push({
          id: segment.pieceId,
          name: segment.poster
            .split("/")
            .at(-1)
            .replace(/\.webp$/, ""),
          time: segment.end - 0.04,
        });
  for (const variant of Object.values(ecosystem.variants))
    for (const [phase, time] of Object.entries(ecosystem.posters))
      jobs.push({
        id: variant.id,
        name: `${variant.id}-${phase}`,
        time,
        width: variant.width,
        height: variant.height,
      });
  for (const step of montage.steps)
    for (const segment of step.segments)
      jobs.push({
        id: segment.film,
        name: segment.poster,
        time: segment.settledAt ?? segment.end - 0.04,
      });
}
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".png": "image/png",
};
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/__poster") {
    const id = url.searchParams.get("id");
    if (!jobs.some((job) => job.id === id)) {
      res.writeHead(404).end();
      return;
    }
    const width = Number(url.searchParams.get("width") ?? 1920),
      height = Number(url.searchParams.get("height") ?? 1080);
    res
      .writeHead(200, { "content-type": "text/html" })
      .end(
        `<!doctype html><style>html,body{margin:0;background:#10141c;overflow:hidden}hyperframes-player{display:block;width:100vw;height:100vh}</style><script src="/motion/player.js"></script><hyperframes-player src="/motion/${namespace}/pieces/${id}/index.html" width="${width}" height="${height}" disable-click-to-play muted></hyperframes-player>`,
      );
    return;
  }
  const file = resolve(publicRoot, `.${decodeURIComponent(url.pathname)}`);
  if (
    !file.startsWith(publicRoot + sep) ||
    !existsSync(file) ||
    !statSync(file).isFile()
  ) {
    res.writeHead(404).end();
    return;
  }
  res
    .writeHead(200, {
      "content-type": types[extname(file)] ?? "application/octet-stream",
    })
    .end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage();
const failures = [];
const receipts = [];
page.on("pageerror", (error) => failures.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400)
    failures.push(`${response.status()} ${response.url()}`);
});
try {
  const sourceProof = [];
  // Measure both clocks and declared duration before deriving any frozen poster.
  for (const piece of manifest.pieces ??
    Object.values(manifest.products).map((piece) => ({
      ...piece,
      width: 1080,
      height: 1350,
    }))) {
    if (!jobs.some((job) => job.id === piece.id))
      jobs.push({
        id: piece.id,
        name: `${piece.id}-proof`,
        time: piece.duration * 0.6,
        proofOnly: true,
      });
    await page.goto(
      `${base}/__poster?id=${piece.id}&width=${piece.width}&height=${piece.height}`,
    );
    await page.waitForFunction(
      () => document.querySelector("hyperframes-player")?.ready,
      null,
      { timeout: 30000 },
    );
    await page.evaluate(() => {
      const player = document.querySelector("hyperframes-player");
      player.seek(0);
      player.play();
    });
    await page.waitForTimeout(2600);
    const proof = await page.evaluate(() => {
      const player = document.querySelector("hyperframes-player");
      const source = player.shadowRoot.querySelector("iframe").contentWindow;
      const timeline = Object.values(source.__timelines ?? {})[0];
      return {
        time: player.currentTime,
        duration: player.duration,
        sourceTime: timeline?.time(),
      };
    });
    if (
      Math.abs(proof.duration - piece.duration) > 0.05 ||
      proof.time < 1.5 ||
      proof.sourceTime < 1.5 ||
      Math.abs(proof.time - proof.sourceTime) > 0.5
    )
      throw new Error(
        `Destination clock failed: ${piece.id} ${JSON.stringify(proof)}`,
      );
    sourceProof.push({
      id: piece.id,
      expectedDuration: piece.duration,
      ...proof,
    });
  }
  for (const job of jobs) {
    if (job.proofOnly) continue;
    const target = join(publicRoot, "motion/posters", `${job.name}.webp`);
    if (existsSync(target)) continue;
    const scale = 1280 / (job.width ?? 1920);
    await page.setViewportSize({
      width: Math.round((job.width ?? 1920) * scale),
      height: Math.round((job.height ?? 1080) * scale),
    });
    await page.goto(
      `${base}/__poster?id=${job.id}&width=${job.width ?? 1920}&height=${job.height ?? 1080}`,
    );
    await page.waitForFunction(
      () => document.querySelector("hyperframes-player")?.ready,
      null,
      { timeout: 30000 },
    );
    const observed = await page.evaluate((time) => {
      const player = document.querySelector("hyperframes-player");
      player.pause();
      player.seek(time);
      return { duration: player.duration, time: player.currentTime };
    }, job.time);
    await page.waitForTimeout(150);
    const pixels = await page.screenshot();
    writeFileSync(join(evidence, `${job.name}.png`), pixels);
    await sharp(pixels).webp({ quality: 88 }).toFile(target);
    receipts.push({ ...job, ...observed });
  }
  if (failures.length) throw new Error(JSON.stringify(failures));
  writeFileSync(
    join(evidence, "receipt.json"),
    JSON.stringify({ sourceProof, jobs: receipts, failures }, null, 2),
  );
  console.log(
    `Captured ${receipts.length} standalone source posters; zero HTTP or page errors.`,
  );
} finally {
  await browser.close();
  await new Promise((ok) => server.close(ok));
}
