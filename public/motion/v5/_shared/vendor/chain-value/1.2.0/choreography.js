// COREOGRAFIA DA CADEIA DE VALOR, VERSÃO 1.2.0 (protótipo: passos 0 e 1 do plano v5; foco dinâmico e o Knowly na resposta)
// 1.2.0 over 1.1.0: (a) dynamic focus: the component whose conversation is active (Marina's phone, then the Relloo, then the
// phone again...) opens to 1.4x / 1.3x and comes to the front while everything else fades to 0.35; it shrinks back when the message
// leaves and the focus passes on (same open/close pair, 0.45 s power2.inOut, settled before the next event); the Domus house
// never leaves the frame (it only fades); (b) the Knowly answers: when Marina asks "Sábado dá?" the Knowly rail lights up, a pulse
// runs to the Relloo, the card shows a suggested reply with its source, the "Entregas" room lights up, the agent sends it.
// The 1.1.0 text follows (still valid for the unchanged parts).
// One island: the Domus house (8 rooms) at the centre with the Relloo glued to its left wall, three rails (Tuner, Magneto,
// Knowly) crossing the whole scene, Marina's phone on the left and the manager on the right.
//   B0 (0.0-2.8 s): rooms rise in a cascade, the house outline wraps them, the Relloo snaps in, the rails are drawn;
//   B1 (2.8-12.9 s): camera 1.2x with the whole house in frame. Three events, each settled before the next one starts:
//     E1 Marina types in the field, sends (grey ticks), the message runs along the Tuner rail into the Relloo (same chat, compact),
//        the ticks turn blue, the customer card shows the order and the "Pedidos" room lights up (the context is already there);
//     E2 the agent types in the Relloo, the typing indicator shows on the phone, the reply runs back along the rail to the phone;
//     E3 Marina answers short, the message shows up in the Relloo and the ticks turn blue.
// No brand and no logo of the messaging app: the phone is a neutral chat UI. Message text is 22-26 px in the 1920 frame.
// Pure function of time: one paused GSAP timeline, no clock, no random, every event ends settled (no ambient animation).
// 1.1.0 over 1.0.0: chat fidelity and the three-event interaction; geometry and framing of the house are unchanged.
// Contract (see plan-v5/motion-plan.md 2.3):
//   ChainValue.build({root, format, story, endorse, duration}) -> paused timeline
//   root must hold div#world with the five product logos (img.logo[data-p], src set by the brand loader).
//   endorse: "on" swaps each logo to its "by welabs" file (seal hangs below the logo, layout unchanged); "off" keeps the plain logo.
// format "mobile" is not drawn yet (same beats, vertical rails, 64 px text; planned for the mobile piece).
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
    // B1 framing: the whole house stays in frame. Window 1600 x 900 world px (scale 1.2) from x 0 and y 71: the house right
    // edge (1544) keeps 56 world px, the Domus logo keeps 96 screen px from the top edge
    camera: {s: 1.2, x: 0, y: -85.2}
  };
  // Logo table: x-height based size (lx px), viewBox of the plain (wp x hp, top vy) and endorsed (he) files, x of the left
  // edge and base = world y of the text baseline (logo baseline sits at viewBox y 210); Tuner and Relloo share one baseline
  var LOGO = {
    domus:   {K: 1.958,  wp: 864.66,  hp: 293.70, he: 426.63, vy: -4.80,  lx: 30, x: 1150, base: 194},
    relloo:  {K: 1.894,  wp: 640.92,  hp: 284.10, he: 421.83, vy: 0,      lx: 30, x: 701,  base: 264},
    tuner:   {K: 2.2569, wp: 772.57,  hp: 338.53, he: 466.96, vy: -45.13, lx: 30, x: 340,  base: 264},
    magneto: {K: 2.014,  wp: 1155.84, hp: 302.10, he: 430.83, vy: -9,     lx: 30, x: 340,  base: 549},
    knowly:  {K: 2.014,  wp: 916.20,  hp: 302.10, he: 430.83, vy: -9,     lx: 26, x: 330,  base: 796}
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
    d.lit = el(isl, 'div', 'rail lit', {left: 540, top: G.rail.tuner - 3, width: 210, height: 6});
    // Return leg of the reply (drawn right to left)
    d.lit2 = el(isl, 'div', 'rail lit', {left: 190, top: G.rail.tuner - 3, width: 560, height: 6});

    // House: roof and body outlines (drawn on), then the rooms
    var h = G.house, r = G.room;
    var roofPts = h.x + ',' + h.eaveY + ' ' + (h.x + h.w / 2) + ',' + h.roofY + ' ' + (h.x + h.w) + ',' + h.eaveY;
    var bodyPath = 'M' + h.x + ' ' + h.bodyY + 'V' + (h.bodyY + h.bodyH - 20) + 'a20 20 0 0 0 20 20H' + (h.x + h.w - 20) + 'a20 20 0 0 0 20 -20V' + h.bodyY;
    d.outline = svg(isl, '<path class="body" d="' + bodyPath + '"/><polyline class="roof" points="' + roofPts + '"/>', {left: 0, top: 0, zIndex: 2});
    d.outline.setAttribute('data-layout-allow-overflow', '');
    var houseGrp = el(isl, 'div', 'isl');
    d.rooms = ROOM_ORDER.map(function (name, i) {
      var col = i % 2, row = Math.floor(i / 2);
      var room = el(houseGrp, 'div', 'room', {
        left: h.x + r.padX + col * (r.w + r.gapX), top: h.bodyY + r.padY + row * (r.h + r.gapY), width: r.w, height: r.h
      });
      room.innerHTML = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="' + AMBER + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg><b>' + name + '</b>';
      room.setAttribute('data-layout-allow-overflow', '');
      return room;
    });

    // Relloo annex: conversation list (skeleton) first, then the customer card and the same chat format, compact
    var a = G.annex;
    d.annex = el(isl, 'div', 'annex', {left: a.x, top: a.y, width: a.w, height: a.h});
    d.annexHead = el(d.annex, 'div', 'ah', null, '<span>Conversas</span>');
    d.skel = el(d.annex, 'div', 'skel', null, '<i></i><i></i><i></i>');
    d.rhead = el(d.annex, 'div', 'rhead', null, '<div class="rid"><span class="rav">M</span><b>' + story.person + '</b></div><div class="chips"><span class="chip">' + story.channels[0] + '</span></div><div class="chips"><span class="chip ord">' + story.order + '</span></div>');
    d.chipOrd = d.rhead.querySelector('.ord');
    d.rwin = el(d.annex, 'div', 'rwin');
    d.rscroll = el(d.rwin, 'div', 'rscroll');
    d.r1 = message(d.rscroll, 'in', story.m1, story.times[0], {});
    d.r2 = message(d.rscroll, 'out', story.reply, story.times[1], {dots: true, words: true});
    d.r3 = message(d.rscroll, 'in', story.m3, story.times[2], {});
    d.r4 = message(d.rscroll, 'out', story.final, story.times[3], {});
    // Suggested reply from the Knowly (text, source pill, send button); the agent sends it
    d.rcomp = el(d.annex, 'div', 'rcomp', null, '<div class="sgt">' + story.suggestion + '</div><div class="src">' + story.source + '</div><span class="sgo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1C1A16" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span>');
    [d.rscroll, d.rwin, d.r1.wrap, d.r2.wrap, d.r3.wrap, d.r4.wrap].forEach(function (e) {
      e.setAttribute('data-layout-allow-overflow', ''); e.setAttribute('data-layout-allow-occlusion', '');
      [].forEach.call(e.querySelectorAll('span,i,div'), function (s) { s.setAttribute('data-layout-allow-occlusion', ''); });
    });
    d.seam = svg(isl, '<path class="seam" d="M930 450V548C902 548 902 592 930 592V690"/>', {left: 0, top: 0, zIndex: 4});

    // Marina's phone: header (avatar, name, online / typing), chat with pattern, input field
    var p = G.phone;
    d.phone = el(isl, 'div', 'phone', {left: p.x, top: p.y, width: p.w, height: p.h});
    d.phead = el(d.phone, 'div', 'phead', null, '<span class="pav"><i>L</i></span><div class="pid"><b class="pname">' + story.shop + '</b><div class="pstat"><span class="s-on">online</span><span class="s-typ">digitando…</span></div></div>');
    d.pname = d.phead.querySelector('.pname');
    d.sOn = d.phead.querySelector('.s-on');
    d.sTyp = d.phead.querySelector('.s-typ');
    d.pchat = el(d.phone, 'div', 'pchat');
    d.pscroll = el(d.pchat, 'div', 'pscroll');
    // The chat scrolls: the oldest bubble leaves the clipped chat area on purpose
    d.pscroll.setAttribute('data-layout-allow-overflow', '');
    d.pscroll.setAttribute('data-layout-allow-occlusion', '');
    // (the check reads the attribute on the text element itself, so the bubbles carry it too)
    d.p1 = message(d.pscroll, 'out', story.m1, story.times[0], {ticks: true});
    d.p2 = message(d.pscroll, 'in', story.reply, story.times[1], {dots: true});
    d.p3 = message(d.pscroll, 'out', story.m3, story.times[2], {ticks: true});
    d.p4 = message(d.pscroll, 'in', story.final, story.times[3], {});
    [d.p1, d.p2, d.p3, d.p4].forEach(function (m) {
      m.wrap.setAttribute('data-layout-allow-occlusion', '');
      m.bb.setAttribute('data-layout-allow-occlusion', '');
      [].forEach.call(m.wrap.querySelectorAll('span,i'), function (s) { s.setAttribute('data-layout-allow-occlusion', ''); });
    });
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
      var pill = el(isl, 'div', 'pill' + (i === 0 ? ' on' : ''), {left: G.pills.x, top: G.pills.y[i]}, name);
      pill.setAttribute('data-layout-allow-occlusion', '');   // the opened phone passes in front of the pills on purpose
      return pill;
    });
    var pk = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#1C1A16" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4V5z"/></svg>';
    d.packet = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);
    d.packet2 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);
    d.packet3 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);
    // Third crossing of the Tuner rail (Marina's short answer), drawn left to right like the first
    d.lit3 = el(isl, 'div', 'rail lit', {left: 554, top: G.rail.tuner - 3, width: 196, height: 6});
    // Fifth crossing (the Knowly-backed answer, drawn right to left) and the Knowly rail pulse
    d.lit4 = el(isl, 'div', 'rail lit', {left: 190, top: G.rail.tuner - 3, width: 560, height: 6});
    d.litK = el(isl, 'div', 'rail lit', {left: 505, top: G.rail.knowly - 3, width: 260, height: 6, zIndex: '24'});
    d.packet4 = el(isl, 'div', 'packet', {left: 0, top: 0, zIndex: '25'}, pk);
    d.packet5 = el(isl, 'div', 'packet', {left: 0, top: 0}, pk);

    // Manager card (right side of the island; used by the later beats)
    var m = G.manager;
    d.manager = el(isl, 'div', 'mgr', {left: m.x, top: m.y, width: m.w, height: m.h}, '<span class="av"><i>G</i></span><div class="mt"><b>' + story.manager.split(' · ')[0] + '</b><b class="dm">' + (story.manager.split(' · ')[1] || '') + '</b></div>');

    // Logos: sized from the x-height; "on" swaps to the sealed file and gives the seal band back as negative margin
    d.logos = {};
    Object.keys(LOGO).forEach(function (k) {
      var L = LOGO[k], img = root.querySelector('img.logo[data-p="' + k + '"]');
      var hPlain = L.lx * L.K, w = hPlain * L.wp / L.hp, band = (L.he - L.hp) / L.hp * hPlain;
      var on = endorse === 'on';
      if (on) img.setAttribute('src', window.BRAND.url('welabs', k + '-endorsed-on-dark.svg'));
      img.style.left = px(L.x); img.style.top = px(L.base - (210 - L.vy) / L.hp * hPlain); img.style.width = px(w);
      img.style.height = px(on ? hPlain + band : hPlain);
      img.style.marginBottom = on ? px(-band) : '0';
      d.logos[k] = img;
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
    if ((cfg.format || 'desktop') !== 'desktop') throw new Error('chain-value 1.1.0 draws only the desktop format');
    var endorse = cfg.endorse || root.getAttribute('data-endorse') || 'off';
    var d = mount(root, cfg.story, endorse);
    var tl = gsap.timeline({paused: true});
    var fade = function (t, at, dur, from) { tl.fromTo(t, from || {opacity: 0}, {opacity: 1, y: 0, duration: dur || 0.3, ease: 'power1.out'}, at); };
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
    ['tuner', 'magneto', 'knowly'].forEach(function (k, i) {
      tl.fromTo(d.rails[k], {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.4, ease: 'power2.inOut'}, 1.9 + i * 0.1);
    });
    tl.fromTo(d.logos.tuner, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.1);
    tl.fromTo(d.logos.relloo, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.15);
    tl.fromTo(d.logos.magneto, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.15);
    tl.fromTo(d.logos.knowly, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.2);

    // B1 camera (2.8-3.4 s): whole house in frame, products outside the step stay discreet
    var C = G.camera, b1 = 2.8;
    tl.fromTo(d.world, {x: 0, y: 0, scale: 1, transformOrigin: '0px 0px'}, {x: C.x, y: C.y, scale: C.s, duration: 0.6, ease: 'power2.inOut'}, b1);
    tl.to([d.logos.domus, d.outline].concat(d.rooms), {opacity: 0.7, duration: 0.4, ease: 'power1.out'}, b1);
    tl.to([d.logos.magneto, d.logos.knowly, d.rails.magneto, d.rails.knowly], {opacity: 0.45, duration: 0.4, ease: 'power1.out'}, b1);
    tl.to(d.manager, {opacity: 0, duration: 0.3, ease: 'power1.out'}, b1);
    // The rails stop at world x 1560 (inside the 1600 px window) instead of bleeding through the right edge
    tl.to([d.rails.tuner, d.rails.magneto, d.rails.knowly], {scaleX: (1560 - 64) / 1792, duration: 0.6, ease: 'power2.inOut'}, b1);
    // Texts of the phone and of the conversation card appear with the camera, never as tiny text in the open shot
    tl.fromTo([d.pname, d.sOn, d.iph, d.annexHead.querySelector('span')], {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, b1 + 0.2);
    tl.fromTo(d.sTyp, {opacity: 0}, {opacity: 0, duration: 0.01}, b1);
    tl.fromTo(d.pills, {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.08}, b1 + 0.1);

    // FOCO DINÂMICO: open/close pair (0.45 s power2.inOut). base holds the resting opacity of every dimmable element, in code order
    var base = new Map(), OPEN = 0.45, EASE = 'power2.inOut';
    var setBase = function (list, v) { list.forEach(function (e) { base.set(e, v); }); };
    setBase([d.logos.domus, d.outline].concat(d.rooms), 0.7);
    setBase([d.logos.magneto, d.logos.knowly, d.rails.magneto, d.rails.knowly], 0.45);
    var dimmable = [d.logos.domus, d.outline].concat(d.rooms, [d.rails.tuner, d.rails.magneto, d.rails.knowly],
      [d.logos.tuner, d.logos.relloo, d.logos.magneto, d.logos.knowly], d.pills);
    gsap.set(d.phone, {transformOrigin: '0% 50%'});      // the phone grows to the right and up/down from its left edge
    gsap.set(d.annex, {transformOrigin: '100% 50%'});    // the Relloo is glued to the house wall: it grows to the left
    var focusOpen = function (who, at, s) {
      var other = who === d.phone ? d.annex : d.phone;
      tl.set(who, {zIndex: 20}, at);
      tl.to(who, {scale: s, duration: OPEN, ease: EASE}, at);
      tl.to(dimmable.concat([other]), {opacity: 0.35, duration: OPEN, ease: EASE}, at);
    };
    var focusClose = function (who, at) {
      var other = who === d.phone ? d.annex : d.phone;
      tl.to(who, {scale: 1, duration: OPEN, ease: EASE}, at);
      dimmable.concat([other]).forEach(function (e) { tl.to(e, {opacity: base.has(e) ? base.get(e) : 1, duration: OPEN, ease: EASE}, at); });
      tl.set(who, {zIndex: 3}, at + OPEN);
    };
    var SP = 1.4, SR = 1.3;                                       // focus scales: phone, Relloo
    var phoneTop = 570 - G.phone.h * SP / 2, phoneCx = G.phone.x + G.phone.w * SP / 2;           // opened phone: top edge and centre
    var annexTop = 570 - G.annex.h * SR / 2;                                                       // opened Relloo: top edge
    var px0 = G.pills.right + 34, rY = G.rail.tuner, landX = G.annex.x + G.annex.w / 2;

    // A (3.4-5.75 s): the phone opens and comes to the front; Marina types and sends; the phone shrinks back
    focusOpen(d.phone, 3.4, SP);
    tl.to(d.iph, {opacity: 0, duration: 0.1}, 3.72);
    typeWords(d.w1, 3.85, 0.1);                        // the field fills word by word (last word at 4.55 s)
    tl.to(d.i1, {opacity: 0, duration: 0.12}, 4.9);    // sent: the field empties
    tl.to(d.iph, {opacity: 1, duration: 0.15}, 4.95);
    arrive(d.p1, 4.9, 'out');
    tl.fromTo(d.p1.t2, {opacity: 0}, {opacity: 1, duration: 0.15}, 5.1);       // delivered: second grey tick
    focusClose(d.phone, 5.3);
    // The message crosses the Tuner rail
    tl.fromTo(d.packet, {x: px0 - 26, y: G.pills.y[0], opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, 5.4);
    tl.to(d.packet, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 5.55);
    tl.to(d.packet, {x: landX - 26, duration: 0.5, ease: 'power1.inOut'}, 5.8);
    tl.fromTo(d.lit, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 5.8);
    tl.to(d.packet, {y: annexTop - 26, duration: 0.25, ease: 'power2.inOut'}, 6.3);
    tl.to(d.packet, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 6.5);
    // B (6.2-9.0 s): the Relloo opens (the attendant reads and answers); customer card, same chat format, the order is already in the house
    focusOpen(d.annex, 6.2, SR);
    tl.to([d.annexHead.querySelector('span'), d.skel], {opacity: 0, duration: 0.25, ease: 'power1.out'}, 6.45);
    tl.fromTo(d.rhead, {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'}, 6.45);
    tl.fromTo(d.chipOrd, {opacity: 0}, {opacity: 0, duration: 0.01}, 6.45);
    arrive(d.r1, 6.7, 'in');
    tl.fromTo(d.p1.tk, {color: '#8696A0'}, {color: '#53BDEB', duration: 0.3, ease: 'power1.inOut'}, 6.95);   // read: ticks turn blue
    tl.fromTo(d.chipOrd, {opacity: 0, scale: 0.8, transformOrigin: '0% 50%'}, {opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.6)'}, 7.1);
    tl.to(d.rooms[1], {opacity: 1, borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.35, ease: 'power1.out'}, 7.15);   // "Pedidos" lights up
    base.set(d.rooms[1], 1);

    // The agent types (indicator in the Relloo and on the phone), then composes the greeting in place
    typing(d.r2, 7.5, 7.9);
    tl.to(d.sOn, {opacity: 0, duration: 0.15}, 7.9);
    tl.to(d.sTyp, {opacity: 1, duration: 0.15}, 7.9);
    typing(d.p2, 7.9, 9.75);
    arrive(d.r2, 7.9, 'out');
    typeWords(d.r2.w, 7.95, 0.06);                     // the reply fills word by word (last word at 8.37 s)
    focusClose(d.annex, 8.55);
    // The reply crosses the rail back to the phone, which opens to receive it (C)
    tl.fromTo(d.packet2, {x: landX - 26, y: annexTop - 26, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, 8.55);
    tl.to(d.packet2, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 8.7);
    tl.to(d.lit, {opacity: 0.3, duration: 0.2}, 8.85);
    tl.to(d.packet2, {x: phoneCx - 26, duration: 0.5, ease: 'power1.inOut'}, 8.95);
    tl.fromTo(d.lit2, {scaleX: 0, transformOrigin: '100% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 8.95);
    focusOpen(d.phone, 9.3, SP);
    tl.to(d.packet2, {y: phoneTop - 26, duration: 0.25, ease: 'power2.inOut'}, 9.45);
    tl.to(d.packet2, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 9.65);
    arrive(d.p2, 9.75, 'in');
    tl.to(d.sTyp, {opacity: 0, duration: 0.15}, 9.75);
    tl.to(d.sOn, {opacity: 1, duration: 0.15}, 9.75);

    // C (10.0-11.15 s): Marina asks the second question; the phone shrinks back and the message crosses the rail again
    tl.to(d.iph, {opacity: 0, duration: 0.1}, 10.0);
    typeWords(d.w3, 10.0, 0.15);
    tl.to(d.i3, {opacity: 0, duration: 0.12}, 10.4);
    tl.to(d.iph, {opacity: 1, duration: 0.15}, 10.45);
    tl.to(d.pscroll, {y: -100, duration: 0.3, ease: 'power2.inOut'}, 10.4);        // the chat scrolls up by one message
    arrive(d.p3, 10.4, 'out');
    tl.fromTo(d.p3.t2, {opacity: 0}, {opacity: 1, duration: 0.15}, 10.6);
    focusClose(d.phone, 10.7);
    tl.fromTo(d.packet3, {x: px0 - 26, y: G.pills.y[0], opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, 10.8);
    tl.to(d.packet3, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 10.95);
    tl.to(d.lit2, {opacity: 0.3, duration: 0.2}, 11.1);
    tl.to(d.packet3, {x: landX - 26, duration: 0.5, ease: 'power1.inOut'}, 11.2);
    tl.fromTo(d.lit3, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 11.2);
    focusOpen(d.annex, 11.6, SR);
    tl.to(d.packet3, {y: annexTop - 26, duration: 0.25, ease: 'power2.inOut'}, 11.7);
    tl.to(d.packet3, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 11.95);
    arrive(d.r3, 12.1, 'in');
    tl.fromTo(d.p3.tk, {color: '#8696A0'}, {color: '#53BDEB', duration: 0.3, ease: 'power1.inOut'}, 12.35);

    // D (12.5-15.5 s): the agent does not answer from memory. The Relloo steps back so the Knowly rail is in plain view: the Knowly
    // logo and rail light up, a pulse runs to the Relloo, which opens again with the suggested reply and its source; the
    // "Entregas" room lights up (where the rule comes from) and the agent sends the reply
    focusClose(d.annex, 12.5);
    tl.to([d.logos.knowly, d.rails.knowly], {opacity: 1, duration: 0.45, ease: EASE}, 12.5);
    setBase([d.logos.knowly, d.rails.knowly], 1);
    tl.fromTo(d.packet4, {x: 530 - 26, y: G.rail.knowly - 26, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, 12.95);
    tl.to(d.packet4, {x: landX - 26, duration: 0.55, ease: 'power1.inOut'}, 13.1);
    tl.fromTo(d.litK, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.55, ease: 'power1.inOut'}, 13.1);
    tl.to(d.packet4, {y: G.rail.knowly - 80, opacity: 0, duration: 0.25, ease: 'power2.in'}, 13.65);
    focusOpen(d.annex, 13.6, SR);
    tl.set(d.litK, {zIndex: 2}, 13.9);                 // after the pulse the lit rail goes behind the opened card
    tl.to(d.rooms[5], {opacity: 1, borderColor: AMBER, backgroundColor: '#2B2210', duration: 0.3, ease: 'power1.out'}, 13.75);   // "Entregas"
    base.set(d.rooms[5], 1);
    tl.to(d.rscroll, {y: -110, duration: 0.3, ease: 'power2.inOut'}, 14.1);        // older bubbles make room for the suggestion
    tl.fromTo(d.rcomp, {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'}, 14.45);
    tl.to(d.rcomp, {opacity: 0, duration: 0.2, ease: 'power1.in'}, 15.2);          // the agent sends it
    arrive(d.r4, 15.35, 'out');
    focusClose(d.annex, 15.7);

    // E (15.7-17.8 s): the answer crosses the rail to the phone, which opens to receive it
    tl.fromTo(d.packet5, {x: landX - 26, y: annexTop - 26, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, 15.7);
    tl.to(d.packet5, {y: rY - 26, duration: 0.2, ease: 'power2.inOut'}, 15.85);
    tl.to(d.lit3, {opacity: 0.3, duration: 0.2}, 16.0);
    tl.to(d.packet5, {x: phoneCx - 26, duration: 0.5, ease: 'power1.inOut'}, 16.05);
    tl.fromTo(d.lit4, {scaleX: 0, transformOrigin: '100% 50%'}, {scaleX: 1, duration: 0.5, ease: 'power1.inOut'}, 16.05);
    focusOpen(d.phone, 16.4, SP);
    tl.to(d.packet5, {y: phoneTop - 26, duration: 0.25, ease: 'power2.inOut'}, 16.55);
    tl.to(d.packet5, {opacity: 0, duration: 0.1, ease: 'power1.in'}, 16.75);
    tl.to(d.pscroll, {y: -230, duration: 0.3, ease: 'power2.inOut'}, 16.8);
    arrive(d.p4, 16.85, 'in');
    focusClose(d.phone, 17.35);

    // Keeps the timeline exactly as long as the declared duration
    if (cfg.duration) tl.to({}, {duration: 0.001}, cfg.duration - 0.001);
    return tl;
  }

  window.ChainValue = {build: build, G: G, LOGO: LOGO};
})();
