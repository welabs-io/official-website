export type Lang = "en" | "pt";

// TEXTOS COMPARTILHADOS DA INTERFACE
// Only the shared UI strings read through useT().t(); page copy lives next to each page.
// The Imagine site copy left with the split of 2026-10-07.
export const translations: Record<Lang, Record<string, string>> = {
  pt: {
    "nav-home": "Início",
    "footer-rights": "Todos os direitos reservados.",
    "aria-scroll-top": "Voltar ao topo",
  },
  en: {
    "nav-home": "Home",
    "footer-rights": "All rights reserved.",
    "aria-scroll-top": "Back to top",
  },
};
