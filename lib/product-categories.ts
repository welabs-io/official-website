import type { Metadata } from "next";

// CATEGORIA DE CADA PRODUTO NOS METADADOS
// Operator decision (2026-10-08): the category term (ERP, CRM...) only lives in each product page's
// title, description, keywords and JSON-LD. Visible text conveys the category through what the
// product does, so nothing in this file may be rendered on the page.
type Pair = [pt: string, en: string];
type ProductCategory = {
  // Category term, as used in the title ("Domus · ERP")
  term: Pair;
  // Sentence that opens the meta description
  lead: Pair;
  keywords: [pt: string[], en: string[]];
};

export const PRODUCT_CATEGORY: Record<string, ProductCategory> = {
  erp: {
    term: ["ERP", "ERP"],
    lead: ["ERP da Welabs.", "The Welabs ERP."],
    keywords: [
      [
        "ERP",
        "sistema de gestão empresarial",
        "financeiro",
        "fiscal",
        "NFS-e",
        "contratos",
        "estoque",
        "compras",
        "vendas",
        "produção",
        "projetos",
        "low-code",
      ],
      [
        "ERP",
        "business management system",
        "finance",
        "tax",
        "contracts",
        "inventory",
        "purchasing",
        "sales",
        "manufacturing",
        "projects",
        "low-code",
      ],
    ],
  },
  flow: {
    term: [
      "Automação de processos e workflow",
      "Process automation and workflow",
    ],
    lead: [
      "Automação de processos e workflow da Welabs.",
      "Process automation and workflow by Welabs.",
    ],
    keywords: [
      [
        "automação de processos",
        "workflow",
        "BPM",
        "orquestração",
        "aprovações",
      ],
      ["process automation", "workflow", "BPM", "orchestration", "approvals"],
    ],
  },
  "welabs-crm": {
    term: ["CRM", "CRM"],
    lead: ["CRM da Welabs.", "The Welabs CRM."],
    keywords: [
      ["CRM", "gestão de relacionamento", "funil de vendas", "atendimento"],
      ["CRM", "relationship management", "sales pipeline", "customer service"],
    ],
  },
  wekb: {
    term: ["Base de conhecimento com IA", "AI knowledge base"],
    lead: [
      "Base de conhecimento com IA da Welabs.",
      "The Welabs AI knowledge base.",
    ],
    keywords: [
      [
        "base de conhecimento",
        "IA",
        "busca semântica",
        "RAG",
        "gestão do conhecimento",
      ],
      [
        "knowledge base",
        "AI",
        "semantic search",
        "RAG",
        "knowledge management",
      ],
    ],
  },
  channels: {
    term: ["Omnichannel", "Omnichannel"],
    lead: [
      "Plataforma omnichannel da Welabs.",
      "The Welabs omnichannel platform.",
    ],
    keywords: [
      [
        "omnichannel",
        "central de canais",
        "WhatsApp oficial",
        "central de voz",
        "atendimento",
      ],
      [
        "omnichannel",
        "channel hub",
        "official WhatsApp",
        "voice centre",
        "customer service",
      ],
    ],
  },
};

// Title, description and keywords of a product page, with its category term.
export function categoryMetadata(
  id: string,
  name: string,
  summary: string,
  en: boolean,
): Pick<Metadata, "title" | "description" | "keywords"> {
  const c = PRODUCT_CATEGORY[id];
  if (!c) return { title: `${name} | Welabs`, description: summary };
  const i = en ? 1 : 0;
  return {
    title: `${name} · ${c.term[i]} | Welabs`,
    description: `${c.lead[i]} ${summary}`,
    keywords: [name, ...c.keywords[i], "Welabs"],
  };
}

// JSON-LD of a product page: a SoftwareApplication whose subcategory carries the category term.
export function productJsonLd(
  id: string,
  name: string,
  summary: string,
  url: string,
  en: boolean,
) {
  const c = PRODUCT_CATEGORY[id];
  const i = en ? 1 : 0;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    url,
    applicationCategory: "BusinessApplication",
    ...(c && {
      applicationSubCategory: c.term[i],
      keywords: c.keywords[i].join(", "),
    }),
    description: c ? `${c.lead[i]} ${summary}` : summary,
    operatingSystem: "Web",
    inLanguage: en ? "en" : "pt-BR",
    publisher: { "@type": "Organization", name: "Welabs" },
  };
}
