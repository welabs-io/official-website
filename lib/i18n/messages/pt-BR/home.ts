// TEXTO DA HOME E DAS TELAS DOS PRODUTOS
// pt-BR. Copy of the home (v2 of the content, approved on 2026-10-20; v4 blocks, 2026-10-23; copy review of 2026-10-24):
// each section has at most one short title and one line, the rest is motion. The words a visitor reads inside a drawing
// (the seals, the frames, the names of the modules) are labels of that drawing, kept here so the copy rules read them.
// No slogan, no person by name, no vendor, no Brazil-only citation (PIX, NFS-e), no maturity marker. Every record is one
// of the single thread of the site (Contato 4821, Conversa 2210, Proposta 905, Vistoria 318, Pedido 1234).
// Text only. What is NOT here: the product names (brands), the order of the products, the glyph of each module and which
// station follows which; lib/content/home.ts builds the structures the components read from this text. Placeholders:
// `{order}` is shared.order and `{name}`/`{title}` are filled by the component (lib/i18n/format.ts).
export const home = {
  // Opening: the title is cut around the word that turns (`words`, one per product, in the order of the products); each
  // word is the area of its product, the same as the closed panel of the accordion
  intro: {
    before: "Soluções para",
    // The last line of the title, with its full stop (the stop is part of the sentence, so it is the dictionary's)
    after: "da sua empresa.",
    words: {
      domus: "a gestão",
      relloo: "o relacionamento",
      magneto: "os processos",
      tuner: "os canais",
      knowly: "o conhecimento",
    },
    lead: "Tudo integrado num espaço de trabalho único, com um assistente que interage na interface por você.",
    // Accessible name of the strip of the five marks, and the effect each lit product shows on the stage
    stage: "Os cinco produtos ligados ao Domus",
    // The stage of the product pages tells the same thread as the home (the order 1234 of the maintenance contract)
    stamps: {
      domus: "Pedido 1234 registrado",
      relloo: "Com o dono certo",
      magneto: "Aprovado às 17:02",
      tuner: "Lido em 3 canais",
      knowly: "Prazo com a fonte",
    },
    // The record of the Domus at the centre of the stage: one line per product that wrote on it (the lines of the
    // record of the chain, chain.record.lines)
    record: {
      lines: {
        tuner: "Chegou pela mensagem",
        relloo: "Com o dono certo, no prazo",
        knowly: "Combinado lembrado, com a fonte",
        magneto: "Aprovado e assinado",
      },
      domus: "Nota e cobrança em dia",
    },
  },

  // Opening in blades: the caption of the stage, the second button, and the seal over each frame (the title and the
  // line of what just happened in that product)
  hero: {
    caption: "Um quadro de cada produto",
    see: "Ver os produtos",
    seals: {
      domus: { title: "Vistoria 318", line: "ligou os outros quatro" },
      relloo: { title: "Conversa 2210", line: "com o dono certo" },
      magneto: { title: "Proposta 905", line: "aprovada às 17:02" },
      tuner: { title: "Mensagem nova", line: "chegou pelo canal" },
      knowly: { title: "Prazo de 48 h", line: "lembrado, com a fonte" },
    },
  },

  // The modules of the Domus, on two floors: the standard ones and the ones made to measure. Keys are stable ids
  // (lib/content/home.ts maps each id to its glyph and floor); `tags` is the small attractive detail of a module, never
  // its definition, and never a Brazil-only name (operator, 2026-10-24: the PIX and NFS-e tags left)
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
    tags: { tax: "Em dia", banks: "24h" },
  },

  // One small screen per product (the stage of the opening and the open panel of the accordion): the effect only
  frames: {
    domus: {
      title: "Módulos",
      sub: "da sua empresa",
      // The newest module, outlined in green in the frame; a module is an area, so its name is plural like the others
      newModule: "Vistorias",
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
      // The same reply of the agent as in the Relloo carousel (scenes.relloo.agentSaid)
      answer:
        "Qual o modelo dos aparelhos? Já deixo tudo pronto para a proposta.",
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
      // Every channel comes back in the same shape; the first one is the fresh message
      channels: [
        { name: "Mensagem", line: "Preciso de manutenção mensal…" },
        { name: "Ligação", line: "3 min, gravada" },
        { name: "E-mail", line: "Proposta 905" },
      ],
      thread: { title: "Conversa 2210", line: "3 canais, o mesmo formato" },
    },
    knowly: {
      title: "Pergunta",
      question: "Qual o prazo de manutenção do bloco B?",
      answer: "48 h a partir do chamado, de segunda a sábado.",
      // The term of 48 h comes from the service policy of the thread (there is no contract 77 in it)
      source: "Política de serviço · item 4",
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
  // `area` is the area of the product on the closed panel (the turning word of the title); `points` are the three tags;
  // `question` closes the panel.
  accordion: {
    title: "Cinco produtos, tudo integrado",
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
          "Fiscal, financeiro e contábil",
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
          "Nada feito em dobro",
          "Aprovação em um toque",
          "Prazo com aviso",
        ],
        question: "Quantas aprovações esperam numa caixa de e-mail?",
      },
      tuner: {
        area: "Canais",
        title: "Um envio, todos os canais.",
        lead: "A mensagem sai por qualquer canal, e a resposta volta no mesmo formato, venha de onde vier.",
        points: [
          "Qualquer canal",
          "Situação de cada envio",
          "Mesma regra para todos",
        ],
        question: "Em quantos aparelhos está a conversa de hoje?",
      },
      knowly: {
        area: "Conhecimento",
        title: "O que a empresa aprende fica lembrado.",
        lead: "Cada contrato, chamado e reunião se liga ao que a empresa já aprendeu, com a fonte de cada fato.",
        points: ["Resposta com a fonte", "Memória que cresce", "Nada se apaga"],
        question: "Quanto do combinado só existe na cabeça de alguém?",
      },
    },
  },

  // Contact: open questions, no answers (they are the reason to talk). Every button of the site lands here, so this band
  // does not repeat the button; its way out is the products band (`more`).
  contact: {
    title: "Conte o que a sua empresa precisa",
    asks: [
      "O que hoje fica espalhado entre sistemas e planilhas?",
      "O que acontece com os sistemas de hoje?",
      "Dá para começar por um produto?",
      "Por onde a gente começa?",
    ],
    asksLabel: "Perguntas para a conversa",
    more: "Ver os produtos",
  },
} as const;
