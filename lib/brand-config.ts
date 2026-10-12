// POLÍTICA DO SELO "BY WELABS"
// The single place that decides where a product shows the "by welabs" seal (the -endorsed logo files) and where it
// shows the standalone logo. Operator decision of 2026-10-12: the default is NO seal; the seal stays only in the identity
// highlight of each product (the registered form "X BY WELABS" in use). Every logo and every alt text of the site asks
// this policy through productLogo / productAlt (lib/products.ts), so no component hardcodes a seal.
// The motion manifest feeds it: `brand.endorse` is the default for small logos ("off": only the identity places keep the
// seal; "on": any logo at least MIN_ENDORSED_HEIGHT tall may carry it) and `pieces[<intro>].endorse` says whether the
// opening of a product carries the seal inside the piece, which is what the identity highlight must match.
import { MANIFEST } from "./manifest";
import type { Endorse, ProductSlug } from "./manifest/types";

export type { Endorse };

// Where a product logo or name is shown
export type LogoPlace =
  // Large logo and h1 of the product page, once per page
  | "hero"
  // Accessible name of the first logo of each product on the home
  | "first-mention"
  // Rows of logos (chain, products), miniature core and rails, connector block, navigation, footer, CTA
  | "row"
  | "hub";

const IDENTITY_PLACES: readonly LogoPlace[] = ["hero", "first-mention"];

// Below this height (px) a seal is unreadable, so the logo is always the standalone one
export const MIN_ENDORSED_HEIGHT = 40;

// Seal state of the opening of a product, as accepted in its piece
const openingEndorse = (slug: ProductSlug): Endorse =>
  MANIFEST.pieces[MANIFEST.products[slug].intro.piece].endorse;

export function endorsePolicy(
  place: LogoPlace,
  height?: number,
  slug?: ProductSlug,
  brandEndorse: Endorse = MANIFEST.brand.endorse,
): boolean {
  if (height !== undefined && height < MIN_ENDORSED_HEIGHT) return false;
  if (IDENTITY_PLACES.includes(place))
    return slug ? openingEndorse(slug) === "on" : true;
  return brandEndorse === "on";
}
