"use client";
// PÁGINA ÚNICA /new (PRÉVIA)
// Seven sections, one idea per screen, alternating graphite and cream bands. The product moves on its own inside the
// block (see LiveStage and motion-controller); the chain section is driven by scrolling. Copy follows the operator's
// approved structure of 2026-10-09; the only call to action is "Conversar com a Welabs".
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ByWelabs } from "../ByWelabs";
import { imagineContactHref } from "@/lib/sister-site";
import Link from "next/link";
import { publicSlug } from "@/lib/public-slugs";
import motionData from "@/lib/onepage-motion.json";
import { HubLive } from "./HubLive";
import { LiveStage, ensurePlayer } from "./LiveStage";
import {
  getController,
  getPausedServerSnapshot,
  getPausedSnapshot,
  setMotionPaused,
  subscribePaused,
} from "./motion-store";
import styles from "./onepage.module.css";

// Pieces synced by scripts/sync-onepage-motion.mjs
const motion = motionData as unknown as {
  intros: Record<string, { src: string; poster: string }>;
  films: Record<
    string,
    {
      src: string;
      poster: string;
      clip: [number, number];
      beats: number[];
      segments: number[];
      beatPosters: string[];
    }
  >;
};

const CTA_LABEL = "Conversar com a Welabs";
const CTA_SUPPORT =
  "Conte o que sua empresa precisa. A gente mostra como os produtos se encaixam.";

// The contact form belongs to the Imagine site; without it configured the CTA falls back to the closing section
const contactHref = () => imagineContactHref() ?? "#contato";

// CABEÇALHO FIXO
// Logo, anchors, the pause control (WCAG 2.2.2) and the single CTA; a 4 px amber bar shows the scroll progress.
function Header({ paused }: { paused: boolean }) {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.current?.style.setProperty("--p", String(p));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <header className={styles.header}>
      <span ref={bar} className={styles.progress} aria-hidden="true" />
      <div className={styles.headerInner}>
        <a href="#top" className={styles.brand} aria-label="Welabs, início">
          <img
            src="/brands/welabs/welabs-logo-dark.svg"
            alt="Welabs"
            height={26}
          />
        </a>
        <nav className={styles.nav} aria-label="Seções">
          <a href="#domus">Núcleo</a>
          <a href="#trilhos">Trilhos</a>
          <a href="#cadeia">Cadeia</a>
          <a href="#welabs">A Welabs</a>
        </nav>
        <button
          type="button"
          className={styles.pause}
          onClick={() => setMotionPaused(!paused)}
        >
          <span className={styles.pauseIcon} aria-hidden="true">
            {paused ? "▶" : "❚❚"}
          </span>
          <span>{paused ? "Retomar animações" : "Pausar animações"}</span>
        </button>
        <a href={contactHref()} className={styles.cta}>
          {CTA_LABEL}
        </a>
      </div>
    </header>
  );
}

// SEÇÃO 1: ABERTURA COM O HUB
function Hero() {
  return (
    <section
      id="top"
      className={`${styles.band} ${styles.dark} ${styles.hero}`}
    >
      <div className={styles.wrap}>
        <div className={styles.heroText}>
          <h1>Ideias que viram ferramentas de trabalho.</h1>
          <p className={styles.lead}>
            Domus
            <ByWelabs /> define. Os outros dão vida.
          </p>
        </div>
        <HubLive />
      </div>
    </section>
  );
}

// SEÇÕES 2 E 3: NÚCLEO, DOMUS E RELLOO
// Same block for both: text and the product opening on one side, the film clip (desktop only) on the other.
type CoreProps = {
  id: string;
  tone: "light" | "dark";
  flip?: boolean;
  eyebrow: React.ReactNode;
  title: string;
  lead: string;
  intro: { src: string; poster: string };
  clip: { src: string; poster: string; range: readonly [number, number] };
};
function CoreSection({
  id,
  tone,
  flip,
  eyebrow,
  title,
  lead,
  intro,
  clip,
}: CoreProps) {
  return (
    <section
      id={id}
      className={`${styles.band} ${styles[tone]} ${styles.core}`}
    >
      <div
        className={`${styles.wrap} ${styles.coreGrid} ${flip ? styles.flip : ""}`}
      >
        <div className={styles.coreText}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2>{title}</h2>
          <p className={styles.lead}>{lead}</p>
          <LiveStage
            id={`${id}-intro`}
            className={styles.introStage}
            src={intro.src}
            poster={intro.poster}
          />
        </div>
        {/* The clip is too small to read on a phone: the stage is hidden there, so it never mounts */}
        <figure className={styles.clipFigure}>
          <LiveStage
            id={`${id}-clip`}
            src={clip.src}
            poster={clip.poster}
            clip={clip.range}
          />
          <figcaption>Trecho do filme. Os dados são fictícios.</figcaption>
        </figure>
      </div>
    </section>
  );
}

// SEÇÃO 4: TRILHOS
// Magneto, Tuner and Knowly: one row each, the product opening in loop and its phrase as the heading. The amber
// connector on the left runs back to the core and lights up while the row's opening is live.
const RAILS = [
  {
    key: "magneto",
    name: "Magneto",
    title: "Do jeito que você explica, ele automatiza.",
    lead: "Planilha, e-mail e lembrete viram um fluxo em blocos, sem programar.",
  },
  {
    key: "tuner",
    name: "Tuner",
    title: "Todo canal, uma conversa só.",
    lead: "WhatsApp, voz e chat do site chegam do mesmo jeito, prontos para o Relloo.",
  },
  {
    key: "knowly",
    name: "Knowly",
    title: "Não é só memória, é conhecimento.",
    lead: "Documentos, reuniões e tickets viram respostas, com a fonte de cada frase.",
  },
];
function Rails() {
  return (
    <section
      id="trilhos"
      className={`${styles.band} ${styles.light} ${styles.rails}`}
    >
      <div className={styles.wrap}>
        <span className={styles.eyebrow}>Trilhos</span>
        <div className={styles.railList}>
          {RAILS.map((r) => (
            <article key={r.key} className={styles.railRow}>
              <span className={styles.connector} aria-hidden="true" />
              <div className={styles.railText}>
                <span className={styles.eyebrow}>
                  {r.name}
                  <ByWelabs />
                </span>
                <h2>{r.title}</h2>
                <p className={styles.lead}>{r.lead}</p>
              </div>
              <LiveStage
                id={`rail-${r.key}`}
                src={motion.intros[r.key].src}
                poster={motion.intros[r.key].poster}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// SEÇÃO 5: A CADEIA CONDUZIDA PELA ROLAGEM
// The only section where scrolling drives the film: the section is tall, its content sticks, and the scroll progress
// maps to a time inside the chain film (seek). Five beats, one per product; with no scrolling nothing runs, and with
// motion paused the stage shows a still frame of the current beat instead of the player.
const BEATS = [
  ["Domus", "define a empresa inteira."],
  ["Relloo", "atende colado ao centro."],
  ["Magneto", "é o workflow que passa por tudo."],
  ["Tuner", "entrega em todo canal."],
  ["Knowly", "explica com a fonte junto."],
];
type ChainPlayer = HTMLElement & {
  seek?: (t: number) => void;
  pause?: () => void;
};

function Chain() {
  const film = motion.films.chain;
  const outer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const player = useRef<ChainPlayer | null>(null);
  const targetTime = useRef(film.segments[0]);
  const isReady = useRef(false);
  const frame = useRef(0);
  const [beat, setBeat] = useState(0);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const setPlayer = useCallback((el: ChainPlayer | null) => {
    player.current = el;
  }, []);

  // One seek per animation frame, to the time the scroll progress maps to
  const applySeek = useCallback(() => {
    frame.current = 0;
    if (isReady.current) player.current?.seek?.(targetTime.current);
  }, []);

  // Scroll progress of the tall section -> chain time and current beat
  useEffect(() => {
    const update = () => {
      const el = outer.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      // Each beat owns an equal share of the scroll and a segment of the film
      const scaled = p * BEATS.length;
      const i = Math.min(BEATS.length - 1, Math.floor(scaled));
      const seg = film.segments;
      targetTime.current = seg[i] + (scaled - i) * (seg[i + 1] - seg[i]);
      setBeat(i);
      if (!frame.current) frame.current = requestAnimationFrame(applySeek);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame.current);
    };
  }, [film.segments, applySeek]);

  // The stage joins the page controller like any other stage; its player starts paused and only seeks
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    return getController().register({
      id: "chain-stage",
      element,
      mount: () => {
        void ensurePlayer();
        setLive(true);
      },
      unmount: () => {
        isReady.current = false;
        setLive(false);
        setReady(false);
      },
      play: () => {},
      pause: () => player.current?.pause?.(),
    });
  }, []);

  // First frame exists: show the player and jump to the time of the current scroll position
  useEffect(() => {
    const el = player.current;
    if (!live || !el) return;
    const done = () => {
      isReady.current = true;
      setReady(true);
      el.pause?.();
      el.seek?.(targetTime.current);
    };
    if ((el as ChainPlayer & { ready?: boolean }).ready) queueMicrotask(done);
    el.addEventListener("ready", done);
    return () => el.removeEventListener("ready", done);
  }, [live]);

  return (
    <section
      id="cadeia"
      ref={outer}
      className={`${styles.band} ${styles.dark} ${styles.chain}`}
    >
      <div className={styles.chainSticky}>
        <div className={`${styles.wrap} ${styles.chainGrid}`}>
          <div className={styles.chainText}>
            <span className={styles.eyebrow}>A cadeia</span>
            <h2>Cinco produtos, um só caminho.</h2>
            <p className={styles.lead}>
              Role e veja cada um entrar na conversa.
            </p>
            <ol className={styles.beats}>
              {BEATS.map(([name, text], i) => (
                <li key={name} data-active={i === beat ? "true" : "false"}>
                  <strong>{name}</strong> {text}
                </li>
              ))}
            </ol>
          </div>
          <div
            ref={stage}
            className={styles.stage}
            data-live={live ? "true" : "false"}
            aria-hidden="true"
          >
            <img
              className={styles.stagePoster}
              src={film.beatPosters[beat]}
              alt=""
              width={1920}
              height={1080}
              decoding="async"
            />
            {live && (
              <hyperframes-player
                ref={setPlayer}
                src={film.src}
                width={1920}
                height={1080}
                muted
                tabIndex={-1}
                className={styles.stagePlayer}
                data-ready={ready ? "true" : "false"}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// SEÇÃO 6: A WELABS
// An institutional pause: the company opening in loop beside two lines of text, no product demo.
function About() {
  return (
    <section
      id="welabs"
      className={`${styles.band} ${styles.light} ${styles.about}`}
    >
      <div className={`${styles.wrap} ${styles.coreGrid}`}>
        <div className={styles.coreText}>
          <span className={styles.eyebrow}>Welabs</span>
          <h2>Uma empresa. Um ecossistema conectado.</h2>
          <p className={styles.lead}>
            Desenvolvemos nossos próprios produtos para gestão, relacionamento,
            automação e conhecimento, preservando o contexto de cada operação.
          </p>
        </div>
        <LiveStage
          id="welabs-intro"
          src={motion.intros.welabs.src}
          poster={motion.intros.welabs.poster}
        />
      </div>
    </section>
  );
}

// SEÇÃO 7: CTA E RODAPÉ
// The single call to action again, then the product table (logo and verb, weight order) and the closing line.
// No social networks: only links inside this site.
const FOOTER_PRODUCTS = [
  { id: "erp", file: "domus", name: "Domus", verb: "define" },
  { id: "welabs-crm", file: "relloo", name: "Relloo", verb: "atende" },
  { id: "flow", file: "magneto", name: "Magneto", verb: "workflow" },
  { id: "channels", file: "tuner", name: "Tuner", verb: "entrega" },
  { id: "wekb", file: "knowly", name: "Knowly", verb: "explica" },
];
function Closing() {
  return (
    <>
      <section
        id="contato"
        className={`${styles.band} ${styles.dark} ${styles.closing}`}
      >
        <div className={styles.wrap}>
          <h2>Sua empresa, num só fluxo.</h2>
          <p className={styles.lead}>{CTA_SUPPORT}</p>
          <a href={contactHref()} className={`${styles.cta} ${styles.ctaBig}`}>
            {CTA_LABEL}
          </a>
        </div>
      </section>
      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerGrid}`}>
          <div>
            <img
              src="/brands/welabs/welabs-logo-dark.svg"
              alt="Welabs"
              height={28}
            />
            <p className={styles.footerDesc}>
              Desenvolvemos produtos que conectam gestão, relacionamento,
              automação, canais e conhecimento.
            </p>
          </div>
          <ul className={styles.footerProducts}>
            {FOOTER_PRODUCTS.map((p) => (
              <li key={p.id}>
                <Link href={`/produtos/${publicSlug(p.id)}`}>
                  <img
                    src={`/brands/welabs/products/${p.file}-dark-endorsed.svg`}
                    alt={`${p.name} by Welabs`}
                    height={52}
                  />
                  <span>{p.verb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${styles.wrap} ${styles.footerBottom}`}>
          <p>© 2026 Welabs. Todos os direitos reservados.</p>
          <p>Os dados exibidos nos filmes são fictícios.</p>
          <Link href="/sobre">Sobre a Welabs</Link>
        </div>
      </footer>
    </>
  );
}

export function OnePage() {
  const paused = useSyncExternalStore(
    subscribePaused,
    getPausedSnapshot,
    getPausedServerSnapshot,
  );
  return (
    <div
      id="onepage-root"
      className={styles.page}
      data-motion={paused ? "paused" : "playing"}
    >
      <Header paused={paused} />
      <Hero />
      <CoreSection
        id="domus"
        tone="light"
        eyebrow="Domus"
        title="A empresa inteira numa casa."
        lead="Telas, regras e fluxos nascem do Domus. O que você define uma vez vale para a empresa inteira."
        intro={motion.intros.domus}
        clip={{ ...motion.films.domus, range: motion.films.domus.clip }}
      />
      <CoreSection
        id="relloo"
        tone="dark"
        flip
        eyebrow={
          <>
            Relloo
            <ByWelabs />
          </>
        }
        title="Do primeiro “oi” ao fechamento."
        lead="Atender e vender na mesma conversa. A pessoa chega por qualquer canal e segue com a história inteira, até o fechamento."
        intro={motion.intros.relloo}
        clip={{ ...motion.films.relloo, range: motion.films.relloo.clip }}
      />
      <Rails />
      <Chain />
      <About />
      <Closing />
    </div>
  );
}
