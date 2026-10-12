// CONFIGURAÇÃO DAS PÁGINAS
// One declarative list of sections per route; components/template/SiteTemplate walks it and renders each section. The
// home and the five product pages are the same template with two configurations and the same sequence of sections
// (ring, ring, connector block, closing), so no section markup is copied between routes. `pad` names the spacing class
// of the section (home.module.css).
import { productBySlug, type ProductSlug } from "./products";
import type { RingKind } from "./ring-data";

export type Tone = "dark" | "light";
export type { RingKind };
export type SectionPad =
  | "chain"
  | "products"
  | "productPage"
  | "productChain"
  | "connectors"
  | "closing";

type Base = {
  id: string;
  tone: Tone;
  pad: SectionPad;
  // Heading for screen readers only (the site shows no visible titles)
  srTitle?: string;
  // Thread of the page: "off" where the drawing of the section crosses the axis itself
  thread?: "on" | "off" | "none";
  // Stretch of the thread at the bottom of the section, with the pulse that goes down to the next dock; `railDelay`
  // is the wait (seconds) between the swap of the ring and the start of the pulse
  rail?: "drop" | "converge";
  railDelay?: number;
};

export type SectionConfig =
  | (Base & {
      kind: "ring";
      ring: {
        id: string;
        kind: RingKind;
        // The product of the ring: the page's own (kind "product") or the one the chain is narrowed to
        slug?: ProductSlug;
        logos?: "lit" | "links" | "pinned" | null;
        eager?: boolean;
        label: string;
      };
      // Product block (logo and factual line) above the stage, on the product page
      head?: { slug: ProductSlug };
    })
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
      kind: "ring",
      tone: "dark",
      pad: "chain",
      srTitle: "Cadeia",
      rail: "drop",
      railDelay: 0.5,
      ring: {
        id: "chain-ring",
        kind: "chain",
        logos: "lit",
        eager: true,
        label: "Cortes dos filmes dos produtos",
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
        logos: "links",
        label: "Abertura e filme de cada produto",
      },
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
        },
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
