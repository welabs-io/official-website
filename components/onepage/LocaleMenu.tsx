"use client";
// SELETOR DE IDIOMA
// The language selector of the header: the lib's Menu (a radio group of the three languages) opened by a 40 px outline
// button with the Languages icon and the code of the current language, in the pattern of the other controls of the
// header. Choosing a language goes to the same page in it, keeping the search and the hash; it is a plain navigation
// (no link, so the move of the descent never takes it over and no brand opening plays), which also reloads the document
// with its own <html lang>. There is no automatic detection and no redirect by Accept-Language: only this selector
// changes the language.
import { Languages } from "lucide-react";
import { ActionButton, Menu } from "@/components/lib/ui";
import {
  HTML_LANG,
  LOCALES,
  LOCALE_NAMES,
  isLocale,
  switchLocale,
} from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

export function LocaleMenu() {
  const { locale, m } = useI18n();
  const go = (value: string) => {
    if (!isLocale(value) || value === locale) return;
    window.location.assign(switchLocale(value, window.location));
  };
  return (
    <Menu
      align="end"
      trigger={
        <ActionButton
          emphasis="outline"
          size="md"
          icon={<Languages />}
          data-theme="welabs"
          data-locale-trigger=""
          aria-label={`${LOCALE_NAMES[locale].code}, ${m.language.label}`}
        >
          {LOCALE_NAMES[locale].code}
        </ActionButton>
      }
      sections={[
        {
          label: m.language.label,
          items: [
            {
              kind: "radio-group",
              value: locale,
              onValueChange: go,
              options: LOCALES.map((value) => ({
                value,
                // A language is named in itself, in its own tongue
                label: (
                  <span lang={HTML_LANG[value]}>
                    {LOCALE_NAMES[value].name}
                  </span>
                ),
              })),
            },
          ],
        },
      ]}
    />
  );
}
