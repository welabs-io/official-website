// TIPOS DO MANIFESTO DE MOTION
// Mirrors lib/motion-manifest.schema.json (schema 1.2.0 of the motion round: chain steps carry `overview` and `detail`): what the site reads of the manifest and
// nothing else. Times are seconds of piece time; every duration, hold and transition on screen comes from here.
import type { PRODUCT_SLUGS } from "../product-slugs";

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export type Endorse = "on" | "off";

export type Transition = {
  type: "cut" | "push-left" | "push-up" | "blend";
  duration: number;
  ease?: string;
};

export type Cover = { t: number; w1280: string; w640: string };

export type Covers = { start: Cover; settled: Cover };

// The part shared by chain steps, intros and film segments
export type SegmentCore = {
  piece: string;
  variant?: "site";
  title?: string;
  from: number;
  to: number;
  settledAt: number;
  rate: number;
  // Screen seconds the last frame stays still before the hand-off
  holdAfter: number;
  poster: string;
  covers: Covers;
  transition: Transition;
};

// "outcome" is the end of the chain (everything closes at Domus), not a product
export type Connection = {
  from: ProductSlug;
  to: ProductSlug | "outcome";
  value: string;
  // Short value the site displays: pt-BR, sentence case, at most 3 words and 24 characters
  label: string;
};

// End of the token: a product, or "outcome" (the end of the chain)
export type TokenEnd = ProductSlug | "outcome";

// Top block of a step (schema 1.2): drawn by the site in SVG and CSS. Times are seconds of piece time of the detail piece.
export type Overview = {
  // Nodes lit while the step is active
  nodes: ProductSlug[];
  token: { from: TokenEnd; to: TokenEnd };
  from: number;
  to: number;
  // Caption of the top block: pt-BR, sentence case, at most 6 words and 48 characters
  label: string;
};

// Bottom block of a step (schema 1.2): a clip of an accepted piece. `hold` is the screen seconds the last frame stays
// still, and it is part of the time of the step.
export type Detail = {
  piece: string;
  from: number;
  to: number;
  settledAt: number;
  rate: number;
  hold: number;
  covers: Covers;
  srLabel: string;
};

export type ChainStep = SegmentCore & {
  step: number;
  // One short sentence for screen readers: the accessible name of the active step
  srLabel: string;
  products: ProductSlug[];
  connection: Connection;
  overview: Overview;
  detail: Detail;
};

export type Film = {
  piece: string;
  role: "main" | "support";
  // Accessible name of the film
  title: string;
  proves: string;
  segments: SegmentCore[];
  poster?: string;
  endPoster?: string;
};

export type ProductEntry = {
  order: number;
  group: "core" | "rail";
  intro: SegmentCore;
  films: Film[];
};

export type Piece = {
  src: string;
  sha256: string;
  sourceSha256: string;
  duration: number;
  width: number;
  height: number;
  minDisplayWidth?: number;
  endorse: Endorse;
  siteVariant: { hide: string[] };
  posters: string[];
};

export type Manifest = {
  schema: "welabs-motion-manifest/1";
  schemaVersion: string;
  round: string;
  brandVersion: string;
  generatedAt: string;
  brand: { welabs: string; sealRule: string; endorse: Endorse };
  player: { package: "hyperframes"; version: string; src: string };
  defaults: {
    holdAfter: number;
    minScreenSeconds: number;
    transitionBetweenSteps: Transition;
  };
  pieces: Record<string, Piece>;
  chain: {
    status: "final" | "fallback";
    loop: boolean;
    cycleSeconds?: number;
    steps: ChainStep[];
  };
  products: Record<ProductSlug, ProductEntry>;
};
