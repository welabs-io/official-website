// TEXTO DA CENA: RELLOO
// pt-BR. Text of the four-frame carousel (components/scene-kit/scenes/relloo-carousel.tsx): the label of the scene, the
// chrome (screen and area of each frame, the name of each moment), the conversation, the record, the funnel and the
// closing question. Text only. What is NOT here: the glyph of each channel, the steps of each frame and the clock; the
// component reads this text by key (`frameNames` and `past` are read by position, so en and es keep the same length).
// The pace of the clock depends on the length of the phrases (`asked`, `agentSaid`, `answer` type in at 18 ms per
// character, see `rellooSteps`).
export const relloo = {
  label:
    "Relloo: uma mensagem vira oportunidade e anda no funil, em quatro momentos",
  conversation: "Conversa 2210",
  contact: "Contato 4821",
  linked: "Ligada à gestão",
  before: "+ 2 canais usados antes",
  owner: "Dono",
  agent: "Agente de atendimento",
  team: "Equipe comercial",
  today: "Hoje",
  message: "Mensagem",
  asked: "Preciso de manutenção mensal para 3 aparelhos do bloco B.",
  askedAt: "08:12",
  reply: "Escrever para Contato 4821",
  send: "Enviar",
  previous: "Antes",
  now: "Dona agora",
  why: "pediu proposta",
  agentSaid:
    "Qual o modelo dos aparelhos? Já deixo tudo pronto para a proposta.",
  agentAt: "08:12",
  answer: "São 3 aparelhos de 12 mil BTUs. Quero uma proposta.",
  answerAt: "08:19",
  summaryReady: "Resumo pronto para a equipe",
  summaryLong:
    "Manutenção mensal, 3 aparelhos de 12 mil BTUs no bloco B. Pediu proposta.",
  summary: "Resumo",
  summaryShort: "Manutenção mensal, 3 aparelhos no bloco B. Pediu proposta.",
  history: "3 canais · um histórico só",
  deals: "Oportunidades",
  born: "Nova oportunidade",
  bornAt: "agora",
  deal: "Oportunidade",
  dealNumber: "562",
  bornFrom: "Nasceu da Conversa 2210, com o resumo junto",
  moves: "anda no funil e o resto acontece sozinho",
  funnel: "Funil",
  domus: "Domus",
  visit: "Vistoria 318 agendada",
  // v3 (2026-10-23): "atende" is a banned verb of copy-rules.json `words`; the same question, with "responde"
  question: "Quem responde primeiro na sua empresa?",
  // The screen and the area the chrome names for each frame (frames 1 and 2 share the inbox, 3 and 4 the contact's record)
  inbox: "Caixa de entrada",
  service: "Atendimento",
  // The site says "contato", never "pessoa" (copy review of 2026-10-24)
  person: "Contatos",
  // The name of each moment, on the stage tabs of the chrome (read by position)
  frameNames: ["Chega", "Passa a vez", "Vira oportunidade", "Anda no funil"],
  // The channels the contact used before, in the history of frame 1 (read by position; the glyph is in the component)
  past: [
    { date: "12/08", text: "E-mail · orçamento de limpeza de dutos" },
    { date: "03/09", text: "Voz · ligação transcrita" },
  ],
} as const;
