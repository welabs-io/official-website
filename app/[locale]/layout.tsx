import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Document } from "@/app/document";
import { LOCALES, OG_LOCALE, isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { WELABS_ICONS } from "@/lib/welabs-icons";

// MARCA NO NAVEGADOR
// Cream browser chrome (the light theme of the brand) and the official favicon; themeColor mirrors --wl-cream (metadata
// cannot read CSS variables).
export const viewport: Viewport = {
  // v3 (F2): the cream floor of the page (shell.module.css --page, sand-50 of the brand)
  themeColor: "#FAF5EA",
  colorScheme: "light",
};

// IDIOMAS DO SITE
// The root layout of the site is by locale (pt-BR, en, es). Any other value of the segment is a 404 decided at build
// time (dynamicParams off), so no unknown locale is ever rendered on demand. pt-BR has no prefix in the address: the
// rewrites of next.config.mjs serve `/` and `/products/<slug>` from this segment, and `/pt-BR/...` redirects back.
export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getMessages(locale);
  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL("http://localhost:3000"),
    robots: { index: false, follow: false },
    icons: WELABS_ICONS,
    authors: [{ name: "Welabs" }],
    openGraph: {
      type: "website",
      siteName: "Welabs",
      title: meta.title,
      description: meta.description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE[l],
      ),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Document locale={locale}>{children}</Document>;
}
