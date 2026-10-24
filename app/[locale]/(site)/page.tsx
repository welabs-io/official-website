import type { Metadata } from "next";
import { Sections } from "@/components/template/SiteTemplate";
import { HOME_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Welabs",
  description: "Domus, Relloo, Magneto, Tuner e Knowly.",
  robots: { index: false, follow: false },
};

// HOME
// The whole home in the slot of the site frame (app/(site)/layout.tsx)
export default function Page() {
  return <Sections config={HOME_CONFIG} />;
}
