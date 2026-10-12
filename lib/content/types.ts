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
