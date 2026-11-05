// POLÍTICA DA FORMA COMPLETA DO LOGO
// The single place that decides where a product shows its full form ("welabs" small above the name, the -full logo files,
// the name "Welabs {product}") and where it shows the standalone logo and name. Brand 2.0.0 (2026-11-05) replaced the
// "by welabs" seal with this form; the operator's rule of 2026-10-12 still applies: the default is the standalone form, and
// the full form stays only in the identity highlight of each product. Every logo and every alt text of the site asks this
// policy through productLogo / productAlt (lib/products.ts), so no component hardcodes it.

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

// Below this rendered height (px) "welabs" is unreadable, so the logo is always the standalone one. The brand hides the
// full form when the x-height of the name is under 14 px (tokens: logo.full-form-hidden-below-px); the name's x-height is
// 150 units and the tallest full file (tuner) is 604.39 units tall, so 14 px of x-height is 57 px of file height.
export const MIN_FULL_HEIGHT = 57;

export function fullFormPolicy(place: LogoPlace, height?: number): boolean {
  if (height !== undefined && height < MIN_FULL_HEIGHT) return false;
  return IDENTITY_PLACES.includes(place);
}
