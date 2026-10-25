// TEXTO DA CENA DA HOME (LAB, FORA DO I18N)
// The scene `home-message` of the kit is only mounted by the lab (/lab/scenes), which stays out of the i18n and in
// Portuguese; no page of the site reads this text (the home draws the chain of components/home/Chain.tsx).
import type { ProductSlug } from "@/lib/products";

export const HOME_MESSAGE = {
  title: "Uma mensagem, a operação inteira",
  lead: "Do canal ao pedido registrado no Domus.",
  bubble: { channel: "Mensagem", text: "Dá para entregar sábado?" },
  send: "Enviar a mensagem",
  stations: [
    { product: "tuner", label: "Chegou" },
    { product: "relloo", label: "Resposta" },
    { product: "knowly", label: "Sim, até 12h" },
    { product: "magneto", label: "Aprovado" },
    { product: "domus", label: "Registrado" },
  ] as const satisfies readonly { product: ProductSlug; label: string }[],
  record: "Pedido 1234",
} as const;
