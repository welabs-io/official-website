"use client";
// CENA DO KNOWLY: O GRAFO DE MEMÓRIA, EM 4 QUADROS
// The carousel of the approved canvas frame KnowlyGraph (brief v4, 2026-10-23): the memory as a graph that grows while
// the camera pulls back, from zoom 100 % to 8 %, until it reads as a constellation in the shape of a brain. 1: a
// subject is born (the brand's globe at the centre, its first sources around it); 2: the links grow (the facts around
// them, and a decision with its 2 proofs); 3: other subjects link in; 4: the whole memory, its newest link, and the
// closing question with the lib's primary "Agendar uma demonstração". The appetizer shows the effect (the memory only
// grows, everything stays linked), never the mechanism: no extraction step is drawn.
// One kit Scene: each frame is a group of steps, and the camera never stops between them (each step glides the zoom on
// for its whole hold, one registered CSS property drives the SVG's transform and the labels' places). The newest link
// is amber (with its node, when it has one): at most 2 pieces of amber per frame, the brand's globe aside. The graph
// itself is data (knowly-graph.ts, seeded). The continuity (autoplay, loop, human take, off-screen, reduced motion =
// the settled frame) is the kit's (components/scene-kit/Scene.tsx); this file only renders from `scene`.
import { memo, type CSSProperties } from "react";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Link2,
  MessageCircle,
  Video,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ActionButton } from "@/components/lib/ui";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { CTA_LABEL } from "@/lib/products";
import { FrameIndicator } from "../FrameIndicator";
import { Scene, SCENE_CURVE, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import {
  GRAPH,
  LIVE,
  type GraphLink,
  type GraphNode,
  type GraphStep,
} from "./knowly-graph";
import k from "./knowly-carousel.module.css";

// ROTEIRO DA CENA
// Four frames of 2.4 to 4.6 s. Each step glides the camera on for its hold (`zoom`, the share of the world on
// screen), so the pull-back is continuous from the first step to the last frame; the settled step (done) keeps the
// camera still, so a take ends on a frame that holds. A take from frame 3 plays 7.7 s, inside the kit's 8 s.
type Beat = SceneStep & {
  id: GraphStep | "done";
  hold: number;
  zoom: number;
  move: "glide" | "drift";
};

const BEATS: readonly Beat[] = [
  { id: "f1-seed", hold: 900, zoom: 1, move: "drift" },
  { id: "f1-link", hold: 1500, zoom: 0.92, move: "drift" },
  { id: "f2-grow", hold: 1300, zoom: 0.64, move: "glide" },
  { id: "f2-decision", hold: 1500, zoom: 0.58, move: "drift" },
  { id: "f3-subjects", hold: 1300, zoom: 0.32, move: "glide" },
  { id: "f3-bridge", hold: 1500, zoom: 0.29, move: "drift" },
  { id: "f4-whole", hold: 1700, zoom: 0.09, move: "glide" },
  { id: "f4-new", hold: 1100, zoom: 0.08, move: "drift" },
  // The question enters in 800 ms and then holds still for more than a second
  { id: "done", hold: 2100, zoom: 0.08, move: "drift" },
];

export const KNOWLY_CAROUSEL_STEPS: readonly SceneStep[] = BEATS.map(
  ({ id, hold }) => ({ id, hold }),
);

// The steps of each frame, in order
const FRAMES = [
  ["f1-seed", "f1-link"],
  ["f2-grow", "f2-decision"],
  ["f3-subjects", "f3-bridge"],
  ["f4-whole", "f4-new", "done"],
] as const;

type FrameN = 1 | 2 | 3 | 4;

const frameOf = (id: string) =>
  (FRAMES.findIndex((ids) => (ids as readonly string[]).includes(id)) +
    1) as FrameN;

const indexOf = (id: string) => BEATS.findIndex((b) => b.id === id);

// The visitor's gesture plays from frame 3 (the lab's "Simular gesto", SceneSlot.tsx)
export const KNOWLY_TAKE_FROM = "f3-subjects";

// CONTEÚDO DA CENA
// Generic subjects of the thread (Contato 4821, Proposta 905, Pedido 1234...), no person and no vendor
const COPY = {
  product: "Knowly",
  title: "Memória",
  label:
    "Knowly: a memória da empresa como um grafo que cresce, de um assunto até a constelação inteira, com a ligação mais nova em destaque",
  frames: [
    "Um assunto nasce",
    "As ligações crescem",
    "Outros assuntos se ligam",
    "A memória inteira",
  ],
  zoom: ["Zoom 100%", "Zoom 60%", "Zoom 30%", "Zoom 8%"],
  close: "O que a sua empresa já decidiu e esqueceu?",
  closeNote:
    "Cada fonte nova se liga ao que já existe. Nada se apaga, e cada resposta mostra de onde veio.",
  newest: "Ligação nova · agora",
  legend: [
    { id: "subject", text: "Assunto" },
    { id: "fact", text: "Fato" },
    { id: "link", text: "Ligação" },
    { id: "newest", text: "Mais recente" },
  ],
};

// OS RÓTULOS
// A few labels only, each tied to a node (or a point) of the graph and shown in the frames it names: chips in frame 1
// (the first sources, with their Domus glyphs), plain words further out. `sm: false` keeps a label off a phone, where
// the pane is too narrow for it at that zoom.
type Place = "center" | "above" | "below" | "left" | "right";
type Tone = "chip" | "subject" | "strong" | "muted" | "note";
type Label = {
  id: string;
  at: string | { x: number; y: number };
  text: string;
  frames: readonly FrameN[];
  tone: Tone;
  place: Place;
  icon?: LucideIcon;
  step?: GraphStep;
  sm?: false;
};

const NEW_LINK = GRAPH.links.find((l) => l.id === LIVE[4].link)!;
const nodeById = new Map(GRAPH.nodes.map((n) => [n.id, n]));
// The middle of the newest link (its curve's middle is close to the chord's): where its note sits
const NEW_MID = (() => {
  const a = nodeById.get(NEW_LINK.from)!;
  const b = nodeById.get(NEW_LINK.to)!;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
})();

const LABELS: readonly Label[] = [
  {
    id: "subject-chip",
    at: "subject",
    text: "Contato 4821 · manutenção",
    frames: [1],
    tone: "subject",
    place: "below",
  },
  {
    id: "talk-chip",
    at: "talk",
    text: "Conversa",
    frames: [1],
    tone: "chip",
    place: "center",
    icon: MessageCircle,
  },
  {
    id: "visit-chip",
    at: "visit",
    text: "Vistoria",
    frames: [1],
    tone: "chip",
    place: "center",
    icon: ClipboardList,
  },
  {
    id: "proposal-chip",
    at: "proposal",
    text: "Proposta 905",
    frames: [1],
    tone: "chip",
    place: "center",
    icon: FileText,
  },
  {
    id: "meeting-chip",
    at: "meeting",
    text: "Reunião",
    frames: [1],
    tone: "chip",
    place: "center",
    icon: Video,
    step: "f1-link",
  },
  {
    id: "talk",
    at: "talk",
    text: "Conversa",
    frames: [2],
    tone: "strong",
    place: "above",
  },
  {
    id: "visit",
    at: "visit",
    text: "Vistoria",
    frames: [2],
    tone: "strong",
    place: "above",
  },
  {
    id: "proposal",
    at: "proposal",
    text: "Proposta 905",
    frames: [2],
    tone: "strong",
    place: "right",
  },
  {
    id: "meeting",
    at: "meeting",
    text: "Reunião",
    frames: [2],
    tone: "strong",
    place: "left",
  },
  {
    id: "policy",
    at: "policy",
    text: "Política de serviço",
    frames: [2],
    tone: "muted",
    place: "above",
  },
  {
    id: "warranty",
    at: "warranty",
    text: "Garantia",
    frames: [2],
    tone: "muted",
    place: "left",
    sm: false,
  },
  {
    id: "ticket",
    at: "ticket",
    text: "Chamado 140",
    frames: [2],
    tone: "muted",
    place: "below",
    sm: false,
  },
  {
    id: "contract",
    at: "contract",
    text: "Contrato 52",
    frames: [2],
    tone: "muted",
    place: "above",
    sm: false,
  },
  {
    id: "invoice",
    at: "invoice",
    text: "Fatura 7710",
    frames: [2],
    tone: "muted",
    place: "below",
    sm: false,
  },
  {
    id: "order",
    at: "order",
    text: "Pedido 1234",
    frames: [2],
    tone: "muted",
    place: "below",
    sm: false,
  },
  {
    id: "decision",
    at: "decision",
    text: "Decisão · 2 provas",
    frames: [2],
    tone: "note",
    place: "below",
    step: "f2-decision",
  },
  {
    id: "subject",
    at: "subject",
    text: "Contato 4821",
    frames: [3, 4],
    tone: "strong",
    place: "below",
  },
  {
    id: "billing",
    at: "billing",
    text: "Faturamento",
    frames: [3, 4],
    tone: "muted",
    place: "above",
  },
  {
    id: "rules",
    at: "rules",
    text: "Normas",
    frames: [3, 4],
    tone: "muted",
    place: "above",
  },
  {
    id: "block",
    at: "block",
    text: "Bloco B",
    frames: [3, 4],
    tone: "muted",
    place: "below",
  },
  {
    id: "purchases",
    at: "purchases",
    text: "Compras",
    frames: [3, 4],
    tone: "muted",
    place: "below",
  },
  {
    id: "newest",
    at: NEW_MID,
    text: COPY.newest,
    frames: [4],
    tone: "note",
    place: "above",
    icon: Link2,
    step: "f4-new",
    sm: false,
  },
];

// O QUE CADA PASSO MOSTRA
// A piece is in once its step is reached; the live link and node only on their own frame (the amber moves on to the
// next frame's newest link, the earlier one goes back to grey at once)
type View = { frame: FrameN; index: number };

const isIn = (step: GraphStep, view: View) => view.index >= indexOf(step);
const liveLink = (id: string, view: View) =>
  LIVE[view.frame].link === id && isIn(LIVE[view.frame].step, view);
const liveNode = (id: string, view: View) =>
  LIVE[view.frame].node === id && isIn(LIVE[view.frame].step, view);

const varStyle = (vars: Record<string, string | number>) =>
  vars as CSSProperties;

// The dot of a node: a zero-length round-capped line, so it keeps its size on screen at every zoom (its stroke does not
// scale). The subject is the brand's globe (drawn over the graph, not as a dot); the first sources are chips in frame 1,
// dots after it
const DOTS = GRAPH.nodes.filter((n) => n.kind !== "subject");

// Memoised on its two flags: a step re-renders only the pieces whose state it changes (some 600 in the world)
const Dot = memo(function Dot({
  node,
  shown,
  live,
}: {
  node: GraphNode;
  shown: boolean;
  live: boolean;
}) {
  return (
    <path
      className={k.dot}
      d={`M${Math.round(node.x)} ${Math.round(node.y)}h0`}
      data-kind={node.kind}
      data-far={node.step === "f4-whole" ? "" : undefined}
      data-in={shown}
      data-live={live}
      style={varStyle({ "--wave": node.wave.toFixed(3) })}
    />
  );
});

// A link, drawn from end to end as it arrives; the live one draws at once, out of the wave of its step
const LinkPath = memo(function LinkPath({
  link,
  shown,
  live,
}: {
  link: GraphLink;
  shown: boolean;
  live: boolean;
}) {
  return (
    <path
      className={k.link}
      d={link.d}
      pathLength={1}
      data-level={link.level}
      data-in={shown}
      data-live={live}
      style={varStyle({ "--wave": live ? 0 : link.wave.toFixed(3) })}
    />
  );
});

function LabelView({ label, view }: { label: Label; view: View }) {
  const at = typeof label.at === "string" ? nodeById.get(label.at)! : label.at;
  const shown =
    label.frames.includes(view.frame) &&
    (!label.step || isIn(label.step, view));
  const Icon = label.icon;
  const live = label.id === "meeting-chip" && liveLink(LIVE[1].link, view);
  return (
    <span
      className={k.label}
      data-label={label.id}
      data-tone={label.tone}
      data-place={label.place}
      data-in={shown}
      data-live={live}
      data-sm={label.sm === false ? "off" : undefined}
      data-axis={Icon ? "label" : undefined}
      data-axis-pair={Icon ? "" : undefined}
      style={varStyle({ "--x": Math.round(at.x), "--y": Math.round(at.y) })}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      <span>{label.text}</span>
    </span>
  );
}

// O MUNDO: O GRAFO, A CÂMERA E O GLOBO
// The camera is one element whose registered --z (the zoom) glides to each step's value for that step's hold; the SVG
// group scales by it (a CSS transform, links and dots keep their width on screen) and every label and the globe are
// placed by the same value, so they ride the zoom without a measure. Keyed by the loop: a new loop enters as a new
// world (zoom 100 %) while the old one fades.
function World({ view, beat }: { view: View; beat: Beat }) {
  return (
    <div
      className={k.camera}
      data-frame={view.frame}
      data-move={beat.move}
      style={varStyle({ "--z": beat.zoom, "--glide": `${beat.hold}ms` })}
    >
      <svg className={k.svg} aria-hidden="true">
        <svg x="50%" y="50%" overflow="visible">
          <g className={k.lens}>
            <g>
              {GRAPH.links.map((l) => (
                <LinkPath
                  key={l.id}
                  link={l}
                  shown={isIn(l.step, view)}
                  live={liveLink(l.id, view)}
                />
              ))}
            </g>
            <g>
              {DOTS.map((n) => (
                <Dot
                  key={n.id}
                  node={n}
                  shown={
                    isIn(n.step, view) &&
                    !(n.kind === "core" && view.frame === 1)
                  }
                  live={liveNode(n.id, view)}
                />
              ))}
            </g>
          </g>
        </svg>
      </svg>
      <span className={k.globe} aria-hidden="true">
        {/* The official mark of the product (brand/vector/symbols/knowly-light.svg), never redrawn */}
        <img
          src="/brands/welabs/symbols/knowly-light.svg"
          alt=""
          width={64}
          height={64}
        />
      </span>
      {LABELS.map((label) => (
        <LabelView key={label.id} label={label} view={view} />
      ))}
    </div>
  );
}

// The head of the pane: the frame's name and its zoom, every frame's in one cell (the head never changes width)
function Head({ frame }: { frame: FrameN }) {
  return (
    <div className={k.head}>
      <span className={k.stack} data-lead="">
        {COPY.frames.map((name, i) => (
          <b key={name} className={k.frameName} data-in={frame === i + 1}>
            {i + 1} · {name}
          </b>
        ))}
      </span>
      <span className={`${k.stack} ${k.zoom}`}>
        {COPY.zoom.map((z, i) => (
          <span key={z} data-in={frame === i + 1}>
            {z}
          </span>
        ))}
      </span>
    </div>
  );
}

// O FECHAMENTO: A PERGUNTA E O CONVITE
function Close({ view }: { view: View }) {
  const done = view.index >= indexOf("done");
  return (
    <div className={k.close} data-in={view.frame === 4}>
      <div className={k.ask} data-ask="" data-in={done}>
        <b className={k.question} data-lead="">
          {COPY.close}
        </b>
        <span className={k.note} data-lead="">
          {COPY.closeNote}
        </span>
        <span data-lead="">
          <ActionButton
            emphasis="primary"
            size="md"
            icon={<CalendarDays />}
            href={CONTACT_HREF}
            tabIndex={done ? undefined : -1}
          >
            {CTA_LABEL}
          </ActionButton>
        </span>
      </div>
      <span className={k.legend} data-lead="">
        {COPY.legend.map((item) => (
          <span
            key={item.id}
            className={k.legendItem}
            data-axis="legend"
            data-axis-pair=""
          >
            <span
              className={k.swatch}
              data-swatch={item.id}
              data-dot=""
              aria-hidden="true"
            />
            <span>{item.text}</span>
          </span>
        ))}
      </span>
    </div>
  );
}

function KnowlyGraphView({ scene }: { scene: SceneApi }) {
  // The hidden copy only holds the window's height (the pane has one fixed height at each width)
  if (scene.ghost) return <div className={k.root} />;
  const index = Math.max(0, scene.index);
  const view: View = { frame: frameOf(BEATS[index].id), index };
  return (
    <div className={k.root} data-frame={view.frame} data-current="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene.cycle}
          className={k.world}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: SCENE_CURVE.dur2 * 1.5,
              ease: SCENE_CURVE.out,
            },
          }}
          exit={{
            opacity: 0,
            transition: { duration: SCENE_CURVE.dur2, ease: SCENE_CURVE.inOut },
          }}
        >
          <World view={view} beat={BEATS[index]} />
        </motion.div>
      </AnimatePresence>
      <Head frame={view.frame} />
      <Close view={view} />
    </div>
  );
}

export function KnowlyCarousel({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="knowly-carousel"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      tools={(scene) => <FrameIndicator scene={scene} frames={FRAMES} />}
      steps={KNOWLY_CAROUSEL_STEPS}
      timeline={timeline}
    >
      {(scene) => <KnowlyGraphView scene={scene} />}
    </Scene>
  );
}
