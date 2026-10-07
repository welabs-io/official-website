import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Welabs — Empresa e produtos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// IMAGEM DE COMPARTILHAMENTO DA WELABS
// Amber brand on graphite: the outline logo replaces the typed name, and amber marks the second line.
const logo = `data:image/svg+xml;base64,${readFileSync(path.join(process.cwd(), "public/brands/welabs/welabs-logo-dark.svg")).toString("base64")}`;

export default function OpenGraphImage() {
  return new ImageResponse(
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: "-3px",
        }}
      >
        <span>CRIAMOS PRODUTOS.</span>
        <span style={{ color: "#FFB020" }}>CONECTAMOS OPERAÇÕES.</span>
      </div>
      <div style={{ display: "flex", color: "#B9B2A3", fontSize: 26 }}>
        Domus • Magneto • Knowly • Relloo • Tuner
      </div>
    </div>,
    size,
  );
}
