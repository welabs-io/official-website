// TESTES DO GRAFO DE MEMÓRIA DO KNOWLY
// The generated constellation is fixed by its seed (stable specs and server render), light enough to stay smooth
// (fewer than 300 nodes), and drawn in the shape it promises: every far node inside the brain, every link curved and
// tied to two nodes that exist, and one live link per frame.
import { describe, expect, it } from "vitest";
import { BRAIN_HALF, GRAPH, LIVE, buildGraph, inBrain } from "./knowly-graph";

describe("the Knowly memory graph", () => {
  it("is the same graph for the same seed", () => {
    expect(JSON.stringify(buildGraph())).toBe(JSON.stringify(GRAPH));
    expect(JSON.stringify(buildGraph(7))).not.toBe(JSON.stringify(GRAPH));
  });

  it("stays light: fewer than 300 nodes, and a dense constellation at the end", () => {
    expect(GRAPH.nodes.length).toBeLessThan(300);
    expect(GRAPH.nodes.length).toBeGreaterThan(150);
    expect(GRAPH.links.length).toBeGreaterThan(GRAPH.nodes.length);
  });

  it("draws the far part inside the two lobes of the brain", () => {
    const far = GRAPH.nodes.filter((n) => n.step === "f4-whole");
    expect(far.length).toBeGreaterThan(100);
    for (const n of far) expect(inBrain(n.x, n.y), n.id).toBe(true);
    // Both lobes are filled
    expect(far.filter((n) => n.x < -BRAIN_HALF.x / 2).length).toBeGreaterThan(
      20,
    );
    expect(far.filter((n) => n.x > BRAIN_HALF.x / 2).length).toBeGreaterThan(
      20,
    );
  });

  it("ties every link to two nodes, always as a curve", () => {
    const ids = new Set(GRAPH.nodes.map((n) => n.id));
    for (const l of GRAPH.links) {
      expect(ids.has(l.from) && ids.has(l.to), l.id).toBe(true);
      expect(l.d, l.id).toMatch(/^M[-\d. ]+Q[-\d. ]+$/);
    }
    expect(new Set(GRAPH.links.map((l) => l.id)).size).toBe(GRAPH.links.length);
  });

  it("has one live link per frame, appearing on its frame's step", () => {
    for (const live of Object.values(LIVE)) {
      const link = GRAPH.links.find((l) => l.id === live.link);
      expect(link, live.link).toBeDefined();
      expect(link!.step).toBe(live.step);
    }
  });
});
