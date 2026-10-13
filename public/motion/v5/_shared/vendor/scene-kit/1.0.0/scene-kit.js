// SCENE-KIT 1.0.0: COMPONENTES DE CENA PARA PEÇAS DE MOTION DE PRODUTO (quadro de 1920x1080, tudo em px da composição)
// Nove componentes extraídos das sete cenas da welabs-chain-detail-s1 (chain-detail 1.0.0), uma vez só, em vez de copiados em cada
// coreografia: house-rooms, funnel, crm-card, data-chips, inbox, phone-chat, document-panel, workflow-approval e toast.
// Each component builds its DOM into a scene group (a full-frame absolute box), exposes the parts a choreography animates, and, when
// its sequence is the same wherever it appears, a play(tl, at) with the beats the accepted piece used. The text it draws is sized
// by the kit and refuses to go below the kit minimum: secondary text (--sk-meta) is 40 px, which shows 11.9 px on tile-573,
// and mount() throws when asked for less (the gate rule min-secondary@<destination> measures the same thing on the piece).
// Contract:
//   SceneKit.version, SceneKit.MIN = {bodyTextPx: 48, metaTextPx: 40}, SceneKit.components (declaration of each component)
//   SceneKit.mount('<name>@<major>', parent, props, {scale, meta, unsafeBelowMin}) -> instance
//     instance = {name, parts, bbox(), beats, play(tl, at)?, ...methods listed in SceneKit.components[name].methods}
//   SceneKit.stage(root, {scenes: [{id, t0}], endorse}) -> {tl, groups, logos, logoBox, scene(id, logos, fn), end(duration)}
//   SceneKit.gestures(tl) -> {to, ft, pop, lit, litPop, roomGlow, stripeOn, stripeOff, drawOn}
//   SceneKit.receipt(parent) -> the round receipt packet used between Magneto and Domus
//   SceneKit.connector(parent, d) -> an amber stroke joining two elements (d = path in frame px; draw it with gestures(tl).drawOn)
// `opts.scale` multiplies the default secondary size (40 px); `opts.meta` sets it in px. Anything under MIN.metaTextPx throws,
// unless `unsafeBelowMin` is set (only the kit's own regression test against the 36 px of chain-detail 1.0.0 does that).
// Pure function of time: GSAP timelines on pause, no clock, no random.
(function () {
  var VERSION = '1.0.0';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var TEXT = {body: 48, meta: 40};
  var MIN = {bodyTextPx: 48, metaTextPx: 40};
  var EASE = 'power2.inOut';
  var CARD_MIN_H = 170;

  // GEOMETRIA (px a 1920x1080; margem de segurança de 96 px)
  var G = {
    room: {w: 340, h: 128, gapX: 20, gapY: 18, padX: 30, padY: 26},
    houseTall: {w: 760, roofY: 190, eaveY: 320, bodyY: 320, bodyH: 618},
    logoLeft: 96, logoBase: 120
  };
  // Logo geometry per product (from the brand files): K x-height ratio, wp/hp wordmark box, he with the seal band, vy vertical shift
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
  var ROOM_ORDER = ['Atendimento', 'Pessoas', 'Regras', 'Pedidos', 'Estoque', 'Entregas', 'Fiscal', 'Financeiro'];
  // Card badges: one glyph per fact (0 owner, 1 deadline, 2 history, 3 return, 4 address, 5 order, 6 window, 7 source, 8 approval)
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
  var RECEIPT = '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 9h6M9 13h6"/>';

  // PEQUENOS AUXILIARES DE DOM
  function px(n) { return n + 'px'; }
  function ico(path, size, stroke, sw) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="' + (stroke || 'currentColor') + '" stroke-width="' + (sw || 1.9) + '" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }
  function el(parent, tag, cls, css, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (css) Object.keys(css).forEach(function (k) { e.style[k] = typeof css[k] === 'number' && k !== 'opacity' && k !== 'zIndex' ? px(css[k]) : css[k]; });
    if (html != null) e.innerHTML = html;
    parent.appendChild(e);
    return e;
  }
  function svg(parent, markup, css) {
    var wrap = el(parent, 'div', 'sk-svg', css);
    wrap.innerHTML = '<svg xmlns="' + SVGNS + '" viewBox="0 0 1920 1080" width="1920" height="1080">' + markup + '</svg>';
    return wrap;
  }
  function amber() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--wl-amber').trim();
    return v || '#FFB020';
  }
  // Union box of elements, in composition px relative to #root (the root is not scaled in a render)
  function bboxOf(list) {
    var root = document.getElementById('root'), o = root ? root.getBoundingClientRect() : {left: 0, top: 0};
    var u = list.filter(Boolean).reduce(function (a, e) {
      var r = e.getBoundingClientRect();
      return {l: Math.min(a.l, r.left), t: Math.min(a.t, r.top), r: Math.max(a.r, r.right), b: Math.max(a.b, r.bottom)};
    }, {l: Infinity, t: Infinity, r: -Infinity, b: -Infinity});
    return {x: Math.round(u.l - o.left), y: Math.round(u.t - o.top), w: Math.round(u.r - u.l), h: Math.round(u.b - u.t)};
  }
  function flat(parts) {
    var out = [];
    Object.keys(parts).forEach(function (k) { [].concat(parts[k]).forEach(function (e) { if (e && e.nodeType === 1) out.push(e); }); });
    return out;
  }

  // TAMANHO DO TEXTO SECUNDÁRIO E RECUSA ABAIXO DO MÍNIMO
  function metaFor(name, opts) {
    var o = opts || {};
    var meta = o.meta != null ? o.meta : TEXT.meta * (o.scale != null ? o.scale : 1);
    if (meta < MIN.metaTextPx - 1e-6 && !o.unsafeBelowMin) {
      throw new Error('scene-kit: ' + name + ' would draw secondary text at ' + meta + ' px, under the ' + MIN.metaTextPx + ' px minimum (11 px on tile-573); raise opts.scale or opts.meta');
    }
    return meta;
  }

  // GESTOS PEQUENOS (os mesmos da coreografia chain-detail 1.0.0)
  function gestures(tl) {
    var A = amber();
    var g = {};
    g.to = function (t, v, at) { return tl.to(t, v, at); };
    g.ft = function (t, a, b, at) { b.immediateRender = false; return tl.fromTo(t, a, b, at); };
    g.pop = function (e, at, dur) { g.ft(e, {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: dur || 0.35, ease: 'power2.out'}, at); };
    g.lit = function (b, at) { g.to(b, {color: A, borderColor: A, backgroundColor: '#2B2210', duration: 0.2}, at); };
    g.litPop = function (b, at) { g.lit(b, at); g.ft(b, {scale: 1}, {scale: 1.4, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1}, at); };
    g.roomGlow = function (rooms, i, on, at) {
      g.to(rooms[i], on ? {borderColor: A, backgroundColor: '#2B2210', duration: 0.25, ease: 'power1.out'} : {borderColor: '#3A3A44', backgroundColor: '#202027', duration: 0.3}, at);
    };
    g.stripeOn = function (f, i, at) { g.to(f.parts.stripes[i], {borderColor: A, backgroundColor: '#1F1A10', duration: 0.3}, at); };
    g.stripeOff = function (f, i, at) { g.to(f.parts.stripes[i], {borderColor: '#3A3A44', backgroundColor: '#17171B', duration: 0.3}, at); };
    // Draw-on of a stroke by its real length (constant at build time; no pathLength scaling)
    g.drawOn = function (p, at, dur, ease) {
      var len = Math.ceil(p.getTotalLength()) + 2;
      p.style.strokeDasharray = len + ' ' + len;
      // immediateRender stays on: the stroke is hidden from time 0 until its draw-on starts
      tl.fromTo(p, {strokeDashoffset: len}, {strokeDashoffset: 0, duration: dur, ease: ease}, at);
    };
    return g;
  }

  // HOUSE-ROOMS: CASA COM OITO CÔMODOS (x é a parede esquerda; a casa ocupa 760 px de largura)
  function mountHouse(parent, props) {
    var x = props.x, h = G.houseTall, r = G.room;
    var roofPts = x + ',' + h.eaveY + ' ' + (x + h.w / 2) + ',' + h.roofY + ' ' + (x + h.w) + ',' + h.eaveY;
    var bodyPath = 'M' + x + ' ' + h.bodyY + 'V' + (h.bodyY + h.bodyH - 20) + 'a20 20 0 0 0 20 20H' + (x + h.w - 20) + 'a20 20 0 0 0 20 -20V' + h.bodyY;
    var inst = {parts: {}};
    inst.parts.outline = svg(parent, '<path class="sk-body" d="' + bodyPath + '"/><polyline class="sk-roof" points="' + roofPts + '"/>', {left: 0, top: 0});
    inst.parts.rooms = (props.rooms || ROOM_ORDER).map(function (name, i) {
      var col = i % 2, row = Math.floor(i / 2);
      var room = el(parent, 'div', 'sk-room', {left: x + r.padX + col * (r.w + r.gapX), top: h.bodyY + r.padY + row * (r.h + r.gapY), width: r.w, height: r.h});
      room.innerHTML = '<span class="sk-rbase">' + ico(ICONS[name], 44, amber(), 1.8) + '<b>' + name + '</b></span>';
      return room;
    });
    inst.x = x;
    inst.center = function (i) { var col = i % 2, row = Math.floor(i / 2); return {x: x + r.padX + col * (r.w + r.gapX) + r.w / 2, y: h.bodyY + r.padY + row * (r.h + r.gapY) + r.h / 2}; };
    // Alternate two-line text over a room (a room that receives something): returns {alt, base}; alt starts hidden
    inst.altText = function (i, lines) {
      var room = inst.parts.rooms[i];
      var alt = el(room, 'span', 'sk-ralt', {opacity: '0'}, '<b>' + lines[0] + '</b><b>' + lines[1] + '</b>');
      return {alt: alt, base: room.querySelector('.sk-rbase')};
    };
    inst.beats = {rooms: 0.05, outline: 0.95};
    // Build beat: the rooms rise one by one, then the outline draws on (at = the scene start)
    inst.play = function (tl, at) {
      var g = gestures(tl);
      inst.parts.rooms.forEach(function (room, i) { g.ft(room, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.4, ease: 'power3.out'}, at + 0.05 + i * 0.1); });
      inst.parts.outline.querySelectorAll('path,polyline').forEach(function (p, i) { g.drawOn(p, at + 0.95 + i * 0.05, 0.4, 'power2.inOut'); });
    };
    inst.bbox = function () { return bboxOf(flat({a: inst.parts.outline, b: inst.parts.rooms})); };
    return inst;
  }

  // FUNNEL: FUNIL DE QUATRO FAIXAS (rect {x,y,w,h,pad,step,sh,labW}; o cartão desliza por cima das faixas)
  function mountFunnel(parent, props) {
    var f = props.rect, inst = {parts: {}};
    inst.parts.box = el(parent, 'div', 'sk-funnel', {left: f.x, top: f.y, width: f.w, height: f.h});
    inst.parts.stripes = props.stages.map(function (name, i) { return el(inst.parts.box, 'div', 'sk-fstripe', {left: f.pad, top: f.pad + i * f.step, width: f.w - 2 * f.pad, height: f.sh}); });
    inst.parts.labs = props.stages.map(function (name, i) { return el(inst.parts.box, 'div', 'sk-flab', {left: f.pad + 20, top: f.pad + i * f.step, width: f.labW, height: f.sh}, '<span>' + name + '</span>'); });
    inst.step = f.step;
    inst.beats = {enter: 0};
    inst.play = function (tl, at) { gestures(tl).ft(inst.parts.box, {opacity: 0, x: -60}, {opacity: 1, x: 0, duration: 0.4, ease: 'power3.out'}, at); };
    inst.bbox = function () { return bboxOf([inst.parts.box]); };
    return inst;
  }

  // CRM-CARD: CARTÃO COM UM EMBLEMA POR FATO E, OPCIONAL, A FICHA DE FATOS (props.facts {rect, rows: [{badge, text, empty}]})
  function mountCrmCard(parent, props) {
    // Two title lines (8 + 50 + 50 px) and the badge row (40 px with 12 px above and below) need 170 px: a shorter rect grows to 170
    // around its own centre, so the badges never touch the second line (the video-qa of the s3 measured 4 px of overlap with the
    // 46 px badges of chain-detail 1.0.0 in a 170 px card, and no margin left in a 190 px funnel stripe with a 184 px card)
    var c = props.rect, inst = {parts: {}};
    var ch = Math.max(c.h, CARD_MIN_H), cy = c.y - (ch - c.h) / 2;
    var wrap = el(parent, 'div', 'sk-cardw', {left: c.x, top: cy, width: c.w, height: ch, opacity: '0'});
    var card = el(wrap, 'div', 'sk-card', {left: 0, top: 0, width: c.w, height: ch}, '<span class="sk-ct">' + props.title[0] + '</span><span class="sk-ct t2">' + props.title[1] + '</span>');
    inst.parts.wrap = wrap; inst.parts.card = card;
    inst.parts.badges = BADGES.map(function (p, i) { return el(card, 'span', 'sk-cb', {left: 20 + i * 48, top: ch - 52}, ico(p, 30, 'currentColor', 2)); });
    if (props.facts) {
      // The sheet sits beside the funnel, not inside it (a funnel clips its content): props.facts.parent is the scene group
      var s = props.facts.rect;
      inst.parts.sheet = el(props.facts.parent || parent, 'div', 'sk-sheet', {left: s.x, top: s.y, width: s.w, height: s.h, opacity: '0'});
      inst.parts.rows = props.facts.rows.map(function (rw, i) {
        return el(inst.parts.sheet, 'div', 'sk-srow', {left: 28, top: 22 + i * 106, width: s.w - 56, height: 90, opacity: '0'},
          '<span class="sk-si">' + ico(BADGES[rw.badge], 44, 'currentColor', 2) + '</span><span>' + (rw.empty ? '' : rw.text) + '</span>' + (rw.empty ? '<span class="sk-sdash"></span>' : ''));
      });
    }
    // Appear beat: the card fades in with a small scale; a fact row enters and its badge lights
    inst.beats = {appear: 0, sheet: 0.35, row: 0.4};
    inst.appear = function (tl, at) { gestures(tl).ft(wrap, {opacity: 0, scale: 0.92, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out'}, at); };
    inst.sheetIn = function (tl, at) { gestures(tl).ft(inst.parts.sheet, {opacity: 0, x: 24}, {opacity: 1, x: 0, duration: 0.4, ease: 'power2.out'}, at); };
    inst.factRow = function (tl, i, at, badgeIndex) {
      var g = gestures(tl);
      g.ft(inst.parts.rows[i], {opacity: 0, x: -16}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, at);
      if (badgeIndex != null) g.litPop(inst.parts.badges[badgeIndex], at + 0.1);
    };
    inst.slideTo = function (tl, y, at) { gestures(tl).to(wrap, {y: y, duration: 0.5, ease: EASE}, at); };
    inst.bbox = function () { return bboxOf(flat({a: wrap, b: inst.parts.sheet})); };
    return inst;
  }

  // DATA-CHIPS: ENCAIXES DO CARTÃO E CHIPS QUE SAEM DOS CÔMODOS (props.slots [{x,y,w,h,badge}], props.chips [texto])
  function mountDataChips(parent, props) {
    var inst = {parts: {}};
    inst.parts.slots = props.slots.map(function (s) {
      return el(parent, 'div', 'sk-slot', {left: s.x, top: s.y, width: s.w, height: s.h, opacity: '0'}, '<span class="sk-si">' + ico(BADGES[s.badge], 44, 'currentColor', 2) + '</span><span class="sk-sdash"></span>');
    });
    inst.parts.chips = props.chips.map(function (txt) {
      var c = el(parent, 'div', 'sk-fchip', {left: 0, top: 0, opacity: '0'}, '<span>' + txt + '</span>');
      gsap.set(c, {yPercent: -50});
      return c;
    });
    inst.slotsIn = function (tl, at) { gestures(tl).ft(inst.parts.slots, {opacity: 0}, {opacity: 1, duration: 0.3, stagger: 0.08}, at); };
    // Where chip n rests: right after the slot's icon (border 2 + padding 20 + icon 44 + gap 16), centred on the slot's height
    inst.slotTarget = function (n) { var s = props.slots[n]; return {x: s.x + 2 + 20 + 44 + 16, y: s.y + s.h / 2}; };
    // One chip leaves (from.x, from.y) and lands in slot n at `to` (default: slotTarget(n), clear of the slot's icon); the slot's
    // dash disappears when it arrives
    inst.fly = function (tl, n, from, to, at) {
      var g = gestures(tl), chip = inst.parts.chips[n];
      to = to || inst.slotTarget(n);
      g.ft(chip, {x: from.x, y: from.y, opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, at);
      g.to(chip, {x: to.x, y: to.y, duration: 0.55, ease: 'power1.inOut'}, at + 0.15);
      g.to(inst.parts.slots[n].querySelector('.sk-sdash'), {opacity: 0, duration: 0.2}, at + 0.6);
    };
    inst.bbox = function () { return bboxOf(inst.parts.slots); };
    return inst;
  }

  // Thread panel shared by the inbox and the phone chat: header with avatar and name, channel chips, bars of skeleton
  function threadHeader(panel, contact, left, top, width) {
    return el(panel, 'div', 'sk-th', {left: left, top: top, width: width, height: 80}, '<span class="sk-av"><i>' + contact[0] + '</i></span><b>' + contact + '</b>');
  }

  // INBOX: CAIXA DE ENTRADA ÚNICA (props.rect {x,y,w,h} de 1728x810 por padrão; contact, channels [voz, texto], call, message)
  function mountInbox(parent, props) {
    var r = props.rect || {x: 96, y: 170, w: 1728, h: 810}, inst = {parts: {}}, P = inst.parts;
    P.panel = el(parent, 'div', 'sk-tp', {left: r.x, top: r.y, width: r.w, height: r.h, opacity: '0'});
    el(P.panel, 'i', 'sk-vdiv', {left: 508, top: 24, width: 3, height: 762});
    P.row = el(P.panel, 'div', 'sk-lrow', {left: 24, top: 24, width: 460, height: 170, opacity: '0'},
      '<span class="sk-av"><i>' + props.contact[0] + '</i></span><span class="sk-ln"><b>' + props.contact + ' · DEMO</b><span class="sk-tags"></span></span>');
    P.tagV = el(P.row.querySelector('.sk-tags'), 'span', 'sk-tag', {opacity: '0'}, props.channels[0]);
    P.tagW = el(P.row.querySelector('.sk-tags'), 'span', 'sk-tag', {opacity: '0'}, props.channels[1]);
    [214, 330, 446].forEach(function (y) { el(P.panel, 'i', 'sk-bar', {left: 24, top: y, width: 460, height: 96}); });
    threadHeader(P.panel, props.contact + ' · DEMO', 548, 24, 1150);
    P.chV = el(P.panel, 'span', 'sk-chip', {left: 1330, top: 32}, props.channels[0]);
    P.chW = el(P.panel, 'span', 'sk-chip', {left: 1450, top: 32}, props.channels[1]);
    P.call = el(P.panel, 'div', 'sk-callrow', {left: 560, top: 170, width: 600, opacity: '0'}, ico(PHONE, 44, '#C9D3D8', 2) + '<span>' + props.call + '</span>');
    P.msg = el(P.panel, 'div', 'sk-bub in', {left: 560, top: 310, opacity: '0'}, '<span class="sk-tx">' + props.message + '</span>');
    P.brk = el(P.panel, 'i', 'sk-brk', {left: 536, top: 170, width: 6, height: 262, opacity: '0'});
    gsap.set(P.brk, {scaleY: 0, transformOrigin: '50% 0%'});
    el(P.panel, 'i', 'sk-bar', {left: 560, top: 690, width: 1130, height: 76});
    inst.beats = {panel: 0, row: 0.3, voice: 0.8, whatsapp: 1.5, thread: 2.5, settled: 3.0};
    // Voz arrives first (the call row), then the WhatsApp message lands in the SAME thread; a bracket joins them. Settles at at + 3.3 s
    inst.play = function (tl, at) {
      var g = gestures(tl);
      g.ft(P.panel, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'}, at);
      g.pop(P.row, at + 0.3);
      g.lit(P.chV, at + 0.8); g.pop(P.call, at + 0.9); g.ft(P.tagV, {opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.25}, at + 0.9);
      g.lit(P.chW, at + 1.5); g.ft(P.msg, {opacity: 0, scale: 0.9, y: 10, transformOrigin: '0% 100%'}, {opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out'}, at + 1.6);
      g.ft(P.tagW, {opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.25}, at + 1.6);
      g.to(P.brk, {opacity: 1, scaleY: 1, duration: 0.45, ease: EASE}, at + 2.5);
      g.to(P.row, {borderColor: amber(), duration: 0.3}, at + 3.0);
    };
    inst.bbox = function () { return bboxOf([P.panel]); };
    return inst;
  }

  // TOAST: CONFIRMAÇÃO EM VERDE (props.text; right/top ou left/top em px do pai)
  function mountToast(parent, props) {
    var inst = {parts: {}};
    var css = {top: props.top, opacity: '0'};
    if (props.right != null) css.right = props.right; else css.left = props.left;
    inst.parts.text = el(parent, 'div', 'sk-recv', css, '<span>' + props.text + '</span>');
    inst.beats = {in: 0};
    inst.play = function (tl, at) { gestures(tl).ft(inst.parts.text, {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'}, at); };
    inst.bbox = function () { return bboxOf([inst.parts.text]); };
    return inst;
  }

  // PHONE-CHAT: CONVERSA DO CELULAR COM A RESPOSTA E A CONFIRMAÇÃO (props.rect 860x650 por padrão; contact, channels, reply, received)
  function mountPhoneChat(parent, props) {
    var r = props.rect || {x: 964, y: 290, w: 860, h: 650}, inst = {parts: {}}, P = inst.parts;
    P.panel = el(parent, 'div', 'sk-tp', {left: r.x, top: r.y, width: r.w, height: r.h, opacity: '0'});
    threadHeader(P.panel, props.contact + ' · DEMO', 28, 22, 780);
    P.chV = el(P.panel, 'span', 'sk-chip', {left: 28, top: 118}, props.channels[0]);
    P.chW = el(P.panel, 'span', 'sk-chip', {left: 148, top: 118}, props.channels[1]);
    el(P.panel, 'i', 'sk-bar in', {left: 28, top: 210, width: 520, height: 70});
    P.reply = el(P.panel, 'div', 'sk-bub out', {right: 40, top: 320, opacity: '0'}, '<span class="sk-tx">' + props.reply + '</span>');
    P.toast = mountToast(P.panel, {text: props.received, right: 48, top: 462});
    el(P.panel, 'i', 'sk-bar', {left: 28, top: 556, width: 804, height: 64});
    inst.beats = {panel: 0, channel: 0.4, reply: 0.8, received: 1.5, settled: 1.6};
    // The panel rises, the WhatsApp chip lights, the reply lands and the confirmation shows; settles at at + 1.9 s
    inst.play = function (tl, at) {
      var g = gestures(tl);
      g.ft(P.panel, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'}, at);
      g.lit(P.chW, at + 0.4);
      g.ft(P.reply, {opacity: 0, scale: 0.9, y: 10, transformOrigin: '100% 100%'}, {opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out'}, at + 0.8);
      P.toast.play(tl, at + 1.5);
      g.to(P.panel, {borderColor: '#53D68A', duration: 0.3}, at + 1.6);
    };
    inst.bbox = function () { return bboxOf([P.panel]); };
    return inst;
  }

  // DOCUMENT-PANEL: PERGUNTA, DOCUMENTO COM A LINHA DESTACADA E RESPOSTA COM A FONTE (tela cheia; props.question, doc {title, line1, line2}, answer)
  function mountDocumentPanel(parent, props) {
    var inst = {parts: {}}, P = inst.parts;
    P.question = el(parent, 'div', 'sk-bub out q', {left: 96, top: 170, opacity: '0'}, '<span class="sk-tx">' + props.question + '</span>');
    P.doc = el(parent, 'div', 'sk-kp', {left: 96, top: 316, width: 920, height: 664, opacity: '0'});
    el(P.doc, 'div', 'sk-kt', {left: 36, top: 30}, props.doc.title);
    el(P.doc, 'i', 'sk-bar', {left: 36, top: 120, width: 760, height: 22});
    P.highlight = el(P.doc, 'div', 'sk-khl', {left: 28, top: 170, width: 864, height: 150, opacity: '0'});
    el(P.doc, 'div', 'sk-kl', {left: 52, top: 184, width: 820}, '<span>' + props.doc.line1 + '</span><span>' + props.doc.line2 + '</span>');
    [372, 412, 452, 520, 560].forEach(function (y, i) { el(P.doc, 'i', 'sk-bar', {left: 36, top: y, width: [800, 720, 640, 780, 520][i], height: 20}); });
    P.answerPanel = el(parent, 'div', 'sk-ap', {left: 1060, top: 316, width: 764, height: 664, opacity: '0'});
    P.answer = el(P.answerPanel, 'div', 'sk-ans', {left: 40, top: 70, opacity: '0'}, '<span>' + props.answer + '</span>');
    P.source = el(P.answerPanel, 'div', 'sk-srcpill', {left: 40, top: 250, opacity: '0'}, ico(BADGES[7], 40, amber(), 2) + '<span>' + props.doc.title + '</span>');
    [380, 430, 480].forEach(function (y, i) { el(P.answerPanel, 'i', 'sk-bar', {left: 40, top: y, width: [600, 680, 420][i], height: 22}); });
    P.seam = svg(parent, '<path class="sk-seam" d="M990 561H1030C1062 561 1070 604 1100 604"/>', {left: 0, top: 0, zIndex: '4', opacity: '0'});
    inst.beats = {question: 0, doc: 0.5, highlight: 1.4, answerPanel: 2.0, answer: 2.5, source: 3.1, seam: 3.5};
    // The line of Saturday, highlighted, becomes the answer with its source; settles at at + 4.0 s
    inst.play = function (tl, at) {
      var g = gestures(tl);
      g.pop(P.question, at);
      g.ft(P.doc, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'}, at + 0.5);
      g.to(P.highlight, {opacity: 1, duration: 0.4, ease: 'power1.out'}, at + 1.4);
      g.ft(P.answerPanel, {opacity: 0, x: 24}, {opacity: 1, x: 0, duration: 0.4, ease: 'power2.out'}, at + 2.0);
      g.pop(P.answer, at + 2.5);
      g.pop(P.source, at + 3.1);
      g.drawOn(P.seam.querySelector('path'), at + 3.5, 0.5, 'power1.inOut');
      g.ft(P.seam, {opacity: 0}, {opacity: 1, duration: 0.1}, at + 3.5);
    };
    inst.bbox = function () { return bboxOf([P.question, P.doc, P.answerPanel]); };
    return inst;
  }

  // RECEIPT: O RECIBO REDONDO QUE VAI DO MAGNETO AO DOMUS (começa escondido e centrado em (x, y))
  function receipt(parent) {
    var e = el(parent, 'div', 'sk-packet', {left: 0, top: 0, opacity: '0'}, ico(RECEIPT, 40, '#1C1A16', 2.4));
    gsap.set(e, {xPercent: -50, yPercent: -50});
    return e;
  }

  // WORKFLOW-APPROVAL: TRÊS PASSOS, A GESTORA APROVA E O CARTÃO VAI A RESOLVIDO (tela cheia; props.steps [[a,b]x3], manager [nome, papel], stages, rule)
  function mountWorkflow(parent, props) {
    var inst = {parts: {}}, P = inst.parts, sx = [96, 710, 1324];
    P.steps = props.steps.map(function (s, i) {
      return el(parent, 'div', i === 1 ? 'sk-step btn' : 'sk-step', {left: sx[i], top: 380, width: 500, height: 300, opacity: '0'},
        '<span class="sk-stx"><b>' + s[0] + '</b><b>' + s[1] + '</b></span><span class="sk-sok">' + CHECK + '</span>');
    });
    P.oks = P.steps.map(function (s) { var o = s.querySelector('.sk-sok'); o.style.opacity = '0'; return o; });
    P.arrows = svg(parent, '<path class="sk-arr" d="M600 530H706M1214 530H1320"/>', {left: 0, top: 0, zIndex: '2', opacity: '0'});
    P.manager = el(parent, 'div', 'sk-mgr', {left: 1384, top: 160, width: 440, height: 130, opacity: '0'},
      '<span class="sk-av"><i>G</i></span><div class="sk-mt"><b>' + props.manager[0] + '</b><b class="dm">' + props.manager[1] + '</b></div>');
    P.stages = el(parent, 'div', 'sk-stages', {left: 96, top: 800, width: 1600, height: 80, opacity: '0'});
    P.pills = props.stages.map(function (name) { return el(P.stages, 'span', 'sk-pill', null, name); });
    P.rule = el(parent, 'div', 'sk-fchip', {left: 0, top: 0, opacity: '0'}, ico(ICONS.Regras, 44, amber(), 2) + '<span>' + props.rule + '</span>');
    P.receipt = receipt(parent);
    P.finger = el(parent, 'div', 'sk-finger', {left: 0, top: 0, opacity: '0'});
    P.ripple = el(parent, 'div', 'sk-ripple', {left: 0, top: 0, opacity: '0'});
    gsap.set([P.rule, P.finger, P.ripple], {xPercent: -50, yPercent: -50});
    inst.beats = {stages: 0, rule: 0.8, step1: 1.4, step2: 2.0, tap: 2.8, step3: 3.4, resolved: 3.9, receipt: 4.3};
    // Aguardando aprovação, the Gestora taps Aprovar, the card is Resolvido and the receipt appears; settles at at + 4.55 s
    inst.play = function (tl, A) {
      var g = gestures(tl), AM = amber();
      var pillOn = function (i, at) { g.to(P.pills[i], {color: AM, borderColor: AM, backgroundColor: '#2B2210', duration: 0.25}, at); };
      var pillOff = function (i, at) { g.to(P.pills[i], {color: '#B9B9C4', borderColor: '#4A4A56', backgroundColor: '#17171B', duration: 0.25}, at); };
      g.ft(P.stages, {opacity: 0}, {opacity: 1, duration: 0.3}, A);
      pillOn(1, A + 0.2);
      g.ft(P.manager, {opacity: 0, y: -14}, {opacity: 1, y: 0, duration: 0.35, ease: 'power2.out'}, A + 0.2);
      // The card goes to Aguardando aprovação; the rule enters from the left and becomes the first step
      pillOff(1, A + 0.6); pillOn(2, A + 0.6);
      g.ft(P.rule, {x: 40, y: 530, opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out'}, A + 0.8);
      g.to(P.rule, {x: 250, duration: 0.45, ease: 'power1.inOut'}, A + 0.95);
      g.to(P.rule, {opacity: 0, scale: 0.7, duration: 0.15}, A + 1.4);
      // Step 1: check the shipment
      g.ft(P.steps[0], {opacity: 0, x: 18}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 1.4);
      g.ft(P.oks[0], {opacity: 0, scale: 0.4}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, A + 1.8);
      g.ft(P.arrows, {opacity: 0}, {opacity: 1, duration: 0.3}, A + 1.9);
      // Step 2: the Gestora taps Aprovar
      g.ft(P.steps[1], {opacity: 0, x: 18}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 2.0);
      g.to(P.manager, {borderColor: AM, duration: 0.2}, A + 2.1);
      g.ft(P.finger, {x: 1600, y: 290, opacity: 0}, {opacity: 1, duration: 0.1}, A + 2.2);
      g.to(P.finger, {x: 1150, y: 600, duration: 0.45, ease: EASE}, A + 2.3);
      g.ft(P.ripple, {x: 1150, y: 600, opacity: 0.9, scale: 0.3}, {opacity: 0, scale: 2.2, duration: 0.4, ease: 'power2.out'}, A + 2.8);
      g.to(P.finger, {scale: 0.8, duration: 0.08, yoyo: true, repeat: 1}, A + 2.8);
      g.to(P.finger, {opacity: 0, duration: 0.15}, A + 3.05);
      g.to(P.steps[1], {backgroundColor: '#53D68A', borderColor: '#53D68A', duration: 0.25}, A + 3.0);
      // Step 3: update the order; the card is Resolvido and the receipt appears
      g.ft(P.steps[2], {opacity: 0, x: 18}, {opacity: 1, x: 0, duration: 0.3, ease: 'power2.out'}, A + 3.4);
      g.ft(P.oks[2], {opacity: 0, scale: 0.4}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, A + 3.75);
      pillOff(2, A + 3.9); pillOn(3, A + 3.9);
      g.to(P.manager, {borderColor: '#3A3A44', duration: 0.3}, A + 4.0);
      g.ft(P.receipt, {x: 1792, y: 832, opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, A + 4.3);
    };
    inst.bbox = function () { return bboxOf(flat({a: P.steps, b: P.manager, c: P.stages})); };
    return inst;
  }

  // DECLARAÇÃO DOS COMPONENTES (nome, versão maior, batidas, métodos e o menor texto que cada um aceita)
  var NOTE = {bodyTextPx: MIN.bodyTextPx, metaTextPx: MIN.metaTextPx};
  var components = {
    'house-rooms': {version: 1, props: 'x', beats: ['rooms', 'outline'], methods: ['play', 'center', 'altText'], minScale: NOTE, mount: mountHouse},
    'funnel': {version: 1, props: 'rect {x,y,w,h,pad,step,sh,labW}, stages[]', beats: ['enter'], methods: ['play'], minScale: NOTE, mount: mountFunnel},
    'crm-card': {version: 1, props: 'rect {x,y,w,h}, title[2], facts? {rect, rows[{badge,text,empty}]}', beats: ['appear', 'sheet', 'row'], methods: ['appear', 'sheetIn', 'factRow', 'slideTo'], minScale: NOTE, mount: mountCrmCard},
    'data-chips': {version: 1, props: 'slots[{x,y,w,h,badge}], chips[text]', beats: ['slotsIn', 'fly'], methods: ['slotsIn', 'fly', 'slotTarget'], minScale: NOTE, mount: mountDataChips},
    'inbox': {version: 1, props: 'rect?, contact, channels[2], call, message', beats: ['panel', 'row', 'voice', 'whatsapp', 'thread', 'settled'], methods: ['play'], minScale: NOTE, mount: mountInbox},
    'phone-chat': {version: 1, props: 'rect?, contact, channels[2], reply, received', beats: ['panel', 'channel', 'reply', 'received', 'settled'], methods: ['play'], minScale: NOTE, mount: mountPhoneChat},
    'document-panel': {version: 1, props: 'question, doc {title,line1,line2}, answer', beats: ['question', 'doc', 'highlight', 'answerPanel', 'answer', 'source', 'seam'], methods: ['play'], minScale: NOTE, mount: mountDocumentPanel},
    'workflow-approval': {version: 1, props: 'steps[3][2], manager[2], stages[], rule', beats: ['stages', 'rule', 'step1', 'step2', 'tap', 'step3', 'resolved', 'receipt'], methods: ['play'], minScale: NOTE, mount: mountWorkflow},
    'toast': {version: 1, props: 'text, right|left, top', beats: ['in'], methods: ['play'], minScale: NOTE, mount: mountToast}
  };

  // MONTAGEM: 'house-rooms@1' ou 'house-rooms'; o texto secundário vai em --sk-meta do pai
  function mount(ref, parent, props, opts) {
    var m = String(ref).match(/^([a-z0-9-]+)(?:@(\d+))?$/);
    var decl = m && components[m[1]];
    if (!decl) throw new Error('scene-kit: unknown component "' + ref + '"; known: ' + Object.keys(components).join(', '));
    if (m[2] && Number(m[2]) !== decl.version) throw new Error('scene-kit: ' + m[1] + '@' + m[2] + ' requested, this kit has @' + decl.version);
    var meta = metaFor(m[1], opts);
    parent.style.setProperty('--sk-meta', meta + 'px');
    var inst = decl.mount(parent, props || {}, {meta: meta});
    inst.name = m[1] + '@' + decl.version;
    inst.metaPx = meta;
    return inst;
  }

  // PALCO: GRUPOS EM TELA CHEIA, UM POR CENA, E OS LOGOS NO CANTO SUPERIOR ESQUERDO
  // The piece declares #world with the product logos (img[data-p], src set by the brand loader). cfg.scenes [{id, t0}] (t0 in s),
  // cfg.endorse "on" swaps each logo to its "by welabs" file. stage.scene(id, logos, fn) cuts the scene in at t0 and out at the next
  // scene's t0; logos is [[productKey, dx, dy]]; fn(A, scene) runs with A = t0 + 0.1 s. stage.end(duration) pins the timeline length.
  function stage(root, cfg) {
    var world = root.querySelector('#world'), isl = el(world, 'div', 'sk-isl');
    var tl = gsap.timeline({paused: true});
    var scenes = cfg.scenes, S = {}, groups = {}, logos = {}, logoBox = {};
    scenes.forEach(function (s) { S[s.id] = s; groups[s.id] = el(isl, 'div', 'sk-scene'); });
    var endorse = cfg.endorse || root.getAttribute('data-endorse') || 'off';
    Object.keys(LOGO).forEach(function (kk) {
      var L = LOGO[kk], img = root.querySelector('img[data-p="' + kk + '"]');
      if (!img) return;
      img.classList.add('sk-logo');
      var hPlain = L.lx * L.K, w = hPlain * L.wp / L.hp, band = (L.he - L.hp) / L.hp * hPlain;
      var on = endorse === 'on', top = G.logoBase - (210 - L.vy) / L.hp * hPlain;
      if (on) img.setAttribute('src', window.BRAND.url('welabs', kk + '-endorsed-on-dark.svg'));
      img.style.left = px(G.logoLeft); img.style.top = px(top); img.style.width = px(w);
      img.style.height = px(on ? hPlain + band : hPlain);
      img.style.marginBottom = on ? px(-band) : '0';
      logos[kk] = img; logoBox[kk] = {x: G.logoLeft, y: top, w: w, h: hPlain};
    });
    var g = gestures(tl);
    var api = {tl: tl, world: world, groups: groups, logos: logos, logoBox: logoBox, G: G, gestures: g, finish: null};
    // The scenes are staging: covering a neighbour is the design, so nothing here is "occluded" or "overlapped" by mistake. Overflow
    // is NOT exempted (chain-detail 1.0.0 exempted it too, and the gate could not see text running out of its box)
    api.finish = function () {
      [].forEach.call(isl.querySelectorAll('*'), function (e) { e.setAttribute('data-layout-allow-occlusion', ''); e.setAttribute('data-layout-allow-overlap', ''); });
      var all = scenes.map(function (s) { return groups[s.id]; });
      gsap.set(all, {opacity: 0});
      gsap.set(all[0], {opacity: 1});
      gsap.set(Object.keys(logos).map(function (k) { return logos[k]; }), {opacity: 0});
    };
    api.scene = function (id, logoList, fn) {
      var s = S[id], i = scenes.indexOf(s);
      if (i > 0) tl.set(groups[id], {opacity: 1}, s.t0);
      logoList.forEach(function (l) {
        var img = logos[l[0]];
        tl.set(img, {x: l[1] || 0, y: l[2] || 0}, s.t0);
        g.ft(img, {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, s.t0 + 0.05);
      });
      fn(s.t0 + 0.1, s);
      if (i < scenes.length - 1) {
        tl.set(groups[id], {opacity: 0}, scenes[i + 1].t0);
        logoList.forEach(function (l) { tl.set(logos[l[0]], {opacity: 0}, scenes[i + 1].t0); });
      }
    };
    api.end = function (duration) { tl.to({}, {duration: 0.001}, duration - 0.001); return tl; };
    return api;
  }

  // CONNECTOR: TRAÇO ÂMBAR QUE LIGA DOIS ELEMENTOS (d é o path em px do quadro; desenhe com gestures(tl).drawOn)
  function connector(parent, d) {
    return svg(parent, '<path class="sk-seam" d="' + d + '"/>', {left: 0, top: 0, zIndex: '4'});
  }

  window.SceneKit = {version: VERSION, MIN: MIN, TEXT: TEXT, G: G, LOGO: LOGO, ICONS: ICONS, BADGES: BADGES, components: components, mount: mount, stage: stage, gestures: gestures, receipt: receipt, connector: connector};
})();
