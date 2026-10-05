// COREOGRAFIA DA ABERTURA DE RESÍDUOS (anel da reciclagem fecha -> material segue pelo trânsito -> tudo vira a régua da marca)
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
  const ACC = '52,211,153', INK = '214,232,224', BG = '10,26,20';
  const TAU = Math.PI * 2, TOP = -Math.PI / 2;

  // Recycling ring (closed loop): drawn clockwise from the top
  const C = [500, 520], RR = 165;
  const RING_T0 = 0.4, RING_D = 1.2;
  // Ring stations as fractions of the loop from the top: Ecoponto, Pesagem, Recibo
  const RING_ST = [0, 1 / 3, 2 / 3];
  const ringPt = (s) => [C[0] + RR * Math.cos(TOP + TAU * s), C[1] + RR * Math.sin(TOP + TAU * s)];
  const ringStT = (i) => RING_T0 + RING_D * RING_ST[i];

  // Transit route: leaves the ring at its right point and runs MTR -> Transporte -> Destino -> CDF
  const EXIT = 0.25, RY = C[1], RX0 = C[0] + RR;
  const ST_X = [900, 1180, 1460, 1740];
  // Token legs: [start time, end time] from the previous stop to station i
  const LEGS = [[3.0, 3.35], [3.5, 3.9], [4.05, 4.45], [4.6, 5.0]];
  const ROUTE_T0 = 2.85;

  // Collapse into the brand rule under the product name
  const COL_T0 = 5.45, COL_D = 0.8;
  const RULE = { x0: 880, x1: 1040, y: 572 };

  function tokenX(t) {
    // Piecewise travel with short dwells at each station
    let x = RX0;
    for (let i = 0; i < LEGS.length; i++) {
      const [a, b] = LEGS[i];
      if (t >= b) { x = ST_X[i]; continue; }
      if (t > a) x = lerp(i ? ST_X[i - 1] : RX0, ST_X[i], easeInOut((t - a) / (b - a)));
      break;
    }
    return x;
  }
  const stationLit = (t, i) => prog(t, LEGS[i][1], 0.25);

  function ringArc(ctx, a, b) {
    // Arc between loop fractions a..b (clockwise from the top)
    if (b - a <= 0.0005) return;
    ctx.beginPath(); ctx.arc(C[0], C[1], ctx.__r, TOP + TAU * a, TOP + TAU * b); ctx.stroke();
  }

  function ringComet(ctx, head, al) {
    const TAIL = 0.12, STEPS = 8;
    for (let k = 0; k < STEPS; k++) {
      const a = head - TAIL * (k + 1) / STEPS, b = head - TAIL * k / STEPS;
      ctx.strokeStyle = 'rgba(' + ACC + ',' + (al * (1 - k / STEPS)) + ')';
      ctx.lineWidth = 4.5 - 2.6 * (k / STEPS);
      ringArc(ctx, a, b);
    }
    const p = [C[0] + ctx.__r * Math.cos(TOP + TAU * head), C[1] + ctx.__r * Math.sin(TOP + TAU * head)];
    ctx.fillStyle = 'rgba(' + ACC + ',' + al + ')';
    ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, TAU); ctx.fill();
  }

  // Lamp focus for the background shader: ring, then the token, then the name
  function focusAt(t) {
    const onRoute = prog(t, 2.9, 0.4), toName = easeInOut(prog(t, COL_T0, 1.0));
    const px = lerp(lerp(C[0], tokenX(t), onRoute), 960, toName), py = lerp(C[1], 540, toName);
    return { p: [px, py], amt: 0.5 + 0.1 * onRoute - 0.12 * toName };
  }

  function drawScene(ctx, t) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const col = easeInOut(prog(t, COL_T0, COL_D));
    const fadeOut = 1 - prog(t, COL_T0, COL_D * 0.7);

    // ANEL DA RECICLAGEM (desenha, fecha, circula; no fim encolhe para a ponta da régua)
    const rk = easeInOut(prog(t, RING_T0, RING_D));
    if (rk > 0 && col < 1) {
      ctx.save();
      ctx.__r = RR * (1 - col);
      // The ring shrinks while its center travels to the left end of the rule
      ctx.translate(lerp(0, RULE.x0 - C[0], col), lerp(0, RULE.y - C[1], col));
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(' + INK + ',' + 0.34 * fadeOut + ')';
      ringArc(ctx, 0, rk);
      // Closed-loop glow once the ring completes
      const closed = prog(t, RING_T0 + RING_D, 0.35) * fadeOut;
      if (closed > 0) {
        ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(' + ACC + ',' + 0.55 * closed + ')';
        ringArc(ctx, 0, 1);
      }
      // Material circulating the loop; head at the exit point exactly when the token leaves (3.0 s)
      const ca = prog(t, 1.6, 0.4) * fadeOut;
      if (ca > 0) for (let m = 0; m < 2; m++) ringComet(ctx, frac(EXIT + 0.6 * (t - 3.0) + m * 0.5), ca);
      // Station nodes on the ring
      RING_ST.forEach((s, i) => {
        const nk = easeOutBack(prog(t, ringStT(i), 0.3)) * fadeOut; if (nk <= 0) return;
        const p = [C[0] + ctx.__r * Math.cos(TOP + TAU * s), C[1] + ctx.__r * Math.sin(TOP + TAU * s)];
        ctx.fillStyle = 'rgba(' + BG + ',1)';
        ctx.beginPath(); ctx.arc(p[0], p[1], 11 * nk, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(' + ACC + ',' + fadeOut + ')'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(p[0], p[1], 11 * nk, 0, TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(' + ACC + ',' + fadeOut + ')';
        ctx.beginPath(); ctx.arc(p[0], p[1], 5 * nk, 0, TAU); ctx.fill();
      });
      ctx.restore();
    }

    // ROTA DO TRÂNSITO (MTR -> Transporte -> Destino -> CDF; no fim vira a régua da marca)
    const ra = prog(t, ROUTE_T0, 0.3);
    if (ra > 0) {
      const tx = tokenX(t);
      const x0 = lerp(RX0, RULE.x0, col), x1 = lerp(ST_X[3], RULE.x1, col), y = lerp(RY, RULE.y, col);
      if (col <= 0) {
        // Preview of the route (dashed) ahead of the token, lit trail behind it
        ctx.setLineDash([10, 12]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(' + INK + ',' + 0.22 * ra + ')';
        ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(' + ACC + ',0.8)';
        if (tx > RX0 + 0.5) { ctx.beginPath(); ctx.moveTo(RX0, y); ctx.lineTo(tx, y); ctx.stroke(); }
      } else {
        // Route contracts into the rule
        ctx.lineWidth = lerp(3, 5, col); ctx.strokeStyle = 'rgba(' + ACC + ',' + lerp(0.8, 1, col) + ')';
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      }
      // Station nodes: hollow until the token arrives, then filled; CDF gets a check
      ST_X.forEach((sx, i) => {
        const lit = stationLit(t, i), al = ra * fadeOut; if (al <= 0) return;
        const x = lerp(sx, lerp(RULE.x0, RULE.x1, i / 3), col), r = i === 3 ? 16 : 12;
        ctx.fillStyle = 'rgba(' + BG + ',' + al + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(' + (lit > 0 ? ACC : INK) + ',' + al * (lit > 0 ? 1 : 0.4) + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
        if (lit > 0) {
          ctx.fillStyle = 'rgba(' + ACC + ',' + al + ')';
          ctx.beginPath(); ctx.arc(x, y, (i === 3 ? r : 6) * easeOutBack(lit), 0, TAU); ctx.fill();
          if (i === 3) {
            const ck = easeOut(prog(t, LEGS[3][1] + 0.1, 0.3));
            if (ck > 0) {
              ctx.strokeStyle = 'rgba(' + BG + ',' + al + ')'; ctx.lineWidth = 3.5;
              ctx.beginPath(); ctx.moveTo(x - 7, y + 1);
              ctx.lineTo(x - 7 + 5 * Math.min(1, ck * 2), y + 1 + 5 * Math.min(1, ck * 2));
              if (ck > 0.5) ctx.lineTo(x - 2 + 10 * (ck - 0.5) * 2, y + 6 - 12 * (ck - 0.5) * 2);
              ctx.stroke();
            }
          }
          // Arrival ring
          const ar = prog(t, LEGS[i][1], 0.6);
          if (ar > 0 && ar < 1) {
            ctx.strokeStyle = 'rgba(' + ACC + ',' + 0.45 * (1 - ar) * al + ')'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, r + 30 * easeOut(ar), 0, TAU); ctx.stroke();
          }
        }
      });
      // The material token itself (leaves the ring at 3.0 s, rests on CDF)
      const ta = prog(t, 2.95, 0.1) * (1 - prog(t, LEGS[3][1], 0.2));
      if (ta > 0 && col <= 0) {
        ctx.fillStyle = 'rgba(' + ACC + ',' + ta + ')';
        ctx.beginPath(); ctx.arc(tx, y, 7, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(' + ACC + ',' + 0.35 * ta + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(tx, y, 14, 0, TAU); ctx.stroke();
      }
    }
  }

  // Background settles by 6.8 s, so the held cover frame (6.8-8.5 s) is static
  const settleAt = (t) => easeInOut(prog(t, COL_T0, 1.3));
  const fadeAt = (t) => easeOut(prog(t, 0, 0.6));
  return {
    drawScene, focusAt, settleAt, fadeAt, W, H,
    RING_ST_T0: RING_ST.map((s, i) => ringStT(i)), RING_CLOSED_T0: RING_T0 + RING_D,
    ST_T0: LEGS.map((l) => l[1]), ROUTE_T0, COL_T0, NAME_T0: 5.95, SLOGAN_T0: 6.3,
  };
})();
