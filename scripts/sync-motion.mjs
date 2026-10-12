// SINCRONIZAÇÃO DO MANIFESTO DE MOTION
// Brings the motion round into the site from its manifest (plan-v5/out/motion-manifest.json), and nothing else:
//  1. validates the manifest against its JSON Schema (draft 2020-12; ajv comes from AJV_DIR, a node_modules folder);
//  2. copies the manifest to lib/motion-manifest.json (and the schema to lib/motion-manifest.schema.json), which the site
//     reads at build time;
//  3. builds the site copy of every referenced piece into public/motion/v5/pieces/<id>/ (the accepted piece plus the hide
//     rule of `siteVariant`, sha256 checked against the manifest) with its assets;
//  4. copies every referenced cover (public/motion/v5/posters/), the shared brand files and the pinned player.
// The round is read only. Every path the manifest mentions must exist after the copy, or the script fails.
// Usage: node scripts/sync-motion.mjs [--manifest <file>] [--covers <dir>] [--schema <file>]
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const motionRoot = join(siteRoot, "public/motion/v5");
const round = resolve(
  homedir(),
  "code/control/portfolio/motion/portfolio-20261002",
);
const planOut = resolve(
  homedir(),
  "code/control/portfolio/site-redesign/plan-v5",
);
const arg = (name, fallback) => {
  const at = process.argv.indexOf(name);
  return at >= 0 ? resolve(process.argv[at + 1]) : fallback;
};
const manifestFile = arg(
  "--manifest",
  join(planOut, "out/motion-manifest.json"),
);
const coversDir = arg("--covers", join(planOut, "out/covers"));
const schemaFile = arg(
  "--schema",
  join(planOut, "motion-manifest.schema.v1.2.json"),
);

const read = (file) => JSON.parse(readFileSync(file, "utf8"));
const sha = (text) => createHash("sha256").update(text).digest("hex");
const fail = (message) => {
  process.stderr.write(`sync-motion: ${message}\n`);
  process.exit(1);
};

// VALIDAÇÃO CONTRA O SCHEMA
const manifest = read(manifestFile);
const schema = read(schemaFile);
const require = createRequire(
  `${process.env.AJV_DIR || "/home/douglas/code/a2ui/node_modules"}/`,
);
const Ajv2020 = require("ajv/dist/2020").default;
// `format` words (date-time) are not checked: the manifest is machine written
const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  validateFormats: false,
});
const validate = ajv.compile(schema);
if (!validate(manifest))
  fail(
    `manifest does not match the schema:\n${validate.errors
      .slice(0, 12)
      .map((e) => `  ${e.instancePath || "/"} ${e.message}`)
      .join("\n")}`,
  );

// CAMINHOS CITADOS
// Every site path under /motion/v5/ the manifest mentions, collected by walking it.
const paths = new Set();
const walk = (node) => {
  if (typeof node === "string") {
    if (node.startsWith("/motion/v5/")) paths.add(node);
  } else if (Array.isArray(node)) node.forEach(walk);
  else if (node && typeof node === "object") Object.values(node).forEach(walk);
};
walk(manifest);

// PEÇAS
const accepted = read(join(round, "accepted.json"));
rmSync(motionRoot, { recursive: true, force: true });
mkdirSync(join(motionRoot, "pieces"), { recursive: true });
mkdirSync(join(motionRoot, "posters"), { recursive: true });
for (const [id, piece] of Object.entries(manifest.pieces)) {
  const source = join(round, "pieces", id, "index.html");
  if (!existsSync(source)) fail(`${id}: the piece is not in the round`);
  const text = readFileSync(source, "utf8");
  if (
    sha(text) !== piece.sourceSha256 ||
    accepted[id]?.sha256 !== piece.sourceSha256
  )
    fail(
      `${id}: the piece in the round is not the accepted one of the manifest`,
    );
  if (Number(text.match(/data-duration="([0-9.]+)"/)?.[1]) !== piece.duration)
    fail(`${id}: data-duration differs from the manifest`);
  if (!text.includes("</style>"))
    fail(`${id}: no style block for the hide rule`);
  // Site copy: the hide rule goes before the first </style>, exactly the text the manifest hashed
  const rule = `/* Site variant v5: hidden slots, choreography untouched */\n${piece.siteVariant.hide.join(",")}{display:none!important}\n`;
  // An empty hide list means no rule: the site copy is the accepted piece byte for byte (the hash check below still applies)
  const copy = piece.siteVariant.hide.length
    ? text.replace("</style>", `${rule}</style>`)
    : text;
  if (sha(copy) !== piece.sha256)
    fail(`${id}: the site copy does not hash to the manifest sha256`);
  const target = join(motionRoot, "pieces", id);
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, "index.html"), copy);
  const assets = join(round, "pieces", id, "assets");
  if (existsSync(assets))
    cpSync(assets, join(target, "assets"), {
      recursive: true,
      dereference: true,
    });
}

// CAPAS
let covers = 0;
for (const path of paths) {
  if (!path.includes("/posters/")) continue;
  const source = join(coversDir, basename(path));
  if (!existsSync(source)) fail(`missing cover ${basename(path)}`);
  // Re-encoded at WebP quality 70 (the floor of the operator): the covers are stills seen at the edge of a ring or for the
  // instant before the player paints, and a product page weighs 11 KB less with them. A file that does not shrink is
  // copied as it is.
  const smaller = await sharp(source)
    .webp({ quality: 70, effort: 6, smartSubsample: true })
    .toBuffer();
  if (smaller.length < statSync(source).size)
    writeFileSync(join(motionRoot, "posters", basename(path)), smaller);
  else cpSync(source, join(motionRoot, "posters", basename(path)));
  covers++;
}

// ARQUIVOS COMPARTILHADOS DA MARCA
const brand = read(join(round, "_shared/brand/manifest.json"));
if (brand.brands.welabs.version !== manifest.brand.welabs)
  fail(
    `brand ${brand.brands.welabs.version} in the round, ${manifest.brand.welabs} in the manifest`,
  );
const shared = join(motionRoot, "_shared");
for (const rel of ["brand/manifest.json", "brand/loader.js"]) {
  mkdirSync(dirname(join(shared, rel)), { recursive: true });
  cpSync(join(round, "_shared", rel), join(shared, rel));
}
cpSync(
  join(round, "_shared/brand/welabs", manifest.brand.welabs),
  join(shared, "brand/welabs", manifest.brand.welabs),
  { recursive: true },
);
cpSync(join(round, "_shared/vendor"), join(shared, "vendor"), {
  recursive: true,
});

// PLAYER FIXADO
const cache = join(homedir(), ".npm/_npx");
let hyperframes = null;
for (const entry of readdirSync(cache)) {
  const dir = join(cache, entry, "node_modules/hyperframes");
  try {
    if (read(join(dir, "package.json")).version === manifest.player.version) {
      hyperframes = dir;
      break;
    }
  } catch {
    /* not this cache entry */
  }
}
if (!hyperframes)
  fail(`HyperFrames ${manifest.player.version} not found in the npm cache`);
cpSync(
  join(hyperframes, "dist/hyperframes-player.global.js"),
  join(motionRoot, "player.js"),
);

// MANIFESTO NO SITE
writeFileSync(
  join(siteRoot, "lib/motion-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
writeFileSync(
  join(siteRoot, "lib/motion-manifest.schema.json"),
  `${JSON.stringify(schema, null, 2)}\n`,
);

// CONFERÊNCIA FINAL: tudo que o manifesto cita existe sob public/
for (const path of paths)
  if (
    !existsSync(join(siteRoot, "public", path)) &&
    path !== manifest.player.src
  )
    fail(`the manifest mentions ${path}, which is not in public/`);
if (!existsSync(join(siteRoot, "public", manifest.player.src)))
  fail(`player ${manifest.player.src} is not in public/`);
process.stdout.write(
  `motion: manifest valid, ${Object.keys(manifest.pieces).length} pieces, ${covers} covers synced (round ${manifest.round})\n`,
);
