// PAINEL DE FONTE (KNOWLY)
// The question, the document of the policy, the line that answers it highlighted, and the answer it becomes with the
// pill of its source. `hit` highlights one line (a wipe), `answer` brings the answer and the pill in.
import type { Act } from "@/lib/scenes/types";
import styles from "./scenes.module.css";

export function SourcePanel({
  act,
  question,
  title,
  lines,
  hit,
  answer,
  docAction,
  hitAction,
  answerAction,
}: {
  act: Act;
  question: string;
  title: string;
  lines: readonly string[];
  // Index of the line that answers the question
  hit: number;
  answer: string;
  docAction: string;
  hitAction: string;
  answerAction: string;
}) {
  return (
    <div className={styles.source}>
      <p className={styles.query}>
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
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.5-4.5" />
        </svg>
        <span>{question}</span>
      </p>
      <div className={styles.doc} {...act(docAction, "in")}>
        <p className={styles.docTitle}>{title}</p>
        <ul>
          {lines.map((line, i) => (
            <li key={line} data-hit={i === hit ? "" : undefined}>
              {i === hit && (
                <span className={styles.hitMark} {...act(hitAction, "wipe")} />
              )}
              <span
                className={i === hit ? styles.focal : undefined}
                data-focal={i === hit ? "" : undefined}
              >
                {line}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.answer} {...act(answerAction, "pop")}>
        <b data-focal="">{answer}</b>
        <span
          className={styles.pill}
          {...act(answerAction, "in", { offset: 0.2 })}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM8 7h7" />
          </svg>
          {title}
        </span>
      </div>
    </div>
  );
}
