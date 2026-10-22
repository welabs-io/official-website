"use client";
// CENA DA HOME: UMA MENSAGEM ATRAVESSA OS CINCO PRODUTOS
// Port of the message of the home (components/template/Home.tsx HomeMessage, content lib/content/home.ts HOME_MESSAGE)
// into the kit. A message from a channel category ("Dá para entregar sábado?") walks through the five products in the
// order of the content, each one lighting with its effect (Tuner: it arrived; Relloo: the answer; Knowly: yes, until
// 12h; Magneto: approved; Domus: recorded), and lands as a record of the order in the Domus. No person, name or
// vendor: the channel is its category and the record is the order. Built from the lib: Badge (seal), the site's
// ActionButton ("Enviar a mensagem", the scene control), lucide icons, and the kit's shared parts
// (components/scene-kit/parts.module.css). Amber marks only the product the message is in now; amber soft the
// products it passed. The continuity is the kit's (components/scene-kit/Scene.tsx).
import {
  BookOpen,
  Check,
  Database,
  MessageCircle,
  MessagesSquare,
  RadioTower,
  SendHorizontal,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge } from "@/components/lib/ui";
import { HOME_MESSAGE as H } from "@/lib/content/home";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import h from "./home-message.module.css";

// ROTEIRO DA CENA
// start: the message arrives; one step per product in the order of the content; done: the record of the order in the
// Domus is confirmed and the frame settles (1.6 s: its marks settle in ~0.4 s, then it holds ~1 s)
export const HOME_MESSAGE_STEPS: readonly SceneStep[] = [
  { id: "start", hold: 900 },
  { id: "tuner", hold: 700 },
  { id: "relloo", hold: 700 },
  { id: "knowly", hold: 700 },
  { id: "magneto", hold: 700 },
  { id: "domus", hold: 800 },
  { id: "done", hold: 1600 },
];

// CONTEÚDO DA CENA
// The name and the icon of each product of the track (the order and the effects are the content's)
const PRODUCT: Record<(typeof H.stations)[number]["product"], { name: string; icon: LucideIcon }> = {
  tuner: { name: "Tuner", icon: RadioTower },
  relloo: { name: "Relloo", icon: MessagesSquare },
  knowly: { name: "Knowly", icon: BookOpen },
  magneto: { name: "Magneto", icon: Workflow },
  domus: { name: "Domus", icon: Database },
};

const COPY = {
  product: "Welabs",
  title: "Operação / Pedido 1234",
  label: "Uma mensagem atravessa os cinco produtos e vira um registro do pedido no Domus",
  track: "Caminho da mensagem",
  open: "Situação: em aberto",
  recorded: H.stations[4].label,
};

function HomeMessageView({ scene }: { scene: SceneApi }) {
  const done = scene.reached("done");
  return (
    <div className={h.root}>
      {/* The message, as it arrives from its channel; the button sends it again */}
      <div className={`${p.ruleBottom} ${h.message}`}>
        <div className={h.said} data-axis="message">
          <span className={`${p.mark} ${p.markMd}`} data-tone="subject" aria-hidden="true">
            <MessageCircle size={16} strokeWidth={2} />
          </span>
          <span className={p.stack}>
            <b>{H.bubble.channel}</b>
            <span className={`${p.bubble} ${h.text}`} data-fresh={scene.is("start")}>
              {H.bubble.text}
            </span>
          </span>
        </div>
        <ActionButton size="xs" icon={<SendHorizontal strokeWidth={2} />} onClick={() => scene.take("tuner")}>
          {H.send}
        </ActionButton>
      </div>

      {/* The track: the five products, each lit with its effect as the message passes */}
      <ol className={`${p.rowStates} ${h.track}`} aria-label={COPY.track}>
        {H.stations.map((s) => {
          const { name, icon: Icon } = PRODUCT[s.product];
          const state = scene.is(s.product) ? "active" : scene.reached(s.product) ? "done" : "waiting";
          return (
            <li key={s.product} className={h.station} data-state={state}>
              <span className={h.stationLine} data-axis="station">
                <span
                  className={`${p.mark} ${p.markMd}`}
                  data-tone={state === "waiting" ? undefined : state}
                  aria-hidden="true"
                >
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className={`${p.stack} ${h.stationText}`}>
                  <b>{name}</b>
                  {/* The effect shows once the message reached the product; the line keeps its place before */}
                  <span data-shown={state !== "waiting"}>{s.label}</span>
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* Where it lands: the record of the order in the Domus */}
      <div className={h.record} data-axis="record">
        <span className={`${p.mark} ${p.markLg}`} data-tone={done ? "done" : "well subject"} aria-hidden="true">
          <Database size={18} strokeWidth={2} />
        </span>
        <span className={`${p.stack} ${h.recordText}`}>
          <b>{H.record}</b>
          <span>{scene.reached("domus") ? H.done : COPY.open}</span>
        </span>
        {done ? (
          <Badge variant="primary" appearance="soft" className={`${p.seal} ${h.seal}`}>
            <Check size={12} strokeWidth={2.5} aria-hidden="true" />
            {COPY.recorded}
          </Badge>
        ) : null}
      </div>
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
