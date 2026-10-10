// COREOGRAFIA COMPARTILHADA DA ABERTURA DE PRODUTO WELABS (uma para os 5 produtos, parametrizada por slug)
// Reads the official motion logo from window.WELABS_MOTION (motion/<slug>-dark.svg + motion.json of the brand version the
// manifest names) and never redraws it. Around it: a lamp, two quiet orbits, a burst where the product sign lands, the
// endorsed logo ("by welabs") taking the place of the motion logo at the hold frame, and one role word.
// Pure timeline: every tween is on the paused GSAP timeline, no clock and no random, so seek is deterministic.
// Usage: ProductIntro.build({id, slug, duration}) -> paused timeline of exactly `duration` seconds.
// Expected DOM (ids): #lamp, #orbits, #fx, #lg[data-wl-motion][data-wl-scale], #seal > img#endorsed[data-brand-src], #role (#bar, #word).
(function () {
  var W = 1920, H = 1080;
  var SCALE = 1; // px per logo unit, the same for the five products so the x-height matches across the family
  var SPEED = 0.9; // official cycle 4.8 s played at 0.9 speed (4.32 s); the hold frame is reached at 86% of it
  var T0 = 0.45; // start of the official motion
  // Where the sign of each product lands, as a fraction of the official cycle (motion.json windows)
  var LAND = { domus: 0.34, magneto: 0.34, knowly: 0.48, relloo: 0.5, tuner: 0.46 };
  var AMBER = '#FFB020', INK = '#E6E6EC';

  function el(parent, css) {
    var d = document.createElement('div');
    d.style.cssText = 'position:absolute;pointer-events:none;' + css;
    parent.appendChild(d);
    return d;
  }

  // Reads the viewBox of the endorsed logo (same loader URL scheme, synchronous like the loader itself)
  function endorsedViewBox(slug) {
    var req = new XMLHttpRequest();
    req.open('GET', window.BRAND.url('welabs', slug + '-endorsed-on-dark.svg'), false);
    req.send();
    var m = /viewBox="([^"]+)"/.exec(req.responseText);
    if (req.status !== 200 || !m) throw new Error('product-intro: no viewBox for ' + slug);
    return m[1].split(/\s+/).map(Number);
  }

  // Centre of the amber sign in composition pixels, measured with the timeline parked on the hold frame (every motion
  // transform resolved, so a sign that slides in, like the Relloo "o", is measured where it ends up)
  function signCentre(tl, hold, host) {
    var root = document.getElementById('root'), rr = root.getBoundingClientRect(), k = rr.width / W;
    tl.time(hold, true);
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    host.querySelectorAll('[fill="#FFB020"],[stroke="#FFB020"]').forEach(function (n) {
      var b = n.getBoundingClientRect();
      x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom);
    });
    tl.time(0, true);
    return [((x0 + x1) / 2 - rr.left) / k, ((y0 + y1) / 2 - rr.top) / k];
  }

  function build(cfg) {
    var M = window.WELABS_MOTION, D = cfg.duration, slug = cfg.slug;
    var L = M.logos[slug], vb = L.vb, ev = endorsedViewBox(slug);
    var host = document.getElementById('lg'), seal = document.getElementById('seal'), img = document.getElementById('endorsed');
    var role = document.getElementById('role'), bar = document.getElementById('bar'), word = document.getElementById('word');
    var lamp = document.getElementById('lamp'), orbits = document.getElementById('orbits'), fx = document.getElementById('fx');

    // LAYOUT (logo + seal + role word form one group centred on the frame; x centred, y from the group height)
    var w = ev[2] * SCALE, h = ev[3] * SCALE, GAP = 96, ROLE_H = 56;
    var left = Math.round((W - w) / 2), top = Math.round((H - (h + GAP + ROLE_H)) / 2);
    host.style.position = 'absolute'; host.style.left = left + 'px'; host.style.top = top + 'px';
    seal.style.cssText = 'position:absolute;left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;opacity:0';
    img.style.cssText = 'display:block;width:100%;height:100%';
    role.style.top = (top + h + GAP) + 'px';
    var logoBottomPct = (1 - vb[3] / ev[3]) * 100; // share of the endorsed box that is only the "by welabs" seal
    var cx = W / 2, cy = top + h / 2;

    var tl = gsap.timeline({ paused: true });
    tl.to({}, { duration: D }, 0); // holds the declared duration

    // LÂMPADA E ÓRBITAS (fundo quieto: acende, respira uma vez no pouso do sinal e fica)
    lamp.style.cssText = 'position:absolute;left:' + (cx - 700) + 'px;top:' + (cy - 700) + 'px;width:1400px;height:1400px;border-radius:50%;' +
      'background:radial-gradient(circle,rgba(255,176,32,0.16) 0%,rgba(255,176,32,0.06) 38%,rgba(255,176,32,0) 68%);opacity:0';
    tl.fromTo(lamp, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0);
    var C = M.cycle * SPEED, land = T0 + LAND[slug] * C, hold = T0 + M.hold * C;
    tl.to(lamp, { scale: 1.12, duration: 0.5, ease: 'power2.out' }, land);
    tl.to(lamp, { scale: 1, duration: 1.2, ease: 'power2.inOut' }, land + 0.5);
    [[520, 1], [720, -1]].forEach(function (o, i) {
      var r = o[0], ring = el(orbits, 'left:' + (cx - r) + 'px;top:' + (cy - r) + 'px;width:' + 2 * r + 'px;height:' + 2 * r + 'px;border-radius:50%;' +
        'border:2px dashed rgba(230,230,236,0.10);opacity:0');
      tl.fromTo(ring, { opacity: 0, scale: 0.86, rotation: 0 }, { opacity: 1, scale: 1, duration: 1.3, ease: 'power3.out' }, 0.2 + 0.15 * i);
      tl.to(ring, { rotation: o[1] * 40, duration: hold + 1.0, ease: 'power2.out' }, 0.2); // comes to rest before the closing frame
    });

    // MOVIMENTO OFICIAL (motion.json: o próprio SVG da marca, sem redesenho)
    M.play(tl, host, T0, SPEED);
    var sc = signCentre(tl, hold, host), sx = sc[0], sy = sc[1];

    // PLAYFUL BURST at the sign: two ripples and ten sparks, all deterministic
    for (var k = 0; k < 2; k++) {
      var ripple = el(fx, 'left:' + (sx - 80) + 'px;top:' + (sy - 80) + 'px;width:160px;height:160px;border-radius:50%;border:3px solid ' + AMBER + ';opacity:0');
      tl.fromTo(ripple, { opacity: 0.85, scale: 0.25 }, { opacity: 0, scale: 3.2 - 0.6 * k, duration: 1.2, ease: 'power2.out', immediateRender: false }, land + 0.16 * k);
    }
    for (var s = 0; s < 10; s++) {
      var a = (s * 36 + (s % 2 ? 11 : 0)) * Math.PI / 180, dist = 150 + (s % 3) * 46, sz = 8 + (s % 3) * 3;
      var spark = el(fx, 'left:' + (sx - sz / 2) + 'px;top:' + (sy - sz / 2) + 'px;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + (s % 2 ? AMBER : '#FFE2AA') + ';opacity:0');
      tl.fromTo(spark, { opacity: 1, x: 0, y: 0, scale: 1 }, { opacity: 0, x: Math.cos(a) * dist, y: Math.sin(a) * dist, scale: 0.3, duration: 0.95 + 0.1 * (s % 3), ease: 'power3.out', immediateRender: false }, land + 0.02 * s);
    }

    // SELO ENDOSSADO (no quadro de repouso do logo oficial o logo endossado assume; o "by welabs" se revela por baixo)
    tl.set(host, { opacity: 0 }, hold);
    tl.set(seal, { opacity: 1, clipPath: 'inset(0% 0% ' + logoBottomPct + '% 0%)' }, hold);
    tl.fromTo(seal, { clipPath: 'inset(0% 0% ' + logoBottomPct + '% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.out', immediateRender: false }, hold + 0.15);

    // PAPEL DO PRODUTO (uma palavra: barra âmbar abre, palavra sobe)
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.out' }, hold + 0.95);
    tl.fromTo(word, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, hold + 1.05);
    return tl;
  }

  window.ProductIntro = { build: build, INK: INK };
})();
