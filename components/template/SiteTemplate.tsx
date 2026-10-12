// TEMPLATE DA PÁGINA ÚNICA
// Walks the section list of a PageConfig (lib/site-config.ts) and renders it inside the page frame: the same template
// serves the home and the five product pages. `Sections` is the part without the frame (header and footer), which the
// tests render on its own.
import { PageFrame } from "@/components/onepage/PageFrame";
import { ProductBlock } from "@/components/onepage/ProductBlock";
import home from "@/components/onepage/home.module.css";
import shell from "@/components/onepage/shell.module.css";
import { RingStage } from "@/components/ring/RingStage";
import { MANIFEST } from "@/lib/manifest";
import { ties } from "@/lib/manifest/select";
import type { PageConfig, SectionConfig } from "@/lib/site-config";
import { Closing } from "./Closing";
import { CoreHub } from "./CoreHub";
import { Section } from "./Section";

function Body({ section }: { section: SectionConfig }) {
  switch (section.kind) {
    case "ring": {
      const { ring, head, tone } = section;
      const stage = (
        <RingStage
          id={ring.id}
          kind={ring.kind}
          slug={ring.slug}
          eager={ring.eager}
          logos={ring.logos}
          tone={tone}
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
          {stage}
        </div>
      ) : (
        <div className={shell.wrap}>{stage}</div>
      );
    }
    case "hub":
      return (
        <div className={shell.wrap}>
          <CoreHub
            tone={section.tone}
            ties={ties(MANIFEST)}
            lit={section.lit}
          />
        </div>
      );
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
    <PageFrame home={config.home}>
      {/* Page heading for screen readers and SEO; the home shows no visible title */}
      {config.srH1 && <h1 className={home.srOnly}>{config.srH1}</h1>}
      <Sections config={config} />
    </PageFrame>
  );
}
