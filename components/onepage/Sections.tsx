// SEÇÕES DE PRODUTO DA PÁGINA ÚNICA
// Each section is the product block (logo with seal, one factual line) next to the product's own motion, and ends with
// the amber connector that reaches into the next section.
import { Connector } from "./Connector";
import { DomusMotion } from "./DomusMotion";
import { KnowlyMotion } from "./KnowlyMotion";
import { MagnetoMotion } from "./MagnetoMotion";
import { MotionStage } from "./MotionStage";
import { TunerMotion } from "./TunerMotion";
import { ProductBlock } from "./ProductBlock";
import { RellooMotion } from "./RellooMotion";
import shell from "./shell.module.css";

// SEÇÃO 2: DOMUS
export function DomusSection() {
  return (
    <section id="domus" className={`${shell.band} ${shell.light}`}>
      <div className={shell.wrap}>
        <ProductBlock slug="domus" tone="light">
          <MotionStage id="domus" className={shell.stage}>
            <DomusMotion />
          </MotionStage>
        </ProductBlock>
      </div>
      <Connector />
    </section>
  );
}

// SEÇÃO 3: RELLOO
export function RellooSection() {
  return (
    <section id="relloo" className={`${shell.band} ${shell.dark}`}>
      <div className={shell.wrap}>
        <ProductBlock slug="relloo" tone="dark" flip>
          <MotionStage id="relloo" className={shell.stage}>
            <RellooMotion />
          </MotionStage>
        </ProductBlock>
      </div>
      <Connector />
    </section>
  );
}

// SEÇÃO 4: TRILHOS (MAGNETO, TUNER, KNOWLY)
const RAILS = [
  { slug: "magneto", Motion: MagnetoMotion, flip: false },
  { slug: "tuner", Motion: TunerMotion, flip: true },
  { slug: "knowly", Motion: KnowlyMotion, flip: false },
] as const;

export function RailsSection() {
  return (
    <section
      id="rails"
      className={`${shell.band} ${shell.light} ${shell.rails}`}
    >
      <span className={shell.railBar} aria-hidden="true" />
      <div className={shell.wrap}>
        {RAILS.map(({ slug, Motion, flip }) => (
          <ProductBlock key={slug} slug={slug} tone="light" flip={flip}>
            <MotionStage id={slug} className={shell.stage}>
              <Motion />
            </MotionStage>
          </ProductBlock>
        ))}
      </div>
      <Connector />
    </section>
  );
}
