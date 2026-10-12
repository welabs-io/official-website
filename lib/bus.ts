// BARRAMENTO DA FILEIRA DE LOGOS
// Geometry of the row of logos (components/template/LogoRow): five equal columns, one per product in weight order, so the
// stretch of the bus that lights up is plain column numbers. The connection of a cut comes from the motion manifest.
import type { ProductSlug } from "./manifest/types";

// Slot of each product on the bus, in weight order
export const BUS_SLOTS: Record<ProductSlug, number> = {
  domus: 0,
  relloo: 1,
  magneto: 2,
  tuner: 3,
  knowly: 4,
};

// The axis of the page crosses the bus at the centre of the middle slot
export const AXIS_SLOT = 2;

// Stretch of the bus to fill: from slot `lo` to slot `hi`, growing from the side `origin`
export type BusSpan = { lo: number; hi: number; origin: "left" | "right" };

const span = (from: number, to: number): BusSpan => ({
  lo: Math.min(from, to),
  hi: Math.max(from, to),
  origin: from <= to ? "left" : "right",
});

// Chain: between the two products of the connection; the end of the chain ("outcome") runs to the axis, where the
// thread of the page goes down
export const connectionSpan = (
  connection: { from: ProductSlug; to: ProductSlug | "outcome" } | undefined,
): BusSpan =>
  connection
    ? span(
        BUS_SLOTS[connection.from],
        connection.to === "outcome" ? AXIS_SLOT : BUS_SLOTS[connection.to],
      )
    : span(AXIS_SLOT, AXIS_SLOT);

// Products: from the active product to the axis
export const activeSpan = (slug: ProductSlug): BusSpan =>
  span(BUS_SLOTS[slug], AXIS_SLOT);
