// Visible catalog only: a hidden product has no page (lib/catalog.ts)
import catalog from "./catalog";
import { coverFilmOf } from "./brand-cover";

// CATÁLOGO DE PRODUTOS
// Welabs products are presented through their films; the legacy presentation packs (We{product}
// names, internal codename) were never served and left the repository with the split of 2026-10-07,
// so a catalog entry no longer carries a manifest.
export function getFramepack(id: string) {
  const item = catalog.find((item) => item.id === id);
  return item ? { item } : null;
}
export function framepackIds() {
  return catalog.map((p) => ({ slug: p.id }));
}

// Share image: the accepted film poster (brand intro first, as on the product card), the company logo otherwise.
// The fallback is the 1200×630 share image built from the 1.2.1 dark logo on graphite.
export function publicPoster(id: string) {
  const film = coverFilmOf(id, catalog.find((p) => p.id === id)?.publisher);
  return film ? film.poster : "/brands/welabs/welabs-share.png";
}
