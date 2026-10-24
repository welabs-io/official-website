// CONTEXTO DE IDIOMA PARA O SERVIDOR
// What a component needs to write a page in a locale: the locale itself and its dictionary. Server components receive it
// as a prop (they cannot read a React context); client components read the same object from the provider
// (lib/i18n/provider.tsx). Server-safe: plain data.
import { localizePath, type Locale } from "./config";
import { getMessages } from "./messages";
import type { Messages } from "./types";

export type I18n = { locale: Locale; m: Messages };

export const getI18n = (locale: Locale): I18n => ({
  locale,
  m: getMessages(locale),
});

/** The address of a site path ("/", "/products/domus", "/#contact") in the locale of the page */
export const href = (i18n: I18n, path: string) =>
  localizePath(i18n.locale, path);
