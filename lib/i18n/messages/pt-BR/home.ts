// TEXTO DA HOME E DAS TELAS DOS PRODUTOS
// pt-BR. Copy of the home (v2 of the content, approved on 2026-10-20; v4 blocks, 2026-10-23): each section has at most
// one short title and one line, the rest is motion. The words a visitor reads inside a drawing (the seals, the frames,
// the names of the modules) are labels of that drawing, kept here so the copy rules read them. No slogan, no person by
// name, no vendor outside brackets, no maturity marker.
// Text only. What is NOT here: the product names (brands), the order of the products, the glyph of each module and which
// station follows which; lib/content/home.ts builds the structures the components read from this text. Placeholders:
// `{order}` is shared.order and `{name}`/`{title}` are filled by the component (lib/i18n/format.ts).
export const home = {
  // Opening: the title is cut around the word that turns (`words`, one per product, in the order of the products)
  intro: {
    before: "Software para",
    // The last line of the title, with its full stop (the stop is part of the sentence, so it is the dictionary's)
    after: "da sua empresa.",
    words: {
      domus: "a gestão",
      relloo: "o atendimento",
      magneto: "as aprovações",
      tuner: "os canais",
      knowly: "o conhecimento",
    },
    lead: "Cinco produtos sobre os mesmos dados. O que acontece num deles já aparece nos outros.",
    // Accessible name of the strip of the five marks, and the effect each lit product shows on the stage
    stage: "Os cinco produtos ligados ao Domus",
    stamps: {
      domus: "Pedido 1234 atualizado",
      relloo: "Conversa distribuída",
      magneto: "Aprovado às 10:14",
      tuner: "Ligação na conversa",
      knowly: "Sim, até 12h",
    },
    // The record of the Domus at the centre of the stage: one line per product that wrote on it
    record: {
      lines: {
        tuner: "Ligação gravada",
        relloo: "Respondida no prazo",
        knowly: "Sábado, até 12h, com a fonte",
        magneto: "Troca aprovada",
      },
      domus: "Estoque e financeiro em dia",
    },
  },

  // Opening in blades: the caption of the stage, the second button, and the seal over each frame (the title and the
  // line of what just happened in that product)
  hero: {
    caption: "Um quadro de cada produto",
    see: "Ver os produtos",
    seals: {
      domus: { title: "Vistoria 318", line: "acendeu os outros quatro" },
      relloo: { title: "Conversa 2210", line: "com o dono certo" },
      magneto: { title: "Proposta 905", line: "aprovada às 10:14" },
      tuner: { title: "Mensagem nova", line: "chegou pelo canal" },
      knowly: { title: "Prazo de 48 h", line: "lembrado, com a fonte" },
    },
  },

  // The modules of the Domus, on two floors: the standard ones (ERPNext and HRMS) and the ones made to measure (our own
  // apps). Keys are stable ids (lib/content/home.ts maps each id to its glyph and floor); `tags` is the small attractive
  // detail of a module, never its definition.
  domus: {
    standard: "Padrão",
    custom: "Sob medida",
    // The "+" that makes a new module (the text of the label and the accessible name of the checkbox under it)
    add: "Novo módulo",
    addLabel: "Criar um módulo novo",
    // The module the "+" makes: an example of a module a company creates for itself, with the screen it gets
    born: "Vistorias",
    bornTag: "Novo módulo",
    // Each field of the new screen with the value it shows once filled
    bornFields: [
      { label: "Local", value: "Doca 3" },
      { label: "Data", value: "21/10/2026" },
      { label: "Foto", value: "3 fotos" },
    ],
    modules: {
      sales: "Vendas",
      purchasing: "Compras",
      inventory: "Estoque",
      production: "Produção",
      finance: "Financeiro",
      contracts: "Contratos",
      projects: "Projetos",
      people: "Pessoas",
      assets: "Ativos",
      quality: "Qualidade",
      tax: "Fiscal",
      banks: "Bancos",
      legal: "Jurídico",
      tickets: "Chamados",
      requests: "Demandas",
      approvals: "Aprovações",
      privacy: "Privacidade",
      import: "Importação",
    },
    tags: { tax: "NFS-e", banks: "PIX" },
  },

  // One small screen per product (the stage of the opening and the open panel of the accordion): the effect only
  frames: {
    domus: {
      title: "Módulos",
      sub: "da sua empresa",
      // The newest module, outlined in green in the frame (not the "Vistorias" of the house)
      newModule: "Vistoria",
      // What each of the other four does with the new module, and the line under them
      uses: {
        relloo: "oportunidade avança",
        magneto: "fluxo começa",
        tuner: "técnico avisado",
        knowly: "fica lembrado",
      },
      usesLine: "Os outros quatro usam o tipo novo na hora",
    },
    relloo: {
      title: "Conversa 2210",
      linked: "Ligada à gestão",
      owner: "Dono",
      agent: "Agente de atendimento",
      incoming: "Preciso de manutenção mensal para 3 aparelhos do bloco B.",
      time: "08:12",
      answer: "Claro! Qual o modelo e a potência dos aparelhos?",
      typing: "Agente de atendimento · digitando",
      stages: ["Conversa", "Qualificação", "Vistoria", "Ganha"],
    },
    magneto: {
      title: "Proposta 905",
      state: "Em aprovação",
      // The steps of the proposal: the first is done, the second is the live one
      steps: [
        { name: "Proposta enviada", line: "08:40" },
        { name: "Aprovação da gerência", line: "agora" },
        { name: "Assinatura do contrato", line: "a seguir" },
        { name: "Pedido no Domus", line: "a seguir" },
      ],
    },
    tuner: {
      title: "Canais",
      // Every channel lands in the one conversation; the first one is the fresh message
      channels: [
        { name: "Mensagem", line: "Preciso de manutenção mensal…" },
        { name: "Ligação", line: "3 min, gravada" },
        { name: "E-mail", line: "Proposta 905" },
      ],
      thread: { title: "Conversa 2210", line: "3 canais, um histórico" },
    },
    knowly: {
      title: "Pergunta",
      question: "Qual o prazo de manutenção do bloco B?",
      answer: "48 h a partir do chamado, de segunda a sábado.",
      source: "Contrato 77 · cláusula 4",
      sourceLabel: "Fonte",
    },
  },

  // The chain: one message crosses the five products and settles as the order in the Domus. One station per product (in
  // the order of the walk, lib/content/home-v4.ts). `next`, `now` and `done` are the small line of the station before
  // it is reached, while it is the live one and once it is done; `caption` is typed while it is live (one or two lines)
  // and `chip` is what it leaves once done. `{order}` is shared.order.
  chain: {
    title: "Uma mensagem, a operação inteira",
    lead: "Do canal ao pedido registrado no Domus, enquanto você rola.",
    bubbleChannel: "Mensagem",
    stations: {
      tuner: {
        label: "Chegou",
        next: "a seguir",
        now: "agora",
        done: "pela mensagem",
        caption: ["A mensagem chega pelo canal."],
        chip: "Mensagem 08:12",
      },
      relloo: {
        label: "Com o dono certo",
        next: "a seguir",
        now: "Conversa 2210",
        done: "Conversa 2210",
        caption: [
          "A conversa encontra quem cuida dela",
          "e vira oportunidade.",
        ],
        chip: "Oportunidade 562",
      },
      knowly: {
        label: "Com a fonte",
        next: "a seguir",
        now: "prazo de 48 h",
        done: "prazo de 48 h",
        caption: ["O combinado volta lembrado,", "com a fonte."],
        chip: "Prazo de 48 h, com a fonte",
      },
      magneto: {
        label: "Aprovado",
        next: "a seguir",
        now: "Proposta 905",
        done: "e assinado",
        caption: [
          "A proposta passa pela aprovação",
          "e o contrato pela assinatura.",
        ],
        chip: "Contrato assinado",
      },
      domus: {
        label: "Registrado",
        next: "a seguir",
        now: "{order}",
        done: "{order}",
        caption: ["O pedido, a nota e a cobrança", "ficam na gestão."],
        chip: "{order}",
      },
    },
    // The line under the last caption, once the order is settled
    closing: "Do primeiro contato ao pagamento.",
    // The record of the order in the Domus, one line per product that worked on it
    record: {
      tag: "Recorrente",
      lines: {
        tuner: "Chegou pela mensagem",
        relloo: "Com o dono certo, no prazo",
        knowly: "Combinado lembrado, com a fonte",
        magneto: "Aprovado e assinado",
      },
    },
  },

  // The accordion of the five products: at rest the Domus is open, the others open on hover, on focus or on a tap.
  // `area` is the area of the product on the closed panel; `points` are the three tags; `question` closes the panel.
  accordion: {
    title: "Cinco produtos, os mesmos dados",
    lead: "Cada um cuida de uma parte da operação. Abra para ver em ação.",
    // The accessible name of the "+" of a panel on a phone: "Abrir Domus" / "Fechar Domus"
    openLabel: "Abrir {name}",
    closeLabel: "Fechar {name}",
    panels: {
      domus: {
        area: "Gestão",
        title: "A gestão inteira, com o que só a sua operação tem.",
        lead: "Financeiro, fiscal, contratos e pessoas no mesmo lugar. Os outros quatro trabalham sobre ele.",
        points: [
          "Padrão e sob medida",
          "Assistente com o dado real",
          "Regras brasileiras",
        ],
        question: "Quanto da sua operação cabe no Domus?",
      },
      relloo: {
        area: "Relacionamento",
        title: "Cada contato, todas as conversas.",
        lead: "A mensagem chega, encontra quem cuida dela e vira oportunidade, sem ninguém copiar nada.",
        points: [
          "Caixa de entrada única",
          "IA que passa a vez",
          "Funil que anda sozinho",
        ],
        question: "Quanto se perde entre a mensagem e a proposta?",
      },
      magneto: {
        area: "Processos",
        title: "Cada aprovação no caminho certo.",
        lead: "O fluxo leva a proposta por quem aprova e pela assinatura, e avisa o próximo passo.",
        points: [
          "Fluxo desenhado na tela",
          "Aprovação em um toque",
          "Prazo com aviso",
        ],
        question: "Quantas aprovações esperam numa caixa de e-mail?",
      },
      tuner: {
        area: "Canais",
        title: "Mensagem, ligação e e-mail numa conversa.",
        lead: "Cada canal chega no mesmo histórico, ligado ao contato e ao pedido.",
        points: [
          "Mensagens e ligações",
          "Histórico único",
          "Número da empresa",
        ],
        question: "Em quantos aparelhos está a conversa de hoje?",
      },
      knowly: {
        area: "Memória",
        title: "O que a empresa aprende fica lembrado.",
        lead: "A resposta vem do contrato, do chamado ou da reunião, com a fonte ao lado.",
        points: [
          "Resposta com a fonte",
          "Memória que cresce",
          "Busca no que já foi dito",
        ],
        question: "Quanto do combinado só existe na cabeça de alguém?",
      },
    },
  },

  // Contact: open questions, no answers (they are the reason to talk). Every button of the site lands here, so this band
  // does not repeat the button; its way out is the products band (`more`).
  contact: {
    title: "Conte o que sua empresa precisa",
    asks: [
      "Quanto da sua operação cabe no Domus?",
      "O que acontece com os sistemas de hoje?",
      "Dá para começar por um produto?",
      "Por onde a gente começa?",
    ],
    asksLabel: "Perguntas para a conversa",
    more: "Ver os produtos",
  },
} as const;
