import type { Metadata } from "next";
import { SiteTemplate } from "@/components/template/SiteTemplate";
import { HOME_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Welabs",
  description: "Domus, Relloo, Magneto, Tuner e Knowly.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SiteTemplate config={HOME_CONFIG} />;
}
