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
    relloo: "Marina com a Ana",
    magneto: "Aprovado às 10:14",
    tuner: "Ligação na conversa",
    knowly: "Sim, até 12h",
  } satisfies Record<ProductSlug, string>,
} as const;

// The fitting pieces: a film with no text, named for assistive technology only
export const HOME_FIT = {
  label: "Os cinco produtos se encaixam no Domus",
} as const;

// The message that crosses the operation (drag it onto the track, or press the button)
export const HOME_MESSAGE = {
  title: "Uma mensagem, a operação inteira",
  lead: "Arraste a conversa para o trilho.",
  bubble: { channel: "WhatsApp", text: "Dá para entregar sábado?" },
  send: "Enviar a mensagem",
  again: "Recomeçar",
  stations: [
    { product: "tuner", label: "Chegou" },
    { product: "relloo", label: "Ana responde" },
    { product: "knowly", label: "Sim, até 12h" },
    { product: "magneto", label: "Aprovado" },
    { product: "domus", label: "Registrado" },
  ] as const satisfies readonly { product: ProductSlug; label: string }[],
  done: "Confirmado: sábado",
} as const;

// The rooms of the Domus. `tag` is the small attractive detail of a room, never its definition
export type Room = { name: string; glyph: string; tag?: string };
export const DOMUS_ROOMS: readonly Room[] = [
  { name: "Vendas", glyph: "tag" },
  { name: "Compras", glyph: "bag" },
  { name: "Estoque", glyph: "box" },
  { name: "Produção", glyph: "spark" },
  { name: "Financeiro", glyph: "coin", tag: "PIX" },
  { name: "Fiscal", glyph: "doc", tag: "NFS-e" },
  { name: "Contratos", glyph: "pen" },
  { name: "Projetos", glyph: "calendar" },
  { name: "Pessoas", glyph: "user" },
  { name: "Jurídico", glyph: "book" },
  { name: "Aprovações", glyph: "check" },
];

export const HOME_DOMUS = {
  title: "A gestão inteira fica no Domus",
  lead: "E ganha as áreas que só a sua operação tem.",
  add: "Sua área",
  // The room the "+" makes: an example of an area a company creates for itself
  born: "Vistorias",
  addLabel: "Criar uma área nova",
  more: "Conhecer o Domus",
  ground: "Os outros produtos trabalham sobre o Domus",
} as const;

export const HOME_PRODUCTS = { title: "Os cinco produtos" } as const;

// What changes: the settled frame of three native scenes, the outcome only
export const HOME_EFFECTS = {
  title: "O que muda na operação",
  items: [
    { scene: "s1", text: "Ligação e WhatsApp, a mesma pessoa" },
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

// MENU DO CABEÇALHO E PRÓXIMO PRODUTO
// Labels of the navigation: the products (a list under it), the Domus (the centre of the chain) and the call to action;
// the name of the menu on a phone; the door at the end of a product page to the next one.
export const NAV = {
  label: "Principal",
  products: "Produtos",
  domus: "Domus",
  open: "Abrir o menu",
  close: "Fechar o menu",
  // The door at the end of a product, to the next one
  next: "Próximo produto",
} as const;

// Closing: the platform marks under a short title (no client brands on the Welabs site since 2026-10-20)
export const CLOSING = {
  platforms: "Onde rodamos",
} as const;

// Footer: heading for assistive technology of the list of product pages
export const FOOTER_NAV_LABEL = "Páginas dos produtos";
