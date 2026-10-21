// CENAS DE CAPACIDADE DE CADA PRODUTO
// The opening of a product page plays native scenes of the product, in the same system as the scenes of the home
// (components/scenes): product windows drawn in HTML and CSS, timed by a script with the same rules (actions after the
// swap, the last one ending at `settle`, a scene of 2.3 to 2.8 s and a hold of 0.8 to 1.0 s). Only capabilities the code
// of the product sustains (v13 analysis, section 1): the Relloo shows the person and the agent that passes the
// conversation on (no campaign, coupon or cashback), the Magneto the flow drawn in blocks (no process written as a
// sentence, no rollback button), the Tuner the call routed to the right team (the chat of the site is the Relloo's),
// the Knowly the answer with its source, its sources and the access per person. The Domus opens with its areas
// instead. The short name of each scene lives with the page (lib/content/products.ts). The contact, orders and documents
// are those of the story of the home (the contact 4821, the order 1234, the delivery policy) or fictional cases of the
// same store. Interface text, not page copy: the copy rules still read it (components/scenes/capability.test.tsx).
import { PRODUCT_PAGE } from "@/lib/content/products";
import type { ProductSlug } from "@/lib/products";
import type { TimedScene } from "./script";
import { STORY } from "./story";

export type CapabilitySceneId =
  | "relloo-person"
  | "relloo-agent"
  | "magneto-canvas"
  | "tuner-call"
  | "knowly-answer"
  | "knowly-sources"
  | "knowly-access";

export type CapabilityScript = TimedScene & {
  id: CapabilitySceneId;
  product: ProductSlug;
};

// ROTEIRO DAS CENAS DE CAPACIDADE
// In the order the opening plays them. Every scene has the three beats of the ludic pass (0.45 s for 0.22 s, 0.8 s for
// 0.28 s, 1.25 s for 0.27 s) and a hold of 1.0 s: long enough for a spring, a flight or a check that draws itself.
const beats = (a: string, b: string, c: string) => [
  { id: a, at: 0.45, dur: 0.22 },
  { id: b, at: 0.8, dur: 0.28 },
  { id: c, at: 1.25, dur: 0.27 },
];

export const CAPABILITY_SCRIPT: Record<
  ProductSlug,
  readonly CapabilityScript[]
> = {
  domus: [],
  relloo: [
    {
      id: "relloo-person",
      product: "relloo",
      // The history of the person, then what the Domus keeps, then the conversation that gets it all
      actions: beats("history", "domus", "card"),
      settle: 1.52,
      hold: 1.0,
    },
    {
      id: "relloo-agent",
      product: "relloo",
      // The agent answers with its source, the person asks for someone, the team takes over
      actions: beats("answer", "ask", "handoff"),
      settle: 1.52,
      hold: 1.0,
    },
  ],
  magneto: [
    {
      id: "magneto-canvas",
      product: "magneto",
      // The drawing runs: each block is checked in turn, the branch above the limit included
      actions: beats("run", "branch", "done"),
      settle: 1.52,
      hold: 1.0,
    },
  ],
  tuner: [
    {
      id: "tuner-call",
      product: "tuner",
      // The call is routed to the right team, then passed on with what was said
      actions: beats("route", "take", "note"),
      settle: 1.52,
      hold: 1.0,
    },
  ],
  knowly: [
    {
      id: "knowly-answer",
      product: "knowly",
      // The answer comes sentence by sentence, each with its source, and the gap is said plainly
      actions: beats("answer", "sources", "missing"),
      settle: 1.52,
      hold: 1.0,
    },
    {
      id: "knowly-sources",
      product: "knowly",
      // The search lights what it finds in every kind of source, then the freshness of each one
      actions: beats("search", "found", "fresh"),
      settle: 1.52,
      hold: 1.0,
    },
    {
      id: "knowly-access",
      product: "knowly",
      // The space of the person opens, the others stay locked, and the answer respects it
      actions: beats("open", "ask", "reply"),
      settle: 1.52,
      hold: 1.0,
    },
  ],
};

// HISTÓRIA DAS CENAS DE CAPACIDADE
// Every string the capability scenes draw, by scene. Same world as lib/scenes/story.ts: the store of the order 1234 and
// its delivery policy. v2.2 (audit, section 5): one contact and teams; no employee by name, no agent with a human name,
// and the category of a channel instead of its brand. v3 (F1): the contact is its record id (STORY.who), never a name.
export const CAPABILITY_STORY = {
  "relloo-person": {
    where: "Contatos",
    meta: STORY.order,
    name: STORY.who,
    since: "3 pedidos",
    channels: ["Mensagem", "Telefone"],
    history: "Histórico",
    items: [
      {
        kind: "Mensagem",
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
    owner: { label: "Responsável", value: "Equipe de pedidos" },
    deadline: { label: "Prazo", value: "2 h" },
  },
  "relloo-agent": {
    where: "Agentes",
    meta: "Conversa de teste",
    agent: "Agente de atendimento",
    agentRole: "Agente de IA",
    knows: "Conhecimento",
    source: "Política de trocas",
    passes: "Passagem para a equipe",
    passesWhen: "Quando pedem a equipe",
    contact: STORY.who,
    ask: "Posso trocar um produto?",
    answer: "Pode sim. A troca vale por 30 dias, com a nota.",
    from: "Fonte: Política de trocas, linha 1",
    human: "Quero falar com a equipe.",
    handoff: "Atendimento assume a conversa",
    handoffMeta: "Com a conversa toda",
  },
  "magneto-canvas": {
    where: "Fluxo",
    meta: "Execução de hoje",
    title: "Pedido de compra",
    blocks: {
      start: "Pedido chega",
      approve: "Gerência aprova",
      notify: "Financeiro é avisado",
      above: "Diretoria aprova",
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
      { text: "Gerência aprovou", time: "10:14" },
      { text: "Diretoria aprovou", time: "10:31" },
      { text: "Financeiro avisado", time: "10:31" },
    ],
  },
  "tuner-call": {
    where: "Ligações",
    meta: "Central",
    caller: "Ligação recebida",
    callerMeta: "Pedido 1251, 0:42",
    menu: "Opção escolhida",
    option: "Troca ou devolução",
    teams: "Equipes",
    list: [
      { name: "Vendas", people: "2 livres" },
      { name: "Suporte", people: "1 livre" },
      { name: "Financeiro", people: "1 livre" },
    ],
    taken: "Em ligação",
    steps: [
      { time: "10:05", text: "Entrou na central" },
      { time: "10:05", text: "Escolheu troca ou devolução" },
      { time: "10:06", text: "Suporte assumiu a ligação" },
    ],
    note: "Pedido 1251, troca de tamanho",
    noteMeta: "Passou para o Suporte com a conversa",
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
    meta: "Perfil Suporte",
    spaces: [
      { name: "Vendas", docs: ["Política de prazos", "Modelos de proposta"] },
      { name: "Suporte", docs: ["Como responder", "Reabrir pedido"] },
      { name: "Diretoria", docs: ["Plano do ano", "Metas"] },
    ],
    open: 1,
    person: "Perfil Suporte",
    team: "Equipe de suporte",
    before: "Como reabro um pedido?",
    beforeReply: "Abra o pedido e use Reabrir, com o motivo.",
    beforeSource: "Suporte: Reabrir pedido",
    ask: "Qual é a meta do ano?",
    reply: "Esse conteúdo é só da Diretoria.",
    locked: "Sem acesso",
  },
} as const;

// The scenes the opening of a product plays, in the order of its page (lib/content/products.ts)
export const capabilityScenes = (slug: ProductSlug) =>
  PRODUCT_PAGE[slug].scenes.map(({ id }) =>
    CAPABILITY_SCRIPT[slug].find((scene) => scene.id === id)!,
  );
