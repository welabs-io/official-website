// ÍCONES DAS CAPACIDADES
// Small line glyphs on a 24 px grid, drawn in the colour of the text (never amber: amber is an area only). Server
// markup, decorative: the capability text next to each one carries the meaning.
import type { IconName } from "@/lib/content/types";

const PATHS: Record<IconName, string> = {
  bank: "M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18",
  screen: "M3 5h18v14H3zM3 10h18M9 10v9",
  flow: "M5 5h4v4H5zM15 15h4v4h-4zM9 7h4a2 2 0 012 2v6",
  contract: "M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6",
  people:
    "M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a2.5 2.5 0 100-5M18 14c2.2.4 3.5 2.4 3.5 5",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  history: "M12 7v5l3 2M4 12a8 8 0 108-8 8 8 0 00-6 2.7M4 4v4h4",
  funnel: "M4 5h16l-6 8v6l-4-2v-4z",
  megaphone: "M4 10v4h3l8 4V6L7 10zM18 9a4 4 0 010 6",
  cash: "M3 7h18v10H3zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5M6 12h.01M18 12h.01",
  bot: "M6 8h12v10H6zM12 4v4M9.5 13h.01M14.5 13h.01M9 16h6",
  blocks: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM15.5 16.5h3M17 15v3",
  wand: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16v4M17 18h4",
  approval: "M12 21a9 9 0 100-18 9 9 0 000 18zM8 12l3 3 5-6",
  versions: "M8 8h12v12H8zM4 16V4h12",
  undo: "M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3",
  log: "M5 6h14M5 12h14M5 18h9",
  chat: "M4 5h16v11H9l-5 4z",
  phone:
    "M6 3h4l2 5-2.5 1.5a11 11 0 005 5L16 12l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 013-2z",
  globe:
    "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  pin: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z",
  transfer: "M4 8h14l-4-4M20 16H6l4 4",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  folder: "M3 7h6l2 2h10v10H3z",
  lock: "M6 11h12v9H6zM8 11V8a4 4 0 018 0v3",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  refresh: "M20 11a8 8 0 00-14-4M4 4v4h4M4 13a8 8 0 0014 4M20 20v-4h-4",
  question: "M4 5h16v11H9l-5 4zM10 9a2 2 0 114 0c0 1.5-2 1.5-2 3M12 14h.01",
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
