"use client";
// MARCA DO SITE
// This repository serves only Welabs, now at the root (it was the /welabs section until 2026-10-07).
// Amber brand: Ibrand outline logo (amber "we", white "labs") for the graphite background.
const WELABS = {
  name: "Welabs",
  company: "Welabs",
  logo: "/brands/welabs/welabs-logo-dark.svg",
  favicon: "/brands/welabs/welabs-favicon.svg",
  home: "/",
  collection: "/produtos",
  accent: "#FFB020",
} as const;
export function useSiteBrand() {
  return WELABS;
}
