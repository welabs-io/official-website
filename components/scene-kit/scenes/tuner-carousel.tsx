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
// (the message, the send in flight, the read now, the answer). This file only renders from `scene`; every word comes
// from the dictionary of the page (m.scenes.tuner), the glyphs, tones and step ids stay here.
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
import { CONTACT_PATH } from "@/components/onepage/contact";
import { localizePath } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import type { SceneMessages } from "@/lib/i18n/types";
import { Connector } from "../Connector";
import { FrameIndicator } from "../FrameIndicator";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import { TypeIn } from "../TypeIn";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import t from "./tuner-carousel.module.css";

// ROTEIRO DA CENA
// Two steps per frame: message (the Magneto's message lands) and handed (it reaches the Tuner); fanout (the Tuner
// sends it through the three channels) and sent (every channel took it); delivered (each one reports sent and
// delivered) and read (two were read, one of them now); reply (the answer arrives) and done (it is in the right
// conversation, the frame settles with the question and the button, 1.8 s). No hold depends on the text, so the copy is
// not read; the scene still takes it so every scene's clock has the same shape (see SceneSlot)
const TUNER_STEPS: readonly SceneStep[] = [
  { id: "message", hold: 1500 },
  { id: "handed", hold: 1500 },
  { id: "fanout", hold: 1400 },
  { id: "sent", hold: 1600 },
  { id: "delivered", hold: 1400 },
  { id: "read", hold: 1600 },
  { id: "reply", hold: 1400 },
  { id: "done", hold: 1800 },
];

export function tunerSteps(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for the shared clock signature
  _copy: SceneMessages<"tuner">,
): readonly SceneStep[] {
  return TUNER_STEPS;
}

// The four frames of the carousel, each with its steps (the name and the caption of the chrome bar are text:
// copy.frames, by position)
const FRAMES = [
  { steps: ["message", "handed"] },
  { steps: ["fanout", "sent"] },
  { steps: ["delivered", "read"] },
  { steps: ["reply", "done"] },
] as const;

// The step a human take jumps to (a channel of frame 2, or one of the other channels of frame 4): the scene replays
// the send from there
const TAKE_FROM = "fanout";

const frameOf = (step: string) =>
  Math.max(
    0,
    FRAMES.findIndex((f) => (f.steps as readonly string[]).includes(step)),
  );
// The steps of each frame, for the chrome's frame indicator (the kit's FrameIndicator)
const FRAME_STEPS = FRAMES.map((f) => f.steps);
// The note of a live card types in once the card has landed (the frame's entry)
const TYPE_LAND_MS = 400;

// CANAIS DA CENA
// The three channels of the send, with the glyphs of the approved frames (the name of each, by position, is
// copy.channels)
const CHANNELS: readonly { key: string; icon: LucideIcon }[] = [
  { key: "email", icon: Mail },
  { key: "message", icon: MessageCircle },
  { key: "integration", icon: Plug },
];

// What each channel reports in frame 3, after sent and delivered: the e-mail is read now (the live piece), the message
// was read (done, green), the integration stays delivered. `label` names the key of the text in the dictionary
const READ: Record<
  string,
  { label: "readNow" | "read"; tone: "live" | "done" } | undefined
> = {
  email: { label: "readNow", tone: "live" },
  message: { label: "read", tone: "done" },
};

// The other channels of the Tuner (frame 4), with their glyphs (the name of each, by position, is
// copy.moreChannels)
const MORE: readonly { icon: LucideIcon }[] = [
  { icon: Phone },
  { icon: Video },
  { icon: Hash },
  { icon: Globe },
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
    <span
      className={`${p.mark} ${large ? p.markLg : p.markMd} ${t.ink}`}
      aria-hidden="true"
    >
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
    <div
      className={t.node}
      data-node={id}
      data-state={waiting ? "waiting" : "idle"}
      data-axis="node"
    >
      <InkMark icon={icon} />
      <span className={p.stack}>
        <b>{title}</b>
        <span>{meta}</span>
      </span>
    </div>
  );
}

// The live card of a frame (the message, the answer): amber-50 with the amber ring, its figure big and bold
function LiveCard({
  eyebrow,
  figure,
  note,
  ...rest
}: { eyebrow: string; figure: string; note: string } & Record<
  `data-${string}`,
  string
>) {
  return (
    <div className={t.live} {...rest}>
      <span className={t.eyebrow}>{eyebrow}</span>
      <b className={t.figure}>{figure}</b>
      {/* v4: the note types in as the card lands (the frame mounts per loop, so it types once per frame shown) */}
      <span className={t.note}>
        <TypeIn text={note} delay={TYPE_LAND_MS} />
      </span>
    </div>
  );
}

// QUADRO 1: A MENSAGEM
function MessageFrame({ at, traced }: FrameProps) {
  const copy = useI18n().m.scenes.tuner;
  return (
    <div className={t.flow} data-band="">
      <Node
        id="magneto"
        icon={Workflow}
        title={copy.magneto.title}
        meta={copy.magneto.meta}
      />
      <LiveCard data-message="" {...copy.message} />
      <Node
        id="tuner"
        icon={RadioTower}
        title={copy.tuner.title}
        meta={copy.tuner.meta}
        waiting={!at("handed")}
      />
      {traced ? (
        <Connector
          from='[data-node="magneto"]'
          to="[data-message]"
          inset={-6}
        />
      ) : null}
      {traced && at("handed") ? (
        <Connector from="[data-message]" to='[data-node="tuner"]' inset={-6} />
      ) : null}
    </div>
  );
}

// QUADRO 2: O ENVIO POR TODOS OS CANAIS
function SendFrame({ scene, at, traced }: FrameProps) {
  const copy = useI18n().m.scenes.tuner;
  const sent = at("sent");
  return (
    <div className={t.fan} data-band="">
      <div className={t.hub} data-hub="">
        <InkMark icon={RadioTower} large />
        <b>{copy.tuner.title}</b>
        <Badge
          variant="neutral"
          appearance="soft"
          className={t.flight}
          data-tone="live"
        >
          {copy.inFlight}
        </Badge>
      </div>
      {/* Each channel is a row, a control that replays the send from here */}
      <ul className={`${p.rowStates} ${t.channels}`}>
        {CHANNELS.map((c, i) => (
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
              <span className={t.channelName}>{copy.channels[i]}</span>
              <Badge
                key={sent ? "sent" : "sending"}
                variant="neutral"
                appearance="soft"
                className={t.state}
                data-sent={sent}
              >
                {sent ? <Check aria-hidden="true" /> : null}
                {sent ? copy.sent : copy.sending}
              </Badge>
            </RowButton>
          </li>
        ))}
      </ul>
      <span className={t.stat} data-shown={sent}>
        <b className={t.figure}>{copy.stat.figure}</b>
        <span>{copy.stat.note}</span>
      </span>
      {traced
        ? CHANNELS.map((c) => (
            <Connector
              key={c.key}
              from="[data-hub]"
              to={`[data-channel="${c.key}"]`}
              inset={-6}
            />
          ))
        : null}
    </div>
  );
}

// QUADRO 3: A LEITURA POR CANAL
function ReadFrame({ at }: FrameProps) {
  const copy = useI18n().m.scenes.tuner;
  const read = at("read");
  return (
    <ul className={t.tracks} data-band="">
      {CHANNELS.map((c, i) => {
        const last = read ? READ[c.key] : undefined;
        return (
          <li key={c.key} className={t.track} data-track={c.key}>
            <span className={t.trackHead} data-axis="track">
              <InkMark icon={c.icon} large />
              <b>{copy.channels[i]}</b>
            </span>
            <span className={t.stops}>
              <Badge variant="neutral" appearance="soft" className={t.stop}>
                <Check aria-hidden="true" />
                {copy.sent}
              </Badge>
              <span className={t.line} aria-hidden="true" />
              <Badge variant="neutral" appearance="soft" className={t.stop}>
                <Check aria-hidden="true" />
                {copy.delivered}
              </Badge>
              {last ? (
                <>
                  <span
                    className={`${t.line} ${t.lineIn}`}
                    data-tone={last.tone}
                    aria-hidden="true"
                  />
                  <Badge
                    variant="neutral"
                    appearance="soft"
                    className={`${t.stop} ${t.stopIn}`}
                    data-tone={last.tone}
                  >
                    <CheckCheck aria-hidden="true" />
                    {copy[last.label]}
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
  const { m, locale } = useI18n();
  const copy = m.scenes.tuner;
  const done = at("done");
  return (
    <>
      <div className={t.reply} data-band="">
        <Node
          id="message"
          icon={MessageCircle}
          title={copy.replyFrom.title}
          meta={copy.replyFrom.meta}
        />
        <LiveCard data-reply="" {...copy.reply} />
        <Node
          id="relloo"
          icon={MessagesSquare}
          title={copy.relloo.title}
          meta={copy.relloo.meta}
          waiting={!done}
        />
        {traced ? (
          <Connector
            from='[data-node="message"]'
            to="[data-reply]"
            inset={-6}
          />
        ) : null}
        {traced && done ? (
          <Connector from="[data-reply]" to='[data-node="relloo"]' inset={-6} />
        ) : null}
      </div>
      {/* The other channels: each one replays the send */}
      <div className={t.more} data-band="" data-more="">
        <span className={t.moreLabel}>{copy.more}</span>
        {MORE.map((channel, i) => (
          <ActionButton
            key={copy.moreChannels[i]}
            icon={<channel.icon />}
            emphasis="outline"
            size="md"
            onClick={() => scene.take(TAKE_FROM)}
          >
            {copy.moreChannels[i]}
          </ActionButton>
        ))}
      </div>
      <div className={t.ask} data-band="" data-ask="">
        <b>{copy.ask}</b>
        <ActionButton
          emphasis="primary"
          size="md"
          icon={<CalendarDays />}
          href={localizePath(locale, CONTACT_PATH)}
        >
          {m.common.cta}
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
          <Frame
            key={f.steps[0]}
            index={i}
            phase="still"
            scene={scene}
            at={ALL}
            traced={false}
          />
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
        <Frame
          key={`${prev}:${prevCycle}`}
          index={prev}
          phase="leave"
          scene={scene}
          at={ALL}
          traced
        />
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
  const copy = useI18n().m.scenes.tuner;
  return (
    <span className={t.indicator}>
      <span className={t.caption}>
        {copy.frames[frameOf(scene.id)].caption}
      </span>
      {/* v4 (Stage.dc.html): the name of each moment, on the stage tabs of the chrome */}
      <FrameIndicator
        scene={scene}
        frames={FRAME_STEPS}
        names={copy.frames.map((f) => f.name)}
      />
    </span>
  );
}

export function TunerCarousel({ timeline }: { timeline?: SceneTimeline }) {
  const copy = useI18n().m.scenes.tuner;
  return (
    <Scene
      id="tuner-carousel"
      label={copy.label}
      product={copy.product}
      title={copy.title}
      steps={tunerSteps(copy)}
      timeline={timeline}
      tools={(scene) => <FrameTools scene={scene} />}
    >
      {(scene) => <TunerCarouselView scene={scene} />}
    </Scene>
  );
}
