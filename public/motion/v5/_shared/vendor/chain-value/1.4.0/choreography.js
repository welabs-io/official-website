// COREOGRAFIA DA CADEIA DE VALOR, VERSÃO 1.4.0 (peça welabs-chain-value-s5: cenas S0 a S6 da proposta aprovada em 12/10/2026)
// One island that never leaves the frame: the Domus house (8 rooms) with the Relloo funnel glued to its left wall, three rails
// (Tuner on top, Magneto in the middle, Knowly at the bottom), Marina's phone on the left and the Gestora on the right.
// One object stitches every scene: the card "Alteração de entrega · Pedido 1234" that lives in the Relloo funnel
// (Novo -> Em análise -> Aguardando aprovação -> Resolvido) and collects one badge per fact the other products hand over.
// Scene grammar (the same for S1 to S6): amplia (0.5 s) -> action (one gesture, beats of 0.4 to 0.6 s, camera still) ->
// result (0.6 s still, in focus) -> reduz (0.45 s) -> hold (`hold` s of an identical frame; nothing ambient). Exactly one open and one
// close of focus per scene. S0 has no focus (the island assembles); S6 closes on the same resting frame as S0.
// Contract:
//   ChainValue.build({root, format, story, endorse, duration, hold, tail}) -> paused GSAP timeline
//   ChainValue.SCENES      [{id, product, from, settledAt, to}] of the last build (default hold 1.0 before any build)
//   ChainValue.scenesFor(hold) -> the same list for another hold, from the same constants that place every tween
// root must hold div#world with the five product logos (img.logo[data-p], src set by the brand loader).
// endorse "off" (default) = standalone logos; "on" swaps each logo to its "by welabs" file (layout unchanged).
// 1.4.0 over 1.3.0: scene() replaces HOLDS/shift and loose focus calls; the Relloo is a funnel with a card (no chat bubbles);
// the Tuner owns the conversation; text outside the focus is a skeleton bar; format "mobile" is not drawn yet.
// Pure function of time: one paused GSAP timeline, no clock, no random. 1.0.0 to 1.3.0 stay untouched.
(function () {
  var AMBER = '#FFB020', SVGNS = 'http://www.w3.org/2000/svg';

  // TEMPOS DAS CENAS (a duração de ação de cada cena é fixa; o hold é parâmetro)
  var OPEN = 0.5, RESULT = 0.6, CLOSE = 0.45, DIM = 0.35, EASE = 'power2.inOut';
  var ORDER = [
    {id: 's0', product: 'domus', act: 2.4},
    {id: 's1', product: 'tuner', act: 5.0},
    {id: 's2', product: 'relloo', act: 5.2},
    {id: 's3', product: 'domus', act: 4.8},
    {id: 's4', product: 'knowly', act: 4.2},
    {id: 's5', product: 'magneto', act: 5.8},
    {id: 's6', product: 'domus', act: 4.1}
  ];
  function r3(n) { return Math.round(n * 1000) / 1000; }
  // Scene plan for a hold: every scene = act + hold (the last one holds 0.5 s longer: the result of every connection)
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

  // GEOMETRIA DO MUNDO (px a 1920x1080, câmera fixa em 1,0)
  var G = {
    // The Magneto rail runs through the 14 px gap between the second and third room rows (566-580), never over a room
    rail: {tuner: 300, magneto: 573, knowly: 820},
    phone: {x: 16, y: 340, w: 250, h: 460},
    tuner: {x: 274, y: 306, w: 282, h: 264},
    kp: {x: 274, y: 598, w: 282, h: 206},
    funnel: {x: 560, y: 326, w: 480, h: 480},
    house: {x: 1048, w: 574, roofY: 240, eaveY: 340, bodyY: 340, bodyH: 460},
    room: {w: 250, h: 96, gapX: 20, gapY: 14, padX: 27, padY: 20},
    mgr: {x: 1648, y: 340, w: 250, h: 112},
    mag: {x: 1648, y: 462, w: 250, h: 352},
    // Funnel stripes (inside the funnel) and the card wrapper that slides over them
    stripe: {x: 8, w: 464, h: 112, step: 116, y0: 8},
    card: {x: 140, w: 320, h: 106}
  };
  // Focus scale and origin of each component (world px). Origins keep the outer margins: the house right wall, the phone left edge
  // and the Knowly bottom edge never move, so nothing grows out of the frame (margin of 48 px or more at every instant)
  var FS = {
    tuner: {s: 1.55, O: {x: 274, y: 264}},
    funnel: {s: 1.35, O: {x: 1040, y: 566}},
    house: {s: 1.12, O: {x: 1622, y: 151}},
    knowly: {s: 1.5, O: {x: 274, y: 804}},
    phone: {s: 1.85, O: {x: 16, y: 570}},
    // The Magneto panel grows down and to the left; during S5 the house and the funnel step 60 px left to make room (S5 code)
    magneto: {s: 1.3, O: {x: 1898, y: 462}}
  };
  // Every logo is centred on the panel it belongs to (x = panel centre - logo width / 2)
  var LOGO = {
    domus:   {K: 1.958,  wp: 864.66,  hp: 293.70, he: 426.63, vy: -4.80,  lx: 30, x: 1249, base: 194},
    relloo:  {K: 1.894,  wp: 640.92,  hp: 284.10, he: 421.83, vy: 0,      lx: 30, x: 736,  base: 264},
    tuner:   {K: 2.2569, wp: 772.57,  hp: 338.53, he: 466.96, vy: -45.13, lx: 30, x: 338,  base: 264},
    magneto: {K: 2.014,  wp: 1155.84, hp: 302.10, he: 430.83, vy: -9,     lx: 27, x: 1669, base: 516},
    knowly:  {K: 2.014,  wp: 916.20,  hp: 302.10, he: 430.83, vy: -9,     lx: 26, x: 336,  base: 650}
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
  var ROOM_ORDER = ['Pessoas', 'Pedidos', 'Atendimento', 'Regras', 'Estoque', 'Entregas', 'Fiscal', 'Financeiro'];
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
  var CHECK = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
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
  // Funnel geometry helpers (funnel-relative y of a stripe and of the card sitting in it)
  function stripeTop(i) { return G.stripe.y0 + i * G.stripe.step; }
  function cardTop(i) { return stripeTop(i) + 3; }
  function scaled(f, x, y) { return {x: f.O.x + f.s * (x - f.O.x), y: f.O.y + f.s * (y - f.O.y)}; }

  // MONTAGEM DO DOM (a peça só declara #world e os cinco logos)
  function mount(root, story, endorse) {
    var world = root.querySelector('#world');
    // Island layer: every component sits under it; the logos (direct children of #world) are only compared with what is beside them
    var isl = el(world, 'div', 'isl');
    var d = {};

    // Rails: dim base bar drawn left to right; lit segments and the full-length flash bars are tweened by the scenes
    d.rails = {}; d.flash = {};
    ['tuner', 'magneto', 'knowly'].forEach(function (k) {
      // Rail ends sit 42 px inside the phone and 38 px inside the Magneto column (the island runs from x 16 to 1898)
      d.rails[k] = el(isl, 'div', 'rail', {left: 58, top: G.rail[k] - 3, width: 1800, height: 6});
      d.flash[k] = el(isl, 'div', 'rail lit', {left: 58, top: G.rail[k] - 3, width: 1800, height: 6, opacity: '0', zIndex: '2'});
    });
    function seg(x0, x1, rail) { return el(isl, 'div', 'rail lit', {left: x0, top: G.rail[rail] - 3, width: x1 - x0, height: 6, opacity: '0', zIndex: '24'}); }
    d.litT1 = seg(500, 790, 'tuner');       // Tuner -> Relloo hand-off
    d.litT2 = seg(246, 500, 'tuner');       // Tuner -> phone confirmation
    d.litM1 = seg(1400, 1610, 'magneto');   // rule: Domus -> Magneto
    d.litM2 = seg(1620, 1650, 'magneto');   // receipt: Magneto -> Domus
    d.litK = seg(480, 790, 'knowly');       // Knowly line -> Relloo

    // House: one group (outline, rooms) so the whole house scales together
    var h = G.house, r = G.room;
    var roofPts = h.x + ',' + h.eaveY + ' ' + (h.x + h.w / 2) + ',' + h.roofY + ' ' + (h.x + h.w) + ',' + h.eaveY;
    var bodyPath = 'M' + h.x + ' ' + h.bodyY + 'V' + (h.bodyY + h.bodyH - 20) + 'a20 20 0 0 0 20 20H' + (h.x + h.w - 20) + 'a20 20 0 0 0 20 -20V' + h.bodyY;
    // z-index 3 from the start (the focus code resets to 3), so the house sits above the rails in every frame
    d.houseGrp = el(isl, 'div', 'isl', {zIndex: '3'});
    d.outline = svg(d.houseGrp, '<path class="body" d="' + bodyPath + '"/><polyline class="roof" points="' + roofPts + '"/>', {left: 0, top: 0});
    d.rooms = ROOM_ORDER.map(function (name, i) {
      var col = i % 2, row = Math.floor(i / 2);
      var room = el(d.houseGrp, 'div', 'room', {left: h.x + r.padX + col * (r.w + r.gapX), top: h.bodyY + r.padY + row * (r.h + r.gapY), width: r.w, height: r.h});
      room.innerHTML = '<span class="rbase">' + ico(ICONS[name], 34, AMBER, 1.8) + '<b>' + name + '</b></span>';
      return room;
    });
    // The Pedidos room records the receipt at the end: two short lines over the same slot
    d.roomAlt = el(d.rooms[1], 'span', 'ralt', {opacity: '0'}, '<b>' + story.room[0] + '</b><b>' + story.room[1] + '</b>');
    d.roomBase = d.rooms[1].querySelector('.rbase');

    // Relloo funnel: four stripes (Novo, Em análise, Aguardando aprovação, Resolvido) and the card that slides over them
    var f = G.funnel, st = G.stripe;
    d.funnel = el(isl, 'div', 'funnel', {left: f.x, top: f.y, width: f.w, height: f.h});
    d.stripes = story.stages.map(function (name, i) {
      var s = el(d.funnel, 'div', 'fstripe', {left: st.x, top: stripeTop(i), width: st.w, height: st.h});
      return s;
    });
    d.flabs = el(d.funnel, 'div', 'fx');
    d.flabEls = story.stages.map(function (name, i) {
      return el(d.flabs, 'div', 'flab', {left: 20, top: stripeTop(i) + 8, width: 112, height: st.h - 16}, '<span>' + name + '</span>');
    });
    var c = G.card;
    d.cardw = el(d.funnel, 'div', 'cardw', {left: c.x, top: cardTop(0), width: c.w, height: c.h});
    d.card = el(d.cardw, 'div', 'card', {left: 0, top: 0, width: c.w, height: c.h},
      '<span class="ct">' + story.card.title[0] + '</span><span class="ct">' + story.card.title[1] + '</span>');
    d.badges = BADGES.map(function (p, i) {
      return el(d.card, 'span', 'cb', {left: 12 + i * 29, top: c.h - 31}, ico(p, 20, 'currentColor', 2));
    });
    // Card sheet (only in focus): the facts the Relloo keeps, one row each; the last row (Entrega) stays empty until the Domus fills it
    d.sheet = el(d.cardw, 'div', 'sheet', {left: -(c.x - 12), top: c.h + 4, width: 456, height: 222, opacity: '0'});
    var sheetRows = [[BADGES[0], story.card.owner], [BADGES[1], story.card.sla], [BADGES[2], story.card.history], [BADGES[3], story.card.followup], [BADGES[6], story.card.delivery]];
    d.srows = sheetRows.map(function (rw, i) {
      var row = el(d.sheet, 'div', 'srow' + (i === 4 ? ' empty' : ''), {left: 12, top: 8 + i * 42, width: 432, height: 38},
        '<span class="si">' + ico(rw[0], 24, 'currentColor', 2) + '</span><span class="st">' + rw[1] + '</span>' + (i === 4 ? '<span class="sdash"></span>' : ''));
      return row;
    });
    // The seam sits above the funnel border and the house wall, so its pixels do not depend on how the neighbours were last transformed
    d.seam = svg(isl, '<path class="seam" d="M1044 450V548C1016 548 1016 592 1044 592V690"/>', {left: 0, top: 0, zIndex: '4'});
    d.seamFlash = svg(isl, '<path class="seam lit2" d="M1044 450V548C1016 548 1016 592 1044 592V690"/>', {left: 0, top: 0, opacity: '0', zIndex: '5'});

    // Marina's phone: header, chat (skeleton bars at rest, real bubbles in focus), input field
    var p = G.phone;
    d.phone = el(isl, 'div', 'phone', {left: p.x, top: p.y, width: p.w, height: p.h});
    d.phead = el(d.phone, 'div', 'phead', null, '<span class="pav"></span><i class="bar pname"></i>');
    d.pchat = el(d.phone, 'div', 'pchat');
    d.psk = el(d.pchat, 'div', 'sk');
    d.pskOut = el(d.psk, 'i', 'bar out', {right: 14, top: 22, width: 140, height: 56, opacity: '0'});
    d.pskIn = el(d.psk, 'i', 'bar in', {left: 14, top: 96, width: 120, height: 44, opacity: '0'});
    d.pin = el(d.phone, 'div', 'pinput', null, '<span class="ifield"></span><span class="isend"></span>');

    // Tuner panel: one thread (channel chips, the call, the message); skeleton at rest
    var t = G.tuner;
    d.tp = el(isl, 'div', 'tp', {left: t.x, top: t.y, width: t.w, height: t.h});
    d.tpsk = el(d.tp, 'div', 'sk');
    el(d.tpsk, 'i', 'bar', {left: 14, top: 14, width: 78, height: 30});
    el(d.tpsk, 'i', 'bar', {left: 100, top: 14, width: 130, height: 30});
    el(d.tpsk, 'i', 'bar', {left: 14, top: 70, width: 210, height: 34});
    el(d.tpsk, 'i', 'bar', {left: 14, top: 124, width: 170, height: 70});
    d.tpfx = el(d.tp, 'div', 'fx');
    d.chV = el(d.tpfx, 'span', 'chip', {left: 14, top: 12}, story.channels[0]);
    d.chW = el(d.tpfx, 'span', 'chip', {left: 94, top: 12}, story.channels[1]);
    d.brk = el(d.tpfx, 'i', 'brk', {left: 5, top: 62, width: 4, height: 190});
    d.call = el(d.tpfx, 'div', 'callrow', {left: 14, top: 58, width: 254}, ico('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>', 26, '#C9D3D8', 2) + '<span>' + story.call + '</span>');
    d.tmsg = el(d.tpfx, 'div', 'bub in', {left: 14, top: 106}, '<span class="tx">' + story.chat.out + '</span>');
    // S6: the confirmation the Tuner takes back to Marina (company reply, right aligned)
    d.treply = el(d.tpfx, 'div', 'bub out', {right: 14, top: 70}, '<span class="tx">' + story.chat.in + '</span>');

    // Knowly panel: the policy document; skeleton at rest, title + highlighted line in focus
    var k = G.kp;
    d.kp = el(isl, 'div', 'kp', {left: k.x, top: k.y, width: k.w, height: k.h});
    d.kpsk = el(d.kp, 'div', 'sk');
    el(d.kpsk, 'i', 'bar', {left: 14, top: 72, width: 190, height: 24});
    el(d.kpsk, 'i', 'bar', {left: 14, top: 104, width: 220, height: 12});
    el(d.kpsk, 'i', 'bar', {left: 14, top: 136, width: 240, height: 14});
    el(d.kpsk, 'i', 'bar', {left: 14, top: 162, width: 150, height: 14});
    d.kpfx = el(d.kp, 'div', 'fx');
    el(d.kpfx, 'div', 'kt', {left: 14, top: 68}, story.kb.title);
    el(d.kpfx, 'i', 'bar', {left: 14, top: 106, width: 220, height: 12});
    d.khl = el(d.kpfx, 'div', 'khl', {left: 8, top: 124, width: 266, height: 68, opacity: '0'});
    d.kline = el(d.kpfx, 'div', 'kl', {left: 16, top: 126, width: 254}, '<span>' + story.kb.line1 + '</span><span>' + story.kb.line2 + '</span>');
    d.kdet = el(isl, 'div', 'kdet', {left: 0, top: 0, opacity: '0'}, '<span>' + story.kb.line1 + '</span><span>' + story.kb.line2 + '</span>');

    // Magneto panel: three steps (check, approve, update); skeleton rows at rest
    var m = G.mag;
    d.mp = el(isl, 'div', 'mp', {left: m.x, top: m.y, width: m.w, height: m.h});
    d.mpsk = el(d.mp, 'div', 'sk');
    el(d.mpsk, 'i', 'bar', {left: 14, top: 88, width: 190, height: 44});
    el(d.mpsk, 'i', 'bar', {left: 14, top: 172, width: 150, height: 56});
    el(d.mpsk, 'i', 'bar', {left: 14, top: 268, width: 200, height: 44});
    d.mpfx = el(d.mp, 'div', 'fx');
    var steps = story.steps;
    d.s1 = el(d.mpfx, 'div', 'step', {left: 10, top: 76, width: 230, height: 74}, '<span class="stx"><b>' + steps[0][0] + '</b><b>' + steps[0][1] + '</b></span><span class="sok">' + CHECK + '</span>');
    d.s2 = el(d.mpfx, 'div', 'step btn', {left: 10, top: 156, width: 230, height: 100}, '<span class="stx"><b class="big">' + steps[1][0] + '</b><b class="mid">' + steps[1][1] + '</b></span><span class="sok">' + CHECK + '</span>');
    d.s3 = el(d.mpfx, 'div', 'step', {left: 10, top: 264, width: 230, height: 76}, '<span class="stx"><b>' + steps[2][0] + '</b><b>' + steps[2][1] + '</b></span><span class="sok">' + CHECK + '</span>');
    d.ok = [d.s1, d.s2, d.s3].map(function (s) { return s.querySelector('.sok'); });

    // Gestora (approver)
    var g = G.mgr;
    d.mgr = el(isl, 'div', 'mgr', {left: g.x, top: g.y, width: g.w, height: g.h}, '<span class="av"><i>G</i></span><div class="mt"><b>' + story.manager[0] + '</b><b class="dm">' + story.manager[1] + '</b></div>');

    // Packets and flying chips
    var pk = ico('<path d="M4 5h16v11H9l-5 4V5z"/>', 28, '#1C1A16', 2.4);
    d.pk1 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);     // Tuner -> Relloo (the condensed thread)
    d.pk3 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);     // Tuner -> phone (the confirmation)
    d.fc = [story.chips.address, story.chips.order, story.chips.window].map(function (txt) { return el(isl, 'div', 'fchip', {left: 0, top: 0, opacity: '0'}, '<span>' + txt + '</span>'); });
    d.rule = el(isl, 'div', 'fchip rule', {left: 0, top: 0, opacity: '0'}, ico(ICONS.Regras, 28, AMBER, 2) + '<span>' + story.chips.rule + '</span>');
    d.rcpt = el(isl, 'div', 'packet rc', {left: 0, top: 0}, ico('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 9h6M9 13h6"/>', 28, '#1C1A16', 2.4));
    d.finger = el(isl, 'div', 'finger', {left: 0, top: 0});
    d.ripple = el(isl, 'div', 'ripple', {left: 0, top: 0});

    // The island layers are focus staging: covering a neighbour is the design, so nothing here is "occluded" by mistake
    [].forEach.call(isl.querySelectorAll('*'), function (e) { e.setAttribute('data-layout-allow-occlusion', ''); e.setAttribute('data-layout-allow-overflow', ''); e.setAttribute('data-layout-allow-overlap', ''); });

    // Logos: sized from the x-height; "on" swaps to the sealed file and gives the seal band back as negative margin
    d.logos = {}; d.logoBox = {};
    Object.keys(LOGO).forEach(function (kk) {
      var L = LOGO[kk], img = root.querySelector('img.logo[data-p="' + kk + '"]');
      var hPlain = L.lx * L.K, w = hPlain * L.wp / L.hp, band = (L.he - L.hp) / L.hp * hPlain;
      var on = endorse === 'on', top = L.base - (210 - L.vy) / L.hp * hPlain;
      if (on) img.setAttribute('src', window.BRAND.url('welabs', kk + '-endorsed-on-dark.svg'));
      img.style.left = px(L.x); img.style.top = px(top); img.style.width = px(w);
      img.style.height = px(on ? hPlain + band : hPlain);
      img.style.marginBottom = on ? px(-band) : '0';
      d.logos[kk] = img; d.logoBox[kk] = {x: L.x, y: top};
    });
    d.world = world;
    return d;
  }

  // Draw-on of a stroke by its real length (constant at build time; no pathLength scaling)
  function drawOn(tl, p, at, dur, ease) {
    var len = Math.ceil(p.getTotalLength()) + 2;
    p.style.strokeDasharray = len + ' ' + len;
    tl.fromTo(p, {strokeDashoffset: len}, {strokeDashoffset: 0, duration: dur, ease: ease}, at);
  }

  function build(cfg) {
    var root = cfg.root;
    if ((cfg.format || 'desktop') !== 'desktop') throw new Error('chain-value 1.4.0 draws only the desktop format');
    var endorse = cfg.endorse || root.getAttribute('data-endorse') || 'off';
    var story = cfg.story;
    var hold = cfg.hold == null ? 1 : cfg.hold;
    var tail = cfg.tail == null ? (hold > 1 ? 3 : 0) : cfg.tail;
    var P = plan(hold), S = {};
    P.forEach(function (s) { S[s.id] = s; });
    window.ChainValue.SCENES = pub(P);
    var d = mount(root, story, endorse);
    var tl = gsap.timeline({paused: true});
    // Stage scale: the whole island is drawn at 1.0 and shown at 0.95 about the frame centre, so every component keeps at
    // least 60 px from the frame edges (the phone and the Magneto panel sit 16 and 22 px from them at 1.0)
    // and the island sits 40 px lower so the margins above and below match (Domus logo on top, Knowly rail at the bottom)
    gsap.set(d.world, {scale: cfg.stage || 0.95, x: 3, y: 40, transformOrigin: '960px 540px'});
    // Beat compression inside a scene: the action beats are written on the base clock (A + x); warp() squeezes the ones that fall
    // inside the action window so the still result lasts 1.0 s (RESULT + 0.4) instead of 0.6 s. Durations are not touched.
    var W = null;
    function warp(at) { return W && at >= W.A - 1e-6 && at <= W.B + 0.3 ? W.A + (at - W.A) * W.k : at; }
    function to(t, v, at) { return tl.to(t, v, warp(at)); }
    function ft(t, a, b, at) { b.immediateRender = false; return tl.fromTo(t, a, b, warp(at)); }

    // ESTADO INICIAL (tudo o que nasce depois da cena 0 começa escondido)
    gsap.set([d.cardw, d.sheet, d.srows, d.kdet, d.khl, d.roomAlt, d.rule, d.fc, d.pk1, d.pk3, d.rcpt, d.finger, d.ripple,
      d.litT1, d.litT2, d.litM1, d.litM2, d.litK, d.pskOut, d.pskIn], {opacity: 0});
    gsap.set([d.flabs, d.tpfx, d.kpfx, d.mpfx], {opacity: 0});
    gsap.set([d.s1, d.s2, d.s3], {opacity: 0});
    gsap.set(d.ok, {opacity: 0});
    gsap.set(d.brk, {opacity: 0, scaleY: 0, transformOrigin: '50% 0%'});
    gsap.set([d.call, d.tmsg, d.treply], {opacity: 0});
    [d.pk1, d.pk3, d.rcpt, d.finger, d.ripple, d.rule].concat(d.fc).forEach(function (e) { gsap.set(e, {xPercent: -50, yPercent: -50}); });
    gsap.set(d.kdet, {xPercent: -50, yPercent: -50});
    gsap.set(d.cardw, {transformOrigin: '50% 50%'});

    // FOCO: um par abre/fecha por cena (0,5 s / 0,45 s, power2.inOut); o resto vai a 0,35, nada some
    var dimmable = [d.rails.tuner, d.rails.magneto, d.rails.knowly, d.houseGrp, d.funnel, d.tp, d.kp, d.phone, d.mp, d.mgr,
      d.logos.domus, d.logos.relloo, d.logos.tuner, d.logos.magneto, d.logos.knowly];
    function orig(e, f, logo) { var L = logo ? d.logoBox[logo] : null; var left = L ? L.x : parseFloat(e.style.left) || 0, top = L ? L.y : parseFloat(e.style.top) || 0; return (f.O.x - left) + 'px ' + (f.O.y - top) + 'px'; }
    var F = {
      tuner: {els: [d.tp, d.logos.tuner], spec: FS.tuner, bright: [d.tp, d.logos.tuner, d.rails.tuner], fx: d.tpfx, sk: d.tpsk},
      funnel: {els: [d.funnel, d.logos.relloo], spec: FS.funnel, bright: [d.funnel, d.logos.relloo], fx: d.flabs},
      house: {els: [d.houseGrp, d.logos.domus], spec: FS.house, bright: [d.houseGrp, d.logos.domus]},
      knowly: {els: [d.kp, d.logos.knowly], spec: FS.knowly, bright: [d.kp, d.logos.knowly, d.rails.knowly], fx: d.kpfx, sk: d.kpsk},
      magneto: {els: [d.mp, d.logos.magneto], spec: FS.magneto, bright: [d.mp, d.logos.magneto, d.rails.magneto, d.mgr], fx: d.mpfx, sk: d.mpsk}
    };
    var logoOf = {};
    logoOf[d.logos.tuner.getAttribute('data-p')] = 1;
    Object.keys(F).forEach(function (key) {
      var f = F[key];
      f.els.forEach(function (e) {
        var isLogo = e.tagName === 'IMG';
        gsap.set(e, {transformOrigin: orig(e, f.spec, isLogo ? e.getAttribute('data-p') : null)});
      });
    });
    // keep: [[element, opacity]] stay readable while another product holds the focus
    function focusOpen(f, at, keep) {
      keep = keep || [];
      var skip = new Set(f.bright.concat(keep.map(function (k) { return k[0]; })));
      f.els.forEach(function (e) { tl.set(e, {zIndex: e.tagName === 'IMG' ? 21 : 20}, at); });
      to(f.els, {scale: f.spec.s, duration: OPEN, ease: EASE}, at);
      to(f.bright, {opacity: 1, duration: OPEN, ease: EASE}, at);
      to(dimmable.filter(function (e) { return !skip.has(e); }), {opacity: DIM, duration: OPEN, ease: EASE}, at);
      keep.forEach(function (k) { to(k[0], {opacity: k[1], duration: OPEN, ease: EASE}, at); });
      if (f.sk) to(f.sk, {opacity: 0, duration: 0.25, ease: 'power1.out'}, at + 0.1);
      if (f.fx) to(f.fx, {opacity: 1, duration: 0.3, ease: 'power1.out'}, at + 0.2);
    }
    function focusClose(f, at) {
      to(f.els, {scale: 1, duration: CLOSE, ease: EASE}, at);
      to(dimmable, {opacity: 1, duration: CLOSE, ease: EASE}, at);
      if (f.fx) to(f.fx, {opacity: 0, duration: 0.25, ease: 'power1.in'}, at);
      if (f.sk) to(f.sk, {opacity: 1, duration: 0.3, ease: 'power1.out'}, at + 0.1);
      // Resting stacking: the funnel sits above the Tuner and Knowly column (it overlaps it while receding), logos on top
      f.els.forEach(function (e) { tl.set(e, {zIndex: e.tagName === 'IMG' ? 5 : (e === d.funnel ? 4 : 3)}, at + CLOSE); });
    }
    // One scene: amplia -> fn(A, B) -> result -> reduz -> hold. A = start of the action, B = end of the action window
    function scene(id, comp, keep, fn) {
      var s = S[id], A = s.t0 + OPEN, closeAt = s.t0 + s.act - CLOSE, B = closeAt - RESULT;
      focusOpen(F[comp], s.t0, keep);
      W = {A: A, B: B, k: (B - 0.4 - A) / (B - A)};
      fn(A, B, closeAt, s);
      W = null;
      focusClose(F[comp], closeAt);
    }

    // PEQUENOS GESTOS
    var pop = function (e, at, dur) { ft(e, {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: dur || 0.3, ease: 'power2.out'}, at); };
    var lit = function (b, at) { to(b, {color: AMBER, borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.2}, at); };
    var litPop = function (b, at) {
      lit(b, at);
      ft(b, {scale: 1}, {scale: 1.35, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1}, at);
    };
    var segOn = function (e, at, dur, fromRight) {
      ft(e, {opacity: 1, scaleX: 0, transformOrigin: fromRight ? '100% 50%' : '0% 50%'}, {opacity: 1, scaleX: 1, duration: dur, ease: 'power1.inOut'}, at);
    };
    var segOff = function (e, at) { to(e, {opacity: 0, duration: 0.12, ease: 'power1.in'}, at); };
    var cardTo = function (stage, at, from) {
      to(d.cardw, {y: cardTop(stage) - cardTop(0), duration: 0.5, ease: EASE}, at);
      to(d.stripes[from], {borderColor: '#3A3A44', backgroundColor: '#17171B', duration: 0.3}, at);
      to(d.stripes[stage], {borderColor: AMBER, backgroundColor: '#1F1A10', duration: 0.3}, at + 0.2);
    };
    var roomGlow = function (i, on, at) {
      to(d.rooms[i], on ? {borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.25, ease: 'power1.out'} : {borderColor: '#3A3A44', backgroundColor: '#202027', duration: 0.3}, at);
    };
    var roomCenter = function (i) {
      var col = i % 2, row = Math.floor(i / 2), r = G.room, h = G.house;
      return {x: h.x + r.padX + col * (r.w + r.gapX) + r.w / 2, y: h.bodyY + r.padY + row * (r.h + r.gapY) + r.h / 2};
    };
    // Position of badge i of the card (world px) when the funnel is shifted by dx
    // The receipt rests in the bottom-right corner of the Magneto panel (an empty corner of its skeleton)
    var RCPT = {x: G.mag.x + G.mag.w - 26, y: G.mag.y + G.mag.h - 26};
    var badgeAt = function (i, stage, dx) { return {x: G.funnel.x + dx + G.card.x + 12 + i * 29 + 12, y: G.funnel.y + cardTop(stage) + G.card.h - 31 + 12}; };

    // ===== S0 NÚCLEO (0.0-2.4 s de ação): a casa monta cheia, o funil encaixa, os trilhos e os logos acendem =====
    d.rooms.forEach(function (room, i) {
      // Rooms rise into place (never fall through the row above, which would overlap its label)
      tl.fromTo(room, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.4, ease: 'power3.out'}, 0.05 + i * 0.1);
    });
    // The outline is only drawn once at least six rooms are visible (the sixth starts at 0.05 + 5 * 0.1 = 0.55)
    d.outline.querySelectorAll('path,polyline').forEach(function (p, i) { drawOn(tl, p, 0.95 + i * 0.05, 0.4, 'power2.inOut'); });
    tl.fromTo(d.logos.domus, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 1.0);
    tl.fromTo(d.funnel, {opacity: 0, x: -60}, {opacity: 1, x: 0, duration: 0.4, ease: 'power3.out'}, 1.1);
    drawOn(tl, d.seam.querySelector('path'), 1.4, 0.25, 'power1.out');
    tl.fromTo(d.logos.relloo, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 1.45);
    tl.fromTo([d.phone, d.tp, d.kp, d.mp, d.mgr], {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out', stagger: 0.05}, 1.3);
    ['tuner', 'magneto', 'knowly'].forEach(function (kk, i) {
      tl.fromTo(d.rails[kk], {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.4, ease: 'power2.inOut'}, 1.5 + i * 0.1);
    });
    tl.fromTo(d.logos.tuner, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 1.7);
    tl.fromTo(d.logos.magneto, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 1.8);
    tl.fromTo(d.logos.knowly, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 1.9);
    // Hook: one rail blinks lightly in the last frames of the action (the funnel is empty: what comes in?)
    tl.to(d.flash.tuner, {opacity: 0.8, duration: 0.12, ease: 'power1.out'}, 2.15);
    tl.to(d.flash.tuner, {opacity: 0, duration: 0.13, ease: 'power1.in'}, 2.27);

    // ===== S1 CANAIS, Tuner (voz e WhatsApp viram uma conversa só) =====
    scene('s1', 'tuner', [[d.funnel, 0.8], [d.phone, 0.8]], function (A, B, closeAt) {
      // Marina sends: the phone shows a sent bubble (a bar, outside the focus)
      to(d.pskOut, {opacity: 1, duration: 0.25}, A + 0.0);
      // Voz arrives first (the call row), then the WhatsApp message lands in the SAME thread
      to(d.chV, {color: AMBER, borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.2}, A + 0.3);
      ft(d.call, {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'}, A + 0.4);
      to(d.chW, {color: AMBER, borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.2}, A + 0.9);
      ft(d.tmsg, {opacity: 0, scale: 0.85, y: 8, transformOrigin: '0% 100%'}, {opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out'}, A + 1.0);
      // One thread: a bracket joins the call and the message
      to(d.brk, {opacity: 1, scaleY: 1, duration: 0.4, ease: 'power2.inOut'}, A + 1.7);
      // Resting beat (A + 2.1 to B): the thread stays still and legible
      // The thread condenses into a packet that leaves along the Tuner rail (it never lands in sight)
      var p0 = scaled(FS.tuner, G.tuner.x + G.tuner.w / 2, G.tuner.y + 8);
      ft(d.pk1, {x: p0.x, y: p0.y + 6, opacity: 0, scale: 0.4}, {opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out'}, closeAt - 0.02);
      to(d.pk1, {y: G.rail.tuner, duration: 0.12, ease: 'power2.inOut'}, closeAt + 0.06);
      to(d.pk1, {x: 800, duration: 0.3, ease: 'power1.inOut'}, closeAt + 0.1);
      to(d.pk1, {opacity: 0, duration: 0.1, ease: 'power1.in'}, closeAt + 0.33);
      segOn(d.litT1, closeAt + 0.1, 0.3);
      segOff(d.litT1, closeAt + 0.28);
      to(d.chV, {color: '#B9B9C4', borderColor: '#4A4A56', backgroundColor: '#17171B', duration: 0.2}, closeAt + 0.1);
      to(d.chW, {color: '#B9B9C4', borderColor: '#4A4A56', backgroundColor: '#17171B', duration: 0.2}, closeAt + 0.1);
      to([d.call, d.tmsg, d.brk], {opacity: 0, duration: 0.2}, closeAt + 0.05);
    });

    // ===== S2 RELACIONAMENTO, Relloo (o cartão nasce em Novo e vai para Em análise) =====
    scene('s2', 'funnel', [], function (A, B, closeAt) {
      to(d.stripes[0], {borderColor: AMBER, backgroundColor: '#1F1A10', duration: 0.3}, A + 0.15);
      ft(d.cardw, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out'}, A + 0.2);
      to(d.sheet, {opacity: 1, duration: 0.25}, A + 0.6);
      // Four beats of 0.5 s: owner, deadline, history, return (each row appears and its badge lights)
      [0, 1, 2, 3].forEach(function (i) {
        var at = A + 0.8 + i * 0.5;
        ft(d.srows[i], {opacity: 0, x: -14}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, at);
        litPop(d.badges[i], at + 0.1);
      });
      ft(d.srows[4], {opacity: 0, x: -14}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 2.8);
      // Fewer words in focus: the stage names that the card has not reached yet fade while the sheet is open
      to([d.flabEls[2], d.flabEls[3]], {opacity: 0, duration: 0.25}, A + 0.5);
      // The card slides to Em análise with the delivery field still empty
      cardTo(1, A + 3.05, 0);
      to(d.sheet, {opacity: 0, duration: 0.2}, closeAt);
      to(d.srows, {opacity: 0, duration: 0.2}, closeAt);
    });

    // ===== S3 DEFINIÇÃO, Domus (os cômodos mandam endereço, pedido e janela de sábado ao cartão) =====
    scene('s3', 'house', [[d.funnel, 0.9]], function (A, B, closeAt) {
      var dx = -60, stage = 1;
      // The funnel slides left so the opened house never covers the card; the seam hides while the house is open
      to(d.funnel, {x: dx, duration: OPEN, ease: EASE}, A - OPEN);
      to(d.seam, {opacity: 0, duration: 0.2}, A - OPEN);
      to(d.seam, {opacity: 1, duration: 0.2}, closeAt + 0.2);
      // [room, chip, badge, exit offset]: every chip leaves its room through a free side (never over another room's label)
      [[0, 0, 4, {x: -320, y: 0}], [1, 1, 5, {x: 0, y: -115}], [5, 2, 6, {x: 0, y: 265}]].forEach(function (e, n) {
        var room = e[0], chip = d.fc[e[1]], badge = e[2], at = A + 0.1 + n * 0.65;
        var c = roomCenter(room), base = scaled(FS.house, c.x, c.y), from = {x: base.x + e[3].x, y: base.y + e[3].y}, tgt = badgeAt(badge, stage, dx);
        roomGlow(room, true, at);
        ft(chip, {x: from.x, y: from.y, opacity: 0, scale: 0.7}, {opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out'}, at + 0.15);
        // The chip comes into the card from below (the title sits at the top of the card and must stay readable)
        to(chip, {x: tgt.x + 40, y: tgt.y + 62, duration: 0.5, ease: 'power1.inOut'}, at + 0.25);
        to(chip, {x: tgt.x, y: tgt.y, scale: 0.12, opacity: 0, duration: 0.15, ease: 'power2.in'}, at + 0.75);
        litPop(d.badges[badge], at + 0.85);
      });
      to(d.funnel, {x: 0, duration: CLOSE, ease: EASE}, closeAt);
      [0, 1, 5].forEach(function (i) { roomGlow(i, false, closeAt); });
    });

    // ===== S4 CONHECIMENTO, Knowly (a linha "Sábado: entregas até 12h" entra no cartão como fonte) =====
    scene('s4', 'knowly', [[d.funnel, 0.8]], function (A, B, closeAt) {
      var K = FS.knowly, kc = G.kp.x + G.kp.w / 2, lineCy = G.kp.y + 126 + 34;
      var s0 = scaled(K, kc, lineCy);
      to(d.khl, {opacity: 1, duration: 0.35, ease: 'power1.out'}, A + 0.0);
      // The line detaches: same place, grows to the reading size (56 px) and waits there, still
      gsap.set(d.kdet, {scale: 0.7});
      ft(d.kdet, {x: s0.x, y: s0.y, opacity: 0, scale: 0.7}, {opacity: 1, duration: 0.15, ease: 'power1.out'}, A + 0.5);
      to(d.kline, {opacity: 0.3, duration: 0.2}, A + 0.5);
      // It drops into the free band under the Knowly rail, where nothing else is drawn, and reads there at 56 px
      to(d.kdet, {scale: 1, x: s0.x + 40, y: 915, duration: 0.4, ease: 'power2.out'}, A + 0.55);
      // Down to the Knowly rail, along it to the funnel, up into the card as its source
      var tgt = badgeAt(7, 1, 0);
      to(d.kdet, {y: G.rail.knowly, scale: 0.6, duration: 0.3, ease: 'power2.inOut'}, A + 1.5);
      segOn(d.litK, A + 1.8, 0.6);
      to(d.kdet, {x: tgt.x, scale: 0.5, duration: 0.6, ease: 'power1.inOut'}, A + 1.8);
      to(d.kdet, {y: tgt.y, scale: 0.12, duration: 0.4, ease: 'power2.in'}, A + 2.4);
      to(d.kdet, {opacity: 0, duration: 0.1}, A + 2.7);
      segOff(d.litK, A + 2.5);
      litPop(d.badges[7], A + 2.75);
      // The source line lights up again in the panel once its copy is in the card (it stays readable during the still result)
      to(d.kline, {opacity: 1, duration: 0.2}, A + 2.8);
      to(d.khl, {opacity: 0, duration: 0.2}, closeAt);
    });

    // ===== S5 EXECUÇÃO, Magneto (aguardando aprovação, a Gestora aprova, resolvido) =====
    scene('s5', 'magneto', [[d.houseGrp, 0.8], [d.funnel, 0.8], [d.logos.domus, 0.8]], function (A, B, closeAt, sc) {
      // The house and the funnel step 60 px left (logos and seam with them) so the opened panel never covers a room
      var SH = -70, glued = [d.houseGrp, d.funnel, d.logos.domus, d.logos.relloo, d.seam];
      tl.to(glued, {x: SH, duration: OPEN, ease: EASE}, sc.t0);
      tl.to(glued, {x: 0, duration: CLOSE, ease: EASE}, closeAt);
      // The card goes to Aguardando aprovação; the rule leaves the Regras room along the Magneto rail
      cardTo(2, A + 0.0, 1);
      roomGlow(3, true, A + 0.4);
      var rc = roomCenter(3), panelL = scaled(FS.magneto, G.mag.x, 0).x;
      ft(d.rule, {x: rc.x + SH, y: rc.y, opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out'}, A + 0.5);
      to(d.rule, {y: G.rail.magneto, duration: 0.15, ease: 'power2.inOut'}, A + 0.62);
      to(d.rule, {x: panelL + 30, duration: 0.45, ease: 'power1.inOut'}, A + 0.77);
      segOn(d.litM1, A + 0.77, 0.45);
      to(d.rule, {opacity: 0, scale: 0.6, duration: 0.15, ease: 'power1.in'}, A + 1.2);
      segOff(d.litM1, A + 1.3);
      roomGlow(3, false, A + 1.0);
      // Step 1: check the shipment
      ft(d.s1, {opacity: 0, x: 14}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 1.3);
      ft(d.ok[0], {opacity: 0, scale: 0.4}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, A + 1.7);
      // Step 2: the Gestora taps Aprovar
      ft(d.s2, {opacity: 0, x: 14}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 2.1);
      to(d.mgr, {borderColor: AMBER, duration: 0.2}, A + 2.2);
      var mgrC = {x: G.mgr.x + G.mgr.w / 2, y: G.mgr.y + G.mgr.h - 10};
      var btnC = scaled(FS.magneto, G.mag.x + 10 + 115, G.mag.y + 158 + 48);
      ft(d.finger, {x: mgrC.x, y: mgrC.y, opacity: 0}, {opacity: 1, duration: 0.1}, A + 2.3);
      to(d.finger, {x: btnC.x, y: btnC.y, duration: 0.3, ease: 'power2.inOut'}, A + 2.4);
      ft(d.ripple, {x: btnC.x, y: btnC.y, opacity: 0.9, scale: 0.3}, {opacity: 0, scale: 2.2, duration: 0.4, ease: 'power2.out'}, A + 2.75);
      to(d.finger, {scale: 0.8, duration: 0.08, yoyo: true, repeat: 1}, A + 2.75);
      to(d.finger, {opacity: 0, duration: 0.15}, A + 3.0);
      // Approved: the button turns green (its check would sit over the label)
      to(d.s2, {backgroundColor: '#53D68A', borderColor: '#53D68A', duration: 0.25}, A + 2.95);
      // Step 3: update the order; the card is Resolvido and the receipt appears
      ft(d.s3, {opacity: 0, x: 14}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 3.2);
      ft(d.ok[2], {opacity: 0, scale: 0.4}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, A + 3.55);
      cardTo(3, A + 3.6, 2);
      litPop(d.badges[8], A + 3.75);
      to(d.mgr, {borderColor: '#3A3A44', duration: 0.3}, closeAt);
      // The receipt appears on the Magneto rail, at the edge of the panel, while the panel closes; S6 takes it back to the Domus
      ft(d.rcpt, {x: RCPT.x, y: RCPT.y, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, closeAt + 0.2);
      // Back to the skeleton look for the next frames: the green button returns to amber behind the fade of the focus content
      to(d.s2, {backgroundColor: '#FFB020', borderColor: '#FFB020', duration: 0.01}, closeAt + 0.3);
    });

    // ===== S6 RESULTADO, Domus e Tuner (recibo, confirmação à Marina, todos os produtos acesos, cartão arquivado) =====
    scene('s6', 'tuner', [[d.houseGrp, 0.8], [d.funnel, 0.8], [d.mp, 0.8], [d.phone, 1], [d.logos.domus, 0.8], [d.logos.magneto, 0.8]], function (A, B, closeAt) {
      // The receipt goes back to the Pedidos room, which records the order
      var pc = roomCenter(1);
      // out of the panel corner, up the gap between the house wall and the Magneto panel, then into the Pedidos room
      var gapX = (G.house.x + G.house.w + G.mag.x) / 2;
      to(d.rcpt, {x: gapX, duration: 0.25, ease: 'power1.inOut'}, A + 0.0);
      to(d.rcpt, {y: pc.y, duration: 0.35, ease: 'power1.inOut'}, A + 0.25);
      to(d.rcpt, {x: pc.x + 110, duration: 0.25, ease: 'power1.inOut'}, A + 0.6);
      to(d.rcpt, {opacity: 0, scale: 0.5, duration: 0.12}, A + 0.85);
      to(d.roomBase, {opacity: 0, duration: 0.2}, A + 0.85);
      to(d.roomAlt, {opacity: 1, duration: 0.25}, A + 0.9);
      roomGlow(1, true, A + 0.85);
      // The Tuner writes the confirmation in the thread and takes it to Marina's phone
      to(d.chW, {color: AMBER, borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.2}, A + 0.3);
      ft(d.treply, {opacity: 0, scale: 0.85, y: 8, transformOrigin: '100% 100%'}, {opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out'}, A + 1.0);
      // The packet leaves from the right end of the thread (nothing is covered) and runs left along the Tuner rail to the phone
      var tp0 = scaled(FS.tuner, G.tuner.x + G.tuner.w - 30, G.tuner.y + 8);
      ft(d.pk3, {x: tp0.x, y: tp0.y + 6, opacity: 0, scale: 0.5}, {opacity: 1, scale: 1, duration: 0.1}, A + 1.3);
      to(d.pk3, {y: G.rail.tuner, duration: 0.1, ease: 'power2.inOut'}, A + 1.38);
      to(d.pk3, {x: G.phone.x + G.phone.w - 20, duration: 0.25, ease: 'power1.inOut'}, A + 1.46);
      segOn(d.litT2, A + 1.46, 0.25, true);
      to(d.pk3, {y: G.phone.y + 120, opacity: 0, duration: 0.15, ease: 'power2.in'}, A + 1.7);
      segOff(d.litT2, A + 1.8);
      // Marina's phone shows the confirmation as received (a bar, ticks green)
      to(d.pskIn, {opacity: 1, duration: 0.25}, A + 1.8);
      to(d.phone, {borderColor: '#53D68A', duration: 0.25}, A + 1.8);
      // The return of the card gets its check and everything lights once, in sequence
      to(d.badges[3], {color: '#53D68A', borderColor: '#53D68A', backgroundColor: '#12301F', duration: 0.25}, A + 1.8);
      to(dimmable, {opacity: 1, duration: 0.3, ease: 'power1.out'}, A + 1.75);
      var flashes = [[d.seamFlash, 1.75], [d.flash.tuner, 1.9], [d.flash.magneto, 2.05], [d.flash.knowly, 2.2]];
      flashes.forEach(function (f) {
        to(f[0], {opacity: 1, duration: 0.12, ease: 'power1.out'}, A + f[1]);
        to(f[0], {opacity: 0, duration: 0.2, ease: 'power1.in'}, A + f[1] + 0.14);
      });
      // The card is archived and the funnel is empty again
      to(d.cardw, {opacity: 0, duration: 0.25, ease: 'power1.in'}, A + 2.25);
      to(d.stripes, {borderColor: '#3A3A44', backgroundColor: '#17171B', duration: 0.25}, A + 2.25);
      // The Pedidos room goes back to its label together with the closing of the focus
      to(d.roomAlt, {opacity: 0, duration: 0.25}, closeAt);
      to(d.roomBase, {opacity: 1, duration: 0.25}, closeAt);
      roomGlow(1, false, closeAt);
      to([d.pskOut, d.pskIn], {opacity: 0, duration: 0.25}, closeAt);
      to(d.phone, {borderColor: '#4A4A56', duration: 0.25}, closeAt);
      to(d.chW, {color: '#B9B9C4', borderColor: '#4A4A56', backgroundColor: '#17171B', duration: 0.2}, closeAt);
      to(d.treply, {opacity: 0, duration: 0.2}, closeAt);
      // Reset of the card and its badges behind the fade (no visual effect, makes the loop frame equal to S0)
      tl.set(d.cardw, {y: 0}, A + 2.5);
      to(d.badges, {color: '#5A5A66', borderColor: '#4A4A56', backgroundColor: 'rgba(0,0,0,0)', duration: 0.01}, A + 2.5);
    });

    // Tail (long version only): after the S6 hold the five logos light once, in order of weight, then the island stays still
    var endAll = P[P.length - 1].end + tail;
    if (tail > 0) {
      // Left to right: Tuner, Knowly, Relloo, Domus, Magneto (every logo is back at 1 before the last second of stillness)
      var tEnd = P[P.length - 1].end, order = ['tuner', 'knowly', 'relloo', 'domus', 'magneto'];
      to(order.map(function (kk) { return d.logos[kk]; }), {opacity: 0.4, duration: 0.25, ease: 'power1.in'}, tEnd + 0.2);
      order.forEach(function (kk, i) { to(d.logos[kk], {opacity: 1, duration: 0.3, ease: 'power1.out'}, tEnd + 0.5 + i * 0.3); });
    }
    if (cfg.duration) tl.to({}, {duration: 0.001}, Math.max(cfg.duration, endAll) - 0.001);
    else tl.to({}, {duration: 0.001}, endAll - 0.001);
    return tl;
  }

  window.ChainValue = {build: build, G: G, FS: FS, LOGO: LOGO, plan: plan, SCENES: pub(plan(1)), scenesFor: function (hold) { return pub(plan(hold)); }};
})();
