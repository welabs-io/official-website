// SINCRONIZAÇÃO DOS FILMES HYPERFRAMES PARA O SITE
// Copies only the runtime files of each accepted composition into public/motion/<id>/,
// copies the pinned HyperFrames Player and writes lib/motion-catalog.json.
import {createHash} from 'node:crypto';
import {cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const campaign = resolve(homedir(), 'code/control/portfolio/motion/portfolio-20261001');
const productsRoot = join(campaign, 'products');
const publicRoot = join(siteRoot, 'public/motion');
const PLAYER_VERSION = '0.8.104';

// Runtime entries only; briefs, evidence, QA and snapshots stay private.
const RUNTIME_ENTRIES = ['index.html', 'build.js', 'story-data.js', 'styles.css', 'assets', 'data', 'shared', 'compositions', 'components', 'styles'];
// Product-specific stylesheet at the root (e.g. flow-graph.css); tooling scripts stay out.
const isRootStyle = (name) => name.endsWith('.css');

// Operator cut of 2026-10-02: internal tooling and unconfirmed cases stay out of the site.
const EXCLUDED = new Set([
  'artifact-server', 'database-access-hub', 'welabs-sso', 'worktree-runtime', 'youtrack-integration', 'flow-graph',
  'wekb-core-independent-line', 'imagine-marketplace', 'project-manager', 'imagine-observability-user-journey',
  'opentag', 'relay-project', 'internal-rh', 'shopcontrol', 'mandato-participativo', 'tetrapak-prospecting-app',
  'helper-project-management',
]);

// Client programmes shown as clients only: their journey films stay off the product pages.
// infraction-management names the agency, and Auto Infração must not cite it.
// wemalupe shows the internal codename, which must not be cited.
const CLIENT_ONLY = new Set(['light-recicla', 'ecoenel', 'avsi-program-case', 'infraction-management', 'wemalupe']);

// Round 20261002 pieces (business overview and topology), bound to the coordinator's accepted hash.
const round2 = resolve(homedir(), 'code/control/portfolio/motion/portfolio-20261002');
// Insertion order is the emphasis ranking (lib/emphasis.json); galleries keep this order.
const ROUND2 = {
  'svc-integration': {kind: 'topology', page: 'servicos', title: 'Integração e automação'},
  'svc-applied-ai': {kind: 'topology', page: 'servicos', title: 'IA aplicada'},
  'svc-custom-software': {kind: 'topology', page: 'servicos', title: 'Como trabalhamos'},
  'svc-platform-cloud': {kind: 'topology', page: 'servicos', title: 'Infraestrutura e cloud'},
  'welabs-platform': {kind: 'topology', page: 'welabs', title: 'Plataforma Welabs'},
  'erp-hub': {kind: 'business', page: 'welabs', product: 'erp', title: 'ERP · o centro do domínio'},
  'flow-connectors': {kind: 'business', page: 'welabs', product: 'flow', title: 'Flow · tudo pode rodar nele'},
  'flow-engine': {kind: 'topology', page: 'welabs', product: 'flow', title: 'Flow · motor de workflow'},
  'security-ops': {kind: 'business', page: 'welabs', product: 'malupe', title: 'Ecossistema Monitoramento'},
  'biz-welabs-crm': {kind: 'business', page: 'welabs', product: 'welabs-crm', title: 'CRM'},
  'biz-welabs-kb': {kind: 'business', page: 'welabs', product: 'wekb', title: 'KB · base de conhecimento'},
  'erp-builder': {kind: 'topology', page: 'welabs', product: 'erp', title: 'ERP · Construtor (previsto)'},
  'biz-tabela': {kind: 'business', product: 'tabela', title: 'Tabe.la'},
  'biz-stant': {kind: 'business', product: 'stant', title: 'Stant'},
  'biz-sgors-cycle': {kind: 'business', product: 'sgors', title: 'SGORS'},
  'biz-central-esg': {kind: 'business', product: 'central-esg', title: 'Central ESG'},
  'biz-kiosk-brands': {kind: 'business', product: 'kiosk-brands', title: 'Kiosk Brands'},
  'wego-catalog': {kind: 'topology', product: 'wego', title: 'Família WeGO'},
  'biz-auto-infracao': {kind: 'business', product: 'autoinfracao', title: 'Auto Infração'},
  'biz-sgici': {kind: 'business', product: 'sgici', title: 'SGICI'},
  'biz-report-crm': {kind: 'business', product: 'report-crm', title: 'Report CRM'},
  'biz-netsafety': {kind: 'business', product: 'netsafety', title: 'Netsafety'},
  'biz-ius': {kind: 'business', product: 'ius', title: 'IUS'},
};

// Existing presentation slug for compositions that overlap the 22 framepacks.
const PRESENTATION_SLUG = {
  'avsi-program-case': 'neoenergia', 'infraction-management': 'autoinfracao', 'environmental-licensing': 'licenciamento',
  'ima-system': 'sistema-ima', wecrm: 'welabs-crm', wemalupe: 'malupe',
};

function findPlayer() {
  const cacheRoot = join(homedir(), '.npm/_npx');
  for (const entry of readdirSync(cacheRoot)) {
    const pkg = join(cacheRoot, entry, 'node_modules/hyperframes');
    try {
      if (JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')).version === PLAYER_VERSION) return join(pkg, 'dist/hyperframes-player.global.js');
    } catch { /* not this cache entry */ }
  }
  throw new Error(`HyperFrames ${PLAYER_VERSION} not found in the npm cache`);
}

// Welabs products have no product identity yet; the company logo already names Welabs.
const RENAMED = {
  WeERP: 'ERP', WeKB: 'KB', WeCRM: 'CRM', WeMalupe: 'Ecossistema Monitoramento', 'Get-Go': 'Gerador de formulários',
  'IMA Auto de Infração': 'Auto Infração', 'Ecossistema WeGO': 'Família WeGO',
};

function readTitles() {
  // Titles and accepted state come from the coordinator's delivery index.
  const titles = new Map();
  const index = readFileSync(join(campaign, 'delivery-index.md'), 'utf8');
  for (const line of index.split('\n')) {
    const match = line.match(/^\| (.+?) \| Aceito \| \[HTML editável\]\(.*?\/products\/([^/]+)\/index\.html\)/);
    if (match) titles.set(match[2], RENAMED[match[1]] ?? match[1]);
  }
  return titles;
}

// Player picks its GSAP adapter once; a zero-length timeline at that moment freezes playback.
// Seed the registered timeline with the declared duration so the player drives GSAP directly.
// The module seed runs after build.js (modules execute in order) and re-applies while the
// composition registers its timeline asynchronously, so the film keeps its accepted length.
function seedTimeline(html, compositionId, duration) {
  const seed = `<script type="module">const id=${JSON.stringify(compositionId)},d=${duration};` +
    `const pad=()=>{const t=window.__timelines||{};for(const tl of [t[id],...Object.values(t)]){if(tl&&tl.duration&&tl.duration()<d){tl.to({},{duration:d-tl.duration()},tl.duration());}}};` +
    `pad();let n=0;const tick=()=>{pad();if(++n<40)setTimeout(tick,50);};tick();</script>`;
  return html.replace(/(<\/body>)/i, `${seed}\n$1`);
}

// Studio serves each project at the origin root, so some stylesheets use "/assets/...".
// Under the site every film lives in /motion/<id>/, so those URLs are rebased in the copy.
function rebaseAbsoluteAssets(dir, id) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) rebaseAbsoluteAssets(path, id);
    else if (entry.name.endsWith('.css')) {
      const css = readFileSync(path, 'utf8');
      const rebased = css.replace(/(["'(])\/assets\//g, `$1/motion/${id}/assets/`);
      if (rebased !== css) writeFileSync(path, rebased);
    }
  }
}

const titles = readTitles();
rmSync(publicRoot, {recursive: true, force: true});
mkdirSync(publicRoot, {recursive: true});
cpSync(findPlayer(), join(publicRoot, 'player.js'));

const catalog = [];
for (const id of readdirSync(productsRoot).sort()) {
  const source = join(productsRoot, id);
  if (EXCLUDED.has(id) || CLIENT_ONLY.has(id) || !titles.has(id) || !existsSync(join(source, 'index.html'))) continue;
  const target = join(publicRoot, id);
  for (const entry of [...RUNTIME_ENTRIES, ...readdirSync(source).filter(isRootStyle)]) {
    if (existsSync(join(source, entry))) cpSync(join(source, entry), join(target, entry), {recursive: true, dereference: true});
  }
  rebaseAbsoluteAssets(target, id);
  const html = readFileSync(join(target, 'index.html'), 'utf8');
  const compositionId = html.match(/data-composition-id="([^"]+)"/)?.[1];
  const duration = Number(html.match(/data-duration="([0-9.]+)"/)?.[1]);
  if (!compositionId || !duration) throw new Error(`${id}: missing data-composition-id or data-duration`);
  writeFileSync(join(target, 'index.html'), seedTimeline(html, compositionId, duration));
  catalog.push({id, title: titles.get(id), duration, compositionId, src: `/motion/${id}/index.html`, kind: 'journey', page: null, product: PRESENTATION_SLUG[id] ?? id});
}

// Round 2: only pieces whose index.html still matches the accepted sha256 reach the site.
const accepted = JSON.parse(readFileSync(join(round2, 'accepted.json'), 'utf8'));
const pending = [];
for (const [id, meta] of Object.entries(ROUND2)) {
  const source = join(round2, 'pieces', id);
  const htmlPath = join(source, 'index.html');
  const hash = existsSync(htmlPath) ? createHash('sha256').update(readFileSync(htmlPath)).digest('hex') : null;
  if (!accepted[id] || accepted[id].sha256 !== hash) { pending.push(id); continue; }
  const target = join(publicRoot, id);
  cpSync(htmlPath, join(target, 'index.html'));
  if (existsSync(join(source, 'assets'))) cpSync(join(source, 'assets'), join(target, 'assets'), {recursive: true, dereference: true});
  // Mid-film frame from the coordinator's measured shots serves as the card poster.
  if (existsSync(join(source, 'qa/1920-50.png'))) cpSync(join(source, 'qa/1920-50.png'), join(target, 'poster.png'));
  const html = readFileSync(htmlPath, 'utf8');
  catalog.push({
    id, title: meta.title, duration: Number(html.match(/data-duration="([0-9.]+)"/)?.[1]),
    compositionId: html.match(/data-composition-id="([^"]+)"/)?.[1], src: `/motion/${id}/index.html`,
    kind: meta.kind, page: meta.page ?? null, product: meta.product ?? null,
  });
}

// presentationSlug links a film to an existing framepack page, when there is one.
const framepacks = new Set(readdirSync(join(siteRoot, 'public/presentations')));
for (const item of catalog) item.presentationSlug = item.product && framepacks.has(item.product) ? item.product : null;
writeFileSync(join(siteRoot, 'lib/motion-catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
process.stdout.write(`motion: ${catalog.length} films synced (${titles.size} accepted journeys, ${EXCLUDED.size} excluded; round 2 pending: ${pending.join(', ') || 'none'})\n`);
