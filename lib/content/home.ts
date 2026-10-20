// CONTEÚDO DA HOME E DOS ELEMENTOS COMUNS
// Copy of the home (v2 of the content, approved on 2026-10-20): each section has at most one short title and one line;
// the rest is motion and interaction. The words a visitor reads inside a drawing (the stamps of an effect, the names of
// the rooms) are labels of that drawing, also kept here so the copy rules read them. No slogan, no brand-concept phrase.
import type { ProductSlug } from "../products";

// Opening: the title is cut around the word that turns; each word lights the product it belongs to on the stage
export const HOME_INTRO = {
  before: "Software para",
  after: "da sua empresa",
  words: [
    { text: "a gestão", product: "domus" },
    { text: "o atendimento", product: "relloo" },
    { text: "as aprovações", product: "magneto" },
    { text: "os canais", product: "tuner" },
    { text: "o conhecimento", product: "knowly" },
  ] as const satisfies readonly { text: string; product: ProductSlug }[],
  lead: "Cinco produtos sobre os mesmos dados. O que acontece num deles já aparece nos outros.",
  // Accessible name of the stage and the effect each lit product shows
  stage: "Os cinco produtos ligados ao Domus",
  stamps: {
    domus: "Pedido 1234 atualizado",
    // v2.2 (audit, section 5): the effect, never a person ("Marina com a Ana")
    relloo: "Conversa distribuída",
    magneto: "Aprovado às 10:14",
    tuner: "Ligação na conversa",
    knowly: "Sim, até 12h",
  } satisfies Record<ProductSlug, string>,
  // v2.1: the record of the Domus at the centre of the stage. Each product, when it is lit, sends its effect along its
  // tie and the line of that effect lights in the record: what happens in one product shows in the Domus
  record: {
    title: "Pedido 1234",
    who: "Marina",
    lines: {
      tuner: "Ligação gravada",
      relloo: "Respondida no prazo",
      knowly: "Sábado, até 12h, com a fonte",
      magneto: "Troca aprovada",
    },
    domus: "Estoque e financeiro em dia",
  },
} as const;

// The message that crosses the operation (drag it onto the track, or press the button)
export const HOME_MESSAGE = {
  title: "Uma mensagem, a operação inteira",
  lead: "Arraste a conversa para o trilho.",
  // v2.2: the category of the channel, not the brand
  bubble: { channel: "Mensagem", text: "Dá para entregar sábado?" },
  send: "Enviar a mensagem",
  again: "Recomeçar",
  stations: [
    { product: "tuner", label: "Chegou" },
    { product: "relloo", label: "Resposta" },
    { product: "knowly", label: "Sim, até 12h" },
    { product: "magneto", label: "Aprovado" },
    { product: "domus", label: "Registrado" },
  ] as const satisfies readonly { product: ProductSlug; label: string }[],
  done: "Confirmado: sábado",
  // The record the message lands on, in the Domus
  record: "Pedido 1234",
} as const;

// The modules of the Domus, as installed in the ERP code (v2.1, control/portfolio/site-redesign/v13-proposta/v2-1/
// modulos-domus.md): the standard floor is the ERPNext and HRMS modules the product image installs
// (erpnext .k8s/Dockerfile.product:53, motor erpnext/modules.txt), the floor made to measure is our own apps (worktrack,
// legal_br, nfse_connector, inter_connector, asaas_connector, omie_connector, data_privacy). `tag` is the small
// attractive detail of a module, never its definition.
export type Room = { name: string; glyph: string; tag?: string };
export const DOMUS_MODULES: {
  standard: readonly Room[];
  custom: readonly Room[];
} = {
  standard: [
    { name: "Vendas", glyph: "tag" },
    { name: "Compras", glyph: "bag" },
    { name: "Estoque", glyph: "box" },
    { name: "Produção", glyph: "bolt" },
    { name: "Financeiro", glyph: "coin" },
    { name: "Contratos", glyph: "pen" },
    { name: "Projetos", glyph: "calendar" },
    { name: "Pessoas", glyph: "user" },
    { name: "Ativos", glyph: "truck" },
    { name: "Qualidade", glyph: "search" },
  ],
  custom: [
    { name: "Fiscal", glyph: "doc", tag: "NFS-e" },
    { name: "Bancos", glyph: "bank", tag: "PIX" },
    { name: "Jurídico", glyph: "book" },
    { name: "Chamados", glyph: "chat" },
    { name: "Demandas", glyph: "rule" },
    { name: "Aprovações", glyph: "check" },
    { name: "Privacidade", glyph: "lock" },
    // v2.2: the category, with the one connector the code has in brackets (never "e outros")
    { name: "Importação (Omie)", glyph: "refresh" },
  ],
};

export const HOME_DOMUS = {
  title: "A gestão inteira fica no Domus",
  lead: "E ganha os módulos que só a sua operação tem.",
  // The two floors of the house: the modules that come with the Domus, and the ones made to measure
  standard: "Padrão",
  custom: "Sob medida",
  add: "Novo módulo",
  // The module the "+" makes: an example of a module a company creates for itself, with the screen it gets
  born: "Vistorias",
  bornTag: "Novo módulo",
  bornFields: ["Local", "Data", "Foto"],
  addLabel: "Criar um módulo novo",
  more: "Conhecer o Domus",
  ground: "Os outros produtos trabalham sobre o Domus",
} as const;

export const HOME_PRODUCTS = { title: "Os cinco produtos" } as const;

// What changes: the settled frame of three native scenes, the outcome only
export const HOME_EFFECTS = {
  title: "O que muda na operação",
  items: [
    { scene: "s1", text: "Ligação e mensagem no mesmo histórico" },
    { scene: "s4", text: "A resposta vem com a fonte" },
    { scene: "s6", text: "O pedido volta confirmado" },
  ],
} as const;

// Contact: open questions, no answers: they are the reason to talk. The button is the only way in
export const HOME_CONTACT = {
  title: "Conte o que sua empresa precisa",
  asks: [
    "Quanto da sua operação cabe no Domus?",
    "O que acontece com os sistemas de hoje?",
    "Dá para começar por um produto?",
    "Por onde a gente começa?",
  ],
  asksLabel: "Perguntas para a conversa",
} as const;

// MENU DO CABEÇALHO E SELETOR DE PRODUTOS
// Labels of the navigation: the products (a list under it), the Domus (the centre of the chain) and the call to action;
// the name of the menu on a phone; the name of the selector of the five products at the top of a product (v2.1, in
// place of the door "Próximo produto" at its end).
export const NAV = {
  label: "Principal",
  products: "Produtos",
  domus: "Domus",
  open: "Abrir o menu",
  close: "Fechar o menu",
  switch: "Os cinco produtos",
} as const;

// Closing: the platform marks under a short title (no client brands on the Welabs site since 2026-10-20)
export const CLOSING = {
  platforms: "Onde rodamos",
} as const;

// Footer: heading for assistive technology of the list of product pages
export const FOOTER_NAV_LABEL = "Páginas dos produtos";
