// TELEFONE COM CONVERSA
// A phone with a chat: the call row, bubbles that pop in, the typing dots that come before a bubble and the ticks that
// close it. An item with an `action` comes in with that action of the script; one without it is simply there (history).
// Server markup, no state.
import type { ReactNode } from "react";
import type { Act, ActProps } from "@/lib/scenes/types";
import styles from "./scenes.module.css";

export type ChatItem =
  | { kind: "call"; text: string; chip: string; action?: string }
  | {
      kind: "bubble";
      side: "in" | "out";
      text: string;
      action?: string;
      // Seconds of typing dots before the bubble takes their place
      typing?: number;
      ticks?: boolean;
      focal?: boolean;
    };

const still = (
  act: Act,
  action: string | undefined,
  fx: "in" | "pop" | "blink",
  options?: Parameters<Act>[2],
): Partial<ActProps> => (action ? act(action, fx, options) : {});

export function ChatPhone({
  act,
  person,
  channel,
  items,
  children,
}: {
  act: Act;
  person: string;
  channel: string;
  items: readonly ChatItem[];
  // Overlay on the screen (the confirmation toast)
  children?: ReactNode;
}) {
  return (
    <div className={styles.phone}>
      <div className={styles.phoneHead}>
        <span className={styles.avatar} aria-hidden="true">
          {person[0]}
        </span>
        <span>
          <b>{person}</b>
          <i>{channel}</i>
        </span>
      </div>
      <div className={styles.chat}>
        {items.map((item, i) => {
          if (item.kind === "call")
            return (
              <div
                key={i}
                className={styles.call}
                {...still(act, item.action, "in")}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                </svg>
                <span>{item.text}</span>
                <b className={styles.chip}>{item.chip}</b>
              </div>
            );
          const delay = item.typing ?? 0;
          return (
            <div
              key={i}
              className={`${styles.slot} ${item.side === "out" ? styles.slotOut : styles.slotIn}`}
            >
              {item.typing && item.action ? (
                <span
                  className={styles.typing}
                  {...act(item.action, "blink", { length: delay })}
                >
                  <i />
                  <i />
                  <i />
                </span>
              ) : null}
              <p
                className={`${styles.bubble} ${item.side === "out" ? styles.bubbleOut : styles.bubbleIn} ${item.focal ? styles.focal : ""}`}
                data-focal={item.focal ? "" : undefined}
                {...still(act, item.action, "pop", { offset: delay })}
              >
                {item.text}
                {item.ticks ? (
                  <span className={styles.ticks} aria-hidden="true">
                    ✓✓
                  </span>
                ) : null}
              </p>
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}
