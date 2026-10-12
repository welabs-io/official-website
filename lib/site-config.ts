// CONFIGURAÇÃO DAS PÁGINAS
// One declarative list of sections per route; components/template/SiteTemplate walks it and renders each section. The
// home and the five product pages are the same template with two configurations, so no section markup is copied between
// routes: the home is ring, ring (with the product cards), connector block, closing; the product page is ring (films
// with a live caption), resolves, capabilities, ring (the chain narrowed to the product), connector block, closing. The
// connector block always comes right before the closing, because its rails run down into it. `pad` names the spacing
// class of the section (home.module.css).
import { productBySlug, type ProductSlug } from "./products";
import type { RingKind } from "./ring-data";

export type Tone = "dark" | "light";
export type { RingKind };
export type SectionPad =
  | "chain"
  | "products"
  | "productPage"
  | "productChain"
  | "block"
  | "connectors"
  | "closing";

type Base = {
  id: string;
  tone: Tone;
  pad: SectionPad;
  // Heading for screen readers only (the site shows no visible titles)
  srTitle?: string;
  // Thread of the page: "off" where the drawing of the section crosses the axis itself; "tail" draws only the stretch
  // under the content (the chain of the home, whose own connector carries the axis down to the ring)
  thread?: "on" | "off" | "tail" | "none";
  // Stretch of the thread at the bottom of the section, with the pulse that goes down to the next dock; `railDelay`
  // is the wait (seconds) between the swap of the ring and the start of the pulse
  rail?: "drop" | "converge";
  railDelay?: number;
};

export type RingConfig = {
  id: string;
  kind: RingKind;
  // The product of the ring: the page's own (kind "product") or the one the chain is narrowed to
  slug?: ProductSlug;
  logos?: "lit" | "links" | "pinned" | null;
  eager?: boolean;
  label: string;
  // Live caption under the ring, from the content of the product (product page)
  caption?: boolean;
};

export type SectionConfig =
  // The chain of the home in two blocks: opening, overview (top) and the ring of detail scenes (bottom), joined by the
  // connector that drops from the lit node
  | (Base & { kind: "chain"; ring: RingConfig })
  | (Base & {
      kind: "ring";
      ring: RingConfig;
      // Product block (logo and factual line) above the stage, on the product page
      head?: { slug: ProductSlug };
      // Grid of the five product cards under the ring, the active product lit (home)
      cards?: boolean;
    })
  // Three problems and what the product does about them (product page)
  | (Base & { kind: "resolves"; slug: ProductSlug })
  // Six capabilities in a grid (product page)
  | (Base & { kind: "capabilities"; slug: ProductSlug })
  | (Base & { kind: "hub"; lit?: ProductSlug })
  | (Base & { kind: "closing" });

export type PageConfig = {
  home: boolean;
  // The home has no visible title: its h1 is for screen readers
  srH1?: string;
  sections: SectionConfig[];
};

// The connector block and the closing are the same on every route (the hub only lights the product of a product page)
const hub = (srTitle: string, lit?: ProductSlug): SectionConfig => ({
  id: "connectors",
  kind: "hub",
  tone: "dark",
  pad: "connectors",
  srTitle,
  lit,
  thread: "off",
  rail: "converge",
});
const closing: SectionConfig = {
  id: "platforms",
  kind: "closing",
  tone: "dark",
  pad: "closing",
  thread: "none",
};

export const HOME_CONFIG: PageConfig = {
  home: true,
  srH1: "Welabs",
  sections: [
    {
      id: "chain",
      kind: "chain",
      tone: "dark",
      pad: "chain",
      thread: "tail",
      rail: "drop",
      railDelay: 1,
      ring: {
        id: "chain-ring",
        kind: "chain",
        eager: true,
        label: "Cenas de cada sistema da cadeia",
      },
    },
    {
      id: "products",
      kind: "ring",
      tone: "light",
      pad: "products",
      srTitle: "Produtos",
      rail: "drop",
      railDelay: 0.4,
      ring: {
        id: "products-ring",
        kind: "products",
        // No row of logos: the five cards right below repeat it and already light the active product
        logos: null,
        label: "Abertura e filme de cada produto",
      },
      cards: true,
    },
    hub("Produtos ligados entre si"),
    closing,
  ],
};

export function productConfig(slug: ProductSlug): PageConfig {
  const { name } = productBySlug(slug)!;
  return {
    home: false,
    sections: [
      {
        id: "product",
        kind: "ring",
        tone: "dark",
        pad: "productPage",
        head: { slug },
        rail: "drop",
        railDelay: 0.4,
        ring: {
          id: "product-ring",
          kind: "product",
          slug,
          logos: "pinned",
          eager: true,
          label: `Abertura e filmes do ${name}`,
          caption: true,
        },
      },
      {
        id: "resolves",
        kind: "resolves",
        slug,
        tone: "light",
        pad: "block",
      },
      {
        id: "capabilities",
        kind: "capabilities",
        slug,
        tone: "dark",
        pad: "block",
      },
      {
        id: "chain",
        kind: "ring",
        tone: "light",
        pad: "productChain",
        srTitle: `${name} na cadeia`,
        rail: "drop",
        railDelay: 0.5,
        ring: {
          id: "chain-ring",
          kind: "chain",
          slug,
          logos: "lit",
          label: `Cortes da cadeia com o ${name}`,
        },
      },
      hub(`${name} no núcleo e nos trilhos`, slug),
      closing,
    ],
  };
}
