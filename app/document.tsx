// DOCUMENTO HTML DO SITE
// The <html> shell shared by the two root layouts: the site by locale (app/[locale]/layout.tsx) and the lab
// (app/lab/layout.tsx, outside the i18n, always pt-BR). It owns the stylesheets, the font preload, the skip link, the
// main landmark and the provider that hands the locale and its dictionary to the client pieces.
import type { ReactNode } from "react";
import { getI18n } from "@/lib/i18n/i18n";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/provider";
// Welabs package tokens (--wl-*)
import "./brand/welabs.css";
// The theme of @imagineapps-team/react (Tailwind 4 and the welabs preset), before the site's own sheets
import "./lib.css";
import "./globals.css";

export function Document({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const { m } = getI18n(locale);
  // data-theme="light" sits on <html>: it pins the package's light tokens against the system dark preference. There is
  // no smooth scroll on the page (see app/globals.css): every jump, route change and back or forward is instant
  return (
    <html lang={HTML_LANG[locale]} data-theme="light">
      <head>
        {/* Inter is the only text face of the brand (the Ibrand lives in the logos); see app/globals.css */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/Inter-latin.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          {m.common.skipLink}
        </a>
        <I18nProvider locale={locale} messages={m}>
          <main id="main-content">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
