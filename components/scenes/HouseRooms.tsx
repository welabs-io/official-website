// CASA DO DOMUS COM OS CÔMODOS
// The house: a roof, a body and eight rooms in two columns, each room an icon in a tonal box beside its name and what it
// holds. Rooms come
// in staggered (`enter`), some become the room "of the moment" with a pale amber fill and a 3 px amber bar (`lit`,
// staggered in the order given) and one can swap its name for a two-line result with a success edge (`result`).
import type { Act, ActProps } from "@/lib/scenes/types";
import { Glyph, GLYPHS, ROOM_GLYPHS } from "./icons";
import styles from "./scenes.module.css";

export type RoomResult = {
  room: string;
  // Two lines that replace the name of the room: what it holds now and its state
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
  metas,
}: {
  act: Act;
  rooms: readonly string[];
  // What each room holds, under its name
  metas?: Readonly<Record<string, string>>;
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
        // The three lit rooms share the first part of the action, the card takes the rest
        length: 0.3,
      });
    if (enter) return act(enter, "pop", { index, count: rooms.length });
    return {};
  };
  return (
    <div className={styles.house}>
      <svg
        className={styles.roof}
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        {...(enter ? act(enter, "in", { length: 0.4 }) : {})}
      >
        <polyline points="0.5,19.5 50,1 99.5,19.5" />
      </svg>
      <ul className={styles.rooms}>
        {rooms.map((name, i) => {
          const done = result && result.room === name;
          const isLit = lit.includes(name);
          return (
            <li
              key={name}
              className={`${styles.room} ${isLit ? styles.roomLit : ""}`}
              data-room={name}
              data-edge=""
              data-lit={isLit ? "" : undefined}
              {...props(name, i)}
            >
              <span className={styles.roomIcon}>
                <Glyph d={ROOM_GLYPHS[name]} size={16} />
              </span>
              {done ? (
                <>
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
                    >
                      <b>{result.lines[0]}</b>
                      <em>{result.lines[1]}</em>
                    </span>
                  </span>
                  {/* The success edge and seal of the room that received the result */}
                  <i
                    className={styles.roomDone}
                    aria-hidden="true"
                    {...act(result.action, "in", {
                      offset: 0.15,
                      length: 0.25,
                    })}
                  >
                    <Glyph d={GLYPHS.check} size={10} />
                  </i>
                </>
              ) : (
                <span className={styles.roomName}>
                  <span className={styles.roomNew}>
                    <b>{name}</b>
                    {metas?.[name] ? <span>{metas[name]}</span> : null}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
