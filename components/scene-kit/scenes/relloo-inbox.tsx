"use client";
// CENA DO RELLOO: CANAIS QUE VIRAM UM HISTÓRICO
// Conversations from four channel categories (Mensagem, E-mail, Voz, Chat do site) arrive one by one and land in ONE
// conversation history, the record of a contact (STORY.who). No person, name, face, initial or vendor: the channel is
// its category and the contact is its record id. Round 2 (2026-10-22) rebuilds it on the Domus patterns
// (control/portfolio/site-redesign/scene-kit/relloo-round2.md): the record header of the Domus DetailHeader (identity,
// title with its status inline as the StatusLabel pill, one meta line), the history as the Domus ActivityFeed (ONE lib
// Timeline with its rail), the inbox rows as whole-row targets, the phone's channels as the Domus count chips, lucide
// 0.545 at its own stroke. Each arrival is choreographed in four beats on the kit's steps: the row lights, a trace runs
// from the row to the history (Connector), the rail grows to the new line and the line lands, then the header counts
// it. The chat of the site types first and its typing bubble morphs into the message. Amber budget: at most 3 pieces
// at any frame (the active row's mark, the arriving line's mark, the status dot); the trace is never amber. The
// continuity (autoplay, loop, human take, off-screen, reduced motion = the settled frame) is the kit's
// (components/scene-kit/Scene.tsx); this file only renders from `scene`.
import {
  Contact,
  Mail,
  MessageSquare,
  MessagesSquare,
  Package,
  Phone,
  Search,
  Send,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { ActionButton, RowButton, TextField } from "@/components/lib/ui";
import {
  Avatar,
  AvatarFallback,
  SplitView,
  SplitViewDetail,
  SplitViewList,
  Timeline,
  TimelineItem,
  TypingDots,
} from "@/components/lib/scene";
import { STORY } from "@/lib/scenes/story";
import { Connector } from "../Connector";
import { Scene, SCENE_CURVE, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import r from "./relloo-inbox.module.css";

// ROTEIRO DA CENA
// One step per channel arriving (1.4 s: the row lights at 0, the trace runs 0 to 0.48 s, the line lands from 0.2 s, the
// header counts at 0.4 s, then about 0.8 s to read it), a "typing" beat before the chat of the site, and the settled
// frame (merged) held 1.8 s
export const RELLOO_INBOX_STEPS: readonly SceneStep[] = [
  { id: "start", hold: 1000 },
  { id: "message", hold: 1400 },
  { id: "email", hold: 1400 },
  { id: "voice", hold: 1400 },
  { id: "typing", hold: 900 },
  { id: "site", hold: 1400 },
  { id: "merged", hold: 1800 },
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
// The Domus glyphs: MessageSquare for a message channel (Channel Policy Settings), Mail, Phone; the record is Contact,
// the Relloo's own icon (erpnext front app/module-icons.ts PRODUCT_ICONS), the order is Package (Item)
const CHANNELS: readonly Channel[] = [
  {
    step: "message",
    label: "Mensagem",
    icon: MessageSquare,
    time: "09:12",
    preview: "Meu pedido 1234 já saiu?",
    text: "Meu pedido 1234 já saiu para entrega?",
  },
  {
    step: "email",
    label: "E-mail",
    icon: Mail,
    time: "09:40",
    preview: "Segunda via da nota fiscal",
    text: "Preciso da segunda via da nota fiscal do pedido 1234.",
  },
  {
    step: "voice",
    label: "Voz",
    icon: Phone,
    time: "10:05",
    note: "0:42 · transcrita",
    preview: "Ligação de 0:42, transcrita",
    text: "Quer trocar o endereço de entrega.",
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
  waiting: "Novo",
  live: "Em atendimento",
  created: "Pedido 1234 criado",
  createdNote: "3 itens",
  createdTime: "08:55",
  typing: "digitando",
  reply: "Escreva uma resposta",
  send: "Enviar",
};

// "1 canal", "2 canais"
const channelsLabel = (n: number) => (n === 1 ? "canal" : "canais");

// State of a channel: not yet arrived, arriving now (active) or in the history (happened)
const stateOf = (scene: SceneApi, ch: Channel) =>
  scene.is(ch.step) || (ch.step === "site" && scene.is("typing"))
    ? "active"
    : scene.reached(ch.step)
      ? "done"
      : "waiting";

// MARCA DE ÍCONE
// The lib's Avatar with the channel icon as its fallback, at lucide's own stroke; its tone (rest, active) is painted
// by app/lib.css
function Mark({ icon: Icon, size, tone }: { icon: LucideIcon; size?: "default" | "lg"; tone?: "active" }) {
  return (
    <Avatar size={size} data-tone={tone} aria-hidden="true">
      <AvatarFallback>
        <Icon />
      </AvatarFallback>
    </Avatar>
  );
}

// RÓTULO DE STATUS (StatusLabel DO DOMUS)
// Port of the Domus StatusLabel (erpnext front ui-kit/components/status-dot.tsx): a soft pill with an 8 px dot before
// the label, inline with the record's title, never a black chip. Live is the amber dot (an area); at rest the quiet
// dot. The caller keys it by status, so a change lands with a pop of the dot instead of a cut.
function StatusLabel({ live, label }: { live: boolean; label: string }) {
  return (
    <span className={r.state} data-live={live}>
      <span className={r.dot} aria-hidden="true" />
      {label}
    </span>
  );
}

// The bubble of a history line: the typing dots turn into the message in place, the bubble's box morphing from one
// size to the other (motion's layout, on the kit's out curve) while the text fades in
function Bubble({ typing, text }: { typing: boolean; text: string }) {
  return (
    <motion.div layout transition={{ duration: SCENE_CURVE.dur2, ease: SCENE_CURVE.out }} className={p.bubble}>
      {typing ? (
        <motion.span layout="position" key="typing" className={r.typing}>
          {COPY.typing}
          <TypingDots size={5} gap={3} />
        </motion.span>
      ) : (
        <motion.span layout="position" key="text" className={r.said}>
          {text}
        </motion.span>
      )}
    </motion.div>
  );
}

function RellooInboxView({ scene }: { scene: SceneApi }) {
  const typing = scene.is("typing");
  // The lines of the history: every channel that arrived, plus the chat of the site while it is still typing
  const shown = CHANNELS.filter((ch) => scene.reached(ch.step) || (typing && ch.step === "site"));
  const arrived = CHANNELS.filter((ch) => scene.reached(ch.step)).length;
  const merged = scene.reached("merged");
  const newest = shown.at(-1);
  // The channel arriving now (the hand-off of the trace); none on the first and the settled frames
  const handing = merged ? undefined : newest;
  // The composer answers on the channel of the newest line (the first channel before any arrived)
  const origin = newest ?? CHANNELS[0];
  const OriginIcon = origin.icon;
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
        {/* The Domus DetailHeader: identity, the title with its status inline, one meta line, the line under it */}
        <div className={r.record} data-align="record">
          <span className={r.recordMark}>
            <Mark icon={Contact} size="lg" />
          </span>
          <span className={r.recordText}>
            <span className={r.recordTop}>
              <b>{STORY.who}</b>
              <StatusLabel
                key={arrived > 0 ? "live" : "waiting"}
                live={arrived > 0}
                label={arrived > 0 ? COPY.live : COPY.waiting}
              />
            </span>
            <span className={r.recordMeta}>
              {STORY.order} ·{" "}
              {/* The count of the record updates as each line lands: keyed, so the new number rolls in */}
              <span key={arrived} className={r.roll}>
                {arrived}
              </span>{" "}
              {channelsLabel(arrived)}, uma conversa
            </span>
          </span>
        </div>

        {/* Below lg the inbox pane is off screen (SplitView shows one pane): the channels become the Domus count
            chips under the header, each with the number of its lines in the history */}
        <div className={`${p.choiceStates} ${r.chips}`}>
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const state = stateOf(scene, ch);
            return (
              <ActionButton
                key={ch.step}
                size="xs"
                icon={<Icon />}
                data-state={state}
                data-chip={ch.step}
                onClick={() => scene.take(ch.step)}
              >
                {ch.label}
                <span key={state} className={r.chipCount}>
                  {state === "waiting" ? 0 : 1}
                </span>
              </ActionButton>
            );
          })}
        </div>

        {/* The history: ONE lib Timeline with its rail (the Domus ActivityFeed), oldest first. Keyed by the loop, so a
            new loop starts from the order event; a line arriving lands (CSS, relloo-inbox.module.css), the rail grows
            to it, and the newest line keeps the amber mark until the record settles */}
        <Timeline key={scene.cycle} className={r.history} aria-label={COPY.history}>
          <TimelineItem
            className={r.entry}
            icon={<Mark icon={Package} />}
            title={
              <>
                {COPY.created}
                <span className={r.note}> · {COPY.createdNote}</span>
              </>
            }
            aside={<time>{COPY.createdTime}</time>}
            isLast={shown.length === 0}
          />
          {shown.map((ch, i) => {
            const fresh = !merged && ch.step === newest?.step;
            return (
              <TimelineItem
                key={ch.step}
                className={`${r.entry} ${fresh ? r.fresh : ""}`}
                icon={
                  <span className={r.markSlot} data-entry={ch.step}>
                    <Mark icon={ch.icon} tone={fresh ? "active" : undefined} />
                  </span>
                }
                title={ch.label}
                aside={
                  <time>
                    {ch.time}
                    {ch.note ? ` · ${ch.note}` : ""}
                  </time>
                }
                isLast={i === shown.length - 1}
              >
                <div data-fresh={fresh}>
                  <Bubble typing={typing && ch.step === "site"} text={ch.text} />
                </div>
              </TimelineItem>
            );
          })}
        </Timeline>

        {/* The composer is inert here: it answers on the channel of origin (the chip follows the newest line), with
            the black send; every piece inside the 40 px field is 32 px, 4 px from the edge */}
        <div className={r.composer} aria-hidden="true" inert>
          <TextField
            lead={
              <span key={origin.step} className={r.origin}>
                <OriginIcon aria-hidden="true" />
                {origin.label}
              </span>
            }
            submit={{ icon: <Send />, label: COPY.send, tabIndex: -1 }}
            groupClassName={r.composerField}
            readOnly
            tabIndex={-1}
            placeholder={COPY.reply}
            aria-label={COPY.reply}
          />
        </div>
      </SplitViewDetail>

      {/* The hand-off: a trace from the channel's row to the history line it became (side by side only, at lg) */}
      {handing && !scene.ghost ? (
        <Connector from={`[data-channel="${handing.step}"]`} to={`[data-entry="${handing.step}"]`} />
      ) : null}
    </SplitView>
  );
}

// The search of the chrome bar: a decorative field, inert like the composer
function ChromeSearch() {
  return (
    <span className={r.search} aria-hidden="true" inert>
      <TextField
        icon={<Search />}
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
