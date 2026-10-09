"use client";
// SEÇÃO 3: PRODUTOS
// The five products as a list of logos with the seal, the active one showing its factual line, beside a reel that plays
// each product's opening followed by a clip of its film and moves on to the next product on its own. Picking a logo
// switches by hand; the logo of the active product links to its page.
import { useState } from "react";
import Link from "next/link";
import { PRODUCT_SLIDES } from "@/lib/motion-slides";
import { LOGO_PAD, PRODUCTS, productLogo } from "@/lib/products";
import { Reel } from "./Reel";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export function Products() {
  const [index, setIndex] = useState(0);
  return (
    <section
      id="products"
      className={`${shell.band} ${shell.dark} ${styles.products}`}
    >
      <h2 className={styles.srOnly}>Produtos</h2>
      <div className={`${shell.wrap} ${styles.productsGrid}`}>
        <ul className={styles.list}>
          {PRODUCTS.map((product, i) => {
            const active = i === index;
            const logo = (
              <img
                src={productLogo(product.slug, "dark")}
                alt={`${product.name} by Welabs`}
                width={1005}
                height={550}
                className={styles.listLogo}
                style={
                  { "--pad": LOGO_PAD[product.slug] } as React.CSSProperties
                }
              />
            );
            return (
              <li key={product.slug} data-active={active ? "true" : "false"}>
                {active ? (
                  <Link
                    href={`/products/${product.slug}`}
                    className={styles.listLink}
                    aria-label={`${product.name} by Welabs`}
                  >
                    {logo}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={styles.listLink}
                    onClick={() => setIndex(i)}
                    aria-label={`${product.name} by Welabs`}
                  >
                    {logo}
                  </button>
                )}
                {active && <p className={shell.line}>{product.line}</p>}
              </li>
            );
          })}
        </ul>
        <Reel
          id="products"
          slides={PRODUCT_SLIDES}
          index={index}
          onIndex={setIndex}
        />
      </div>
    </section>
  );
}
