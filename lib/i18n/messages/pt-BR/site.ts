// TEXTO DO SITE: METADADOS, COMUM, MENU E REGISTROS COMPARTILHADOS
// pt-BR, the source dictionary of the shape (lib/i18n/types.ts). Text only; the structure around it lives in code.
// `meta` feeds <title>, the description, Open Graph and the share image; `common` the words of the frame (header,
// footer, skip link, the call to action every button of the site repeats); `shared` the two records the story is told
// on, kept in one place so the pages and the scenes read the same contact and order.
export const site = {
  meta: {
    title: "Welabs",
    // Copy review of 2026-10-24: "software" and "SaaS" are banned; the preferred keys are "soluções" and "integrado"
    description: "Soluções integradas para a empresa inteira.",
    homeDescription:
      "Domus, Relloo, Magneto, Tuner e Knowly: soluções integradas num espaço de trabalho único.",
    // {name} is the product and stays as the brand writes it; the pattern "<Name> by Welabs" is the brand's seal line
    productTitle: "{name} by Welabs",
    // {category} is the category of the product (products.<slug>.category), {line} its line (products.<slug>.line)
    productDescription: "{category} da Welabs. {line}.",
    // The alt says what the share image draws: the logo and the five product names
    ogAlt: "Welabs: Domus, Relloo, Magneto, Tuner e Knowly",
  },
  common: {
    skipLink: "Ir para o conteúdo",
    homeLabel: "Welabs, início",
    // Says what happens after the click: the contact is the only way in, a button with no form
    cta: "Agendar uma demonstração",
    footerNavLabel: "Páginas dos produtos",
    copyright: "© 2026 Welabs",
    // The name a screen reader hears on the "typing" dots that come before a phrase of a scene
    typing: "digitando",
    // The frame indicator of the carousels: the name of the group and the word read before each number ("Momento 2")
    frameIndicator: { label: "Momentos", option: "Momento" },
  },
  // Language selector of the header: the accessible name of its button and of its list (the language names themselves
  // are endonyms and live in lib/i18n/config.ts)
  language: {
    label: "Idioma",
  },
  // Navigation of the header: the products (a list under it), the Domus (the centre of the chain) and the menu on a
  // phone; the name of the selector of the five products at the top of a product
  nav: {
    label: "Principal",
    products: "Produtos",
    domus: "Domus",
    open: "Abrir o menu",
    close: "Fechar o menu",
    switch: "Os cinco produtos",
  },
  // The two records the stories are told on: whoever asks is a contact record (never a person by name), the order is
  // the one that crosses the five products
  shared: {
    who: "Contato 4821",
    order: "Pedido 1234",
  },
  // Closing band of the home: the platform marks under a short title
  closing: {
    platforms: "Onde rodamos",
  },
} as const;
