// CANAIS QUE VIRAM UMA CONVERSA (PILOTO LÚDICO, CENA S1 DO TUNER)
// The scene as two components that talk to each other, like the HyperFrames of the 2026-10-02 round: the contact's
// phone on the left and the conversation of the Tuner on the right. The call comes in first (a card that rises, its
// waveform growing bar by bar); then the question is typed on the phone, springs out as a bubble and flies into the
// Tuner, where it lands in the same thread as the call; last, an amber bracket joins the two channels, their marks
// light, the pill "2 canais, 1 contato" pops with its check drawn, and the logo of the Tuner swells as it receives.
// Interface text of 11 to 13 px, as in a real app; the key element is the record on the conversation (18 px). Server
// markup, timed by the script (`act`); the settled frame is plain CSS.
// v3 (F1): the conversation is headed by the contact record (STORY.who) with its order, never a person's name.
import { TextField } from "@/components/lib/ui";
import type { Act } from "@/lib/scenes/types";
import { STORY } from "@/lib/scenes/story";
import { Glyph, GLYPHS, TICK_DOUBLE } from "./icons";
import l from "./ludic.module.css";
import styles from "./scenes.module.css";

// Heights of the bars of the recorded call, in percent (a fixed shape, so the markup never changes)
const WAVE = [
  35, 60, 85, 50, 70, 100, 75, 45, 65, 90, 55, 40, 72, 95, 58, 34, 48, 78, 62,
  42,
];

const { times, channels } = STORY;

export function LudicChannels({ act }: { act: Act }) {
  // The question springs out of the corner of its tail (bottom right, the contact's own bubble)
  const asked = act("ask", "spring", { offset: 0.1, length: 0.18 });
  // ...and lands in the Tuner as soon as it is out
  const landed = act("ask", "fly", { offset: 0.16, length: 0.12 });
  return (
    <div className={l.channels}>
      {/* The contact's phone: the chat with the business, newest at the bottom */}
      <div className={l.phone} data-edge="">
        <span className={l.notch} aria-hidden="true" />
        <p className={l.phoneHead}>
          <span className={l.contact} aria-hidden="true">
            <Glyph d={GLYPHS.bag} size={14} />
          </span>
          <span className={l.contactName}>
            <b>{STORY.contact}</b>
            <span>
              <i className={styles.dot} data-tone="ok" />
              {channels.chat}
            </span>
          </span>
        </p>
        <div className={l.chat}>
          <p className={`${l.bubble} ${l.bubbleIn}`}>
            {STORY.before}
            <time>{times.before}</time>
          </p>
          <p className={l.sys} {...act("call", "rise", { length: 0.18 })}>
            <Glyph d={GLYPHS.phone} size={12} />
            {STORY.call}
            <time>{times.call}</time>
          </p>
          <div className={l.outSlot}>
            <span
              className={l.typing}
              {...act("ask", "blink", { length: 0.12 })}
            >
              <i />
              <i />
              <i />
            </span>
            <p
              className={`${l.bubble} ${l.bubbleOut}`}
              {...asked}
              style={{ ...asked.style, ["--origin" as string]: "100% 100%" }}
            >
              {STORY.ask}
              <span className={l.stamp}>
                <time>{times.ask}</time>
                <Glyph d={TICK_DOUBLE} size={14} />
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* The Tuner: one conversation per person, whatever the channel */}
      <div className={l.thread} data-edge="">
        <div className={l.threadHead}>
          <span className={l.avatar} aria-hidden="true">
            <Glyph d={GLYPHS.user} size={16} />
          </span>
          <span className={l.who}>
            <b className={l.key} data-key="">
              {STORY.who}
            </b>
            <span>{STORY.order}</span>
          </span>
          <span
            className={l.pill}
            {...act("merge", "spring", { offset: 0.06, length: 0.2 })}
          >
            <span
              className={l.check}
              {...act("merge", "wipe", { offset: 0.16, length: 0.11 })}
            >
              <Glyph d={GLYPHS.check} size={12} />
            </span>
            {STORY.thread}
          </span>
        </div>
        <ol className={l.items}>
          {/* The bracket that makes the two channels one conversation */}
          <li
            className={l.bracket}
            aria-hidden="true"
            {...act("merge", "grow", { length: 0.18 })}
          />
          <li className={l.item} {...act("call", "spring", { length: 0.2 })}>
            <span
              className={l.mark}
              data-tone="info"
              {...act("merge", "light", { index: 0, count: 2 })}
            >
              <Glyph d={GLYPHS.phone} size={14} />
            </span>
            <span className={l.card}>
              <span className={l.meta}>
                <b>{channels.voice}</b>
                <time>{times.call}</time>
              </span>
              <span className={l.text}>{STORY.call}</span>
              <span className={l.wave} aria-hidden="true">
                {WAVE.map((h, k) => {
                  const bar = act("call", "grow", {
                    index: k,
                    count: WAVE.length,
                    offset: 0.04,
                    length: 0.08,
                  });
                  return (
                    <i
                      key={k}
                      {...bar}
                      style={{ ...bar.style, height: `${h}%` }}
                    />
                  );
                })}
              </span>
            </span>
          </li>
          <li
            className={l.item}
            {...landed}
            style={
              {
                ...landed.style,
                // From the phone on the left, a little lower: where the bubble was born
                "--fx": "-9rem",
                "--fy": "3rem",
              } as React.CSSProperties
            }
          >
            <span
              className={l.mark}
              data-tone="ok"
              {...act("merge", "light", { index: 1, count: 2 })}
            >
              <Glyph d={GLYPHS.chat} size={14} />
            </span>
            <span className={l.card}>
              <span className={l.meta}>
                <b>{channels.chat}</b>
                <time>{times.ask}</time>
              </span>
              <span className={`${l.text} ${l.said}`}>{STORY.ask}</span>
            </span>
          </li>
        </ol>
        {/* v3 (F2, review P-02): the composer is the site's TextField at the small control height (chat icon, soft send
            action: app/lib.css CONTROLES); inert, since it is a drawing with nothing to type */}
        <div className={l.reply} aria-hidden="true" inert data-theme="welabs">
          <TextField
            size="sm"
            icon={<Glyph d={GLYPHS.chat} size={16} />}
            action={{ icon: <Glyph d={GLYPHS.send} size={14} />, label: STORY.send, tabIndex: -1 }}
            readOnly
            tabIndex={-1}
            placeholder={STORY.reply}
            aria-label={STORY.reply}
          />
        </div>
      </div>
    </div>
  );
}
