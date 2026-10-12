// HISTÓRIA DAS CENAS: MARINA E O PEDIDO 1234
// Every string the native scenes draw lives here, typed, so no component carries copy. It is the story of the accepted
// piece welabs-chain-detail-s1 (a delivery change asked by Marina), rewritten as product screens. Interface text, not
// page copy: it still obeys lib/content/rules.ts (the content tests run the same word lists over it).

export const STORY = {
  person: "Marina",
  channels: { voice: "Voz", chat: "WhatsApp" },
  call: "Ligação · 0:42",
  ask: "Dá para entregar sábado?",
  confirm: "Confirmado: sábado ✓",
  received: "Recebido ✓",
  thread: "Uma conversa",
  card: {
    title: "Alteração de entrega",
    order: "Pedido 1234",
    facts: {
      owner: { label: "Responsável", value: "Ana" },
      deadline: { label: "Prazo", value: "2 h" },
      history: { label: "Histórico", value: "3 pedidos" },
      followup: { label: "Retorno", value: "16h" },
    },
  },
  stages: ["Novo", "Em análise", "Aguardando aprovação", "Resolvido"],
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
  // What the three rooms hand to the card
  handed: [
    { room: "Pessoas", label: "Endereço", value: "Rua das Flores" },
    { room: "Pedidos", label: "Pedido", value: "1234" },
    { room: "Entregas", label: "Janela", value: "Sábado disponível" },
  ],
  roomDone: "Pedido 1234 · sábado ✓",
  kb: {
    title: "Política de entregas",
    lines: [
      "Segunda a sexta: entregas até 18h",
      "Sábado: entregas até 12h",
      "Domingo: sem entregas",
    ],
    hit: 1,
    answer: "Sim, até 12h",
  },
  approval: {
    rule: "Regra",
    manager: "Gestora",
    steps: ["Conferir envio", "Aprovar alteração", "Atualizar pedido"],
    button: "Aprovar alteração",
  },
} as const;

// Titles of the product windows (the bar over each scene)
export const WINDOW_TITLES = {
  domus: { name: "Domus", where: "Cômodos" },
  relloo: { name: "Relloo", where: "Funil" },
  tuner: { name: "Tuner", where: "Caixa de entrada" },
  knowly: { name: "Knowly", where: "Política" },
  magneto: { name: "Magneto", where: "Fluxo" },
} as const;
