import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sections } from "@/components/template/SiteTemplate";
import { PRODUCTS, productBySlug } from "@/lib/products";
import { productConfig } from "@/lib/site-config";
import { WELABS_ICONS } from "@/lib/welabs-icons";

// PÁGINA DE PRODUTO
// One template for the five products (see SiteTemplate): opening, connectors, call to action and the door to the next
// product, drawn in the slot of the one-page layout (app/(site)/layout.tsx), under the head of the home. Slugs
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
  // The product is the slot of the one-page layout, right under the products band of the home. On a direct visit the
  // inline script puts its top at the top of the window before the first paint (it runs once, while the HTML is parsed;
  // a client navigation inserts it without running it, and components/onepage/Descent.tsx moves the page there)
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: LAND }} />
      <Sections config={productConfig(product.slug)} />
    </>
  );
}

const LAND = `history.scrollRestoration="manual";(function(){var s=document.querySelector("[data-descent-slot]");if(s)scrollTo(0,s.getBoundingClientRect().top+scrollY)})()`;
