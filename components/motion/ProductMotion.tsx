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
      <div
        className={styles.overview}
        data-product-motion={slug}
        data-mode={mode}
        data-motion-plan={plan.id}
      >
        <div data-motion-viewport aria-hidden="true">
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
    );
  }
  const slides = productStorySlides(slug);
  return (
    <div
      id={id}
      className={`${ring.screen} ${ring.inline} ${styles.root} ${styles.story}`}
      role="region"
      aria-label={plan.title}
      tabIndex={0}
      data-product-motion={slug}
      data-mode={mode}
      data-motion-plan={plan.id}
      data-presentation="single"
      data-navigation="true"
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
        <div className={styles.detail}>
          {plan.chapters.map((chapter, index) => (
            <div
              key={chapter.key}
              data-caption={chapter.key}
              data-caption-index={index}
              hidden={index !== 0}
            >
              <h3>{chapter.title}</h3>
              <p>{chapter.body}</p>
              <p className={styles.scenario}>{chapter.scenario}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.navigation}>
        <p className={styles.description}>{plan.description}</p>
        <ol className={styles.chapters} aria-label="Capítulos da demonstração">
          {plan.chapters.map((chapter, index) => (
            <li key={chapter.key}>
              <button
                type="button"
                className={styles.chapter}
                data-motion-chapter={chapter.key}
                data-select={index}
                data-current={index === 0 ? "true" : "false"}
                aria-pressed={index === 0}
                aria-controls={id}
              >
                <span className={styles.number} aria-hidden="true">
                  {index + 1}
                </span>
                <span>{chapter.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className={styles.next}
          data-step="1"
          aria-controls={id}
        >
          Próximo capítulo <span aria-hidden="true">›</span>
        </button>
      </div>
      <span className={ring.srOnly} data-announcement aria-live="polite" />
      <RingDriver rootId={id} kind="story" slug={slug} />
    </div>
  );
}
