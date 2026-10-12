// LEITURA E VALIDAÇÃO DO MANIFESTO
// The structural check the site does at build time, without a schema library: the full JSON Schema is checked by
// scripts/sync-motion.mjs when the manifest is copied in; this one guards what the site depends on (timing, slugs, the
// connection labels, one main film per product) and fails with the path of the offending field.
import { COPY_RULES } from "../content/rules";
import { PRODUCT_SLUGS } from "../product-slugs";
import type { ChainStep, Manifest, SegmentCore } from "./types";

export class ManifestError extends Error {
  constructor(where: string, message: string) {
    super(`manifest ${where}: ${message}`);
  }
}

const SLUGS: readonly string[] = PRODUCT_SLUGS;

// Words that name a mechanism: never shown to the visitor (operator rule of the site)
const FORBIDDEN =
  /\b(recibo|protocolo|tenant|fila|erp|crm|cliente|clientes|webhook|payload)\b/i;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function checkSegment(s: unknown, where: string): asserts s is SegmentCore {
  if (!isObject(s)) throw new ManifestError(where, "is not an object");
  const num = (key: string) => {
    if (typeof s[key] !== "number" || Number.isNaN(s[key]))
      throw new ManifestError(where, `${key} is not a number`);
    return s[key] as number;
  };
  const from = num("from");
  const to = num("to");
  const settledAt = num("settledAt");
  if (!(to > from)) throw new ManifestError(where, "to must be after from");
  if (to > settledAt + 0.1 + 1e-6)
    throw new ManifestError(where, "to must be at most settledAt + 0.1");
  if (settledAt > to) throw new ManifestError(where, "settledAt must be ≤ to");
  if (!(num("rate") > 0)) throw new ManifestError(where, "rate must be > 0");
  if (num("holdAfter") < 1)
    throw new ManifestError(where, "holdAfter must be ≥ 1");
  if (typeof s.piece !== "string" || !s.piece)
    throw new ManifestError(where, "piece is missing");
  const t = s.transition;
  if (!isObject(t) || typeof t.duration !== "number" || !(t.duration >= 0))
    throw new ManifestError(where, "transition has no duration");
  if (!["cut", "push-left", "push-up", "blend"].includes(String(t.type)))
    throw new ManifestError(where, `unknown transition type ${t.type}`);
  const covers = s.covers;
  if (
    !isObject(covers) ||
    !isObject(covers.start) ||
    !isObject(covers.settled) ||
    typeof (covers.start as Record<string, unknown>).w1280 !== "string" ||
    typeof (covers.settled as Record<string, unknown>).w640 !== "string"
  )
    throw new ManifestError(where, "covers are incomplete");
}

function checkLabel(label: unknown, where: string) {
  if (typeof label !== "string" || !label)
    throw new ManifestError(where, "label is missing");
  const words = label.split(" ");
  if (words.length > 3)
    throw new ManifestError(where, `label has more than 3 words: ${label}`);
  if (label.length > 24)
    throw new ManifestError(
      where,
      `label has more than 24 characters: ${label}`,
    );
  // Sentence case: one capital, the first letter
  if (!/^\p{Lu}[^\p{Lu}]*$/u.test(label))
    throw new ManifestError(where, `label is not sentence case: ${label}`);
  if (FORBIDDEN.test(label))
    throw new ManifestError(where, `label has a forbidden word: ${label}`);
}

// OVERVIEW E DETAIL DE UM PASSO
// The two blocks of a step (schema 1.2). The detail is the time of the step, so it must equal the flat fields; the
// overview follows it and must stay inside its range. Invariant restored from the old check on `connection` ends: the
// token (what the overview draws) walks between products (or to the outcome) and at least one of its ends is an active
// node, the system whose detail is on screen. Why not "both ends are active nodes" (the first reading of the rule):
// the nodes are the products the detail shows, and in 4 of the 7 steps the token comes from, or goes to, a product that
// is not on screen (Relloo opens the card the Domus fills; Knowly's text lands in the Relloo card), so that stricter
// check rejects the real data. One end on screen is what ties the token to the scene.
function checkTwoBlocks(step: ChainStep, where: string) {
  const { overview: o, detail: d } = step;
  if (!isObject(o)) throw new ManifestError(where, "overview is missing");
  if (!isObject(d)) throw new ManifestError(where, "detail is missing");
  if (
    !Array.isArray(o.nodes) ||
    !o.nodes.length ||
    o.nodes.some((n) => !SLUGS.includes(n)) ||
    new Set(o.nodes).size !== o.nodes.length
  )
    throw new ManifestError(
      `${where}/overview`,
      "nodes must be distinct, known products",
    );
  const ends = [o.token?.from, o.token?.to];
  if (ends.some((e) => e !== "outcome" && !SLUGS.includes(String(e))))
    throw new ManifestError(
      `${where}/overview`,
      "token ends must be products or outcome",
    );
  if (!ends.some((e) => o.nodes.includes(e as never)))
    throw new ManifestError(
      `${where}/overview`,
      "token touches no active node",
    );
  if (
    typeof o.from !== "number" ||
    typeof o.to !== "number" ||
    !(o.to > o.from)
  )
    throw new ManifestError(`${where}/overview`, "from/to must be a range");
  if (o.from < d.from || o.to > d.to)
    throw new ManifestError(
      `${where}/overview`,
      "from/to must be inside the detail range",
    );
  if (typeof o.label !== "string" || !o.label)
    throw new ManifestError(`${where}/overview`, "label is missing");
  if (o.label.split(" ").length > 6 || o.label.length > 48)
    throw new ManifestError(
      `${where}/overview`,
      `label has more than 6 words or 48 characters: ${o.label}`,
    );
  // The same banned words and slogan verbs as every other visible text of the site, no exception for the manifest
  if (FORBIDDEN.test(o.label) || COPY_RULES.test(o.label))
    throw new ManifestError(
      `${where}/overview`,
      `label has a forbidden word: ${o.label}`,
    );
  // The detail is the step: same piece, range, rate and covers; its hold is the holdAfter of the step
  if (
    d.piece !== step.piece ||
    d.from !== step.from ||
    d.to !== step.to ||
    d.settledAt !== step.settledAt ||
    d.rate !== step.rate
  )
    throw new ManifestError(
      `${where}/detail`,
      "must equal the flat fields of the step",
    );
  if (d.hold !== step.holdAfter)
    throw new ManifestError(
      `${where}/detail`,
      "hold must equal holdAfter of the step",
    );
  if (typeof d.srLabel !== "string" || d.srLabel.length < 8)
    throw new ManifestError(`${where}/detail`, "srLabel is too short");
  if (
    o.nodes.length !== step.products.length ||
    o.nodes.some((n) => !step.products.includes(n))
  )
    throw new ManifestError(
      `${where}/overview`,
      "nodes must be the products of the step",
    );
}

export function parseManifest(raw: unknown): Manifest {
  if (!isObject(raw)) throw new ManifestError("/", "is not an object");
  const m = raw as unknown as Manifest;
  if (m.schema !== "welabs-motion-manifest/1")
    throw new ManifestError("/schema", "unknown schema");
  if (!/^1\.\d+\.\d+$/.test(m.schemaVersion))
    throw new ManifestError("/schemaVersion", "unsupported version");
  // The site only wears brand 1.x of the Welabs files
  if (!/^1\./.test(m.brandVersion))
    throw new ManifestError("/brandVersion", `${m.brandVersion} is not 1.x`);
  if (m.brand?.endorse !== "on" && m.brand?.endorse !== "off")
    throw new ManifestError("/brand/endorse", "must be on or off");
  if (!isObject(m.pieces) || !Object.keys(m.pieces).length)
    throw new ManifestError("/pieces", "is empty");
  for (const [id, piece] of Object.entries(m.pieces)) {
    if (!(piece.duration > 0))
      throw new ManifestError(`/pieces/${id}`, "has no duration");
    if (!/^[0-9a-f]{64}$/.test(piece.sha256))
      throw new ManifestError(`/pieces/${id}`, "has no sha256");
    if (!piece.src.startsWith("/motion/"))
      throw new ManifestError(`/pieces/${id}`, "src is not a site path");
  }
  const known = (id: string, where: string) => {
    if (!m.pieces[id])
      throw new ManifestError(where, `piece ${id} is not in pieces`);
  };

  // Chain
  if (!Array.isArray(m.chain?.steps) || !m.chain.steps.length)
    throw new ManifestError("/chain/steps", "is empty");
  const labelOfPair = new Map<string, string>();
  m.chain.steps.forEach((step: ChainStep, i) => {
    const where = `/chain/steps/${i}`;
    checkSegment(step, where);
    known(step.piece, where);
    if (typeof step.srLabel !== "string" || step.srLabel.length < 8)
      throw new ManifestError(where, "srLabel is too short");
    if (!step.products?.length || step.products.some((p) => !SLUGS.includes(p)))
      throw new ManifestError(where, "products has an unknown slug");
    const c = step.connection;
    if (!c || !SLUGS.includes(c.from))
      throw new ManifestError(where, "connection.from is not a product");
    if (c.to !== "outcome") {
      if (!SLUGS.includes(c.to))
        throw new ManifestError(where, "connection.to is not a product");
      // `products` is the set the row lights, independent of the ends of the connection (v5 value chain: the cut may
      // light the product acting while the connection names the pair whose value it shows)
    }
    checkLabel(c.label, `${where}/connection/label`);
    checkTwoBlocks(step, where);
    // The same unordered pair always carries the same label
    if (c.to !== "outcome") {
      const pair = [c.from, c.to].sort().join("-");
      const seen = labelOfPair.get(pair);
      if (seen !== undefined && seen !== c.label)
        throw new ManifestError(
          where,
          `pair ${pair} has two labels: ${seen} and ${c.label}`,
        );
      labelOfPair.set(pair, c.label);
    }
  });

  // Products
  for (const slug of SLUGS) {
    const product = m.products?.[slug as keyof Manifest["products"]];
    const where = `/products/${slug}`;
    if (!product) throw new ManifestError(where, "is missing");
    checkSegment(product.intro, `${where}/intro`);
    known(product.intro.piece, `${where}/intro`);
    if (!product.films?.length) throw new ManifestError(where, "has no films");
    const mains = product.films.filter((f) => f.role === "main");
    if (mains.length !== 1)
      throw new ManifestError(where, "needs exactly one main film");
    product.films.forEach((film, f) => {
      const at = `${where}/films/${f}`;
      known(film.piece, at);
      if (!film.title) throw new ManifestError(at, "has no title");
      if (!film.segments?.length)
        throw new ManifestError(at, "has no segments");
      film.segments.forEach((s, j) => {
        checkSegment(s, `${at}/segments/${j}`);
        known(s.piece, `${at}/segments/${j}`);
      });
    });
  }
  return m;
}
