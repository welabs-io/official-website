import type { Metadata, Viewport } from "next";
// Amber brand: graphite browser chrome and the amber "we" favicon.
export const viewport: Viewport = { themeColor: "#10141C" };
export const metadata: Metadata = {
  title: "Welabs",
  description: "Empresa e produtos Welabs.",
  icons: { icon: "/brands/welabs/welabs-favicon.svg" },
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
