// EXPORTAÇÃO ISOLADA DA CADEIA DE PRODUTOS
// Export accepted responsive pieces and their shared runtime without changing any earlier site's composition or brand manifest.
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  copyFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(root, "lib/ecosystem-motion-pieces.json"), "utf8"),
);
const round = join(homedir(), "code/control/portfolio/motion", manifest.round);
const destination = join(
  root,
  "public/motion",
  manifest.directory ?? "chain-system",
);
const accepted = JSON.parse(readFileSync(join(round, "accepted.json"), "utf8"));
const sha = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
let copied = 0;

function copyImmutable(source, target) {
  if (existsSync(target)) {
    if (sha(source) !== sha(target))
      throw new Error(
        `Refusing to overwrite an existing runtime file: ${relative(root, target)}`,
      );
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  copied++;
}
function copyRuntime(source, target, predicate) {
  for (const name of readdirSync(source)) {
    const from = join(source, name);
    const to = join(target, name);
    if (statSync(from).isDirectory()) {
      if (
        !/^(?:evidence|qa|review|snapshots|scripts|\.hyperframes|docs|materialized)$/.test(
          name,
        )
      )
        copyRuntime(from, to, predicate);
    } else if (predicate(name)) copyImmutable(from, to);
  }
}
for (const [format, piece] of Object.entries(manifest.variants)) {
  const directory = join(round, "pieces", piece.id);
  const index = join(directory, "index.html");
  if (accepted[piece.id]?.sha256 !== sha(index))
    throw new Error(`The ${format} source is not accepted at its current hash`);
  const html = readFileSync(index, "utf8");
  for (const [attribute, value] of Object.entries({
    "data-composition-id": piece.id,
    "data-width": piece.width,
    "data-height": piece.height,
    "data-duration": piece.duration,
  })) {
    if (!html.includes(`${attribute}="${value}"`))
      throw new Error(`Mismatched ${attribute}: ${piece.id}`);
  }
  copyRuntime(
    directory,
    join(destination, "pieces", piece.id),
    (name) =>
      [".html", ".js", ".mjs", ".css", ".svg", ".woff2"].includes(
        extname(name),
      ) || name === "story-data.json",
  );
}
for (const directory of ["brand", "vendor"])
  copyRuntime(
    join(round, "_shared", directory),
    join(destination, "_shared", directory),
    (name) =>
      [".js", ".mjs", ".css", ".svg", ".woff2"].includes(extname(name)) ||
      name.endsWith("tokens.json") ||
      name === "manifest.json",
  );
console.log(
  `Exported ${Object.keys(manifest.variants).length} accepted responsive compositions; ${copied} new runtime files in an isolated bundle.`,
);
