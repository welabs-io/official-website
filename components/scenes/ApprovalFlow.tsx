// FLUXO DE APROVAÇÃO (MAGNETO)
// The rule in three steps. The first and the third are done by the flow (a check), the second waits for the Gestora,
// who taps the button; the amber bar between steps fills as each one is done. `rule` brings the rule and step 1 in,
// `approve` is the tap and step 2, `finish` is step 3.
import type { Act } from "@/lib/scenes/types";
import styles from "./scenes.module.css";

const CHECK = (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

export function ApprovalFlow({
  act,
  rule,
  manager,
  steps,
  button,
  actions,
}: {
  act: Act;
  rule: string;
  manager: string;
  steps: readonly [string, string, string];
  button: string;
  actions: { rule: string; approve: string; finish: string };
}) {
  // The action that completes each step
  const done = [actions.rule, actions.approve, actions.finish];
  return (
    <div className={styles.flow}>
      <p className={styles.ruleChip} {...act(actions.rule, "in")}>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10M16 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
        {rule}
      </p>
      <ol className={styles.steps}>
        {steps.map((label, i) => (
          <li key={label} className={styles.step}>
            <span className={styles.stepLink} aria-hidden="true">
              <i {...act(done[i], "wipe")} />
            </span>
            <span className={styles.stepDot} {...act(done[i], "pop")}>
              {CHECK}
            </span>
            <span
              className={
                i === 1 ? `${styles.stepName} ${styles.focal}` : styles.stepName
              }
              data-focal={i === 1 ? "" : undefined}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
      <div className={styles.manager}>
        <span className={styles.avatar} aria-hidden="true">
          {manager[0]}
        </span>
        <b>{manager}</b>
        <span className={styles.tap} {...act(actions.approve, "light")}>
          {button}
        </span>
      </div>
    </div>
  );
}
