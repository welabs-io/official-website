// TESTES DA CADEIA
// The rules the reader of the motion manifest used to enforce, now on the native data of the chain: seven steps in
// order, every product and end a real slug, the token of each step touching a lit node, the labels of the connections in
// at most 3 words and 24 characters in sentence case and the captions in at most 6 words and 48 characters, every text
// inside the copy rules of the site and naming no mechanism; the selectors order the overview line by the plot and give
// the four ties of the connector block, each pair always with the same label.
import { describe, expect, it } from "vitest";
import { COPY_RULES } from "./content/rules";
import { PRODUCTS } from "./products";
import { CHAIN_STEPS, overviewOrder, ties } from "./chain";

const SLUGS: readonly string[] = PRODUCTS.map((p) => p.slug);
const MECHANISM =
  /\b(recibo|protocolo|tenant|fila|erp|crm|cliente|clientes|webhook|payload)\b/i;

describe("chain data", () => {
  it("has the seven steps in order, each about real products", () => {
    expect(CHAIN_STEPS.map((s) => s.step)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    for (const step of CHAIN_STEPS) {
      expect(step.products.length).toBeGreaterThan(0);
      for (const slug of [...step.products, ...step.overview.nodes])
        expect(SLUGS).toContain(slug);
      expect(SLUGS).toContain(step.connection.from);
      expect([...SLUGS, "outcome"]).toContain(step.connection.to);
    }
  });
  it("the token of every step walks between products and touches a lit node", () => {
    for (const { overview: o } of CHAIN_STEPS)
      expect(
        [o.token.from, o.token.to].some(
          (e) => e !== "outcome" && o.nodes.includes(e),
        ),
        o.label,
      ).toBe(true);
  });
  it("labels are short and in sentence case, captions fit the overview, and the screen-reader sentences say something", () => {
    for (const { connection, overview, srLabel } of CHAIN_STEPS) {
      expect(connection.label.split(" ").length).toBeLessThanOrEqual(3);
      expect(connection.label.length).toBeLessThanOrEqual(24);
      expect(connection.label).toMatch(/^\p{Lu}[^\p{Lu}]*$/u);
      expect(overview.label.split(" ").length).toBeLessThanOrEqual(6);
      expect(overview.label.length).toBeLessThanOrEqual(48);
      expect(srLabel.split(" ").length).toBeGreaterThanOrEqual(8);
    }
  });
  it("every text of the chain obeys the copy rules of the site and names no mechanism", () => {
    const bad: string[] = [];
    CHAIN_STEPS.forEach((s, i) => {
      for (const [where, text] of Object.entries({
        overview: s.overview.label,
        connection: s.connection.label,
        srLabel: s.srLabel,
      }))
        if (COPY_RULES.test(text) || MECHANISM.test(text))
          bad.push(`step ${i} ${where}: ${text}`);
    });
    expect(bad).toEqual([]);
  });
});

describe("chain selectors", () => {
  it("orders the overview line by the plot, with the outcome last", () => {
    expect(overviewOrder()).toEqual([
      "domus",
      "relloo",
      "tuner",
      "knowly",
      "magneto",
      "outcome",
    ]);
  });
  it("gives exactly the seam and the three rails, and the same pair never changes its label", () => {
    const list = ties();
    expect(list.map((t) => `${t.place}:${t.a}-${t.b}`).sort()).toEqual([
      "rail:knowly-relloo",
      "rail:magneto-domus",
      "rail:tuner-relloo",
      "seam:domus-relloo",
    ]);
    for (const tie of list) {
      const steps = CHAIN_STEPS.filter(
        (s) =>
          [s.connection.from, s.connection.to].sort().join() ===
          [tie.a, tie.b].sort().join(),
      );
      expect(new Set(steps.map((s) => s.connection.label)).size).toBe(1);
    }
  });
});
