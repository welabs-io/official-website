import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { WELABS_ICONS } from "@/lib/welabs-icons";
// Welabs package tokens (--wl-*)
import "./brand/welabs.css";
import "./globals.css";

// TIPOGRAFIA
// Inter is the only text face of the Welabs brand (the Ibrand lives in the logos).
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-face",
  display: "swap",
});

// MARCA NO NAVEGADOR
// Graphite browser chrome and the official favicon; themeColor mirrors --wl-graphite (metadata cannot read CSS variables).
export const viewport: Viewport = {
  themeColor: "#10141C",
  colorScheme: "dark",
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
  // data-theme="dark" sits on <html>: the package's dark tokens only apply on the root element
  return (
    <html lang="pt-BR" data-theme="dark" className={sans.variable}>
      <body>
        <a className="skip-link" href="#main-content">
          Ir para o conteúdo
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
