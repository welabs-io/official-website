// ABERTURA IUS: monta o DOM da abertura num contêiner e devolve a timeline pausada (8,5 s)
// Pure function of the timeline playhead: no requestAnimationFrame, no Math.random, no clock.
// The same file is used by the standalone `ius-intro` and by every `<film>-intro` composition.
(function (global) {
  var NS = 'http://www.w3.org/2000/svg';
  var DURATION = 9;
  // Brand colours from welabs/ius packages/brand/src/styles.css (main@06b60f4)
  var C = { from: '#644CFF', to: '#3D2BBE', accent: '#F79B66', ink: '#333535', lav: '#ECEBFF', edge: '#E6E6EE', raw: '#D5DEDE' };
  // Final lockup: ius-white.svg (viewBox 396x206) at 1.7x, centred horizontally
  var LOGO = { x: 623.4, y: 292, s: 1.7 };
  // Mark squares in logo units (packages/brand/src/ius-logo.tsx MARK_PATHS): top-right, middle-left, bottom-right
  var MARK = [[38.5, 0, 38.6, 37.8], [0, 37.8, 38.5, 37.9], [38.5, 75.7, 38.6, 37.8]];
  // Wordmark paths in reading order: I, U, S (same file, WORDMARK_PATHS)
  var WORD = [
    'M114.399 37.8H153V205.6H114.399V37.8Z',
    'M171.6 180.1V37.8H209.7V172.5H235.1V37.8H273.3V205.6H197.1C183 205.6 171.6 194.2 171.6 180.1Z',
    'M338.8 95.3L369.1 113.8C382.2 121.7 395.2 134.8 395.2 158C395.2 186.7 373.1 205.6 341.8 205.6C307.7 205.6 290.999 184.8 286.899 159.5L319.7 146.8C321.7 156.5 327.7 171.9 342.7 171.9C352.3 171.9 357.1 165.5 357.1 158.6C357.1 152.8 354.9 147.9 346.1 142.5L319.7 126.4C307.3 118.9 292 109.5 292 83.5C292 59.7 310.7 37.8 341.6 37.8C370.8 37.8 387.1 52.4 394.2 76.4L361.8 88.5C355.9 73.3 347.9 70.3 339.8 70.7C333.5 70.9 328.4 76.1 328.8 82.3C329.1 88.8 333.3 92.1 338.8 95.3Z'
  ];
  var TAGLINE = 'Conectamos médicos com pacientes.';
  var CSS = [
    '@font-face{font-family:"IUS Intro Inter";src:url("./assets/fonts/Inter-latin.woff2") format("woff2");font-weight:100 900;font-display:block}',
    '#intro{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;z-index:1000;background:linear-gradient(180deg,' + C.from + ' 0%,' + C.to + ' 100%);font-family:"IUS Intro Inter",Inter,sans-serif;color:#fff}',
    '#intro .iu-svg{position:absolute;left:0;top:0;width:1920px;height:1080px;display:block}',
    '#intro .iu-t{position:absolute;margin:0;padding:0;white-space:nowrap;line-height:1.2;opacity:0}'
  ].join('\n');

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(root, id, content, style) {
    var d = document.createElement('div');
    d.id = id; d.className = 'iu-t'; d.textContent = content; d.setAttribute('style', style);
    root.appendChild(d);
    return d;
  }
  function person(parent, cx, cy) {
    var g = el('g', { opacity: 0 }, parent);
    el('circle', { cx: cx, cy: cy - 22, r: 17, fill: '#FFFFFF' }, g);
    el('path', { d: 'M' + (cx - 30) + ' ' + (cy + 34) + 'a30 28 0 0 1 60 0z', fill: '#FFFFFF' }, g);
    return g;
  }

  function mount(root, gsap) {
    var style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);

    var svg = el('svg', { 'class': 'iu-svg', width: 1920, height: 1080, viewBox: '0 0 1920 1080', 'aria-hidden': 'true' }, root);
    var defs = el('defs', {}, svg);
    var pat = el('pattern', { id: 'iu-dots', width: 40, height: 40, patternUnits: 'userSpaceOnUse' }, defs);
    el('circle', { cx: 20, cy: 20, r: 1.6, fill: '#FFFFFF', 'fill-opacity': 0.22 }, pat);
    var glow = el('radialGradient', { id: 'iu-glow', cx: '50%', cy: '50%', r: '50%' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#8C7BFF', 'stop-opacity': 0.55 }, glow);
    el('stop', { offset: '100%', 'stop-color': '#8C7BFF', 'stop-opacity': 0 }, glow);

    var grid = el('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: 'url(#iu-dots)', opacity: 0 }, svg);
    var halo = el('ellipse', { cx: 960, cy: 520, rx: 760, ry: 460, fill: 'url(#iu-glow)', opacity: 0 }, svg);

    // Laudo card (raw report lines that become structured rows)
    var card = el('g', { opacity: 0 }, svg);
    el('rect', { x: 750, y: 250, width: 420, height: 540, rx: 22, fill: '#FFFFFF' }, card);
    el('rect', { x: 790, y: 284, width: 140, height: 46, rx: 23, fill: C.lav }, card);
    el('line', { x1: 790, y1: 360, x2: 1130, y2: 360, stroke: C.edge, 'stroke-width': 2 }, card);
    var ROW_Y = [410, 482, 554, 626, 698];
    var ROW_W = [190, 150, 210, 170, 130];
    var rows = ROW_Y.map(function (y, i) {
      var r = {};
      r.mark = el('rect', { x: 790, y: y - 12, width: 24, height: 24, rx: 4, fill: 'none', stroke: C.raw, 'stroke-width': 3, opacity: 0 }, card);
      r.raw = el('rect', { x: 836, y: y - 9, width: ROW_W[i], height: 18, rx: 9, fill: C.raw, opacity: 0 }, card);
      r.key = el('rect', { x: 836, y: y - 9, width: Math.round(ROW_W[i] * 0.62), height: 18, rx: 9, fill: C.ink, opacity: 0 }, card);
      r.pill = el('rect', { x: 1030, y: y - 17, width: 100, height: 34, rx: 17, fill: C.from, opacity: 0 }, card);
      return r;
    });
    var scan = el('rect', { x: 770, y: 380, width: 380, height: 5, rx: 2.5, fill: C.accent, opacity: 0 }, card);
    var cardLabel = text(root, 'intro-laudo', 'Laudo', 'left:790px;top:284px;width:140px;height:46px;line-height:46px;text-align:center;font-size:26px;font-weight:700;color:' + C.to);

    // Doctor and patient nodes joined by one line
    var DOC = [560, 540], PAT = [1360, 540];
    var link = el('line', { x1: DOC[0] + 74, y1: 540, x2: PAT[0] - 74, y2: 540, stroke: '#FFFFFF', 'stroke-opacity': 0.55, 'stroke-width': 3, 'stroke-dasharray': 652, 'stroke-dashoffset': 652 }, svg);
    var nodes = [DOC, PAT].map(function (p) {
      var n = {};
      n.pulse = el('circle', { cx: p[0], cy: p[1], r: 72, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 3, opacity: 0 }, svg);
      n.disc = el('circle', { cx: p[0], cy: p[1], r: 0, fill: '#FFFFFF', 'fill-opacity': 0.14, stroke: '#FFFFFF', 'stroke-width': 3 }, svg);
      n.glyph = person(svg, p[0], p[1]);
      return n;
    });
    var docLabel = text(root, 'intro-doc', 'Médico', 'left:' + (DOC[0] - 160) + 'px;top:636px;width:320px;text-align:center;font-size:34px;font-weight:600;color:#FFFFFF');
    var patLabel = text(root, 'intro-pat', 'Paciente', 'left:' + (PAT[0] - 160) + 'px;top:636px;width:320px;text-align:center;font-size:34px;font-weight:600;color:#FFFFFF');

    // The three data squares: born as row bullets, they become the brand mark
    var BULLET_ROWS = [0, 2, 4];
    var squares = BULLET_ROWS.map(function (ri) {
      var y = ROW_Y[ri];
      return el('rect', { x: 802, y: y, width: 0, height: 0, fill: C.accent, opacity: 0 }, svg);
    });

    // Final lockup (inverse: white wordmark, orange mark)
    var logo = el('g', { transform: 'translate(' + LOGO.x + ' ' + LOGO.y + ') scale(' + LOGO.s + ')' }, svg);
    // Fill and trace are separate layers so each fades by CSS opacity (an attr tween on an absent attribute did not revert on seek-back)
    var fills = WORD.map(function (d) {
      return el('path', { d: d, fill: '#FFFFFF', opacity: 0 }, logo);
    });
    var traceLayer = el('g', {}, logo);
    var words = WORD.map(function (d) {
      return el('path', { d: d, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, traceLayer);
    });
    var lens = words.map(function (p) { return Math.ceil(p.getTotalLength()) + 2; });
    words.forEach(function (p, i) { p.setAttribute('stroke-dasharray', lens[i]); p.setAttribute('stroke-dashoffset', lens[i]); });
    var tagline = text(root, 'intro-line', TAGLINE, 'left:0;top:700px;width:1920px;text-align:center;font-size:48px;font-weight:600;letter-spacing:-.01em;color:#FFFFFF');

    // LINHA DO TEMPO DA ABERTURA
    var tl = gsap.timeline({ paused: true });
    // Every tween after the first on a property starts from explicit values, so seek order never matters;
    // lazy:false makes a first render inside a seek write its values now, not on the next ticker frame
    function ft(target, from, to, at) { return tl.fromTo(target, from, Object.assign({ immediateRender: false, lazy: false }, to), at); }
    var clock = { v: 0 };
    tl.to(clock, { v: 1, duration: DURATION, ease: 'none' }, 0);

    // 0.0-0.8 ground
    ft(grid, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0);
    ft(halo, { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power1.out' }, 0);

    // 0.3-1.6 laudo arrives with raw lines
    ft([card, cardLabel], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.3);
    rows.forEach(function (r, i) {
      ft([r.raw, r.mark], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0.7 + i * 0.12);
    });

    // 1.5-2.9 scan reads each line and turns it into a structured row
    ft(scan, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 1.45);
    ft(scan, { attr: { y: 380 } }, { attr: { y: 726 }, duration: 1.4, ease: 'none' }, 1.5);
    ft(scan, { opacity: 1 }, { opacity: 0, duration: 0.2 }, 2.9);
    rows.forEach(function (r, i) {
      var tp = 1.5 + (ROW_Y[i] - 380) / 346 * 1.4;
      ft(r.raw, { opacity: 1 }, { opacity: 0.35, duration: 0.25 }, tp);
      ft(r.key, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tp);
      ft(r.pill, { opacity: 0, attr: { width: 0, x: 1130 } }, { opacity: 1, attr: { width: 100, x: 1030 }, duration: 0.35, ease: 'power2.out' }, tp);
      var bi = BULLET_ROWS.indexOf(i);
      if (bi >= 0) {
        ft(r.mark, { opacity: 1 }, { opacity: 0, duration: 0.2 }, tp);
        ft(squares[bi], { opacity: 0, attr: { x: 802, y: ROW_Y[i], width: 0, height: 0 } },
          { opacity: 1, attr: { x: 790, y: ROW_Y[i] - 12, width: 24, height: 24 }, duration: 0.3, ease: 'back.out(2)' }, tp);
      }
    });

    // 3.3-4.0 the laudo leaves; the three data squares line up between doctor and patient
    ft([card, cardLabel], { opacity: 1, y: 0 }, { opacity: 0, y: -16, duration: 0.45, ease: 'power2.in' }, 3.3);
    var CENTER = [[912, 528], [948, 528], [984, 528]];
    squares.forEach(function (s, i) {
      var y0 = ROW_Y[BULLET_ROWS[i]] - 12;
      ft(s, { attr: { x: 790, y: y0 } }, { attr: { x: CENTER[i][0], y: CENTER[i][1] }, duration: 0.7, ease: 'power3.inOut' }, 3.35 + i * 0.05);
    });
    ft(link, { attr: { 'stroke-dashoffset': 652 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.7, ease: 'power2.inOut' }, 3.55);
    nodes.forEach(function (n, i) {
      ft(n.disc, { attr: { r: 0 } }, { attr: { r: 72 }, duration: 0.5, ease: 'back.out(1.6)' }, 3.5 + i * 0.1);
      ft(n.glyph, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 3.7 + i * 0.1);
    });
    ft(docLabel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 3.8);
    ft(patLabel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 3.9);

    // 4.3-5.65 the data reaches both ends: one square docks on the doctor, one on the patient
    var DOCK = [[DOC[0] + 40, DOC[1] - 82], null, [PAT[0] + 40, PAT[1] - 82]];
    [0, 2].forEach(function (i) {
      ft(squares[i], { attr: { x: CENTER[i][0], y: CENTER[i][1] } }, { attr: { x: DOCK[i][0], y: DOCK[i][1] }, duration: 0.7, ease: 'power2.inOut' }, 4.3);
    });
    nodes.forEach(function (n) {
      ft(n.pulse, { opacity: 0.85, attr: { r: 72 } }, { opacity: 0, attr: { r: 120 }, duration: 0.7, ease: 'power2.out' }, 4.95);
    });

    // 5.35-6.3 the scene folds into the mark
    ft([docLabel, patLabel], { opacity: 1 }, { opacity: 0, duration: 0.35 }, 5.35);
    nodes.forEach(function (n) {
      ft([n.disc, n.glyph], { opacity: 1 }, { opacity: 0, duration: 0.4 }, 5.4);
    });
    ft(link, { opacity: 1 }, { opacity: 0, duration: 0.4 }, 5.4);
    squares.forEach(function (s, i) {
      var m = MARK[i];
      var src = DOCK[i] || CENTER[i];
      ft(s, { attr: { x: src[0], y: src[1], width: 24, height: 24 } },
        { attr: { x: LOGO.x + m[0] * LOGO.s, y: LOGO.y + m[1] * LOGO.s, width: m[2] * LOGO.s, height: m[3] * LOGO.s }, duration: 0.75, ease: 'power3.inOut' }, 5.45 + i * 0.04);
    });
    ft(halo, { opacity: 1 }, { opacity: 0.6, duration: 0.8 }, 5.4);

    // 6.15-7.25 wordmark traced and filled, then the line from the app's welcome screen
    words.forEach(function (p, i) {
      ft(p, { attr: { 'stroke-dashoffset': lens[i] } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.5, ease: 'power2.inOut' }, 6.15 + i * 0.12);
      ft(fills[i], { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 6.45 + i * 0.1);
    });
    ft(traceLayer, { opacity: 1 }, { opacity: 0, duration: 0.3 }, 6.95);
    ft(tagline, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 6.75);
    // 7.25-9.0 held still (1.75 s): logo + tagline, the poster frame
    return tl;
  }

  global.IUS_INTRO = { DURATION: DURATION, mount: mount };
})(window);
