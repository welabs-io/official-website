// COREOGRAFIA DA ABERTURA CENTRAL ESG (dados espalhados -> retrato E/S/G -> três pontos viram a marca Report)
// Pure drawing: drawScene(ctx, t) depends only on t (timeline seconds). No clock, no Math.random.
const SC = (function () {
  const W = 1920, H = 1080;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const prog = (t, t0, d) => clamp01((t - t0) / d);
  const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
  const easeIn = (x) => Math.pow(clamp01(x), 3);
  const easeInOut = (x) => { const k = clamp01(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const easeOutBack = (x) => { const k = clamp01(x), c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  // Deterministic hash in [0,1)
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const rgb = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a === undefined ? 1 : a})`;

  // Pillars: E (environmental), S (social), G (governance); brand blue from report.svg fill
  const PILLAR = [[46, 158, 107], [224, 137, 43], [58, 107, 174]];
  const BRAND = [59, 107, 173];
  const WHITE = [255, 255, 255];
  const INK = [23, 42, 69];

  // Final lockup: Report logo 480 px wide, centered, under the DOM wordmark
  const LS = 480 / REPORT_LOGO.viewBox[0];
  const LX = W / 2 - 240, LY = 505;
  const M = REPORT_LOGO.transform;
  const toScreen = (p) => [LX + LS * (M[0] * p[0] + M[2] * p[1] + M[4]), LY + LS * (M[1] * p[0] + M[3] * p[1] + M[5])];
  const DOT = REPORT_LOGO.dotCenters.map(toScreen);
  const DOT_R = REPORT_LOGO.dotRadius * M[0] * LS;
  const DOT_PATHS = REPORT_LOGO.dots.map((d) => new Path2D(d));
  const LETTER_PATHS = REPORT_LOGO.letters.map((d) => new Path2D(d));

  // Report card ("retrato"): three rows of 12 cells and a check per row
  const CARD = { x: 500, y: 330, w: 920, h: 420, r: 28 };
  const ROW_Y = [445, 545, 645];
  const CELL = 38, PITCH = 44, CELL_X0 = 800;
  const CHECK_X = 1372, CHECK_R = 24;
  const cellX = (c) => CELL_X0 + c * PITCH + CELL / 2;

  // Beat times (seconds)
  const T = {
    gridIn: 0, arrive0: 0.25, arriveStep: 0.03, arriveDur: 0.8,
    card: 1.85, sort0: 2.0, sortStep: 0.018, sortDur: 0.7,
    check0: 3.3, checkStep: 0.12, collapse0: 4.5, cardOut: 4.55,
    rows: 2.75,
    travel0: 4.85, travelStep: 0.06, travelDur: 0.65,
    letters0: 5.3, letterStep: 0.07, letterDur: 0.42,
    wordmark: 5.45, slogan: 5.95, hold: 6.45
  };

  // Fragments: 36 scattered data pieces (12 per pillar), each with a kind
  const N = 36;
  const FR = [];
  for (let i = 0; i < N; i++) {
    const pillar = i % 3, k = Math.floor(i / 3); // k = slot in the pillar's row (0..11)
    const kind = k % 6; // 0..3 icons, 4 sheet, 5 document
    const cellIdx = (i * 17) % N; // stratified scatter: 9 x 4 jittered grid
    const gx = cellIdx % 9, gy = Math.floor(cellIdx / 9);
    const sx = 130 + (gx + 0.5) * (1660 / 9) + (hash(i + 1) - 0.5) * 90;
    const sy = 120 + (gy + 0.5) * (840 / 4) + (hash(i + 51) - 0.5) * 90;
    const dx = sx - W / 2, dy = sy - H / 2, dl = Math.hypot(dx, dy) || 1;
    const far = 760 + hash(i + 7) * 260;
    const size = kind === 4 ? [120, 88] : kind === 5 ? [78, 100] : [84 * (0.88 + hash(i + 3) * 0.24), 0];
    if (!size[1]) size[1] = size[0];
    FR.push({
      pillar, k, kind, scatter: [sx, sy],
      from: [sx + (dx / dl) * far, sy + (dy / dl) * far],
      rot0: (hash(i + 13) - 0.5) * 0.7, spin: (hash(i + 23) - 0.5) * 2.4,
      phase: hash(i + 31) * 6.283, size,
      ta: T.arrive0 + ((i * 11) % N) * T.arriveStep,
      ts: T.sort0 + ((i * 7) % N) * T.sortStep,
      slot: [cellX(k), ROW_Y[pillar]]
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // Icons drawn in a 40 x 40 box centered at the origin
  function icon(ctx, name, col) {
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const P = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let j = 2; j < pts.length; j += 2) ctx.lineTo(pts[j], pts[j + 1]); ctx.closePath(); ctx.fill(); };
    switch (name) {
      case 'leaf':
        ctx.beginPath(); ctx.moveTo(-13, 13); ctx.bezierCurveTo(-16, -9, 4, -17, 15, -15); ctx.bezierCurveTo(15, 4, 3, 15, -13, 13); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-12, 12); ctx.quadraticCurveTo(0, 0, 9, -9); ctx.stroke(); break;
      case 'drop':
        ctx.beginPath(); ctx.moveTo(0, -17); ctx.bezierCurveTo(6, -8, 12, -1, 12, 6); ctx.bezierCurveTo(12, 13, 6, 17, 0, 17);
        ctx.bezierCurveTo(-6, 17, -12, 13, -12, 6); ctx.bezierCurveTo(-12, -1, -6, -8, 0, -17); ctx.fill(); break;
      case 'bolt': P([4, -18, -11, 3, -1, 3, -4, 18, 11, -4, 1, -4]); break;
      case 'cloud':
        ctx.beginPath(); ctx.arc(-8, 4, 8, 0, 6.283); ctx.arc(2, -3, 11, 0, 6.283); ctx.arc(11, 5, 7, 0, 6.283); ctx.fill();
        roundRect(ctx, -16, 4, 33, 9, 4.5); ctx.fill(); break;
      case 'person':
        ctx.beginPath(); ctx.arc(0, -8, 7.5, 0, 6.283); ctx.fill();
        ctx.beginPath(); ctx.arc(0, 16, 13, Math.PI, 0); ctx.fill(); break;
      case 'people':
        ctx.globalAlpha *= 0.55; ctx.beginPath(); ctx.arc(8, -9, 6, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(8, 14, 11, Math.PI, 0); ctx.fill();
        ctx.globalAlpha /= 0.55; ctx.beginPath(); ctx.arc(-5, -6, 7, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(-5, 17, 12, Math.PI, 0); ctx.fill(); break;
      case 'heart':
        ctx.beginPath(); ctx.moveTo(0, 15); ctx.bezierCurveTo(-19, 2, -15, -16, 0, -7); ctx.bezierCurveTo(15, -16, 19, 2, 0, 15); ctx.fill(); break;
      case 'home':
        P([-16, 0, 0, -15, 16, 0]); ctx.fillRect(-11, -1, 22, 16);
        ctx.fillStyle = '#fff'; ctx.fillRect(-3.5, 5, 7, 10); break;
      case 'shield':
        ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(14, -11); ctx.lineTo(14, 0); ctx.bezierCurveTo(14, 9, 7, 14, 0, 18);
        ctx.bezierCurveTo(-7, 14, -14, 9, -14, 0); ctx.lineTo(-14, -11); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-1, 5); ctx.lineTo(7, -5); ctx.stroke(); break;
      case 'scale':
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(0, 14); ctx.moveTo(-8, 15); ctx.lineTo(8, 15);
        ctx.moveTo(-14, -9); ctx.lineTo(14, -9); ctx.stroke();
        ctx.beginPath(); ctx.arc(-11, 1, 6.5, 0, Math.PI); ctx.fill(); ctx.beginPath(); ctx.arc(11, 1, 6.5, 0, Math.PI); ctx.fill();
        ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-11, -9); ctx.lineTo(-16, 1); ctx.moveTo(-11, -9); ctx.lineTo(-6, 1);
        ctx.moveTo(11, -9); ctx.lineTo(6, 1); ctx.moveTo(11, -9); ctx.lineTo(16, 1); ctx.stroke(); break;
      case 'columns':
        P([-17, -6, 0, -17, 17, -6]); ctx.fillRect(-15, 12, 30, 4);
        for (const x of [-11, -2, 7]) ctx.fillRect(x, -4, 4.5, 15); break;
    }
  }
  const ICONS = [['leaf', 'drop', 'bolt', 'cloud'], ['person', 'people', 'heart', 'home'], ['shield', 'scale', 'columns', 'shield']];

  // One fragment: chip (scattered) morphing into a solid cell (sorted), then absorbed into its row's check
  function drawFragment(ctx, f, t) {
    if (t < f.ta) return;
    const pIn = easeOut(prog(t, f.ta, T.arriveDur));
    const pS = easeInOut(prog(t, f.ts, T.sortDur));
    const cAbs = T.collapse0 + (11 - f.k) * 0.025;
    const pA = easeIn(prog(t, cAbs, 0.38));
    if (pA >= 1) return;
    const floatK = 1 - pS;
    const fx = Math.sin(t * 1.3 + f.phase) * 9 * floatK, fy = Math.cos(t * 1.1 + f.phase * 1.7) * 9 * floatK;
    const sc = [lerp(f.from[0], f.scatter[0], pIn) + fx, lerp(f.from[1], f.scatter[1], pIn) + fy];
    let x = lerp(sc[0], f.slot[0], pS), y = lerp(sc[1], f.slot[1], pS) - Math.sin(Math.PI * pS) * 70;
    x = lerp(x, CHECK_X, pA);
    const rot = (f.rot0 + f.spin * (1 - pIn) + Math.sin(t * 0.9 + f.phase) * 0.06) * (1 - pS);
    const w = lerp(f.size[0], CELL, pS) * (1 - 0.7 * pA), h = lerp(f.size[1], CELL, pS) * (1 - 0.7 * pA);
    const fillK = clamp01(pS * 1.6 - 0.35);
    const col = PILLAR[f.pillar];
    ctx.save();
    ctx.globalAlpha = clamp01(pIn * 2.5) * (1 - clamp01((pA - 0.6) / 0.4));
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.shadowColor = rgb(INK, 0.16 * (1 - pS)); ctx.shadowBlur = 22 * (1 - pS); ctx.shadowOffsetY = 8 * (1 - pS);
    roundRect(ctx, -w / 2, -h / 2, w, h, lerp(f.kind === 5 ? 8 : 18, 9, pS));
    ctx.fillStyle = rgb(mix(WHITE, col, fillK)); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5; ctx.strokeStyle = rgb(INK, 0.08 * (1 - fillK)); ctx.stroke();
    const ia = 1 - clamp01(pS * 2.2);
    if (ia > 0) {
      ctx.globalAlpha *= ia;
      const s = lerp(1, CELL / Math.max(f.size[0], f.size[1]), pS);
      ctx.scale(s, s);
      if (f.kind < 4) { const k = f.size[0] / 84; ctx.scale(k * 1.15, k * 1.15); icon(ctx, ICONS[f.pillar][f.kind], rgb(col)); }
      else if (f.kind === 4) drawSheet(ctx, col);
      else drawDoc(ctx, col);
    }
    ctx.restore();
  }
  // Spreadsheet fragment: header in pillar color, 3 x 4 cells
  function drawSheet(ctx, col) {
    ctx.fillStyle = rgb(col, 0.9); roundRect(ctx, -50, -34, 100, 14, 4); ctx.fill();
    ctx.fillStyle = rgb(INK, 0.1);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { roundRect(ctx, -50 + c * 25.5, -14 + r * 16, 22, 12, 3); ctx.fill(); }
    ctx.fillStyle = rgb(col, 0.55); roundRect(ctx, -50 + 51, -14 + 16, 22, 12, 3); ctx.fill();
  }
  // Document fragment: folded corner, title bar in pillar color, text lines
  function drawDoc(ctx, col) {
    ctx.fillStyle = rgb(INK, 0.1); ctx.beginPath(); ctx.moveTo(23, -50); ctx.lineTo(39, -34); ctx.lineTo(23, -34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgb(col, 0.9); roundRect(ctx, -27, -36, 36, 8, 4); ctx.fill();
    ctx.fillStyle = rgb(INK, 0.12);
    for (let r = 0; r < 5; r++) { roundRect(ctx, -27, -18 + r * 12, r === 4 ? 30 : 54, 6, 3); ctx.fill(); }
  }

  // The report card behind the sorted cells
  function drawCard(ctx, t) {
    const a = easeOut(prog(t, T.card, 0.45)) * (1 - easeIn(prog(t, T.cardOut, 0.4)));
    if (a <= 0) return;
    const s = lerp(0.95, 1, easeOut(prog(t, T.card, 0.5))) * lerp(1, 0.96, easeIn(prog(t, T.cardOut, 0.4)));
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(CARD.x + CARD.w / 2, CARD.y + CARD.h / 2); ctx.scale(s, s); ctx.translate(-CARD.w / 2, -CARD.h / 2);
    ctx.shadowColor = rgb(INK, 0.14); ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    roundRect(ctx, 0, 0, CARD.w, CARD.h, CARD.r); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.shadowColor = 'transparent';
    // Header: brand square and two placeholder lines (no text)
    ctx.fillStyle = rgb(BRAND); roundRect(ctx, 48, 34, 28, 28, 7); ctx.fill();
    ctx.fillStyle = rgb(INK, 0.14); roundRect(ctx, 92, 38, 210, 9, 4.5); ctx.fill(); roundRect(ctx, 92, 54, 130, 7, 3.5); ctx.fill();
    // Row tracks (empty slots the cells fall into)
    ctx.fillStyle = rgb(INK, 0.05);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) {
      roundRect(ctx, cellX(c) - CELL / 2 - CARD.x, ROW_Y[r] - CELL / 2 - CARD.y, CELL, CELL, 9); ctx.fill();
    }
    ctx.restore();
  }

  // Row check: pops when the row is complete, then flies to become one of the three Report dots
  function drawChecks(ctx, t) {
    for (let r = 0; r < 3; r++) {
      const pop = easeOutBack(prog(t, T.check0 + r * T.checkStep, 0.38));
      if (pop <= 0) continue;
      const pT = easeInOut(prog(t, T.travel0 + r * T.travelStep, T.travelDur));
      const p0 = [CHECK_X, ROW_Y[r]], p1 = DOT[r];
      const x = lerp(p0[0], p1[0], pT), y = lerp(p0[1], p1[1], pT) - Math.sin(Math.PI * pT) * 90;
      const rad = lerp(CHECK_R * pop, DOT_R, pT);
      if (pT >= 1) {
        ctx.save(); ctx.translate(LX, LY); ctx.scale(LS, LS); ctx.transform(M[0], M[1], M[2], M[3], M[4], M[5]);
        ctx.fillStyle = REPORT_LOGO.fill; ctx.fill(DOT_PATHS[r]); ctx.restore();
        continue;
      }
      ctx.save();
      ctx.fillStyle = rgb(mix(PILLAR[r], BRAND, easeInOut(prog(t, T.travel0 + r * T.travelStep, T.travelDur * 0.45))));
      ctx.beginPath(); ctx.arc(x, y, Math.max(0, rad), 0, 6.283); ctx.fill();
      const ca = 1 - prog(t, T.travel0 - 0.08, 0.2);
      if (ca > 0) {
        ctx.globalAlpha = ca; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4.5 * pop; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(x - 9 * pop, y + 1 * pop); ctx.lineTo(x - 2.5 * pop, y + 7.5 * pop); ctx.lineTo(x + 10 * pop, y - 6.5 * pop); ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Letters r-e-p-o-r-t pop in from the dots leftward
  function drawLetters(ctx, t) {
    for (let j = 0; j < 6; j++) {
      const p = prog(t, T.letters0 + (5 - j) * T.letterStep, T.letterDur);
      if (p <= 0) continue;
      const dy = (1 - easeOutBack(p)) * 34;
      ctx.save(); ctx.globalAlpha = easeOut(p * 1.4);
      ctx.translate(LX, LY + dy); ctx.scale(LS, LS); ctx.transform(M[0], M[1], M[2], M[3], M[4], M[5]);
      ctx.fillStyle = REPORT_LOGO.fill; ctx.fill(LETTER_PATHS[j]); ctx.restore();
    }
  }

  // Background: soft paper gradient + dot grid, pre-rendered once (static, deterministic)
  let bgBase = null, bgGrid = null;
  function prepare() {
    bgBase = document.createElement('canvas'); bgBase.width = W; bgBase.height = H;
    const b = bgBase.getContext('2d');
    const g = b.createRadialGradient(W / 2, H * 0.48, 80, W / 2, H / 2, 1150);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#E6EDF7');
    b.fillStyle = g; b.fillRect(0, 0, W, H);
    bgGrid = document.createElement('canvas'); bgGrid.width = W; bgGrid.height = H;
    const d = bgGrid.getContext('2d'); d.fillStyle = 'rgba(58,107,174,0.16)';
    for (let y = 20; y < H; y += 40) for (let x = 20; x < W; x += 40) { d.beginPath(); d.arc(x, y, 1.7, 0, 6.283); d.fill(); }
  }

  function drawScene(ctx, t) {
    if (!bgBase) prepare();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    ctx.drawImage(bgBase, 0, 0);
    ctx.globalAlpha = easeOut(prog(t, T.gridIn, 0.6)); ctx.drawImage(bgGrid, 0, 0); ctx.globalAlpha = 1;
    drawCard(ctx, t);
    // Fragments still floating draw above the card; sorted ones sit in it
    for (const f of FR) drawFragment(ctx, f, t);
    drawChecks(ctx, t);
    drawLetters(ctx, t);
  }

  return { drawScene, T, ROW_Y };
})();
