'use client';
import {createElement, useEffect, useRef, useState} from 'react';
import motionCatalog from '@/lib/motion-catalog.json';
import styles from './MotionFilm.module.css';

export type MotionItem = (typeof motionCatalog)[number];
type Kind = 'business' | 'topology' | 'journey' | 'intro';

// CARREGAMENTO DO PLAYER HYPERFRAMES
// The pinned player registers the <hyperframes-player> custom element once per page.
let playerLoad: Promise<void> | null = null;
function loadPlayer(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('hyperframes-player')) return Promise.resolve();
  playerLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/motion/player.js';
    script.onload = () => resolve();
    script.onerror = () => { playerLoad = null; reject(new Error('player')); };
    document.head.appendChild(script);
  });
  return playerLoad;
}

// CONSULTA DO CATÁLOGO DE FILMES E DOS ROTEIROS POR PRODUTO
// A product has either an approved reel (ordered films) or a business overview plus a journey; pages own topology films.
export function filmFor(product: string, kind: Kind): MotionItem | undefined {
  return motionCatalog.find((item) => item.product === product && item.kind === kind);
}

// All overview films of a product (business first, then topology), excluding journeys.
export function overviewFilms(product: string): MotionItem[] {
  const films = motionCatalog.filter((item) => item.product === product && item.kind !== 'journey');
  return [...films.filter((f) => f.kind === 'business'), ...films.filter((f) => f.kind === 'topology')];
}

// Approved reel of a product, in the operator's order; `also` lets a module page reuse its family's films.
export function reelFilms(product: string): MotionItem[] {
  return motionCatalog.filter((item) => item.reel && (item.product === product || (item.also as string[]).includes(product)));
}

// Card cover and share image: the first overview film shown on the product page.
export function coverFilm(product: string): MotionItem | undefined {
  return motionCatalog.find((item) => (item.product === product || (item.also as string[]).includes(product)) && (item.kind === 'business' || item.kind === 'topology'));
}

export function filmsForPage(page: string): MotionItem[] {
  return motionCatalog.filter((item) => item.page === page);
}

export function filmsByKind(kind: Kind): MotionItem[] {
  return motionCatalog.filter((item) => item.kind === kind);
}

type PlayerElement = HTMLElement & {play: () => void; seek: (t: number) => void; paused: boolean; duration: number; ready?: boolean};

export function MotionFilm({item, title, label}: {item: MotionItem; title?: string; label?: string}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(true);
  const player = useRef<PlayerElement | null>(null);
  useEffect(() => { loadPlayer().then(() => setReady(true), () => setFailed(true)); }, []);
  // The player exposes no reliable play/pause event here, so its state is sampled while mounted.
  useEffect(() => {
    if (!ready) return;
    let posterSet = false;
    const timer = window.setInterval(() => {
      const el = player.current;
      if (!el) return;
      // Frame 0 is often an empty opening; show a mid-film frame as the cover until play.
      if (!posterSet && el.ready && el.duration > 0) { el.seek(el.duration * 0.45); posterSet = true; }
      setPaused(el.paused !== false);
    }, 300);
    return () => window.clearInterval(timer);
  }, [ready]);
  // First play starts from the beginning; later plays resume where the viewer paused.
  const started = useRef(false);
  const start = () => { const el = player.current; if (!el) return; if (!started.current) { el.seek(0); started.current = true; } el.play(); };
  return (
    <figure className={styles.film} aria-label={title ?? item.title}>
      {label && <span className={styles.label}>{label}</span>}
      {failed ? <p className={styles.fallback}>Não foi possível carregar o filme.</p>
        : ready ? <div className={styles.stage}>
          {createElement('hyperframes-player', {key: item.id, ref: player, src: item.src, width: 1920, height: 1080, controls: true, class: styles.player})}
          {paused && <button type="button" className={styles.bigPlay} onClick={start} aria-label={`Reproduzir ${title ?? item.title}`}><span aria-hidden="true"/></button>}
        </div>
        : <div className={styles.player} aria-busy="true"/>}
      <figcaption className={styles.caption}><span>{title ?? item.title}</span><span>{Math.round(item.duration)} s · dados DEMO</span></figcaption>
    </figure>
  );
}

export function MotionGallery({items = motionCatalog, label}: {items?: MotionItem[]; label?: string}) {
  const [active, setActive] = useState(items[0]?.id);
  const item = items.find((film) => film.id === active) ?? items[0];
  if (!item) return null;
  return (
    <div className={styles.gallery}>
      <MotionFilm item={item} label={label}/>
      {items.length > 1 && <ul className={styles.list} aria-label={label ?? 'Filmes'}>
        {items.map((film) => (
          <li key={film.id}>
            <button type="button" aria-pressed={film.id === item.id} onClick={() => setActive(film.id)}>
              <strong>{film.title}</strong><span>{Math.round(film.duration)} s</span>
            </button>
          </li>
        ))}
      </ul>}
    </div>
  );
}
