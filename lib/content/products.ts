// CONTEÚDO DE CADA PRODUTO
// The page of a product (v2 of the content, approved on 2026-10-20): little text, one interaction per product. Every
// claim comes from the code of the product, as measured in section 1 of the v13 analysis (portfolio/site-redesign/
// v13-proposta/analise.md): no funnel, coupon or cashback in the Relloo, no process written as a sentence in the Magneto,
// the Knowly limited to what the knowledge base already does, and the Domus as the whole management of the company, with
// tax and banks only as an attractive detail.
import type { CapabilitySceneId } from "../scenes/capabilities";
import type { ProductSlug } from "../products";

export type ProductPage = {
  // Sentence under the logo of the opening
  short: string;
  // Capability scenes of the opening, with the short name under each (the Domus opens with its areas instead)
  scenes: readonly { id: CapabilitySceneId; name: string }[];
  // The section of the interaction of the product
  play: { title: string; lead: string };
  // Title of the stage with this product lit among the others, and the effect it shows there
  center: { title: string; stamp: string };
  // Details that come with the product: real, short, never the definition of the product
  details: readonly string[];
  // Open questions of the contact (no answers: they are the reason to talk)
  asks: readonly string[];
};

export const PRODUCT_PAGE: Record<ProductSlug, ProductPage> = {
  domus: {
    short: "A gestão da empresa inteira, moldada à sua operação.",
    scenes: [],
    play: {
      title: "Do jeito da sua operação",
      lead: "Arraste um campo e a tela muda junto.",
    },
    center: {
      title: "Onde os outros produtos trabalham",
      stamp: "Marina já cadastrada",
    },
    details: [
      "NFS-e nacional",
      "PIX e extrato do Banco Inter",
      "Asaas",
      "Assinatura eletrônica",
      "Dados do Omie",
      "Assistente com IA",
    ],
    asks: [
      "Quais áreas a sua empresa usaria?",
      "Como trazer o que está no sistema atual?",
      "O que dá para moldar sem programar?",
    ],
  },
  relloo: {
    short: "As conversas de todos os canais, com a história de cada pessoa.",
    scenes: [
      { id: "relloo-person", name: "A pessoa inteira" },
      { id: "relloo-agent", name: "Agente que passa a vez" },
    ],
    play: {
      title: "Uma pessoa, todos os canais",
      lead: "Toque num canal.",
    },
    center: {
      title: "Junto dos outros produtos",
      stamp: "Marina com a Ana",
    },
    details: [
      "Ligação pelo WhatsApp gravada",
      "Chat no site",
      "Agentes de IA com fonte",
      "Prazo de resposta",
      "Respostas prontas",
      "Google Agenda",
    ],
    asks: [
      "Por quais canais as conversas chegam hoje?",
      "Quanto um agente de IA resolveria sozinho?",
      "Como a equipe divide as conversas?",
    ],
  },
  magneto: {
    short: "Fluxos com aprovação, desenhados em blocos.",
    scenes: [{ id: "magneto-canvas", name: "Fluxo em blocos" }],
    play: {
      title: "A pessoa só entra para aprovar",
      lead: "Toque em aprovar.",
    },
    center: {
      title: "Junto dos outros produtos",
      stamp: "Aprovado às 10:14",
    },
    details: [
      "Espera e aprovação",
      "Validação antes de publicar",
      "Nova tentativa quando outro sistema falha",
      "Registro de quem mudou",
      "Editor dentro do Domus",
    ],
    asks: [
      "Quais aprovações travam a sua operação?",
      "O que roda hoje em planilha e lembrete?",
      "Quem precisa decidir, e quando?",
    ],
  },
  tuner: {
    short: "O número oficial do WhatsApp, as ligações e o Discord no mesmo ponto.",
    scenes: [{ id: "tuner-call", name: "Ligação para a equipe certa" }],
    play: {
      title: "Ligue e veja para onde vai",
      lead: "Escolha uma opção do menu.",
    },
    center: {
      title: "Junto dos outros produtos",
      stamp: "Ligação na conversa",
    },
    details: [
      "WhatsApp oficial",
      "Menu de opções na ligação",
      "Distribuição para a equipe",
      "Gravação e transcrição",
      "Ligação pelo WhatsApp",
      "Discord",
    ],
    asks: [
      "Quantos números e linhas a empresa tem?",
      "Para onde cada ligação deveria ir?",
      "Quais conversas precisam ficar gravadas?",
    ],
  },
  knowly: {
    short: "Respostas com a fonte, e cada pessoa vê só o que pode.",
    scenes: [
      { id: "knowly-answer", name: "Resposta com a fonte" },
      { id: "knowly-sources", name: "Fontes num lugar só" },
      { id: "knowly-access", name: "Acesso por pessoa" },
    ],
    play: {
      title: "Pergunte",
      lead: "Escolha uma pergunta.",
    },
    center: {
      title: "Junto dos outros produtos",
      stamp: "Sim, até 12h",
    },
    details: [
      "Fonte de cada frase",
      "Acesso por pessoa e grupo",
      "Dado pessoal barrado",
      "Documentos, tickets e atas",
      "Cadastros do Domus",
    ],
    asks: [
      "Onde está o conhecimento da equipe hoje?",
      "Quem pode ver o quê?",
      "Quais perguntas se repetem?",
    ],
  },
};

// Headings shared by the five product pages
export const PAGE_HEADINGS = {
  areas: "Todas as áreas da empresa",
  areasLead: "E as que só a sua operação tem.",
  details: "Detalhes que já vêm junto",
  contact: (name: string) => `Quer ver o ${name} com a sua operação?`,
  scenes: (name: string) => `Telas do ${name}`,
} as const;
