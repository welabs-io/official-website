import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";

// MEDIÇÃO DE PESO E DE THREAD PRINCIPAL
// Cold-cache run of the home and of a product page against a running server (PORTFOLIO_PREVIEW_URL). Prints JSON:
//  - firstLoadJs: gzip bytes of the <script src> chunks the route's HTML references (what the page needs to hydrate)
//  - transferred bytes per resource type after the initial load and after a slow scroll of the whole page
//  - videos and iframes alive at the same time (sampled every 250 ms; the site is native, so both must stay at 0)
//  - main-thread blocking: long tasks (PerformanceObserver) and the browser's TaskDuration over the run
// Playwright is resolved from PLAYWRIGHT_DIR (a node_modules folder that contains it).
const base = process.env.PORTFOLIO_PREVIEW_URL || "http://127.0.0.1:3000";
const require = createRequire(
  `${process.env.PLAYWRIGHT_DIR || "/home/douglas/code/a2ui/node_modules"}/`,
);
const { chromium } = require("playwright");

const ROUTES = (process.env.ROUTES || "/,/products/domus").split(",");

async function firstLoadJs(path) {
  const html = await (await fetch(base + path)).text();
  const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(
    (m) => m[1],
  );
  let total = 0;
  for (const src of new Set(srcs)) {
    const body = Buffer.from(await (await fetch(base + src)).arrayBuffer());
    total += gzipSync(body).length;
  }
  return { chunks: new Set(srcs).size, gzipBytes: total };
}

async function run(browser, path) {
  // VIEWPORT is "<width>x<height>", 1440x900 by default
  const [vw, vh] = (process.env.VIEWPORT || "1440x900").split("x").map(Number);
  const context = await browser.newContext({
    viewport: { width: vw, height: vh },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__long = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__long.push(e.duration);
    }).observe({ type: "longtask", buffered: true });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  const bytes = {};
  const types = new Map();
  cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type));
  cdp.on("Network.loadingFinished", (e) => {
    const type = types.get(e.requestId) || "Other";
    bytes[type] = (bytes[type] || 0) + e.encodedDataLength;
  });
  cdp.on("Network.requestWillBeSent", (e) => {
    types.set(e.requestId, e.type || "Other");
  });
  await cdp.send("Performance.enable");
  const task = async () =>
    (await cdp.send("Performance.getMetrics")).metrics.find(
      (m) => m.name === "TaskDuration",
    ).value;

  let maxVideos = 0;
  let maxIframes = 0;
  const sampler = setInterval(async () => {
    try {
      const r = await page.evaluate(() => ({
        v: document.querySelectorAll("video").length,
        f: document.querySelectorAll("iframe").length,
      }));
      maxVideos = Math.max(maxVideos, r.v);
      maxIframes = Math.max(maxIframes, r.f);
    } catch {
      /* navigation in progress */
    }
  }, 250);

  const snap = () => ({ ...bytes });
  const total = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const t0 = await task();
  await page.goto(base + path, { waitUntil: "load" });
  await page.waitForTimeout(6000);
  const initial = snap();
  const longInitial = await page.evaluate(() => [...window.__long]);
  // Slow scroll through the whole page
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  for (let y = 0; y <= height; y += 120) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(2500);
  const scrolled = snap();
  const long = await page.evaluate(() => [...window.__long]);
  const t1 = await task();
  clearInterval(sampler);
  await context.close();
  const blocking = (a) => a.reduce((s, d) => s + Math.max(0, d - 50), 0);
  const kb = (n) => Math.round(n / 1024);
  const kinds = (o) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, kb(v)]));
  return {
    path,
    pageHeight: height,
    initialKb: { total: kb(total(initial)), ...kinds(initial) },
    afterScrollKb: { total: kb(total(scrolled)), ...kinds(scrolled) },
    maxVideos,
    maxIframes,
    longTasksInitial: longInitial.length,
    longTasks: long.length,
    totalBlockingMs: Math.round(blocking(long)),
    mainThreadBusyMs: Math.round((t1 - t0) * 1000),
  };
}

// CHROMIUM_PATH points at an installed browser when the one Playwright expects is missing
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {},
);
const out = [];
for (const path of ROUTES) {
  out.push({ route: path, firstLoadJs: await firstLoadJs(path) });
  out.push(await run(browser, path));
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
