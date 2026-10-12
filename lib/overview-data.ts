// DADOS DA VISÃO GERAL DA CADEIA
// What the top block of the chain (components/template/ChainOverview) needs, built on the server from the motion
// manifest: the columns of the line (products in the order of the plot, then the outcome), and per step the lit nodes,
// the ends of the token, its delay and duration on screen and the caption. The server writes it next to the block as a
// <script type="application/json">, and the browser code (components/ring/overview-follow.ts) reads the DOM, never the
// manifest. No time here is decided by the site: delay and duration are the manifest's piece seconds over the rate.
import { MANIFEST } from "./manifest";
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
    steps: manifest.chain.steps.map(({ overview: o, detail: d }) => ({
      nodes: o.nodes.map(col),
      from: col(o.token.from),
      to: col(o.token.to),
      delay: round((o.from - d.from) / d.rate),
      dur: round((o.to - o.from) / d.rate),
      label: o.label,
    })),
  };
}
