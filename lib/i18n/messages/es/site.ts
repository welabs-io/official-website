// TEXTO DO SITE: METADADOS, COMUM, MENU E REGISTROS COMPARTILHADOS (ES)
// Neutral Latin American Spanish with "tú", adapted from pt-BR (not a literal translation), with the terms of the
// glossary of the copy round (control/portfolio/site-redesign/i18n/glossario.md). The keys and the placeholders ({name},
// {category}, {line}) stay as they are; `tsc` and lib/i18n/messages.test.ts fail on a missing key. Text only; the
// structure around it lives in code.
import type { SiteMessages } from "../../types";

// `meta` feeds <title>, the description, Open Graph and the share image; `common` the words of the frame (header,
// footer, skip link, the call to action every button of the site repeats); `shared` the two records the story is told
// on, kept in one place so the pages and the scenes read the same contact and order.
export const site: SiteMessages = {
  meta: {
    title: "Welabs",
    description: "Soluciones integradas para toda la empresa.",
    homeDescription:
      "Domus, Relloo, Magneto, Tuner y Knowly: soluciones integradas en un único espacio de trabajo.",
    // {name} is the product and stays as the brand writes it; the pattern "<Name> by Welabs" is the brand's seal line
    productTitle: "{name} by Welabs",
    // {category} is the category of the product (products.<slug>.category), {line} its line (products.<slug>.line)
    productDescription: "{category} de Welabs. {line}.",
    ogAlt: "Welabs: Domus, Relloo, Magneto, Tuner y Knowly",
  },
  common: {
    skipLink: "Ir al contenido",
    homeLabel: "Welabs, inicio",
    cta: "Agenda una demostración",
    footerNavLabel: "Páginas de los productos",
    copyright: "© 2026 Welabs",
    typing: "escribiendo",
    frameIndicator: { label: "Momentos", option: "Momento" },
  },
  language: {
    label: "Idioma",
  },
  nav: {
    label: "Principal",
    products: "Productos",
    domus: "Domus",
    open: "Abrir el menú",
    close: "Cerrar el menú",
    switch: "Los cinco productos",
  },
  shared: {
    who: "Contacto 4821",
    order: "Pedido 1234",
  },
  closing: {
    platforms: "Dónde operamos",
  },
};
