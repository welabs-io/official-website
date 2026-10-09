"use client";
// SEÇÃO 5: CADEIA CONDUZIDA PELA ROLAGEM
// Five products in weight order, joined by amber links that fill as the page scrolls. Scrolling drives one number
// (--t, 0 to 4) written on the section; the rest is CSS. No timer, no player: with no scrolling nothing moves.
import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";
import { PRODUCTS, productLogo } from "@/lib/products";
import { Connector } from "./Connector";
import styles from "./chain.module.css";
import shell from "./shell.module.css";

export function Chain() {
  const section = useRef<HTMLElement>(null);
  const frame = useRef(0);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const update = () => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      // The chain is complete a little before the section ends, so the last product holds on screen
      el.style.setProperty("--t", String(Math.min(1, p / 0.85) * 4));
    };
    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame.current);
    };
  }, []);
  return (
    <section
      id="chain"
      ref={section}
      className={`${shell.band} ${shell.dark} ${styles.chain}`}
      aria-label="Cadeia de produtos"
    >
      <div className={styles.sticky}>
        <div className={styles.row}>
          {PRODUCTS.map((p, i) => (
            <Fragment key={p.slug}>
              {i > 0 && (
                <span
                  className={styles.link}
                  style={{ "--j": i - 1 } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <i className={styles.fill} />
                </span>
              )}
              <Link
                href={`/products/${p.slug}`}
                className={styles.node}
                style={{ "--i": i } as React.CSSProperties}
                aria-label={`${p.name} by Welabs`}
              >
                <img
                  src={productLogo(p.slug, "dark")}
                  alt=""
                  width={1005}
                  height={550}
                />
              </Link>
            </Fragment>
          ))}
        </div>
      </div>
      <Connector />
    </section>
  );
}
