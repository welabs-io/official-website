// COREOGRAFIA DA CADEIA DE VALOR, VERSÃO 1.3.0 (protótipo: passos 0 a 3 do plano v5, tabela 2.2)
// One island: the Domus house (8 rooms) at the centre with the Relloo glued to its left wall, three rails (Tuner, Magneto,
// Knowly) crossing the whole scene, Marina's phone on the left, the Knowly panel (policy document) below the Tuner pills.
// Dynamic focus (approved language): the component that owns the moment opens and comes to the front while the rest fades to 0.35;
// the same open/close pair (0.45 s power2.inOut) every time, settled before the next event; the Domus house never leaves the
// frame (it only fades). Each product is the protagonist of its own step:
//   B0  (0.0-2.8 s)   Domus + Relloo: rooms rise, outline wraps them, the Relloo snaps in, the rails are drawn;
//   S1  Tuner -> Relloo  the call (Voz) comes in through the rail and opens the conversation; Marina types on the phone in focus,
//                         the message crosses the same rail and lands in the SAME conversation (one conversation, every channel);
//   S2  Domus -> Relloo  the house opens (scaled, never cut): Pessoas, Pedidos and Atendimento light up and each sends a pulse
//                         across the seam into the customer card (name recognised, Pedido 1234, address); the Relloo greets her;
//   S3  Knowly -> Relloo Marina asks "Sábado dá?"; the Knowly panel opens with the "Política de entregas" document, the Saturday
//                         line is highlighted, detaches and climbs the Knowly rail into the Relloo, which shows the suggested reply
//                         with its source; the agent sends it and the phone gets it (ticks blue). The Entregas room stays off:
//                         the change rule belongs to step 4.
// No brand and no logo of the messaging app: neutral chat UI. Pure function of time: one paused GSAP timeline, no clock, no random.
// 1.3.0 over 1.2.0: restructured around table 2.2 (house focus, Knowly panel, call as second channel); 1.1.0 and 1.2.0 untouched.
// Contract (see plan-v5/motion-plan.md 2.3):
//   ChainValue.build({root, format, story, endorse, duration}) -> paused timeline
//   root must hold div#world with the five product logos (img.logo[data-p], src set by the brand loader).
//   endorse: "on" swaps each logo to its "by welabs" file (seal hangs below the logo, layout unchanged); "off" keeps the plain logo.
// format "mobile" is not drawn yet.
(function () {
  var AMBER = '#FFB020', SVGNS = 'http://www.w3.org/2000/svg';

  // GEOMETRIA DO MUNDO (px a 1920x1080, câmera 1,0)
  var G = {
    // The Magneto rail runs through the 14 px gap between the second and third room rows (566-580), never over a room
    rail: {tuner: 300, magneto: 573, knowly: 820},
    phone: {x: 30, y: 340, w: 290, h: 460},
    pills: {x: 340, right: 520, y: [318, 374, 430]},
    annex: {x: 600, y: 340, w: 330, h: 460},
    house: {x: 930, w: 614, roofY: 240, eaveY: 340, bodyY: 340, bodyH: 460},
    room: {w: 270, h: 96, gapX: 20, gapY: 14, padX: 27, padY: 20},
    manager: {x: 1570, y: 340, w: 320, h: 130},
    // Knowly panel: logo on top, the policy document below; sits under the Magneto rail, above the Knowly rail
    kp: {x: 330, y: 590, w: 270, h: 210},
    // Window 1600 x 900 world px (scale 1.2) from x 0 and y 71: the house right edge (1544) keeps 56 world px, the Domus logo keeps
    // 96 screen px from the top edge
    camera: {s: 1.2, x: 0, y: -85.2}
  };
  // Logo table: x-height based size (lx px), viewBox of the plain (wp x hp, top vy) and endorsed (he) files, x of the left
  // edge and base = world y of the text baseline (logo baseline sits at viewBox y 210); Tuner and Relloo share one baseline
  var LOGO = {
    domus:   {K: 1.958,  wp: 864.66,  hp: 293.70, he: 426.63, vy: -4.80,  lx: 30, x: 1150, base: 194},
    relloo:  {K: 1.894,  wp: 640.92,  hp: 284.10, he: 421.83, vy: 0,      lx: 30, x: 701,  base: 264},
    tuner:   {K: 2.2569, wp: 772.57,  hp: 338.53, he: 466.96, vy: -45.13, lx: 30, x: 340,  base: 264},
    magneto: {K: 2.014,  wp: 1155.84, hp: 302.10, he: 430.83, vy: -9,     lx: 30, x: 340,  base: 549},
    knowly:  {K: 2.014,  wp: 916.20,  hp: 302.10, he: 430.83, vy: -9,     lx: 26, x: 342,  base: 636}
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
  var TICKS = '<svg class="tk" viewBox="0 0 20 12" width="20" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="t1" d="M1.5 6.5L5 10L11.5 2"/><path class="t2" d="M7 9L8.5 10.5L15 2.5"/></svg>';
  var PHONE_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#C9D3D8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>';

  function px(n) { return n + 'px'; }
  function el(parent, tag, cls, css, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (css) Object.keys(css).forEach(function (k) { e.style[k] = typeof css[k] === 'number' ? px(css[k]) : css[k]; });
    if (html != null) e.innerHTML = html;
    parent.appendChild(e);
    return e;
  }
  function svg(parent, markup, css) {
    var wrap = el(parent, 'div', 'svgwrap', css);
    wrap.innerHTML = '<svg xmlns="' + SVGNS + '" viewBox="0 0 1920 1080" width="1920" height="1080">' + markup + '</svg>';
    return wrap;
  }
  // One chat message: wrapper with the final size from the start, the bubble (hidden until it arrives) and, optionally, the
  // typing indicator that sits in the same slot. side "out" = sent (right, green), "in" = received (left, grey)
  function message(parent, side, text, time, opts) {
    var m = {wrap: el(parent, 'div', 'msg ' + side)};
    m.bb = el(m.wrap, 'div', 'bb', null, '<span class="tx">' + text + '</span><span class="meta"><span class="tm">' + time + '</span>' + (opts.ticks ? TICKS : '') + '</span>');
    // Word spans when the text is composed in place (the agent's reply in the Relloo)
    if (opts.words) { m.bb.querySelector('.tx').innerHTML = text.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' '); m.w = m.bb.querySelectorAll('.tx .w'); }
    if (opts.ticks) { m.tk = m.bb.querySelector('.tk'); m.t2 = m.bb.querySelector('.t2'); }
    if (opts.dots) { m.dots = el(m.wrap, 'div', 'dots', null, '<i></i><i></i><i></i>'); m.dot = m.dots.querySelectorAll('i'); }
    return m;
  }

  // MONTAGEM DO DOM (a peça só declara #world e os cinco logos)
  function mount(root, story, endorse) {
    var world = root.querySelector('#world');
    // Island layer: every component sits under it, so each text is at least four levels below #world and the logos
    // (direct children of #world) are only compared, by the gate, with what sits right beside them
    var isl = el(world, 'div', 'isl');
    var d = {};
    // Rails: dim base bar, drawn left to right; the Tuner one also carries lit segments between the phone and the Relloo
    d.rails = {};
    ['tuner', 'magneto', 'knowly'].forEach(function (k) {
      d.rails[k] = el(isl, 'div', 'rail', {left: 64, top: G.rail[k] - 3, width: 1792, height: 6});
    });
    d.lit = el(isl, 'div', 'rail lit', {left: 540, top: G.rail.tuner - 3, width: 210, height: 6});     // Voz crossing
    d.lit2 = el(isl, 'div', 'rail lit', {left: 190, top: G.rail.tuner - 3, width: 560, height: 6});    // return leg (right to left)
    d.lit3 = el(isl, 'div', 'rail lit', {left: 554, top: G.rail.tuner - 3, width: 196, height: 6});    // WhatsApp crossing
    d.lit4 = el(isl, 'div', 'rail lit', {left: 554, top: G.rail.tuner - 3, width: 196, height: 6});    // Marina's second message
    d.lit5 = el(isl, 'div', 'rail lit', {left: 190, top: G.rail.tuner - 3, width: 560, height: 6});    // final answer (right to left)
    d.litK = el(isl, 'div', 'rail lit', {left: 340, top: G.rail.knowly - 3, width: 425, height: 6, zIndex: '24'});   // Knowly rail pulse

    // House: one group (outline, rooms) so the whole house scales together
    var h = G.house, r = G.room;
    var roofPts = h.x + ',' + h.eaveY + ' ' + (h.x + h.w / 2) + ',' + h.roofY + ' ' + (h.x + h.w) + ',' + h.eaveY;
    var bodyPath = 'M' + h.x + ' ' + h.bodyY + 'V' + (h.bodyY + h.bodyH - 20) + 'a20 20 0 0 0 20 20H' + (h.x + h.w - 20) + 'a20 20 0 0 0 20 -20V' + h.bodyY;
    d.houseGrp = el(isl, 'div', 'isl');
    d.outline = svg(d.houseGrp, '<path class="body" d="' + bodyPath + '"/><polyline class="roof" points="' + roofPts + '"/>', {left: 0, top: 0});
    d.rooms = ROOM_ORDER.map(function (name, i) {
      var col = i % 2, row = Math.floor(i / 2);
      var room = el(d.houseGrp, 'div', 'room', {
        left: h.x + r.padX + col * (r.w + r.gapX), top: h.bodyY + r.padY + row * (r.h + r.gapY), width: r.w, height: r.h
      });
      room.innerHTML = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="' + AMBER + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg><b>' + name + '</b>';
      return room;
    });

    // Relloo annex: conversation list (skeleton) first; then the customer card (unknown contact, filled by the Domus in S2) and the chat
    var a = G.annex;
    d.annex = el(isl, 'div', 'annex', {left: a.x, top: a.y, width: a.w, height: a.h});
    d.annexHead = el(d.annex, 'div', 'ah', null, '<span>Conversas</span>');
    d.skel = el(d.annex, 'div', 'skel', null, '<i></i><i></i><i></i>');
    d.rhead = el(d.annex, 'div', 'rhead', null,
      '<div class="rid"><span class="rav"><i class="q">?</i><i class="m">M</i></span><span class="rnm"><b class="n0">' + story.unknown + '</b><b class="n1">' + story.person + '</b></span></div>' +
      '<div class="chips"><span class="chip c-voz">Voz</span><span class="chip c-wa">' + story.channels[0] + '</span></div>' +
      '<div class="chips"><span class="chip ord">' + story.order + '</span></div>' +
      '<div class="adr">' + story.address + '</div>');
    d.rq = d.rhead.querySelector('.q'); d.rm = d.rhead.querySelector('.m');
    d.n0 = d.rhead.querySelector('.n0'); d.n1 = d.rhead.querySelector('.n1');
    d.chipVoz = d.rhead.querySelector('.c-voz'); d.chipWa = d.rhead.querySelector('.c-wa');
    d.chipOrd = d.rhead.querySelector('.ord'); d.adr = d.rhead.querySelector('.adr');
    d.rwin = el(d.annex, 'div', 'rwin');
    d.rscroll = el(d.rwin, 'div', 'rscroll');
    d.hist = el(d.rscroll, 'div', 'hist', null, PHONE_ICON + '<span class="ht">' + story.call.text + '</span><span class="hm">' + story.call.time + '</span>');
    d.r1 = message(d.rscroll, 'in', story.m1, story.times[0], {});
    d.r2 = message(d.rscroll, 'out', story.reply, story.times[1], {dots: true, words: true});
    d.r3 = message(d.rscroll, 'in', story.m3, story.times[2], {});
    d.r4 = message(d.rscroll, 'out', story.final, story.times[3], {});
    // Suggested reply from the Knowly (text, source pill, send button); the agent sends it
    d.rcomp = el(d.annex, 'div', 'rcomp', null, '<div class="sgt">' + story.suggestion + '</div><div class="src">' + story.source + '</div><span class="sgo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1C1A16" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span>');
    d.seam = svg(isl, '<path class="seam" d="M930 450V548C902 548 902 592 930 592V690"/>', {left: 0, top: 0});

    // Marina's phone: header (avatar, name, online / typing), chat with pattern, input field
    var p = G.phone;
    d.phone = el(isl, 'div', 'phone', {left: p.x, top: p.y, width: p.w, height: p.h});
    d.phead = el(d.phone, 'div', 'phead', null, '<span class="pav"><i>L</i></span><div class="pid"><b class="pname">' + story.shop + '</b><div class="pstat"><span class="s-on">online</span><span class="s-typ">digitando…</span></div></div>');
    d.pname = d.phead.querySelector('.pname');
    d.sOn = d.phead.querySelector('.s-on');
    d.sTyp = d.phead.querySelector('.s-typ');
    d.pchat = el(d.phone, 'div', 'pchat');
    d.pscroll = el(d.pchat, 'div', 'pscroll');
    d.p1 = message(d.pscroll, 'out', story.m1, story.times[0], {ticks: true});
    d.p2 = message(d.pscroll, 'in', story.reply, story.times[1], {dots: true});
    d.p3 = message(d.pscroll, 'out', story.m3, story.times[2], {ticks: true});
    d.p4 = message(d.pscroll, 'in', story.final, story.times[3], {});
    d.pin = el(d.phone, 'div', 'pinput', null, '<div class="ifield"><span class="iph">Mensagem</span><span class="ityped i1"></span><span class="ityped i3"></span></div><span class="isend"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span>');
    d.iph = d.pin.querySelector('.iph');
    function words(sel, text) {
      var box = d.pin.querySelector(sel), arr = text.split(' ');
      return arr.map(function (w, i) {
        var s = el(box, 'span', 'w', null, w);
        if (i < arr.length - 1) box.appendChild(document.createTextNode(' '));
        return s;
      });
    }
    d.w1 = words('.i1', story.m1);
    d.w3 = words('.i3', story.m3);
    d.i1 = d.pin.querySelector('.i1');
    d.i3 = d.pin.querySelector('.i3');
    d.pills = story.channels.map(function (name, i) {
      return el(isl, 'div', 'pill', {left: G.pills.x, top: G.pills.y[i]}, name);
    });

    // Knowly panel: the policy document (title and four lines); the highlight bar sits over the Saturday line
    var k = G.kp, kb = story.kb;
    d.kp = el(isl, 'div', 'kp', {left: k.x, top: k.y, width: k.w, height: k.h});
    d.kt = el(d.kp, 'div', 'kt', null, kb.title);
    d.kls = kb.lines.map(function (t, i) { return el(d.kp, 'div', 'kl', {top: 84 + i * 24}, t); });
    d.khl = el(d.kp, 'div', 'khl', {top: 84 + kb.hl * 24, height: 24});
    // The detaching line: same place and size as the highlighted line; the panel is scaled when it detaches, so it is scaled too
    d.kdet = el(isl, 'div', 'kdet', {left: k.x + 12, top: k.y + 84 + kb.hl * 24, width: k.w - 24, height: 24}, kb.detach);

    var pk = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#1C1A16" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4V5z"/></svg>';
    d.packet = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);    // Voz call
    d.packet1 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);   // WhatsApp message
    d.packet2 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);   // greeting back to the phone
    d.packet3 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);   // Marina's second message
    d.packet5 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);   // final answer back to the phone
    // Domus pulses: one per room, from the room to the customer card
    d.pulses = [0, 1, 2].map(function () { return el(isl, 'div', 'pulse', {left: 0, top: 0, zIndex: '25'}); });

    // Manager card (right side of the island; used by the later beats)
    var m = G.manager;
    d.manager = el(isl, 'div', 'mgr', {left: m.x, top: m.y, width: m.w, height: m.h}, '<span class="av"><i>G</i></span><div class="mt"><b>' + story.manager.split(' · ')[0] + '</b><b class="dm">' + (story.manager.split(' · ')[1] || '') + '</b></div>');

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
    if ((cfg.format || 'desktop') !== 'desktop') throw new Error('chain-value 1.3.0 draws only the desktop format');
    var endorse = cfg.endorse || root.getAttribute('data-endorse') || 'off';
    var story = cfg.story;
    var d = mount(root, story, endorse);
    var raw = gsap.timeline({paused: true});
    // Reading holds: an event that needs a beat to be read pushes everything after it later by that many seconds. The step list
    // below is written on the base clock; tl maps each start time through the holds, so inside an event nothing is stretched.
    var HOLDS = [[3.55, 0.5], [6.1, 0.6], [11.35, 0.8], [13.3, 0.5], [14.2, 0.5], [16.0, 1.0], [16.45, 0.2], [18.3, 0.8]];
    var shift = function (t) { var s = 0; HOLDS.forEach(function (h) { if (t >= h[0] - 1e-6) s += h[1]; }); return t + s; };
    var tl = {
      to: function (a, b, t) { return raw.to(a, b, shift(t)); },
      fromTo: function (a, b, c, t) { return raw.fromTo(a, b, c, shift(t)); },
      set: function (a, b, t) { return raw.set(a, b, shift(t)); }
    };
    // A bubble arrives: grows from its tail corner
    var arrive = function (m, at, side) {
      tl.fromTo(m.bb, {opacity: 0, scale: 0.85, y: 8, transformOrigin: side === 'out' ? '100% 100%' : '0% 100%'}, {opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'power2.out'}, at);
    };
    // Typing indicator: three dots that light up one after the other (finite, then gone)
    var typing = function (m, at, until) {
      tl.fromTo(m.dots, {opacity: 0}, {opacity: 1, duration: 0.15, ease: 'power1.out'}, at);
      tl.fromTo(m.dot, {opacity: 0.25}, {opacity: 1, duration: 0.2, ease: 'power1.out', stagger: 0.2}, at + 0.1);
      tl.to(m.dots, {opacity: 0, duration: 0.1, ease: 'power1.in'}, until - 0.1);
    };
    var typeWords = function (ws, at, step) {
      ws.forEach(function (w, i) { tl.fromTo(w, {opacity: 0}, {opacity: 1, duration: 0.05, ease: 'none'}, at + i * step); });
    };
    var pop = function (t, at) { tl.fromTo(t, {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'}, at); };

    // B0 (0.0-2.8 s): the house assembles full, the Relloo snaps in, the rails are drawn
    d.rooms.forEach(function (room, i) {
      // Rooms rise into place (never fall through the row above, which would overlap its label)
      tl.fromTo(room, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.4, ease: 'power3.out'}, 0.2 + i * 0.12);
    });
    // The outline is only drawn once at least six rooms are visible (the sixth starts at 0.2 + 5 * 0.12)
    d.outline.querySelectorAll('path,polyline').forEach(function (p, i) { drawOn(tl, p, 1.2 + i * 0.05, 0.4, 'power2.inOut'); });
    tl.fromTo(d.logos.domus, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 1.6);
    tl.fromTo(d.annex, {opacity: 0, x: -80}, {opacity: 1, x: 0, duration: 0.4, ease: 'power3.out'}, 1.6);
    drawOn(tl, d.seam.querySelector('path'), 2.0, 0.25, 'power1.out');
    tl.fromTo([d.phone, d.manager], {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out'}, 1.8);
    ['tuner', 'magneto', 'knowly'].forEach(function (kk, i) {
      tl.fromTo(d.rails[kk], {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.4, ease: 'power2.inOut'}, 1.9 + i * 0.1);
    });
    tl.fromTo(d.kp, {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out'}, 2.0);
    tl.fromTo(d.logos.tuner, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.1);
    tl.fromTo(d.logos.relloo, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.15);
    tl.fromTo(d.logos.magneto, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.15);
    tl.fromTo(d.logos.knowly, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.2);

    // B1 camera (2.8-3.4 s): whole house in frame, products outside the step stay discreet
    var C = G.camera, b1 = 2.8;
    tl.fromTo(d.world, {x: 0, y: 0, scale: 1, transformOrigin: '0px 0px'}, {x: C.x, y: C.y, scale: C.s, duration: 0.6, ease: 'power2.inOut'}, b1);
    tl.to([d.logos.domus, d.outline].concat(d.rooms), {opacity: 0.7, duration: 0.4, ease: 'power1.out'}, b1);
    tl.to([d.logos.knowly, d.rails.magneto, d.rails.knowly, d.kp], {opacity: 0.45, duration: 0.4, ease: 'power1.out'}, b1);
    tl.to(d.logos.magneto, {opacity: 0.3, duration: 0.4, ease: 'power1.out'}, b1);       // Magneto stays a discreet label until step 4
    tl.to(d.manager, {opacity: 0, duration: 0.3, ease: 'power1.out'}, b1);
    // The rails stop at world x 1560 (inside the 1600 px window) instead of bleeding through the right edge
    tl.to([d.rails.tuner, d.rails.magneto, d.rails.knowly], {scaleX: (1560 - 64) / 1792, duration: 0.6, ease: 'power2.inOut'}, b1);
    // Texts of the phone and of the conversation card appear with the camera, never as tiny text in the open shot
    tl.fromTo([d.pname, d.sOn, d.iph, d.annexHead.querySelector('span')], {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, b1 + 0.2);
    tl.fromTo(d.sTyp, {opacity: 0}, {opacity: 0, duration: 0.01}, b1);
    tl.fromTo(d.pills, {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.08}, b1 + 0.1);
    // Pieces of the Relloo card that are not there yet
    tl.fromTo([d.n1, d.rm, d.chipVoz, d.chipWa, d.chipOrd, d.adr, d.hist], {opacity: 0}, {opacity: 0, duration: 0.01}, 0);
    tl.fromTo(d.khl, {opacity: 0}, {opacity: 0, duration: 0.01}, 0);
    tl.fromTo(d.kdet, {opacity: 0}, {opacity: 0, duration: 0.01}, 0);
    d.pulses.forEach(function (pu) { tl.fromTo(pu, {opacity: 0}, {opacity: 0, duration: 0.01}, 0); });

    // FOCO DINÂMICO: open/close pair (0.45 s power2.inOut). base holds the resting opacity of every dimmable element, in code order
    var base = new Map(), OPEN = 0.45, EASE = 'power2.inOut';
    var setBase = function (list, v) { list.forEach(function (e) { base.set(e, v); }); };
    var houseEls = [d.logos.domus, d.outline].concat(d.rooms);
    setBase(houseEls, 0.7);
    setBase([d.logos.magneto, d.logos.knowly, d.rails.magneto, d.rails.knowly, d.kp], 0.45);
    setBase([d.logos.magneto], 0.3);
    var dimmable = houseEls.concat([d.rails.tuner, d.rails.magneto, d.rails.knowly, d.logos.tuner, d.logos.relloo, d.logos.magneto, d.logos.knowly, d.kp, d.phone, d.annex], d.pills);
    // Scale origins (world px): the phone grows from its left edge, the Relloo from the house wall, the house from its top-right corner
    // (so the roof logo keeps its margin and the right wall stays inside the window), the Knowly panel from its bottom-left corner
    var HO = {x: 1544, y: 151}, KO = {x: G.kp.x, y: G.kp.y + G.kp.h};
    gsap.set(d.phone, {transformOrigin: '0% 50%'});
    gsap.set(d.annex, {transformOrigin: '100% 50%'});
    gsap.set(d.houseGrp, {transformOrigin: HO.x + 'px ' + HO.y + 'px'});
    gsap.set(d.logos.domus, {transformOrigin: (HO.x - d.logoBox.domus.x) + 'px ' + (HO.y - d.logoBox.domus.y) + 'px'});
    gsap.set(d.kp, {transformOrigin: '0% 100%'});
    gsap.set(d.logos.knowly, {transformOrigin: (KO.x - d.logoBox.knowly.x) + 'px ' + (KO.y - d.logoBox.knowly.y) + 'px'});
    var SP = 1.4, SR = 1.3, SH = 1.15, SK = 1.6, ST = 1.35;
    // The Tuner block (channel pills + logo) grows from the Tuner logo baseline corner (340, 264)
    var TO = {x: 340, y: 264};
    d.pills.forEach(function (pl, i) { gsap.set(pl, {transformOrigin: (TO.x - G.pills.x) + 'px ' + (TO.y - G.pills.y[i]) + 'px'}); });
    gsap.set(d.logos.tuner, {transformOrigin: (TO.x - d.logoBox.tuner.x) + 'px ' + (TO.y - d.logoBox.tuner.y) + 'px'});
    var F = {
      tuner: {scale: d.pills.concat([d.logos.tuner]), s: ST, bright: d.pills.concat([d.logos.tuner]), keep: []},
      phone: {scale: [d.phone], s: SP, bright: [d.phone], keep: []},
      annex: {scale: [d.annex], s: SR, bright: [d.annex], keep: []},
      house: {scale: [d.houseGrp, d.logos.domus], s: SH, bright: houseEls, keep: [[d.annex, 0.8]]},
      knowly: {scale: [d.kp, d.logos.knowly], s: SK, bright: [d.kp, d.logos.knowly, d.rails.knowly], keep: []}
    };
    var focusOpen = function (f, at) {
      var skip = new Set(f.bright.concat(f.keep.map(function (k) { return k[0]; })));
      // Logos live outside the island layer and come before it in the DOM: one level above the focused panel keeps them on top
      f.scale.forEach(function (e) { tl.set(e, {zIndex: e.tagName === 'IMG' ? 21 : 20}, at); });
      tl.to(f.scale, {scale: f.s, duration: OPEN, ease: EASE}, at);
      tl.to(f.bright, {opacity: 1, duration: OPEN, ease: EASE}, at);
      tl.to(dimmable.filter(function (e) { return !skip.has(e); }), {opacity: 0.35, duration: OPEN, ease: EASE}, at);
      f.keep.forEach(function (k) { tl.to(k[0], {opacity: k[1], duration: OPEN, ease: EASE}, at); });
    };
    var focusClose = function (f, at) {
      tl.to(f.scale, {scale: 1, duration: OPEN, ease: EASE}, at);
      dimmable.forEach(function (e) { tl.to(e, {opacity: base.has(e) ? base.get(e) : 1, duration: OPEN, ease: EASE}, at); });
      f.scale.forEach(function (e) { tl.set(e, {zIndex: e.tagName === 'IMG' ? 5 : 3}, at + OPEN); });
    };
    var px0 = G.pills.right + 34, rY = G.rail.tuner, landX = G.annex.x + G.annex.w / 2;
    var annexTop = 570 - G.annex.h * SR / 2;                                                     // opened Relloo: top edge
    var phoneTop = 570 - G.phone.h * SP / 2, phoneCx = G.phone.x + G.phone.w * SP / 2;           // opened phone: top edge and centre
    var pillY = function (i) { return G.pills.y[i]; };
    var packetFrom = function (pk, at, y) { tl.fromTo(pk, {x: px0 - 26, y: y, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, at); };
    var pillOn = function (i, at) { tl.to(d.pills[i], {borderColor: AMBER, backgroundColor: '#2B2210', color: '#FFFFFF', duration: 0.15}, at); };
    var pillOff = function (i, at) { tl.to(d.pills[i], {borderColor: '#4A4A56', backgroundColor: '#17171B', color: '#B9B9C4', duration: 0.2}, at); };

    // ===== PASSO 1, Tuner -> Relloo (3.4-10.9 s): "todo canal, uma conversa só" =====
    // The call (Voz) comes in through the rail and opens the conversation in the Relloo
    // The Tuner block opens first (it is the protagonist of this step), the Voz channel lights up, the call leaves from the scaled pill
    focusOpen(F.tuner, 3.4);
    pillOn(1, 3.5);
    var pxT = TO.x + ST * (G.pills.right - TO.x) + 34, pyT = TO.y + ST * (pillY(1) + 24 - TO.y);
    tl.fromTo(d.packet, {x: pxT - 26, y: pyT - 26, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, 3.6);
    tl.to(d.packet, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 3.75);
    focusClose(F.tuner, 4.0);
    tl.to(d.packet, {x: landX - 26, duration: 0.5, ease: 'power1.inOut'}, 4.0);
    tl.fromTo(d.lit, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 4.0);
    tl.to(d.packet, {y: annexTop - 26, duration: 0.25, ease: 'power2.inOut'}, 4.5);
    tl.to(d.packet, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 4.7);
    focusOpen(F.annex, 4.4);
    tl.to([d.annexHead.querySelector('span'), d.skel], {opacity: 0, duration: 0.25, ease: 'power1.out'}, 4.65);
    tl.fromTo(d.rhead, {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'}, 4.65);
    pop(d.chipVoz, 4.9);
    pop(d.hist, 5.1);                                                   // the call, as a history item of the conversation
    pillOff(1, 5.2);
    focusClose(F.annex, 6.1);
    // Marina writes: the phone opens, she types and sends, the phone shrinks back
    focusOpen(F.phone, 6.55);
    tl.to(d.iph, {opacity: 0, duration: 0.1}, 7.0);
    typeWords(d.w1, 7.1, 0.13);                       // the field fills word by word (last word at 8.0 s)
    tl.to(d.i1, {opacity: 0, duration: 0.12}, 8.35);   // sent: the field empties
    tl.to(d.iph, {opacity: 1, duration: 0.15}, 8.4);
    arrive(d.p1, 8.35, 'out');
    tl.fromTo(d.p1.t2, {opacity: 0}, {opacity: 1, duration: 0.15}, 8.6);        // delivered: second grey tick
    focusClose(F.phone, 8.8);
    // The message crosses the same rail and lands in the SAME conversation
    pillOn(0, 8.9);
    packetFrom(d.packet1, 8.95, pillY(0));
    tl.to(d.packet1, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 9.1);
    tl.to(d.lit, {opacity: 0.3, duration: 0.2}, 9.2);
    tl.to(d.packet1, {x: landX - 26, duration: 0.5, ease: 'power1.inOut'}, 9.35);
    tl.fromTo(d.lit3, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 9.35);
    tl.to(d.packet1, {y: annexTop - 26, duration: 0.25, ease: 'power2.inOut'}, 9.85);
    tl.to(d.packet1, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 10.05);
    focusOpen(F.annex, 9.75);
    pop(d.chipWa, 10.25);
    arrive(d.r1, 10.3, 'in');
    tl.fromTo(d.p1.tk, {color: '#8696A0'}, {color: '#53BDEB', duration: 0.3, ease: 'power1.inOut'}, 10.6);   // read: ticks turn blue
    pillOff(0, 10.7);
    focusClose(F.annex, 11.35);

    // ===== PASSO 2, Domus -> Relloo (11.8-18.3 s): "ninguém pede de novo o que a empresa já sabe" =====
    // The house opens (scaled from its top-right corner, never cut); each room sends a pulse across the seam into the customer card
    focusOpen(F.house, 11.8);
    tl.to(d.annex, {x: -90, duration: OPEN, ease: EASE}, 11.8);       // the card slides left so the opened house never covers its fields
    var rc = function (i) {
      var col = i % 2, row = Math.floor(i / 2), r = G.room, h = G.house;
      var cx = h.x + r.padX + col * (r.w + r.gapX) + r.w / 2, cy = h.bodyY + r.padY + row * (r.h + r.gapY) + r.h / 2;
      return {x: HO.x - SH * (HO.x - cx), y: HO.y + SH * (cy - HO.y), half: SH * r.w / 2};
    };
    var glow = function (i, at) {
      tl.to(d.rooms[i], {borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.25, ease: 'power1.out'}, at);
      base.set(d.rooms[i], 1);
    };
    var cardY = function (rowY) { return G.annex.y + rowY; };
    // [room index, glow time, field target y (card row centre), fill time]
    [[0, 12.4, cardY(32), 13.1], [1, 13.3, cardY(116), 14.0], [2, 14.2, cardY(148), 14.9]].forEach(function (e, n) {
      var c = rc(e[0]), pu = d.pulses[n], t0 = e[1], t1 = e[3];
      glow(e[0], t0);
      tl.fromTo(pu, {x: c.x - c.half - 15, y: c.y - 15, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.1, ease: 'power2.out'}, t0 + 0.15);
      tl.to(pu, {x: 610 - 15, y: e[2] - 15, duration: 0.55, ease: 'power1.inOut'}, t0 + 0.25);
      tl.to(pu, {opacity: 0, duration: 0.1, ease: 'power1.in'}, t1 - 0.05);
    });
    // Fill of the card: recognised name (Pessoas), Pedido 1234 (Pedidos), address (Atendimento)
    tl.to(d.n0, {opacity: 0, duration: 0.3}, 13.1);
    tl.fromTo(d.n1, {opacity: 0}, {opacity: 1, duration: 0.3}, 13.1);
    tl.to(d.rq, {opacity: 0, duration: 0.3}, 13.1);
    tl.fromTo(d.rm, {opacity: 0}, {opacity: 1, duration: 0.3}, 13.1);
    tl.fromTo(d.chipOrd, {opacity: 0, scale: 0.8, transformOrigin: '0% 50%'}, {opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.6)'}, 14.0);
    pop(d.adr, 14.9);
    focusClose(F.house, 16.0);
    tl.to(d.annex, {x: 0, duration: OPEN, ease: EASE}, 16.0);
    // The Relloo answers with the order already in hand
    focusOpen(F.annex, 16.45);
    tl.to(d.rscroll, {y: -20, duration: 0.3, ease: 'power2.inOut'}, 16.9);
    typing(d.r2, 16.9, 17.3);
    tl.to(d.sOn, {opacity: 0, duration: 0.15}, 17.3);
    tl.to(d.sTyp, {opacity: 1, duration: 0.15}, 17.3);
    arrive(d.r2, 17.3, 'out');
    typeWords(d.r2.w, 17.35, 0.06);                     // the reply fills word by word (last word at 17.77 s)
    typing(d.p2, 17.3, 19.45);
    focusClose(F.annex, 18.3);

    // ===== PASSO 3, Knowly -> Relloo (18.3-30.6 s): "a resposta certa sai na hora, e diz de onde veio" =====
    // The greeting crosses the rail back to the phone, which opens to receive it
    tl.fromTo(d.packet2, {x: landX - 26, y: annexTop - 26, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, 18.3);
    tl.to(d.packet2, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 18.45);
    tl.to(d.lit3, {opacity: 0.3, duration: 0.2}, 18.6);
    tl.to(d.packet2, {x: phoneCx - 26, duration: 0.5, ease: 'power1.inOut'}, 18.65);
    tl.fromTo(d.lit2, {scaleX: 0, transformOrigin: '100% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 18.65);
    focusOpen(F.phone, 19.0);
    tl.to(d.packet2, {y: phoneTop - 26, duration: 0.25, ease: 'power2.inOut'}, 19.15);
    tl.to(d.packet2, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 19.35);
    arrive(d.p2, 19.45, 'in');
    tl.to(d.sTyp, {opacity: 0, duration: 0.15}, 19.45);
    tl.to(d.sOn, {opacity: 1, duration: 0.15}, 19.45);
    // Marina asks the second question
    tl.to(d.iph, {opacity: 0, duration: 0.1}, 19.85);
    typeWords(d.w3, 19.95, 0.15);
    tl.to(d.i3, {opacity: 0, duration: 0.12}, 20.35);
    tl.to(d.iph, {opacity: 1, duration: 0.15}, 20.4);
    tl.to(d.pscroll, {y: -100, duration: 0.3, ease: 'power2.inOut'}, 20.35);       // the chat scrolls up by one message
    arrive(d.p3, 20.35, 'out');
    tl.fromTo(d.p3.t2, {opacity: 0}, {opacity: 1, duration: 0.15}, 20.6);
    focusClose(F.phone, 20.8);
    packetFrom(d.packet3, 20.9, pillY(0));
    pillOn(0, 20.85);
    tl.to(d.packet3, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 21.05);
    tl.to(d.lit2, {opacity: 0.3, duration: 0.2}, 21.2);
    tl.to(d.packet3, {x: landX - 26, duration: 0.5, ease: 'power1.inOut'}, 21.25);
    tl.fromTo(d.lit4, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 21.25);
    tl.to(d.packet3, {y: annexTop - 26, duration: 0.25, ease: 'power2.inOut'}, 21.75);
    tl.to(d.packet3, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 21.95);
    focusOpen(F.annex, 21.65);
    tl.to(d.rscroll, {y: -80, duration: 0.3, ease: 'power2.inOut'}, 22.1);
    arrive(d.r3, 22.2, 'in');
    tl.fromTo(d.p3.tk, {color: '#8696A0'}, {color: '#53BDEB', duration: 0.3, ease: 'power1.inOut'}, 22.5);   // read: ticks turn blue
    pillOff(0, 22.6);
    focusClose(F.annex, 23.4);
    // The Knowly panel opens: the "Política de entregas" document, the Saturday line is highlighted, detaches and climbs the rail
    focusOpen(F.knowly, 23.85);
    tl.fromTo(d.khl, {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out'}, 24.5);
    var kc = G.kp.x + 12 + (G.kp.w - 24) / 2, lineCy = G.kp.y + 84 + story.kb.hl * 24 + 12;
    var sx = KO.x + SK * (kc - KO.x), sy = KO.y - SK * (KO.y - lineCy);                // centre of the highlighted line when the panel is open
    gsap.set(d.kdet, {transformOrigin: (KO.x - (G.kp.x + 12)) + 'px ' + (KO.y - (G.kp.y + 84 + story.kb.hl * 24)) + 'px', scale: SK});
    tl.fromTo(d.kdet, {opacity: 0, x: 0, y: 0}, {opacity: 1, duration: 0.15, ease: 'power1.out'}, 25.5);
    tl.to(d.kls[story.kb.hl], {opacity: 0.35, duration: 0.2}, 25.5);
    tl.to(d.kdet, {y: G.rail.knowly - sy, duration: 0.3, ease: 'power2.inOut'}, 25.7);                 // down to the Knowly rail
    focusClose(F.knowly, 26.05);
    tl.to(d.kdet, {x: landX - sx, duration: 0.6, ease: 'power1.inOut'}, 26.05);                         // along the rail to the Relloo
    tl.fromTo(d.litK, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.6, ease: 'power1.inOut'}, 26.05);
    tl.set(d.litK, {zIndex: 2}, 26.9);
    focusOpen(F.annex, 26.5);
    tl.to(d.kdet, {opacity: 0, duration: 0.2, ease: 'power1.in'}, 26.7);
    // The Relloo shows the suggested reply with its source; the agent sends it
    tl.to(d.rscroll, {y: -210, duration: 0.3, ease: 'power2.inOut'}, 27.0);
    tl.fromTo(d.rcomp, {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'}, 27.4);
    tl.to(d.rcomp, {opacity: 0, duration: 0.2, ease: 'power1.in'}, 28.6);          // the agent sends it
    arrive(d.r4, 28.75, 'out');
    focusClose(F.annex, 29.15);
    // The answer crosses the rail to the phone, which opens to receive it
    tl.fromTo(d.packet5, {x: landX - 26, y: annexTop - 26, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, 29.15);
    tl.to(d.packet5, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 29.3);
    tl.to(d.lit4, {opacity: 0.3, duration: 0.2}, 29.45);
    tl.to(d.packet5, {x: phoneCx - 26, duration: 0.5, ease: 'power1.inOut'}, 29.5);
    tl.fromTo(d.lit5, {scaleX: 0, transformOrigin: '100% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 29.5);
    focusOpen(F.phone, 29.85);
    tl.to(d.packet5, {y: phoneTop - 26, duration: 0.25, ease: 'power2.inOut'}, 30.0);
    tl.to(d.packet5, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 30.2);
    tl.to(d.pscroll, {y: -230, duration: 0.3, ease: 'power2.inOut'}, 30.25);
    arrive(d.p4, 30.3, 'in');
    focusClose(F.phone, 31.0);

    // Keeps the timeline exactly as long as the declared duration
    if (cfg.duration) raw.to({}, {duration: 0.001}, cfg.duration - 0.001);
    return raw;
  }

  window.ChainValue = {build: build, G: G, LOGO: LOGO};
})();
