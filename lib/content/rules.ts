// REGRAS DO TEXTO
// What the visible copy may not contain, shared by the content tests and the tests of the rendered pages.

export const words = (text: string) => text.trim().split(/\s+/).length;

// Slogan verbs and brand-concept phrases (operator rule), banned words, mechanism words and maturity markers.
// "entrega" is the slogan verb; the noun after "de" ("Alteração de entrega", the order of the story) is plain interface text.
export const COPY_RULES =
  /\b(domina|atende|automatiza|(?<!\bde )entrega|sabe|define|explica|conecta|transforma|ecossistema|cliente|clientes|erp|ficha|recibo|protocolo|tenant|fila|webhook|payload|beta|alpha|mvp|v2|roadmap|em breve|breve)\b|a empresa inteira numa casa|ele automatiza|todo canal, uma conversa só|não é só memória|os outros dão vida|ideias que viram|um só fluxo/i;
