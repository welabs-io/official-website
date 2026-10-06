// MARCA WELABS NA PEÇA (gerado por tools/build-brand.mjs; não editar à mão)
// Palette, product names and logo outlines for this piece. Loaded before the piece script.
// Sets --wl-* custom properties on <html> and fills every [data-wl-name] element with its product name.
(function () {
  var B = window.WELABS_BRAND = {
    color: {"amber":"#FFB020","amberRgb":"255,176,32","amberSoft":"#2B2210","graphite":"#10141C","graphiteRgb":"16,20,28","paper":"#FAF5EA","inkOnAmber":"#1C1A16","wait":"#B3A6FF","waitRgb":"179,166,255","waitSoft":"#221E3D","waitOnLight":"#5A46C8","warn":"#FF8650","warnRgb":"255,134,80","warnSoft":"#3A1D12","warnOnLight":"#B03E12"},
    names: {"hub":"Hub de domínio","flow":"Flow","kb":"KB","crm":"CRM","channels":"Channels"},
    // Ibrand outlines (brand/vector/welabs-logo-paths.json); "we" is the amber part, "labs" the light part
    logo: {"w":905,"h":213,"we":"M56.70 210.00H93.90L120.30 139.80L146.70 210.00H183.90L240.60 60.00H201.90L165.30 161.70L139.50 89.40L150.60 60.00H111.90L75.30 161.70L38.70 60.00H0.00ZM275.90 114.00C282.20 99.30 295.70 90.90 313.40 90.90C331.40 90.90 344.90 99.30 351.20 114.00ZM313.40 179.70C292.10 179.70 277.10 167.70 273.20 147.00H390.50C390.80 143.10 391.10 139.20 391.10 135.00C391.10 88.80 360.20 57.90 313.70 57.90C267.20 57.90 236.00 88.80 236.00 135.00C236.00 181.50 267.20 212.70 313.70 212.70C350.00 212.70 376.70 193.80 386.60 163.50H347.30C340.10 174.00 328.40 179.70 313.40 179.70Z","labs":"M405.00 210.00H441.00V0.00H405.00ZM531.40 57.90C485.20 57.90 454.00 88.80 454.00 135.00C454.00 181.50 485.20 212.70 528.70 212.70C550.60 212.70 565.90 204.90 573.10 195.60V210.00H609.10V135.60C609.10 89.10 577.90 57.90 531.40 57.90ZM573.10 135.30C573.10 163.20 556.60 179.70 531.70 179.70C506.50 179.70 490.00 163.20 490.00 135.30C490.00 107.40 506.50 90.90 531.70 90.90C556.60 90.90 573.10 107.40 573.10 135.30ZM623.00 0.00V135.30C623.00 183.60 657.50 212.40 701.30 212.40C746.90 212.40 778.10 181.50 778.10 135.30C778.10 88.80 746.90 57.60 703.10 57.60C681.50 57.60 666.20 65.40 659.00 74.70V0.00ZM742.10 135.00C742.10 162.90 725.60 179.40 700.40 179.40C675.50 179.40 659.00 162.90 659.00 135.00C659.00 107.10 675.50 90.60 700.40 90.60C725.60 90.60 742.10 107.10 742.10 135.00ZM824.40 100.50C824.40 94.50 830.70 90.60 842.40 90.60C854.70 90.60 870.30 95.10 886.20 108.30L905.40 80.40C892.20 69.60 872.70 57.60 843.00 57.60C809.10 57.60 788.40 73.50 788.40 101.10C788.40 156.00 870.00 140.10 870.00 165.90C870.00 174.60 860.70 178.80 848.40 178.80C833.70 178.80 817.80 172.80 805.20 160.80L786.00 189.00C795.30 197.40 815.70 211.80 847.50 211.80C881.70 211.80 906.00 195.30 906.00 164.70C906.00 108.60 824.40 122.40 824.40 100.50Z","w0":"M56.70 210.00H93.90L120.30 139.80L146.70 210.00H183.90L240.60 60.00H201.90L165.30 161.70L139.50 89.40L150.60 60.00H111.90L75.30 161.70L38.70 60.00H0.00Z","e":"M275.90 114.00C282.20 99.30 295.70 90.90 313.40 90.90C331.40 90.90 344.90 99.30 351.20 114.00ZM313.40 179.70C292.10 179.70 277.10 167.70 273.20 147.00H390.50C390.80 143.10 391.10 139.20 391.10 135.00C391.10 88.80 360.20 57.90 313.70 57.90C267.20 57.90 236.00 88.80 236.00 135.00C236.00 181.50 267.20 212.70 313.70 212.70C350.00 212.70 376.70 193.80 386.60 163.50H347.30C340.10 174.00 328.40 179.70 313.40 179.70Z"}
  };
  var s = document.documentElement.style, c = B.color;
  s.setProperty('--wl-amber', c.amber);
  s.setProperty('--wl-amber-rgb', c.amberRgb);
  s.setProperty('--wl-amber-soft', c.amberSoft);
  s.setProperty('--wl-graphite', c.graphite);
  s.setProperty('--wl-graphite-rgb', c.graphiteRgb);
  s.setProperty('--wl-paper', c.paper);
  s.setProperty('--wl-ink-on-amber', c.inkOnAmber);
  s.setProperty('--wl-wait', c.wait);
  s.setProperty('--wl-wait-rgb', c.waitRgb);
  s.setProperty('--wl-wait-soft', c.waitSoft);
  s.setProperty('--wl-warn', c.warn);
  s.setProperty('--wl-warn-rgb', c.warnRgb);
  s.setProperty('--wl-warn-soft', c.warnSoft);
  var els = document.querySelectorAll('[data-wl-name]');
  for (var i = 0; i < els.length; i++) {
    var n = B.names[els[i].getAttribute('data-wl-name')];
    if (n) els[i].textContent = n;
  }
})();
