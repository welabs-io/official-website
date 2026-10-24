"use client";
// QUADROS DOS CINCO PRODUTOS
// One small screen per product (brief-v4, artboards Main and Accordion, 2026-10-23), the effect only, never the
// mechanism: the Domus with its modules and the four products that use the newest one, the Relloo conversation whose
// answer types in, the Magneto approval, the Tuner channels landing in one conversation and the Knowly memory graph.
// The same frame fills the stage of the opening (wide) and the open panel of the accordion (narrow): the window is a
// size container, so a narrow one keeps fewer modules and drops the captions (frames.module.css). The links between
// pieces are the kit's Connector (curved, rest grey, active ink, live amber); the typing is the kit's TypeIn.
// 2026-10-24 (operator): every frame walks its chain to the end on the kit's clock (useSceneClock: autoplay on screen,
// loop, off-screen pause, the closed chain under reduced motion and on the server), one live hand-off per step and the
// closed chain held before the loop starts again: the Domus lights the four, the Relloo deal reaches "Ganha", the
// Magneto proposal reaches the order, the three Tuner channels land, and the Knowly frame is the memory graph of its
// carousel (it was the answer with its source). Each loop is 6.4 s: the first step holds while the blades of the
// opening leave (~1.5 s), the chain closes by ~3.6 s, inside the 3 s the opening holds a frame, and the loop starts
// again after the blades are back, so the opening never shows it restart.
import {
  Bot,
  Check,
  ClipboardCheck,
  Coins,
  FileText,
  Landmark,
  Mail,
  MessageCircle,
  MessageSquare,
  Package,
  PenLine,
  Phone,
  Scale,
  ShoppingBag,
  Tag,
  Users,
  CircleCheck,
} from "lucide-react";
import type { ReactElement } from "react";
import { Badge } from "@/components/lib/ui";
import {
  Connector,
  type ConnectorState,
} from "@/components/scene-kit/Connector";
import {
  useSceneClock,
  type SceneApi,
  type SceneStep,
} from "@/components/scene-kit/Scene";
import { KnowlyGraphWorld } from "@/components/scene-kit/scenes/knowly-carousel";
import {
  TYPING_MS,
  TypeIn,
  TypingIndicator,
} from "@/components/scene-kit/TypeIn";
import {
  DOMUS_FRAME,
  KNOWLY_FRAME,
  MAGNETO_FRAME,
  RELLOO_FRAME,
  TUNER_FRAME,
} from "@/lib/content";
import { productAlt, productLogo, type ProductSlug } from "@/lib/products";
import f from "./frames.module.css";

const MODULE_ICON: Record<string, ReactElement> = {
  tag: <Tag />,
  bag: <ShoppingBag />,
  box: <Package />,
  coins: <Coins />,
  pen: <PenLine />,
  users: <Users />,
  file: <FileText />,
  bank: <Landmark />,
  chat: <MessageSquare />,
  check: <CircleCheck />,
  scale: <Scale />,
  clipboard: <ClipboardCheck />,
};

// The modules a narrow frame keeps (the accordion panel): two columns of three
const COMPACT = new Set([
  "Financeiro",
  "Contratos",
  "Fiscal",
  "Pessoas",
  "Chamados",
  "Vistoria",
]);
const USERS = ["relloo", "magneto", "tuner", "knowly"] as const;

// ROTEIRO DE CADA QUADRO
// The steps of each frame (ids and holds, 6.4 s a loop): the first holds under the leaving blades, one hand-off per
// step, the last one is the closed chain (`done`, or the graph's newest link), held until the loop starts again
const FIRST_HOLD = 1500;
const HAND_OFF = 500;
const STEPS: Record<ProductSlug, readonly SceneStep[]> = {
  domus: [
    { id: "born", hold: FIRST_HOLD },
    { id: "relloo", hold: HAND_OFF },
    { id: "magneto", hold: HAND_OFF },
    { id: "tuner", hold: HAND_OFF },
    { id: "knowly", hold: HAND_OFF },
    { id: "done", hold: 2900 },
  ],
  // The "digitando" (1 s) and the typed answer first, then the deal walks its stages
  relloo: [
    { id: "talk", hold: 2000 },
    { id: "qualify", hold: HAND_OFF },
    { id: "visit", hold: HAND_OFF },
    { id: "won", hold: HAND_OFF },
    { id: "done", hold: 2900 },
  ],
  magneto: [
    { id: "approve", hold: FIRST_HOLD },
    { id: "sign", hold: 700 },
    { id: "order", hold: 700 },
    { id: "done", hold: 3500 },
  ],
  tuner: [
    { id: "message", hold: FIRST_HOLD },
    { id: "call", hold: 700 },
    { id: "mail", hold: 700 },
    { id: "done", hold: 3500 },
  ],
  // A subset of the Knowly carousel's steps (knowly-carousel.tsx BEATS): the camera pulls back from the first sources to
  // the whole memory, whose newest link is the end
  knowly: [
    { id: "f1-link", hold: FIRST_HOLD },
    { id: "f2-decision", hold: 700 },
    { id: "f3-bridge", hold: 700 },
    { id: "f4-whole", hold: 700 },
    { id: "f4-new", hold: 2800 },
  ],
};

// How the Knowly camera moves on each step of the frame: a glide on each jump, the closing step drifts
const KNOWLY_MOVE: Record<string, "glide" | "drift"> = {
  "f1-link": "drift",
  "f2-decision": "glide",
  "f3-bridge": "glide",
  "f4-whole": "glide",
  "f4-new": "drift",
};

// The state of the link into the k-th piece of a chain when the chain is at `at` (`closed`: every link run)
const linkState = (k: number, at: number, closed: boolean): ConnectorState =>
  closed || k < at ? "active" : k === at ? "live" : "rest";

// The title bar of a frame: its name, a quiet line beside it and an optional piece at the end
function Bar({
  title,
  sub,
  end,
}: {
  title: string;
  sub?: string;
  end?: ReactElement;
}) {
  return (
    <div className={f.bar}>
      <span className={f.barTitle}>{title}</span>
      {sub ? <span className={f.barSub}>{sub}</span> : null}
      {end ? <span className={f.barEnd}>{end}</span> : null}
    </div>
  );
}

// DOMUS: OS MÓDULOS E OS QUATRO QUE USAM O NOVO
// The new module is born, then the link to each of the other four turns live in turn and stays drawn in ink, its card
// lit; the chain closes with the four lit
function DomusFrame({ scene }: { scene: SceneApi }) {
  const d = DOMUS_FRAME;
  const closed = scene.is("done");
  const at = USERS.findIndex((slug) => scene.is(slug));
  // The hand-off on screen: the index of the user being lit (all four once closed, none while the module is born)
  const reached = closed ? USERS.length : at;
  return (
    <>
      <Bar
        title={d.title}
        sub={d.sub}
        end={
          <span className={f.legend}>
            <span className={f.legendItem} data-kind="standard">
              {d.standard}
            </span>
            <span className={f.legendItem} data-kind="custom">
              {d.custom}
            </span>
          </span>
        }
      />
      <div className={f.body}>
        <ul className={f.modules} data-modules="">
          {d.modules.map((m) => (
            <li
              // The newest module enters again on every loop
              key={m.kind === "new" ? `${m.name}-${scene.cycle}` : m.name}
              className={f.module}
              data-kind={m.kind}
              data-wide-only={COMPACT.has(m.name) ? undefined : ""}
            >
              <span className={f.moduleIcon} aria-hidden="true">
                {MODULE_ICON[m.icon]}
              </span>
              {/* The tags of the artboard (NFS-e, PIX, Novo) cut the name in a three-column frame (e2e/scene-fit.spec.ts):
                  the module made to measure is outlined and the newest one green, with no tag */}
              <span className={f.moduleName}>{m.name}</span>
            </li>
          ))}
        </ul>
        <ul className={f.uses}>
          {USERS.map((slug, i) => (
            <li
              key={slug}
              className={f.use}
              data-use={slug}
              data-lit={i <= reached && reached >= 0 ? "" : undefined}
            >
              <img
                src={productLogo(slug, "light", "row", 30)}
                alt={productAlt(slug, "row")}
                width={1005}
                height={550}
                className={f.useLogo}
              />
              <span className={f.useLine}>{d.uses[slug]}</span>
            </li>
          ))}
        </ul>
        <p className={f.usesLine}>{d.usesLine}</p>
        {USERS.map((slug, i) => (
          <Connector
            key={slug}
            from="[data-modules]"
            to={`[data-use="${slug}"]`}
            route="drop"
            inset={0}
            gap={6}
            state={reached < 0 ? "rest" : linkState(i, reached, closed)}
          />
        ))}
      </div>
    </>
  );
}

// RELLOO: A CONVERSA E A RESPOSTA QUE SE DIGITA
// The answer types in, then the deal walks its stages, one live link per step, and closes green on "Ganha"
const RELLOO_STAGE: Record<string, number> = {
  talk: 0,
  qualify: 1,
  visit: 2,
  won: 3,
  done: 3,
};

function RellooFrame({ scene }: { scene: SceneApi }) {
  const r = RELLOO_FRAME;
  const closed = scene.is("done");
  const at = RELLOO_STAGE[scene.id] ?? 0;
  return (
    <>
      <Bar
        title={r.title}
        sub={r.who}
        end={
          <Badge variant="success" appearance="soft">
            {r.linked}
          </Badge>
        }
      />
      <div className={f.owner}>
        <span className={f.ownerLabel}>{r.owner}</span>
        <Badge variant="primary" appearance="solid">
          <Bot aria-hidden="true" />
          {r.agent}
        </Badge>
      </div>
      {/* Keyed by the loop: the "digitando" and the answer play again on each one */}
      <div key={scene.cycle} className={f.thread}>
        <p className={f.bubbleIn}>
          <span>{r.incoming}</span>
          <span className={f.time}>{r.time}</span>
        </p>
        <p className={f.bubbleOut}>
          <TypeIn text={r.answer} delay={TYPING_MS} />
        </p>
        <span className={f.typing}>
          <TypingIndicator
            label={r.typing}
            showLabel
            className={f.typingDots}
          />
        </span>
      </div>
      <div className={f.stages}>
        {r.stages.map((stage, i) => (
          <span
            key={stage}
            className={f.stage}
            data-stage={i}
            data-current={(i === at && !closed) || undefined}
            data-passed={i < at || undefined}
            data-won={(closed && i === r.stages.length - 1) || undefined}
            // A narrow frame drops the first stage (the conversation above is it), so the end stays in view
            data-wide-only={i === 0 ? "" : undefined}
          >
            {stage}
          </span>
        ))}
        {r.stages.slice(1).map((stage, i) => (
          <Connector
            key={stage}
            from={`[data-stage="${i}"]`}
            to={`[data-stage="${i + 1}"]`}
            inset={0}
            gap={4}
            state={linkState(i + 1, at, closed)}
          />
        ))}
      </div>
    </>
  );
}

// MAGNETO: A PROPOSTA PELO CAMINHO DA APROVAÇÃO
// The live step moves down the path to the order in the Domus; the chain closes with every step done and approved
const MAGNETO_STEP: Record<string, number> = {
  approve: 1,
  sign: 2,
  order: 3,
  done: 4,
};

function MagnetoFrame({ scene }: { scene: SceneApi }) {
  const m = MAGNETO_FRAME;
  const live = MAGNETO_STEP[scene.id] ?? 1;
  const closed = live >= m.steps.length;
  return (
    <>
      <Bar
        title={m.title}
        end={
          closed ? (
            <Badge variant="success" appearance="soft">
              {m.doneState}
            </Badge>
          ) : (
            <Badge variant="secondary" appearance="solid">
              {m.state}
            </Badge>
          )
        }
      />
      <div className={f.body}>
        <ol className={f.steps}>
          {m.steps.map((s, i) => {
            const state = i < live ? "done" : i === live ? "live" : "next";
            return (
              <li key={s.name} className={f.step} data-step-state={state}>
                <span className={f.stepMark} data-mark={i} aria-hidden="true">
                  {state === "done" ? <Check /> : null}
                </span>
                <span className={f.stepName}>{s.name}</span>
                <span className={f.stepLine}>
                  {state === "done" ? s.at : state === "live" ? m.now : m.next}
                </span>
              </li>
            );
          })}
        </ol>
        {m.steps.slice(1).map((s, i) => (
          <Connector
            key={s.name}
            from={`[data-mark="${i}"]`}
            to={`[data-mark="${i + 1}"]`}
            route="drop"
            inset={0}
            gap={4}
            state={linkState(i + 1, live, closed)}
          />
        ))}
      </div>
    </>
  );
}

// TUNER: CADA CANAL NA MESMA CONVERSA
// One channel after the other lands in the conversation (its link live as it lands, in ink after); the chain closes
// with the three in one history
const CHANNEL_ICON = [
  <MessageCircle key="m" />,
  <Phone key="p" />,
  <Mail key="e" />,
];
const TUNER_STEP: Record<string, number> = {
  message: 0,
  call: 1,
  mail: 2,
  done: 3,
};

function TunerFrame({ scene }: { scene: SceneApi }) {
  const t = TUNER_FRAME;
  const at = TUNER_STEP[scene.id] ?? 0;
  const closed = at >= t.channels.length;
  const landed = Math.min(at, t.channels.length - 1);
  return (
    <>
      <Bar title={t.title} />
      <div className={f.hub}>
        <ul className={f.channels}>
          {t.channels.map((c, i) => (
            <li
              key={c.name}
              className={f.channel}
              data-channel={i}
              data-wait={i > at || undefined}
            >
              <span className={f.channelIcon} aria-hidden="true">
                {CHANNEL_ICON[i]}
              </span>
              <span className={f.channelText}>
                <span className={f.channelName}>{c.name}</span>
                <span className={f.channelLine}>{c.line}</span>
              </span>
            </li>
          ))}
        </ul>
        <div
          className={f.hubThread}
          data-thread=""
          data-done={closed || undefined}
        >
          <span className={f.channelName}>{t.thread.title}</span>
          <span className={f.channelLine}>{t.thread.lines[landed]}</span>
        </div>
        {t.channels.map((c, i) => (
          <Connector
            key={c.name}
            from={`[data-channel="${i}"]`}
            to="[data-thread]"
            inset={0}
            gap={6}
            state={linkState(i, at, closed)}
          />
        ))}
      </div>
    </>
  );
}

// KNOWLY: O GRAFO DE MEMÓRIA QUE CRESCE
// The world of the Knowly carousel (its graph, labels and camera), walked on the frame's shorter steps
function KnowlyFrame({ scene }: { scene: SceneApi }) {
  const hold = STEPS.knowly.find((s) => s.id === scene.id)?.hold;
  return (
    <>
      <Bar title={KNOWLY_FRAME.title} />
      <div className={f.graph} data-graph="">
        <KnowlyGraphWorld
          scene={scene}
          beat={{ hold, move: KNOWLY_MOVE[scene.id] }}
        />
      </div>
    </>
  );
}

const FRAMES: Record<
  ProductSlug,
  (props: { scene: SceneApi }) => ReactElement
> = {
  domus: DomusFrame,
  relloo: RellooFrame,
  magneto: MagnetoFrame,
  tuner: TunerFrame,
  knowly: KnowlyFrame,
};

// The window of one frame with its clock: `data-frame-step` is the step on screen and `data-frame-closed` marks the
// closed chain (the last step), so a spec reads where the chain is
function FrameWindow({
  slug,
  className,
}: {
  slug: ProductSlug;
  className?: string;
}) {
  const { scene, ref } = useSceneClock(STEPS[slug]);
  const Frame = FRAMES[slug];
  return (
    <div
      ref={ref}
      className={className ? `${f.window} ${className}` : f.window}
      data-frame={slug}
      data-frame-step={scene.id}
      data-frame-closed={scene.last || undefined}
      data-on={scene.active}
    >
      <Frame scene={scene} />
    </div>
  );
}

/** The frame of one product, a white window filling its parent, playing its chain while on screen */
export function ProductFrame({
  slug,
  className,
}: {
  slug: ProductSlug;
  className?: string;
}) {
  // Keyed by the product: another product is another clock
  return <FrameWindow key={slug} slug={slug} className={className} />;
}
