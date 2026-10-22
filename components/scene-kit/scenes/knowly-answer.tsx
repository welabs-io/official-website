"use client";
// CENA DO KNOWLY: CADA FRASE COM A SUA FONTE, DENTRO DO ACESSO
// The goals of the year are asked under the board's profile and answered sentence by sentence, each sentence with the
// line of the source it came from; the profile switches to finance and the same answer changes: the plan of the stores
// is out of its access, so that sentence closes behind a lock and so does its line on the source. A question about a
// personal data of the order's contact is answered with a neutral notice: the data is barred. v3 (2026-10-22,
// brief-v3-scenes.md) rebuilds it on the validated Relloo pilot (relloo-inbox.tsx): the question is a sent Message
// (the black bubble), the answer a Message entry whose sentences each carry their source as the lib's Badge, the
// Relloo connector runs from each sentence to its line, the profile is the lib's SegmentedControl with the black
// chosen option (Welabs UI v3 Selection), and the barred data is the lib's neutral Alert with a lock, neither red nor
// amber. Amber budget: the answer's mark while it arrives, nothing else. The continuity is the kit's
// (components/scene-kit/Scene.tsx); this file only renders from `scene`.
import { BookOpen, BookText, FileText, LockKeyhole, TextQuote } from "lucide-react";
import { Badge } from "@/components/lib/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  SegmentedControl,
  TypingDots,
} from "@/components/lib/scene";
import { KNOWLY_PLAY as K } from "@/lib/content/plays";
import { Connector } from "../Connector";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import k from "./knowly-answer.module.css";

// ROTEIRO DA CENA
// ask: the board asks, the answer types; s1, s2: each sentence lands with the trace to its line; profile: finance asks
// the same, the first sentence lands again with its trace; blocked: the second closes behind a lock, its line too;
// personal: a question about a personal data, answered by the neutral notice; done: the frame settles (1.8 s)
export const KNOWLY_ANSWER_STEPS: readonly SceneStep[] = [
  { id: "ask", hold: 1000 },
  { id: "s1", hold: 1400 },
  { id: "s2", hold: 1400 },
  { id: "profile", hold: 1400 },
  { id: "blocked", hold: 1400 },
  { id: "personal", hold: 1400 },
  { id: "done", hold: 1800 },
];

// CONTEÚDO DA CENA
const PLAN = K.sources.plan;
const BOARD = K.profiles[2];
const FINANCE = K.profiles[1];

const COPY = {
  product: "Knowly",
  title: "Perguntas",
  label: "Knowly: cada frase da resposta com a sua fonte, a resposta muda com o perfil e o dado pessoal fica de fora",
  answer: "Resposta",
  sources: "Fontes",
  profile: K.profileLabel,
  goals: K.questions[1].label,
  knowly: "Knowly",
  time: "10:12",
  time2: "10:13",
  line: "Linha",
  record: "Cadastro do pedido 1234",
  recordLines: ["Telefone do contato"],
  // A question about a personal data of the contact of the order, and the notice that answers it
  personal: "Qual é o telefone do contato?",
  barredTitle: "Dado pessoal barrado",
  barredText: "O telefone do contato fica fora da resposta.",
  barredLine: "Dado pessoal",
};

type Sentence = { key: string; text: string; line: number; sourced: boolean };

// The sentences of the answer under a profile: the board reads the whole plan, finance only its first line
const sentencesFor = (finance: boolean): Sentence[] =>
  (finance ? K.answers.goalsFinance : K.answers.goalsBoard).map((s, i) => ({
    key: `s${i + 1}`,
    text: s.text,
    line: s.line,
    sourced: s.source !== null,
  }));

// The step each sentence lands at, per profile
const LANDS: Record<string, readonly string[]> = { board: ["s1", "s2"], finance: ["profile", "blocked"] };

// MARCA DE ÍCONE
// The lib's Avatar with the icon as its fallback; its tone is painted by app/lib.css
function Mark({ tone }: { tone?: "active" | "subject" }) {
  return (
    <Avatar data-tone={tone} aria-hidden="true">
      <AvatarFallback>
        <BookOpen />
      </AvatarFallback>
    </Avatar>
  );
}

function KnowlyAnswerView({ scene }: { scene: SceneApi }) {
  const finance = scene.reached("profile");
  const profile = finance ? FINANCE : BOARD;
  const lands = LANDS[finance ? "finance" : "board"];
  const sentences = sentencesFor(finance).filter((_, i) => scene.reached(lands[i]));
  const done = scene.reached("done");
  const personal = scene.reached("personal");
  // The sentence landing now (and with it the trace to its line), if any
  const fresh = sentences.find((_, i) => scene.is(lands[i]));
  // The answer types until its first sentence lands, and keeps the live mark while sentences arrive
  const typing = sentences.length === 0;
  const answering = !personal && !done;
  // The lines of the plan cited so far, and the ones out of the profile's access
  const cited = new Set(sentences.filter((s) => s.sourced).map((s) => s.line));
  const locked = new Set(sentences.filter((s) => !s.sourced).map((s) => s.line));
  const lineState = (i: number) =>
    locked.has(i) ? "locked" : fresh?.sourced && fresh.line === i ? "active" : cited.has(i) ? "cited" : "idle";
  return (
    <div className={k.split}>
      {/* The question and its answer, under the profile of whoever asks */}
      <section className={k.answer} aria-label={COPY.answer}>
        <div className={k.bar}>
          <p className={p.paneHead}>{COPY.profile}</p>
          {/* The lib's SegmentedControl (md); the chosen option is the black primary (this scene's sheet) */}
          <span className={k.profiles}>
            <SegmentedControl
              aria-label={COPY.profile}
              value={profile.id}
              onValueChange={(v) => scene.take(v === FINANCE.id ? "profile" : "ask")}
              items={[
                { value: BOARD.id, label: BOARD.label },
                { value: FINANCE.id, label: FINANCE.label },
              ]}
            />
          </span>
        </div>

        <div className={k.thread}>
          <p className={`${p.bubble} ${k.asked}`} data-kind="sent">
            {COPY.goals}
          </p>

          {/* The answer, a Message entry: the mark, the meta line (who answers, under which profile) and the
              sentences, each with its source; keyed by the profile, so the new answer replaces the old one at once */}
          <div key={`${scene.cycle}-${profile.id}`} className={k.entry}>
            <span className={k.entryMark}>
              <Mark tone={answering ? "active" : "subject"} />
            </span>
            <div className={k.entryBody}>
              <p className={k.meta}>
                <b>{COPY.knowly}</b>
                <span>
                  {profile.label} · {COPY.time}
                </span>
              </p>
              {typing ? (
                <span className={k.typing}>
                  <TypingDots size={5} gap={3} />
                </span>
              ) : (
                <ol className={k.sentences}>
                  {sentences.map((s) => (
                    <li
                      key={s.key}
                      className={k.sentence}
                      data-sentence={s.key}
                      // A closed sentence may wrap on a phone: its lock is measured on its first line (data-axis-pair),
                      // a sourced one as text against its source (data-axis)
                      data-axis={s.sourced ? "sentence" : undefined}
                      data-axis-pair=""
                      data-state={!done && s === fresh && s.sourced ? "active" : s.sourced ? "done" : "locked"}
                    >
                      {s.sourced ? null : <LockKeyhole className={k.lock} aria-hidden="true" />}
                      <span className={k.text}>{s.text}</span>
                      {s.sourced ? (
                        <Badge variant="neutral" appearance="soft" className={k.cite} data-cite={s.key}>
                          <TextQuote data-icon="inline-start" aria-hidden="true" />
                          {COPY.line} {s.line + 1}
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {personal ? (
            <>
              <p className={`${p.bubble} ${k.asked} ${k.arrive}`} data-kind="sent">
                {COPY.personal}
              </p>
              {/* The answer to it, a Message entry whose body is the barred data: the lib's neutral Alert with a
                  lock, never red nor amber; a note, not an alert (the loop would announce it on every pass) */}
              <div className={`${k.entry} ${k.arrive}`}>
                <span className={k.entryMark}>
                  <Mark tone="subject" />
                </span>
                <div className={k.entryBody}>
                  <p className={k.meta}>
                    <b>{COPY.knowly}</b>
                    <span>
                      {profile.label} · {COPY.time2}
                    </span>
                  </p>
                  <Alert variant="neutral" role="note" className={k.notice} data-notice="">
                    <LockKeyhole aria-hidden="true" />
                    <AlertTitle>{COPY.barredTitle}</AlertTitle>
                    <AlertDescription>{COPY.barredText}</AlertDescription>
                  </Alert>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* The sources: the line each sentence came from lights; a line out of the profile's access closes */}
      <section className={k.sources} aria-label={COPY.sources}>
        <div className={k.bar}>
          <p className={p.paneHead}>{COPY.sources}</p>
          <Badge variant="neutral" appearance="soft">
            2
          </Badge>
        </div>
        <div className={k.docs}>
          <div className={k.doc} data-doc="plan">
            <div className={k.docHead} data-axis="doc">
              <span className={k.docMark} aria-hidden="true">
                <BookText />
              </span>
              <b className={k.docTitle}>{PLAN.title}</b>
            </div>
            <ol className={k.lines}>
              {PLAN.lines.map((text, i) => {
                const state = lineState(i);
                return (
                  <li key={text} className={k.line} data-line={i} data-state={state} data-axis="line" data-axis-pair="">
                    <span className={k.num} aria-hidden="true">
                      {state === "locked" ? <LockKeyhole /> : i + 1}
                    </span>
                    <span key={state === "locked" ? "locked" : "open"} className={k.lineText}>
                      {state === "locked" ? K.blocked : text}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          {/* The record of the order: the personal data is there, and stays out of the answer */}
          <div className={k.doc} data-doc="record">
            <div className={k.docHead} data-axis="doc">
              <span className={k.docMark} aria-hidden="true">
                <FileText />
              </span>
              <b className={k.docTitle}>{COPY.record}</b>
            </div>
            <ol className={k.lines}>
              {COPY.recordLines.map((text, i) => {
                const barred = personal;
                return (
                  <li
                    key={text}
                    className={k.line}
                    data-line={`record-${i}`}
                    data-state={barred ? "locked" : "idle"}
                    data-axis="line"
                    data-axis-pair=""
                  >
                    <span className={k.num} aria-hidden="true">
                      {barred ? <LockKeyhole /> : i + 1}
                    </span>
                    <span key={barred ? "locked" : "open"} className={k.lineText}>
                      {barred ? `${text}: ${COPY.barredLine.toLowerCase()}` : text}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {fresh?.sourced && !scene.ghost ? <Connector from={`[data-cite="${fresh.key}"]`} to={`[data-line="${fresh.line}"]`} /> : null}
    </div>
  );
}

export function KnowlyAnswer({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="knowly-answer"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      steps={KNOWLY_ANSWER_STEPS}
      timeline={timeline}
    >
      {(scene) => <KnowlyAnswerView scene={scene} />}
    </Scene>
  );
}
