// TEXTO DAS INTERAÇÕES DE PRODUTO
// The labels inside the one interaction of each product page: the names of channels, steps, options and questions the
// visitor touches. They are interface of a drawing, short by design, and every one of them is a real capability of the
// product (v13 analysis, section 1). The people and the order 1234 are the fictional example of the whole site.
export const DOMUS_PLAY = {
  fieldsTitle: "Campos",
  fields: ["Pedido", "Motivo", "Prazo"],
  newField: "Foto",
  table: "Trocas",
  rows: [
    ["1251", "Troca de tamanho", "Hoje"],
    ["1263", "Defeito", "Amanhã"],
    ["1270", "Cor diferente", "Sexta"],
  ],
  add: "Adicionar o campo Foto",
} as const;

export const RELLOO_PLAY = {
  person: "Marina",
  sub: "1 pessoa",
  channels: [
    { id: "whatsapp", label: "WhatsApp", text: "Dá para entregar sábado?" },
    { id: "call", label: "Ligação", text: "Ligação de 0:42, gravada" },
    { id: "site", label: "Chat do site", text: "Oi, é sobre o pedido 1234" },
  ],
  label: "Canais da conversa",
} as const;

export const MAGNETO_PLAY = {
  steps: [
    "Pedido alterado",
    "Aprovação da gestora",
    "Pedido atualizado no Domus",
    "Aviso pelo WhatsApp",
  ],
  waiting: "Esperando",
  approve: "Aprovar",
  approved: "Aprovado",
} as const;

export const TUNER_PLAY = {
  call: "Ligação de Marina",
  menu: "Menu de opções",
  options: [
    { key: "1", label: "Pedidos", to: "Ana" },
    { key: "2", label: "Financeiro", to: "Bruno" },
    { key: "3", label: "Falar com alguém", to: "Carla" },
  ],
  recording: "Gravando",
  label: "Opções do menu",
} as const;

export const KNOWLY_PLAY = {
  questions: [
    {
      q: "Dá para entregar sábado?",
      a: "Sim, até 12h.",
      source: "Política de entregas, linha 2",
    },
    {
      q: "Qual o prazo para troca?",
      a: "Até 7 dias depois do recebimento.",
      source: "Trocas e devoluções, linha 1",
    },
    {
      q: "Qual o salário da Ana?",
      a: "Você não tem acesso a essa fonte.",
      source: null,
    },
  ],
  label: "Perguntas",
} as const;
