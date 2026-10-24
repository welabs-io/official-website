// TEXTO DE CADA PRODUTO (ES)
// TRADUÇÃO PENDENTE: for now this is a copy of pt-BR, to be replaced by the Spanish text; keys and placeholders
// ({name}, {title}) stay as they are. Original notes follow. The page of a product (v2 of the content, approved on 2026-10-20): little text, every claim from the code of the
// product (v13 analysis, section 1): no funnel, coupon or cashback in the Relloo, no process written as a sentence in the
// Magneto, the Knowly limited to what the knowledge base already does, the Domus as the whole management of the company
// with tax and banks only as an attractive detail. `line` is factual and short (at most four words); `category` and
// `keywords` live in the page metadata only (operator decision of 2026-10-08), never in the visible text or the title.
// Which `details` sit under which of the three differences is structure, in lib/content/products.ts (DIFFER_DETAILS).
import type { ProductsMessages } from "../../types";

export const products: ProductsMessages = {
  // Headings shared by the five product pages, and the labels of the cards that open
  headings: {
    areas: "Todas as áreas da empresa",
    areasLead: "E as que só a sua operação tem.",
    details: "Por que é diferente",
    contact: "Quer ver o {name} com a sua operação?",
    differOpen: "Abrir: {title}",
    differClose: "Fechar: {title}",
  },
  domus: {
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
    // Sentence under the logo of the opening
    short: "A gestão da empresa inteira, moldada à sua operação.",
    // Title of the stage with this product lit among the others
    centerTitle: "O Relloo no registro do Domus",
    // Details that come with the product: real, short, never the definition of the product
    details: [
      "NFS-e nacional",
      "Bancos: PIX e extrato (Banco Inter)",
      "Cobrança (Asaas)",
      "Assinatura eletrônica",
      "Importação de dados (Omie)",
      "Assistente com IA",
    ],
    // Open questions of the contact (no answers: they are the reason to talk)
    asks: [
      "Quais áreas a sua empresa usaria?",
      "Como trazer o que está no sistema atual?",
      "O que dá para moldar sem programar?",
    ],
    // The three differences of the product, as the cards that open: its title and the sentence shown when it opens
    differs: [
      {
        title: "Moldado à operação",
        body: "O tipo de registro novo nasce com tela e permissão.",
      },
      {
        title: "A regra brasileira junto",
        body: "Nota fiscal, banco e cobrança vêm prontos.",
      },
      {
        title: "A base dos outros produtos",
        body: "Conversas, fluxos e respostas usam os mesmos registros e acessos.",
      },
    ],
  },
  relloo: {
    line: "Conversas e atendimento",
    category: "CRM",
    keywords: ["CRM", "gestão de relacionamento", "atendimento multicanal"],
    short: "Conversas de todos os canais, com o histórico de cada contato.",
    centerTitle: "As conversas no registro do Domus",
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
      },
      {
        title: "IA com limite",
        body: "O agente responde só o que pode e passa a vez com o resumo pronto.",
      },
      {
        title: "Prazo que corre",
        body: "Quem recebe a conversa tem um prazo para responder, e ele aparece na tela.",
      },
    ],
  },
  magneto: {
    line: "Fluxos com aprovação",
    category: "Automação de processos e workflow",
    keywords: ["automação de processos", "workflow", "BPM", "aprovações"],
    short: "Fluxos com aprovação, desenhados em blocos.",
    centerTitle: "As aprovações no registro do Domus",
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
      },
      {
        title: "Nada em dobro",
        body: "Quando outro sistema falha, o passo tenta de novo sem repetir o efeito.",
      },
      {
        title: "Espera o tempo que for",
        body: "Uma aprovação pode levar dias; o fluxo retoma de onde parou, com o registro de cada mudança.",
      },
    ],
  },
  tuner: {
    line: "Mensagens e ligações",
    category: "Canais de atendimento",
    keywords: ["WhatsApp", "central de atendimento", "omnichannel"],
    short:
      "Canais de mensagem e de voz num ponto só (WhatsApp oficial, ligações, Discord).",
    centerTitle: "As ligações no registro do Domus",
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
      },
      {
        title: "A resposta volta igual",
        body: "Venha de onde vier, a resposta chega no mesmo formato e na conversa certa.",
      },
      {
        title: "A voz também conta",
        body: "Cada ligação passa pelo menu, fica gravada e vira texto para a equipe.",
      },
    ],
  },
  knowly: {
    line: "Respostas com a fonte",
    category: "Base de conhecimento com IA",
    // No detail of the AI stack, not even in the metadata (plano.md 3.5)
    keywords: ["base de conhecimento", "IA", "busca semântica"],
    short: "Respostas com a fonte, dentro do acesso de cada perfil.",
    centerTitle: "As respostas no registro do Domus",
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
      },
      {
        title: "Dentro do acesso",
        body: "Cada perfil só recebe o que já podia ver, e o dado pessoal fica de fora.",
      },
      {
        title: "Memória que cresce",
        body: "Documentos, atas e cadastros do Domus somam ao que a equipe já aprendeu.",
      },
    ],
  },
};
