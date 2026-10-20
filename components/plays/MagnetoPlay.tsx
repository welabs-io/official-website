// MAGNETO: APROVAÇÃO NO MEIO DO FLUXO
// v2.2 (audit A05, M07, section 4; reference: the HyperFrames piece flow-durable-run). The value of the order decides
// the branch: below the limit the flow goes straight on, above it a token stops at the approval and waits for the
// visitor to approve or refuse; refusing sends the order back to be adjusted. "Simular falha" takes the Domus down at
// the update step: the node turns red, retries and recovers without repeating the steps already done. The record of
// the run fills with times and the order on the Domus changes its status. States and timing: magneto.module.css.
import type { CSSProperties } from "react";
import { Glyph, GLYPHS } from "@/components/scenes/icons";
import { MAGNETO_PLAY as M } from "@/lib/content/plays";
import m from "./magneto.module.css";
import {
  Choice,
  Choices,
  DomusRecord,
  LogLine,
  PlayForm,
  PlayLog,
  RecordLine,
} from "./parts";

// Beats of an element per state: `a` by default (and on the way to the approval), `al` on the branch below the limit,
// `ao` after an approval; `late` marks what comes after the update, which a failure delays (magneto.module.css). The
// properties are --beat-*, never --a (the amber of the page).
const v = (a: number, al?: number, ao?: number, late = false) =>
  ({
    "--beat-a": a,
    "--beat-low": al,
    "--beat-ok": ao,
    "--late": late ? 1 : 0,
  }) as CSSProperties;

function Check({ ev, vars }: { ev: string; vars: CSSProperties }) {
  return (
    <i className={m.done} data-ev={ev} style={vars}>
      <Glyph d={GLYPHS.check} size={14} />
    </i>
  );
}

export function MagnetoPlay() {
  const controls = (
    <>
      <Choices legend={M.valueLabel}>
        {M.values.map((value) => (
          <Choice
            key={value.id}
            id={`mg-${value.id}`}
            name="mg-value"
            type="radio"
          >
            {value.label}
          </Choice>
        ))}
      </Choices>
      <Choices legend={M.failLabel}>
        <Choice id="mg-fail">
          <Glyph d={GLYPHS.bolt} size={16} />
          {M.fail}
        </Choice>
      </Choices>
    </>
  );

  const stage = (
    <ol className={m.flow}>
      {/* The token that runs the flow: one segment per state, each starting where the one before it stopped */}
      <li className={m.tokens} aria-hidden="true">
        <i className={m.token} data-ev="low" data-seg="low" style={v(0)} />
        <i className={m.token} data-ev="wait no" data-seg="wait" style={v(0)} />
        <i className={m.token} data-ev="ok" data-seg="ok" style={v(0, 0, 0)} />
        <i
          className={m.token}
          data-ev="done"
          data-seg="end"
          style={v(0, 3, 1, true)}
        />
      </li>
      <li className={m.node} data-node="start">
        <span className={m.icon}>
          <Glyph d={GLYPHS.pen} size={16} />
          <Check ev="any" vars={v(0)} />
        </span>
        <b>{M.nodes.start}</b>
      </li>
      <li className={m.node} data-node="check">
        <span className={m.icon}>
          <Glyph d={GLYPHS.rule} size={16} />
          <Check ev="any" vars={v(1)} />
        </span>
        <b>{M.nodes.check}</b>
        <span className={m.status}>
          <span className={m.pill} data-ev="low" style={v(1)}>
            {M.no}
          </span>
          <span className={m.pill} data-ev="high" style={v(1)}>
            {M.yes}
          </span>
        </span>
      </li>
      <li className={m.node} data-node="approval">
        <span className={m.icon}>
          <Glyph d={GLYPHS.user} size={16} />
          <Check ev="ok" vars={v(0, 0, 0)} />
        </span>
        <b>{M.nodes.approval}</b>
        <span className={m.status}>
          <span className={m.pill} data-ev="low" data-tone="skip" style={v(2)}>
            {M.skipped}
          </span>
          {/* Waiting: the decision is the visitor's, two native radios on the node itself */}
          <span className={m.decide} data-ev="wait" style={v(2)}>
            <span className={m.waiting}>{M.waiting}</span>
            <Choice id="mg-ok" name="mg-dec" type="radio">
              {M.approve}
            </Choice>
            <Choice id="mg-no" name="mg-dec" type="radio">
              {M.refuse}
            </Choice>
          </span>
          <span
            className={m.pill}
            data-ev="ok"
            data-tone="ok"
            style={v(0, 0, 0)}
          >
            {M.approved}
          </span>
          <span
            className={m.pill}
            data-ev="no"
            data-tone="fail"
            style={v(0, 0, 0)}
          >
            {M.refused}
          </span>
          <span className={m.adjust} data-ev="no" style={v(1, 1, 1)}>
            <Glyph d={GLYPHS.refresh} size={14} />
            {M.nodes.adjust}
          </span>
        </span>
      </li>
      <li className={m.node} data-node="update">
        <span className={m.icon}>
          <Glyph d={GLYPHS.refresh} size={16} />
          <Check ev="done" vars={v(0, 3, 1, true)} />
        </span>
        <b>{M.nodes.update}</b>
        <span className={m.status}>
          <span
            className={m.pill}
            data-ev="fail"
            data-tone="fail"
            data-retry=""
            style={v(0, 3, 1)}
          >
            <Glyph d={GLYPHS.refresh} size={14} />
            {M.retry}
          </span>
          <span
            className={m.pill}
            data-ev="fail"
            data-tone="ok"
            style={v(0, 3, 1, true)}
          >
            {M.recovered}
          </span>
        </span>
      </li>
      <li className={m.node} data-node="notify">
        <span className={m.icon}>
          <Glyph d={GLYPHS.bell} size={16} />
          <Check ev="done" vars={v(0, 4, 2, true)} />
        </span>
        <b>{M.nodes.notify}</b>
        <span className={m.status}>
          <span
            className={m.pill}
            data-ev="done"
            data-tone="ok"
            style={v(0, 5, 4, true)}
          >
            {M.done}
          </span>
        </span>
      </li>
    </ol>
  );

  const side = (
    <>
      <PlayLog>
        <LogLine ev="any" time="10:14:02" vars={v(0)}>
          {M.log.start}
        </LogLine>
        <LogLine ev="low" time="10:14:02" vars={v(1)}>
          {M.log.low}
        </LogLine>
        <LogLine ev="high" time="10:14:03" tone="wait" vars={v(2)}>
          {M.log.high}
        </LogLine>
        <LogLine ev="ok" time="10:31:40" tone="ok" vars={v(0, 0, 0)}>
          {M.log.approved}
        </LogLine>
        <LogLine ev="no" time="10:31:40" tone="wait" vars={v(1, 1, 1)}>
          {M.log.refused}
        </LogLine>
        <LogLine ev="fail" time="10:31:41" tone="fail" vars={v(0, 3, 1)}>
          {M.log.failed}
        </LogLine>
        <LogLine ev="done" time="10:31:44" tone="ok" vars={v(0, 3, 1, true)}>
          {M.log.updated}
        </LogLine>
        <LogLine ev="done" time="10:31:44" tone="ok" vars={v(0, 4, 2, true)}>
          {M.log.notified}
        </LogLine>
      </PlayLog>
      <DomusRecord>
        <RecordLine>{M.record.idle}</RecordLine>
        <RecordLine ev="low" vars={v(1)}>
          {M.record.low}
        </RecordLine>
        <RecordLine ev="high" vars={v(1)}>
          {M.record.high}
        </RecordLine>
        <RecordLine ev="wait" vars={v(3)}>
          {M.record.waiting}
        </RecordLine>
        <RecordLine ev="no" vars={v(4, 4, 4)}>
          {M.record.adjust}
        </RecordLine>
        <RecordLine ev="done" vars={v(0, 5, 3, true)}>
          {M.record.done}
        </RecordLine>
      </DomusRecord>
    </>
  );

  return (
    <PlayForm
      slug="magneto"
      label={M.label}
      className={m.root}
      controls={controls}
      stage={stage}
      side={side}
    />
  );
}
