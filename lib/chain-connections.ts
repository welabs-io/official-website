// LIGAÇÕES DOS CORTES DA CADEIA
// What each cut of the chain montage connects, in the order of the cuts (the same order as CUT_POSTERS): the product
// the connection leaves and the one it reaches. `null` is a cut that shows one product alone or all five together.
// This is a fixture derived from lib/home-montage.json until the motion manifest brings `connection` per cut; the only
// consumer is the row of logos (components/template/LogoRow), which fills the bus between the two products.
import type { ProductSlug } from "./products";

export type Connection = { from: ProductSlug; to: ProductSlug };

export const CHAIN_CONNECTIONS: readonly (Connection | null)[] = [
  null,
  { from: "tuner", to: "relloo" },
  null,
  { from: "relloo", to: "domus" },
  null,
  { from: "domus", to: "magneto" },
  null,
  null,
  { from: "knowly", to: "relloo" },
];

// Slot of each product on the bus, in weight order (the five columns of the row)
export const BUS_SLOTS: Record<ProductSlug, number> = {
  domus: 0,
  relloo: 1,
  magneto: 2,
  tuner: 3,
  knowly: 4,
};

// The axis of the page crosses the bus at the centre of the middle slot
export const AXIS_SLOT = 2;

// Stretch of the bus to fill: from slot `lo` to slot `hi`, growing from the side `origin` ("left" or "right")
export type BusSpan = { lo: number; hi: number; origin: "left" | "right" };

const span = (from: number, to: number): BusSpan => ({
  lo: Math.min(from, to),
  hi: Math.max(from, to),
  origin: from <= to ? "left" : "right",
});

// Chain: between the two products of the connection (empty when the cut has none)
export const connectionSpan = (connection: Connection | null): BusSpan =>
  connection
    ? span(BUS_SLOTS[connection.from], BUS_SLOTS[connection.to])
    : span(AXIS_SLOT, AXIS_SLOT);

// Products: from the active product to the axis, where the thread goes down
export const activeSpan = (slug: ProductSlug): BusSpan =>
  span(BUS_SLOTS[slug], AXIS_SLOT);
