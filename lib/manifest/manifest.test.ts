// TESTES DO MANIFESTO DE MOTION
// The manifest the site ships passes the reader; twelve broken manifests fail with a message that names the field; the
// selectors keep the order of the chain and give the four ties of the connector block; the labels follow the rules of the
// site (3 words, 24 characters, no mechanism name).
import { describe, expect, it } from "vitest";
import { COPY_RULES } from "../content/rules";
import raw from "../motion-manifest.json";
import { PRODUCT_SLUGS } from "../product-slugs";
import { PRODUCTS } from "../products";
import { MANIFEST } from "./index";
import { ManifestError, parseManifest } from "./parse";
import { chainSteps, overviewOrder, ties } from "./select";

const clone = () => JSON.parse(JSON.stringify(raw));

describe("parse", () => {
  it("accepts the manifest of the round", () => {
    expect(parseManifest(clone())).toBeTruthy();
    expect(MANIFEST.schemaVersion).toMatch(/^1\./);
  });

  const broken: [string, (m: ReturnType<typeof clone>) => void, RegExp][] = [
    [
      "to after settledAt + 0.1",
      (m) => (m.chain.steps[0].to = m.chain.steps[0].settledAt + 1),
      /to must be at most settledAt/,
    ],
    [
      "to before from",
      (m) => (m.chain.steps[0].to = m.chain.steps[0].from - 1),
      /to must be after from/,
    ],
    ["rate zero", (m) => (m.chain.steps[1].rate = 0), /rate must be > 0/],
    [
      "hold under one second",
      (m) => (m.chain.steps[1].holdAfter = 0.5),
      /holdAfter must be/,
    ],
    [
      "unknown slug in products",
      (m) => (m.chain.steps[0].products = ["tuner", "zeta"]),
      /unknown slug/,
    ],
    [
      "connection end that is not a product",
      (m) => (m.chain.steps[0].connection.to = "zeta" as never),
      /connection.to is not a product/,
    ],
    [
      "forbidden word in a label",
      (m) => (m.chain.steps[0].connection.label = "Recibo pronto"),
      /forbidden word/,
    ],
    [
      "label with four words",
      (m) => (m.chain.steps[0].connection.label = "Uma duas três quatro"),
      /more than 3 words/,
    ],
    [
      "label over 24 characters",
      (m) => (m.chain.steps[0].connection.label = "Mensagemmuitolongademaisx"),
      /24 characters/,
    ],
    [
      "the same pair with two labels",
      (m) => (m.chain.steps[2].connection.label = "Outro valor"),
      /two labels/,
    ],
    [
      "product without a main film",
      (m) => (m.products.domus.films[0].role = "support"),
      /exactly one main film/,
    ],
    [
      "piece missing from pieces",
      (m) => delete m.pieces[m.chain.steps[0].piece],
      /not in pieces/,
    ],
    [
      "segment without a transition",
      (m) => delete m.chain.steps[2].transition,
      /transition has no duration/,
    ],
    [
      "piece without a duration",
      (m) => (m.pieces[Object.keys(m.pieces)[0]].duration = 0),
      /no duration/,
    ],
    [
      "overview with an unknown node",
      (m) => (m.chain.steps[0].overview.nodes = ["domus", "zeta"]),
      /nodes must be distinct, known products/,
    ],
    [
      "overview nodes that differ from the products of the step",
      (m) => (m.chain.steps[1].products = ["relloo"]),
      /nodes must be the products of the step/,
    ],
    [
      "token that touches no active node",
      (m) =>
        (m.chain.steps[1].overview.token = { from: "domus", to: "relloo" }),
      /token touches no active node/,
    ],
    [
      "token end that is not a product",
      (m) => (m.chain.steps[0].overview.token.to = "zeta"),
      /token ends must be products or outcome/,
    ],
    [
      "overview range outside the detail",
      (m) => (m.chain.steps[0].overview.to = m.chain.steps[0].detail.to + 1),
      /inside the detail range/,
    ],
    [
      "overview label with seven words",
      (m) =>
        (m.chain.steps[0].overview.label =
          "Um dois três quatro cinco seis sete"),
      /more than 6 words/,
    ],
    [
      "overview label with a banned word (cliente)",
      (m) => (m.chain.steps[0].overview.label = "Cliente avisada"),
      /forbidden word/,
    ],
    [
      "overview label with a slogan verb (entrega)",
      (m) => (m.chain.steps[0].overview.label = "Domus entrega o pedido"),
      /forbidden word/,
    ],
    [
      "overview label with a mechanism name",
      (m) => (m.chain.steps[0].overview.label = "Recibo do pedido"),
      /forbidden word/,
    ],
    [
      "detail that differs from the flat fields",
      (m) => (m.chain.steps[2].detail.rate = 2),
      /must equal the flat fields/,
    ],
    [
      "detail hold that differs from holdAfter",
      (m) => (m.chain.steps[2].detail.hold = 3),
      /hold must equal holdAfter/,
    ],
    [
      "step without overview",
      (m) => delete m.chain.steps[3].overview,
      /overview is missing/,
    ],
    [
      "brand version outside 1.x",
      (m) => (m.brandVersion = "2.0.0"),
      /not 1\.x/,
    ],
  ];
  it.each(broken)("rejects: %s", (_name, mutate, message) => {
    const m = clone();
    mutate(m);
    expect(() => parseManifest(m)).toThrow(ManifestError);
    expect(() => parseManifest(m)).toThrow(message);
  });
});

describe("select", () => {
  it("keeps the order of the chain and narrows it to a product", () => {
    const all = chainSteps(MANIFEST);
    expect(all.map((s) => s.step)).toEqual(
      [...all.map((s) => s.step)].sort((a, b) => a - b),
    );
    for (const slug of PRODUCT_SLUGS)
      for (const step of chainSteps(MANIFEST, slug))
        expect(step.products).toContain(slug);
  });
  it("orders the overview line by the plot, with the outcome last", () => {
    expect(overviewOrder(MANIFEST)).toEqual([
      "domus",
      "relloo",
      "tuner",
      "knowly",
      "magneto",
      "outcome",
    ]);
  });
  it("the overview of every step stays inside its detail and touches an active node", () => {
    for (const { overview: o, detail: d } of MANIFEST.chain.steps) {
      expect(o.from).toBeGreaterThanOrEqual(d.from);
      expect(o.to).toBeLessThanOrEqual(d.to);
      expect(
        [o.token.from, o.token.to].some(
          (e) => e !== "outcome" && o.nodes.includes(e),
        ),
        o.label,
      ).toBe(true);
      expect(o.label.split(" ").length).toBeLessThanOrEqual(6);
    }
  });
  it("gives exactly the seam and the three rails, and the same pair never changes its label", () => {
    const list = ties(MANIFEST);
    expect(list.map((t) => `${t.place}:${t.a}-${t.b}`).sort()).toEqual([
      "rail:knowly-relloo",
      "rail:magneto-domus",
      "rail:tuner-relloo",
      "seam:domus-relloo",
    ]);
    for (const tie of list) {
      const steps = MANIFEST.chain.steps.filter(
        (s) =>
          [s.connection.from, s.connection.to].sort().join() ===
          [tie.a, tie.b].sort().join(),
      );
      expect(new Set(steps.map((s) => s.connection.label)).size).toBe(1);
    }
  });
});

describe("what the site shows of the manifest", () => {
  it("every label has at most 3 words and 24 characters, in sentence case, and names no mechanism", () => {
    for (const step of MANIFEST.chain.steps) {
      const { label } = step.connection;
      expect(label.split(" ").length).toBeLessThanOrEqual(3);
      expect(label.length).toBeLessThanOrEqual(24);
      expect(label).toMatch(/^\p{Lu}[^\p{Lu}]*$/u);
      expect(label).not.toMatch(
        /recibo|protocolo|tenant|fila|erp|crm|cliente/i,
      );
    }
  });
  it("the banned words and slogan verbs of the site apply to every caption the manifest gives the chain, no exception", () => {
    const bad: string[] = [];
    MANIFEST.chain.steps.forEach((s, i) => {
      for (const [where, text] of Object.entries({
        overview: s.overview.label,
        connection: s.connection.label,
        detailSrLabel: s.detail.srLabel,
      }))
        if (COPY_RULES.test(text)) bad.push(`step ${i} ${where}: ${text}`);
    });
    for (const [slug, p] of Object.entries(MANIFEST.products))
      p.films.forEach((film, i) => {
        if (COPY_RULES.test(film.title))
          bad.push(`${slug} film ${i} title: ${film.title}`);
      });
    expect(bad).toEqual([]);
  });
  it("the slug list of the reader is the list of products of the site, in weight order", () => {
    expect([...PRODUCT_SLUGS]).toEqual(PRODUCTS.map((p) => p.slug));
    expect(Object.keys(MANIFEST.products)).toEqual(PRODUCTS.map((p) => p.slug));
  });
  it("every cover and piece the manifest names exists in the site, and every piece hashes as declared", async () => {
    const { existsSync, readFileSync } = await import("node:fs");
    const { createHash } = await import("node:crypto");
    const { join } = await import("node:path");
    const root = join(__dirname, "../../public");
    for (const [id, piece] of Object.entries(MANIFEST.pieces)) {
      const file = join(root, piece.src);
      expect(existsSync(file), id).toBe(true);
      expect(
        createHash("sha256").update(readFileSync(file)).digest("hex"),
        id,
      ).toBe(piece.sha256);
      for (const poster of piece.posters)
        expect(existsSync(join(root, poster)), poster).toBe(true);
    }
    expect(existsSync(join(root, MANIFEST.player.src))).toBe(true);
  });
  it("the chain runs on the declared status and no segment is shorter on screen than the floor of the manifest", () => {
    expect(["final", "fallback"]).toContain(MANIFEST.chain.status);
    for (const step of MANIFEST.chain.steps)
      expect((step.to - step.from) / step.rate).toBeGreaterThanOrEqual(
        MANIFEST.defaults.minScreenSeconds,
      );
  });
});
