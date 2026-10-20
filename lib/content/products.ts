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
  // v2.1: the effect each product shows on the stage is the one of the home (HOME_INTRO.stamps), so the stage reads the
  // same everywhere; only the title is per page
  center: { title: string };
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
      // v2.2: the play is the form builder (audit, sections 4 and 5)
      title: "Campos novos viram colunas na hora",
      lead: "Arraste um tipo de campo para o formulário.",
    },
    center: {
      // v2.2 (audit, section 5): what the stage shows, not a title repeated on five pages
      title: "O Relloo no registro do Domus",
    },
    // v2.2: the category first, the one connector the code has in brackets
    details: [
      "NFS-e nacional",
      "Bancos: PIX e extrato (Banco Inter)",
      "Cobrança (Asaas)",
      "Assinatura eletrônica",
      "Importação de dados (Omie)",
      "Assistente com IA",
    ],
    asks: [
      "Quais áreas a sua empresa usaria?",
      "Como trazer o que está no sistema atual?",
      "O que dá para moldar sem programar?",
    ],
  },
  relloo: {
    // v2.2 (audit, section 5): the contact and its history, never "a pessoa"; categories before brands
    short: "Conversas de todos os canais, com o histórico de cada contato.",
    scenes: [
      { id: "relloo-person", name: "Histórico único do contato" },
      { id: "relloo-agent", name: "Agente de IA com passagem para a equipe" },
    ],
    play: {
      title: "Todos os canais na mesma conversa",
      lead: "Dispare os canais na ordem que quiser.",
    },
    center: {
      title: "As conversas no registro do Domus",
    },
    details: [
      "Ligações gravadas na conversa",
      "Chat no site",
      "Agentes de IA com fonte",
      "Prazo de resposta",
      "Respostas prontas",
      "Agendas (Google Agenda)",
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
      title: "Aprovação no meio do fluxo",
      lead: "Escolha o valor e veja o caminho do pedido.",
    },
    center: {
      title: "As aprovações no registro do Domus",
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
    // v2.2 (audit, section 5): scale and category first, the brands the code sustains in brackets
    short:
      "Canais de mensagem e de voz num ponto só (WhatsApp oficial, ligações, Discord).",
    scenes: [{ id: "tuner-call", name: "Ligação para a equipe certa" }],
    play: {
      // v2.1: the title says the effect (the operator found "Ligue e veja para onde vai" did not explain it)
      title: "Menu de opções e distribuição de ligações",
      lead: "Aperte uma opção do menu.",
    },
    center: {
      title: "As ligações no registro do Domus",
    },
    details: [
      "Mensagens (WhatsApp oficial)",
      "Menu de opções na ligação",
      "Distribuição para a equipe",
      "Gravação e transcrição",
      "Ligações (WhatsApp)",
      "Comunidades (Discord)",
    ],
    asks: [
      "Quantos números e linhas a empresa tem?",
      "Para onde cada ligação deveria ir?",
      "Quais conversas precisam ficar gravadas?",
    ],
  },
  knowly: {
    // v2.2 (audit, section 5): the access of a profile, never "cada pessoa"
    short: "Respostas com a fonte, dentro do acesso de cada perfil.",
    scenes: [
      { id: "knowly-answer", name: "Resposta com a fonte" },
      { id: "knowly-sources", name: "Fontes num lugar só" },
      { id: "knowly-access", name: "Acesso por perfil" },
    ],
    play: {
      title: "Respostas com fonte e acesso",
      lead: "Troque o perfil e pergunte de novo.",
    },
    center: {
      title: "As respostas no registro do Domus",
    },
    details: [
      "Fonte de cada frase",
      "Acesso por perfil e grupo",
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
