/* eslint-disable @typescript-eslint/no-unused-vars -- ported from the accepted round as is: its unused leftovers stay, so the file reads against the round line by line */
// COREOGRAFIA DA ABERTURA CONCEITUAL DO TUNER, VERSÃO 1.0.0 (sinais de cinco canais fora de sintonia que entram em fase nas ondas do "r")
// Same arc as the approved openings (magneto-intro 1.3.0, domus-intro 1.0.1, relloo-intro 1.0.0), with the Tuner idea: while the camera
// is close, five channel chips (Mensagem, Voz, Chat do site, E-mail, Comunidade) arrive one by one; each one sends a message bubble along
// its own wave (own wavelength, amplitude and phase, "out of tune") to a common line, which connects to a hub. The camera pulls back
// and reveals the dial: the two wave arcs of the Tuner sign, large, with a graduated track between them and a needle on the hub. The
// needle swings and settles on zero while the five waves slide into the same wavelength and phase. Clack: short amber flash, the arcs
// turn amber and everything else is absorbed by shrinking and fading on the same 0.16 s as the pull (no pop). Then the arcs shrink
// onto the exact position of the waves of the "r" and the official endorsed logo takes over (wordmark opens to the left, seal, tagline).
// The sign is never redrawn by hand: both arcs are read at run time from the official logo (tuner-logo-on-dark.svg), so the landing
// follows the brand version. The dial group is always O-centred in logo units, so scale 1 plus the logo offset is the exact logo pose.
// Pure function of time: one paused GSAP tween drives render(t) through a setter, no clock and no random, so seek is exact.
// Expected DOM inside the root: img.wm (data-brand-src="welabs/tuner-endorsed-on-dark.svg"), div.role (span.bar, span.word).
// Usage: TunerIntro.build({root, duration, T, safe}) -> paused timeline (tl.tuner = instance); TunerIntro.mount(root, cfg) -> {render, layout, T}.
//
// ABERTURA DO TUNER NO SITE
// Port of the accepted choreography 1.0.0 for the site (components/intro/intro-run.ts): light palette (kit.js), eases
// without GSAP, the logo text and the endorsed box passed by the player (cfg.logo, cfg.box), `.wm` the player's wrapper
// of the light endorsed logo, no `build`. Motion, geometry and times are those of the round.
// v3 (F1): the chips name the category of each channel, never its brand (the copy rules: a brand only inside brackets,
// as an example of its category, as "Comunidades (Discord)" on the product page); the brand-like glyph of the community
// chip is a neutral "#" channel mark. Motion, geometry and times are unchanged.
import { parseEase, LIGHT, CLOSE_UP } from './kit.js';

  var W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg', AMBER = '#FFB020', PANEL2 = LIGHT.card, EDGE = LIGHT.edge, SLATE = LIGHT.slate, DIALBG = LIGHT.dial, INK = LIGHT.ink;
  var GAP = 96, ROLE_H = 56;        // layout gap between logo and tagline, tagline height
  var WORD_CUT = 300;               // logo-box y (px) between the wordmark and the "by welabs" seal
  var SEAL_W = 400;                 // width (px at scale 1) of the seal region swept by the seal wipe
  var KBIG = 4;                     // scale of the dial (the two arcs) before it shrinks onto the logo
  var ZIN = CLOSE_UP;               // close-up factor of the focus camera (v4: the contained one of kit.js, was 1.55)
  var WC0 = [680, 540];             // world point the focus camera looks at (the group of chips, lines and hub)
  var CY = 540, PITCH = 92;         // vertical centre of the five rows and the distance between rows
  var X0 = 355, CHIP_W = 224, CHIP_H = 46;          // left edge of the chips and chip size
  var TX0 = X0 + CHIP_W + 14, TLEN = 330, BUSX = TX0 + TLEN;   // wave start, wave length, x of the common line
  var HUB = [BUSX + 60, CY];        // hub where the common line ends and the needle pivots (centre of the dial)
  var BUB_W = 72, BUB_H = 28, BUB_UP = 36;          // message bubble size and how far it floats above its wave
  var FLY_C = 0.4;                  // flight (s) of a chip
  var NEEDLE = 42, TICK0 = 92, TICK1 = 107;         // needle length and radial span of the graduated track (logo units, gap of the arcs is 85.7-113.7)
  var OM = 2 * Math.PI * 0.9;       // common angular speed of the waves (rad/s)
  // Detuned waves: wavelength (px), amplitude (px) and phase offset (rad) per row; tuned waves share the common values
  var LAM = [150, 62, 112, 52, 84], AMP = [7, 17, 11, 19, 13], PHI = [0, 2.1, 4.0, 1.0, 5.2], LAM_C = 84, AMP_C = 13;

  // CRONOMETRAGEM (segundos; todos os tempos de fase moram aqui e cada peça pode sobrescrever)
  var T0 = {
    rowStep: 0.12, bubble: 0.04, travel: 0.5,         // a chip arrives from frame 0, one more every 0.12 s; its bubble leaves right after docking
    zoom0: 1.6, zoom1: 2.2,                           // camera pull-back window
    dial0: 1.62, dial1: 2.2, tune0: 1.78,             // the dial grows while the camera leaves; the waves start to come into phase
    abs: 2.14, absDur: 0.16, hit: 2.3,                // absorption (ends at the clack) and the clack
    cam0: 2.45, cam1: 3.25,                           // the arcs shrink onto the waves of the "r"
    wipe0: 3.25, wipe1: 3.7, seal0: 3.65, seal1: 3.95, role0: 3.75, role1: 4.05
  };

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, t) { var u = clamp01((t - a) / (b - a)); return u * u * (3 - 2 * u); }
  function ease(name) { var f = parseEase(name); return function (u) { return u <= 0 ? 0 : u >= 1 ? 1 : f(u); }; }
  var eFly = ease('power3.out'), eIn = ease('power2.in'), eOut = ease('power3.out'), eCam = ease('power3.inOut'), eIO = ease('power2.inOut');
  var eWipe = ease('power3.out'), eSeal = ease('power3.out'), eRole = ease('power3.out');
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var cA = rgb(AMBER), cE = rgb(EDGE), cS = rgb(SLATE), cD = rgb(DIALBG);
  function mix(a, b, u) { return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(lerp(a[i], b[i], u)); }).join(',') + ')'; }

  // GEOMETRIA OFICIAL (lida do SVG da marca; a peça não carrega cópia do desenho)
  // The text of the light logo and the endorsed box come from the player (cfg.logo, cfg.box)
  function readLogo(txt, evBox) {
    var re = /<path d="(M(-?[\d.]+) (-?[\d.]+)A([\d.]+) ([\d.]+) 0 0 1 (-?[\d.]+) (-?[\d.]+))" fill="none" stroke="(#[0-9A-Fa-f]{6})" stroke-width="([\d.]+)" stroke-linecap="round"\/>/g, m, arcs = [];
    while ((m = re.exec(txt))) arcs.push({d: m[1], x0: +m[2], y0: +m[3], r: +m[4], x1: +m[6], y1: +m[7], stroke: m[8], sw: +m[9]});
    if (arcs.length !== 2) throw new Error('tuner-intro: unexpected tuner logo markup');
    arcs.sort(function (a, b) { return a.r - b.r; });
    // Centre of each arc (endpoints share x, the arc bulges to +x, so the centre sits to the left of the chord)
    arcs.forEach(function (a) {
      var half = Math.abs(a.y1 - a.y0) / 2;
      a.cx = a.x0 - Math.sqrt(a.r * a.r - half * half); a.cy = (a.y0 + a.y1) / 2; a.half = half;
    });
    if (Math.abs(arcs[0].cx - arcs[1].cx) > 0.1 || Math.abs(arcs[0].cy - arcs[1].cy) > 0.1) throw new Error('tuner-intro: the two waves of the sign are not concentric');
    var inner = arcs[0], outer = arcs[1];
    return {
      inner: inner, outer: outer, ox: (inner.cx + outer.cx) / 2, oy: (inner.cy + outer.cy) / 2,
      sw: inner.sw, ev: evBox,
      bandL: Math.min(inner.x0, outer.x0) - inner.sw / 2 - 2    // left edge of the sign in logo units (the letters end before it)
    };
  }

  // CANAIS E MENSAGENS (visual dos filmes do Tuner: chip de canal, bolha de mensagem; rótulos curtos)
  var ICON = {
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/>',
    voice: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    site: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/>',
    community: '<path d="M9.5 4L7.5 20M16.5 4l-2 16M4.5 9h16M3.5 15h16"/>'
  };
  var ROWS = [
    {label: 'Mensagem', icon: 'chat'}, {label: 'Voz', icon: 'voice'}, {label: 'Chat do site', icon: 'site'},
    {label: 'E-mail', icon: 'mail'}, {label: 'Comunidade', icon: 'community'}
  ];

  var uid = 0;
  export function mount(root, over) {
    var T = {}, k0;
    for (k0 in T0) T[k0] = T0[k0];
    for (k0 in ((over && over.T) || {})) T[k0] = over.T[k0];
    var SAFE = (over && over.safe != null) ? over.safe : 100;   // safe margin (px) for the dial while the camera is close
    var lg = readLogo(over.logo, over.box), ev = lg.ev, id = ++uid;
    var w = ev[2], h = ev[3];
    var left = Math.round((W - w) / 2), top = Math.round((H - (h + GAP + ROLE_H)) / 2);
    var ox = lg.ox, oy = lg.oy;
    var LAND = [left + ox - ev[0], top + oy - ev[1]];          // screen position of the arc centre in the final logo (scale 1)
    var wmEl = root.querySelector('.wm'), role = root.querySelector('.role');
    var bar = role.querySelector('.bar'), word = role.querySelector('.word');
    wmEl.style.cssText = 'position:absolute;display:block;left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;visibility:hidden';
    role.style.top = (top + h + GAP) + 'px';
    var reachX = lg.outer.r + lg.sw / 2, reachY = lg.outer.half + lg.sw / 2;   // how far the dial reaches from its centre (logo units)
    var arcFill = lg.inner.stroke, cArc = rgb(arcFill);

    // CENA (um SVG em pixels de tela: linhas e canais em pixels do mundo; o dial em unidades do logo, centrado no sinal)
    var zoom = document.createElement('div');
    zoom.className = 'zoom';
    zoom.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;transform-origin:0 0';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'scene'); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('data-layout-allow-overflow', ''); // the zoomed scene is larger than the frame on purpose
    svg.style.cssText = 'position:absolute;left:0;top:0;font-family:Inter,sans-serif';
    var s = '<defs><radialGradient id="gl' + id + '"><stop offset="0" stop-color="' + AMBER + '" stop-opacity=".95"/><stop offset=".45" stop-color="' + AMBER + '" stop-opacity=".35"/><stop offset="1" stop-color="' + AMBER + '" stop-opacity="0"/></radialGradient></defs>';
    var j, n;
    // Back to front: waves, common line, feeder, hub, dial, chips, bubbles, pings
    for (j = 0; j < ROWS.length; j++) s += '<path class="wave" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>';
    s += '<line class="bus" stroke="' + AMBER + '" stroke-width="5" stroke-linecap="round" opacity="0"/><line class="feed" stroke="' + AMBER + '" stroke-width="5" stroke-linecap="round" opacity="0"/>';
    for (j = 0; j < ROWS.length; j++) s += '<circle class="node" r="9" fill="' + EDGE + '" opacity="0"/>';
    s += '<g class="hub" opacity="0"><circle class="hr" r="22" fill="none" stroke="' + EDGE + '" stroke-width="3"/><circle r="13" fill="' + AMBER + '"/></g>';
    // The dial: concentric arcs from the official logo, graduated track in their gap, needle on the centre
    s += '<g class="dial" opacity="0"><path class="a1" d="' + lg.inner.d + '" fill="none" stroke="' + DIALBG + '" stroke-width="' + lg.inner.sw + '" stroke-linecap="round"/>' +
      '<path class="a2" d="' + lg.outer.d + '" fill="none" stroke="' + DIALBG + '" stroke-width="' + lg.outer.sw + '" stroke-linecap="round"/><g class="track">';
    var TICKS = [];
    for (j = -5; j <= 5; j++) {
      var ta = j * 8 * Math.PI / 180, r0 = j === 0 ? TICK0 - 3 : TICK0, r1 = j === 0 ? TICK1 + 3 : TICK1;
      TICKS.push(j * 8);
      s += '<line class="tick" x1="' + (ox + r0 * Math.cos(ta)).toFixed(3) + '" y1="' + (oy + r0 * Math.sin(ta)).toFixed(3) + '" x2="' + (ox + r1 * Math.cos(ta)).toFixed(3) + '" y2="' + (oy + r1 * Math.sin(ta)).toFixed(3) + '" stroke="' + SLATE + '" stroke-width="1.3" stroke-linecap="round"/>';
    }
    s += '</g><line class="needle" x1="' + ox + '" y1="' + oy + '" x2="' + (ox + NEEDLE) + '" y2="' + oy + '" stroke="' + AMBER + '" stroke-width="1.6" stroke-linecap="round"/></g>';
    for (j = 0; j < ROWS.length; j++) {
      var R = ROWS[j];
      s += '<g class="chip" opacity="0"><rect class="cc" x="' + (-CHIP_W / 2) + '" y="' + (-CHIP_H / 2) + '" width="' + CHIP_W + '" height="' + CHIP_H + '" rx="23" fill="' + PANEL2 + '" stroke="' + AMBER + '" stroke-width="2.5"/>' +
        '<g transform="translate(' + (-CHIP_W / 2 + 14) + ' -12)" fill="none" stroke="' + AMBER + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + ICON[R.icon] + '</g>' +
        '<text x="' + (-CHIP_W / 2 + 50) + '" y="8.5" font-size="24" font-weight="600" fill="' + INK + '">' + R.label + '</text></g>';
    }
    for (j = 0; j < ROWS.length; j++) {
      s += '<g class="bub" opacity="0"><rect x="' + (-BUB_W / 2) + '" y="' + (-BUB_H / 2) + '" width="' + BUB_W + '" height="' + BUB_H + '" rx="14" fill="' + PANEL2 + '" stroke="' + AMBER + '" stroke-width="2"/>' +
        '<line x1="-22" x2="22" y1="-4" y2="-4" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><line x1="-22" x2="8" y1="5" y2="5" stroke="' + SLATE + '" stroke-width="3" stroke-linecap="round"/></g>';
    }
    for (j = 0; j < ROWS.length; j++) s += '<rect class="ping" fill="none" stroke="' + AMBER + '" stroke-width="2" rx="26" opacity="0"/>';
    s += '<circle class="burst" r="100" fill="url(#gl' + id + ')" opacity="0"/>';
    svg.innerHTML = s;
    zoom.appendChild(svg);
    root.insertBefore(zoom, root.firstChild);
    var q = function (c) { return svg.querySelector('.' + c); };
    var qa = function (c) { return svg.querySelectorAll('.' + c); };
    var waves = qa('wave'), nodes = qa('node'), chips = qa('chip'), bubs = qa('bub'), pings = qa('ping');
    var bus = q('bus'), feed = q('feed'), hub = q('hub'), hr = q('hr'), dial = q('dial'), burst = q('burst');
    var a1 = q('a1'), a2 = q('a2'), needle = q('needle'), ticks = qa('tick');

    // Timing and pose of every row (a chip arrives, docks, then releases its bubble along its own wave)
    var rows = ROWS.map(function (r, i) {
      var carr = i * T.rowStep, cland = carr + FLY_C * 0.8, bd = cland + T.bubble;
      return {i: i, y: CY + (i - 2) * PITCH, carr: carr, cland: cland, bd: bd, ba: bd + T.travel, off: [-80, (i - 2) * 24]};
    });
    var state = {dial: null};

    // POSE DE UM OBJETO QUE VOA (linha que desacelera até o encaixe e assenta com leve oscilação)
    function fly(t, arr, dur, off) {
      var u = clamp01((t - arr) / dur), f = eFly(u), len = Math.sqrt(off[0] * off[0] + off[1] * off[1]) || 1;
      var x = off[0] * (1 - f), y = off[1] * (1 - f), ls = t - (arr + dur * 0.8);
      if (ls > 0) { var ov = 4 * Math.exp(-ls * 11) * Math.sin(ls * 34); x -= (off[0] / len) * ov; y -= (off[1] / len) * ov; }
      return {x: x, y: y, f: f};
    }
    // Camera: close on the group, then back to the full frame; the world focus point drifts to the frame centre
    function cam(t) {
      var u = eCam(clamp01((t - T.zoom0) / (T.zoom1 - T.zoom0)));
      return {u: u, k: lerp(ZIN, 1, u), wx: lerp(WC0[0], W / 2, u), wy: lerp(WC0[1], H / 2, u)};
    }

    function render(t) {
      var i, k, au = clamp01((t - T.abs) / T.absDur), fade = 1 - smooth(0, 1, au), ea = eIn(au);
      var cm = cam(t);
      zoom.style.transform = cm.u >= 1 ? 'none' : 'translate(' + (W / 2) + 'px,' + (H / 2) + 'px) scale(' + cm.k.toFixed(5) + ') translate(' + (-cm.wx).toFixed(3) + 'px,' + (-cm.wy).toFixed(3) + 'px)';

      // SINTONIA (d = 1 fora de sintonia, 0 em fase; o ponteiro oscila e assenta em zero no clack)
      var tu = smooth(T.tune0, T.hit - 0.02, t), d = 1 - tu;
      var sw = smooth(T.dial0 + 0.1, T.hit, t);
      var th = 34 * Math.pow(1 - sw, 2) * Math.cos(2 * Math.PI * 1.25 * Math.max(0, t - (T.dial0 + 0.1)));   // needle angle (deg)

      // CANAIS, ONDAS E MENSAGENS (cada canal manda a sua bolha por uma onda própria até a linha comum)
      var arrived = 0, bottom = rows[0].y;
      for (i = 0; i < rows.length; i++) {
        var r = rows[i], pc = fly(t, r.carr, FLY_C, r.off), cls = t - r.cland;
        // absorption: shrink in place, drift a little toward the hub, fade
        var x = X0 + CHIP_W / 2 + pc.x, y = r.y + pc.y;
        x = lerp(x, HUB[0], 0.3 * ea); y = lerp(y, CY, 0.3 * ea);
        var sc = lerp(0.84, 1, pc.f) * (1 - 0.85 * ea);
        var op = (i === 0 ? 1 : smooth(r.carr, r.carr + 0.05, t)) * fade;
        chips[i].setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') scale(' + Math.max(sc, 0.001).toFixed(4) + ')');
        chips[i].setAttribute('opacity', op.toFixed(3));
        chips[i].querySelector('.cc').setAttribute('stroke', mix(cE, cA, clamp01(Math.max(0.35 + 0.65 * smooth(r.cland - 0.1, r.cland, t), ea))));
        // ping when the chip docks
        var pu = clamp01(cls / 0.3);
        pings[i].setAttribute('x', (X0 - 2).toFixed(2)); pings[i].setAttribute('y', (r.y - CHIP_H / 2 - 2).toFixed(2));
        pings[i].setAttribute('width', CHIP_W + 4); pings[i].setAttribute('height', CHIP_H + 4);
        pings[i].setAttribute('transform', 'translate(' + (X0 + CHIP_W / 2) + ' ' + r.y + ') scale(' + lerp(1, 1.12, eOut(pu)).toFixed(3) + ') translate(' + (-(X0 + CHIP_W / 2)) + ' ' + (-r.y) + ')');
        pings[i].setAttribute('opacity', (cls >= 0 && pu < 1 ? 0.5 * (1 - pu) * (1 - au) : 0).toFixed(3));

        // bubble: floats above the wave and slides to the common line; the wave is drawn behind it
        var bu = eIO(clamp01((t - r.bd) / T.travel)), bx0 = TX0 + BUB_W / 2 + 4, bx1 = BUSX - BUB_W / 2 - 14;
        var bx = lerp(bx0, bx1, bu), by = r.y - BUB_UP;
        var bsc = (1 - smooth(r.ba - 0.08, r.ba + 0.02, t)) * (1 - 0.85 * ea);
        var bop = smooth(r.bd - 0.03, r.bd + 0.03, t) * (t >= r.ba + 0.02 ? 0 : 1) * fade;
        bx = lerp(bx, HUB[0], 0.3 * ea); by = lerp(by, CY, 0.3 * ea);
        bubs[i].setAttribute('transform', 'translate(' + bx.toFixed(2) + ' ' + by.toFixed(2) + ') scale(' + Math.max(bsc, 0.001).toFixed(4) + ')');
        bubs[i].setAttribute('opacity', bop.toFixed(3));

        // wave: own wavelength/amplitude/phase while out of tune, the common ones once tuned; drawn up to the bubble, then to the line
        var xEnd = TX0 + TLEN * (t >= r.ba ? 1 : bu), lam = lerp(LAM_C, LAM[i], d), amp = lerp(AMP_C, AMP[i], d), kw = 2 * Math.PI / lam, ph = PHI[i] * d, pts = '', x2;
        for (x2 = TX0; x2 < xEnd + 5; x2 += 6) {
          var xx = Math.min(x2, xEnd), uu = (xx - TX0) / TLEN, env = smooth(0, 0.12, uu) * smooth(1, 0.88, uu);
          pts += (pts ? 'L' : 'M') + xx.toFixed(1) + ' ' + (r.y + amp * env * Math.sin(kw * (xx - TX0) - OM * t + ph)).toFixed(2);
          if (xx >= xEnd) break;
        }
        waves[i].setAttribute('d', pts);
        waves[i].setAttribute('stroke', mix(cS, cA, 1 - d));
        waves[i].setAttribute('opacity', ((t >= r.bd ? 1 : 0) * fade).toFixed(3));

        // node on the common line lights when the bubble arrives
        var nu = smooth(r.ba - 0.05, r.ba + 0.05, t);
        nodes[i].setAttribute('cx', BUSX); nodes[i].setAttribute('cy', r.y);
        nodes[i].setAttribute('fill', mix(cE, cA, nu));
        nodes[i].setAttribute('r', (9 + 4 * Math.sin(Math.PI * clamp01((t - r.ba) / 0.2))).toFixed(2));
        nodes[i].setAttribute('opacity', ((t >= r.bd ? 1 : 0) * fade).toFixed(3));
        if (i > 0) bottom += (r.y - rows[i - 1].y) * smooth(r.ba - 0.18, r.ba, t);
        if (t >= r.ba) arrived++;
      }
      // common line grows with the arrivals; the feeder and the hub close the chain once the last bubble is in
      var busOn = t >= rows[0].ba - 0.1 ? fade : 0, last = rows[rows.length - 1].ba;
      bus.setAttribute('x1', BUSX); bus.setAttribute('x2', BUSX); bus.setAttribute('y1', rows[0].y); bus.setAttribute('y2', bottom.toFixed(2));
      bus.setAttribute('opacity', busOn.toFixed(3));
      var fu = eOut(clamp01((t - last) / 0.2));
      feed.setAttribute('x1', BUSX); feed.setAttribute('y1', CY); feed.setAttribute('y2', CY); feed.setAttribute('x2', (BUSX + (HUB[0] - BUSX) * fu).toFixed(2));
      feed.setAttribute('opacity', ((fu > 0 ? 1 : 0) * fade).toFixed(3));
      var hu = eOut(clamp01((t - last) / 0.25));
      hub.setAttribute('transform', 'translate(' + HUB[0] + ' ' + HUB[1] + ') scale(' + Math.max(hu * (1 - 0.85 * ea), 0.001).toFixed(4) + ')');
      hub.setAttribute('opacity', ((hu > 0 ? 1 : 0) * fade).toFixed(3));
      hr.setAttribute('stroke', mix(cE, cA, clamp01(1 - d)));

      // DIAL (os dois arcos do sinal; cresce enquanto a câmera recua, sem nunca sair da área segura; depois encolhe até o "r")
      var kt = lerp(1.4, KBIG, eOut(clamp01((t - T.dial0) / (T.dial1 - T.dial0))));
      var kx = (cm.wx + (W / 2 - SAFE) / cm.k - HUB[0]) / reachX, ky = (H / 2 - SAFE) / cm.k / reachY;
      var ec = eCam(clamp01((t - T.cam0) / (T.cam1 - T.cam0)));
      var clack = t >= T.hit ? -0.035 * Math.exp(-(t - T.hit) * 11) : 0;       // short inward squeeze at the clack
      var K = t < T.cam0 ? Math.min(kt, kx, ky) : lerp(KBIG, 1, ec) * (1 + clack);
      if (ec >= 1) K = 1;                                                      // exact landing: scale 1, no residue
      var px = lerp(HUB[0], LAND[0], ec), py = lerp(HUB[1], LAND[1], ec);
      dial.setAttribute('transform', 'translate(' + px.toFixed(3) + ' ' + py.toFixed(3) + ') scale(' + K.toFixed(5) + ') translate(' + (-ox).toFixed(3) + ' ' + (-oy).toFixed(3) + ')');
      dial.setAttribute('opacity', smooth(T.dial0, T.dial0 + 0.14, t).toFixed(3));
      var lock = smooth(T.hit - 0.04, T.hit + 0.06, t), ac = mix(cD, cArc, lock);
      a1.setAttribute('stroke', ac); a2.setAttribute('stroke', ac);
      // track and needle belong to the absorbed part
      var trackOp = (1 - smooth(0, 1, au)).toFixed(3);
      q('track').setAttribute('opacity', trackOp); needle.setAttribute('opacity', trackOp);
      var tr = th * Math.PI / 180;
      needle.setAttribute('x2', (ox + NEEDLE * Math.cos(tr)).toFixed(3)); needle.setAttribute('y2', (oy + NEEDLE * Math.sin(tr)).toFixed(3));
      for (i = 0; i < ticks.length; i++) {
        var hl = clamp01(1 - Math.abs(th - TICKS[i]) / 7);
        ticks[i].setAttribute('stroke', mix(cS, cA, Math.max(hl, i === 5 ? lock : 0)));
        ticks[i].setAttribute('stroke-width', (1.3 + 0.9 * hl).toFixed(3));
      }
      state.dial = {x0: px - (ox - (lg.inner.x0 - lg.inner.sw / 2)) * K, x1: px + reachX * K, y0: py - reachY * K, y1: py + reachY * K, K: K};

      // CLACK (clarão âmbar curto no meio dos dois arcos)
      var h0 = T.hit - 0.04, bu2 = smooth(h0, h0 + 0.14, t) * (1 - smooth(h0 + 0.2, h0 + 0.5, t));
      burst.setAttribute('cx', (px + (lg.inner.r + lg.outer.r) / 2 * K).toFixed(2)); burst.setAttribute('cy', py.toFixed(2));
      burst.setAttribute('r', (lerp(0.45, 1, eOut(clamp01((t - h0) / 0.45))) * 40 * K + 36).toFixed(2));
      burst.setAttribute('opacity', bu2.toFixed(3));

      // PASSAGEM PARA O LOGO OFICIAL (wordmark abre para a esquerda dos arcos, selo sobe, tagline entra)
      var wp = clamp01((t - T.wipe0) / (T.wipe1 - T.wipe0)), swapped = t >= T.wipe1;
      zoom.style.visibility = swapped ? 'hidden' : 'visible';
      var sl = eSeal(clamp01((t - T.seal0) / (T.seal1 - T.seal0)));
      wmEl.style.visibility = t < T.wipe0 ? 'hidden' : 'visible';
      if (t >= T.wipe0) {
        var e = eWipe(wp), xl = swapped ? 0 : lerp(lg.bandL, 0, e), xr = w, xs = SEAL_W * sl;
        if (swapped && sl >= 1) wmEl.style.clipPath = 'none';
        else wmEl.style.clipPath = 'polygon(' + [[xl, 0], [xr, 0], [xr, WORD_CUT], [xs, WORD_CUT], [xs, h], [0, h], [0, WORD_CUT], [xl, WORD_CUT]].map(function (v) { return v[0] + 'px ' + v[1] + 'px'; }).join(',') + ')';
      }
      var rr = eRole(clamp01((t - T.role0) / (T.role1 - T.role0)));
      bar.style.transform = 'scaleX(' + rr + ')';
      word.style.opacity = rr; word.style.transform = 'translateY(' + ((1 - rr) * 14) + 'px)';
    }
    render(0);
    return {render: render, layout: {left: left, top: top, w: w, h: h, LAND: LAND, ev: ev, lg: lg, HUB: HUB}, scene: svg, T: T, state: state};
  }

  // Instant the closing frame is complete (the bar under the logo is drawn)
  export const SETTLED = T0.role1;
