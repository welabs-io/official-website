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
};

export type Slide = {
  key: string;
  // Accessible name of the slide (used by the manual switch only)
  label: string;
  segments: Segment[];
  // Cover image: what a neighbour shows before its player is ready, and the static frame under reduced motion
  poster: string;
  slug?: ProductSlug;
};

// A film played in full skips its empty first frames
export const FILM_START = 1.2;

const poster = (id: string) => `/motion/posters/${id}.jpg`;
const entry = (slug: ProductSlug) => pieces.products[slug];
type Film = { id: string; duration: number; clip?: number[] };
const filmSegment = (film: Film): Segment => ({
  id: film.id,
  range: film.clip
    ? ([film.clip[0], film.clip[1]] as const)
    : ([FILM_START, film.duration] as const),
});

// MONTAGEM DA CADEIA
// The top of the home: clips of the individual product films, played at `rate` times the normal speed, in the order
// that tells how it all works. The list lives in lib/home-montage.json (per step: product and clips with film, start,
// end) so a clip is adjusted there; lib/film-beats.json holds the action and hold map the cuts follow. No opening, no Welabs film.
export const MONTAGE_RATE = montage.rate;
// Duration of the position swap of the montage ring, in seconds
export const MONTAGE_SWAP = montage.swap;
export const MONTAGE_SLIDES: Slide[] = montage.steps.map((step, i) => ({
  key: `montage-${i + 1}`,
  label: `Passo ${i + 1}`,
  slug: step.product as ProductSlug,
  // A step has one clip per action of the film; clips of a step play back to back (the pauses between them are skipped)
  segments: step.segments.map((segment) => ({
    id: segment.film,
    range: [segment.start, segment.end] as const,
    rate: montage.rate,
  })),
  poster: poster(`montage-${i + 1}`),
}));

// Products section of the home: opening tail, then a clip of the first film
export const PRODUCT_SLIDES: Slide[] = PRODUCTS.map(({ slug, name }) => {
  const { intro, films } = entry(slug);
  return {
    key: slug,
    label: name,
    slug,
    segments: [
      { id: intro.id, range: [intro.tail[0], intro.tail[1]] as const },
      filmSegment(films[0] as Film),
    ],
    poster: poster(intro.id),
  };
});

// Product page: the opening in full, then every film of the product in full. The first slide carries the opening
// and the first film; each other film is a slide of its own.
export function productReel(slug: ProductSlug): Slide[] {
  const { intro, films } = entry(slug);
  return (films as Film[]).map((film, i) => ({
    key: film.id,
    label: `Filme ${i + 1}`,
    segments:
      i === 0
        ? [
            { id: intro.id, range: [0, intro.duration] as const },
            {
              id: film.id,
              range: [FILM_START, film.duration] as const,
            },
          ]
        : [
            {
              id: film.id,
              range: [FILM_START, film.duration] as const,
            },
          ],
    poster: i === 0 ? poster(intro.id) : poster(film.id),
  }));
}
