"use client";
// CENA DO RELLOO: CARROSSEL EM QUATRO QUADROS
// The approved canvas frames V3Relloo-1..4 (v3 carousel brief, 2026-10-22) as one kit scene: a message arrives on a
// conversation that already holds the contact's other channels (1), the agent answers and hands the conversation to
// the sales team with a summary (2), the conversation becomes an opportunity on the contact's record (3), and the
// opportunity moves in the funnel while the Domus books the visit, ending on the question and the demo request (4).
// Each frame is a group of steps of the kit's clock; the kit owns the continuity (loop, human take and give-back,
// off-screen pause, reduced motion = the settled last frame). The frames slide in and out on the site's three curves
// (motion's AnimatePresence: out to enter, in-out to leave, spring for what lands), never a cut; the hidden copy of the
// kit stacks the four frames, so the window has the height of the tallest one in every frame. The chrome names the
// screen of the frame and shows which frame it is on (the kit's FrameIndicator, the visitor's gesture).
// Reused from the validated relloo-inbox: the record header of the Domus DetailHeader (frame 3), the composer (the
// lib's field with the channel of origin and the black send, frame 1) and the kit's connector. Amber is the live piece
// only (amber-50 with the amber ring, one per frame); done is green. No person, name, face or vendor.
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  Contact,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ActionButton, Badge, TextField } from "@/components/lib/ui";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { CTA_LABEL } from "@/lib/products";
import { Connector } from "../Connector";
import { FrameIndicator } from "../FrameIndicator";
import { linkState } from "../link-state";
import { Scene, SCENE_CURVE, type SceneApi, type SceneStep } from "../Scene";
import { TYPING_MS, TypeIn, TypingIndicator, typeDuration } from "../TypeIn";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import r from "./relloo-carousel.module.css";

// CONTEÚDO DA CENA
const COPY = {
  label:
    "Relloo: uma mensagem vira oportunidade e anda no funil, em quatro momentos",
  conversation: "Conversa 2210",
  contact: "Contato 4821",
  linked: "Ligada à gestão",
  before: "+ 2 canais usados antes",
  owner: "Dono",
  agent: "Agente de atendimento",
  team: "Equipe comercial",
  today: "Hoje",
  message: "Mensagem",
  asked: "Preciso de manutenção mensal para 3 aparelhos do bloco B.",
  askedAt: "08:12",
  reply: "Escrever para Contato 4821",
  send: "Enviar",
  previous: "Antes",
  now: "Dona agora",
  why: "pediu proposta",
  agentSaid:
    "Qual o modelo dos aparelhos? Já deixo tudo pronto para a proposta.",
  agentAt: "08:12",
  answer: "São 3 aparelhos de 12 mil BTUs. Quero uma proposta.",
  answerAt: "08:19",
  summaryReady: "Resumo pronto para a equipe",
  summaryLong:
    "Manutenção mensal, 3 aparelhos de 12 mil BTUs no bloco B. Pediu proposta.",
  summary: "Resumo",
  summaryShort: "Manutenção mensal, 3 aparelhos no bloco B. Pediu proposta.",
  history: "3 canais · um histórico só",
  deals: "Oportunidades",
  born: "Nova oportunidade",
  bornAt: "agora",
  deal: "Oportunidade",
  dealNumber: "562",
  bornFrom: "Nasceu da Conversa 2210, com o resumo junto",
  moves: "anda no funil e o resto acontece sozinho",
  funnel: "Funil",
  domus: "Domus",
  visit: "Vistoria 318 agendada",
  // v3 (2026-10-23): "atende" is a banned verb of copy-rules.json `words`; the same question, with "responde"
  question: "Quem responde primeiro na sua empresa?",
};

// ROTEIRO DA CENA
// Four frames, each a group of steps; every step holds 0.9 to 1.8 s (the kit's contract: something moves at least every
// 2 s) and the last step of each frame holds 1.8 s to be read.
// v4 (Stage.dc.html, brief-v4): the conversation types in. Each phrase is preceded by the "digitando" indicator (1 s,
// its own step) and its step holds the typing (18 ms per character) plus the pause after it; the agent's reply types as
// frame 2 comes in. One loop: 22.1 s.
// The frame slides in (FRAME_MOTION, ~0.48 s) before its first phrase types
const TYPE_ENTER_MS = Math.round(SCENE_CURVE.dur2 * 1.7 * 1000);
export const RELLOO_CAROUSEL_STEPS: readonly SceneStep[] = [
  { id: "f1-history", hold: 1100 },
  { id: "f1-typing", hold: TYPING_MS },
  { id: "f1-message", hold: typeDuration(COPY.asked) + 1400 },
  { id: "f2-reply", hold: TYPE_ENTER_MS + typeDuration(COPY.agentSaid) + 900 },
  { id: "f2-typing", hold: TYPING_MS },
  { id: "f2-answer", hold: typeDuration(COPY.answer) + 1000 },
  { id: "f2-handoff", hold: 1400 },
  { id: "f2-summary", hold: 1800 },
  { id: "f3-record", hold: 1100 },
  { id: "f3-born", hold: 1800 },
  { id: "f4-funnel", hold: 900 },
  { id: "f4-move", hold: 1100 },
  { id: "f4-domus", hold: 1200 },
  { id: "f4-ask", hold: 1800 },
];

// The name of each moment, on the stage tabs of the chrome (Stage.dc.html)
const FRAME_NAMES = ["Chega", "Passa a vez", "Vira oportunidade", "Anda no funil"] as const;

// The channels the contact used before, in the history of frame 1 (the Domus glyphs: Mail, Phone)
const PAST = [
  { date: "12/08", icon: Mail, text: "E-mail · orçamento de limpeza de dutos" },
  { date: "03/09", icon: Phone, text: "Voz · ligação transcrita" },
] as const;

// The four frames: their steps, and the screen the chrome names (the screen, then its area)
const FRAMES = [
  {
    n: 1,
    steps: ["f1-history", "f1-typing", "f1-message"],
    screen: "Caixa de entrada",
    area: "Atendimento",
  },
  {
    n: 2,
    steps: ["f2-reply", "f2-typing", "f2-answer", "f2-handoff", "f2-summary"],
    screen: "Caixa de entrada",
    area: "Atendimento",
  },
  {
    n: 3,
    steps: ["f3-record", "f3-born"],
    screen: COPY.contact,
    area: "Pessoa",
  },
  {
    n: 4,
    steps: ["f4-funnel", "f4-move", "f4-domus", "f4-ask"],
    screen: COPY.contact,
    area: "Pessoa",
  },
] as const;
type Frame = (typeof FRAMES)[number];

const frameOf = (scene: SceneApi): Frame =>
  FRAMES.find((f) => (f.steps as readonly string[]).includes(scene.id)) ??
  FRAMES[FRAMES.length - 1];

// The frame enters on the out curve and leaves on the in-out one, sliding a step the way the story goes
const FRAME_MOTION = {
  initial: { opacity: 0, x: 32 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: SCENE_CURVE.dur2 * 1.7, ease: SCENE_CURVE.out },
  },
  exit: {
    opacity: 0,
    x: -32,
    transition: { duration: SCENE_CURVE.dur2, ease: SCENE_CURVE.inOut },
  },
} as const;

// CABEÇALHO DO QUADRO
// The screen of the frame and its area in the chrome; keyed by the screen, so a new screen steps into place
function ChromeScreen({ text }: { text: string }) {
  return (
    <span key={text} className={r.swap}>
      {text}
    </span>
  );
}
function ChromeArea({ text }: { text: string }) {
  return (
    <span key={text} className={`${r.swap} ${r.area}`}>
      {text}
    </span>
  );
}

// The steps of each frame, for the chrome's frame indicator (the kit's FrameIndicator)
const FRAME_STEPS = FRAMES.map((f) => f.steps);

// QUADRO 1: A MENSAGEM CHEGA
// The conversation already holds the channels used before; the new message lands as the live piece
// v4: the "digitando" indicator holds the place of the message for 1 s, then the message types in, its whole text
// reserved from the first character
function FrameArrives({ scene }: { scene: SceneApi }) {
  const typing = scene.reached("f1-typing");
  const arrived = scene.reached("f1-message");
  return (
    <div className={`${r.body} ${r.centred}`} data-frame="1">
      <section className={r.thread} aria-label={COPY.conversation}>
        <header className={r.threadHead}>
          <span className={r.threadTop} data-col="lead">
            <b className={r.threadTitle}>{COPY.conversation}</b>
            <span className={r.threadMeta}>{COPY.contact}</span>
            <span className={r.pills}>
              <Badge variant="success" appearance="soft" data-axis-pair="">
                <Link2 data-icon="inline-start" aria-hidden="true" />
                {COPY.linked}
              </Badge>
              <Badge variant="neutral" appearance="soft">
                {COPY.before}
              </Badge>
            </span>
          </span>
          <span className={r.owner} data-col="lead">
            <span className={r.label}>{COPY.owner}</span>
            <Badge variant="primary" appearance="solid" data-axis-pair="">
              <Sparkles data-icon="inline-start" aria-hidden="true" />
              {COPY.agent}
            </Badge>
          </span>
        </header>

        <div className={r.feed}>
          {PAST.map(({ date, icon: Icon, text }) => (
            <p key={date} className={r.past} data-col="lead">
              <time className={r.date}>{date}</time>
              <span className={r.pastLine} data-axis="past">
                <span className={`${p.mark} ${p.markSm}`} aria-hidden="true">
                  <Icon />
                </span>
                <span className={r.pastText}>{text}</span>
              </span>
            </p>
          ))}
          <p className={r.day} data-col="lead">
            {COPY.today}
          </p>
          {typing ? (
            <div className={r.arrival} data-col="lead">
              <Badge
                variant="neutral"
                appearance="outline"
                className={r.channel}
                data-axis-pair=""
              >
                <MessageSquare data-icon="inline-start" aria-hidden="true" />
                {COPY.message}
              </Badge>
              {arrived ? (
                <p className={`${r.said} ${r.live}`} data-said="asked">
                  <TypeIn text={COPY.asked} />
                  <time>{COPY.askedAt}</time>
                </p>
              ) : (
                <TypingIndicator className={r.typing} />
              )}
            </div>
          ) : null}
        </div>

        {/* The composer of relloo-inbox, inert: it answers on the channel of origin with the black send */}
        <div className={r.composer} aria-hidden="true" inert>
          <TextField
            lead={
              <Badge variant="neutral" appearance="soft">
                <MessageSquare data-icon="inline-start" aria-hidden="true" />
                {COPY.message}
              </Badge>
            }
            submit={{ icon: <Send />, label: COPY.send, tabIndex: -1 }}
            readOnly
            tabIndex={-1}
            placeholder={COPY.reply}
            aria-label={COPY.reply}
          />
        </div>
      </section>
    </div>
  );
}

// QUADRO 2: A CONVERSA PASSA A VEZ
// The agent answers, the contact asks for a proposal, the conversation changes hands (the trace runs from the agent to
// the team, the team becomes the live piece) and the summary is ready for whoever takes it
// v4: the agent's reply types in as the frame comes in, the contact's answer after its "digitando"; the trace is in ink
// only while the hand-off happens, then rests grey
function FrameHandoff({ scene }: { scene: SceneApi }) {
  const typing = scene.reached("f2-typing");
  const answered = scene.reached("f2-answer");
  const handed = scene.reached("f2-handoff");
  const summed = scene.reached("f2-summary");
  return (
    <div className={`${r.body} ${r.centred}`} data-frame="2">
      <section className={r.thread} aria-label={COPY.conversation}>
        <header className={r.threadHead}>
          <span className={r.threadTop} data-col="lead">
            <b className={r.threadTitle}>{COPY.conversation}</b>
            <span className={r.threadMeta}>{COPY.contact}</span>
          </span>
        </header>

        <div className={r.handoff} data-col="lead">
          <span className={r.seat}>
            <span className={r.label}>{COPY.previous}</span>
            <span className={r.holder} data-holder="before" data-axis="holder">
              <Sparkles aria-hidden="true" />
              <span>{COPY.agent}</span>
            </span>
          </span>
          <span className={r.why}>{COPY.why}</span>
          <span className={r.seat}>
            <span className={r.label}>{COPY.now}</span>
            <span
              key={handed ? "live" : "rest"}
              className={`${r.holder} ${handed ? r.live : ""}`}
              data-holder="now"
              data-axis="holder"
            >
              <BriefcaseBusiness aria-hidden="true" />
              <span>{COPY.team}</span>
            </span>
          </span>
          {/* Side by side the trace runs across; stacked (a phone) it drops from one seat to the next */}
          {handed && !scene.ghost ? (
            <>
              <Connector
                from='[data-holder="before"]'
                to='[data-holder="now"]'
                inset={0}
                gap={8}
                state={linkState(scene, "f2-handoff")}
              />
              <Connector
                from='[data-holder="before"]'
                to='[data-holder="now"]'
                route="drop"
                inset={0}
                gap={8}
                state={linkState(scene, "f2-handoff")}
              />
            </>
          ) : null}
        </div>

        <div className={r.talk}>
          <p className={`${r.said} ${r.sent}`}>
            <span className={r.saidBy}>
              {COPY.agent} · {COPY.agentAt}
            </span>
            <TypeIn text={COPY.agentSaid} delay={TYPE_ENTER_MS} />
          </p>
          {answered ? (
            <p className={`${r.said} ${r.received}`} data-col="lead">
              <TypeIn text={COPY.answer} />
              <time>{COPY.answerAt}</time>
            </p>
          ) : typing ? (
            <TypingIndicator className={r.typing} />
          ) : null}
          {summed ? (
            <p className={`${r.note} ${r.landing}`} data-col="lead">
              <StickyNote aria-hidden="true" />
              <span className={r.noteText}>
                <b>{COPY.summaryReady}</b>
                <span>{COPY.summaryLong}</span>
              </span>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

// QUADRO 3: A CONVERSA VIRA OPORTUNIDADE
// The conversation, now the team's, beside the contact's record (the Domus DetailHeader of relloo-inbox); the trace
// leaves the contact's request, runs down the gutter between the two and lands the new opportunity on the record
function FrameBorn({ scene }: { scene: SceneApi }) {
  const born = scene.reached("f3-born");
  return (
    <div className={`${r.body} ${r.pair}`} data-frame="3">
      <section className={r.pane} data-lane="" aria-label={COPY.conversation}>
        <header className={r.paneTop}>
          <b className={r.paneTitle} data-col="left">
            {COPY.conversation}
          </b>
          <Badge variant="primary" appearance="solid">
            {COPY.team}
          </Badge>
        </header>
        <div className={r.paneBody}>
          <p className={`${r.said} ${r.quoted}`} data-quote="" data-col="left">
            <span>{COPY.answer}</span>
            <time>{COPY.answerAt}</time>
          </p>
          <p className={r.note} data-col="left">
            <StickyNote aria-hidden="true" />
            <span className={r.noteText}>
              <b>{COPY.summary}</b>
              <span>{COPY.summaryShort}</span>
            </span>
          </p>
        </div>
      </section>

      <section className={r.pane} aria-label={COPY.contact}>
        {/* The Domus DetailHeader (erpnext front ui-kit/components/detail-header.tsx), as relloo-inbox draws it:
              [identity]  H1 ● Status
                          meta
            the identity and the text block on one centre, the status a minidot on the title's line */}
        <div className={r.record} data-header-root="">
          <div className={r.recordMain} data-align="record" data-col="right">
            <span
              className={r.identity}
              data-header="identity"
              aria-hidden="true"
            >
              <Contact />
            </span>
            <span className={r.recordText} data-header="block">
              <span className={r.recordTop}>
                <b data-header="title">{COPY.contact}</b>
                <span
                  className={r.state}
                  data-header="status"
                  data-axis-pair=""
                >
                  <span className={r.dot} data-dot="" aria-hidden="true" />
                  {COPY.linked}
                </span>
              </span>
              <span className={r.recordMeta} data-header="meta">
                {COPY.history}
              </span>
            </span>
          </div>
        </div>
        <div className={r.deals}>
          <p className={p.paneHead} data-col="right">
            {COPY.deals}
          </p>
          {born ? (
            <article
              className={`${r.deal} ${r.live} ${r.landing}`}
              data-deal=""
              data-col="right"
            >
              <span className={r.dealTop}>
                <b>{COPY.born}</b>
                <Badge variant="neutral" appearance="outline" className={r.now}>
                  {COPY.bornAt}
                </Badge>
              </span>
              <strong className={r.number}>
                {COPY.deal} {COPY.dealNumber}
              </strong>
              <span className={r.dealFrom}>{COPY.bornFrom}</span>
            </article>
          ) : null}
        </div>
      </section>

      {born && !scene.ghost ? (
        <Connector
          from="[data-quote]"
          to="[data-deal]"
          route="elbow"
          lane="[data-lane]"
          inset={0}
          gap={6}
          state={linkState(scene, "f3-born")}
        />
      ) : null}
    </div>
  );
}

// QUADRO 4: O FUNIL ANDA E A PERGUNTA FICA
// The opportunity moves from the first stage (done, green) to the second (live); the Domus books the visit under it
// (green, done); the frame settles on the question and the lib's primary demo request, to the contact of the home
function FrameFunnel({ scene }: { scene: SceneApi }) {
  const moved = scene.reached("f4-move");
  const booked = scene.reached("f4-domus");
  const asked = scene.reached("f4-ask");
  const chip = (
    <motion.span
      layoutId={scene.ghost ? undefined : "relloo-deal"}
      transition={{
        duration: SCENE_CURVE.dur2 * 1.7,
        ease: SCENE_CURVE.spring,
      }}
      className={`${r.ticket} ${r.live}`}
    >
      <span className={r.ticketWord}>{COPY.deal} </span>
      {COPY.dealNumber}
    </motion.span>
  );
  return (
    <div className={`${r.body} ${r.funnelBody}`} data-frame="4">
      <p className={r.dealLine} data-col="funnel">
        <b>
          {COPY.deal} {COPY.dealNumber}
        </b>
        <span>{COPY.moves}</span>
      </p>
      <ol className={r.funnel} aria-label={COPY.funnel} data-col="funnel">
        <li
          className={r.stage}
          data-stage="1"
          data-state={moved ? "done" : "active"}
        >
          {moved ? <Check className={r.done} aria-hidden="true" /> : chip}
        </li>
        <li
          className={r.stage}
          data-stage="2"
          data-state={moved ? "active" : "waiting"}
        >
          {moved ? chip : null}
        </li>
        <li className={r.stage} data-stage="3" data-state="waiting" />
        <li className={r.stage} data-stage="4" data-state="waiting" />
      </ol>
      {/* The same four columns, so the Domus sits centred under the second stage (columns 1 to 3 share its centre) */}
      <div className={r.below}>
        {booked ? (
          <div
            className={`${r.domus} ${r.landing}`}
            data-domus=""
            data-axis="domus"
          >
            <span
              className={`${p.mark} ${p.markSquare} ${r.ink}`}
              aria-hidden="true"
            >
              <Building2 />
            </span>
            <span className={r.domusText}>
              <b>{COPY.domus}</b>
              <span className={r.booked} data-axis-pair="">
                <Check aria-hidden="true" />
                {COPY.visit}
              </span>
            </span>
          </div>
        ) : null}
      </div>
      {booked && !scene.ghost ? (
        <Connector
          from='[data-stage="2"]'
          to="[data-domus]"
          route="drop"
          inset={-2}
          gap={8}
          state={linkState(scene, "f4-domus")}
        />
      ) : null}

      {asked ? (
        <div className={`${r.ask} ${r.landing}`} data-col="funnel" data-ask="">
          <p className={r.question}>{COPY.question}</p>
          <ActionButton
            emphasis="primary"
            size="md"
            icon={<CalendarDays />}
            href={CONTACT_HREF}
          >
            {CTA_LABEL}
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

const BODIES = [FrameArrives, FrameHandoff, FrameBorn, FrameFunnel] as const;

function RellooCarouselView({ scene }: { scene: SceneApi }) {
  // The hidden copy of the kit stacks every frame in one cell (each at its own end), so the window keeps the height of
  // the tallest frame whichever frame is live
  if (scene.ghost)
    return (
      <div className={r.frames}>
        {BODIES.map((Body, i) => (
          <div key={i} className={r.frame}>
            <Body scene={scene} />
          </div>
        ))}
      </div>
    );
  const frame = frameOf(scene);
  const Body = BODIES[frame.n - 1];
  return (
    <div className={r.frames}>
      <AnimatePresence initial={false}>
        <motion.div key={frame.n} className={r.frame} {...FRAME_MOTION}>
          <Body scene={scene} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function RellooCarousel({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="relloo-carousel"
      label={COPY.label}
      className={r.window}
      product={(scene) => <ChromeScreen text={frameOf(scene).screen} />}
      title={(scene) => <ChromeArea text={frameOf(scene).area} />}
      tools={(scene) => <FrameIndicator scene={scene} frames={FRAME_STEPS} names={FRAME_NAMES} />}
      steps={RELLOO_CAROUSEL_STEPS}
      timeline={timeline}
    >
      {(scene) => <RellooCarouselView scene={scene} />}
    </Scene>
  );
}
