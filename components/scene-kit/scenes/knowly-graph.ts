// O GRAFO DE MEMÓRIA DO KNOWLY
// The memory graph of the Knowly carousel (canvas KnowlyGraph.dc.html, brief v4 of 2026-10-23): one subject at the
// centre, its first links, the facts around them, other subjects that link in, and then the whole memory, a
// constellation in the shape of a brain seen from above (two lobes and the fissure between them). The near part is
// placed by hand (it carries the few labels); the far part is generated from a fixed seed, so every render, the server
// and the specs see the very same graph. Pure data: no React, no DOM. Coordinates are world units, the screen pixels at
// zoom 100 % on a large screen; the scene scales them with one CSS transform.

// The step at which a piece of the graph appears (the scene's steps, knowly-carousel.tsx)
export type GraphStep =
  | "f1-seed"
  | "f1-link"
  | "f2-grow"
  | "f2-decision"
  | "f3-subjects"
  | "f3-bridge"
  | "f4-whole"
  | "f4-new";

// subject: the centre (the brand's globe); core: the first neighbours (chips in frame 1); hub: another subject; fact:
// what hangs from a subject
export type NodeKind = "subject" | "core" | "hub" | "fact";

export type GraphNode = {
  id: string;
  x: number;
  y: number;
  kind: NodeKind;
  step: GraphStep;
  // Share (0 to 1) of the arrival wave of its step: the far nodes arrive from the centre outwards
  wave: number;
};

// The three line levels of the site (--hairline-8, -14 and -30): the far, the near and the structure
export type LinkLevel = 8 | 14 | 30;

export type GraphLink = {
  id: string;
  from: string;
  to: string;
  step: GraphStep;
  level: LinkLevel;
  // The curve: the quadratic control point (links are always curved, never straight)
  d: string;
  wave: number;
};

// A small fast seeded generator (mulberry32): the same seed, the same constellation
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const GRAPH_SEED = 4821;

// A FORMA DO CÉREBRO
// Two lobes side by side (ellipses), a fissure between them at the top and at the bottom, and the near part kept clear
// for the hand-placed graph. Exported for the tests
const LOBE = { cx: 1850, cy: -40, rx: 1950, ry: 2300 };
export const BRAIN_HALF = { x: LOBE.cx + LOBE.rx, y: LOBE.ry - LOBE.cy };

export function inBrain(x: number, y: number) {
  const side = x < 0 ? -1 : 1;
  // The front of the brain (the top) is a little narrower than the back
  const rx = LOBE.rx * (y < 0 ? 0.94 : 1);
  const dx = (x - side * LOBE.cx) / rx;
  const dy = (y - LOBE.cy) / LOBE.ry;
  if (dx * dx + dy * dy > 1) return false;
  // The fissure between the lobes, open towards the top and the bottom edges
  if (Math.abs(x) < 110 + Math.abs(y) * 0.05 && Math.abs(y) > 1100)
    return false;
  return true;
}

// The near part (frames 1 to 3) is kept clear of generated nodes
const inCore = (x: number, y: number) => (x / 1350) ** 2 + (y / 980) ** 2 < 1;

// Curved link from a to b: the control point off the middle, across the line, by `bend` of its length
function curve(
  a: { x: number; y: number },
  b: { x: number; y: number },
  bend: number,
) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  const r = (n: number) => Math.round(n * 10) / 10;
  return `M${r(a.x)} ${r(a.y)}Q${r(cx)} ${r(cy)} ${r(b.x)} ${r(b.y)}`;
}

// A PARTE PRÓXIMA, POSTA À MÃO
const CORE_NODES: readonly Omit<GraphNode, "wave">[] = [
  { id: "subject", x: 0, y: 0, kind: "subject", step: "f1-seed" },
  // Frame 1: the subject's first sources
  { id: "talk", x: -190, y: -135, kind: "core", step: "f1-seed" },
  { id: "visit", x: 195, y: -140, kind: "core", step: "f1-seed" },
  { id: "proposal", x: 205, y: 140, kind: "core", step: "f1-seed" },
  { id: "meeting", x: -195, y: 140, kind: "core", step: "f1-link" },
  // Frame 2: what hangs from them, and the decision with its two proofs
  { id: "policy", x: -20, y: -260, kind: "fact", step: "f2-grow" },
  { id: "warranty", x: -520, y: -30, kind: "fact", step: "f2-grow" },
  { id: "ticket", x: -470, y: 250, kind: "fact", step: "f2-grow" },
  { id: "contract", x: 540, y: -40, kind: "fact", step: "f2-grow" },
  { id: "invoice", x: 480, y: 250, kind: "fact", step: "f2-grow" },
  { id: "order", x: 190, y: 280, kind: "fact", step: "f2-grow" },
  { id: "f2a", x: -340, y: -250, kind: "fact", step: "f2-grow" },
  { id: "f2b", x: 330, y: -265, kind: "fact", step: "f2-grow" },
  { id: "f2c", x: -640, y: 170, kind: "fact", step: "f2-grow" },
  { id: "f2d", x: 650, y: 160, kind: "fact", step: "f2-grow" },
  { id: "decision", x: -130, y: 250, kind: "fact", step: "f2-decision" },
  // Frame 3: other subjects that link in
  { id: "billing", x: -900, y: -560, kind: "hub", step: "f3-subjects" },
  { id: "rules", x: 880, y: -590, kind: "hub", step: "f3-subjects" },
  { id: "block", x: 940, y: 560, kind: "hub", step: "f3-subjects" },
  { id: "purchases", x: -930, y: 570, kind: "hub", step: "f3-subjects" },
];

const CORE_LINKS: readonly [string, string, GraphStep, LinkLevel, number][] = [
  ["subject", "talk", "f1-seed", 30, 0.18],
  ["subject", "visit", "f1-seed", 30, -0.2],
  ["subject", "proposal", "f1-seed", 30, 0.16],
  ["subject", "meeting", "f1-link", 30, -0.18],
  ["talk", "policy", "f2-grow", 14, 0.2],
  ["talk", "f2a", "f2-grow", 14, -0.2],
  ["talk", "warranty", "f2-grow", 14, 0.18],
  ["meeting", "warranty", "f2-grow", 14, -0.22],
  ["meeting", "ticket", "f2-grow", 14, 0.2],
  ["warranty", "f2c", "f2-grow", 14, 0.2],
  ["ticket", "f2c", "f2-grow", 14, -0.18],
  ["visit", "policy", "f2-grow", 14, -0.2],
  ["visit", "f2b", "f2-grow", 14, 0.2],
  ["visit", "contract", "f2-grow", 14, -0.18],
  ["proposal", "contract", "f2-grow", 14, 0.2],
  ["proposal", "invoice", "f2-grow", 14, -0.2],
  ["proposal", "order", "f2-grow", 14, 0.2],
  ["contract", "f2d", "f2-grow", 14, -0.2],
  ["invoice", "f2d", "f2-grow", 14, 0.2],
  ["invoice", "order", "f2-grow", 14, 0.22],
  // The decision's two proofs: the meeting, and the proposal (the live link of frame 2)
  ["meeting", "decision", "f2-decision", 14, 0.2],
  ["proposal", "decision", "f2-decision", 30, -0.16],
  // The other subjects reach the near part
  ["billing", "f2a", "f3-subjects", 14, 0.18],
  ["billing", "warranty", "f3-subjects", 14, -0.2],
  ["rules", "f2b", "f3-subjects", 14, -0.18],
  ["rules", "contract", "f3-subjects", 14, 0.2],
  ["block", "f2d", "f3-subjects", 14, -0.2],
  ["block", "invoice", "f3-subjects", 14, 0.18],
  ["purchases", "ticket", "f3-subjects", 14, 0.2],
  ["purchases", "f2c", "f3-subjects", 14, -0.2],
  ["subject", "billing", "f3-subjects", 30, 0.14],
  ["subject", "block", "f3-subjects", 30, 0.14],
  ["rules", "block", "f3-subjects", 30, -0.2],
  // The live link of frame 3: one subject reaches another across the memory
  ["billing", "rules", "f3-bridge", 30, -0.14],
];

// The live link of each frame and its live node, if any (the amber of the frame, brief v4: the newest link is amber)
export const LIVE: Record<
  1 | 2 | 3 | 4,
  { link: string; node?: string; step: GraphStep }
> = {
  1: { link: "subject-meeting", step: "f1-link" },
  2: { link: "proposal-decision", node: "decision", step: "f2-decision" },
  3: { link: "billing-rules", node: "rules", step: "f3-bridge" },
  4: { link: "new-link", step: "f4-new" },
};

// A PARTE DISTANTE, GERADA PELA SEMENTE
// Subjects scattered in the lobes at a least distance from each other, each with its facts around it; facts link to
// their subject and now and then to a neighbour fact, subjects link to their nearest subjects. Many small subjects
// (rather than a few big ones) give the dense, even texture of a brain at 8 %
const FAR = { subjects: 44, spacing: 540, facts: 3, neighbours: 3 };
export function buildGraph(seed = GRAPH_SEED) {
  const rand = seeded(seed);
  const nodes: GraphNode[] = CORE_NODES.map((n) => ({ ...n, wave: 0 }));
  const links: GraphLink[] = [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const bend = () => (rand() < 0.5 ? -1 : 1) * (0.12 + rand() * 0.12);

  // The facts of the four subjects of frame 3
  const hubs3 = nodes.filter((n) => n.kind === "hub");
  for (const hub of hubs3) {
    const facts: GraphNode[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rand() * 0.6;
      const r = 120 + rand() * 170;
      const f: GraphNode = {
        id: `${hub.id}-${i}`,
        x: hub.x + Math.cos(a) * r,
        y: hub.y + Math.sin(a) * r,
        kind: "fact",
        step: "f3-subjects",
        wave: 0,
      };
      facts.push(f);
      links.push({
        id: `${hub.id}-${f.id}`,
        from: hub.id,
        to: f.id,
        step: "f3-subjects",
        level: 14,
        d: "",
        wave: 0,
      });
      if (i > 0 && rand() < 0.55)
        links.push({
          id: `${f.id}-n`,
          from: facts[i - 1].id,
          to: f.id,
          step: "f3-subjects",
          level: 8,
          d: "",
          wave: 0,
        });
    }
    nodes.push(...facts);
  }

  // The subjects of the whole memory
  const far: GraphNode[] = [];
  const taken = [...hubs3, byId.get("subject")!];
  for (let tries = 0; tries < 6000 && far.length < FAR.subjects; tries++) {
    const x = (rand() * 2 - 1) * BRAIN_HALF.x;
    const y = (rand() * 2 - 1) * BRAIN_HALF.y;
    if (!inBrain(x, y) || inCore(x, y)) continue;
    if (taken.some((h) => Math.hypot(h.x - x, h.y - y) < FAR.spacing)) continue;
    const hub: GraphNode = {
      id: `h${far.length}`,
      x,
      y,
      kind: "hub",
      step: "f4-whole",
      wave: 0,
    };
    far.push(hub);
    taken.push(hub);
  }
  nodes.push(...far);
  for (const hub of far) {
    const count = FAR.facts + Math.floor(rand() * 3);
    const facts: GraphNode[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rand() * 0.7;
      const r = 100 + rand() * 200;
      const x = hub.x + Math.cos(a) * r;
      const y = hub.y + Math.sin(a) * r;
      if (!inBrain(x, y)) continue;
      const f: GraphNode = {
        id: `${hub.id}-${i}`,
        x,
        y,
        kind: "fact",
        step: "f4-whole",
        wave: 0,
      };
      if (facts.length && rand() < 0.5)
        links.push({
          id: `${f.id}-n`,
          from: facts[facts.length - 1].id,
          to: f.id,
          step: "f4-whole",
          level: 8,
          d: "",
          wave: 0,
        });
      facts.push(f);
      // Far away the lines step down a level (brief v4: thinner and lighter far than near)
      links.push({
        id: `${hub.id}-${f.id}`,
        from: hub.id,
        to: f.id,
        step: "f4-whole",
        level: 8,
        d: "",
        wave: 0,
      });
    }
    nodes.push(...facts);
  }
  // Each far subject to its nearest subjects (the frame-3 ones included), once per pair
  const subjects = [...hubs3, ...far];
  const paired = new Set<string>();
  for (const hub of far) {
    const near = subjects
      .filter((h) => h !== hub)
      .sort(
        (a, b) =>
          Math.hypot(a.x - hub.x, a.y - hub.y) -
          Math.hypot(b.x - hub.x, b.y - hub.y),
      )
      .slice(0, FAR.neighbours);
    for (const other of near) {
      const key = [hub.id, other.id].sort().join("|");
      if (paired.has(key)) continue;
      paired.add(key);
      links.push({
        id: `${hub.id}-${other.id}`,
        from: other.id,
        to: hub.id,
        step: "f4-whole",
        level: 14,
        d: "",
        wave: 0,
      });
    }
  }
  // The newest link of the whole memory: the farthest subject of the right lobe reaches a subject of frame 3
  const edge = far.reduce((a, b) => (b.x > a.x ? b : a));
  links.push({
    id: "new-link",
    from: "block",
    to: edge.id,
    step: "f4-new",
    level: 30,
    d: "",
    wave: 0,
  });

  for (const [from, to, step, level] of CORE_LINKS)
    links.push({ id: `${from}-${to}`, from, to, step, level, d: "", wave: 0 });

  // The curves, and the arrival wave of each step: from its nearest node to its farthest
  const all = new Map(nodes.map((n) => [n.id, n]));
  const dist = (n: GraphNode) => Math.hypot(n.x, n.y);
  for (const step of new Set(nodes.map((n) => n.step))) {
    const group = nodes.filter((n) => n.step === step);
    const lo = Math.min(...group.map(dist));
    const hi = Math.max(...group.map(dist));
    for (const n of group) n.wave = hi > lo ? (dist(n) - lo) / (hi - lo) : 0;
  }
  const bends = new Map(
    CORE_LINKS.map(([from, to, , , b]) => [`${from}-${to}`, b]),
  );
  for (const l of links) {
    const a = all.get(l.from)!;
    const b = all.get(l.to)!;
    l.d = curve(
      a,
      b,
      bends.get(l.id) ?? (l.id === "new-link" ? -0.18 : bend()),
    );
    // A link starts once both of its ends of the same step are in
    l.wave = Math.max(
      a.step === l.step ? a.wave : 0,
      b.step === l.step ? b.wave : 0,
    );
  }
  return { nodes, links, newEdge: edge.id };
}

export const GRAPH = buildGraph();
