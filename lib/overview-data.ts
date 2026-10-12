// DADOS DA VISÃO GERAL DA CADEIA
// What the top block of the chain (components/template/ChainOverview) needs, built on the server from the motion
// manifest: the columns of the line (products in the order of the plot, then the outcome), and per step the lit nodes,
// the ends of the token, its delay and duration on screen and the caption. The server writes it next to the block as a
// <script type="application/json">, and the browser code (components/ring/overview-follow.ts) reads the DOM, never the
// manifest. Delay and duration of the token come from the script of the scenes (lib/scenes/script.ts).
import { MANIFEST } from "./manifest";
import { SCRIPT } from "./scenes/script";
import { overviewOrder } from "./manifest/select";
import type { Manifest, TokenEnd } from "./manifest/types";

export type OverviewStep = {
  // Columns of the lit nodes (index in `order`)
  nodes: number[];
  // Columns the token leaves and reaches
  from: number;
  to: number;
  // Screen seconds from the start of the step to the first motion of the token, and how long the token walks
  delay: number;
  dur: number;
  label: string;
};

export type OverviewData = {
  order: TokenEnd[];
  steps: OverviewStep[];
};

const round = (n: number) => Math.round(n * 1000) / 1000;

export function overviewData(manifest: Manifest = MANIFEST): OverviewData {
  const order = overviewOrder(manifest);
  const col = (end: TokenEnd) => order.indexOf(end);
  return {
    order,
    // Nodes, ends and caption are the manifest's; the time the token walks is the script's (lib/scenes/script.ts), the
    // clock of the native scenes
    steps: manifest.chain.steps.map(({ overview: o }, index) => {
      const scene = SCRIPT.find((s) => s.step === index);
      return {
        nodes: o.nodes.map(col),
        from: col(o.token.from),
        to: col(o.token.to),
        delay: round(scene?.token.at ?? 0),
        dur: round(scene?.token.dur ?? 0),
        label: o.label,
      };
    }),
  };
}
