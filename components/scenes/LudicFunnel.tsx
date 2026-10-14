// FUNIL QUE RECEBE O CARTÃO (PILOTO LÚDICO, CENA S2 DO RELLOO)
// The funnel of the Relloo as a board of four lanes with depth, and the card of the order as the one object that moves.
// The card springs into Novo and the counter of the lane rolls to 1; the facts of the card rise one after the other in
// the panel beside it while the emblems on the card pop as each one arrives; then the card travels to Em análise, lifted
// and tilted on the way, the highlight passes from one lane to the other and both counters roll. The logo of the Relloo
// swells when the card is born. Interface text of 11 to 13 px; the key element is the title of the card (18 px). Server
// markup, timed by the script (`act`); the settled frame is plain CSS.
import type { Act } from "@/lib/scenes/types";
import { STORY } from "@/lib/scenes/story";
import { Glyph, GLYPHS } from "./icons";
import l from "./ludic.module.css";
import styles from "./scenes.module.css";

const { card, stages } = STORY;
const { owner, deadline, history, followup } = card.facts;
const FACTS = [
  { ...owner, icon: GLYPHS.user },
  { ...deadline, icon: GLYPHS.clock },
  { ...history, icon: GLYPHS.history },
  { ...followup, icon: GLYPHS.calendar },
];
const TONES = ["new", "info", "warn", "ok"] as const;

// A counter that rolls through `values`: one nested column per change, each moving one row up with its own action
function Roll({
  act,
  values,
  actions,
}: {
  act: Act;
  values: readonly number[];
  actions: readonly string[];
}) {
  const column = (
    <span className={l.rollCol}>
      {values.map((v, i) => (
        <span key={i}>{v}</span>
      ))}
    </span>
  );
  // The innermost wrapper takes the first change; each outer one the next. At rest the column shows the last value.
  return (
    <em className={l.roll}>
      {actions.reduce(
        (inner, action, i) => (
          <span
            key={i}
            className={l.rollStep}
            {...act(action, "roll", { length: 0.2 })}
          >
            {inner}
          </span>
        ),
        column,
      )}
    </em>
  );
}

export function LudicFunnel({ act }: { act: Act }) {
  const others = STORY.others;
  const lift = act("review", "lift", { length: 0.25 });
  return (
    <div className={`${styles.duo} ${styles.duoFunnel}`}>
      <div className={l.board} data-edge="">
        <p className={l.boardHead}>
          <b>{STORY.funnel}</b>
          <span>{others.length + 1} abertos</span>
        </p>
        <ol className={l.lanes}>
          {stages.map((name, i) => {
            const other = others.find((o) => o.stage === i);
            return (
              <li key={name} className={l.lane} data-tone={TONES[i]}>
                {/* The highlight of the lane the card is on: Novo between its birth and the move, Em análise after */}
                {i === 0 ? (
                  <span
                    className={`${l.glow} ${l.glowLeft}`}
                    {...act("review", "out", { length: 0.16 })}
                  >
                    <span {...act("born", "in", { length: 0.16 })} />
                  </span>
                ) : null}
                {i === 1 ? (
                  <span className={l.glow}>
                    <span
                      {...act("review", "in", { offset: 0.12, length: 0.15 })}
                    />
                  </span>
                ) : null}
                <span className={l.laneHead}>
                  <i className={styles.dot} data-tone={TONES[i]} />
                  <span>{name}</span>
                  {i === 0 ? (
                    <Roll
                      act={act}
                      values={[0, 1, 0]}
                      actions={["born", "review"]}
                    />
                  ) : i === 1 ? (
                    <Roll act={act} values={[0, 1]} actions={["review"]} />
                  ) : (
                    <em className={l.roll}>{other ? 1 : 0}</em>
                  )}
                </span>
                <span className={l.laneBody}>
                  {i === 1 ? (
                    <span
                      className={l.travel}
                      {...lift}
                      style={{ ...lift.style, ["--dy" as string]: "-100%" }}
                    >
                      <span
                        className={l.deal}
                        {...act("born", "spring", { length: 0.2 })}
                      >
                        <b className={l.key} data-key="">
                          {card.title}
                        </b>
                        <span className={l.dealFoot}>
                          <span>{card.order}</span>
                          <span className={l.emblems} aria-hidden="true">
                            {[...FACTS.map((f) => f.icon), GLYPHS.truck].map(
                              (d, k) => (
                                <span key={k} className={l.emblem}>
                                  <Glyph d={d} size={12} />
                                  {k < 4 ? (
                                    <span
                                      className={l.emblemOn}
                                      {...act("facts", "spring", {
                                        index: k,
                                        count: 4,
                                        length: 0.16,
                                      })}
                                    >
                                      <Glyph d={d} size={12} />
                                    </span>
                                  ) : null}
                                </span>
                              ),
                            )}
                          </span>
                          <span className={l.owner} aria-hidden="true">
                            {owner.value[0]}
                          </span>
                        </span>
                      </span>
                    </span>
                  ) : other ? (
                    <span className={l.other}>
                      <b>{other.title}</b>
                      <span>{other.order}</span>
                    </span>
                  ) : (
                    <span className={l.empty} />
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* The facts of the card, one row each, arriving with the emblems */}
      <div className={l.sheet} data-edge="">
        <p className={l.boardHead}>
          <b>{card.details}</b>
          <span>{card.order}</span>
        </p>
        <dl className={l.facts}>
          {FACTS.map((f, k) => (
            <div
              key={f.label}
              className={l.fact}
              {...act("facts", "rise", { index: k, count: 4, length: 0.16 })}
            >
              <dt>
                <span className={l.factIcon}>
                  <Glyph d={f.icon} size={12} />
                </span>
                {f.label}
              </dt>
              <dd>{f.value}</dd>
            </div>
          ))}
          <div className={`${l.fact} ${l.factPending}`}>
            <dt>
              <span className={l.factIcon}>
                <Glyph d={GLYPHS.truck} size={12} />
              </span>
              {card.pending}
            </dt>
            <dd>
              <span className={l.dash} aria-hidden="true" />
            </dd>
          </div>
          {/* Who asked and where, already known from the Tuner: quiet, they were there before the card */}
          {card.origin.map((o, k) => (
            <div key={o.label} className={`${l.fact} ${l.factQuiet}`}>
              <dt>
                <span className={l.factIcon}>
                  <Glyph d={k === 0 ? GLYPHS.user : GLYPHS.chat} size={12} />
                </span>
                {o.label}
              </dt>
              <dd>{o.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
