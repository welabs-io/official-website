'use client';
import {useEffect, useRef} from 'react';
import {usePathname} from 'next/navigation';

/**
 * Site-wide motion layer.
 *
 * - Threads: one SVG behind the content draws (a) a spine through the section headings and
 *   (b) edges between related pieces of content (`data-thread="key"` → `data-thread-to="key"`).
 *   Both draw as the reader scrolls. The hero sequence (`data-hero-node` + `data-hero-links`)
 *   draws once on load: the signature moment of each home.
 * - Reveals: `[data-reveal]` elements enter once (`data-in`); `data-reveal="mask"` opens a mask.
 * - Depth: `[data-depth]` elements drift with scroll (desktop only).
 * - Magnetic: `[data-magnetic]` controls lean toward a fine pointer.
 * Everything collapses to static, fully drawn output under prefers-reduced-motion.
 */

type Edge = {path: SVGPathElement; dot: SVGCircleElement; from: number; to: number; length: number};
const SVG_NS = 'http://www.w3.org/2000/svg';

// GEOMETRIA DAS ARESTAS
// Picks the anchor sides from the relative position of both boxes and returns a cubic path.
function edgePath(a: DOMRect, b: DOMRect, ox: number, oy: number): {d: string; start: [number, number]; end: [number, number]; startY: number; endY: number} {
  const ax = a.left - ox, ay = a.top - oy, bx = b.left - ox, by = b.top - oy;
  if (b.left >= a.right - 8) {
    // Target sits to the right: leave from the right edge, enter on the left edge.
    const sx = ax + a.width, sy = ay + Math.min(a.height / 2, 48);
    const tx = bx, ty = by + Math.min(b.height / 2, 48);
    const k = Math.max(40, (tx - sx) / 2);
    return {d: `M${sx},${sy} C${sx + k},${sy} ${tx - k},${ty} ${tx},${ty}`, start: [sx, sy], end: [tx, ty], startY: sy, endY: ty};
  }
  // Target sits below: leave from the bottom edge, enter on the top edge.
  const sx = Math.min(Math.max(bx + Math.min(28, b.width / 2), ax + 12), ax + a.width - 12);
  const sy = ay + a.height;
  const tx = bx + Math.min(28, b.width / 2), ty = by;
  const k = Math.max(30, Math.min(220, (ty - sy) / 2));
  return {d: `M${sx},${sy} C${sx},${sy + k} ${tx},${ty - k} ${tx},${ty}`, start: [sx, sy], end: [tx, ty], startY: sy, endY: ty};
}

// A heading anchors on the end of its first line of text, not on its (wider) block box.
// x comes from the inline text, y from the line box, which the rise animation never moves.
function anchorBox(el: HTMLElement): DOMRect {
  const line = el.querySelector<HTMLElement>(':scope > span');
  const text = line?.querySelector<HTMLElement>(':scope > span');
  if (!line || !text) return el.getBoundingClientRect();
  const l = line.getBoundingClientRect(), t = text.getBoundingClientRect();
  return new DOMRect(t.left, l.top, t.width + 14, l.height);
}

function make<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

export function MotionLayer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const svg = svgRef.current;
    const main = document.getElementById('main-content');
    const host = svg?.parentElement;
    if (!svg || !main || !host) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let edges: Edge[] = [];
    let spine: {path: SVGPathElement; top: number; bottom: number; length: number; nodes: {dot: SVGCircleElement; y: number}[]} | null = null;
    const heroStart = performance.now();
    const heroTimers: number[] = [];
    let frame = 0;

    // REVELAÇÃO DE CONTEÚDO
    // Revealed blocks settle from a small offset, so thread anchors are re-measured once they land.
    let settleTimer = 0;
    const io = new IntersectionObserver((entries) => {
      let revealed = false;
      for (const entry of entries) if (entry.isIntersecting) { entry.target.setAttribute('data-in', ''); io.unobserve(entry.target); revealed = true; }
      if (revealed) { window.clearTimeout(settleTimer); settleTimer = window.setTimeout(() => build(), 1150); }
    }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
    const scanReveals = () => main.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => {
      if (reduced.matches) el.setAttribute('data-in', ''); else io.observe(el);
    });

    // CONSTRUÇÃO DOS FIOS
    const build = () => {
      svg.replaceChildren();
      edges = [];
      spine = null;
      const box = host.getBoundingClientRect();
      const ox = box.left, oy = box.top;
      const narrow = window.innerWidth <= 860;
      svg.setAttribute('width', String(host.scrollWidth));
      svg.setAttribute('height', String(host.scrollHeight));
      svg.setAttribute('viewBox', `0 0 ${host.scrollWidth} ${host.scrollHeight}`);

      // Spine: a quiet line in the left gutter, with a node beside every section heading.
      const headings = [...main.querySelectorAll<HTMLElement>('h1, h2')].filter((h) => !h.closest('article, figure, nav, form, [data-no-node]') && h.offsetParent !== null);
      if (headings.length > 1) {
        const first = headings[0].getBoundingClientRect();
        const gutter = Math.max(10, first.left - ox - (window.innerWidth > 900 ? 36 : 12));
        const ys = headings.map((h) => h.getBoundingClientRect().top - oy + Math.min(14, h.getBoundingClientRect().height / 2));
        const top = ys[0], bottom = ys[ys.length - 1];
        const base = make('path', {d: `M${gutter},${top} V${bottom}`, class: 'thread-spine-base'});
        const path = make('path', {d: `M${gutter},${top} V${bottom}`, class: 'thread-spine'});
        svg.append(base, path);
        const nodes = ys.map((y) => { const dot = make('circle', {cx: gutter, cy: y, r: 3, class: 'thread-node'}); svg.append(dot); return {dot, y}; });
        spine = {path, top, bottom, length: bottom - top, nodes};
        path.style.strokeDasharray = `${spine.length} ${spine.length}`;
      }

      // Cross-content edges: every source links to each target with the same key.
      main.querySelectorAll<HTMLElement>('[data-thread]').forEach((source) => {
        const key = source.dataset.thread;
        main.querySelectorAll<HTMLElement>(`[data-thread-to="${key}"]`).forEach((target) => {
          if (source.offsetParent === null || target.offsetParent === null) return;
          const geo = edgePath(source.getBoundingClientRect(), target.getBoundingClientRect(), ox, oy);
          // On a single column, long edges would cut through the copy between both ends.
          if (narrow && geo.endY - geo.startY > 560) return;
          const path = make('path', {d: geo.d, class: 'thread-edge'});
          const dot = make('circle', {cx: geo.end[0], cy: geo.end[1], r: 3.5, class: 'thread-end'});
          svg.append(path, dot);
          const length = path.getTotalLength();
          path.style.strokeDasharray = `${length} ${length}`;
          edges.push({path, dot, from: Math.min(geo.startY, geo.endY), to: Math.max(geo.startY, geo.endY), length});
        });
      });

      // Hero sequence: drawn once, in order, when the page opens.
      heroTimers.splice(0).forEach((id) => window.clearTimeout(id));
      const heroNodes = new Map<string, HTMLElement>();
      main.querySelectorAll<HTMLElement>('[data-hero-node]').forEach((el) => heroNodes.set(el.dataset.heroNode!, el));
      let order = 0;
      heroNodes.forEach((source) => {
        (source.dataset.heroLinks ?? '').split(' ').filter(Boolean).forEach((key) => {
          const target = heroNodes.get(key);
          if (!target || target.offsetParent === null) return;
          const geo = edgePath(anchorBox(source), target.getBoundingClientRect(), ox, oy);
          // Stacked hero (narrow): the title sits above the copy, so its edge is skipped, not drawn through text.
          if (narrow && source.tagName === 'H1') { target.setAttribute('data-lit', ''); return; }
          const path = make('path', {d: geo.d, class: 'thread-hero'});
          const dot = make('circle', {cx: geo.end[0], cy: geo.end[1], r: 3.5, class: 'thread-end thread-hero-end'});
          // The origin gets its own node so the thread never starts in the void.
          const origin = make('circle', {cx: geo.start[0], cy: geo.start[1], r: 2.5, class: 'thread-origin'});
          svg.append(path, origin, dot);
          const length = path.getTotalLength();
          // Rebuilds during the opening resume the same timeline (negative delays) instead of restarting it.
          const delay = 700 + order * 240 - (performance.now() - heroStart);
          order += 1;
          const light = () => { dot.classList.add('is-on'); target.setAttribute('data-lit', ''); };
          if (reduced.matches || delay + 900 <= 0) { light(); return; }
          path.style.strokeDasharray = `${length} ${length}`;
          path.animate([{strokeDashoffset: length}, {strokeDashoffset: 0}], {duration: 900, delay, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both'});
          heroTimers.push(window.setTimeout(light, Math.max(0, delay + 820)));
        });
      });
      update();
    };

    // PROGRESSO LIGADO À ROLAGEM
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const head = window.scrollY + vh * 0.62;
      if (spine) {
        const p = reduced.matches ? 1 : Math.min(1, Math.max(0, (head - spine.top) / Math.max(1, spine.length)));
        spine.path.style.strokeDashoffset = String(spine.length * (1 - p));
        for (const n of spine.nodes) n.dot.classList.toggle('is-on', reduced.matches || n.y <= head);
      }
      for (const e of edges) {
        const span = Math.max(1, e.to - e.from);
        const p = reduced.matches ? 1 : Math.min(1, Math.max(0, (window.scrollY + vh * 0.78 - e.from) / span));
        e.path.style.strokeDashoffset = String(e.length * (1 - p));
        e.dot.classList.toggle('is-on', p >= 0.999);
      }
      if (!reduced.matches && window.innerWidth > 900) {
        main.querySelectorAll<HTMLElement>('[data-depth]').forEach((el) => {
          const r = el.parentElement!.getBoundingClientRect();
          const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.depth || 0);
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        });
      }
      document.documentElement.toggleAttribute('data-scrolled', window.scrollY > 24);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    // MAGNETISMO DOS CONTROLES
    let magnet: HTMLElement | null = null;
    const onPointer = (event: PointerEvent) => {
      if (!finePointer.matches || reduced.matches) return;
      const el = (event.target as Element | null)?.closest<HTMLElement>('[data-magnetic]') ?? null;
      if (magnet && magnet !== el) { magnet.style.transform = ''; magnet = null; }
      if (!el) return;
      magnet = el;
      const r = el.getBoundingClientRect();
      const dx = event.clientX - (r.left + r.width / 2), dy = event.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)`;
    };

    let rebuildTimer = 0;
    const rebuild = () => { window.clearTimeout(rebuildTimer); rebuildTimer = window.setTimeout(() => { scanReveals(); build(); }, 120); };
    const mo = new MutationObserver(rebuild);
    mo.observe(main, {childList: true, subtree: true});
    const ro = new ResizeObserver(rebuild);
    ro.observe(main);
    scanReveals();
    build();
    document.fonts?.ready.then(rebuild);
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', rebuild);
    document.addEventListener('pointermove', onPointer, {passive: true});
    reduced.addEventListener('change', rebuild);
    return () => {
      io.disconnect(); mo.disconnect(); ro.disconnect();
      window.clearTimeout(rebuildTimer); window.clearTimeout(settleTimer);
      heroTimers.forEach((id) => window.clearTimeout(id));
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', rebuild);
      document.removeEventListener('pointermove', onPointer);
      reduced.removeEventListener('change', rebuild);
      svg.replaceChildren();
    };
  }, [pathname]);

  return <svg ref={svgRef} className="threads" aria-hidden="true" focusable="false"/>;
}
