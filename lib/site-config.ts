// CONFIGURAÇÃO DAS PÁGINAS
// One declarative list of sections per route; components/template/SiteTemplate walks it and renders each section. The
// home and the five product pages are the same template with two configurations, so no section markup is copied between
// routes. `pad` names the spacing class of the section (home.module.css).
import { productBySlug, type ProductSlug } from "./products";

export type Tone = "dark" | "light";
export type RingKind = "chain" | "products" | "films" | "hero";
export type SectionPad =
  | "chain"
  | "products"
  | "productPage"
  | "films"
  | "productCta"
  | "connectors"
  | "closing";

type Base = {
  id: string;
  tone: Tone;
  pad: SectionPad;
  // Heading for screen readers only (the site shows no visible titles)
  srTitle?: string;
  // Thread of the page: "off" where the drawing of the section crosses the axis itself
  thread?: "on" | "off";
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
        slug?: ProductSlug;
        logos?: "lit" | "links" | null;
        eager?: boolean;
        label: string;
      };
      // Product block (logo and factual line) above the stage, on the product page
      head?: { slug: ProductSlug };
    })
  | (Base & { kind: "hub"; lit?: ProductSlug })
  | (Base & { kind: "closing" })
  | (Base & { kind: "cta" });

export type PageConfig = {
  home: boolean;
  // The home has no visible title: its h1 is for screen readers
  srH1?: string;
  sections: SectionConfig[];
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
    {
      id: "connectors",
      kind: "hub",
      tone: "dark",
      pad: "connectors",
      srTitle: "Produtos ligados entre si",
      thread: "off",
    },
    {
      id: "platforms",
      kind: "closing",
      tone: "dark",
      pad: "closing",
      thread: "off",
    },
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
        ring: {
          id: "product-opening",
          kind: "hero",
          slug,
          eager: true,
          label: `Abertura do ${name}`,
        },
      },
      {
        id: "connectors",
        kind: "hub",
        tone: "light",
        pad: "connectors",
        srTitle: `${name} no núcleo e nos trilhos`,
        lit: slug,
        thread: "off",
      },
      {
        id: "films",
        kind: "ring",
        tone: "dark",
        pad: "films",
        srTitle: `Outros filmes do ${name}`,
        rail: "drop",
        railDelay: 0.4,
        ring: {
          id: "product-films",
          kind: "films",
          slug,
          label: `Filmes do ${name}`,
        },
      },
      { id: "contact", kind: "cta", tone: "light", pad: "productCta" },
    ],
  };
}
