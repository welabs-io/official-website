// SINCRONIZAÇÃO DO MOTION DA PÁGINA /new
// Copies only the pieces the one-page preview plays (five product intros, the Welabs intro and three accepted films)
// into public/motion/pieces/<id>/, adds the vendor folders those intros need to public/motion/_shared/, and writes
// lib/onepage-motion.json (src, duration, poster, clip ranges). Additive: it never removes anything and never touches
// lib/motion-catalog.json, so the home keeps its own catalog. sync-motion.mjs calls it at the end of a full sync.
// Usage: node scripts/sync-onepage-motion.mjs [--no-posters]
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
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
const withPosters = !process.argv.includes("--no-posters");

// PEÇAS DA PÁGINA
// Intros are the definitive product openings of the round; films are the Room's current cuts (publish/index.html).
// `clip` is the [start, end] range (s) the page plays in loop through range-start/range-end; `beats` are the chain
// film times (s) the scroll section scrubs through, one per link of the chain.
const INTROS = {
  domus: "domus-intro-s2-r2",
  relloo: "relloo-intro-s2-r3",
  magneto: "magneto-intro-s3-r3",
  tuner: "tuner-intro-s2",
  knowly: "knowly-intro-s2",
  welabs: "welabs-intro-v7-s1",
};
const FILMS = {
  domus: { id: "hub-whole-house-ludic-logos-r4-s1", clip: [4, 26] },
  relloo: { id: "crm-omnichannel-inbox-ludic2-logos-r4-s1", clip: [20.5, 36] },
  chain: {
    id: "welabs-chain-overview-define-logos-r5-s1",
    scrub: [6.5, 26],
    beats: [8, 11, 16, 19.5, 23.5],
  },
};

const accepted = JSON.parse(readFileSync(join(round, "accepted.json"), "utf8"));
const sha = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const html = (id) => join(round, "pieces", id, "index.html");
const isAccepted = (id) =>
  existsSync(html(id)) && accepted[id]?.sha256 === sha(html(id));
const durationOf = (id) =>
  Number(
    readFileSync(html(id), "utf8").match(/data-duration="([0-9.]+)"/)?.[1],
  );

// PEÇA E DEPENDÊNCIAS
const ids = [
  ...Object.values(INTROS),
  ...Object.values(FILMS).map((f) => f.id),
];
for (const id of ids)
  if (!isAccepted(id)) throw new Error(`${id} is not accepted at its hash`);

const manifest = JSON.parse(
  readFileSync(join(round, "_shared/brand/manifest.json"), "utf8"),
);
const copyPiece = (id) => {
  const source = join(round, "pieces", id);
  const target = join(motionRoot, "pieces", id);
  mkdirSync(target, { recursive: true });
  cpSync(html(id), join(target, "index.html"));
  if (existsSync(join(source, "assets")))
    cpSync(join(source, "assets"), join(target, "assets"), {
      recursive: true,
      dereference: true,
    });
};
for (const id of ids) copyPiece(id);

// Vendor folders referenced by the pieces' scripts (`../../_shared/vendor/<dir>/<version>/...`).
const vendor = new Set();
for (const id of ids)
  for (const m of readFileSync(html(id), "utf8").matchAll(
    /_shared\/vendor\/([\w.-]+)\/([\w.-]+)\//g,
  ))
    vendor.add(`${m[1]}/${m[2]}`);
for (const rel of vendor) {
  const from = join(round, "_shared/vendor", rel);
  const to = join(motionRoot, "_shared/vendor", rel);
  if (existsSync(from) && !existsSync(to))
    cpSync(from, to, { recursive: true });
}
// Brand files of the manifest version and the loader, as the full sync copies them.
mkdirSync(join(motionRoot, "_shared/brand"), { recursive: true });
for (const rel of ["brand/manifest.json", "brand/loader.js"])
  cpSync(join(round, "_shared", rel), join(motionRoot, "_shared", rel));
const brandVersion = manifest.brands.welabs.version;
cpSync(
  join(round, "_shared/brand/welabs", brandVersion),
  join(motionRoot, "_shared/brand/welabs", brandVersion),
  { recursive: true },
);

// MANIFESTO DA PÁGINA
const piece = (id) => ({
  id,
  src: `/motion/pieces/${id}/index.html`,
  duration: durationOf(id),
});
const out = {
  intros: Object.fromEntries(
    Object.entries(INTROS).map(([key, id]) => [
      key,
      { ...piece(id), poster: `/motion/pieces/${id}/poster.jpg` },
    ]),
  ),
  films: Object.fromEntries(
    Object.entries(FILMS).map(([key, film]) => [
      key,
      {
        ...piece(film.id),
        clip: film.clip ?? null,
        beats: film.beats ?? null,
        scrub: film.scrub ?? null,
        poster: `/motion/pieces/${film.id}/poster.jpg`,
        beatPosters: film.beats
          ? film.beats.map((_, i) => `/motion/pieces/${film.id}/beat-${i}.jpg`)
          : null,
      },
    ]),
  ),
};
writeFileSync(
  join(siteRoot, "lib/onepage-motion.json"),
  `${JSON.stringify(out, null, 2)}\n`,
);
process.stdout.write(`onepage motion: ${ids.length} pieces synced\n`);

if (!withPosters) process.exit(0);

// POSTERS
// A still of each piece through the pinned player: intros close on their last frame, clips on a frame inside the range,
// the chain film on each of its beats. Same static server over public/ the site serves.
const npx = join(homedir(), ".npm/_npx");
const playwrightRoot = readdirSync(npx)
  .map((e) => join(npx, e, "node_modules/playwright"))
  .find((p) => existsSync(join(p, "index.mjs")));
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

const jobs = [];
// The Welabs intro is shared with the home and keeps the poster the home already versions.
for (const [key, item] of Object.entries(out.intros))
  if (key !== "welabs")
    jobs.push({ src: item.src, time: item.duration - 0.04, file: item.poster });
for (const [key, film] of Object.entries(out.films)) {
  if (film.clip)
    jobs.push({
      src: film.src,
      time: (film.clip[0] + film.clip[1]) / 2,
      file: film.poster,
    });
  else
    jobs.push({ src: film.src, time: FILMS[key].beats[0], file: film.poster });
  film.beats?.forEach((t, i) =>
    jobs.push({ src: film.src, time: t, file: film.beatPosters[i] }),
  );
}
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
for (const job of jobs) {
  await page.goto(`${base}/__poster?src=${encodeURIComponent(job.src)}`);
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
  }, job.time);
  await page.waitForTimeout(700);
  await page.screenshot({
    path: join(publicRoot, job.file),
    type: "jpeg",
    quality: 78,
  });
}
await browser.close();
server.close();
process.stdout.write(`onepage motion: ${jobs.length} posters written\n`);
