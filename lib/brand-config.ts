// POLÍTICA DO SELO "BY WELABS"
// The single place that decides where a product shows the "by welabs" seal (the -endorsed logo files) and where it
// shows the standalone logo. Operator decision of 2026-10-12: the default is NO seal; the seal stays only in the identity
// highlight of each product (the registered form "X BY WELABS" in use). Every logo and every alt text of the site asks
// this policy through productLogo / productAlt (lib/products.ts), so no component hardcodes a seal.
// BRAND_ENDORSE is the default for small logos ("off": only the identity places keep the seal; "on": any logo at least
// MIN_ENDORSED_HEIGHT tall may carry it). It was the `brand.endorse` of the motion manifest until the site became 100%
// native, with the same value.

export type Endorse = "on" | "off";

export const BRAND_ENDORSE: Endorse = "off";

// Where a product logo or name is shown
export type LogoPlace =
  // Large logo and h1 of the product page, once per page
  | "hero"
  // Accessible name of the first logo of each product on the home
  | "first-mention"
  // Rows of logos (the cards, the ground of the Domus, the stations of the message), the stage, navigation, footer, CTA
  | "row"
  | "hub";

const IDENTITY_PLACES: readonly LogoPlace[] = ["hero", "first-mention"];

// Below this height (px) a seal is unreadable, so the logo is always the standalone one
export const MIN_ENDORSED_HEIGHT = 40;

export function endorsePolicy(
  place: LogoPlace,
  height?: number,
  brandEndorse: Endorse = BRAND_ENDORSE,
): boolean {
  if (height !== undefined && height < MIN_ENDORSED_HEIGHT) return false;
  if (IDENTITY_PLACES.includes(place)) return true;
  return brandEndorse === "on";
}
