import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductPage, MotionProductPage } from "@/components/InstitutionalSite";
import {
  getFramepack,
  framepackIds,
  publicPoster,
} from "@/lib/framepacks.server";
import { idFromSlug, publicSlug, retiredSlug } from "@/lib/public-slugs";
import motionProducts from "@/lib/motion-products.json";
import { WELABS_ICONS } from "@/lib/welabs-icons";
// Public slugs replace internal ids in URLs; the old id redirects to the public slug.
// Film-only Welabs products (Tuner) share this route with the presentation pages; they are found by
// public slug too, so their internal id only redirects.
const motionProduct = (slug: string) =>
  motionProducts.find(
    (p) => p.id === idFromSlug(slug) && p.publisher === "Welabs",
  );
export function generateStaticParams() {
  return [
    ...framepackIds("Welabs").map(({ slug }) => ({ slug: publicSlug(slug) })),
    ...motionProducts
      .filter((p) => p.publisher === "Welabs")
      .map((p) => ({ slug: publicSlug(p.id) })),
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
  if (!p || p.item.publisher !== "Welabs")
    return { title: "Apresentação indisponível" };
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
      images: [{ url: publicPoster(p.item.id, d.poster), alt: d.title }],
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
  if (moved) permanentRedirect(`/welabs/produtos/${moved}`);
  const m = motionProduct(slug);
  if (m) return <MotionProductPage product={m} />;
  const p = getFramepack(idFromSlug(slug));
  if (!p || p.item.publisher !== "Welabs") notFound();
  return <ProductPage manifest={p.manifest} item={p.item} />;
}
