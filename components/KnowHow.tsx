"use client";
import { useEffect, useRef, useState } from "react";
import Link from "./LangLink";
import emphasis from "@/lib/emphasis.json";
import styles from "./KnowHow.module.css";

type Pair = [string, string];
type Front = { id: string; title: Pair; lead: Pair; points: Pair[] };

// FRENTES DE ATUAÇÃO
// Capabilities described by what they do: the platform know-how behind them stays implicit
// (no company or product name), so the Imagine pages present it as Imagine capability.
export const FRONTS: Front[] = [
  {
    id: "integration",
    title: ["Integração e automação", "Integration and automation"],
    lead: [
      "Sistemas conectados por contrato; processos que mudam sem código.",
      "Systems connected by explicit contracts; processes that change without code.",
    ],
    points: [
      [
        "Fluxos desenhados em tela, com gatilhos, decisões de pessoas e ramos em paralelo.",
        "Processes drawn on a canvas, with triggers, human decisions and parallel branches.",
      ],
      [
        "Execução durável: cada passo deixa recibo e retoma de onde parou.",
        "Durable execution: every step leaves a receipt and resumes where it stopped.",
      ],
      [
        "Eventos assinados entre sistemas, no lugar de integrações ponto a ponto.",
        "Signed events between systems instead of point-to-point integrations.",
      ],
    ],
  },
  {
    id: "ai",
    title: ["IA aplicada", "Applied AI"],
    lead: [
      "Conhecimento com fonte, assistentes dentro do produto e ações validadas pelo servidor.",
      "Knowledge with sources, assistants inside products and actions validated by the server.",
    ],
    points: [
      [
        "Respostas que citam a fonte e dizem o que ainda falta.",
        "Answers that cite their source and say what is still missing.",
      ],
      [
        "Copiloto que sugere; a decisão continua com quem opera.",
        "A copilot that suggests; the decision stays with the operator.",
      ],
      [
        "Permissões aplicadas também ao conhecimento: cada pessoa lê o que pode ler.",
        "Permissions applied to knowledge too: each person reads what they may read.",
      ],
    ],
  },
  {
    id: "product",
    title: ["Software sob medida", "Custom software"],
    lead: [
      "Da operação do cliente ao produto web e mobile que evolui com ela.",
      "From the client operation to a web and mobile product that evolves with it.",
    ],
    points: [
      [
        "Telas que nascem do modelo de dados: cadastros, regras e contratos num núcleo único.",
        "Screens born from the data model: records, rules and contracts in a single core.",
      ],
      [
        "Web, aplicativo e portal sobre o mesmo domínio, com fiscal e financeiro no núcleo.",
        "Web, app and portal on the same domain, with tax and finance in the core.",
      ],
      [
        "Design de produto a partir de quem usa, validado a cada entrega.",
        "Product design shaped by the people who use it, validated at every delivery.",
      ],
    ],
  },
  {
    id: "channels",
    title: ["Atendimento e relacionamento", "Service and relationships"],
    lead: [
      "Todos os canais numa fila só, ligados ao histórico de cada relação.",
      "Every channel in one queue, tied to the history of each relationship.",
    ],
    points: [
      [
        "WhatsApp oficial, voz, chat e e-mail sob um mesmo contrato.",
        "Official WhatsApp, voice, chat and e-mail under one contract.",
      ],
      [
        "Fila com protocolo, prioridade e SLA; agentes que passam a vez para pessoas.",
        "A queue with protocol, priority and SLA; agents that hand over to people.",
      ],
      [
        "Campanhas e jornadas automatizadas sobre o mesmo histórico.",
        "Automated campaigns and journeys over the same history.",
      ],
    ],
  },
  {
    id: "platform",
    title: ["Infraestrutura e cloud", "Infrastructure and cloud"],
    lead: [
      "Plataforma Kubernetes própria, AWS e DigitalOcean, com isolamento, segurança e recuperação.",
      "Own Kubernetes platform, AWS and DigitalOcean, with isolation, security and recovery.",
    ],
    points: [
      [
        "Ambientes isolados, com segredos fora do código.",
        "Isolated environments, with secrets kept out of the code.",
      ],
      [
        "Publicação rastreável, do código ao ambiente em uso.",
        "Traceable releases, from code to the running environment.",
      ],
      [
        "Operação na borda que continua de pé quando a rede cai.",
        "Edge operation that stays up when the network drops.",
      ],
    ],
  },
];

// LISTA DE FRENTES
// `detailed` (Atuação) adds anchors and threads each front to the next; the home shows a compact list.
export function KnowHowList({
  en,
  detailed = false,
}: {
  en: boolean;
  detailed?: boolean;
}) {
  const i18n = (pair: Pair) => pair[en ? 1 : 0];
  return (
    <ol className={`${styles.fronts} ${detailed ? styles.detailed : ""}`}>
      {FRONTS.map((front, i) => (
        <li
          key={front.id}
          id={detailed ? front.id : undefined}
          data-reveal=""
          data-thread={
            detailed && i < FRONTS.length - 1 ? `front-${i}` : undefined
          }
          data-thread-to={detailed && i > 0 ? `front-${i - 1}` : undefined}
        >
          <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
          <div className={styles.frontHead}>
            <h3>{i18n(front.title)}</h3>
            <p>{i18n(front.lead)}</p>
          </div>
          <ul className={styles.points}>
            {front.points.map((point) => (
              <li key={point[0]}>{i18n(point)}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

// CARROSSEL DE CLIENTES
// A continuous, slow marquee; it pauses on hover and focus, and becomes a static wrap of logos
// under prefers-reduced-motion. The second copy of the track exists only to loop seamlessly.
export function ClientCarousel({ en }: { en: boolean }) {
  const clients = emphasis.clientSegments.flatMap((segment) =>
    segment.clients.map(([name, src]) => ({
      name,
      src,
      segment: segment.label[en ? 1 : 0],
    })),
  );
  const set = (copy: number) => (
    <ul className={styles.set} aria-hidden={copy > 0 ? true : undefined}>
      {clients.map((client) => (
        <li key={`${copy}-${client.name}`}>
          <span className={styles.logo}>
            <img
              src={client.src}
              alt={copy > 0 ? "" : client.name}
              width="160"
              height="56"
              loading="lazy"
            />
          </span>
          <span className={styles.segment}>{client.segment}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className={styles.carousel}
      aria-label={en ? "Clients" : "Clientes"}
      role="region"
    >
      <div className={styles.track}>
        {set(0)}
        {set(1)}
      </div>
    </div>
  );
}

// CONTADOR
// Counts up once when it enters the viewport; reduced motion shows the final value at once.
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    setShown(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1400);
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return <span ref={ref}>{String(shown).padStart(2, "0")}</span>;
}

// ETAPAS DE TRABALHO
const STEPS: { title: Pair; body: Pair; result: Pair }[] = [
  {
    title: ["Entender", "Understand"],
    body: [
      "Imersão na operação: conversas com quem faz o trabalho, leitura dos processos e dos sistemas que já existem.",
      "Immersion in the operation: conversations with the people doing the work, reading the processes and the systems already in place.",
    ],
    result: ["Mapa da jornada e das prioridades", "Journey and priority map"],
  },
  {
    title: ["Desenhar", "Shape"],
    body: [
      "Jornadas, protótipo navegável e o modelo de dados que sustenta o produto.",
      "Journeys, a clickable prototype and the data model that holds the product up.",
    ],
    result: [
      "Protótipo e escopo da primeira entrega",
      "Prototype and first-delivery scope",
    ],
  },
  {
    title: ["Construir", "Build"],
    body: [
      "Entregas curtas, validadas com quem usa, sobre infraestrutura pronta para produção.",
      "Short deliveries, validated with the people who use them, on production-ready infrastructure.",
    ],
    result: [
      "Produto em uso, com ambiente de homologação",
      "Product in use, with a staging environment",
    ],
  },
  {
    title: ["Evoluir", "Evolve"],
    body: [
      "Acompanhar o uso e as novas necessidades; integrar, automatizar e aplicar IA onde fizer sentido.",
      "Follow usage and new needs; integrate, automate and apply AI where it makes sense.",
    ],
    result: [
      "Evolução contínua e operação acompanhada",
      "Continuous evolution and an operation that is followed up",
    ],
  },
];

export function WorkSteps({ en }: { en: boolean }) {
  const i18n = (pair: Pair) => pair[en ? 1 : 0];
  return (
    <ol className={styles.steps} data-reveal="">
      {STEPS.map((step, i) => (
        <li key={step.title[0]}>
          <span className={styles.node} aria-hidden="true" />
          <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
          <h3>{i18n(step.title)}</h3>
          <p>{i18n(step.body)}</p>
          <span className={styles.result}>
            <em>{en ? "You get" : "Você recebe"}</em>
            {i18n(step.result)}
          </span>
        </li>
      ))}
    </ol>
  );
}

// NÚMEROS DA ATUAÇÃO
// Every figure is counted from the site's own data (portfolio, client list, fronts, steps).
export function FactCounters({
  en,
  systems,
}: {
  en: boolean;
  systems: number;
}) {
  const clients = emphasis.clientSegments.reduce(
    (sum, segment) => sum + segment.clients.length,
    0,
  );
  const facts: [number, string][] = [
    [systems, en ? "systems in the portfolio" : "sistemas no portfólio"],
    [clients, en ? "clients" : "clientes"],
    [
      emphasis.clientSegments.length,
      en ? "industries served" : "segmentos atendidos",
    ],
    [FRONTS.length, en ? "fronts of work" : "frentes de atuação"],
  ];
  return (
    <dl className={styles.facts} data-reveal-stagger="" data-reveal="">
      {facts.map(([value, label]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            <CountUp value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function KnowHowLink({ en }: { en: boolean }) {
  return (
    <Link className={styles.more} href="/servicos">
      {en ? "See how we work" : "Conhecer nossa atuação"} ↗
    </Link>
  );
}
