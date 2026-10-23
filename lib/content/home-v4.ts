// CONTEÚDO DA HOME V4
// Copy of the three blocks of the v4 home (brief-v4, approved artboards Main, Chain and Accordion of the canvas,
// 2026-10-23): the opening in blades (one frame per product, the word of the title turning with it), the chain that the
// scroll walks (a message crossing the five products into the order in the Domus) and the accordion of the five
// products. The words drawn inside a frame or a mini-scene are labels of a product screen (out of the word budget,
// still read by the copy rules); no person, no vendor, no stage marker.
import type { ProductSlug } from "../products";
import { STORY } from "../scenes/story";

// The opening: each frame of the stage belongs to one product, in the order of the turning word (HOME_INTRO.words)
export const HOME_HERO = {
  caption: "Um quadro de cada produto",
  see: "Ver os produtos",
  // The dark seal over the frame: what just happened in the product of the frame (its amber dot is the live one)
  seals: {
    domus: { title: "Vistoria 318", line: "acendeu os outros quatro" },
    relloo: { title: "Conversa 2210", line: "na pessoa certa" },
    magneto: { title: "Proposta 905", line: "aprovada às 10:14" },
    tuner: { title: "Mensagem nova", line: "chegou pelo canal" },
    knowly: { title: "Prazo de 48 h", line: "lembrado, com a fonte" },
  } satisfies Record<ProductSlug, { title: string; line: string }>,
} as const;

// The modules of the Domus frame: the standard ones (filled) and the ones made to measure (outlined), the newest last
export type FrameModule = {
  name: string;
  icon: string;
  tag?: string;
  kind: "standard" | "custom" | "new";
};
export const DOMUS_FRAME = {
  title: "Módulos",
  sub: "da sua empresa",
  standard: "Padrão",
  custom: "Sob medida",
  modules: [
    { name: "Vendas", icon: "tag", kind: "standard" },
    { name: "Compras", icon: "bag", kind: "standard" },
    { name: "Estoque", icon: "box", kind: "standard" },
    { name: "Financeiro", icon: "coins", kind: "standard" },
    { name: "Contratos", icon: "pen", kind: "standard" },
    { name: "Pessoas", icon: "users", kind: "standard" },
    { name: "Fiscal", icon: "file", tag: "NFS-e", kind: "custom" },
    { name: "Bancos", icon: "bank", tag: "PIX", kind: "custom" },
    { name: "Chamados", icon: "chat", kind: "custom" },
    { name: "Aprovações", icon: "check", kind: "custom" },
    { name: "Jurídico", icon: "scale", kind: "custom" },
    { name: "Vistoria", icon: "clipboard", tag: "Novo", kind: "new" },
  ] as const satisfies readonly FrameModule[],
  // What each of the other four does with the new module, and the line under them
  uses: {
    relloo: "oportunidade avança",
    magneto: "fluxo começa",
    tuner: "técnico avisado",
    knowly: "fica lembrado",
  },
  usesLine: "Os outros quatro usam o tipo novo na hora",
} as const;

// The conversation of the Relloo frame: the message that arrives and the answer the agent types
export const RELLOO_FRAME = {
  title: "Conversa 2210",
  who: STORY.who,
  linked: "Ligada à gestão",
  owner: "Dono",
  agent: "Agente de atendimento",
  incoming: "Preciso de manutenção mensal para 3 aparelhos do bloco B.",
  time: "08:12",
  answer: "Claro! Qual o modelo e a potência dos aparelhos?",
  typing: "Agente de atendimento · digitando",
  stages: ["Conversa", "Qualificação", "Vistoria", "Ganha"],
} as const;

// The approval of the Magneto frame: the steps of the proposal, the live one in the middle
export const MAGNETO_FRAME = {
  title: "Proposta 905",
  state: "Em aprovação",
  steps: [
    { name: "Proposta enviada", line: "08:40", done: true },
    { name: "Aprovação da gerência", line: "agora", done: false },
    { name: "Assinatura do contrato", line: "a seguir", done: false },
    { name: "Pedido no Domus", line: "a seguir", done: false },
  ],
} as const;

// The channels of the Tuner frame: every channel lands in the one conversation
export const TUNER_FRAME = {
  title: "Canais",
  channels: [
    { name: "Mensagem", line: "Preciso de manutenção mensal…", fresh: true },
    { name: "Ligação", line: "3 min, gravada", fresh: false },
    { name: "E-mail", line: "Proposta 905", fresh: false },
  ],
  thread: { title: "Conversa 2210", line: "3 canais, um histórico" },
} as const;

// The answer of the Knowly frame: a question, the answer and the source it came from
export const KNOWLY_FRAME = {
  title: "Pergunta",
  question: "Qual o prazo de manutenção do bloco B?",
  answer: "48 h a partir do chamado, de segunda a sábado.",
  source: "Contrato 77 · cláusula 4",
  sourceLabel: "Fonte",
} as const;

// The chain: the scroll walks the message across the five products; each station lights in turn and the caption of the
// station types under them, until the order settles in the Domus
export type ChainStation = {
  product: ProductSlug;
  label: string;
  // The small line of the card before it is reached, while it is the live one, and once it is done
  next: string;
  now: string;
  done: string;
  // The caption typed while the station is the live one (one or two lines) and the chip it leaves once done
  caption: readonly string[];
  chip: string;
};

export const HOME_CHAIN = {
  eyebrow: "A cadeia",
  title: "Uma mensagem, a operação inteira",
  lead: "Do canal ao pedido registrado no Domus, enquanto você rola.",
  bubble: {
    channel: "Mensagem",
    text: RELLOO_FRAME.incoming,
    time: RELLOO_FRAME.time,
  },
  stations: [
    {
      product: "tuner",
      label: "Chegou",
      next: "a seguir",
      now: "agora",
      done: "pela mensagem",
      caption: ["A mensagem chega pelo canal."],
      chip: "Mensagem 08:12",
    },
    {
      product: "relloo",
      label: "Na pessoa certa",
      next: "a seguir",
      now: "Conversa 2210",
      done: "Conversa 2210",
      caption: ["A conversa encontra quem cuida dela", "e vira oportunidade."],
      chip: "Oportunidade 562",
    },
    {
      product: "knowly",
      label: "Com a fonte",
      next: "a seguir",
      now: "prazo de 48 h",
      done: "prazo de 48 h",
      caption: ["O combinado volta lembrado,", "com a fonte."],
      chip: "Prazo de 48 h, com a fonte",
    },
    {
      product: "magneto",
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
    {
      product: "domus",
      label: "Registrado",
      next: "a seguir",
      now: STORY.order,
      done: STORY.order,
      caption: ["O pedido, a nota e a cobrança", "ficam na gestão."],
      chip: STORY.order,
    },
  ] as const satisfies readonly ChainStation[],
  // The line under the last caption, once the order is settled
  closing: "Do primeiro contato ao pagamento.",
  // The record of the order in the Domus, one line per product that worked on it
  record: {
    title: STORY.order,
    who: STORY.who,
    tag: "Recorrente",
    lines: [
      { product: "Tuner", text: "Chegou pela mensagem" },
      { product: "Relloo", text: "Na pessoa certa, no prazo" },
      { product: "Knowly", text: "Combinado lembrado, com a fonte" },
      { product: "Magneto", text: "Aprovado e assinado" },
    ],
  },
} as const;

// The accordion of the five products: at rest the Domus is open; the others open on hover, on focus or on a tap
export type AccordionPanel = {
  slug: ProductSlug;
  // The area of the product, on the closed panel
  area: string;
  title: string;
  lead: string;
  points: readonly [string, string, string];
  question: string;
};

export const HOME_ACCORDION = {
  eyebrow: "Os produtos",
  title: "Cinco produtos, os mesmos dados",
  lead: "Cada um cuida de uma parte da operação. Abra para ver em ação.",
  open: "Abrir",
  close: "Fechar",
  panels: [
    {
      slug: "domus",
      area: "Gestão",
      title: "A gestão inteira, com o que só a sua operação tem.",
      lead: "Financeiro, fiscal, contratos e pessoas no mesmo lugar. Os outros quatro trabalham sobre ele.",
      points: [
        "Padrão e sob medida",
        "Assistente com o dado real",
        "Regras brasileiras",
      ],
      question: "Quanto da sua operação cabe no Domus?",
    },
    {
      slug: "relloo",
      area: "Relacionamento",
      title: "Cada pessoa, todas as conversas.",
      lead: "A mensagem chega, encontra quem cuida dela e vira oportunidade, sem ninguém copiar nada.",
      points: [
        "Caixa de entrada única",
        "IA que passa a vez",
        "Funil que anda sozinho",
      ],
      question: "Quanto se perde entre a mensagem e a proposta?",
    },
    {
      slug: "magneto",
      area: "Processos",
      title: "Cada aprovação no caminho certo.",
      lead: "O fluxo leva a proposta por quem aprova e pela assinatura, e avisa o próximo passo.",
      points: [
        "Fluxo desenhado na tela",
        "Aprovação em um toque",
        "Prazo com aviso",
      ],
      question: "Quantas aprovações esperam numa caixa de e-mail?",
    },
    {
      slug: "tuner",
      area: "Canais",
      title: "Mensagem, ligação e e-mail numa conversa.",
      lead: "Cada canal chega no mesmo histórico, ligado ao contato e ao pedido.",
      points: ["Mensagens e ligações", "Histórico único", "Número da empresa"],
      question: "Em quantos aparelhos está a conversa de hoje?",
    },
    {
      slug: "knowly",
      area: "Memória",
      title: "O que a empresa aprende fica lembrado.",
      lead: "A resposta vem do contrato, do chamado ou da reunião, com a fonte ao lado.",
      points: [
        "Resposta com a fonte",
        "Memória que cresce",
        "Busca no que já foi dito",
      ],
      question: "Quanto do combinado só existe na cabeça de alguém?",
    },
  ] as const satisfies readonly AccordionPanel[],
} as const;
