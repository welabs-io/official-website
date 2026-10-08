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

// JORNADAS DA PRIMEIRA RODADA
// Round 20261001 journeys this site publishes: none since 2026-10-07. The Welabs journeys were superseded
// by the per-product reels below (wemalupe also shows an internal codename), and the Imagine journeys
// belong to the Imagine site since the split of 2026-10-07. channels-product and channels-sdk left on
// 2026-10-07: both still carry the retired "Channels" name, and Tuner has its own reel films.
const SITE_JOURNEYS = new Set([]);

// Round 20261002 pieces, bound to the coordinator's accepted hash.
const round2 = resolve(
  homedir(),
  "code/control/portfolio/motion/portfolio-20261002",
);
// Reel pieces follow the operator-approved selection and order per product (publish/index.html, PRODUCTS
// of 2026-10-04); `reel` marks them for the product page gallery and `also` lists other pages that show them.
// Since 2026-10-07 every piece also carries `description`: one commercial line shown under the film.
const reel = (product, title, description, kind = "business", extra = {}) => ({
  kind,
  product,
  title,
  description,
  reel: true,
  ...extra,
});
// Films that also appeared in the Imagine know-how section (page "servicos") of the shared site; kept so
// the catalog stays comparable with the Imagine site.
const KNOWHOW = { also: ["servicos"] };
// Insertion order is the gallery order; the collection order lives in lib/emphasis.json.
const ROUND2 = {
  // Know-how ("servicos") is shown through the Welabs chain and the Magneto, Domus, Knowly and Tuner films.
  // Welabs product names since 2026-10-06: Magneto (flow), Domus (erp), Knowly (wekb), Relloo (welabs-crm, Rello
  // until 2026-10-07), Tuner (channels).
  // The svc-* pieces left on 2026-10-04: they cite "ERP" as a node or the word "cliente".
  // Operator decision of 2026-10-07: the site publishes only the playful cuts, each with its brand intro (the
  // selection of the Projection Room, publish/index.html); feature cuts stay off the site. Welabs films open
  // with welabs-intro-v6, the Room's current intro (it replaced welabs-intro-v5 on 2026-10-07).
  // Since 2026-10-07 (evening) the Welabs films cite every product by its logo: the "-logos" cuts replace the
  // earlier ones, whose product names were text; same films, durations and titles.
  // Ecossistema Monitoramento is hidden for now (operator, 2026-10-07): its mon-*-ludic cuts stay accepted in the
  // round but leave this catalog, together with the product card and page (lib/catalog.ts).
  // Titles and descriptions rewritten on 2026-10-07 (commercial tone, partner products by name, only what
  // the film shows, no "cliente" nor "ERP"); the before/after table is in
  // control/portfolio/site-redesign/titulos-v2.md.
  // Since 2026-10-08 the order follows the operator's product weight (lib/emphasis.json): chain first,
  // then Domus, Relloo, Magneto, Tuner and Knowly. The chain and Domus films are the "define" cuts of
  // 2026-10-08 (Domus defines, Relloo serves next to it, Magneto is the workflow, Tuner delivers, Knowly
  // explains); titles and descriptions come from the chain and hub groups of publish/index.html. The
  // earlier welabs-chain-*-logos-intro-v6 and hub-{dominio-spa,fiscal-br,concessoes} cuts left the site
  // and stay in the round.
  "welabs-chain-overview-define-logos-intro-v6": {
    kind: "topology",
    page: "welabs",
    title: "Plataforma Welabs · O Domus define, os outros dão vida",
    description:
      "O Domus define a empresa inteira e o Relloo atende colado a ele; o workflow do Magneto, os canais do Tuner e as respostas do Knowly passam por tudo, sem ninguém copiando dado de um sistema para o outro.",
    ...KNOWHOW,
  },
  "welabs-chain-journey-define-logos-intro-v6": {
    kind: "topology",
    page: "welabs",
    title: "Plataforma Welabs · Do WhatsApp à aprovação, sem repetir nada",
    description:
      "A mensagem chega pelo Tuner, o Relloo reconhece a pessoa com o que já está no Domus, o Knowly responde com a fonte e a regra do Domus vira workflow no Magneto, que leva até quem decide e devolve o recibo.",
    ...KNOWHOW,
  },
  "welabs-chain-plug-define-logos-intro-v6": {
    kind: "topology",
    page: "welabs",
    title: "Plataforma Welabs · O app novo já nasce com o negócio definido",
    description:
      "Encaixado no núcleo de Domus e Relloo, ele já nasce com telas, regras, contatos e pedidos, e ganha o workflow do Magneto, os canais do Tuner e as respostas do Knowly.",
    ...KNOWHOW,
  },
  "welabs-chain-horizon-define-logos-intro-v6": {
    kind: "topology",
    page: "welabs",
    title:
      "Plataforma Welabs · Um centro que define e três pontes que dão vida",
    description:
      "No centro, o Domus define e o Relloo atende; o workflow do Magneto, os avisos do Tuner e as respostas do Knowly atravessam do seu app até a sua equipe.",
    ...KNOWHOW,
  },
  "hub-whole-house-ludic-logos-intro-v6": reel(
    "erp",
    "Domus · A empresa inteira numa casa só",
    "Financeiro, fiscal, contratos, pessoas, compras, estoque, vendas, produção, projetos, ativos e qualidade ganham cada um o seu cômodo, e uma frente passa a vez à outra sob o mesmo teto.",
    "business",
    KNOWHOW,
  ),
  "hub-defines-runs-ludic-v3-logos-intro-v6": reel(
    "erp",
    "Domus · O Domus define, o workflow do Magneto anda e o recibo volta",
    "A regra nasce no Domus e vira workflow no Magneto: cobrança, nota de serviço e aviso por e-mail passo a passo, com o recibo de volta para casa.",
    "business",
    KNOWHOW,
  ),
  "hub-draw-born-ludic-v2-logos-intro-v6": reel(
    "erp",
    "Domus · Desenhou, nasceu: tela e fluxo sem programar",
    "Desenhe um cadastro novo e a tela aparece pronta; desenhe o caminho e ele vira workflow no Magneto. O próprio Domus funciona assim, com a cobrança e a nota rodando no Magneto.",
    "business",
    KNOWHOW,
  ),
  "crm-omnichannel-inbox-ludic2-logos-intro-v6": reel(
    "welabs-crm",
    "Relloo · Cada pessoa com a história inteira, em qualquer canal",
    "Os canais chegam pelo Tuner, e o Relloo reconhece a pessoa, guarda a história, leva a conversa a quem atende e junta a ligação na mesma ficha.",
  ),
  "crm-agent-studio-ludic2-logos-intro-v6": reel(
    "welabs-crm",
    "Relloo · Agentes de IA que respondem com o Knowly",
    "O agente nasce de peças prontas, responde com as fontes da empresa pelo Knowly, usa só o que foi liberado e é testado antes de entrar no ar.",
  ),
  "crm-flow-builder-ludic2-logos-intro-v6": reel(
    "welabs-crm",
    "Relloo · Automações que conversam e decidem",
    "Você desenha o atendimento em blocos: o menu espera a resposta, a condição escolhe o caminho e cada execução deixa o rastro.",
  ),
  "crm-campaigns-journey-ludic2-logos-intro-v6": reel(
    "welabs-crm",
    "Relloo · Campanhas que viram venda e voltam como cashback",
    "Formulário que recomenda, roleta, cupom no WhatsApp, venda no caixa e cashback, numa jornada só de fidelização.",
    "journey",
  ),
  "flow-canvas-build-logos-intro-v6": reel(
    "flow",
    "Magneto · Quem conhece o processo monta o fluxo",
    "Planilha, e-mail e lembrete viram um caminho em blocos, sem programar, e o desenho já é o processo andando.",
    "business",
    KNOWHOW,
  ),
  "flow-durable-run-logos-intro-v6": reel(
    "flow",
    "Magneto · Nenhum processo fica pela metade",
    "O fluxo espera a pessoa o tempo que for, sobrevive à queda do sistema e segue do mesmo ponto, sem repetir nenhum passo.",
    "business",
    KNOWHOW,
  ),
  "flow-lifecycle-logos-intro-v6": reel(
    "flow",
    "Magneto · Mude a regra sem medo",
    "A versão nova nasce ao lado, é testada com um pedido de teste, entra no ar quando estiver pronta e volta num toque, com o registro de quem mudou.",
    "business",
    KNOWHOW,
  ),
  "flow-copilot-logos-intro-v6": reel(
    "flow",
    "Magneto · Do texto ao processo rodando",
    "Você descreve o processo numa frase, o Magneto monta os blocos, você revisa e ativa.",
    "business",
    KNOWHOW,
  ),
  "channels-one-contract-ludic-logos-intro-v6": reel(
    "channels",
    "Tuner · Todo canal num lugar só, pronto para o Relloo",
    "WhatsApp, voz, chat do site e Discord chegam do mesmo jeito, o Relloo atende e vende, e um produto novo só conecta.",
    "business",
    KNOWHOW,
  ),
  "channels-call-center-ludic-logos-intro-v6": reel(
    "channels",
    "Tuner · Ninguém repete a história ao telefone",
    "A ligação é bem recebida, cai na fila certa e passa adiante com a história junto.",
    "business",
    KNOWHOW,
  ),
  "channels-whatsapp-official-ludic-logos-intro-v6": reel(
    "channels",
    "Tuner · Seu número no WhatsApp oficial, nenhuma conversa perdida",
    "Foto e localização chegam inteiras e, um dia depois, a mensagem aprovada retoma a conversa no mesmo lugar.",
    "business",
    KNOWHOW,
  ),
  "kb-ask-with-proof-ludic-logos-intro-v6": reel(
    "wekb",
    "Knowly · Respostas com prova, frase por frase",
    "A dúvida chega em palavras, o Knowly acha onde aquilo já foi dito e mostra a fonte de cada frase; o que não sabe, ele diz.",
    "business",
    KNOWHOW,
  ),
  "kb-sources-to-knowledge-ludic-logos-intro-v6": reel(
    "wekb",
    "Knowly · Tudo o que a equipe sabe, num lugar só",
    "Documentos, reuniões, tickets e código se juntam num lugar só, sempre atualizados e sem dado pessoal.",
    "business",
    KNOWHOW,
  ),
  "kb-who-reads-what-ludic-logos-intro-v6": reel(
    "wekb",
    "Knowly · Cada pessoa vê só o que pode ver",
    "Cada área guarda o que é seu, a porta errada não abre e, quem muda de time, muda de chave junto.",
    "business",
    KNOWHOW,
  ),
  // The Imagine reels (Tabe.la, Stant, WeGO, Resíduos, IUS, Central ESG) moved to the Imagine site on 2026-10-07.
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

// Existing catalog slug for round 1 compositions that overlap a catalog product (none of the Tuner pieces).
const PRESENTATION_SLUG = {};

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

// Welabs products carry their own names since 2026-10-06 (the old titles of the delivery index map to them).
const RENAMED = {
  "Channels hosted product": "Tuner · Produto hospedado",
  "Channels SDK": "Tuner · SDK",
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
  // Allowlist: only this site's round 1 journeys are copied.
  if (
    !SITE_JOURNEYS.has(id) ||
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
    // Round 1 journeys carry no commercial line
    description: null,
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
    description: meta.description ?? null,
    kind: meta.kind,
    page: meta.page ?? null,
    product: meta.product ?? null,
    reel: meta.reel ?? false,
    also: meta.also ?? [],
  });
}

// presentationSlug links a film to an existing framepack page, when there is one; this site has no
// framepacks since the legacy packs left with the split of 2026-10-07, so every slug is null.
const packsRoot = join(siteRoot, "public/presentations");
const framepacks = new Set(existsSync(packsRoot) ? readdirSync(packsRoot) : []);
for (const item of catalog)
  item.presentationSlug =
    item.product && framepacks.has(item.product) ? item.product : null;
writeFileSync(
  join(siteRoot, "lib/motion-catalog.json"),
  `${JSON.stringify(catalog, null, 2)}\n`,
);
process.stdout.write(
  `motion: ${catalog.length} films synced (${titles.size} accepted journeys, ${SITE_JOURNEYS.size} published here; round 2 pending: ${pending.join(", ") || "none"})\n`,
);

// Posters come from the synced pieces, so they are regenerated on every sync.
const posters = spawnSync(
  process.execPath,
  [join(siteRoot, "scripts/generate-motion-posters.mjs")],
  { stdio: "inherit" },
);
if (posters.status !== 0) process.exit(posters.status ?? 1);
