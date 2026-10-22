// TUNER: MENU DE OPÇÕES E DISTRIBUIÇÃO DE LIGAÇÕES
// v2.2 (audit A05, B06, section 4; reference: the HyperFrames piece channels-call-center). The option pressed on the
// menu of the call lights a wire to a team (never a person) and the call travels along it. A free team answers at once;
// the busy one holds the call with its position marked until a seat frees, and the call passes on with the context of
// the order, so nothing is repeated. The recording and its transcription land in the conversation of the Relloo, and
// the call is on the history of the order in the Domus. The wires are an SVG in px, so the travelling call follows the
// same path by `offset-path`. States and timing: tuner.module.css.
import type { CSSProperties } from "react";
import { Glyph, GLYPHS } from "@/components/scenes/icons";
import { TUNER_PLAY as T } from "@/lib/content/plays";
import { productLogo } from "@/lib/products";
import t from "./tuner.module.css";
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

const WIRES = [
  "M0 150 C64 150 56 46 120 46",
  "M0 150 C64 150 56 150 120 150",
  "M0 150 C64 150 56 254 120 254",
];

// Beats after the call reaches its team: a busy team holds it first
const HOLD = 4;
const after = (busy: boolean, beat: number) => at(beat + (busy ? HOLD : 0));

function Wave() {
  return (
    <span className={t.wave} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function TunerPlay() {
  const controls = (
    <Choices legend={T.menu}>
      {T.options.map((o) => (
        <Choice key={o.key} id={`tn-${o.key}`} name="tn-menu" type="radio">
          <b className={t.key}>{o.key}</b>
          {o.label}
        </Choice>
      ))}
    </Choices>
  );

  const stage = (
    <div className={t.screen}>
      <div className={t.call}>
        <span className={t.ring}>
          <Glyph d={GLYPHS.phone} size={20} />
        </span>
        <b>{T.call}</b>
        <span className={t.caller}>{T.caller}</span>
      </div>
      <div className={t.wires} aria-hidden="true">
        <svg viewBox="0 0 120 300" width="120" height="300">
          {WIRES.map((d, i) => (
            <g key={d}>
              <path className={t.wire} d={d} />
              <path
                className={t.wireHot}
                d={d}
                data-ev={String(i + 1)}
                style={at(0)}
              />
            </g>
          ))}
        </svg>
        {WIRES.map((d, i) => (
          <i
            key={d}
            className={t.packet}
            data-ev={String(i + 1)}
            style={{ ...at(0), offsetPath: `path("${d}")` } as CSSProperties}
          />
        ))}
      </div>
      <ul className={t.teams}>
        {T.options.map((o) => (
          <li key={o.key} className={t.team} data-team={o.key}>
            <span className={t.avatar}>
              <Glyph d={GLYPHS.team} size={16} />
            </span>
            <span className={t.who}>
              <b>{o.team}</b>
              <span className={t.state}>
                <span className={t.free} data-busy={o.busy ? "" : undefined}>
                  {o.busy ? T.busy : T.free}
                </span>
                <span
                  className={t.live}
                  data-ev={o.key}
                  style={after(o.busy, 1.5)}
                >
                  <Wave />
                  {T.answered}
                </span>
              </span>
            </span>
            {o.busy && (
              <span className={t.hold} data-ev={o.key} style={at(1.5)}>
                <svg viewBox="0 0 20 20" width="20" height="20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                {T.hold}
              </span>
            )}
          </li>
        ))}
      </ul>
      {T.options.map((o) => (
        <div
          key={o.key}
          className={t.land}
          data-ev={o.key}
          style={after(o.busy, 3)}
        >
          <img
            src={productLogo("relloo", "light", "row")}
            alt="Relloo"
            width={1005}
            height={550}
          />
          <span>
            <b>{T.land}</b>
            <span className={t.transcript}>
              {o.busy ? T.contextLine : T.transcript}
            </span>
          </span>
        </div>
      ))}
    </div>
  );

  const side = (
    <>
      <PlayLog>
        {T.options.map((o) => (
          <LogLine key={o.key} ev={o.key} time="11:20" beat={0.5}>
            {T.chose(o.key, o.label)}
          </LogLine>
        ))}
        <LogLine ev="2" time="11:20" beat={1.5} tone="wait">
          {T.hold}
        </LogLine>
        {T.options.map((o) => (
          <LogLine
            key={o.key}
            ev={o.key}
            time={o.busy ? "11:22" : "11:20"}
            tone="ok"
            vars={after(o.busy, 1.5)}
          >
            {T.answeredBy(o.team)}
          </LogLine>
        ))}
      </PlayLog>
      <DomusRecord>
        <RecordLine>{T.recordIdle}</RecordLine>
        {T.options.map((o) => (
          <RecordLine key={o.key} ev={o.key} vars={after(o.busy, 4)}>
            {T.record}
          </RecordLine>
        ))}
      </DomusRecord>
    </>
  );

  return (
    <PlayForm
      slug="tuner"
      label={T.menu}
      className={t.root}
      // v3 (F3): the demo sends the call to the busy team (it waits in line), then to the free one (it is answered)
      demo={["tn-2", "tn-1"]}
      controls={controls}
      stage={stage}
      side={side}
    />
  );
}
