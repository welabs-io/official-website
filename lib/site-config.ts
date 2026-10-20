// CONFIGURAÇÃO DAS PÁGINAS
// Every band is the light (cream) theme of the brand; the contact band is amber. One declarative list of sections per
// route; components/template/SiteTemplate walks it and renders each section, so no section markup is copied between
// routes. The v2 of the content (2026-10-20): little text, the rest is motion the visitor plays.
// - Home: the opening with the stage of the five products, the film of the fitting pieces, the message that crosses the
//   operation, the Domus and its rooms, the five products, what changes, the contact and where we run.
// - Product page: the opening, the one interaction of the product (the Domus has its rooms and its fields), the product
//   among the others, the details that come with it, the contact and the door to the next product.
// `pad` names the spacing class of the section (home.module.css).
import { PRODUCTS, type ProductSlug } from "./products";

export type SectionPad =
  | "intro"
  | "block"
  | "products"
  | "productPage"
  | "contact"
  | "closing";

type Base = {
  id: string;
  pad: SectionPad;
  // Heading for screen readers only (a visual band that shows no title of its own)
  srTitle?: string;
  // The surface of the band: cream (default), the soft band cream, or the amber of the contact
  surface?: "band" | "amber";
};

export type SectionConfig =
  | (Base & { kind: "intro" })
  | (Base & { kind: "fit" })
  | (Base & { kind: "message" })
  | (Base & { kind: "domus" })
  | (Base & { kind: "products" })
  | (Base & { kind: "effects" })
  | (Base & { kind: "contact"; slug?: ProductSlug })
  | (Base & { kind: "platforms" })
  | (Base & { kind: "opening"; slug: ProductSlug })
  | (Base & { kind: "areas" })
  | (Base & { kind: "play"; slug: ProductSlug })
  | (Base & { kind: "center"; slug: ProductSlug })
  | (Base & { kind: "details"; slug: ProductSlug })
  // The way down to the next product, at the end of a product (the descent goes on into it)
  | (Base & { kind: "next"; slug: ProductSlug });

export type PageConfig = {
  home: boolean;
  sections: SectionConfig[];
};

const platforms: SectionConfig = {
  id: "platforms",
  kind: "platforms",
  pad: "closing",
};

export const HOME_CONFIG: PageConfig = {
  home: true,
  sections: [
    { id: "intro", kind: "intro", pad: "intro" },
    {
      id: "chain",
      kind: "fit",
      pad: "block",
      srTitle: "Os produtos se encaixam",
    },
    { id: "message", kind: "message", pad: "block", surface: "band" },
    { id: "domus", kind: "domus", pad: "block" },
    { id: "products", kind: "products", pad: "products", surface: "band" },
    { id: "operation", kind: "effects", pad: "block" },
    { id: "contact", kind: "contact", pad: "contact", surface: "amber" },
    platforms,
  ],
};

export function productConfig(slug: ProductSlug): PageConfig {
  return {
    home: false,
    sections: [
      { id: "product", kind: "opening", slug, pad: "productPage" },
      ...(slug === "domus"
        ? ([
            { id: "areas", kind: "areas", pad: "block", surface: "band" },
            { id: "play", kind: "play", slug, pad: "block" },
          ] as SectionConfig[])
        : ([
            { id: "play", kind: "play", slug, pad: "block", surface: "band" },
          ] as SectionConfig[])),
      {
        id: "center",
        kind: "center",
        slug,
        pad: "block",
        surface: slug === "domus" ? "band" : undefined,
      },
      { id: "details", kind: "details", slug, pad: "block" },
      { id: "contact", kind: "contact", slug, pad: "contact", surface: "amber" },
      // The product ends on the next one, and the page goes on into it
      { id: "next", kind: "next", slug, pad: "block" },
    ],
  };
}

// DESCIDA CONTÍNUA
// The home is cut in two around the product slot: the head (from the opening to the five products, where the cards are)
// stays above the product that opens, and the tail (what changes, the contact, where we run) gives way to it. The cut is
// right after the products band, so the product is the next section of the home.
const CUT = HOME_CONFIG.sections.findIndex((s) => s.id === "products") + 1;
export const HOME_HEAD: PageConfig = {
  ...HOME_CONFIG,
  sections: HOME_CONFIG.sections.slice(0, CUT),
};
export const HOME_TAIL: PageConfig = {
  home: true,
  sections: HOME_CONFIG.sections.slice(CUT),
};

// The product after this one, in the order of the list (the last one leads back to the first)
export const nextProduct = (slug: ProductSlug): ProductSlug => {
  const i = PRODUCTS.findIndex((p) => p.slug === slug);
  return PRODUCTS[(i + 1) % PRODUCTS.length].slug;
};
