// PALCO DO CARROSSEL CIRCULAR (SERVIDOR)
// The whole carousel is plain server markup: one tile per slide with its cover images, and the optional row of product
// logos. RingDriver moves the tiles and the active caption in the DOM; content navigation stays independent from
// video playback, including reduced motion and a player that cannot load.
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  CUT_POSTERS,
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  heroSlides,
  previewSlides,
  productFilms,
  type Slide,
} from "@/lib/motion-slides";
import { PRODUCTS, productLogo, type ProductSlug } from "@/lib/products";
import { isNear, placeOf, ringPosition } from "./positions";
import { RingDriver, type RingKind } from "./RingDriver";
import {
  projectionVariables,
  motionPhase,
  type MotionPhase,
} from "./projection";
import styles from "./ring.module.css";

type Tile = {
  key: string;
  label: string;
  poster: string;
  endPoster?: string;
  slug?: ProductSlug;
  phase: MotionPhase;
  firstId: string;
  lastId: string;
};

// Products each cut of the chain shows (the same order as the tiles)
export const CHAIN_LIT: readonly (readonly ProductSlug[])[] =
  MONTAGE_SLIDES.flatMap((slide) =>
    slide.segments.map((segment) => segment.products ?? []),
  );

const chainTiles = (): Tile[] =>
  CUT_POSTERS.map((poster, i) => ({
    key: `cut-${i + 1}`,
    label: "Produtos em conjunto",
    poster,
    phase: "film",
    firstId: MONTAGE_SLIDES.flatMap((slide) => slide.segments)[i].id,
    lastId: MONTAGE_SLIDES.flatMap((slide) => slide.segments)[i].id,
  }));
const slideTiles = (slides: Slide[]): Tile[] =>
  slides.map(({ key, label, poster, endPoster, slug, segments }) => ({
    key,
    label,
    poster,
    endPoster,
    slug,
    phase: motionPhase(segments[0].id),
    firstId: segments[0].id,
    lastId: segments[segments.length - 1].id,
  }));

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
  // Film projection removes authored presentation chrome; identity openings remain complete and contained.
  clean?: boolean;
  // Automatic content rotation is separate from media playback; manual exploration can keep one film looping.
  rotate?: boolean;
  summaries?: Partial<Record<ProductSlug, string>>;
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
  clean = false,
  rotate = true,
  summaries,
  caption = kind === "products" || kind === "films",
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
          : kind === "preview"
            ? slideTiles(previewSlides(slug!))
            : slideTiles(heroSlides(slug!));
  const lit =
    kind === "chain" ? CHAIN_LIT[0] : [tiles[0]?.slug ?? PRODUCTS[0].slug];
  const projectionStyle = projectionVariables() as CSSProperties;
  const navigable =
    navigation && presentation === "carousel" && tiles.length > 1;
  // Institutional product navigation uses plain names; the authored identity stays in each complete opening.
  const textNavigation =
    id === "products-ring" && kind === "products" && logos === "links";
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
      data-clean={clean ? "true" : "false"}
      data-kind={kind}
      data-rotate={rotate ? "true" : "false"}
      data-summaries={kind === "products" && summaries ? "true" : "false"}
      data-text-navigation={textNavigation ? "true" : "false"}
      style={projectionStyle}
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
              data-phase={tile.phase}
              data-near={isNear(position) ? "" : undefined}
              aria-hidden={position === 0 ? undefined : true}
            >
              <div className={styles.tileFrame}>
                {tile.endPoster && (
                  <div
                    className={`${styles.projection} ${styles.endCover}`}
                    data-projection
                    data-motion-phase="film"
                    style={projectionVariables(tile.lastId) as CSSProperties}
                  >
                    <img
                      className={styles.posterEnd}
                      src={tile.endPoster}
                      alt=""
                      width={960}
                      height={540}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                <div
                  className={`${styles.projection} ${styles.firstCover}`}
                  data-projection
                  data-motion-phase={tile.phase}
                  style={projectionVariables(tile.firstId) as CSSProperties}
                >
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
                </div>
                <div className={styles.layers} data-layers />
              </div>
              {navigable && (
                <button
                  type="button"
                  className={styles.neighbor}
                  data-select={i}
                  tabIndex={-1}
                  aria-label={`Mostrar ${tile.label}`}
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
              {tiles.map((tile, index) => {
                const product = PRODUCTS.find(
                  (item) => item.slug === tile.slug,
                );
                return (
                  <div
                    key={tile.key}
                    data-caption={tile.slug ?? tile.key}
                    data-caption-index={index}
                    hidden={index !== 0}
                  >
                    <h3>{product?.name ?? "Welabs"}</h3>
                    <p>{kind === "products" ? product?.line : tile.label}</p>
                    {kind === "products" &&
                      tile.slug &&
                      summaries?.[tile.slug] && (
                        <p className={styles.summary}>{summaries[tile.slug]}</p>
                      )}
                    {kind === "products" && product && (
                      <Link href={`/products/${product.slug}`} prefetch={false}>
                        Conhecer produto
                      </Link>
                    )}
                  </div>
                );
              })}
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
                    {textNavigation ? (
                      <span className={styles.productName}>{name}</span>
                    ) : (
                      logo
                    )}
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
