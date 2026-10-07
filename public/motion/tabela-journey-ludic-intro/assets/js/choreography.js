// COREOGRAFIA DA ABERTURA (porte 1:1 de choreography.ts)
// Pure math: sceneAt(t, layout, jitter) -> poses. Times are in "scene seconds" (the login's own clock).
const CRANE_JOBS = [['lg-s0'], ['lg-s1'], ['lg-s2'], ['lg-red'], ['lg-tabe'], ['lg-la']];
const T0 = 0.28, MOVE = 0.13, LOWER = 0.11, RETURN = 0.1, TRIP = MOVE + LOWER + RETURN, BOUNCE = 0.1;
const DRILL = { enter: 0.22, drive: 0.46, exit: 0.26 };
const RING_LIFE = 0.45;
const RING_SPEED = RING_LIFE / (DRILL.exit + 0.05);
function introTimeline() {
  const land = T0 + (CRANE_JOBS.length - 1) * TRIP + MOVE + LOWER;
  const drill = land + 0.02;
  const seat = drill + DRILL.enter + DRILL.drive;
  const dur = seat + DRILL.exit + 0.1;
  return { land, drill, seat, dur };
}
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const easeIn = (x) => Math.pow(clamp01(x), 3);
const easeInOut = (x) => { const k = clamp01(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };

function sceneAt(t, layout, jitter) {
  const { width: W, height: H, dpr, logo, dot, bounds } = layout;
  const TL = introTimeline();
  const jibY = H * 0.86, mastX = W * 0.87, pickX = mastX - W * 0.12, carryY = jibY - 13 * dpr - H * 0.1;
  const slide = (1 - easeOut(t / 0.28)) * W * 0.32 + Math.pow(clamp01((t - TL.land - 0.1) / 0.4), 2) * W * 0.45;
  const craneAlpha = 1 - clamp01((t - TL.land - 0.3) / 0.25);
  const poses = new Map();
  let trolley = pickX, hook = carryY;
  CRANE_JOBS.forEach((ids, i) => {
    const x0 = Math.min(...ids.map((id) => bounds[id][0]));
    const x1 = Math.max(...ids.map((id) => bounds[id][1]));
    const top = Math.max(...ids.map((id) => bounds[id][2]));
    const ax = logo[0] + ((x0 + x1) / 2) * logo[2];
    const ay = logo[1] + top * logo[3];
    const u = t - (T0 + i * TRIP);
    const last = i === CRANE_JOBS.length - 1;
    let dx = 0, dy = 0, angle = 0, alpha = 1;
    if (u < 0) { alpha = 0; }
    else if (u < MOVE) {
      const k = easeInOut(u / MOVE); const x = pickX + (ax - pickX) * k;
      dx = x - ax; dy = carryY - ay;
      angle = Math.sin((Math.PI * u) / MOVE) * 0.08 * Math.sign(pickX - ax);
      alpha = clamp01(u / 0.04); trolley = x; hook = carryY;
    } else if (u < MOVE + LOWER) {
      const k = (u - MOVE) / LOWER; const y = carryY + (ay - carryY) * k * k;
      dy = y - ay; trolley = ax; hook = y;
    } else {
      const b = u - MOVE - LOWER;
      if (b < BOUNCE) { const k = b / BOUNCE; dy = Math.sin(Math.PI * k) * 4 * dpr * (1 - k * 0.3); }
      const k = easeInOut(clamp01(b / (last ? 0.3 : RETURN)));
      if (last || u < TRIP) { trolley = ax + (pickX - ax) * k; hook = ay + (carryY - ay) * k; }
    }
    for (const id of ids) poses.set(id, { id, dx, dy, angle, alpha, pivot: [ax, ay] });
  });
  const seated = t - TL.drill >= DRILL.enter + DRILL.drive;
  const dotX = logo[0] + dot.cx * logo[2], dotY = logo[1] + dot.cy * logo[3], R = dot.r * logo[2];
  poses.set('lg-dot', { id: 'lg-dot', dx: 0, dy: 0, angle: 0, alpha: seated ? 1 : 0, pivot: [dotX, dotY] });
  const u = t - TL.drill;
  let drill = [0, 0, 0, 0], screw = [0, 0, 0, 0], fx = [-1, -1, 1, 0];
  const far = [dotX + W * 0.16, dotY + H * 0.5];
  if (u >= 0) {
    if (u < DRILL.enter) {
      const k = easeOut(u / DRILL.enter);
      drill = [far[0] + (dotX - far[0]) * k, far[1] + (dotY - far[1]) * k, 0.55 * (1 - k) + 0.12, clamp01(u / 0.06)];
      screw = [1.55, 0, 1, 1];
    } else if (u < DRILL.enter + DRILL.drive) {
      const k = (u - DRILL.enter) / DRILL.drive; const e = easeInOut(k); const spin = e * Math.PI * 5;
      drill = [dotX + (jitter() - 0.5) * 1.4 * dpr, dotY + (jitter() - 0.5) * 1.4 * dpr, 0.12, 1];
      screw = [1.55 - 0.55 * e, spin, 1, 1];
      fx = [u - DRILL.enter, -1, 1 - 0.1 * e, spin * 0.6];
    } else {
      const v = u - DRILL.enter - DRILL.drive; const k = clamp01(v / DRILL.exit); const e = easeIn(k);
      drill = [dotX + (far[0] - dotX) * e, dotY + (far[1] - dotY) * e, 0.12 + 0.4 * e, 1 - k];
      screw = [1, 0, 1 - clamp01(v / 0.18), v < 0.18 ? 1 : 0];
      fx = [DRILL.drive + v, v * RING_SPEED, 0.9 + 0.1 * k, 0];
    }
  }
  const order = ['lg-red', 'lg-s0', 'lg-s1', 'lg-s2', 'lg-tabe', 'lg-la', 'lg-dot'];
  return {
    pieces: order.map((id) => poses.get(id)).filter((p) => !!p && p.alpha > 0),
    crane: [trolley + slide, hook, slide, craneAlpha],
    dot: [dotX, dotY, R, 0], drill, screw, fx,
  };
}
