"use client";
// QUADROS DOS CINCO PRODUTOS
// One small screen per product (brief-v4, artboards Main and Accordion, 2026-10-23), the effect only, never the
// mechanism: the Domus with its modules and the four products that use the newest one, the Relloo conversation whose
// answer types in, the Magneto approval, the Tuner channels landing in one conversation and the Knowly answer with its
// source. The same frame fills the stage of the opening (wide) and the open panel of the accordion (narrow): the window
// is a size container, so a narrow one keeps fewer modules and drops the captions (frames.module.css). The links between
// pieces are the kit's Connector (curved, rest grey, active ink, live amber); the typing is the kit's TypeIn. A frame
// plays when it is mounted: its parent remounts it (a new `key`) to play it again.
import {
  Bot,
  BookOpen,
  Check,
  ClipboardCheck,
  Coins,
  FileText,
  Landmark,
  Mail,
  MessageCircle,
  MessageSquare,
  Package,
  PenLine,
  Phone,
  Scale,
  ShoppingBag,
  Tag,
  Users,
  CircleCheck,
} from "lucide-react";
import type { ReactElement } from "react";
import { Badge } from "@/components/lib/ui";
import { Connector } from "@/components/scene-kit/Connector";
import { TYPING_MS, TypeIn, TypingIndicator } from "@/components/scene-kit/TypeIn";
import {
  DOMUS_FRAME,
  KNOWLY_FRAME,
  MAGNETO_FRAME,
  RELLOO_FRAME,
  TUNER_FRAME,
} from "@/lib/content";
import { productAlt, productLogo, type ProductSlug } from "@/lib/products";
import f from "./frames.module.css";

const MODULE_ICON: Record<string, ReactElement> = {
  tag: <Tag />,
  bag: <ShoppingBag />,
  box: <Package />,
  coins: <Coins />,
  pen: <PenLine />,
  users: <Users />,
  file: <FileText />,
  bank: <Landmark />,
  chat: <MessageSquare />,
  check: <CircleCheck />,
  scale: <Scale />,
  clipboard: <ClipboardCheck />,
};

// The modules a narrow frame keeps (the accordion panel): two columns of three
const COMPACT = new Set(["Financeiro", "Contratos", "Fiscal", "Pessoas", "Chamados", "Vistoria"]);
const USERS = ["relloo", "magneto", "tuner", "knowly"] as const;

// The title bar of a frame: its name, a quiet line beside it and an optional piece at the end
function Bar({ title, sub, end }: { title: string; sub?: string; end?: ReactElement }) {
  return (
    <div className={f.bar}>
      <span className={f.barTitle}>{title}</span>
      {sub ? <span className={f.barSub}>{sub}</span> : null}
      {end ? <span className={f.barEnd}>{end}</span> : null}
    </div>
  );
}

// DOMUS: OS MÓDULOS E OS QUATRO QUE USAM O NOVO
function DomusFrame() {
  const d = DOMUS_FRAME;
  return (
    <>
      <Bar
        title={d.title}
        sub={d.sub}
        end={
          <span className={f.legend}>
            <span className={f.legendItem} data-kind="standard">
              {d.standard}
            </span>
            <span className={f.legendItem} data-kind="custom">
              {d.custom}
            </span>
          </span>
        }
      />
      <div className={f.body}>
        <ul className={f.modules} data-modules="">
          {d.modules.map((m) => (
            <li
              key={m.name}
              className={f.module}
              data-kind={m.kind}
              data-wide-only={COMPACT.has(m.name) ? undefined : ""}
            >
              <span className={f.moduleIcon} aria-hidden="true">
                {MODULE_ICON[m.icon]}
              </span>
              <span className={f.moduleName}>{m.name}</span>
              {"tag" in m ? (
                <Badge
                  variant={m.kind === "new" ? "success" : "secondary"}
                  appearance={m.kind === "new" ? "soft" : "solid"}
                  className={f.moduleTag}
                >
                  {m.tag}
                </Badge>
              ) : null}
            </li>
          ))}
        </ul>
        <ul className={f.uses}>
          {USERS.map((slug) => (
            <li key={slug} className={f.use} data-use={slug}>
              <img
                src={productLogo(slug, "light", "row", 30)}
                alt={productAlt(slug, "row")}
                width={1005}
                height={550}
                className={f.useLogo}
              />
              <span className={f.useLine}>{d.uses[slug]}</span>
            </li>
          ))}
        </ul>
        <p className={f.usesLine}>{d.usesLine}</p>
        {USERS.map((slug) => (
          <Connector key={slug} from="[data-modules]" to={`[data-use="${slug}"]`} route="drop" inset={0} gap={6} />
        ))}
      </div>
    </>
  );
}

// RELLOO: A CONVERSA E A RESPOSTA QUE SE DIGITA
function RellooFrame() {
  const r = RELLOO_FRAME;
  return (
    <>
      <Bar
        title={r.title}
        sub={r.who}
        end={
          <Badge variant="success" appearance="soft">
            {r.linked}
          </Badge>
        }
      />
      <div className={f.owner}>
        <span className={f.ownerLabel}>{r.owner}</span>
        <Badge variant="primary" appearance="solid">
          <Bot aria-hidden="true" />
          {r.agent}
        </Badge>
      </div>
      <div className={f.thread}>
        <p className={f.bubbleIn}>
          <span>{r.incoming}</span>
          <span className={f.time}>{r.time}</span>
        </p>
        <p className={f.bubbleOut}>
          <TypeIn text={r.answer} delay={TYPING_MS} />
        </p>
        <span className={f.typing}>
          <TypingIndicator label={r.typing} showLabel className={f.typingDots} />
        </span>
      </div>
      <div className={f.stages}>
        {r.stages.map((stage, i) => (
          <span
            key={stage}
            className={f.stage}
            data-stage={i}
            data-current={i === 0 || undefined}
            data-wide-only={i === r.stages.length - 1 ? "" : undefined}
          >
            {stage}
          </span>
        ))}
        {r.stages.slice(1).map((stage, i) => (
          <Connector key={stage} from={`[data-stage="${i}"]`} to={`[data-stage="${i + 1}"]`} inset={0} gap={4} />
        ))}
      </div>
    </>
  );
}

// MAGNETO: A PROPOSTA PELO CAMINHO DA APROVAÇÃO
function MagnetoFrame() {
  const m = MAGNETO_FRAME;
  const live = m.steps.findIndex((s) => !s.done);
  return (
    <>
      <Bar
        title={m.title}
        end={
          <Badge variant="secondary" appearance="solid">
            {m.state}
          </Badge>
        }
      />
      <div className={f.body}>
        <ol className={f.steps}>
          {m.steps.map((s, i) => (
            <li key={s.name} className={f.step} data-step-state={s.done ? "done" : i === live ? "live" : "next"}>
              <span className={f.stepMark} data-mark={i} aria-hidden="true">
                {s.done ? <Check /> : null}
              </span>
              <span className={f.stepName}>{s.name}</span>
              <span className={f.stepLine}>{s.line}</span>
            </li>
          ))}
        </ol>
        {m.steps.slice(1).map((s, i) => (
          <Connector
            key={s.name}
            from={`[data-mark="${i}"]`}
            to={`[data-mark="${i + 1}"]`}
            route="drop"
            inset={0}
            gap={4}
            state={i + 1 < live ? "active" : i + 1 === live ? "live" : "rest"}
          />
        ))}
      </div>
    </>
  );
}

// TUNER: CADA CANAL NA MESMA CONVERSA
const CHANNEL_ICON = [<MessageCircle key="m" />, <Phone key="p" />, <Mail key="e" />];

function TunerFrame() {
  const t = TUNER_FRAME;
  return (
    <>
      <Bar title={t.title} />
      <div className={f.hub}>
        <ul className={f.channels}>
          {t.channels.map((c, i) => (
            <li key={c.name} className={f.channel} data-channel={i}>
              <span className={f.channelIcon} aria-hidden="true">
                {CHANNEL_ICON[i]}
              </span>
              <span className={f.channelText}>
                <span className={f.channelName}>{c.name}</span>
                <span className={f.channelLine}>{c.line}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className={f.hubThread} data-thread="">
          <span className={f.channelName}>{t.thread.title}</span>
          <span className={f.channelLine}>{t.thread.line}</span>
        </div>
        {t.channels.map((c, i) => (
          <Connector
            key={c.name}
            from={`[data-channel="${i}"]`}
            to="[data-thread]"
            inset={0}
            gap={6}
            state={c.fresh ? "live" : "active"}
          />
        ))}
      </div>
    </>
  );
}

// KNOWLY: A RESPOSTA COM A FONTE AO LADO
function KnowlyFrame() {
  const k = KNOWLY_FRAME;
  return (
    <>
      <Bar title={k.title} />
      <div className={f.answerBody}>
        <p className={f.question}>{k.question}</p>
        <div className={f.answer} data-answer="">
          <span className={f.answerIcon} aria-hidden="true">
            <BookOpen />
          </span>
          <span>{k.answer}</span>
        </div>
        <div className={f.source} data-source="">
          <span className={f.ownerLabel}>{k.sourceLabel}</span>
          <Badge variant="secondary" appearance="solid">
            <FileText aria-hidden="true" />
            {k.source}
          </Badge>
        </div>
        <Connector from="[data-answer]" to="[data-source]" route="drop" inset={0} gap={6} state="live" />
      </div>
    </>
  );
}

const FRAMES: Record<ProductSlug, () => ReactElement> = {
  domus: DomusFrame,
  relloo: RellooFrame,
  magneto: MagnetoFrame,
  tuner: TunerFrame,
  knowly: KnowlyFrame,
};

/** The frame of one product, a white window filling its parent */
export function ProductFrame({ slug, className }: { slug: ProductSlug; className?: string }) {
  const Frame = FRAMES[slug];
  return (
    <div className={className ? `${f.window} ${className}` : f.window} data-frame={slug}>
      <Frame />
    </div>
  );
}
