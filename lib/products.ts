// PRODUTOS DA WELABS
// Single list for the home and the product pages, in the operator's weight order. The line under each logo is factual
// and short (at most six words): no slogan, no brand-concept phrase. `category` and `keywords` live in the page
// metadata only (operator decision of 2026-10-08): nothing here but `name` and `line` may be rendered.
import { endorsePolicy, type LogoPlace } from "./brand-config";

export const PRODUCTS = [
  {
    slug: "domus",
    name: "Domus",
    line: "Gestão da empresa inteira",
    category: "ERP",
    keywords: [
      "ERP",
      "sistema de gestão empresarial",
      "vendas",
      "estoque",
      "financeiro",
      "fiscal",
    ],
  },
  {
    slug: "relloo",
    name: "Relloo",
    line: "Conversas e atendimento",
    category: "CRM",
    keywords: ["CRM", "gestão de relacionamento", "atendimento multicanal"],
  },
  {
    slug: "magneto",
    name: "Magneto",
    line: "Fluxos com aprovação",
    category: "Automação de processos e workflow",
    keywords: ["automação de processos", "workflow", "BPM", "aprovações"],
  },
  {
    slug: "tuner",
    name: "Tuner",
    line: "WhatsApp, ligações e canais",
    category: "Canais de atendimento",
    keywords: ["WhatsApp", "central de atendimento", "omnichannel"],
  },
  {
    slug: "knowly",
    name: "Knowly",
    line: "Respostas com a fonte",
    category: "Base de conhecimento com IA",
    keywords: ["base de conhecimento", "IA", "busca semântica", "RAG"],
  },
] as const;

export type ProductSlug = (typeof PRODUCTS)[number]["slug"];

export const productBySlug = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

// Official logo of the product; the file theme matches the band it sits on. Whether it carries the "by welabs" seal is
// decided by endorsePolicy (lib/brand-config.ts) from the place and the rendered height, never by the caller.
export const productLogo = (
  slug: ProductSlug,
  tone: "dark" | "light",
  place: LogoPlace = "row",
  height?: number,
) =>
  `/brands/welabs/products/${slug}-${tone}${endorsePolicy(place, height) ? "-endorsed" : ""}.svg`;

// Accessible name of a product logo: "<Name> by Welabs" only where the policy allows the seal
export const productAlt = (slug: ProductSlug, place: LogoPlace = "row") =>
  endorsePolicy(place)
    ? `${productBySlug(slug)!.name} by Welabs`
    : productBySlug(slug)!.name;

// Left padding of each logo file (viewBox x offset over viewBox height), used to align the wordmark with the text
export const LOGO_PAD: Record<ProductSlug, number> = {
  domus: 0.1277,
  relloo: 0.1365,
  magneto: 0.1201,
  tuner: 0.1122,
  knowly: 0.1201,
};

export const WELABS_LOGO = {
  dark: "/brands/welabs/welabs-logo-dark.svg",
  light: "/brands/welabs/welabs-logo-light-block.svg",
};

// Says what happens after the click (v2): the contact is the only way in, a button with no form
export const CTA_LABEL = "Agendar uma demonstração";
