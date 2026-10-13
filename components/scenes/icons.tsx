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
  // Glyphs of the capability scenes of the product pages
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  pin: "M12 21s-6-5.4-6-10.5a6 6 0 0 1 12 0C18 15.6 12 21 12 21zM12 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  image: "M4 5h16v14H4zM4 15l4.5-4.5 4 4L15 12l5 5M15.5 8.5h.01",
  bot: "M6 9h12v9H6zM12 5v4M9.5 13h.01M14.5 13h.01M9 18v2M15 18v2",
  bank: "M3 9l9-5 9 5M5 9v8M9.5 9v8M14.5 9v8M19 9v8M3 20h18",
  pen: "M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3",
  plus: "M12 5v14M5 12h14",
  globe:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.5 5.6 3.5 9s-1 6.4-3.5 9c-2.5-2.6-3.5-5.6-3.5-9s1-6.4 3.5-9z",
  team: "M9 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.2 3.2 0 0 1 0 6.3M18 14.3c2 .8 3.5 2.8 3.5 5.7",
  bolt: "M13 3L5 13h6l-1 8 8-10h-6l1-8z",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0",
  tag: "M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01",
  refresh:
    "M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
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
