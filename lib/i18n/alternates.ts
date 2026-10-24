// ALTERNATIVAS DE IDIOMA NOS METADADOS
// The alternates every page of the site shares: its own address (canonical) and the same path in each locale (hreflang),
// plus x-default on the default locale. `path` is a site path without prefix ("/" or "/products/<slug>"). The base URL
// that makes them absolute is the `metadataBase` of the root layout.
import { LOCALES, localizePath, type Locale } from "./config";

export function localeAlternates(locale: Locale, path: string) {
  return {
    canonical: localizePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, path)])),
      "x-default": localizePath("pt-BR", path),
    },
  };
}
