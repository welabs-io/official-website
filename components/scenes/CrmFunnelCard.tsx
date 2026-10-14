// FUNIL DO RELLOO COM O CARTÃO DO PEDIDO
// The funnel (Novo, Em análise, Aguardando aprovação, Resolvido) as four lanes, each with a status dot, its name and a
// count, and the card that sits on the lane of its stage. `stage` is the final lane; `born` brings the card in and each
// `moves` entry slides it down by that many lanes, from the lane it was on. The card carries a row of five emblems
// (owner, deadline, history, return, delivery) that fill as `facts` arrives. `CardSheet` is the side panel with the
// facts of the card and `CardStatus` is the record with its stage and progress that the approval scene uses.
import type { ReactNode } from "react";
import type { Act, ActProps } from "@/lib/scenes/types";
import { Glyph, GLYPHS } from "./icons";
import styles from "./scenes.module.css";

export type CardCopy = { title: string; order: string };
export type OtherCard = { stage: number; title: string; order: string };

// Tone of each stage, in order: neutral, information, pending, success
const TONES = ["new", "info", "warn", "ok"] as const;

// The five emblems of the card, in the order the facts arrive; the last one (delivery) comes from the house
const EMBLEMS = [
  GLYPHS.user,
  GLYPHS.clock,
  GLYPHS.history,
  GLYPHS.calendar,
  GLYPHS.truck,
];

export function CrmFunnelCard({
  act,
  title,
  meta,
  stages,
  stage,
  card,
  owner,
  others = [],
  born,
  facts,
  moves = [],
  rootAct,
  keyTitle = false,
}: {
  act: Act;
  title: string;
  meta?: string;
  stages: readonly string[];
  // Final lane of the card; null draws the funnel with no card
  stage: number | null;
  card: CardCopy;
  // Initial of the owner on the card
  owner?: string;
  // The other cards of the funnel, drawn quiet around the one of the story
  others?: readonly OtherCard[];
  // Action that brings the card in
  born?: string;
  // Action that fills four of the five emblems, one after the other
  facts?: string;
  // Successive slides of the card, each from `rows` above where it ends
  moves?: readonly { action: string; rows: number }[];
  // Props of the action that brings the whole funnel in (scene 0)
  rootAct?: ActProps;
  // The card title is the key element of the scene
  keyTitle?: boolean;
}) {
  // Nested layers: each one starts `rows` above where it ends and undoes its own part when its action runs, so the card
  // is on its final lane at rest and `sum(rows)` lanes higher before the first move
  const deal = (
    <div
      className={styles.deal}
      data-edge=""
      {...(born ? act(born, "pop") : {})}
    >
      <b
        className={keyTitle ? styles.key : undefined}
        data-key={keyTitle ? "" : undefined}
      >
        {card.title}
      </b>
      <span className={styles.dealFoot}>
        <span>{card.order}</span>
        <span className={styles.emblems} aria-hidden="true">
          {EMBLEMS.map((d, i) => (
            <span key={i} className={styles.emblem}>
              <Glyph d={d} size={14} />
              {facts && i < 4 ? (
                <span
                  className={styles.emblemOn}
                  {...act(facts, "in", { index: i, count: 4 })}
                >
                  <Glyph d={d} size={14} />
                </span>
              ) : null}
            </span>
          ))}
        </span>
        {owner ? (
          <span className={styles.avatarXs} aria-hidden="true">
            {owner[0]}
          </span>
        ) : null}
      </span>
    </div>
  );
  const layered = moves.reduceRight<ReactNode>((inner, move) => {
    const props = act(move.action, "drop");
    return (
      <div
        className={styles.layer}
        {...props}
        style={
          {
            ...props.style,
            // The layer is exactly one lane tall (border included), so -100% is one lane up
            "--dy": `${-100 * move.rows}%`,
          } as React.CSSProperties
        }
      >
        {inner}
      </div>
    );
  }, deal);
  const count = (i: number) =>
    others.filter((o) => o.stage === i).length + (stage === i ? 1 : 0);
  return (
    <div className={styles.funnel} data-edge="" {...rootAct}>
      <p className={styles.panelHead}>
        <b>{title}</b>
        {meta ? <span>{meta}</span> : null}
      </p>
      <ol className={styles.lanes}>
        {stages.map((name, i) => {
          const other = others.find((o) => o.stage === i);
          return (
            <li key={name} className={styles.lane}>
              <span className={styles.laneHead}>
                <i className={styles.dot} data-tone={TONES[i]} />
                <span>{name}</span>
                <em>{count(i)}</em>
              </span>
              {stage === i ? (
                <span className={styles.layerHost}>{layered}</span>
              ) : null}
              <span className={styles.laneBody}>
                {stage === i ? null : other ? (
                  <span className={styles.other} data-edge="">
                    <b>{other.title}</b>
                    <span>{other.order}</span>
                  </span>
                ) : (
                  <span className={styles.emptySlot} />
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// PAINEL COM OS DADOS DO CARTÃO
export type SheetRow = {
  label: string;
  value: string;
  action?: string;
  icon?: string;
  // Where the value came from (a room of the house)
  from?: string;
  // The value is still missing (a dashed line in its place)
  pending?: boolean;
  // The row is new in this scene (pale amber, the rows of the moment)
  fresh?: boolean;
};

export function CardSheet({
  act,
  title,
  meta,
  head,
  rows,
  offset = 0,
}: {
  act: Act;
  title?: string;
  meta?: string;
  // A head drawn instead of the title (the card itself, in scene 3)
  head?: ReactNode;
  rows: readonly SheetRow[];
  // Seconds the first row waits inside its action (the rooms that feed it go first)
  offset?: number;
}) {
  const animated = rows.filter((r) => r.action);
  return (
    <div className={styles.sheet} data-edge="">
      {head ??
        (title ? (
          <p className={styles.panelHead}>
            <b>{title}</b>
            {meta ? <span>{meta}</span> : null}
          </p>
        ) : null)}
      <dl className={styles.facts}>
        {rows.map((row) => {
          // A value handed over by a room flies in from the house on the left (ludic pass); the others rise
          const props = row.action
            ? act(row.action, row.from ? "fly" : "in", {
                index: animated.indexOf(row),
                count: animated.length,
                offset,
              })
            : null;
          return (
            <div
              key={row.label}
              className={styles.fact}
              data-fresh={row.fresh ? "" : undefined}
              {...props}
              style={
                props
                  ? ({
                      ...props.style,
                      "--fx": "-14rem",
                      "--fy": "0",
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <dt>
                {row.icon ? <Glyph d={row.icon} size={14} /> : null}
                {row.label}
              </dt>
              <dd>
                {row.pending ? (
                  <span className={styles.pending} aria-hidden="true" />
                ) : (
                  row.value
                )}
                {row.from ? <em>{row.from}</em> : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

// REGISTRO DO CARTÃO COM ESTÁGIO E PROGRESSO
// The card with its stage: the stage name is a stack of texts (the previous ones fade out, the last fades in), each with
// the dot of its tone, and the four segments under it fill as the card moves on, with the name of each stage under its
// segment.
export function CardStatus({
  act,
  card,
  stages,
  start,
  steps,
  children,
}: {
  act: Act;
  card: CardCopy;
  stages: readonly string[];
  // Stage the card is on when the scene begins
  start: number;
  // The stages reached after it, each with the action that gets there
  steps: readonly { stage: number; action: string }[];
  // Rows under the progress (the facts of the card)
  children?: ReactNode;
}) {
  const reached = steps.length ? steps[steps.length - 1].stage : start;
  const trail = [{ stage: start, action: "" }, ...steps];
  return (
    <div className={styles.status} data-edge="">
      <p className={styles.statusCard}>
        <b>{card.title}</b>
        <span>{card.order}</span>
      </p>
      <span className={`${styles.statusStack} ${styles.key}`} data-key="">
        {trail.map((entry, k) => {
          const last = k === trail.length - 1;
          const away = trail[k + 1]?.action;
          // Outer: visible until the card leaves the stage (fades out). Inner: visible from the moment it arrives
          // (fades in). A stage in the middle is therefore visible only between the two actions.
          return (
            <span
              key={entry.stage}
              className={last ? styles.statusLast : styles.statusPrev}
              data-tone={TONES[entry.stage]}
              {...(away ? act(away, "out", { length: 0.2 }) : {})}
            >
              {/* The new stage comes in after the old one has gone, so the two names never overlap */}
              <span
                {...(entry.action
                  ? act(entry.action, "in", { offset: 0.2, length: 0.3 })
                  : {})}
              >
                <i className={styles.dot} data-tone={TONES[entry.stage]} />
                {stages[entry.stage]}
              </span>
            </span>
          );
        })}
      </span>
      <ol className={styles.track} aria-hidden="true">
        {stages.map((name, i) => {
          const step = steps.find((s) => s.stage === i);
          return (
            // The sand base never moves; the bar inside it is the one that wipes in
            <li key={name}>
              <span className={styles.trackBar}>
                {i <= reached && (
                  <i {...(step ? act(step.action, "wipe") : {})} />
                )}
              </span>
              <span>{name}</span>
            </li>
          );
        })}
      </ol>
      {children}
    </div>
  );
}
