// CASA DO DOMUS COM OS CÔMODOS
// The house: a roof, a body and eight rooms in two columns. Rooms come in staggered (`enter`), some light up with a
// 4 px amber bar (`lit`, staggered in the order given) and one can swap its name for a two-line result (`result`).
import { ICON_STROKE } from "@/lib/icon-stroke";
import type { Act, ActProps } from "@/lib/scenes/types";
import styles from "./scenes.module.css";

// Line glyphs of the rooms on a 24 px grid (the ones of the piece welabs-chain-detail-s1)
const GLYPHS: Record<string, string> = {
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

export type RoomResult = {
  room: string;
  // Two lines that replace the name of the room
  lines: readonly [string, string];
  action: string;
};

export function HouseRooms({
  act,
  rooms,
  enter,
  lit = [],
  litAction,
  result,
}: {
  act: Act;
  rooms: readonly string[];
  // Action that brings the rooms in, one after the other (scene 0). Without it the house is simply there.
  enter?: string;
  // Rooms that light up, in order, with the action that does it
  lit?: readonly string[];
  litAction?: string;
  result?: RoomResult;
}) {
  const props = (name: string, index: number): Partial<ActProps> => {
    if (litAction && lit.includes(name))
      return act(litAction, "light", {
        index: lit.indexOf(name),
        count: lit.length,
        // The result of the room waits for its pulse: the three lit rooms share the first part of the action
        length: 0.3,
      });
    if (enter) return act(enter, "pop", { index, count: rooms.length });
    return {};
  };
  return (
    <div className={styles.house}>
      <svg
        className={styles.roof}
        viewBox="0 0 100 18"
        preserveAspectRatio="none"
        aria-hidden="true"
        {...(enter ? act(enter, "in", { length: 0.4 }) : {})}
      >
        <polyline points="2,17 50,2 98,17" />
      </svg>
      <ul className={styles.rooms}>
        {rooms.map((name, i) => {
          const done = result && result.room === name;
          const glyph = GLYPHS[name];
          return (
            <li
              key={name}
              className={`${styles.room} ${lit.includes(name) ? styles.roomLit : ""}`}
              data-room={name}
              {...props(name, i)}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth={ICON_STROKE}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={glyph} />
              </svg>
              {done ? (
                <span className={styles.roomName}>
                  {/* The name leaves and the two lines of the result take its place */}
                  <span
                    className={styles.roomOld}
                    {...act(result.action, "out", { length: 0.15 })}
                  >
                    {name}
                  </span>
                  <span
                    className={styles.roomNew}
                    {...act(result.action, "in", {
                      offset: 0.15,
                      length: 0.25,
                    })}
                    data-focal=""
                  >
                    <b>{result.lines[0]}</b>
                    <b>{result.lines[1]}</b>
                  </span>
                </span>
              ) : (
                <span className={styles.roomName}>{name}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
