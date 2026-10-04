// COREOGRAFIA DA ABERTURA STANT (fachada em projeto -> pontos de inspeção -> logo)
// Pure drawing: drawScene(ctx, t) depends only on t (timeline seconds). No clock, no random.
const SC = (function () {
  const W = 1920, H = 1080;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
  const easeInOut = (x) => { const k = clamp01(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const easeOutBack = (x) => { const k = clamp01(x), c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const prog = (t, t0, d) => clamp01((t - t0) / d);

  // Building elevation: 4 bays x 6 floors, ground at y=860, roof at y=260
  const GX0 = 640, BAY = 160, GY = 860, FL = 100, FLOORS = 6, BAYS = 4, TOP = GY - FL * FLOORS;
  const INK = '220,234,255';

  // Line items: polyline points, start time, duration, width, alpha
  const items = [];
  const line = (pts, t0, d, w, al) => items.push({ pts, t0, d, w, al });
  line([[560, GY], [1360, GY]], 0.30, 0.45, 2.6, 0.95);
  for (let i = 0, x = 572; x <= 1350; x += 38, i++) line([[x, GY + 2], [x - 16, GY + 20]], 0.55 + i * 0.012, 0.12, 1.4, 0.4);
  for (let i = 0; i <= BAYS; i++) line([[GX0 + BAY * i, GY], [GX0 + BAY * i, TOP]], 0.55 + 0.08 * i, 0.55, 2.2, 0.95);
  for (let j = 1; j <= FLOORS; j++) line([[GX0, GY - FL * j], [GX0 + BAY * BAYS, GY - FL * j]], 0.95 + 0.08 * j, 0.45, j === FLOORS ? 2.6 : 1.6, 0.9);
  line([[628, TOP], [628, TOP - 16], [1292, TOP - 16], [1292, TOP]], 1.50, 0.45, 2.0, 0.85);
  // Dimension lines (left: levels, bottom: bays) with ticks
  line([[590, GY], [590, TOP]], 0.80, 0.60, 1.4, 0.55);
  for (let j = 0; j <= FLOORS; j++) line([[578, GY - FL * j], [602, GY - FL * j]], 1.00 + 0.05 * j, 0.12, 1.4, 0.6);
  line([[GX0, 915], [GX0 + BAY * BAYS, 915]], 0.90, 0.50, 1.4, 0.55);
  for (let i = 0; i <= BAYS; i++) line([[GX0 + BAY * i, 903], [GX0 + BAY * i, 927]], 1.05 + 0.05 * i, 0.12, 1.4, 0.6);
  // Openings: windows on every bay, two doors on the ground floor
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  for (let f = 0; f < FLOORS; f++) {
    for (let b = 0; b < BAYS; b++) {
      const x = GX0 + BAY * b, yTop = GY - FL * (f + 1);
      const t0 = 1.35 + f * 0.09 + b * 0.03;
      if (f === 0 && (b === 1 || b === 2)) line([[x + 40, GY], [x + 40, GY - 72], [x + 120, GY - 72], [x + 120, GY]], t0, 0.3, 1.6, 0.75);
      else line(rect(x + 30, yTop + 28, 100, 44), t0, 0.3, 1.4, 0.65);
    }
  }
  // Grid axis bubbles above each column (A..E)
  const bubbles = [];
  for (let i = 0; i <= BAYS; i++) bubbles.push({ x: GX0 + BAY * i, y: 196, t0: 1.20 + 0.06 * i, label: 'ABCDE'[i] });

  // Inspection checkpoints (window centers and one roof joint)
  const CP = [[720, 810], [1040, 710], [880, 610], [1200, 510], [720, 410], [1040, 310], [960, 260]];
  const CP_T0 = 2.55, CP_STEP = 0.2, RING = 0.3, CHECK = 0.25;
  const cpStart = (i) => CP_T0 + CP_STEP * i;

  // Logo placement (880 px wide, centered, slightly above middle)
  const LW = 880, S = LW / STANT_VB.w, LX = (W - LW) / 2, LY = 360;
  const HOLE = [LX + STANT_HOLE[0] * S, LY + STANT_HOLE[1] * S];
  const CONV_T0 = 4.45, CONV_STEP = 0.03, CONV_D = 0.6;
  const MARK_T0 = 5.05, MARK_D = 0.55;
  const TRACE_T0 = 5.30, TRACE_STEP = 0.10, TRACE_D = 0.5, FILL_T0 = 5.85, FILL_STEP = 0.08, FILL_D = 0.35;
  const ELEV_FADE_T0 = 4.30, ELEV_FADE_D = 0.5;
  const markPath = new Path2D(STANT_MARK);
  const letterPaths = STANT_LETTERS.map((d) => new Path2D(d));

  function polyPartial(ctx, pts, k) {
    let total = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
    let left = total * k;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && left > 0; i++) {
      const l = seg[i - 1], u = Math.min(1, left / l);
      ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u));
      left -= l;
    }
    ctx.stroke();
  }

  // Lamp focus for the background shader: follows the drawing, then each checkpoint, then the hole
  function focusAt(t) {
    if (t < 2.45) { const k = easeInOut(prog(t, 0.3, 2.0)); return { p: [960, lerp(860, 420, k)], amt: 0.5 + 0.3 * prog(t, 0, 0.6) }; }
    if (t < CONV_T0) {
      const x = (t - CP_T0) / CP_STEP; const i = Math.max(0, Math.min(CP.length - 1, Math.floor(x)));
      const j = Math.min(CP.length - 1, i + 1); const k = easeInOut(clamp01(x - i) * 1.6);
      const from = t < CP_T0 ? [960, 420] : CP[i];
      const to = t < CP_T0 ? CP[0] : CP[j];
      const kk = t < CP_T0 ? easeInOut(prog(t, 2.45, 0.1)) : (x >= CP.length - 1 ? 0 : k);
      return { p: [lerp(from[0], to[0], kk), lerp(from[1], to[1], kk)], amt: 0.85 };
    }
    const k = easeInOut(prog(t, CONV_T0, 0.7));
    return { p: [lerp(CP[CP.length - 1][0], 960, k), lerp(CP[CP.length - 1][1], 470, k)], amt: lerp(0.85, 0.6, k) };
  }

  function drawCheck(ctx, x, y, r, k) {
    // Check mark drawn as a two-segment polyline with progress k
    ctx.lineWidth = Math.max(2, r * 0.18); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    polyPartial(ctx, [[x - r * 0.42, y + r * 0.02], [x - r * 0.1, y + r * 0.34], [x + r * 0.46, y - r * 0.3]], k);
  }

  function drawScene(ctx, t) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const elev = 1 - easeInOut(prog(t, ELEV_FADE_T0, ELEV_FADE_D));

    // FACHADA EM PROJETO (linhas que se desenham)
    if (elev > 0) {
      for (const it of items) {
        const k = easeInOut(prog(t, it.t0, it.d)); if (k <= 0) continue;
        ctx.strokeStyle = 'rgba(' + INK + ',' + (it.al * elev) + ')'; ctx.lineWidth = it.w;
        polyPartial(ctx, it.pts, k);
      }
      ctx.font = '600 24px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const b of bubbles) {
        const k = easeOut(prog(t, b.t0, 0.3)); if (k <= 0) continue;
        ctx.strokeStyle = 'rgba(' + INK + ',' + (0.55 * elev) + ')'; ctx.lineWidth = 1.4;
        polyPartial(ctx, [[b.x, TOP - 16], [b.x, b.y + 24]], k);
        ctx.beginPath(); ctx.arc(b.x, b.y, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
        ctx.fillStyle = 'rgba(' + INK + ',' + (0.85 * elev * prog(t, b.t0 + 0.15, 0.2)) + ')';
        ctx.fillText(b.label, b.x, b.y + 1);
      }
    }

    // PONTOS DE INSPEÇÃO (anel laranja -> verificado em verde -> convergem para a marca)
    CP.forEach((p, i) => {
      const u = t - cpStart(i); if (u < 0) return;
      const cu = t - (CONV_T0 + CONV_STEP * i);
      let x = p[0], y = p[1], r = 20, conv = 0;
      if (cu > 0) {
        conv = easeInOut(cu / CONV_D);
        const mx = (p[0] + HOLE[0]) / 2, my = (p[1] + HOLE[1]) / 2;
        const off = (i % 2 ? 1 : -1) * (90 + 18 * i);
        const cx = mx + off * 0.5, cy = my - Math.abs(off);
        const a = 1 - conv;
        x = a * a * p[0] + 2 * a * conv * cx + conv * conv * HOLE[0];
        y = a * a * p[1] + 2 * a * conv * cy + conv * conv * HOLE[1];
        r = lerp(20, 8, conv);
      }
      // Outer ripple on arrival
      if (u < 0.55 && conv === 0) {
        const k = easeOut(u / 0.55);
        ctx.strokeStyle = 'rgba(255,64,37,' + (0.55 * (1 - k)) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 22 + 30 * k, 0, Math.PI * 2); ctx.stroke();
      }
      const ringK = easeOut(u / RING);
      const ringFade = 1 - prog(u, RING + CHECK, 0.25);
      if (ringFade > 0 && conv === 0) {
        ctx.strokeStyle = 'rgba(255,64,37,' + ringFade + ')'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x, y, 8 + 18 * ringK, 0, Math.PI * 2); ctx.stroke();
      }
      const ck = prog(u, RING, CHECK);
      if (ck > 0) {
        const g = conv > 0 ? 1 : easeOutBack(ck);
        const col = [lerp(52, 255, conv), lerp(211, 255, conv), lerp(153, 255, conv)].map(Math.round);
        const fadeOut = 1 - prog(t, MARK_T0 + 0.05, 0.25);
        ctx.fillStyle = 'rgba(' + col.join(',') + ',' + fadeOut + ')';
        ctx.beginPath(); ctx.arc(x, y, r * g, 0, Math.PI * 2); ctx.fill();
        if (conv < 1) {
          ctx.strokeStyle = 'rgba(8,40,30,' + (1 - conv) + ')';
          drawCheck(ctx, x, y, r * g, easeOut(prog(u, RING + 0.06, CHECK)));
        }
      }
    });

    // MARCA STANT (cresce a partir do furo onde os pontos convergiram)
    const mk = prog(t, MARK_T0, MARK_D);
    if (mk > 0) {
      const k = easeOutBack(mk);
      ctx.save();
      ctx.globalAlpha = prog(t, MARK_T0, 0.12);
      ctx.translate(HOLE[0], HOLE[1]); ctx.rotate(-0.35 * (1 - easeOut(mk))); ctx.scale(k, k); ctx.translate(-HOLE[0], -HOLE[1]);
      ctx.translate(LX, LY); ctx.scale(S, S);
      ctx.fillStyle = '#FF4025'; ctx.fill(markPath, 'evenodd');
      ctx.restore();
      const pk = prog(t, MARK_T0 + 0.45, 0.6);
      if (pk > 0 && pk < 1) {
        const mc = [LX + 22 * S, LY + 18.5 * S];
        ctx.strokeStyle = 'rgba(255,64,37,' + (0.45 * (1 - pk)) + ')'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(mc[0], mc[1], 120 + 140 * easeOut(pk), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // WORDMARK (traçado de projeto -> preenchimento)
    letterPaths.forEach((path, li) => {
      const tk = easeInOut(prog(t, TRACE_T0 + TRACE_STEP * li, TRACE_D)); if (tk <= 0) return;
      const fk = easeOut(prog(t, FILL_T0 + FILL_STEP * li, FILL_D));
      ctx.save(); ctx.translate(LX, LY); ctx.scale(S, S);
      if (fk > 0) { ctx.fillStyle = 'rgba(255,255,255,' + fk + ')'; ctx.fill(path, 'evenodd'); }
      const L = 180;
      ctx.setLineDash([Math.max(0.01, tk * L), L * 3]);
      ctx.lineWidth = 2.2 / S; ctx.strokeStyle = 'rgba(' + INK + ',' + (1 - 0.9 * fk) + ')';
      ctx.stroke(path);
      ctx.restore();
    });
  }

  const settleAt = (t) => prog(t, ELEV_FADE_T0, 1.2);
  const fadeAt = (t) => easeOut(prog(t, 0, 0.6));
  return { drawScene, focusAt, settleAt, fadeAt, W, H, TAGLINE_T0: FILL_T0 + FILL_STEP * 4 + 0.05 };
})();
