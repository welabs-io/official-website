// CENAS DE CAPACIDADE DE CADA PRODUTO
// The opening of a product page plays three native scenes of the product, one per capability, in the same system as the
// chain (components/scenes): product windows drawn in HTML and CSS, timed by a script with the same rules (actions after
// the swap, the last one ending at `settle`, a scene of 2.3 to 2.8 s and a hold of 0.8 to 1.0 s). Each scene names the
// capability it shows (`cap` indexes PRODUCT_CONTENT[slug].capabilities) and its caption is the sentence the page already
// has for that capability (PRODUCT_DEPTH[slug].groups), so the scenes add no claim of their own. The people, orders and
// documents are those of the story of the chain (Marina, the order 1234, the delivery policy) or fictional cases of the
// same store. Interface text, not page copy: the copy rules still read it (components/scenes/scenes.test.tsx).
import { PRODUCT_DEPTH } from "@/lib/content/product-depth";
import { PRODUCT_CONTENT } from "@/lib/content/products";
import type { ProductSlug } from "@/lib/products";
import type { TimedScene } from "./script";

export type CapabilitySceneId =
  | "domus-form"
  | "domus-cash"
  | "domus-contract"
  | "relloo-person"
  | "relloo-campaign"
  | "relloo-agent"
  | "magneto-sentence"
  | "magneto-canvas"
  | "magneto-versions"
  | "tuner-site"
  | "tuner-call"
  | "tuner-official"
  | "knowly-answer"
  | "knowly-sources"
  | "knowly-access";

export type CapabilityScript = TimedScene & {
  id: CapabilitySceneId;
  product: ProductSlug;
  // Index of the capability in PRODUCT_CONTENT[product].capabilities
  cap: number;
};

// ROTEIRO DAS CENAS DE CAPACIDADE
// Three per product, in the order the opening plays them. Short actions with a reading pause between them; the whole
// motion of a scene stays near 1 s. Since script 2.0 every scene runs at twice the old pace (half-length actions, a
// 0.45 s swap, a hold of 0.9 s), the same as the chain.
export const CAPABILITY_SCRIPT: Record<
  ProductSlug,
  readonly CapabilityScript[]
> = {
  domus: [
    {
      id: "domus-form",
      product: "domus",
      cap: 1,
      // The fields of the form come in, then the screen they make, then its state
      actions: [
        { id: "fields", at: 0.45, dur: 0.2 },
        { id: "screen", at: 0.875, dur: 0.2 },
        { id: "ready", at: 1.475, dur: 0.125 },
      ],
      settle: 1.6,
      hold: 0.9,
    },
    {
      id: "domus-cash",
      product: "domus",
      cap: 0,
      // The PIX lands in the statement, meets its invoice and settles it
      actions: [
        { id: "pix", at: 0.45, dur: 0.15 },
        { id: "match", at: 0.85, dur: 0.15 },
        { id: "paid", at: 1.425, dur: 0.15 },
      ],
      settle: 1.575,
      hold: 0.9,
    },
    {
      id: "domus-contract",
      product: "domus",
      cap: 3,
      // The second signature, the signed state, then what the same record already holds
      actions: [
        { id: "sign", at: 0.45, dur: 0.15 },
        { id: "signed", at: 0.825, dur: 0.125 },
        { id: "links", at: 1.375, dur: 0.2 },
      ],
      settle: 1.575,
      hold: 0.9,
    },
  ],
  relloo: [
    {
      id: "relloo-person",
      product: "relloo",
      cap: 1,
      // The history of the person, then what the Domus keeps, then the card that gets it all
      actions: [
        { id: "history", at: 0.45, dur: 0.225 },
        { id: "domus", at: 0.9, dur: 0.15 },
        { id: "card", at: 1.425, dur: 0.15 },
      ],
      settle: 1.575,
      hold: 0.9,
    },
    {
      id: "relloo-campaign",
      product: "relloo",
      cap: 2,
      // The steps of the campaign light up, the coupon arrives, the sale comes back with its cashback
      actions: [
        { id: "steps", at: 0.45, dur: 0.225 },
        { id: "coupon", at: 0.875, dur: 0.15 },
        { id: "cash", at: 1.425, dur: 0.15 },
      ],
      settle: 1.575,
      hold: 0.9,
    },
    {
      id: "relloo-agent",
      product: "relloo",
      cap: 5,
      // The agent answers with its source, the person asks for someone, the team takes over
      actions: [
        { id: "answer", at: 0.45, dur: 0.15 },
        { id: "ask", at: 0.825, dur: 0.125 },
        { id: "handoff", at: 1.375, dur: 0.175 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
  ],
  magneto: [
    {
      id: "magneto-sentence",
      product: "magneto",
      cap: 3,
      // The sentence becomes three blocks, then the flow is switched on
      actions: [
        { id: "blocks", at: 0.5, dur: 0.25 },
        { id: "links", at: 0.85, dur: 0.15 },
        { id: "active", at: 1.4, dur: 0.15 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
    {
      id: "magneto-canvas",
      product: "magneto",
      cap: 0,
      // The drawing runs: each block is checked in turn, the branch above the limit included
      actions: [
        { id: "run", at: 0.45, dur: 0.3 },
        { id: "branch", at: 0.9, dur: 0.15 },
        { id: "done", at: 1.4, dur: 0.15 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
    {
      id: "magneto-versions",
      product: "magneto",
      cap: 2,
      // The new version passes its test beside the active one, becomes active, and the log says who did it
      actions: [
        { id: "test", at: 0.45, dur: 0.2 },
        { id: "activate", at: 0.875, dur: 0.15 },
        { id: "log", at: 1.4, dur: 0.15 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
  ],
  tuner: [
    {
      id: "tuner-site",
      product: "tuner",
      cap: 2,
      // The question is typed in the chat of the site and lands in the inbox like the other channels
      actions: [
        { id: "type", at: 0.45, dur: 0.175 },
        { id: "arrive", at: 0.85, dur: 0.15 },
        { id: "reply", at: 1.4, dur: 0.15 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
    {
      id: "tuner-call",
      product: "tuner",
      cap: 1,
      // The call is routed to the right team, then passed on with what was said
      actions: [
        { id: "route", at: 0.45, dur: 0.175 },
        { id: "take", at: 0.85, dur: 0.15 },
        { id: "note", at: 1.4, dur: 0.15 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
    {
      id: "tuner-official",
      product: "tuner",
      cap: 3,
      // Photo and location arrive whole, a day later the conversation picks up, and the record checks it all
      actions: [
        { id: "media", at: 0.45, dur: 0.2 },
        { id: "later", at: 0.875, dur: 0.15 },
        { id: "checks", at: 1.4, dur: 0.175 },
      ],
      settle: 1.575,
      hold: 0.9,
    },
  ],
  knowly: [
    {
      id: "knowly-answer",
      product: "knowly",
      cap: 0,
      // The answer comes sentence by sentence, each with its source, and the gap is said plainly
      actions: [
        { id: "answer", at: 0.45, dur: 0.2 },
        { id: "sources", at: 0.85, dur: 0.175 },
        { id: "missing", at: 1.4, dur: 0.15 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
    {
      id: "knowly-sources",
      product: "knowly",
      cap: 1,
      // The search lights what it finds in every kind of source, then the freshness of each one
      actions: [
        { id: "search", at: 0.45, dur: 0.15 },
        { id: "found", at: 0.8, dur: 0.225 },
        { id: "fresh", at: 1.4, dur: 0.15 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
    {
      id: "knowly-access",
      product: "knowly",
      cap: 2,
      // The space of the person opens, the others stay locked, and the answer respects it
      actions: [
        { id: "open", at: 0.45, dur: 0.175 },
        { id: "ask", at: 0.825, dur: 0.15 },
        { id: "reply", at: 1.4, dur: 0.15 },
      ],
      settle: 1.55,
      hold: 0.9,
    },
  ],
};

// The capability a scene shows: its short name (the label under the stage) and the sentence of the page about it (the
// caption)
export function capabilityOf(scene: CapabilityScript) {
  const name = PRODUCT_CONTENT[scene.product].capabilities[scene.cap].text;
  const detail = PRODUCT_DEPTH[scene.product].groups
    .flatMap((group) => group.items)
    .find((item) => item.cap === scene.cap)!.detail;
  return { name, detail };
}

// HISTÓRIA DAS CENAS DE CAPACIDADE
// Every string the capability scenes draw, by scene. Same world as lib/scenes/story.ts: the store of Marina's order 1234,
// its people (Ana, Carla Mendes, Rafael Lima, Bia Souza) and its delivery policy.
export const CAPABILITY_STORY = {
  "domus-form": {
    where: "Cadastros",
    meta: "Novo cadastro",
    design: "Desenho do cadastro",
    designMeta: "5 campos",
    fields: [
      { name: "Pedido", kind: "Número" },
      { name: "Motivo", kind: "Lista" },
      { name: "Prazo", kind: "Data" },
      { name: "Responsável", kind: "Pessoa" },
      { name: "Foto", kind: "Arquivo" },
    ],
    add: "Adicionar campo",
    screen: "Trocas",
    ready: "Tela pronta",
    columns: ["Pedido", "Motivo", "Prazo", "Responsável"],
    rows: [
      ["1251", "Troca de tamanho", "Hoje", "Ana"],
      ["1263", "Defeito", "Amanhã", "Bruno"],
      ["1270", "Cor diferente", "Sexta", "Ana"],
      ["1288", "Item faltando", "Segunda", "Bruno"],
      ["1294", "Embalagem aberta", "Segunda", "Ana"],
    ],
    button: "Nova troca",
  },
  "domus-cash": {
    where: "Financeiro",
    meta: "Outubro",
    receivable: "A receber",
    invoice: {
      title: "Fatura 0412",
      who: "Marina, Pedido 1234",
      amount: "R$ 389,00",
      rows: [
        { label: "Vencimento", value: "15/10" },
        { label: "Impostos", value: "ISS, R$ 19,45" },
        { label: "Forma", value: "PIX" },
      ],
      open: "Aberta",
      paid: "Paga",
      settled: "Baixa automática",
    },
    others: [
      { title: "Fatura 0409", who: "Rafael Lima", amount: "R$ 152,00" },
      { title: "Fatura 0415", who: "Bia Souza", amount: "R$ 96,00" },
    ],
    bank: "Extrato do banco",
    bankMeta: "Hoje",
    lines: [
      {
        kind: "Boleto pago",
        who: "Embalagens Sul",
        amount: "R$ 640,00",
        time: "08:15",
      },
      {
        kind: "Tarifa do banco",
        who: "Conta corrente",
        amount: "R$ 2,50",
        time: "08:30",
      },
      {
        kind: "Transferência",
        who: "Rafael Lima",
        amount: "R$ 152,00",
        time: "09:40",
      },
      {
        kind: "PIX recebido",
        who: "Marina",
        amount: "R$ 389,00",
        time: "10:21",
      },
    ],
    matched: "Conciliado",
  },
  "domus-contract": {
    where: "Contratos",
    meta: "Contrato 0087",
    title: "Prestação de serviço",
    rows: [
      { label: "Vigência", value: "12 meses" },
      { label: "Valor mensal", value: "R$ 1.200,00" },
      { label: "Início", value: "01/11" },
    ],
    signers: "Assinaturas",
    people: [
      { initials: "CM", name: "Carla Mendes", role: "Gestora", time: "10:02" },
      {
        initials: "RL",
        name: "Rafael Lima",
        role: "Contratante",
        time: "10:31",
      },
    ],
    signedAt: "Assinou",
    waiting: "Aguardando",
    signed: "Assinado",
    same: "No mesmo sistema",
    links: [
      { area: "Financeiro", value: "12 parcelas" },
      { area: "Pessoas", value: "2 responsáveis" },
      { area: "Fiscal", value: "Nota de serviço" },
      { area: "Documentos", value: "2 anexos" },
    ],
  },
  "relloo-person": {
    where: "Pessoas",
    meta: "Marina",
    name: "Marina",
    since: "3 pedidos",
    channels: ["WhatsApp", "Telefone"],
    history: "Histórico",
    items: [
      {
        kind: "WhatsApp",
        text: "Seu pedido 1234 está em separação.",
        time: "09:12",
      },
      { kind: "Voz", text: "Ligação de 0:42", time: "10:05" },
      { kind: "Pedido 1198", text: "Segunda via da nota", time: "Resolvido" },
    ],
    domus: "Do Domus",
    domusRows: [
      { label: "Endereço", value: "Rua das Flores, 210" },
      { label: "Pedido", value: "1234, 3 itens" },
    ],
    card: { title: "Alteração de entrega", order: "Pedido 1234" },
    owner: { label: "Responsável", value: "Ana" },
    deadline: { label: "Prazo", value: "2 h" },
  },
  "relloo-campaign": {
    where: "Campanhas",
    meta: "Outubro",
    title: "Cupom de outubro",
    steps: [
      { name: "Formulário", value: "Bia se cadastrou" },
      { name: "Cupom no WhatsApp", value: "Enviado 10:02" },
      { name: "Venda no caixa", value: "R$ 180,00" },
      { name: "Cashback", value: "R$ 9,00" },
    ],
    contact: "Bia Souza",
    channel: "WhatsApp",
    form: "Quero receber o cupom.",
    hello: "Oi, Bia! Seu cupom de outubro chegou.",
    code: "OUTUBRO10",
    codeMeta: "10% na loja até 31/10",
    sale: "Venda no caixa, R$ 180,00",
    cashback: "Cashback de R$ 9,00 liberado",
    times: { form: "10:01", hello: "10:02", sale: "16:40" },
  },
  "relloo-agent": {
    where: "Agentes",
    meta: "Conversa de teste",
    agent: "Lia",
    agentRole: "Agente de atendimento",
    knows: "Conhecimento",
    source: "Política de trocas",
    passes: "Passa a vez",
    passesWhen: "Quando pedem uma pessoa",
    contact: "Bia Souza",
    ask: "Posso trocar um produto?",
    answer: "Pode sim. A troca vale por 30 dias, com a nota.",
    from: "Fonte: Política de trocas, linha 1",
    human: "Quero falar com uma pessoa.",
    handoff: "Ana assume a conversa",
    handoffMeta: "Equipe de atendimento, com a conversa toda",
  },
  "magneto-sentence": {
    where: "Novo fluxo",
    meta: "Pedido de compra",
    prompt: "Descreva o processo",
    sentence:
      "Quando chegar um pedido de compra, a Ana aprova e o financeiro é avisado.",
    blocks: [
      { name: "Pedido chega", kind: "Início" },
      { name: "Ana aprova", kind: "Aprovação" },
      { name: "Financeiro é avisado", kind: "Aviso" },
    ],
    review: "Revise os blocos",
    active: "Ativo",
  },
  "magneto-canvas": {
    where: "Fluxo",
    meta: "Execução de hoje",
    title: "Pedido de compra",
    blocks: {
      start: "Pedido chega",
      approve: "Ana aprova",
      notify: "Financeiro é avisado",
      above: "Diretor aprova",
    },
    kinds: {
      start: "Início",
      approve: "Aprovação",
      notify: "Aviso",
      above: "Aprovação",
    },
    limit: "Acima do limite",
    order: "Pedido 4021",
    done: "Concluído",
    run: "Execução",
    steps: [
      { text: "Pedido chegou", time: "10:02" },
      { text: "Ana aprovou", time: "10:14" },
      { text: "Diretor aprovou", time: "10:31" },
      { text: "Financeiro avisado", time: "10:31" },
    ],
  },
  "magneto-versions": {
    where: "Versões",
    meta: "Pedido de compra",
    v1: "Versão 1",
    v2: "Versão 2",
    v1Meta: "Em uso desde 02/10",
    v2Meta: "Criada hoje",
    steps: ["Pedido chega", "Ana aprova", "Financeiro é avisado"],
    active: "Ativa",
    saved: "Guardada",
    tested: "Testada",
    test: "Teste com o Pedido 4021",
    passed: "Passou nos 3 passos",
    back: "Voltar à versão 1",
    log: "Registro",
    entries: [
      { initials: "A", text: "Ana criou a versão 2 e testou", time: "10:02" },
      { initials: "A", text: "Ana ativou a versão 2", time: "10:15" },
    ],
  },
  "tuner-site": {
    where: "Caixa de entrada",
    meta: "3 canais",
    site: "loja.com.br",
    widget: "Fale com a loja",
    question: "Vocês levam até Campinas?",
    send: "Enviar",
    inbox: "Caixa de entrada",
    inboxMeta: "4 abertas",
    items: [
      {
        name: "Bia Souza",
        channel: "Chat do site",
        text: "Vocês levam até Campinas?",
        time: "10:21",
      },
      {
        name: "Marina",
        channel: "WhatsApp",
        text: "Dá para entregar sábado?",
        time: "10:07",
      },
      {
        name: "Rafael Lima",
        channel: "Voz",
        text: "Ligação de 0:42",
        time: "09:58",
      },
      {
        name: "Paulo Reis",
        channel: "Chat do site",
        text: "Tem na cor azul?",
        time: "09:31",
      },
    ],
    reply: "Responder Bia",
  },
  "tuner-call": {
    where: "Ligações",
    meta: "Central",
    caller: "Rafael Lima",
    callerMeta: "Ligação, 0:42",
    menu: "Opção escolhida",
    option: "Troca ou devolução",
    teams: "Equipes",
    list: [
      { name: "Vendas", people: "2 livres" },
      { name: "Suporte", people: "Davi" },
      { name: "Financeiro", people: "1 livre" },
    ],
    taken: "Em ligação",
    steps: [
      { time: "10:05", text: "Entrou na central" },
      { time: "10:05", text: "Escolheu troca ou devolução" },
      { time: "10:06", text: "Davi assumiu a ligação" },
    ],
    note: "Pedido 1251, troca de tamanho",
    noteMeta: "Passou para o Davi com a conversa",
  },
  "tuner-official": {
    where: "WhatsApp",
    meta: "Número oficial",
    contact: "Central de pedidos",
    official: "Oficial",
    photo: "Foto do pedido",
    place: "Rua das Flores, 210",
    later: "Um dia depois",
    resume: "Oi, Marina! Podemos seguir com a troca?",
    yes: "Sim, pode seguir.",
    times: { photo: "18:40", place: "18:41", resume: "09:05", yes: "09:07" },
    record: "Conversa de Marina",
    recordMeta: "Tudo no mesmo lugar",
    checks: ["Foto do pedido", "Localização", "Conversa retomada"],
  },
  "knowly-answer": {
    where: "Perguntas",
    meta: "Atendimento",
    question: "E no domingo?",
    answer: "Aos domingos não há entregas.",
    detail: "A retirada na loja abre às 10h.",
    sources: [
      { n: "1", name: "Política de entregas, linha 3" },
      { n: "2", name: "Retirada na loja, linha 1" },
    ],
    missing: "Não encontrei o horário de feriado.",
    label: "Resposta",
    sourcesTitle: "Fontes",
    related: "Perguntas parecidas",
    questions: ["Até que horas retiro na loja?", "E no sábado?"],
  },
  "knowly-sources": {
    where: "Fontes",
    meta: "Tudo da loja",
    query: "política de trocas",
    groups: [
      {
        name: "Documentos",
        items: ["Política de trocas", "Manual de vendas", "Tabela de frete"],
      },
      {
        name: "Conversas",
        items: ["Troca de tamanho", "Pedido 1198", "Pedido 1251"],
      },
      {
        name: "Reuniões",
        items: ["Reunião de 12/09", "Reunião de 19/09", "Reunião de 26/09"],
      },
    ],
    hits: [0, 0, 0],
    fresh: "Atualizado na origem",
    freshTimes: ["há 2 min", "há 1 h", "ontem"],
    excerpt: {
      from: "Política de trocas, linha 1",
      text: "A troca vale por 30 dias, com a nota.",
      meta: "Documentos, atualizado há 2 min",
    },
  },
  "knowly-access": {
    where: "Acesso",
    meta: "Bia Souza",
    spaces: [
      { name: "Vendas", docs: ["Política de prazos", "Modelos de proposta"] },
      { name: "Suporte", docs: ["Como responder", "Reabrir pedido"] },
      { name: "Diretoria", docs: ["Plano do ano", "Metas"] },
    ],
    open: 1,
    person: "Bia Souza",
    team: "Equipe de suporte",
    before: "Como reabro um pedido?",
    beforeReply: "Abra o pedido e use Reabrir, com o motivo.",
    beforeSource: "Suporte: Reabrir pedido",
    ask: "Qual é a meta do ano?",
    reply: "Esse conteúdo é só da Diretoria.",
    locked: "Sem acesso",
  },
} as const;

export const capabilityScenes = (slug: ProductSlug) => CAPABILITY_SCRIPT[slug];
