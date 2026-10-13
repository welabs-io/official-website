// TEMPLATE DA PÁGINA ÚNICA
// Walks the section list of a PageConfig (lib/site-config.ts) and renders it inside the page frame: the same template
// serves the home and the five product pages. `Sections` is the part without the frame (header and footer), which the
// tests render on its own.
import { PageFrame } from "@/components/onepage/PageFrame";
import { ProductBlock } from "@/components/onepage/ProductBlock";
import home from "@/components/onepage/home.module.css";
import shell from "@/components/onepage/shell.module.css";
import { RingStage } from "@/components/ring/RingStage";
import { SceneStage } from "@/components/scenes/SceneStage";
import { HOME_INTRO, PAGE_HEADINGS } from "@/lib/content";
import { MANIFEST } from "@/lib/manifest";
import { ties } from "@/lib/manifest/select";
import { PRODUCTS } from "@/lib/products";
import type { PageConfig, SectionConfig } from "@/lib/site-config";
import { ChainOverview } from "./ChainOverview";
import { Closing } from "./Closing";
import {
  BandTitle,
  Capabilities,
  HubText,
  ProductCards,
  Resolves,
} from "./Content";
import { CoreHub } from "./CoreHub";
import { Section } from "./Section";

function Body({ section }: { section: SectionConfig }) {
  switch (section.kind) {
    // Opening, then the chain in two blocks: the overview on top and, joined to it by the connector, the ring that plays
    // the scene of the system the overview lights
    case "chain": {
      const { ring, tone } = section;
      return (
        <div className={shell.wrap}>
          <div className={home.lede}>
            <h2 className={home.ledeTitle}>{HOME_INTRO.title}</h2>
            <p className={home.ledeLine}>{HOME_INTRO.lead}</p>
          </div>
          <div className={home.chainBlock} data-chain>
            <ChainOverview tone={tone} />
            <SceneStage id={ring.id} tone={tone} label={ring.label} />
          </div>
        </div>
      );
    }
    case "ring": {
      const { ring, head, tone, cards } = section;
      const stage = (
        <RingStage
          id={ring.id}
          kind={ring.kind}
          slug={ring.slug}
          eager={ring.eager}
          logos={ring.logos}
          tone={tone}
          caption={ring.caption}
          label={ring.label}
        />
      );
      // With a product block the stage goes under it, in a grid that keeps the block at the left edge
      return head ? (
        <div className={`${shell.wrap} ${home.productPageGrid}`}>
          <ProductBlock
            slug={head.slug}
            tone={tone}
            link={false}
            heading="h1"
          />
          <BandTitle>{PAGE_HEADINGS.how}</BandTitle>
          {stage}
        </div>
      ) : (
        <div className={shell.wrap}>
          {stage}
          {cards && <ProductCards tone={tone} lit={PRODUCTS[0].slug} />}
        </div>
      );
    }
    case "resolves":
      return (
        <div className={shell.wrap}>
          <Resolves slug={section.slug} />
        </div>
      );
    case "capabilities":
      return (
        <div className={shell.wrap}>
          <Capabilities slug={section.slug} />
        </div>
      );
    case "hub": {
      const tieList = ties(MANIFEST);
      return (
        <div className={shell.wrap}>
          <HubText ties={tieList} lit={section.lit} />
          <CoreHub tone={section.tone} ties={tieList} lit={section.lit} />
        </div>
      );
    }
    case "closing":
      return <Closing />;
  }
}

export function Sections({ config }: { config: PageConfig }) {
  return config.sections.map((section) => (
    <Section
      key={section.id}
      id={section.id}
      tone={section.tone}
      pad={section.pad}
      srTitle={section.srTitle}
      thread={section.thread}
      rail={section.rail}
      railDelay={section.railDelay}
    >
      <Body section={section} />
    </Section>
  ));
}

export function SiteTemplate({ config }: { config: PageConfig }) {
  return (
    <PageFrame>
      {/* Page heading for screen readers and SEO; the home shows no visible title */}
      {config.srH1 && <h1 className={home.srOnly}>{config.srH1}</h1>}
      <Sections config={config} />
    </PageFrame>
  );
}
