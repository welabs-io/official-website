// SEÇÕES DA HOME (V2)
// The home of the v2 content: few words, the rest is motion the visitor plays. Server markup and CSS
// (v2.module.css); the only client piece is the drag shortcut of the message (DragToCheck). Every interaction works
// with no script and with a keyboard (a checkbox and its visible label), and under reduced motion shows its final frame.
import Link from "next/link";
import { CONTACT_HREF } from "@/components/onepage/contact";
import shell from "@/components/onepage/shell.module.css";
import { Glyph, GLYPHS, ROOM_GLYPHS } from "@/components/scenes/icons";
import { MiniScene } from "@/components/scenes/MiniScene";
import {
  CLOSING,
  DOMUS_ROOMS,
  HOME_CONTACT,
  HOME_DOMUS,
  HOME_EFFECTS,
  HOME_FIT,
  HOME_INTRO,
  HOME_MESSAGE,
  HOME_PRODUCTS,
} from "@/lib/content";
import { PLATFORM_LOGOS } from "@/lib/partners";
import {
  CTA_LABEL,
  LOGO_PAD,
  PRODUCTS,
  productAlt,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import { DragToCheck } from "./DragToCheck";
import { Orbit } from "./Orbit";
import { SectionHead } from "./SectionHead";
import styles from "./v2.module.css";

// Glyphs of the rooms: the shared line set of the scenes
const ROOM_D: Record<string, string> = {
  ...GLYPHS,
  box: ROOM_GLYPHS.Estoque,
  coin: ROOM_GLYPHS.Financeiro,
};

const logo = (slug: ProductSlug, height: number) => (
  <img
    src={productLogo(slug, "light", "row", height)}
    alt=""
    width={1005}
    height={550}
    style={{ height }}
  />
);

// ABERTURA
// Title with the word that turns (M1), one line, one button, and the stage of the five products that follows the word
// (I1). The h1 of the page is the title itself; the turning word is one line of its own, so nothing reflows.
export function HomeIntro() {
  const words = [...HOME_INTRO.words, HOME_INTRO.words[0]];
  return (
    <div className={`${shell.wrap} ${styles.intro}`}>
      <div className={styles.introText}>
        <h1 className={styles.introTitle}>
          {HOME_INTRO.before}{" "}
          <span className={styles.turn}>
            {/* The first word is the one read by assistive technology and by a still page */}
            <span className={styles.srOnly}>{HOME_INTRO.words[0].text}</span>
            <span className={styles.turnTrack} aria-hidden="true">
              {words.map((w, i) => (
                <span key={i} className={styles.turnWord}>
                  {w.text}
                </span>
              ))}
            </span>
          </span>{" "}
          {HOME_INTRO.after}
        </h1>
        <p className={styles.introLead}>{HOME_INTRO.lead}</p>
        <a href={CONTACT_HREF} className={`${shell.cta} ${shell.ctaBig}`}>
          {CTA_LABEL}
        </a>
      </div>
      <Orbit label={HOME_INTRO.stage} />
    </div>
  );
}

// ENCAIXE
// A film with no text (M7): the pieces arrive loose and fit into the Domus, the seam lighting amber on each fit. It plays
// once, when the band first comes on screen.
export function HomeFit() {
  const pieces: { slug: ProductSlug; side: "r" | "l" | "t" | "b" }[] = [
    { slug: "relloo", side: "r" },
    { slug: "magneto", side: "t" },
    { slug: "tuner", side: "b" },
    { slug: "knowly", side: "l" },
  ];
  return (
    <div className={shell.wrap}>
      <div className={styles.fit} role="img" aria-label={HOME_FIT.label}>
        <span className={`${styles.piece} ${styles.pieceCore}`}>
          <img
            src={productLogo("domus", "dark", "row")}
            alt=""
            width={1005}
            height={550}
          />
        </span>
        {pieces.map(({ slug, side }, i) => (
          <span
            key={slug}
            className={styles.piece}
            data-side={side}
            data-p={slug}
            style={{ "--i": i } as React.CSSProperties}
          >
            {logo(slug, 30)}
          </span>
        ))}
      </div>
    </div>
  );
}

// A MENSAGEM QUE ATRAVESSA
// I2: the visitor drags the message onto the track (or presses the button); it walks through the five products, each
// one lighting with the stamp of its effect, and the phone on the right gets the confirmation.
export function HomeMessage() {
  return (
    <div className={shell.wrap}>
      <SectionHead title={HOME_MESSAGE.title} lead={HOME_MESSAGE.lead} />
      <div className={styles.msg}>
        <input
          type="checkbox"
          id="msg-go"
          className={styles.toggle}
          aria-describedby="msg-track"
        />
        <DragToCheck
          inputId="msg-go"
          targetId="msg-track"
          className={styles.bubble}
        >
          <small>{HOME_MESSAGE.bubble.channel}</small>
          {HOME_MESSAGE.bubble.text}
        </DragToCheck>
        <ol id="msg-track" className={styles.track}>
          <li className={styles.rail} aria-hidden="true">
            <span className={styles.run} />
            <span className={styles.token} />
          </li>
          {HOME_MESSAGE.stations.map(({ product, label }, i) => (
            <li
              key={product}
              className={styles.station}
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className={styles.dot}>
                <img
                  src={productLogo(product, "light", "row", 16)}
                  alt={productAlt(product, "row")}
                  width={1005}
                  height={550}
                />
              </span>
              <span className={styles.label}>{label}</span>
            </li>
          ))}
        </ol>
        <div className={styles.phone} aria-hidden="true">
          <span className={styles.phoneMsg}>
            <span className={styles.ok} />
            {HOME_MESSAGE.done}
          </span>
        </div>
        <label htmlFor="msg-go" className={styles.go}>
          <span data-off>{HOME_MESSAGE.send}</span>
          <span data-on>{HOME_MESSAGE.again}</span>
        </label>
      </div>
    </div>
  );
}

// A CASA DO DOMUS
// The whole management of the company as the rooms of one house, tax and PIX only as a tag; "+ Sua área" makes a new
// room (I3) and the rooms light one after the other. The other four products stand on its ground.
export function DomusHouse({
  id,
  title,
  lead,
}: {
  // Id of the checkbox: the home and the Domus page are mounted together on /products/domus
  id: string;
  title: string;
  lead: string;
}) {
  return (
    <div className={styles.house}>
      <SectionHead title={title} lead={lead} />
      <input
        type="checkbox"
        id={id}
        className={styles.toggle}
        aria-label={HOME_DOMUS.addLabel}
      />
      <div className={styles.roof} aria-hidden="true" />
      <ul className={styles.rooms}>
        {DOMUS_ROOMS.map((room, i) => (
          <li
            key={room.name}
            className={styles.room}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className={styles.roomIcon}>
              <Glyph d={ROOM_D[room.glyph]} size={18} />
            </span>
            {room.name}
            {room.tag && <b className={styles.tag}>{room.tag}</b>}
          </li>
        ))}
        {/* The dashed room is the button; once pressed it is the new room (pressing it again takes it back) */}
        <li>
          <label htmlFor={id} className={styles.roomAdd}>
            <span data-off>
              <Glyph d={GLYPHS.plus} size={18} />
              {HOME_DOMUS.add}
            </span>
            <span data-on>
              <span className={styles.roomIcon}>
                <Glyph d={GLYPHS.pen} size={18} />
              </span>
              {HOME_DOMUS.born}
            </span>
          </label>
        </li>
      </ul>
    </div>
  );
}

export function HomeDomus() {
  return (
    <div className={shell.wrap}>
      <DomusHouse
        id="area-add"
        title={HOME_DOMUS.title}
        lead={HOME_DOMUS.lead}
      />
      <ul className={styles.ground} aria-label={HOME_DOMUS.ground}>
        {PRODUCTS.filter((p) => p.slug !== "domus").map(({ slug }) => (
          <li key={slug}>
            <Link href={`/products/${slug}`} prefetch={false}>
              <img
                src={productLogo(slug, "light", "row", 20)}
                alt={productAlt(slug, "row")}
                width={1005}
                height={550}
              />
            </Link>
          </li>
        ))}
      </ul>
      <p className={styles.more}>
        <Link href="/products/domus" prefetch={false} className={styles.link}>
          {HOME_DOMUS.more}
        </Link>
      </p>
    </div>
  );
}

// OS CINCO PRODUTOS
// The cards the descent grows into a product (`data-card`, components/onepage/Descent.tsx): logo and a line of 3 to 4
// words. The Domus is the graphite card.
export function FiveProducts() {
  return (
    <div className={shell.wrap}>
      <SectionHead title={HOME_PRODUCTS.title} />
      <ul className={styles.five}>
        {PRODUCTS.map(({ slug, line }) => (
          <li key={slug} data-main={slug === "domus" ? "" : undefined}>
            <Link
              href={`/products/${slug}`}
              prefetch={false}
              className={styles.card}
              data-card={slug}
            >
              <img
                className={styles.cardLogo}
                src={productLogo(slug, slug === "domus" ? "dark" : "light", "row")}
                alt={productAlt(slug, "row")}
                width={1005}
                height={550}
                style={{ "--pad": LOGO_PAD[slug] } as React.CSSProperties}
              />
              <span className={styles.cardLine}>{line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// O QUE MUDA NA OPERAÇÃO
// The settled frame of three native scenes, the outcome only, each with a short caption
export function HomeEffects() {
  return (
    <div className={shell.wrap}>
      <SectionHead title={HOME_EFFECTS.title} />
      <ul className={styles.effects}>
        {HOME_EFFECTS.items.map(({ scene, text }) => (
          <li key={scene}>
            <div className={styles.shot}>
              <MiniScene id={scene} phone />
            </div>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// CONTATO
// The open questions (no answers: they are the reason to talk) and the button, the only way in
export function ContactBand({
  title,
  asks,
}: {
  title: string;
  asks: readonly string[];
}) {
  return (
    <div className={`${shell.wrap} ${styles.contact}`}>
      <h2 className={styles.contactTitle}>{title}</h2>
      <ul className={styles.asks} aria-label={HOME_CONTACT.asksLabel}>
        {asks.map((ask) => (
          <li key={ask}>{ask}</li>
        ))}
      </ul>
      <a href={CONTACT_HREF} className={styles.contactCta}>
        {CTA_LABEL}
      </a>
    </div>
  );
}

export const HomeContact = () => (
  <ContactBand title={HOME_CONTACT.title} asks={HOME_CONTACT.asks} />
);

// ONDE RODAMOS
// The platform marks, each with its name under it
export function Platforms() {
  return (
    <div className={`${shell.wrap} ${styles.platforms}`}>
      <h2 className={styles.platformsTitle}>{CLOSING.platforms}</h2>
      <ul className={styles.plat}>
        {PLATFORM_LOGOS.map((p) => (
          <li key={p.name}>
            <img
              src={p.src}
              alt=""
              height={24}
              loading="lazy"
              decoding="async"
            />
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
