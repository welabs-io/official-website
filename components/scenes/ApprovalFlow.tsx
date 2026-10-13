// FLUXO DE APROVAÇÃO (MAGNETO)
// The rule as a panel: its name and, under it, three steps on a vertical line. Each step is a 24 px node (an empty sand
// ring while it waits, a filled success node with a check when done) with its name and who does it. The first and the
// third are done by the flow; the second waits for the Gestora, whose row holds the button: a graphite button before
// the tap, a success pill with the time after it. The connector runs behind the nodes. `rule` brings the rule and step 1
// in, `approve` is the tap and step 2, `finish` is step 3.
import type { Act } from "@/lib/scenes/types";
import { Glyph, GLYPHS } from "./icons";
import styles from "./scenes.module.css";

export function ApprovalFlow({
  act,
  rule,
  title,
  meta,
  steps,
  stepsMeta,
  manager,
  managerName,
  button,
  approved,
  actions,
}: {
  act: Act;
  rule: string;
  title: string;
  meta: string;
  steps: readonly [string, string, string];
  // Who does each step
  stepsMeta: readonly [string, string, string];
  manager: string;
  managerName: string;
  button: string;
  // The pill that replaces the button after the tap (text and time)
  approved: readonly [string, string];
  actions: { rule: string; approve: string; finish: string };
}) {
  // The action that completes each step
  const done = [actions.rule, actions.approve, actions.finish];
  return (
    <div className={styles.flow} data-edge="">
      <p className={styles.panelHead} {...act(actions.rule, "in")}>
        <span className={styles.iconBox}>
          <Glyph d={GLYPHS.rule} size={16} />
        </span>
        <span className={styles.who}>
          <b>{title}</b>
          <span>
            {rule}, {meta}
          </span>
        </span>
      </p>
      <ol className={styles.steps}>
        {steps.map((label, i) => (
          <li key={label} className={styles.step}>
            {/* The line to the next node sits behind the nodes and fills when this step is done */}
            {i < steps.length - 1 ? (
              <span className={styles.stepLink} aria-hidden="true">
                <i {...act(done[i], "wipe")} />
              </span>
            ) : null}
            <span className={styles.stepNode} aria-hidden="true">
              <span className={styles.stepDone} {...act(done[i], "pop")}>
                <Glyph d={GLYPHS.check} size={12} />
              </span>
            </span>
            <span className={styles.stepText}>
              <b>{label}</b>
              <span>{stepsMeta[i]}</span>
            </span>
            {i === 1 ? (
              <span className={styles.approval}>
                <span className={styles.avatarSm} aria-hidden="true">
                  {managerName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span className={styles.who}>
                  <b>{managerName}</b>
                  <span>{manager}</span>
                </span>
                <span className={styles.decide}>
                  <span
                    className={styles.button}
                    {...act(actions.approve, "out", { length: 0.15 })}
                  >
                    {button}
                  </span>
                  <span
                    className={styles.pillOk}
                    {...act(actions.approve, "pop", { offset: 0.15 })}
                  >
                    <Glyph d={GLYPHS.check} size={12} />
                    {approved[0]} {approved[1]}
                  </span>
                </span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
