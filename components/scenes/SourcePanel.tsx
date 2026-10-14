// PAINEL DE FONTE (KNOWLY)
// Two panes. On the left, the document of the policy: its title and date, the real lines, the line that answers the
// question marked in pale amber with an amber bar, and the rest of the document as skeleton bars. On the right, the
// question as a search field and the answer card: the answer (the key element of the scene), one line of detail and the
// pill of its source, tied to the marked line by a dashed connector. `hit` marks the line (a wipe), `answer` brings the
// card in.
import type { Act } from "@/lib/scenes/types";
import { Glyph, GLYPHS } from "./icons";
import styles from "./scenes.module.css";

export function SourcePanel({
  act,
  question,
  doc,
  answer,
  related,
  docAction,
  hitAction,
  answerAction,
}: {
  act: Act;
  question: string;
  doc: {
    title: string;
    meta: string;
    lines: readonly string[];
    // Index of the line that answers the question
    hit: number;
    // The other sections of the document, drawn as their heading and skeleton bars
    sections: readonly string[];
  };
  answer: { label: string; text: string; detail: string; source: string };
  related: { title: string; questions: readonly string[] };
  docAction: string;
  hitAction: string;
  answerAction: string;
}) {
  const flown = act(answerAction, "fly");
  return (
    <div className={styles.source}>
      <div className={styles.doc} data-edge="" {...act(docAction, "in")}>
        <p className={styles.docHead}>
          <span className={styles.iconBox}>
            <Glyph d={GLYPHS.doc} size={16} />
          </span>
          <span className={styles.who}>
            <b>{doc.title}</b>
            <span>{doc.meta}</span>
          </span>
        </p>
        <ul className={styles.docLines}>
          {doc.lines.map((line, i) => (
            <li key={line} data-hit={i === doc.hit ? "" : undefined}>
              {i === doc.hit && (
                <span className={styles.hitMark} {...act(hitAction, "wipe")} />
              )}
              <span>{line}</span>
              {i === doc.hit && (
                <span
                  className={styles.wire}
                  aria-hidden="true"
                  {...act(answerAction, "wipe", { length: 0.25 })}
                />
              )}
            </li>
          ))}
        </ul>
        <span className={styles.skeleton} aria-hidden="true">
          <i />
          <i />
        </span>
        {doc.sections.map((section) => (
          <div key={section} className={styles.docMore}>
            <p className={styles.docSection}>{section}</p>
            <span className={styles.skeleton} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        ))}
      </div>
      <div className={styles.ask}>
        <p className={styles.query} data-edge="">
          <Glyph d={GLYPHS.search} size={14} />
          <span>{question}</span>
        </p>
        {/* The answer flies out of the document on the left, where its line was marked (ludic pass) */}
        <div
          className={styles.answer}
          data-edge=""
          {...flown}
          style={
            {
              ...flown.style,
              "--fx": "-12rem",
              "--fy": "1rem",
            } as React.CSSProperties
          }
        >
          <p className={styles.answerLabel}>
            <Glyph d={GLYPHS.spark} size={14} />
            {answer.label}
          </p>
          <b className={styles.key} data-key="">
            {answer.text}
          </b>
          <p className={styles.answerDetail}>{answer.detail}</p>
          <span
            className={styles.pillInfo}
            {...act(answerAction, "in", { offset: 0.2 })}
          >
            <Glyph d={GLYPHS.book} size={12} />
            {answer.source}
          </span>
          {/* Questions close to this one, as a quiet row of chips on the floor of the card */}
          <div className={styles.related}>
            <p>{related.title}</p>
            <ul>
              {related.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
