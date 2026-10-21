import type { Metadata, Viewport } from "next";
import { WELABS_ICONS } from "@/lib/welabs-icons";
// Welabs package tokens (--wl-*)
import "./brand/welabs.css";
// The theme of @imagineapps-team/react (Tailwind 4 and the welabs preset), before the site's own sheets
import "./lib.css";
import "./globals.css";

// MARCA NO NAVEGADOR
// Cream browser chrome (the light theme of the brand) and the official favicon; themeColor mirrors --wl-cream (metadata
// cannot read CSS variables).
export const viewport: Viewport = {
  themeColor: "#FFFDF8",
  colorScheme: "light",
};
export const metadata: Metadata = {
  title: "Welabs",
  description: "Produtos próprios de software.",
  metadataBase: new URL("http://localhost:3000"),
  robots: { index: false, follow: false },
  icons: WELABS_ICONS,
  authors: [{ name: "Welabs" }],
  openGraph: {
    type: "website",
    siteName: "Welabs",
    title: "Welabs",
    description: "Produtos próprios de software.",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // data-theme="light" sits on <html>: it pins the package's light tokens against the system dark preference. There is
  // no smooth scroll on the page (see app/globals.css): every jump, route change and back or forward is instant
  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        {/* Inter is the only text face of the brand (the Ibrand lives in the logos); see app/globals.css */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/Inter-latin.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Ir para o conteúdo
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
