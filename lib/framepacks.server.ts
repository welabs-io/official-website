import fs from "node:fs";
import path from "node:path";
import catalog from "./presentation-catalog.json";
import motionCatalog from "./motion-catalog.json";
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
  // Same cover as the product card (coverFilm): brand intro first, then the first business or topology film.
  const owns = (f: (typeof motionCatalog)[number]) =>
    f.product === id || (f.also as string[]).includes(id);
  const welabs = catalog.find((p) => p.id === id)?.publisher === "Welabs";
  const film =
    motionCatalog.find((f) => owns(f) && f.kind === "intro") ??
    (welabs ? motionCatalog.find((f) => f.id === "welabs-intro") : undefined) ??
    motionCatalog.find(
      (f) => owns(f) && (f.kind === "business" || f.kind === "topology"),
    );
  return film
    ? `/motion/${film.id}/poster.jpg`
    : RETIRED.has(id)
      ? "/company-brands/welabs-logo.png"
      : legacy;
}
