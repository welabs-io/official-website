"use client";
// ABERTURA EM LÂMINAS
// The opening of the v4 home (brief-v4, artboard Main, 2026-10-23): the title with the word that turns and its caret,
// the line, two actions, and the stage where one frame per product assembles in blades. A cycle is 7 s per product, in
// the order of the turning word: the blades (17 x 3, canvas grey) leave in a cascade, right to left and bottom to top
// (~1.4 s), the frame holds, the blades come back and the stage stays empty a moment before the seal passes to the next
// product. The word of the title types again with each frame (the kit's TypeIn). The cycle is driven by the end of one
// CSS clock per frame (no timer, no effect): off screen the band's live marker pauses it with the rest, and under
// reduced motion there is no clock, so the stage stays on the Domus frame, settled, with no blades.
import { ArrowDown, CalendarDays } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { ActionButton } from "@/components/lib/ui";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { TypeIn } from "@/components/scene-kit/TypeIn";
import { HOME_HERO, HOME_INTRO } from "@/lib/content";
import { CTA_LABEL, productAlt, productLogo } from "@/lib/products";
import { ProductFrame } from "./frames";
import h from "./hero.module.css";

// Milliseconds of one product on the stage (artboard Main: 7 s per product)
export const HERO_CYCLE_MS = 7000;
// The blades: 17 columns over 3 bands, and their cascade (the in step per column and per band, the out start and step)
const COLS = 17;
const ROWS = 3;
const IN_COL_MS = 50;
const IN_ROW_MS = 150;
const OUT_AT_MS = 4400;
const OUT_COL_MS = 30;
const OUT_ROW_MS = 80;
// The threads that come down while the stage is empty (x as a share of the width, the length as a share of the height)
const THREADS = [
  { x: 0.03, h: 0.21 },
  { x: 0.09, h: 0.28 },
  { x: 0.15, h: 0.31 },
  { x: 0.21, h: 0.12 },
];

const BLADES = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  return {
    c,
    r,
    in: (COLS - 1 - c) * IN_COL_MS + (ROWS - 1 - r) * IN_ROW_MS,
    out: OUT_AT_MS + c * OUT_COL_MS + r * OUT_ROW_MS,
  };
});

export function HeroBlades() {
  const [index, setIndex] = useState(0);
  const words = HOME_INTRO.words;
  const { text, product } = words[index];
  const seal = HOME_HERO.seals[product];
  const next = () => setIndex((i) => (i + 1) % words.length);

  return (
    <div className={h.hero}>
      <div className={h.text}>
        <h1 className={h.title}>
          <span className={h.line}>{HOME_INTRO.before}</span>
          <span className={h.line} data-turn="">
            <TypeIn key={index} text={text} />
          </span>
          <span className={`${h.line} ${h.quiet}`}>{HOME_INTRO.after}.</span>
        </h1>
        <p className={h.lead}>{HOME_INTRO.lead}</p>
        <div className={h.actions}>
          <ActionButton
            href={CONTACT_HREF}
            emphasis="primary"
            size="md"
            icon={<CalendarDays />}
          >
            {CTA_LABEL}
          </ActionButton>
          <ActionButton
            href="/#products"
            emphasis="outline"
            size="md"
            icon={<ArrowDown />}
          >
            {HOME_HERO.see}
          </ActionButton>
        </div>
      </div>

      <div
        className={h.stage}
        data-hub="blades"
        data-product={product}
        style={{ "--cycle": `${HERO_CYCLE_MS}ms` } as CSSProperties}
      >
        <p className={h.caption}>
          <span>{HOME_HERO.caption}</span>
          <span className={h.count}>
            {index + 1} / {words.length}
          </span>
        </p>
        <div
          className={h.well}
          data-mini={`hero-${product}`}
          role="img"
          aria-label={`${seal.title}, ${seal.line}`}
        >
          <div key={`frame-${index}`} className={h.frame} aria-hidden="true">
            <ProductFrame slug={product} />
          </div>
          <div key={`blades-${index}`} className={h.blades} aria-hidden="true">
            {BLADES.map((b) => (
              <span
                key={`${b.c}-${b.r}`}
                className={h.blade}
                style={
                  {
                    "--in": `${b.in}ms`,
                    "--out": `${b.out}ms`,
                  } as CSSProperties
                }
              />
            ))}
            {THREADS.map((t) => (
              <span
                key={t.x}
                className={h.thread}
                style={{ "--x": t.x, "--h": t.h } as CSSProperties}
              />
            ))}
          </div>
          <div key={`seal-${index}`} className={h.seal} aria-hidden="true">
            <img
              src={productLogo(product, "dark", "row", 40)}
              alt=""
              width={1005}
              height={550}
              className={h.sealLogo}
            />
            <span className={h.sealRule} />
            <span className={h.sealText}>
              <span className={h.sealTitle}>{seal.title}</span>
              <span className={h.sealLine}>{seal.line}</span>
            </span>
          </div>
          {/* The clock of the frame: its end hands the stage to the next product */}
          <span
            key={`clock-${index}`}
            className={h.clock}
            onAnimationEnd={next}
            aria-hidden="true"
          />
        </div>
        <span data-mini-end="" hidden />
        <ul className={h.marks} aria-label={HOME_INTRO.stage}>
          {words.map((w, i) => (
            <li
              key={w.product}
              className={h.mark}
              data-active={i === index || undefined}
            >
              <img
                src={productLogo(w.product, "light", "row", 28)}
                // The first mention of the Domus on the home names its brand line (brand-config IDENTITY_PLACES)
                alt={productAlt(w.product, i === 0 ? "first-mention" : "row")}
                width={1005}
                height={550}
                className={h.markLogo}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
