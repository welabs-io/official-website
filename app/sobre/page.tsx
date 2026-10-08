import type { Metadata } from "next";
import { CompanyAbout } from "@/components/InstitutionalSite";
const copy = {
  pt: [
    "Somos a Welabs | Welabs",
    "Uma empresa que desenvolve produtos próprios para conectar operações.",
  ],
  en: [
    "We are Welabs | Welabs",
    "A company building its own products to connect operations.",
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
  return <CompanyAbout />;
}
