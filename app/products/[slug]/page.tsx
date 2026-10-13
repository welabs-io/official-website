import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteTemplate } from "@/components/template/SiteTemplate";
import { PRODUCTS, productBySlug } from "@/lib/products";
import { productConfig } from "@/lib/site-config";
import { WELABS_ICONS } from "@/lib/welabs-icons";

// PÁGINA DE PRODUTO
// One template for the five products (see SiteTemplate): opening, connectors, other products, call to action. Slugs
// are the current public ones; older slugs and ids are redirected by next.config.mjs. Any other slug is a 404 that
// is decided at build time (dynamicParams off), so no unknown page is ever rendered on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  if (!product) return { title: "Welabs" };
  return {
    // The category term (ERP, CRM...) lives in the description and keywords only, never in the visible text or the title
    title: `${product.name} by Welabs`,
    description: `${product.category} da Welabs. ${product.line}.`,
    keywords: [...product.keywords],
    robots: { index: false, follow: false },
    icons: WELABS_ICONS,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  return <SiteTemplate config={productConfig(product.slug)} />;
}
