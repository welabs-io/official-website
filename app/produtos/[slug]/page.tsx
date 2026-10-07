import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { isHiddenProduct } from "@/lib/catalog";
import { ProductPage, MotionProductPage } from "@/components/InstitutionalSite";
import {
  getFramepack,
  framepackIds,
  publicPoster,
} from "@/lib/framepacks.server";
import { idFromSlug, publicSlug, retiredSlug } from "@/lib/public-slugs";
import motionProducts from "@/lib/motion-products.json";
import { WELABS_ICONS } from "@/lib/welabs-icons";
// PÁGINA DE PRODUTO
// Public slugs replace internal ids in URLs; the old id redirects to the public slug.
// Film-only products (Tuner) share this route with the catalog products; they are found by
// public slug too, so their internal id only redirects. Was /welabs/produtos/<slug> until 2026-10-07.
const motionProduct = (slug: string) =>
  motionProducts.find((p) => p.id === idFromSlug(slug));
export function generateStaticParams() {
  return [
    ...framepackIds().map(({ slug }) => ({ slug: publicSlug(slug) })),
    ...motionProducts.map((p) => ({ slug: publicSlug(p.id) })),
  ];
}
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = motionProduct(slug);
  if (m) {
    const en = (await searchParams).lang === "en";
    return {
      title: `${m.title} | Welabs`,
      description: m.summary[en ? 1 : 0],
      robots: { index: false, follow: false },
      icons: WELABS_ICONS,
    };
  }
  const p = getFramepack(idFromSlug(slug));
  if (!p) return { title: "Produto indisponível" };
  const en = (await searchParams).lang === "en";
  const d = p.item.locales[en ? "en" : "pt-BR"];
  return {
    title: `${d.title} | ${p.item.publisher}`,
    description: d.summary,
    robots: { index: false, follow: false },
    icons: WELABS_ICONS,
    openGraph: {
      type: "website",
      siteName: p.item.publisher,
      title: d.title,
      description: d.summary,
      locale: en ? "en_US" : "pt_BR",
      images: [{ url: publicPoster(p.item.id), alt: d.title }],
    },
    authors: [{ name: p.item.publisher }],
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const moved = retiredSlug(slug);
  if (moved) permanentRedirect(`/produtos/${moved}`);
  // A product hidden for now (lib/catalog.ts) sends its address to the collection; temporary, it may return
  if (isHiddenProduct(idFromSlug(slug))) redirect("/produtos");
  const m = motionProduct(slug);
  if (m) return <MotionProductPage product={m} />;
  const p = getFramepack(idFromSlug(slug));
  if (!p) notFound();
  return <ProductPage item={p.item} />;
}
