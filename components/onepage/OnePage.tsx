// PÁGINA ÚNICA
// Five sections, one idea per screen, graphite and cream bands alternating. The sections are added one by one; see
// PageFrame for the header and the footer.
import { Carousel } from "./Carousel";
import { Hero } from "./Hero";
import { PageFrame } from "./PageFrame";
import { CLIENT_LOGOS, CLIENTS_LABEL } from "@/lib/partners";
import shell from "./shell.module.css";

export function OnePage() {
  return (
    <PageFrame home>
      <Hero />
      <section id="logos" className={`${shell.band} ${shell.light}`}>
        <div className={shell.wrap}>
          <Carousel
            label={CLIENTS_LABEL}
            logos={CLIENT_LOGOS}
            kind="clients"
            tone="light"
            seconds={40}
          />
        </div>
      </section>
    </PageFrame>
  );
}
