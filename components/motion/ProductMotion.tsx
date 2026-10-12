// QUADRO NARRATIVO DE PRODUTO
// Functional-page copy remains separate from this authored media plan, its ranges and its playback clock.
import type { CSSProperties } from "react";
import { getProductMotionPlan } from "@/lib/product-motion-plans";
import { productStorySlides } from "@/lib/motion-slides";
import type { ProductSlug } from "@/lib/products";
import { RingDriver } from "@/components/ring/RingDriver";
import { RingStage } from "@/components/ring/RingStage";
import { motionPhase, projectionVariables } from "@/components/ring/projection";
import ring from "@/components/ring/ring.module.css";
import styles from "./product-motion.module.css";
import { MobileProductMotion } from "./MobileProductMotion";

export type ProductMotionProps = {
  slug: ProductSlug;
  id: string;
  mode?: "overview" | "story";
};

export function ProductMotion({
  slug,
  id,
  mode = "overview",
}: ProductMotionProps) {
  const plan = getProductMotionPlan(slug);
  if (mode === "overview") {
    return (
      <>
        <div
          className={styles.overview}
          data-product-motion={slug}
          data-mode={mode}
          data-motion-plan={plan.id}
        >
          <div data-motion-viewport aria-hidden="true" inert>
            <RingStage
              id={id}
              kind="overview"
              slug={slug}
              presentation="single"
              clean={false}
              caption={false}
              navigation={false}
              eager
              label={plan.chapters[0].title}
            />
          </div>
        </div>
        <MobileProductMotion slug={slug} mode="overview" />
      </>
    );
  }
  const slides = productStorySlides(slug);
  return (
    <>
      <div
        id={id}
        className={`${ring.screen} ${ring.inline} ${styles.root} ${styles.story}`}
        role="region"
        aria-label={plan.title}
        data-product-motion={slug}
        data-mode={mode}
        data-motion-plan={plan.id}
        data-presentation="single"
        data-navigation="false"
        data-clean="false"
        data-kind="story"
        data-rotate="true"
        style={projectionVariables() as CSSProperties}
      >
        <div className={styles.visual}>
          <div
            className={`${ring.stage} ${styles.frame}`}
            data-ring="story"
            data-motion-viewport
            aria-hidden="true"
            inert
          >
            {slides.map((slide, index) => (
              <div
                key={slide.key}
                className={ring.tile}
                data-tile
                data-index={index}
                data-pos={index === 0 ? 0 : 1}
                data-near
                data-phase={motionPhase(slide.segments[0].id)}
                aria-hidden={index === 0 ? undefined : true}
              >
                <div className={ring.tileFrame}>
                  <div
                    className={ring.projection}
                    data-projection
                    data-motion-phase={
                      slide.posterPhase ?? motionPhase(slide.segments[0].id)
                    }
                    style={
                      projectionVariables(
                        slide.posterPieceId ?? slide.segments[0].id,
                      ) as CSSProperties
                    }
                  >
                    <img
                      data-poster
                      className={ring.poster}
                      src={slide.poster}
                      alt=""
                      width={960}
                      height={540}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className={ring.layers} data-layers />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.progress} aria-hidden="true">
            {plan.chapters.map((chapter, index) => (
              <span
                key={chapter.key}
                data-motion-chapter={chapter.key}
                data-chapter-index={index}
                data-current={index === 0 ? "true" : "false"}
              />
            ))}
          </div>
          <div className={styles.detail}>
            {plan.chapters.map((chapter, index) => (
              <div
                key={chapter.key}
                data-caption={chapter.key}
                data-caption-index={index}
                hidden={index !== 0}
              >
                <span className={styles.sequence}>
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(plan.chapters.length).padStart(2, "0")}
                </span>
                <h3>{chapter.title}</h3>
                <p>{chapter.body}</p>
                <p className={styles.scenario}>{chapter.scenario}</p>
              </div>
            ))}
          </div>
        </div>
        <RingDriver rootId={id} kind="story" slug={slug} />
      </div>
      <MobileProductMotion slug={slug} mode="story" />
    </>
  );
}
