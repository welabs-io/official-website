// PRODUTOS DA WELABS
// Single list for the home and the product pages, in the operator's weight order. The line under each logo is factual
// and short (at most six words): no slogan, no brand-concept phrase. `category` and `keywords` live in the page
// metadata only (operator decision of 2026-10-08): nothing here but `name` and `line` may be rendered.
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

// Official logo with the "by welabs" seal; the file theme matches the band it sits on
export const productLogo = (slug: ProductSlug, tone: "dark" | "light") =>
  `/brands/welabs/products/${slug}-${tone}-endorsed.svg`;

export const WELABS_LOGO = {
  dark: "/brands/welabs/welabs-logo-dark.svg",
  light: "/brands/welabs/welabs-logo-light-block.svg",
};

export const ABOUT_LINE = "Produtos próprios de software";
export const HERO_LINE = "Cinco produtos conectados entre si";
export const CTA_LABEL = "Conversar com a Welabs";
