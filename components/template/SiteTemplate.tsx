// TEMPLATE DA PÁGINA ÚNICA
// Walks the section list of a PageConfig (lib/site-config.ts) and renders it: the same template serves the home and the
// five product pages. `Sections` is the part without the frame (header and footer), which the tests render on its own.
import type { SectionConfig, PageConfig } from "@/lib/site-config";
import {
  FiveProducts,
  HomeContact,
  HomeIntro,
  HomeMessage,
  Platforms,
} from "./Home";
import {
  DomusAreas,
  ProductCenter,
  ProductContact,
  ProductDetails,
  ProductOpening,
} from "./Product";
import { Section } from "./Section";

function Body({ section }: { section: SectionConfig }) {
  switch (section.kind) {
    case "intro":
      return <HomeIntro />;
    case "message":
      return <HomeMessage />;
    case "products":
      return <FiveProducts />;
    case "contact":
      return section.slug ? (
        <ProductContact slug={section.slug} />
      ) : (
        <HomeContact />
      );
    case "platforms":
      return <Platforms />;
    case "opening":
      return <ProductOpening slug={section.slug} />;
    case "areas":
      return <DomusAreas />;
    case "center":
      return <ProductCenter slug={section.slug} />;
    case "details":
      return <ProductDetails slug={section.slug} />;
  }
}

export function Sections({ config }: { config: PageConfig }) {
  return config.sections.map((section) => (
    <Section
      key={section.id}
      id={section.id}
      pad={section.pad}
      srTitle={section.srTitle}
      surface={section.surface}
    >
      <Body section={section} />
    </Section>
  ));
}
