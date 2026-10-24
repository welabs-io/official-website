// CONFIGURAÇÃO DE IDIOMAS
// The three locales of the site and the address rules that go with them. pt-BR is the default and has NO prefix in the
// address (`/`, `/products/<slug>`); en and es are prefixed (`/en/...`, `/es/...`). Routes are always English: a locale
// changes the prefix, never a segment (/en/products/relloo, never /en/produtos/relloo). `/lab/*` is outside the i18n.
// Server-safe: no React, no browser API, so the proxy rules, the metadata and the client share it.
export const LOCALES = ["pt-BR", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";

export const isLocale = (value: string | null | undefined): value is Locale =>
  value != null && (LOCALES as readonly string[]).includes(value);

// The prefixed locales (the ones that show in the address)
export const PREFIXED_LOCALES = LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
);

// What each locale is called in the selector: the endonym (a language is named in itself) and the short code of the
// trigger. Not translated on purpose: the visitor who cannot read the current language must still find their own.
export const LOCALE_NAMES: Record<Locale, { name: string; code: string }> = {
  "pt-BR": { name: "Português", code: "PT" },
  en: { name: "English", code: "EN" },
  es: { name: "Español", code: "ES" },
};

// Value of <html lang> and of the Open Graph locale
export const HTML_LANG: Record<Locale, string> = {
  "pt-BR": "pt-BR",
  en: "en",
  es: "es",
};
export const OG_LOCALE: Record<Locale, string> = {
  "pt-BR": "pt_BR",
  en: "en_US",
  es: "es_ES",
};

// ENDEREÇOS
// "/en" or "" in front of a path that starts with "/"
export const localePrefix = (locale: Locale) =>
  locale === DEFAULT_LOCALE ? "" : `/${locale}`;

/** The address of `path` (a site path such as "/", "/products/domus", "/#contact") in a locale */
export function localizePath(locale: Locale, path: string): string {
  const prefix = localePrefix(locale);
  if (!prefix) return path;
  // "/" and "/#x" land on "/en" and "/en#x" (no trailing slash before a hash)
  if (path === "/") return prefix;
  if (path.startsWith("/#") || path.startsWith("/?"))
    return prefix + path.slice(1);
  return prefix + path;
}

/** The locale an address belongs to and the same address without its prefix (a pathname, with no search or hash) */
export function splitLocale(pathname: string): {
  locale: Locale;
  path: string;
} {
  // The default locale has no prefix in the address, but the router reports the path it was rewritten to
  // (`/pt-BR/products/domus` for `/products/domus`, next.config.mjs), so that prefix is read too
  for (const locale of LOCALES) {
    const prefix = `/${locale}`;
    if (pathname === prefix) return { locale, path: "/" };
    if (pathname.startsWith(`${prefix}/`))
      return { locale, path: pathname.slice(prefix.length) };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}

/** The address the visitor sees for a pathname the router reports: the default locale's rewritten prefix is dropped
 * ("/pt-BR/products/domus" -> "/products/domus"); en and es keep theirs */
export const publicPath = (pathname: string) =>
  pathname === `/${DEFAULT_LOCALE}`
    ? "/"
    : pathname.startsWith(`/${DEFAULT_LOCALE}/`)
      ? pathname.slice(DEFAULT_LOCALE.length + 1)
      : pathname;

/** The pathname with its locale prefix taken off ("/en/products/domus" -> "/products/domus") */
export const stripLocale = (pathname: string) => splitLocale(pathname).path;

/** The same page in another locale: swaps the prefix of a pathname and keeps the search and the hash as they are */
export function switchLocale(
  target: Locale,
  location: { pathname: string; search?: string; hash?: string },
): string {
  const { path } = splitLocale(location.pathname);
  const base = localizePath(target, path);
  return `${base}${location.search ?? ""}${location.hash ?? ""}`;
}
