import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// LOGOS EM WEBP
// The marquee of the closing draws each mark at most 34 px tall; 68 px is enough for a 2x screen. Converts the PNG marks
// of public/clients and public/platforms to WebP, keeping alpha.
const publicRoot = join(
  resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  "public",
);
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
