"use client";
// CENA DO RELLOO: CANAIS QUE VIRAM UM HISTÓRICO
// Conversations from four channel categories (Mensagem, E-mail, Voz, Chat do site) arrive one by one and land in ONE
// conversation history, the record of a contact (STORY.who). No person, name, face, initial or vendor: the channel is
// its category and the contact is its record id. Built from the lib: SplitView (inbox list + detail), the site's control
// primitives (RowButton rows and ActionButton chips as the scene controls, TextField as the composer), AnimatedList
// (entries arriving), TypingDots, Badge, Separator and lucide icons. Amber marks only what happened or is active. The continuity (autoplay, loop, human take, off-screen,
// reduced motion) is the kit's (components/scene-kit/Scene.tsx); this file only renders from `scene`.
import {
  Check,
  Contact,
  Mail,
  MessageCircle,
  MessagesSquare,
  Package,
  Phone,
  Reply,
  SendHorizontal,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge, RowButton, TextField } from "@/components/lib/ui";
import {
  AnimatedList,
  Separator,
  SplitView,
  SplitViewDetail,
  SplitViewList,
  TypingDots,
} from "@/components/lib/scene";
import { STORY } from "@/lib/scenes/story";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import r from "./relloo-inbox.module.css";

// ROTEIRO DA CENA
// One step per channel arriving, a "typing" beat before the chat of the site, and the settled frame (merged). The
// merged step lasts 1.6 s: its marks and seal settle in about 0.4 s, so the frame stands still for about 1 s (the hold)
export const RELLOO_INBOX_STEPS: readonly SceneStep[] = [
  { id: "start", hold: 1100 },
  { id: "message", hold: 1100 },
  { id: "email", hold: 1100 },
  { id: "voice", hold: 1100 },
  { id: "typing", hold: 800 },
  { id: "site", hold: 1100 },
  { id: "merged", hold: 1600 },
];

type Channel = {
  step: string;
  label: string;
  icon: LucideIcon;
  time: string;
  preview: string;
  text: string;
};

// CONTEÚDO DA CENA
const CHANNELS: readonly Channel[] = [
  {
    step: "message",
    label: "Mensagem",
    icon: MessageCircle,
    time: "09:12",
    preview: "Meu pedido já saiu?",
    text: "Meu pedido 1234 já saiu para entrega?",
  },
  {
    step: "email",
    label: "E-mail",
    icon: Mail,
    time: "09:40",
    preview: "Segunda via da nota",
    text: "Preciso da segunda via da nota do pedido 1234.",
  },
  {
    step: "voice",
    label: "Voz",
    icon: Phone,
    time: "10:05",
    preview: "Ligação de 0:42",
    text: "Ligação de 0:42, transcrita: pediu para mudar o endereço.",
  },
  {
    step: "site",
    label: "Chat do site",
    icon: MessagesSquare,
    time: "10:21",
    preview: "Posso receber no sábado?",
    text: "Posso receber no sábado, no endereço novo?",
  },
];

const COPY = {
  product: "Relloo",
  title: "Contatos / Histórico",
  label: "Relloo: quatro canais chegam no histórico de um único contato",
  channels: "Canais",
  history: "Histórico do contato",
  created: { label: "Pedido", time: "08:55", text: "Pedido 1234 criado, 3 itens." },
  typing: "digitando",
  merged: `${CHANNELS.length} canais, 1 histórico`,
  reply: "Responder pelo canal de origem",
  send: "Enviar",
};

// State of a channel: not yet arrived, arriving now (active) or in the history (happened)
const stateOf = (scene: SceneApi, ch: Channel) =>
  scene.is(ch.step) || (ch.step === "site" && scene.is("typing"))
    ? "active"
    : scene.reached(ch.step)
      ? "done"
      : "waiting";

// One line of the history: what the contact said (incoming) or an event of the record itself (system)
function Entry({
  icon: Icon,
  label,
  time,
  fresh,
  kind = "incoming",
  children,
}: {
  icon: LucideIcon;
  label: string;
  time?: string;
  fresh: boolean;
  kind?: "incoming" | "system";
  children: React.ReactNode;
}) {
  return (
    <div className={r.entry} data-fresh={fresh} data-kind={kind} data-align="entry">
      <span
        className={`${p.mark} ${p.markSm}`}
        data-tone={fresh ? "active" : undefined}
        aria-hidden="true"
      >
        <Icon size={14} strokeWidth={2} />
      </span>
      <span className={p.meta}>
        <b>{label}</b>
        {time ? <time>{time}</time> : null}
      </span>
      <div className={`${p.bubble} ${r.said}`} data-kind={kind}>
        {children}
      </div>
    </div>
  );
}

function RellooInboxView({ scene }: { scene: SceneApi }) {
  const typing = scene.is("typing");
  // The lines of the history: every channel that arrived, plus the chat of the site while it is still typing
  const shown = CHANNELS.filter((ch) => scene.reached(ch.step) || (typing && ch.step === "site"));
  const merged = scene.reached("merged");
  const newest = shown.at(-1)?.step;
  return (
    <SplitView detailOpen listWidth="17rem" className={r.split}>
      {/* The inbox of the channels: each row is a control that replays the scene from its channel */}
      <SplitViewList aria-label={COPY.channels} className={r.list}>
        <p className={`${p.paneHead} ${r.paneHead}`}>
          <span>{COPY.channels}</span>
          <Badge variant="neutral" appearance="soft">
            {CHANNELS.length}
          </Badge>
        </p>
        <ul className={`${p.rowStates} ${r.rows}`}>
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <li key={ch.step}>
                <RowButton
                  icon={<Icon strokeWidth={2} />}
                  markClassName={`${p.mark} ${p.markMd}`}
                  data-state={stateOf(scene, ch)}
                  data-channel={ch.step}
                  onClick={() => scene.take(ch.step)}
                >
                  <span className={r.rowText}>
                    <span className={r.rowTop}>
                      <b>{ch.label}</b>
                      <time>{ch.time}</time>
                    </span>
                    <span className={r.preview}>{ch.preview}</span>
                  </span>
                </RowButton>
              </li>
            );
          })}
        </ul>
      </SplitViewList>

      {/* The record of the contact: one history, whatever the channel */}
      <SplitViewDetail aria-label={COPY.history} className={r.detail}>
        <div className={r.record} data-align="record">
          <span className={`${p.mark} ${p.markLg}`} data-tone="subject" aria-hidden="true">
            <Contact size={18} strokeWidth={2} />
          </span>
          <span className={`${p.stack} ${p.stackLead} ${r.recordText}`}>
            <b>{STORY.who}</b>
            <span>{STORY.order}</span>
          </span>
          {merged ? (
            <Badge variant="primary" appearance="soft" className={`${p.seal} ${r.seal}`} data-merged="">
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
              {COPY.merged}
            </Badge>
          ) : null}
        </div>

        {/* Below lg the inbox pane is off screen (SplitView shows one pane): the channels become chips */}
        <div className={`${p.choiceStates} ${r.chips}`}>
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <ActionButton
                key={ch.step}
                size="xs"
                icon={<Icon strokeWidth={2} />}
                data-state={stateOf(scene, ch)}
                onClick={() => scene.take(ch.step)}
              >
                {ch.label}
              </ActionButton>
            );
          })}
        </div>

        <Separator />

        {/* One amber line at a time: the newest line until the record settles. The typing line is the chat of the site
            under its own key, in the same list as the others, so it turns into that message in place (as a separate
            child it got another key from the lib's Children.toArray, and its exit stacked with the message's enter for
            the length of the exit, pushing the window 48 to 80 px taller) */}
        <AnimatedList className={`${p.list} ${r.history}`} distance={10} duration={0.32}>
          <Entry
            key="created"
            icon={Package}
            label={COPY.created.label}
            time={COPY.created.time}
            fresh={false}
            kind="system"
          >
            {COPY.created.text}
          </Entry>
          {shown.map((ch) =>
            typing && ch.step === "site" ? (
              <Entry key={ch.step} icon={ch.icon} label={ch.label} fresh>
                <span className={r.typing}>
                  {COPY.typing}
                  <TypingDots size={5} gap={3} />
                </span>
              </Entry>
            ) : (
              <Entry
                key={ch.step}
                icon={ch.icon}
                label={ch.label}
                time={ch.time}
                fresh={!merged && ch.step === newest}
              >
                {ch.text}
              </Entry>
            ),
          )}
        </AnimatedList>

        {/* The composer is inert here: a soft send button, so the darkest mass of the window is not a control the
            scene never uses */}
        <div className={`${p.ruleTop} ${r.composer}`} aria-hidden="true" inert>
          <TextField
            icon={<Reply />}
            action={{ icon: <SendHorizontal />, label: COPY.send, tabIndex: -1 }}
            readOnly
            tabIndex={-1}
            placeholder={COPY.reply}
            aria-label={COPY.reply}
          />
        </div>
      </SplitViewDetail>
    </SplitView>
  );
}

export function RellooInbox({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="relloo-inbox"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      steps={RELLOO_INBOX_STEPS}
      timeline={timeline}
    >
      {(scene) => <RellooInboxView scene={scene} />}
    </Scene>
  );
}
