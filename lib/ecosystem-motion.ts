// ROTEIRO DA OPERAÇÃO CONECTADA
// One accepted demonstration supplies the request, customer, order, source and approval shown by both canvas variants.
import type { ProductSlug } from "./products";
import pieces from "./ecosystem-motion-pieces.json";

export const ECOSYSTEM_DURATION = 24;
// Preserve every authored action while completing one automatic cycle in twenty seconds.
export const ECOSYSTEM_PLAYBACK_RATE = 1.2;
export const ECOSYSTEM_REQUEST =
  "Dá para mudar a entrega do meu pedido para sábado?";
export const ECOSYSTEM_PHASES = [
  {
    key: "arrival",
    owner: "Tuner · Canais",
    label: "Conversa",
    title: "A solicitação chega pelo Tuner.",
    body: "Marina pergunta pelo WhatsApp sobre a entrega. A conversa é o ponto de partida da mesma operação.",
    start: 0,
    posterTime: 2.4,
    products: ["tuner"],
  },
  {
    key: "context",
    owner: "Relloo + Domus",
    label: "Contexto",
    title: "Relloo e Domus encontram a mesma história.",
    body: "O relacionamento reconhece Marina; a gestão traz o pedido 1234, o endereço e o contexto que já existem.",
    start: 3.8,
    posterTime: 7,
    products: ["relloo", "domus"],
  },
  {
    key: "knowledge",
    owner: "Knowly · Fontes",
    label: "Fonte",
    title: "O Knowly traz a informação que sustenta a resposta.",
    body: "A política permite mudar a data antes do envio. Fonte: Política de entregas, seção 3.",
    start: 8.5,
    posterTime: 11.8,
    products: ["knowly"],
  },
  {
    key: "execution",
    owner: "Domus + Magneto",
    label: "Regra",
    title: "O Domus define. O Magneto conduz o trabalho.",
    body: "A mudança precisa passar pela gestora. O workflow encaminha a decisão conforme a regra da operação.",
    start: 13.3,
    posterTime: 17.6,
    products: ["domus", "magneto"],
  },
  {
    key: "return",
    owner: "Domus · Pedido",
    label: "Retorno",
    title: "A decisão volta ao mesmo pedido.",
    body: "A decisão da gestora retorna ao pedido 1234. Pessoa, conversa e gestão continuam no mesmo contexto.",
    start: 18.9,
    posterTime: 22.6,
    products: ["domus", "relloo", "tuner", "magneto"],
  },
] as const;

export const ECOSYSTEM_VARIANTS = pieces.variants;

export const ecosystemSource = (id: string) =>
  `/motion/${pieces.directory}/pieces/${id}/index.html`;
export const ecosystemPoster = (id: string, phase: string) =>
  `/motion/posters/${id}-${phase}.webp`;
export const ecosystemPhaseAt = (time: number) =>
  Math.max(
    0,
    ECOSYSTEM_PHASES.findLastIndex((phase) => time >= phase.start),
  );

export const ECOSYSTEM_ROLES: {
  slug: ProductSlug;
  title: string;
  body: string;
}[] = [
  {
    slug: "domus",
    title: "A gestão da empresa.",
    body: "Finanças, vendas, compras, estoque, pessoas e as regras do negócio na mesma base.",
  },
  {
    slug: "relloo",
    title: "O relacionamento com a história inteira.",
    body: "Contatos, oportunidades, conversas e campanhas ligados ao contexto da gestão.",
  },
  {
    slug: "magneto",
    title: "O trabalho entre uma decisão e outra.",
    body: "Workflows conduzem as regras da operação, encaminham decisões e acompanham a execução.",
  },
  {
    slug: "tuner",
    title: "Os canais de chegada e continuidade.",
    body: "WhatsApp, voz e chat do site preservam a conversa quando o atendimento continua.",
  },
  {
    slug: "knowly",
    title: "A informação que sustenta a resposta.",
    body: "Fontes consultáveis apoiam a conversa e respeitam os limites de quem acessa.",
  },
];
