// COREOGRAFIA DA ABERTURA WEGO (módulos ligados pelo número do processo -> o nó vira o fio da marca -> nome e frase)
// Pure drawing: render(t) depends only on t (timeline seconds). No clock, no random.
// build() returns a paused 8.5 s GSAP timeline; the caller registers it (standalone) or nests it (film with intro).
var WGI = (function () {
  'use strict';
  var W = 1920, H = 1080, DURATION = 8.5;
  var clamp01 = function (x) { return Math.min(1, Math.max(0, x)); };
  var easeOut = function (x) { return 1 - Math.pow(1 - clamp01(x), 3); };
  var easeInOut = function (x) { var k = clamp01(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  var easeOutBack = function (x) { var k = clamp01(x), c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  var lerp = function (a, b, k) { return a + (b - a) * k; };
  var prog = function (t, t0, d) { return clamp01((t - t0) / d); };
  var frac = function (x) { return x - Math.floor(x); };
  var GREEN = '74,222,128', INK = '226,234,230';

  // Process node (the common key every module meets on)
  var NODE = [960, 540], NR = 30;

  // Module plates: final row in the DOM (left = slot), scattered around the node in the first act.
  // Row order follows the scatter so no glide path crosses another.
  var PW = 340, PLATE_TOP = 610, PH = 112;
  var SLOT_CX = [396, 772, 1148, 1524];
  var MODS = [
    { id: 'wgi-m0', at: [470, 300], side: 1, tIn: 0.35, out: true },   // DocGo
    { id: 'wgi-m1', at: [470, 760], side: 1, tIn: 0.55, out: false },  // Licenciamento
    { id: 'wgi-m2', at: [1450, 760], side: -1, tIn: 0.75, out: false }, // Auto Infração
    { id: 'wgi-m3', at: [1450, 300], side: -1, tIn: 0.95, out: true },  // SignGo
  ];
  MODS.forEach(function (m, i) {
    m.dx = m.at[0] - SLOT_CX[i];
    m.dy = m.at[1] - (PLATE_TOP + PH / 2);
  });

  // Sampled cubic bezier with cumulative arc length, so progress is uniform along the curve
  function curve(p0, p1, p2, p3) {
    var pts = [], acc = [0], N = 72;
    for (var i = 0; i <= N; i++) {
      var u = i / N, a = 1 - u;
      pts.push([a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0],
        a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]);
      if (i) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { pts: pts, acc: acc, len: acc[N] };
  }
  function at(c, s) {
    var target = clamp01(s) * c.len, i = 1;
    while (i < c.acc.length - 1 && c.acc[i] < target) i++;
    var l = c.acc[i] - c.acc[i - 1], u = l > 0 ? (target - c.acc[i - 1]) / l : 0;
    return [lerp(c.pts[i - 1][0], c.pts[i][0], u), lerp(c.pts[i - 1][1], c.pts[i][1], u)];
  }
  function strokeRange(ctx, c, a, b) {
    if (b - a <= 0.0005) return;
    var p = at(c, a); ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    var ta = a * c.len, tb = b * c.len;
    for (var i = 1; i < c.pts.length; i++) if (c.acc[i] > ta && c.acc[i] < tb) ctx.lineTo(c.pts[i][0], c.pts[i][1]);
    var q = at(c, b); ctx.lineTo(q[0], q[1]); ctx.stroke();
  }

  // Edges: from the plate side facing the node to the node ring, ends offset so the four strands stay distinct
  var END_OFF = [-12, 12, 12, -12];
  MODS.forEach(function (m, i) {
    var x0 = m.at[0] + m.side * PW / 2, y0 = m.at[1];
    var x3 = NODE[0] - m.side * (NR + 8), y3 = NODE[1] + END_OFF[i];
    m.c = curve([x0, y0], [x0 + m.side * 150, y0], [x3 - m.side * 140, y3], [x3, y3]);
    m.t0 = m.tIn + 0.35;
  });
  var EDGE_D = 0.9;

  // Acts
  var NODE_T0 = 1.55, KEY_T0 = 1.9;
  var PULSE_T0 = 1.85;
  var COL_T0 = 4.0, COL_D = 0.6;
  var GLIDE_T0 = 4.35, GLIDE_D = 0.95;
  var SHRINK_T0 = 4.45, SHRINK_D = 0.45;
  var RULE_Y = 488, RULE_T0 = 4.85, RULE_D = 0.6, RULE_HALF = 280;
  var TITLE_T0 = 4.95, LINE_T0 = 5.45;

  function drawComet(ctx, c, head, lo, hi, al) {
    // Short comet: bright head, fading tail, clipped to the visible range [lo, hi]
    var TAIL = 0.13, STEPS = 8;
    for (var k = 0; k < STEPS; k++) {
      var a = Math.max(lo, head - TAIL * (k + 1) / STEPS), b = Math.min(hi, head - TAIL * k / STEPS);
      if (b <= a) continue;
      ctx.strokeStyle = 'rgba(' + GREEN + ',' + (al * (1 - k / STEPS)) + ')';
      ctx.lineWidth = 4 - 2.4 * (k / STEPS);
      strokeRange(ctx, c, a, b);
    }
    if (head >= lo && head <= hi) {
      var p = at(c, head);
      ctx.fillStyle = 'rgba(' + GREEN + ',' + al + ')';
      ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawScene(ctx, t) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var col = easeInOut(prog(t, COL_T0, COL_D));
    var pa = prog(t, PULSE_T0, 0.4) * (1 - prog(t, COL_T0 - 0.05, 0.3));

    // ARESTAS: cada módulo se liga ao número do processo; recolhem para o nó no fechamento
    if (col < 1) {
      MODS.forEach(function (m) {
        var k = easeInOut(prog(t, m.t0, EDGE_D)); if (k <= 0) return;
        var lo = col, hi = k;
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(' + INK + ',0.34)';
        strokeRange(ctx, m.c, lo, hi);
        if (pa > 0) {
          // Inbound traffic on every strand; DocGo and SignGo also carry the return leg
          drawComet(ctx, m.c, frac((t - 1.6) * 0.45 + m.tIn), lo, hi, pa);
          if (m.out) drawComet(ctx, m.c, 1 - frac((t - 1.6) * 0.45 + m.tIn + 0.5), lo, hi, pa * 0.75);
        }
      });
    }

    // NÓ DO PROCESSO: aparece quando as arestas chegam, respira com o tráfego, encolhe e sobe até o fio da marca
    var kIn = easeOutBack(prog(t, NODE_T0, 0.4));
    var sh = easeInOut(prog(t, SHRINK_T0, SHRINK_D));
    var rk = easeInOut(prog(t, RULE_T0, RULE_D));
    var ny = lerp(NODE[1], RULE_Y, sh);
    var nodeA = 1 - prog(t, RULE_T0, 0.3);
    if (kIn > 0 && nodeA > 0) {
      var r = NR * kIn * (1 + 0.2 * col) * (1 - 0.88 * sh);
      ctx.fillStyle = 'rgba(22,163,74,' + nodeA + ')';
      ctx.beginPath(); ctx.arc(NODE[0], ny, r * 0.66, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(' + GREEN + ',' + 0.75 * nodeA + ')'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(NODE[0], ny, r, 0, Math.PI * 2); ctx.stroke();
      // Document glyph inside the node while it is large enough to read
      var ga = nodeA * (1 - prog(t, SHRINK_T0, 0.2));
      if (ga > 0 && r > 18) {
        var s = r / NR;
        ctx.save(); ctx.translate(NODE[0], ny); ctx.scale(s, s);
        ctx.strokeStyle = 'rgba(255,255,255,' + ga + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-7, -10); ctx.lineTo(3, -10); ctx.lineTo(8, -5); ctx.lineTo(8, 10); ctx.lineTo(-7, 10); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-3, -1); ctx.lineTo(4, -1); ctx.moveTo(-3, 4); ctx.lineTo(4, 4); ctx.stroke();
        ctx.restore();
      }
      // Breathing ring while traffic flows
      if (t > 2.1 && t < COL_T0 + 0.4) {
        var ph = frac((t - 2.1) / 1.2), ra = (1 - ph) * 0.38 * (1 - prog(t, COL_T0, 0.4));
        ctx.strokeStyle = 'rgba(' + GREEN + ',' + ra + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(NODE[0], NODE[1], NR + 50 * easeOut(ph), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // FIO DA MARCA: o nó se abre numa linha entre o nome e a frase
    if (rk > 0) {
      ctx.strokeStyle = 'rgba(' + GREEN + ',0.85)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(NODE[0] - RULE_HALF * rk, RULE_Y); ctx.lineTo(NODE[0] + RULE_HALF * rk, RULE_Y); ctx.stroke();
    }
  }

  // Background lamp: on the node, brighter on collapse, constant once the brand settles
  function focusAt(t) {
    return { p: [960, 520], amt: 0.45 + 0.3 * prog(t, COL_T0, COL_D) - 0.25 * easeInOut(prog(t, 4.8, 0.8)) };
  }
  var settleAt = function (t) { return easeInOut(prog(t, COL_T0, 1.6)); };
  var fadeAt = function (t) { return easeOut(prog(t, 0, 0.6)); };

  // TIMELINE DA ABERTURA (a única fonte de tempo): tween linear sobre um proxy dirige o render; DOM na mesma timeline
  function build() {
    var bg = document.getElementById('wgi-bg');
    var ctx = document.getElementById('wgi-fg').getContext('2d');
    var gl = bg.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true });
    var prg = null, uni = {}, vao = null;
    if (gl) {
      prg = gl.createProgram();
      [[gl.VERTEX_SHADER, WGI_VS], [gl.FRAGMENT_SHADER, WGI_FS]].forEach(function (s) {
        var shd = gl.createShader(s[0]); gl.shaderSource(shd, s[1]); gl.compileShader(shd);
        if (!gl.getShaderParameter(shd, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shd));
        gl.attachShader(prg, shd); gl.deleteShader(shd);
      });
      gl.linkProgram(prg);
      if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prg));
      ['uRes', 'uFade', 'uFocus', 'uFocusAmt', 'uSettle'].forEach(function (n) { uni[n] = gl.getUniformLocation(prg, n); });
      vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
    }
    function render(t) {
      if (gl && prg) {
        var f = focusAt(t);
        gl.viewport(0, 0, W, H); gl.useProgram(prg);
        gl.uniform2f(uni.uRes, W, H); gl.uniform1f(uni.uFade, fadeAt(t));
        gl.uniform2f(uni.uFocus, f.p[0], f.p[1]); gl.uniform1f(uni.uFocusAmt, f.amt); gl.uniform1f(uni.uSettle, settleAt(t));
        gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      drawScene(ctx, t);
    }

    var proxy = { t: 0 };
    var tl = gsap.timeline({ paused: true });
    tl.to(proxy, { t: DURATION, duration: DURATION, ease: 'none', onUpdate: function () { render(proxy.t); } }, 0);
    MODS.forEach(function (m, i) {
      // Plate enters at its scattered spot, then glides to its slot in the final row (transform 0 = final layout)
      tl.fromTo('#' + m.id, { opacity: 0, x: m.dx, y: m.dy + 16, scale: 0.94 }, { opacity: 1, x: m.dx, y: m.dy, scale: 1, duration: 0.5, ease: 'power2.out' }, m.tIn);
      tl.fromTo('#' + m.id, { x: m.dx, y: m.dy }, { x: 0, y: 0, duration: GLIDE_D, ease: 'power2.inOut', immediateRender: false }, GLIDE_T0 + 0.05 * i);
    });
    tl.fromTo('#wgi-key', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, KEY_T0);
    tl.fromTo('#wgi-key', { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'power2.in', immediateRender: false }, COL_T0);
    tl.fromTo('#wgi-title', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, TITLE_T0);
    tl.fromTo('#wgi-line', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, LINE_T0);
    render(0);
    return tl;
  }

  return { build: build, DURATION: DURATION, HOLD_T0: LINE_T0 + 0.6 };
})();
