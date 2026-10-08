// PLAYER SEQUENCIAL (ABERTURA E DEPOIS FILME) — referência
// Plays a brand intro and then a film as two <hyperframes-player> elements stacked in one container. The film is loaded in
// the background, paused at frame 0, while the intro plays; when the intro ends the film starts at once and the intro,
// which stays on its last frame, fades out over `fade` seconds. Same handoff the fused pieces had (film starts at the
// intro's end, 0.5 s crossfade), but the pieces stay separate files. There is never a moment without a visible layer.
// Needs the HyperFrames player script (hyperframes-player.global.js) loaded first.
//
//   const seq = SequencePlayer.mount(container, {intro: 'pieces/welabs-intro-v7-s1/index.html', film: 'pieces/<film>/index.html'});
//   const introSrc = await SequencePlayer.introFor('_shared/brand/manifest.json', 'welabs', 'pieces/');   // manifest lookup
//   seq.play(); seq.pause(); seq.reset(); seq.destroy();
//   seq.state: 'loading' | 'cover' | 'intro' | 'film' | 'ended';  seq.gapMs: handoff gap of the last run (null until it ran)
// Events on the container: 'sequence:handoff' (intro ended), 'sequence:film-start' {gapMs}, 'sequence:ended'.
// Options: width/height (1920x1080), fade (0.5 s), controls (true), cover (false): show the intro's last frame, paused,
// as the cover until the first play, which then starts the intro from 0.
(function (global) {
  'use strict';

  function layer(container, src, opts, z) {
    var el = document.createElement('hyperframes-player');
    el.setAttribute('src', src);
    el.setAttribute('width', String(opts.width));
    el.setAttribute('height', String(opts.height));
    if (opts.controls) el.setAttribute('controls', '');
    el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:' + z;
    container.appendChild(el);
    return el;
  }

  function mount(container, options) {
    var opts = Object.assign({width: 1920, height: 1080, fade: 0.5, controls: true, cover: false}, options);
    if (!opts.intro || !opts.film) throw new Error('SequencePlayer.mount needs intro and film');
    if (!customElements.get('hyperframes-player')) throw new Error('SequencePlayer: load hyperframes-player first');
    container.innerHTML = '';
    container.style.position = 'relative';
    // Film below, intro on top; the intro is what the viewer sees until the handoff
    var film = layer(container, opts.film, opts, 1);
    var intro = layer(container, opts.intro, opts, 2);
    var api = {introPlayer: intro, filmPlayer: film, state: 'loading', gapMs: null};
    var introEndedAt = null, filmReady = false, coverShown = false, destroyed = false;

    function emit(name, detail) { container.dispatchEvent(new CustomEvent(name, {detail: detail || {}})); }

    // The film waits at frame 0 and must not start by itself (a player may autoplay when it is ready)
    film.addEventListener('ready', function () { filmReady = true; film.pause(); film.seek(0); });

    // Cover: the intro's closing frame until the first play
    intro.addEventListener('ready', function () {
      if (opts.cover && !coverShown && api.state === 'loading') {
        coverShown = true;
        intro.pause();
        intro.seek(intro.duration);
        api.state = 'cover';
      } else if (api.state === 'loading') api.state = 'intro';
    });

    intro.addEventListener('play', function () {
      if (api.state === 'cover') { intro.seek(0); }
      if (api.state === 'cover' || api.state === 'loading') api.state = 'intro';
    });

    // Handoff: the film starts the moment the intro ends; the intro holds its last frame and fades out over it
    intro.addEventListener('ended', function () {
      if (destroyed || api.state === 'film') return;
      introEndedAt = performance.now();
      api.state = 'film';
      emit('sequence:handoff', {});
      // The film already waits at frame 0, so no seek: a seek is one more round trip into the film's iframe
      function start() { if (film.currentTime > 0) film.seek(0); film.play(); }
      if (filmReady) start(); else film.addEventListener('ready', start, {once: true});
      intro.style.transition = 'opacity ' + opts.fade + 's ease-in-out';
      intro.style.opacity = '0';
      intro.style.pointerEvents = 'none';
      // Hide after the fade so a hidden intro never shows through when the film restarts
      setTimeout(function () { if (!destroyed && api.state !== 'cover') intro.style.visibility = 'hidden'; }, opts.fade * 1000 + 50);
    });

    // The film's play event closes the handoff: gapMs is the time the player took to start the film after the intro ended
    // (the player's own time updates come every ~130 ms, too coarse to measure; tools/test/sequence-player.test.mjs also
    // measures the film's real first frame)
    film.addEventListener('play', function () {
      if (introEndedAt !== null && api.state === 'film') {
        api.gapMs = Math.round((performance.now() - introEndedAt) * 10) / 10;
        introEndedAt = null;
        emit('sequence:film-start', {gapMs: api.gapMs});
      }
    });
    film.addEventListener('ended', function () { if (api.state === 'film') { api.state = 'ended'; emit('sequence:ended', {}); } });

    api.play = function () {
      if (api.state === 'film') return film.play();
      if (api.state === 'ended') { api.reset(); return intro.play(); }
      if (api.state === 'cover') { intro.seek(0); api.state = 'intro'; }
      return intro.play();
    };
    api.pause = function () { (api.state === 'film' || api.state === 'ended' ? film : intro).pause(); };
    // Back to the beginning: intro visible again, film waiting at frame 0
    api.reset = function () {
      introEndedAt = null;
      intro.style.transition = 'none';
      intro.style.opacity = '1';
      intro.style.visibility = 'visible';
      intro.style.pointerEvents = '';
      film.pause(); film.seek(0);
      intro.seek(0);
      api.state = 'intro';
      return Promise.resolve();
    };
    api.destroy = function () { destroyed = true; container.innerHTML = ''; };
    return api;
  }

  // Intro piece of a brand according to the manifest the pieces share (a brand switch changes it in that one file)
  function introFor(manifestUrl, brand, piecesBase) {
    return fetch(manifestUrl, {cache: 'no-store'}).then(function (r) {
      if (!r.ok) throw new Error('manifest HTTP ' + r.status);
      return r.json();
    }).then(function (m) {
      var intro = m.brands && m.brands[brand] && m.brands[brand].intro;
      if (!intro) throw new Error('no intro for brand ' + brand + ' in the manifest');
      return piecesBase + intro + '/index.html';
    });
  }

  global.SequencePlayer = {mount: mount, introFor: introFor};
})(window);
