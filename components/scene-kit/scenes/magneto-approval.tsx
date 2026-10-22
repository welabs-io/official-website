"use client";
// CENA DO MAGNETO: O VALOR DECIDE O CAMINHO
// Port of the Magneto play (components/plays/MagnetoPlay.tsx, content lib/content/plays.ts MAGNETO_PLAY) into the kit.
// The order 1234 is changed: at R$ 800 the condition answers "Não" and the approval is skipped; the value goes to
// R$ 4.800, the condition answers "Sim" and the flow stops at the approval and waits for the decision; once approved,
// the update on the Domus fails (the Domus is down), the flow retries on its own and succeeds on the 2nd attempt
// without repeating what was done, then the channel of the order is notified. The run log fills on the right and the
// order on the Domus changes its status. Built from the lib: Badge (node status), AnimatedList (log lines), Separator,
// the site's ActionButton (value chips and "Aprovar", the scene controls), lucide icons. Amber marks only the node
// running now; amber soft what ran; the destructive tone of the lib only the failed attempt. The continuity is the
// kit's (components/scene-kit/Scene.tsx).
import {
  Check,
  Coins,
  Database,
  GitBranch,
  PencilLine,
  RotateCw,
  Send,
  Stamp,
  TriangleAlert,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { ActionButton, Badge } from "@/components/lib/ui";
import { AnimatedList, Separator } from "@/components/lib/scene";
import { MAGNETO_PLAY as M } from "@/lib/content/plays";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import g from "./magneto-approval.module.css";

// ROTEIRO DA CENA
// low: R$ 800, straight path; high: the value changes and the condition says yes; waiting: the approval holds the run;
// approved: the update starts; failed: the Domus is down, 1st retry; recovered: done on the 2nd attempt; done: the
// channel is notified and the frame settles (1.6 s: its marks settle in ~0.4 s, then it holds ~1 s)
export const MAGNETO_APPROVAL_STEPS: readonly SceneStep[] = [
  { id: "low", hold: 1300 },
  { id: "high", hold: 1100 },
  { id: "waiting", hold: 1000 },
  { id: "approved", hold: 800 },
  { id: "failed", hold: 1100 },
  { id: "recovered", hold: 900 },
  { id: "done", hold: 1600 },
];

type NodeState = "idle" | "active" | "done" | "skip" | "fail";
type Tone = { variant: ComponentProps<typeof Badge>["variant"]; appearance: ComponentProps<typeof Badge>["appearance"] };

// CONTEÚDO DA CENA
// The status tones of the play (MagnetoPlay.tsx TONE): neutral answer, success, the destructive tone, a skipped step
const TONE = {
  plain: { variant: "secondary", appearance: "solid" },
  ok: { variant: "success", appearance: "soft" },
  fail: { variant: "destructive", appearance: "soft" },
  skip: { variant: "neutral", appearance: "outline" },
} satisfies Record<string, Tone>;

const COPY = {
  product: "Magneto",
  title: "Fluxos / Pedido alterado",
  label: "Magneto: o valor do pedido decide o caminho, o fluxo espera a aprovação e refaz sozinho a integração que falhou",
  flow: "Fluxo",
  run: "Execução",
  record: "Pedido 1234 no Domus",
  // The kind of each node, under its name, and what the approval says while it waits
  kinds: {
    start: "Gatilho",
    check: "Condição",
    approval: "Decisão",
    update: "Integração",
    notify: "Aviso",
  },
  changed: (value: string) => `${M.log.start}: ${value}`,
  // The order between the approval and the update on the Domus
  approved: "Situação: aprovado",
};

const VALUES = [
  { step: "low", label: M.values[0].label },
  { step: "high", label: M.values[1].label },
] as const;

type Status = { state: NodeState; meta?: string; badge?: { text: string; tone: Tone } };

// The status of each node at a step of the run
function nodesAt(scene: SceneApi): Record<keyof typeof COPY.kinds, Status> {
  const low = scene.is("low");
  const at = (id: string) => scene.reached(id);
  return {
    start: { state: "done" },
    check: low
      ? { state: "active", badge: { text: M.no, tone: TONE.plain } }
      : { state: scene.is("high") ? "active" : "done", badge: { text: M.yes, tone: TONE.plain } },
    approval: low
      ? { state: "skip", badge: { text: M.skipped, tone: TONE.skip } }
      : scene.is("waiting")
        ? { state: "active", meta: M.waiting }
        : at("approved")
          ? { state: "done", badge: { text: M.approved, tone: TONE.ok } }
          : { state: "idle" },
    update: scene.is("approved")
      ? { state: "active" }
      : scene.is("failed")
        ? { state: "fail", badge: { text: M.retry, tone: TONE.fail } }
        : at("recovered")
          ? { state: "done", badge: { text: M.recovered, tone: TONE.ok } }
          : { state: "idle" },
    notify: scene.is("recovered")
      ? { state: "active" }
      : at("done")
        ? { state: "done", badge: { text: M.done, tone: TONE.ok } }
        : { state: "idle" },
  };
}

// The tone of a node's mark (components/scene-kit/parts.module.css): amber now, amber soft once run, destructive soft
// on a failed attempt, neutral otherwise
const MARK_TONE: Record<NodeState, string | undefined> = {
  idle: undefined,
  skip: undefined,
  active: "active",
  done: "done",
  fail: "fail",
};

const NODES: { id: keyof typeof COPY.kinds; icon: LucideIcon; name: string }[] = [
  { id: "start", icon: PencilLine, name: M.nodes.start },
  { id: "check", icon: GitBranch, name: M.nodes.check },
  { id: "approval", icon: Stamp, name: M.nodes.approval },
  { id: "update", icon: Database, name: M.nodes.update },
  { id: "notify", icon: Send, name: M.nodes.notify },
];

// The lines of the run log: each shows from its step on (`until` drops it when the value changes)
const LOG: { key: string; from: string; until?: string; time: string; icon: LucideIcon; text: string; fail?: boolean }[] =
  [
    { key: "low-start", from: "low", until: "high", time: "10:02", icon: PencilLine, text: COPY.changed(M.values[0].label) },
    { key: "low", from: "low", until: "high", time: "10:02", icon: GitBranch, text: M.log.low },
    { key: "high-start", from: "high", time: "10:03", icon: PencilLine, text: COPY.changed(M.values[1].label) },
    { key: "high", from: "high", time: "10:03", icon: GitBranch, text: M.log.high },
    { key: "approved", from: "approved", time: "10:14", icon: Stamp, text: M.log.approved },
    { key: "failed", from: "failed", time: "10:14", icon: TriangleAlert, text: M.log.failed, fail: true },
    { key: "updated", from: "recovered", time: "10:15", icon: RotateCw, text: M.log.updated },
    { key: "notified", from: "done", time: "10:15", icon: Send, text: M.log.notified },
  ];

function MagnetoApprovalView({ scene }: { scene: SceneApi }) {
  const nodes = nodesAt(scene);
  const value = scene.is("low") ? VALUES[0] : VALUES[1];
  const lines = LOG.filter((l) => scene.reached(l.from) && !(l.until && scene.reached(l.until)));
  const newest = lines.at(-1)?.key;
  const done = scene.reached("done");
  const situation = scene.is("low")
    ? M.record.idle
    : scene.reached("recovered")
      ? M.record.done
      : scene.reached("approved")
        ? COPY.approved
        : M.record.waiting;
  return (
    <div className={g.split}>
      {/* The flow: the value that decides the branch, then its blocks in order */}
      <section className={g.flow} aria-label={COPY.flow}>
        <div className={`${p.ruleBottom} ${g.values}`}>
          <p className={p.paneHead}>{M.valueLabel}</p>
          <div className={`${p.choiceStates} ${g.chips}`}>
            {VALUES.map((v) => (
              <ActionButton
                key={v.step}
                size="xs"
                icon={<Coins strokeWidth={2} />}
                data-state={v === value ? "active" : "waiting"}
                onClick={() => scene.take(v.step)}
              >
                {v.label}
              </ActionButton>
            ))}
          </div>
        </div>
        <ol className={`${p.rowStates} ${g.nodes}`}>
          {NODES.map((n) => {
            const Icon = n.icon;
            const s = nodes[n.id];
            return (
              <li key={n.id} className={g.node} data-state={s.state} data-node={n.id}>
                <span className={g.nodeLine} data-axis="node">
                  <span className={`${p.mark} ${p.markMd}`} data-tone={MARK_TONE[s.state]} aria-hidden="true">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className={`${p.stack} ${g.nodeText}`}>
                    <b>{n.name}</b>
                    <span>{s.meta ?? COPY.kinds[n.id]}</span>
                  </span>
                </span>
                <span className={g.status}>
                  {n.id === "approval" && s.meta ? (
                    <ActionButton size="xs" icon={<Check strokeWidth={2.5} />} onClick={() => scene.take("approved")}>
                      {M.approve}
                    </ActionButton>
                  ) : s.badge ? (
                    <Badge variant={s.badge.tone.variant} appearance={s.badge.tone.appearance}>
                      {s.badge.text}
                    </Badge>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* The run: what happened, in order, and the order on the Domus */}
      <section className={g.run} aria-label={COPY.run}>
        <div className={g.runHead} data-axis="run">
          <span className={`${p.mark} ${p.markMd}`} aria-hidden="true">
            <Workflow size={16} strokeWidth={2} />
          </span>
          <span className={g.runTitle}>{COPY.run}</span>
          {done ? (
            <Badge variant="primary" appearance="soft" className={p.seal}>
              <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              {M.done}
            </Badge>
          ) : null}
        </div>
        <Separator />
        {/* Keyed by the run (the loop and the value): when a new run starts, the lines of the old one leave at once
            instead of animating out while the first lines come in (the settled frame of the server swapping to the
            first step held 8 lines for the length of the exit, 32 px over the window at 390) */}
        <AnimatedList
          key={`${scene.cycle}-${scene.is("low") ? "low" : "high"}`}
          className={`${p.list} ${p.listTight} ${g.log}`}
          distance={8}
          duration={0.28}
        >
          {lines.map((l) => {
            const Icon = l.icon;
            // The failed attempt keeps the destructive tone while it is the newest line; the newest line is amber
            const tone =
              l.fail === true && scene.is("failed") ? "fail" : !done && l.key === newest ? "active" : undefined;
            return (
              <div key={l.key} className={g.line} data-axis="log">
                <span className={`${p.mark} ${p.markXs}`} data-tone={tone} aria-hidden="true">
                  <Icon size={12} strokeWidth={2.25} />
                </span>
                <span className={g.lineText}>
                  <time className={p.time}>{l.time}</time>
                  {l.text}
                </span>
              </div>
            );
          })}
        </AnimatedList>
        <div className={g.record} data-axis="record">
          <span className={`${p.mark} ${p.markMd}`} data-tone="well subject" aria-hidden="true">
            <Database size={16} strokeWidth={2} />
          </span>
          <span className={p.stack}>
            <b>{COPY.record}</b>
            <span>
              {`Valor: ${value.label}`} · {situation}
            </span>
          </span>
        </div>
      </section>
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
