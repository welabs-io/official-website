import { readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// CAPAS EM 640 PX
// For every 960 px cover (public/motion/posters/<name>.webp) writes <name>-640.webp, the smaller candidate of the
// srcset of the tiles: a phone shows a tile of about 330 px, so it never needs the 960 px file. Run it after
// scripts/optimize-posters.mjs or scripts/sync-motion.mjs; it only reads the 960 px files and rewrites the 640 px ones.
const posters = join(
  resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  "public/motion/posters",
);

let written = 0;
for (const name of readdirSync(posters)) {
  if (extname(name) !== ".webp" || name.endsWith("-640.webp")) continue;
  await sharp(join(posters, name))
    .resize({ width: 640 })
    .webp({ quality: 70, effort: 5 })
    .toFile(join(posters, name.replace(/\.webp$/, "-640.webp")));
  written++;
}
process.stdout.write(`posters: ${written} covers written at 640 px\n`);
