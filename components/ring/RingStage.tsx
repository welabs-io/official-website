// PALCO DO CARROSSEL CIRCULAR (SERVIDOR)
// The whole carousel is plain server markup: one tile per slide with its cover images, and the optional row of product
// logos. Nothing here hydrates. RingDriver (the only client piece) finds the stage by id once it is near the screen and
// moves the tiles by changing `data-pos`, so no player, no playback code and no state ship with the first paint.
import { LogoRow } from "@/components/template/LogoRow";
import type { Cover } from "@/lib/manifest/types";
import { ringData, slidesOf, type RingKind } from "@/lib/ring-data";
import type { ProductSlug } from "@/lib/products";
import { coverShown, isNear, placeOf, ringPosition } from "./positions";
import { RingDriver } from "./RingDriver";
import "./rotation.css";
import styles from "./ring.module.css";

// Covers come in two widths (the manifest's 1280 and 640): a phone shows a tile of about 330 px and never needs 1280
const coverSet = (c: Cover) => `${c.w640} 640w, ${c.w1280} 1280w`;
// On a desktop the cover is a still seen at the edge (neighbours at half scale) or for the instant before the player
// paints, so 480 px picks the 640 px file on a 1x screen and the 1280 px one only from 2x; a phone takes the wrap
const COVER_SIZES = "(max-width: 860px) 100vw, 480px";

export type RingProps = {
  id: string;
  kind: RingKind;
  slug?: ProductSlug;
  // The stage fills the screen (the workbench) instead of sitting in the flow of the page
  fullscreen?: boolean;
  // First paint: the active cover is the largest image of the page, so it loads at once; below the fold it is lazy
  eager?: boolean;
  // Row of product logos under the stage: lit by the cut (chain) or by the product, with links (products)
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
  const slides = slidesOf(kind, slug);
  const data = ringData(kind, slug);
  return (
    <div
      id={id}
      className={
        fullscreen ? styles.screen : `${styles.screen} ${styles.inline}`
      }
      data-tone={tone}
      role="region"
      aria-label={label}
    >
      <div className={styles.stage} data-ring={kind}>
        {slides.map((slide, i) => {
          const position = ringPosition(i, 0, slides.length);
          return (
            <div
              key={slide.key}
              className={styles.tile}
              data-pos={placeOf(position)}
              data-near={isNear(position) ? "" : undefined}
              role="group"
              aria-label={slide.label}
              aria-hidden={position === 0 ? undefined : true}
            >
              <div className={styles.tileFrame}>
                {slide.endCover && (
                  <img
                    className={styles.posterEnd}
                    src={slide.endCover.w1280}
                    srcSet={coverSet(slide.endCover)}
                    sizes={COVER_SIZES}
                    alt=""
                    width={1280}
                    height={720}
                    data-cover="end"
                    loading={
                      eager && coverShown(position, "end", true)
                        ? "eager"
                        : "lazy"
                    }
                    decoding="async"
                  />
                )}
                <img
                  className={styles.poster}
                  src={slide.cover.w1280}
                  srcSet={coverSet(slide.cover)}
                  sizes={COVER_SIZES}
                  alt=""
                  width={1280}
                  height={720}
                  data-cover="start"
                  loading={
                    eager && coverShown(position, "start", !!slide.endCover)
                      ? "eager"
                      : "lazy"
                  }
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
        <LogoRow
          mode={logos === "lit" ? "connection" : "active"}
          tone={tone}
          lit={data.lit[0] as ProductSlug[]}
          span={data.spans[0]}
          label={data.labels[0]}
          links={logos !== "lit"}
        />
      )}
      {/* What ring-run plays, so the lazy chunk reads the DOM instead of importing the manifest */}
      <script
        type="application/json"
        data-ring-data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
      />
      <RingDriver rootId={id} kind={kind} />
    </div>
  );
}
