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
// Ivory browser chrome follows the marketing surface; product demonstrations keep their graphite stage.
export const viewport: Viewport = {
  themeColor: "#FAF5EA",
  colorScheme: "light",
};
export const metadata: Metadata = {
  title: "Welabs",
  description:
    "Gestão, relacionamento, workflows, canais e conhecimento para a operação da empresa.",
  metadataBase: new URL("https://welabs.io"),
  robots: { index: false, follow: false },
  icons: WELABS_ICONS,
  authors: [{ name: "Welabs" }],
  openGraph: {
    type: "website",
    siteName: "Welabs",
    title: "Welabs",
    description:
      "Gestão, relacionamento, workflows, canais e conhecimento para a operação da empresa.",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The site defaults to the official light palette; dark demonstration surfaces use local tokens.
  return (
    <html lang="pt-BR" data-theme="light" className={sans.variable}>
      <body>
        <a className="skip-link" href="#main-content">
          Ir para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
