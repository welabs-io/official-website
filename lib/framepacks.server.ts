import fs from "node:fs";
import path from "node:path";
import catalog from "./presentation-catalog.json";
import { coverFilmOf } from "./brand-cover";
import type { Manifest } from "@/components/Presentation";

// PACOTES APOSENTADOS
// Legacy packs that cite a client agency, an internal codename, a retired product name (SGORS, We{product})
// or a retired product (Kiosk Brands, now CRM Campaigns): their manifest never reaches the client.
const RETIRED = new Set([
  "malupe",
  "autoinfracao",
  "sgors",
  "kiosk-brands",
  "erp",
  "wekb",
  "welabs-crm",
]);

export function getFramepack(id: string) {
  const item = catalog.find((item) => item.id === id);
  if (!item) return null;
  const manifest = RETIRED.has(id)
    ? ({} as Manifest)
    : (JSON.parse(
        fs.readFileSync(
          path.join(
            process.cwd(),
            "public",
            item.presentationBase,
            "manifest.json",
          ),
          "utf8",
        ),
      ) as Manifest);
  return { item, manifest };
}
export function framepackIds(publisher?: string) {
  return catalog
    .filter((p) => !publisher || p.publisher === publisher)
    .map((p) => ({ slug: p.id }));
}

// Share image: the accepted film poster when the product has one, the legacy poster otherwise.
export function publicPoster(id: string, legacy: string) {
  // Same cover as the product card: brand intro first, then the first business or topology film.
  const film = coverFilmOf(id, catalog.find((p) => p.id === id)?.publisher);
  return film
    ? `/motion/${film.id}/poster.jpg`
    : RETIRED.has(id)
      ? "/company-brands/welabs-logo.png"
      : legacy;
}
