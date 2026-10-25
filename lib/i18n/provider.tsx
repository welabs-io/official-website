"use client";
// PROVEDOR DE IDIOMA PARA OS COMPONENTES DE CLIENTE
// The page of a locale hands its locale and its dictionary to the client once, here; a client component reads them with
// `useI18n`. There is no default value on purpose: a client piece rendered without the provider fails loudly instead of
// quietly speaking Portuguese (the tests wrap what they render in it).
import { createContext, use, useMemo, type ReactNode } from "react";
import { localizePath, type Locale } from "./config";
import type { I18n } from "./i18n";
import type { Messages } from "./types";

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale, m: messages }), [locale, messages]);
  return <I18nContext value={value}>{children}</I18nContext>;
}

/** The locale and the dictionary of the page */
export function useI18n(): I18n {
  const value = use(I18nContext);
  if (!value) throw new Error("useI18n must be called inside <I18nProvider>");
  return value;
}

/** The dictionary of the page */
export const useMessages = (): Messages => useI18n().m;

/** The address of a site path in the locale of the page: `useHref()("/products/domus")` */
export function useHref(): (path: string) => string {
  const { locale } = useI18n();
  return (path) => localizePath(locale, path);
}
