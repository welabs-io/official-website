// EXPORTAÇÃO DAS COMPOSIÇÕES SEM ENDOSSO
// Validate accepted source hashes and copy only immutable runtime into a dedicated namespace.
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const manifestPath = args.includes("--manifest")
  ? args[args.indexOf("--manifest") + 1]
  : "lib/fluid-motion-pieces.json";
const namespace = args.includes("--namespace")
  ? args[args.indexOf("--namespace") + 1]
  : "fluid-system";
const manifest = JSON.parse(readFileSync(join(root, manifestPath), "utf8"));
const round = join(homedir(), "code/control/portfolio/motion", manifest.round);
const destination = join(root, "public/motion", namespace);
const pieces = manifest.pieces ?? Object.values(manifest.products);
const accepted = JSON.parse(readFileSync(join(round, "accepted.json"), "utf8"));
const sha = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const allowed = new Set([
  ".html",
  ".js",
  ".mjs",
  ".css",
  ".svg",
  ".woff2",
  ".png",
  ".webp",
]);
let count = 0;
function copyImmutable(source, target) {
  if (existsSync(target)) {
    if (sha(source) !== sha(target))
      throw new Error(`Immutable runtime differs: ${target}`);
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  count++;
}
function copyRuntime(source, target) {
  for (const name of readdirSync(source)) {
    const from = join(source, name),
      to = join(target, name);
    if (statSync(from).isDirectory()) {
      if (
        !/^(?:evidence|qa|review|snapshots|scripts|\.hyperframes|docs|materialized|node_modules)$/.test(
          name,
        )
      )
        copyRuntime(from, to);
    } else if (
      allowed.has(extname(name)) ||
      /^(?:manifest|story-data|tokens|motion-tokens)\.json$/.test(name)
    )
      copyImmutable(from, to);
  }
}
const catalog = [];
for (const piece of pieces) {
  const source = join(round, "pieces", piece.id);
  const index = join(source, "index.html");
  if (accepted[piece.id]?.sha256 !== sha(index) || piece.sha256 !== sha(index))
    throw new Error(`Unaccepted source: ${piece.id}`);
  const html = readFileSync(index, "utf8");
  const duration = Number(html.match(/data-duration="([\d.]+)"/)?.[1]);
  if (
    duration !== piece.duration ||
    !html.includes(`data-composition-id="${piece.id}"`)
  )
    throw new Error(`Source contract mismatch: ${piece.id}`);
  if (
    manifest.products &&
    (!html.includes('data-width="1080"') ||
      !html.includes('data-height="1350"'))
  )
    throw new Error(`Portrait geometry mismatch: ${piece.id}`);
  if (/products\/[^"'\s]+-endorsed\.svg|by [Ww]elabs/.test(html))
    throw new Error(`Unexpected endorsement: ${piece.id}`);
  copyRuntime(source, join(destination, "pieces", piece.id));
  catalog.push({
    id: piece.id,
    duration,
    sha256: piece.sha256,
    acceptance: "accepted",
    src: `/motion/${namespace}/pieces/${piece.id}/index.html`,
  });
}
copyRuntime(join(round, "_shared"), join(destination, "_shared"));
const catalogPath = join(destination, "catalog.json");
const catalogText =
  JSON.stringify({ brandVersion: "1.8.0", pieces: catalog }, null, 2) + "\n";
// The catalog follows selected revisions; every previously exported runtime remains immutable.
if (existsSync(catalogPath)) {
  const previous = JSON.parse(readFileSync(catalogPath, "utf8"));
  for (const piece of previous.pieces)
    if (
      sha(join(destination, "pieces", piece.id, "index.html")) !==
        piece.sha256 ||
      accepted[piece.id]?.sha256 !== piece.sha256
    )
      throw new Error(`Previously exported source changed: ${piece.id}`);
}
if (
  !existsSync(catalogPath) ||
  readFileSync(catalogPath, "utf8") !== catalogText
) {
  const temporary = `${catalogPath}.tmp-${process.pid}`;
  writeFileSync(temporary, catalogText);
  renameSync(temporary, catalogPath);
}
console.log(
  `Exported ${pieces.length} accepted sources; ${count} new runtime files.`,
);
