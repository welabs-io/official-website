// SLIDES DE MOTION DO SITE
// Builds the slides of every ring from lib/motion-pieces.json (the list scripts/sync-motion.mjs copies). A slide is a
// list of segments played back to back: a segment is a range of one piece. Home chain: a montage of clips of the
// product films at 2.5x, no opening. Home products: the closing seconds of the product opening (the part that forms the logo) flowing into a
// clip of its first film. Product page: the whole opening, then the films in full.
import montage from "./home-montage.json";
import pieces from "./motion-pieces.json";
import { PRODUCTS, type ProductSlug } from "./products";

export type Segment = {
  id: string;
  // Played range of the piece, in seconds (range-start and range-end of the player)
  range: readonly [number, number];
  // Playback speed (1 when absent); the range is in piece time, so it lasts (end - start) / rate on screen
  rate?: number;
  // How the next segment enters when this one hands off (the workbench montage): a push of `duration` seconds. When
  // absent the handoff is the crossfade of the ring.
  transition?: PushTransition;
  // Seconds the last frame of the range stays still before the next segment starts (workbench montage)
  holdAfter?: number;
  // Products this cut shows (they light up in the product row of the workbench)
  products?: readonly ProductSlug[];
};

// Push transition: the incoming clip slides over the leaving one, both move together (no overlap of captions)
export type PushTransition = {
  type: "push-left" | "push-up";
  duration: number;
};

export type Slide = {
  key: string;
  // Accessible name of the slide (used by the manual switch only)
  label: string;
  segments: Segment[];
  // Cover image: what a neighbour shows before its player is ready, and the static frame under reduced motion
  poster: string;
  // Last frame the slide plays: what the tile shows as the dimmed previous neighbour once its player is gone
  endPoster?: string;
  slug?: ProductSlug;
};

// A film played in full skips its empty first frames
export const FILM_START = 1.2;

const poster = (id: string) => `/motion/posters/${id}.webp`;
const endPoster = (id: string) => `/motion/posters/end-${id}.webp`;
const entry = (slug: ProductSlug) => pieces.products[slug];
type Film = { id: string; duration: number; clip?: number[] };
const filmSegment = (film: Film): Segment => ({
  id: film.id,
  range: film.clip
    ? ([film.clip[0], film.clip[1]] as const)
    : ([FILM_START, film.duration] as const),
});

// MONTAGEM DA CADEIA
// The top of the home: cuts of the individual product films (kind "product") interleaved with cuts of the chain films
// (kind "relation", the products together with their logos), each at its own `rate` (up to 2x where there is little to
// read, 1.25x to 1.75x where there is text), in the order that tells how it all works. The list lives in
// lib/home-montage.json (per step: product and cuts with film, start, end, rate, transition). No opening.
// Duration of the position swap of the montage ring, in seconds
export const MONTAGE_SWAP = montage.swap;
// 1-based number of the first cut of step `step` (cuts are numbered across the whole montage)
const cutNumber = (step: number) =>
  1 + montage.steps.slice(0, step).reduce((n, s) => n + s.segments.length, 0);
export const MONTAGE_SLIDES: Slide[] = montage.steps.map((step, i) => ({
  key: `montage-${i + 1}`,
  label: `Passo ${i + 1}`,
  slug: step.product as ProductSlug,
  // A step is a run of cuts of the same product, played back to back
  segments: step.segments.map((segment) => ({
    id: segment.film,
    range: [segment.start, segment.end] as const,
    rate: segment.rate,
    transition: segment.transition as PushTransition,
    // A cut may override the default hold of the montage
    holdAfter:
      (segment as { holdAfter?: number }).holdAfter ?? montage.holdAfter,
    products: segment.products as ProductSlug[],
  })),
  poster: poster(`cut-${cutNumber(i)}`),
}));

// Cover of every cut in playing order: its settled last frame (the same still serves as the previous and the next
// neighbour of the chain carousel, which has one tile per cut)
export const CUT_POSTERS: string[] = montage.steps.flatMap((step, i) =>
  step.segments.map((_, j) => poster(`cut-${cutNumber(i) + j}`)),
);

// Seconds the settled logo of an opening stays still before the blend into the film. The player freezes up to 0.1 s
// after the seal settles and the first frame of the blend lands about 0.1 s after the hold ends, so 0.95 s here is
// measured as 1 s of still logo and seal on screen.
export const INTRO_HOLD = 0.95;

// Products section of the home: the opening until the logo and seal settle (1 s still), then a clip of the first film
export const PRODUCT_SLIDES: Slide[] = PRODUCTS.map(({ slug, name }) => {
  const { intro, films } = entry(slug);
  return {
    key: slug,
    label: name,
    slug,
    segments: [
      // The opening plays until the logo and the "by welabs" seal have settled (3.9 s; the player freezes 0.1 s
      // before the range end at 4 s), holds that still frame for the montage hold and then blends into the film.
      // The tagline slot of the piece is hidden in the site copy (public/motion), so no tagline ever shows.
      {
        id: intro.id,
        range: [intro.tail[0], intro.tail[1]] as const,
        holdAfter: INTRO_HOLD,
      },
      {
        ...filmSegment(films[0] as Film),
        // The film holds its settled last frame, then the ring rotates to the next product
        transition: { type: "push-left", duration: MONTAGE_SWAP },
        holdAfter: montage.holdAfter,
      },
    ],
    // Still of the formed logo (no tagline): what a neighbour shows before it plays
    poster: poster(`tail-${slug}`),
    endPoster: endPoster(films[0].id),
  };
});

// Product page: the other films of the product in full (the first one plays in the opening block, clipped), as slides
// of a circular carousel like the one of the home. Each film holds its last frame, then the ring rotates.
export function productFilms(slug: ProductSlug): Slide[] {
  const { films } = entry(slug);
  return (films as Film[]).slice(1).map((film, i) => ({
    key: film.id,
    label: `Filme ${i + 1}`,
    slug,
    segments: [
      {
        id: film.id,
        range: [FILM_START, film.duration] as const,
        transition: { type: "push-left", duration: MONTAGE_SWAP },
        holdAfter: montage.holdAfter,
      },
    ],
    poster: poster(film.id),
    endPoster: endPoster(film.id),
  }));
}
