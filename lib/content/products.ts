// CONTEÚDO DE CADA PRODUTO
// The page of a product (v2 of the content, approved on 2026-10-20): little text, one interaction per product. Every
// claim comes from the code of the product, as measured in section 1 of the v13 analysis (portfolio/site-redesign/
// v13-proposta/analise.md): no funnel, coupon or cashback in the Relloo, no process written as a sentence in the Magneto,
// the Knowly limited to what the knowledge base already does, and the Domus as the whole management of the company, with
// tax and banks only as an attractive detail.
// v3 (2026-10-23): the carousel of the kit replaces the capability scenes of the opening and the interaction of each
// product, so their names (`scenes`) and the heading of the interaction (`play`) left; the carousel carries its own text.
import type { ProductSlug } from "../products";

export type ProductPage = {
  // Sentence under the logo of the opening
  short: string;
  // Title of the stage with this product lit among the others, and the effect it shows there
  // v2.1: the effect each product shows on the stage is the one of the home (HOME_INTRO.stamps), so the stage reads the
  // same everywhere; only the title is per page
  center: { title: string };
  // Details that come with the product: real, short, never the definition of the product
  details: readonly string[];
  // Open questions of the contact (no answers: they are the reason to talk)
  asks: readonly string[];
  // v4 (Cards.dc.html, 2026-10-23): the three differences of the product, as the cards that open. Each one is its
  // title, the sentence that shows when the card opens, and the details (indices of `details`) that live under it.
  // From "Por que é diferente" of the concept sheets (v3-plan/fichas-finais.md), the effect never the mechanism.
  differs: readonly Differ[];
};

export type Differ = {
  title: string;
  body: string;
  details: readonly number[];
};

export const PRODUCT_PAGE: Record<ProductSlug, ProductPage> = {
  domus: {
    short: "A gestão da empresa inteira, moldada à sua operação.",
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
    differs: [
      {
        title: "Moldado à operação",
        body: "O tipo de registro novo já nasce com tela e permissão.",
        details: [4],
      },
      {
        title: "A regra brasileira junto",
        body: "Nota fiscal, banco e cobrança vêm prontos.",
        details: [0, 1, 2, 3],
      },
      {
        title: "A base dos outros produtos",
        body: "Conversas, fluxos e respostas trabalham sobre os mesmos registros e acessos.",
        details: [5],
      },
    ],
  },
  relloo: {
    // v2.2 (audit, section 5): the contact and its history, never "a pessoa"; categories before brands
    short: "Conversas de todos os canais, com o histórico de cada contato.",
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
    differs: [
      {
        title: "O contato no centro",
        body: "Mensagem, ligação e e-mail viram um histórico só, que fica na empresa.",
        details: [0, 1],
      },
      {
        title: "IA com limite",
        body: "O agente responde só o que pode e passa a vez com o resumo pronto.",
        details: [2, 4],
      },
      {
        title: "Prazo que corre",
        body: "Quem recebe a conversa tem um prazo para responder, e ele aparece na tela.",
        details: [3, 5],
      },
    ],
  },
  magneto: {
    short: "Fluxos com aprovação, desenhados em blocos.",
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
    differs: [
      {
        title: "Fechado por padrão",
        body: "O fluxo só chama o que a empresa liberou, e nada vai ao ar sem validação.",
        details: [1, 4],
      },
      {
        title: "Nada em dobro",
        body: "Quando outro sistema falha, o passo tenta de novo sem repetir o efeito.",
        details: [2],
      },
      {
        title: "Espera o tempo que for",
        body: "Uma aprovação pode levar dias; o fluxo retoma de onde parou, com o registro de cada mudança.",
        details: [0, 3],
      },
    ],
  },
  tuner: {
    // v2.2 (audit, section 5): scale and category first, the brands the code sustains in brackets
    short:
      "Canais de mensagem e de voz num ponto só (WhatsApp oficial, ligações, Discord).",
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
    differs: [
      {
        title: "Um envio, todos os canais",
        body: "Uma mensagem sai por todos os canais de uma vez, com a mesma regra de envio.",
        details: [0, 5],
      },
      {
        title: "A resposta volta igual",
        body: "Venha de onde vier, a resposta chega no mesmo formato e na conversa certa.",
        details: [2],
      },
      {
        title: "A voz também conta",
        body: "Cada ligação passa pelo menu, fica gravada e vira texto para a equipe.",
        details: [1, 3, 4],
      },
    ],
  },
  knowly: {
    // v2.2 (audit, section 5): the access of a profile, never "cada pessoa"
    short: "Respostas com a fonte, dentro do acesso de cada perfil.",
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
    differs: [
      {
        title: "Cada frase com a fonte",
        body: "A resposta mostra de onde veio cada parte, e diz o que falta quando não há prova.",
        details: [0],
      },
      {
        title: "Dentro do acesso",
        body: "Cada perfil só recebe o que já podia ver, e o dado pessoal fica de fora.",
        details: [1, 2],
      },
      {
        title: "Memória que cresce",
        body: "Documentos, atas e cadastros do Domus somam ao que a equipe já aprendeu.",
        details: [3, 4],
      },
    ],
  },
};

// Headings shared by the five product pages
export const PAGE_HEADINGS = {
  areas: "Todas as áreas da empresa",
  areasLead: "E as que só a sua operação tem.",
  // v4 (Cards.dc.html): the details live under the differences of the product
  details: "Por que é diferente",
  contact: (name: string) => `Quer ver o ${name} com a sua operação?`,
} as const;
