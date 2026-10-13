// DADOS DA VISÃO GERAL DA CADEIA
// What the top block of the chain (components/template/ChainOverview) needs, built on the server from the data of the
// chain (lib/chain.ts): the columns of the line (products in the order of the plot, then the outcome), and per step the
// lit nodes, the ends of the token, its delay and duration on screen and the caption. The server writes it next to the
// block as a <script type="application/json">, and the browser code (components/ring/overview-follow.ts) reads the DOM,
// never the chain itself. Delay and duration of the token come from the script of the scenes (lib/scenes/script.ts).
import { CHAIN_STEPS, overviewOrder, type TokenEnd } from "./chain";
import { SCRIPT } from "./scenes/script";

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

export function overviewData(): OverviewData {
  const order = overviewOrder();
  const col = (end: TokenEnd) => order.indexOf(end);
  return {
    order,
    // Nodes, ends and caption are the chain's (lib/chain.ts); the time the token walks is the script's
    // (lib/scenes/script.ts), the clock of the native scenes
    steps: CHAIN_STEPS.map(({ overview: o }, index) => {
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
