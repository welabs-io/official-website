// GEOMETRIA DOS CONECTORES
// The relation of the products drawn as a graph: Domus and Relloo are the core, Magneto, Tuner and Knowly are rails that
// cross it, and pulses travel along the rails. Everything is laid out in two axes: `along` (the way the rails run) and
// `across` (the way they are stacked). The wide layout runs along x, the tall one (phones) along y; a layout is a set
// of numbers, the drawing code never branches on the orientation except to map (along, across) to (x, y).
import type { ProductSlug } from "./products";

export const CORE: readonly ProductSlug[] = ["domus", "relloo"];
export const RAILS: readonly ProductSlug[] = ["magneto", "tuner", "knowly"];

export type Layout = {
  name: "wide" | "tall";
  // View box of the drawing
  width: number;
  height: number;
  // Rails: where each one sits across, where it starts and ends along
  rails: readonly number[];
  from: number;
  to: number;
  // Core box: range along and across; its two halves split across at the middle (Domus first, Relloo second)
  core: { along: readonly [number, number]; across: readonly [number, number] };
  // Logos: height of a logo and the along position of the centre of the rail logos and of the core logos
  logoHeight: number;
  coreLogoHeight: number;
  railLogoAt: number;
  coreLogoAt: number;
};

export const WIDE: Layout = {
  name: "wide",
  width: 960,
  height: 320,
  rails: [80, 160, 240],
  from: 150,
  to: 930,
  core: { along: [440, 640], across: [24, 296] },
  logoHeight: 64,
  coreLogoHeight: 64,
  railLogoAt: 82,
  coreLogoAt: 540,
};

export const TALL: Layout = {
  name: "tall",
  width: 360,
  height: 560,
  rails: [60, 180, 300],
  from: 64,
  to: 530,
  core: { along: [270, 370], across: [12, 348] },
  logoHeight: 44,
  coreLogoHeight: 52,
  railLogoAt: 30,
  coreLogoAt: 320,
};

// Maps (along, across) to a point of the view box
export const point = (layout: Layout, along: number, across: number) =>
  layout.name === "wide" ? { x: along, y: across } : { x: across, y: along };

// Aspect of the logo files (view box 1005 x 550)
export const LOGO_ASPECT = 1005 / 550;

// Position and size of one logo box, in view box units, centred on (along, across)
export function logoBox(
  layout: Layout,
  along: number,
  across: number,
  height: number,
) {
  const width = height * LOGO_ASPECT;
  const centre = point(layout, along, across);
  return {
    left: centre.x - width / 2,
    top: centre.y - height / 2,
    width,
    height,
  };
}

// Where each product sits: rails by their order, core halves by the split of the core across
export function nodeAt(layout: Layout, slug: ProductSlug) {
  const rail = RAILS.indexOf(slug);
  if (rail >= 0)
    return logoBox(
      layout,
      layout.railLogoAt,
      layout.rails[rail],
      layout.logoHeight,
    );
  const [lo, hi] = layout.core.across;
  const mid = (lo + hi) / 2;
  const centre = CORE.indexOf(slug) === 0 ? (lo + mid) / 2 : (mid + hi) / 2;
  return logoBox(layout, layout.coreLogoAt, centre, layout.coreLogoHeight);
}

// ESTADO DE CADA PRODUTO NO GRAFO
// "lit" is the product of the page, "linked" a product it is tied to, "dim" one it is not. Without a lit product (the
// home) everything is linked. A rail is tied to the core; a core half is tied to the other half and to every rail.
export type NodeState = "lit" | "linked" | "dim";
export function stateOf(slug: ProductSlug, lit?: ProductSlug): NodeState {
  if (!lit) return "linked";
  if (slug === lit) return "lit";
  if (CORE.includes(slug)) return "linked";
  // A rail is tied to the product of the page only when that product is in the core
  return CORE.includes(lit) ? "linked" : "dim";
}

// A rail carries pulses when its product is tied to the product of the page (or when nothing is lit)
export const railRuns = (slug: ProductSlug, lit?: ProductSlug) =>
  stateOf(slug, lit) !== "dim";
