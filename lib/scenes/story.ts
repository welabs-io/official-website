// HISTÓRIA DAS CENAS: O PEDIDO 1234
// Every string the native scenes of the home draw lives here, typed, so no component carries copy. It is the story of a
// delivery change asked on the order 1234, drawn as product screens; the home shows three outcomes of it
// (lib/scenes/script.ts). Interface text, not page copy: it still obeys lib/content/rules.ts (the scene tests run the
// same word lists over it). Besides the sentences of the plot, it holds the context a real screen shows around them
// (times, the teams), so each frame reads as a product and not as a slide.
// v3 (F1): no fictitious person. Whoever asks is a record of the store (`who`, a contact id), never a name, so every
// screen shows the effect on a record (plano.md, section 1.5).

export const STORY = {
  // The record of whoever asks: the contact id the screens show in place of a name
  who: "Contato 4821",
  // The business side of the chat on the contact's phone
  contact: "Central de pedidos",
  // v2.2 (audit, section 5): the category of the channel, not its brand; one contact, never "1 pessoa"
  channels: { voice: "Voz", chat: "Mensagem" },
  call: "Ligação de 0:42",
  ask: "Dá para entregar sábado?",
  // The history of the chat before the call: what the business had said about the order
  before: "Seu pedido 1234 está em separação.",
  confirm: "Confirmado: sábado",
  confirmMeta: "Central de pedidos, agora",
  // The message the notification opens into, in the chat under the question
  received: "Chega sábado, até 12h.",
  thread: "2 canais, 1 contato",
  order: "Pedido 1234",
  times: {
    before: "09:12",
    call: "10:05",
    ask: "10:07",
    confirm: "10:16",
  },
  // The composer of the conversation: a placeholder, with no name in it
  reply: "Escrever resposta",
  // Column order of the house: the right column holds Pessoas, Pedidos and Entregas
  rooms: [
    "Atendimento",
    "Pessoas",
    "Regras",
    "Pedidos",
    "Estoque",
    "Entregas",
    "Fiscal",
    "Financeiro",
  ],
  // What each room holds today, under its name
  roomMeta: {
    Atendimento: "4 abertas",
    Pessoas: "1.204 contatos",
    Regras: "12 ativas",
    Pedidos: "38 hoje",
    Estoque: "312 itens",
    Entregas: "9 rotas",
    Fiscal: "Em dia",
    Financeiro: "6 a receber",
  } as Record<string, string>,
  roomDone: ["Pedido 1234", "Sábado confirmado"],
  kb: {
    title: "Política de entregas",
    meta: "Atualizada em 02/10",
    lines: [
      "Segunda a sexta: entregas até 18h",
      "Sábado: entregas até 12h",
      "Domingo: sem entregas",
    ],
    hit: 1,
    sections: ["Retirada na loja", "Trocas e devoluções"],
    label: "Resposta",
    answer: "Sim, até 12h",
    detail: "Pedidos de sábado saem pela manhã.",
    source: "Política de entregas, linha 2",
    related: "Perguntas parecidas",
    questions: ["E no domingo?", "Até que horas retiro na loja?"],
  },
} as const;

// Titles of the product windows (the bar over each scene): the product and the place in it
export const WINDOW_TITLES = {
  domus: { name: "Domus", where: "Painel" },
  relloo: { name: "Relloo", where: "Conversas" },
  tuner: { name: "Tuner", where: "Caixa de entrada" },
  knowly: { name: "Knowly", where: "Política" },
  magneto: { name: "Magneto", where: "Fluxo" },
} as const;
