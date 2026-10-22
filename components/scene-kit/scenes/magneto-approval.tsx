"use client";
// CENA DO MAGNETO: O VALOR DECIDE O CAMINHO
// The run of a Magneto flow drawn as Welabs UI v3 Steps (one line per step, no rail): the order 1234 is changed, its
// value decides the path, the run waits for the approval, the update on the Domus fails once and is done on the 2nd
// attempt, then the channel of the order is notified. The left pane is the order (the value that decides, as two chips
// a visitor can pick, and the order on the Domus that the run changes); the right pane is the run, under the Domus
// DetailHeader of the flow. Each value pick draws the Relloo connector from the chosen value to the condition it
// decides. A done step is green (the success mark with its check, the time at the end); the live step is the amber-50
// line with the amber mark and its status minidot beside the title; the failed attempt keeps a neutral mark with the
// retry icon and the lib's outline "Tentar agora"; a step still to come is dashed. Amber budget: the live step's mark
// and its dot, never more than 3 pieces; the settled frame has none. Built from the lib: Avatar (the marks), Badge,
// the site's ActionButton and IconButton (the lib's Button), lucide 0.545 at its own stroke. The continuity (autoplay,
// loop, human take, off-screen, reduced motion) is the kit's (components/scene-kit/Scene.tsx).
import {
  Check,
  Coins,
  Database,
  GitBranch,
  History,
  MoreHorizontal,
  PencilLine,
  RotateCw,
  Send,
  Stamp,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, IconButton } from "@/components/lib/ui";
import { Avatar, AvatarFallback } from "@/components/lib/scene";
import { MAGNETO_PLAY as M } from "@/lib/content/plays";
import { Connector } from "../Connector";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import g from "./magneto-approval.module.css";

// ROTEIRO DA CENA
// low: R$ 800, the condition says no and the approval is not needed; high: the value changes and the condition says
// yes; waiting: the approval holds the run; approved: the update starts; failed: the Domus is down, a new attempt is
// set; recovered: done on the 2nd attempt, the notice goes out; done: every step is green (1.6 s: the marks settle in
// ~0.4 s, then the frame holds)
export const MAGNETO_APPROVAL_STEPS: readonly SceneStep[] = [
  { id: "low", hold: 1300 },
  { id: "high", hold: 1100 },
  { id: "waiting", hold: 1000 },
  { id: "approved", hold: 800 },
  { id: "failed", hold: 1100 },
  { id: "recovered", hold: 900 },
  { id: "done", hold: 1600 },
];

// The state of a step: done (green), live (amber-50, the one running now), failed (a neutral retry), waiting (dashed,
// still to come) and skipped (dashed, not needed on this path)
type StepState = "done" | "active" | "fail" | "waiting" | "skip";
type StepId = "start" | "check" | "approval" | "update" | "notify";
type Status = { state: StepState; meta: string; time?: string; live?: string };

// CONTEÚDO DA CENA
const COPY = {
  product: "Magneto",
  title: "Fluxos",
  label: "Magneto: o valor do pedido decide o caminho, o fluxo espera a aprovação e refaz sozinho a integração que falhou",
  order: "Pedido",
  record: "Pedido 1234 no Domus",
  run: "Execução",
  // The meta of the run: the order (label muted, number in ink) and when the run started
  orderLabel: "Pedido",
  orderNumber: "1234",
  startedAt: "início às",
  running: "Em execução",
  finished: "Concluído",
  history: "Histórico de execuções",
  more: "Mais ações",
  retryNow: "Tentar agora",
  // The minidot of the live step, beside its title
  live: {
    check: "Decidindo",
    approval: M.waiting,
    update: "Atualizando",
    notify: "Enviando",
  },
  // The meta line of each step, by what happened
  meta: {
    start: (value: string) => `Valor: ${value}`,
    // Short enough for one line on a phone, so a step keeps its height whatever it says
    lowCheck: `${M.no}: segue direto`,
    highCheck: `${M.yes}: pede aprovação`,
    skipped: `${M.skipped}: abaixo de R$ 2.000`,
    waitingApproval: "Valor acima de R$ 2.000",
    approved: M.approved,
    updating: "Pedido 1234 no Domus",
    failed: "Domus fora do ar · tentativa 1/3",
    recovered: M.recovered,
    notifying: "Canal do pedido",
    notified: M.log.notified,
    next: "A seguir",
  },
  // The fields of the order on the Domus, and its situation along the run
  facts: { value: "Valor", items: "Itens", itemsValue: "3", situation: "Situação" },
  situation: {
    idle: "Em aberto",
    waiting: "Aguardando aprovação",
    approved: "Aprovado",
    done: "Aprovado e atualizado",
  },
};

const VALUES = [
  { step: "low", label: M.values[0].label },
  { step: "high", label: M.values[1].label },
] as const;

// The glyph of each step (the Domus' own where it has one: Workflow, Stamp for an approval, Send, Database)
const STEPS: { id: StepId; icon: LucideIcon; name: string }[] = [
  { id: "start", icon: PencilLine, name: M.nodes.start },
  { id: "check", icon: GitBranch, name: M.nodes.check },
  { id: "approval", icon: Stamp, name: M.nodes.approval },
  { id: "update", icon: Database, name: M.nodes.update },
  { id: "notify", icon: Send, name: M.nodes.notify },
];

// The status of every step at a step of the run
function stepsAt(scene: SceneApi): Record<StepId, Status> {
  const low = scene.is("low");
  const is = (id: string) => scene.is(id);
  const at = (id: string) => scene.reached(id);
  const value = low ? VALUES[0].label : VALUES[1].label;
  return {
    start: { state: "done", meta: COPY.meta.start(value), time: low ? "10:02" : "10:03" },
    check:
      low || is("high")
        ? { state: "active", meta: low ? COPY.meta.lowCheck : COPY.meta.highCheck, live: COPY.live.check }
        : { state: "done", meta: COPY.meta.highCheck, time: "10:03" },
    approval: low
      ? { state: "skip", meta: COPY.meta.skipped }
      : is("waiting")
        ? { state: "active", meta: COPY.meta.waitingApproval, live: COPY.live.approval }
        : at("approved")
          ? { state: "done", meta: COPY.meta.approved, time: "10:14" }
          : { state: "waiting", meta: COPY.meta.next },
    update: is("approved")
      ? { state: "active", meta: COPY.meta.updating, live: COPY.live.update }
      : is("failed")
        ? { state: "fail", meta: COPY.meta.failed }
        : at("recovered")
          ? { state: "done", meta: COPY.meta.recovered, time: "10:15" }
          : { state: "waiting", meta: COPY.meta.next },
    notify: is("recovered")
      ? { state: "active", meta: COPY.meta.notifying, live: COPY.live.notify }
      : at("done")
        ? { state: "done", meta: COPY.meta.notified, time: "10:15" }
        : { state: "waiting", meta: COPY.meta.next },
  };
}

// RÓTULO DE STATUS (MINIDOT DO DOMUS)
// The 8 px dot before the label, inline with a title, no fill (erpnext front ui-kit/components/status-dot.tsx ToneDot):
// amber while live, green once done, the quiet dot otherwise. Keyed by the caller, so a change lands with a pop.
function StatusLabel({ tone, label, header }: { tone: "active" | "done" | "rest"; label: string; header?: boolean }) {
  return (
    <span className={g.state} data-tone={tone} data-header={header ? "status" : undefined} data-axis-pair="">
      <span className={g.dot} data-dot="" aria-hidden="true" />
      {label}
    </span>
  );
}

// MARCA DA ETAPA
// The lib's Avatar with the step's icon as its fallback; its tone follows the step (app/lib.css paints the live one
// amber through [data-state="active"], this scene's sheet the done, failed and waiting ones). A done step shows the
// check, a failed one the retry icon, any other its own glyph.
function StepMark({ id, icon: Icon, state }: { id: StepId; icon: LucideIcon; state: StepState }) {
  const Glyph = state === "done" ? Check : state === "fail" ? RotateCw : Icon;
  return (
    <span className={g.markSlot} data-step-mark={id}>
      <Avatar data-tone={state} aria-hidden="true">
        <AvatarFallback>
          <Glyph />
        </AvatarFallback>
      </Avatar>
    </span>
  );
}

function MagnetoApprovalView({ scene }: { scene: SceneApi }) {
  const steps = stepsAt(scene);
  const low = scene.is("low");
  const value = low ? VALUES[0] : VALUES[1];
  const done = scene.reached("done");
  // The value decides the path on the first two steps: the trace runs from the chosen value to the condition
  const deciding = (low || scene.is("high")) && !scene.ghost;
  const situation = low
    ? COPY.situation.idle
    : scene.reached("recovered")
      ? COPY.situation.done
      : scene.reached("approved")
        ? COPY.situation.approved
        : COPY.situation.waiting;
  return (
    <div className={g.split}>
      {/* O PEDIDO: the value that decides and the order on the Domus */}
      <section className={g.order} data-pane="order" aria-label={COPY.order}>
        <p className={p.paneHead}>{M.valueLabel}</p>
        <div className={`${p.choiceStates} ${g.values}`}>
          {VALUES.map((v) => (
            <ActionButton
              key={v.step}
              size="md"
              emphasis="outline"
              icon={<Coins />}
              data-state={v === value ? "active" : "waiting"}
              data-value={v.step}
              onClick={() => scene.take(v.step)}
            >
              {v.label}
            </ActionButton>
          ))}
        </div>
        {/* The order the run changes, as the Domus shows a record's fields (labels muted, values in ink): its value and
            its situation update in place as the run goes */}
        <div className={g.record}>
          <div className={g.recordHead} data-axis="record">
            <span className={`${p.mark} ${p.markMd} ${g.square}`} aria-hidden="true">
              <Database />
            </span>
            <b>{COPY.record}</b>
          </div>
          {/* On a phone only the situation stays: the chips above already show the value */}
          <dl className={g.facts}>
            <div data-wide="">
              <dt>{COPY.facts.value}</dt>
              <dd key={value.step} className={g.swap}>
                {value.label}
              </dd>
            </div>
            <div data-wide="">
              <dt>{COPY.facts.items}</dt>
              <dd>{COPY.facts.itemsValue}</dd>
            </div>
            <div>
              <dt>{COPY.facts.situation}</dt>
              <dd key={situation} className={g.swap}>
                {situation}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* A EXECUÇÃO: the Domus DetailHeader of the flow, then its steps */}
      <section className={g.run} aria-label={COPY.run}>
        <div className={g.head}>
          <div className={g.headMain} data-align="record">
            <span className={g.identity} data-header="identity" aria-hidden="true">
              <Workflow />
            </span>
            <span className={g.headText} data-header="block">
              <span className={g.headTop}>
                <b data-header="title">{M.nodes.start}</b>
                <StatusLabel
                  key={done ? "done" : "running"}
                  header
                  tone={done ? "done" : "rest"}
                  label={done ? COPY.finished : COPY.running}
                />
              </span>
              <span className={g.headMeta} data-header="meta">
                {COPY.orderLabel} <b>{COPY.orderNumber}</b>
                <span aria-hidden="true"> · </span>
                {COPY.startedAt} <b>{low ? "10:02" : "10:03"}</b>
              </span>
            </span>
          </div>
          {/* The record's tools, inert here: they show what the screen offers, they do nothing */}
          <div className={g.actions} data-header="actions" aria-hidden="true" inert>
            <IconButton icon={<History />} label={COPY.history} emphasis="outline" tabIndex={-1} />
            <IconButton icon={<MoreHorizontal />} label={COPY.more} emphasis="outline" tabIndex={-1} />
          </div>
        </div>

        <ol className={`${p.rowStates} ${g.steps}`}>
          {STEPS.map((st) => {
            const s = steps[st.id];
            // A step with an action (approve, retry): on a phone the action goes under the text
            const action = (st.id === "approval" && s.state === "active") || s.state === "fail";
            return (
              <li
                key={st.id}
                className={g.step}
                data-step={st.id}
                data-state={s.state}
                data-action={action || undefined}
                data-axis="step"
              >
                <StepMark id={st.id} icon={st.icon} state={s.state} />
                <span className={g.stepText}>
                  <span className={g.stepTop}>
                    <b>{st.name}</b>
                    {s.live ? <StatusLabel key={`${st.id}-${s.live}`} tone="active" label={s.live} /> : null}
                  </span>
                  <span key={s.meta} className={g.stepMeta}>
                    {s.meta}
                  </span>
                </span>
                <span className={g.trail}>
                  {action && st.id === "approval" ? (
                    <ActionButton size="md" emphasis="primary" icon={<Check />} onClick={() => scene.take("approved")}>
                      {M.approve}
                    </ActionButton>
                  ) : s.state === "fail" ? (
                    <ActionButton size="md" emphasis="outline" icon={<RotateCw />} onClick={() => scene.take("recovered")}>
                      {COPY.retryNow}
                    </ActionButton>
                  ) : s.time ? (
                    <time className={g.time}>{s.time}</time>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* The value decides: a trace from the chosen value to the condition (side by side only, from 760 px up) */}
      {deciding ? <Connector from={`[data-value="${value.step}"]`} to='[data-step-mark="check"]' /> : null}
    </div>
  );
}

export function MagnetoApproval({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="magneto-approval"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      steps={MAGNETO_APPROVAL_STEPS}
      timeline={timeline}
    >
      {(scene) => <MagnetoApprovalView scene={scene} />}
    </Scene>
  );
}
