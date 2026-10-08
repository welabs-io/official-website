import type { Metadata } from "next";
import { PortfolioIndex } from "@/components/InstitutionalSite";
const copy = {
  pt: [
    "Nossos produtos | Welabs",
    "O Domus define o negócio. O Magneto executa, o Relloo atende, o Knowly explica e o Tuner entrega.",
  ],
  en: [
    "Our products | Welabs",
    "Domus defines the business. Magneto runs it, Relloo serves, Knowly explains and Tuner delivers.",
  ],
};
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const en = (await searchParams).lang === "en";
  const [title, description] = copy[en ? "en" : "pt"];
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: "Welabs",
      title,
      description,
      locale: en ? "en_US" : "pt_BR",
    },
  };
}
export default function Page() {
  return <PortfolioIndex />;
}
