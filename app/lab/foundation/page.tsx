// LAB DA FUNDAÇÃO V4
// /lab/foundation: the v4 primitives alone (brief-v4, 2026-10-23), to approve them live and to measure them
// (e2e/foundation.spec.ts) before the sections use them: the connector in its three states and its routes, TypeIn with
// the "digitando" indicator, Reveal and the row whose cards gain width on hover. Never indexed.
import type { Metadata } from "next";
import shell from "@/components/onepage/shell.module.css";
import { GrowItem, GrowRow } from "@/components/motion/Grow";
import { Reveal } from "@/components/motion/Reveal";
import { Connector, type ConnectorRoute, type ConnectorState } from "@/components/scene-kit/Connector";
import k from "@/components/scene-kit/lab.module.css";
import { TYPING_MS, TypeIn, TypingIndicator } from "@/components/scene-kit/TypeIn";
import f from "./foundation.module.css";

export const metadata: Metadata = {
  title: "Lab da fundação",
  robots: { index: false, follow: false },
};

const STATES: { state: ConnectorState; label: string }[] = [
  { state: "rest", label: "Repouso" },
  { state: "active", label: "Ativo" },
  { state: "live", label: "Vivo" },
];

// One sample per route, with the pieces placed as that route expects
const ROUTES: { route: ConnectorRoute; layout: string }[] = [
  { route: "curve", layout: "level" },
  { route: "elbow", layout: "diagonal" },
  { route: "drop", layout: "stacked" },
];

const PHRASE = "Sua proposta foi aprovada e o contrato já está em preparo.";

export default function FoundationLab() {
  return (
    <div className={`${shell.page} ${k.main}`} data-theme="welabs">
      <div className={f.page}>
        <section className={f.group} data-lab="connectors" aria-label="Conectores">
          {STATES.map(({ state, label }) => (
            <div key={state} className={f.link} data-link={state} data-layout="diagonal">
              <span className={f.node} data-end="from">
                Conversa
              </span>
              <span className={f.node} data-end="to">
                Oportunidade
              </span>
              <span className={f.caption}>{label}</span>
              <Connector from='[data-end="from"]' to='[data-end="to"]' state={state} inset={0} gap={6} />
            </div>
          ))}
          {ROUTES.map(({ route, layout }) => (
            <div key={route} className={f.link} data-route={route} data-layout={layout}>
              <span className={f.node} data-end="from">
                Conversa
              </span>
              <span className={f.node} data-end="to">
                Oportunidade
              </span>
              <span className={f.caption}>{route}</span>
              <Connector from='[data-end="from"]' to='[data-end="to"]' route={route} state="active" inset={0} gap={6} />
            </div>
          ))}
        </section>

        <section className={f.group} data-lab="type" aria-label="Digitação">
          <p className={f.bubble} data-lab-type="">
            <TypeIn text={PHRASE} delay={TYPING_MS} />
          </p>
          <TypingIndicator showLabel />
        </section>

        <section className={f.group} data-lab="grow" aria-label="Cartões que crescem">
          <GrowRow className={f.row}>
            {["Mapeamento", "Análise", "Construção"].map((name) => (
              <GrowItem key={name} className={f.panel} data-grow-item={name}>
                {name}
              </GrowItem>
            ))}
          </GrowRow>
        </section>

        {/* Below the fold, so the entry plays when the page scrolls to it */}
        <section className={`${f.group} ${f.below}`} data-lab="reveal" aria-label="Entrada">
          {["Primeiro", "Segundo", "Terceiro", "Quarto"].map((name, i) => (
            <Reveal key={name} order={i} className={f.panel} data-reveal-item={name}>
              {name}
            </Reveal>
          ))}
        </section>
      </div>
    </div>
  );
}
