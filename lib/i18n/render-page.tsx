// RENDERIZAÇÃO DE PÁGINA PARA OS TESTES
// Renders the sections of a page (and, with `frame`, the header and the footer around them) to static HTML in a locale,
// the way the server first paints it: the client pieces get the provider the root layout gives them.
import { renderToStaticMarkup } from "react-dom/server";
import { PageFrame } from "@/components/onepage/PageFrame";
import { Sections } from "@/components/template/SiteTemplate";
import type { PageConfig } from "@/lib/site-config";
import type { Locale } from "./config";
import { getI18n } from "./i18n";
import { I18nProvider } from "./provider";

export function renderPage(
  config: PageConfig,
  {
    locale = "pt-BR",
    frame = false,
  }: { locale?: Locale; frame?: boolean } = {},
) {
  const i18n = getI18n(locale);
  const sections = <Sections config={config} i18n={i18n} />;
  return renderToStaticMarkup(
    <I18nProvider locale={locale} messages={i18n.m}>
      {frame ? <PageFrame i18n={i18n}>{sections}</PageFrame> : sections}
    </I18nProvider>,
  );
}
