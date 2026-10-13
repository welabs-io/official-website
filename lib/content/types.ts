// TIPOS DO CONTEÚDO DO SITE
// Every visible sentence of the site lives in lib/content/*.ts, typed here, so a missing field is a compile error and
// no text is scattered through components. Limits (words per field) are enforced by lib/content/content.test.ts.
import type { ProductSlug } from "../products";

// Glyphs drawn by components/template/Icon.tsx
export type IconName =
  | "bank"
  | "screen"
  | "flow"
  | "contract"
  | "people"
  | "receipt"
  | "card"
  | "history"
  | "funnel"
  | "megaphone"
  | "cash"
  | "bot"
  | "blocks"
  | "wand"
  | "approval"
  | "versions"
  | "undo"
  | "log"
  | "chat"
  | "phone"
  | "globe"
  | "pin"
  | "transfer"
  | "link"
  | "folder"
  | "lock"
  | "shield"
  | "refresh"
  | "question";

// One capability: an icon and 2 to 5 words
export type Capability = { icon: IconName; text: string };

// One problem and what the product does about it
export type Resolve = { problem: string; does: string };

export type ProductContent = {
  // Three items, problem first
  resolves: readonly [Resolve, Resolve, Resolve];
  // Six items; the first three are the ones the home card shows
  capabilities: readonly [
    Capability,
    Capability,
    Capability,
    Capability,
    Capability,
    Capability,
  ];
  // Live caption of each tile of the film ring of the page (opening plus main film, then each support film)
  filmCaptions: readonly string[];
};

export type ProductContentMap = Record<ProductSlug, ProductContent>;

// AMPLIAÇÃO DO CONTEÚDO (HOME E PÁGINA DE PRODUTO)
// Types of the reading sections added by the depth work. All text is data here; the components only draw it.

// One question with a short answer (a <details> on the page)
export type Faq = { q: string; a: string };

// A profile of operation and the products that serve it
export type Audience = {
  title: string;
  text: string;
  products: readonly ProductSlug[];
};

// One step of the order, from start to end: the products involved and one sentence
export type JourneyStep = { products: readonly ProductSlug[]; text: string };

// One concrete change in the operation, drawn with the settled frame of a native scene
export type Benefit = {
  scene: "s0" | "s1" | "s2" | "s3" | "s4" | "s5" | "s6";
  title: string;
  text: string;
};

// A group of integrations: chips with an icon and/or the marks (by name in lib/partners.ts)
export type IntegrationGroup = {
  id: "channels" | "data" | "cloud" | "ai";
  title: string;
  text: string;
  chips: readonly { icon: IconName; text: string }[];
  marks: readonly string[];
};

// Capabilities of a product page in groups: `cap` indexes ProductContent.capabilities, `detail` is one sentence
export type CapabilityGroup = {
  title: string;
  items: readonly { cap: number; detail: string }[];
};

// What a product page adds to the content of ProductContent
export type ProductDepth = {
  groups: readonly CapabilityGroup[];
  audience: readonly Audience[];
  faq: readonly Faq[];
};

export type ProductDepthMap = Record<ProductSlug, ProductDepth>;
