"use client";
// CENA DO RELLOO: CANAIS QUE VIRAM UM HISTÓRICO
// Conversations from four channel categories (Mensagem, E-mail, Voz, Chat do site) arrive one by one and land in ONE
// conversation history, the record of a contact (STORY.who). No person, name, face, initial or vendor: the channel is
// its category and the contact is its record id. Pilot of Welabs UI v3 (approved drawing InboxV3, 2026-10-22): the
// chrome bar with a search field, the channel list with no lines between rows, the record header with the black
// "Em atendimento" badge, the history with no rail (received bubbles on the chrome, the arriving one on amber-50, the
// system event as a meta line) and the composer with the channel chip and the black "Enviar". Built from the lib
// through the site primitives: SplitView, Avatar (every mark), Timeline/TimelineItem (each history line, rail hidden),
// RowButton, ActionButton, TextField, Badge, Separator, AnimatedList and TypingDots. Amber budget: at most 3 pieces of
// amber at any frame (the active row's mark, the arriving line's mark, the badge's live dot). The continuity (autoplay,
// loop, human take, off-screen, reduced motion) is the kit's (components/scene-kit/Scene.tsx); this file only renders
// from `scene`.
import {
  Contact,
  Mail,
  MessageCircle,
  MessagesSquare,
  Package,
  Phone,
  Search,
  Send,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge, RowButton, TextField } from "@/components/lib/ui";
import {
  AnimatedList,
  Avatar,
  AvatarFallback,
  Separator,
  SplitView,
  SplitViewDetail,
  SplitViewList,
  Timeline,
  TimelineItem,
  TypingDots,
} from "@/components/lib/scene";
import { STORY } from "@/lib/scenes/story";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import r from "./relloo-inbox.module.css";

// ROTEIRO DA CENA
// One step per channel arriving, a "typing" beat before the chat of the site, and the settled frame (merged). The
// merged step lasts 1.6 s: its marks settle in about 0.4 s, so the frame stands still for about 1 s (the hold)
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
  // The meta of the history line after the time (the length of a call), when there is one
  note?: string;
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
    preview: "Meu pedido 1234 já saiu?",
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
    note: "0:42, transcrita",
    preview: "Ligação de 0:42, transcrita",
    text: "Pediu para mudar o endereço de entrega.",
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
  title: "Contatos",
  search: "Buscar contato",
  label: "Relloo: quatro canais chegam no histórico de um único contato",
  channels: "Canais",
  history: "Histórico do contato",
  status: "Em atendimento",
  created: "Pedido 1234 criado · 3 itens · 08:55",
  typing: "digitando",
  merged: `${CHANNELS.length} canais na mesma conversa`,
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

// MARCA DE ÍCONE
// The lib's Avatar with the channel icon as its fallback; its tone (rest, active) is painted by app/lib.css
function Mark({ icon: Icon, size, tone }: { icon: LucideIcon; size?: "default" | "lg"; tone?: "active" }) {
  return (
    <Avatar size={size} data-tone={tone} aria-hidden="true">
      <AvatarFallback>
        <Icon strokeWidth={1.75} />
      </AvatarFallback>
    </Avatar>
  );
}

// One line of the history: the channel mark, its meta line (label and time) and what the contact said. A one-item lib
// Timeline, because the lib's AnimatedList wraps each child in its own div (an `li` cannot sit there); its rail is
// hidden (relloo-inbox.module.css), since v3 draws no rail
function Entry({
  channel,
  fresh,
  children,
}: {
  channel: Channel;
  fresh: boolean;
  children: React.ReactNode;
}) {
  return (
    <Timeline data-fresh={fresh}>
      <TimelineItem
        icon={<Mark icon={channel.icon} tone={fresh ? "active" : undefined} />}
        title={channel.label}
        aside={
          <time>
            {channel.time}
            {channel.note ? ` · ${channel.note}` : ""}
          </time>
        }
        isLast
      >
        <div className={p.bubble}>{children}</div>
      </TimelineItem>
    </Timeline>
  );
}

function RellooInboxView({ scene }: { scene: SceneApi }) {
  const typing = scene.is("typing");
  // The lines of the history: every channel that arrived, plus the chat of the site while it is still typing
  const shown = CHANNELS.filter((ch) => scene.reached(ch.step) || (typing && ch.step === "site"));
  const merged = scene.reached("merged");
  const newest = shown.at(-1)?.step;
  return (
    <SplitView detailOpen listWidth="18.75rem" className={r.split}>
      {/* The inbox of the channels: each row is a control that replays the scene from its channel */}
      <SplitViewList aria-label={COPY.channels} className={r.list}>
        <p className={`${p.paneHead} ${r.paneHead}`}>
          <span>{COPY.channels}</span>
          <span className={r.count}>{CHANNELS.length}</span>
        </p>
        <ul className={`${p.rowStates} ${r.rows}`}>
          {CHANNELS.map((ch) => (
            <li key={ch.step}>
              <RowButton
                icon={<Mark icon={ch.icon} />}
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
          ))}
        </ul>
      </SplitViewList>

      {/* The record of the contact: one history, whatever the channel */}
      <SplitViewDetail aria-label={COPY.history} className={r.detail}>
        <div className={r.record} data-align="record">
          <span className={r.recordMark}>
            <Mark icon={Contact} size="lg" />
          </span>
          <span className={r.recordText}>
            <b>{STORY.who}</b>
            <span>{`${STORY.order} · ${COPY.merged}`}</span>
          </span>
          {/* The live status of the conversation: the black badge (primary) with the amber dot (signal) */}
          <Badge variant="primary" appearance="solid" className={r.status}>
            <span className={r.live} aria-hidden="true" />
            {COPY.status}
          </Badge>
        </div>

        {/* Below lg the inbox pane is off screen (SplitView shows one pane): the channels become chips */}
        <div className={`${p.choiceStates} ${r.chips}`}>
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <ActionButton
                key={ch.step}
                size="xs"
                icon={<Icon strokeWidth={1.75} />}
                data-state={stateOf(scene, ch)}
                onClick={() => scene.take(ch.step)}
              >
                {ch.label}
              </ActionButton>
            );
          })}
        </div>

        {/* One amber line at a time: the newest line until the record settles. The typing line is the chat of the site
            under its own key, in the same list as the others, so it turns into that message in place (as a separate
            child it got another key from the lib's Children.toArray, and its exit stacked with the message's enter for
            the length of the exit, pushing the window 48 to 80 px taller) */}
        <AnimatedList className={r.history} distance={10} duration={0.32}>
          <p key="created" className={r.event} data-align="event">
            <Package strokeWidth={1.75} aria-hidden="true" />
            <span>{COPY.created}</span>
          </p>
          {shown.map((ch) =>
            typing && ch.step === "site" ? (
              <Entry key={ch.step} channel={ch} fresh>
                <span className={r.typing}>
                  {COPY.typing}
                  <TypingDots size={5} gap={3} />
                </span>
              </Entry>
            ) : (
              <Entry key={ch.step} channel={ch} fresh={!merged && ch.step === newest}>
                {ch.text}
              </Entry>
            ),
          )}
        </AnimatedList>

        {/* The composer is inert here: it answers on the channel of origin (the chip), with the black send */}
        <div className={r.composer} aria-hidden="true" inert>
          <Separator />
          <TextField
            lead={
              <span className={r.channelChip}>
                <MessagesSquare strokeWidth={1.75} aria-hidden="true" />
                {CHANNELS.at(-1)?.label}
              </span>
            }
            submit={{ icon: <Send strokeWidth={1.75} />, label: COPY.send, tabIndex: -1 }}
            groupClassName={r.composerField}
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

// The search of the chrome bar: a decorative field, inert like the composer
function ChromeSearch() {
  return (
    <span className={r.search} aria-hidden="true" inert>
      <TextField
        icon={<Search strokeWidth={1.75} />}
        size="sm"
        readOnly
        tabIndex={-1}
        placeholder={COPY.search}
        aria-label={COPY.search}
      />
    </span>
  );
}

export function RellooInbox({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="relloo-inbox"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      tools={<ChromeSearch />}
      steps={RELLOO_INBOX_STEPS}
      timeline={timeline}
    >
      {(scene) => <RellooInboxView scene={scene} />}
    </Scene>
  );
}
