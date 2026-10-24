// SEÇÕES DA HOME (V4)
// v4 (brief-v4, 2026-10-23): the home opens in blades (HeroBlades), the scroll walks the chain of one message across the
// five products (Chain) and the products band is the accordion whose panels gain width on hover (ProductAccordion);
// those three are the client pieces of components/home. The Domus with its modules and what changes left the home (the
// blades and the accordion show them). The Domus house stays here for the Domus page (Product.tsx); the contact and
// where we run are server markup and CSS (v2.module.css).
import { Badge, Card, CardContent, TextField } from "@/components/lib/ui";
import shell from "@/components/onepage/shell.module.css";
import { Glyph, GLYPHS, ROOM_GLYPHS } from "@/components/scenes/icons";
import { Chain } from "@/components/home/Chain";
import { HeroBlades } from "@/components/home/HeroBlades";
import { ProductAccordion } from "@/components/home/ProductAccordion";
import { domusModules, type Room } from "@/lib/content";
import { href, type I18n } from "@/lib/i18n/i18n";
import { PLATFORM_LOGOS } from "@/lib/partners";
import { SectionHead } from "./SectionHead";
import house from "./house.module.css";
import styles from "./v2.module.css";

// Glyphs of the rooms: the shared line set of the scenes
const ROOM_D: Record<string, string> = {
  ...GLYPHS,
  box: ROOM_GLYPHS.Estoque,
  coin: ROOM_GLYPHS.Financeiro,
};
// The leading icon of each field of the new module's screen, in the order of text.bornFields (Local, Data, Foto)
const BORN_FIELD_GLYPH = [GLYPHS.pin, GLYPHS.calendar, GLYPHS.image];

// ABERTURA
// v4: the title with the word that turns and its caret, the line, two actions and the stage in blades
// (components/home/HeroBlades.tsx). The h1 of the page is the title itself.
export function HomeIntro() {
  return (
    <div className={shell.wrap}>
      <HeroBlades />
    </div>
  );
}

// A MENSAGEM QUE ATRAVESSA
// v4: the chain the scroll walks (components/home/Chain.tsx), in place of the kit scene that played by itself
export function HomeMessage({ i18n }: { i18n: I18n }) {
  const { chain } = i18n.m.home;
  return (
    <div className={shell.wrap}>
      <SectionHead title={chain.title} lead={chain.lead} variant="chapter" />
      <Chain />
    </div>
  );
}

// OS CINCO PRODUTOS
// v4: the accordion of the five products (components/home/ProductAccordion.tsx), the Domus open at rest; each logo
// keeps `data-card`, the piece the descent grows into its product page
export function FiveProducts({ i18n }: { i18n: I18n }) {
  const { accordion } = i18n.m.home;
  return (
    <div className={shell.wrap}>
      <SectionHead
        title={accordion.title}
        lead={accordion.lead}
        variant="chapter"
      />
      <ProductAccordion />
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
    key={r.id}
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
  i18n,
  id,
  title,
  lead,
}: {
  i18n: I18n;
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
      <DomusHouseBody i18n={i18n} id={id} />
    </>
  );
}

function DomusHouseBody({ i18n, id }: { i18n: I18n; id: string }) {
  const text = i18n.m.home.domus;
  const modules = domusModules(i18n.m);
  return (
    <div className={house.house} data-theme="welabs">
      <input
        type="checkbox"
        id={id}
        className={styles.toggle}
        aria-label={text.addLabel}
      />
      <div className={house.frame}>
        <div className={house.floor}>
          <div className={house.floorHead}>
            <p className={house.floorName}>{text.standard}</p>
          </div>
          <ul className={house.rooms}>{modules.standard.map(room)}</ul>
        </div>
        <div className={house.floor} data-floor="custom">
          <div className={house.floorHead}>
            <p className={house.floorName}>{text.custom}</p>
            <label htmlFor={id} className={house.add} data-slot="button">
              <Glyph d={GLYPHS.plus} size={16} />
              {text.add}
            </label>
          </div>
          <ul className={house.rooms}>
            {modules.custom.map((r, i) => room(r, i + 10))}
            {/* The slot of the new module: the dashed place, the module born in it and the screen it opens */}
            <li className={house.slot} aria-label={text.born}>
              <span className={house.ghost} aria-hidden="true" />
              <span className={house.born}>
                <span className={house.seed} aria-hidden="true">
                  <Glyph d={GLYPHS.pen} size={18} />
                </span>
                <span className={house.name}>{text.born}</span>
                <Badge variant="neutral" className={house.seal}>
                  {text.bornTag}
                </Badge>
              </span>
              {/* The screen of the module: read-only fields out of the tab order (a drawing of a screen, not a form) */}
              <Card size="sm" className={house.screen}>
                <CardContent className={house.fields}>
                  {text.bornFields.map((f, i) => (
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
  i18n,
  title,
  asks,
  action,
}: {
  i18n: I18n;
  title: string;
  asks: readonly string[];
  action: ContactAction;
}) {
  return (
    <div className={`${shell.wrap} ${styles.contact}`}>
      <h2 className={styles.contactTitle}>{title}</h2>
      <ol className={styles.asks} aria-label={i18n.m.home.contact.asksLabel}>
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
const PRODUCTS_PATH = "/#products";

export const HomeContact = ({ i18n }: { i18n: I18n }) => {
  const { contact } = i18n.m.home;
  return (
    <ContactBand
      i18n={i18n}
      title={contact.title}
      asks={contact.asks}
      action={{
        href: href(i18n, PRODUCTS_PATH),
        label: contact.more,
        kind: "link",
      }}
    />
  );
};

// ONDE RODAMOS
// v3 (F1): the four clouds only, all marks at one height and in the token of their names (a CSS mask over the file's
// alpha, never its own colours); the width follows the `ratio` of what the mark shows (lib/partners.ts). One rule for
// the name: beside a pure symbol it shows, and a wordmark, which spells it already, keeps it for assistive technology.
export function Platforms({ i18n }: { i18n: I18n }) {
  return (
    <div className={`${shell.wrap} ${styles.platforms}`}>
      {/* v3 (F2): the strip head (h3 step) in place of a 15 px h2 that read as a fifth item of the row */}
      <SectionHead
        title={i18n.m.closing.platforms}
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
