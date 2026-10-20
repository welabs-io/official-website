// TEXTO DAS INTERAÇÕES DE PRODUTO
// The labels inside the one interaction of each product page. v2.2 (audit, section 4): every play is a small chain the
// visitor drives (a choice, three to five beats that answer it, a record of what happened and the effect that reaches
// the Domus), so the labels name states, events and records, never the mechanism. Interface text of a drawing, short
// by design; every one is a real capability of the product (v13 analysis, section 1). No people as protagonists: one
// contact (the order 1234) and teams. The copy rules still read all of it (lib/content/content.test.ts).

// The record of the Domus every play ends on
export const DOMUS_RECORD = {
  title: "Pedido 1234",
  // Name of the Domus record card for assistive technology
  label: "Registro no Domus",
} as const;

export const PLAY_COMMON = {
  restart: "Recomeçar",
  log: "Registro",
  idle: "Nada ainda.",
} as const;

// Domus: the visitor designs the record that is missing
export const DOMUS_PLAY = {
  palette: "Tipos de campo",
  form: "Nova troca",
  list: "Trocas",
  base: ["Pedido", "Motivo"],
  rows: [
    ["1251", "Troca de tamanho"],
    ["1263", "Defeito"],
    ["1270", "Cor diferente"],
  ],
  fields: [
    {
      id: "date",
      type: "Data",
      name: "Prazo",
      cells: ["24/10", "25/10", "27/10"],
      log: "Campo Prazo criado",
    },
    {
      id: "photo",
      type: "Foto",
      name: "Foto",
      cells: ["", "", ""],
      log: "Campo Foto criado",
    },
    {
      id: "status",
      type: "Situação",
      name: "Situação",
      cells: ["Aberta", "Em análise", "Concluída"],
      log: "Campo Situação criado",
    },
    {
      id: "text",
      type: "Texto",
      name: "Observação",
      cells: ["Sem caixa", "Etiqueta nova", "Embalar à parte"],
      log: "Campo Observação criado",
    },
  ],
  newRow: "Novo registro",
  newRowCells: ["1288", "Troca de modelo"],
  newRowLog: "Troca 1288 registrada",
  approval: "Pedir aprovação",
  approvalFlow: "Aprovação de troca",
  approvalLog: "Fluxo de aprovação ligado",
  // The Domus line each step leaves on the record
  record: {
    idle: "Trocas: 3 registros",
    field: (name: string) => `Campo ${name} no cadastro`,
    row: "Trocas: 4 registros",
    approval: "Troca pede aprovação no Magneto",
  },
  label: "Cadastro de trocas",
} as const;

// Relloo: every channel lands in the same conversation, in the order it arrives
export const RELLOO_PLAY = {
  label: "Canais",
  contact: "Contato do pedido 1234",
  // The number of channels in the conversation is a CSS counter of the checked channels (relloo.module.css)
  countLabel: "Canais:",
  switchLabel: "Troca de canal",
  timelineLabel: "Linha do tempo",
  channels: [
    {
      id: "message",
      label: "Mensagem",
      text: "Dá para entregar sábado?",
      log: "Mensagem na conversa",
      recordLine: "Mensagem no histórico",
    },
    {
      id: "call",
      label: "Ligação",
      text: "Ligação de 0:42, gravada",
      log: "Ligação gravada na conversa",
      recordLine: "Ligação no histórico",
    },
    {
      id: "site",
      label: "Chat do site",
      text: "É sobre o pedido 1234",
      log: "Chat do site na conversa",
      recordLine: "Chat do site no histórico",
    },
  ],
  agentLog: "Agente de IA respondeu com a fonte",
  recordHandoff: "Conversa com a Equipe de pedidos",
  // The chain every first contact runs
  chain: [
    "Contato identificado",
    "Pedido 1234 vinculado",
    "Distribuído para a Equipe de pedidos",
    "Respondido no prazo",
  ],
  deadline: "Prazo de resposta",
  // With the three channels in, the agent answers with its source and passes the conversation to the team
  agent: "Agente de IA",
  agentText: "Sábado, até 12h.",
  agentSource: "Política de entregas",
  handoff: "Passado para a equipe com a conversa",
  record: "Histórico do contato",
} as const;

// Magneto: the value decides the branch, an approval waits in the middle, a failure is retried
export const MAGNETO_PLAY = {
  label: "Fluxo de aprovação do pedido",
  valueLabel: "Valor do pedido",
  values: [
    { id: "low", label: "R$ 800" },
    { id: "high", label: "R$ 4.800" },
  ],
  failLabel: "Integração",
  fail: "Simular falha",
  nodes: {
    start: "Pedido alterado",
    check: "Acima de R$ 2.000?",
    approval: "Aprovação",
    adjust: "Ajustar pedido",
    update: "Atualizar no Domus",
    notify: "Aviso no canal do pedido",
  },
  yes: "Sim",
  no: "Não",
  skipped: "Não precisa",
  waiting: "Esperando decisão",
  approve: "Aprovar",
  refuse: "Recusar",
  approved: "Aprovado",
  refused: "Recusado",
  retry: "Nova tentativa 1/3",
  recovered: "Feito na 2ª tentativa",
  done: "Concluído",
  log: {
    start: "Pedido 1234 alterado",
    low: "Abaixo do limite: segue direto",
    high: "Acima do limite: pede aprovação",
    approved: "Aprovado",
    refused: "Recusado: volta para ajuste",
    failed: "Domus fora do ar: nova tentativa",
    updated: "Pedido 1234 atualizado no Domus",
    notified: "Aviso enviado",
  },
  record: {
    idle: "Situação: em aberto",
    low: "Valor: R$ 800",
    high: "Valor: R$ 4.800",
    waiting: "Situação: aguardando aprovação",
    adjust: "Situação: em ajuste",
    done: "Situação: aprovado e atualizado",
  },
} as const;

// Tuner: the option of the menu sends the call to a team; a busy team holds it with the position marked
export const TUNER_PLAY = {
  call: "Ligação recebida",
  menu: "Menu da ligação",
  options: [
    { key: "1", label: "Pedidos", team: "Equipe de pedidos", busy: false },
    { key: "2", label: "Financeiro", team: "Equipe financeira", busy: true },
    { key: "3", label: "Outros assuntos", team: "Atendimento", busy: false },
  ],
  caller: "Pedido 1234",
  busy: "Ocupada",
  hold: "Em espera, posição 2",
  free: "Livre",
  answered: "Em atendimento",
  // Where the recorded call lands, once the team takes it
  land: "Gravação e transcrição na conversa",
  transcript: "“É sobre a troca do pedido 1234…”",
  contextLine: "Passou com o contexto do pedido 1234",
  chose: (key: string, label: string) => `Opção ${key}: ${label}`,
  answeredBy: (team: string) => `${team} assumiu a ligação`,
  recordIdle: "Histórico do pedido",
  record: "Ligação gravada no histórico",
} as const;

// Knowly: the same question answered by profile, every sentence with its source
export const KNOWLY_PLAY = {
  label: "Perguntas por perfil",
  hint: "Escolha uma pergunta.",
  log: {
    ship: "Resposta com 2 fontes",
    board: "Diretoria: plano inteiro",
    finance: "Financeiro: parte do plano",
    support: "Atendimento: fonte fechada",
  },
  recordIdle: "Prazo: a confirmar",
  profileLabel: "Perfil",
  profiles: [
    { id: "support", label: "Atendimento" },
    { id: "finance", label: "Financeiro" },
    { id: "board", label: "Diretoria" },
  ],
  questionLabel: "Pergunta",
  questions: [
    { id: "ship", label: "Dá para entregar sábado?" },
    { id: "goals", label: "Quais são as metas do ano?" },
  ],
  blocked: "Fora do seu acesso.",
  // The sentences of each answer, each pointing at a line of a source; `null` is a sentence the profile may not read
  answers: {
    ship: [
      { text: "Sim, sábado até 12h.", source: "policy", line: 1 },
      { text: "Acima de 5 kg, só em dia útil.", source: "policy", line: 2 },
    ],
    goalsBoard: [
      { text: "Crescer 18% em vendas.", source: "plan", line: 0 },
      { text: "Abrir duas lojas novas.", source: "plan", line: 1 },
    ],
    goalsFinance: [
      { text: "Crescer 18% em vendas.", source: "plan", line: 0 },
      {
        text: "O plano de lojas está fora do seu acesso.",
        source: null,
        line: 1,
      },
    ],
  },
  sources: {
    policy: {
      title: "Política de entregas",
      lines: [
        "Entregas de segunda a sexta.",
        "Sábado, até 12h.",
        "Acima de 5 kg, só em dia útil.",
      ],
    },
    plan: {
      title: "Planejamento do ano",
      lines: [
        "Vendas: crescer 18%.",
        "Duas lojas novas.",
        "Prazo médio: 2 dias.",
      ],
    },
  },
  record: "Prazo: sábado, até 12h (Política de entregas)",
} as const;
