// COREOGRAFIA DA ABERTURA CONCEITUAL DO MAGNETO (dois ímãs em "C" que se atraem, encaixam e viram o "m")
// The "m" is never redrawn: its outline is read at run time from the official 1.3.0 logo (the file the manifest names),
// cut at the seam x = 129 into two halves, and each half is one magnet. Rotated 90 degrees counter-clockwise the halves are
// two stacked "C" shapes open to the right; a clockwise 90 degree turn after the snap lands them exactly on the "m" of
// magneto-endorsed-on-dark.svg, which then takes over (wordmark wipe, "by welabs" seal, role word).
// Pure function of time: one paused GSAP tween drives render(t) through a setter, no clock and no random, so seek is exact.
// Expected DOM inside the root: img.wm (data-brand-src="welabs/magneto-endorsed-on-dark.svg"), div.role (span.bar, span.word).
// Usage: MagnetoIntro.build({root, duration}) -> paused timeline; MagnetoIntro.mount(root) -> {render(t), layout} (storyboard, checks).
(function () {
  var W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg', AMBER = '#FFB020', INK = '#E6E6EC';
  var SEAM = 129, CX = 129, CY = 133.65; // seam and centre of the "m" box (x 9..249, y 57.3..210) in logo units
  var KBIG = 1.9, PBIG = [740, 540]; // opening scale and screen position of the magnet pair
  var GAP = 96, ROLE_H = 56, WORD_CUT = 309; // layout gap, role height, logo-box y (px) where the seal region starts
  var SEAL_W = 400; // width (px at scale 1) of the "by welabs" seal region in the endorsed logo box; the seal wipe sweeps only this
  var L_WORD = 254; // x (logo units) where the wordmark wipe starts: past the "m" (ends at 249), before the "a" (starts at 259.4)

  // CRONOMETRAGEM (segundos; alvo 4,5 a 5 s no total)
  var T = {
    entry: 0.6, snap: 1.42, snapDur: 0.08, hit: 1.483, fieldOut0: 1.5, fieldOut1: 1.85,
    turn0: 1.8, turn1: 2.6, cam0: 1.85, cam1: 2.65, wipe0: 2.65, wipe1: 3.25,
    seal0: 3.2, seal1: 3.5, role0: 3.3, role1: 3.6
  };

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function smooth(a, b, t) { var u = clamp01((t - a) / (b - a)); return u * u * (3 - 2 * u); }
  function ease(name) { var f = gsap.parseEase(name); return function (u) { return u <= 0 ? 0 : u >= 1 ? 1 : f(u); }; }
  var eEntry = ease('power4.out'), eRot = ease('back.inOut(0.9)'), eCam = ease('power3.inOut');
  var eWipe = ease('power3.out'), eSeal = ease('power3.out'), eRole = ease('power3.out');

  function get(url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.send();
    if (req.status !== 200) throw new Error('magneto-intro: HTTP ' + req.status + ' for ' + url);
    return req.responseText;
  }

  // GEOMETRIA OFICIAL (lida do SVG da marca; a peça não carrega cópia do desenho)
  var logoCache = null;
  function readLogo() {
    if (logoCache) return logoCache;
    var txt = get(window.BRAND.url('welabs', 'magneto-logo-on-dark.svg'));
    var path = /<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})"/.exec(txt);
    var pole = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="(#[0-9A-Fa-f]{6})"/.exec(txt);
    if (!path || !pole) throw new Error('magneto-intro: unexpected magneto logo markup');
    var ev = /viewBox="([^"]+)"/.exec(get(window.BRAND.url('welabs', 'magneto-endorsed-on-dark.svg')));
    logoCache = {
      m: path[1].split('Z')[0] + 'Z', fill: path[2],
      pole: {x: +pole[1], y: +pole[2], w: +pole[3], h: +pole[4], fill: pole[5]},
      ev: ev[1].split(/\s+/).map(Number)
    };
    return logoCache;
  }

  var uid = 0;
  // Distance of each magnet from the seam, in logo units: fast entry, accelerating attraction, snap with overshoot, settle
  function dist(t) {
    if (t < T.entry) return lerp(330, 110, eEntry(t / T.entry));
    if (t < T.snap) { var u = (t - T.entry) / (T.snap - T.entry); return 110 - 102 * u * u; } // quadratic pull keeps the approach moving
    if (t < T.snap + T.snapDur) { var v = (t - T.snap) / T.snapDur; return 8 - 13 * v * v; }
    var s = t - (T.snap + T.snapDur);
    if (s >= 0.3) return 0;
    return -5 * Math.exp(-13 * s) * Math.cos(26 * s) * (1 - smooth(0.2, 0.3, s));
  }

  function mount(root) {
    var logo = readLogo(), ev = logo.ev, id = ++uid;
    var w = ev[2], h = ev[3];
    var left = Math.round((W - w) / 2), top = Math.round((H - (h + GAP + ROLE_H)) / 2);
    var P1 = [left + CX - ev[0], top + CY - ev[1]]; // screen position of the "m" centre in the final logo (scale 1)
    var wm = root.querySelector('img.wm'), role = root.querySelector('.role');
    var bar = role.querySelector('.bar'), word = role.querySelector('.word');
    wm.style.cssText = 'position:absolute;display:block;left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;visibility:hidden';
    role.style.top = (top + h + GAP) + 'px';

    // CENA (SVG em unidades do logo; metades do "m" recortadas do contorno oficial)
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'scene'); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;left:0;top:0';
    var p = logo.pole, pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
    var cap = function (cls, x, wd) { return '<rect class="' + cls + '" x="' + x + '" y="156" width="' + wd + '" height="54" fill="' + AMBER + '"/>'; };
    var halo = function (cls, cx) { return '<circle class="' + cls + '" cx="' + cx + '" cy="200" r="52" fill="url(#hg' + id + ')" opacity="0"/>'; };
    svg.innerHTML =
      '<defs>' +
      '<clipPath id="cA' + id + '"><rect x="-300" y="-100" width="429.8" height="600"/></clipPath>' +
      '<clipPath id="cB' + id + '"><rect x="128.2" y="-100" width="500" height="600"/></clipPath>' +
      '<clipPath id="cM' + id + '"><path d="' + logo.m + '"/></clipPath>' +
      '<radialGradient id="hg' + id + '"><stop offset="0" stop-color="' + AMBER + '" stop-opacity=".6"/><stop offset="1" stop-color="' + AMBER + '" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<g class="cam">' +
      '<g class="fields"></g>' +
      '<g class="pA">' + halo('hAo', 27) + halo('hAs', 120) +
      '<g clip-path="url(#cA' + id + ')"><path d="' + logo.m + '" fill="' + logo.fill + '"/><g clip-path="url(#cM' + id + ')">' + cap('kAo', 9, 36) + cap('kAs', 111, 19) + '</g></g></g>' +
      '<g class="pB">' + halo('hBs', 138) + halo('hBo', 231) +
      '<g clip-path="url(#cB' + id + ')"><path d="' + logo.m + '" fill="' + logo.fill + '"/><g clip-path="url(#cM' + id + ')">' + cap('kBs', 128, 19) + '</g>' +
      '<rect class="pole" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" fill="' + p.fill + '"/></g></g>' +
      '<g class="fx"><line class="flash" x1="' + SEAM + '" y1="156" x2="' + SEAM + '" y2="210" stroke="#FFFFFF" stroke-width="8" stroke-linecap="butt" opacity="0"/>' +
      '<circle class="ring" cx="' + SEAM + '" cy="' + CY + '" r="10" fill="none" stroke="' + AMBER + '" stroke-width="4" vector-effect="non-scaling-stroke" opacity="0"/></g>' +
      '</g>';
    root.insertBefore(svg, root.firstChild);
    var q = function (c) { return svg.querySelector('.' + c); };
    var cam = q('cam'), fields = q('fields'), pA = q('pA'), pB = q('pB'), pole = q('pole'), flash = q('flash'), ring = q('ring');
    var caps = [q('kAo'), q('kAs'), q('kBs')], halos = [q('hAo'), q('hAs'), q('hBs'), q('hBo')];

    // LINHAS DE CAMPO (11 arcos tracejados) E LIMALHA (30 grãos): criados uma vez, reescritos a cada quadro
    var lines = [], i;
    function mk(kind, stroke, width, opacityMax) {
      var el = document.createElementNS(NS, 'path');
      el.setAttribute('fill', 'none'); el.setAttribute('stroke', stroke); el.setAttribute('stroke-width', width);
      el.setAttribute('stroke-linecap', 'round'); el.setAttribute('stroke-dasharray', '9 12');
      el.setAttribute('vector-effect', 'non-scaling-stroke'); el.setAttribute('opacity', 0);
      fields.appendChild(el);
      lines.push({el: el, kind: kind, max: opacityMax, g: null});
    }
    for (i = 0; i < 3; i++) mk('gapA', AMBER, 4, 0.95);
    for (i = 0; i < 3; i++) mk('gapB', AMBER, 4, 0.95);
    for (i = 0; i < 3; i++) mk('inter', AMBER, 4, 1);
    for (i = 0; i < 2; i++) mk('outer', INK, 3, 0.5);
    var grains = [];
    for (i = 0; i < 30; i++) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('fill', i % 3 === 0 ? AMBER : INK); c.setAttribute('opacity', 0);
      fields.appendChild(c);
      grains.push({el: c, line: i % lines.length, ph: (i * 0.381966) % 1, sp: 0.55 + 0.12 * (i % 3)});
    }
    var GAP_Y = [168, 186, 204], GAP_BOW = [14, 11, 8], INTER_D = [0.38, 0.62, 0.9], OUTER_D = [0.45, 0.75], TIP = 212;

    function render(t) {
      var d = dist(t), a = clamp01((d - 6) / 80), sway = Math.sin(2 * Math.PI * 1.1 * t) * 5 * a;
      pA.setAttribute('transform', 'translate(' + (-d) + ' ' + sway + ')');
      pB.setAttribute('transform', 'translate(' + d + ' ' + (-sway) + ')');

      // CÂMERA (par de ímãs em C, aberto para a direita; a virada de 90 graus horária cai exatamente no "m")
      var rot = clamp01((t - T.turn0) / (T.turn1 - T.turn0)), th = -90 + 90 * eRot(rot);
      var ec = eCam(clamp01((t - T.cam0) / (T.cam1 - T.cam0)));
      var kick = t >= T.hit ? 0.04 * Math.exp(-(t - T.hit) * 11) : 0, kk = lerp(KBIG, 1, ec) * (1 + kick);
      cam.setAttribute('transform', 'translate(' + lerp(PBIG[0], P1[0], ec) + ' ' + lerp(PBIG[1], P1[1], ec) + ') scale(' + kk + ') rotate(' + th + ') translate(' + (-CX) + ' ' + (-CY) + ')');

      // CAMPO: aparece na entrada, liga os ímãs enquanto se aproximam e some após o encaixe
      var out = 1 - smooth(T.fieldOut0, T.fieldOut1, t);
      var vis = {gapA: smooth(0.1, 0.5, t) * out, gapB: smooth(0.1, 0.5, t) * out, inter: smooth(0.35, 0.75, t) * out, outer: smooth(0.4, 0.8, t) * out};
      var gi = {gapA: 0, gapB: 0, inter: 0, outer: 0};
      lines.forEach(function (L, n) {
        var k = gi[L.kind]++, dd, x0, x1, y, depth, s;
        if (L.kind === 'gapA' || L.kind === 'gapB') {
          x0 = (L.kind === 'gapA' ? 45 - d : 147 + d); x1 = x0 + 66; y = GAP_Y[k];
          L.g = [x0, y, (x0 + x1) / 2, y + 2 * GAP_BOW[k], x1, y];
        } else {
          var xa = L.kind === 'inter' ? 120 - d : 27 - d, xb = L.kind === 'inter' ? 138 + d : 231 + d;
          s = xb - xa; depth = s * (L.kind === 'inter' ? INTER_D[k] : OUTER_D[k]);
          L.g = [xa, TIP, (xa + xb) / 2, TIP + 2 * depth, xb, TIP];
        }
        L.v = vis[L.kind] * L.max * (0.6 + 0.4 * Math.sin(2 * Math.PI * (1.6 * t + 0.21 * n)));
        L.el.setAttribute('d', 'M' + L.g[0] + ' ' + L.g[1] + 'Q' + L.g[2] + ' ' + L.g[3] + ' ' + L.g[4] + ' ' + L.g[5]);
        L.el.setAttribute('stroke-dashoffset', -t * 70);
        L.el.setAttribute('opacity', Math.max(0, L.v).toFixed(3));
      });
      grains.forEach(function (G) {
        var L = lines[G.line], u = (G.ph + t * G.sp) % 1, g = L.g, m = 1 - u;
        var x = m * m * g[0] + 2 * m * u * g[2] + u * u * g[4], y = m * m * g[1] + 2 * m * u * g[3] + u * u * g[5];
        G.el.setAttribute('cx', x.toFixed(2)); G.el.setAttribute('cy', y.toFixed(2)); G.el.setAttribute('r', (2.8 / kk).toFixed(2));
        G.el.setAttribute('opacity', (Math.max(0, L.v) * Math.sin(Math.PI * u) * 0.9).toFixed(3));
      });

      // POLOS (pontas âmbar nas quatro pernas; no encaixe só o polo oficial permanece)
      var capIn = smooth(0.1, 0.5, t), capOut = 1 - smooth(T.fieldOut0, 1.95, t), burst = t >= T.hit ? Math.exp(-(t - T.hit) * 9) : 0;
      caps.forEach(function (el) { el.setAttribute('opacity', (capIn * capOut).toFixed(3)); });
      halos.forEach(function (el, n) {
        var pulse = 0.75 + 0.25 * Math.sin(2 * Math.PI * (1.8 * t + 0.25 * n));
        el.setAttribute('opacity', Math.min(1, capIn * (1 - smooth(1.55, 2.0, t)) * pulse + 0.8 * burst).toFixed(3));
      });
      var pop = 1 + 0.16 * Math.sin(Math.PI * clamp01((t - T.hit) / 0.22));
      pole.setAttribute('transform', 'translate(' + pcx + ' ' + pcy + ') scale(' + pop + ') translate(' + (-pcx) + ' ' + (-pcy) + ')');

      // CLACK (traço branco na costura e uma onda âmbar curta)
      flash.setAttribute('opacity', t >= T.hit ? (0.9 * Math.exp(-(t - T.hit) * 14)).toFixed(3) : 0);
      var ru = clamp01((t - T.hit) / 0.45);
      ring.setAttribute('r', lerp(10, 260, 1 - Math.pow(1 - ru, 3)).toFixed(2));
      ring.setAttribute('opacity', t >= T.hit && ru < 1 ? (0.6 * (1 - ru)).toFixed(3) : 0);

      // PASSAGEM PARA O LOGO OFICIAL (wordmark abre da esquerda, selo sobe, palavra de papel)
      var wu = clamp01((t - T.wipe0) / (T.wipe1 - T.wipe0)), swapped = t >= T.wipe1;
      svg.style.visibility = swapped ? 'hidden' : 'visible';
      // One image of the official endorsed logo; a stepped polygon reveals the wordmark (x from L to R, above the cut)
      // and the seal (x from 0 to Rs, below the cut) independently, so the pieces together are the file as published
      var su = eSeal(clamp01((t - T.seal0) / (T.seal1 - T.seal0)));
      wm.style.visibility = t < T.wipe0 ? 'hidden' : 'visible';
      if (t >= T.wipe0) {
        var xl = swapped ? 0 : L_WORD, xr = swapped ? w : L_WORD + (w - L_WORD) * eWipe(wu), xs = SEAL_W * su;
        if (swapped && su >= 1) wm.style.clipPath = 'none';
        else wm.style.clipPath = 'polygon(' + [[xl, 0], [xr, 0], [xr, WORD_CUT], [xs, WORD_CUT], [xs, h], [0, h], [0, WORD_CUT], [xl, WORD_CUT]].map(function (q) { return q[0] + 'px ' + q[1] + 'px'; }).join(',') + ')';
      }
      var ru2 = eRole(clamp01((t - T.role0) / (T.role1 - T.role0)));
      bar.style.transform = 'scaleX(' + ru2 + ')';
      word.style.opacity = ru2; word.style.transform = 'translateY(' + ((1 - ru2) * 14) + 'px)';
    }
    render(0);
    return {render: render, layout: {left: left, top: top, w: w, h: h, P1: P1, ev: ev}, scene: svg};
  }

  function build(cfg) {
    var inst = mount(cfg.root), cur = 0, proxy = {};
    Object.defineProperty(proxy, 't', {get: function () { return cur; }, set: function (v) { cur = v; inst.render(v); }});
    var tl = gsap.timeline({paused: true});
    tl.to(proxy, {t: cfg.duration, duration: cfg.duration, ease: 'none'}, 0); // drives render(t); also holds the declared duration
    return tl;
  }

  window.MagnetoIntro = {build: build, mount: mount, T: T, dist: dist, readLogo: readLogo, constants: {SEAM: SEAM, CX: CX, CY: CY, KBIG: KBIG, PBIG: PBIG, WORD_CUT: WORD_CUT, L_WORD: L_WORD}};
})();
