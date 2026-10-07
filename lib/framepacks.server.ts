import catalog from "./presentation-catalog.json";
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
export function publicPoster(id: string) {
  const film = coverFilmOf(id, catalog.find((p) => p.id === id)?.publisher);
  return film
    ? `/motion/${film.id}/poster.jpg`
    : "/company-brands/welabs-logo.png";
}
