import type { Metadata } from "next";

// FAVICON DA SEÇÃO WELABS
// Official brand favicon: amber "we" on a graphite tile (brand/welabs-produtos/vector/app-icons/favicon/welabs.*).
// SVG first for modern browsers; PNG sizes and ICO as fallbacks.
export const WELABS_ICONS: Metadata["icons"] = {
  icon: [
    { url: "/brands/welabs/welabs-favicon.svg", type: "image/svg+xml" },
    {
      url: "/brands/welabs/welabs-favicon-48.png",
      sizes: "48x48",
      type: "image/png",
    },
    {
      url: "/brands/welabs/welabs-favicon-32.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      url: "/brands/welabs/welabs-favicon-16.png",
      sizes: "16x16",
      type: "image/png",
    },
  ],
  shortcut: "/brands/welabs/welabs-favicon.ico",
};
