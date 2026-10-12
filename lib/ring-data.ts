// DADOS DO ANEL SERIALIZADOS NO SERVIDOR
// Everything the browser code of a ring (components/ring/ring-run.ts) needs to play it: the segments of every slide, the
// products each tile lights and the stretch of the bus each tile fills. The server computes it from lib/motion-slides
// and writes it into the stage as a <script type="application/json">, so the lazy chunk reads the DOM and never imports
// the montage or piece lists (and their JSON) itself.
import {
  BUS_SLOTS,
  CHAIN_CONNECTIONS,
  activeSpan,
  connectionSpan,
  type BusSpan,
} from "./chain-connections";
import {
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  productFilms,
  type Segment,
  type Slide,
} from "./motion-slides";
import type { ProductSlug } from "./products";

export type RingKind = "chain" | "products" | "films" | "hero";

export type RingData = {
  // Slides as the playback reads them: the segments, and the product of the slide (the tile of a carousel by slide)
  slides: { slug?: string; segments: Segment[] }[];
  // Per tile: the products it lights in the row of logos and the stretch of the bus it fills
  lit: string[][];
  spans: BusSpan[];
};

export const slidesOf = (kind: RingKind, slug?: ProductSlug): Slide[] =>
  kind === "chain"
    ? MONTAGE_SLIDES
    : kind === "products"
      ? PRODUCT_SLIDES
      : kind === "films"
        ? productFilms(slug!)
        : PRODUCT_SLIDES.filter((slide) => slide.slug === slug);

export function ringData(kind: RingKind, slug?: ProductSlug): RingData {
  const slides = slidesOf(kind, slug);
  // The chain has one tile per cut; the other kinds have one tile per slide
  const perCut = kind === "chain";
  const cuts = slides.flatMap((slide) =>
    slide.segments.map((segment) => segment.products ?? []),
  );
  const lit: string[][] = perCut
    ? cuts.map((c) => [...c])
    : slides.map((s) => [s.slug ?? ""]);
  const spans = perCut
    ? cuts.map((_, i) => connectionSpan(CHAIN_CONNECTIONS[i] ?? null))
    : slides.map((s) =>
        s.slug && s.slug in BUS_SLOTS
          ? activeSpan(s.slug)
          : connectionSpan(null),
      );
  return {
    slides: slides.map(({ slug: product, segments }) => ({
      slug: product,
      segments,
    })),
    lit,
    spans,
  };
}
