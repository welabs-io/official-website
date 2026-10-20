// CONFIGURAÇÃO DAS PÁGINAS
// Every band is the light theme of the site (the white page of the ERP front tokens); a band that needs to stand apart
// takes the soft band surface, and the contact closes on the warm halo. One declarative list of sections per route;
// components/template/SiteTemplate walks it and renders each section, so no section markup is copied between routes.
// - Home: the opening with the stage of the five products, the message that crosses the operation, the Domus and its
//   modules, the five products, what changes, the contact and where we run.
// - Product page: the selector of the five products and the opening, the one interaction of the product (the Domus has
//   its modules and its fields), the product among the others, the details that come with it and the contact.
// v2.1 (2026-10-20): the film of the fitting pieces (`#chain`) left the home (a drawing with no function: the stage of the
// opening already shows the products on the Domus, now with what each one does), and the door to the next product left
// the end of a product (the selector at its top replaces it). `pad` names the spacing class of the section
// (home.module.css).
import type { ProductSlug } from "./products";

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
  // The surface of the band: the page (default), the soft band, or the contact (the warm halo with the amber bar)
  surface?: "band" | "contact";
};

export type SectionConfig =
  | (Base & { kind: "intro" })
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
  | (Base & { kind: "details"; slug: ProductSlug });

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
    { id: "message", kind: "message", pad: "block", surface: "band" },
    { id: "domus", kind: "domus", pad: "block" },
    { id: "products", kind: "products", pad: "products", surface: "band" },
    { id: "operation", kind: "effects", pad: "block" },
    { id: "contact", kind: "contact", pad: "contact", surface: "contact" },
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
      // The product ends on its contact; the way to another product is the selector at its top
      { id: "contact", kind: "contact", slug, pad: "contact", surface: "contact" },
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
