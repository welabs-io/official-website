import type { Metadata } from "next";
import { OnePage } from "@/components/onepage/OnePage";

export const metadata: Metadata = {
  title: "Welabs",
  description: "Domus, Relloo, Magneto, Tuner e Knowly.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OnePage />;
}
