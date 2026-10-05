"use client";
import { usePathname } from "next/navigation";
import catalog from "@/lib/presentation-catalog.json";
const IMAGINE = {
  name: "Imagine Apps",
  company: "Imagine",
  logo: "/imagine-logo.svg",
  favicon: "/favicon.png",
  home: "/",
  collection: "/portfolio",
  accent: "#0098DA",
} as const;
// Amber brand: Ibrand outline logo (amber "we", white "labs") for the graphite background.
const WELABS = {
  name: "Welabs",
  company: "Welabs",
  logo: "/brands/welabs/welabs-logo-dark.svg",
  favicon: "/brands/welabs/welabs-favicon.svg",
  home: "/welabs",
  collection: "/welabs/produtos",
  accent: "#FFB020",
} as const;
export function useSiteBrand() {
  const pathname = usePathname();
  const slug = pathname.startsWith("/apresentacoes/")
    ? pathname.slice("/apresentacoes/".length)
    : pathname.startsWith("/portfolio-preview/")
      ? pathname.slice("/portfolio-preview/".length)
      : null;
  return pathname.startsWith("/welabs") ||
    slug === "welabs" ||
    catalog.some((p) => p.id === slug && p.publisher === "Welabs")
    ? WELABS
    : IMAGINE;
}
