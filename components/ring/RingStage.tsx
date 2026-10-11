// PALCO DO CARROSSEL CIRCULAR (SERVIDOR)
// The whole carousel is plain server markup: one tile per slide with its cover images, and the optional row of product
// logos. RingDriver moves the tiles and the active caption in the DOM; content navigation stays independent from
// video playback, including reduced motion and a player that cannot load.
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
  presentation?: "carousel" | "single";
  caption?: boolean;
  navigation?: boolean;
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
  presentation = "carousel",
  caption = kind === "products",
  navigation = kind === "products" || kind === "films",
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
  const navigable =
    navigation && presentation === "carousel" && tiles.length > 1;
  return (
    <div
      id={id}
      className={
        fullscreen ? styles.screen : `${styles.screen} ${styles.inline}`
      }
      role="region"
      aria-label={label}
      aria-roledescription={navigable ? "carrossel" : undefined}
      tabIndex={navigable ? 0 : undefined}
      data-presentation={presentation}
      data-navigation={navigable ? "true" : "false"}
      data-tone={tone}
    >
      <div className={styles.stage} data-ring={kind}>
        {tiles.map((tile, i) => {
          const position = ringPosition(i, 0, tiles.length);
          return (
            <div
              key={tile.key}
              className={styles.tile}
              data-tile
              data-index={i}
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
                  data-poster
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
              {navigable && (
                <button
                  type="button"
                  className={styles.neighbor}
                  data-select={i}
                  tabIndex={-1}
                  aria-label={`Mostrar ${kind === "products" ? PRODUCTS[i].name : `filme ${i + 1}`}`}
                />
              )}
            </div>
          );
        })}
      </div>
      {(caption || navigable) && (
        <div className={styles.navigation}>
          {navigable && (
            <button
              type="button"
              className={styles.arrow}
              data-step="-1"
              aria-label={
                kind === "films" ? "Filme anterior" : "Produto anterior"
              }
              aria-controls={id}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m14 6-6 6 6 6M8 12h12" />
              </svg>
            </button>
          )}
          {caption && (
            <div className={styles.caption}>
              {PRODUCTS.map((product, index) => (
                <div
                  key={product.slug}
                  data-caption={product.slug}
                  hidden={index !== 0}
                >
                  <h3>{product.name}</h3>
                  <p>{product.line}</p>
                  <Link href={`/products/${product.slug}`} prefetch={false}>
                    Conhecer produto
                  </Link>
                </div>
              ))}
            </div>
          )}
          {navigable && (
            <button
              type="button"
              className={styles.arrow}
              data-step="1"
              aria-label={
                kind === "films" ? "Próximo filme" : "Próximo produto"
              }
              aria-controls={id}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m10 6 6 6-6 6M16 12H4" />
              </svg>
            </button>
          )}
        </div>
      )}
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
                  <button
                    type="button"
                    data-product={product}
                    aria-label={`Mostrar ${name}`}
                    aria-pressed={lit.includes(product)}
                    aria-controls={id}
                  >
                    {logo}
                  </button>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      )}
      {navigable && (
        <span className={styles.srOnly} data-announcement aria-live="polite" />
      )}
      <RingDriver rootId={id} kind={kind} slug={slug} />
    </div>
  );
}
