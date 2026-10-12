// PRODUTOS DA WELABS
// Single list for the home and the product pages, in the operator's weight order. The line under each logo is factual
// and short (at most six words): no slogan, no brand-concept phrase. `category` and `keywords` live in the page
// metadata only (operator decision of 2026-10-08): nothing here but `name` and `line` may be rendered.
import { endorsePolicy, type LogoPlace } from "./brand-config";

export const PRODUCTS = [
  {
    slug: "domus",
    name: "Domus",
    line: "Gestão completa da empresa",
    category: "ERP",
    keywords: ["ERP", "sistema de gestão empresarial", "financeiro", "fiscal"],
  },
  {
    slug: "relloo",
    name: "Relloo",
    line: "Relacionamento, atendimento e vendas",
    category: "CRM",
    keywords: ["CRM", "gestão de relacionamento", "funil de vendas"],
  },
  {
    slug: "magneto",
    name: "Magneto",
    line: "Fluxos de trabalho em blocos",
    category: "Automação de processos e workflow",
    keywords: ["automação de processos", "workflow", "BPM", "aprovações"],
  },
  {
    slug: "tuner",
    name: "Tuner",
    line: "WhatsApp, voz e chat do site",
    category: "Canais de atendimento",
    keywords: ["WhatsApp", "central de atendimento", "omnichannel"],
  },
  {
    slug: "knowly",
    name: "Knowly",
    line: "Base de conhecimento com fonte",
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
  `/brands/welabs/products/${slug}-${tone}${endorsePolicy(place, height, slug) ? "-endorsed" : ""}.svg`;

// Accessible name of a product logo: "<Name> by Welabs" only where the policy allows the seal
export const productAlt = (slug: ProductSlug, place: LogoPlace = "row") =>
  endorsePolicy(place, undefined, slug)
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

export const CTA_LABEL = "Conversar com a Welabs";
