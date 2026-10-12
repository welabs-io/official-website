// SLIDES DE MOTION DO SITE
// Builds the slides of every ring from the motion manifest (lib/motion-manifest.json, see lib/manifest). A slide is a
// list of segments played back to back; a segment is a range of one piece with its rate, its hold and its transition,
// all of them read from the manifest: the site decides no time. Chain: one slide per step, with the connection it shows.
// Products: the opening of each product followed by its main film. Product page: that same slide, then the support films.
import { MANIFEST } from "./manifest";
import { chainSteps } from "./manifest/select";
import type {
  ChainStep,
  Cover,
  Film,
  ProductSlug,
  SegmentCore,
  Transition,
} from "./manifest/types";
import { PRODUCT_CONTENT } from "./content/products";
import { PRODUCTS } from "./products";

export type { ProductSlug };

export type Segment = {
  // Piece id (the player source is /motion/v5/pieces/<id>/index.html)
  id: string;
  // Played range of the piece, in seconds (range-start and range-end of the player)
  range: readonly [number, number];
  // Playback speed; the range is in piece time, so it lasts (end - start) / rate on screen
  rate: number;
  // How the site leaves this segment for the next item
  transition: Transition;
  // Screen seconds the last frame stays still before the hand-off
  holdAfter: number;
  // Products this cut shows (the chain)
  products?: readonly ProductSlug[];
};

export type Slide = {
  key: string;
  // Accessible name of the slide
  label: string;
  segments: Segment[];
  // Cover image: what a neighbour shows before its player is ready, and the static frame under reduced motion
  cover: Cover;
  // Last frame the slide plays: what the tile shows as the dimmed previous neighbour once its player is gone
  endCover?: Cover;
  slug?: ProductSlug;
  // Live caption shown under the ring while this slide is active (product page; lib/content/products.ts)
  caption?: string;
  // Short value of the connection of the cut (chain), shown in the row of logos
  connection?: {
    from: ProductSlug;
    to: ProductSlug | "outcome";
    label: string;
  };
};

const segment = (
  s: SegmentCore,
  extra: Pick<Segment, "products"> = {},
): Segment => ({
  id: s.piece,
  range: [s.from, s.to],
  rate: s.rate,
  transition: s.transition,
  holdAfter: s.holdAfter,
  ...extra,
});

const lastOf = (film: Film) => film.segments[film.segments.length - 1];

// CADEIA
// One slide per step of the chain, `only` narrows it to the steps that show one product. The cover is the settled
// frame: the same still serves as the previous and the next neighbour and as the reduced-motion frame.
export function chainSlides(only?: ProductSlug): Slide[] {
  return chainSteps(MANIFEST, only).map(({ detail, ...step }: ChainStep) => ({
    key: `step-${step.step}`,
    label: detail.srLabel,
    // The time of the step is the time of its detail clip, hold included (schema 1.2)
    segments: [
      {
        id: detail.piece,
        range: [detail.from, detail.to] as const,
        rate: detail.rate,
        transition: step.transition,
        holdAfter: detail.hold,
        products: step.products,
      },
    ],
    cover: detail.covers.settled,
    connection: {
      from: step.connection.from,
      to: step.connection.to,
      label: step.connection.label,
    },
  }));
}

// PRODUTOS
// The opening of a product (its settled frame, the formed logo, is the cover) flowing into its main film, which keeps
// its settled last frame as the end cover.
export function productSlide(slug: ProductSlug): Slide {
  const { intro, films } = MANIFEST.products[slug];
  const main = films.find((film) => film.role === "main")!;
  return {
    key: slug,
    label: intro.title ?? PRODUCTS.find((p) => p.slug === slug)!.name,
    slug,
    segments: [segment(intro), ...main.segments.map((s) => segment(s))],
    cover: intro.covers.settled,
    endCover: lastOf(main).covers.settled,
  };
}

export const productSlides = (): Slide[] =>
  PRODUCTS.map(({ slug }) => productSlide(slug));

// PÁGINA DE PRODUTO
// One ring: the opening and main film of the product, then each support film in full. Each tile carries the caption
// the page shows while it is active (one per tile, in the same order).
export function productPageSlides(slug: ProductSlug): Slide[] {
  const { films } = MANIFEST.products[slug];
  const captions = PRODUCT_CONTENT[slug].filmCaptions;
  return [
    { ...productSlide(slug), caption: captions[0] },
    ...films
      .filter((film) => film.role === "support")
      .map((film, i): Slide => ({
        key: film.piece,
        label: film.title,
        slug,
        caption: captions[i + 1],
        segments: film.segments.map((s) => segment(s)),
        cover: film.segments[0].covers.start,
        endCover: lastOf(film).covers.settled,
      })),
  ];
}
