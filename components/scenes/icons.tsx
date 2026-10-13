// ÍCONES DAS CENAS
// Line glyphs on a 24 px grid, shared by the scene components (rooms, deal emblems, channels, document). One place, so a
// glyph is never drawn twice with two different strokes. Server markup, no state. The stroke is the site's single
// stroke (lib/icon-stroke.ts); the size is the only thing a caller chooses.
import { ICON_STROKE } from "@/lib/icon-stroke";

// Rooms of the house (the ones of the piece welabs-chain-detail-s1)
export const ROOM_GLYPHS: Record<string, string> = {
  Pessoas: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7",
  Pedidos: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2",
  Atendimento: "M4 5h16v11H9l-5 4V5z",
  Regras:
    "M4 7h10M18 7h2M4 17h2M10 17h10M16 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  Estoque: "M3 8l9-4 9 4v9l-9 4-9-4V8zM3 8l9 4 9-4M12 12v9",
  Entregas:
    "M2 6h12v10H2zM14 10h4l3 3v3h-7M7 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM17 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  Fiscal: "M6 3h9l4 4v14H6V3zM14 3v5h5M9 13h7M9 17h7",
  Financeiro:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M9.5 9.5c0-1 1.2-1.7 2.5-1.7s2.5.7 2.5 1.7-1.2 1.6-2.5 1.9-2.5.9-2.5 2 1.2 1.7 2.5 1.7 2.5-.7 2.5-1.7",
};

export const GLYPHS = {
  phone:
    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  chat: "M4 5h16v11H9l-5 4V5z",
  doc: "M6 3h9l4 4v14H6V3zM14 3v5h5M9 13h7M9 17h5",
  search: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-4.5-4.5",
  check: "M5 12.5l4.5 4.5L19 7",
  rule: "M4 7h10M18 7h2M4 17h2M10 17h10M16 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  send: "M4 12l16-8-6 16-3-7-7-1z",
  user: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  history: "M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 8v4l3 2",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v5M16 3v5",
  truck:
    "M2 6h12v10H2zM14 10h4l3 3v3h-7M7 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM17 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  bag: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2",
  spark:
    "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM8 7h7",
} as const;

export function Glyph({ d, size }: { d: string; size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

// Double check of the "read" tick (two overlapped checks)
export const TICK_DOUBLE = "M2 12.5l4.5 4.5L15 8M10 14.5l2.5 2.5L22 8";
