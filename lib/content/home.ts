// CONTEÚDO DA HOME E DOS ELEMENTOS COMUNS
// Copy shared by the pages: the opening of the home, the sentences of the connector block, the closing and the headings
// of the product page. Functional language of the buyer, no slogan, no brand-concept phrase.
import type { ProductSlug } from "../products";

// Opening above the chain (components/template/SiteTemplate, kind "chain"): title and supporting line of the home.
export const HOME_INTRO = {
  title: "Welabs desenvolve sistemas de gestão, atendimento e processos",
  lead: "Cinco produtos próprios que se ligam. Um pedido entra pelo WhatsApp e ninguém digita o mesmo dado duas vezes.",
} as const;

// Sentence under the connector block of the home: the core and the rails
export const HUB_NOTE =
  "Domus e Relloo formam o núcleo; os outros três atravessam os dois.";

// Headings of the product page
export const PAGE_HEADINGS = {
  how: "Como funciona",
  resolves: "O que resolve",
  capabilities: "Capacidades",
  ties: "Com quem trabalha junto",
  audience: "Para quem",
  faq: "Perguntas frequentes",
  others: "Outros produtos",
} as const;

// MENU DO CABEÇALHO E PRÓXIMO PRODUTO
// Labels of the navigation: the three entries of the header menu, the name of the menu on a phone, and the door at the
// end of a product page to the next one (the switcher with "Voltar" left: the way back is scrolling up). The anchors are
// the sections of the home.
export const NAV = {
  label: "Principal",
  products: "Produtos",
  how: "Como funciona",
  contact: "Contato",
  open: "Abrir o menu",
  close: "Fechar o menu",
  // The door at the end of a product, to the next one
  next: "Próximo",
} as const;

// One line per connection of the connector block (key: the two slugs, sorted). The label of the connection comes from
// lib/chain.ts; this line says what travels over it.
export const TIE_LINES: Record<string, string> = {
  "domus-relloo":
    "O Relloo já abre cada cartão com os dados que o Domus guarda.",
  "domus-magneto":
    "As regras do Domus rodam no Magneto, e a pessoa só aprova onde precisa.",
  "relloo-tuner":
    "Ligação, WhatsApp e chat chegam ao Relloo como uma conversa só.",
  "knowly-relloo": "O Relloo responde com o texto do Knowly e mostra a fonte.",
};

export const tieKey = (a: ProductSlug, b: ProductSlug) =>
  [a, b].sort().join("-");

// Closing: the platform marks under a short title (no client brands on the Welabs site since 2026-10-20)
export const CLOSING = {
  platforms: "Onde rodamos",
} as const;

// Footer: heading for assistive technology of the list of product pages
export const FOOTER_NAV_LABEL = "Páginas dos produtos";
