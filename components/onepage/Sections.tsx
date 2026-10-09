// SEÇÕES DE PRODUTO DA PÁGINA ÚNICA
// Each section is the product block (logo with seal, one factual line) next to the product's own motion, and ends with
// the amber connector that reaches into the next section.
import { ABOUT_LINE, WELABS_LOGO } from "@/lib/products";
import {
  CLIENT_LOGOS,
  CLIENTS_LABEL,
  PLATFORM_LOGOS,
  PLATFORMS_LABEL,
} from "@/lib/partners";
import { AboutMotion } from "./AboutMotion";
import { Carousel } from "./Carousel";
import { Connector } from "./Connector";
import { DomusMotion } from "./DomusMotion";
import { KnowlyMotion } from "./KnowlyMotion";
import { MagnetoMotion } from "./MagnetoMotion";
import { MotionStage } from "./MotionStage";
import { TunerMotion } from "./TunerMotion";
import { ProductBlock } from "./ProductBlock";
import { RellooMotion } from "./RellooMotion";
import about from "./about.module.css";
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

// SEÇÃO 6: A WELABS
// Company logo and one line beside the orbit of the five products; below, the two black-and-white carousels
// (the third-party logos the Imagine site already shows, and the infra and dev platforms we use).
export function AboutSection() {
  return (
    <section
      id="about"
      className={`${shell.band} ${shell.light} ${about.about}`}
    >
      <div className={shell.wrap}>
        <div className={shell.block}>
          <div className={shell.blockText}>
            <h2 style={{ margin: 0, lineHeight: 0 }}>
              <img
                className={about.welabsLogo}
                src={WELABS_LOGO.light}
                alt="Welabs"
              />
            </h2>
            <p className={shell.line}>{ABOUT_LINE}</p>
          </div>
          <MotionStage id="about" className={shell.stage}>
            <AboutMotion />
          </MotionStage>
        </div>
        <Carousel
          label={CLIENTS_LABEL}
          logos={CLIENT_LOGOS}
          kind="clients"
          seconds={40}
        />
        <Carousel
          label={PLATFORMS_LABEL}
          logos={PLATFORM_LOGOS}
          kind="platforms"
          seconds={60}
        />
      </div>
      <Connector />
    </section>
  );
}
