// TELEFONE COM CONVERSA
// Marina's phone with the chat of the business: a header with the contact and the channel, and the conversation anchored
// at the bottom like a messaging app (a day stamp, the call as a system line, bubbles with their time and ticks). An
// item with an `action` comes in with that action of the script; one without it is simply there (history). The typing
// dots come before a bubble that has `typing`; `readAction` turns the ticks of a bubble to the read colour. Server
// markup, no state.
import type { ReactNode } from "react";
import type { Act, ActProps } from "@/lib/scenes/types";
import { Glyph, GLYPHS, TICK_DOUBLE } from "./icons";
import styles from "./scenes.module.css";

export type ChatItem =
  | { kind: "day"; text: string }
  | { kind: "call"; text: string; time: string; action?: string }
  | {
      kind: "bubble";
      side: "in" | "out";
      text: string;
      time: string;
      action?: string;
      // Seconds of typing dots before the bubble takes their place
      typing?: number;
      ticks?: boolean;
      // Action that turns the ticks to "read"
      readAction?: string;
    };

const maybe = (
  act: Act,
  action: string | undefined,
  fx: "in" | "pop" | "blink",
  options?: Parameters<Act>[2],
): Partial<ActProps> => (action ? act(action, fx, options) : {});

export function ChatPhone({
  act,
  contact,
  channel,
  items,
  children,
}: {
  act: Act;
  // The contact at the top of the chat
  contact: string;
  channel: string;
  items: readonly ChatItem[];
  // Overlay on the screen (the notification)
  children?: ReactNode;
}) {
  return (
    <div className={styles.phone} data-edge="">
      <div className={styles.phoneHead}>
        <span
          className={styles.avatarSm}
          data-tone="contact"
          aria-hidden="true"
        >
          <Glyph d={GLYPHS.bag} size={14} />
        </span>
        <span className={styles.who}>
          <b>{contact}</b>
          <span>
            <i className={styles.dot} data-tone="ok" />
            {channel}
          </span>
        </span>
      </div>
      <div className={styles.chat}>
        {items.map((item, i) => {
          if (item.kind === "day")
            return (
              <p key={i} className={styles.day}>
                {item.text}
              </p>
            );
          if (item.kind === "call")
            return (
              <p
                key={i}
                className={styles.sysLine}
                {...maybe(act, item.action, "in")}
              >
                <Glyph d={GLYPHS.phone} size={12} />
                <span>{item.text}</span>
                <time>{item.time}</time>
              </p>
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
                className={`${styles.bubble} ${item.side === "out" ? styles.bubbleOut : styles.bubbleIn}`}
                {...maybe(act, item.action, "pop", { offset: delay })}
              >
                <span>{item.text}</span>
                <span className={styles.stamp}>
                  <time>{item.time}</time>
                  {item.ticks ? (
                    <span className={styles.ticks} aria-hidden="true">
                      <Glyph d={TICK_DOUBLE} size={14} />
                      {item.readAction ? (
                        <span
                          className={styles.ticksRead}
                          {...act(item.readAction, "in")}
                        >
                          <Glyph d={TICK_DOUBLE} size={14} />
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </span>
              </p>
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}
