// CAIXA DE ENTRADA UNIFICADA (TUNER)
// The inbox of the business, across the whole window: a list of real conversations (Marina's is the open one, with a
// pale amber fill and an amber bar) and the open conversation, where everything Marina said on any channel sits on one
// timeline, each item with the mark of its channel. The history is quiet; the call comes in with its action (with the
// waveform of the recording), the WhatsApp message with its own (typing dots first), and the merge lights the channel
// marks and brings the pill "2 canais, 1 pessoa". A reply box anchors the bottom, as in a real inbox.
import type { Act } from "@/lib/scenes/types";
import { Glyph, GLYPHS } from "./icons";
import styles from "./scenes.module.css";

export type InboxItem = {
  channel: string;
  // Colour family of the channel: voice is information, WhatsApp is success
  tone: "info" | "ok";
  icon: string;
  // Who wrote it, when it was not Marina
  from?: string;
  text: string;
  time: string;
  // Action that brings the item in; without it the item is history
  action?: string;
  // Seconds of typing dots before the text
  typing?: number;
  // The key element of the scene
  isKey?: boolean;
  // Draw the recording of a call under the text
  wave?: boolean;
};

export type InboxEntry = { name: string; preview: string; time: string };

// Heights of the bars of the recorded call, in percent: a fixed shape, so the server markup never changes
const WAVE = [
  30, 55, 80, 45, 65, 100, 70, 40, 60, 85, 50, 35, 70, 90, 55, 30, 45, 75, 60,
  40, 25, 50, 80, 65, 35, 55, 30, 45,
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

export function InboxUnified({
  act,
  title,
  person,
  current,
  others,
  meta,
  items,
  mark,
  reply,
  action,
}: {
  act: Act;
  // Title of the list
  title: string;
  person: string;
  // Marina's entry in the list
  current: InboxEntry;
  // The other conversations, quiet, under hers
  others: readonly InboxEntry[];
  // Context under the name in the open conversation (the order)
  meta: string;
  items: readonly InboxItem[];
  // The pill that closes the gesture ("2 canais, 1 pessoa")
  mark: string;
  // Placeholder of the reply box
  reply: string;
  // Action that lights the channel marks and brings the pill
  action: string;
}) {
  const live = items.filter((item) => item.action);
  return (
    <div className={styles.inbox} data-edge="">
      <div className={styles.inboxList}>
        <p className={styles.listHead}>
          <b>{title}</b>
          <span>{others.length + 1}</span>
        </p>
        <ul>
          {[current, ...others].map((entry, i) => (
            <li
              key={entry.name}
              className={i === 0 ? styles.inboxOn : undefined}
            >
              <span className={styles.avatarXs} aria-hidden="true">
                {initials(entry.name)}
              </span>
              <span className={styles.entry}>
                <b>{entry.name}</b>
                <span>{entry.preview}</span>
              </span>
              <time>{entry.time}</time>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.thread}>
        <div className={styles.threadHead}>
          <span className={styles.avatarSm} aria-hidden="true">
            {person[0]}
          </span>
          <span className={styles.who}>
            <b>{person}</b>
            <span>{meta}</span>
          </span>
          <span
            className={styles.pillOk}
            {...act(action, "pop", { offset: 0.1 })}
          >
            {mark}
          </span>
        </div>
        <ol className={styles.timeline}>
          {items.map((item, i) => {
            const typing = item.typing ?? 0;
            return (
              <li
                key={`${item.channel}-${i}`}
                data-quiet={item.action ? undefined : ""}
                {...(item.action ? act(item.action, "in") : {})}
              >
                <span
                  className={styles.channelMark}
                  data-tone={item.tone}
                  {...(item.action
                    ? act(action, "light", {
                        index: live.indexOf(item),
                        count: live.length,
                      })
                    : {})}
                >
                  <Glyph d={item.icon} size={14} />
                </span>
                <span className={styles.itemBody}>
                  <span className={styles.itemMeta}>
                    <b>{item.channel}</b>
                    {item.from ? <span>{item.from}</span> : null}
                    <time>{item.time}</time>
                  </span>
                  <span className={styles.itemSlot}>
                    {typing && item.action ? (
                      <span
                        className={styles.typingInline}
                        {...act(item.action, "blink", { length: typing })}
                      >
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : null}
                    <span
                      className={item.isKey ? styles.key : styles.itemText}
                      data-key={item.isKey ? "" : undefined}
                      {...(typing && item.action
                        ? act(item.action, "in", { offset: typing })
                        : {})}
                    >
                      {item.text}
                    </span>
                  </span>
                  {/* The recording of the call, as a quiet waveform */}
                  {item.wave ? (
                    <span className={styles.wave} aria-hidden="true">
                      {WAVE.map((h, k) => (
                        <i key={k} style={{ height: `${h}%` }} />
                      ))}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
        <p className={styles.replyBox} aria-hidden="true">
          <span>{reply}</span>
          <i>
            <Glyph d={GLYPHS.send} size={14} />
          </i>
        </p>
      </div>
    </div>
  );
}
