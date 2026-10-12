// MARCAS INDIVIDUAIS OFICIAIS
// Copy immutable standalone wordmarks from the official bundle; endorsement belongs to introductory films only.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(homedir(), "code/welabs/brand/vector/product-logos");
const target = join(root, "public/brands/welabs/products");
const digest = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
mkdirSync(target, { recursive: true });
for (const slug of ["domus", "relloo", "magneto", "tuner", "knowly"])
  for (const tone of ["dark", "light"]) {
    const name = `${slug}-${tone}.svg`;
    const original = join(source, name);
    const destination = join(target, name);
    if (existsSync(destination) && digest(destination) !== digest(original))
      throw new Error(
        `Refusing to overwrite a different official wordmark: ${name}`,
      );
    if (!existsSync(destination)) copyFileSync(original, destination);
    if (digest(original) !== digest(destination))
      throw new Error(`Wordmark mismatch: ${name}`);
  }
console.log(
  "Verified 10 standalone product wordmarks against the official brand bundle.",
);
