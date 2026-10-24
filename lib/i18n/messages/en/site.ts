// TEXTO DO SITE: METADADOS, COMUM, MENU E REGISTROS COMPARTILHADOS (EN)
// en-US, adapted from pt-BR (not a literal translation), with the terms of the glossary of the copy round
// (control/portfolio/site-redesign/i18n/glossario.md). The keys and the placeholders ({name}, {category}, {line}) stay as
// they are; `tsc` and lib/i18n/messages.test.ts fail on a missing key. Text only; the structure around it lives in code.
import type { SiteMessages } from "../../types";

// `meta` feeds <title>, the description, Open Graph and the share image; `common` the words of the frame (header,
// footer, skip link, the call to action every button of the site repeats); `shared` the two records the story is told
// on, kept in one place so the pages and the scenes read the same contact and order.
export const site: SiteMessages = {
  meta: {
    title: "Welabs",
    description: "Integrated solutions for your whole company.",
    homeDescription:
      "Domus, Relloo, Magneto, Tuner and Knowly: integrated solutions in a single workspace.",
    // {name} is the product and stays as the brand writes it; the pattern "<Name> by Welabs" is the brand's seal line
    productTitle: "{name} by Welabs",
    // {category} is the category of the product (products.<slug>.category), {line} its line (products.<slug>.line)
    productDescription: "{category} by Welabs. {line}.",
    ogAlt: "Welabs: Domus, Relloo, Magneto, Tuner and Knowly",
  },
  common: {
    skipLink: "Skip to content",
    homeLabel: "Welabs, home",
    cta: "Book a demo",
    footerNavLabel: "Product pages",
    copyright: "© 2026 Welabs",
    typing: "typing",
    frameIndicator: { label: "Moments", option: "Moment" },
  },
  language: {
    label: "Language",
  },
  nav: {
    label: "Main",
    products: "Products",
    domus: "Domus",
    open: "Open menu",
    close: "Close menu",
    switch: "The five products",
  },
  shared: {
    who: "Contact 4821",
    order: "Order 1234",
  },
  closing: {
    platforms: "Where we run",
  },
};
