import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/site/ProductDetail";
import { SiteFrame } from "@/components/site/SiteFrame";
import { PRODUCT_DETAILS } from "@/lib/product-details";
import { PRODUCTS, productBySlug } from "@/lib/products";
import { WELABS_ICONS } from "@/lib/welabs-icons";

// PÁGINA DE PRODUTO
// The full detail template exposes public capabilities, complete demonstrations and product-aware contact.
// Existing public slugs and build-time 404 handling remain shared with the product catalog.
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
    description: `${product.category} da Welabs. ${PRODUCT_DETAILS[product.slug].benefits.join(" ")}`,
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
  return (
    <SiteFrame>
      <ProductDetail slug={product.slug} />
    </SiteFrame>
  );
}
