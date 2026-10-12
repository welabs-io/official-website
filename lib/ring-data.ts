// DADOS DO ANEL SERIALIZADOS NO SERVIDOR
// Everything the browser code of a ring (components/ring/ring-run.ts) needs to play it: the segments of every slide (with
// the hold and the transition of the manifest), the products each tile lights, the stretch of the bus each tile fills
// and the label of its connection. The server computes it from the manifest and writes it into the stage as a
// <script type="application/json">, so the lazy chunk reads the DOM and never imports the manifest itself.
import { activeSpan, connectionSpan, type BusSpan } from "./bus";
import {
  chainSlides,
  productPageSlides,
  productSlides,
  type ProductSlug,
  type Segment,
  type Slide,
} from "./motion-slides";

export type RingKind = "chain" | "products" | "product";

export type RingData = {
  slides: { slug?: string; segments: Segment[] }[];
  // Per tile: the products it lights in the row of logos, the stretch of the bus it fills and the label of its connection
  lit: string[][];
  spans: BusSpan[];
  labels: string[];
};

export const slidesOf = (kind: RingKind, slug?: ProductSlug): Slide[] =>
  kind === "chain"
    ? chainSlides(slug)
    : kind === "products"
      ? productSlides()
      : productPageSlides(slug!);

export function ringData(kind: RingKind, slug?: ProductSlug): RingData {
  const slides = slidesOf(kind, slug);
  const perCut = kind === "chain";
  return {
    slides: slides.map(({ slug: product, segments }) => ({
      slug: product,
      segments,
    })),
    // The chain lights the products of the cut; the other rings light the product of the tile (the page's own product
    // on a product page)
    lit: slides.map((s) =>
      perCut ? [...(s.segments[0].products ?? [])] : [slug ?? s.slug ?? ""],
    ),
    spans: slides.map((s) =>
      perCut
        ? connectionSpan(s.connection)
        : activeSpan((slug ?? s.slug) as ProductSlug),
    ),
    labels: slides.map((s) => (perCut ? (s.connection?.label ?? "") : "")),
  };
}
