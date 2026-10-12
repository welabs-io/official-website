// COREOGRAFIA DA ABERTURA CONCEITUAL DO RELLOO, VERSÃO 1.0.1 (fichas e conversas que se encaixam nos dois "o" sobrepostos do sinal)
// 1.0.1: the connector between the two cards of a stack is drawn after the cards (it was hidden under their edges and read as a stray hourglass); timing and motion are unchanged.
// Same arc as the approved openings (magneto-intro 1.3.0, domus-intro 1.0.1), with the Relloo idea: while the camera is close, four
// contact cards (people) arrive in two groups and each message chip (WhatsApp, voice, site chat, e-mail) finds ITS card and docks into
// it; the card lights up with a short history line. The camera pulls back and reveals the two big "o" rings of the Relloo sign, one
// around each group (graphite/white on the left, amber on the right). The rings slide together and overlap by exactly one stroke
// (clack, short amber flash, cards absorbed by shrinking and fading on the same 0.16 s as the pull, no pop). Then the pair shrinks
// onto the exact position of the two "o" of "relloo", the official endorsed logo takes over (wordmark opens to the left, seal, tagline).
// The sign is never redrawn by hand: both rings are read at run time from the official logo (relloo-logo-on-dark.svg), so the landing
// follows the brand version. White "o" on top, amber "o" below, overlap of one stroke (brand 1.3.0 rule).
// Pure function of time: one paused GSAP tween drives render(t) through a setter, no clock and no random, so seek is exact.
// Expected DOM inside the root: img.wm (data-brand-src="welabs/relloo-endorsed-on-dark.svg"), div.role (span.bar, span.word).
// Usage: RellooIntro.build({root, duration, T, safe}) -> paused timeline (tl.relloo = instance); RellooIntro.mount(root, cfg) -> {render, layout, T}.
(function () {
  var W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg', AMBER = '#FFB020', PANEL = '#181B22', PANEL2 = '#232732', EDGE = '#373C48', BG = '#10141C';
  var GAP = 96, ROLE_H = 56;        // layout gap between logo and tagline, tagline height
  var WORD_CUT = 300;               // logo-box y (px) between the wordmark and the "by welabs" seal
  var SEAL_W = 400;                 // width (px at scale 1) of the seal region swept by the seal wipe
  var KBIG = 5.1;                   // scale of the rings while the camera pulls back (outer ring 791 px wide, 106 px safe at the top and bottom)
  var C = [960, 540];               // centre of the pair on screen before it shrinks
  var RING_GAP = 16;                // gap (px) between the two big rings before they slide together
  var CARD_W = 272, CARD_H = 140, CARD_GAP = 12;   // contact card and the gap inside a stack (width keeps the 1.55x camera 96 px inside the frame, pings included)
  var CHIP_W = 206, CHIP_H = 40;    // channel chip (message bubble) docked in a card
  var FLY_C = 0.42, FLY_M = 0.4;    // flight (s) of a card and of a chip

  // CRONOMETRAGEM (segundos; todos os tempos de fase moram aqui e cada peça pode sobrescrever)
  var T0 = {
    cardStep: 0.12, chip0: 0.3, chipStep: 0.12,       // cards arrive from frame 0, one more every 0.12 s; chips follow
    zoom0: 1.6, zoom1: 2.2, zIn: 1.55,                // camera pull-back window and the close-up factor
    ring0: 1.5, ring1: 2.1,                           // the rings grow outward from the groups while the camera leaves
    slide0: 1.92,                                     // rings start to slide together (ends at the clack)
    abs: 2.14, absDur: 0.16, hit: 2.3,                // absorption (ends at the clack) and the clack
    cam0: 2.45, cam1: 3.25,                           // pair shrinks onto the two "o"
    wipe0: 3.25, wipe1: 3.7, seal0: 3.65, seal1: 3.95, role0: 3.75, role1: 4.05
  };

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, t) { var u = clamp01((t - a) / (b - a)); return u * u * (3 - 2 * u); }
  function ease(name) { var f = gsap.parseEase(name); return function (u) { return u <= 0 ? 0 : u >= 1 ? 1 : f(u); }; }
  var eFly = ease('power3.out'), eIn = ease('power2.in'), eOut = ease('power3.out'), eCam = ease('power3.inOut');
  var eWipe = ease('power3.out'), eSeal = ease('power3.out'), eRole = ease('power3.out');
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var cA = rgb(AMBER), cE = rgb(EDGE);
  function mix(a, b, u) { return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(lerp(a[i], b[i], u)); }).join(',') + ')'; }

  function get(url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.send();
    if (req.status !== 200) throw new Error('relloo-intro: HTTP ' + req.status + ' for ' + url);
    return req.responseText;
  }

  // GEOMETRIA OFICIAL (lida do SVG da marca; a peça não carrega cópia do desenho)
  var logoCache = null;
  function readLogo() {
    if (logoCache) return logoCache;
    var txt = get(window.BRAND.url('welabs', 'relloo-logo-on-dark.svg'));
    var re = /<path d="(M4\.80 135\.00C[^"]*)" fill="(#[0-9A-Fa-f]{6})" transform="translate\(([\d.]+) 0\)"\/>/g, m, os = [];
    while ((m = re.exec(txt))) os.push({d: m[1], fill: m[2], tx: +m[3]});
    if (os.length !== 2) throw new Error('relloo-intro: unexpected relloo logo markup');
    os.sort(function (a, b) { return a.tx - b.tx; });
    var parts = os[0].d.split('Z');                         // outer contour, then the hole
    var ev = /viewBox="([^"]+)"/.exec(get(window.BRAND.url('welabs', 'relloo-endorsed-on-dark.svg')));
    var box = function (sub) {
      var n = sub.match(/-?\d+(?:\.\d+)?/g).map(Number), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, i;
      for (i = 0; i < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]); }
      return {x0: x0, x1: x1, y0: y0, y1: y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, hw: (x1 - x0) / 2, hh: (y1 - y0) / 2};
    };
    logoCache = {
      white: {tx: os[0].tx, fill: os[0].fill}, amber: {tx: os[1].tx, fill: os[1].fill},
      outer: parts[0], hole: parts[1], ob: box(parts[0]), hb: box(parts[1]),
      step: os[1].tx - os[0].tx,                            // distance between the two "o" (outer width minus one stroke)
      ev: ev[1].split(/\s+/).map(Number)
    };
    return logoCache;
  }
  // Scales the outer contour about its centre (gx, gy) and keeps the hole: grows the stroke outward from the hole
  function ringPath(lg, gx, gy) {
    var cx = lg.ob.cx, cy = lg.ob.cy;
    var outer = lg.outer.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, function (s, x, y) {
      return (cx + (x - cx) * gx).toFixed(3) + ' ' + (cy + (y - cy) * gy).toFixed(3);
    });
    return outer + 'Z' + lg.hole + 'Z';
  }

  // FICHAS E CONVERSAS (visual dos filmes do Relloo: ficha de pessoa, bolha de canal; nomes e rótulos curtos, dados DEMO)
  var ICON = {
    whatsapp: '<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/>',
    voice: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    site: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/>'
  };
  // group 0 sits in the white ring (left), group 1 in the amber ring (right); slot 0 is the top card of a stack
  var CARDS = [
    {name: 'Ana', label: 'WhatsApp', icon: 'whatsapp', group: 0, slot: 0, skin: '#F2C6A8', body: '#FFB020'},
    {name: 'Carla', label: 'Chat do site', icon: 'site', group: 1, slot: 0, skin: '#C99A7A', body: '#8A8FA0'},
    {name: 'Bruno', label: 'Voz', icon: 'voice', group: 0, slot: 1, skin: '#E8B894', body: '#6F7A92'},
    {name: 'Davi', label: 'E-mail', icon: 'mail', group: 1, slot: 1, skin: '#B98A6A', body: '#5E6678'}
  ];

  var uid = 0;
  function mount(root, over) {
    var T = {}, k0;
    for (k0 in T0) T[k0] = T0[k0];
    for (k0 in ((over && over.T) || {})) T[k0] = over.T[k0];
    var zIn = T.zIn, SAFE = (over && over.safe != null) ? over.safe : 98;   // safe margin (px) for the rings
    var lg = readLogo(), ev = lg.ev, id = ++uid;
    var w = ev[2], h = ev[3];
    var left = Math.round((W - w) / 2), top = Math.round((H - (h + GAP + ROLE_H)) / 2);
    var ocx = lg.ob.cx, ocy = lg.ob.cy;                               // centre of one "o" in logo units
    var pairCx = lg.white.tx + ocx + lg.step / 2;                     // centre of the pair of "o" in logo units
    var P1 = [left + pairCx - ev[0], top + ocy - ev[1]];              // screen position of the pair centre in the final logo (scale 1)
    var wmEl = root.querySelector('img.wm'), role = root.querySelector('.role');
    var bar = role.querySelector('.bar'), word = role.querySelector('.word');
    wmEl.style.cssText = 'position:absolute;display:block;left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;visibility:hidden';
    role.style.top = (top + h + GAP) + 'px';

    // Wordmark side of the wipe: the letters "rell" end before the first "o" (logo units); the pair itself is the clip's start
    var bandL = lg.white.tx + lg.ob.x0 - 2;
    var RW = 2 * lg.ob.hw, SEP0 = RW * KBIG + RING_GAP, SEP1 = lg.step * KBIG;   // ring distance before and after the slide (px)
    var gx0 = lg.hb.hw / lg.ob.hw, gy0 = lg.hb.hh / lg.ob.hh;                   // outer/hole ratio: stroke is zero at these
    var DX = SEP0 / 2;                                                           // ring centre offset from C before the slide

    // CENA (um SVG em pixels de tela: anéis em unidades do logo, fichas e conversas em pixels do mundo)
    var zoom = document.createElement('div');
    zoom.className = 'zoom';
    zoom.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;transform-origin:0 0';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'scene'); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('data-layout-allow-overflow', ''); // cards and chips enter from outside the zoomed frame on purpose
    svg.style.cssText = 'position:absolute;left:0;top:0;font-family:Inter,sans-serif';
    var s = '<defs><radialGradient id="gl' + id + '"><stop offset="0" stop-color="' + AMBER + '" stop-opacity=".95"/><stop offset=".45" stop-color="' + AMBER + '" stop-opacity=".35"/><stop offset="1" stop-color="' + AMBER + '" stop-opacity="0"/></radialGradient></defs>';
    var j, g;
    // Rings first (behind the cards): amber below, white on top
    s += '<path class="ra" fill="' + lg.amber.fill + '" fill-rule="evenodd" opacity="0"/><path class="rw" fill="' + lg.white.fill + '" fill-rule="evenodd" opacity="0"/>';
    for (j = 0; j < CARDS.length; j++) s += '<rect class="ping" fill="none" stroke="' + AMBER + '" stroke-width="2" rx="22" opacity="0"/>';
    for (j = 0; j < CARDS.length; j++) {
      var D = CARDS[j], m = D.group ? -1 : 1, hw = CARD_W / 2, hh = CARD_H / 2;
      D.m = m;
      D.hx = (D.group ? 1 : -1) * DX;                                   // ring centre offset of the group, before the slide
      D.sy = (D.slot ? 1 : -1) * (hh + CARD_GAP / 2);                   // card centre offset from the ring centre
      D.arr = j * T.cardStep; D.land = D.arr + FLY_C * 0.8;
      D.carr = T.chip0 + j * T.chipStep; D.cland = D.carr + FLY_M * 0.8;
      D.dots = [0, 1, 2].map(function (k) { return D.cland + 0.06 + 0.1 * k; });
      D.off = [0, D.slot ? 120 : -120]; D.bow = D.group ? -26 : 26;     // cards come from above and below, chips from the inner side
      s += '<g class="card" opacity="0"><rect class="cb" x="' + (-hw) + '" y="' + (-hh) + '" width="' + CARD_W + '" height="' + CARD_H + '" rx="24" fill="' + PANEL + '" stroke="' + EDGE + '" stroke-width="3"/>' +
        '<g transform="translate(' + (m * -106) + ' -34)"><circle r="22" fill="' + PANEL2 + '"/><circle cx="0" cy="-5" r="8.5" fill="' + D.skin + '"/><path d="M-13 15c1.5-8.5 7.5-13 13-13s11.5 4.5 13 13z" fill="' + D.body + '"/></g>' +
        '<text x="' + (m * -76) + '" y="-25" text-anchor="' + (m > 0 ? 'start' : 'end') + '" font-size="26" font-weight="600" fill="#FFFFFF">' + D.name + '</text>' +
        '<line class="tl" x1="-116" x2="116" y1="55" y2="55" stroke="' + EDGE + '" stroke-width="4" stroke-linecap="round"/>' +
        '<line class="tf" x1="-116" x2="-116" y1="55" y2="55" stroke="' + AMBER + '" stroke-width="4" stroke-linecap="round"/>' +
        '<circle class="td" cx="-116" cy="55" r="7" fill="' + EDGE + '"/><circle class="td" cx="0" cy="55" r="7" fill="' + EDGE + '"/><circle class="td" cx="116" cy="55" r="7" fill="' + EDGE + '"/></g>';
    }
    // Connectors above the cards so their end dots sit on the card edges
    for (g = 0; g < 2; g++) s += '<g class="link" opacity="0"><line stroke="' + AMBER + '" stroke-width="6" stroke-linecap="round"/><circle r="6" fill="' + AMBER + '"/><circle r="6" fill="' + AMBER + '"/></g>';
    for (j = 0; j < CARDS.length; j++) {
      var E = CARDS[j], cxl = E.m > 0 ? -hw0() + 16 + CHIP_W / 2 : hw0() - 16 - CHIP_W / 2;   // chip slot centre inside the card
      E.cx = cxl; E.cy = 16;
      E.coff = [E.group ? -190 : 190, 0];
      s += '<g class="chip" opacity="0"><rect class="cc" x="' + (-CHIP_W / 2) + '" y="' + (-CHIP_H / 2) + '" width="' + CHIP_W + '" height="' + CHIP_H + '" rx="20" fill="' + PANEL2 + '" stroke="' + AMBER + '" stroke-width="2"/>' +
        '<g transform="translate(' + (-CHIP_W / 2 + 12) + ' -12) scale(1)" fill="none" stroke="' + AMBER + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + ICON[E.icon] + '</g>' +
        '<text x="' + (-CHIP_W / 2 + 44) + '" y="8.5" font-size="24" font-weight="600" fill="#FFFFFF">' + E.label + '</text></g>';
    }
    function hw0() { return CARD_W / 2; }
    s += '<circle class="burst" r="100" fill="url(#gl' + id + ')" opacity="0"/>';
    svg.innerHTML = s;
    zoom.appendChild(svg);
    root.insertBefore(zoom, root.firstChild);
    var q = function (c) { return svg.querySelector('.' + c); };
    var qa = function (c) { return svg.querySelectorAll('.' + c); };
    var ra = q('ra'), rw = q('rw'), burst = q('burst');
    var cards = qa('card'), chips = qa('chip'), pings = qa('ping'), links = qa('link');

    // POSE DE UM OBJETO QUE VOA (linha curva que desacelera até o encaixe, assenta com leve oscilação e, na absorção, encolhe no lugar)
    function fly(t, arr, dur, off, bow) {
      var u = clamp01((t - arr) / dur), f = eFly(u), len = Math.sqrt(off[0] * off[0] + off[1] * off[1]) || 1;
      var nx = -off[1] / len, ny = off[0] / len, b = bow * Math.sin(Math.PI * f) * (1 - f);
      var x = off[0] * (1 - f) + nx * b, y = off[1] * (1 - f) + ny * b;
      var ls = t - (arr + dur * 0.8);
      if (ls > 0) { var ov = 5 * Math.exp(-ls * 11) * Math.sin(ls * 34); x -= (off[0] / len) * ov; y -= (off[1] / len) * ov; }
      return {x: x, y: y, f: f, ls: ls};
    }

    function render(t) {
      var n, k, au = clamp01((t - T.abs) / T.absDur);
      // CÂMERA DE FOCO (aproximada sobre as fichas até zoom0; recua até zoom1 e termina em escala 1 exata, sem transform)
      var zu = eCam(clamp01((t - T.zoom0) / (T.zoom1 - T.zoom0))), zk = lerp(zIn, 1, zu);
      zoom.style.transform = zu >= 1 ? 'none' : 'translate(' + C[0] + 'px,' + C[1] + 'px) scale(' + zk.toFixed(5) + ') translate(' + (-C[0]) + 'px,' + (-C[1]) + 'px)';

      // PAR DE ANÉIS (afastados até o deslize; no clack a distância vale um traço de sobreposição; depois encolhem juntos até os dois "o")
      var su = eIn(clamp01((t - T.slide0) / (T.hit - T.slide0)));
      var ec = eCam(clamp01((t - T.cam0) / (T.cam1 - T.cam0)));
      var clack = t >= T.hit ? -0.035 * Math.exp(-(t - T.hit) * 11) : 0;   // short inward squeeze at the clack
      var kk = lerp(KBIG, 1, ec) * (1 + clack);
      if (ec >= 1) kk = 1;                                                 // exact landing: scale 1, no residue
      var pcx = lerp(C[0], P1[0], ec), pcy = lerp(C[1], P1[1], ec);
      var half = t >= T.hit ? lg.step * kk / 2 : lerp(SEP0, SEP1, su) / 2;   // half distance between the ring centres (px)
      var cw = [pcx - half, pcy], ca = [pcx + half, pcy];
      // Growth of the stroke: the hole stays fixed, the outer contour grows outward but never leaves the safe area while the camera is close
      var pr = eOut(clamp01((t - T.ring1 + (T.ring1 - T.ring0)) / (T.ring1 - T.ring0)));
      var hxO = lg.ob.hw * KBIG, hyO = lg.ob.hh * KBIG;
      var gxMax = Math.min((cw[0] - C[0] + (C[0] - SAFE) / zk) / hxO, (C[0] - ca[0] + (W - SAFE - C[0]) / zk) / hxO), gyMax = (C[1] - SAFE) / zk / hyO;
      var pMax = Math.min((gxMax - gx0) / (1 - gx0), (gyMax - gy0) / (1 - gy0));
      var p = ec > 0 || t >= T.hit ? 1 : Math.max(0, Math.min(pr, pMax));
      var gx = lerp(gx0, 1, p), gy = lerp(gy0, 1, p), dRing = ringPath(lg, gx, gy);
      var ringShow = p > 0.002 ? 1 : 0;
      ra.setAttribute('d', dRing); rw.setAttribute('d', dRing);
      ra.setAttribute('transform', 'translate(' + ca[0].toFixed(3) + ' ' + ca[1].toFixed(3) + ') scale(' + kk.toFixed(5) + ') translate(' + (-ocx) + ' ' + (-ocy) + ')');
      rw.setAttribute('transform', 'translate(' + cw[0].toFixed(3) + ' ' + cw[1].toFixed(3) + ') scale(' + kk.toFixed(5) + ') translate(' + (-ocx) + ' ' + (-ocy) + ')');
      ra.setAttribute('opacity', ringShow); rw.setAttribute('opacity', ringShow);

      // FICHAS, CONVERSAS E LIGAÇÕES (seguem o centro do seu anel; a absorção encolhe e esmaece no lugar)
      var fade = 1 - smooth(0, 1, au), lit = [];
      for (n = 0; n < CARDS.length; n++) {
        var D = CARDS[n], ctr = D.group ? ca : cw, pc = fly(t, D.arr, FLY_C, D.off, D.bow);
        var px = ctr[0] + pc.x, py = ctr[1] + D.sy + pc.y;
        var x = lerp(px, ctr[0], 0.5 * eIn(au)), y = lerp(py, ctr[1] + D.sy * 0.5, 0.5 * eIn(au));
        var sc = lerp(0.84, 1, pc.f) * (1 - 0.85 * eIn(au));
        var op = (n === 0 ? 1 : smooth(D.arr, D.arr + 0.05, t)) * fade;
        var ang = 5 * (D.group ? -1 : 1) * (1 - pc.f);
        // chip: same rule, from the inner side into its slot; lights the card when it docks
        var pm = fly(t, D.carr, FLY_M, D.coff, D.group ? 18 : -18), cls = t - D.cland;
        var litN = Math.max(cls >= 0 ? 0.9 * Math.exp(-cls * 8) : 0, 0.8 * smooth(T.abs - 0.2, T.abs, t), eIn(au));
        lit[n] = litN;
        cards[n].setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + ang.toFixed(2) + ') scale(' + Math.max(sc, 0.001).toFixed(4) + ')');
        cards[n].setAttribute('opacity', op.toFixed(3));
        cards[n].querySelector('.cb').setAttribute('stroke', mix(cE, cA, clamp01(litN)));
        // history line: three dots light left to right once the chip is in
        var td = cards[n].querySelectorAll('.td'), tf = cards[n].querySelector('.tf');
        for (k = 0; k < 3; k++) {
          var du = smooth(D.dots[k], D.dots[k] + 0.08, t);
          td[k].setAttribute('fill', mix(cE, cA, du)); td[k].setAttribute('r', (7 + 2.5 * Math.sin(Math.PI * du)).toFixed(2));
        }
        var lineU = clamp01((t - D.dots[0]) / (D.dots[2] - D.dots[0] + 0.04));
        tf.setAttribute('x2', (-116 + 232 * lineU).toFixed(2)); tf.setAttribute('opacity', lineU > 0 ? 1 : 0);
        // chip pose: its path is expressed in the frame of the card, so it docks into the slot and rides with the card through absorption
        var rad = ang * Math.PI / 180, lx = D.cx + pm.x, ly = D.cy + pm.y;
        var cxw = x + sc * (lx * Math.cos(rad) - ly * Math.sin(rad)), cyw = y + sc * (lx * Math.sin(rad) + ly * Math.cos(rad));
        var cop = smooth(D.carr - 0.03, D.carr + 0.03, t) * fade, csc = sc * lerp(0.9, 1, pm.f);
        chips[n].setAttribute('transform', 'translate(' + cxw.toFixed(2) + ' ' + cyw.toFixed(2) + ') rotate(' + ang.toFixed(2) + ') scale(' + Math.max(csc, 0.001).toFixed(4) + ')');
        chips[n].setAttribute('opacity', cop.toFixed(3));
        chips[n].querySelector('.cc').setAttribute('stroke', mix(cE, cA, clamp01(0.55 + 0.45 * Math.max(0, 1 - Math.max(cls, 0) * 4))));
        // ping when the chip docks
        var pu = clamp01(cls / 0.3);
        pings[n].setAttribute('x', (ctr[0] - CARD_W / 2).toFixed(2)); pings[n].setAttribute('y', (ctr[1] + D.sy - CARD_H / 2).toFixed(2));
        pings[n].setAttribute('width', CARD_W); pings[n].setAttribute('height', CARD_H);
        pings[n].setAttribute('transform', 'translate(' + ctr[0].toFixed(2) + ' ' + (ctr[1] + D.sy).toFixed(2) + ') scale(' + lerp(1, 1.08, eOut(pu)).toFixed(3) + ') translate(' + (-ctr[0]).toFixed(2) + ' ' + (-(ctr[1] + D.sy)).toFixed(2) + ')');
        pings[n].setAttribute('opacity', (cls >= 0 && pu < 1 ? 0.5 * (1 - pu) * (1 - au) : 0).toFixed(3));
      }
      // connector between the two cards of a stack (drawn once both chips are in)
      for (n = 0; n < 2; n++) {
        var a = CARDS[n === 0 ? 0 : 1], b = CARDS[n === 0 ? 2 : 3], ctr2 = n ? ca : cw;
        var l0 = Math.max(a.cland, b.cland) + 0.05, lu = eOut(clamp01((t - l0) / 0.2)), half2 = CARD_GAP / 2;
        var lk = links[n], ln = lk.querySelector('line'), cs = lk.querySelectorAll('circle');
        ln.setAttribute('x1', ctr2[0].toFixed(2)); ln.setAttribute('x2', ctr2[0].toFixed(2));
        ln.setAttribute('y1', (ctr2[1] - half2 * lu).toFixed(2)); ln.setAttribute('y2', (ctr2[1] + half2 * lu).toFixed(2));
        cs[0].setAttribute('cx', ctr2[0].toFixed(2)); cs[0].setAttribute('cy', (ctr2[1] - half2 * lu).toFixed(2));
        cs[1].setAttribute('cx', ctr2[0].toFixed(2)); cs[1].setAttribute('cy', (ctr2[1] + half2 * lu).toFixed(2));
        lk.setAttribute('opacity', (lu > 0 ? fade : 0).toFixed(3));
      }

      // CLACK (clarão âmbar curto no centro do par)
      var h0 = T.hit - 0.04, bu = smooth(h0, h0 + 0.14, t) * (1 - smooth(h0 + 0.2, h0 + 0.5, t));
      burst.setAttribute('cx', pcx.toFixed(2)); burst.setAttribute('cy', pcy.toFixed(2));
      burst.setAttribute('r', (lerp(0.45, 1, eOut(clamp01((t - h0) / 0.45))) * 56 * kk + 36).toFixed(2));
      burst.setAttribute('opacity', bu.toFixed(3));

      // PASSAGEM PARA O LOGO OFICIAL (wordmark abre para a esquerda do par, selo sobe, tagline entra)
      var wp = clamp01((t - T.wipe0) / (T.wipe1 - T.wipe0)), swapped = t >= T.wipe1;
      zoom.style.visibility = swapped ? 'hidden' : 'visible';
      var sl = eSeal(clamp01((t - T.seal0) / (T.seal1 - T.seal0)));
      wmEl.style.visibility = t < T.wipe0 ? 'hidden' : 'visible';
      if (t >= T.wipe0) {
        var e = eWipe(wp), xl = swapped ? 0 : lerp(bandL, 0, e), xr = w, xs = SEAL_W * sl;
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

  function build(cfg) {
    var inst = mount(cfg.root, {T: cfg.T, safe: cfg.safe}), cur = 0, proxy = {};
    Object.defineProperty(proxy, 't', {get: function () { return cur; }, set: function (v) { cur = v; inst.render(v); }});
    var tl = gsap.timeline({paused: true});
    tl.to(proxy, {t: cfg.duration, duration: cfg.duration, ease: 'none'}, 0); // drives render(t); also holds the declared duration
    tl.relloo = inst;
    return tl;
  }

  window.RellooIntro = {build: build, mount: mount, T: T0, readLogo: readLogo, constants: {KBIG: KBIG, C: C, WORD_CUT: WORD_CUT}};
})();
