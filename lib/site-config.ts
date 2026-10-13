// CONFIGURAÇÃO DAS PÁGINAS
// Every band is the light (cream) theme of the brand: the home and the product pages have one theme, no alternating
// graphite and cream bands. The site has no video: the chain, the products carousel of the home and the opening of a
// product page are native scenes.
// One declarative list of sections per route; components/template/SiteTemplate walks it and renders each section. The
// home and the five product pages are the same template with two configurations, so no section markup is copied between
// routes. The rhythm alternates visual bands (the chain, the product ring, the benefits with their scenes, the connector
// block) and reading bands (the order from start to end, who it is for, integrations, questions): the home is chain,
// order, products, benefits, audience, integrations, questions, connector block, closing; the product page is opening
// (with the capability scenes), what it solves, how it works (the chain), capabilities in groups, audience, questions,
// connector block, closing and the other products. The connector block always comes right before the closing, because
// its rails run down into it. `pad` names the spacing class of the section (home.module.css).
import { PAGE_HEADINGS } from "./content";
import { productBySlug, type ProductSlug } from "./products";

export type Tone = "dark" | "light";
export type SectionPad =
  | "chain"
  | "products"
  | "productPage"
  | "block"
  | "read"
  | "connectors"
  | "closing";

type Base = {
  id: string;
  tone: Tone;
  pad: SectionPad;
  // Heading for screen readers only (a visual band that shows no title of its own)
  srTitle?: string;
  // Thread of the page: "off" where the drawing of the section crosses the axis itself; "tail" draws only the stretch
  // under the content (the chain of the home, whose own connector carries the axis down to the ring)
  thread?: "on" | "off" | "tail" | "none";
  // Stretch of the thread at the bottom of the section, with the pulse that goes down to the next dock; `railDelay`
  // is the wait (seconds) between the swap of the ring and the start of the pulse
  rail?: "drop" | "converge";
  railDelay?: number;
};

// A carousel of native scenes: the id of its stage (the runner and the `ring:swap` event name it) and its accessible name
export type StageConfig = {
  id: string;
  label: string;
};

export type SectionConfig =
  // The chain of the home in two blocks: opening, overview (top) and the ring of detail scenes (bottom), joined by the
  // connector that drops from the lit node
  | (Base & { kind: "chain"; stage: StageConfig })
  // The products of the home: the carousel of one native scene per product, then the five cards, the one of the product
  // on screen lit
  | (Base & { kind: "products"; stage: StageConfig })
  // "How it works" of a product page: the native chain narrowed to the scenes of the product (overview on top, scenes
  // below)
  | (Base & { kind: "how"; slug: ProductSlug; title: string })
  // Opening of a product page: trail, logo, line and the stage of the capability scenes of the product
  | (Base & { kind: "hero"; slug: ProductSlug })
  // Three problems and what the product does about them (product page)
  | (Base & { kind: "resolves"; slug: ProductSlug })
  // Six capabilities in groups with one sentence each (product page)
  | (Base & { kind: "capabilities"; slug: ProductSlug })
  // Profiles and questions: the home's own (no slug) or a product's
  | (Base & { kind: "audience"; slug?: ProductSlug })
  | (Base & { kind: "faq"; slug?: ProductSlug })
  // The order from start to end, in seven steps (home)
  | (Base & { kind: "journey" })
  // What changes in the operation, with a native scene each (home)
  | (Base & { kind: "benefits" })
  // Channels, data, cloud and AI (home)
  | (Base & { kind: "integrations" })
  // The other four products (product page)
  | (Base & { kind: "others"; slug: ProductSlug })
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
  tone: "light",
  pad: "connectors",
  srTitle,
  lit,
  thread: "off",
  rail: "converge",
});
const closing: SectionConfig = {
  id: "platforms",
  kind: "closing",
  tone: "light",
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
      tone: "light",
      pad: "chain",
      thread: "tail",
      rail: "drop",
      railDelay: 0.5,
      stage: {
        id: "chain-ring",
        label: "Cenas de cada sistema da cadeia",
      },
    },
    { id: "how", kind: "journey", tone: "light", pad: "read" },
    {
      id: "products",
      kind: "products",
      tone: "light",
      pad: "products",
      srTitle: "Produtos",
      rail: "drop",
      railDelay: 0.2,
      stage: {
        id: "products-ring",
        label: "Uma tela de cada produto",
      },
    },
    { id: "operation", kind: "benefits", tone: "light", pad: "read" },
    { id: "audience", kind: "audience", tone: "light", pad: "read" },
    { id: "integrations", kind: "integrations", tone: "light", pad: "read" },
    { id: "faq", kind: "faq", tone: "light", pad: "read" },
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
        kind: "hero",
        slug,
        tone: "light",
        pad: "productPage",
      },
      { id: "resolves", kind: "resolves", slug, tone: "light", pad: "block" },
      {
        id: "how",
        kind: "how",
        slug,
        tone: "light",
        pad: "block",
        title: PAGE_HEADINGS.how,
        rail: "drop",
        railDelay: 0.2,
      },
      {
        id: "capabilities",
        kind: "capabilities",
        slug,
        tone: "light",
        pad: "read",
      },
      {
        id: "audience",
        kind: "audience",
        slug,
        tone: "light",
        pad: "read",
      },
      { id: "faq", kind: "faq", slug, tone: "light", pad: "read" },
      hub(`${name} no núcleo e nos trilhos`, slug),
      closing,
      { id: "others", kind: "others", slug, tone: "light", pad: "read" },
    ],
  };
}
