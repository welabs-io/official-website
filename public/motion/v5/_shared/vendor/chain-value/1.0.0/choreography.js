// COREOGRAFIA DA CADEIA DE VALOR, VERSÃO 1.0.0 (protótipo: passos 0 e 1 do plano v5)
// One island: the Domus house (8 rooms) at the centre with the Relloo glued to its left wall, three rails (Tuner, Magneto,
// Knowly) crossing the whole scene, Marina's phone on the left and the manager on the right. This version draws only
//   B0 (0.0-2.8 s): rooms fall in a cascade, the house outline wraps them, the Relloo snaps in, the rails are drawn;
//   B1 (2.8-8.6 s): camera 1.4 to the left, Marina's message is typed, climbs the Tuner rail and lands whole in the Relloo.
// Pure function of time: one paused GSAP timeline, no clock, no random, every beat ends settled (no ambient animation).
// Contract (see plan-v5/motion-plan.md 2.3):
//   ChainValue.build({root, format, story, endorse, T, duration}) -> paused timeline
//   root must hold div#world with the five product logos (img.logo[data-p], src set by the brand loader).
//   endorse: "on" swaps each logo to its "by welabs" file (seal hangs below the logo, layout unchanged); "off" keeps the plain logo.
// format "mobile" is not drawn yet (same beats, vertical rails, 64 px text; planned for the mobile piece).
(function () {
  var AMBER = '#FFB020', EDGE = '#3A3A44', SVGNS = 'http://www.w3.org/2000/svg';

  // GEOMETRIA DO MUNDO (px a 1920x1080, câmera 1,0)
  var G = {
    // The Magneto rail runs through the 14 px gap between the second and third room rows (566-580), never over a room
    rail: {tuner: 300, magneto: 573, knowly: 820},
    phone: {x: 40, y: 340, w: 264, h: 460},
    pills: {x: 320, right: 511, y: [318, 374, 430]},
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
    tuner:   {K: 2.2569, wp: 772.57,  hp: 338.53, he: 466.96, vy: -45.13, lx: 30, x: 320,  base: 264},
    magneto: {K: 2.014,  wp: 1155.84, hp: 302.10, he: 430.83, vy: -9,     lx: 30, x: 320,  base: 549},
    knowly:  {K: 2.014,  wp: 916.20,  hp: 302.10, he: 430.83, vy: -9,     lx: 30, x: 320,  base: 796}
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

  // CRONOMETRAGEM (segundos; cada peça pode sobrescrever por T)
  var T0 = {
    roomsAt: 0.2, roomStep: 0.12, outlineAt: 1.2, outlineDur: 0.4, annexAt: 1.6, seamAt: 2.0, railsAt: 1.9, railStep: 0.1,
    b1: 2.8, camDur: 0.6, typeAt: 3.4, wordStep: 0.12, sentAt: 4.7, pillsAt: 4.9, packetAt: 5.2, hopDur: 0.3, runAt: 5.5, runDur: 0.9,
    dropAt: 6.4, dropDur: 0.5, rowAt: 6.5, bubbleAt: 6.9, bubbleDur: 0.5
  };

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

  // MONTAGEM DO DOM (a peça só declara #world e os cinco logos)
  function mount(root, story, endorse) {
    var world = root.querySelector('#world');
    // Island layer: every component (phone, house, annex, manager) sits under it, so each text is at least four levels below
    // #world and the logos (direct children of #world) are only compared, by the gate, with what sits right beside them
    var isl = el(world, 'div', 'isl');
    var d = {};
    // Rails: dim base bar, drawn left to right; the Tuner one also carries a lit segment between the Tuner and Relloo logos
    d.rails = {};
    ['tuner', 'magneto', 'knowly'].forEach(function (k) {
      d.rails[k] = el(isl, 'div', 'rail', {left: 64, top: G.rail[k] - 3, width: 1792, height: 6});
    });
    d.lit = el(isl, 'div', 'rail lit', {left: 450, top: G.rail.tuner - 3, width: 250, height: 6});

    // House: roof and body outlines (drawn on), then the rooms
    var h = G.house, r = G.room;
    var roofPts = h.x + ',' + h.eaveY + ' ' + (h.x + h.w / 2) + ',' + h.roofY + ' ' + (h.x + h.w) + ',' + h.eaveY;
    var bodyPath = 'M' + h.x + ' ' + h.bodyY + 'V' + (h.bodyY + h.bodyH - 20) + 'a20 20 0 0 0 20 20H' + (h.x + h.w - 20) + 'a20 20 0 0 0 20 -20V' + h.bodyY;
    // Camera crops the dimmed house at the right edge in B1 on purpose (gate: data-layout-allow-overflow)
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

    // Relloo annex: conversation card with its empty state (skeleton bars) and, later, Marina's conversation
    var a = G.annex;
    d.annex = el(isl, 'div', 'annex', {left: a.x, top: a.y, width: a.w, height: a.h});
    d.annexHead = el(d.annex, 'div', 'ah', null, '<span>Conversas</span>');
    d.skel = el(d.annex, 'div', 'skel', null, '<i></i><i></i><i></i>');
    d.row = el(d.annex, 'div', 'arow', null, '<b>' + story.person + '</b>');
    d.tag = el(d.annex, 'div', 'atag', null, '<span>' + story.channels[0] + '</span>');
    d.bubbleIn = el(d.annex, 'div', 'bub in', null, '<span>' + story.message + '</span>');
    d.seam = svg(isl, '<path class="seam" d="M930 450V548C902 548 902 592 930 592V690"/>', {left: 0, top: 0, zIndex: 4});

    // Marina's phone (message typed word by word) and the channel pills of the Tuner
    var p = G.phone;
    d.phone = el(isl, 'div', 'phone', {left: p.x, top: p.y, width: p.w, height: p.h});
    el(d.phone, 'div', 'ptop', null, '<span>' + story.person + '</span>');
    el(d.phone, 'div', 'pinput');
    d.bubbleOut = el(d.phone, 'div', 'bub out', null, '');
    d.words = story.message.split(' ').map(function (w, i, all) {
      var s = el(d.bubbleOut, 'span', 'w', null, w);
      if (i < all.length - 1) d.bubbleOut.appendChild(document.createTextNode(' '));
      return s;
    });
    d.sent = el(d.phone, 'div', 'sent', null, '<svg viewBox="0 0 34 20" width="40" height="24" fill="none" stroke="#9FD4B5" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 11l5 5L17 4M14 12l4 4L30 4"/></svg>');
    d.pills = story.channels.map(function (name, i) {
      return el(isl, 'div', 'pill' + (i === 0 ? ' on' : ''), {left: G.pills.x, top: G.pills.y[i]}, name);
    });
    d.packet = el(isl, 'div', 'packet', {left: 0, top: 0}, '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#1C1A16" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4V5z"/></svg>');

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
    var root = cfg.root, T = Object.assign({}, T0, cfg.T || {});
    if ((cfg.format || 'desktop') !== 'desktop') throw new Error('chain-value 1.0.0 draws only the desktop format');
    var endorse = cfg.endorse || root.getAttribute('data-endorse') || 'off';
    var d = mount(root, cfg.story, endorse);
    var tl = gsap.timeline({paused: true});
    var set = function (t, v, at) { tl.set(t, v, at); };

    // B0 (0.0-2.8 s): the house assembles full, the Relloo snaps in, the rails are drawn
    d.rooms.forEach(function (room, i) {
      // Rooms rise into place (never fall through the row above, which would overlap its label)
      tl.fromTo(room, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.4, ease: 'power3.out'}, T.roomsAt + i * T.roomStep);
    });
    // The outline is only drawn once at least six rooms are visible (the sixth starts at roomsAt + 5 * roomStep)
    d.outline.querySelectorAll('path,polyline').forEach(function (p, i) {
      drawOn(tl, p, T.outlineAt + i * 0.05, T.outlineDur, 'power2.inOut');
    });
    tl.fromTo(d.logos.domus, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 1.6);
    tl.fromTo(d.annex, {opacity: 0, x: -80}, {opacity: 1, x: 0, duration: 0.4, ease: 'power3.out'}, T.annexAt);
    drawOn(tl, d.seam.querySelector('path'), T.seamAt, 0.25, 'power1.out');
    tl.fromTo([d.phone, d.manager], {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out'}, 1.8);
    ['tuner', 'magneto', 'knowly'].forEach(function (k, i) {
      tl.fromTo(d.rails[k], {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.4, ease: 'power2.inOut'}, T.railsAt + i * T.railStep);
    });
    tl.fromTo(d.logos.tuner, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.1);
    tl.fromTo(d.logos.relloo, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.15);
    tl.fromTo(d.logos.magneto, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.15);
    tl.fromTo(d.logos.knowly, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.2);

    // B1 (2.8-8.6 s): camera to the left, products that are not part of the step dim
    var C = G.camera;
    tl.fromTo(d.world, {x: 0, y: 0, scale: 1, transformOrigin: '0px 0px'}, {x: C.x, y: C.y, scale: C.s, duration: T.camDur, ease: 'power2.inOut'}, T.b1);
    // The house stays whole and readable (0.7); the Magneto and Knowly rails and logos stay discreet but visible (0.45);
    // the manager card is not part of this step and leaves
    tl.to([d.logos.domus, d.outline].concat(d.rooms), {opacity: 0.7, duration: 0.4, ease: 'power1.out'}, T.b1);
    tl.to([d.logos.magneto, d.logos.knowly, d.rails.magneto, d.rails.knowly], {opacity: 0.45, duration: 0.4, ease: 'power1.out'}, T.b1);
    tl.to(d.manager, {opacity: 0, duration: 0.3, ease: 'power1.out'}, T.b1);
    // The rails stop at world x 1560 (inside the 1600 px window) instead of bleeding through the right edge
    tl.to([d.rails.tuner, d.rails.magneto, d.rails.knowly], {scaleX: (1560 - 64) / 1792, duration: T.camDur, ease: 'power2.inOut'}, T.b1);
    // Header texts of the phone and of the conversation card appear with the camera, never as tiny text in the open shot
    tl.fromTo([d.phone.querySelector('.ptop span'), d.annexHead.querySelector('span')], {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out'}, T.b1 + 0.2);
    // Typed message: one word every wordStep seconds (opacity only, the bubble keeps its full layout)
    // The bubble grows downward while the words arrive (clip reveal, so it never shows empty at full height)
    tl.fromTo(d.bubbleOut, {opacity: 0, clipPath: 'inset(0px 0px 70% 0px)'}, {opacity: 1, clipPath: 'inset(0px 0px 0% 0px)', duration: d.words.length * T.wordStep, ease: 'none'}, T.typeAt - 0.02);
    d.words.forEach(function (w, i) {
      tl.fromTo(w, {opacity: 0}, {opacity: 1, duration: 0.05, ease: 'none'}, T.typeAt + i * T.wordStep);
    });
    tl.fromTo(d.sent, {opacity: 0}, {opacity: 1, duration: 0.2, ease: 'power1.out'}, T.sentAt);
    // Channel pills come in, WhatsApp lit; the packet hops up to the Tuner rail and runs to the Relloo
    tl.fromTo(d.pills, {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.08}, T.pillsAt);
    // The packet leaves from just right of the WhatsApp pill (right edge at x 497), never over its text
    var px0 = G.pills.right + 34, py0 = G.pills.y[0] + 26, railY = G.rail.tuner, landX = 700;
    tl.fromTo(d.packet, {x: px0 - 26, y: py0 - 26, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out'}, T.packetAt);
    tl.to(d.packet, {y: railY - 26, duration: T.hopDur, ease: 'power2.inOut'}, T.packetAt + 0.25);
    tl.to(d.packet, {x: landX - 26, duration: T.runDur, ease: 'power1.inOut'}, T.runAt);
    tl.fromTo(d.lit, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: T.runDur, ease: 'power1.inOut'}, T.runAt);
    // The packet stops on the top edge of the annex card (never over the conversation text) and gives way to the bubble
    tl.to(d.packet, {y: G.annex.y - 26, duration: T.dropDur, ease: 'power2.inOut'}, T.dropAt);
    // The Relloo conversation: the skeleton gives way to Marina's row and the whole message
    tl.to(d.skel, {opacity: 0, duration: 0.25, ease: 'power1.out'}, T.rowAt);
    tl.fromTo([d.row, d.tag], {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.08}, T.rowAt);
    tl.fromTo(d.bubbleIn, {opacity: 0, scale: 0.2, transformOrigin: '60px 28px'}, {opacity: 1, scale: 1, duration: T.bubbleDur, ease: 'power3.out'}, T.bubbleAt);
    tl.to(d.packet, {opacity: 0, duration: 0.2, ease: 'power1.in'}, T.dropAt + T.dropDur);

    // Keeps the timeline exactly as long as the declared duration
    if (cfg.duration) tl.to({}, {duration: 0.001}, cfg.duration - 0.001);
    return tl;
  }

  window.ChainValue = {build: build, G: G, LOGO: LOGO, T0: T0};
})();
