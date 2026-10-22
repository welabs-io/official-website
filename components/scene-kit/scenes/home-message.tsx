"use client";
// CENA DA HOME: UMA MENSAGEM ATRAVESSA OS CINCO PRODUTOS
// A message from a channel category ("Dá para entregar sábado?") crosses the five products in the order of the content
// (Tuner: it arrived; Relloo: the answer; Knowly: yes, until 12h; Magneto: approved; Domus: recorded) and lands as a
// record of the order in the Domus. No person, name or vendor: the channel is its category, the record is the order.
// v3 (2026-10-22, brief-v3-scenes.md) rebuilds it on the validated Relloo pilot (relloo-inbox.tsx): the message is a
// Message entry (mark, meta line, bubble), the products a compact track on the chrome rail (Welabs UI v3 Steps: done
// in green, the live one in amber-50 with the amber mark, waiting on the white well), the Relloo connector moving from
// one product to the next, and the record a white lib Card with the Domus DetailHeader (identity, title with its status
// minidot, one meta line) whose fields fill as the message passes. Amber budget: the live product's mark and the
// record's live status, never more than 2. The continuity is the kit's (components/scene-kit/Scene.tsx); this file only
// renders from `scene`.
import {
  BookOpen,
  Contact,
  House,
  MessageSquare,
  Package,
  RadioTower,
  Send,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Card } from "@/components/lib/ui";
import { Avatar, AvatarFallback } from "@/components/lib/scene";
import { HOME_MESSAGE as H } from "@/lib/content/home";
import { STORY } from "@/lib/scenes/story";
import { Connector } from "../Connector";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import h from "./home-message.module.css";

// ROTEIRO DA CENA
// start: the message arrives; one step per product in the order of the content, the trace moving from the last one;
// domus: the record is registered (its live status); done: the order is confirmed and the frame settles (1.8 s)
export const HOME_MESSAGE_STEPS: readonly SceneStep[] = [
  { id: "start", hold: 1000 },
  { id: "tuner", hold: 1000 },
  { id: "relloo", hold: 1000 },
  { id: "knowly", hold: 1000 },
  { id: "magneto", hold: 1000 },
  { id: "domus", hold: 1400 },
  { id: "done", hold: 1800 },
];

// CONTEÚDO DA CENA
type Product = (typeof H.stations)[number]["product"];
// The name and the icon of each product of the track (the order and the effects are the content's); Contact is the
// Relloo's own icon and Workflow the Magneto's (erpnext front app/module-icons.ts)
const PRODUCT: Record<Product, { name: string; icon: LucideIcon }> = {
  tuner: { name: "Tuner", icon: RadioTower },
  relloo: { name: "Relloo", icon: Contact },
  knowly: { name: "Knowly", icon: BookOpen },
  magneto: { name: "Magneto", icon: Workflow },
  domus: { name: "Domus", icon: House },
};
const ORDER = H.stations.map((s) => s.product);

const COPY = {
  product: "Welabs",
  title: "Operação",
  label: "Uma mensagem atravessa os cinco produtos e vira um registro do pedido no Domus",
  track: "Caminho da mensagem",
  time: "10:07",
  module: "Domus",
  moduleValue: "Pedidos",
  empty: "—",
};

// The status of the record, the minidot by its title: open at rest, registered (live) when the Domus takes it,
// confirmed (green) at the end
const statusOf = (scene: SceneApi) =>
  scene.reached("done")
    ? { label: "Confirmado", tone: "done" as const }
    : scene.reached("domus")
      ? { label: "Registrado", tone: "live" as const }
      : { label: "Em aberto", tone: "rest" as const };

// The fields of the record, each filled by the product that passes the message
const FIELDS: readonly { label: string; value: string; from: Product }[] = [
  { label: "Canal", value: H.bubble.channel, from: "tuner" },
  { label: "Contato", value: STORY.who, from: "relloo" },
  { label: "Prazo", value: "Sábado, até 12h", from: "knowly" },
  { label: "Aprovação", value: "Aprovado", from: "magneto" },
];

// MARCA DE ÍCONE
// The lib's Avatar with the icon as its fallback; its tone is painted by app/lib.css
function Mark({ icon: Icon, tone }: { icon: LucideIcon; tone?: "active" | "done" | "well" | "subject" }) {
  return (
    <Avatar data-tone={tone} aria-hidden="true">
      <AvatarFallback>
        <Icon />
      </AvatarFallback>
    </Avatar>
  );
}

function HomeMessageView({ scene }: { scene: SceneApi }) {
  const status = statusOf(scene);
  const live = ORDER.find((s) => scene.is(s));
  const index = live ? ORDER.indexOf(live) : -1;
  // The hand-off: from the product the message left to the one it is in now
  const from = index > 0 ? ORDER[index - 1] : undefined;
  return (
    <div className={h.root}>
      {/* The message, a Message entry as it arrives from its channel; the button sends it again */}
      <div className={h.message} data-message="">
        <div className={h.entry}>
          <span className={h.entryMark}>
            <Mark icon={MessageSquare} tone="subject" />
          </span>
          <div className={h.entryBody}>
            <p className={h.meta}>
              <b>{H.bubble.channel}</b>
              <time>{COPY.time}</time>
            </p>
            <div data-fresh={scene.is("start")}>
              <p className={`${p.bubble} ${h.said}`}>{H.bubble.text}</p>
            </div>
          </div>
        </div>
        <ActionButton size="md" emphasis="outline" icon={<Send />} onClick={() => scene.take("tuner")}>
          {H.send}
        </ActionButton>
      </div>

      {/* The track: the five products on the chrome rail, each lit with its effect as the message passes */}
      <ol className={h.track} aria-label={COPY.track} data-track="">
        {H.stations.map((s) => {
          const { name, icon } = PRODUCT[s.product];
          const state = scene.is(s.product) ? "active" : scene.reached(s.product) ? "done" : "waiting";
          return (
            <li key={s.product} className={h.station} data-station={s.product} data-state={state}>
              <span className={h.stationMark}>
                <Mark icon={icon} tone={state === "active" ? "active" : state === "done" ? "done" : "well"} />
              </span>
              <b>{name}</b>
              {/* The effect shows once the message reached the product; it keeps its place before */}
              <span className={h.effect} data-shown={state !== "waiting"}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Where it lands: the record of the order in the Domus, a white lib Card with the DetailHeader */}
      <Card flush className={h.record} data-record="">
        <div className={h.head} data-header-root="">
          <div className={h.headMain} data-align="record" data-axis="record">
            <span className={h.identity} data-header="identity" aria-hidden="true">
              <Package />
            </span>
            <span className={h.headText} data-header="block">
              <span className={h.headTop}>
                <b data-header="title">{H.record}</b>
                <span key={status.label} className={h.state} data-tone={status.tone} data-header="status" data-axis-pair="">
                  <span className={h.dot} data-dot="" aria-hidden="true" />
                  {status.label}
                </span>
              </span>
              <span className={h.headMeta} data-header="meta">
                {COPY.module} · <b>{COPY.moduleValue}</b>
              </span>
            </span>
          </div>
        </div>
        <dl className={h.fields}>
          {FIELDS.map((f) => {
            const filled = scene.reached(f.from);
            return (
              <div key={f.label} className={h.field} data-field="">
                <dt>{f.label}</dt>
                <dd key={filled ? "filled" : "empty"} data-filled={filled}>
                  {filled ? f.value : COPY.empty}
                </dd>
              </div>
            );
          })}
        </dl>
      </Card>

      {from && live && !scene.ghost ? (
        <Connector
          from={`[data-station="${from}"] [data-slot="avatar"]`}
          to={`[data-station="${live}"] [data-slot="avatar"]`}
          inset={0}
          gap={4}
        />
      ) : null}
    </div>
  );
}

export function HomeMessageScene({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="home-message"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      steps={HOME_MESSAGE_STEPS}
      timeline={timeline}
    >
      {(scene) => <HomeMessageView scene={scene} />}
    </Scene>
  );
}
