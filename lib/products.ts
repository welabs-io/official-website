// PRODUTOS DA WELABS
// Single list for the home and the product pages, in the operator's weight order. The name is the brand and is never
// translated. The line under each logo (factual and short: no slogan, no brand-concept phrase), the category and the
// keywords are text and live in the dictionaries (lib/i18n/messages/<locale>/products.ts); `category` and `keywords`
// are page metadata only (operator decision of 2026-10-08), never rendered.
import { endorsePolicy, type LogoPlace } from "./brand-config";

export const PRODUCTS = [
  // The platform carries the Welabs name in its own name (decision 3 of 2026-10-29); the logo file keeps "domus"
  { slug: "domus", name: "Welabs Domus" },
  { slug: "relloo", name: "Relloo" },
  { slug: "magneto", name: "Magneto" },
  { slug: "tuner", name: "Tuner" },
  { slug: "knowly", name: "Knowly" },
] as const;

export type ProductSlug = (typeof PRODUCTS)[number]["slug"];

export const productBySlug = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

// Official logo of the product; the file theme matches the band it sits on. Whether it carries the "by welabs" seal is
// decided by endorsePolicy (lib/brand-config.ts) from the place and the rendered height, never by the caller.
export const productLogo = (
  slug: ProductSlug,
  tone: "dark" | "light",
  place: LogoPlace = "row",
  height?: number,
) =>
  `/brands/welabs/products/${slug}-${tone}${endorsePolicy(place, height) ? "-endorsed" : ""}.svg`;

// The name with the seal line: "<Name> by Welabs", except for a name that already carries Welabs ("Welabs Domus")
export const carriesWelabs = (slug: ProductSlug) =>
  productBySlug(slug)!.name.startsWith("Welabs ");

export const productEndorsedName = (slug: ProductSlug) =>
  carriesWelabs(slug)
    ? productBySlug(slug)!.name
    : `${productBySlug(slug)!.name} by Welabs`;

// Accessible name of a product logo: the endorsed name only where the policy allows the seal
export const productAlt = (slug: ProductSlug, place: LogoPlace = "row") =>
  endorsePolicy(place) ? productEndorsedName(slug) : productBySlug(slug)!.name;

// Left padding of each logo file (viewBox x offset over viewBox height), used to align the wordmark with the text
export const LOGO_PAD: Record<ProductSlug, number> = {
  domus: 0.1277,
  relloo: 0.1365,
  magneto: 0.1201,
  tuner: 0.1122,
  knowly: 0.1201,
};

// v3 (F2 review, F2-01): where the ink of each light logo file starts, from the left edge of its viewBox, over the
// viewBox height: the protection area plus the side bearing of the first letter. A logo of height h placed with a left
// margin of -(h × ink) starts its ink on the edge of the text under it. Measured with getBBox over every drawn element
// of public/brands/welabs/products/<slug>-light.svg (Playwright, 2026-10-22); e2e/alignment.spec.ts measures it again
// from the files, so a new brand version that moves the ink fails there.
export const LOGO_INK_X: Record<ProductSlug, number> = {
  domus: 0.1728,
  relloo: 0.1935,
  magneto: 0.1728,
  tuner: 0.1596,
  knowly: 0.1728,
};

export const WELABS_LOGO = {
  dark: "/brands/welabs/welabs-logo-dark.svg",
  light: "/brands/welabs/welabs-logo-light-block.svg",
};
