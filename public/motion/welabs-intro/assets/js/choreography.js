// COREOGRAFIA DA ABERTURA WELABS (produtos fluem para um nó -> saem para SaaS, apps e portais -> o nó vira a marca)
// Pure drawing: drawScene(ctx, t) depends only on t (timeline seconds). No clock, no random.
const SC = (function () {
  const W = 1920, H = 1080;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
  const easeInOut = (x) => { const k = clamp01(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const easeOutBack = (x) => { const k = clamp01(x), c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const prog = (t, t0, d) => clamp01((t - t0) / d);
  const frac = (x) => x - Math.floor(x);
  // Brand palette and logo outlines come from assets/brand/welabs-brand.js (generated); amber replaces the old vermilion
  const BRAND = window.WELABS_BRAND, LOGO = BRAND.logo;
  const AMBER = BRAND.color.amberRgb, AMBER_HEX = BRAND.color.amber, INK = '230,230,236';
  // Pale amber for the output comets (was pale vermilion)
  const AMBER_PALE = '255,226,170';
  const WL_VB = { w: LOGO.w, h: LOGO.h };
  // Bounding box of the "w" glyph in the Ibrand outlines (x 0..240.6, y 60..210)
  const WL_W_BOX = { x: 0, y: 60, w: 240.6, h: 150 };

  // Platform node (the knot every stream runs through)
  const K = [1040, 540], KR = 26;

  // Sampled cubic bezier with cumulative arc length, so progress is uniform along the curve
  function curve(p0, p1, p2, p3) {
    const pts = [], acc = [0], N = 72;
    for (let i = 0; i <= N; i++) {
      const u = i / N, a = 1 - u;
      pts.push([a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0],
        a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]);
      if (i) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { pts, acc, len: acc[N] };
  }
  function at(c, s) {
    const target = clamp01(s) * c.len; let i = 1;
    while (i < c.acc.length - 1 && c.acc[i] < target) i++;
    const l = c.acc[i] - c.acc[i - 1], u = l > 0 ? (target - c.acc[i - 1]) / l : 0;
    return [lerp(c.pts[i - 1][0], c.pts[i][0], u), lerp(c.pts[i - 1][1], c.pts[i][1], u)];
  }
  function strokeRange(ctx, c, a, b) {
    if (b - a <= 0.0005) return;
    const p = at(c, a); ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    const ta = a * c.len, tb = b * c.len;
    for (let i = 1; i < c.pts.length; i++) if (c.acc[i] > ta && c.acc[i] < tb) ctx.lineTo(c.pts[i][0], c.pts[i][1]);
    const q = at(c, b); ctx.lineTo(q[0], q[1]); ctx.stroke();
  }

  // Inputs: the six products, braided (end offsets permuted so streams cross) into the knot
  const IN_Y = [230, 354, 478, 602, 726, 850];
  const IN_OFF = [9, -15, 15, -3, 3, -9];
  const IN_X0 = 150;
  const inputs = IN_Y.map((y, i) => ({
    c: curve([IN_X0, y], [560, y], [800, K[1] + IN_OFF[i]], [K[0] - 20, K[1] + IN_OFF[i]]),
    t0: 0.35 + 0.12 * i, planned: i === 5, phase: i * 0.17,
  }));
  const IN_D = 1.1;

  // Outputs: what the platform serves (SaaS, apps, portals)
  const OUT_Y = [330, 540, 750], OUT_Q = [-8, 0, 8], OUT_X1 = 1770;
  const outputs = OUT_Y.map((y, j) => ({
    c: curve([K[0] + 20, K[1] + OUT_Q[j]], [1300, K[1] + OUT_Q[j]], [1460, y], [OUT_X1, y]),
    t0: 1.95 + 0.1 * j, phase: j * 0.29,
  }));
  const OUT_D = 0.7;

  // Collapse into the knot, then the knot becomes the brand
  const COL_T0 = 4.2, COL_D = 0.65;
  const MARK_T0 = 4.75, MARK_D = 0.45, MARK_W0 = 300;
  const GLIDE_T0 = 5.3, GLIDE_D = 0.7;
  const TRACE_T0 = 5.75, TRACE_STEP = 0.12, TRACE_D = 0.55, FILL_T0 = 6.0, FILL_STEP = 0.1, FILL_D = 0.4;

  // New lockup: Ibrand logo 905x213 without slogan, scaled 1.2 and centered above the editorial line
  const S = 1.2, LW = WL_VB.w * S, LX = (W - LW) / 2, LY = 372;
  const SLOT = { cx: LX + (WL_W_BOX.x + WL_W_BOX.w / 2) * S, cy: LY + (WL_W_BOX.y + WL_W_BOX.h / 2) * S, w: WL_W_BOX.w * S };
  // The knot becomes the amber "w" itself (the old separate vermilion mark no longer exists)
  const wPath = new Path2D(LOGO.w0);
  const letters = [{ p: new Path2D(LOGO.e), col: AMBER, L: 900 }, { p: new Path2D(LOGO.labs), col: '255,255,255', L: 3400 }];

  const pulseAlpha = (t) => prog(t, 1.3, 0.4) * (1 - prog(t, COL_T0 - 0.05, 0.3));

  function drawComet(ctx, c, head, lo, hi, al, rgbHead) {
    // Short comet: bright head, fading tail, clipped to the visible range [lo, hi]
    const TAIL = 0.11, STEPS = 8;
    for (let k = 0; k < STEPS; k++) {
      const a = Math.max(lo, head - TAIL * (k + 1) / STEPS), b = Math.min(hi, head - TAIL * k / STEPS);
      if (b <= a) continue;
      ctx.strokeStyle = 'rgba(' + rgbHead + ',' + (al * (1 - k / STEPS)) + ')';
      ctx.lineWidth = 4 - 2.4 * (k / STEPS);
      strokeRange(ctx, c, a, b);
    }
    if (head >= lo && head <= hi) {
      const p = at(c, head);
      ctx.fillStyle = 'rgba(' + rgbHead + ',' + al + ')';
      ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function markGeom(t) {
    // Center and width of the "W" between its birth at the knot and its slot in the wordmark
    const g = easeInOut(prog(t, GLIDE_T0, GLIDE_D));
    const grow = easeOutBack(prog(t, MARK_T0, MARK_D));
    return { cx: lerp(K[0], SLOT.cx, g), cy: lerp(K[1], SLOT.cy, g), w: lerp(MARK_W0 * grow, SLOT.w, g), g };
  }

  // Lamp focus for the background shader: on the knot, brighter on collapse, then follows the mark to its slot
  function focusAt(t) {
    const m = markGeom(t);
    const amt = 0.5 + 0.35 * prog(t, COL_T0, COL_D) - 0.4 * easeInOut(prog(t, GLIDE_T0, 1.1));
    return { p: t < GLIDE_T0 ? K : [m.cx + (960 - SLOT.cx) * easeInOut(prog(t, GLIDE_T0 + 0.3, 0.8)), m.cy], amt: Math.max(0.42, amt) };
  }

  function drawScene(ctx, t) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const col = easeInOut(prog(t, COL_T0, COL_D));
    const pa = pulseAlpha(t);

    // FLUXOS DE ENTRADA (produtos -> nó)
    if (col < 1) {
      inputs.forEach((s) => {
        const k = easeInOut(prog(t, s.t0, IN_D)); if (k <= 0) return;
        const lo = col, hi = k;
        ctx.lineWidth = 2;
        if (s.planned) { ctx.setLineDash([12, 12]); ctx.strokeStyle = 'rgba(' + INK + ',0.30)'; }
        else ctx.strokeStyle = 'rgba(' + INK + ',0.34)';
        strokeRange(ctx, s.c, lo, hi);
        ctx.setLineDash([]);
        // Origin node
        const na = prog(t, s.t0, 0.2) * (1 - prog(t, COL_T0, 0.3));
        if (na > 0) {
          ctx.fillStyle = 'rgba(' + INK + ',' + 0.9 * na + ')';
          ctx.beginPath(); ctx.arc(IN_X0, s.c.pts[0][1], 5, 0, Math.PI * 2); ctx.fill();
        }
        if (!s.planned && pa > 0) {
          for (let m = 0; m < 2; m++) drawComet(ctx, s.c, frac((t - 1.0) * 0.42 + s.phase + m * 0.5), lo, hi, pa, AMBER);
        }
      });

      // FLUXOS DE SAÍDA (nó -> SaaS, apps, portais)
      outputs.forEach((s) => {
        const k = easeInOut(prog(t, s.t0, OUT_D)); if (k <= 0) return;
        const hi = Math.min(k, 1 - col);
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(' + INK + ',0.34)';
        strokeRange(ctx, s.c, 0, hi);
        const na = prog(t, s.t0 + OUT_D - 0.1, 0.2) * (1 - prog(t, COL_T0, 0.3));
        if (na > 0) {
          ctx.strokeStyle = 'rgba(' + AMBER + ',' + na + ')'; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(OUT_X1, s.c.pts[s.c.pts.length - 1][1], 7, 0, Math.PI * 2); ctx.stroke();
        }
        if (pa > 0) for (let m = 0; m < 2; m++) drawComet(ctx, s.c, frac((t - 1.8) * 0.5 + s.phase + m * 0.5), 0, hi, pa, AMBER_PALE);
      });
    }

    // NÓ DA PLATAFORMA (aparece quando os fluxos chegam; pulsa; vira a marca)
    const kIn = easeOutBack(prog(t, 1.45, 0.4)), kOut = 1 - prog(t, MARK_T0, 0.25);
    if (kIn > 0 && kOut > 0) {
      const r = KR * kIn * (1 + 0.25 * col);
      ctx.fillStyle = 'rgba(' + AMBER + ',' + kOut + ')';
      ctx.beginPath(); ctx.arc(K[0], K[1], r * 0.55, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(' + AMBER + ',' + 0.6 * kOut + ')'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(K[0], K[1], r, 0, Math.PI * 2); ctx.stroke();
      // Breathing ring while traffic flows
      if (t > 2.0 && t < COL_T0 + 0.4) {
        const ph = frac((t - 2.0) / 1.1), ra = (1 - ph) * 0.4 * (1 - prog(t, COL_T0, 0.4));
        ctx.strokeStyle = 'rgba(' + AMBER + ',' + ra + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(K[0], K[1], KR + 46 * easeOut(ph), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // MARCA: o "w" âmbar do logo nasce no nó e desliza para o seu lugar no logotipo
    if (t >= MARK_T0) {
      if (t < GLIDE_T0 + GLIDE_D) {
        const m = markGeom(t), sc = m.w / WL_W_BOX.w;
        if (sc > 0) {
          ctx.save();
          ctx.globalAlpha = prog(t, MARK_T0, 0.12);
          ctx.translate(m.cx, m.cy); ctx.rotate(-0.25 * (1 - easeOut(prog(t, MARK_T0, MARK_D)))); ctx.scale(sc, sc);
          // Center the "w" glyph on the knot (it is the logo's own "w", not a separate mark)
          ctx.translate(-(WL_W_BOX.x + WL_W_BOX.w / 2), -(WL_W_BOX.y + WL_W_BOX.h / 2));
          ctx.fillStyle = AMBER_HEX; ctx.fill(wPath);
          ctx.restore();
        }
      } else {
        ctx.save(); ctx.translate(LX, LY); ctx.scale(S, S);
        ctx.fillStyle = AMBER_HEX; ctx.fill(wPath);
        ctx.restore();
      }
      // Settle ring when the W lands
      const rk = prog(t, GLIDE_T0 + GLIDE_D - 0.05, 0.6);
      if (rk > 0 && rk < 1) {
        ctx.strokeStyle = 'rgba(' + AMBER + ',' + 0.4 * (1 - rk) + ')'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(SLOT.cx, SLOT.cy, 110 + 120 * easeOut(rk), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // LOGOTIPO: "e" e "labs" traçados e preenchidos
    letters.forEach((lt, li) => {
      const tk = easeInOut(prog(t, TRACE_T0 + TRACE_STEP * li, TRACE_D)); if (tk <= 0) return;
      const fk = easeOut(prog(t, FILL_T0 + FILL_STEP * li, FILL_D));
      ctx.save(); ctx.translate(LX, LY); ctx.scale(S, S);
      if (fk > 0) { ctx.fillStyle = 'rgba(' + lt.col + ',' + fk + ')'; ctx.fill(lt.p); }
      if (fk < 1) {
        ctx.setLineDash([Math.max(0.01, tk * lt.L), lt.L * 3]);
        ctx.lineWidth = 2.2 / S; ctx.strokeStyle = 'rgba(' + lt.col + ',' + (1 - fk) + ')';
        ctx.stroke(lt.p);
      }
      ctx.restore();
    });
    // No slogan: the new brand material has none, so the lockup is the logo plus the editorial line (DOM)
  }

  const settleAt = (t) => easeInOut(prog(t, COL_T0, 1.6));
  const fadeAt = (t) => easeOut(prog(t, 0, 0.6));
  return {
    drawScene, focusAt, settleAt, fadeAt, W, H,
    IN_T0: inputs.map((s) => s.t0), OUT_T0: outputs.map((s) => s.t0), COL_T0, TAGLINE_T0: 6.3, LOCKUP_BOTTOM: LY + WL_VB.h * S,
  };
})();
