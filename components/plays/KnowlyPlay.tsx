// KNOWLY: RESPOSTAS COM FONTE, DENTRO DO ACESSO
// v2.2 (audit A05, M09, section 4; references: the HyperFrames pieces kb-ask-with-proof and kb-who-reads-what). A
// profile and a question: the answer comes sentence by sentence, each with the number of its source, and the line it
// came from lights on the source card (pointing at or focusing a number lights it again). Changing the profile changes
// the same answer: the board reads the whole plan, finance part of it, support none ("Fora do seu acesso", the source
// behind a lock). The delivery answer goes onto the order in the Domus with its source. States: knowly.module.css.
import { Glyph, GLYPHS } from "@/components/scenes/icons";
import { KNOWLY_PLAY as K } from "@/lib/content/plays";
import k from "./knowly.module.css";
import {
  at,
  Choice,
  Choices,
  DomusRecord,
  LogLine,
  PlayForm,
  PlayLog,
  RecordLine,
} from "./parts";

type Sentence = (typeof K.answers)[keyof typeof K.answers][number];
type SourceId = keyof typeof K.sources;

// One answer: its sentences in order, each with the number of its source (or the lock of a source out of reach)
function Answer({
  ev,
  sentences,
}: {
  ev: string;
  sentences: readonly Sentence[];
}) {
  return (
    <p className={k.answer} data-ev={ev} style={at(0)}>
      {sentences.map((s, i) => (
        <span key={s.text} className={k.sentence} style={at(1 + i)}>
          {s.text}
          {s.source ? (
            <a
              href={`#kn-${s.source}`}
              className={k.ref}
              data-ref={`${s.source}-${s.line}`}
            >
              {i + 1}
            </a>
          ) : (
            <span className={k.lockRef}>
              <Glyph d={GLYPHS.lock} size={12} />
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

// A source card: its lines, the lines an answer cites lit in the order of the answer
function Source({
  id,
  ev,
  lit,
  locked,
}: {
  id: SourceId;
  ev: string;
  // Per state, the lines lit and the beat each one lights
  lit: { ev: string; line: number; beat: number }[];
  // Per state, the lines behind a lock
  locked?: { ev: string; lines: number[] }[];
}) {
  const source = K.sources[id];
  return (
    <div
      id={`kn-${id}`}
      className={k.source}
      data-ev={ev}
      style={at(1)}
      role="group"
      aria-label={source.title}
    >
      <p className={k.sourceTitle}>
        <Glyph d={GLYPHS.doc} size={14} />
        {source.title}
      </p>
      <ol className={k.lines}>
        {source.lines.map((line, n) => (
          <li key={line} data-line={`${id}-${n}`}>
            {line}
            {lit
              .filter((l) => l.line === n)
              .map((l) => (
                <i
                  key={l.ev}
                  className={k.lit}
                  data-ev={l.ev}
                  style={at(l.beat)}
                />
              ))}
            {locked
              ?.filter((l) => l.lines.includes(n))
              .map((l) => (
                <span
                  key={l.ev}
                  className={k.veil}
                  data-ev={l.ev}
                  style={at(2)}
                >
                  <Glyph d={GLYPHS.lock} size={12} />
                </span>
              ))}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function KnowlyPlay() {
  const controls = (
    <>
      <Choices legend={K.profileLabel}>
        {K.profiles.map((p, i) => (
          <Choice
            key={p.id}
            id={`kn-${p.id}`}
            name="kn-profile"
            type="radio"
            checked={i === 0}
          >
            <Glyph d={GLYPHS.user} size={16} />
            {p.label}
          </Choice>
        ))}
      </Choices>
      <Choices legend={K.questionLabel}>
        {K.questions.map((q) => (
          <Choice key={q.id} id={`kn-${q.id}`} name="kn-question" type="radio">
            <Glyph d={GLYPHS.search} size={16} />
            {q.label}
          </Choice>
        ))}
      </Choices>
    </>
  );

  const stage = (
    <div className={k.screen}>
      <div className={k.chat}>
        <p className={k.hint}>{K.hint}</p>
        {K.questions.map((q) => (
          <p key={q.id} className={k.question} data-ev={q.id} style={at(0)}>
            {q.label}
          </p>
        ))}
        <Answer ev="ship" sentences={K.answers.ship} />
        <Answer ev="gb" sentences={K.answers.goalsBoard} />
        <Answer ev="gf" sentences={K.answers.goalsFinance} />
        <p className={k.blocked} data-ev="gs" style={at(1)}>
          <Glyph d={GLYPHS.lock} size={16} />
          {K.blocked}
        </p>
      </div>
      <div className={k.sources}>
        <Source
          id="policy"
          ev="ship"
          lit={[
            { ev: "ship", line: 1, beat: 1 },
            { ev: "ship", line: 2, beat: 2 },
          ]}
        />
        <Source
          id="plan"
          ev="gb gf gs"
          lit={[
            { ev: "gb", line: 0, beat: 1 },
            { ev: "gb", line: 1, beat: 2 },
            { ev: "gf", line: 0, beat: 1 },
          ]}
          locked={[
            { ev: "gf", lines: [1, 2] },
            { ev: "gs", lines: [0, 1, 2] },
          ]}
        />
      </div>
    </div>
  );

  const side = (
    <>
      <PlayLog>
        <LogLine ev="ship" time="14:02" beat={4} tone="ok">
          {K.log.ship}
        </LogLine>
        <LogLine ev="gb" time="14:03" beat={4} tone="ok">
          {K.log.board}
        </LogLine>
        <LogLine ev="gf" time="14:03" beat={4} tone="wait">
          {K.log.finance}
        </LogLine>
        <LogLine ev="gs" time="14:03" beat={4} tone="fail">
          {K.log.support}
        </LogLine>
      </PlayLog>
      <DomusRecord>
        <RecordLine>{K.recordIdle}</RecordLine>
        <RecordLine ev="ship" beat={4.5}>
          {K.record}
        </RecordLine>
      </DomusRecord>
    </>
  );

  return (
    <PlayForm
      slug="knowly"
      label={K.label}
      className={k.root}
      controls={controls}
      stage={stage}
      side={side}
    />
  );
}
