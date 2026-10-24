import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sections } from "@/components/template/SiteTemplate";
import { isLocale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/alternates";
import { getI18n } from "@/lib/i18n/i18n";
import { HOME_CONFIG } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getI18n(locale).m;
  return {
    title: meta.title,
    description: meta.homeDescription,
    robots: { index: false, follow: false },
    alternates: localeAlternates(locale, "/"),
  };
}

// HOME
// The whole home in the slot of the site frame (app/[locale]/(site)/layout.tsx), in the locale of the segment
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Sections config={HOME_CONFIG} i18n={getI18n(locale)} />;
}
