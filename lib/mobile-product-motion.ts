// COMPOSIÇÕES DE PRODUTO PARA CELULAR
// Native portrait sources supply readable actions; the functional copy is shared with desktop plans.
import manifest from "./mobile-product-motion-pieces.json";
import type { ProductSlug } from "./products";

export type MobileProductChapter = {
  key: string;
  start: number;
  end: number;
  posterTime: number;
};
export type MobileProductPiece = {
  id: string;
  duration: number;
  sha256: string;
  chapters: readonly MobileProductChapter[];
};
const products = manifest.products as Record<ProductSlug, MobileProductPiece>;
export const getMobileProductMotion = (slug: ProductSlug) => products[slug];
export const mobileProductSource = (id: string) =>
  `/motion/product-mobile/pieces/${id}/index.html`;
export const mobileProductPoster = (id: string, key: string) =>
  `/motion/posters/${id}-${key}.webp`;
