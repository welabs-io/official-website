import type { Metadata } from "next";
import { OnePage } from "@/components/onepage/OnePage";

// PRÉVIA DA PÁGINA ÚNICA
// Preview route: no menu link, not in the sitemap, noindex.
export const metadata: Metadata = {
  title: "Welabs | Ideias que viram ferramentas de trabalho",
  description:
    "Domus, Relloo, Magneto, Tuner e Knowly: produtos próprios que se encaixam num só fluxo.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OnePage />;
}
