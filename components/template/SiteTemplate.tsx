// TEMPLATE DA PÁGINA ÚNICA
// Walks the section list of a PageConfig (lib/site-config.ts) and renders it: the same template serves the home and the
// five product pages. `Sections` is the part without the frame (header and footer), which the tests render on its own.
// `i18n` is the locale of the page and its dictionary: every section writes and links in that locale.
import type { I18n } from "@/lib/i18n/i18n";
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

function Body({ section, i18n }: { section: SectionConfig; i18n: I18n }) {
  switch (section.kind) {
    case "intro":
      return <HomeIntro />;
    case "message":
      return <HomeMessage i18n={i18n} />;
    case "products":
      return <FiveProducts i18n={i18n} />;
    case "contact":
      return section.slug ? (
        <ProductContact i18n={i18n} slug={section.slug} />
      ) : (
        <HomeContact i18n={i18n} />
      );
    case "platforms":
      return <Platforms i18n={i18n} />;
    case "opening":
      return <ProductOpening i18n={i18n} slug={section.slug} />;
    case "areas":
      return <DomusAreas i18n={i18n} />;
    case "center":
      return <ProductCenter i18n={i18n} slug={section.slug} />;
    case "details":
      return <ProductDetails i18n={i18n} slug={section.slug} />;
  }
}

export function Sections({ config, i18n }: { config: PageConfig; i18n: I18n }) {
  return config.sections.map((section) => (
    <Section
      key={section.id}
      id={section.id}
      pad={section.pad}
      srTitle={section.srTitle}
      surface={section.surface}
    >
      <Body section={section} i18n={i18n} />
    </Section>
  ));
}
