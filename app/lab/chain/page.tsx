import type { Metadata } from "next";
import { ChainSequence } from "@/components/lab/ChainSequence";

// BANCADA DA CADEIA
// Workbench route for the chain montage alone. No index, not in the sitemap, linked from nowhere.
export const metadata: Metadata = {
  title: "Welabs",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ChainSequence />;
}
