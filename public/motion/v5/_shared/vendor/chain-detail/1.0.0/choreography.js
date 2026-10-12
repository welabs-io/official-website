// COREOGRAFIA DOS DETALHES DA CADEIA, VERSÃO 1.0.0 (peça welabs-chain-detail-s1: sete cenas, uma por passo, interface do próprio produto em tela cheia)
// Each scene shows the interface of ONE product at full frame (no island, no other products), in the story of Marina and the order 1234:
//   S0 Domus + Relloo (the full house with the funnel glued to its wall), S1 Tuner (one inbox, Voz + WhatsApp become one conversation),
//   S2 Relloo (the funnel Novo -> Em análise with the card and its facts), S3 Domus (three rooms hand address, order and Saturday window to the card),
//   S4 Knowly (question, "Política de entregas" with the highlighted line, answer with its source pill), S5 Magneto (three steps, Gestora approves,
//   the card goes to Resolvido) and S6 Domus + Tuner (the receipt returns to Pedidos, Marina receives "Confirmado: sábado").
// Scene grammar: the scene is cut in at its start (the previous scene holds an identical frame until then), the interface builds in beats of 0.4 to 0.6 s,
// everything is still at `start + act`, then holds `hold` s of an identical frame (nothing ambient). The product logo sits at the top left of every scene.
// Type scale on the 1920 piece: focal text >= 48 px, secondary data >= 36 px; nothing smaller than 30 px that has to be read.
// Contract:
//   ChainDetail.build({root, story, endorse, hold, duration}) -> paused GSAP timeline
//   ChainDetail.SCENES      [{id, product, from, settledAt, to}] of the last build (default hold 1.0 before any build)
//   ChainDetail.scenesFor(hold) -> the same list for another hold, from the same constants that place every tween
// root must hold div#world with the five product logos (img.logo[data-p], src set by the brand loader).
// endorse "off" (default) = standalone logos; "on" swaps each logo to its "by welabs" file (layout unchanged).
// Components come from chain-value 1.4.0 (house with eight rooms, funnel and card, chat bubbles, Knowly panel, Magneto steps), drawn at full-frame scale.
// Pure function of time: one paused GSAP timeline, no clock, no random.
(function () {
  var AMBER = '#FFB020', SVGNS = 'http://www.w3.org/2000/svg';

  // TEMPOS DAS CENAS (a duração de ação de cada cena é fixa; o hold é parâmetro)
  var ORDER = [
    // act = the end of the last tween of the scene (settledAt = start + act); the hold that follows is the still result
    {id: 's0', product: 'domus', act: 2.9},
    {id: 's1', product: 'tuner', act: 3.4},
    {id: 's2', product: 'relloo', act: 4.1},
    {id: 's3', product: 'domus', act: 4.1},
    {id: 's4', product: 'knowly', act: 4.1},
    {id: 's5', product: 'magneto', act: 4.65},
    {id: 's6', product: 'domus', act: 3.5}
  ];
  function r3(n) { return Math.round(n * 1000) / 1000; }
  // Scene plan for a hold: every scene = act + hold (the last one holds 0.5 s longer)
  function plan(hold) {
    var t = 0;
    return ORDER.map(function (s, i) {
      var h = i === ORDER.length - 1 ? hold + 0.5 : hold;
      var o = {id: s.id, product: s.product, t0: r3(t), act: s.act, hold: h, from: r3(t), settledAt: r3(t + s.act), to: r3(t + s.act + 0.1), end: r3(t + s.act + h)};
      t += s.act + h;
      return o;
    });
  }
  function pub(list) { return list.map(function (s) { return {id: s.id, product: s.product, from: s.from, settledAt: s.settledAt, to: s.to}; }); }

  // GEOMETRIA (px a 1920x1080; margem de segurança de 96 px)
  var G = {
    // House: two columns of four rooms; the right column holds Pessoas, Pedidos and Entregas (chips leave to the right)
    room: {w: 340, h: 128, gapX: 20, gapY: 18, padX: 30, padY: 26},
    houseTall: {w: 760, roofY: 190, eaveY: 320, bodyY: 320, bodyH: 618},
    s0: {houseX: 864, funnelX: 296, funnelW: 560},
    left: {houseX: 140},
    logoLeft: 96, logoBase: 120
  };
  var LOGO = {
    domus:   {K: 1.958,  wp: 864.66,  hp: 293.70, he: 426.63, vy: -4.80,  lx: 38},
    relloo:  {K: 1.894,  wp: 640.92,  hp: 284.10, he: 421.83, vy: 0,      lx: 38},
    tuner:   {K: 2.2569, wp: 772.57,  hp: 338.53, he: 466.96, vy: -45.13, lx: 38},
    magneto: {K: 2.014,  wp: 1155.84, hp: 302.10, he: 430.83, vy: -9,     lx: 38},
    knowly:  {K: 2.014,  wp: 916.20,  hp: 302.10, he: 430.83, vy: -9,     lx: 38}
  };
  var ICONS = {
    Pessoas: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    Pedidos: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    Atendimento: '<path d="M4 5h16v11H9l-5 4V5z"/>',
    Regras: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    Estoque: '<path d="M3 8l9-4 9 4v9l-9 4-9-4V8z"/><path d="M3 8l9 4 9-4M12 12v9"/>',
    Entregas: '<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    Fiscal: '<path d="M6 3h9l4 4v14H6V3z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
    Financeiro: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1 1.2-1.7 2.5-1.7s2.5.7 2.5 1.7-1.2 1.6-2.5 1.9-2.5.9-2.5 2 1.2 1.7 2.5 1.7 2.5-.7 2.5-1.7"/>'
  };
  // Column order of the house: the right column (odd index) holds Pessoas, Pedidos, Entregas, Financeiro
  var ROOM_ORDER = ['Atendimento', 'Pessoas', 'Regras', 'Pedidos', 'Estoque', 'Entregas', 'Fiscal', 'Financeiro'];
  // Card badges: one glyph per fact (owner, deadline, history, return, address, order, window, source, approval)
  var BADGES = [
    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 8v4l3 2"/>',
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    ICONS.Pedidos,
    ICONS.Entregas,
    '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M8 7h7"/>',
    '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'
  ];
  var CHECK = '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  var PHONE = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>';
  function ico(path, size, stroke, sw) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="' + (stroke || 'currentColor') + '" stroke-width="' + (sw || 1.9) + '" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  function px(n) { return n + 'px'; }
  function el(parent, tag, cls, css, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (css) Object.keys(css).forEach(function (k) { e.style[k] = typeof css[k] === 'number' && k !== 'opacity' && k !== 'zIndex' ? px(css[k]) : css[k]; });
    if (html != null) e.innerHTML = html;
    parent.appendChild(e);
    return e;
  }
  function svg(parent, markup, css) {
    var wrap = el(parent, 'div', 'svgwrap', css);
    wrap.innerHTML = '<svg xmlns="' + SVGNS + '" viewBox="0 0 1920 1080" width="1920" height="1080">' + markup + '</svg>';
    return wrap;
  }

  // CASA COM OITO CÔMODOS (a mesma nas cenas S0, S3 e S6; x é a parede esquerda)
  function house(parent, x) {
    var h = G.houseTall, r = G.room;
    var roofPts = x + ',' + h.eaveY + ' ' + (x + h.w / 2) + ',' + h.roofY + ' ' + (x + h.w) + ',' + h.eaveY;
    var bodyPath = 'M' + x + ' ' + h.bodyY + 'V' + (h.bodyY + h.bodyH - 20) + 'a20 20 0 0 0 20 20H' + (x + h.w - 20) + 'a20 20 0 0 0 20 -20V' + h.bodyY;
    var out = {x: x};
    out.outline = svg(parent, '<path class="body" d="' + bodyPath + '"/><polyline class="roof" points="' + roofPts + '"/>', {left: 0, top: 0});
    out.rooms = ROOM_ORDER.map(function (name, i) {
      var col = i % 2, row = Math.floor(i / 2);
      var room = el(parent, 'div', 'room', {left: x + r.padX + col * (r.w + r.gapX), top: h.bodyY + r.padY + row * (r.h + r.gapY), width: r.w, height: r.h});
      room.innerHTML = '<span class="rbase">' + ico(ICONS[name], 44, AMBER, 1.8) + '<b>' + name + '</b></span>';
      return room;
    });
    return out;
  }
  function roomCenter(hs, i) {
    var col = i % 2, row = Math.floor(i / 2), r = G.room, h = G.houseTall;
    return {x: hs.x + r.padX + col * (r.w + r.gapX) + r.w / 2, y: h.bodyY + r.padY + row * (r.h + r.gapY) + r.h / 2};
  }
  // FUNIL COM QUATRO FAIXAS (rótulos de 36 px; o cartão desliza por cima das faixas)
  function funnel(parent, f, stages) {
    var o = {};
    o.box = el(parent, 'div', 'funnel', {left: f.x, top: f.y, width: f.w, height: f.h});
    o.stripes = stages.map(function (name, i) {
      return el(o.box, 'div', 'fstripe', {left: f.pad, top: f.pad + i * f.step, width: f.w - 2 * f.pad, height: f.sh});
    });
    o.labs = stages.map(function (name, i) {
      return el(o.box, 'div', 'flab', {left: f.pad + 20, top: f.pad + i * f.step, width: f.labW, height: f.sh}, '<span>' + name + '</span>');
    });
    return o;
  }
  function card(parent, c, story, big) {
    var o = {};
    o.wrap = el(parent, 'div', 'cardw', {left: c.x, top: c.y, width: c.w, height: c.h});
    o.card = el(o.wrap, 'div', 'card', {left: 0, top: 0, width: c.w, height: c.h},
      '<span class="ct">' + story.card.title[0] + '</span><span class="ct t2">' + story.card.title[1] + '</span>');
    o.badges = BADGES.map(function (p, i) {
      return el(o.card, 'span', 'cb', {left: 20 + i * 54, top: c.h - 58}, ico(p, 34, 'currentColor', 2));
    });
    return o;
  }
  // Draw-on of a stroke by its real length (constant at build time; no pathLength scaling)
  function drawOn(tl, p, at, dur, ease) {
    var len = Math.ceil(p.getTotalLength()) + 2;
    p.style.strokeDasharray = len + ' ' + len;
    tl.fromTo(p, {strokeDashoffset: len}, {strokeDashoffset: 0, duration: dur, ease: ease}, at);
  }

  // MONTAGEM DO DOM (a peça só declara #world e os cinco logos; cada cena é um grupo em tela cheia)
  function mount(root, story, endorse) {
    var world = root.querySelector('#world');
    var isl = el(world, 'div', 'isl');
    var d = {sc: {}};
    function scene(id) { d.sc[id] = el(isl, 'div', 'sc'); return d.sc[id]; }
    var st = story.stages;

    // ---- S0: Domus + Relloo ----
    var g0 = scene('s0'), a = G.s0;
    d.h0 = house(g0, a.houseX);
    d.f0 = funnel(g0, {x: a.funnelX, y: G.houseTall.bodyY, w: a.funnelW, h: G.houseTall.bodyH, pad: 12, step: 152, sh: 138, labW: 500}, st);
    d.seam0 = svg(g0, '<path class="seam" d="M860 440V540C832 540 832 590 860 590V700"/>', {left: 0, top: 0, zIndex: '4'});

    // ---- S1: Tuner (one inbox) ----
    var g1 = scene('s1');
    d.p1 = el(g1, 'div', 'tp', {left: 96, top: 170, width: 1728, height: 810});
    el(d.p1, 'i', 'vdiv', {left: 508, top: 24, width: 3, height: 762});
    // List column: Marina's row (real text) over skeleton rows
    d.mrow = el(d.p1, 'div', 'lrow', {left: 24, top: 24, width: 460, height: 170},
      '<span class="av"><i>M</i></span><span class="ln"><b>Marina · DEMO</b><span class="tags"></span></span>');
    d.tagV = el(d.mrow.querySelector('.tags'), 'span', 'tag', null, story.channels[0]);
    d.tagW = el(d.mrow.querySelector('.tags'), 'span', 'tag', null, story.channels[1]);
    [214, 330, 446].forEach(function (y) {
      el(d.p1, 'i', 'bar', {left: 24, top: y, width: 460, height: 96});
    });
    // Thread column: header (avatar, name, channel chips), the call, the message, the composer
    el(d.p1, 'div', 'th', {left: 548, top: 24, width: 1150, height: 80},
      '<span class="av"><i>M</i></span><b>Marina · DEMO</b>');
    d.chV = el(d.p1, 'span', 'chip', {left: 1330, top: 32}, story.channels[0]);
    d.chW = el(d.p1, 'span', 'chip', {left: 1450, top: 32}, story.channels[1]);
    d.call = el(d.p1, 'div', 'callrow', {left: 560, top: 170, width: 600}, ico(PHONE, 44, '#C9D3D8', 2) + '<span>' + story.call + '</span>');
    d.tmsg = el(d.p1, 'div', 'bub in', {left: 560, top: 310}, '<span class="tx">' + story.chat.out + '</span>');
    d.brk = el(d.p1, 'i', 'brk', {left: 536, top: 170, width: 6, height: 262});
    el(d.p1, 'i', 'bar', {left: 560, top: 690, width: 1130, height: 76});

    // ---- S2: Relloo (funnel with the card and its facts) ----
    var g2 = scene('s2');
    var f2 = {x: 96, y: 150, w: 1000, h: 832, pad: 12, step: 206, sh: 190, labW: 280};
    d.f2 = funnel(g2, f2, st);
    d.c2 = card(d.f2.box, {x: 320, y: 22, w: 660, h: 170}, story);
    d.sheet = el(g2, 'div', 'sheet', {left: 1156, top: 250, width: 668, height: 560});
    var sheetRows = [[BADGES[0], story.card.owner], [BADGES[1], story.card.sla], [BADGES[2], story.card.history], [BADGES[3], story.card.followup], [BADGES[6], story.card.delivery]];
    d.srows = sheetRows.map(function (rw, i) {
      return el(d.sheet, 'div', 'srow' + (i === 4 ? ' empty' : ''), {left: 28, top: 22 + i * 106, width: 612, height: 90},
        '<span class="si">' + ico(rw[0], 44, 'currentColor', 2) + '</span><span class="st">' + (i === 4 ? '' : rw[1]) + '</span>' + (i === 4 ? '<span class="sdash"></span>' : ''));
    });

    // ---- S3: Domus (three rooms hand data to the card) ----
    var g3 = scene('s3');
    d.h3 = house(g3, G.left.houseX);
    d.c3 = card(g3, {x: 1060, y: 250, w: 700, h: 170}, story);
    var rowsTop = [490, 620, 750];
    d.slots = [4, 5, 6].map(function (b, i) {
      return el(g3, 'div', 'slot', {left: 1060, top: rowsTop[i], width: 700, height: 100},
        '<span class="si">' + ico(BADGES[b], 44, 'currentColor', 2) + '</span><span class="sdash"></span>');
    });
    d.chips3 = [story.chips.address, story.chips.order, story.chips.window].map(function (txt) {
      return el(g3, 'div', 'fchip', {left: 0, top: 0, opacity: '0'}, '<span>' + txt + '</span>');
    });
    d.rowsTop = rowsTop;

    // ---- S4: Knowly (question, document with the highlighted line, answer with its source) ----
    var g4 = scene('s4');
    d.q4 = el(g4, 'div', 'bub out q', {left: 96, top: 170}, '<span class="tx">' + story.chat.out + '</span>');
    d.kp = el(g4, 'div', 'kp', {left: 96, top: 316, width: 920, height: 664});
    el(d.kp, 'div', 'kt', {left: 36, top: 30}, story.kb.title);
    el(d.kp, 'i', 'bar', {left: 36, top: 120, width: 760, height: 22});
    d.khl = el(d.kp, 'div', 'khl', {left: 28, top: 170, width: 864, height: 150, opacity: '0'});
    d.kline = el(d.kp, 'div', 'kl', {left: 52, top: 184, width: 820}, '<span>' + story.kb.line1 + '</span><span>' + story.kb.line2 + '</span>');
    [372, 412, 452, 520, 560].forEach(function (y, i) { el(d.kp, 'i', 'bar', {left: 36, top: y, width: [800, 720, 640, 780, 520][i], height: 20}); });
    d.ap = el(g4, 'div', 'ap', {left: 1060, top: 316, width: 764, height: 664});
    d.ans = el(d.ap, 'div', 'ans', {left: 40, top: 70}, '<span>' + story.answer + '</span>');
    d.pill = el(d.ap, 'div', 'srcpill', {left: 40, top: 250}, ico(BADGES[7], 40, AMBER, 2) + '<span>' + story.kb.title + '</span>');
    [380, 430, 480].forEach(function (y, i) { el(d.ap, 'i', 'bar', {left: 40, top: y, width: [600, 680, 420][i], height: 22}); });
    d.conn = svg(g4, '<path class="seam" d="M990 561H1030C1062 561 1070 604 1100 604"/>', {left: 0, top: 0, zIndex: '4'});

    // ---- S5: Magneto (three steps, the Gestora approves, the card goes to Resolvido) ----
    var g5 = scene('s5');
    var sx = [96, 710, 1324];
    d.steps = story.steps.map(function (s, i) {
      var cls = i === 1 ? 'step btn' : 'step';
      return el(g5, 'div', cls, {left: sx[i], top: 380, width: 500, height: 300},
        '<span class="stx"><b>' + s[0] + '</b><b>' + s[1] + '</b></span><span class="sok">' + CHECK + '</span>');
    });
    d.arrows = svg(g5, '<path class="arr" d="M600 530H706M1214 530H1320"/>', {left: 0, top: 0, zIndex: '2'});
    d.mgr = el(g5, 'div', 'mgr', {left: 1384, top: 160, width: 440, height: 130},
      '<span class="av"><i>G</i></span><div class="mt"><b>' + story.manager[0] + '</b><b class="dm">' + story.manager[1] + '</b></div>');
    d.stages = el(g5, 'div', 'stages', {left: 96, top: 800, width: 1600, height: 80});
    d.pills = st.map(function (name) { return el(d.stages, 'span', 'pill', null, name); });
    d.rule = el(g5, 'div', 'fchip rule', {left: 0, top: 0, opacity: '0'}, ico(ICONS.Regras, 44, AMBER, 2) + '<span>' + story.chips.rule + '</span>');
    d.rcpt = el(g5, 'div', 'packet rc', {left: 0, top: 0}, ico('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 9h6M9 13h6"/>', 40, '#1C1A16', 2.4));
    d.finger = el(g5, 'div', 'finger', {left: 0, top: 0});
    d.ripple = el(g5, 'div', 'ripple', {left: 0, top: 0});

    // ---- S6: Domus + Tuner (receipt returns to Pedidos, Marina receives the confirmation) ----
    var g6 = scene('s6');
    d.h6 = house(g6, G.left.houseX);
    d.roomAlt = el(d.h6.rooms[3], 'span', 'ralt', {opacity: '0'}, '<b>' + story.room[0] + '</b><b>' + story.room[1] + '</b>');
    d.roomBase = d.h6.rooms[3].querySelector('.rbase');
    d.p6 = el(g6, 'div', 'tp', {left: 964, top: 290, width: 860, height: 650});
    el(d.p6, 'div', 'th', {left: 28, top: 22, width: 780, height: 80}, '<span class="av"><i>M</i></span><b>Marina · DEMO</b>');
    d.c6V = el(d.p6, 'span', 'chip', {left: 28, top: 118}, story.channels[0]);
    d.c6W = el(d.p6, 'span', 'chip', {left: 148, top: 118}, story.channels[1]);
    el(d.p6, 'i', 'bar in', {left: 28, top: 210, width: 520, height: 70});
    d.treply = el(d.p6, 'div', 'bub out', {right: 40, top: 320}, '<span class="tx">' + story.chat.in + '</span>');
    d.recv = el(d.p6, 'div', 'recv', {right: 48, top: 462}, '<span>' + story.received + '</span>');
    el(d.p6, 'i', 'bar', {left: 28, top: 556, width: 804, height: 64});
    d.rcpt6 = el(g6, 'div', 'packet rc', {left: 0, top: 0}, ico('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 9h6M9 13h6"/>', 40, '#1C1A16', 2.4));

    // The scenes are staging: covering a neighbour is the design, so nothing here is "occluded" by mistake
    [].forEach.call(isl.querySelectorAll('*'), function (e) { e.setAttribute('data-layout-allow-occlusion', ''); e.setAttribute('data-layout-allow-overflow', ''); e.setAttribute('data-layout-allow-overlap', ''); });

    // Logos: sized from the x-height; "on" swaps to the sealed file and gives the seal band back as negative margin. They sit at the top left of the scene
    d.logos = {}; d.logoBox = {};
    Object.keys(LOGO).forEach(function (kk) {
      var L = LOGO[kk], img = root.querySelector('img.logo[data-p="' + kk + '"]');
      var hPlain = L.lx * L.K, w = hPlain * L.wp / L.hp, band = (L.he - L.hp) / L.hp * hPlain;
      var on = endorse === 'on', top = G.logoBase - (210 - L.vy) / L.hp * hPlain;
      if (on) img.setAttribute('src', window.BRAND.url('welabs', kk + '-endorsed-on-dark.svg'));
      img.style.left = px(G.logoLeft); img.style.top = px(top); img.style.width = px(w);
      img.style.height = px(on ? hPlain + band : hPlain);
      img.style.marginBottom = on ? px(-band) : '0';
      d.logos[kk] = img; d.logoBox[kk] = {x: G.logoLeft, y: top, w: w, h: hPlain};
    });
    d.world = world;
    return d;
  }

  function build(cfg) {
    var root = cfg.root;
    var endorse = cfg.endorse || root.getAttribute('data-endorse') || 'off';
    var story = cfg.story;
    var hold = cfg.hold == null ? 1 : cfg.hold;
    var P = plan(hold), S = {};
    P.forEach(function (s) { S[s.id] = s; });
    window.ChainDetail.SCENES = pub(P);
    var d = mount(root, story, endorse);
    var tl = gsap.timeline({paused: true});
    var EASE = 'power2.inOut';
    function to(t, v, at) { return tl.to(t, v, at); }
    function ft(t, a, b, at) { b.immediateRender = false; return tl.fromTo(t, a, b, at); }

    // ESTADO INICIAL (cada cena nasce escondida; a coreografia a mostra no seu início)
    var order = P.map(function (s) { return d.sc[s.id]; });
    gsap.set(order, {opacity: 0});
    gsap.set(order[0], {opacity: 1});
    gsap.set(Object.keys(d.logos).map(function (k) { return d.logos[k]; }), {opacity: 0});
    gsap.set([d.c2.wrap, d.sheet, d.srows, d.khl, d.ap, d.conn, d.pill, d.ans, d.q4, d.kp, d.chips3, d.rule, d.rcpt, d.finger, d.ripple, d.rcpt6, d.roomAlt, d.p6, d.treply, d.recv,
      d.p1, d.mrow, d.call, d.tmsg, d.tagV, d.tagW, d.steps, d.mgr, d.stages, d.arrows, d.c3.wrap, d.slots], {opacity: 0});
    gsap.set(d.brk, {opacity: 0, scaleY: 0, transformOrigin: '50% 0%'});
    [d.rule, d.rcpt, d.finger, d.ripple, d.rcpt6].forEach(function (e) { gsap.set(e, {xPercent: -50, yPercent: -50}); });
    d.chips3.forEach(function (e) { gsap.set(e, {yPercent: -50}); });
    gsap.set(d.steps.map(function (s) { return s.querySelector('.sok'); }), {opacity: 0});

    // CENA: corte de entrada (o grupo e os logos da cena entram no início; o quadro anterior segue idêntico até aqui), corte de saída no início da próxima
    function logoOn(key, at, dx, dy) {
      var img = d.logos[key];
      tl.set(img, {x: dx || 0, y: dy || 0}, at);
      ft(img, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, at + 0.05);
    }
    function scene(id, logos, fn) {
      var s = S[id], g = d.sc[id], i = P.indexOf(s);
      if (i > 0) tl.set(g, {opacity: 1}, s.t0);
      logos.forEach(function (l) { logoOn(l[0], s.t0, l[1], l[2]); });
      fn(s.t0 + 0.1, s);
      if (i < P.length - 1) {
        tl.set(g, {opacity: 0}, P[i + 1].t0);
        logos.forEach(function (l) { tl.set(d.logos[l[0]], {opacity: 0}, P[i + 1].t0); });
      }
    }

    // PEQUENOS GESTOS
    var pop = function (e, at, dur) { ft(e, {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: dur || 0.35, ease: 'power2.out'}, at); };
    var lit = function (b, at) { to(b, {color: AMBER, borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.2}, at); };
    var litPop = function (b, at) {
      lit(b, at);
      ft(b, {scale: 1}, {scale: 1.4, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1}, at);
    };
    var roomGlow = function (rooms, i, on, at) {
      to(rooms[i], on ? {borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.25, ease: 'power1.out'} : {borderColor: '#3A3A44', backgroundColor: '#202027', duration: 0.3}, at);
    };
    var stripeOn = function (f, i, at) { to(f.stripes[i], {borderColor: AMBER, backgroundColor: '#1F1A10', duration: 0.3}, at); };
    var stripeOff = function (f, i, at) { to(f.stripes[i], {borderColor: '#3A3A44', backgroundColor: '#17171B', duration: 0.3}, at); };

    // ===== S0 NÚCLEO (Domus e Relloo): a casa monta cheia, o funil encaixa na parede =====
    scene('s0', [['domus'], ['relloo', 576 - (G.logoLeft + d.logoBox.relloo.w / 2), 168]], function (A) {
      d.h0.rooms.forEach(function (room, i) {
        ft(room, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.4, ease: 'power3.out'}, 0.05 + i * 0.1);
      });
      d.h0.outline.querySelectorAll('path,polyline').forEach(function (p, i) { drawOn(tl, p, 0.95 + i * 0.05, 0.4, 'power2.inOut'); });
      ft(d.f0.box, {opacity: 0, x: -60}, {opacity: 1, x: 0, duration: 0.4, ease: 'power3.out'}, 1.1);
      drawOn(tl, d.seam0.querySelector('path'), 1.5, 0.3, 'power1.out');
      // Hook: the first stripe lights in the last beat (the funnel is empty: what comes in?)
      stripeOn(d.f0, 0, 2.3); stripeOff(d.f0, 0, 2.6);
    });

    // ===== S1 CANAIS (Tuner): voz e WhatsApp da Marina viram uma conversa só =====
    scene('s1', [['tuner']], function (A) {
      ft(d.p1, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'}, A);
      pop(d.mrow, A + 0.3);
      // Voz arrives first (the call row), then the WhatsApp message lands in the SAME thread
      lit(d.chV, A + 0.8); pop(d.call, A + 0.9); ft(d.tagV, {opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.25}, A + 0.9);
      lit(d.chW, A + 1.5); ft(d.tmsg, {opacity: 0, scale: 0.9, y: 10, transformOrigin: '0% 100%'}, {opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out'}, A + 1.6);
      ft(d.tagW, {opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.25}, A + 1.6);
      // One thread: a bracket joins the call and the message
      to(d.brk, {opacity: 1, scaleY: 1, duration: 0.45, ease: EASE}, A + 2.5);
      to(d.mrow, {borderColor: AMBER, duration: 0.3}, A + 3.0);
    });

    // ===== S2 RELACIONAMENTO (Relloo): o cartão nasce em Novo e vai para Em análise =====
    scene('s2', [['relloo']], function (A) {
      var step = 206;
      stripeOn(d.f2, 0, A + 0.15);
      ft(d.c2.wrap, {opacity: 0, scale: 0.92, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out'}, A + 0.25);
      ft(d.sheet, {opacity: 0, x: 24}, {opacity: 1, x: 0, duration: 0.4, ease: 'power2.out'}, A + 0.6);
      // Four beats of 0.5 s: owner, deadline, history, return (each row appears and its badge lights)
      [0, 1, 2, 3].forEach(function (i) {
        var at = A + 1.0 + i * 0.5;
        ft(d.srows[i], {opacity: 0, x: -16}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, at);
        litPop(d.c2.badges[i], at + 0.1);
      });
      ft(d.srows[4], {opacity: 0, x: -16}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 3.0);
      // The card slides to Em análise with the delivery field still empty
      to(d.c2.wrap, {y: step, duration: 0.5, ease: EASE}, A + 3.5);
      stripeOff(d.f2, 0, A + 3.5); stripeOn(d.f2, 1, A + 3.7);
    });

    // ===== S3 DEFINIÇÃO (Domus): os cômodos mandam endereço, pedido e janela de sábado ao cartão =====
    scene('s3', [['domus']], function (A) {
      var hs = d.h3;
      ft(d.c3.wrap, {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.35, ease: 'power2.out'}, A);
      ft(d.slots, {opacity: 0}, {opacity: 1, duration: 0.3, stagger: 0.08}, A + 0.15);
      // [room, chip, badge]: every chip leaves its room to the right and lands in its slot of the card
      [[1, 0, 4], [3, 1, 5], [5, 2, 6]].forEach(function (e, n) {
        var room = e[0], chip = d.chips3[e[1]], badge = e[2], at = A + 0.5 + n * 1.0;
        var c = roomCenter(hs, room), slotY = d.rowsTop[n] + 50;
        roomGlow(hs.rooms, room, true, at);
        ft(chip, {x: c.x + 40, y: c.y, opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, at + 0.15);
        to(chip, {x: 1124, y: slotY, duration: 0.55, ease: 'power1.inOut'}, at + 0.3);
        to(d.slots[n].querySelector('.sdash'), {opacity: 0, duration: 0.2}, at + 0.75);
        litPop(d.c3.badges[badge], at + 0.85);
        roomGlow(hs.rooms, room, false, at + 1.2);
      });
    });

    // ===== S4 CONHECIMENTO (Knowly): a linha de sábado, destacada, vira a resposta com a fonte =====
    scene('s4', [['knowly']], function (A) {
      pop(d.q4, A);
      ft(d.kp, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'}, A + 0.5);
      to(d.khl, {opacity: 1, duration: 0.4, ease: 'power1.out'}, A + 1.4);
      ft(d.ap, {opacity: 0, x: 24}, {opacity: 1, x: 0, duration: 0.4, ease: 'power2.out'}, A + 2.0);
      pop(d.ans, A + 2.5);
      pop(d.pill, A + 3.1);
      drawOn(tl, d.conn.querySelector('path'), A + 3.5, 0.5, 'power1.inOut');
      ft(d.conn, {opacity: 0}, {opacity: 1, duration: 0.1}, A + 3.5);
    });

    // ===== S5 EXECUÇÃO (Magneto): aguardando aprovação, a Gestora aprova, resolvido =====
    scene('s5', [['magneto']], function (A) {
      var oks = d.steps.map(function (s) { return s.querySelector('.sok'); });
      var pillOn = function (i, at) { to(d.pills[i], {color: AMBER, borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.25}, at); };
      var pillOff = function (i, at) { to(d.pills[i], {color: '#B9B9C4', borderColor: '#4A4A56', backgroundColor: '#17171B', duration: 0.25}, at); };
      ft(d.stages, {opacity: 0}, {opacity: 1, duration: 0.3}, A);
      pillOn(1, A + 0.2);
      ft(d.mgr, {opacity: 0, y: -14}, {opacity: 1, y: 0, duration: 0.35, ease: 'power2.out'}, A + 0.2);
      // The card goes to Aguardando aprovação; the rule enters from the left and becomes the first step
      pillOff(1, A + 0.6); pillOn(2, A + 0.6);
      ft(d.rule, {x: 40, y: 530, opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, A + 0.8);
      to(d.rule, {x: 250, duration: 0.45, ease: 'power1.inOut'}, A + 0.95);
      to(d.rule, {opacity: 0, scale: 0.7, duration: 0.15}, A + 1.4);
      // Step 1: check the shipment
      ft(d.steps[0], {opacity: 0, x: 18}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 1.4);
      ft(oks[0], {opacity: 0, scale: 0.4}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, A + 1.8);
      ft(d.arrows, {opacity: 0}, {opacity: 1, duration: 0.3}, A + 1.9);
      // Step 2: the Gestora taps Aprovar
      ft(d.steps[1], {opacity: 0, x: 18}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 2.0);
      to(d.mgr, {borderColor: AMBER, duration: 0.2}, A + 2.1);
      ft(d.finger, {x: 1600, y: 290, opacity: 0}, {opacity: 1, duration: 0.1}, A + 2.2);
      to(d.finger, {x: 1150, y: 600, duration: 0.45, ease: EASE}, A + 2.3);
      ft(d.ripple, {x: 1150, y: 600, opacity: 0.9, scale: 0.3}, {opacity: 0, scale: 2.2, duration: 0.4, ease: 'power2.out'}, A + 2.8);
      to(d.finger, {scale: 0.8, duration: 0.08, yoyo: true, repeat: 1}, A + 2.8);
      to(d.finger, {opacity: 0, duration: 0.15}, A + 3.05);
      to(d.steps[1], {backgroundColor: '#53D68A', borderColor: '#53D68A', duration: 0.25}, A + 3.0);
      // Step 3: update the order; the card is Resolvido and the receipt appears
      ft(d.steps[2], {opacity: 0, x: 18}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 3.4);
      ft(oks[2], {opacity: 0, scale: 0.4}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, A + 3.75);
      pillOff(2, A + 3.9); pillOn(3, A + 3.9);
      to(d.mgr, {borderColor: '#3A3A44', duration: 0.3}, A + 4.0);
      ft(d.rcpt, {x: 1792, y: 832, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, A + 4.3);
    });

    // ===== S6 RESULTADO (Domus e Tuner): o recibo volta a Pedidos e a Marina recebe a confirmação =====
    scene('s6', [['domus'], ['tuner', 1394 - (G.logoLeft + d.logoBox.tuner.w / 2), 150]], function (A) {
      var hs = d.h6, pc = roomCenter(hs, 3);
      // The receipt comes in from the right edge (where the Magneto left it) along the Pedidos row and enters the room
      ft(d.rcpt6, {x: 1900, y: pc.y, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out'}, A + 0.1);
      to(d.rcpt6, {x: pc.x + 120, duration: 0.8, ease: 'power1.inOut'}, A + 0.3);
      to(d.rcpt6, {opacity: 0, scale: 0.5, duration: 0.12}, A + 1.1);
      to(d.roomBase, {opacity: 0, duration: 0.2}, A + 1.1);
      to(d.roomAlt, {opacity: 1, duration: 0.25}, A + 1.15);
      roomGlow(hs.rooms, 3, true, A + 1.1);
      // The Tuner writes the confirmation in the thread; Marina receives it
      ft(d.p6, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'}, A + 1.5);
      lit(d.c6W, A + 1.9);
      ft(d.treply, {opacity: 0, scale: 0.9, y: 10, transformOrigin: '100% 100%'}, {opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out'}, A + 2.3);
      ft(d.recv, {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'}, A + 3.0);
      to(d.p6, {borderColor: '#53D68A', duration: 0.3}, A + 3.1);
    });

    if (cfg.duration) tl.to({}, {duration: 0.001}, Math.max(cfg.duration, P[P.length - 1].end) - 0.001);
    else tl.to({}, {duration: 0.001}, P[P.length - 1].end - 0.001);
    return tl;
  }

  window.ChainDetail = {build: build, G: G, LOGO: LOGO, plan: plan, SCENES: pub(plan(1)), scenesFor: function (hold) { return pub(plan(hold)); }};
})();
