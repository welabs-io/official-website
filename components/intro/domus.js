// COREOGRAFIA DA ABERTURA CONCEITUAL DO DOMUS, VERSÃO 1.0.1 (planta que se condensa no símbolo de encaixe e assume o lugar do "o"; contorno com margem segura)
// 1.0.1 over 1.0.0: the outline of the symbol keeps its hole (the plan always sits inside it) and only its stroke is held so the outer
// edge stays at least `safe` px (default 96) from the frame edges while the camera pulls back; before, the outline left the frame
// through the top and bottom around 1.6-2.0 s. The amber echo wave expands the same 12%, now ending on the outline. Nothing else moves.
// Same arc as the approved Magneto opening (magneto-intro 1.3.0), with the Domus idea: the rooms of the business arrive in a
// cascade and lock side by side as a floor plan while the camera is close; the camera pulls back and the plan sits inside the
// outline of the "encaixe" symbol; the plan condenses into the symbol (clack, short amber flash, soft absorption); the symbol
// shrinks onto the exact position of the "o" of "domus", and the official endorsed logo takes over (wordmark opens both ways
// from the symbol, "by welabs" seal, role word).
// The symbol is never redrawn by hand: its ring and amber square are read at run time from the official logo
// (domus-logo-on-dark.svg, the file the manifest names), so the landing on the "o" follows the brand version.
// Pure function of time: one paused GSAP tween drives render(t) through a setter, no clock and no random, so seek is exact.
// Expected DOM inside the root: img.wm (data-brand-src="welabs/domus-endorsed-on-dark.svg"), div.role (span.bar, span.word).
// Usage: DomusIntro.build({root, duration, T, rooms}) -> paused timeline (tl.domus = instance); DomusIntro.mount(root, cfg) -> {render, layout, T, rooms}.
//
// ABERTURA DO DOMUS NO SITE
// Port of the accepted choreography 1.0.1 for the site (components/intro/intro-run.ts): the light palette of the site
// (kit.js) in place of the dark one, the eases written without GSAP, the logo geometry read from the light logo text the
// player passes (`cfg.logo`) instead of a synchronous request, the endorsed box from `cfg.box` (the round's dark file
// box, the same coordinates), and `.wm` is the player's wrapper of the light endorsed logo. No `build`: the player
// drives render(t) with requestAnimationFrame. Motion, geometry and times are those of the round.
import { parseEase, LIGHT } from './kit.js';

  var W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg', AMBER = '#FFB020', CARD = LIGHT.card, EDGE = LIGHT.edge, INK = LIGHT.ink;
  var GAP = 96, ROLE_H = 56;        // layout gap between logo and role word, role height
  var WORD_CUT = 300;               // logo-box y (px) between the wordmark and the "by welabs" seal
  var SEAL_W = 400;                 // width (px at scale 1) of the seal region swept by the seal wipe
  var KBIG = 5.6;                   // opening scale of the symbol (outline height 868 px, 106 px from the top and bottom)
  var C = [960, 540];               // centre of the plan and of the big symbol on screen

  // CRONOMETRAGEM (segundos; todos os tempos de fase moram aqui e cada peça pode sobrescrever)
  var T0 = {
    arr0: 0, arrStep: 0.2, fly: 0.5,                 // cascade: first room at frame 0, one more every 0.2 s, 0.5 s of flight each
    zoom0: 1.6, zoom1: 2.2, zIn: 1.7,                // camera pull-back window and the close-up factor
    ring0: 1.5, ring1: 2.15,                         // the symbol outline grows outward from the plan while the camera leaves
    abs: 2.16, absDur: 0.14, hit: 2.3,               // absorption (ends at the clack) and the clack
    sq0: 2.22, sq1: 2.36,                            // amber square fades in under the absorbed rooms
    cam0: 2.45, cam1: 3.25,                          // symbol shrinks onto the "o"
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

  // GEOMETRIA OFICIAL (lida do SVG da marca; a peça não carrega cópia do desenho)
  // The text of the light logo and the endorsed box come from the player (cfg.logo, cfg.box)
  function readLogo(txt, box) {
    var ring = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="([\d.]+)" fill="none" stroke="(#[0-9A-Fa-f]{6})" stroke-width="([\d.]+)"/.exec(txt);
    var sq = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="(#[0-9A-Fa-f]{6})"/.exec(txt);
    if (!ring || !sq) throw new Error('domus-intro: unexpected domus logo markup');
    return {
      ring: {x: +ring[1], y: +ring[2], w: +ring[3], h: +ring[4], rx: +ring[5], stroke: ring[6], sw: +ring[7]},
      sq: {x: +sq[1], y: +sq[2], w: +sq[3], h: +sq[4], fill: sq[5]},
      ev: box
    };
  }

  // CÔMODOS (planta de 3 colunas e 3 linhas; os cartões usam o visual dos filmes do Domus e os ícones do filme da casa)
  var CW = 130, CH = 112, GP = 12;   // column width, row height, wall gap (world px)
  var ROOMS = [
    {label: 'Financeiro', col: 0, row: 0, span: 2, off: [-330, 10], bow: 30,
      icon: '<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="2.6"/>'},
    {label: 'Fiscal', col: 2, row: 0, span: 1, off: [720, -120], bow: -40,
      icon: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'},
    {label: 'Estoque', col: 0, row: 1, span: 1, off: [-720, 90], bow: 40,
      icon: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4M12 11v10"/>'},
    {label: 'Vendas', col: 1, row: 1, span: 2, off: [700, 150], bow: -40,
      icon: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.6"/>'},
    {label: 'Pessoas', col: 0, row: 2, span: 2, off: [-560, 300], bow: 35,
      icon: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 0 1 0 8M22 21c0-3-1.5-5-4-5.6"/>'},
    {label: 'Projetos', col: 2, row: 2, span: 1, off: [560, 300], bow: -35,
      icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M14 4v16"/>'}
  ];
  // Doors: amber ticks in the wall gap between two rooms [a, b, x, y, vertical]
  var DOORS = [[0, 1, 1031, 416, 1], [0, 2, 818, 478, 0], [1, 3, 1102, 478, 0], [2, 3, 889, 540, 1], [2, 4, 818, 602, 0], [3, 5, 1102, 602, 0], [4, 5, 1031, 664, 1]];
  var PLAN_W = 3 * CW + 2 * GP, PLAN_H = 3 * CH + 2 * GP;

  var uid = 0;
  export function mount(root, over) {
    var T = {}, k0;
    for (k0 in T0) T[k0] = T0[k0];
    for (k0 in ((over && over.T) || {})) T[k0] = over.T[k0];
    var zIn = T.zIn, SAFE = (over && over.safe != null) ? over.safe : 96;   // safe margin (px) for the outline
    var logo = readLogo(over.logo, over.box), ev = logo.ev, id = ++uid;
    var w = ev[2], h = ev[3];
    var left = Math.round((W - w) / 2), top = Math.round((H - (h + GAP + ROLE_H)) / 2);
    var rg = logo.ring, sq = logo.sq;
    var ocx = rg.x + rg.w / 2, ocy = rg.y + rg.h / 2;                // centre of the "o" in logo units
    var P1 = [left + ocx - ev[0], top + ocy - ev[1]];                 // screen position of the "o" centre in the final logo (scale 1)
    var wmEl = root.querySelector('.wm'), role = root.querySelector('.role');
    var bar = role.querySelector('.bar'), word = role.querySelector('.word');
    wmEl.style.cssText = 'position:absolute;display:block;left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;visibility:hidden';
    role.style.top = (top + h + GAP) + 'px';

    // Wordmark bounds either side of the symbol (logo units): the "d" ends at 160, the "m" starts at 336; the wipe opens from the ring edge
    var bandL = rg.x - rg.sw / 2 - 4, bandR = rg.x + rg.w + rg.sw / 2 + 4;

    // CENA (um SVG em pixels de tela: cartões e portas no mundo da planta, símbolo em unidades do logo)
    var zoom = document.createElement('div');
    zoom.className = 'zoom';
    zoom.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;transform-origin:0 0';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'scene'); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('data-layout-allow-overflow', ''); // rooms enter from outside the zoomed frame on purpose
    svg.style.cssText = 'position:absolute;left:0;top:0;font-family:Inter,sans-serif';
    var s = '<defs><radialGradient id="gl' + id + '"><stop offset="0" stop-color="' + AMBER + '" stop-opacity=".95"/><stop offset=".45" stop-color="' + AMBER + '" stop-opacity=".35"/><stop offset="1" stop-color="' + AMBER + '" stop-opacity="0"/></radialGradient></defs>';
    var j;
    // Symbol layer first (behind the rooms): outline, amber square
    s += '<g class="sym" opacity="0"><rect class="ring" x="' + rg.x + '" y="' + rg.y + '" width="' + rg.w + '" height="' + rg.h + '" rx="' + rg.rx + '" fill="none" stroke="' + rg.stroke + '" stroke-width="' + rg.sw + '"/>' +
      '<rect class="sq" x="' + sq.x + '" y="' + sq.y + '" width="' + sq.w + '" height="' + sq.h + '" fill="' + sq.fill + '" opacity="0"/></g>';
    s += '<rect class="wave" fill="none" stroke="' + AMBER + '" stroke-width="5" opacity="0"/>';
    for (j = 0; j < ROOMS.length; j++) s += '<rect class="ping" fill="none" stroke="' + AMBER + '" stroke-width="2" rx="18" opacity="0"/>';
    for (j = 0; j < DOORS.length; j++) s += '<line class="door" stroke="' + AMBER + '" stroke-width="6" stroke-linecap="round" opacity="0"/>';
    for (j = 0; j < ROOMS.length; j++) {
      var R = ROOMS[j], rw = R.span * CW + (R.span - 1) * GP;
      R.w = rw; R.cx = C[0] - PLAN_W / 2 + R.col * (CW + GP) + rw / 2; R.cy = C[1] - PLAN_H / 2 + R.row * (CH + GP) + CH / 2;
      R.arr = T.arr0 + j * T.arrStep; R.land = R.arr + T.fly;
      s += '<g class="room" opacity="0"><rect class="cb" x="' + (-rw / 2) + '" y="' + (-CH / 2) + '" width="' + rw + '" height="' + CH + '" rx="18" fill="' + CARD + '" stroke="' + EDGE + '" stroke-width="3"/>' +
        '<g transform="translate(-18 -34) scale(1.5)" fill="none" stroke="' + AMBER + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + R.icon + '</g>' +
        '<text x="0" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="' + INK + '">' + R.label + '</text></g>';
    }
    s += '<circle class="burst" r="100" fill="url(#gl' + id + ')" opacity="0"/>';
    svg.innerHTML = s;
    zoom.appendChild(svg);
    root.insertBefore(zoom, root.firstChild);
    var q = function (c) { return svg.querySelector('.' + c); };
    var qa = function (c) { return svg.querySelectorAll('.' + c); };
    var sym = q('sym'), ringEl = q('ring'), sqEl = q('sq'), wave = q('wave'), burst = q('burst');
    var pings = qa('ping'), doors = qa('door'), rooms = qa('room');

    // POSE DO CÔMODO (voa em linha curva e desacelera até o encaixe, assenta com leve oscilação e é puxado ao centro na absorção)
    function pose(j, t) {
      var R = ROOMS[j], u = clamp01((t - R.arr) / T.fly), f = eFly(u), o = R.off, len = Math.sqrt(o[0] * o[0] + o[1] * o[1]);
      var nx = -o[1] / len, ny = o[0] / len, bow = R.bow * Math.sin(Math.PI * f) * (1 - f);
      var x = R.cx + o[0] * (1 - f) + nx * bow, y = R.cy + o[1] * (1 - f) + ny * bow;
      var ls = t - R.land;
      if (ls > 0) { var ov = 6 * Math.exp(-ls * 11) * Math.sin(ls * 34); x -= (o[0] / len) * ov; y -= (o[1] / len) * ov; }
      var au = eIn(clamp01((t - T.abs) / T.absDur));
      x = lerp(x, C[0], au); y = lerp(y, C[1], au);
      var sc = lerp(0.82, 1, f) * (1 - 0.85 * au);
      var op = (j === 0 ? 1 : smooth(R.arr, R.arr + 0.05, t)) * (1 - smooth(0.6, 1, au));
      var pre = smooth(T.abs - 0.2, T.abs, t);                        // edges warm up as the symbol starts to pull
      var lit = Math.max(ls >= 0 ? 0.9 * Math.exp(-ls * 8) : 0, 0.8 * pre, au);
      return {x: x, y: y, sc: sc, op: op, lit: lit, au: au, f: f, ang: 7 * (j % 2 ? -1 : 1) * (1 - f)};
    }

    function render(t) {
      var n, dd;
      // CÂMERA DE FOCO (aproximada sobre a planta até zoom0; recua até zoom1 e termina em escala 1 exata, sem transform)
      var zu = eCam(clamp01((t - T.zoom0) / (T.zoom1 - T.zoom0))), zk = lerp(zIn, 1, zu);
      zoom.style.transform = zu >= 1 ? 'none' : 'translate(' + C[0] + 'px,' + C[1] + 'px) scale(' + zk.toFixed(5) + ') translate(' + (-C[0]) + 'px,' + (-C[1]) + 'px)';

      // CÔMODOS, PORTAS E PINGS
      var P = [];
      for (n = 0; n < ROOMS.length; n++) P.push(pose(n, t));
      for (n = 0; n < ROOMS.length; n++) {
        var p = P[n], R = ROOMS[n];
        rooms[n].setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ') rotate(' + p.ang.toFixed(2) + ') scale(' + Math.max(p.sc, 0.001).toFixed(4) + ')');
        rooms[n].setAttribute('opacity', p.op.toFixed(3));
        rooms[n].querySelector('.cb').setAttribute('stroke', mix(cE, cA, clamp01(p.lit)));
        var pr = clamp01((t - R.land) / 0.3);
        pings[n].setAttribute('x', (R.cx - R.w / 2).toFixed(2)); pings[n].setAttribute('y', (R.cy - CH / 2).toFixed(2));
        pings[n].setAttribute('width', R.w); pings[n].setAttribute('height', CH);
        pings[n].setAttribute('transform', 'translate(' + R.cx + ' ' + R.cy + ') scale(' + lerp(1, 1.1, eOut(pr)).toFixed(3) + ') translate(' + (-R.cx) + ' ' + (-R.cy) + ')');
        pings[n].setAttribute('opacity', (t >= R.land && pr < 1 ? 0.5 * (1 - pr) * (1 - p.au) : 0).toFixed(3));
      }
      for (n = 0; n < DOORS.length; n++) {
        dd = DOORS[n];
        var d0 = Math.max(ROOMS[dd[0]].land, ROOMS[dd[1]].land) + 0.04, du = eOut(clamp01((t - d0) / 0.18)), half = 17 * du;
        var gone = 1 - smooth(T.abs - 0.02, T.abs + 0.06, t);
        doors[n].setAttribute('x1', (dd[2] - (dd[4] ? 0 : half)).toFixed(2)); doors[n].setAttribute('x2', (dd[2] + (dd[4] ? 0 : half)).toFixed(2));
        doors[n].setAttribute('y1', (dd[3] - (dd[4] ? half : 0)).toFixed(2)); doors[n].setAttribute('y2', (dd[3] + (dd[4] ? half : 0)).toFixed(2));
        doors[n].setAttribute('opacity', (du > 0 ? gone : 0).toFixed(3));
      }

      // SÍMBOLO (contorno que entra enquanto a câmera recua; quadrado âmbar sob os cômodos absorvidos; depois encolhe até o "o")
      var ec = eCam(clamp01((t - T.cam0) / (T.cam1 - T.cam0)));
      // Outline growth: the inner edge (the hole around the plan) stays fixed and the stroke thickens outward from it to the official width
      var clack = t >= T.hit ? -0.035 * Math.exp(-(t - T.hit) * 11) : 0;   // short inward squeeze at the clack
      var kk = lerp(KBIG, 1, ec) * (1 + clack);
      if (ec >= 1) kk = 1;                                                 // exact landing: scale 1, no residue
      var gu = eOut(clamp01((t - T.ring0) / (T.ring1 - T.ring0))), sw = rg.sw * gu, hwIn = (rg.w - rg.sw) / 2, hhIn = (rg.h - rg.sw) / 2;
      // Safe area: the hole stays where it was; only the stroke is held so its outer edge (screen scale kk * zk) stays SAFE px from the top and bottom
      sw = Math.max(0, Math.min(sw, (H / 2 - SAFE) / (kk * zk) - hhIn));
      ringEl.setAttribute('x', (ocx - hwIn - sw / 2).toFixed(3)); ringEl.setAttribute('y', (ocy - hhIn - sw / 2).toFixed(3));
      ringEl.setAttribute('width', (2 * hwIn + sw).toFixed(3)); ringEl.setAttribute('height', (2 * hhIn + sw).toFixed(3));
      ringEl.setAttribute('rx', (rg.rx - rg.sw / 2 + sw / 2).toFixed(3)); ringEl.setAttribute('stroke-width', sw.toFixed(3));
      var sx = lerp(C[0], P1[0], ec), sy = lerp(C[1], P1[1], ec);
      sym.setAttribute('transform', 'translate(' + sx.toFixed(3) + ' ' + sy.toFixed(3) + ') scale(' + kk.toFixed(5) + ') translate(' + (-ocx) + ' ' + (-ocy) + ')');
      sym.setAttribute('opacity', t >= T.ring0 ? 1 : 0);
      var su = smooth(T.sq0, T.sq1, t);
      sqEl.setAttribute('opacity', su.toFixed(3));
      sqEl.setAttribute('transform', 'translate(' + ocx + ' ' + ocy + ') scale(' + lerp(0.88, 1, su).toFixed(4) + ') translate(' + (-ocx) + ' ' + (-ocy) + ')');

      // CLACK (clarão âmbar curto no centro e uma onda no contorno do símbolo)
      var h0 = T.hit - 0.04, bu = smooth(h0, h0 + 0.14, t) * (1 - smooth(h0 + 0.2, h0 + 0.5, t));
      var bx = lerp(C[0], P1[0], ec), by = lerp(C[1], P1[1], ec), bs = lerp(KBIG, 1, ec);
      burst.setAttribute('cx', bx.toFixed(2)); burst.setAttribute('cy', by.toFixed(2));
      burst.setAttribute('r', (lerp(0.45, 1, eOut(clamp01((t - h0) / 0.45))) * 80 * bs + 40).toFixed(2));
      burst.setAttribute('opacity', bu.toFixed(3));
      var wu = clamp01((t - T.hit) / 0.45), ow = rg.w + rg.sw, oh = rg.h + rg.sw, grow = lerp(1 / 1.12, 1, eOut(wu));   // 1.0.1: same 12% expansion, ending on the outline instead of passing it (keeps the safe margin)
      wave.setAttribute('x', (bx - ow * bs * grow / 2).toFixed(2)); wave.setAttribute('y', (by - oh * bs * grow / 2).toFixed(2));
      wave.setAttribute('width', (ow * bs * grow).toFixed(2)); wave.setAttribute('height', (oh * bs * grow).toFixed(2));
      wave.setAttribute('rx', ((rg.rx + rg.sw / 2) * bs * grow).toFixed(2));
      wave.setAttribute('opacity', (t >= T.hit && wu < 1 ? 0.6 * (1 - wu) : 0).toFixed(3));

      // PASSAGEM PARA O LOGO OFICIAL (wordmark abre dos dois lados do símbolo, selo sobe, palavra de papel)
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
    return {render: render, layout: {left: left, top: top, w: w, h: h, P1: P1, ev: ev, ring: rg, sq: sq}, scene: svg, T: T, rooms: ROOMS};
  }

  // Instant the closing frame is complete (the bar under the logo is drawn)
  export const SETTLED = T0.role1;
