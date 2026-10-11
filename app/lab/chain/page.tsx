import type { Metadata } from "next";
import { RingStage } from "@/components/ring/RingStage";

// BANCADA DA CADEIA
// Workbench route for the chain montage alone, full screen. No index, not in the sitemap, linked from nowhere.
export const metadata: Metadata = {
  title: "Welabs",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main id="main-content">
      <RingStage
        id="lab-chain"
        kind="chain"
        logos="lit"
        fullscreen
        eager
        label="Cortes dos filmes dos produtos"
      />
    </main>
  );
}
