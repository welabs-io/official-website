"use client";
// CENA DO KNOWLY: A MEMÓRIA DE UM ASSUNTO, EM 4 QUADROS
// The carousel of the approved canvas frames V3Knowly-1..4 (brief-v3-carousel, 2026-10-22): the subject
// "Contato 4821 · manutenção" told on one line of time. 1: the line, with what happened on it (the order, the visit);
// 2: a decision lands on day 3 with its 2 proofs; 3: who took part and in which role, each pointing at its day; 4: two
// months later the memory answers why the contract changed, citing its 2 proofs (the trace runs from each citation back
// to the decision), and the frame closes with the short question and the lib's primary "Agendar uma demonstração".
// The appetizer shows the effect, never the mechanism. One kit Scene: each frame is a group of steps; the frames cross
// with the site's three curves (the outgoing one leaves on the in-out curve, the incoming one enters on the out curve,
// the live piece of each frame lands on the spring), never a cut. The indicator of the frame (1 to 4, the kit's
// FrameIndicator) sits in the chrome bar, as in the frames. Amber budget: one piece per frame (the live card), none on the settled frame. The continuity
// (autoplay, loop, human take, off-screen, reduced motion = the settled frame) is the kit's (components/scene-kit/
// Scene.tsx); this file only renders from `scene`.
import {
  CalendarDays,
  CircleAlert,
  FileText,
  Link,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ActionButton, Badge } from "@/components/lib/ui";
import { TypingDots } from "@/components/lib/scene";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { CTA_LABEL } from "@/lib/products";
import { Connector } from "../Connector";
import { FrameIndicator } from "../FrameIndicator";
import { Scene, SCENE_CURVE, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import k from "./knowly-carousel.module.css";

// ROTEIRO DA CENA
// Four frames of about 2.4 to 4.8 s, each a group of steps: the frame enters with its steady pieces, then its live
// piece lands (and, in frames 3 and 4, its trace runs). No step holds longer than 1.8 s, so a human take plays to the
// end, holds about a second and gives the scene back. The settled frame (done) is the whole of frame 4.
export const KNOWLY_CAROUSEL_STEPS: readonly SceneStep[] = [
  { id: "line", hold: 900 },
  { id: "record", hold: 1500 },
  { id: "decision", hold: 900 },
  { id: "proofs", hold: 1500 },
  { id: "asked", hold: 900 },
  { id: "approved", hold: 1500 },
  { id: "ask", hold: 900 },
  { id: "answer", hold: 900 },
  { id: "cite", hold: 1100 },
  { id: "done", hold: 1800 },
];

// The steps of each frame, in order
const FRAMES = [
  ["line", "record"],
  ["decision", "proofs"],
  ["asked", "approved"],
  ["ask", "answer", "cite", "done"],
] as const;

const indexOf = (id: string) =>
  KNOWLY_CAROUSEL_STEPS.findIndex((s) => s.id === id);
// The frame (1 to 4) a step belongs to
const frameAt = (index: number) =>
  FRAMES.findIndex((ids) => ids.some((id) => indexOf(id) === index)) + 1;

// CONTEÚDO DA CENA
// The subject's line: what happened, when (the thread of the Pedido 1234, v3-plan/fichas-finais.md moments 1 to 14)
type EventId = "talk" | "visit" | "decision" | "contract" | "paid";
type LineEvent = { id: EventId; kind: string; title: string; day: string };
const EVENTS: readonly LineEvent[] = [
  { id: "talk", kind: "Conversa", title: "Pedido", day: "Dia 1" },
  { id: "visit", kind: "Vistoria", title: "Registro", day: "Dia 2" },
  { id: "decision", kind: "2 provas", title: "Decisão", day: "Dia 3" },
  {
    id: "contract",
    kind: "Registro",
    title: "Contrato assinado",
    day: "Dia 5",
  },
  { id: "paid", kind: "Registro", title: "Fatura paga", day: "Dia 35" },
];

// The proofs of the decision, with the Domus glyphs (Video for a meeting, FileText for a document)
type Proof = { id: string; label: string; cite: string; icon: LucideIcon };
const PROOFS: readonly Proof[] = [
  { id: "meeting", label: "Reunião", cite: "Reunião · dia 3", icon: Video },
  {
    id: "proposal",
    label: "Proposta",
    cite: "Proposta 905 · dia 3",
    icon: FileText,
  },
];

// A click on a citation replays the answer: the proofs are cited again and their traces run back to the decision. The
// kit gives the scene back 8 s after a gesture, so a take must reach the settled frame well within that (from here,
// 3.8 s); a take from frame 2 (9.5 s) would be cut before the frame settles
const TAKE_FROM = "answer";

// Who took part, under the day they acted on (no name, no face: a role and a number)
type Part = {
  id: string;
  who: string;
  acts: readonly string[];
  note?: string;
  on: EventId;
  step: string;
};
const PARTS: readonly Part[] = [
  { id: "asker", who: "Pessoa 2", acts: ["Pediu"], on: "talk", step: "asked" },
  {
    id: "lead",
    who: "Pessoa 1",
    acts: ["Negociou", "Aprovou"],
    note: "na reunião e na proposta",
    on: "decision",
    step: "approved",
  },
];

const COPY = {
  product: "Knowly",
  title: "Memória",
  label:
    "Knowly: a memória de um assunto numa linha do tempo, a decisão com as suas provas, quem participou, e a resposta que mostra de onde veio",
  subject: "Contato 4821 · manutenção",
  subjectNote: "tudo o que aconteceu no assunto, numa linha só",
  decisionHead: "Uma decisão, com as provas junto",
  decisionNote: "o que foi combinado entra na linha já com 2 provas",
  proofsCount: "2 provas",
  answerHead: "Resposta com 2 provas",
  answerNote: "Dois meses depois, a memória responde e mostra de onde veio.",
  assistant: "Assistente",
  where: "no Relloo · dia 60",
  question: "por que o contrato do Contato 4821 mudou?",
  answerLabel: "Resposta pela memória",
  answer: "Decidido no dia 3",
  answerText:
    "As condições mudaram na reunião, e a proposta foi revisada e aprovada no mesmo dia.",
  cited: "Provas citadas",
  missing: "Avisa o que ainda falta: 1 ligação",
  close: "O que a sua empresa já decidiu e esqueceu?",
};

// O MOMENTO VISTO POR UM QUADRO
// A frame renders from one step of the clock: the live step in the live layer, the last step of each frame in the hidden
// copy that sizes the window (all four frames share its cell, so the window is as tall as the tallest frame)
type Beat = {
  frame: number;
  reached: (id: string) => boolean;
  is: (id: string) => boolean;
  take: (id?: string) => void;
  ghost: boolean;
};

const beatAt = (index: number, scene: SceneApi): Beat => ({
  frame: frameAt(index),
  reached: (id) => index >= indexOf(id),
  is: (id) => index === indexOf(id),
  take: scene.take,
  ghost: scene.ghost,
});

// O CARTÃO E O PONTO DE CADA ACONTECIMENTO
// What each event shows in a frame: its card (none, at rest, live in amber, chosen with the ink ring), its dot on the
// line (future, past, now, the decision's ring, paid in green) and its day (future, past, now)
type Look = {
  card: "none" | "rest" | "live" | "chosen";
  dot: "future" | "past" | "now" | "decision" | "paid";
  day: "future" | "past" | "now";
};

function lookOf(ev: LineEvent, beat: Beat): Look {
  if (beat.frame === 1) {
    if (ev.id === "talk") return { card: "rest", dot: "past", day: "past" };
    if (ev.id === "visit" && beat.reached("record"))
      return { card: "live", dot: "now", day: "now" };
    return { card: "none", dot: "future", day: "future" };
  }
  const dot =
    ev.id === "decision" ? "decision" : ev.id === "paid" ? "paid" : "past";
  const day = ev.id === "decision" ? "now" : "past";
  if (ev.id !== "decision") return { card: "rest", dot, day };
  return { card: beat.frame === 2 ? "live" : "chosen", dot, day };
}

// The decision while it lands (frame 2): its title, its count and its proofs arriving one after the other as the lib's
// Badge (their place is held from the start, so the card never grows under the reader)
function DecisionLive({ beat }: { beat: Beat }) {
  return (
    <>
      <span className={k.decisionTop}>
        <b className={k.decisionTitle}>Decisão</b>
        <span className={k.count}>{COPY.proofsCount}</span>
      </span>
      <span className={k.proofs}>
        {PROOFS.map((proof) => {
          const Icon = proof.icon;
          return (
            <Badge
              key={proof.id}
              variant="neutral"
              appearance="soft"
              className={k.proof}
              data-in={beat.reached("proofs")}
            >
              <Icon data-icon="inline-start" aria-hidden="true" />
              {proof.label}
            </Badge>
          );
        })}
      </span>
    </>
  );
}

function EventCard({
  ev,
  look,
  beat,
}: {
  ev: LineEvent;
  look: Look;
  beat: Beat;
}) {
  if (look.card === "none") return <span className={k.pieceSlot} />;
  const live = look.card === "live";
  return (
    <span className={k.pieceSlot}>
      <span
        className={`${k.piece} ${live ? k.land : ""}`}
        data-card={ev.id}
        data-tone={look.card}
        data-big={live && ev.id === "decision" ? "" : undefined}
      >
        {live && ev.id === "decision" ? (
          <DecisionLive beat={beat} />
        ) : (
          <>
            <span className={k.kind}>{ev.kind}</span>
            <b className={k.pieceTitle}>{ev.title}</b>
          </>
        )}
      </span>
    </span>
  );
}

// A part (who took part) under the day it acted on: the role's marker, the number, the acts as the lib's Badge
function PartChip({ part, live }: { part: Part; live: boolean }) {
  return (
    <span
      className={`${k.part} ${k.land}`}
      data-part={part.id}
      data-tone={live ? "live" : "rest"}
    >
      <span className={k.partTop}>
        <span
          className={k.role}
          data-lead={part.note ? "" : undefined}
          aria-hidden="true"
        />
        <b className={k.who}>{part.who}</b>
        {part.acts.map((act) => (
          <Badge
            key={act}
            variant="neutral"
            appearance="soft"
            className={k.act}
          >
            {act}
          </Badge>
        ))}
      </span>
      {part.note ? <span className={k.partNote}>{part.note}</span> : null}
    </span>
  );
}

// A LINHA DO TEMPO DO ASSUNTO
// ONE track for every frame: five columns (one per event), each with its card, the stem down to the line, its dot on
// the line and its day; frame 3 adds the parts under the line. Below lg the track turns into a column (the line on the
// left), and in frame 4 it shrinks to the line with its dots and days under the head
function Track({ beat }: { beat: Beat }) {
  const frame = beat.frame;
  return (
    <div className={k.track} data-frame={frame}>
      {EVENTS.map((ev) => {
        const look = lookOf(ev, beat);
        const part =
          frame === 3
            ? PARTS.find((x) => x.on === ev.id && beat.reached(x.step))
            : undefined;
        return (
          <div key={ev.id} className={k.event} data-event={ev.id}>
            <EventCard ev={ev} look={look} beat={beat} />
            <span
              className={k.stem}
              data-on={look.card !== "none"}
              aria-hidden="true"
            />
            <span className={k.dotCell} aria-hidden="true">
              <span className={k.dot} data-dot={ev.id} data-look={look.dot} />
            </span>
            <span className={k.day} data-day={ev.id} data-look={look.day}>
              {ev.day}
            </span>
            <span className={k.partSlot}>
              {part ? (
                <PartChip
                  key={part.id}
                  part={part}
                  live={beat.is("approved") && part.id === "lead"}
                />
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// A head of a frame: the title (a big line in ink) and its note (secondary text)
function Head({
  title,
  note,
  big,
}: {
  title: string;
  note: string;
  big?: boolean;
}) {
  return (
    <span className={k.head} data-big={big ? "" : undefined} data-lead="">
      <b className={k.headTitle}>{title}</b>
      <span className={k.headNote}>{note}</span>
    </span>
  );
}

// O ASSISTENTE QUE RESPONDE PELA MEMÓRIA
// The panel of frame 4: who answers and where, the subject it reads (the lib's Badge), the question, the answer in a big
// line with its sentence, the 2 proofs cited (the lib's outline Button: a click replays the answer and its traces), and the note of what is still missing. Every piece holds its place from the frame's start and lights on its
// step, so the panel never moves under the reader.
function Assistant({ beat }: { beat: Beat }) {
  const answered = beat.reached("answer");
  const cited = beat.reached("cite");
  return (
    <aside className={k.panel} data-panel="" aria-label={COPY.assistant}>
      <span className={k.panelHead} data-axis="assistant" data-axis-pair="">
        <span
          className={`${p.mark} ${p.markSm} ${p.markSquare} ${k.assistantMark}`}
          aria-hidden="true"
        >
          <Sparkles />
        </span>
        <span className={k.panelName}>{COPY.assistant}</span>
        <span className={k.panelWhere}>{COPY.where}</span>
      </span>
      <Badge variant="neutral" appearance="soft" className={k.subject}>
        <Link data-icon="inline-start" aria-hidden="true" />
        {COPY.subject}
      </Badge>
      <p className={k.question}>{COPY.question}</p>
      <span className={k.answer} data-answer="">
        <span className={k.label}>{COPY.answerLabel}</span>
        <span className={k.answerBody}>
          {/* Mounted only while it types: its dots loop forever, and a hidden loop would keep the scene from ever
              holding still */}
          <span className={k.typing} data-in={!answered} aria-hidden="true">
            {answered ? null : <TypingDots size={5} gap={3} />}
          </span>
          <span className={k.said} data-in={answered}>
            <b className={k.answerTitle}>{COPY.answer}</b>
            <span className={k.answerText}>{COPY.answerText}</span>
          </span>
        </span>
      </span>
      <span className={k.cited} data-proofs="" data-in={cited}>
        <span className={k.label}>{COPY.cited}</span>
        {PROOFS.map((proof) => {
          const Icon = proof.icon;
          return (
            <ActionButton
              key={proof.id}
              icon={<Icon />}
              emphasis="outline"
              size="md"
              className={k.cite}
              data-cite={proof.id}
              tabIndex={cited ? undefined : -1}
              onClick={() => beat.take(TAKE_FROM)}
            >
              {proof.cite}
            </ActionButton>
          );
        })}
      </span>
      <span
        className={k.missing}
        data-in={beat.reached("done")}
        data-axis="missing"
        data-axis-pair=""
      >
        <CircleAlert aria-hidden="true" />
        <span>{COPY.missing}</span>
      </span>
    </aside>
  );
}

// OS QUATRO QUADROS
function FrameView({ beat }: { beat: Beat }) {
  const frame = beat.frame;
  const traces = !beat.ghost;
  if (frame === 4) {
    const done = beat.reached("done");
    return (
      <div className={k.answerFrame}>
        <div className={k.lead}>
          <Head title={COPY.answerHead} note={COPY.answerNote} big />
          <Track beat={beat} />
          <div className={k.close} data-in={done}>
            <b className={k.closeTitle} data-lead="">
              {COPY.close}
            </b>
            <span data-lead="">
              <ActionButton
                emphasis="primary"
                size="md"
                icon={<CalendarDays />}
                href={CONTACT_HREF}
              >
                {CTA_LABEL}
              </ActionButton>
            </span>
          </div>
        </div>
        <Assistant beat={beat} />
        {/* The trace from each citation back to the decision it proves, around the pieces (lg only: the panel sits
            beside the line) */}
        {traces && beat.reached("cite")
          ? PROOFS.map((proof) => (
              <Connector
                key={proof.id}
                route="around"
                from={`[data-cite="${proof.id}"]`}
                to='[data-card="decision"]'
                clearance={40}
                state="active"
              />
            ))
          : null}
      </div>
    );
  }
  return (
    <div className={k.lineFrame}>
      {frame === 1 ? (
        <Head title={COPY.subject} note={COPY.subjectNote} />
      ) : null}
      {frame === 2 ? (
        <Head title={COPY.decisionHead} note={COPY.decisionNote} />
      ) : null}
      <Track beat={beat} />
      {/* Frame 3: each part points up at the day it acted on (lg only: on a phone the part sits under its card) */}
      {traces && frame === 3
        ? PARTS.filter((part) => beat.reached(part.step)).map((part) => (
            <Connector
              key={part.id}
              route="up"
              from={`[data-part="${part.id}"]`}
              to={`[data-dot="${part.on}"]`}
              state="active"
            />
          ))
        : null}
    </div>
  );
}

function KnowlyCarouselView({ scene }: { scene: SceneApi }) {
  // The hidden copy draws the last step of every frame in one cell (the window takes the tallest)
  if (scene.ghost)
    return (
      <div className={k.stage}>
        {FRAMES.map((ids) => {
          const beat = beatAt(indexOf(ids[ids.length - 1]), scene);
          return (
            <div key={beat.frame} className={k.frame}>
              <FrameView beat={beat} />
            </div>
          );
        })}
      </div>
    );
  const beat = beatAt(scene.index, scene);
  return (
    <div className={k.stage} data-frame={beat.frame}>
      {/* The frames cross: the outgoing one leaves on the in-out curve and the incoming one enters on the out curve,
          a beat later, both in the same cell (no change of height). Keyed by the loop too, so the first frame of a new
          loop enters as a new frame */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`${scene.cycle}-${beat.frame}`}
          className={k.frame}
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: SCENE_CURVE.dur2 * 1.5,
              ease: SCENE_CURVE.out,
              delay: SCENE_CURVE.dur2 / 2,
            },
          }}
          exit={{
            opacity: 0,
            y: -8,
            transition: { duration: SCENE_CURVE.dur2, ease: SCENE_CURVE.inOut },
          }}
        >
          <FrameView beat={beat} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function KnowlyCarousel({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="knowly-carousel"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      tools={(scene) => <FrameIndicator scene={scene} frames={FRAMES} />}
      steps={KNOWLY_CAROUSEL_STEPS}
      timeline={timeline}
    >
      {(scene) => <KnowlyCarouselView scene={scene} />}
    </Scene>
  );
}
