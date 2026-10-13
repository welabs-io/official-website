// GEOMETRIA DA VISÃO GERAL
// Pure numbers shared by the server (first state of the block) and the browser (every later step): where the token
// walks, which stretch of the line it lights and how far the bridge of the connector reaches. No data import, so the
// lazy chunk of the scenes can use it. Everything is a percent of the width of the block, whose columns are equal.
import type { OverviewStep } from "./overview-data";

// Centre of a column, in percent of the width of the block
export const colPercent = (col: number, count: number) =>
  ((col + 0.5) / count) * 100;

const pct = (n: number) => `${Math.round(n * 1000) / 1000}%`;

// CSS custom properties of one step on the block: token path, timing, lit stretch and bridge of the connector
export function stepVars(
  step: OverviewStep,
  count: number,
): Record<string, string> {
  const xf = colPercent(step.from, count);
  const xt = colPercent(step.to, count);
  const lit = step.nodes.map((c) => colPercent(c, count));
  return {
    "--xf": pct(xf),
    "--xt": pct(xt),
    "--delay": `${step.delay}s`,
    "--dur": `${step.dur}s`,
    "--tl": pct(Math.min(xf, xt)),
    "--tw": pct(Math.abs(xt - xf)),
    "--torigin": xf <= xt ? "0 50%" : "100% 50%",
    // The bridge runs from the farthest lit node to the axis (50%) on each side
    "--bl": pct(Math.min(50, ...lit)),
    "--br": pct(Math.max(50, ...lit)),
  };
}
