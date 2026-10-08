// COREOGRAFIA DA ABERTURA WELABS V5 (cinco produtos fluem para um nó -> saem para SaaS, apps e portais -> o nó entra no "we" da marca)
// Pure drawing: drawScene(ctx, t) depends only on t (timeline seconds). No clock, no random.
// v5 (07/10/2026, final pack): the canvas no longer draws the logo; the knot glides into the center of the "we" and
// the official Welabs motion SVG (DOM, _shared/brand/welabs/welabs-motion.js) grows from there. Canvas keeps streams and knot.
const SC = (function () {
  const W = 1920, H = 1080;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
  const easeInOut = (x) => { const k = clamp01(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const easeOutBack = (x) => { const k = clamp01(x), c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const prog = (t, t0, d) => clamp01((t - t0) / d);
  const frac = (x) => x - Math.floor(x);
  // Brand palette comes from _shared/brand/welabs/welabs-brand.js (generated); only the logo box size is read from it
  const BRAND = window.WELABS_BRAND, LOGO = BRAND.logo;
  const AMBER = BRAND.color.amberRgb, INK = '230,230,236';
  // Pale amber for the output comets (was pale vermilion)
  const AMBER_PALE = '255,226,170';
  const WL_VB = { w: LOGO.w, h: LOGO.h };
  // v5: box of the "we" group in the logo units (x 0..391.1, y 57.9..212.7); its center is where the knot lands and
  // where the official motion grows the "we" from (transform origin = center of its fill box)
  const WE_BOX = { x: 0, y: 57.9, w: 391.1, h: 154.8 };

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

  // Inputs: the five named products, braided (end offsets permuted so streams cross) into the knot.
  // v2: the planned monitoring stream is gone; rows are re-spaced symmetrically around the knot (540)
  // and the stagger widened so the last stream still lands when the six-stream version did (~2.05 s).
  const IN_Y = [260, 400, 540, 680, 820];
  const IN_OFF = [10, -14, 0, 14, -10];
  const IN_X0 = 150;
  const inputs = IN_Y.map((y, i) => ({
    c: curve([IN_X0, y], [560, y], [800, K[1] + IN_OFF[i]], [K[0] - 20, K[1] + IN_OFF[i]]),
    t0: 0.35 + 0.15 * i, phase: i * 0.2,
  }));
  const IN_D = 1.1;

  // Outputs: what the platform serves (SaaS, apps, portals)
  const OUT_Y = [330, 540, 750], OUT_Q = [-8, 0, 8], OUT_X1 = 1770;
  const outputs = OUT_Y.map((y, j) => ({
    c: curve([K[0] + 20, K[1] + OUT_Q[j]], [1300, K[1] + OUT_Q[j]], [1460, y], [OUT_X1, y]),
    t0: 1.95 + 0.1 * j, phase: j * 0.29,
  }));
  const OUT_D = 0.7;

  // Collapse into the knot, then the knot glides into the "we" and the official logo motion takes over
  const COL_T0 = 4.2, COL_D = 0.65;
  // v5: glide 4.8-5.35 s; the logo motion starts at 4.92 s at 0.75 speed (3.6 s cycle), so the "we" appears (8%) at
  // ~5.21 s, right as the knot arrives and fades (5.2-5.45 s); "labs" opens 6.0-6.94 s; hold from ~8.02 s
  const GLIDE_T0 = 4.8, GLIDE_D = 0.55, KNOT_OUT_T0 = 5.2, KNOT_OUT_D = 0.25;
  const LOGO_T0 = 4.92, LOGO_SPEED = 0.75;

  // Lockup: Ibrand logo 905x213 without slogan, scaled 1.2 and centered above the editorial line (#wl in the DOM)
  const S = 1.2, LW = WL_VB.w * S, LX = (W - LW) / 2, LY = 372;
  const SLOT = { cx: LX + (WE_BOX.x + WE_BOX.w / 2) * S, cy: LY + (WE_BOX.y + WE_BOX.h / 2) * S };

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
    // v5: knot center between the platform position and the center of the "we"
    const g = easeInOut(prog(t, GLIDE_T0, GLIDE_D));
    return { cx: lerp(K[0], SLOT.cx, g), cy: lerp(K[1], SLOT.cy, g), g };
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
        // v2: every stream is a live product (no dashed planned stream)
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(' + INK + ',0.34)';
        strokeRange(ctx, s.c, lo, hi);
        // Origin node
        const na = prog(t, s.t0, 0.2) * (1 - prog(t, COL_T0, 0.3));
        if (na > 0) {
          ctx.fillStyle = 'rgba(' + INK + ',' + 0.9 * na + ')';
          ctx.beginPath(); ctx.arc(IN_X0, s.c.pts[0][1], 5, 0, Math.PI * 2); ctx.fill();
        }
        if (pa > 0) {
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

    // NÓ DA PLATAFORMA (aparece quando os fluxos chegam; pulsa; desliza até o "we" da marca e some nele)
    // v5: the knot moves along markGeom and shrinks while gliding, then fades as the official "we" grows in its place
    const kIn = easeOutBack(prog(t, 1.45, 0.4)), kOut = 1 - prog(t, KNOT_OUT_T0, KNOT_OUT_D);
    if (kIn > 0 && kOut > 0) {
      const m = markGeom(t);
      const r = KR * kIn * (1 + 0.25 * col) * (1 - 0.35 * m.g);
      ctx.fillStyle = 'rgba(' + AMBER + ',' + kOut + ')';
      ctx.beginPath(); ctx.arc(m.cx, m.cy, r * 0.55, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(' + AMBER + ',' + 0.6 * kOut + ')'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2); ctx.stroke();
      // Breathing ring while traffic flows
      if (t > 2.0 && t < COL_T0 + 0.4) {
        const ph = frac((t - 2.0) / 1.1), ra = (1 - ph) * 0.4 * (1 - prog(t, COL_T0, 0.4));
        ctx.strokeStyle = 'rgba(' + AMBER + ',' + ra + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(K[0], K[1], KR + 46 * easeOut(ph), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // MARCA: anel de pouso quando o nó entra no "we" (o logo em si é o SVG oficial no DOM, #wl)
    // v5: the canvas only marks the landing; the "we" and "labs" are drawn by the official motion SVG
    const rk = prog(t, GLIDE_T0 + GLIDE_D - 0.05, 0.6);
    if (rk > 0 && rk < 1) {
      ctx.strokeStyle = 'rgba(' + AMBER + ',' + 0.4 * (1 - rk) + ')'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(SLOT.cx, SLOT.cy, 110 + 120 * easeOut(rk), 0, Math.PI * 2); ctx.stroke();
    }
    // No slogan: the brand material has none, so the lockup is the logo plus the editorial line (DOM)
  }

  const settleAt = (t) => easeInOut(prog(t, COL_T0, 1.6));
  const fadeAt = (t) => easeOut(prog(t, 0, 0.6));
  return {
    drawScene, focusAt, settleAt, fadeAt, W, H,
    // v5: LOGO_T0/LOGO_SPEED drive the official Welabs motion; the editorial line waits for "labs" to open (6.6 s)
    IN_T0: inputs.map((s) => s.t0), OUT_T0: outputs.map((s) => s.t0), COL_T0, TAGLINE_T0: 6.6, LOCKUP_BOTTOM: LY + WL_VB.h * S,
    LOGO_T0, LOGO_SPEED,
  };
})();
