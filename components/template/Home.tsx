// SEÇÕES DA HOME (V2)
// The home of the v2 content: few words, the rest is motion the visitor plays. Server markup and CSS
// (v2.module.css); v3 (2026-10-23): the message that crosses the products is a kit scene (SceneSlot), the only client
// piece. Every other interaction works with no script and with a keyboard (a checkbox and its visible label), and under
// reduced motion shows its final frame.
import Link from "next/link";
import { Badge, Card, CardContent, TextField } from "@/components/lib/ui";
import { CONTACT_HREF } from "@/components/onepage/contact";
import shell from "@/components/onepage/shell.module.css";
import { Glyph, GLYPHS, ROOM_GLYPHS } from "@/components/scenes/icons";
import { MiniScene } from "@/components/scenes/MiniScene";
import {
  CLOSING,
  DOMUS_MODULES,
  HOME_CONTACT,
  HOME_DOMUS,
  HOME_EFFECTS,
  HOME_INTRO,
  HOME_MESSAGE,
  HOME_PRODUCTS,
  type Room,
} from "@/lib/content";
import { PLATFORM_LOGOS } from "@/lib/partners";
import {
  CTA_LABEL,
  LOGO_PAD,
  PRODUCTS,
  productAlt,
  productLogo,
} from "@/lib/products";
import { SceneSlot } from "@/components/scene-kit/SceneSlot";
import { Orbit } from "./Orbit";
import { SectionHead } from "./SectionHead";
import house from "./house.module.css";
import styles from "./v2.module.css";

// Glyphs of the rooms: the shared line set of the scenes
const ROOM_D: Record<string, string> = {
  ...GLYPHS,
  box: ROOM_GLYPHS.Estoque,
  coin: ROOM_GLYPHS.Financeiro,
};
// The leading icon of each field of the new module's screen, in the order of HOME_DOMUS.bornFields (Local, Data, Foto)
const BORN_FIELD_GLYPH = [GLYPHS.pin, GLYPHS.calendar, GLYPHS.image];

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
          {/* data-mask: the box clips on purpose (only one word of the track shows), e2e/layout.spec.ts skips it */}
          <span className={styles.turn} data-mask>
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

// A MENSAGEM QUE ATRAVESSA
// v3 (2026-10-23): the chain of the home is the kit scene `home-message` (components/scene-kit/scenes/home-message.tsx,
// approved at /lab/scenes/home-message): a message from a channel crosses the five products and lands as the record of
// the order in the Domus. It plays by itself on screen, pauses off screen and settles under reduced motion (the kit's
// continuity); the drag-and-drop message of the v2 left with it.
export function HomeMessage() {
  return (
    <div className={shell.wrap}>
      <SectionHead
        title={HOME_MESSAGE.title}
        lead={HOME_MESSAGE.lead}
        variant="chapter"
      />
      <SceneSlot id="home-message" className={styles.kitScene} />
    </div>
  );
}

// O DOMUS E SEUS MÓDULOS
// The whole management of the company as the modules inside the Domus symbol, with tax and PIX only as a tag; the
// other four products stand under it.
// v2.1: the modules the ERP code really installs, on two floors: the standard ones (ERPNext and HRMS) and the ones
// made to measure (our own apps).
// Pilot of @imagineapps-team/react 0.18.0 (2026-10-21): the house with a roof became the rounded square of the Domus
// logo (public/brands/welabs/products/domus-light.svg: ring and amber square), a bit smaller, holding the same modules.
// The new module plays in a loop by itself: the dashed slot becomes "Vistorias" (its icon is the amber square of the
// logo) and its screen opens (the lib's Card and the site's TextField, each with its icon), then everything resets and the loop goes on.
// "+ Novo módulo" (a label over the checkbox) restarts the sequence from its first frame; it plays to the end, holds,
// resets and keeps looping, so no click leaves the block frozen. The tags, the seal and the screen are the real
// components of the lib (components/lib/ui.tsx is their client boundary), painted by its welabs theme (app/lib.css,
// data-theme="welabs" on the block).
const room = (r: Room, i: number) => (
  <li
    key={r.name}
    className={house.room}
    style={{ "--i": i } as React.CSSProperties}
  >
    <span className={house.icon}>
      <Glyph d={ROOM_D[r.glyph]} size={18} />
    </span>
    <span className={house.name}>{r.name}</span>
    {/* v3 (F2 review, F2-05): a sand tag (the secondary role, sand 100 in app/lib.css, ink text); the amber is for what
        happens, the module that is born. The neutral soft of the lib is the ink at 10 %, a cold grey on the white card */}
    {r.tag && (
      <Badge variant="secondary" appearance="solid" className={house.tag}>
        {r.tag}
      </Badge>
    )}
  </li>
);

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
    <>
      {/* v3 (F2 review, F2-04): the chapter head sits on the content edge of the page, like every chapter (inside the
          1040 px house it started 80 px in); the house stays narrower under it */}
      <SectionHead title={title} lead={lead} variant="chapter" />
      <DomusHouseBody id={id} />
    </>
  );
}

function DomusHouseBody({ id }: { id: string }) {
  return (
    <div className={house.house} data-theme="welabs">
      <input
        type="checkbox"
        id={id}
        className={styles.toggle}
        aria-label={HOME_DOMUS.addLabel}
      />
      <div className={house.frame}>
        <div className={house.floor}>
          <div className={house.floorHead}>
            <p className={house.floorName}>{HOME_DOMUS.standard}</p>
          </div>
          <ul className={house.rooms}>{DOMUS_MODULES.standard.map(room)}</ul>
        </div>
        <div className={house.floor} data-floor="custom">
          <div className={house.floorHead}>
            <p className={house.floorName}>{HOME_DOMUS.custom}</p>
            <label htmlFor={id} className={house.add} data-slot="button">
              <Glyph d={GLYPHS.plus} size={16} />
              {HOME_DOMUS.add}
            </label>
          </div>
          <ul className={house.rooms}>
            {DOMUS_MODULES.custom.map((r, i) => room(r, i + 10))}
            {/* The slot of the new module: the dashed place, the module born in it and the screen it opens */}
            <li className={house.slot} aria-label={HOME_DOMUS.born}>
              <span className={house.ghost} aria-hidden="true" />
              <span className={house.born}>
                <span className={house.seed} aria-hidden="true">
                  <Glyph d={GLYPHS.pen} size={18} />
                </span>
                <span className={house.name}>{HOME_DOMUS.born}</span>
                <Badge variant="neutral" className={house.seal}>
                  {HOME_DOMUS.bornTag}
                </Badge>
              </span>
              {/* The screen of the module: read-only fields out of the tab order (a drawing of a screen, not a form) */}
              <Card size="sm" className={house.screen}>
                <CardContent className={house.fields}>
                  {HOME_DOMUS.bornFields.map((f, i) => (
                    <TextField
                      key={f.label}
                      label={f.label}
                      icon={<Glyph d={BORN_FIELD_GLYPH[i]} size={16} />}
                      fieldClassName={house.field}
                      fieldStyle={{ "--i": i } as React.CSSProperties}
                      readOnly
                      tabIndex={-1}
                      value={f.value}
                      className={house.value}
                    />
                  ))}
                </CardContent>
              </Card>
            </li>
          </ul>
        </div>
      </div>
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
                src={productLogo(
                  slug,
                  slug === "domus" ? "dark" : "light",
                  "row",
                )}
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
// The open questions (no answers: they are the reason to talk) and one way out. v3 (F1): the questions are a numbered
// agenda of plain text, never shaped like a control (no box, no shadow, no pointer), and the band never links to
// itself: on a product page the action is the button to the contact of the home; on the home, where every button of the
// site lands, it is a link to the products band until the operator decides where a request goes (plano.md, 3.3).
export type ContactAction = {
  href: string;
  label: string;
  kind: "button" | "link";
};

export function ContactBand({
  title,
  asks,
  action,
}: {
  title: string;
  asks: readonly string[];
  action: ContactAction;
}) {
  return (
    <div className={`${shell.wrap} ${styles.contact}`}>
      <h2 className={styles.contactTitle}>{title}</h2>
      <ol className={styles.asks} aria-label={HOME_CONTACT.asksLabel}>
        {asks.map((ask) => (
          <li key={ask}>{ask}</li>
        ))}
      </ol>
      <a
        href={action.href}
        data-kind={action.kind}
        className={
          action.kind === "button"
            ? `${shell.cta} ${shell.ctaBig} ${styles.contactCta}`
            : `${styles.link} ${styles.contactCta}`
        }
      >
        {action.label}
      </a>
    </div>
  );
}

// The products band of the home, the way out of its contact (an anchor, as the menu and the old addresses use)
const PRODUCTS_HREF = "/#products";

export const HomeContact = () => (
  <ContactBand
    title={HOME_CONTACT.title}
    asks={HOME_CONTACT.asks}
    action={{ href: PRODUCTS_HREF, label: HOME_CONTACT.more, kind: "link" }}
  />
);

// ONDE RODAMOS
// v3 (F1): the four clouds only, all marks at one height and in the token of their names (a CSS mask over the file's
// alpha, never its own colours); the width follows the `ratio` of what the mark shows (lib/partners.ts). One rule for
// the name: beside a pure symbol it shows, and a wordmark, which spells it already, keeps it for assistive technology.
export function Platforms() {
  return (
    <div className={`${shell.wrap} ${styles.platforms}`}>
      {/* v3 (F2): the strip head (h3 step) in place of a 15 px h2 that read as a fifth item of the row */}
      <SectionHead
        title={CLOSING.platforms}
        variant="strip"
        className={styles.platformsHead}
      />
      <ul className={styles.plat}>
        {PLATFORM_LOGOS.map((p) => (
          <li key={p.name}>
            <span className={styles.slot}>
              <span
                className={styles.mark}
                data-symbol={p.symbol ? "" : undefined}
                style={
                  {
                    "--src": `url("${p.src}")`,
                    "--ratio": p.ratio,
                    "--scale": p.scale ?? 1,
                  } as React.CSSProperties
                }
              />
            </span>
            <span className={p.wordmark ? styles.srOnly : undefined}>
              {p.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
