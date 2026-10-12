// SLIDES DE MOTION DO SITE
// Builds the slides of every ring from lib/motion-pieces.json (the list scripts/sync-motion.mjs copies). A slide is a
// list of segments played back to back: a segment is a range of one piece. The home journey contains authored cuts
// without an opening; its product carousel contains only complete identity openings. Product-page narratives use
// authored action ranges without an identity pre-roll; standalone previews use qualified product clips.
import montage from "./home-montage.json";
import pieces from "./motion-pieces.json";
import { PRODUCTS, type ProductSlug } from "./products";
import {
  getProductMotionPlan,
  type ProductMotionChapter,
} from "./product-motion-plans";

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
  // Narrative fallback shows the operational result, independently from the first live segment's identity phase.
  posterPhase?: "intro" | "film";
  posterPieceId?: string;
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
  poster: poster(
    (step.segments[0] as { poster?: string }).poster ?? `cut-${cutNumber(i)}`,
  ),
}));

// Cover of every cut in playing order: its settled last frame (the same still serves as the previous and the next
// neighbour of the chain carousel, which has one tile per cut)
export const CUT_POSTERS: string[] = montage.steps.flatMap((step, i) =>
  step.segments.map((segment, j) =>
    poster(
      (segment as { poster?: string }).poster ?? `cut-${cutNumber(i) + j}`,
    ),
  ),
);

// Additional reading hold after the complete opening when a sequence is allowed to advance. Manual identity
// exploration keeps the formed mark until the reader selects another product or explicitly replays it.
export const INTRO_HOLD = 0.7;

// ABERTURAS INDIVIDUAIS DO CARROSSEL
// Show the entire identity formation; the settled mark has a reading hold, with no product-film segment or film cover.
export const PRODUCT_SLIDES: Slide[] = PRODUCTS.map(({ slug, name }) => {
  const { intro } = entry(slug);
  return {
    key: slug,
    label: name,
    slug,
    segments: [
      // Preserve every formation beat and the authored settled identity at the end of the full range.
      {
        id: intro.id,
        range: [0, intro.duration] as const,
        rate: 1.2,
        holdAfter: INTRO_HOLD,
      },
    ],
    // Still of the formed logo (no tagline): what a neighbour shows before it plays
    poster: poster(`tail-${slug}`),
  };
});

// HERO E PRÉVIAS DE PRODUTO
// Product-page heroes retain the entire opening and first film. Home previews use only the qualified product clip.
const FILM_LABELS: Record<ProductSlug, readonly string[]> = {
  domus: [
    "Gestão completa da empresa",
    "Regras e automação",
    "Construção de telas e fluxos",
  ],
  relloo: [
    "Relacionamento, atendimento e vendas",
    "Assistentes no atendimento",
    "Fluxos de relacionamento",
    "Campanhas e jornadas",
  ],
  magneto: [
    "Construção de workflows",
    "Processos em execução",
    "Do desenho à publicação",
    "Automação com assistência",
  ],
  tuner: ["Canais e conversas", "Operação de voz", "WhatsApp oficial"],
  knowly: [
    "Respostas com fontes",
    "Fontes de conhecimento",
    "Acesso ao conhecimento",
  ],
};

export function heroSlides(slug: ProductSlug): Slide[] {
  const { intro, films } = entry(slug);
  return [
    {
      key: `${slug}-hero`,
      label: FILM_LABELS[slug][0],
      slug,
      segments: [
        { id: intro.id, range: [0, intro.duration], holdAfter: INTRO_HOLD },
        {
          id: films[0].id,
          range: [FILM_START, films[0].duration],
          holdAfter: montage.holdAfter,
        },
      ],
      poster: poster(`tail-${slug}`),
      endPoster: endPoster(films[0].id),
    },
  ];
}

export function previewSlides(slug: ProductSlug): Slide[] {
  const film = entry(slug).films[0];
  const cuts = MONTAGE_SLIDES.flatMap((slide) => slide.segments);
  const matchingCut = cuts.findIndex((cut) => cut.id === film.id);
  return [
    {
      key: `${slug}-preview`,
      label: FILM_LABELS[slug][0],
      slug,
      segments: [
        slug === "domus"
          ? { id: film.id, range: [14.1, 20.8] }
          : filmSegment(film as Film),
      ],
      poster:
        slug === "domus"
          ? poster("cut-5")
          : matchingCut >= 0
            ? CUT_POSTERS[matchingCut]
            : endPoster(film.id),
    },
  ];
}

// FILMES COMPLETOS DE PRODUTO
// The remaining films retain their full ranges and factual names instead of numbered placeholders.
export function productFilms(slug: ProductSlug): Slide[] {
  const { films } = entry(slug);
  return (films as Film[]).slice(1).map((film, i) => ({
    key: film.id,
    label:
      FILM_LABELS[slug][i + 1] ?? PRODUCTS.find((p) => p.slug === slug)!.name,
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

// NARRATIVAS CONTÍNUAS DE PRODUTO
// Consume authored chapters without mixing functional-page content into media sources, ranges or timing.
const chapterPoster = (value: string) =>
  value.startsWith("/") ? value : poster(value.replace(/\.webp$/, ""));

function chapterSlide(chapter: ProductMotionChapter, slug: ProductSlug): Slide {
  const result = chapter.segments[chapter.segments.length - 1];
  return {
    key: chapter.key,
    label: chapter.title,
    slug,
    // The last authored action is readable when media is reduced or unavailable; playback still starts at segment zero.
    poster: chapterPoster(result.poster),
    posterPhase: result.pieceId.includes("intro") ? "intro" : "film",
    posterPieceId: result.pieceId,
    segments: chapter.segments.map((segment) => ({
      id: segment.pieceId,
      range: [segment.start, segment.end],
      rate: segment.rate,
      holdAfter: segment.holdAfter,
      // Identity dissolves into its example; scene changes move through the same shared frame.
      ...(segment.pieceId.includes("intro")
        ? {}
        : {
            transition: { type: "push-left", duration: 0.4 } as PushTransition,
          }),
    })),
  };
}

export function productStorySlides(slug: ProductSlug): Slide[] {
  const plan = getProductMotionPlan(slug);
  return plan.chapters.map((chapter) => chapterSlide(chapter, slug));
}

export function productOverviewSlides(slug: ProductSlug): Slide[] {
  const plan = getProductMotionPlan(slug);
  return [chapterSlide(plan.chapters[0], slug)];
}
