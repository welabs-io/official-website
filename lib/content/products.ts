// ESTRUTURA DA PÁGINA DE CADA PRODUTO
// The words of a product page live in the dictionaries (lib/i18n/messages/<locale>/products.ts); this file keeps the
// structure that does not change with the language (which detail sits under which of the three differences) and builds
// the page the components read. The page of a product (v2 of the content, approved on 2026-10-20): little text, every
// claim from the code of the product (v13 analysis, section 1).
// v3 (2026-10-23): the carousel of the kit replaces the capability scenes of the opening and the interaction of each
// product; the carousel carries its own text (lib/i18n/messages/<locale>/scenes).
// v4 (Cards.dc.html, 2026-10-23): the three differences of the product, as the cards that open. Each one is its title,
// the sentence that shows when the card opens, and the details (indices of `details`) that live under it.
import { fmt } from "../i18n/format";
import type { Messages } from "../i18n/types";
import type { ProductSlug } from "../products";

export type Differ = {
  title: string;
  body: string;
  details: readonly number[];
};

export type ProductPage = {
  // Sentence under the logo of the opening
  short: string;
  // Title of the stage with this product lit among the others, and the effect it shows there
  center: { title: string };
  // Details that come with the product: real, short, never the definition of the product
  details: readonly string[];
  // Open questions of the contact (no answers: they are the reason to talk)
  asks: readonly string[];
  differs: readonly Differ[];
};

// The details (indices of `details`) under each of the three differences of a product; every detail sits under exactly one
export const DIFFER_DETAILS: Record<
  ProductSlug,
  readonly (readonly number[])[]
> = {
  domus: [[4], [0, 1, 2, 3], [5]],
  relloo: [
    [0, 1],
    [2, 4],
    [3, 5],
  ],
  magneto: [[1, 4], [2], [0, 3]],
  tuner: [[0, 5], [2], [1, 3, 4]],
  knowly: [[0], [1, 2], [3, 4]],
};

export function productPage(m: Messages, slug: ProductSlug): ProductPage {
  const p = m.products[slug];
  return {
    short: p.short,
    center: { title: p.centerTitle },
    details: p.details,
    asks: p.asks,
    differs: p.differs.map((d, i) => ({
      title: d.title,
      body: d.body,
      details: DIFFER_DETAILS[slug][i],
    })),
  };
}

/** The headings shared by the five product pages; `contact` has the name of the product in it */
export const pageHeadings = (m: Messages) => ({
  ...m.products.headings,
  contact: (name: string) => fmt(m.products.headings.contact, { name }),
});
