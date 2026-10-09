// SEÇÕES DE PRODUTO DA PÁGINA ÚNICA
// Each section is the product block (logo with seal, one factual line) next to the product's own motion, and ends with
// the amber connector that reaches into the next section.
import { Connector } from "./Connector";
import { DomusMotion } from "./DomusMotion";
import { MotionStage } from "./MotionStage";
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
