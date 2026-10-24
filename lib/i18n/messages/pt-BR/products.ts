// TEXTO DE CADA PRODUTO
// pt-BR. The page of a product (v2 of the content, approved on 2026-10-20; copy review of 2026-10-24): little text, each
// product as its concept in the whole of the five: the Domus as the domain and the builder of the whole company, the
// Relloo as the relationship with each contact and a funnel run by the Magneto, the Magneto as the durable execution of
// flows with approval, the Tuner as any channel for any product, the Knowly as the memory of the company, a graph that
// grows. No vendor and no Brazil-only citation (PIX, NFS-e), not even in the metadata (operator, 2026-10-24). `line` is
// short (at most four words); `category` and `keywords` live in the page metadata only (operator decision of
// 2026-10-08), never in the visible text or the title. Which `details` sit under which of the three differences is
// structure, in lib/content/products.ts (DIFFER_DETAILS).
export const products = {
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
    short: "A empresa inteira num espaço de trabalho único.",
    // Title of the stage with this product lit among the others
    centerTitle: "O Relloo no registro do Domus",
    // Details that come with the product: real, short, never the definition of the product
    details: [
      "Controle fiscal",
      "Conciliação bancária",
      "Cobrança",
      "Assinatura eletrônica",
      "Importação de dados",
      "Assistente que age por você",
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
        title: "Fiscal, financeiro e contábil",
        body: "Nota, conciliação e cobrança vêm prontas.",
      },
      {
        title: "A base dos outros produtos",
        body: "Conversas, fluxos e respostas usam os mesmos registros e acessos.",
      },
    ],
  },
  relloo: {
    line: "Relacionamento com cada contato",
    category: "CRM",
    keywords: ["CRM", "gestão de relacionamento", "atendimento multicanal"],
    short: "Cada contato com todas as conversas, e um funil que anda sozinho.",
    centerTitle: "As conversas no registro do Domus",
    details: [
      "Ligações gravadas na conversa",
      "Chat no site",
      "Agentes de IA com fonte",
      "Prazo de resposta",
      "Respostas prontas",
      "Oportunidades por etapa",
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
        title: "Funil que anda sozinho",
        body: "Cada etapa tem regra e prazo, e a oportunidade avança até virar pedido no Domus.",
      },
    ],
  },
  magneto: {
    line: "Fluxos com aprovação",
    category: "Automação de processos e workflow",
    keywords: ["automação de processos", "workflow", "BPM", "aprovações"],
    short: "Fluxos que esperam a aprovação e retomam de onde pararam.",
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
    line: "Qualquer canal, um envio",
    category: "Canais de comunicação",
    // No vendor, not even in the metadata (operator, 2026-10-24)
    keywords: ["canais de mensagem", "comunicação multicanal", "omnichannel"],
    short:
      "Uma mensagem sai por qualquer canal, e a resposta volta para o lugar certo.",
    centerTitle: "Os envios no registro do Domus",
    details: [
      "Mensagem, e-mail e SMS",
      "Menu de opções na ligação",
      "Distribuição para a equipe",
      "Gravação e transcrição",
      "Ligações e videochamadas",
      "Comunidades e chat corporativo",
    ],
    asks: [
      "Quantos números e linhas a sua empresa tem?",
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
    line: "Conhecimento que cresce",
    category: "Memória e base de conhecimento",
    // No detail of the AI stack, not even in the metadata (plano.md 3.5)
    keywords: ["base de conhecimento", "IA", "busca semântica"],
    short:
      "A memória da empresa cresce a cada fonte, com a origem de cada fato.",
    centerTitle: "A memória no registro do Domus",
    details: [
      "Fonte de cada frase",
      "Acesso por perfil e grupo",
      "Permissão que não vaza",
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
        body: "Cada perfil só vê o que já podia ver, nem num resumo.",
      },
      {
        title: "Memória que cresce",
        body: "Cada documento, ata e registro do Domus se liga ao que a empresa já aprendeu.",
      },
    ],
  },
} as const;
