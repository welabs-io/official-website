import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sections } from "@/components/template/SiteTemplate";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/alternates";
import { fmt } from "@/lib/i18n/format";
import { getI18n } from "@/lib/i18n/i18n";
import { PRODUCTS, productBySlug } from "@/lib/products";
import { productConfig } from "@/lib/site-config";
import { WELABS_ICONS } from "@/lib/welabs-icons";

// PÁGINA DE PRODUTO
// One template for the five products (see SiteTemplate): the opening with the carousel of the product, the product
// among the others, its details and its contact, drawn in the slot of the site frame (app/[locale]/(site)/layout.tsx).
// Slugs are the current public ones and never translated; older slugs and ids are redirected by next.config.mjs. Any
// other slug is a 404 that is decided at build time (dynamicParams off), so no unknown page is ever rendered on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    PRODUCTS.map(({ slug }) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return { title: "Welabs" };
  const { m } = getI18n(locale);
  const product = productBySlug(slug);
  if (!product) return { title: m.meta.title };
  const copy = m.products[product.slug];
  return {
    // The category term (ERP, CRM...) lives in the description and keywords only, never in the visible text or the title
    title: fmt(m.meta.productTitle, { name: product.name }),
    description: fmt(m.meta.productDescription, {
      category: copy.category,
      line: copy.line,
    }),
    keywords: [...copy.keywords],
    robots: { index: false, follow: false },
    icons: WELABS_ICONS,
    alternates: localeAlternates(locale, `/products/${product.slug}`),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = productBySlug(slug);
  if (!product) notFound();
  // v3 (2026-10-21): the product is a page of its own, at the top of the window, with no part of the home above it
  return (
    <Sections config={productConfig(product.slug)} i18n={getI18n(locale)} />
  );
}
