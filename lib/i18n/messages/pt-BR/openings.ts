// TEXTO DAS ABERTURAS DE MARCA
// pt-BR. The words each brand opening draws inside its scene (components/intro/*.js), the opening that plays when a
// product is entered from a link. Read by position: the choreography keeps the order of its rooms, cards and chips, and
// the length of every list is the same in the three languages. Records keep their numbers (the single thread of the
// site); a label names the category of a channel, never a brand or a person. The name of the product and its closing
// logo are the brand files, not text.
export const openings = {
  // The rooms of the house that arrive one by one
  domus: {
    rooms: ["Financeiro", "Fiscal", "Estoque", "Vendas", "Pessoas", "Projetos"],
  },
  // The four contact cards (a record each) and the chip with the channel of each, in the same order
  relloo: {
    records: ["Contato 4821", "Contato 4822", "Contato 4823", "Contato 4824"],
    channels: ["Mensagem", "Chat do site", "Voz", "E-mail"],
  },
  // The ten nodes of the flow, left to right and top to bottom
  magneto: {
    nodes: [
      "Gatilho",
      "Planilha",
      "Condição",
      "Aprovação",
      "E-mail",
      "Integração",
      "Condição",
      "Espera",
      "Lembrete",
      "Concluído",
    ],
  },
  // The five channel chips that come into tune
  tuner: {
    channels: ["Mensagem", "Voz", "Chat do site", "E-mail", "Comunidade"],
  },
  // The five sources of the memory: the kind of each and what it is about (a date or a code is a sub line too)
  knowly: {
    cards: [
      { label: "Documento", sub: "Prazos" },
      { label: "Reunião", sub: "12/09" },
      { label: "Ticket", sub: "ATL-142" },
      { label: "Código", sub: "Propostas" },
      { label: "Manual", sub: "Vendas" },
    ],
  },
} as const;
