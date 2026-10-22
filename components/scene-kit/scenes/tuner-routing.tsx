"use client";
// CENA DO TUNER: A LIGAÇÃO VAI PARA A EQUIPE CERTA
// A call comes in, its menu offers three options, option 2 sends it to a team (never a person); the team is busy, so
// the call waits with its position, then the team takes it with the context of the order, and the recording and its
// transcript land in the history of the call. v3 (2026-10-22, brief-v3-scenes.md) rebuilds it on the validated Relloo
// pilot (relloo-inbox.tsx): the menu options are the inbox rows (whole-row targets, the chosen one in amber-50 with the
// amber mark), the record header is the Domus DetailHeader (identity, title with its status minidot, one meta line, the
// record's actions), the history is the Domus ActivityFeed (ONE lib Timeline) whose recording and transcript are
// Message entries, and the Relloo connector runs from the chosen option to the team that receives the call. Below lg
// the menu pane is off screen and the options become the lib's outline buttons under the header. Amber budget: at most
// 3 pieces in any frame (the chosen option's mark, the arriving entry's mark, the status dot). The continuity is the
// kit's (components/scene-kit/Scene.tsx); this file only renders from `scene`.
import {
  AudioLines,
  FileText,
  Headset,
  LifeBuoy,
  ListOrdered,
  MoreHorizontal,
  Package,
  PhoneForwarded,
  PhoneIncoming,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge, IconButton, RowButton } from "@/components/lib/ui";
import {
  Avatar,
  AvatarFallback,
  SplitView,
  SplitViewDetail,
  SplitViewList,
  Timeline,
  TimelineItem,
} from "@/components/lib/scene";
import { TUNER_PLAY as T } from "@/lib/content/plays";
import { Connector } from "../Connector";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import t from "./tuner-routing.module.css";

// ROTEIRO DA CENA
// ring: the call comes in; menu: the options are read; pressed: option 2, the trace runs to the busy team and the call
// waits; taken: the team takes it with the context; recorded and transcript: the two Message entries land; done: the
// call is recorded in the history and the frame settles (1.8 s)
export const TUNER_ROUTING_STEPS: readonly SceneStep[] = [
  { id: "ring", hold: 1000 },
  { id: "menu", hold: 1000 },
  { id: "pressed", hold: 1400 },
  { id: "taken", hold: 1400 },
  { id: "recorded", hold: 1400 },
  { id: "transcript", hold: 1400 },
  { id: "done", hold: 1800 },
];

// CONTEÚDO DA CENA
// The Domus glyphs: Package for an order (Item), Wallet for finance, LifeBuoy for the help desk, Headset for a team
// (HD Team), PhoneIncoming / PhoneForwarded for the call and its transfer (erpnext front app/module-icons.ts)
const ICONS: Record<string, LucideIcon> = { "1": Package, "2": Wallet, "3": LifeBuoy };
const OPTIONS = T.options.map((o) => ({ ...o, icon: ICONS[o.key] }));
// The option the call takes (the busy team)
const CHOSEN = OPTIONS[1];

const COPY = {
  product: "Tuner",
  title: "Ligações",
  label: "Tuner: a opção do menu leva a ligação para a equipe certa, com a gravação e a transcrição no histórico",
  record: "Registro da ligação",
  history: "Histórico da ligação",
  route: "Equipe que atende",
  key: "Tecla",
  waitingTeam: "Aguardando a opção",
  waitingNote: "O menu decide a equipe",
  busy: `${T.busy} · posição 2 na fila`,
  context: "Assumiu com o contexto do pedido",
  orderLabel: "Pedido",
  orderNumber: "1234",
  at: "recebida às",
  time: "10:05",
  forward: "Transferir",
  more: "Mais ações",
};

// The status of the call, the minidot by the title: live (amber) while it rings, waits and is answered, done (green)
// once recorded
const STATUS: Record<string, { label: string; tone: "live" | "done" }> = {
  ring: { label: "Tocando", tone: "live" },
  menu: { label: "No menu", tone: "live" },
  pressed: { label: "Em espera", tone: "live" },
  // "Atendida", not the content's "Em atendimento": on a phone the status keeps the title's line with 24 px to spare
  taken: { label: "Atendida", tone: "live" },
  recorded: { label: "Atendida", tone: "live" },
  transcript: { label: "Atendida", tone: "live" },
  done: { label: "Gravada", tone: "done" },
};

type Entry = {
  step: string;
  title: string;
  icon: LucideIcon;
  time: string;
  // The meta after the time (the length of a call), when there is one
  note?: string;
  // What was said: a Message entry (a bubble under the title); without it, a system event
  said?: string;
};

// The history of the call, oldest first: two system events, then the recording and its transcript as Message entries
const ENTRIES: readonly Entry[] = [
  { step: "ring", title: T.call, icon: PhoneIncoming, time: "10:05", note: T.caller },
  { step: "pressed", title: T.chose(CHOSEN.key, CHOSEN.label), icon: ListOrdered, time: "10:05", note: T.hold },
  { step: "recorded", title: "Gravação", icon: AudioLines, time: "10:07", note: "0:42", said: "Ligação de 0:42 gravada" },
  { step: "transcript", title: "Transcrição", icon: FileText, time: "10:07", said: T.transcript },
];

// State of an option: waiting before the menu is read, idle once read, active while the call is routed by it, chosen
// once its team took the call
const optionState = (scene: SceneApi, key: string) =>
  !scene.reached("menu")
    ? "waiting"
    : key !== CHOSEN.key || !scene.reached("pressed")
      ? "idle"
      : scene.reached("taken")
        ? "chosen"
        : "active";

// MARCA DE ÍCONE
// The lib's Avatar with the icon as its fallback, at lucide's own stroke; its tone is painted by app/lib.css
function Mark({ icon: Icon, tone }: { icon: LucideIcon; tone?: "active" | "done" | "subject" }) {
  return (
    <Avatar data-tone={tone} aria-hidden="true">
      <AvatarFallback>
        <Icon />
      </AvatarFallback>
    </Avatar>
  );
}

// RÓTULO DE STATUS (MINIDOT DO DOMUS)
// The 8 px dot before the label, inline with the title, no fill: live is the amber dot, done the green one. Keyed by
// the caller, so a change lands with a pop of the dot.
function StatusLabel({ label, tone }: { label: string; tone: "live" | "done" }) {
  return (
    <span className={t.state} data-tone={tone} data-header="status" data-axis-pair="">
      <span className={t.dot} data-dot="" aria-hidden="true" />
      {label}
    </span>
  );
}

function TunerRoutingView({ scene }: { scene: SceneApi }) {
  const status = STATUS[scene.id] ?? STATUS.done;
  const shown = ENTRIES.filter((e) => scene.reached(e.step));
  const done = scene.reached("done");
  const newest = shown.at(-1);
  const routed = scene.reached("pressed");
  const taken = scene.reached("taken");
  // The hand-off: from the chosen option to the team, while the call is routed and taken
  const handing = (scene.is("pressed") || scene.is("taken")) && !scene.ghost;
  return (
    <SplitView detailOpen listWidth="18.75rem" className={t.split}>
      {/* The menu of the call: each option is a row, a control that replays the call from the menu */}
      <SplitViewList aria-label={T.menu} className={t.list}>
        <p className={`${p.paneHead} ${t.paneHead}`}>
          <span>{T.menu}</span>
          <Badge variant="neutral" appearance="soft">
            {OPTIONS.length}
          </Badge>
        </p>
        <ul className={`${p.rowStates} ${t.rows}`}>
          {OPTIONS.map((o) => {
            const state = optionState(scene, o.key);
            return (
              <li key={o.key}>
                <RowButton
                  icon={<Mark icon={o.icon} tone={state === "chosen" ? "done" : undefined} />}
                  data-state={state}
                  data-option={o.key}
                  data-row=""
                  data-axis="option"
                  onClick={() => scene.take(o.key === CHOSEN.key ? "pressed" : "menu")}
                >
                  <span className={t.rowText}>
                    <span className={t.rowTop}>
                      <b>{o.label}</b>
                      <span>
                        {COPY.key} {o.key}
                      </span>
                    </span>
                    <span className={t.preview}>{o.team}</span>
                  </span>
                </RowButton>
              </li>
            );
          })}
        </ul>
      </SplitViewList>

      <SplitViewDetail aria-label={COPY.record} className={t.detail}>
        {/* The Domus DetailHeader, as the Relloo draws it: identity and text block on one centre, the title with its
            status minidot, the meta (values in ink, labels muted), the record's actions on the line (under it below
            sm), the line under it. Inert: the actions show the record's tools, they do nothing */}
        <div className={t.record} data-header-root="">
          <div className={t.recordMain} data-align="record">
            <span className={t.identity} data-header="identity" aria-hidden="true">
              <PhoneIncoming />
            </span>
            <span className={t.recordText} data-header="block">
              <span className={t.recordTop}>
                <b data-header="title">{T.call}</b>
                <StatusLabel key={status.label} label={status.label} tone={status.tone} />
              </span>
              <span className={t.recordMeta} data-header="meta">
                {COPY.orderLabel} <b>{COPY.orderNumber}</b>
                <span aria-hidden="true"> · </span>
                {COPY.at} <b>{COPY.time}</b>
              </span>
            </span>
          </div>
          <div className={t.actions} data-header="actions" aria-hidden="true" inert>
            <IconButton icon={<PhoneForwarded />} label={COPY.forward} emphasis="outline" tabIndex={-1} />
            <IconButton icon={<MoreHorizontal />} label={COPY.more} emphasis="outline" tabIndex={-1} />
          </div>
        </div>

        {/* Below lg the menu pane is off screen: the options become the lib's outline buttons (md) under the header */}
        <div className={t.chips}>
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <ActionButton
                key={o.key}
                size="md"
                emphasis="outline"
                icon={<Icon />}
                data-state={optionState(scene, o.key)}
                data-chip={o.key}
                onClick={() => scene.take(o.key === CHOSEN.key ? "pressed" : "menu")}
              >
                {o.label}
              </ActionButton>
            );
          })}
        </div>

        {/* The team the option sends the call to: the end of the trace. A team, never a person */}
        <section className={t.route} aria-label={COPY.route}>
          <p className={p.paneHead}>{COPY.route}</p>
          <div className={t.team} data-team="" data-axis="team">
            <span className={t.teamMark}>
              <Mark icon={Headset} tone={taken ? "done" : routed ? "subject" : undefined} />
            </span>
            <span key={taken ? "taken" : routed ? "busy" : "waiting"} className={`${p.stack} ${t.teamText}`} data-routed={routed}>
              <b>{routed ? CHOSEN.team : COPY.waitingTeam}</b>
              <span>{taken ? `${COPY.context} ${COPY.orderNumber}` : routed ? COPY.busy : COPY.waitingNote}</span>
            </span>
          </div>
        </section>

        {/* The history of the call: ONE lib Timeline (the Domus ActivityFeed), oldest first; the system events are
            title lines, the recording and its transcript Message entries with their bubble. Keyed by the loop */}
        <Timeline key={scene.cycle} className={t.history} aria-label={COPY.history}>
          {shown.map((e, i) => {
            const fresh = !done && e.step === newest?.step;
            return (
              <TimelineItem
                key={e.step}
                className={`${t.entry} ${fresh ? t.fresh : ""}`}
                icon={
                  <span className={t.markSlot} data-entry={e.step}>
                    <Mark icon={e.icon} tone={fresh ? "active" : undefined} />
                  </span>
                }
                title={e.title}
                aside={
                  <time>
                    {e.time}
                    {e.note ? ` · ${e.note}` : ""}
                  </time>
                }
                isLast={i === shown.length - 1}
              >
                {e.said ? (
                  <div data-fresh={fresh}>
                    <p className={`${p.bubble} ${t.said}`}>{e.said}</p>
                  </div>
                ) : undefined}
              </TimelineItem>
            );
          })}
        </Timeline>
      </SplitViewDetail>

      {handing ? <Connector from={`[data-option="${CHOSEN.key}"]`} to='[data-team] [data-slot="avatar"]' /> : null}
    </SplitView>
  );
}

export function TunerRouting({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="tuner-routing"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      steps={TUNER_ROUTING_STEPS}
      timeline={timeline}
    >
      {(scene) => <TunerRoutingView scene={scene} />}
    </Scene>
  );
}
