import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

import { LOCALES, isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The picture draws only the logo and the product names (brands), so it is the same in every locale; what changes is its
// alternative text, which is why the metadata is generated per locale (the segment value picks the dictionary). `params`
// may arrive as a promise or as the plain object depending on the Next entry, so it is awaited either way.
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await params;
  return [
    {
      id: "og",
      size,
      contentType,
      alt: getMessages(isLocale(locale) ? locale : LOCALES[0]).meta.ogAlt,
    },
  ];
}

// IMAGEM DE COMPARTILHAMENTO DA WELABS
// Amber brand on graphite: the outline logo replaces the typed name, the product names follow and an amber rule closes.
const logo = `data:image/svg+xml;base64,${readFileSync(path.join(process.cwd(), "public/brands/welabs/welabs-logo-dark.svg")).toString("base64")}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#10141C",
          color: "#FAF5EA",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logo} width={204} height={48} alt="Welabs" />
        {/* No brand slogan on the site: the product names are the only text */}
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-2px",
          }}
        >
          Domus • Relloo • Magneto • Tuner • Knowly
        </div>
        <div
          style={{
            display: "flex",
            width: 120,
            height: 6,
            background: "#FFB020",
          }}
        />
      </div>
    ),
    size,
  );
}
