"use client";
// ACORDEÃO DOS CINCO PRODUTOS
// The products band of the v4 home (brief-v4, artboards Accordion and AccordionMobile, 2026-10-23). At rest the Domus
// is open; a panel under the pointer or holding the focus gains width by flex-grow (the foundation's GrowRow and
// GrowItem, ~700 ms, never a scale) and shows its live frame, the others close to their logo, their glyph and their
// area. It never turns by itself. The logo of a panel is the link to the product page (`data-card`, the piece the
// descent grows from), so the keyboard opens a panel by reaching it. Each time a panel opens its frame mounts again,
// so the Relloo answer types anew. On a phone the panels stack and open one at a time by their "+" (the open one shows
// "×"); the width rule does not apply there (components/motion/motion.module.css).
import { CalendarDays, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState, type ReactElement } from "react";
import { GrowItem, GrowRow } from "@/components/motion/Grow";
import { ActionButton, Badge, IconButton } from "@/components/lib/ui";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { HOME_ACCORDION } from "@/lib/content";
import { CTA_LABEL, productAlt, productBySlug, productLogo, type ProductSlug } from "@/lib/products";
import { ProductFrame } from "./frames";
import a from "./accordion.module.css";

// The glyph of a closed panel, drawn on an 80 x 110 box (artboard Accordion), in the quiet grey
const GLYPHS: Record<ProductSlug, ReactElement> = {
  domus: (
    <>
      <rect x="4" y="8" width="10" height="10" rx="3" />
      <path d="M22 13 H72" />
      <rect x="4" y="34" width="10" height="10" rx="3" />
      <path d="M22 39 H62" />
      <rect x="4" y="60" width="10" height="10" rx="3" />
      <path d="M22 65 H68" />
      <rect x="4" y="86" width="72" height="16" rx="5" strokeDasharray="4 4" />
    </>
  ),
  relloo: (
    <>
      <rect x="2" y="6" width="54" height="20" rx="8" />
      <rect x="24" y="34" width="54" height="20" rx="8" data-fill="" />
      <path d="M8 86 H72" />
      <circle cx="8" cy="86" r="4" data-dot="" />
      <circle cx="29" cy="86" r="4" data-dot="" />
      <circle cx="51" cy="86" r="4" data-dot="faint" />
      <circle cx="72" cy="86" r="4" data-dot="faint" />
    </>
  ),
  magneto: (
    <>
      <path d="M40 10 C40 24 18 22 18 38" />
      <path d="M40 10 C40 24 62 22 62 38" />
      <path d="M18 38 C18 56 40 52 40 70" />
      <path d="M62 38 C62 56 40 52 40 70" />
      <path d="M40 70 C40 84 40 86 40 100" />
      <circle cx="40" cy="10" r="5" data-dot="" />
      <circle cx="18" cy="38" r="5" data-dot="" />
      <circle cx="62" cy="38" r="5" data-dot="" />
      <circle cx="40" cy="70" r="5" data-dot="" />
      <circle cx="40" cy="100" r="5" data-dot="faint" />
    </>
  ),
  tuner: (
    <>
      <path d="M10 55 C40 55 40 14 68 14" />
      <path d="M10 55 C40 55 40 41 68 41" />
      <path d="M10 55 C40 55 40 69 68 69" />
      <path d="M10 55 C40 55 40 96 68 96" />
      <circle cx="10" cy="55" r="5" data-dot="" />
      <circle cx="70" cy="14" r="4" data-dot="" />
      <circle cx="70" cy="41" r="4" data-dot="" />
      <circle cx="70" cy="69" r="4" data-dot="" />
      <circle cx="70" cy="96" r="4" data-dot="faint" />
    </>
  ),
  knowly: (
    <>
      <circle cx="40" cy="55" r="11" />
      <path d="M33 51 H47" />
      <path d="M33 59 H47" />
      <path d="M40 44 C36 30 22 26 12 18" />
      <path d="M50 50 C60 44 66 32 70 22" />
      <path d="M29 60 C20 66 14 76 10 88" />
      <path d="M48 64 C56 74 62 86 66 98" />
      <path d="M12 18 C30 10 52 12 70 22" />
      <path d="M10 88 C30 100 48 102 66 98" />
      <circle cx="12" cy="18" r="4" data-dot="" />
      <circle cx="70" cy="22" r="4" data-dot="" />
      <circle cx="10" cy="88" r="4" data-dot="" />
      <circle cx="66" cy="98" r="4" data-dot="faint" />
    </>
  ),
};

export function ProductAccordion() {
  // The panel whose frame plays (and how many times it opened, to mount the frame again), and the one open on a phone
  const [play, setPlay] = useState<{ slug: ProductSlug; n: number }>({ slug: "domus", n: 0 });
  const [phoneOpen, setPhoneOpen] = useState<ProductSlug>("domus");
  const open = (slug: ProductSlug) => setPlay((p) => (p.slug === slug ? p : { slug, n: p.n + 1 }));

  return (
    <GrowRow className={a.row} data-accordion="">
      {HOME_ACCORDION.panels.map((p, i) => {
        const name = productBySlug(p.slug)!.name;
        const phone = phoneOpen === p.slug;
        return (
          <GrowItem
            key={p.slug}
            grow="panel"
            open={p.slug === "domus"}
            className={a.panel}
            data-panel={p.slug}
            data-phone-open={phone || undefined}
            onPointerEnter={() => open(p.slug)}
            onFocus={() => open(p.slug)}
          >
            <div className={a.head}>
              <Link href={`/products/${p.slug}`} prefetch={false} className={a.logo} data-card={p.slug}>
                <img
                  src={productLogo(p.slug, "light", "row", 48)}
                  alt={productAlt(p.slug, "row")}
                  width={1005}
                  height={550}
                />
              </Link>
              <span className={a.phoneArea}>{p.area}</span>
              <span className={a.toggle}>
                <IconButton
                  icon={phone ? <X /> : <Plus />}
                  label={`${phone ? HOME_ACCORDION.close : HOME_ACCORDION.open} ${name}`}
                  emphasis="quiet"
                  aria-expanded={phone}
                  onClick={() => {
                    setPhoneOpen(p.slug);
                    open(p.slug);
                  }}
                />
              </span>
            </div>

            <div className={a.closed} aria-hidden="true">
              <svg viewBox="0 0 80 110" className={a.glyph}>
                {GLYPHS[p.slug]}
              </svg>
              <span className={a.area}>{p.area}</span>
              <span className={a.number}>{String(i + 1).padStart(2, "0")}</span>
            </div>

            <div className={a.open}>
              <div className={a.copy}>
                <h3 className={a.title}>{p.title}</h3>
                <p className={a.lead}>{p.lead}</p>
                <ul className={a.points}>
                  {p.points.map((point) => (
                    <li key={point}>
                      <Badge variant="secondary" appearance="solid">
                        {point}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <p className={a.question}>{p.question}</p>
                <ActionButton href={CONTACT_HREF} emphasis="primary" size="md" icon={<CalendarDays />} className={a.cta}>
                  {CTA_LABEL}
                </ActionButton>
              </div>
              <div className={a.well} data-mini={`panel-${p.slug}`}>
                {play.slug === p.slug || p.slug === "domus" ? (
                  <ProductFrame key={`${p.slug}-${play.slug === p.slug ? play.n : 0}`} slug={p.slug} />
                ) : null}
              </div>
              <span data-mini-end="" hidden />
            </div>
          </GrowItem>
        );
      })}
    </GrowRow>
  );
}
