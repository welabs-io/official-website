// PALCO DO CARROSSEL CIRCULAR (SERVIDOR)
// The whole carousel is plain server markup: one tile per slide with its cover images, and the optional row of product
// logos. Nothing here hydrates. RingDriver (the only client piece) finds the stage by id once it is near the screen and
// moves the tiles by changing `data-pos`, so no player, no playback code and no state ship with the first paint.
import Link from "next/link";
import {
  CUT_POSTERS,
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  productFilms,
  type Slide,
} from "@/lib/motion-slides";
import { PRODUCTS, productLogo, type ProductSlug } from "@/lib/products";
import { isNear, placeOf, ringPosition } from "./positions";
import { RingDriver, type RingKind } from "./RingDriver";
import styles from "./ring.module.css";

type Tile = { key: string; poster: string; endPoster?: string };

// Products each cut of the chain shows (the same order as the tiles)
export const CHAIN_LIT: readonly (readonly ProductSlug[])[] =
  MONTAGE_SLIDES.flatMap((slide) =>
    slide.segments.map((segment) => segment.products ?? []),
  );

const chainTiles = (): Tile[] =>
  CUT_POSTERS.map((poster, i) => ({ key: `cut-${i + 1}`, poster }));
const slideTiles = (slides: Slide[]): Tile[] =>
  slides.map(({ key, poster, endPoster }) => ({ key, poster, endPoster }));

export type RingProps = {
  id: string;
  kind: RingKind;
  slug?: ProductSlug;
  // The stage fills the screen (the workbench) instead of sitting in the flow of the page
  fullscreen?: boolean;
  // First paint: the active cover is the largest image of the page, so it loads at once; below the fold it is lazy
  eager?: boolean;
  // Row of product logos under the stage: lit by the cut (chain) or by the product (links on the home)
  logos?: "lit" | "links" | null;
  // Theme of the logo files: the one of the band the stage sits on
  tone?: "dark" | "light";
  label: string;
};

export function RingStage({
  id,
  kind,
  slug,
  fullscreen = false,
  eager = false,
  logos = null,
  tone = "dark",
  label,
}: RingProps) {
  const tiles =
    kind === "chain"
      ? chainTiles()
      : kind === "products"
        ? slideTiles(PRODUCT_SLIDES)
        : kind === "films"
          ? slideTiles(productFilms(slug!))
          : slideTiles(PRODUCT_SLIDES.filter((slide) => slide.slug === slug));
  const lit = kind === "chain" ? CHAIN_LIT[0] : [PRODUCTS[0].slug];
  return (
    <div
      id={id}
      className={
        fullscreen ? styles.screen : `${styles.screen} ${styles.inline}`
      }
      role="region"
      aria-label={label}
    >
      <div className={styles.stage} data-ring={kind}>
        {tiles.map((tile, i) => {
          const position = ringPosition(i, 0, tiles.length);
          return (
            <div
              key={tile.key}
              className={styles.tile}
              data-pos={placeOf(position)}
              data-near={isNear(position) ? "" : undefined}
              aria-hidden={position === 0 ? undefined : true}
            >
              <div className={styles.tileFrame}>
                {tile.endPoster && (
                  <img
                    className={styles.posterEnd}
                    src={tile.endPoster}
                    alt=""
                    width={960}
                    height={540}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <img
                  className={styles.poster}
                  src={tile.poster}
                  alt=""
                  width={960}
                  height={540}
                  loading={eager && position === 0 ? "eager" : "lazy"}
                  fetchPriority={eager && position === 0 ? "high" : undefined}
                  decoding="async"
                />
                <div className={styles.layers} data-layers />
              </div>
            </div>
          );
        })}
      </div>
      {logos && (
        <ul className={styles.products} aria-label="Produtos">
          {PRODUCTS.map(({ slug: product, name }) => {
            const logo = (
              <img
                src={productLogo(product, tone)}
                alt={logos === "lit" ? name : ""}
                height={28}
                width={51}
                loading="lazy"
                decoding="async"
              />
            );
            return (
              <li
                key={product}
                className={styles.product}
                data-slug={product}
                data-on={lit.includes(product) ? "true" : "false"}
              >
                {logos === "links" ? (
                  <Link
                    href={`/products/${product}`}
                    prefetch={false}
                    aria-label={`${name} by Welabs`}
                  >
                    {logo}
                  </Link>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      )}
      <RingDriver rootId={id} kind={kind} slug={slug} />
    </div>
  );
}
