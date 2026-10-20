// CENA NATIVA PARADA (VITRINE)
// One native scene of the story drawn once, in its settled frame: the outcomes of the home ("O que muda na operação")
// reuse the screens (SceneBody) with no clock and no client code. It is an illustration:
// hidden from assistive technology, and marked `data-mini` so the word counters treat its interface text as interface,
// not as copy (the copy rules still read it). The size comes from the container: the scene answers to the width of its
// frame (wide, tablet and phone layouts), and the frame changes its aspect ratio with that width.
import { SCRIPT } from "@/lib/scenes/script";
import type { SceneId } from "@/lib/scenes/types";
import { SceneBody } from "./SceneBody";
import "./fx.css";
import styles from "./mini-scene.module.css";

export function MiniScene({
  id,
  className,
  phone = false,
}: {
  id: SceneId;
  className?: string;
  // Draw the phone layout (7:10) whatever the width, for cards narrower than 34 rem
  phone?: boolean;
}) {
  const scene = SCRIPT.find((s) => s.id === id)!;
  return (
    <>
      <div
        className={`${styles.holder} ${className ?? ""}`}
        data-mini={id}
        aria-hidden="true"
      >
        <div className={styles.frame} data-phone={phone ? "" : undefined}>
          <SceneBody scene={scene} phase="end" />
        </div>
      </div>
      {/* End marker of the block above, for the counters that cut it out of the copy */}
      <span data-mini-end="" hidden />
    </>
  );
}
