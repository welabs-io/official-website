// PEÇAS COMUNS DAS INTERAÇÕES
// v2.2 (audit A05, section 4): every play has the same anatomy. A form with the native controls the visitor drives
// (radios and checkboxes with visible labels, so it works with a keyboard, a screen reader and no script) and a reset
// button; a stage that answers each choice in three to five beats; a record of what happened, line by line; and the
// record of the Domus where the effect lands. The motion is CSS (plays.module.css): an element appears when its state
// is reached (`:has(:checked)`), and appearing starts its animation, so only what is new moves.
import type { CSSProperties, ReactNode } from "react";
import { DOMUS_RECORD, PLAY_COMMON } from "@/lib/content/plays";
import { productLogo } from "@/lib/products";
import s from "./plays.module.css";

// The delay of a beat, in beats of the shared rhythm (--beat, plays.module.css)
export const at = (beat: number) => ({ "--at": beat }) as CSSProperties;

// v3 (F3): the play demonstrates itself through `demo` (the ids of its controls in order, play-demo.ts), and resets by
// itself after each run or each choice of the visitor, so the reset button left
export function PlayForm({
  slug,
  label,
  className,
  demo,
  controls,
  stage,
  side,
}: {
  slug: string;
  label: string;
  // The root class of the sheet of the product (its states and drawing)
  className: string;
  // The controls the demo checks, in order
  demo: readonly string[];
  controls: ReactNode;
  stage: ReactNode;
  side: ReactNode;
}) {
  return (
    <form
      className={`${s.play} ${className}`}
      data-play={slug}
      data-demo={demo.join(" ")}
      aria-label={label}
    >
      <div className={s.controls}>{controls}</div>
      {/* The drawn product screens are interface, not page copy: out of the word budget, still under the copy rules */}
      <div className={s.body} data-mini="play">
        <div className={s.stage}>{stage}</div>
        <div className={s.side}>{side}</div>
      </div>
      <span data-mini-end="" hidden />
    </form>
  );
}

// A group of choices: a fieldset whose legend is the visible name of the group
export function Choices({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={s.group}>
      <legend className={s.legend}>{legend}</legend>
      <div className={s.chips}>{children}</div>
    </fieldset>
  );
}

// One native control with its visible label as the button
export function Choice({
  id,
  name,
  type = "checkbox",
  checked,
  children,
}: {
  id: string;
  name?: string;
  type?: "checkbox" | "radio";
  // Checked when the page loads and after a reset
  checked?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={s.choiceWrap}>
      <input
        type={type}
        id={id}
        name={name}
        className={s.toggle}
        defaultChecked={checked}
      />
      <label htmlFor={id} className={s.choice}>
        {children}
      </label>
    </span>
  );
}

// The record of what happened: the lines of each state are drawn by the play and shown by its CSS
export function PlayLog({ children }: { children: ReactNode }) {
  return (
    <div className={s.log} role="group" aria-label={PLAY_COMMON.log}>
      <p className={s.sideTitle}>{PLAY_COMMON.log}</p>
      <ol className={s.logList} aria-live="polite">
        <li className={s.logIdle}>{PLAY_COMMON.idle}</li>
        {children}
      </ol>
    </div>
  );
}

// One line of the record, shown by the state named in `data-ev`
export function LogLine({
  ev,
  time,
  beat,
  vars,
  tone,
  channel,
  children,
}: {
  ev: string;
  time: string;
  // The beat of the line, or `vars` when the play times it per state (the Magneto)
  beat?: number;
  vars?: CSSProperties;
  tone?: "ok" | "fail" | "wait";
  // The channel of the Relloo the line belongs to (play-run.ts orders it)
  channel?: string;
  children: ReactNode;
}) {
  return (
    <li
      className={s.logLine}
      data-ev={ev}
      data-tone={tone}
      data-channel={channel}
      style={vars ?? at(beat ?? 0)}
    >
      <time>{time}</time>
      <span>{children}</span>
    </li>
  );
}

// The record of the Domus every play ends on: the idle line and the lines each state writes on it
export function DomusRecord({
  title = DOMUS_RECORD.title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={s.record} role="group" aria-label={DOMUS_RECORD.label}>
      <p className={s.recordHead}>
        <img
          src={productLogo("domus", "light", "row")}
          alt="Domus"
          width={1005}
          height={550}
        />
        <b>{title}</b>
      </p>
      <ul className={s.recordLines}>{children}</ul>
    </div>
  );
}

// One line of the Domus record; `ev` names the state that writes it (none: the line of the idle record)
export function RecordLine({
  ev,
  beat = 0,
  vars,
  channel,
  children,
}: {
  ev?: string;
  beat?: number;
  vars?: CSSProperties;
  channel?: string;
  children: ReactNode;
}) {
  return (
    <li
      className={s.recordLine}
      data-ev={ev}
      data-channel={channel}
      data-idle={ev ? undefined : ""}
      data-domus-effect={ev ? "" : undefined}
      style={ev ? (vars ?? at(beat)) : undefined}
    >
      {children}
    </li>
  );
}
