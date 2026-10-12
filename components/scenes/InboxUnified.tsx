// CAIXA DE ENTRADA UNIFICADA (TUNER)
// One conversation that holds the call and the WhatsApp message of the same person. The thread items come in together
// when the action says so, the two channel chips light up and the "one conversation" mark closes the gesture.
import type { Act } from "@/lib/scenes/types";
import styles from "./scenes.module.css";

export type InboxItem = { channel: string; text: string; focal?: boolean };

export function InboxUnified({
  act,
  person,
  channels,
  items,
  mark,
  action,
}: {
  act: Act;
  person: string;
  channels: readonly string[];
  items: readonly InboxItem[];
  // The mark that closes the gesture ("Uma conversa")
  mark: string;
  // Action that brings the thread in
  action: string;
}) {
  return (
    <div className={styles.inbox}>
      {/* Other conversations, as skeleton bars: they only say "this is an inbox" */}
      <ul className={styles.inboxList} aria-hidden="true">
        {[0, 1, 2].map((n) => (
          <li key={n} className={n === 0 ? styles.inboxOn : undefined}>
            <i />
            <span>
              <b />
              <em />
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.thread}>
        <div className={styles.threadHead}>
          <b>{person}</b>
          <span className={styles.chips}>
            {channels.map((name, i) => (
              <span
                key={name}
                className={`${styles.chip} ${styles.chipLit}`}
                {...act(action, "light", {
                  index: i,
                  count: channels.length,
                })}
              >
                {name}
              </span>
            ))}
          </span>
        </div>
        <ul className={styles.threadItems}>
          {items.map((item, i) => (
            <li
              key={item.channel}
              {...act(action, "in", { index: i, count: items.length })}
            >
              <b className={styles.chip}>{item.channel}</b>
              <span
                className={item.focal ? styles.focal : undefined}
                data-focal={item.focal ? "" : undefined}
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.mark} {...act(action, "pop", { offset: 0.2 })}>
          {mark}
        </p>
      </div>
    </div>
  );
}
