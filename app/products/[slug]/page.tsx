import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/onepage/PageFrame";
import { ProductPageBody } from "@/components/onepage/ProductPageBody";
import { PRODUCTS, productBySlug } from "@/lib/products";
import { WELABS_ICONS } from "@/lib/welabs-icons";

// PÁGINA DE PRODUTO
// Same language as the home: logo with seal, one factual line and the product's motion in loop. Slugs are the
// current public ones; older slugs and ids are redirected by next.config.mjs.
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
  return (
    <PageFrame>
      <ProductPageBody slug={product.slug} />
    </PageFrame>
  );
}
