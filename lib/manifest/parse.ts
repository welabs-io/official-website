// LEITURA E VALIDAÇÃO DO MANIFESTO
// The structural check the site does at build time, without a schema library: the full JSON Schema is checked by
// scripts/sync-motion.mjs when the manifest is copied in; this one guards what the site depends on (timing, slugs, the
// connection labels, one main film per product) and fails with the path of the offending field.
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
      // Both ends of a connection are products of the step
      for (const end of [c.from, c.to])
        if (!step.products.includes(end))
          throw new ManifestError(
            where,
            `connection ${end} is not in products`,
          );
    }
    checkLabel(c.label, `${where}/connection/label`);
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
