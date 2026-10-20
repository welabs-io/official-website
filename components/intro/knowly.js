// COREOGRAFIA DA ABERTURA CONCEITUAL DO KNOWLY, VERSÃO 1.0.0 (rede de conhecimento sobre um globo que vira o "o" de "knowly")
// Same arc as the approved openings (magneto-intro 1.3.0, domus-intro 1.0.1, relloo-intro 1.0.0), with the Knowly idea: while the camera
// is close, five knowledge fragments (document, meeting, ticket, code, manual) arrive fast and connect through citation lines, a dot
// travelling along each line. The camera pulls back and reveals that the whole network is drawn on a big globe (meridians and parallels).
// The globe turns a quarter turn and condenses (clack, short amber flash, fragments absorbed by shrinking and fading on the same 0.16 s,
// no pop): the three parallels thicken into the three amber strokes of the logo globe. Then the globe shrinks onto the exact position of
// the "o" of "knowly" and the official endorsed logo takes over (wordmark opens to both sides, seal, tagline).
// The sign is never redrawn by hand: ring and strokes are read at run time from the official logo (knowly-logo-on-dark.svg).
// Pure function of time: one paused GSAP tween drives render(t) through a setter, no clock and no random, so seek is exact.
// Expected DOM inside the root: img.wm (data-brand-src="welabs/knowly-endorsed-on-dark.svg"), div.role (span.bar, span.word).
// Usage: KnowlyIntro.build({root, duration, T, safe}) -> paused timeline (tl.knowly = instance); KnowlyIntro.mount(root, cfg) -> {render, layout, T}.
//
// ABERTURA DO KNOWLY NO SITE
// Port of the accepted choreography 1.0.0 for the site (components/intro/intro-run.ts): light palette (kit.js), eases
// without GSAP, the logo text and the endorsed box passed by the player (cfg.logo, cfg.box), `.wm` the player's wrapper
// of the light endorsed logo, no `build`. Motion, geometry and times are those of the round.
import { parseEase, LIGHT } from './kit.js';

  var W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg', AMBER = '#FFB020', PANEL = LIGHT.card, PANEL2 = LIGHT.panel2, EDGE = LIGHT.edge, GRID = LIGHT.grid, MUTED = LIGHT.muted, INK = LIGHT.ink;
  var GAP = 96, ROLE_H = 56;        // layout gap between logo and tagline, tagline height
  var WORD_CUT = 300;               // logo-box y (px) between the wordmark and the "by welabs" seal
  var SEAL_W = 400;                 // width (px at scale 1) of the seal region swept by the seal wipe
  var KBIG = 5.5;                   // scale of the globe while the camera pulls back (hole radius 283 px, outer edge 426 px, 114 px safe)
  var C = [960, 540];               // centre of the globe on screen before it shrinks
  var CARD_W = 188, CARD_H = 74;    // fragment card
  var RADIUS = 178;                 // distance (px) from the globe centre to the card centres (pentagon)
  var FLY = 0.42, FLY_OFF = 60;     // flight (s) and distance (px) of a card

  // CRONOMETRAGEM (segundos; todos os tempos de fase moram aqui e cada peça pode sobrescrever)
  var T0 = {
    cardStep: 0.14,                                   // cards arrive from frame 0, one more every 0.14 s
    link0: 0.55, linkStep: 0.1, linkDraw: 0.25,       // citation lines, ring of neighbours first, then the chords
    zoom0: 1.6, zoom1: 2.2, zIn: 1.55,                // camera pull-back window and the close-up factor
    grid0: 1.45, grid1: 2.0, ring0: 1.5, ring1: 2.1,  // surface lines fade in, the ring stroke grows outward from the hole
    turn0: 1.95, cond0: 2.0,                          // quarter turn and condensation of the parallels (both end at the clack)
    abs: 2.14, absDur: 0.16, hit: 2.3,                // absorption (ends at the clack) and the clack
    cam0: 2.45, cam1: 3.25,                           // globe shrinks onto the "o"
    wipe0: 3.25, wipe1: 3.7, seal0: 3.65, seal1: 3.95, role0: 3.75, role1: 4.05
  };

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, t) { var u = clamp01((t - a) / (b - a)); return u * u * (3 - 2 * u); }
  function ease(name) { var f = parseEase(name); return function (u) { return u <= 0 ? 0 : u >= 1 ? 1 : f(u); }; }
  var eFly = ease('power3.out'), eIn = ease('power2.in'), eOut = ease('power3.out'), eCam = ease('power3.inOut');
  var eWipe = ease('power3.out'), eSeal = ease('power3.out'), eRole = ease('power3.out');
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var cA = rgb(AMBER), cE = rgb(EDGE);
  function mix(a, b, u) { return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(lerp(a[i], b[i], u)); }).join(',') + ')'; }
  function f2(x) { return x.toFixed(2); }

  // GEOMETRIA OFICIAL (lida do SVG da marca; a peça não carrega cópia do desenho)
  // The text of the light logo and the endorsed box come from the player (cfg.logo, cfg.box)
  function readLogo(txt, evBox) {
    var cm = /<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="none" stroke="(#[0-9A-Fa-f]{6})" stroke-width="([\d.]+)"\/>/.exec(txt);
    var gm = /<g fill="none" stroke="(#[0-9A-Fa-f]{6})" stroke-width="([\d.]+)" stroke-linecap="round">([\s\S]*?)<\/g>/.exec(txt);
    if (!cm || !gm) throw new Error('knowly-intro: unexpected knowly logo markup');
    var par = [], re = /<path d="([^"]+)"\/>/g, m;
    while ((m = re.exec(gm[3]))) {
      var d = m[1], a = /^M(-?[\d.]+) (-?[\d.]+)A([\d.]+) [\d.]+ 0 0 ([01]) (-?[\d.]+) (-?[\d.]+)$/.exec(d), l = /^M(-?[\d.]+) (-?[\d.]+)H(-?[\d.]+)$/.exec(d);
      if (a) par.push({d: d, kind: 'arc', y: +a[2], hw: (+a[5] - +a[1]) / 2, r: +a[3], sweep: a[4]});
      else if (l) par.push({d: d, kind: 'line', y: +l[2], hw: (+l[3] - +l[1]) / 2, r: 0, sweep: '0'});
      else throw new Error('knowly-intro: unexpected stroke path ' + d);
    }
    if (par.length !== 3) throw new Error('knowly-intro: expected three amber strokes');
    var cx = +cm[1], cy = +cm[2], r = +cm[3], sw = +cm[5];
    return {
      cx: cx, cy: cy, r: r, sw: sw, ringFill: cm[4], rin: r - sw / 2, rout: r + sw / 2,
      par: par, parStroke: gm[1], parSw: +gm[2],
      ev: evBox
    };
  }
  // One parallel at condensation u: u = 0 is the chord of the globe disc, u = 1 is exactly the logo stroke
  function parPath(lg, i, u) {
    var L = lg.par[i], dy = L.y - lg.cy, c0 = Math.sqrt(Math.max(lg.rin * lg.rin - dy * dy, 0));
    if (u >= 1) return L.d;
    var hw = lerp(c0, L.hw, u), xl = lg.cx - hw, xr = lg.cx + hw, line = 'M' + f2(xl) + ' ' + L.y + 'H' + f2(xr);
    if (L.kind === 'line' || u < 0.001) return line;
    var r = Math.max(L.r / u, hw);                       // curvature grows from 0 (chord) to the logo arc
    return 'M' + f2(xl) + ' ' + L.y + 'A' + f2(r) + ' ' + f2(r) + ' 0 0 ' + L.sweep + ' ' + f2(xr) + ' ' + L.y;
  }

  // FRAGMENTOS DE CONHECIMENTO (cartões de fonte dos filmes do Knowly: documento, reunião, ticket, código, manual; rótulos curtos, dados DEMO)
  var ICON = {
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 12h5M9.5 16h5"/>',
    meet: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6"/><path d="M16 5.5a3 3 0 0 1 0 5.5M18 14.5c2 .8 3 3 3 5.5"/>',
    ticket: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M9 6v12" stroke-dasharray="2 2.5"/>',
    code: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5"/>',
    manual: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5.7 1.5 1.5z"/>'
  };
  var CARDS = [
    {label: 'Documento', sub: 'Prazos', icon: 'doc'},
    {label: 'Reunião', sub: '12/09', icon: 'meet'},
    {label: 'Ticket', sub: 'ATL-142', icon: 'ticket'},
    {label: 'Código', sub: 'Propostas', icon: 'code'},
    {label: 'Manual', sub: 'Vendas', icon: 'manual'}
  ];
  // citation lines: neighbours of the pentagon first, then the chords (the network gets dense)
  var EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3], [2, 4], [3, 0], [4, 1]];

  var uid = 0;
  export function mount(root, over) {
    var T = {}, k0;
    for (k0 in T0) T[k0] = T0[k0];
    for (k0 in ((over && over.T) || {})) T[k0] = over.T[k0];
    var zIn = T.zIn, SAFE = (over && over.safe != null) ? over.safe : 98;   // safe margin (px) for the globe
    var lg = readLogo(over.logo, over.box), ev = lg.ev, id = ++uid;
    var w = ev[2], h = ev[3];
    var left = Math.round((W - w) / 2), top = Math.round((H - (h + GAP + ROLE_H)) / 2);
    var P1 = [left + lg.cx - ev[0], top + lg.cy - ev[1]];             // screen position of the globe centre in the final logo (scale 1)
    var wmEl = root.querySelector('.wm'), role = root.querySelector('.role');
    var bar = role.querySelector('.bar'), word = role.querySelector('.word');
    wmEl.style.cssText = 'position:absolute;display:block;left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;visibility:hidden';
    role.style.top = (top + h + GAP) + 'px';

    // Wordmark side of the wipe: the letters "kn" and "wly" stay outside the globe band (logo units); the globe itself is the clip's start
    var bandL = lg.cx - lg.rout - 1.2, bandR = lg.cx + lg.rout + 0.4;

    // CENA (um SVG em pixels de tela: o globo em unidades do logo, cartões e linhas em pixels do mundo)
    var zoom = document.createElement('div');
    zoom.className = 'zoom';
    zoom.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;transform-origin:0 0';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'scene'); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('data-layout-allow-overflow', ''); // cards enter from outside the zoomed frame on purpose
    svg.style.cssText = 'position:absolute;left:0;top:0;font-family:Inter,sans-serif';
    var s = '<defs><radialGradient id="gl' + id + '"><stop offset="0" stop-color="' + AMBER + '" stop-opacity=".95"/><stop offset=".45" stop-color="' + AMBER + '" stop-opacity=".35"/><stop offset="1" stop-color="' + AMBER + '" stop-opacity="0"/></radialGradient></defs>';
    var j;
    // Globe first (behind the network): disc, meridians, parallels, ring
    s += '<g class="globe"><circle class="disc" cx="' + lg.cx + '" cy="' + lg.cy + '" r="' + lg.rin + '" fill="' + PANEL + '" opacity="0"/><g class="mer" fill="none" stroke="' + GRID + '" stroke-width="0.5" opacity="0">';
    for (j = 0; j < 4; j++) s += '<ellipse cx="' + lg.cx + '" cy="' + lg.cy + '" rx="1" ry="' + lg.rin + '"/>';
    s += '</g>';
    for (j = 0; j < 3; j++) s += '<path class="par" fill="none" stroke="' + lg.parStroke + '" stroke-linecap="round" opacity="0"/>';
    s += '<circle class="ring" cx="' + lg.cx + '" cy="' + lg.cy + '" fill="none" stroke="' + lg.ringFill + '" opacity="0"/></g>';
    for (j = 0; j < EDGES.length; j++) s += '<g class="link" opacity="0"><line stroke="' + AMBER + '" stroke-width="3" stroke-linecap="round" stroke-opacity=".8"/><circle class="hd" r="7" fill="' + AMBER + '"/><circle class="cr" r="5.5" fill="#FFFFFF"/></g>';
    var hw = CARD_W / 2, hh = CARD_H / 2;
    for (j = 0; j < CARDS.length; j++) {
      var D = CARDS[j], ang = (-90 + 72 * j) * Math.PI / 180;
      D.ux = Math.cos(ang); D.uy = Math.sin(ang);
      D.px = RADIUS * D.ux; D.py = RADIUS * D.uy;                  // card centre relative to the globe centre
      D.arr = j * T.cardStep; D.land = D.arr + FLY * 0.8;
      D.lit = [];
      s += '<g class="card" opacity="0"><rect class="cb" x="' + (-hw) + '" y="' + (-hh) + '" width="' + CARD_W + '" height="' + CARD_H + '" rx="20" fill="' + PANEL + '" stroke="' + EDGE + '" stroke-width="3"/>' +
        '<circle cx="-62" cy="0" r="23" fill="' + PANEL2 + '"/>' +
        '<g transform="translate(-74 -12)" fill="none" stroke="' + AMBER + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICON[D.icon] + '</g>' +
        '<text x="-30" y="-3" font-size="20" font-weight="600" fill="' + INK + '">' + D.label + '</text>' +
        '<text x="-30" y="22" font-size="16" font-weight="500" fill="' + MUTED + '">' + D.sub + '</text></g>';
    }
    s += '<circle class="burst" r="100" fill="url(#gl' + id + ')" opacity="0"/>';
    svg.innerHTML = s;
    zoom.appendChild(svg);
    root.insertBefore(zoom, root.firstChild);
    var q = function (c) { return svg.querySelector('.' + c); };
    var qa = function (c) { return svg.querySelectorAll('.' + c); };
    var globe = q('globe'), disc = q('disc'), mer = q('mer'), ring = q('ring'), burst = q('burst');
    var mers = mer.querySelectorAll('ellipse'), pars = qa('par'), cards = qa('card'), links = qa('link');
    // Line schedule: each line starts when both ends have landed; the card at each end lights when the dot touches it
    EDGES.forEach(function (e, n) {
      var a = CARDS[e[0]], b = CARDS[e[1]];
      var st = Math.max(T.link0 + n * T.linkStep, a.land, b.land);
      e.st = st;
      a.lit.push(st); b.lit.push(st + T.linkDraw);
    });
    CARDS.forEach(function (D) { D.lit.push(D.land); });

    // POSE DE UM CARTÃO QUE VOA (chega de fora do globo, desacelera até o lugar e assenta com leve oscilação)
    function fly(t, arr, dur, off, bow) {
      var u = clamp01((t - arr) / dur), f = eFly(u), len = Math.sqrt(off[0] * off[0] + off[1] * off[1]) || 1;
      var nx = -off[1] / len, ny = off[0] / len, b = bow * Math.sin(Math.PI * f) * (1 - f);
      var x = off[0] * (1 - f) + nx * b, y = off[1] * (1 - f) + ny * b;
      var ls = t - (arr + dur * 0.8);
      if (ls > 0) { var ov = 4 * Math.exp(-ls * 11) * Math.sin(ls * 34); x -= (off[0] / len) * ov; y -= (off[1] / len) * ov; }
      return {x: x, y: y, f: f};
    }

    function render(t) {
      var n, k, au = clamp01((t - T.abs) / T.absDur);
      // CÂMERA DE FOCO (aproximada sobre a rede até zoom0; recua até zoom1 e termina em escala 1 exata, sem transform)
      var zu = eCam(clamp01((t - T.zoom0) / (T.zoom1 - T.zoom0))), zk = lerp(zIn, 1, zu);
      zoom.style.transform = zu >= 1 ? 'none' : 'translate(' + C[0] + 'px,' + C[1] + 'px) scale(' + zk.toFixed(5) + ') translate(' + (-C[0]) + 'px,' + (-C[1]) + 'px)';

      // GLOBO (centro e escala: afastado até o clack; depois encolhe até o "o" do logo)
      var ec = eCam(clamp01((t - T.cam0) / (T.cam1 - T.cam0)));
      var clack = t >= T.hit ? -0.035 * Math.exp(-(t - T.hit) * 11) : 0;   // short inward squeeze at the clack
      var kk = lerp(KBIG, 1, ec) * (1 + clack);
      if (ec >= 1) kk = 1;                                                 // exact landing: scale 1, no residue
      var pcx = lerp(C[0], P1[0], ec), pcy = lerp(C[1], P1[1], ec);
      globe.setAttribute('transform', 'translate(' + pcx.toFixed(3) + ' ' + pcy.toFixed(3) + ') scale(' + kk.toFixed(5) + ') translate(' + (-lg.cx) + ' ' + (-lg.cy) + ')');

      // Ring: the hole stays fixed, the stroke grows outward but never leaves the safe area while the camera is close
      var pr = eOut(clamp01((t - T.ring0) / (T.ring1 - T.ring0)));
      var swMax = (H / 2 - SAFE) / (zk * KBIG) - lg.rin;
      var swNow = ec > 0 || t >= T.hit ? lg.sw : Math.max(0.3, Math.min(0.3 + (lg.sw - 0.3) * pr, swMax));
      ring.setAttribute('r', (lg.rin + swNow / 2).toFixed(3)); ring.setAttribute('stroke-width', swNow.toFixed(3));
      ring.setAttribute('opacity', t >= T.ring0 ? 1 : 0);

      // Surface: meridians turn a quarter turn, parallels condense into the logo strokes, then the meridians fade
      var grid = smooth(T.grid0, T.grid1, t), turn = eCam(clamp01((t - T.turn0) / (T.hit - T.turn0))) * Math.PI / 2;
      var cu = eIn(clamp01((t - T.cond0) / (T.hit - T.cond0)));
      var merFade = grid * (1 - smooth(T.abs - 0.02, T.hit, t));
      mer.setAttribute('opacity', merFade.toFixed(3));
      for (k = 0; k < 4; k++) mers[k].setAttribute('rx', Math.max(0.5, lg.rin * Math.abs(Math.cos(turn + k * Math.PI / 4))).toFixed(3));
      for (k = 0; k < 3; k++) {
        pars[k].setAttribute('d', parPath(lg, k, cu));
        pars[k].setAttribute('stroke-width', lerp(0.6, lg.parSw, cu).toFixed(3));
        pars[k].setAttribute('opacity', lerp(0.6 * grid, 1, cu).toFixed(3));
      }
      disc.setAttribute('opacity', (0.55 * smooth(T.grid0 - 0.05, T.grid1, t) * (1 - smooth(T.abs - 0.04, T.hit, t))).toFixed(3));

      // CARTÕES E LINHAS DE CITAÇÃO (seguem o centro do globo; a absorção encolhe e esmaece no lugar)
      var fade = 1 - smooth(0, 1, au), pos = [];
      for (n = 0; n < CARDS.length; n++) {
        var D = CARDS[n], pc = fly(t, D.arr, FLY, [D.ux * FLY_OFF, D.uy * FLY_OFF], n % 2 ? -18 : 18);
        var px = pcx + D.px * kk / KBIG + pc.x, py = pcy + D.py * kk / KBIG + pc.y;
        var x = lerp(px, pcx, 0.5 * eIn(au)), y = lerp(py, pcy, 0.5 * eIn(au));
        var sc = lerp(0.84, 1, pc.f) * (1 - 0.85 * eIn(au));
        var op = (n === 0 ? 1 : smooth(D.arr, D.arr + 0.05, t)) * fade;
        var lit = 0;
        for (k = 0; k < D.lit.length; k++) if (t >= D.lit[k]) lit = Math.max(lit, 0.9 * Math.exp(-(t - D.lit[k]) * 6));
        lit = Math.max(lit, eIn(au));
        pos[n] = [x, y, op];
        cards[n].setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + (4 * (n % 2 ? -1 : 1) * (1 - pc.f)).toFixed(2) + ') scale(' + Math.max(sc, 0.001).toFixed(4) + ')');
        cards[n].setAttribute('opacity', op.toFixed(3));
        cards[n].querySelector('.cb').setAttribute('stroke', mix(cE, cA, clamp01(lit)));
      }
      for (n = 0; n < EDGES.length; n++) {
        var E = EDGES[n], pa = pos[E[0]], pb = pos[E[1]], lk = links[n], ln = lk.querySelector('line'), hd = lk.querySelector('.hd'), cr = lk.querySelector('.cr');
        var du = clamp01((t - E.st) / T.linkDraw), lu = eOut(du);
        var hx = lerp(pa[0], pb[0], lu), hy = lerp(pa[1], pb[1], lu);
        ln.setAttribute('x1', pa[0].toFixed(2)); ln.setAttribute('y1', pa[1].toFixed(2)); ln.setAttribute('x2', hx.toFixed(2)); ln.setAttribute('y2', hy.toFixed(2));
        hd.setAttribute('cx', hx.toFixed(2)); hd.setAttribute('cy', hy.toFixed(2));
        hd.setAttribute('opacity', (du > 0 && du < 1 ? 1 : 0).toFixed(1));
        // carrier dot: keeps travelling along a finished line
        var ph = ((t - E.st - T.linkDraw) * 1.4 + n * 0.37) % 1, cu2 = t > E.st + T.linkDraw ? Math.sin(Math.PI * ph) : 0;
        cr.setAttribute('cx', lerp(pa[0], pb[0], ph).toFixed(2)); cr.setAttribute('cy', lerp(pa[1], pb[1], ph).toFixed(2));
        cr.setAttribute('opacity', (0.9 * cu2).toFixed(3));
        lk.setAttribute('opacity', (du > 0 ? fade : 0).toFixed(3));
      }

      // CLACK (clarão âmbar curto no centro do globo)
      var h0 = T.hit - 0.04, bu = smooth(h0, h0 + 0.14, t) * (1 - smooth(h0 + 0.2, h0 + 0.5, t));
      burst.setAttribute('cx', pcx.toFixed(2)); burst.setAttribute('cy', pcy.toFixed(2));
      burst.setAttribute('r', (lerp(0.45, 1, eOut(clamp01((t - h0) / 0.45))) * 56 * kk + 36).toFixed(2));
      burst.setAttribute('opacity', bu.toFixed(3));

      // PASSAGEM PARA O LOGO OFICIAL (wordmark abre para os dois lados do globo, selo sobe, tagline entra)
      var wp = clamp01((t - T.wipe0) / (T.wipe1 - T.wipe0)), swapped = t >= T.wipe1;
      zoom.style.visibility = swapped ? 'hidden' : 'visible';
      var sl = eSeal(clamp01((t - T.seal0) / (T.seal1 - T.seal0)));
      wmEl.style.visibility = t < T.wipe0 ? 'hidden' : 'visible';
      if (t >= T.wipe0) {
        var e = eWipe(wp), xl = swapped ? 0 : lerp(bandL, 0, e), xr = swapped ? w : lerp(bandR, w, e), xs = SEAL_W * sl;
        if (swapped && sl >= 1) wmEl.style.clipPath = 'none';
        else wmEl.style.clipPath = 'polygon(' + [[xl, 0], [xr, 0], [xr, WORD_CUT], [xs, WORD_CUT], [xs, h], [0, h], [0, WORD_CUT], [xl, WORD_CUT]].map(function (v) { return v[0] + 'px ' + v[1] + 'px'; }).join(',') + ')';
      }
      var rr = eRole(clamp01((t - T.role0) / (T.role1 - T.role0)));
      bar.style.transform = 'scaleX(' + rr + ')';
      word.style.opacity = rr; word.style.transform = 'translateY(' + ((1 - rr) * 14) + 'px)';
    }
    render(0);
    return {render: render, layout: {left: left, top: top, w: w, h: h, P1: P1, ev: ev, lg: lg}, scene: svg, T: T, cards: CARDS};
  }

  // Instant the closing frame is complete (the bar under the logo is drawn)
  export const SETTLED = T0.role1;
