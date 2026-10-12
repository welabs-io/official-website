// PALCO OPERACIONAL DA WELABS
// Existing product motions live inside one persistent architecture; native labels retain legibility at every viewport.
import Link from "next/link";
import { RingStage } from "@/components/ring/RingStage";
import { productLogo, type ProductSlug } from "@/lib/products";
import { ArchitecturePaths } from "./ArchitecturePaths";
import styles from "./home.module.css";

const rails: { slug: ProductSlug; label: string }[] = [
  { slug: "tuner", label: "Canais e conversas" },
  { slug: "magneto", label: "Workflows" },
  { slug: "knowly", label: "Conhecimento" },
];

export function HeroStage() {
  return (
    <div
      className={styles.heroStage}
      role="group"
      data-live
      data-on="false"
      aria-label="Domus e Relloo no núcleo; canais, workflows e conhecimento ligados à operação"
    >
      <ArchitecturePaths />
      <div className={styles.coreWindows}>
        <div
          className={`${styles.productWindow} ${styles.domusWindow}`}
          data-architecture-node="domus"
        >
          <div className={styles.windowHeader}>
            <img
              src={productLogo("domus", "dark")}
              alt="Domus"
              width={110}
              height={60}
            />
            <span>Gestão da empresa</span>
          </div>
          <div className={styles.windowMotion}>
            <RingStage
              id="hero-domus"
              kind="preview"
              slug="domus"
              presentation="single"
              clean
              eager
              caption={false}
              navigation={false}
              label="A empresa inteira no Domus"
            />
          </div>
          <div className={styles.moduleTray}>
            <span>Financeiro</span>
            <span>Operações</span>
            <span>Pessoas</span>
          </div>
        </div>
        <div
          className={`${styles.productWindow} ${styles.rellooWindow}`}
          data-architecture-node="relloo"
        >
          <div className={styles.windowHeader}>
            <img
              src={productLogo("relloo", "dark")}
              alt="Relloo"
              width={110}
              height={60}
            />
            <span>Relacionamento</span>
          </div>
          <div className={styles.windowMotion}>
            <RingStage
              id="hero-relloo"
              kind="preview"
              slug="relloo"
              presentation="single"
              clean
              caption={false}
              navigation={false}
              label="Relacionamento com histórico e contexto no Relloo"
            />
          </div>
          <p className={styles.windowContext}>Pessoa, conversa e histórico.</p>
        </div>
      </div>
      {rails.map(({ slug, label }) => (
        <Link
          href={`/products/${slug}`}
          key={slug}
          prefetch={false}
          className={`${styles.railNode} ${styles[slug]}`}
          data-architecture-node={slug}
        >
          <img
            src={productLogo(slug, "light")}
            alt={`${slug[0].toUpperCase()}${slug.slice(1)}`}
            width={110}
            height={60}
          />
          <span>{label}</span>
        </Link>
      ))}
      <div className={styles.stageNote}>
        <span className={styles.stageDot} />
        Domus e Relloo no núcleo da operação.
      </div>
    </div>
  );
}
