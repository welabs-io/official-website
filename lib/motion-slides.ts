// SLIDES DE MOTION DO SITE
// Builds the slides of every reel from lib/motion-pieces.json (the list scripts/sync-motion.mjs copies): the opening of
// each product, the opening followed by a clip of the product's first film, the chain film behind the Welabs opening,
// and the full reel of a product page. Products keep the operator's weight order.
import pieces from "./motion-pieces.json";
import { PRODUCTS, type ProductSlug } from "./products";

export type Slide = {
  key: string;
  // Opening piece id and film piece id; a slide has at least one of them
  intro?: string;
  film?: string;
  // Clip of the film, in seconds, played through range-start and range-end
  clip?: readonly [number, number];
  // Cover image: the closing frame of the opening, or a frame of the film
  poster: string;
};

const poster = (id: string) => `/motion/posters/${id}.jpg`;
const entry = (slug: ProductSlug) => pieces.products[slug];

// Section 1: the five openings, one after the other
export const HERO_SLIDES: Slide[] = PRODUCTS.map(({ slug }) => ({
  key: slug,
  intro: entry(slug).intro.id,
  poster: poster(entry(slug).intro.id),
}));

// Section 3: each product opens with its opening and goes on with a clip of its first film
export const PRODUCT_SLIDES: Slide[] = PRODUCTS.map(({ slug }) => {
  const { intro, films } = entry(slug);
  const film = films[0] as { id: string; clip?: number[] };
  return {
    key: slug,
    intro: intro.id,
    film: film.id,
    clip: film.clip ? ([film.clip[0], film.clip[1]] as const) : undefined,
    poster: poster(intro.id),
  };
});

// Section 4: the Welabs opening, then the whole chain film
export const CHAIN_SLIDE: Slide = {
  key: "chain",
  intro: pieces.welabsIntro.id,
  film: pieces.chain.id,
  poster: poster(pieces.welabsIntro.id),
};
// Film time (s) at which each product lights up in the chain film (Domus, Relloo, Magneto, Tuner, Knowly) and the time
// at which the last beat, where all of them work together, begins
export const CHAIN_BEATS = pieces.chain.beats;

// Product page: the opening, then every film of the product, each one playing in full
export function productReel(slug: ProductSlug): Slide[] {
  const { intro, films } = entry(slug);
  return [
    { key: "intro", intro: intro.id, poster: poster(intro.id) },
    ...films.map((film) => ({
      key: film.id,
      film: film.id,
      poster: poster(film.id),
    })),
  ];
}
