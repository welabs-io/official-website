// UMA INTERAÇÃO POR PRODUTO
// The play of each product page, all of them CSS over native form controls (v2.module.css, `:has(:checked)`), so they
// work with no script, with a keyboard and with a screen reader; the Domus field can also be dragged (DragToCheck).
// Each play shows a real capability of the product (v13 analysis, section 1):
// - Domus: a field dropped on the screen becomes a column of the table (the form builder);
// - Relloo: the channels of one person land in one conversation (the inbox, with the call recorded);
// - Magneto: the flow waits for the approval of a person and then goes on (wait and approval);
// - Tuner: a call goes through the options menu to the right person of the team (IVR and distribution);
// - Knowly: an answer comes with its source, and a source the person may not read stays closed (read scope).
import { Glyph, GLYPHS } from "@/components/scenes/icons";
import {
  DOMUS_PLAY,
  KNOWLY_PLAY,
  MAGNETO_PLAY,
  RELLOO_PLAY,
  TUNER_PLAY,
} from "@/lib/content/plays";
import type { ProductSlug } from "@/lib/products";
import { DragToCheck } from "./DragToCheck";
import tuner from "./tuner-play.module.css";
import styles from "./v2.module.css";

function DomusPlay() {
  return (
    <div className={styles.play} data-play="domus">
      <input
        type="checkbox"
        id="field-add"
        className={styles.toggle}
        aria-label={DOMUS_PLAY.add}
      />
      <div className={styles.window}>
        <div className={styles.fields}>
          <p className={styles.panelTitle}>{DOMUS_PLAY.fieldsTitle}</p>
          <ul>
            {DOMUS_PLAY.fields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <DragToCheck
            inputId="field-add"
            targetId="field-table"
            className={styles.newField}
          >
            <label htmlFor="field-add">
              <Glyph d={GLYPHS.image} size={16} />
              {DOMUS_PLAY.newField}
            </label>
          </DragToCheck>
        </div>
        <div id="field-table" className={styles.table}>
          <p className={styles.panelTitle}>{DOMUS_PLAY.table}</p>
          <table>
            <thead>
              <tr>
                {DOMUS_PLAY.fields.map((f) => (
                  <th key={f}>{f}</th>
                ))}
                <th className={styles.col}>{DOMUS_PLAY.newField}</th>
              </tr>
            </thead>
            <tbody>
              {DOMUS_PLAY.rows.map((row, i) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                  <td
                    className={styles.col}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <span className={styles.thumb} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RellooPlay() {
  return (
    <div className={styles.play} data-play="relloo">
      <fieldset className={styles.choices}>
        <legend className={styles.srOnly}>{RELLOO_PLAY.label}</legend>
        {RELLOO_PLAY.channels.map((c, i) => (
          <span key={c.id}>
            <input
              type="checkbox"
              id={`ch-${c.id}`}
              data-ch={c.id}
              className={styles.toggle}
              defaultChecked={i === 0}
            />
            <label htmlFor={`ch-${c.id}`} className={styles.choice}>
              <Glyph
                d={
                  c.id === "call"
                    ? GLYPHS.phone
                    : c.id === "site"
                      ? GLYPHS.globe
                      : GLYPHS.chat
                }
                size={16}
              />
              {c.label}
            </label>
          </span>
        ))}
      </fieldset>
      <div className={styles.window}>
        <div className={styles.person}>
          <span className={styles.avatar}>M</span>
          <b>{RELLOO_PLAY.person}</b>
          <span className={styles.badge}>{RELLOO_PLAY.sub}</span>
        </div>
        <ul className={styles.thread}>
          {RELLOO_PLAY.channels.map((c) => (
            <li key={c.id} data-ch={c.id}>
              <small>{c.label}</small>
              {c.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MagnetoPlay() {
  return (
    <div className={styles.play} data-play="magneto">
      <input type="checkbox" id="flow-ok" className={styles.toggle} />
      <ol className={styles.flow}>
        {MAGNETO_PLAY.steps.map((step, i) => (
          <li
            key={step}
            data-step={i}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className={styles.node}>
              <Glyph d={GLYPHS.check} size={16} />
            </span>
            <span>{step}</span>
            {i === 1 && (
              <label htmlFor="flow-ok" className={styles.approve}>
                <span data-off>{MAGNETO_PLAY.approve}</span>
                <span data-on>{MAGNETO_PLAY.approved}</span>
              </label>
            )}
            {i === 1 && <small data-off>{MAGNETO_PLAY.waiting}</small>}
          </li>
        ))}
      </ol>
    </div>
  );
}

// A LIGAÇÃO QUE CHEGA NA PESSOA CERTA
// v2.1: "Ligue e veja para onde vai" did not say what the Tuner does. Now the call of Marina rings on a phone with the
// menu of the call; a key pressed lights the wire to the person of that option, the call travels along it and the person
// answers, recorded, and the recording lands in the conversation. The drawing says it, with no sentence: wires from the
// phone to the team (an SVG in px, so the travelling call follows the same path by `offset-path`).
const WIRES = ["M0 150 C64 150 56 46 120 46", "M0 150 C64 150 56 150 120 150", "M0 150 C64 150 56 254 120 254"];

function TunerPlay() {
  return (
    <div className={tuner.play} data-play="tuner">
      <div className={tuner.phone}>
        <p className={tuner.callHead}>
          <span className={tuner.ring}>
            <Glyph d={GLYPHS.phone} size={16} />
          </span>
          {TUNER_PLAY.call}
        </p>
        <fieldset className={tuner.keys}>
          <legend>{TUNER_PLAY.menu}</legend>
          {TUNER_PLAY.options.map((o) => (
            <span key={o.key}>
              <input
                type="radio"
                name="ivr"
                id={`ivr-${o.key}`}
                data-key={o.key}
                className={styles.toggle}
              />
              <label htmlFor={`ivr-${o.key}`} className={tuner.key}>
                <b>{o.key}</b>
                {o.label}
              </label>
            </span>
          ))}
        </fieldset>
      </div>
      <div className={tuner.wires} aria-hidden="true">
        <svg viewBox="0 0 120 300" width="120" height="300">
          {WIRES.map((d, i) => (
            <g key={d} data-key={i + 1}>
              <path className={tuner.wire} d={d} />
              <path className={tuner.wireHot} d={d} />
            </g>
          ))}
        </svg>
        {WIRES.map((d, i) => (
          <i
            key={d}
            className={tuner.call}
            data-key={i + 1}
            style={{ offsetPath: `path("${d}")` }}
          />
        ))}
      </div>
      <ul className={tuner.team}>
        {TUNER_PLAY.options.map((o) => (
          <li key={o.key} data-key={o.key}>
            <span className={tuner.avatar}>{o.to[0]}</span>
            <span className={tuner.who}>
              <b>{o.to}</b>
              <small>{o.label}</small>
            </span>
            <span className={tuner.live}>
              <span className={tuner.wave}>
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              {TUNER_PLAY.recording}
            </span>
          </li>
        ))}
      </ul>
      <p className={tuner.land}>
        <span className={tuner.ok} />
        {TUNER_PLAY.land}
      </p>
    </div>
  );
}

function KnowlyPlay() {
  return (
    <div className={styles.play} data-play="knowly">
      <fieldset className={styles.choices}>
        <legend className={styles.srOnly}>{KNOWLY_PLAY.label}</legend>
        {KNOWLY_PLAY.questions.map((q, i) => (
          <span key={q.q}>
            <input
              type="radio"
              name="ask"
              id={`ask-${i}`}
              data-ask={i}
              className={styles.toggle}
              defaultChecked={i === 0}
            />
            <label htmlFor={`ask-${i}`} className={styles.choice}>
              <Glyph d={GLYPHS.search} size={16} />
              {q.q}
            </label>
          </span>
        ))}
      </fieldset>
      <div className={styles.answers}>
        {KNOWLY_PLAY.questions.map((q, i) => (
          <div key={q.q} className={styles.answer} data-ask={i}>
            <p>
              <span className={styles.answerIcon}>
                <Glyph d={q.source ? GLYPHS.spark : GLYPHS.lock} size={16} />
              </span>
              {q.a}
            </p>
            {q.source && (
              <span className={styles.source}>
                <Glyph d={GLYPHS.doc} size={14} />
                {q.source}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const PLAYS: Record<ProductSlug, () => React.JSX.Element> = {
  domus: DomusPlay,
  relloo: RellooPlay,
  magneto: MagnetoPlay,
  tuner: TunerPlay,
  knowly: KnowlyPlay,
};
