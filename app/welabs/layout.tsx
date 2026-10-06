import type { Metadata, Viewport } from "next";
import { WELABS_ICONS } from "@/lib/welabs-icons";
// Amber brand: graphite browser chrome and the official favicon (amber "w" on a graphite tile).
export const viewport: Viewport = { themeColor: "#10141C" };
export const metadata: Metadata = {
  title: "Welabs",
  description: "Empresa e produtos Welabs.",
  icons: WELABS_ICONS,
  authors: [{ name: "Welabs" }],
  openGraph: {
    type: "website",
    siteName: "Welabs",
    title: "Welabs",
    description: "Empresa e produtos Welabs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welabs",
    description: "Empresa e produtos Welabs.",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
