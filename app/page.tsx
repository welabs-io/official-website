import type { Metadata } from "next";
import { WelabsHome } from "@/components/InstitutionalSite";
const copy = {
  pt: [
    "Empresa e produtos | Welabs",
    "Criamos produtos próprios para gestão, conhecimento, relacionamento e automação.",
  ],
  en: [
    "Company and products | Welabs",
    "We build our own products for management, knowledge, relationships and automation.",
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
  return <WelabsHome />;
}
