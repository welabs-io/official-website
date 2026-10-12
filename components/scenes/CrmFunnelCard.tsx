// FUNIL DO RELLOO COM O CARTÃO DO PEDIDO
// The funnel (Novo, Em análise, Aguardando aprovação, Resolvido) as four rows, and the card that sits on the row of its
// stage. `stage` is the final row; `born` brings the card in and each `moves` entry slides it down by that many rows,
// from the row it was on. `CardSheet` is the side sheet with the facts of the card (owner, deadline, history, return)
// and `CardStatus` is the compact form of the funnel (current stage and progress) the approval scene uses.
import type { Act, ActProps } from "@/lib/scenes/types";
import styles from "./scenes.module.css";

export type CardCopy = { title: string; order: string };

export function CrmFunnelCard({
  act,
  stages,
  stage,
  card,
  born,
  moves = [],
  rootAct,
}: {
  act: Act;
  stages: readonly string[];
  // Final row of the card; null draws the funnel with no card
  stage: number | null;
  card: CardCopy;
  // Action that brings the card in
  born?: string;
  // Successive slides of the card, each from `rows` above where it ends
  moves?: readonly { action: string; rows: number }[];
  // Props of the action that brings the whole funnel in (scene 0)
  rootAct?: ActProps;
}) {
  // Nested layers: each one starts `rows` above where it ends and undoes its own part when its action runs, so the card
  // is on its final row at rest and `sum(rows)` rows higher before the first move
  const layered = moves.reduceRight<React.ReactNode>(
    (inner, move) => (
      <div
        className={styles.layer}
        {...act(move.action, "drop")}
        style={
          {
            ...act(move.action, "drop").style,
            "--dy": `calc(var(--row) * ${-move.rows})`,
          } as React.CSSProperties
        }
      >
        {inner}
      </div>
    ),
    <p
      className={styles.deal}
      {...(born ? act(born, "pop") : {})}
      data-focal=""
    >
      <b>{card.title}</b>
      <span>{card.order}</span>
    </p>,
  );
  return (
    <div className={styles.funnel} {...rootAct}>
      <ol className={styles.stages}>
        {stages.map((name, i) => (
          <li key={name} data-active={stage === i ? "" : undefined}>
            <span>{name}</span>
          </li>
        ))}
      </ol>
      {stage !== null && (
        <div
          className={styles.cardLayer}
          style={{ "--stage": stage } as React.CSSProperties}
        >
          {layered}
        </div>
      )}
    </div>
  );
}

// FOLHA COM OS DADOS DO CARTÃO
export type SheetRow = { label: string; value: string; action: string };

export function CardSheet({
  act,
  rows,
  offset = 0,
}: {
  act: Act;
  rows: readonly SheetRow[];
  // Seconds the first row waits inside its action (the rooms that feed it go first)
  offset?: number;
}) {
  return (
    <dl className={styles.sheet}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={styles.sheetRow}
          {...act(row.action, "in", {
            index: i,
            count: rows.length,
            offset,
          })}
        >
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ESTADO DO CARTÃO EM UMA LINHA
// The card with its stage: the stage name is a stack of texts (the previous ones fade out, the last fades in) and the
// four segments under it fill with an amber bar as the card moves on.
export function CardStatus({
  act,
  card,
  stages,
  start,
  steps,
}: {
  act: Act;
  card: CardCopy;
  stages: readonly string[];
  // Stage the card is on when the scene begins
  start: number;
  // The stages reached after it, each with the action that gets there
  steps: readonly { stage: number; action: string }[];
}) {
  const reached = steps.length ? steps[steps.length - 1].stage : start;
  const trail = [{ stage: start, action: "" }, ...steps];
  return (
    <div className={styles.status}>
      <p className={styles.statusCard} data-focal="">
        <b>{card.title}</b>
        <span>{card.order}</span>
      </p>
      <span className={styles.statusStack}>
        {trail.map((entry, k) => {
          const last = k === trail.length - 1;
          const away = trail[k + 1]?.action;
          // Outer: visible until the card leaves the stage (fades out). Inner: visible from the moment it arrives
          // (fades in). A stage in the middle is therefore visible only between the two actions.
          return (
            <span
              key={entry.stage}
              className={last ? styles.statusLast : styles.statusPrev}
              {...(away ? act(away, "out") : {})}
            >
              <span {...(entry.action ? act(entry.action, "in") : {})}>
                {stages[entry.stage]}
              </span>
            </span>
          );
        })}
      </span>
      <ol className={styles.segments} aria-hidden="true">
        {stages.map((name, i) => {
          const step = steps.find((s) => s.stage === i);
          return (
            // The grey base never moves; the amber bar inside it is the one that wipes in
            <li key={name}>
              {i <= reached && (
                <i {...(step ? act(step.action, "wipe") : {})} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
