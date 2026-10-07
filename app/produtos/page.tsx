import type { Metadata } from "next";
import { PortfolioIndex } from "@/components/InstitutionalSite";
const copy = {
  pt: [
    "Nossos produtos | Welabs",
    "Domus, Magneto, Knowly, Relloo, Tuner e Ecossistema Monitoramento: gestão, automação, conhecimento, relacionamento, canais e segurança.",
  ],
  en: [
    "Our products | Welabs",
    "Domus, Magneto, Knowly, Relloo, Tuner and Monitoring Ecosystem: management, automation, knowledge, relationships, channels and security.",
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
