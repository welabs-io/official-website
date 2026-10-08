import type { Metadata } from "next";
import { PortfolioIndex } from "@/components/InstitutionalSite";
const copy = {
  pt: [
    "Nossos produtos | Welabs",
    "O Domus define o negócio. O Relloo atende, o Magneto é o workflow, o Tuner entrega e o Knowly explica.",
  ],
  en: [
    "Our products | Welabs",
    "Domus defines the business. Relloo serves, Magneto is the workflow, Tuner delivers and Knowly explains.",
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
