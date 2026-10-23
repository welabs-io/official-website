// CONFIGURAÇÃO DAS PÁGINAS
// Every band is the light theme of the site (the white page of the ERP front tokens); a band that needs to stand apart
// takes the soft band surface, and the contact closes on the warm halo. One declarative list of sections per route;
// components/template/SiteTemplate walks it and renders each section, so no section markup is copied between routes.
// - Home: the opening with the stage of the five products, the message that crosses the operation, the Domus and its
//   modules, the five products, what changes, the contact and where we run.
// - Product page: the selector of the five products and the opening with the carousel of the product (a kit scene), the
//   Domus modules on the Domus page, the product among the others, the details that come with it and the contact.
// v2.1 (2026-10-20): the film of the fitting pieces (`#chain`) left the home (a drawing with no function: the stage of the
// opening already shows the products on the Domus, now with what each one does), and the door to the next product left
// the end of a product (the selector at its top replaces it). `pad` names the spacing class of the section
// (home.module.css).
// v3 (2026-10-23): the carousel of the opening replaces the interaction of each product (`play` left), and a product
// page is a page of its own: the home is no longer rendered above it (operator, 2026-10-21).
import type { ProductSlug } from "./products";

export type SectionPad =
  "intro" | "block" | "products" | "productPage" | "contact" | "closing";

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
          ] as SectionConfig[])
        : []),
      // The bands keep alternating: the soft band right after the opening, the page under it
      {
        id: "center",
        kind: "center",
        slug,
        pad: "block",
        surface: slug === "domus" ? undefined : "band",
      },
      {
        id: "details",
        kind: "details",
        slug,
        pad: "block",
        surface: slug === "domus" ? "band" : undefined,
      },
      // The product ends on its contact; the way to another product is the selector at its top
      {
        id: "contact",
        kind: "contact",
        slug,
        pad: "contact",
        surface: "contact",
      },
    ],
  };
}
