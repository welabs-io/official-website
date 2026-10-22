// RELLOO: TODOS OS CANAIS NA MESMA CONVERSA
// v2.2 (audit A05, M09, section 4; reference: the HyperFrames piece crm-omnichannel-inbox). The visitor fires the three
// sources of one contact (a message, a call, the chat of the site): each lands in the same conversation, in the order it
// was fired (play-run.ts writes the order), with a "channel switch" divider and its response deadline running. The first
// contact runs the chain on the timeline (identified, order linked, distributed to the team, answered on time); with
// the three in, the AI agent answers with its source and passes the conversation to the team. States: relloo.module.css.
import type { CSSProperties } from "react";
import { Glyph, GLYPHS } from "@/components/scenes/icons";
import { RELLOO_PLAY as R } from "@/lib/content/plays";
import r from "./relloo.module.css";
import {
  at,
  Choice,
  Choices,
  DomusRecord,
  LogLine,
  PlayForm,
  PlayLog,
  RecordLine,
} from "./parts";

const CHANNEL_GLYPH: Record<string, string> = {
  message: GLYPHS.chat,
  call: GLYPHS.phone,
  site: GLYPHS.globe,
};

// A line that closes the list, after the channels play-run.ts orders
const last = (beat: number) => ({ ...at(beat), order: 99 }) as CSSProperties;

// The deadline of a reply: a ring that closes, then the check
function Deadline() {
  return (
    <span className={r.deadline} aria-hidden="true">
      <svg viewBox="0 0 20 20" width="20" height="20">
        <circle cx="10" cy="10" r="8" />
      </svg>
      <i>
        <Glyph d={GLYPHS.check} size={12} />
      </i>
    </span>
  );
}

export function RellooPlay() {
  const controls = (
    <Choices legend={R.label}>
      {R.channels.map((c) => (
        <Choice key={c.id} id={`rl-${c.id}`}>
          <Glyph d={CHANNEL_GLYPH[c.id]} size={16} />
          {c.label}
        </Choice>
      ))}
    </Choices>
  );

  const stage = (
    <div className={r.screen}>
      <div className={r.conversation}>
        <p className={r.head}>
          <span className={r.avatar} aria-hidden="true">
            <Glyph d={GLYPHS.user} size={16} />
          </span>
          <b>{R.contact}</b>
          <span className={r.count}>{R.countLabel}</span>
        </p>
        <ol className={r.thread} data-thread="">
          {R.channels.map((c) => (
            <li
              key={c.id}
              className={r.event}
              data-ev={c.id}
              data-channel={c.id}
              style={at(0)}
            >
              <span className={r.switch}>{R.switchLabel}</span>
              <span className={r.via}>
                <Glyph d={CHANNEL_GLYPH[c.id]} size={14} />
                {c.label}
              </span>
              <span className={r.bubble}>
                {c.text}
                <Deadline />
              </span>
            </li>
          ))}
          <li className={r.agent} data-ev="all" style={at(4.5)}>
            <span className={r.via}>
              <Glyph d={GLYPHS.bot} size={14} />
              {R.agent}
            </span>
            <span className={r.bubble} data-out="">
              {R.agentText}
              <span className={r.source}>
                <Glyph d={GLYPHS.doc} size={12} />
                {R.agentSource}
              </span>
            </span>
          </li>
          <li className={r.handoff} data-ev="all" style={at(6.5)}>
            <Glyph d={GLYPHS.team} size={14} />
            {R.handoff}
          </li>
        </ol>
      </div>
      <ol className={r.timeline} aria-label={R.timelineLabel}>
        {R.chain.map((step, i) => (
          <li key={step} className={r.mile} data-ev="any" style={at(1 + i)}>
            <span className={r.dot} />
            {step}
            {i === 2 && (
              <span className={r.rotation} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );

  const side = (
    <>
      <PlayLog>
        {R.channels.map((c, i) => (
          <LogLine
            key={c.id}
            ev={c.id}
            time={`10:0${5 + i}`}
            beat={1}
            channel={c.id}
          >
            {c.log}
          </LogLine>
        ))}
        {/* After the channels, whatever order they were fired in */}
        <LogLine ev="all" time="10:08" vars={last(5)} tone="ok">
          {R.agentLog}
        </LogLine>
        <LogLine ev="all" time="10:09" vars={last(7)} tone="ok">
          {R.handoff}
        </LogLine>
      </PlayLog>
      <DomusRecord>
        <RecordLine>{R.record}</RecordLine>
        {R.channels.map((c) => (
          <RecordLine key={c.id} ev={c.id} beat={4} channel={c.id}>
            {c.recordLine}
          </RecordLine>
        ))}
        <RecordLine ev="all" vars={last(7.5)}>
          {R.recordHandoff}
        </RecordLine>
      </DomusRecord>
    </>
  );

  return (
    <PlayForm
      slug="relloo"
      label={R.label}
      className={r.root}
      // v3 (F3): the demo fires the three channels, so the agent answers and passes the conversation on
      demo={R.channels.map((c) => `rl-${c.id}`)}
      controls={controls}
      stage={stage}
      side={side}
    />
  );
}
