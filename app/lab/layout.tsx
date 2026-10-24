import type { Metadata, Viewport } from "next";
import { Document } from "@/app/document";
import { WELABS_ICONS } from "@/lib/welabs-icons";

// LAYOUT RAIZ DO LAB
// /lab/* is outside the i18n: one root layout of its own, always in pt-BR, with the same shell, stylesheets and provider
// as the site (app/document.tsx), so the scenes of the kit render here exactly as on the pages. Never indexed.
export const viewport: Viewport = {
  themeColor: "#FAF5EA",
  colorScheme: "light",
};
export const metadata: Metadata = {
  title: "Welabs",
  metadataBase: new URL("http://localhost:3000"),
  robots: { index: false, follow: false },
  icons: WELABS_ICONS,
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <Document locale="pt-BR">{children}</Document>;
}
