// ABERTURA DO MAGNETO NO SITE (CAMADA DO FLUXO)
// The script of the accepted piece magneto-intro-s3-r3, ported for the site (components/intro/intro-run.ts): the two rows
// of five steps that assemble while the camera is close, over the magnets of the choreography (magneto.js). Light palette
// (kit.js), eases without GSAP; `mount(root, cfg)` returns render(t), driven by the player. The role word of the piece is
// not drawn on the site (only its amber bar). Motion, geometry and times are those of the round.
import { parseEase, LIGHT } from './kit.js';
import { mount as mountMagnets, KBIG } from './magneto.js';

// LINHA DO TEMPO DA PEÇA (coreografia 1.3.0 com fases parametrizadas + câmera de foco + duas fileiras de etapas; termina exatamente em data-duration)
// r3 revision of s3-r2: same motion and timings; the closing role slot (bar + line, 3.75-4.05 s) carries the brand 1.3.2 tagline instead of the one-word slogan,
// set at 44 px (was 38 px) to fit on one line, and the frame holds still until 5.4 s (the tagline is fully visible and still for 1.35 s).
// r2 revision of s3: absorb fade follows the pull (no opacity pop), first node already inked at frame 0, camera at 1.55x so the rows keep a 96 px safe area.
// Phase 1 (0-1.6 s): the camera sits at 1.55x over the right half, where two rows of five nodes cascade in and get wired.
// Phase 2 (1.6-2.2 s): the camera pulls back and reveals the two "C" magnets, each facing its own row.
// Then: pull and clack (2.17-2.36), 0.8 s turn to the exact "m" (2.4-3.2), wordmark, seal and role word, still frame until 5.4 s.
  var NS = 'http://www.w3.org/2000/svg', AMBER = '#FFB020', CARD = LIGHT.card, EDGE = LIGHT.edge, BG = LIGHT.page, INK = LIGHT.ink;

  // FASES (s): entry 0.05, drift ends 0.9 (magnets are off-screen), still until 2.17, pull, snap 2.28, clack 2.36, turn 2.4-3.2
  var TIMES = {
    entry: 0.05, driftEnd: 0.9, hold1: 2.17, dHold: 55, pullPow: 3, snap: 2.28, snapDur: 0.08, hit: 2.36,
    in0: 1.5, in1: 1.9, fieldOut0: 2.38, fieldOut1: 2.71, capOut1: 2.83, haloOut0: 2.42, haloOut1: 2.87,
    turn0: 2.4, turn1: 3.2, cam0: 2.45, cam1: 3.25, wipe0: 3.25, wipe1: 3.7, seal0: 3.65, seal1: 3.95, role0: 3.75, role1: 4.05,
    fieldReach: 0.4, pbigX: 440, pbigY: 540
  };
  var ZOOM_A = 1.6, ZOOM_B = 2.2, Z_IN = 1.55, FOCUS = [1232, 540]; // camera: zoom factor and focus point while on the nodes
  var K = KBIG;

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, t) { var u = clamp01((t - a) / (b - a)); return u * u * (3 - 2 * u); }
  function ease(n) { var f = parseEase(n); return function (u) { return u <= 0 ? 0 : u >= 1 ? 1 : f(u); }; }
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var cA = rgb(AMBER), cE = rgb(EDGE);
  function mix(a, b, u) { return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(lerp(a[i], b[i], u)); }).join(',') + ')'; }
  var eIn = ease('power2.in'), eDraw = ease('power1.inOut'), eRun = ease('sine.inOut'), eOut = ease('power3.out'), eZoom = ease('power3.inOut');

  // NÓS (cartão vertical com ícone e rótulo curto; tipos e ícones reaproveitados dos filmes do Magneto)
  var HW = 76, HH = 52, PITCH = 200, X_FIRST = 832;           // card half sizes, centre spacing, centre x of the first node in a row
  var STAG = [[-8, 8, -8, 8, -8], [8, -8, 8, -8, 8]];       // alternating y offsets give the short connectors a gentle S
  var SEAM_P = [TIMES.pbigX, TIMES.pbigY];                    // screen point of the seam before the camera moves
  // One label differs from the piece: "Webhook" is a word the copy rules of the site keep out (lib/content/copy-rules.json)
  var LAB = ['Gatilho', 'Planilha', 'Condição', 'Aprovação', 'E-mail', 'Integração', 'Condição', 'Espera', 'Lembrete', 'Concluído'];
  var ICON = [
    '<path d="M13 3L5 13.5h6L10 21l9-11.5h-6z"/>',                                                              // trigger
    '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M4 14.5h16M10 5v14"/>',                // spreadsheet
    '<path d="M12 3l9 9-9 9-9-9z"/><path d="M8.5 12h7"/>',                                                    // condition
    '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.8L16.3 9.4"/>',                                  // approval
    '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/>',                    // e-mail
    '<circle cx="12" cy="6" r="2.6"/><circle cx="5.5" cy="17.5" r="2.6"/><circle cx="18.5" cy="17.5" r="2.6"/><path d="M11 8.4l-4.2 6.8M13 8.4l4.2 6.8M8.1 17.5h7.8"/>', // webhook
    '<path d="M12 3l9 9-9 9-9-9z"/><path d="M8.5 12h7"/>',                                                    // condition
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>',                                           // wait
    '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',                                                    // reminder
    '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>'                                                                    // done
  ];
  // CRONOGRAMA DA CASCATA (a primeira fileira entra a cada 0.15 s e a segunda a cada 0.15 s, 0.07 s depois; as entradas se sobrepõem)
  var FLY = 0.40, LANDF = 0.78;                                // flight duration and share spent on the approach
  var ARR = [], LAND = [], OFF = [], BOW = [], ROW = [], COL = [], n0;
  for (n0 = 0; n0 < 10; n0++) {
    ROW[n0] = n0 < 5 ? 0 : 1; COL[n0] = n0 % 5;
    ARR[n0] = COL[n0] * 0.11 + ROW[n0] * 0.05;                  // r2: the first node departs at t = 0 (was 0.03) so frame 0 already has ink
    LAND[n0] = ARR[n0] + FLY * LANDF;
    OFF[n0] = [80, ROW[n0] ? 4 : -4];                       // nodes come in from the right, toward the magnets; r2 keeps the whole flight inside the frame (was 170 px)
    BOW[n0] = ROW[n0] ? -35 : 35;
  }
  var ABS = 2.2, ABSD = 0.16;                                  // absorb start and duration (ends at the clack, 2.36 s); r2: 0.16 s so shrink and fade share one pull
  // CONECTORES (8 entre vizinhos + 1 que fecha o fluxo entre as duas fileiras, em laço pela direita)
  // Each connector carries its flow dot twice: once as it is drawn, then in a second wave left to right (1.0-1.7 s) that ends in the loop
  var CON = [], c0, ra;
  for (c0 = 0; c0 < 8; c0++) {
    ra = c0 < 4 ? c0 : c0 + 1;
    var sA = LAND[ra + 1] - 0.08;
    CON.push({ a: ra, b: ra + 1, s: sA, draw: 0.2, runD: 0.3, runs: [sA + 0.06, 0.98 + (ra % 5) * 0.12 + (ra < 5 ? 0 : 0.04)] });
  }
  CON.push({ a: 4, b: 9, s: 0.95, draw: 0.4, runD: 0.5, loop: true, runs: [1.07, 1.66] });
  var HANDLE = 50;                                             // how far the loop handles reach to the right of the ports

  export function mount(root, cfg) {
  // The magnets of the choreography, with the phase overrides of the piece
  var inst = mountMagnets(root, { T: TIMES, logo: cfg.logo, box: cfg.box });
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', 1920); svg.setAttribute('height', 1080); svg.setAttribute('viewBox', '0 0 1920 1080');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'flow'); svg.setAttribute('data-layout-allow-overflow', ''); // nodes enter from outside the zoomed frame on purpose svg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;font-family:Inter,sans-serif';
  var s = '<defs><radialGradient id="gl"><stop offset="0" stop-color="' + AMBER + '" stop-opacity=".95"/><stop offset=".45" stop-color="' + AMBER + '" stop-opacity=".35"/><stop offset="1" stop-color="' + AMBER + '" stop-opacity="0"/></radialGradient></defs>';
  var j, k;
  for (j = 0; j < 10; j++) s += '<rect class="ping" x="' + (-HW) + '" y="' + (-HH) + '" width="' + (2 * HW) + '" height="' + (2 * HH) + '" rx="20" fill="none" stroke="' + AMBER + '" stroke-width="2" opacity="0"/>';
  for (j = 0; j < CON.length; j++) {
    s += '<path class="con" fill="none" stroke="' + AMBER + '" stroke-width="3" stroke-linecap="round" opacity="0"/>';
    s += '<g class="dot" opacity="0">'; for (k = 0; k < 3; k++) s += '<circle class="dc"/>'; s += '</g>';
  }
  for (j = 0; j < 10; j++) s += '<line class="tr" stroke="' + AMBER + '" stroke-width="2.5" stroke-linecap="round" opacity="0"/>';
  for (j = 0; j < 10; j++) {
    s += '<g class="nd" opacity="0"><rect class="cb" x="' + (-HW) + '" y="' + (-HH) + '" width="' + (2 * HW) + '" height="' + (2 * HH) + '" rx="20" fill="' + CARD + '" stroke="' + EDGE + '" stroke-width="2"/>' +
      '<rect x="-24" y="-40" width="48" height="48" rx="14" fill="' + AMBER + '" fill-opacity=".16"/>' +
      '<g transform="translate(-16.8 -32.8) scale(1.4)" fill="none" stroke="' + AMBER + '" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' + ICON[j] + '</g>' +
      '<text class="lb" x="0" y="38" text-anchor="middle" font-size="24" font-weight="600" fill="' + INK + '">' + LAB[j] + '</text>' +
      '<circle class="pl" cx="' + (-HW) + '" cy="0" r="7" fill="' + BG + '" stroke="' + AMBER + '" stroke-width="2.5" opacity="0"/>' +
      '<circle class="pr" cx="' + HW + '" cy="0" r="7" fill="' + AMBER + '" stroke="' + BG + '" stroke-width="2.5" opacity="0"/></g>';
  }
  s += '<circle class="burst" r="100" fill="url(#gl)" opacity="0"/>';
  svg.innerHTML = s;

  // CÂMERA DE FOCO (a camada de zoom envolve a cena dos ímãs e a camada de etapas; o logo oficial fica de fora, já em escala 1)
  var scene = root.querySelector('svg.scene');
  var zoom = document.createElement('div');
  zoom.className = 'zoom';
  root.insertBefore(zoom, root.firstChild);
  zoom.appendChild(scene);
  zoom.appendChild(svg);

  var all = function (c) { return svg.querySelectorAll('.' + c); };
  var pings = all('ping'), cons = all('con'), dots = all('dot'), trs = all('tr'), nds = all('nd'), burst = svg.querySelector('.burst');

  // POSE DO NÓ (voa em linha curva acelerando, assenta com um leve overshoot em direção ao ímã, segue o eixo da boca do ímã e é puxado ao encaixe)
  function slotY(j, t) {
    var sign = ROW[j] ? 1 : -1;
    // r2: the row never sits farther out than the hold distance, so it stays inside the safe area while the magnets are still off-screen
    return 540 + sign * (Math.min(inst.dist(t), TIMES.dHold) + 60) * K + STAG[ROW[j]][COL[j]]; // the row follows the axis of its magnet mouth
  }
  function pose(j, t) {
    var sx = X_FIRST + COL[j] * PITCH, sy = slotY(j, t);
    var u = clamp01((t - ARR[j]) / FLY), f = eIn(clamp01(u / LANDF)), o = OFF[j], len = Math.sqrt(o[0] * o[0] + o[1] * o[1]);
    var nx = -o[1] / len, ny = o[0] / len, bow = BOW[j] * Math.sin(Math.PI * f) * (1 - f);
    var x = sx + o[0] * (1 - f) + nx * bow, y = sy + o[1] * (1 - f) + ny * bow;
    var ls = t - LAND[j];
    if (ls > 0) { var ov = 10 * Math.exp(-ls * 11) * Math.sin(ls * 34); x -= (o[0] / len) * ov; y -= (o[1] / len) * ov; }
    var au = eIn(clamp01((t - ABS) / ABSD));
    x = lerp(x, SEAM_P[0], au); y = lerp(y, SEAM_P[1], au);
    var sc = lerp(0.78, 1, f) * (1 - 0.85 * au);
    // r2: the fade runs on the same 0.16 s as the pull (linear progress, ends with the clack) instead of a late cut inside it
    var op = smooth(ARR[j] - 0.03, ARR[j] + 0.03, t) * (1 - smooth(0, 1, clamp01((t - ABS) / ABSD)));
    var lit = Math.max(ls >= 0 ? 0.9 * Math.exp(-ls * 8) : 0, au);
    return { x: x, y: y, sx: sx, sy: sy, sc: sc, op: op, lit: lit, au: au, f: f, u: u, ang: 12 * (ROW[j] ? -1 : 1) * (1 - f) };
  }
  // Port position in screen space: side = +1 right, -1 left (the tilt of the flight is included)
  function port(p, side) {
    var a = p.ang * Math.PI / 180;
    return [p.x + side * HW * p.sc * Math.cos(a), p.y + side * HW * p.sc * Math.sin(a)];
  }
  // The cubic of a connector, as the path draws it (its numbers rounded as in `d`), written into `bz` (x0 y0 .. x3 y3)
  function wire(c, P, bz) {
    var A = P[c.a], B = P[c.b], p0 = port(A, 1), p1 = c.loop ? port(B, 1) : port(B, -1), d;
    var x0 = +p0[0].toFixed(2), y0 = +p0[1].toFixed(2), x3 = +p1[0].toFixed(2), y3 = +p1[1].toFixed(2), x1, x2;
    if (c.loop) {
      var hx = Math.max(p0[0], p1[0]) + HANDLE * Math.min(A.sc, B.sc);
      x1 = x2 = +hx.toFixed(2);
    } else {
      var kx = (p1[0] - p0[0]) * 0.5;
      x1 = +(p0[0] + kx).toFixed(2); x2 = +(p1[0] - kx).toFixed(2);
    }
    bz[0] = x0; bz[1] = y0; bz[2] = x1; bz[3] = y0; bz[4] = x2; bz[5] = y3; bz[6] = x3; bz[7] = y3;
    d = 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + 'C' + x1.toFixed(2) + ' ' + p0[1].toFixed(2) + ' ' + x2.toFixed(2) + ' ' + p1[1].toFixed(2) + ' ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
    return d;
  }

  // COMPRIMENTO DO CONECTOR (tabela de arco do cúbico, sem perguntar ao motor de SVG)
  // v5 (2026-10-24): the length of a connector and the point at a length along it come from 128 chords of its cubic,
  // no longer from getTotalLength/getPointAtLength, each call of which forced a style and layout pass of the document
  // (measured on 709ccb0, production build at 4x CPU: 17 to 37 ms of forced layout in a 35 to 63 ms frame callback). The
  // chords are within 0.02 px of the engine's length and points, so the dash and the dots land where they did.
  var SEG = 128, ARC = new Float64Array(SEG + 1), AX = new Float64Array(SEG + 1), AY = new Float64Array(SEG + 1), BZ = [0, 0, 0, 0, 0, 0, 0, 0];
  function arc(b) {
    var i, u, v, total = 0;
    for (i = 0; i <= SEG; i++) {
      u = i / SEG; v = 1 - u;
      AX[i] = v * v * v * b[0] + 3 * v * v * u * b[2] + 3 * v * u * u * b[4] + u * u * u * b[6];
      AY[i] = v * v * v * b[1] + 3 * v * v * u * b[3] + 3 * v * u * u * b[5] + u * u * u * b[7];
      if (i) total += Math.sqrt((AX[i] - AX[i - 1]) * (AX[i] - AX[i - 1]) + (AY[i] - AY[i - 1]) * (AY[i] - AY[i - 1]));
      ARC[i] = total;
    }
    return total;
  }
  function pointAt(s) {
    var lo = 0, hi = SEG, mid, f;
    if (s <= 0) return { x: AX[0], y: AY[0] };
    if (s >= ARC[SEG]) return { x: AX[SEG], y: AY[SEG] };
    while (hi - lo > 1) { mid = (lo + hi) >> 1; if (ARC[mid] < s) lo = mid; else hi = mid; }
    f = (s - ARC[lo]) / (ARC[hi] - ARC[lo] || 1);
    return { x: lerp(AX[lo], AX[hi], f), y: lerp(AY[lo], AY[hi], f) };
  }

  function render(t) {
    var P = [], n, m;
    for (n = 0; n < 10; n++) P.push(pose(n, t));
    // ZOOM (aproximado sobre as etapas até 1.6 s; recua com ease firme até 2.2 s e termina em escala 1 exata)
    var zu = eZoom(clamp01((t - ZOOM_A) / (ZOOM_B - ZOOM_A))), zk = lerp(Z_IN, 1, zu), fx = lerp(FOCUS[0], 960, zu), fy = lerp(FOCUS[1], 540, zu);
    zoom.style.transform = zu >= 1 ? 'none' : 'translate(960px,540px) scale(' + zk.toFixed(5) + ') translate(' + (-fx).toFixed(3) + 'px,' + (-fy).toFixed(3) + 'px)';
    var litIn = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pOut = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pIn = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // CONECTORES E PONTOS DE FLUXO (cada ponto percorre o conector uma vez, da porta de saída à de entrada)
    for (m = 0; m < CON.length; m++) {
      var c = CON[m], A = P[c.a], B = P[c.b], con = cons[m], dot = dots[m];
      var cd = eDraw(clamp01((t - c.s) / c.draw)), opc = Math.min(A.op, B.op) * (t >= c.s ? 1 : 0);
      con.setAttribute('d', wire(c, P, BZ));
      var L = arc(BZ);
      con.setAttribute('stroke-dasharray', L.toFixed(2) + ' ' + (L + 4).toFixed(2));
      con.setAttribute('stroke-dashoffset', (L * (1 - cd)).toFixed(2));
      con.setAttribute('opacity', opc.toFixed(3));
      pOut[c.a] = Math.max(pOut[c.a], smooth(c.s, c.s + 0.08, t)); pIn[c.b] = Math.max(pIn[c.b], smooth(c.s + 0.04, c.s + 0.12, t));
      var ph = -1, rr, dcs = dot.querySelectorAll('.dc');
      for (rr = 0; rr < c.runs.length; rr++) {
        var rel = t - c.runs[rr];
        if (rel >= 0 && rel <= c.runD) ph = rel / c.runD;
        var after = rel - c.runD;
        if (after >= 0 && after < 0.5) litIn[c.b] = Math.max(litIn[c.b], Math.exp(-after * 7) * 0.8);
      }
      var dv = ph >= 0 ? 1 : 0, ur = eRun(clamp01(ph));
      for (n = 0; n < 3; n++) {
        var back = Math.max(0, ur - 0.09 * n), pt = pointAt(L * back), dc = dcs[n];
        dc.setAttribute('cx', pt.x.toFixed(2)); dc.setAttribute('cy', pt.y.toFixed(2));
        dc.setAttribute('r', (n === 0 ? 6.5 : 5.2 - 1.3 * n).toFixed(2)); dc.setAttribute('fill', AMBER);
        dc.setAttribute('opacity', (n === 0 ? 1 : 0.5 / n).toFixed(3));
      }
      dot.setAttribute('opacity', (dv * Math.min(A.op, B.op) * (cd >= 0.4 ? 1 : 0)).toFixed(3));
    }
    for (n = 0; n < 10; n++) {
      var p = P[n], q = pose(n, t - 0.06), lit = Math.max(p.lit, litIn[n]);
      nds[n].setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ') rotate(' + p.ang.toFixed(2) + ') scale(' + Math.max(p.sc, 0.001).toFixed(4) + ')');
      nds[n].setAttribute('opacity', p.op.toFixed(3));
      nds[n].querySelector('.cb').setAttribute('stroke', mix(cE, cA, clamp01(lit)));
      nds[n].querySelector('.pl').setAttribute('opacity', pIn[n].toFixed(3));
      nds[n].querySelector('.pr').setAttribute('opacity', pOut[n].toFixed(3));
      // TRILHA (rastro de campo atrás do nó enquanto ele acelera)
      var tv = p.u < LANDF && p.u > 0 ? clamp01(p.u / 0.1) * (0.2 + 0.8 * p.f) * 0.55 : 0;
      trs[n].setAttribute('x1', p.x.toFixed(2)); trs[n].setAttribute('y1', p.y.toFixed(2));
      trs[n].setAttribute('x2', q.x.toFixed(2)); trs[n].setAttribute('y2', q.y.toFixed(2));
      trs[n].setAttribute('opacity', (tv * p.op).toFixed(3));
      // PING (anel âmbar que se abre quando o nó assenta)
      var pr = clamp01((t - LAND[n]) / 0.3);
      pings[n].setAttribute('transform', 'translate(' + p.sx.toFixed(2) + ' ' + p.sy.toFixed(2) + ') scale(' + lerp(1, 1.16, eOut(pr)).toFixed(3) + ')');
      pings[n].setAttribute('opacity', (t >= LAND[n] && pr < 1 ? 0.5 * (1 - pr) * (1 - p.au) : 0).toFixed(3));
    }
    // CLARÃO DO ENCAIXE (âmbar curto no ponto do encaixe, que acompanha a câmera)
    var cm = inst.cam(t), h0 = TIMES.hit - 0.04, bu = smooth(h0, h0 + 0.14, t) * (1 - smooth(h0 + 0.2, h0 + 0.5, t));
    burst.setAttribute('cx', cm.x.toFixed(2)); burst.setAttribute('cy', cm.y.toFixed(2));
    burst.setAttribute('r', lerp(90, 230, eOut(clamp01((t - h0) / 0.45))).toFixed(2));
    burst.setAttribute('opacity', bu.toFixed(3));
  }
  // The magnets first, then the flow layer over them, as the piece's timeline did
  function frame(t) { inst.render(t); render(t); }
  frame(0);
  return { render: frame };
  }

  // Instant the closing frame is complete (the bar under the logo is drawn)
  export const SETTLED = TIMES.role1;
