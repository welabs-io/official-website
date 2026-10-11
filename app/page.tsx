import type { Metadata } from "next";
import { CompleteHome } from "@/components/site/CompleteHome";

export const metadata: Metadata = {
  title: "Welabs",
  description:
    "Gestão e relacionamento no núcleo da empresa, com workflows, canais e conhecimento para toda a operação. Conheça os produtos Welabs.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CompleteHome />;
}
