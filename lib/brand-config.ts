// POLÍTICA DO SELO "BY WELABS"
// The single place that decides where a product shows the "by welabs" seal (the -endorsed logo files) and where it
// shows the standalone logo. Operator decision of 2026-10-12: the default is NO seal; the seal stays only in the identity
// highlight of each product (the registered form "X BY WELABS" in use). Every logo and every alt text of the site asks
// this policy through productLogo / productAlt (lib/products.ts), so no component hardcodes a seal. When the motion
// manifest is read (`brand.endorse`), "off" there turns every place off; the places below are the only exceptions.
export type Endorse = "on" | "off";

// Where a product logo or name is shown
export type LogoPlace =
  // Large logo and h1 of the product page, once per page
  | "hero"
  // Accessible name of the first logo of each product on the home
  | "first-mention"
  // Rows of logos (chain, products), miniature core and rails, connector block, navigation, footer, CTA
  | "row"
  | "hub";

// Global switch: "off" removes the seal everywhere, including the places the policy allows
export const BRAND_ENDORSE: Endorse = "on";

const ENDORSED_PLACES: readonly LogoPlace[] = ["hero", "first-mention"];

// Below this height (px) a seal is unreadable, so the logo is always the standalone one
export const MIN_ENDORSED_HEIGHT = 40;

export function endorsePolicy(place: LogoPlace, height?: number): boolean {
  if (BRAND_ENDORSE === "off") return false;
  if (height !== undefined && height < MIN_ENDORSED_HEIGHT) return false;
  return ENDORSED_PLACES.includes(place);
}
