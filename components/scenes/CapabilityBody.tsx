// CENAS DE CAPACIDADE (COMPOSIÇÕES)
// The capability scenes of the product openings (lib/scenes/capabilities.ts), each a product window drawn with the same
// tokens, pieces and motion as the scenes of the home (scenes.module.css, fx.css): one key element of 18 to 22 px
// (`data-key`), every other text 11 to 13 px, amber only as an area. The words come from lib/scenes/capabilities.ts, the
// times from its script (`actFor`). Server markup only; `phase` is the settled frame by default and the stage rewrites
// it on the client.
import type { ReactNode } from "react";
import { actFor } from "@/lib/scenes/act";
import {
  CAPABILITY_STORY as S,
  type CapabilityScript,
} from "@/lib/scenes/capabilities";
import type { Act } from "@/lib/scenes/types";
import { Glyph, GLYPHS } from "./icons";
import { SceneWindow } from "./SceneWindow";
import c from "./capability.module.css";
import s from "./scenes.module.css";

// Head of a pane: a name in 13/600 and its context in 11 on the right
function Head({ title, meta }: { title: ReactNode; meta?: ReactNode }) {
  return (
    <div className={c.head}>
      <b>{title}</b>
      {meta ? <span>{meta}</span> : null}
    </div>
  );
}

const Key = ({ children }: { children: ReactNode }) => (
  <b className={s.key} data-key="">
    {children}
  </b>
);

// RELLOO: HISTÓRICO DE CADA PESSOA
function RellooPerson({ act }: { act: Act }) {
  const t = S["relloo-person"];
  const icons = [GLYPHS.chat, GLYPHS.phone, GLYPHS.bag];
  return (
    <SceneWindow product="relloo" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="person">
        <div className={`${c.pane} ${c.soft} ${c.top}`}>
          <div className={c.profile}>
            <span className={c.avatarLg} aria-hidden="true">
              M
            </span>
            <span className={c.profileText}>
              <Key>{t.name}</Key>
              <span>{t.since}</span>
            </span>
          </div>
          <ul className={c.chips}>
            {t.channels.map((ch, i) => (
              <li key={ch}>
                <Glyph d={i === 0 ? GLYPHS.chat : GLYPHS.phone} size={12} />
                {ch}
              </li>
            ))}
          </ul>
          <div className={`${c.cardMini} ${c.lit}`} {...act("card", "light")}>
            <b>{t.card.title}</b>
            <span className={c.cardMiniMeta}>
              <span>{t.card.order}</span>
              <span>
                {t.owner.label}: {t.owner.value}
              </span>
              <span>
                {t.deadline.label}: {t.deadline.value}
              </span>
            </span>
          </div>
        </div>
        <div className={c.pane}>
          <Head title={t.history} meta={`${t.items.length} registros`} />
          <ul className={c.timeline}>
            {t.items.map((item, i) => (
              <li
                key={item.kind}
                {...act("history", "in", { index: i, count: t.items.length })}
              >
                <span className={s.iconBox}>
                  <Glyph d={icons[i]} size={14} />
                </span>
                <span className={c.tlText}>
                  <span className={c.tlMeta}>
                    <b>{item.kind}</b>
                    <time>{item.time}</time>
                  </span>
                  <span>{item.text}</span>
                </span>
              </li>
            ))}
          </ul>
          {/* What the Domus keeps flies in beside the history (ludic pass) */}
          <div className={`${c.from} ${c.side}`} {...act("domus", "fly")}>
            <p className={c.label}>{t.domus}</p>
            <dl className={c.pairs}>
              {t.domusRows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// RELLOO: AGENTE QUE PASSA A VEZ
function RellooAgent({ act }: { act: Act }) {
  const t = S["relloo-agent"];
  return (
    <SceneWindow product="relloo" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="agent">
        <div className={`${c.pane} ${c.soft} ${c.side} ${c.top}`}>
          <div className={c.agent}>
            <span className={c.botFace} aria-hidden="true">
              <Glyph d={GLYPHS.bot} size={20} />
            </span>
            <span className={s.who}>
              <b>{t.agent}</b>
              <span>{t.agentRole}</span>
            </span>
          </div>
          <dl className={`${c.pairs} ${c.pairsStack}`}>
            <div>
              <dt>{t.knows}</dt>
              <dd>{t.source}</dd>
            </div>
            <div>
              <dt>{t.passes}</dt>
              <dd>{t.passesWhen}</dd>
            </div>
          </dl>
        </div>
        <div className={`${c.pane} ${c.convo}`}>
          <Head title={t.contact} meta={t.meta} />
          <div className={c.convoBody}>
            <p className={`${c.msg} ${c.msgIn}`}>{t.ask}</p>
            <div className={c.msgOutWrap} {...act("answer", "pop")}>
              <p className={`${c.msg} ${c.msgOut}`}>
                <span className={c.msgBy}>
                  <Glyph d={GLYPHS.bot} size={12} />
                  {t.agent}
                </span>
                {t.answer}
              </p>
              <span className={c.source}>
                <Glyph d={GLYPHS.doc} size={12} />
                {t.from}
              </span>
            </div>
            <p className={`${c.msg} ${c.msgIn}`} {...act("ask", "pop")}>
              {t.human}
            </p>
            <div className={c.handoff} {...act("handoff", "pop")}>
              <span className={s.avatarSm}>A</span>
              <span className={c.handoffText}>
                <Key>{t.handoff}</Key>
                <span>{t.handoffMeta}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// Block of a flow: a tonal box with the icon, the name and its kind
function FlowBlock({
  name,
  kind,
  icon,
  done,
  lit,
  props,
  doneProps,
}: {
  name: string;
  kind: string;
  icon: string;
  done?: boolean;
  lit?: boolean;
  props?: object;
  doneProps?: object;
}) {
  return (
    <div className={`${c.block} ${lit ? c.lit : ""}`} {...props}>
      <span className={s.iconBox}>
        <Glyph d={icon} size={14} />
      </span>
      <span className={s.who}>
        <b>{name}</b>
        <span>{kind}</span>
      </span>
      {done ? (
        <span className={c.blockDone} {...doneProps}>
          <Glyph d={GLYPHS.check} size={11} />
        </span>
      ) : null}
    </div>
  );
}

// MAGNETO: O FLUXO DESENHADO EM BLOCOS
function MagnetoCanvas({ act }: { act: Act }) {
  const t = S["magneto-canvas"];
  const run = (index: number) => act("run", "pop", { index, count: 3 });
  return (
    <SceneWindow product="magneto" place={t.where} meta={t.meta}>
      <div className={`${c.pane} ${c.soft} ${c.board}`}>
        <div className={c.boardHead}>
          <Key>{t.title}</Key>
          <span className={c.orderTag}>
            <Glyph d={GLYPHS.doc} size={12} />
            {t.order}
          </span>
          <span className={s.pillOk} {...act("done", "pop")}>
            <Glyph d={GLYPHS.check} size={11} />
            {t.done}
          </span>
        </div>
        <div className={c.graph}>
          <FlowBlock
            name={t.blocks.start}
            kind={t.kinds.start}
            icon={GLYPHS.doc}
            done
            doneProps={run(0)}
          />
          <span className={c.arrow} aria-hidden="true" />
          <FlowBlock
            name={t.blocks.approve}
            kind={t.kinds.approve}
            icon={GLYPHS.user}
            done
            doneProps={run(1)}
          />
          <span className={c.arrow} aria-hidden="true" />
          <FlowBlock
            name={t.blocks.notify}
            kind={t.kinds.notify}
            icon={GLYPHS.bell}
            done
            lit
            props={act("done", "light")}
            doneProps={run(2)}
          />
          <div className={c.branch}>
            <span className={c.branchLine} aria-hidden="true" />
            <span className={c.branchLabel}>{t.limit}</span>
            <FlowBlock
              name={t.blocks.above}
              kind={t.kinds.above}
              icon={GLYPHS.user}
              done
              doneProps={act("branch", "pop")}
            />
          </div>
        </div>
        <div className={c.runLog}>
          <span className={c.label}>{t.run}</span>
          <ol>
            {t.steps.map((step, i) => (
              <li
                key={step.text}
                {...(i >= 2
                  ? act(i === 2 ? "branch" : "done", "in")
                  : act("run", "in", { index: i, count: 3 }))}
              >
                <time>{step.time}</time>
                {step.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SceneWindow>
  );
}

// TUNER: LIGAÇÃO PARA A EQUIPE CERTA
function TunerCall({ act }: { act: Act }) {
  const t = S["tuner-call"];
  return (
    <SceneWindow product="tuner" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="call">
        <div className={`${c.pane} ${c.soft} ${c.side} ${c.top}`}>
          <div className={c.caller}>
            <span className={c.avatarLg} aria-hidden="true">
              RL
            </span>
            <span className={s.who}>
              <b>{t.caller}</b>
              <span>
                <Glyph d={GLYPHS.phone} size={11} />
                {t.callerMeta}
              </span>
            </span>
          </div>
          <div className={c.waveRow}>
            <div className={s.wave} aria-hidden="true">
              {Array.from({ length: 24 }, (_, i) => (
                <i key={i} style={{ height: `${30 + ((i * 37) % 70)}%` }} />
              ))}
            </div>
          </div>
          <dl className={`${c.pairs} ${c.pairsStack}`}>
            <div>
              <dt>{t.menu}</dt>
              <dd>{t.option}</dd>
            </div>
          </dl>
          <ol className={c.callSteps}>
            {t.steps.map((step, i) => (
              <li
                key={step.text}
                {...(i === t.steps.length - 1 ? act("take", "in") : {})}
              >
                <time>{step.time}</time>
                {step.text}
              </li>
            ))}
          </ol>
        </div>
        <div className={`${c.pane} ${c.top}`}>
          <Head title={t.teams} meta={`${t.list.length} equipes`} />
          <ul className={c.rows}>
            {t.list.map((team, i) => {
              const right = i === 1;
              return (
                <li
                  key={team.name}
                  className={`${c.row} ${right ? c.lit : ""}`}
                  {...(right ? act("route", "light") : {})}
                >
                  <span className={s.iconBox}>
                    <Glyph d={GLYPHS.team} size={14} />
                  </span>
                  <span className={s.who}>
                    {right ? <Key>{team.name}</Key> : <b>{team.name}</b>}
                    <span>{team.people}</span>
                  </span>
                  {right ? (
                    <span className={s.pillOk} {...act("take", "pop")}>
                      <Glyph d={GLYPHS.phone} size={11} />
                      {t.taken}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className={c.noteCard} {...act("note", "in")}>
            <span className={s.avatarSm}>D</span>
            <span className={s.who}>
              <b>{t.note}</b>
              <span>{t.noteMeta}</span>
            </span>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// KNOWLY: RESPOSTA COM A FONTE
function KnowlyAnswer({ act }: { act: Act }) {
  const t = S["knowly-answer"];
  return (
    <SceneWindow product="knowly" place={t.where} meta={t.meta}>
      <div className={c.column}>
        <div className={s.query}>
          <Glyph d={GLYPHS.search} size={14} />
          <span>{t.question}</span>
        </div>
        <div className={`${c.pane} ${c.answerPane}`}>
          <p className={s.answerLabel}>
            <Glyph d={GLYPHS.spark} size={12} />
            {t.label}
          </p>
          <p
            className={c.sentence}
            {...act("answer", "in", { index: 0, count: 2 })}
          >
            <Key>{t.answer}</Key>
            <sup className={c.ref}>1</sup>
          </p>
          <p
            className={c.sentence}
            {...act("answer", "in", { index: 1, count: 2 })}
          >
            <span>{t.detail}</span>
            <sup className={c.ref}>2</sup>
          </p>
          <div className={c.sourceList}>
            <p className={c.label}>{t.sourcesTitle}</p>
            <ul>
              {t.sources.map((src, i) => (
                <li
                  key={src.n}
                  {...act("sources", "in", {
                    index: i,
                    count: t.sources.length,
                  })}
                >
                  <span className={c.ref}>{src.n}</span>
                  <Glyph d={GLYPHS.doc} size={12} />
                  {src.name}
                </li>
              ))}
            </ul>
          </div>
          <p className={c.missing} {...act("missing", "in")}>
            <i className={s.dot} data-tone="warn" />
            {t.missing}
          </p>
          <div className={`${s.related} ${c.relatedLow}`}>
            <p>{t.related}</p>
            <ul>
              {t.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// KNOWLY: FONTES NUM LUGAR SÓ
function KnowlySources({ act }: { act: Act }) {
  const t = S["knowly-sources"];
  const icons = [GLYPHS.doc, GLYPHS.chat, GLYPHS.mic];
  return (
    <SceneWindow product="knowly" place={t.where} meta={t.meta}>
      <div className={c.column}>
        <div className={c.search} {...act("search", "in")}>
          <Glyph d={GLYPHS.search} size={16} />
          <Key>{t.query}</Key>
        </div>
        <div className={c.groups}>
          {t.groups.map((group, g) => (
            <div key={group.name} className={`${c.pane} ${c.soft} ${c.group}`}>
              <p className={c.groupHead}>
                <Glyph d={icons[g]} size={13} />
                {group.name}
              </p>
              <ul>
                {group.items.map((item, i) => {
                  const hit = t.hits[g] === i;
                  return (
                    <li
                      key={item}
                      className={hit ? c.lit : c.quiet}
                      {...(hit
                        ? act("found", "light", {
                            index: g,
                            count: t.groups.length,
                          })
                        : {})}
                    >
                      <span>{item}</span>
                      {hit ? (
                        <span className={c.fresh} {...act("fresh", "in")}>
                          <Glyph d={GLYPHS.refresh} size={11} />
                          {t.freshTimes[g]}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className={`${c.pane} ${c.excerpt} ${c.side}`}>
          <p className={c.label}>
            <Glyph d={GLYPHS.doc} size={12} />
            {t.excerpt.from}
          </p>
          <p className={c.quote}>{t.excerpt.text}</p>
          <p className={c.footNote} {...act("fresh", "in")}>
            <Glyph d={GLYPHS.refresh} size={12} />
            {t.fresh}: {t.excerpt.meta}
          </p>
        </div>
      </div>
    </SceneWindow>
  );
}

// KNOWLY: ACESSO POR PESSOA
function KnowlyAccess({ act }: { act: Act }) {
  const t = S["knowly-access"];
  return (
    <SceneWindow product="knowly" place={t.where} meta={t.meta}>
      <div className={c.access}>
        <div className={c.spaces}>
          {t.spaces.map((space, i) => {
            const open = i === t.open;
            return (
              <div
                key={space.name}
                className={`${c.pane} ${c.space} ${open ? c.lit : c.locked}`}
                {...(open ? act("open", "light") : {})}
              >
                <p className={c.spaceHead}>
                  {open ? <Key>{space.name}</Key> : <b>{space.name}</b>}
                  {open ? null : (
                    <span className={c.lock}>
                      <Glyph d={GLYPHS.lock} size={12} />
                      {t.locked}
                    </span>
                  )}
                </p>
                {open ? (
                  <ul>
                    {space.docs.map((doc) => (
                      <li key={doc}>
                        <Glyph d={GLYPHS.doc} size={12} />
                        {doc}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={c.spaceMeta}>
                    {space.docs.length} documentos
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className={`${c.pane} ${c.soft} ${c.askPane}`}>
          <div className={c.askWho}>
            <span className={s.avatarSm}>B</span>
            <span className={s.who}>
              <b>{t.person}</b>
              <span>{t.team}</span>
            </span>
          </div>
          <div className={c.askChat}>
            <p className={`${c.msg} ${c.msgOut} ${c.side}`}>{t.before}</p>
            <div className={`${c.msgInWrap} ${c.side}`}>
              <p className={`${c.msg} ${c.msgIn}`}>{t.beforeReply}</p>
              <span className={c.source}>
                <Glyph d={GLYPHS.doc} size={12} />
                {t.beforeSource}
              </span>
            </div>
            <p className={`${c.msg} ${c.msgOut}`} {...act("ask", "pop")}>
              {t.ask}
            </p>
            <p
              className={`${c.msg} ${c.msgIn} ${c.msgLock}`}
              {...act("reply", "pop")}
            >
              <Glyph d={GLYPHS.lock} size={12} />
              {t.reply}
            </p>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

const BODIES = {
  "relloo-person": RellooPerson,
  "relloo-agent": RellooAgent,
  "magneto-canvas": MagnetoCanvas,
  "tuner-call": TunerCall,
  "knowly-answer": KnowlyAnswer,
  "knowly-sources": KnowlySources,
  "knowly-access": KnowlyAccess,
} as const;

export function CapabilityBody({
  scene,
  phase = "end",
}: {
  scene: CapabilityScript;
  phase?: "start" | "play" | "end";
}) {
  const Body = BODIES[scene.id];
  return (
    <div className={`scn ${s.scene}`} data-scene={scene.id} data-phase={phase}>
      <Body act={actFor(scene)} />
    </div>
  );
}
