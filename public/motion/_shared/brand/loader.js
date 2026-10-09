// CARREGADOR DA MARCA COMPARTILHADA
// A piece never carries a brand version. This script reads manifest.json while the page parses and resolves every
// brand reference to the version the manifest names, so a brand switch is a new version directory plus one manifest edit.
// The piece declares what it needs as attributes, never as a version:
//   <div id="root" data-brand="welabs"
//        data-brand-scripts="welabs/welabs-brand.js welabs/welabs-motion.js"   scripts run here, in this order
//        data-brand-vars="wego/docgo-color.svg">                               filled into --brand-<brand>-<file>
//   <img data-brand-src="welabs/domus-logo-on-dark.svg">                       src is set here, never written in the piece
//   style="background-image:var(--brand-wego-docgo-color-svg)"
// and loads this file with one plain <script src="../../_shared/brand/loader.js"></script> in the body tail, before its own
// script. Config lives on #root because the HyperFrames bundler (check, render) inlines and merges the scripts of the
// body and drops their attributes; element attributes survive.
// window.BRAND = {manifest, base, version(brand), url(brand, file), intro(brand)} is exposed for the players.
(function () {
  // ../../_shared/ from pieces/<id>/ or from a project root (where the browser clamps it) is the same _shared/ folder
  var base = new URL('../../_shared/brand/', document.baseURI).href;

  // Synchronous on purpose: the piece builds its timeline in the next script, which needs the brand scripts loaded
  function get(url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.send();
    if (req.status !== 200) throw new Error('brand loader: HTTP ' + req.status + ' for ' + url);
    return req.responseText;
  }
  var manifest = JSON.parse(get(base + 'manifest.json'));

  function entry(brand) {
    var b = manifest.brands && manifest.brands[brand];
    if (!b) throw new Error('brand not in manifest: ' + brand);
    return b;
  }
  function url(brand, file) { return base + brand + '/' + entry(brand).version + '/' + file; }
  function split(ref) {
    var i = ref.indexOf('/');
    if (i < 1) throw new Error('brand reference needs <brand>/<file>: ' + ref);
    return [ref.slice(0, i), ref.slice(i + 1)];
  }
  function list(root, name) { return ((root && root.getAttribute(name)) || '').split(/\s+/).filter(Boolean); }
  window.BRAND = {
    manifest: manifest,
    base: base,
    version: function (brand) { return entry(brand).version; },
    intro: function (brand) { return entry(brand).intro || null; },
    url: url,
  };

  var root = document.getElementById('root');
  // Brand scripts run in the listed order, before any script that follows this one (global scope, like a script tag)
  list(root, 'data-brand-scripts').forEach(function (ref) {
    var p = split(ref), u = url(p[0], p[1]);
    (0, eval)(get(u) + '\n//# sourceURL=' + u);
  });

  // Images and CSS backgrounds: resolved before the first paint, so no request goes to a wrong path
  var imgs = document.querySelectorAll('[data-brand-src]');
  for (var i = 0; i < imgs.length; i++) {
    var p = split(imgs[i].getAttribute('data-brand-src'));
    imgs[i].setAttribute('src', url(p[0], p[1]));
  }
  list(root, 'data-brand-vars').forEach(function (ref) {
    var p = split(ref);
    var name = '--brand-' + p[0] + '-' + p[1].replace(/[^A-Za-z0-9]+/g, '-');
    document.documentElement.style.setProperty(name, 'url("' + url(p[0], p[1]) + '")');
  });
})();
