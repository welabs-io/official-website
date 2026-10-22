"use client";
// CENA DO TUNER: A LIGAÇÃO VAI PARA A EQUIPE CERTA
// Port of the Tuner play (components/plays/TunerPlay.tsx, content lib/content/plays.ts TUNER_PLAY) into the kit. A call
// comes in, the menu of the call offers three options, option 2 sends it to a team (never a person); the team is busy,
// so the call waits with its position marked, then the team takes it with the context of the order, and the recording
// and its transcription land in the conversation of the order. Built from the lib: Badge (team status, seal),
// AnimatedList (lines of the conversation), Separator, the site's ActionButton ("Nova ligação", the scene control),
// lucide icons. Amber marks only the option and the line happening now; amber soft what happened. The continuity is
// the kit's (components/scene-kit/Scene.tsx).
import {
  AudioLines,
  Check,
  Headset,
  Hourglass,
  ListOrdered,
  MessagesSquare,
  Phone,
  PhoneIncoming,
  type LucideIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { ActionButton, Badge } from "@/components/lib/ui";
import { AnimatedList, Separator } from "@/components/lib/scene";
import { TUNER_PLAY as T } from "@/lib/content/plays";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import t from "./tuner-routing.module.css";

// ROTEIRO DA CENA
// ring: the call comes in; menu: the options are read; pressed: option 2; hold: the team is busy, the call waits;
// taken: the team takes it with the context; recorded: the recording and transcript land; done: the call is on the
// history of the order and the frame settles (1.6 s: its marks settle in ~0.4 s, then it holds ~1 s)
export const TUNER_ROUTING_STEPS: readonly SceneStep[] = [
  { id: "ring", hold: 1000 },
  { id: "menu", hold: 900 },
  { id: "pressed", hold: 900 },
  { id: "hold", hold: 1100 },
  { id: "taken", hold: 1000 },
  { id: "recorded", hold: 1000 },
  { id: "done", hold: 1600 },
];

type BadgeTone = Pick<ComponentProps<typeof Badge>, "variant" | "appearance">;

// CONTEÚDO DA CENA
const COPY = {
  product: "Tuner",
  title: "Ligações / Central",
  label: "Tuner: a opção do menu leva a ligação para a equipe certa, com a gravação e a transcrição na conversa",
  again: "Nova ligação",
  conversation: "Conversa do pedido 1234",
  duration: "Ligação de 0:42",
};

// The option the call takes (TUNER_PLAY.options[1], the busy team)
const CHOSEN = T.options[1];

// Status of a team at a step: the chosen one goes busy, holding, answering; the others stay free
function teamStatus(scene: SceneApi, key: string): { text: string; tone: BadgeTone } {
  const free = { text: T.free, tone: { variant: "neutral", appearance: "outline" } } as const;
  if (key !== CHOSEN.key || !scene.reached("pressed")) return free;
  if (scene.reached("taken")) return { text: T.answered, tone: { variant: "success", appearance: "soft" } };
  if (scene.reached("hold")) return { text: T.hold, tone: { variant: "secondary", appearance: "solid" } };
  return { text: T.busy, tone: { variant: "secondary", appearance: "solid" } };
}

// The lines of the conversation, each from its step on
const LINES: {
  key: string;
  from: string;
  time: string;
  icon: LucideIcon;
  text: string;
  meta?: string;
  quote?: string;
}[] = [
  { key: "ring", from: "ring", time: "10:05", icon: PhoneIncoming, text: T.call },
  { key: "pressed", from: "pressed", time: "10:05", icon: ListOrdered, text: T.chose(CHOSEN.key, CHOSEN.label) },
  { key: "hold", from: "hold", time: "10:05", icon: Hourglass, text: T.hold },
  { key: "taken", from: "taken", time: "10:06", icon: Headset, text: T.answeredBy(CHOSEN.team), meta: T.contextLine },
  // The recording lands with its transcript, as a received message
  { key: "recorded", from: "recorded", time: "10:07", icon: AudioLines, text: T.land, quote: T.transcript },
];

function TunerRoutingView({ scene }: { scene: SceneApi }) {
  const done = scene.reached("done");
  const lines = LINES.filter((l) => scene.reached(l.from));
  const newest = lines.at(-1)?.key;
  return (
    <div className={t.split}>
      {/* The call and the menu of the call: each option sends it to a team */}
      <section className={t.call} aria-label={T.menu}>
        <div className={`${p.ruleBottom} ${t.caller}`} data-axis="caller">
          <span
            className={`${p.mark} ${p.markMd}`}
            data-tone={scene.is("ring") ? "active" : "done"}
            aria-hidden="true"
          >
            <Phone size={16} strokeWidth={2} />
          </span>
          <span className={`${p.stack} ${t.callerText}`}>
            <b>{T.call}</b>
            <span>{T.caller}</span>
          </span>
          <ActionButton size="xs" icon={<PhoneIncoming strokeWidth={2} />} onClick={() => scene.take("ring")}>
            {COPY.again}
          </ActionButton>
        </div>
        <p className={`${p.paneHead} ${t.paneHead}`}>{T.menu}</p>
        <ol className={`${p.rowStates} ${t.options}`}>
          {T.options.map((o) => {
            const status = teamStatus(scene, o.key);
            const chosen = o.key === CHOSEN.key;
            const state = !scene.reached("menu")
              ? "waiting"
              : chosen && scene.reached("pressed")
                ? scene.reached("taken")
                  ? "done"
                  : "active"
                : "idle";
            return (
              <li key={o.key} className={t.option} data-state={state}>
                <span className={t.optionLine} data-axis="option">
                  <span
                    className={`${p.mark} ${p.markMd} ${t.key}`}
                    data-tone={state === "active" || state === "done" ? state : undefined}
                    aria-hidden="true"
                  >
                    {o.key}
                  </span>
                  <span className={`${p.stack} ${t.optionText}`}>
                    <b>{o.label}</b>
                    <span>{o.team}</span>
                  </span>
                </span>
                <Badge variant={status.tone.variant} appearance={status.tone.appearance}>
                  {status.text}
                </Badge>
              </li>
            );
          })}
        </ol>
      </section>

      {/* The conversation of the order: where the call lands, recorded and transcribed */}
      <section className={t.conversation} aria-label={COPY.conversation}>
        <div className={t.head} data-axis="head">
          <span className={`${p.mark} ${p.markMd}`} data-tone="subject" aria-hidden="true">
            <MessagesSquare size={16} strokeWidth={2} />
          </span>
          <span className={t.headTitle}>{COPY.conversation}</span>
          {done ? (
            <Badge variant="primary" appearance="soft" className={`${p.seal} ${t.seal}`}>
              <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              {T.record}
            </Badge>
          ) : null}
        </div>
        <Separator />
        {/* Keyed by the loop: the lines of the last call leave at once when the next one rings (an animated exit
            stacked with the first line of the new call) */}
        <AnimatedList key={scene.cycle} className={`${p.list} ${t.lines}`} distance={8} duration={0.28}>
          {lines.map((l) => {
            const Icon = l.icon;
            const fresh = !done && l.key === newest;
            return (
              <div key={l.key} className={t.line} data-fresh={fresh}>
                <span className={t.lineHead} data-axis="line">
                  <span className={`${p.mark} ${p.markXs}`} data-tone={fresh ? "active" : undefined} aria-hidden="true">
                    <Icon size={12} strokeWidth={2.25} />
                  </span>
                  <span className={t.lineText}>
                    <time className={p.time}>{l.time}</time>
                    {l.text}
                  </span>
                </span>
                {l.meta ? <span className={t.lineMeta}>{l.meta}</span> : null}
                {l.quote ? (
                  <blockquote className={`${p.bubble} ${t.transcript}`}>
                    <span>{COPY.duration}</span>
                    {l.quote}
                  </blockquote>
                ) : null}
              </div>
            );
          })}
        </AnimatedList>
      </section>
    </div>
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
