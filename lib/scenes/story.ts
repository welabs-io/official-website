// HISTÓRIA DAS CENAS: MARINA E O PEDIDO 1234
// Every string the native scenes draw lives here, typed, so no component carries copy. It is the story of the accepted
// piece welabs-chain-detail-s1 (a delivery change asked by Marina), rewritten as product screens. Interface text, not
// page copy: it still obeys lib/content/rules.ts (the content tests run the same word lists over it). Besides the
// sentences of the plot, it holds the context a real screen shows around them (the other conversations of the inbox,
// times, the people of the team), so each frame reads as a product and not as a slide.

export const STORY = {
  person: "Marina",
  // The contact Marina talks to on her phone (the business side of the WhatsApp chat)
  contact: "Central de pedidos",
  channels: { voice: "Voz", chat: "WhatsApp" },
  call: "Ligação de 0:42",
  ask: "Dá para entregar sábado?",
  // The history of the chat before Marina called: what the business had told her
  before: "Seu pedido 1234 está em separação.",
  confirm: "Confirmado: sábado",
  confirmMeta: "Central de pedidos, agora",
  // The message the notification opens into, in the chat under Marina's question
  received: "Chega sábado, até 12h.",
  thread: "2 canais, 1 pessoa",
  times: {
    before: "09:12",
    call: "10:05",
    ask: "10:07",
    approved: "10:14",
    confirm: "10:16",
  },
  // The other conversations of the inbox, under Marina's (name, last message, time)
  inbox: [
    {
      name: "Rafael Lima",
      preview: "Chegou certinho, obrigado!",
      time: "09:58",
    },
    { name: "Bia Souza", preview: "Vocês levam até Campinas?", time: "09:41" },
  ],
  inboxTitle: "Caixa de entrada",
  // How the inbox signs what the business itself wrote
  you: "você",
  reply: "Responder Marina",
  card: {
    title: "Alteração de entrega",
    order: "Pedido 1234",
    facts: {
      owner: { label: "Responsável", value: "Ana" },
      deadline: { label: "Prazo", value: "2 h" },
      history: { label: "Histórico", value: "3 pedidos" },
      followup: { label: "Retorno", value: "16h" },
    },
    // Who asked and where, carried from the inbox
    origin: [
      { label: "Pessoa", value: "Marina" },
      { label: "Canal", value: "WhatsApp" },
    ],
    // The fact still missing in the funnel scene: the house fills it in the next one
    pending: "Janela",
    details: "Dados do pedido",
  },
  stages: ["Novo", "Em análise", "Aguardando aprovação", "Resolvido"],
  // Other cards of the funnel, around Marina's (stage index, title, order)
  others: [
    { stage: 2, title: "Troca de tamanho", order: "Pedido 1251" },
    { stage: 3, title: "Segunda via da nota", order: "Pedido 1198" },
  ],
  funnel: "Funil de pedidos",
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
  house: "Cômodos da casa",
  houseMeta: "8 cômodos",
  // What the three rooms hand to the card
  handed: [
    { room: "Pessoas", label: "Endereço", value: "Rua das Flores, 210" },
    { room: "Pedidos", label: "Pedido", value: "1234, 3 itens" },
    { room: "Entregas", label: "Janela", value: "Sábado disponível" },
  ],
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
  approval: {
    rule: "Regra",
    title: "Alteração de entrega com aprovação",
    meta: "3 passos",
    manager: "Gestora",
    managerName: "Carla Mendes",
    steps: ["Conferir envio", "Aprovar alteração", "Atualizar pedido"],
    stepsMeta: ["Automático", "Gestora", "Automático"],
    button: "Aprovar alteração",
    approved: "Aprovado",
  },
} as const;

// Titles of the product windows (the bar over each scene): the product and the place in it
export const WINDOW_TITLES = {
  domus: { name: "Domus", where: "Cômodos" },
  relloo: { name: "Relloo", where: "Funil" },
  tuner: { name: "Tuner", where: "Caixa de entrada" },
  knowly: { name: "Knowly", where: "Política" },
  magneto: { name: "Magneto", where: "Fluxo" },
} as const;
