"use client";
// CENA DO MAGNETO EM CARROSSEL: O FLUXO QUE ANDA SOZINHO
// The approved v3 frames V3Magneto-1..4 (canvas "Cenas Welabs conceito", 2026-10-22), one kit scene walking them: the
// Proposta 905 starts the flow by itself (1), the flow splits into two fronts at the same time (2), the approval holds
// the next step while the contract is ready (3), and the signature goes out after a failure in the middle, with
// nothing done twice, reaching the Domus and the Tuner, then the closing question and the call to action (4). It
// shows the effect, never the mechanism (the appetizer rule). Each frame is a group of steps of the kit's clock; the
// four frames share one grid cell, so the window keeps the height of the tallest, and they cross-fade with the
// site's three curves (the outgoing frame leaves on the in-out, the incoming one arrives on the out, its pieces pop
// on the spring). The frame indicator is the kit's FrameIndicator in the chrome: a click on a frame plays from it.
// The pieces are joined by the kit's Connector, side by side only (on a phone the flow is a column with arrows).
// Amber budget: the live piece of the frame, at most 2 pieces with the cross-fade; what is done is green. Built from
// the lib (Badge, the site's ActionButton), lucide 0.545 with the Domus' choices. The continuity
// (autoplay, loop, human take, off-screen, reduced motion = the last frame) is the kit's (components/scene-kit/Scene.tsx).
import { Fragment, type CSSProperties, type ReactNode } from "react";
import {
  ArrowDown,
  Building2,
  CalendarDays,
  Check,
  Clock,
  FileText,
  RadioTower,
  RotateCcw,
  UserCheck,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge } from "@/components/lib/ui";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { CTA_LABEL } from "@/lib/products";
import { Connector } from "../Connector";
import { FrameIndicator } from "../FrameIndicator";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import g from "./magneto-carousel.module.css";

// ROTEIRO DA CENA
// Frame 1, trigger: the Domus revises the proposal and the flow starts by itself; next: the next step waits. Frame 2,
// check: the proposal is checked; split: two fronts at once. Frame 3, wait: the approval holds, the Domus warned the
// management; ready: the contract is ready, the signature waits for the approval. Frame 4, retry: approved, the
// signature goes out through a failure; done: concluded with nothing twice, the order and the contract out; ask: the
// question and the call to action (the last frame holds 1.7 s, then the loop starts over)
export const MAGNETO_CAROUSEL_STEPS: readonly SceneStep[] = [
  { id: "trigger", hold: 1400 },
  { id: "next", hold: 1200 },
  { id: "check", hold: 1300 },
  { id: "split", hold: 1600 },
  { id: "wait", hold: 1400 },
  { id: "ready", hold: 1400 },
  { id: "retry", hold: 1300 },
  { id: "done", hold: 1300 },
  { id: "ask", hold: 1700 },
];

// The four frames and the steps each groups (the indicator plays from the first one)
const FRAMES = [
  { n: "1", steps: ["trigger", "next"] },
  { n: "2", steps: ["check", "split"] },
  { n: "3", steps: ["wait", "ready"] },
  { n: "4", steps: ["retry", "done", "ask"] },
] as const;
type FrameN = (typeof FRAMES)[number]["n"];

const frameOf = (step: string): FrameN =>
  (FRAMES.find((f) => (f.steps as readonly string[]).includes(step)) ?? FRAMES[0]).n;
// The steps of each frame, for the chrome's frame indicator (the kit's FrameIndicator)
const FRAME_STEPS = FRAMES.map((f) => f.steps);

// CONTEÚDO DA CENA
// The text of the approved frames, word for word
const COPY = {
  product: "Magneto",
  title: "Fluxos",
  label:
    "Magneto: a proposta começa o fluxo sozinha, ele divide o trabalho, espera a aprovação e conclui sem nada em dobro",
  flow: "Aprovação de proposta",
  active: "Ativo",
  domus: "Domus",
  tuner: "Tuner",
  proposal: "Proposta 905",
  f1: {
    source: "proposta revisada",
    started: "Começou sozinho",
    nobody: "ninguém precisou apertar nada",
    nextLabel: "Próximo passo",
    nextStep: "Conferir proposta",
  },
  f2: { trigger: "Gatilho", approval: "Aprovação da gerência", now: "agora", contract: "Preparar contrato", same: "ao mesmo tempo" },
  f3: {
    waiting: "Aguardando a gerência",
    warned: "avisou a gerência",
    ready: "contrato pronto",
    afterLabel: "Depois da aprovação",
    afterStep: "Enviar para assinatura",
  },
  f4: {
    approved: "Aprovado",
    by: "pela gerência",
    sign: "Enviar para assinatura",
    failure: "Uma falha no meio",
    concluded: "Concluído, sem nada em dobro",
    order: "Pedido 1234 criado",
    sent: "contrato enviado",
    question: "Como ele sabe o que já foi feito?",
  },
};

// PEÇAS DO QUADRO
// A piece arrives (data-in) when its step is reached; `i` staggers the pieces that arrive on the same step
type PieceProps = { shown: boolean; i?: number; children: ReactNode; className?: string } & Record<`data-${string}`, string | boolean | undefined>;

function Piece({ shown, i = 0, children, className, ...data }: PieceProps) {
  return (
    <div className={`${g.piece} ${className ?? ""}`} data-in={shown} style={{ "--i": i } as CSSProperties} {...data}>
      {children}
    </div>
  );
}

// The arrow between two pieces of a frame on a phone (the Connector draws them side by side only)
function Down({ shown }: { shown: boolean }) {
  return (
    <span className={`${g.piece} ${g.down}`} data-in={shown} aria-hidden="true">
      <ArrowDown />
    </span>
  );
}

// A product that took part: its square ink mark and what it did
function ProductNode({ icon: Icon, name, children }: { icon: LucideIcon; name: string; children: ReactNode }) {
  return (
    <span className={g.node} data-axis="product">
      <span className={`${p.mark} ${p.markMd} ${g.square} ${g.ink}`} aria-hidden="true">
        <Icon />
      </span>
      <span className={p.stack}>
        <b>{name}</b>
        {children}
      </span>
    </span>
  );
}

// A step that is done: the green mark with its check, its name and what it left (`pop`: it just turned done)
function DoneNode({ name, meta, pop }: { name: string; meta?: string; pop?: boolean }) {
  return (
    <span className={`${g.node} ${pop ? g.pop : ""}`} data-node="done" data-axis="done">
      <span className={`${p.mark} ${p.markSm} ${g.square}`} data-tone="done" aria-hidden="true">
        <Check />
      </span>
      <span className={p.stack}>
        <b>{name}</b>
        {meta ? <span>{meta}</span> : null}
      </span>
    </span>
  );
}

// The step still to come: a dashed slot, its empty mark, when it comes and what it is
function NextNode({ label, name }: { label: string; name: string }) {
  return (
    <span className={g.node} data-node="next" data-axis="next">
      <span className={`${p.mark} ${p.markSm} ${g.square} ${g.slot}`} aria-hidden="true" />
      <span className={p.stack}>
        <span>{label}</span>
        <b>{name}</b>
      </span>
    </span>
  );
}

// A line of a step: its icon (or dot) and a short phrase, on one axis
function Line({ icon, tone, children }: { icon: ReactNode; tone?: "done" | "muted"; children: ReactNode }) {
  return (
    <span className={g.line} data-tone={tone} data-axis-pair="" data-axis="line">
      {icon}
      <span>{children}</span>
    </span>
  );
}

// The head of the live step: its mark (amber while it runs, ink while it waits) and its name
function LiveHead({ icon: Icon, tone, name }: { icon: LucideIcon; tone: "signal" | "ink"; name: string }) {
  return (
    <span className={g.liveHead} data-axis="live">
      <span className={`${p.mark} ${p.markMd} ${g.square} ${tone === "signal" ? g.signal : g.ink}`} aria-hidden="true">
        <Icon />
      </span>
      <b>{name}</b>
    </span>
  );
}

// QUADROS
// Each frame renders from `scene`: its pieces arrive with their steps, its traces run while it is laid out. The
// traces are keyed by the loop, so each pass draws them again; the hidden copy that sizes the window draws none.
type FrameProps = { scene: SceneApi; on: (step: string) => boolean };

function Traces({ scene, children }: { scene: SceneApi; children: ReactNode }) {
  // A fragment: each trace's SVG must sit right in the frame, the positioned box it measures in
  return scene.ghost ? null : <Fragment key={scene.cycle}>{children}</Fragment>;
}

function TriggerFrame({ scene, on }: FrameProps) {
  return (
    <>
      <div className={g.flow} data-flow="" data-layout="row">
        <Piece shown={on("trigger")} data-id="domus">
          <ProductNode icon={Building2} name={COPY.domus}>
            <span>{COPY.f1.source}</span>
          </ProductNode>
        </Piece>
        <Down shown={on("trigger")} />
        <Piece shown={on("trigger")} i={1} className={g.live} data-id="live" data-node="live">
          <Line icon={<Zap />}>{COPY.f1.started}</Line>
          <span className={g.figure}>{COPY.proposal}</span>
          <span className={g.liveMeta}>{COPY.f1.nobody}</span>
        </Piece>
        <Down shown={on("next")} />
        <Piece shown={on("next")} data-id="next">
          <NextNode label={COPY.f1.nextLabel} name={COPY.f1.nextStep} />
        </Piece>
      </div>
      <Traces scene={scene}>
        {on("trigger") ? <Connector from='[data-id="domus"]' to='[data-id="live"]' inset={0} /> : null}
        {on("next") ? <Connector from='[data-id="live"]' to='[data-id="next"]' inset={0} tone="quiet" /> : null}
      </Traces>
    </>
  );
}

function SplitFrame({ scene, on }: FrameProps) {
  return (
    <>
      <div className={g.flow} data-flow="" data-layout="row">
        <Piece shown={on("check")} data-id="trigger">
          <span className={g.node} data-node="trigger">
            <span className={p.stack}>
              <Line icon={<span className={g.dot} data-tone="done" data-dot="" />} tone="done">
                {COPY.f2.trigger}
              </Line>
              <b>{COPY.proposal}</b>
            </span>
          </span>
        </Piece>
        <Down shown={on("check")} />
        <Piece shown={on("check")} i={1} data-id="check">
          <DoneNode name={COPY.f1.nextStep} />
        </Piece>
        <Down shown={on("split")} />
        <div className={g.fork}>
          <Piece shown={on("split")} className={g.live} data-id="approval" data-node="live" data-branch="">
            <LiveHead icon={UserCheck} tone="signal" name={COPY.f2.approval} />
            <Line icon={<span className={g.dot} data-dot="" />}>{COPY.f2.now}</Line>
          </Piece>
          <Piece shown={on("split")} i={1} data-id="contract" data-branch="">
            <span className={`${g.node} ${g.column}`}>
              <span className={g.liveHead} data-axis="contract">
                <span className={`${p.mark} ${p.markMd} ${g.square}`} aria-hidden="true">
                  <FileText />
                </span>
                <b>{COPY.f2.contract}</b>
              </span>
              <Line icon={<span className={g.dot} data-tone="ring" data-dot="" />} tone="muted">
                {COPY.f2.same}
              </Line>
            </span>
          </Piece>
        </div>
      </div>
      <Traces scene={scene}>
        {on("check") ? <Connector from='[data-id="trigger"]' to='[data-id="check"]' inset={0} /> : null}
        {on("split") ? <Connector from='[data-id="check"]' to='[data-id="approval"]' inset={0} /> : null}
        {on("split") ? <Connector from='[data-id="check"]' to='[data-id="contract"]' inset={0} /> : null}
      </Traces>
    </>
  );
}

function WaitFrame({ scene, on }: FrameProps) {
  return (
    <>
      <div className={g.flow} data-flow="" data-layout="join">
        <Piece shown={on("wait")} className={g.lead} data-id="check">
          <DoneNode name={COPY.f1.nextStep} />
        </Piece>
        <Down shown={on("wait")} />
        <Piece shown={on("wait")} i={1} className={`${g.live} ${g.topMid}`} data-id="approval" data-node="live" data-branch="">
          <LiveHead icon={UserCheck} tone="ink" name={COPY.f2.approval} />
          <span className={g.waiting} data-axis-pair="" data-axis="waiting">
            <Clock aria-hidden="true" />
            <span>{COPY.f3.waiting}</span>
          </span>
        </Piece>
        <Piece shown={on("wait")} i={2} className={g.bottomMid} data-id="contract" data-branch="">
          {on("ready") ? (
            <DoneNode key="ready" pop name={COPY.f2.contract} meta={COPY.f3.ready} />
          ) : (
            <span key="running" className={g.node} data-axis="contract">
              <span className={`${p.mark} ${p.markSm} ${g.square}`} aria-hidden="true">
                <FileText />
              </span>
              <span className={p.stack}>
                <b>{COPY.f2.contract}</b>
                <span>{COPY.f2.same}</span>
              </span>
            </span>
          )}
        </Piece>
        <Down shown={on("ready")} />
        <Piece shown={on("wait")} i={3} className={g.topEnd} data-id="domus" data-after="">
          <ProductNode icon={Building2} name={COPY.domus}>
            <span>{COPY.f3.warned}</span>
          </ProductNode>
        </Piece>
        <Piece shown={on("ready")} className={g.bottomEnd} data-id="next" data-after="">
          <NextNode label={COPY.f3.afterLabel} name={COPY.f3.afterStep} />
        </Piece>
      </div>
      <Traces scene={scene}>
        {on("wait") ? <Connector from='[data-id="check"]' to='[data-id="approval"]' inset={0} /> : null}
        {on("wait") ? <Connector from='[data-id="check"]' to='[data-id="contract"]' inset={0} /> : null}
        {on("wait") ? <Connector from='[data-id="approval"]' to='[data-id="domus"]' inset={0} /> : null}
        {on("ready") ? <Connector from='[data-id="contract"]' to='[data-id="next"]' inset={0} /> : null}
        {on("ready") ? <Connector from='[data-id="approval"]' to='[data-id="next"]' inset={0} tone="quiet" /> : null}
      </Traces>
    </>
  );
}

function CloseFrame({ scene, on }: FrameProps) {
  return (
    <>
      <div className={g.flow} data-flow="" data-layout="close">
        <Piece shown={on("retry")} data-id="approved" data-lead="">
          <DoneNode name={COPY.f4.approved} meta={COPY.f4.by} />
        </Piece>
        <Down shown={on("retry")} />
        <Piece shown={on("retry")} i={1} className={g.live} data-id="live" data-node="live">
          <LiveHead icon={RotateCcw} tone="signal" name={COPY.f4.sign} />
          <Line icon={<X />} tone="muted">
            {COPY.f4.failure}
          </Line>
          <span className={g.reveal} data-in={on("done")}>
            <Line icon={<Check />} tone="done">
              {COPY.f4.concluded}
            </Line>
          </span>
        </Piece>
        <Down shown={on("done")} />
        <div className={`${g.fork} ${g.forkTight}`}>
          <Piece shown={on("done")} data-id="domus" data-branch="">
            <ProductNode icon={Building2} name={COPY.domus}>
              <Line icon={<Check />} tone="done">
                {COPY.f4.order}
              </Line>
            </ProductNode>
          </Piece>
          <Piece shown={on("done")} i={1} data-id="tuner" data-branch="">
            <ProductNode icon={RadioTower} name={COPY.tuner}>
              <span>{COPY.f4.sent}</span>
            </ProductNode>
          </Piece>
        </div>
        <Piece shown={on("ask")} className={g.ask} data-ask="">
          <p className={g.question}>{COPY.f4.question}</p>
          <ActionButton size="md" emphasis="primary" icon={<CalendarDays />} href={CONTACT_HREF}>
            {CTA_LABEL}
          </ActionButton>
        </Piece>
      </div>
      <Traces scene={scene}>
        {on("retry") ? <Connector from='[data-id="approved"]' to='[data-id="live"]' inset={0} /> : null}
        {on("done") ? <Connector from='[data-id="live"]' to='[data-id="domus"]' inset={0} /> : null}
        {on("done") ? <Connector from='[data-id="live"]' to='[data-id="tuner"]' inset={0} /> : null}
      </Traces>
    </>
  );
}

const FRAME_VIEWS: Record<FrameN, (props: FrameProps) => ReactNode> = {
  "1": TriggerFrame,
  "2": SplitFrame,
  "3": WaitFrame,
  "4": CloseFrame,
};

function MagnetoCarouselView({ scene }: { scene: SceneApi }) {
  const frame = frameOf(scene.id);
  const on = (step: string) => scene.reached(step);
  return (
    <div className={g.root} data-frame={scene.ghost ? undefined : frame}>
      {/* O CABEÇALHO DO FLUXO: its name and its status (the frame on screen is the chrome's FrameIndicator) */}
      <div className={g.head}>
        <span className={g.headTitle}>
          <b>{COPY.flow}</b>
          <Badge variant="success" appearance="soft" className={g.status}>
            <span className={g.dot} data-tone="current" data-dot="" aria-hidden="true" />
            {COPY.active}
          </Badge>
        </span>
      </div>

      {/* OS QUADROS: one grid cell, the frame on screen over the others */}
      <div className={g.frames}>
        {FRAMES.map((f) => {
          const View = FRAME_VIEWS[f.n];
          return (
            // The frames off screen are inert: laid out (they hold the height), out of reach and of the reading order
            <section key={f.n} className={g.frame} data-at={f.n} data-active={f.n === frame} inert={f.n !== frame}>
              <View scene={scene} on={on} />
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function MagnetoCarousel({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="magneto-carousel"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      tools={(scene) => <FrameIndicator scene={scene} frames={FRAME_STEPS} />}
      steps={MAGNETO_CAROUSEL_STEPS}
      timeline={timeline}
    >
      {(scene) => <MagnetoCarouselView scene={scene} />}
    </Scene>
  );
}
