import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { headers } from "next/headers";
import { LangProvider } from "@/components/LangProvider";
import { ClientChrome } from "@/components/ClientChrome";
import { WELABS_ICONS } from "@/lib/welabs-icons";
// Welabs 1.2.1 package tokens (--wl-*), loaded before the site layers that map them
import "./brand/welabs.css";
import "./globals.css";
import "./redesign.css";

// TIPOGRAFIA
// One sober sans for UI, body and headings; a mono only for indexes, labels and metadata.
// The sans is Inter, the only text face of the Welabs 1.2.1 brand (the Ibrand lives in the logos).
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-face",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-face",
  display: "swap",
});

// MARCA NO NAVEGADOR
// Amber brand: graphite browser chrome and the official favicon (amber "w" on a graphite tile);
// this was the /welabs section layout until the site became its own on 2026-10-07.
// themeColor mirrors --wl-graphite: metadata cannot read CSS variables.
export const viewport: Viewport = {
  themeColor: "#10141C",
  colorScheme: "dark",
};
export const metadata: Metadata = {
  title: "Welabs",
  description: "Empresa e produtos Welabs.",
  metadataBase: new URL("http://localhost:3000"),
  robots: { index: false, follow: false },
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang =
    (await headers()).get("x-portfolio-language") === "en" ? "en" : "pt";
  return (
    // The inline script marks JS before first paint so reveal states never hide content without JS.
    // data-theme="dark" sits on <html>: the package's dark tokens only apply on the root element.
    <html
      lang={lang === "en" ? "en" : "pt-BR"}
      data-theme="dark"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="dark-theme">
        <LangProvider initialLang={lang}>
          <ClientChrome>{children}</ClientChrome>
        </LangProvider>
      </body>
    </html>
  );
}
