"use client";
// CENA DO TUNER EM CARROSSEL: UMA MENSAGEM, TODOS OS CANAIS
// The v3 carousel of the Tuner (brief-v3-carousel, 2026-10-22), from the approved canvas frames V3Tuner-1..4: (1) the
// Magneto asks for one message, the Proposta 905, and hands it to the Tuner; (2) the Tuner sends it through three
// channels at once; (3) each channel reports back, sent, delivered and read; (4) the answer, "Aceito", comes back to the
// right conversation in the Relloo, and the frame closes with the question and the lib's primary button to the
// contact. Each frame is a group of steps of ONE kit Scene, so the kit owns the loop, the take, the pause off screen
// and the settled frame under reduced motion. The frames share one grid cell: the hidden copy (ghost) stacks all four
// so the window keeps the height of the tallest, and the live layer holds the current frame and, during its first step,
// the one leaving, so a frame never cuts to the next (it leaves on the in-out curve, the next enters on the out curve,
// its pieces land on the spring). The frame indicator (1 to 4, the kit's FrameIndicator) lives in the chrome bar. Amber: one piece per frame
// (the message, the send in flight, the read now, the answer). This file only renders from `scene`.
import {
  CalendarDays,
  Check,
  CheckCheck,
  Globe,
  Hash,
  Mail,
  MessageCircle,
  MessagesSquare,
  Phone,
  Plug,
  RadioTower,
  Video,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge, RowButton } from "@/components/lib/ui";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { CTA_LABEL } from "@/lib/products";
import { Connector } from "../Connector";
import { FrameIndicator } from "../FrameIndicator";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import t from "./tuner-carousel.module.css";

// ROTEIRO DA CENA
// Two steps per frame: message (the Magneto's message lands) and handed (it reaches the Tuner); fanout (the Tuner
// sends it through the three channels) and sent (every channel took it); delivered (each one reports sent and
// delivered) and read (two were read, one of them now); reply (the answer arrives) and done (it is in the right
// conversation, the frame settles with the question and the button, 1.8 s)
export const TUNER_CAROUSEL_STEPS: readonly SceneStep[] = [
  { id: "message", hold: 1500 },
  { id: "handed", hold: 1500 },
  { id: "fanout", hold: 1400 },
  { id: "sent", hold: 1600 },
  { id: "delivered", hold: 1400 },
  { id: "read", hold: 1600 },
  { id: "reply", hold: 1400 },
  { id: "done", hold: 1800 },
];

// The four frames of the carousel, each with its steps and the caption of the chrome bar
const FRAMES = [
  { steps: ["message", "handed"], caption: "Envio da Proposta 905" },
  { steps: ["fanout", "sent"], caption: "Envio da Proposta 905" },
  { steps: ["delivered", "read"], caption: "Envio da Proposta 905" },
  { steps: ["reply", "done"], caption: "Recebimento" },
] as const;

// The step a human take jumps to (a channel of frame 2, or one of the other channels of frame 4): the scene replays
// the send from there
const TAKE_FROM = "fanout";

const frameOf = (step: string) => Math.max(0, FRAMES.findIndex((f) => (f.steps as readonly string[]).includes(step)));
// The steps of each frame, for the chrome's frame indicator (the kit's FrameIndicator)
const FRAME_STEPS = FRAMES.map((f) => f.steps);

// CONTEÚDO DA CENA
const COPY = {
  product: "Tuner",
  title: "Canais",
  label:
    "Tuner: uma mensagem sai por todos os canais de uma vez, a leitura volta por canal e a resposta cai na conversa certa",
  magneto: { title: "Magneto", meta: "pede o envio" },
  tuner: { title: "Tuner", meta: "central de canais" },
  message: { eyebrow: "Uma mensagem · 17:03", figure: "Proposta 905", note: "para o Contato 4821, onde ele estiver" },
  inFlight: "1 envio",
  sending: "Enviando",
  sent: "Enviado",
  delivered: "Entregue",
  readNow: "Lido agora",
  read: "Lido",
  stat: { figure: "3", note: "canais no mesmo envio" },
  replyFrom: { title: "Mensagem", meta: "dia 4 · 11:20" },
  reply: { eyebrow: "Resposta recebida", figure: "Aceito", note: "volta para a conversa certa, venha de onde vier" },
  relloo: { title: "Relloo", meta: "Conversa 2210" },
  more: "E mais canais",
  ask: "Quais canais a sua empresa usaria?",
};

// The three channels of the send, with the glyphs of the approved frames
const CHANNELS: readonly { key: string; name: string; icon: LucideIcon }[] = [
  { key: "email", name: "E-mail", icon: Mail },
  { key: "message", name: "Mensagem", icon: MessageCircle },
  { key: "integration", name: "Integração", icon: Plug },
];

// What each channel reports in frame 3, after sent and delivered: the e-mail is read now (the live piece), the message
// was read (done, green), the integration stays delivered
const READ: Record<string, { label: string; tone: "live" | "done" } | undefined> = {
  email: { label: COPY.readNow, tone: "live" },
  message: { label: COPY.read, tone: "done" },
};

// The other channels of the Tuner (frame 4)
const MORE: readonly { name: string; icon: LucideIcon }[] = [
  { name: "Voz", icon: Phone },
  { name: "Videochamada", icon: Video },
  { name: "Comunidade", icon: Hash },
  { name: "Chat do site", icon: Globe },
];

type FrameProps = {
  scene: SceneApi;
  // The step was reached inside this frame (a frame leaving, or a copy in the ghost, shows all of its steps)
  at: (step: string) => boolean;
  // Draw the traces (never in the ghost, which only sizes the window)
  traced: boolean;
};

const ALL = () => true;

// MARCA E NÓ
// The ink square of a product or a channel (the approved frames: primary black, white glyph), waiting in the chrome
// well until the message reaches it
function InkMark({ icon: Icon, large }: { icon: LucideIcon; large?: boolean }) {
  return (
    <span className={`${p.mark} ${large ? p.markLg : p.markMd} ${t.ink}`} aria-hidden="true">
      <Icon />
    </span>
  );
}

function Node({
  id,
  icon,
  title,
  meta,
  waiting,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  meta: string;
  waiting?: boolean;
}) {
  return (
    <div className={t.node} data-node={id} data-state={waiting ? "waiting" : "idle"} data-axis="node">
      <InkMark icon={icon} />
      <span className={p.stack}>
        <b>{title}</b>
        <span>{meta}</span>
      </span>
    </div>
  );
}

// The live card of a frame (the message, the answer): amber-50 with the amber ring, its figure big and bold
function LiveCard({ eyebrow, figure, note, ...rest }: { eyebrow: string; figure: string; note: string } & Record<`data-${string}`, string>) {
  return (
    <div className={t.live} {...rest}>
      <span className={t.eyebrow}>{eyebrow}</span>
      <b className={t.figure}>{figure}</b>
      <span className={t.note}>{note}</span>
    </div>
  );
}

// QUADRO 1: A MENSAGEM
function MessageFrame({ at, traced }: FrameProps) {
  return (
    <div className={t.flow} data-band="">
      <Node id="magneto" icon={Workflow} title={COPY.magneto.title} meta={COPY.magneto.meta} />
      <LiveCard data-message="" {...COPY.message} />
      <Node id="tuner" icon={RadioTower} title={COPY.tuner.title} meta={COPY.tuner.meta} waiting={!at("handed")} />
      {traced ? <Connector from='[data-node="magneto"]' to="[data-message]" inset={-6} state="active" /> : null}
      {traced && at("handed") ? <Connector from="[data-message]" to='[data-node="tuner"]' inset={-6} state="active" /> : null}
    </div>
  );
}

// QUADRO 2: O ENVIO POR TODOS OS CANAIS
function SendFrame({ scene, at, traced }: FrameProps) {
  const sent = at("sent");
  return (
    <div className={t.fan} data-band="">
      <div className={t.hub} data-hub="">
        <InkMark icon={RadioTower} large />
        <b>{COPY.tuner.title}</b>
        <Badge variant="neutral" appearance="soft" className={t.flight} data-tone="live">
          {COPY.inFlight}
        </Badge>
      </div>
      {/* Each channel is a row, a control that replays the send from here */}
      <ul className={`${p.rowStates} ${t.channels}`}>
        {CHANNELS.map((c) => (
          <li key={c.key}>
            <RowButton
              icon={<c.icon />}
              markClassName={`${p.mark} ${p.markMd} ${t.ink}`}
              data-channel={c.key}
              data-state="idle"
              data-row=""
              data-axis="channel"
              onClick={() => scene.take(TAKE_FROM)}
            >
              <span className={t.channelName}>{c.name}</span>
              <Badge key={sent ? "sent" : "sending"} variant="neutral" appearance="soft" className={t.state} data-sent={sent}>
                {sent ? <Check aria-hidden="true" /> : null}
                {sent ? COPY.sent : COPY.sending}
              </Badge>
            </RowButton>
          </li>
        ))}
      </ul>
      <span className={t.stat} data-shown={sent}>
        <b className={t.figure}>{COPY.stat.figure}</b>
        <span>{COPY.stat.note}</span>
      </span>
      {traced
        ? CHANNELS.map((c) => <Connector key={c.key} from="[data-hub]" to={`[data-channel="${c.key}"]`} inset={-6} state="active" />)
        : null}
    </div>
  );
}

// QUADRO 3: A LEITURA POR CANAL
function ReadFrame({ at }: FrameProps) {
  const read = at("read");
  return (
    <ul className={t.tracks} data-band="">
      {CHANNELS.map((c) => {
        const last = read ? READ[c.key] : undefined;
        return (
          <li key={c.key} className={t.track} data-track={c.key}>
            <span className={t.trackHead} data-axis="track">
              <InkMark icon={c.icon} large />
              <b>{c.name}</b>
            </span>
            <span className={t.stops}>
              <Badge variant="neutral" appearance="soft" className={t.stop}>
                <Check aria-hidden="true" />
                {COPY.sent}
              </Badge>
              <span className={t.line} aria-hidden="true" />
              <Badge variant="neutral" appearance="soft" className={t.stop}>
                <Check aria-hidden="true" />
                {COPY.delivered}
              </Badge>
              {last ? (
                <>
                  <span className={`${t.line} ${t.lineIn}`} data-tone={last.tone} aria-hidden="true" />
                  <Badge variant="neutral" appearance="soft" className={`${t.stop} ${t.stopIn}`} data-tone={last.tone}>
                    <CheckCheck aria-hidden="true" />
                    {last.label}
                  </Badge>
                </>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// QUADRO 4: A RESPOSTA NA CONVERSA CERTA E O CONVITE
function ReplyFrame({ scene, at, traced }: FrameProps) {
  const done = at("done");
  return (
    <>
      <div className={t.reply} data-band="">
        <Node id="message" icon={MessageCircle} title={COPY.replyFrom.title} meta={COPY.replyFrom.meta} />
        <LiveCard data-reply="" {...COPY.reply} />
        <Node id="relloo" icon={MessagesSquare} title={COPY.relloo.title} meta={COPY.relloo.meta} waiting={!done} />
        {traced ? <Connector from='[data-node="message"]' to="[data-reply]" inset={-6} state="active" /> : null}
        {traced && done ? <Connector from="[data-reply]" to='[data-node="relloo"]' inset={-6} state="active" /> : null}
      </div>
      {/* The other channels: each one replays the send */}
      <div className={t.more} data-band="" data-more="">
        <span className={t.moreLabel}>{COPY.more}</span>
        {MORE.map((m) => (
          <ActionButton
            key={m.name}
            icon={<m.icon />}
            emphasis="outline"
            size="md"
            onClick={() => scene.take(TAKE_FROM)}
          >
            {m.name}
          </ActionButton>
        ))}
      </div>
      <div className={t.ask} data-band="" data-ask="">
        <b>{COPY.ask}</b>
        <ActionButton emphasis="primary" size="md" icon={<CalendarDays />} href={CONTACT_HREF}>
          {CTA_LABEL}
        </ActionButton>
      </div>
    </>
  );
}

const VIEWS = [MessageFrame, SendFrame, ReadFrame, ReplyFrame];

// QUADRO DO CARROSSEL
// One frame in the shared cell: `enter` when it comes in, `leave` while it goes (inert, under the next one), `still`
// when it neither comes nor goes (the settled frame of the server and of reduced motion, and the copies of the ghost)
function Frame({
  index,
  phase,
  ...props
}: FrameProps & { index: number; phase: "enter" | "leave" | "still" }) {
  const View = VIEWS[index];
  const leaving = phase === "leave";
  return (
    <div
      className={t.frame}
      data-frame={index + 1}
      data-phase={phase}
      data-current={!leaving}
      aria-hidden={leaving || undefined}
      inert={leaving}
    >
      <View {...props} />
    </div>
  );
}

function TunerCarouselView({ scene }: { scene: SceneApi }) {
  // The ghost stacks every frame, settled, so the window has the height of the tallest one
  if (scene.ghost)
    return (
      <div className={t.root}>
        {FRAMES.map((f, i) => (
          <Frame key={f.caption + i} index={i} phase="still" scene={scene} at={ALL} traced={false} />
        ))}
      </div>
    );
  const index = frameOf(scene.id);
  const settled = scene.cycle < 0;
  // The frame before leaves during the first step of this one, keyed as it was while current so it is the same node;
  // a human take lands from any frame, so it brings no frame of its own to leave
  const first = FRAMES[index].steps[0] === scene.id;
  const fromTake = scene.mode === "human" && scene.id === TAKE_FROM;
  const prev = (index + FRAMES.length - 1) % FRAMES.length;
  const prevCycle = index === 0 ? scene.cycle - 1 : scene.cycle;
  const leaving = first && !settled && !fromTake;
  return (
    <div className={t.root}>
      {leaving ? (
        <Frame key={`${prev}:${prevCycle}`} index={prev} phase="leave" scene={scene} at={ALL} traced />
      ) : null}
      <Frame
        key={`${index}:${scene.cycle}`}
        index={index}
        phase={settled ? "still" : "enter"}
        scene={scene}
        at={scene.reached}
        traced
      />
    </div>
  );
}

// INDICADOR DE QUADRO
// In the chrome bar, as in the frames: the caption of the frame, then the kit's frame indicator
function FrameTools({ scene }: { scene: SceneApi }) {
  return (
    <span className={t.indicator}>
      <span className={t.caption}>{FRAMES[frameOf(scene.id)].caption}</span>
      <FrameIndicator scene={scene} frames={FRAME_STEPS} />
    </span>
  );
}

export function TunerCarousel({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="tuner-carousel"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      steps={TUNER_CAROUSEL_STEPS}
      timeline={timeline}
      tools={(scene) => <FrameTools scene={scene} />}
    >
      {(scene) => <TunerCarouselView scene={scene} />}
    </Scene>
  );
}
