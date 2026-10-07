// SINCRONIZAÇÃO DOS FILMES HYPERFRAMES PARA O SITE
// Copies only the runtime files of each accepted composition into public/motion/<id>/,
// copies the pinned HyperFrames Player and writes lib/motion-catalog.json.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const campaign = resolve(
  homedir(),
  "code/control/portfolio/motion/portfolio-20261001",
);
const productsRoot = join(campaign, "products");
const publicRoot = join(siteRoot, "public/motion");
const PLAYER_VERSION = "0.8.104";

// Runtime entries only; briefs, evidence, QA and snapshots stay private.
const RUNTIME_ENTRIES = [
  "index.html",
  "build.js",
  "story-data.js",
  "styles.css",
  "assets",
  "data",
  "shared",
  "compositions",
  "components",
  "styles",
];
// Product-specific stylesheet at the root (e.g. flow-graph.css); tooling scripts stay out.
const isRootStyle = (name) => name.endsWith(".css");

// Operator cut of 2026-10-02: internal tooling and unconfirmed cases stay out of the site.
const EXCLUDED = new Set([
  "artifact-server",
  "database-access-hub",
  "welabs-sso",
  "worktree-runtime",
  "youtrack-integration",
  "flow-graph",
  "wekb-core-independent-line",
  "imagine-marketplace",
  "project-manager",
  "imagine-observability-user-journey",
  "opentag",
  "relay-project",
  "internal-rh",
  "shopcontrol",
  "mandato-participativo",
  "tetrapak-prospecting-app",
  "helper-project-management",
  // Operator cut of 2026-10-05: both left the portfolio.
  "netsafety",
  "report-crm",
  "sgici",
]);

// Client programmes shown as clients only: their journey films stay off the product pages.
// infraction-management names the agency, and Auto Infração must not cite it.
// wemalupe shows the internal codename, which must not be cited.
const CLIENT_ONLY = new Set([
  "light-recicla",
  "ecoenel",
  "avsi-program-case",
  "infraction-management",
  "wemalupe",
]);

// Journeys of round 20261001 replaced by the per-product reels below (or retired with their product).
const SUPERSEDED = new Set([
  "tabela",
  "stant",
  "wego",
  "sgors",
  "ius",
  "kiosk-brands",
  "erp",
  "flow",
  "wekb",
  "wecrm",
]);

// Round 20261002 pieces, bound to the coordinator's accepted hash.
const round2 = resolve(
  homedir(),
  "code/control/portfolio/motion/portfolio-20261002",
);
// Reel pieces follow the operator-approved selection and order per product (publish/index.html, PRODUCTS
// of 2026-10-04); `reel` marks them for the product page gallery and `also` lists other pages that show them.
const reel = (product, title, kind = "business", extra = {}) => ({
  kind,
  product,
  title,
  reel: true,
  ...extra,
});
const RESIDUOS = "Sistema de Gerenciamento de Resíduos";
// Films that also appear in the know-how section (page "servicos").
const KNOWHOW = { also: ["servicos"] };
// Insertion order is the gallery order; the collection order lives in lib/emphasis.json.
const ROUND2 = {
  // Know-how ("servicos") is shown through the Welabs chain and the Magneto, Domus, Knowly and Tuner films.
  // Welabs product names since 2026-10-06: Magneto (flow), Domus (erp), Knowly (wekb), Relloo (welabs-crm, Rello
  // until 2026-10-07), Tuner (channels).
  // The svc-* pieces left on 2026-10-04: they cite "ERP" as a node or the word "cliente".
  // Operator decision of 2026-10-07: the site publishes only the playful cuts, each with its brand intro (the
  // selection of the Projection Room, publish/index.html); feature cuts stay off the site. Welabs films open
  // with welabs-intro-v4, the final brand (only Domus keeps a symbol beside its name).
  "welabs-chain-overview-intro-v4": {
    kind: "topology",
    page: "welabs",
    // Retitled on 2026-10-05: the playful cut shows the products fitting together, not an integration map
    title: "Plataforma Welabs · Os produtos se encaixam",
    ...KNOWHOW,
  },
  "welabs-chain-journey-intro-v4": {
    kind: "topology",
    page: "welabs",
    title: "Plataforma Welabs · Jornada",
    ...KNOWHOW,
  },
  "welabs-chain-plug-intro-v4": {
    kind: "topology",
    page: "welabs",
    title: "Plataforma Welabs · Encaixe",
    ...KNOWHOW,
  },
  "welabs-chain-horizon-intro-v4": {
    kind: "topology",
    page: "welabs",
    // Retitled on 2026-10-05: the film now tours existing connections, not the roadmap;
    // the playful cut of the same day shows them as bridges between islands
    title: "Plataforma Welabs · Pontes",
    ...KNOWHOW,
  },
  "tabela-intro": reel("tabela", "Tabe.la · Introdução de marca", "intro"),
  "biz-tabela-comercializacao-ludic-intro": reel(
    "tabela",
    "Tabe.la · Todos no mesmo estoque",
  ),
  "biz-tabela-operacao-ludic-intro": reel(
    "tabela",
    "Tabe.la · O depois da venda anda sozinho",
  ),
  "tabela-journey-ludic-intro": reel(
    "tabela",
    "Tabe.la · Do incorporador ao comprador",
    "journey",
  ),
  "stant-intro": reel("stant", "Stant · Introdução de marca", "intro"),
  "biz-stant-campo-ludic-intro": reel(
    "stant",
    "Stant · Some o problema esquecido",
  ),
  "biz-stant-gestao-ludic-intro": reel("stant", "Stant · Some a obra às cegas"),
  "biz-stant-plataforma-ludic-intro": reel(
    "stant",
    "Stant · Some o retrabalho",
  ),
  "stant-journey-ludic-intro": reel(
    "stant",
    "Stant · Da fundação à entrega",
    "journey",
  ),
  // Since 2026-10-06 every brand opens its films with its own intro, as Tabe.la and Stant did.
  "wego-intro": reel("wego", "Família WeGO · Introdução de marca", "intro"),
  "wego-topology-v2-ludic-intro": reel(
    "wego",
    "Família WeGO · Um número só",
    "topology",
  ),
  "biz-wego-docgo-signgo-ludic-intro": reel(
    "wego",
    "Família WeGO · Sem papel que vai e volta",
  ),
  "biz-wego-licenciamento-ludic-intro": reel(
    "wego",
    "Família WeGO · Um fio só",
  ),
  "biz-auto-infracao-campo-ludic-intro": reel(
    "wego",
    "Auto Infração · O auto lacrado",
    "business",
    { also: ["autoinfracao"] },
  ),
  "auto-infracao-journey-ludic-intro": reel(
    "wego",
    "Auto Infração · Do flagrante ao processo",
    "journey",
    { also: ["autoinfracao"] },
  ),
  "wego-journey-ludic-intro": reel(
    "wego",
    "Família WeGO · Uma história só",
    "journey",
  ),
  // Resíduos and IUS: their films with intro are already the playful cuts (same ids as before).
  "residuos-intro": reel("sgors", `${RESIDUOS} · Introdução de marca`, "intro"),
  "residuos-journey-v2-intro": reel(
    "sgors",
    `${RESIDUOS} · Um ciclo`,
    "journey",
  ),
  "biz-residuos-reciclagem-intro": reel("sgors", `${RESIDUOS} · Reciclagem`),
  "biz-residuos-transito-intro": reel("sgors", `${RESIDUOS} · Trânsito`),
  "ius-intro": reel("ius", "IUS · Introdução de marca", "intro"),
  "ius-do-laudo-ao-dado-intro": reel("ius", "IUS · Do laudo ao dado"),
  "ius-aceite-e-leitura-intro": reel("ius", "IUS · Aceite e leitura"),
  "ius-jornada-medico-paciente-intro": reel("ius", "IUS · Jornada", "journey"),
  "flow-canvas-build-intro-v4": reel(
    "flow",
    "Magneto · Montar o fluxo",
    "business",
    KNOWHOW,
  ),
  "flow-durable-run-intro-v4": reel(
    "flow",
    "Magneto · Execução durável",
    "business",
    KNOWHOW,
  ),
  "flow-lifecycle-intro-v4": reel(
    "flow",
    "Magneto · Ciclo de vida",
    "business",
    KNOWHOW,
  ),
  "flow-copilot-intro-v4": reel(
    "flow",
    "Magneto · Copiloto",
    "business",
    KNOWHOW,
  ),
  "crm-omnichannel-inbox-ludic2-intro-v4": reel(
    "welabs-crm",
    "Relloo · Atendimento",
  ),
  "crm-agent-studio-ludic2-intro-v4": reel("welabs-crm", "Relloo · Agentes"),
  "crm-flow-builder-ludic2-intro-v4": reel("welabs-crm", "Relloo · Automações"),
  "crm-campaigns-journey-ludic2-intro-v4": reel(
    "welabs-crm",
    "Relloo · Campanhas e fidelização",
    "journey",
  ),
  "hub-dominio-spa-ludic-intro-v4": reel(
    "erp",
    "Domus · Tudo numa casa só",
    "business",
    KNOWHOW,
  ),
  "hub-fiscal-br-ludic-intro-v4": reel(
    "erp",
    "Domus · Fiscal sem retrabalho",
    "business",
    KNOWHOW,
  ),
  "hub-concessoes-ludic-intro-v4": reel(
    "erp",
    "Domus · Só o que foi liberado",
    "business",
    KNOWHOW,
  ),
  "kb-ask-with-proof-ludic-intro-v4": reel(
    "wekb",
    "Knowly · Some a resposta sem prova",
    "business",
    KNOWHOW,
  ),
  "kb-sources-to-knowledge-ludic-intro-v4": reel(
    "wekb",
    "Knowly · Some o conhecimento espalhado",
    "business",
    KNOWHOW,
  ),
  "kb-who-reads-what-ludic-intro-v4": reel(
    "wekb",
    "Knowly · Some o medo de mostrar demais",
    "business",
    KNOWHOW,
  ),
  "channels-one-contract-ludic-intro-v4": reel(
    "channels",
    "Tuner · Some o canal espalhado",
    "business",
    KNOWHOW,
  ),
  "channels-call-center-ludic-intro-v4": reel(
    "channels",
    "Tuner · Some o “pode repetir?”",
    "business",
    KNOWHOW,
  ),
  "channels-whatsapp-official-ludic-intro-v4": reel(
    "channels",
    "Tuner · Some a conversa perdida",
    "business",
    KNOWHOW,
  ),
  "mon-occurrence-desk-intro-v4": reel(
    "malupe",
    "Ecossistema Monitoramento · Mesa de ocorrências",
  ),
  "mon-edge-survives-intro-v4": reel(
    "malupe",
    "Ecossistema Monitoramento · O site não para",
  ),
  "mon-camera-to-case-intro-v4": reel(
    "malupe",
    "Ecossistema Monitoramento · Da câmera ao caso",
  ),
  // Central ESG: brand intro and the playful cycle film with intro (biz-central-esg left on 2026-10-07).
  // Maceió Digital stays off: the site has no page or card for it yet (noted for the operator).
  "central-esg-intro": {
    kind: "intro",
    product: "central-esg",
    title: "Central ESG · Introdução de marca",
  },
  "central-esg-ciclo-intro": {
    kind: "business",
    product: "central-esg",
    title: "Central ESG · Some o dado ESG espalhado",
  },
  // Report CRM, Netsafety and SGICI left the portfolio on 2026-10-05.
};

// Every brand intro of lib/brand-intros.json is synced once accepted: its closing frame is the card
// cover of the brand's products. Intros outside a product reel carry no product, so they never
// show up in a gallery; the cover lookup goes by id through the same map.
const brandIntros = JSON.parse(
  readFileSync(join(siteRoot, "lib/brand-intros.json"), "utf8"),
);
for (const [brand, id] of Object.entries(brandIntros.brands)) {
  ROUND2[id] ??= {
    kind: "intro",
    title: `${brandIntros.names[brand] ?? brand} · Introdução de marca`,
  };
}

// Existing presentation slug for compositions that overlap the 22 framepacks.
const PRESENTATION_SLUG = {
  "avsi-program-case": "neoenergia",
  "infraction-management": "autoinfracao",
  "environmental-licensing": "licenciamento",
  "ima-system": "sistema-ima",
  wecrm: "welabs-crm",
  wemalupe: "malupe",
};

function findPlayer() {
  const cacheRoot = join(homedir(), ".npm/_npx");
  for (const entry of readdirSync(cacheRoot)) {
    const pkg = join(cacheRoot, entry, "node_modules/hyperframes");
    try {
      if (
        JSON.parse(readFileSync(join(pkg, "package.json"), "utf8")).version ===
        PLAYER_VERSION
      )
        return join(pkg, "dist/hyperframes-player.global.js");
    } catch {
      /* not this cache entry */
    }
  }
  throw new Error(`HyperFrames ${PLAYER_VERSION} not found in the npm cache`);
}

// Welabs products carry their own names since 2026-10-06 (the old We{product} titles map to them).
const RENAMED = {
  WeERP: "Domus",
  WeKB: "Knowly",
  WeCRM: "Relloo",
  "Channels hosted product": "Tuner · Produto hospedado",
  "Channels SDK": "Tuner · SDK",
  WeMalupe: "Ecossistema Monitoramento",
  "Get-Go": "Gerador de formulários",
  "IMA Auto de Infração": "Auto Infração",
  "Ecossistema WeGO": "Família WeGO",
};

function readTitles() {
  // Titles and accepted state come from the coordinator's delivery index.
  const titles = new Map();
  const index = readFileSync(join(campaign, "delivery-index.md"), "utf8");
  for (const line of index.split("\n")) {
    const match = line.match(
      /^\| (.+?) \| Aceito \| \[HTML editável\]\(.*?\/products\/([^/]+)\/index\.html\)/,
    );
    if (match) titles.set(match[2], RENAMED[match[1]] ?? match[1]);
  }
  return titles;
}

// Player picks its GSAP adapter once; a zero-length timeline at that moment freezes playback.
// Seed the registered timeline with the declared duration so the player drives GSAP directly.
// The module seed runs after build.js (modules execute in order) and re-applies while the
// composition registers its timeline asynchronously, so the film keeps its accepted length.
function seedTimeline(html, compositionId, duration) {
  const seed =
    `<script type="module">const id=${JSON.stringify(compositionId)},d=${duration};` +
    `const pad=()=>{const t=window.__timelines||{};for(const tl of [t[id],...Object.values(t)]){if(tl&&tl.duration&&tl.duration()<d){tl.to({},{duration:d-tl.duration()},tl.duration());}}};` +
    `pad();let n=0;const tick=()=>{pad();if(++n<40)setTimeout(tick,50);};tick();</script>`;
  return html.replace(/(<\/body>)/i, `${seed}\n$1`);
}

// Studio serves each project at the origin root, so some stylesheets use "/assets/...".
// Under the site every film lives in /motion/<id>/, so those URLs are rebased in the copy.
function rebaseAbsoluteAssets(dir, id) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) rebaseAbsoluteAssets(path, id);
    else if (entry.name.endsWith(".css")) {
      const css = readFileSync(path, "utf8");
      const rebased = css.replace(
        /(["'(])\/assets\//g,
        `$1/motion/${id}/assets/`,
      );
      if (rebased !== css) writeFileSync(path, rebased);
    }
  }
}

const titles = readTitles();
rmSync(publicRoot, { recursive: true, force: true });
mkdirSync(publicRoot, { recursive: true });
cpSync(findPlayer(), join(publicRoot, "player.js"));

const catalog = [];
for (const id of readdirSync(productsRoot).sort()) {
  const source = join(productsRoot, id);
  if (
    EXCLUDED.has(id) ||
    CLIENT_ONLY.has(id) ||
    SUPERSEDED.has(id) ||
    !titles.has(id) ||
    !existsSync(join(source, "index.html"))
  )
    continue;
  const target = join(publicRoot, id);
  for (const entry of [
    ...RUNTIME_ENTRIES,
    ...readdirSync(source).filter(isRootStyle),
  ]) {
    if (existsSync(join(source, entry)))
      cpSync(join(source, entry), join(target, entry), {
        recursive: true,
        dereference: true,
      });
  }
  rebaseAbsoluteAssets(target, id);
  const html = readFileSync(join(target, "index.html"), "utf8");
  const compositionId = html.match(/data-composition-id="([^"]+)"/)?.[1];
  const duration = Number(html.match(/data-duration="([0-9.]+)"/)?.[1]);
  if (!compositionId || !duration)
    throw new Error(`${id}: missing data-composition-id or data-duration`);
  writeFileSync(
    join(target, "index.html"),
    seedTimeline(html, compositionId, duration),
  );
  catalog.push({
    id,
    title: titles.get(id),
    duration,
    compositionId,
    src: `/motion/${id}/index.html`,
    kind: "journey",
    page: null,
    product: PRESENTATION_SLUG[id] ?? id,
    reel: false,
    also: [],
  });
}

// Round 2: only pieces whose index.html still matches the accepted sha256 reach the site.
const accepted = JSON.parse(
  readFileSync(join(round2, "accepted.json"), "utf8"),
);
const pending = [];
for (const [id, meta] of Object.entries(ROUND2)) {
  const source = join(round2, "pieces", id);
  const htmlPath = join(source, "index.html");
  const hash = existsSync(htmlPath)
    ? createHash("sha256").update(readFileSync(htmlPath)).digest("hex")
    : null;
  if (!accepted[id] || accepted[id].sha256 !== hash) {
    pending.push(id);
    continue;
  }
  const target = join(publicRoot, id);
  cpSync(htmlPath, join(target, "index.html"));
  if (existsSync(join(source, "assets")))
    cpSync(join(source, "assets"), join(target, "assets"), {
      recursive: true,
      dereference: true,
    });
  // Card posters are rendered from the closing brand frame by generate-motion-posters.mjs (run below).
  const html = readFileSync(htmlPath, "utf8");
  catalog.push({
    id,
    title: meta.title,
    duration: Number(html.match(/data-duration="([0-9.]+)"/)?.[1]),
    compositionId: html.match(/data-composition-id="([^"]+)"/)?.[1],
    src: `/motion/${id}/index.html`,
    kind: meta.kind,
    page: meta.page ?? null,
    product: meta.product ?? null,
    reel: meta.reel ?? false,
    also: meta.also ?? [],
  });
}

// presentationSlug links a film to an existing framepack page, when there is one.
const framepacks = new Set(readdirSync(join(siteRoot, "public/presentations")));
for (const item of catalog)
  item.presentationSlug =
    item.product && framepacks.has(item.product) ? item.product : null;
writeFileSync(
  join(siteRoot, "lib/motion-catalog.json"),
  `${JSON.stringify(catalog, null, 2)}\n`,
);
process.stdout.write(
  `motion: ${catalog.length} films synced (${titles.size} accepted journeys, ${EXCLUDED.size} excluded; round 2 pending: ${pending.join(", ") || "none"})\n`,
);

// Posters come from the synced pieces, so they are regenerated on every sync.
const posters = spawnSync(
  process.execPath,
  [join(siteRoot, "scripts/generate-motion-posters.mjs")],
  { stdio: "inherit" },
);
if (posters.status !== 0) process.exit(posters.status ?? 1);
